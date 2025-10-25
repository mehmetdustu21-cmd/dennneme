/**
 * GDPR Webhook: customers/data_request
 * 
 * Customers can request their data from a store owner.
 * When this occurs, Shopify invokes this webhook with the customer data.
 * 
 * Required for public apps to be compliant with GDPR.
 */

import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[GDPR] Received ${topic} webhook for shop ${shop}`);
  console.log("[GDPR] Customer data request payload:", JSON.stringify(payload, null, 2));

  /**
   * TODO: Implement your data collection logic here.
   * 
   * You need to:
   * 1. Collect all customer data you have stored
   * 2. Send it to the customer via email or provide a download link
   * 3. Log this request for compliance records
   * 
   * Payload contains:
   * - shop_id: The shop's ID
   * - shop_domain: The shop's domain
   * - orders_requested: Array of order IDs the customer wants
   * - customer: Customer object with email, phone, etc.
   */

  const customerId = payload.customer?.id;
  const customerEmail = payload.customer?.email;

  if (customerId) {
    // Find all data related to this customer
    const { prisma } = await import("../db.server");
    
    const customerGenerations = await prisma.generation.findMany({
      where: {
        customerId: customerId.toString(),
      },
      select: {
        id: true,
        createdAt: true,
        productId: true,
        customerImage: true,
        resultImage: true,
        status: true,
      },
    });

    console.log(`[GDPR] Found ${customerGenerations.length} generations for customer ${customerId}`);

    /**
     * TODO: Send this data to the customer
     * - Email the data as JSON/PDF
     * - Or provide a secure download link
     * - Store a record that this request was fulfilled
     */

    // Example response data structure
    const customerData = {
      customer_id: customerId,
      email: customerEmail,
      shop: shop,
      data_collected_at: new Date().toISOString(),
      virtual_tryon_generations: customerGenerations,
      note: "All virtual try-on images and data associated with your account",
    };

    // TODO: Actually send this data to the customer
    console.log("[GDPR] Customer data package prepared:", customerData);
  }

  return new Response(null, { status: 200 });
};

