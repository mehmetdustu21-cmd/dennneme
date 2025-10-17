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

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  
  const stats = {
    totalGenerations: 11,
    thisMonth: 7,
    creditsRemaining: 18,
    creditsTotal: 25,
    plan: "Free Plan",
    billingDate: "16 Kasım 2025",
    cacheHitRate: "36.4%",
    cached: 4,
    uncached: 7,
    themeActive: true,
    modelsCount: 10,
    // Son 7 günlük veri
    weeklyData: [
      { day: "10 Eki", value: 0 },
      { day: "11 Eki", value: 0 },
      { day: "12 Eki", value: 1 },
      { day: "13 Eki", value: 1 },
      { day: "14 Eki", value: 3 },
      { day: "15 Eki", value: 0 },
      { day: "16 Eki", value: 4 },
      { day: "17 Eki", value: 2 },
    ]
  };
  
  return { shop: session.shop, stats };
};

export default function Dashboard() {
  const { stats } = useLoaderData();
  
  // Kredi yüzdesi
  const creditPercent = Math.round((stats.creditsRemaining / stats.creditsTotal) * 100);
  
  return (
    <Page>
      <TitleBar title="Virtual Try-On" />
      
      <BlockStack gap="500">
        
        {/* SUBSCRIPTION STATUS */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                
                {/* Header */}
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd" fontWeight="bold">
                      Abonelik Durumu
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Mevcut planınız ve kullanım bilgileri
                    </Text>
                  </BlockStack>
                  <div style={{
                    background: '#e3f2fd',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: '1px solid #90caf9'
                  }}>
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      {stats.plan}
                    </Text>
                  </div>
                </InlineStack>

                <Box paddingBlockStart="300" paddingBlockEnd="300">
                  <div style={{height: '1px', background: '#e0e0e0'}} />
                </Box>

                {/* Credits & Billing */}
                <Layout>
                  <Layout.Section variant="oneHalf">
                    <BlockStack gap="300">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Kalan Kredi
                      </Text>
                      <Text as="h3" variant="headingXl" fontWeight="bold">
                        {stats.creditsRemaining} / {stats.creditsTotal}
                      </Text>
                      
                      {/* Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${creditPercent}%`,
                          height: '100%',
                          background: creditPercent > 50 ? '#4caf50' : creditPercent > 20 ? '#ff9800' : '#f44336',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </BlockStack>
                  </Layout.Section>

                  <Layout.Section variant="oneHalf">
                    <BlockStack gap="300">
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Faturalandırma Döngüsü
                      </Text>
                      <Text as="h3" variant="headingMd" fontWeight="semibold">
                        Bitiş: {stats.billingDate}
                      </Text>
                    </BlockStack>
                  </Layout.Section>
                </Layout>

                <Divider />

                {/* Footer */}
                <BlockStack gap="200">
                  <Text as="p" variant="bodySm" tone="subdued">
                    ℹ️ Ücretsiz plan "Powered by Virtual Try-On" markası içerir.
                  </Text>
                  <Button size="large">Planları Görüntüle</Button>
                </BlockStack>

              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* USAGE ANALYTICS */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                
                {/* Header */}
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd" fontWeight="bold">
                    Kullanım Analitikleri (Son 7 Gün)
                  </Text>
                  <Button variant="plain" tone="critical">
                    Detayları Görüntüle →
                  </Button>
                </InlineStack>

                {/* Stats Grid */}
                <Layout>
                  <Layout.Section variant="oneQuarter">
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">Toplam Üretim</Text>
                      <Text variant="heading2xl" fontWeight="bold">{stats.totalGenerations}</Text>
                    </BlockStack>
                  </Layout.Section>

                  <Layout.Section variant="oneQuarter">
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">Cache Hit Rate</Text>
                      <Text variant="heading2xl" fontWeight="bold">{stats.cacheHitRate}</Text>
                    </BlockStack>
                  </Layout.Section>

                  <Layout.Section variant="oneQuarter">
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">Önbellekli</Text>
                      <Text variant="heading2xl" fontWeight="bold">{stats.cached}</Text>
                    </BlockStack>
                  </Layout.Section>

                  <Layout.Section variant="oneQuarter">
                    <BlockStack gap="100">
                      <Text variant="bodySm" tone="subdued">Önbelleksiz</Text>
                      <Text variant="heading2xl" fontWeight="bold">{stats.uncached}</Text>
                    </BlockStack>
                  </Layout.Section>
                </Layout>

                <Divider />

                {/* Simple Chart */}
                <BlockStack gap="200">
                  <Text variant="bodyMd" tone="subdued">Haftalık Aktivite</Text>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
                    {stats.weeklyData.map((item, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '100%',
                          height: `${item.value * 20}%`,
                          minHeight: item.value > 0 ? '8px' : '2px',
                          background: item.value > 0 ? '#5c6ac4' : '#e0e0e0',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease'
                        }} />
                        <Text variant="bodySm" tone="subdued">{item.day}</Text>
                      </div>
                    ))}
                  </div>
                </BlockStack>

              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* QUICK ACTIONS */}
        <Layout>
          
          {/* Theme Extension */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h3" variant="headingMd" fontWeight="semibold">
                    🎨 Tema Eklentisi
                  </Text>
                  <div style={{
                    background: '#e8f5e9',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #81c784'
                  }}>
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      ✓ Aktif
                    </Text>
                  </div>
                </InlineStack>

                <Text as="p" variant="bodySm" tone="subdued">
                  Virtual Try-On bölümü şu anda ürün şablonuna eklendi.
                </Text>

                <Button fullWidth>Yönet</Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Models */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h3" variant="headingMd" fontWeight="semibold">
                    👤 Modeller
                  </Text>
                  <div style={{
                    background: '#e8f5e9',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #81c784'
                  }}>
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      {stats.modelsCount} aktif
                    </Text>
                  </div>
                </InlineStack>

                <Text as="p" variant="bodySm" tone="subdued">
                  Varsayılan ve özel model görsellerini yönetin.
                </Text>

                <Button fullWidth>Yönet</Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Settings */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h3" variant="headingMd" fontWeight="semibold">
                    ⚙️ Ayarlar
                  </Text>
                  <div style={{
                    background: '#e3f2fd',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #90caf9'
                  }}>
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      Yapılandırıldı
                    </Text>
                  </div>
                </InlineStack>

                <Text as="p" variant="bodySm" tone="subdued">
                  Önbelleğe alma ve uygulama tercihlerini yönetin.
                </Text>

                <Button fullWidth>Yönet</Button>
              </BlockStack>
            </Card>
          </Layout.Section>

        </Layout>

      </BlockStack>
    </Page>
  );
}