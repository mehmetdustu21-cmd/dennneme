import { Page, Card, Text, BlockStack } from "@shopify/polaris";

export default function Models() {
  return (
    <Page 
      title="Model Images"
      backAction={{ url: "/app" }}
    >
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">
            Model Management
          </Text>
          <Text variant="bodyMd" tone="subdued">
            Model fotoğrafları yönetimi yakında eklenecek.
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}