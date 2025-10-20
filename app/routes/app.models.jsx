import { useState, useCallback } from "react";
import { useLoaderData, useActionData, useSubmit } from "react-router";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Button,
  InlineStack,
  Badge,
  Banner,
  Modal,
  DropZone,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { uploadImage, deleteImage } from "../utils/cloudinary.server";

// Default model görselleri
const DEFAULT_MODELS = [
  {
    id: "model-1",
    name: "Male Model 1",
    url: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=600&fit=crop",
    gender: "male"
  },
  {
    id: "model-2",
    name: "Male Model 2",
    url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=600&fit=crop",
    gender: "male"
  },
  {
    id: "model-3",
    name: "Male Model 3",
    url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=600&fit=crop",
    gender: "male"
  },
  {
    id: "model-4",
    name: "Male Model 4",
    url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=600&fit=crop",
    gender: "male"
  },
  {
    id: "model-5",
    name: "Male Model 5",
    url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=600&fit=crop",
    gender: "male"
  },
  {
    id: "model-6",
    name: "Female Model 1",
    url: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=600&fit=crop",
    gender: "female"
  },
  {
    id: "model-7",
    name: "Female Model 2",
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
    gender: "female"
  },
  {
    id: "model-8",
    name: "Female Model 3",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
    gender: "female"
  },
  {
    id: "model-9",
    name: "Female Model 4",
    url: "https://images.unsplash.com/photo-1518644961665-ed172691aaa1?w=400&h=600&fit=crop",
    gender: "female"
  },
  {
    id: "model-10",
    name: "Female Model 5",
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
    gender: "female"
  }
];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // TODO: Database'den custom modelleri çek
  // const customModels = await db.customModel.findMany({
  //   where: { shop: session.shop }
  // });
  
  return {
    shop: session.shop,
    defaultModels: DEFAULT_MODELS,
    customModels: [], // Şimdilik boş
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("action");
  
  if (actionType === "upload") {
    const imageBase64 = formData.get("image");
    const modelName = formData.get("name") || "Custom Model";
    const gender = formData.get("gender") || "male";
    
    if (!imageBase64) {
      return { error: "No image provided" };
    }
    
    // Cloudinary'ye yükle
    const uploadResult = await uploadImage(imageBase64, `virtual-tryon/${session.shop}/models`);
    
    if (!uploadResult.success) {
      return { error: uploadResult.error };
    }
    
    // TODO: Database'e kaydet
    // await db.customModel.create({
    //   data: {
    //     shop: session.shop,
    //     name: modelName,
    //     url: uploadResult.url,
    //     cloudinaryId: uploadResult.publicId,
    //     gender: gender,
    //   }
    // });
    
    return { 
      success: true, 
      message: "Model uploaded successfully!",
      url: uploadResult.url 
    };
  }
  
  if (actionType === "delete") {
    const modelId = formData.get("modelId");
    const cloudinaryId = formData.get("cloudinaryId");
    
    // Cloudinary'den sil
    if (cloudinaryId) {
      await deleteImage(cloudinaryId);
    }
    
    // TODO: Database'den sil
    // await db.customModel.delete({
    //   where: { id: modelId }
    // });
    
    return { success: true, message: "Model deleted successfully!" };
  }
  
  return { error: "Invalid action" };
};

export default function Models() {
  const { defaultModels, customModels } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modelName, setModelName] = useState("");
  const [modelGender, setModelGender] = useState("male");
  const [previewModel, setPreviewModel] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileDrop = useCallback((files) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      // Preview için FileReader kullan
      const reader = new FileReader();
      reader.onloadend = () => {
        // Base64 preview
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      
      const formData = new FormData();
      formData.append("action", "upload");
      formData.append("image", base64String);
      formData.append("name", modelName || "Custom Model");
      formData.append("gender", modelGender);
      
      submit(formData, { method: "post" });
      
      setShowUploadModal(false);
      setSelectedFile(null);
      setModelName("");
      setUploading(false);
    };
    
    reader.readAsDataURL(selectedFile);
  };

  const handleDelete = (modelId, cloudinaryId) => {
    if (confirm("Are you sure you want to delete this model?")) {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("modelId", modelId);
      formData.append("cloudinaryId", cloudinaryId);
      submit(formData, { method: "post" });
    }
  };

  return (
    <Page
      title="Model Images"
      backAction={{ url: "/app" }}
      primaryAction={{
        content: "Upload Custom Model",
        onAction: () => setShowUploadModal(true),
      }}
    >
      <TitleBar title="Model Images" />

      <BlockStack gap="500">
        {actionData?.success && (
          <Banner tone="success" onDismiss={() => {}}>
            {actionData.message}
          </Banner>
        )}

        {actionData?.error && (
          <Banner tone="critical" onDismiss={() => {}}>
            {actionData.error}
          </Banner>
        )}

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h2">
                    Default Models ({defaultModels.length})
                  </Text>
                  <Badge tone="info">Built-in</Badge>
                </InlineStack>

                <Text variant="bodySm" tone="subdued">
                  Professional model images ready for virtual try-on.
                </Text>

                <InlineGrid columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} gap="400">
                  {defaultModels.map((model) => (
                    <Card key={model.id}>
                      <BlockStack gap="200">
                        <div 
                          style={{ 
                            cursor: "pointer",
                            borderRadius: "8px",
                            overflow: "hidden"
                          }}
                          onClick={() => setPreviewModel(model)}
                        >
                          <img 
                            src={model.url} 
                            alt={model.name}
                            style={{
                              width: "100%",
                              height: "240px",
                              objectFit: "cover",
                              display: "block"
                            }}
                          />
                        </div>
                        <BlockStack gap="100">
                          <Text variant="bodySm" fontWeight="semibold">
                            {model.name}
                          </Text>
                          <Badge tone={model.gender === "male" ? "info" : "magic"}>
                            {model.gender === "male" ? "Male" : "Female"}
                          </Badge>
                        </BlockStack>
                      </BlockStack>
                    </Card>
                  ))}
                </InlineGrid>
              </BlockStack>
            </Card>

            {customModels.length > 0 && (
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h2">
                      Your Custom Models ({customModels.length})
                    </Text>
                    <Badge>Custom</Badge>
                  </InlineStack>

                  <InlineGrid columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} gap="400">
                    {customModels.map((model) => (
                      <Card key={model.id}>
                        <BlockStack gap="200">
                          <div style={{ position: "relative" }}>
                            <img 
                              src={model.url} 
                              alt={model.name}
                              style={{
                                width: "100%",
                                height: "240px",
                                objectFit: "cover",
                                display: "block",
                                borderRadius: "8px"
                              }}
                            />
                            <div style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px"
                            }}>
                              <Button
                                size="slim"
                                tone="critical"
                                onClick={() => handleDelete(model.id, model.cloudinaryId)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          <Text variant="bodySm" fontWeight="semibold">
                            {model.name}
                          </Text>
                        </BlockStack>
                      </Card>
                    ))}
                  </InlineGrid>
                </BlockStack>
              </Card>
            )}
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">
                    ℹ️ About Models
                  </Text>
                  <Text variant="bodySm">
                    Use default professional models or upload your own branded model images.
                  </Text>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">
                    📸 Image Guidelines
                  </Text>
                  <BlockStack gap="100">
                    <Text variant="bodySm">• Clean white/gray background</Text>
                    <Text variant="bodySm">• Model facing forward</Text>
                    <Text variant="bodySm">• Full body or upper body</Text>
                    <Text variant="bodySm">• Neutral pose</Text>
                    <Text variant="bodySm">• Min. 600x900px resolution</Text>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>

      {/* Upload Modal */}
      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Custom Model"
        primaryAction={{
          content: uploading ? "Uploading..." : "Upload",
          onAction: handleUpload,
          disabled: !selectedFile || uploading,
          loading: uploading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowUploadModal(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <DropZone
              accept="image/*"
              type="image"
              onDrop={handleFileDrop}
              allowMultiple={false}
            >
              {selectedFile ? (
                <BlockStack gap="200">
                  <Text variant="bodySm" alignment="center">
                    {selectedFile.name}
                  </Text>
                  <Text variant="bodySm" tone="subdued" alignment="center">
                    Click to change
                  </Text>
                </BlockStack>
              ) : (
                <DropZone.FileUpload actionTitle="Upload image" />
              )}
            </DropZone>

            <Text variant="bodySm" tone="subdued">
              Upload a professional model photo with clean background for best results.
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>

      {/* Preview Modal */}
      {previewModel && (
        <Modal
          open={!!previewModel}
          onClose={() => setPreviewModel(null)}
          title={previewModel.name}
        >
          <Modal.Section>
            <img 
              src={previewModel.url} 
              alt={previewModel.name}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: "8px"
              }}
            />
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}