// app/routes/api.proxy.$.jsx
// Sadece generate endpoint için - modeller artık Cloudinary'de

// Bu dosyanın sadece server-side çalışacağını belirt
export const config = {
  runtime: 'nodejs'
};

export async function loader({ params }) {
  const requestPath = params["*"];
  console.log("[Proxy] GET request path:", requestPath);

  if (requestPath === "generate") {
    return Response.json({ error: "Use POST method for generation" }, { status: 405 });
  }

  return Response.json({ error: "Not Found" }, { status: 404 });
}

export async function action({ request, params }) {
  const requestPath = params["*"];
  console.log("[Proxy] POST request path:", requestPath);
  
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
      
      console.log("[Proxy] fal.ai response status:", response.status);

      if (result.image?.url) {
        return json({ 
          success: true, 
          result_url: result.image.url 
        });
      } else {
        console.error("[Proxy] No image in result:", result);
        return json({ 
          success: false, 
          error: result.error || "No result image returned" 
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

  return json({ error: "Method not allowed" }, { status: 405 });
}