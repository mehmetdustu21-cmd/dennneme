// Privacy Policy Page (GDPR Compliant)
import { Page, Card, Text, BlockStack, List } from "@shopify/polaris";

export default function Privacy() {
  return (
    <Page title="Privacy Policy">
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Privacy Policy for Virtual Try-On</Text>
            <Text variant="bodySm" tone="subdued">Last Updated: {new Date().toLocaleDateString()}</Text>

            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">1. Information We Collect</Text>
              <Text variant="bodyMd">
                When you use Virtual Try-On, we collect and process the following information:
              </Text>
              <List type="bullet">
                <List.Item>Store information (shop domain, contact email)</List.Item>
                <List.Item>Product images that you select for virtual try-on generation</List.Item>
                <List.Item>Model images (default or custom uploaded images)</List.Item>
                <List.Item>Generated virtual try-on images</List.Item>
                <List.Item>Usage statistics (generation count, timestamps)</List.Item>
                <List.Item>Billing and subscription information</List.Item>
              </List>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">2. How We Use Your Information</Text>
              <Text variant="bodyMd">We use your information to:</Text>
              <List type="bullet">
                <List.Item>Generate virtual try-on images using AI technology</List.Item>
                <List.Item>Store and manage your custom model images</List.Item>
                <List.Item>Process payments and manage subscriptions</List.Item>
                <List.Item>Provide customer support</List.Item>
                <List.Item>Improve our service and develop new features</List.Item>
                <List.Item>Comply with legal obligations</List.Item>
              </List>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">3. Data Storage and Security</Text>
              <Text variant="bodyMd">
                We store your data securely using industry-standard encryption:
              </Text>
              <List type="bullet">
                <List.Item>Images are stored on Cloudinary with secure HTTPS access</List.Item>
                <List.Item>Database is hosted on secure cloud infrastructure</List.Item>
                <List.Item>All API communications use TLS/SSL encryption</List.Item>
                <List.Item>Access to data is restricted to authorized personnel only</List.Item>
              </List>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">4. Third-Party Services</Text>
              <Text variant="bodyMd">We use the following third-party services:</Text>
              <List type="bullet">
                <List.Item><Text variant="bodyMd" fontWeight="semibold">Fal.ai</Text> - AI image generation</List.Item>
                <List.Item><Text variant="bodyMd" fontWeight="semibold">Cloudinary</Text> - Image storage and optimization</List.Item>
                <List.Item><Text variant="bodyMd" fontWeight="semibold">Shopify</Text> - E-commerce platform and payments</List.Item>
              </List>
              <Text variant="bodyMd">
                Each service has its own privacy policy. We ensure all third parties comply with GDPR and data protection regulations.
              </Text>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">5. Your Rights (GDPR)</Text>
              <Text variant="bodyMd">You have the right to:</Text>
              <List type="bullet">
                <List.Item><Text variant="bodyMd" fontWeight="semibold">Access:</Text> Request a copy of your personal data</List.Item>
                <List.Item><Text variant="bodyMd" fontWeight="semibold">Rectification:</Text> Correct inaccurate data</List.Item>
                <List.Item><Text variant="bodyMd" fontWeight="semibold">Erasure:</Text> Request deletion of your data ("right to be forgotten")</List.Item>
                <List.Item><Text variant="bodyMd" fontWeight="semibold">Portability:</Text> Receive your data in a portable format</List.Item>
                <List.Item><Text variant="bodyMd" fontWeight="semibold">Objection:</Text> Object to processing of your data</List.Item>
              </List>
              <Text variant="bodyMd">
                To exercise these rights, please contact us at the support email below.
              </Text>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">6. Data Retention</Text>
              <Text variant="bodyMd">
                We retain your data as long as your Shopify store is active and using our app. 
                When you uninstall the app:
              </Text>
              <List type="bullet">
                <List.Item>Shop data is deleted within 48 hours (via shop/redact webhook)</List.Item>
                <List.Item>All associated images are removed from our storage</List.Item>
                <List.Item>Billing records may be retained for legal/accounting purposes (7 years)</List.Item>
              </List>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">7. Children's Privacy</Text>
              <Text variant="bodyMd">
                Our service is not directed to individuals under 18 years of age. 
                We do not knowingly collect personal information from children.
              </Text>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">8. Changes to This Policy</Text>
              <Text variant="bodyMd">
                We may update this privacy policy from time to time. We will notify you of any 
                significant changes via email or through the app interface.
              </Text>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">9. Contact Us</Text>
              <Text variant="bodyMd">
                If you have any questions about this Privacy Policy or wish to exercise your rights:
              </Text>
              <List type="bullet">
                <List.Item>Email: privacy@virtual-tryon.app</List.Item>
                <List.Item>Support: support@virtual-tryon.app</List.Item>
              </List>
            </BlockStack>

            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">10. GDPR Compliance</Text>
              <Text variant="bodyMd">
                We are fully compliant with the General Data Protection Regulation (GDPR). 
                Our legal basis for processing your data is:
              </Text>
              <List type="bullet">
                <List.Item><Text variant="bodyMd" fontWeight="semibold">Contract:</Text> To provide the virtual try-on service</List.Item>
                <List.Item><Text variant="bodyMd" fontWeight="semibold">Legitimate Interest:</Text> To improve our service and prevent fraud</List.Item>
                <List.Item><Text variant="bodyMd" fontWeight="semibold">Legal Obligation:</Text> To comply with tax and accounting laws</List.Item>
              </List>
            </BlockStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

