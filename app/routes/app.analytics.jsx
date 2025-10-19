import { Page, Card, Text, BlockStack } from "@shopify/polaris";

export default function Analytics() {
  return (
    <Page 
      title="Analytics"
      backAction={{ url: "/app" }}
    >
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">
            Detailed Analytics
          </Text>
          <Text variant="bodyMd" tone="subdued">
            Detaylı kullanım analizi yakında eklenecek.
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}