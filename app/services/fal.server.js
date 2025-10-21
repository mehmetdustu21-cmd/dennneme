/**
 * fal.ai Virtual Try-On Service
 * Uses official @fal-ai/client library
 */

import { fal } from "@fal-ai/client";

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY
});

/**
 * Generate virtual try-on using fal.ai API
 */
export async function generateVirtualTryOn({ 
  personImage, 
  clothingImage,
  preservePose = true
}) {
  if (!process.env.FAL_KEY) {
    throw new Error("FAL_KEY environment variable is not set");
  }

  console.log("🎨 Starting virtual try-on generation:", {
    personImage: personImage.substring(0, 80) + "...",
    clothingImage: clothingImage.substring(0, 80) + "...",
    preservePose
  });

  try {
    const result = await fal.subscribe("fal-ai/image-apps-v2/virtual-try-on", {
      input: {
        person_image_url: personImage,
        clothing_image_url: clothingImage,
        preserve_pose: preservePose
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs?.map(log => log.message).forEach(msg => {
            console.log("📊 Progress:", msg);
          });
        } else if (update.status === "IN_QUEUE") {
          console.log("⏳ Request queued...");
        }
      }
    });

    console.log("✅ Virtual try-on generated successfully!");

    const imageUrl = result.data.images?.[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL in response");
    }

    return {
      success: true,
      imageUrl: imageUrl,
      requestId: result.requestId,
      metadata: result.data
    };

  } catch (error) {
    console.error("❌ Virtual try-on generation failed:", error);
    throw error;
  }
}

export function estimateGenerationCost(numGenerations = 1) {
  const API_COST = 0.05;
  const MARKUP = 20;
  
  return {
    apiCost: API_COST * numGenerations,
    sellingPrice: API_COST * MARKUP * numGenerations,
    profit: (API_COST * MARKUP - API_COST) * numGenerations,
    creditsNeeded: numGenerations
  };
}