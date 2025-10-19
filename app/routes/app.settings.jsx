import { Page, Card, Text, BlockStack } from "@shopify/polaris";

export default function Settings() {
  return (
    <Page 
      title="Settings"
      backAction={{ url: "/app" }}
    >
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">
            App Settings
          </Text>
          <Text variant="bodyMd" tone="subdued">
            Uygulama ayarları yakında eklenecek.
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}