import { useState } from "react";
import { useLoaderData, useActionData, useSubmit } from "react-router";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Button,
  Thumbnail,
  InlineStack,
  Badge,
  Banner,
  Modal,
  DropZone,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// Default model görselleri (senin gönderdiğin görseller)
const DEFAULT_MODELS = [
  {
    id: "model-1",
    name: "Model 1 - Male White T-Shirt",
    url: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&h=600&fit=crop",
    type: "default",
    gender: "male"
  },
  {
    id: "model-2",
    name: "Model 2 - Male Gray T-Shirt",
    url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=600&fit=crop",
    type: "default",
    gender: "male"
  },
  {
    id: "model-3",
    name: "Model 3 - Male Black Tank Top",
    url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=600&fit=crop",
    type: "default",
    gender: "male"
  },
  {
    id: "model-4",
    name: "Model 4 - Male White Round Neck",
    url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=600&fit=crop",
    type: "default",
    gender: "male"
  },
  {
    id: "model-5",
    name: "Model 5 - Male Gray Tank Top",
    url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=600&fit=crop",
    type: "default",
    gender: "male"
  },
  {
    id: "model-6",
    name: "Model 6 - Female White T-Shirt",
    url: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=600&fit=crop",
    type: "default",
    gender: "female"
  },
  {
    id: "model-7",
    name: "Model 7 - Female Navy Sports Bra",
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
    type: "default",
    gender: "female"
  },
  {
    id: "model-8",
    name: "Model 8 - Female Beige Sports Set",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
    type: "default",
    gender: "female"
  },
  {
    id: "model-9",
    name: "Model 9 - Female Black Sports Bra",
    url: "https://images.unsplash.com/photo-1518644961665-ed172691aaa1?w=400&h=600&fit=crop",
    type: "default",
    gender: "female"
  },
  {
    id: "model-10",
    name: "Model 10 - Female White Sports Bra",
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
    type: "default",
    gender: "female"
  }
];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // TODO: Database'den custom modelleri çek
  const customModels = [];
  
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
  
  if (actionType === "upload") {
    // TODO: Custom model upload işlemi
    return { success: true, message: "Model uploaded successfully!" };
  }
  
  if (actionType === "delete") {
    // TODO: Custom model silme işlemi
    const modelId = formData.get("modelId");
    return { success: true, message: "Model deleted successfully!" };
  }
  
  return { error: "Invalid action" };
};

export default function Models() {
  const { defaultModels, customModels } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewModel, setPreviewModel] = useState(null);

  const handleFileUpload = (files) => {
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("action", "upload");
    // TODO: Dosya upload işlemi
    submit(formData, { method: "post" });
    setShowUploadModal(false);
  };

  const handleDelete = (modelId) => {
    if (confirm("Are you sure you want to delete this model?")) {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("modelId", modelId);
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
            {/* Default Models */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h2">
                    Default Models ({defaultModels.length})
                  </Text>
                  <Badge tone="info">Built-in</Badge>
                </InlineStack>

                <Text variant="bodySm" tone="subdued">
                  These professional model images are ready to use for virtual try-on. Click on any model to preview.
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

            {/* Custom Models */}
            {customModels.length > 0 && (
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h2">
                      Custom Models ({customModels.length})
                    </Text>
                    <Badge>Your uploads</Badge>
                  </InlineStack>

                  <InlineGrid columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} gap="400">
                    {customModels.map((model) => (
                      <Card key={model.id}>
                        <BlockStack gap="200">
                          <div 
                            style={{ 
                              cursor: "pointer",
                              borderRadius: "8px",
                              overflow: "hidden",
                              position: "relative"
                            }}
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
                            <div style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px"
                            }}>
                              <Button
                                size="slim"
                                variant="primary"
                                tone="critical"
                                onClick={() => handleDelete(model.id)}
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
              {/* Info Card */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">
                    ℹ️ About Models
                  </Text>
                  <BlockStack gap="200">
                    <Text variant="bodySm">
                      <strong>Default Models:</strong> Professional photos optimized for virtual try-on.
                    </Text>
                    <Text variant="bodySm">
                      <strong>Custom Models:</strong> Upload your own model images for branded experience.
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>

              {/* Guidelines */}
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
          content: "Upload",
          onAction: handleUpload,
          disabled: selectedFiles.length === 0,
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
            <Text variant="bodyMd">
              Upload your own model images for a branded virtual try-on experience.
            </Text>

            <DropZone
              accept="image/*"
              type="image"
              onDrop={handleFileUpload}
            >
              {selectedFiles.length > 0 ? (
                <BlockStack gap="200">
                  <Text variant="bodySm" alignment="center">
                    {selectedFiles.length} file(s) selected
                  </Text>
                </BlockStack>
              ) : (
                <DropZone.FileUpload actionTitle="Choose files" />
              )}
            </DropZone>
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