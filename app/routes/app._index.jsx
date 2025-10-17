import { useLoaderData } from "react-router";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Button,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// Loader
export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  // Simüle edilmiş veriler (gerçekte database'den gelecek)
  const stats = {
    totalGenerations: 11,
    thisMonth: 7,
    creditsRemaining: 18,
    creditsTotal: 25,
    plan: "Free Plan",
    billingCycle: "Nov 16, 2025",
    cacheHitRate: 36.4,
    cached: 4,
    uncached: 7,
    themeExtensionActive: true,
    modelsCount: 10,
    lastSevenDays: [
      { date: "Oct 10", cached: 0, uncached: 0 },
      { date: "Oct 11", cached: 0, uncached: 0 },
      { date: "Oct 12", cached: 1, uncached: 0 },
      { date: "Oct 13", cached: 0, uncached: 1 },
      { date: "Oct 14", cached: 1, uncached: 2 },
      { date: "Oct 15", cached: 0, uncached: 0 },
      { date: "Oct 16", cached: 2, uncached: 2 },
      { date: "Oct 17", cached: 0, uncached: 2 },
    ]
  };
  
  return {
    shop: session.shop,
    stats: stats
  };
};

// Main Component
export default function Index() {
  const { shop, stats } = useLoaderData();
  
  return (
    <Page>
      <TitleBar title="Virtual Try-On Dashboard" />
      
      <BlockStack gap="500">
        
        {/* Subscription Status */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <BlockStack gap="200">
                    <Text as="h2" variant="headingMd">
                      Abonelik Durumu
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Mevcut planınız ve kullanım
                    </Text>
                  </BlockStack>
                  <Text as="span" variant="bodyMd" fontWeight="bold" tone="info">
                    {stats.plan}
                  </Text>
                </InlineStack>

                <Box paddingBlockStart="200">
                  <InlineStack gap="800">
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Kalan Kredi
                      </Text>
                      <Box style={{background: '#e3f5e1', padding: '4px 8px', borderRadius: '4px', display: 'inline-block'}}>
                        <Text as="span" variant="bodySm" fontWeight="bold">
                          ✓ {stats.creditsRemaining}/{stats.creditsTotal} Kredi
                        </Text>
                      </Box>
                    </BlockStack>

                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Faturalandırma Döngüsü
                      </Text>
                      <Text as="h3" variant="headingMd">
                        {stats.billingCycle}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                </Box>

                <Box paddingBlockStart="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    Ücretsiz plan "Powered by" markası içerir.
                  </Text>
                </Box>

                <Button>Planları Görüntüle</Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Usage Analytics */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Kullanım Analitikleri (Son 7 Gün)
                  </Text>
                  <Button variant="plain">Detayları Görüntüle</Button>
                </InlineStack>

                <InlineStack gap="800">
                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Toplam Üretim
                    </Text>
                    <Text as="h3" variant="heading2xl">
                      {stats.totalGenerations}
                    </Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Cache Hit Rate
                    </Text>
                    <Text as="h3" variant="heading2xl">
                      {stats.cacheHitRate}%
                    </Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Önbellekli
                    </Text>
                    <Text as="h3" variant="heading2xl">
                      {stats.cached}
                    </Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Önbelleksiz
                    </Text>
                    <Text as="h3" variant="heading2xl">
                      {stats.uncached}
                    </Text>
                  </BlockStack>
                </InlineStack>

                <Box paddingBlockStart="400">
                  <Text as="p" variant="bodySm" tone="subdued">
                    📊 Grafik görünümü için Recharts kütüphanesi eklenecek
                  </Text>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Quick Actions */}
        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">
                    Tema Eklentisi
                  </Text>
                  <Text as="span" variant="bodyMd" fontWeight="bold" tone="success">
                    Aktif
                  </Text>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Virtual Try-On bölümü şu anda ürün şablonuna eklendi.
                </Text>
                <Button>Yönet</Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">
                    Modeller
                  </Text>
                  <Text as="span" variant="bodyMd" fontWeight="bold" tone="success">
                    {stats.modelsCount} aktif
                  </Text>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Varsayılan ve özel model görsellerini yönetin.
                </Text>
                <Button>Yönet</Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">
                    Ayarlar
                  </Text>
                  <Text as="span" variant="bodyMd" fontWeight="bold" tone="info">
                    Yapılandırıldı
                  </Text>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Önbelleğe alma ve uygulama tercihlerini yönetin.
                </Text>
                <Button>Yönet</Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

      </BlockStack>
    </Page>
  );
}