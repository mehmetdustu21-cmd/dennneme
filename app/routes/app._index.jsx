import { useEffect } from "react";
import { useFetcher, useNavigate, useLoaderData } from "react-router";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  ProgressBar,
  Icon,
} from "@shopify/polaris";
import { 
  CheckIcon,
  ImageIcon,
  SettingsIcon,
  ChartVerticalIcon
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // Aktif kombin sayısı
  const outfitCount = await db.outfit.count({
    where: { shop: session.shop, active: true }
  });

  // Toplam ürün sayısı
  const totalProducts = await db.outfitProduct.count({
    where: {
      outfit: {
        shop: session.shop
      }
    }
  });

  // Toplam kombin sayısı
  const totalOutfits = await db.outfit.count({
    where: { shop: session.shop }
  });

  return { 
    shop: session.shop,
    outfitCount,
    totalProducts,
    totalOutfits
  };
};

export default function Index() {
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  
  // Simüle edilmiş kullanım verisi
  const usageData = {
    totalGenerations: 15,
    cacheHitRate: 40.0,
    cached: 6,
    uncached: 9,
    creditsUsed: 16,
    creditsTotal: 25,
  };

  const creditsPercentage = (usageData.creditsUsed / usageData.creditsTotal) * 100;

  return (
    <Page>
      <TitleBar title="Dashboard" />
      
      <BlockStack gap="500">
        <Layout>
          {/* Sol Kolon - Ana İçerik */}
          <Layout.Section>
            <BlockStack gap="400">
              {/* Abonelik Durumu */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h2">
                      Subscription status
                    </Text>
                    <Badge tone="success">Free Plan</Badge>
                  </InlineStack>

                  <Text variant="bodySm" tone="subdued">
                    Your current plan and usage
                  </Text>

                  <InlineStack gap="800" blockAlign="start">
                    <BlockStack gap="200">
                      <Text variant="bodySm" tone="subdued">
                        Credits remaining
                      </Text>
                      <Text variant="headingLg" as="h3">
                        {usageData.creditsUsed} / {usageData.creditsTotal}
                      </Text>
                    </BlockStack>

                    <BlockStack gap="200">
                      <Text variant="bodySm" tone="subdued">
                        Billing cycle
                      </Text>
                      <Text variant="bodyMd">
                        Ends Nov 16, 2025
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <ProgressBar 
                    progress={creditsPercentage} 
                    tone={creditsPercentage > 80 ? "critical" : "primary"}
                  />

                  <Text variant="bodySm" tone="subdued">
                    Free plan includes "Powered by" branding.
                  </Text>

                  <Button variant="primary" onClick={() => navigate("/app/plans")}>
                    View plans
                  </Button>
                </BlockStack>
              </Card>

              {/* Kullanım İstatistikleri */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingMd" as="h2">
                      Usage Analytics (Last 7 Days)
                    </Text>
                    <Button variant="plain" onClick={() => navigate("/app/analytics")}>
                      View Details
                    </Button>
                  </InlineStack>

                  <InlineStack gap="800" blockAlign="start">
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">
                        Total Generations
                      </Text>
                      <Text variant="headingLg" as="h3">
                        {usageData.totalGenerations}
                      </Text>
                    </BlockStack>

                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">
                        Cache Hit Rate
                      </Text>
                      <Text variant="headingLg" as="h3">
                        {usageData.cacheHitRate}%
                      </Text>
                    </BlockStack>

                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">
                        Cached
                      </Text>
                      <Text variant="headingLg" as="h3">
                        {usageData.cached}
                      </Text>
                    </BlockStack>

                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">
                        Uncached
                      </Text>
                      <Text variant="headingLg" as="h3">
                        {usageData.uncached}
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <div style={{ 
                    height: '200px', 
                    background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon source={ChartVerticalIcon} tone="base" />
                    <Text variant="bodyMd" tone="subdued">
                      Chart placeholder
                    </Text>
                  </div>
                </BlockStack>
              </Card>

              {/* Kombin Yönetimi */}
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    🎨 Outfit Management
                  </Text>

                  <InlineStack gap="400">
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">
                        Active Outfits
                      </Text>
                      <Text variant="headingLg" as="h3">
                        {loaderData.outfitCount}
                      </Text>
                    </BlockStack>

                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">
                        Total Outfits
                      </Text>
                      <Text variant="headingLg" as="h3">
                        {loaderData.totalOutfits}
                      </Text>
                    </BlockStack>

                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">
                        Products in Outfits
                      </Text>
                      <Text variant="headingLg" as="h3">
                        {loaderData.totalProducts}
                      </Text>
                    </BlockStack>
                  </InlineStack>

                  <InlineStack gap="300">
                    <Button 
                      variant="primary"
                      onClick={() => navigate("/app/outfits/new")}
                    >
                      Create New Outfit
                    </Button>
                    
                    <Button onClick={() => navigate("/app/outfits")}>
                      View All Outfits
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* Sağ Kolon - Ayarlar & Konfigürasyon */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              {/* Theme Extension */}
              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: '#4ADE80',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon source={CheckIcon} tone="base" />
                      </div>
                      <Text variant="headingSm" as="h3">
                        Theme extension
                      </Text>
                    </InlineStack>
                    <Badge tone="success">Active</Badge>
                  </InlineStack>

                  <Text variant="bodySm" tone="subdued">
                    The Virtual Try-On section is currently added to the product template.
                  </Text>

                  <Button onClick={() => navigate("/app/theme")}>
                    Manage
                  </Button>
                </BlockStack>
              </Card>

              {/* Models */}
              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: '#E0E7FF',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon source={ImageIcon} tone="base" />
                      </div>
                      <Text variant="headingSm" as="h3">
                        Models
                      </Text>
                    </InlineStack>
                    <Badge tone="info">10 active</Badge>
                  </InlineStack>

                  <Text variant="bodySm" tone="subdued">
                    Manage default and custom model images.
                  </Text>

                  <Button onClick={() => navigate("/app/models")}>
                    Manage
                  </Button>
                </BlockStack>
              </Card>

              {/* Settings */}
              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <InlineStack gap="200" blockAlign="center">
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: '#FEF3C7',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon source={SettingsIcon} tone="base" />
                      </div>
                      <Text variant="headingSm" as="h3">
                        Settings
                      </Text>
                    </InlineStack>
                    <Badge tone="success">Configured</Badge>
                  </InlineStack>

                  <Text variant="bodySm" tone="subdued">
                    Manage caching and app preferences.
                  </Text>

                  <Button onClick={() => navigate("/app/settings")}>
                    Manage
                  </Button>
                </BlockStack>
              </Card>

              {/* Quick Stats */}
              <Card>
                <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">
                    ⚡ Quick Stats
                  </Text>

                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text variant="bodySm" tone="subdued">
                        App Version
                      </Text>
                      <Text variant="bodySm" fontWeight="semibold">
                        v1.0.0
                      </Text>
                    </InlineStack>

                    <InlineStack align="space-between">
                      <Text variant="bodySm" tone="subdued">
                        Status
                      </Text>
                      <Badge tone="success">Active</Badge>
                    </InlineStack>

                    <InlineStack align="space-between">
                      <Text variant="bodySm" tone="subdued">
                        Last Updated
                      </Text>
                      <Text variant="bodySm">
                        {new Date().toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );