import { Page, Card, Text, BlockStack } from "@shopify/polaris";

export default function Theme() {
  return (
    <Page 
      title="Theme Extension"
      backAction={{ url: "/app" }}
    >
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">
            Theme Settings
          </Text>
          <Text variant="bodyMd" tone="subdued">
            Widget tema ayarları yakında eklenecek.
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}