import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { generateVirtualTryOn } from "../services/fal.server";
import db from "../db.server";

export async function action({ request }) {
  try {
    const { session } = await authenticate.public.appProxy(request);
    
    if (!session) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { modelImageUrl, productImageUrl, productId, productType } = body;

    console.log("🎨 Generation request:", {
      shop: session.shop,
      modelImage: modelImageUrl?.substring(0, 50) + "...",
      productImage: productImageUrl?.substring(0, 50) + "..."
    });

    if (!modelImageUrl || !productImageUrl) {
      return json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    console.log("📸 Generating virtual try-on...");

    const result = await generateVirtualTryOn({
      personImage: modelImageUrl,
      clothingImage: productImageUrl,
      preservePose: true
    });

    if (!result.success || !result.imageUrl) {
      throw new Error("Failed to generate virtual try-on image");
    }

    console.log("✅ Generation successful:", result.imageUrl);

    const shop = await db.shop.findUnique({
      where: { shop: session.shop }
    });

    if (!shop) {
      return json({ error: "Shop not found" }, { status: 404 });
    }

    if (shop.planType === "PAY_AS_YOU_GO" && shop.credits <= 0) {
      return json({ 
        error: "Insufficient credits"
      }, { status: 402 });
    }

    const generation = await db.generation.create({
      data: {
        shopId: shop.id,
        modelImageUrl,
        productImageUrl,
        resultImageUrl: result.imageUrl,
        productId: productId || null,
        productType: productType || null,
        category: "tops",
        status: "COMPLETED",
        metadata: result.metadata
      }
    });

    if (shop.planType === "PAY_AS_YOU_GO") {
      await db.shop.update({
        where: { id: shop.id },
        data: { 
          credits: { decrement: 1 },
          totalGenerations: { increment: 1 }
        }
      });
    } else {
      await db.shop.update({
        where: { id: shop.id },
        data: { 
          usedCredits: { increment: 1 },
          totalGenerations: { increment: 1 }
        }
      });
    }

    console.log("💾 Generation saved:", generation.id);

    return json({
      success: true,
      generationId: generation.id,
      imageUrl: result.imageUrl,
      creditsRemaining: shop.planType === "PAY_AS_YOU_GO" 
        ? shop.credits - 1 
        : shop.credits - (shop.usedCredits + 1)
    });

  } catch (error) {
    console.error("❌ Generation error:", error);
    
    return json({
      success: false,
      error: error.message || "Failed to generate virtual try-on"
    }, { status: 500 });
  }
}