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
  EmptyState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// Default model görselleri
const DEFAULT_MODELS = [
  { id: "male-1", name: "Michael", url: "/models/male-1.png", gender: "male" },
  { id: "male-2", name: "James", url: "/models/male-2.png", gender: "male" },
  { id: "male-3", name: "David", url: "/models/male-3.png", gender: "male" },
  { id: "male-4", name: "Ryan", url: "/models/male-4.png", gender: "male" },
  { id: "male-5", name: "Alex", url: "/models/male-5.png", gender: "male" },
  { id: "female-1", name: "Emma", url: "/models/female-1.png", gender: "female" },
  { id: "female-2", name: "Sophia", url: "/models/female-2.png", gender: "female" },
  { id: "female-3", name: "Olivia", url: "/models/female-3.png", gender: "female" },
  { id: "female-4", name: "Isabella", url: "/models/female-4.png", gender: "female" },
  { id: "female-5", name: "Ava", url: "/models/female-5.png", gender: "female" }
];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
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
  const { uploadCustomModel, deleteCustomModel } = await import("../models/custom-model.server");
  
  if (actionType === "upload") {
    const imageBase64 = formData.get("image");
    if (!imageBase64) return { error: "No image provided" };
    
    try {
      await uploadCustomModel({
        shop: session.shop,
        imageBase64,
        name: formData.get("name"),
        gender: formData.get("gender"),
      });
      return { success: true, message: "Model uploaded successfully!" };
    } catch (error) {
      return { error: error.message };
    }
  }
  
  if (actionType === "delete") {
    try {
      await deleteCustomModel(formData.get("modelId"), formData.get("cloudinaryId"));
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
  const [previewModel, setPreviewModel] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileDrop = useCallback((files) => {
    if (files.length > 0) setSelectedFile(files[0]);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const formData = new FormData();
      formData.append("action", "upload");
      formData.append("image", reader.result);
      formData.append("name", "Custom Model");
      formData.append("gender", "male");
      submit(formData, { method: "post" });
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploading(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDelete = (modelId, cloudinaryId) => {
    if (confirm("Delete this model?")) {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("modelId", modelId);
      formData.append("cloudinaryId", cloudinaryId);
      submit(formData, { method: "post" });
    }
  };

  const allModels = [...defaultModels, ...customModels.map(m => ({ ...m, isCustom: true }))];

  return (
    <Page
      title="Models"
      subtitle={`${allModels.length} professional model images`}
      backAction={{ url: "/app" }}
      primaryAction={{
        content: "Upload Custom Model",
        onAction: () => setShowUploadModal(true),
      }}
    >
      <TitleBar title="Model Images" />

      <BlockStack gap="400">
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

        {allModels.length === 0 ? (
          <Card>
            <EmptyState
              heading="No models available"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Upload custom model images to get started.</p>
            </EmptyState>
          </Card>
        ) : (
          <Layout>
            <Layout.Section>
              <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
                {allModels.map((model) => (
                  <Card key={model.id} padding="0">
                    <div 
                      style={{ 
                        position: "relative",
                        cursor: "pointer",
                        overflow: "hidden",
                        background: "#f6f6f7",
                      }}
                      onClick={() => setPreviewModel(model)}
                    >
                      <img 
                        src={model.url} 
                        alt={model.name}
                        style={{
                          width: "100%",
                          height: "400px",
                          objectFit: "cover",
                          display: "block"
                        }}
                      />
                      {model.isCustom && (
                        <div style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px"
                        }}>
                          <Button
                            size="slim"
                            tone="critical"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(model.id, model.cloudinaryId);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ padding: "16px" }}>
                      <BlockStack gap="300">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text variant="headingSm" as="h3" fontWeight="semibold">
                            {model.name}
                          </Text>
                          <Badge tone={model.gender === "male" ? "info" : "magic"}>
                            {model.gender === "male" ? "Male" : "Female"}
                          </Badge>
                        </InlineStack>
                        
                        <Button 
                          fullWidth 
                          variant="primary"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = model.url;
                            link.download = `${model.name}.png`;
                            link.click();
                          }}
                        >
                          Download
                        </Button>
                      </BlockStack>
                    </div>
                  </Card>
                ))}
              </InlineGrid>
            </Layout.Section>
          </Layout>
        )}
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
        secondaryActions={[{
          content: "Cancel",
          onAction: () => setShowUploadModal(false),
        }]}
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
                <Text variant="bodySm" alignment="center">
                  {selectedFile.name}
                </Text>
              ) : (
                <DropZone.FileUpload />
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
                display: "block"
              }}
            />
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}