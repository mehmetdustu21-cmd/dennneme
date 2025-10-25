/**
 * GDPR Webhook: customers/redact
 * 
 * Shopify invokes this webhook when a customer requests to be deleted/forgotten.
 * You must delete or anonymize all customer data within 30 days.
 * 
 * Required for public apps to be compliant with GDPR.
 */

import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[GDPR] Received ${topic} webhook for shop ${shop}`);
  console.log("[GDPR] Customer redaction payload:", JSON.stringify(payload, null, 2));

  /**
   * Payload contains:
   * - shop_id: The shop's ID
   * - shop_domain: The shop's domain
   * - customer: Customer object with id, email, phone
   * - orders_to_redact: Array of order IDs to redact
   */

  const customerId = payload.customer?.id;
  const customerEmail = payload.customer?.email;

  if (customerId) {
    const { prisma } = await import("../db.server");
    
    console.log(`[GDPR] Redacting data for customer ${customerId} (${customerEmail})`);

    try {
      // Delete all customer-related data
      const deletedGenerations = await prisma.generation.deleteMany({
        where: {
          customerId: customerId.toString(),
        },
      });

      console.log(`[GDPR] ✅ Deleted ${deletedGenerations.count} generations for customer ${customerId}`);

      /**
       * TODO: Delete or anonymize other customer data:
       * - Remove customer images from Cloudinary
       * - Remove any cached data
       * - Anonymize any logs
       * - Delete any analytics tied to this customer
       */

      // Optional: Keep a log that redaction was completed (without PII)
      console.log(`[GDPR] Customer redaction completed for shop ${shop} at ${new Date().toISOString()}`);

    } catch (error) {
      console.error(`[GDPR] ❌ Error redacting customer data:`, error);
      // Still return 200 to acknowledge webhook receipt
    }
  }

  return new Response(null, { status: 200 });
};

