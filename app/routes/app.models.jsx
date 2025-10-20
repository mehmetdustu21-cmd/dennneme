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

// Default model görselleri (public/models/ klasöründen)
const DEFAULT_MODELS = [
  {
    id: "male-1",
    name: "Michael",
    url: "/models/male-1.png",
    gender: "male"
  },
  {
    id: "male-2",
    name: "James",
    url: "/models/male-2.png",
    gender: "male"
  },
  {
    id: "male-3",
    name: "David",
    url: "/models/male-3.png",
    gender: "male"
  },
  {
    id: "male-4",
    name: "Ryan",
    url: "/models/male-4.png",
    gender: "male"
  },
  {
    id: "male-5",
    name: "Alex",
    url: "/models/male-5.png",
    gender: "male"
  },
  {
    id: "female-1",
    name: "Emma",
    url: "/models/female-1.png",
    gender: "female"
  },
  {
    id: "female-2",
    name: "Sophia",
    url: "/models/female-2.png",
    gender: "female"
  },
  {
    id: "female-3",
    name: "Olivia",
    url: "/models/female-3.png",
    gender: "female"
  },
  {
    id: "female-4",
    name: "Isabella",
    url: "/models/female-4.png",
    gender: "female"
  },
  {
    id: "female-5",
    name: "Ava",
    url: "/models/female-5.png",
    gender: "female"
  }
];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // Import server functions HERE (inside loader)
  const { getCustomModels } = await import("../models/custom-model.server");
  
  const customModels = await getCustomModels(session.shop);
  
  return {
    shop: session.shop,
    defaultModels: DEFAULT_MODELS,
    customModels,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("action");
  
  // Import server functions HERE (inside action)
  const { uploadCustomModel, deleteCustomModel } = await import("../models/custom-model.server");
  
  if (actionType === "upload") {
    const imageBase64 = formData.get("image");
    const modelName = formData.get("name");
    const gender = formData.get("gender");
    
    if (!imageBase64) {
      return { error: "No image provided" };
    }
    
    try {
      await uploadCustomModel({
        shop: session.shop,
        imageBase64,
        name: modelName,
        gender,
      });
      
      return { 
        success: true, 
        message: "Model uploaded successfully!"
      };
    } catch (error) {
      return { error: error.message };
    }
  }
  
  if (actionType === "delete") {
    const modelId = formData.get("modelId");
    const cloudinaryId = formData.get("cloudinaryId");
    
    try {
      await deleteCustomModel(modelId, cloudinaryId);
      return { success: true, message: "Model deleted successfully!" };
    } catch (error) {
      return { error: error.message };
    }
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