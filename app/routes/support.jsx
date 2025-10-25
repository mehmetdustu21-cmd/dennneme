// Support Page
import { Page, Card, Text, BlockStack, List, InlineStack, Button, Banner } from "@shopify/polaris";

export default function Support() {
  return (
    <Page title="Support & Help">
      <BlockStack gap="400">
        <Banner tone="info">
          <Text variant="bodyMd">
            Need help? We're here for you! Check out our FAQ below or contact us directly.
          </Text>
        </Banner>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">📧 Contact Us</Text>
            <BlockStack gap="300">
              <InlineStack gap="200" align="start">
                <Text variant="bodyMd" fontWeight="semibold">Support Email:</Text>
                <Button
                  variant="plain"
                  url="mailto:support@virtual-tryon.app"
                  external
                >
                  support@virtual-tryon.app
                </Button>
              </InlineStack>
              <InlineStack gap="200" align="start">
                <Text variant="bodyMd" fontWeight="semibold">Response Time:</Text>
                <Text variant="bodyMd">Within 24 hours (usually faster)</Text>
              </InlineStack>
            </BlockStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">❓ Frequently Asked Questions</Text>

            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">How does Virtual Try-On work?</Text>
                <Text variant="bodyMd">
                  Virtual Try-On uses advanced AI technology to superimpose your clothing products 
                  onto model images. Simply select a product from your store, choose a model 
                  (or upload your own), and we'll generate a realistic try-on image in seconds.
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">How many credits do I get?</Text>
                <Text variant="bodyMd">
                  Free plan includes 25 credits. Each virtual try-on generation uses 1 credit. 
                  You can purchase additional credits anytime or upgrade to a subscription plan 
                  for better rates.
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">What image formats are supported?</Text>
                <Text variant="bodyMd">
                  We support JPG, PNG, and WebP formats. For best results, use high-quality 
                  images with clear product visibility. Recommended resolution: 800x1200 pixels 
                  or higher.
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">Can I use my own model photos?</Text>
                <Text variant="bodyMd">
                  Yes! You can upload custom model images from the Models page. We provide 
                  10 default professional models, but you can add your own for more personalized 
                  results.
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">How do I add the try-on button to my product pages?</Text>
                <Text variant="bodyMd">
                  Go to the Dashboard and click "Setup Widget". This will open your theme editor 
                  where you can activate the Virtual Try-On extension. You can customize its 
                  appearance in Theme Settings.
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">What happens to my data if I uninstall?</Text>
                <Text variant="bodyMd">
                  We take data privacy seriously. Within 48 hours of uninstalling, all your shop 
                  data, generated images, and custom models are permanently deleted from our 
                  servers (GDPR compliant).
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">Do credits expire?</Text>
                <Text variant="bodyMd">
                  No! Purchased credits never expire. You can use them whenever you need them.
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">What's the difference between cached and uncached generations?</Text>
                <Text variant="bodyMd">
                  If you generate the same product-model combination, we serve the cached result 
                  instantly and free! This saves you credits and time. New combinations require 
                  AI processing and use 1 credit.
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">Can I get a refund?</Text>
                <Text variant="bodyMd">
                  We offer a 7-day money-back guarantee for subscription plans. If you're not 
                  satisfied with the service, contact us for a full refund. Credit purchases are 
                  generally non-refundable unless there's a technical issue.
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">Is there an API available?</Text>
                <Text variant="bodyMd">
                  Enterprise plans include API access for bulk processing and custom integrations. 
                  Contact us for more details.
                </Text>
              </BlockStack>
            </BlockStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">🐛 Report a Bug</Text>
            <Text variant="bodyMd">
              Found a bug or experiencing technical issues? Please email us with:
            </Text>
            <List type="bullet">
              <List.Item>Detailed description of the issue</List.Item>
              <List.Item>Steps to reproduce</List.Item>
              <List.Item>Screenshots (if applicable)</List.Item>
              <List.Item>Your shop domain</List.Item>
            </List>
            <Button
              variant="primary"
              url="mailto:support@virtual-tryon.app?subject=Bug%20Report"
              external
            >
              Report Bug
            </Button>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">💡 Feature Request</Text>
            <Text variant="bodyMd">
              Have an idea for a new feature? We'd love to hear from you! Send your suggestions to:
            </Text>
            <Button
              variant="secondary"
              url="mailto:support@virtual-tryon.app?subject=Feature%20Request"
              external
            >
              Suggest a Feature
            </Button>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">📚 Additional Resources</Text>
            <List type="bullet">
              <List.Item>
                <Button variant="plain" url="/app/analytics">Analytics & Usage</Button> - 
                Track your generations and performance
              </List.Item>
              <List.Item>
                <Button variant="plain" url="/app/theme">Theme Settings</Button> - 
                Customize widget appearance
              </List.Item>
              <List.Item>
                <Button variant="plain" url="/app/models">Model Management</Button> - 
                Upload and manage model images
              </List.Item>
              <List.Item>
                <Button variant="plain" url="/privacy">Privacy Policy</Button> - 
                How we handle your data
              </List.Item>
            </List>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

