import { useState, useCallback } from "react";
import { useActionData, useSubmit, useLoaderData } from "react-router";
import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  Banner,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Text,
  BlockStack,
  InlineStack,
  Checkbox,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    
    const response = await admin.graphql(
      `#graphql
      query getProducts {
        products(first: 50) {
          edges {
            node {
              id
              title
              featuredImage {
                url
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                  }
                }
              }
              productType
            }
          }
        }
      }`
    );

    const result = await response.json();
    
    if (result.errors) {
      return { shop: session.shop, products: [], error: "GraphQL hatası" };
    }

    const products = result.data?.products?.edges?.map(edge => ({
      id: edge.node.id.split("/").pop(),
      fullId: edge.node.id,
      title: edge.node.title,
      image: edge.node.featuredImage?.url || "",
      price: edge.node.variants.edges[0]?.node.price || "0",
      category: edge.node.productType || "Genel"
    })) || [];

    return { shop: session.shop, products };
  } catch (error) {
    return { shop: "unknown", products: [], error: error.message };
  }
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const name = formData.get("name");
  const description = formData.get("description");
  const products = JSON.parse(formData.get("products"));

  if (!name || products.length === 0) {
    return { error: "Kombin adı ve en az 1 ürün gerekli!" };
  }

  try {
    const outfit = await db.outfit.create({
      data: {
        shop: session.shop,
        name,
        description,
        mainProductId: products[0].id,
        active: true,
        products: {
          create: products.map((product) => ({
            productId: product.id,
            productTitle: product.title,
            productImage: product.image || "",
            productPrice: product.price || "0",
            category: product.category || "Genel",
          })),
        },
      },
    });

    return { success: true, outfit };
  } catch (error) {
    return { error: "Kombin kaydedilemedi: " + error.message };
  }
};

export default function NewOutfit() {
  const actionData = useActionData();
  const loaderData = useLoaderData();
  const submit = useSubmit();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Hata varsa göster
  if (loaderData?.error) {
    return (
      <Page title="Hata">
        <Banner tone="critical">
          Ürünler yüklenemedi: {loaderData.error}
        </Banner>
      </Page>
    );
  }

  const { shop, products } = loaderData;

  // Arama filtresi
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleProduct = useCallback((product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("products", JSON.stringify(selectedProducts));
    submit(formData, { method: "post" });
  }, [name, description, selectedProducts, submit]);

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  return (
    <Page
      title="Yeni Kombin Oluştur"
      backAction={{ url: "/app/outfits" }}
      primaryAction={{
        content: "Kombini Kaydet",
        onAction: handleSubmit,
        disabled: !name || selectedProducts.length === 0,
      }}
    >
      <Layout>
        {actionData?.error && (
          <Layout.Section>
            <Banner tone="critical">{actionData.error}</Banner>
          </Layout.Section>
        )}

        {actionData?.success && (
          <Layout.Section>
            <Banner tone="success">Kombin başarıyla oluşturuldu! ✅</Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <TextField
                label="Kombin Adı"
                value={name}
                onChange={setName}
                placeholder="Örn: Yaz Kombinleri"
                autoComplete="off"
              />
              
              <TextField
                label="Açıklama (Opsiyonel)"
                value={description}
                onChange={setDescription}
                placeholder="Bu kombin hakkında kısa bir açıklama"
                multiline={3}
                autoComplete="off"
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Seçilen Ürünler ({selectedProducts.length})
              </Text>

              {selectedProducts.length === 0 ? (
                <Banner>
                  Aşağıdan kombine eklemek için ürün seçin.
                </Banner>
              ) : (
                <ResourceList
                  resourceName={{ singular: "ürün", plural: "ürünler" }}
                  items={selectedProducts}
                  renderItem={(product) => {
                    const { id, title, image, price } = product;
                    return (
                      <ResourceItem
                        id={id}
                        media={
                          <Thumbnail
                            source={image || "https://via.placeholder.com/50"}
                            alt={title}
                          />
                        }
                      >
                        <InlineStack align="space-between">
                          <BlockStack gap="100">
                            <Text variant="bodyMd" fontWeight="bold">
                              {title}
                            </Text>
                            <Text variant="bodySm" tone="subdued">
                              {price} TL
                            </Text>
                          </BlockStack>
                          <Button
                            destructive
                            onClick={() => removeProduct(id)}
                          >
                            Kaldır
                          </Button>
                        </InlineStack>
                      </ResourceItem>
                    );
                  }}
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Mağazadaki Ürünler ({products.length})
              </Text>

              <TextField
                label="Ürün Ara"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Ürün adı yazın..."
                autoComplete="off"
                clearButton
                onClearButtonClick={() => setSearchQuery("")}
              />

              {products.length === 0 ? (
                <Banner>
                  Mağazanızda hiç ürün yok. Önce Shopify'da ürün oluşturun.
                </Banner>
              ) : filteredProducts.length === 0 ? (
                <Banner>Arama sonucu bulunamadı.</Banner>
              ) : (
                <ResourceList
                  resourceName={{ singular: "ürün", plural: "ürünler" }}
                  items={filteredProducts}
                  renderItem={(product) => {
                    const { id, title, image, price } = product;
                    const isSelected = selectedProducts.some(p => p.id === id);
                    
                    return (
                      <ResourceItem
                        id={id}
                        media={
                          <Thumbnail
                            source={image || "https://via.placeholder.com/50"}
                            alt={title}
                          />
                        }
                        onClick={() => toggleProduct(product)}
                      >
                        <InlineStack align="space-between">
                          <BlockStack gap="100">
                            <Text variant="bodyMd" fontWeight="bold">
                              {title}
                            </Text>
                            <Text variant="bodySm" tone="subdued">
                              {price} TL
                            </Text>
                          </BlockStack>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleProduct(product)}
                          />
                        </InlineStack>
                      </ResourceItem>
                    );
                  }}
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}