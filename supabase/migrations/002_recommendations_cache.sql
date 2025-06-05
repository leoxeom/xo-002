-- 002_recommendations_cache.sql
-- Golf Pass - Schéma pour le système de recommandations et cache
-- Date: 2025-06-05

-- ============================================================================
-- TABLES DE RECOMMANDATIONS ET CACHE
-- ============================================================================

-- Table pour stocker les préférences explicites des utilisateurs
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_price_range INT[] CHECK (array_length(preferred_price_range, 1) = 2),
    preferred_destinations TEXT[],
    preferred_duration_range INT[] CHECK (array_length(preferred_duration_range, 1) = 2),
    handicap DECIMAL(4,1),
    preferred_golf_types TEXT[],
    preferred_accommodation_types TEXT[],
    preferred_activities TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Contrainte d'unicité pour éviter les doublons par utilisateur
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Table pour stocker les recommandations en cache
CREATE TABLE recommendation_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
    
    -- Index sur la clé de cache pour les recherches rapides
    CONSTRAINT unique_cache_key UNIQUE (cache_key)
);

-- Table pour stocker les embeddings des séjours (pour recommandations similaires)
CREATE TABLE package_embeddings (
    id UUID PRIMARY KEY REFERENCES packages(id) ON DELETE CASCADE,
    embedding VECTOR(1536) NOT NULL,
    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour stocker les embeddings des utilisateurs (basés sur leurs préférences)
CREATE TABLE user_embeddings (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    embedding VECTOR(1536) NOT NULL,
    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour journaliser les erreurs des Edge Functions et autres services
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    stack_trace TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT
);

-- ============================================================================
-- INDEX
-- ============================================================================

-- Index sur les préférences utilisateur
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);

-- Index sur le cache de recommandations
CREATE INDEX idx_recommendation_cache_user ON recommendation_cache(user_id);
CREATE INDEX idx_recommendation_cache_expiry ON recommendation_cache(expires_at);

-- Index sur les embeddings de séjours pour recherche vectorielle
CREATE INDEX idx_package_embeddings_vector ON package_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index sur les logs d'erreurs
CREATE INDEX idx_error_logs_type ON error_logs(type);
CREATE INDEX idx_error_logs_created ON error_logs(created_at);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved_at) WHERE resolved_at IS NULL;

-- ============================================================================
-- FONCTIONS ET PROCEDURES
-- ============================================================================

-- Fonction pour nettoyer automatiquement le cache expiré
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM recommendation_cache
    WHERE expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour le timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour trouver des séjours similaires à partir d'un embedding utilisateur
CREATE OR REPLACE FUNCTION match_packages_to_user_embedding(
    user_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        1 - (pe.embedding <=> user_embedding) AS similarity
    FROM 
        package_embeddings pe
    JOIN 
        packages p ON pe.id = p.id
    WHERE 
        p.status = 'published' AND
        1 - (pe.embedding <=> user_embedding) > match_threshold
    ORDER BY 
        similarity DESC
    LIMIT 
        match_count;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger pour mettre à jour le timestamp des préférences
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_preferences_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_preferences
CREATE POLICY "Les utilisateurs peuvent voir leurs propres préférences" 
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres préférences" 
    ON user_preferences FOR ALL
    USING (auth.uid() = user_id);

-- Politiques pour recommendation_cache
CREATE POLICY "Les utilisateurs peuvent voir leur propre cache" 
    ON recommendation_cache FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Le système peut gérer tout le cache" 
    ON recommendation_cache FOR ALL
    USING (is_admin());

-- Politiques pour package_embeddings
CREATE POLICY "Tout le monde peut voir les embeddings des séjours publiés" 
    ON package_embeddings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM packages
            WHERE packages.id = package_embeddings.id
            AND packages.status = 'published'
        )
    );

CREATE POLICY "Les admins et le système peuvent gérer les embeddings" 
    ON package_embeddings FOR ALL
    USING (is_admin());

-- Politiques pour user_embeddings
CREATE POLICY "Les utilisateurs peuvent voir leur propre embedding" 
    ON user_embeddings FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Les admins et le système peuvent gérer les embeddings utilisateur" 
    ON user_embeddings FOR ALL
    USING (is_admin());

-- Politiques pour error_logs
CREATE POLICY "Seuls les admins peuvent voir les logs d'erreur" 
    ON error_logs FOR SELECT
    USING (is_admin());

CREATE POLICY "Le système peut créer des logs d'erreur" 
    ON error_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Seuls les admins peuvent résoudre les erreurs" 
    ON error_logs FOR UPDATE
    USING (is_admin());

-- ============================================================================
-- TÂCHES PLANIFIÉES
-- ============================================================================

-- Tâche planifiée pour nettoyer le cache expiré (toutes les heures)
SELECT cron.schedule(
  'cleanup-expired-cache',
  '0 * * * *',  -- Toutes les heures à la minute 0
  $$SELECT cleanup_expired_cache()$$
);

-- Tâche planifiée pour nettoyer les logs d'erreur résolus (tous les 30 jours)
SELECT cron.schedule(
  'cleanup-old-error-logs',
  '0 0 1 * *',  -- Le premier jour de chaque mois à minuit
  $$DELETE FROM error_logs WHERE resolved_at < now() - interval '30 days'$$
);
