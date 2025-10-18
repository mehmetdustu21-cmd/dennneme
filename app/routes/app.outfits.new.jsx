import { json } from "@react-router/node";
import { useLoaderData, useNavigate } from "react-router";
import {
  Page,
  Layout,
  Card,
  Button,
  EmptyState,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  const outfits = await db.outfit.findMany({
    where: { shop: session.shop },
    include: {
      products: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return json({ outfits });
};

export default function Outfits() {
  const { outfits } = useLoaderData();
  const navigate = useNavigate();

  if (outfits.length === 0) {
    return (
      <Page title="Kombinler">
        <Layout>
          <Layout.Section>
            <Card>
              <EmptyState
                heading="Henüz kombin oluşturmadınız"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                action={{
                  content: "İlk Kombini Oluştur",
                  onAction: () => navigate("/app/outfits/new"),
                }}
              >
                <p>
                  Kombinler oluşturarak müşterilerinize tamamlayıcı ürünleri gösterin
                  ve satışlarınızı artırın.
                </p>
              </EmptyState>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Kombinler"
      primaryAction={{
        content: "Yeni Kombin",
        onAction: () => navigate("/app/outfits/new"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <ResourceList
              resourceName={{ singular: "kombin", plural: "kombinler" }}
              items={outfits}
              renderItem={(outfit) => {
                const { id, name, description, products, active, createdAt } = outfit;
                const productCount = products.length;

                return (
                  <ResourceItem
                    id={id}
                    onClick={() => navigate(`/app/outfits/${id}`)}
                    accessibilityLabel={`${name} kombinine git`}
                  >
                    <BlockStack gap="200">
                      <InlineStack align="space-between" blockAlign="start">
                        <BlockStack gap="100">
                          <InlineStack gap="200" blockAlign="center">
                            <Text variant="headingMd" as="h3">
                              {name}
                            </Text>
                            <Badge tone={active ? "success" : "default"}>
                              {active ? "Aktif" : "Pasif"}
                            </Badge>
                          </InlineStack>
                          
                          {description && (
                            <Text variant="bodySm" tone="subdued">
                              {description}
                            </Text>
                          )}
                          
                          <Text variant="bodySm" tone="subdued">
                            {productCount} ürün • Oluşturulma: {new Date(createdAt).toLocaleDateString("tr-TR")}
                          </Text>
                        </BlockStack>

                        <Button variant="plain">Düzenle</Button>
                      </InlineStack>
                    </BlockStack>
                  </ResourceItem>
                );
              }}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}