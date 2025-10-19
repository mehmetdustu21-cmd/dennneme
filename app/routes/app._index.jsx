import { useState } from "react";
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
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState(50);
  
  // Gerçek kullanım verisi (şimdilik simüle)
  const usageData = {
    totalGenerations: 15,
    cacheHitRate: 40.0,
    cached: 6,
    uncached: 9,
    creditsUsed: 16,
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
                    <Badge tone="success">{usageData.currentPlan}</Badge>
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
                        {creditsRemaining} / {usageData.creditsTotal}
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
                    tone={creditsPercentage > 80 ? "critical" : creditsPercentage > 60 ? "caution" : "primary"}
                  />

                  {isLowCredits && (
                    <Banner tone="warning">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon source={AlertTriangleIcon} tone="base" />
                        <Text variant="bodySm">
                          You're running low on credits! Buy more or upgrade your plan.
                        </Text>
                      </InlineStack>
                    </Banner>
                  )}

                  <Text variant="bodySm" tone="subdued">
                    Free plan includes "Powered by" branding.
                  </Text>

                  <InlineStack gap="300">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate("/app/plans")}
                    >
                      View plans
                    </Button>
                    <Button onClick={() => setShowBuyCreditsModal(true)}>
                      Buy More Credits
                    </Button>
                  </InlineStack>
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

      {/* Buy Credits Modal */}
      <Modal
        open={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
        title="Buy Additional Credits"
        primaryAction={{
          content: `Buy ${selectedCredits} Credits for ${currentPrice}`,
          onAction: () => {
            // TODO: Ödeme işlemi
            alert(`Purchasing ${selectedCredits} credits for ${currentPrice}`);
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
                    <Text variant="bodySm" fontWeight="bold" tone="success">$0.08/credit 🎉</Text>
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