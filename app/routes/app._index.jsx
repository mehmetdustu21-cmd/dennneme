import { useState, useCallback } from "react";
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
  Modal,
  Banner,
} from "@shopify/polaris";
import {
  CheckIcon,
  ImageIcon,
  SettingsIcon,
  ChartVerticalIcon,
  AlertTriangleIcon
} from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { getShopWithStats } = await import("../models/shop.server");

    // Get real shop data and statistics
    const shopData = await getShopWithStats(session.shop);

    let themeExtensionActive = false;
    let productPageUrl = "/products/example";
    let themeId = "";
    
    try {
      // Get theme and product info
      const response = await admin.graphql(
        `#graphql
        query {
          themes(first: 1, query: "role:main") {
            edges {
              node {
                id
                name
              }
            }
          }
          products(first: 1) {
            edges {
              node {
                id
                handle
                variants(first: 1) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }`
      );

      const result = await response.json();
      
      if (result.data?.themes?.edges[0]) {
        const fullThemeId = result.data.themes.edges[0].node.id;
        themeId = fullThemeId.split('/').pop();
      }

      if (result.data?.products?.edges[0]) {
        const product = result.data.products.edges[0].node;
        const variantId = product.variants.edges[0]?.node.id.split('/').pop();
        productPageUrl = `/products/${product.handle}?variant=${variantId}`;
      }
    } catch (graphqlError) {
      console.error("GraphQL query failed:", graphqlError);
    }

    return {
      shop: session.shop,
      shopData,
      themeExtensionActive,
      productPageUrl,
      themeId,
    };
  } catch (error) {
    console.error("Loader error:", error);
    return {
      shop: "unknown",
      shopData: null,
      themeExtensionActive: true,
      productPageUrl: "/products/example",
      themeId: "",
    };
  }
};

export default function Index() {
  const navigate = useNavigate();
  const { shop, shopData, themeExtensionActive, productPageUrl, themeId } = useLoaderData();
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState(50);

  // Shop ismini çıkar (smart-try-on.myshopify.com -> smart-try-on)
  const shopName = shop.replace('.myshopify.com', '');
  
  // Extension UID (shopify.extension.toml'den)
  const extensionId = "ab3be2da-2fa1-6dcc-7d46-ef7ff8612ad35323609c";
  
  // Otomatik kurulum fonksiyonu - BASİT VERSİYON
  const handleSetupWidget = useCallback(() => {
    const editorUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor?context=apps&template=product&activateAppId=${extensionId}/virtual-try-on-button`;
    
    console.log('🚀 Opening theme editor:', editorUrl);
    window.open(editorUrl, '_blank');
  }, [shopName, extensionId]);

  // Real usage data from database
  const usageData = shopData ? {
    totalGenerations: shopData.stats.totalGenerations,
    cacheHitRate: shopData.stats.cacheHitRate,
    cached: Math.round(shopData.stats.totalGenerations * shopData.stats.cacheHitRate / 100),
    uncached: shopData.stats.totalGenerations - Math.round(shopData.stats.totalGenerations * shopData.stats.cacheHitRate / 100),
    creditsUsed: shopData.stats.creditsUsed,
    creditsTotal: shopData.stats.creditsRemaining + shopData.stats.creditsUsed,
    currentPlan: shopData.shop.plan === "free" ? "Free Plan" : shopData.shop.plan.charAt(0).toUpperCase() + shopData.shop.plan.slice(1) + " Plan"
  } : {
    totalGenerations: 0,
    cacheHitRate: 0,
    cached: 0,
    uncached: 0,
    creditsUsed: 0,
    creditsTotal: 25,
    currentPlan: "Free Plan"
  };

  const creditsPercentage = (usageData.creditsUsed / usageData.creditsTotal) * 100;
  const creditsRemaining = usageData.creditsTotal - usageData.creditsUsed;
  const isLowCredits = creditsRemaining <= 5;

  // Dinamik fiyatlandırma (toplu alımda indirim)
  const calculatePrice = (credits) => {
    let pricePerCredit;
    if (credits >= 5000) pricePerCredit = 0.08; // 8 cent
    else if (credits >= 2000) pricePerCredit = 0.10; // 10 cent
    else if (credits >= 1000) pricePerCredit = 0.12; // 12 cent
    else if (credits >= 500) pricePerCredit = 0.15; // 15 cent
    else if (credits >= 200) pricePerCredit = 0.18; // 18 cent
    else if (credits >= 100) pricePerCredit = 0.20; // 20 cent
    else if (credits >= 50) pricePerCredit = 0.25; // 25 cent
    else pricePerCredit = 0.30; // 30 cent

    return (credits * pricePerCredit).toFixed(2);
  };

  const currentPrice = calculatePrice(selectedCredits);
  const pricePerCredit = (currentPrice / selectedCredits).toFixed(3);

  // İndirim oranı hesaplama
  const basePrice = selectedCredits * 0.30; // Normal fiyat (30 cent/credit)
  const discount = ((basePrice - currentPrice) / basePrice * 100).toFixed(0);

  return (
    <Page>
      <TitleBar title="Dashboard" />

      <BlockStack gap="400">
        {/* 1. Ürün Seçme Kartı */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="200" blockAlign="center">
              <div style={{
                width: '48px',
                height: '48px',
                background: '#3B82F6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon source={ImageIcon} tone="base" />
              </div>
              <Text variant="headingLg" as="h2">
                Ürün Seçin
              </Text>
              <Text variant="bodyMd" tone="subdued" alignment="center">
                Virtual try-on için bir ürün seçin
              </Text>
            </BlockStack>

            <Button 
              variant="primary" 
              size="large"
              onClick={() => navigate("/app/generate")}
            >
              Ürün Seç
            </Button>
          </BlockStack>
        </Card>

        {/* 2. Model Seçme Kartı */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="200" blockAlign="center">
              <div style={{
                width: '48px',
                height: '48px',
                background: '#10B981',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon source={ImageIcon} tone="base" />
              </div>
              <Text variant="headingLg" as="h2">
                Model Seçin
              </Text>
              <Text variant="bodyMd" tone="subdued" alignment="center">
                Hangi model üzerinde deneme yapmak istiyorsunuz?
              </Text>
            </BlockStack>

            <Button 
              variant="secondary" 
              size="large"
              onClick={() => navigate("/app/models")}
            >
              Model Yönet
            </Button>
          </BlockStack>
        </Card>

        {/* 3. Sonuç Kartı */}
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="200" blockAlign="center">
              <div style={{
                width: '48px',
                height: '48px',
                background: '#8B5CF6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon source={ImageIcon} tone="base" />
              </div>
              <Text variant="headingLg" as="h2">
                Sonuçları Görün
              </Text>
              <Text variant="bodyMd" tone="subdued" alignment="center">
                Virtual try-on sonuçlarınızı burada görebilirsiniz
              </Text>
            </BlockStack>

            <Button 
              variant="secondary" 
              size="large"
              onClick={() => navigate("/app/generate")}
            >
              Sonuçları Gör
            </Button>
          </BlockStack>
        </Card>

        {/* Alt Bilgi Kartları */}
        <BlockStack gap="300">
          {/* Abonelik Durumu */}
          <Card>
            <BlockStack gap="300">
              <BlockStack gap="200" blockAlign="center">
                <Text variant="headingMd" as="h3">
                  Abonelik Durumu
                </Text>
                <Badge tone="success">{usageData.currentPlan}</Badge>
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="bodySm" tone="subdued">
                  Kalan Krediler
                </Text>
                <Text variant="headingLg" as="h3">
                  {creditsRemaining} / {usageData.creditsTotal}
                </Text>
              </BlockStack>

              <ProgressBar
                progress={creditsPercentage}
                tone={creditsPercentage > 80 ? "critical" : creditsPercentage > 60 ? "caution" : "primary"}
              />

              {isLowCredits && (
                <Banner tone="warning">
                  <BlockStack gap="200">
                    <Icon source={AlertTriangleIcon} tone="base" />
                    <Text variant="bodySm">
                      Kredileriniz azalıyor! Daha fazla kredi satın alın.
                    </Text>
                  </BlockStack>
                </Banner>
              )}

              <BlockStack gap="200">
                <Button
                  variant="primary"
                  onClick={() => navigate("/app/plans")}
                >
                  Planları Gör
                </Button>
                <Button onClick={() => setShowBuyCreditsModal(true)}>
                  Kredi Satın Al
                </Button>
              </BlockStack>
            </BlockStack>
          </Card>

          {/* Hızlı İstatistikler */}
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h3" alignment="center">
                📊 Son 7 Gün
              </Text>
              
              <BlockStack gap="200">
                <BlockStack gap="100">
                  <Text variant="bodySm" tone="subdued">
                    Toplam Üretim
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
              </BlockStack>

              <Button variant="plain" onClick={() => navigate("/app/analytics")}>
                Detayları Gör
              </Button>
            </BlockStack>
          </Card>
        </BlockStack>
      </BlockStack>

      {/* Buy Credits Modal */}
      <Modal
        open={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
        title="Buy Additional Credits"
        primaryAction={{
          content: `Buy ${selectedCredits} Credits for $${currentPrice}`,
          onAction: () => {
            // TODO: Ödeme işlemi
            alert(`Purchasing ${selectedCredits} credits for $${currentPrice}`);
            setShowBuyCreditsModal(false);
          },
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setShowBuyCreditsModal(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="500">
            <Text variant="bodyMd">
              Purchase additional credits for your account. Credits never expire.
            </Text>

            {/* Credit Selector */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingLg" as="h3">
                    {selectedCredits.toLocaleString()} Credits
                  </Text>
                  <Text variant="heading2xl" as="h2">
                    ${currentPrice}
                  </Text>
                </InlineStack>

                <Text variant="bodySm" tone="subdued">
                  ${pricePerCredit} per credit
                  {discount > 0 && ` • Save ${discount}%`}
                </Text>

                {/* Slider */}
                <div style={{ padding: '20px 0' }}>
                  <input
                    type="range"
                    min="10"
                    max="10000"
                    step="10"
                    value={selectedCredits}
                    onChange={(e) => setSelectedCredits(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px',
                      background: `linear-gradient(to right, #4ADE80 0%, #4ADE80 ${(selectedCredits / 10000) * 100}%, #E5E7EB ${(selectedCredits / 10000) * 100}%, #E5E7EB 100%)`,
                      outline: 'none',
                      cursor: 'pointer',
                      WebkitAppearance: 'none',
                      appearance: 'none'
                    }}
                  />
                  <style>{`
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #4ADE80;
                      cursor: pointer;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    input[type="range"]::-moz-range-thumb {
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #4ADE80;
                      cursor: pointer;
                      border: none;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                  `}</style>
                </div>

                <InlineStack align="space-between">
                  <Text variant="bodySm" tone="subdued">10 credits</Text>
                  <Text variant="bodySm" tone="subdued">10,000 credits</Text>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Quick Select Buttons */}
            <BlockStack gap="200">
              <Text variant="bodyMd" fontWeight="semibold">
                Quick Select:
              </Text>
              <InlineStack gap="200" wrap>
                {[50, 100, 500, 1000, 2000, 5000, 10000].map((amount) => (
                  <Button
                    key={amount}
                    size="slim"
                    onClick={() => setSelectedCredits(amount)}
                    variant={selectedCredits === amount ? "primary" : "secondary"}
                  >
                    {amount.toLocaleString()}
                  </Button>
                ))}
              </InlineStack>
            </BlockStack>

            {/* Pricing Tiers */}
            <Card>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h3">
                  💰 Volume Discounts
                </Text>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="bodySm">10-49 credits</Text>
                    <Text variant="bodySm" fontWeight="semibold">$0.30/credit</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodySm">50-99 credits</Text>
                    <Text variant="bodySm" fontWeight="semibold">$0.25/credit</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodySm">100-199 credits</Text>
                    <Text variant="bodySm" fontWeight="semibold">$0.20/credit</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodySm">200-499 credits</Text>
                    <Text variant="bodySm" fontWeight="semibold">$0.18/credit</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodySm">500-999 credits</Text>
                    <Text variant="bodySm" fontWeight="semibold">$0.15/credit</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodySm">1,000-1,999 credits</Text>
                    <Text variant="bodySm" fontWeight="semibold">$0.12/credit</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodySm">2,000-4,999 credits</Text>
                    <Text variant="bodySm" fontWeight="semibold">$0.10/credit</Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text variant="bodySm" fontWeight="bold">5,000+ credits</Text>
                    <Text variant="bodySm" fontWeight="bold" tone="success">$0.08/credit 🔥</Text>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>

            <Banner tone="info">
              <Text variant="bodySm">
                Want even better rates? Check out our <Button variant="plain" onClick={() => {
                  setShowBuyCreditsModal(false);
                  navigate("/app/plans");
                }}>subscription plans</Button> for monthly credits and additional features.
              </Text>
            </Banner>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}