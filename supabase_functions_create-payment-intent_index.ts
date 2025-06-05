// supabase/functions/create-payment-intent/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { corsHeaders } from '../_shared/cors.ts';

// Types pour la clarté du code
interface CreatePaymentIntentRequest {
  package_id: string;
  package_date_id: string;
  participants_count: number;
  special_requests?: string;
  participants: Array<{
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    handicap?: number;
    special_requirements?: string;
  }>;
}

interface PackageDetails {
  id: string;
  vendor_id: string;
  title: string;
  price_person_cents: number;
  price_currency: string;
  min_participants: number;
  max_participants: number;
}

interface PackageDateDetails {
  id: string;
  seats_left: number;
  is_available: boolean;
  start_date: string;
  end_date: string;
}

interface VendorDetails {
  id: string;
  company_name: string;
  stripe_connect_id: string;
  commission_rate: number;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  stripe_customer_id?: string;
}

// Configuration et initialisation
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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
    let requestData: CreatePaymentIntentRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload', details: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validation des champs obligatoires
    const { package_id, package_date_id, participants_count, participants } = requestData;
    
    if (!package_id || !package_date_id || !participants_count || !participants || !Array.isArray(participants)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (participants.length !== participants_count) {
      return new Response(
        JSON.stringify({ error: 'Participants count does not match participants array length' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validation des participants
    for (const participant of participants) {
      if (!participant.first_name || !participant.last_name) {
        return new Response(
          JSON.stringify({ error: 'Each participant must have first_name and last_name' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Récupération des détails du séjour
    const { data: packageData, error: packageError } = await supabaseClient
      .from('packages')
      .select('*')
      .eq('id', package_id)
      .single();

    if (packageError || !packageData) {
      return new Response(
        JSON.stringify({ error: 'Package not found', details: packageError?.message }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const packageDetails = packageData as unknown as PackageDetails;

    // Vérification que le séjour est disponible à la réservation
    if (packageDetails.min_participants > participants_count || packageDetails.max_participants < participants_count) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid participants count', 
          details: `This package requires between ${packageDetails.min_participants} and ${packageDetails.max_participants} participants` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Récupération des détails de la date du séjour
    const { data: dateData, error: dateError } = await supabaseClient
      .from('package_dates')
      .select('*')
      .eq('id', package_date_id)
      .eq('package_id', package_id)
      .single();

    if (dateError || !dateData) {
      return new Response(
        JSON.stringify({ error: 'Package date not found', details: dateError?.message }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const dateDetails = dateData as unknown as PackageDateDetails;

    // Vérification de la disponibilité
    if (!dateDetails.is_available || dateDetails.seats_left < participants_count) {
      return new Response(
        JSON.stringify({ 
          error: 'Not enough seats available', 
          details: `Only ${dateDetails.seats_left} seats left for this date` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérification que la date n'est pas passée
    const startDate = new Date(dateDetails.start_date);
    if (startDate < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Cannot book past dates' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Récupération des détails du vendeur
    const { data: vendorData, error: vendorError } = await supabaseClient
      .from('vendors')
      .select('*')
      .eq('id', packageDetails.vendor_id)
      .single();

    if (vendorError || !vendorData) {
      return new Response(
        JSON.stringify({ error: 'Vendor not found', details: vendorError?.message }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const vendorDetails = vendorData as unknown as VendorDetails;

    // Récupération du profil utilisateur
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      return new Response(
        JSON.stringify({ error: 'User profile not found', details: profileError?.message }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userProfile = profileData as unknown as UserProfile;

    // Calcul du montant total
    const totalAmountCents = packageDetails.price_person_cents * participants_count;
    const currency = packageDetails.price_currency.toLowerCase();

    // Calcul des commissions
    const platformFeeCents = Math.round(totalAmountCents * (vendorDetails.commission_rate / 100));
    const vendorAmountCents = totalAmountCents - platformFeeCents;

    // Création ou récupération du client Stripe
    let stripeCustomerId = userProfile.stripe_customer_id;
    
    if (!stripeCustomerId) {
      // Création d'un nouveau client Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: userProfile.full_name || user.email,
        metadata: {
          user_id: user.id
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Mise à jour du profil utilisateur avec l'ID client Stripe
      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    }

    // Création d'une réservation temporaire
    const { data: bookingData, error: bookingError } = await supabaseClient
      .from('bookings')
      .insert({
        buyer_id: user.id,
        package_id: package_id,
        package_date_id: package_date_id,
        status: 'pending',
        participants_count: participants_count,
        total_amount_cents: totalAmountCents,
        currency: currency,
        special_requests: requestData.special_requests,
        contact_email: user.email
      })
      .select()
      .single();

    if (bookingError || !bookingData) {
      return new Response(
        JSON.stringify({ error: 'Failed to create booking', details: bookingError?.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Insertion des participants
    const participantsWithBookingId = participants.map(participant => ({
      ...participant,
      booking_id: bookingData.id
    }));

    const { error: participantsError } = await supabaseClient
      .from('booking_participants')
      .insert(participantsWithBookingId);

    if (participantsError) {
      // Annulation de la réservation si l'insertion des participants échoue
      await supabaseClient
        .from('bookings')
        .delete()
        .eq('id', bookingData.id);

      return new Response(
        JSON.stringify({ error: 'Failed to register participants', details: participantsError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Réservation temporaire des places
    const { error: updateDateError } = await supabaseClient
      .from('package_dates')
      .update({ 
        seats_left: dateDetails.seats_left - participants_count,
        is_available: (dateDetails.seats_left - participants_count) > 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', package_date_id);

    if (updateDateError) {
      // Annulation de la réservation si la mise à jour des places échoue
      await supabaseClient
        .from('bookings')
        .delete()
        .eq('id', bookingData.id);

      return new Response(
        JSON.stringify({ error: 'Failed to reserve seats', details: updateDateError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Préparation des paramètres pour le payment intent
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: totalAmountCents,
      currency: currency,
      customer: stripeCustomerId,
      metadata: {
        booking_id: bookingData.id,
        package_id: package_id,
        package_date_id: package_date_id,
        user_id: user.id
      },
      description: `Réservation Golf Pass: ${packageDetails.title} - ${participants_count} participant(s)`,
      receipt_email: user.email
    };

    // Ajout des paramètres de transfert si le vendeur a un compte Stripe Connect
    if (vendorDetails.stripe_connect_id) {
      paymentIntentParams.application_fee_amount = platformFeeCents;
      paymentIntentParams.transfer_data = {
        destination: vendorDetails.stripe_connect_id,
      };
    }

    // Création du payment intent
    try {
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

      // Retour de la réponse avec le client secret
      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          bookingId: bookingData.id,
          amount: totalAmountCents / 100, // Conversion en unité monétaire
          currency: currency
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (stripeError) {
      // En cas d'erreur Stripe, annuler la réservation et libérer les places
      await supabaseClient
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingData.id);

      await supabaseClient
        .from('package_dates')
        .update({ 
          seats_left: dateDetails.seats_left,
          is_available: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', package_date_id);

      return new Response(
        JSON.stringify({ error: 'Payment processing error', details: stripeError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    // Gestion des erreurs générales
    console.error(`Error creating payment intent: ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
