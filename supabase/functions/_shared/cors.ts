// supabase/functions/_shared/cors.ts

/**
 * Configuration CORS partagée pour toutes les Edge Functions Golf Pass
 * Ces en-têtes permettent les requêtes cross-origin depuis les domaines autorisés
 */

// Domaines autorisés pour les requêtes CORS
const allowedOrigins = [
  'https://app.golfpass.io',
  'https://staging.golfpass.io',
  'http://localhost:3000',
  'http://localhost:5173',
  'capacitor://localhost',
  'http://localhost'
];

// Fonction pour vérifier si l'origine est autorisée
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return allowedOrigins.some(allowedOrigin => {
    if (allowedOrigin === '*') return true;
    return origin === allowedOrigin || 
           (allowedOrigin.endsWith('*') && 
            origin.startsWith(allowedOrigin.slice(0, -1)));
  });
}

// En-têtes CORS de base à utiliser dans toutes les réponses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // En production, remplacer par l'origine spécifique ou utiliser une logique dynamique
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-auth, x-golf-pass-version',
  'Access-Control-Max-Age': '86400', // 24 heures en secondes
  'Access-Control-Allow-Credentials': 'true',
};

// Fonction utilitaire pour gérer les requêtes preflight OPTIONS
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

// Fonction pour ajouter les en-têtes CORS à une réponse existante
export function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
