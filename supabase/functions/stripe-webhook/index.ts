// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { Resend } from 'https://esm.sh/resend@1.0.0';

// Types pour la clarté du code
interface BookingDetails {
  id: string;
  buyer_id: string;
  package_id: string;
  package_date_id: string;
  status: string;
  booking_reference: string;
  total_amount_cents: number;
  participants_count: number;
  contact_email: string;
}

interface PackageDetails {
  id: string;
  title: string;
  vendor_id: string;
}

interface VendorDetails {
  id: string;
  company_name: string;
  stripe_connect_id: string;
  commission_rate: number;
}

interface ProfileDetails {
  id: string;
  full_name: string;
  email: string;
}

// Configuration et initialisation
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(Deno.env.get('RESEND_API_KEY') || '');

// Fonction principale pour gérer les webhooks
serve(async (req: Request) => {
  console.log('⚡ Stripe webhook received');
  
  try {
    // Vérification de la méthode HTTP
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Récupération du corps de la requête et de la signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature found');
      return new Response(JSON.stringify({ error: 'No Stripe signature found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérification de la signature Stripe
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`✅ Webhook verified: ${event.type}`);
    } catch (err) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Traitement des différents types d'événements
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;
      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(`❌ Error processing webhook: ${err.message}`);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Gestion du paiement réussi
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`💰 Payment succeeded: ${paymentIntent.id}`);
  
  try {
    // Récupération des métadonnées de la réservation
    const bookingId = paymentIntent.metadata.booking_id;
    if (!bookingId) {
      throw new Error('No booking ID found in payment intent metadata');
    }

    // Récupération des détails de la réservation
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('*, packages:package_id(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !bookingData) {
      throw new Error(`Failed to fetch booking: ${bookingError?.message || 'Booking not found'}`);
    }

    const booking = bookingData as unknown as BookingDetails;
    const packageDetails = bookingData.packages as unknown as PackageDetails;

    // Récupération des détails du vendeur
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', packageDetails.vendor_id)
      .single();

    if (vendorError || !vendorData) {
      throw new Error(`Failed to fetch vendor: ${vendorError?.message || 'Vendor not found'}`);
    }

    const vendor = vendorData as unknown as VendorDetails;

    // Récupération des détails de l'acheteur
    const { data: buyerData, error: buyerError } = await supabase
      .from('profiles')
      .select('*, auth_users:id(email)')
      .eq('id', booking.buyer_id)
      .single();

    if (buyerError || !buyerData) {
      throw new Error(`Failed to fetch buyer: ${buyerError?.message || 'Buyer not found'}`);
    }

    const buyer = buyerData as unknown as ProfileDetails;
    
    // Mise à jour du statut de la réservation
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      throw new Error(`Failed to update booking status: ${updateError.message}`);
    }

    // Création de l'enregistrement de paiement
    const vendorAmount = Math.floor(booking.total_amount_cents * (1 - vendor.commission_rate / 100));
    const platformFee = booking.total_amount_cents - vendorAmount;

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        stripe_payment_intent_id: paymentIntent.id,
        amount_cents: booking.total_amount_cents,
        currency: paymentIntent.currency,
        status: 'succeeded',
        payment_method: paymentIntent.payment_method_types[0],
        receipt_url: (paymentIntent.charges.data[0] as any).receipt_url || null,
        vendor_amount_cents: vendorAmount,
        platform_fee_cents: platformFee
      });

    if (paymentError) {
      throw new Error(`Failed to create payment record: ${paymentError.message}`);
    }

    // Envoi de l'email de confirmation
    await sendBookingConfirmationEmail(booking, packageDetails, buyer.email);
    
    // Notification au vendeur
    await notifyVendorAboutBooking(booking, packageDetails, vendor);

    console.log(`✅ Payment processing completed for booking ${bookingId}`);
  } catch (error) {
    console.error(`❌ Error handling payment success: ${error.message}`);
    // Log détaillé pour le débogage
    console.error(JSON.stringify({
      paymentIntentId: paymentIntent.id,
      error: error.message,
      stack: error.stack
    }));
    
    // En cas d'erreur, on continue pour ne pas bloquer la réponse à Stripe
    // mais on enregistre l'erreur pour investigation
    await logError('payment_success_error', error.message, {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata
    });
  }
}

// Gestion du paiement échoué
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`❌ Payment failed: ${paymentIntent.id}`);
  
  try {
    const bookingId = paymentIntent.metadata.booking_id;
    if (!bookingId) {
      throw new Error('No booking ID found in payment intent metadata');
    }

    // Mise à jour du statut de la réservation
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      throw new Error(`Failed to update booking status: ${updateError.message}`);
    }

    // Récupération des détails de la réservation pour l'email
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('*, packages:package_id(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !bookingData) {
      throw new Error(`Failed to fetch booking: ${bookingError?.message || 'Booking not found'}`);
    }

    // Envoi d'un email à l'utilisateur pour l'informer de l'échec
    await sendPaymentFailedEmail(
      bookingData.contact_email,
      bookingData.booking_reference,
      bookingData.packages.title,
      paymentIntent.last_payment_error?.message || 'Unknown error'
    );

    console.log(`✅ Payment failure handled for booking ${bookingId}`);
  } catch (error) {
    console.error(`❌ Error handling payment failure: ${error.message}`);
    await logError('payment_failure_error', error.message, {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata
    });
  }
}

// Gestion des remboursements
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log(`💸 Charge refunded: ${charge.id}`);
  
  try {
    // Récupération du payment intent associé
    const paymentIntentId = charge.payment_intent as string;
    
    // Récupération du paiement dans notre base de données
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('*, bookings:booking_id(*)')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (paymentError || !paymentData) {
      throw new Error(`Failed to fetch payment: ${paymentError?.message || 'Payment not found'}`);
    }

    const booking = paymentData.bookings;
    const refundedAmount = charge.amount_refunded;
    const isFullRefund = charge.amount_refunded === charge.amount;

    // Mise à jour du paiement avec le montant remboursé
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({ 
        refunded_amount_cents: refundedAmount,
        status: isFullRefund ? 'refunded' : 'partially_refunded',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (updatePaymentError) {
      throw new Error(`Failed to update payment: ${updatePaymentError.message}`);
    }

    // Si remboursement complet, mettre à jour le statut de la réservation
    if (isFullRefund) {
      const { error: updateBookingError } = await supabase
        .from('bookings')
        .update({ 
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (updateBookingError) {
        throw new Error(`Failed to update booking status: ${updateBookingError.message}`);
      }

      // Restaurer les places disponibles
      await restoreAvailableSeats(booking.package_date_id, booking.participants_count);
    }

    // Envoi d'un email de confirmation du remboursement
    await sendRefundConfirmationEmail(
      booking.contact_email,
      booking.booking_reference,
      refundedAmount / 100, // Conversion en euros
      charge.currency.toUpperCase(),
      isFullRefund
    );

    console.log(`✅ Refund processed for booking ${booking.id}`);
  } catch (error) {
    console.error(`❌ Error handling refund: ${error.message}`);
    await logError('refund_error', error.message, {
      chargeId: charge.id,
      paymentIntentId: charge.payment_intent
    });
  }
}

// Gestion des paiements annulés
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log(`🚫 Payment canceled: ${paymentIntent.id}`);
  
  try {
    const bookingId = paymentIntent.metadata.booking_id;
    if (!bookingId) {
      throw new Error('No booking ID found in payment intent metadata');
    }

    // Récupération des détails de la réservation
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error(`Failed to fetch booking: ${bookingError?.message || 'Booking not found'}`);
    }

    // Mise à jour du statut de la réservation uniquement si elle n'est pas déjà annulée
    if (booking.status !== 'cancelled') {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (updateError) {
        throw new Error(`Failed to update booking status: ${updateError.message}`);
      }

      // Restaurer les places disponibles
      await restoreAvailableSeats(booking.package_date_id, booking.participants_count);
    }

    console.log(`✅ Cancellation handled for booking ${bookingId}`);
  } catch (error) {
    console.error(`❌ Error handling payment cancellation: ${error.message}`);
    await logError('payment_cancellation_error', error.message, {
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata
    });
  }
}

// Fonction pour restaurer les places disponibles après annulation/remboursement
async function restoreAvailableSeats(packageDateId: string, participantsCount: number) {
  try {
    // Récupérer d'abord les informations actuelles
    const { data: dateData, error: fetchError } = await supabase
      .from('package_dates')
      .select('seats_left, seats_total')
      .eq('id', packageDateId)
      .single();

    if (fetchError || !dateData) {
      throw new Error(`Failed to fetch package date: ${fetchError?.message || 'Date not found'}`);
    }

    // Calculer le nouveau nombre de places disponibles
    const newSeatsLeft = Math.min(dateData.seats_left + participantsCount, dateData.seats_total);

    // Mettre à jour les places disponibles et s'assurer que la date est disponible
    const { error: updateError } = await supabase
      .from('package_dates')
      .update({ 
        seats_left: newSeatsLeft,
        is_available: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', packageDateId);

    if (updateError) {
      throw new Error(`Failed to restore available seats: ${updateError.message}`);
    }

    console.log(`✅ Restored ${participantsCount} seats for package date ${packageDateId}`);
  } catch (error) {
    console.error(`❌ Error restoring available seats: ${error.message}`);
    await logError('restore_seats_error', error.message, {
      packageDateId,
      participantsCount
    });
  }
}

// Fonction pour envoyer un email de confirmation de réservation
async function sendBookingConfirmationEmail(
  booking: BookingDetails,
  packageDetails: PackageDetails,
  email: string
) {
  try {
    await resend.emails.send({
      from: 'Golf Pass <reservations@golfpass.io>',
      to: [email],
      subject: `Confirmation de votre réservation #${booking.booking_reference}`,
      template: 'booking_confirmation_template',
      data: {
        bookingReference: booking.booking_reference,
        packageTitle: packageDetails.title,
        amount: (booking.total_amount_cents / 100).toFixed(2),
        currency: 'EUR',
        participantsCount: booking.participants_count,
        dashboardUrl: `https://app.golfpass.io/bookings/${booking.id}`
      }
    });

    console.log(`✅ Confirmation email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending confirmation email: ${error.message}`);
    await logError('email_error', error.message, {
      type: 'booking_confirmation',
      bookingId: booking.id,
      email
    });
  }
}

// Fonction pour envoyer un email d'échec de paiement
async function sendPaymentFailedEmail(
  email: string,
  bookingReference: string,
  packageTitle: string,
  errorMessage: string
) {
  try {
    await resend.emails.send({
      from: 'Golf Pass <payments@golfpass.io>',
      to: [email],
      subject: `Problème de paiement pour votre réservation #${bookingReference}`,
      template: 'payment_failed_template',
      data: {
        bookingReference,
        packageTitle,
        errorMessage,
        retryUrl: `https://app.golfpass.io/bookings/retry-payment/${bookingReference}`
      }
    });

    console.log(`✅ Payment failed email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending payment failed email: ${error.message}`);
    await logError('email_error', error.message, {
      type: 'payment_failed',
      bookingReference,
      email
    });
  }
}

// Fonction pour envoyer un email de confirmation de remboursement
async function sendRefundConfirmationEmail(
  email: string,
  bookingReference: string,
  amount: number,
  currency: string,
  isFullRefund: boolean
) {
  try {
    await resend.emails.send({
      from: 'Golf Pass <remboursements@golfpass.io>',
      to: [email],
      subject: `${isFullRefund ? 'Remboursement complet' : 'Remboursement partiel'} de votre réservation #${bookingReference}`,
      template: 'refund_confirmation_template',
      data: {
        bookingReference,
        amount: amount.toFixed(2),
        currency,
        isFullRefund,
        supportUrl: 'https://app.golfpass.io/support'
      }
    });

    console.log(`✅ Refund confirmation email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending refund confirmation email: ${error.message}`);
    await logError('email_error', error.message, {
      type: 'refund_confirmation',
      bookingReference,
      email
    });
  }
}

// Fonction pour notifier le vendeur d'une nouvelle réservation
async function notifyVendorAboutBooking(
  booking: BookingDetails,
  packageDetails: PackageDetails,
  vendor: VendorDetails
) {
  try {
    // Récupérer l'email du vendeur
    const { data: vendorUser, error: vendorError } = await supabase
      .from('profiles')
      .select('*, auth_users:id(email)')
      .eq('id', vendor.id)
      .single();

    if (vendorError || !vendorUser || !vendorUser.auth_users || !vendorUser.auth_users.email) {
      throw new Error(`Failed to fetch vendor email: ${vendorError?.message || 'Vendor email not found'}`);
    }

    const vendorEmail = vendorUser.auth_users.email;

    await resend.emails.send({
      from: 'Golf Pass <notifications@golfpass.io>',
      to: [vendorEmail],
      subject: `Nouvelle réservation #${booking.booking_reference} pour ${packageDetails.title}`,
      template: 'vendor_booking_notification_template',
      data: {
        bookingReference: booking.booking_reference,
        packageTitle: packageDetails.title,
        amount: ((booking.total_amount_cents * (1 - vendor.commission_rate / 100)) / 100).toFixed(2),
        currency: 'EUR',
        participantsCount: booking.participants_count,
        dashboardUrl: `https://app.golfpass.io/vendor/bookings/${booking.id}`
      }
    });

    console.log(`✅ Vendor notification email sent to ${vendorEmail}`);
  } catch (error) {
    console.error(`❌ Error sending vendor notification email: ${error.message}`);
    await logError('email_error', error.message, {
      type: 'vendor_notification',
      bookingId: booking.id,
      vendorId: vendor.id
    });
  }
}

// Fonction pour enregistrer les erreurs dans la base de données
async function logError(type: string, message: string, metadata: any) {
  try {
    await supabase
      .from('error_logs')
      .insert({
        type,
        message,
        metadata,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    // Si même la journalisation échoue, on log dans la console
    console.error('Failed to log error to database:', error.message);
    console.error('Original error:', { type, message, metadata });
  }
}
