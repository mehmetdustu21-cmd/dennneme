import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Banner,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// Loader
export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  const stats = {
    totalTryOns: 0,
    thisMonth: 0,
    creditsRemaining: 100,
    plan: "Free"
  };
  
  return json({
    shop: session.shop,
    stats: stats
  });
};

// Main Component
export default function Index() {
  const { shop, stats } = useLoaderData();

  return (
    <Page>
      <TitleBar title="Virtual Try-On Dashboard" />
      <BlockStack gap="500">
        
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingLg">
                  👋 Hoş Geldiniz!
                </Text>
                <Text variant="bodyMd" as="p">
                  Virtual Try-On ile müşterileriniz ürünleri sanal olarak deneyebilir.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">Toplam Try-On</Text>
                <Text as="p" variant="headingXl">{stats.totalTryOns}</Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">Bu Ay</Text>
                <Text as="p" variant="headingXl">{stats.thisMonth}</Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">Kalan Kredi</Text>
                <Text as="p" variant="headingXl">{stats.creditsRemaining}</Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

      </BlockStack>
    </Page>
  );
}