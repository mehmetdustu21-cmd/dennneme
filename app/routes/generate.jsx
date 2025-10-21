// app/routes/generate.jsx
// Shopify App Proxy route - /generate

export async function action({ request }) {
  console.log("[Generate] POST request received");
  console.log("[Generate] Full URL:", request.url);
  
  try {
    const body = await request.json();
    const { garment_image, model_image, model_id } = body;
    
    console.log("[Generate] Request data:", { 
      garment: garment_image?.substring(0, 50), 
      model: model_id 
    });

    // fal.ai API'ye istek yap
    const response = await fetch("https://queue.fal.run/fal-ai/image-apps-v2/virtual-try-on", {
      method: "POST",
      headers: {
        "Authorization": "Key 89142345-f225-4dcf-b8c8-3d5bbba40e8c:dae48432917c52f5bf675d9b6c81ead6",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        person_image_url: model_image,
        clothing_image_url: garment_image,
        preserve_pose: true,
      }),
    });

    console.log("[Generate] fal.ai response status:", response.status);

    // Response'u text olarak al
    let responseText;
    try {
      responseText = await response.text();
      console.log("[Generate] Raw response from fal.ai:", responseText.substring(0, 500) + "...");
    } catch (textError) {
      console.error("[Generate] Failed to read response text:", textError);
      return Response.json({ 
        success: false, 
        error: "Failed to read response from AI service" 
      }, { status: 500 });
    }

    if (!response.ok) {
      console.error("[Generate] fal.ai API error - Status:", response.status, "Response:", responseText);
      return Response.json({ 
        success: false, 
        error: `API error: ${response.status} - ${responseText.substring(0, 200)}` 
      }, { status: response.status });
    }

    // JSON parse et
    let result;
    try {
      result = JSON.parse(responseText);
      console.log("[Generate] fal.ai response data:", JSON.stringify(result, null, 2));
    } catch (jsonError) {
      console.error("[Generate] JSON parse error:", jsonError);
      return Response.json({ 
        success: false, 
        error: "Failed to parse response from AI service" 
      }, { status: 500 });
    }

    // Request ID varsa status kontrolü yap
    if (result.request_id) {
      console.log("[Generate] Got request_id:", result.request_id);
      
      // Status kontrolü yap
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        
        try {
          const statusResponse = await fetch(`https://queue.fal.run/fal-ai/image-apps-v2/requests/${result.request_id}`, {
            headers: {
              "Authorization": "Key 89142345-f225-4dcf-b8c8-3d5bbba40e8c:dae48432917c52f5bf675d9b6c81ead6",
            },
          });
          
          const statusData = await statusResponse.json();
          console.log(`[Generate] Status check ${attempts}:`, statusData);
          
          if ((statusData.status === "COMPLETED" || statusData.images) && statusData.images && statusData.images.length > 0) {
            const imageUrl = statusData.images[0].url;
            console.log("[Generate] Found final image URL:", imageUrl);
            return Response.json({ 
              success: true, 
              result_url: imageUrl 
            });
          } else if (statusData.status === "FAILED") {
            console.error("[Generate] Request failed:", statusData);
            return Response.json({ 
              success: false, 
              error: statusData.error || "Request failed" 
            }, { status: 400 });
          }
          
        } catch (statusError) {
          console.error(`[Generate] Status check error ${attempts}:`, statusError);
        }
      }
      
      // Timeout
      return Response.json({ 
        success: false, 
        error: "Request timeout - generation took too long" 
      }, { status: 408 });
      
    } else {
      // Direkt result kontrolü
      let imageUrl = null;
      
      if (result.images && result.images.length > 0 && result.images[0].url) {
        imageUrl = result.images[0].url;
      } else if (result.image?.url) {
        imageUrl = result.image.url;
      }
      
      if (imageUrl) {
        console.log("[Generate] Found direct image URL:", imageUrl);
        return Response.json({ 
          success: true, 
          result_url: imageUrl 
        });
      } else {
        console.error("[Generate] No image found in result:", result);
        return Response.json({ 
          success: false, 
          error: "No result image returned" 
        }, { status: 400 });
      }
    }
  } catch (error) {
    console.error("[Generate] Generation error:", error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function loader() {
  return Response.json({ error: "Use POST method for generation" }, { status: 405 });
}
