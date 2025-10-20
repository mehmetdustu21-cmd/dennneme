import { readFile } from "fs/promises";
import { join } from "path";

/**
 * App Proxy handler
 * Serves model images and API endpoints through Shopify store URL
 * https://shop.myshopify.com/apps/virtual-tryon/models/male-1.png
 */
export const loader = async ({ request, params }) => {
  const url = new URL(request.url);
  const path = params["*"]; // Everything after /api/proxy/
  
  console.log("📡 App Proxy Request:", path);

  // Serve model images
  if (path.startsWith("models/")) {
    const filename = path.replace("models/", "");
    
    try {
      // Read image from public/models/
      const imagePath = join(process.cwd(), "public", "models", filename);
      const imageBuffer = await readFile(imagePath);
      
      // Determine content type
      const ext = filename.split(".").pop().toLowerCase();
      const contentType = {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
      }[ext] || "image/png";
      
      return new Response(imageBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error) {
      console.error("❌ Image not found:", filename, error);
      return new Response("Image not found", { status: 404 });
    }
  }

  // API endpoints
  if (path === "api/models") {
    // Return available models
    const models = [
      { id: 'male-1', name: 'Michael', gender: 'male' },
      { id: 'male-2', name: 'James', gender: 'male' },
      { id: 'male-3', name: 'David', gender: 'male' },
      { id: 'male-4', name: 'Ryan', gender: 'male' },
      { id: 'male-5', name: 'Alex', gender: 'male' },
      { id: 'female-1', name: 'Emma', gender: 'female' },
      { id: 'female-2', name: 'Sophia', gender: 'female' },
      { id: 'female-3', name: 'Olivia', gender: 'female' },
      { id: 'female-4', name: 'Isabella', gender: 'female' },
      { id: 'female-5', name: 'Ava', gender: 'female' }
    ];
    
    return new Response(JSON.stringify(models), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Default 404
  return new Response("Not found", { status: 404 });
};