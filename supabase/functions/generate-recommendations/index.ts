// supabase/functions/generate-recommendations/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { corsHeaders } from '../_shared/cors.ts';

// Configuration
const CACHE_TTL_SECONDS = 3600; // 1 heure
const MAX_RECOMMENDATIONS = 10;
const EMBEDDING_DIMENSION = 1536; // OpenAI ada-002 dimension

// Types pour la clarté du code
interface RecommendationRequest {
  user_id?: string;
  limit?: number;
  exclude_ids?: string[];
  price_range?: [number, number]; // [min, max] en cents
  min_rating?: number;
  destinations?: string[];
  duration_range?: [number, number]; // [min, max] en jours
  start_date?: string;
  end_date?: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  premium_until: string | null;
  country: string | null;
}

interface UserPreferences {
  preferred_price_range: [number, number] | null;
  preferred_destinations: string[] | null;
  preferred_duration_range: [number, number] | null;
  handicap: number | null;
  preferred_golf_types: string[] | null;
}

interface PackageRecommendation {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  price_person_cents: number;
  price_currency: string;
  duration_days: number;
  location_country: string;
  location_city: string | null;
  is_featured: boolean;
  is_premium: boolean;
  avg_rating: number | null;
  review_count: number;
  main_image_url: string | null;
  similarity_score: number;
  popularity_score: number;
  total_score: number;
  available_dates: Array<{
    id: string;
    start_date: string;
    end_date: string;
    seats_left: number;
  }>;
}

// Fonction principale pour traiter les requêtes
serve(async (req: Request) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Vérification de la méthode HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Récupération et validation du token JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const jwt = authHeader.split(' ')[1];
    
    // Configuration Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

    // Création du client Supabase avec le token JWT de l'utilisateur
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      }
    );

    // Vérification de l'utilisateur authentifié
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token', details: userError?.message }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Récupération et validation des données de la requête
    let requestData: RecommendationRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      requestData = {}; // Utiliser un objet vide si le corps est invalide
    }

    // Utiliser l'ID utilisateur de la requête ou celui du token JWT
    const userId = requestData.user_id || user.id;
    const limit = requestData.limit || MAX_RECOMMENDATIONS;

    // Vérifier si nous avons des recommandations en cache
    const cacheKey = `recommendations:${userId}:${JSON.stringify(requestData)}`;
    const { data: cachedData } = await supabaseClient
      .from('recommendation_cache')
      .select('recommendations, created_at')
      .eq('cache_key', cacheKey)
      .single();

    // Si nous avons des données en cache et qu'elles sont encore valides
    if (cachedData) {
      const cacheAge = Date.now() - new Date(cachedData.created_at).getTime();
      if (cacheAge < CACHE_TTL_SECONDS * 1000) {
        console.log('✅ Returning cached recommendations');
        return new Response(
          JSON.stringify({
            recommendations: cachedData.recommendations,
            source: 'cache',
            cache_age_seconds: Math.floor(cacheAge / 1000)
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Récupérer le profil utilisateur
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error(`Error fetching user profile: ${profileError.message}`);
    }

    const userProfile = profileData as unknown as UserProfile;
    
    // Récupérer les préférences utilisateur (si disponibles)
    const { data: preferencesData } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const userPreferences = preferencesData as unknown as UserPreferences;

    // Récupérer l'historique des réservations de l'utilisateur
    const { data: bookingHistory, error: bookingError } = await supabaseClient
      .from('bookings')
      .select(`
        id,
        package_id,
        packages:package_id (
          id,
          title,
          price_person_cents,
          duration_days,
          location_country,
          location_city,
          tags
        ),
        status,
        created_at
      `)
      .eq('buyer_id', userId)
      .in('status', ['confirmed', 'paid', 'completed'])
      .order('created_at', { ascending: false });

    // Récupérer les avis de l'utilisateur
    const { data: userReviews, error: reviewsError } = await supabaseClient
      .from('reviews')
      .select(`
        id,
        target_id,
        target_type,
        rating,
        created_at
      `)
      .eq('author_id', userId)
      .eq('target_type', 'package')
      .order('created_at', { ascending: false });

    // Analyser les préférences de l'utilisateur à partir de son historique
    const userAnalytics = analyzeUserPreferences(bookingHistory, userReviews, userPreferences);
    
    // Construire la requête SQL pour les recommandations
    let queryBuilder = supabaseClient
      .from('packages')
      .select(`
        id,
        title,
        slug,
        short_description,
        price_person_cents,
        price_currency,
        duration_days,
        location_country,
        location_city,
        is_featured,
        is_premium,
        vendor_id,
        tags,
        package_dates!inner (
          id,
          start_date,
          end_date,
          seats_left
        )
      `)
      .eq('status', 'published')
      .gt('package_dates.seats_left', 0)
      .eq('package_dates.is_available', true)
      .gte('package_dates.start_date', new Date().toISOString().split('T')[0]);

    // Appliquer les filtres de la requête
    if (requestData.exclude_ids && requestData.exclude_ids.length > 0) {
      queryBuilder = queryBuilder.not('id', 'in', `(${requestData.exclude_ids.join(',')})`);
    }

    if (requestData.price_range) {
      queryBuilder = queryBuilder
        .gte('price_person_cents', requestData.price_range[0])
        .lte('price_person_cents', requestData.price_range[1]);
    } else if (userAnalytics.preferredPriceRange) {
      queryBuilder = queryBuilder
        .gte('price_person_cents', userAnalytics.preferredPriceRange[0])
        .lte('price_person_cents', userAnalytics.preferredPriceRange[1]);
    }

    if (requestData.destinations && requestData.destinations.length > 0) {
      queryBuilder = queryBuilder.in('location_country', requestData.destinations);
    } else if (userAnalytics.preferredDestinations && userAnalytics.preferredDestinations.length > 0) {
      queryBuilder = queryBuilder.in('location_country', userAnalytics.preferredDestinations);
    }

    if (requestData.duration_range) {
      queryBuilder = queryBuilder
        .gte('duration_days', requestData.duration_range[0])
        .lte('duration_days', requestData.duration_range[1]);
    } else if (userAnalytics.preferredDurationRange) {
      queryBuilder = queryBuilder
        .gte('duration_days', userAnalytics.preferredDurationRange[0])
        .lte('duration_days', userAnalytics.preferredDurationRange[1]);
    }

    if (requestData.start_date && requestData.end_date) {
      queryBuilder = queryBuilder
        .gte('package_dates.start_date', requestData.start_date)
        .lte('package_dates.end_date', requestData.end_date);
    }

    // Exécuter la requête
    const { data: packagesData, error: packagesError } = await queryBuilder;

    if (packagesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch packages', details: packagesError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Si aucun séjour n'est trouvé, retourner un tableau vide
    if (!packagesData || packagesData.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [] }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Récupérer les notes moyennes et le nombre d'avis pour chaque séjour
    const packageIds = packagesData.map(p => p.id);
    const { data: ratingsData } = await supabaseClient
      .from('reviews')
      .select('target_id, rating')
      .eq('target_type', 'package')
      .in('target_id', packageIds);

    // Calculer les notes moyennes
    const packageRatings = {};
    const packageReviewCounts = {};
    
    if (ratingsData) {
      ratingsData.forEach(review => {
        if (!packageRatings[review.target_id]) {
          packageRatings[review.target_id] = [];
          packageReviewCounts[review.target_id] = 0;
        }
        packageRatings[review.target_id].push(review.rating);
        packageReviewCounts[review.target_id]++;
      });
    }

    // Récupérer les données de popularité (nombre de réservations)
    const { data: bookingCountData } = await supabaseClient
      .from('bookings')
      .select('package_id, count')
      .in('package_id', packageIds)
      .in('status', ['confirmed', 'paid', 'completed'])
      .group('package_id');

    const packageBookingCounts = {};
    if (bookingCountData) {
      bookingCountData.forEach(item => {
        packageBookingCounts[item.package_id] = parseInt(item.count);
      });
    }

    // Récupérer les images principales pour chaque séjour
    const { data: mediaData } = await supabaseClient
      .from('media')
      .select('entity_id, storage_path')
      .eq('entity_type', 'package')
      .eq('is_main', true)
      .in('entity_id', packageIds);

    const packageMainImages = {};
    if (mediaData) {
      mediaData.forEach(media => {
        packageMainImages[media.entity_id] = media.storage_path;
      });
    }

    // Récupérer les embeddings des séjours si l'utilisateur a un historique
    let similarityScores = {};
    
    if (bookingHistory && bookingHistory.length > 0 && userAnalytics.userEmbedding) {
      // Utiliser pgvector pour calculer la similarité cosinus
      const { data: vectorData } = await supabaseClient.rpc('match_packages_to_user_embedding', {
        user_embedding: userAnalytics.userEmbedding,
        match_threshold: 0.5,
        match_count: 50
      });

      if (vectorData) {
        vectorData.forEach(item => {
          similarityScores[item.id] = item.similarity;
        });
      }
    }

    // Calculer les scores et trier les recommandations
    const recommendations: PackageRecommendation[] = packagesData.map(pkg => {
      // Regrouper les dates disponibles
      const availableDates = pkg.package_dates.map(date => ({
        id: date.id,
        start_date: date.start_date,
        end_date: date.end_date,
        seats_left: date.seats_left
      }));

      // Calculer la note moyenne
      const ratings = packageRatings[pkg.id] || [];
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null;

      // Calculer le score de popularité (0-1)
      const bookingCount = packageBookingCounts[pkg.id] || 0;
      const maxBookings = Math.max(...Object.values(packageBookingCounts).map(v => v as number), 10);
      const popularityScore = bookingCount / maxBookings;

      // Calculer le score de similarité (0-1)
      const similarityScore = similarityScores[pkg.id] || 0;

      // Calculer le score de correspondance de prix (0-1)
      let priceMatchScore = 1;
      if (userAnalytics.preferredPriceRange) {
        const [minPrice, maxPrice] = userAnalytics.preferredPriceRange;
        const priceDiff = Math.abs(pkg.price_person_cents - (minPrice + maxPrice) / 2);
        const priceRange = maxPrice - minPrice;
        priceMatchScore = Math.max(0, 1 - (priceDiff / (priceRange || 1)));
      }

      // Calculer le score de correspondance de destination (0-1)
      let destinationMatchScore = 0;
      if (userAnalytics.preferredDestinations && userAnalytics.preferredDestinations.includes(pkg.location_country)) {
        destinationMatchScore = 1;
      }

      // Calculer le score de correspondance de durée (0-1)
      let durationMatchScore = 1;
      if (userAnalytics.preferredDurationRange) {
        const [minDuration, maxDuration] = userAnalytics.preferredDurationRange;
        const durationDiff = Math.abs(pkg.duration_days - (minDuration + maxDuration) / 2);
        const durationRange = maxDuration - minDuration;
        durationMatchScore = Math.max(0, 1 - (durationDiff / (durationRange || 1)));
      }

      // Calculer le score total
      const weights = {
        similarity: 0.3,
        popularity: 0.2,
        price: 0.2,
        destination: 0.2,
        duration: 0.1,
        premium: userProfile.premium_until ? 0.1 : 0,
        featured: 0.1
      };

      const totalScore = 
        (similarityScore * weights.similarity) +
        (popularityScore * weights.popularity) +
        (priceMatchScore * weights.price) +
        (destinationMatchScore * weights.destination) +
        (durationMatchScore * weights.duration) +
        (pkg.is_premium && userProfile.premium_until ? weights.premium : 0) +
        (pkg.is_featured ? weights.featured : 0);

      // Construire l'objet recommandation
      return {
        id: pkg.id,
        title: pkg.title,
        slug: pkg.slug,
        short_description: pkg.short_description,
        price_person_cents: pkg.price_person_cents,
        price_currency: pkg.price_currency,
        duration_days: pkg.duration_days,
        location_country: pkg.location_country,
        location_city: pkg.location_city,
        is_featured: pkg.is_featured,
        is_premium: pkg.is_premium,
        avg_rating: avgRating,
        review_count: packageReviewCounts[pkg.id] || 0,
        main_image_url: packageMainImages[pkg.id] || null,
        similarity_score: similarityScore,
        popularity_score: popularityScore,
        total_score: totalScore,
        available_dates: availableDates
      };
    });

    // Trier par score total décroissant et limiter le nombre de résultats
    const sortedRecommendations = recommendations
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, limit);

    // Mettre en cache les résultats
    await supabaseClient
      .from('recommendation_cache')
      .upsert({
        cache_key: cacheKey,
        user_id: userId,
        recommendations: sortedRecommendations,
        created_at: new Date().toISOString()
      });

    // Retourner les recommandations
    return new Response(
      JSON.stringify({
        recommendations: sortedRecommendations,
        source: 'fresh',
        user_analytics: userAnalytics
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error(`Error generating recommendations: ${error.message}`);
    console.error(error.stack);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Fonction pour analyser les préférences utilisateur à partir de son historique
function analyzeUserPreferences(
  bookingHistory: any[] | null,
  userReviews: any[] | null,
  userPreferences: UserPreferences | null
): {
  preferredPriceRange: [number, number] | null;
  preferredDestinations: string[] | null;
  preferredDurationRange: [number, number] | null;
  preferredTags: string[] | null;
  userEmbedding: number[] | null;
} {
  // Valeurs par défaut
  let preferredPriceRange: [number, number] | null = null;
  let preferredDestinations: string[] | null = null;
  let preferredDurationRange: [number, number] | null = null;
  let preferredTags: string[] | null = null;
  let userEmbedding: number[] | null = null;

  // Si l'utilisateur a des préférences explicites, les utiliser
  if (userPreferences) {
    preferredPriceRange = userPreferences.preferred_price_range;
    preferredDestinations = userPreferences.preferred_destinations;
    preferredDurationRange = userPreferences.preferred_duration_range;
    preferredTags = userPreferences.preferred_golf_types;
  }

  // Si l'utilisateur a un historique de réservations, l'analyser
  if (bookingHistory && bookingHistory.length > 0) {
    const prices: number[] = [];
    const destinations: string[] = [];
    const durations: number[] = [];
    const tags: string[] = [];
    
    bookingHistory.forEach(booking => {
      if (booking.packages) {
        const pkg = booking.packages;
        
        // Collecter les prix
        if (pkg.price_person_cents) {
          prices.push(pkg.price_person_cents);
        }
        
        // Collecter les destinations
        if (pkg.location_country) {
          destinations.push(pkg.location_country);
        }
        
        // Collecter les durées
        if (pkg.duration_days) {
          durations.push(pkg.duration_days);
        }
        
        // Collecter les tags
        if (pkg.tags && Array.isArray(pkg.tags)) {
          tags.push(...pkg.tags);
        }
      }
    });
    
    // Calculer la fourchette de prix préférée
    if (prices.length > 0) {
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const minPrice = Math.max(avgPrice * 0.7, Math.min(...prices));
      const maxPrice = Math.min(avgPrice * 1.3, Math.max(...prices));
      preferredPriceRange = preferredPriceRange || [minPrice, maxPrice];
    }
    
    // Calculer les destinations préférées
    if (destinations.length > 0) {
      const destinationCounts = {};
      destinations.forEach(dest => {
        destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
      });
      
      const topDestinations = Object.entries(destinationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([dest]) => dest);
        
      preferredDestinations = preferredDestinations || topDestinations;
    }
    
    // Calculer la fourchette de durée préférée
    if (durations.length > 0) {
      const avgDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
      const minDuration = Math.max(avgDuration * 0.7, Math.min(...durations));
      const maxDuration = Math.min(avgDuration * 1.3, Math.max(...durations));
      preferredDurationRange = preferredDurationRange || [minDuration, maxDuration];
    }
    
    // Calculer les tags préférés
    if (tags.length > 0) {
      const tagCounts = {};
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);
        
      preferredTags = preferredTags || topTags;
    }
    
    // Créer un embedding simple à partir des préférences
    // Dans une implémentation réelle, on utiliserait un modèle d'embedding comme OpenAI
    userEmbedding = createSimpleEmbedding(
      bookingHistory,
      userReviews || [],
      preferredPriceRange,
      preferredDestinations,
      preferredDurationRange,
      preferredTags
    );
  }

  return {
    preferredPriceRange,
    preferredDestinations,
    preferredDurationRange,
    preferredTags,
    userEmbedding
  };
}

// Fonction pour créer un embedding simple à partir des préférences utilisateur
// Dans une implémentation réelle, on utiliserait un modèle d'embedding comme OpenAI
function createSimpleEmbedding(
  bookingHistory: any[],
  userReviews: any[],
  priceRange: [number, number] | null,
  destinations: string[] | null,
  durationRange: [number, number] | null,
  tags: string[] | null
): number[] {
  // Dans une implémentation réelle, on enverrait ces données à un modèle d'embedding
  // Pour cet exemple, on crée un vecteur simple avec des valeurs aléatoires
  // La dimension est celle d'OpenAI ada-002 (1536)
  const embedding = new Array(EMBEDDING_DIMENSION).fill(0);
  
  // Remplir le vecteur avec des valeurs pseudo-aléatoires mais déterministes
  // basées sur les préférences de l'utilisateur
  const seed = bookingHistory.length + 
               (userReviews.length * 10) + 
               (priceRange ? priceRange[0] / 1000 : 0) +
               (destinations ? destinations.length : 0) +
               (durationRange ? durationRange[0] : 0) +
               (tags ? tags.length : 0);
               
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    // Pseudo-random mais déterministe basé sur le seed et l'index
    embedding[i] = Math.sin(seed * i) * 0.5 + 0.5;
  }
  
  return embedding;
}
