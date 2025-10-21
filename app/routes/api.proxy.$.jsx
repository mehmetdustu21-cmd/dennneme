// app/routes/api.proxy.$.jsx
import { json } from "@remix-run/node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loader({ params }) {
  const requestPath = params["*"];
  
  console.log("[Proxy] Request path:", requestPath);

  // Model görselleri için
  if (requestPath.startsWith("models/")) {
    const filename = requestPath.replace("models/", "");
    const filePath = path.join(process.cwd(), "public", "models", filename);
    
    console.log("[Proxy] Looking for model image:", filePath);

    try {
      // Dosya var mı kontrol et
      if (!fs.existsSync(filePath)) {
        console.error("[Proxy] File not found:", filePath);
        return new Response("Model image not found", { status: 404 });
      }

      // Dosyayı oku
      const fileBuffer = fs.readFileSync(filePath);
      
      // Content type belirle
      const contentType = filename.endsWith('.png') ? 'image/png' : 
                         filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' : 
                         'application/octet-stream';

      console.log("[Proxy] Serving file:", filename, "Size:", fileBuffer.length, "bytes");

      // CORS headers ile birlikte döndür
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": fileBuffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } catch (error) {
      console.error("[Proxy] Error serving model image:", error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }

  // Generate endpoint için
  if (requestPath === "generate") {
    return json({ error: "Use POST method for generation" }, { status: 405 });
  }

  // Bilinmeyen path
  console.warn("[Proxy] Unknown path:", requestPath);
  return new Response("Not Found", { status: 404 });
}

// POST istekleri için (generate)
export async function action({ request, params }) {
  const requestPath = params["*"];
  
  if (requestPath === "generate") {
    try {
      const body = await request.json();
      const { garment_image, model_image, model_id } = body;

      console.log("[Proxy] Generate request:", { 
        garment: garment_image?.substring(0, 50), 
        model: model_id 
      });

      // fal.ai API'ye istek yap
      const response = await fetch("https://fal.run/fal-ai/idm-vton", {
        method: "POST",
        headers: {
          "Authorization": "Key 89142345-f225-4dcf-b8c8-3d5bbba40e8c:dae48432917c52f5bf675d9b6c81ead6",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          human_image_url: model_image,
          garment_image_url: garment_image,
          category: "upper_body",
          num_inference_steps: 30,
        }),
      });

      const result = await response.json();
      
      console.log("[Proxy] fal.ai response:", result);

      if (result.image?.url) {
        return json({ 
          success: true, 
          result_url: result.image.url 
        });
      } else {
        return json({ 
          success: false, 
          error: "No result image returned" 
        }, { status: 400 });
      }
    } catch (error) {
      console.error("[Proxy] Generation error:", error);
      return json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}