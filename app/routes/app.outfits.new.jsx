import { useState, useCallback } from "react";
import { useActionData, useSubmit, useLoaderData } from "react-router";
import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  ResourcePicker,
  Banner,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Text,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  return { shop: session.shop };
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
  const { shop } = useLoaderData();
  const submit = useSubmit();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleProductSelection = useCallback((selection) => {
    const products = selection.map((product) => ({
      id: product.id.split("/").pop(),
      title: product.title,
      image: product.images[0]?.originalSrc || "",
      price: product.variants[0]?.price || "0",
      category: product.productType || "Genel",
    }));
    setSelectedProducts(products);
    setIsPickerOpen(false);
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
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h2">
                  Kombindeki Ürünler ({selectedProducts.length})
                </Text>
                <Button onClick={() => setIsPickerOpen(true)}>
                  Ürün Seç
                </Button>
              </InlineStack>

              {selectedProducts.length === 0 ? (
                <Banner>
                  Kombine eklemek için ürün seçin. En az 1 ürün gerekli.
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
                        accessibilityLabel={`${title} ürününü görüntüle`}
                      >
                        <InlineStack align="space-between">
                          <BlockStack gap="100">
                            <Text variant="bodyMd" fontWeight="bold">
                              {title}
                            </Text>
                            <Text variant="bodySm" tone="subdued">
                              Fiyat: {price} TL
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
      </Layout>

      <ResourcePicker
        resourceType="Product"
        open={isPickerOpen}
        onCancel={() => setIsPickerOpen(false)}
        onSelection={handleProductSelection}
        showVariants={false}
      />
    </Page>
  );
}