import { useEffect } from "react";
import { useFetcher, useNavigate } from "react-router";
return { outfits };
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  InlineStack,
  Banner,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // Kombinleri say
  const outfitCount = await db.outfit.count({
    where: { shop: session.shop, active: true }
  });

  return json({ 
    shop: session.shop,
    outfitCount 
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Kırmızı", "Mavi", "Yeşil", "Siyah"][
    Math.floor(Math.random() * 4)
  ];
  
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Tişört`,
        },
      },
    }
  );
  
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "299.90" }],
      },
    }
  );

  const variantResponseJson = await variantResponse.json();

  return json({
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  });
};

export default function Index() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const shopify = useAppBridge();
  const loaderData = fetcher.data || { outfitCount: 0 };
  
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
    
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    ""
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Test ürünü oluşturuldu!");
    }
  }, [productId, shopify]);
  
  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <Page>
      <TitleBar title="Virtual Try-On Dashboard" />
      
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    👋 Hoş Geldiniz!
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Virtual Try-On uygulamanıza hoş geldiniz. 
                    Müşterileriniz ürünlerinizi sanal olarak deneyebilir ve kombinler oluşturabilir.
                  </Text>
                </BlockStack>

                <Banner tone="info">
                  Kombin özelliği ile müşterileriniz tamamlayıcı ürünleri keşfedebilir 
                  ve tüm kombini tek tuşla sepete ekleyebilir! 🎯
                </Banner>
                
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">
                    🎨 Kombin Yönetimi
                  </Text>
                  
                  <InlineStack gap="300" align="start">
                    <Button 
                      variant="primary"
                      onClick={() => navigate("/app/outfits/new")}
                    >
                      ➕ Yeni Kombin Oluştur
                    </Button>
                    
                    <Button onClick={() => navigate("/app/outfits")}>
                      📋 Tüm Kombinleri Gör ({loaderData.outfitCount || 0})
                    </Button>
                  </InlineStack>
                </BlockStack>

                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="200"
                >
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd">
                      🧪 Test Modu
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Uygulamayı test etmek için örnek bir ürün oluşturun.
                    </Text>
                    
                    <InlineStack gap="300">
                      <Button loading={isLoading} onClick={generateProduct}>
                        Test Ürünü Oluştur
                      </Button>
                      {fetcher.data?.product && (
                        <Button
                          url={`shopify:admin/products/${productId}`}
                          target="_blank"
                          variant="plain"
                        >
                          Ürünü Görüntüle
                        </Button>
                      )}
                    </InlineStack>
                    
                    {fetcher.data?.product && (
                      <Box
                        padding="400"
                        background="bg-surface-success"
                        borderWidth="025"
                        borderRadius="200"
                        borderColor="border-success"
                      >
                        <Text as="p" variant="bodyMd">
                          ✅ Başarılı: {fetcher.data.product.title} oluşturuldu
                        </Text>
                      </Box>
                    )}
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    📊 İstatistikler
                  </Text>
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Aktif Kombin
                      </Text>
                      <Text as="span" variant="headingMd" fontWeight="bold">
                        {loaderData.outfitCount || 0}
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Try-On Sayısı
                      </Text>
                      <Text as="span" variant="headingMd" fontWeight="bold">
                        0
                      </Text>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Kalan Kredi
                      </Text>
                      <Text as="span" variant="headingMd" fontWeight="bold">
                        100
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    🚀 Hızlı Başlangıç
                  </Text>
                  <List>
                    <List.Item>
                      İlk kombinizi oluşturun
                    </List.Item>
                    <List.Item>
                      Ürün sayfalarında widget'ı test edin
                    </List.Item>
                    <List.Item>
                      fal.ai API anahtarınızı ekleyin
                    </List.Item>
                    <List.Item>
                      Tema ayarlarını yapılandırın
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    ℹ️ Bilgi
                  </Text>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Version: 1.0.0
                  </Text>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Status: Beta
                  </Text>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Hosting: Render.com
                  </Text>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}