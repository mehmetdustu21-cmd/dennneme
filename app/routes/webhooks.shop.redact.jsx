/**
 * GDPR Webhook: shop/redact
 * 
 * Shopify invokes this webhook 48 hours after a store owner uninstalls your app.
 * You MUST delete all shop data within 30 days.
 * 
 * Required for public apps to be compliant with GDPR.
 */

import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[GDPR] Received ${topic} webhook for shop ${shop}`);
  console.log("[GDPR] Shop redaction payload:", JSON.stringify(payload, null, 2));

  /**
   * Payload contains:
   * - shop_id: The shop's ID
   * - shop_domain: The shop's domain
   */

  const shopDomain = payload.shop_domain || shop;

  try {
    const { prisma } = await import("../db.server");
    
    console.log(`[GDPR] Redacting ALL data for shop ${shopDomain}`);

    // Find the shop
    const shopRecord = await prisma.shop.findUnique({
      where: { shop: shopDomain },
    });

    if (!shopRecord) {
      console.log(`[GDPR] Shop ${shopDomain} not found in database`);
      return new Response(null, { status: 200 });
    }

    // Delete all related data (Prisma will cascade thanks to onDelete: Cascade)
    const deletedGenerations = await prisma.generation.deleteMany({
      where: { shopId: shopRecord.id },
    });

    const deletedCreditPurchases = await prisma.creditPurchase.deleteMany({
      where: { shopId: shopRecord.id },
    });

    const deletedCustomModels = await prisma.customModel.deleteMany({
      where: { shop: shopDomain },
    });

    const deletedThemeSettings = await prisma.themeSettings.deleteMany({
      where: { shop: shopDomain },
    });

    // Delete the shop record itself
    await prisma.shop.delete({
      where: { id: shopRecord.id },
    });

    console.log(`[GDPR] ✅ Shop redaction completed for ${shopDomain}:`);
    console.log(`  - ${deletedGenerations.count} generations deleted`);
    console.log(`  - ${deletedCreditPurchases.count} credit purchases deleted`);
    console.log(`  - ${deletedCustomModels.count} custom models deleted`);
    console.log(`  - ${deletedThemeSettings.count} theme settings deleted`);
    console.log(`  - Shop record deleted`);

    /**
     * TODO: Clean up external resources:
     * - Delete all images from Cloudinary for this shop
     * - Remove any cached data
     * - Cancel any pending API requests
     * - Delete any logs containing shop data
     */

  } catch (error) {
    console.error(`[GDPR] ❌ Error redacting shop data:`, error);
    // Still return 200 to acknowledge webhook receipt
  }

  return new Response(null, { status: 200 });
};

