-- 001_initial_schema.sql
-- Golf Pass - Schéma initial pour Supabase

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Extensions Supabase nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- Pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Pour les fonctions de cryptage
CREATE EXTENSION IF NOT EXISTS "pgjwt";          -- Pour JWT
CREATE EXTENSION IF NOT EXISTS "pg_graphql";     -- Pour GraphQL
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Pour monitoring de performance
CREATE EXTENSION IF NOT EXISTS "vector";         -- Pour les embeddings IA/ML

-- ============================================================================
-- TYPES ENUM
-- ============================================================================

-- Types de rôles utilisateur
CREATE TYPE user_role_enum AS ENUM ('buyer', 'vendor', 'admin');

-- Statut de vérification KYC
CREATE TYPE kyc_status_enum AS ENUM ('pending', 'verified', 'rejected');

-- Statut des séjours
CREATE TYPE package_status_enum AS ENUM ('draft', 'pending_review', 'published', 'paused', 'archived');

-- Statut des réservations
CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'paid', 'cancelled', 'completed', 'refunded');

-- Statut des paiements
CREATE TYPE payment_status_enum AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded');

-- Type de cible pour les avis
CREATE TYPE review_target_enum AS ENUM ('package', 'vendor', 'buyer');

-- Type de média
CREATE TYPE media_type_enum AS ENUM ('image', 'video', 'document', 'ar_model');

-- ============================================================================
-- TABLES PRINCIPALES
-- ============================================================================

-- Table des profils utilisateurs (extension de auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL DEFAULT 'buyer',
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    country TEXT,
    language TEXT DEFAULT 'fr',
    kyc_status kyc_status_enum DEFAULT 'pending',
    kyc_verified_at TIMESTAMPTZ,
    premium_until TIMESTAMPTZ,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Validation
    CONSTRAINT phone_format CHECK (phone ~* '^\+[0-9]{10,15}$' OR phone IS NULL)
);

-- Table des vendeurs (tour-opérateurs, agences)
CREATE TABLE vendors (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_description TEXT,
    website TEXT,
    logo_url TEXT,
    banner_url TEXT,
    registration_number TEXT,
    vat_number TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT NOT NULL,
    stripe_connect_id TEXT,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 12.00,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Validation
    CONSTRAINT commission_rate_range CHECK (commission_rate BETWEEN 0 AND 100)
);

-- Table des golfs (parcours référencés)
CREATE TABLE golf_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT NOT NULL,
    postal_code TEXT,
    country TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    holes_count INTEGER NOT NULL,
    par INTEGER,
    length_meters INTEGER,
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    green_fee_min DECIMAL(10,2),
    green_fee_max DECIMAL(10,2),
    website TEXT,
    phone TEXT,
    email TEXT,
    facilities TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Index pour recherche géographique
    CONSTRAINT valid_coordinates CHECK (
        (latitude BETWEEN -90 AND 90) AND 
        (longitude BETWEEN -180 AND 180)
    )
);

-- Table des séjours de golf
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    duration_days INTEGER NOT NULL,
    price_person_cents INTEGER NOT NULL,
    price_currency TEXT NOT NULL DEFAULT 'EUR',
    max_participants INTEGER NOT NULL,
    min_participants INTEGER NOT NULL DEFAULT 1,
    location_country TEXT NOT NULL,
    location_city TEXT,
    location_region TEXT,
    status package_status_enum NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    cancellation_policy TEXT,
    inclusions TEXT[],
    exclusions TEXT[],
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Validation
    CONSTRAINT positive_price CHECK (price_person_cents > 0),
    CONSTRAINT valid_participants CHECK (min_participants <= max_participants),
    CONSTRAINT valid_duration CHECK (duration_days > 0),
    
    -- Index
    CONSTRAINT unique_vendor_slug UNIQUE (vendor_id, slug)
);

-- Table des golfs inclus dans un séjour
CREATE TABLE package_golf_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    golf_course_id UUID NOT NULL REFERENCES golf_courses(id) ON DELETE CASCADE,
    rounds_count INTEGER NOT NULL DEFAULT 1,
    is_main_course BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Contrainte d'unicité
    CONSTRAINT unique_package_golf UNIQUE (package_id, golf_course_id)
);

-- Table des dates disponibles pour les séjours
CREATE TABLE package_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    seats_total INTEGER NOT NULL,
    seats_left INTEGER NOT NULL,
    price_override_cents INTEGER,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Validation
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT positive_seats CHECK (seats_total > 0 AND seats_left >= 0),
    CONSTRAINT seats_left_lte_total CHECK (seats_left <= seats_total),
    
    -- Index
    CONSTRAINT unique_package_dates UNIQUE (package_id, start_date)
);

-- Table des réservations
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES profiles(id),
    package_id UUID NOT NULL REFERENCES packages(id),
    package_date_id UUID NOT NULL REFERENCES package_dates(id),
    status booking_status_enum NOT NULL DEFAULT 'pending',
    participants_count INTEGER NOT NULL,
    total_amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    booking_reference TEXT NOT NULL UNIQUE,
    special_requests TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Validation
    CONSTRAINT positive_participants CHECK (participants_count > 0),
    CONSTRAINT positive_amount CHECK (total_amount_cents > 0)
);

-- Table des participants à une réservation
CREATE TABLE booking_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    handicap DECIMAL(4,1),
    special_requirements TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des paiements
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    stripe_payment_intent_id TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    status payment_status_enum NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    receipt_url TEXT,
    refunded_amount_cents INTEGER DEFAULT 0,
    vendor_amount_cents INTEGER NOT NULL,
    platform_fee_cents INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Validation
    CONSTRAINT positive_amount CHECK (amount_cents > 0),
    CONSTRAINT valid_refund CHECK (refunded_amount_cents <= amount_cents),
    CONSTRAINT amounts_match CHECK (vendor_amount_cents + platform_fee_cents = amount_cents)
);

-- Table des avis
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id),
    booking_id UUID REFERENCES bookings(id),
    target_type review_target_enum NOT NULL,
    target_id UUID NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    response TEXT,
    response_at TIMESTAMPTZ,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Validation
    CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5)
);

-- Table des médias
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id),
    storage_path TEXT NOT NULL,
    media_type media_type_enum NOT NULL DEFAULT 'image',
    title TEXT,
    description TEXT,
    width INTEGER,
    height INTEGER,
    size_bytes INTEGER,
    content_type TEXT,
    alt_text TEXT,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des publicités sponsorisées
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    package_id UUID REFERENCES packages(id),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    cpc_cents INTEGER NOT NULL,
    budget_cents INTEGER NOT NULL,
    spent_cents INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    impressions INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Validation
    CONSTRAINT positive_cpc CHECK (cpc_cents > 0),
    CONSTRAINT positive_budget CHECK (budget_cents > 0),
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    CONSTRAINT budget_constraint CHECK (spent_cents <= budget_cents)
);

-- Table des abonnements premium
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    stripe_subscription_id TEXT NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    interval TEXT NOT NULL,
    status TEXT NOT NULL,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Validation
    CONSTRAINT positive_amount CHECK (amount_cents > 0)
);

-- Table de messagerie
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    recipient_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Contrainte pour éviter l'auto-message
    CONSTRAINT no_self_message CHECK (sender_id != recipient_id)
);

-- Table des conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    package_id UUID REFERENCES packages(id),
    buyer_id UUID NOT NULL REFERENCES profiles(id),
    vendor_id UUID NOT NULL REFERENCES profiles(id),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEX
-- ============================================================================

-- Index sur profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_premium ON profiles(premium_until) WHERE premium_until > now();

-- Index sur vendors
CREATE INDEX idx_vendors_country ON vendors(country);
CREATE INDEX idx_vendors_verified ON vendors(is_verified);

-- Index sur packages
CREATE INDEX idx_packages_vendor ON packages(vendor_id);
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_packages_location ON packages(location_country, location_city);
CREATE INDEX idx_packages_price ON packages(price_person_cents);
CREATE INDEX idx_packages_featured ON packages(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_packages_premium ON packages(is_premium) WHERE is_premium = TRUE;
CREATE INDEX idx_packages_search ON packages USING GIN (to_tsvector('french', title || ' ' || description));

-- Index sur package_dates
CREATE INDEX idx_package_dates_package ON package_dates(package_id);
CREATE INDEX idx_package_dates_available ON package_dates(package_id, start_date) 
    WHERE is_available = TRUE AND seats_left > 0 AND start_date >= CURRENT_DATE;
CREATE INDEX idx_package_dates_range ON package_dates(start_date, end_date);

-- Index sur bookings
CREATE INDEX idx_bookings_buyer ON bookings(buyer_id);
CREATE INDEX idx_bookings_package ON bookings(package_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(created_at);

-- Index sur payments
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Index sur reviews
CREATE INDEX idx_reviews_target ON reviews(target_type, target_id);
CREATE INDEX idx_reviews_author ON reviews(author_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Index sur media
CREATE INDEX idx_media_entity ON media(entity_type, entity_id);
CREATE INDEX idx_media_owner ON media(owner_id);

-- Index sur messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = FALSE;

-- Index sur conversations
CREATE INDEX idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX idx_conversations_vendor ON conversations(vendor_id);
CREATE INDEX idx_conversations_booking ON conversations(booking_id);

-- ============================================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================================

-- Fonction pour mettre à jour le timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp sur toutes les tables principales
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN (
            'profiles', 'vendors', 'packages', 'package_dates', 'bookings',
            'payments', 'reviews', 'media', 'ads', 'subscriptions', 'conversations'
        )
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
        ', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer automatiquement un profil après création d'un utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role_enum, 'buyer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer un profil automatiquement
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Fonction pour mettre à jour les sièges disponibles lors d'une réservation
CREATE OR REPLACE FUNCTION update_seats_after_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Réduire le nombre de sièges disponibles lors d'une nouvelle réservation
    IF (TG_OP = 'INSERT') THEN
        UPDATE package_dates
        SET seats_left = seats_left - NEW.participants_count
        WHERE id = NEW.package_date_id;
        
        -- Vérifier si tous les sièges sont pris
        UPDATE package_dates
        SET is_available = FALSE
        WHERE id = NEW.package_date_id AND seats_left <= 0;
    
    -- Restaurer les sièges si une réservation est annulée
    ELSIF (TG_OP = 'UPDATE' AND OLD.status != 'cancelled' AND NEW.status = 'cancelled') THEN
        UPDATE package_dates
        SET 
            seats_left = seats_left + NEW.participants_count,
            is_available = TRUE
        WHERE id = NEW.package_date_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour gérer les sièges disponibles
CREATE TRIGGER on_booking_change
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_seats_after_booking();

-- Fonction pour générer une référence de réservation unique
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    -- Format: GP-YYMMDD-XXXX (GP pour Golf Pass, date, 4 caractères aléatoires)
    NEW.booking_reference = 'GP-' || 
                           to_char(CURRENT_DATE, 'YYMMDD') || '-' ||
                           upper(substring(encode(gen_random_bytes(8), 'hex') from 1 for 4));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement une référence de réservation
CREATE TRIGGER before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION generate_booking_reference();

-- Fonction pour générer un slug à partir du titre
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convertir le titre en slug
    base_slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]', '-', 'g'));
    -- Supprimer les tirets multiples
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    -- Supprimer les tirets au début et à la fin
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Vérifier si le slug existe déjà pour ce vendeur
    WHILE EXISTS (
        SELECT 1 FROM packages 
        WHERE vendor_id = NEW.vendor_id AND slug = final_slug AND id != NEW.id
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un slug
CREATE TRIGGER before_package_insert_update
BEFORE INSERT OR UPDATE OF title ON packages
FOR EACH ROW
EXECUTE FUNCTION generate_slug();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_golf_courses ENABLE ROW LEVEL SECURITY;

-- Fonctions d'aide pour les politiques RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_vendor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'vendor'
        FROM profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politiques RLS pour profiles
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" 
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Les admins peuvent tout voir" 
    ON profiles FOR ALL
    USING (is_admin());

CREATE POLICY "Les profils publics sont visibles par tous" 
    ON profiles FOR SELECT
    USING (true);

-- Politiques RLS pour vendors
CREATE POLICY "Les vendeurs peuvent voir leur propre profil vendeur" 
    ON vendors FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Les vendeurs peuvent modifier leur propre profil vendeur" 
    ON vendors FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Les admins peuvent tout gérer pour les vendeurs" 
    ON vendors FOR ALL
    USING (is_admin());

CREATE POLICY "Les profils vendeurs vérifiés sont visibles par tous" 
    ON vendors FOR SELECT
    USING (is_verified = true);

-- Politiques RLS pour packages
CREATE POLICY "Les vendeurs peuvent gérer leurs propres séjours" 
    ON packages FOR ALL
    USING (auth.uid() = vendor_id);

CREATE POLICY "Les admins peuvent tout gérer pour les séjours" 
    ON packages FOR ALL
    USING (is_admin());

CREATE POLICY "Tout le monde peut voir les séjours publiés" 
    ON packages FOR SELECT
    USING (status = 'published');

-- Politiques RLS pour package_dates
CREATE POLICY "Les vendeurs peuvent gérer leurs propres dates de séjour" 
    ON package_dates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM packages
            WHERE packages.id = package_dates.package_id
            AND packages.vendor_id = auth.uid()
        )
    );

CREATE POLICY "Les admins peuvent tout gérer pour les dates de séjour" 
    ON package_dates FOR ALL
    USING (is_admin());

CREATE POLICY "Tout le monde peut voir les dates disponibles" 
    ON package_dates FOR SELECT
    USING (
        is_available = true AND
        EXISTS (
            SELECT 1 FROM packages
            WHERE packages.id = package_dates.package_id
            AND packages.status = 'published'
        )
    );

-- Politiques RLS pour bookings
CREATE POLICY "Les acheteurs peuvent voir leurs propres réservations" 
    ON bookings FOR SELECT
    USING (auth.uid() = buyer_id);

CREATE POLICY "Les vendeurs peuvent voir les réservations de leurs séjours" 
    ON bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM packages
            WHERE packages.id = bookings.package_id
            AND packages.vendor_id = auth.uid()
        )
    );

CREATE POLICY "Les acheteurs peuvent créer des réservations" 
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Les acheteurs peuvent annuler leurs réservations" 
    ON bookings FOR UPDATE
    USING (auth.uid() = buyer_id)
    WITH CHECK (
        auth.uid() = buyer_id AND
        OLD.status != 'cancelled' AND
        NEW.status = 'cancelled'
    );

CREATE POLICY "Les vendeurs peuvent mettre à jour le statut des réservations" 
    ON bookings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM packages
            WHERE packages.id = bookings.package_id
            AND packages.vendor_id = auth.uid()
        )
    );

CREATE POLICY "Les admins peuvent tout gérer pour les réservations" 
    ON bookings FOR ALL
    USING (is_admin());

-- Politiques RLS pour media
CREATE POLICY "Les utilisateurs peuvent gérer leurs propres médias" 
    ON media FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY "Tout le monde peut voir les médias publics" 
    ON media FOR SELECT
    USING (
        entity_type = 'package' AND
        EXISTS (
            SELECT 1 FROM packages
            WHERE packages.id = media.entity_id
            AND packages.status = 'published'
        )
    );

CREATE POLICY "Les admins peuvent tout gérer pour les médias" 
    ON media FOR ALL
    USING (is_admin());

-- Politiques RLS pour reviews
CREATE POLICY "Les utilisateurs peuvent créer leurs propres avis" 
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres avis" 
    ON reviews FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Tout le monde peut voir les avis vérifiés" 
    ON reviews FOR SELECT
    USING (is_verified = true);

CREATE POLICY "Les vendeurs peuvent répondre aux avis de leurs séjours" 
    ON reviews FOR UPDATE
    USING (
        target_type = 'package' AND
        EXISTS (
            SELECT 1 FROM packages
            WHERE packages.id = reviews.target_id
            AND packages.vendor_id = auth.uid()
        )
    )
    WITH CHECK (
        OLD.response IS NULL AND
        NEW.response IS NOT NULL AND
        NEW.rating = OLD.rating AND
        NEW.comment = OLD.comment AND
        NEW.author_id = OLD.author_id
    );

CREATE POLICY "Les admins peuvent tout gérer pour les avis" 
    ON reviews FOR ALL
    USING (is_admin());

-- Politiques RLS pour messages
CREATE POLICY "Les utilisateurs peuvent voir leurs propres messages" 
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Les utilisateurs peuvent envoyer des messages" 
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Les utilisateurs peuvent marquer leurs messages comme lus" 
    ON messages FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (
        NEW.is_read = true AND
        NEW.content = OLD.content AND
        NEW.sender_id = OLD.sender_id AND
        NEW.recipient_id = OLD.recipient_id
    );

CREATE POLICY "Les admins peuvent tout gérer pour les messages" 
    ON messages FOR ALL
    USING (is_admin());

-- ============================================================================
-- VUES
-- ============================================================================

-- Vue pour les séjours populaires
CREATE VIEW popular_packages AS
SELECT 
    p.*,
    COUNT(DISTINCT b.id) AS booking_count,
    AVG(r.rating) AS avg_rating,
    COUNT(DISTINCT r.id) AS review_count
FROM 
    packages p
LEFT JOIN 
    bookings b ON p.id = b.package_id AND b.status IN ('confirmed', 'paid', 'completed')
LEFT JOIN 
    reviews r ON r.target_type = 'package' AND r.target_id = p.id AND r.is_verified = true
WHERE 
    p.status = 'published'
GROUP BY 
    p.id
ORDER BY 
    booking_count DESC, avg_rating DESC;

-- Vue pour les vendeurs populaires
CREATE VIEW popular_vendors AS
SELECT 
    v.*,
    COUNT(DISTINCT p.id) AS package_count,
    COUNT(DISTINCT b.id) AS booking_count,
    AVG(r.rating) AS avg_rating,
    COUNT(DISTINCT r.id) AS review_count
FROM 
    vendors v
LEFT JOIN 
    packages p ON v.id = p.vendor_id AND p.status = 'published'
LEFT JOIN 
    bookings b ON p.id = b.package_id AND b.status IN ('confirmed', 'paid', 'completed')
LEFT JOIN 
    reviews r ON r.target_type = 'vendor' AND r.target_id = v.id AND r.is_verified = true
WHERE 
    v.is_verified = true
GROUP BY 
    v.id
ORDER BY 
    booking_count DESC, avg_rating DESC;

-- Vue pour les séjours recommandés (basée sur les notes et la popularité)
CREATE VIEW recommended_packages AS
SELECT 
    p.*,
    AVG(r.rating) AS avg_rating,
    COUNT(DISTINCT b.id) AS booking_count,
    COUNT(DISTINCT r.id) AS review_count,
    (AVG(r.rating) * 0.6 + (COUNT(DISTINCT b.id) / 10.0) * 0.4) AS score
FROM 
    packages p
LEFT JOIN 
    bookings b ON p.id = b.package_id AND b.status IN ('confirmed', 'paid', 'completed')
LEFT JOIN 
    reviews r ON r.target_type = 'package' AND r.target_id = p.id AND r.is_verified = true
WHERE 
    p.status = 'published'
GROUP BY 
    p.id
HAVING 
    COUNT(DISTINCT r.id) >= 3
ORDER BY 
    score DESC;

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour rechercher des séjours par texte et filtres
CREATE OR REPLACE FUNCTION search_packages(
    search_text TEXT DEFAULT NULL,
    min_price INTEGER DEFAULT NULL,
    max_price INTEGER DEFAULT NULL,
    country TEXT DEFAULT NULL,
    min_duration INTEGER DEFAULT NULL,
    max_duration INTEGER DEFAULT NULL,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    sort_by TEXT DEFAULT 'relevance',
    page INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    vendor_id UUID,
    title TEXT,
    slug TEXT,
    short_description TEXT,
    price_person_cents INTEGER,
    price_currency TEXT,
    duration_days INTEGER,
    location_country TEXT,
    location_city TEXT,
    is_featured BOOLEAN,
    is_premium BOOLEAN,
    avg_rating NUMERIC,
    review_count BIGINT,
    main_image_url TEXT
) AS $$
DECLARE
    offset_val INTEGER;
BEGIN
    offset_val := (page - 1) * page_size;
    
    RETURN QUERY
    WITH package_ratings AS (
        SELECT 
            r.target_id,
            AVG(r.rating) AS avg_rating,
            COUNT(r.id) AS review_count
        FROM 
            reviews r
        WHERE 
            r.target_type = 'package' AND r.is_verified = true
        GROUP BY 
            r.target_id
    ),
    package_images AS (
        SELECT 
            m.entity_id,
            m.storage_path AS main_image_url
        FROM 
            media m
        WHERE 
            m.entity_type = 'package' AND m.is_main = true
    )
    SELECT 
        p.id,
        p.vendor_id,
        p.title,
        p.slug,
        p.short_description,
        p.price_person_cents,
        p.price_currency,
        p.duration_days,
        p.location_country,
        p.location_city,
        p.is_featured,
        p.is_premium,
        COALESCE(pr.avg_rating, 0) AS avg_rating,
        COALESCE(pr.review_count, 0) AS review_count,
        pi.main_image_url
    FROM 
        packages p
    LEFT JOIN 
        package_ratings pr ON p.id = pr.target_id
    LEFT JOIN 
        package_images pi ON p.id = pi.entity_id
    WHERE 
        p.status = 'published'
        AND (search_text IS NULL OR 
             to_tsvector('french', p.title || ' ' || p.description) @@ to_tsquery('french', search_text))
        AND (min_price IS NULL OR p.price_person_cents >= min_price)
        AND (max_price IS NULL OR p.price_person_cents <= max_price)
        AND (country IS NULL OR p.location_country = country)
        AND (min_duration IS NULL OR p.duration_days >= min_duration)
        AND (max_duration IS NULL OR p.duration_days <= max_duration)
        AND (start_date IS NULL OR end_date IS NULL OR EXISTS (
            SELECT 1 FROM package_dates pd
            WHERE pd.package_id = p.id
            AND pd.is_available = true
            AND pd.seats_left > 0
            AND pd.start_date >= start_date
            AND pd.end_date <= end_date
        ))
    ORDER BY
        CASE
            WHEN sort_by = 'price_asc' THEN p.price_person_cents
        END ASC,
        CASE
            WHEN sort_by = 'price_desc' THEN p.price_person_cents
        END DESC,
        CASE
            WHEN sort_by = 'rating' THEN COALESCE(pr.avg_rating, 0)
        END DESC,
        CASE
            WHEN sort_by = 'popularity' THEN pr.review_count
        END DESC,
        CASE
            WHEN sort_by = 'relevance' OR sort_by IS NULL THEN
                CASE WHEN p.is_featured THEN 1 ELSE 0 END +
                CASE WHEN p.is_premium THEN 1 ELSE 0 END +
                COALESCE(pr.avg_rating, 0) * 0.2
        END DESC
    LIMIT page_size
    OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- BUCKETS STORAGE
-- ============================================================================

-- Création des buckets de stockage
INSERT INTO storage.buckets (id, name, public) VALUES ('package-images', 'Package Images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-avatars', 'Profile Avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-logos', 'Vendor Logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'KYC Documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('ar-models', 'AR Models', true);

-- Politiques pour les buckets publics
CREATE POLICY "Images accessibles publiquement" ON storage.objects
    FOR SELECT USING (
        bucket_id IN ('package-images', 'profile-avatars', 'vendor-logos', 'ar-models')
    );

-- Politiques pour les buckets privés
CREATE POLICY "Accès KYC restreint" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'kyc-documents' AND (
            auth.uid() = (storage.foldername(name))[1]::uuid OR
            is_admin()
        )
    );

-- Politiques d'upload
CREATE POLICY "Upload d'images de séjour" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'package-images' AND (
            is_vendor() OR is_admin()
        )
    );

CREATE POLICY "Upload d'avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Upload de logo vendeur" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'vendor-logos' AND (
            is_vendor() AND auth.uid()::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Upload de documents KYC" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'kyc-documents' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- DONNÉES INITIALES
-- ============================================================================

-- Insertion d'un utilisateur admin (à modifier avec un vrai mot de passe en production)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'admin@golfpass.io',
    crypt('admin_password', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin Golf Pass", "role": "admin"}',
    now(),
    now()
);

-- Mise à jour du profil admin
UPDATE profiles
SET role = 'admin', kyc_status = 'verified', kyc_verified_at = now()
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@golfpass.io');
