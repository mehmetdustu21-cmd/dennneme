import { useState, useCallback, useEffect } from "react";
import { useLoaderData, useActionData, useNavigation } from "react-router";
import { 
  Page, 
  Card, 
  Text, 
  BlockStack, 
  InlineStack,
  Button,
  ColorPicker,
  Select,
  RangeSlider,
  Checkbox,
  Divider,
  Banner,
  Box
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // Load theme settings for this shop
  let themeSettings = await prisma.themeSettings.findUnique({
    where: { shop: session.shop }
  });
  
  // If no settings exist, create default ones
  if (!themeSettings) {
    themeSettings = await prisma.themeSettings.create({
      data: {
        shop: session.shop,
        primaryColor: "#000000",
        secondaryColor: "#ffffff",
        backgroundColor: "#f9f9f9",
        borderColor: "#e5e5e5",
        borderRadius: 4,
        showBorder: true,
        backgroundType: "white",
        fontSize: 14
      }
    });
  }
  
  return { themeSettings };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const themeData = {
    primaryColor: formData.get("primaryColor") || "#000000",
    secondaryColor: formData.get("secondaryColor") || "#ffffff",
    backgroundColor: formData.get("backgroundColor") || "#f9f9f9",
    borderColor: formData.get("borderColor") || "#e5e5e5",
    borderRadius: parseInt(formData.get("borderRadius")) || 4,
    showBorder: formData.get("showBorder") === "true",
    backgroundType: formData.get("backgroundType") || "white",
    fontSize: parseInt(formData.get("fontSize")) || 14
  };
  
  try {
    await prisma.themeSettings.upsert({
      where: { shop: session.shop },
      update: themeData,
      create: {
        shop: session.shop,
        ...themeData
      }
    });
    
    return { success: true, message: "Tema ayarları başarıyla kaydedildi!" };
  } catch (error) {
    console.error("Error saving theme settings:", error);
    return { success: false, message: "Tema ayarları kaydedilemedi" };
  }
};

export default function Theme() {
  const { themeSettings } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  
  const [primaryColor, setPrimaryColor] = useState(themeSettings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(themeSettings.secondaryColor);
  const [backgroundColor, setBackgroundColor] = useState(themeSettings.backgroundColor);
  const [borderColor, setBorderColor] = useState(themeSettings.borderColor);
  const [borderRadius, setBorderRadius] = useState(themeSettings.borderRadius);
  const [showBorder, setShowBorder] = useState(themeSettings.showBorder);
  const [backgroundType, setBackgroundType] = useState(themeSettings.backgroundType);
  const [fontSize, setFontSize] = useState(themeSettings.fontSize);
  
  const isSaving = navigation.state === "submitting";
  const showSuccess = actionData?.success;

  const backgroundTypeOptions = [
    { label: "Transparent", value: "transparent" },
    { label: "White", value: "white" },
    { label: "Theme Color", value: "theme_color" },
    { label: "Custom Color", value: "custom" }
  ];

  const handleReset = useCallback(() => {
    setPrimaryColor(themeSettings.primaryColor);
    setSecondaryColor(themeSettings.secondaryColor);
    setBackgroundColor(themeSettings.backgroundColor);
    setBorderColor(themeSettings.borderColor);
    setBorderRadius(themeSettings.borderRadius);
    setShowBorder(themeSettings.showBorder);
    setBackgroundType(themeSettings.backgroundType);
    setFontSize(themeSettings.fontSize);
  }, [themeSettings]);

  return (
    <form method="post">
      <Page 
        title="Tema Ayarları"
        backAction={{ url: "/app" }}
        primaryAction={{
          content: "Değişiklikleri Kaydet",
          submit: true,
          loading: isSaving
        }}
        secondaryActions={[
          {
            content: "Kaydedilene Sıfırla",
            onAction: handleReset
          }
        ]}
      >
        <input type="hidden" name="primaryColor" value={primaryColor} />
        <input type="hidden" name="secondaryColor" value={secondaryColor} />
        <input type="hidden" name="backgroundColor" value={backgroundColor} />
        <input type="hidden" name="borderColor" value={borderColor} />
        <input type="hidden" name="borderRadius" value={borderRadius} />
        <input type="hidden" name="showBorder" value={showBorder} />
        <input type="hidden" name="backgroundType" value={backgroundType} />
        <input type="hidden" name="fontSize" value={fontSize} />
        
        <BlockStack gap="500">
          {showSuccess && (
            <Banner
              title={actionData?.message || "Tema ayarları başarıyla kaydedildi!"}
              status="success"
            />
          )}
          
          {actionData?.success === false && (
            <Banner
              title={actionData?.message || "Tema ayarları kaydedilemedi"}
              status="critical"
            />
          )}

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Renk Ayarları
            </Text>
            
            <BlockStack gap="400">
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" as="p">
                  Ana Renk
                </Text>
                <ColorPicker
                  color={primaryColor}
                  onChange={setPrimaryColor}
                />
              </BlockStack>
              
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" as="p">
                  İkincil Renk
                </Text>
                <ColorPicker
                  color={secondaryColor}
                  onChange={setSecondaryColor}
                />
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" as="p">
                  Arka Plan Rengi
                </Text>
                <ColorPicker
                  color={backgroundColor}
                  onChange={setBackgroundColor}
                />
              </BlockStack>
              
              <BlockStack gap="200">
                <Text variant="bodyMd" fontWeight="medium" as="p">
                  Kenarlık Rengi
                </Text>
                <ColorPicker
                  color={borderColor}
                  onChange={setBorderColor}
                />
              </BlockStack>
            </BlockStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Düzen Ayarları
            </Text>
            
            <Select
              label="Arka Plan Tipi"
              options={[
                { label: "Şeffaf", value: "transparent" },
                { label: "Beyaz", value: "white" },
                { label: "Tema Rengi", value: "theme_color" },
                { label: "Özel Renk", value: "custom" }
              ]}
              value={backgroundType}
              onChange={setBackgroundType}
            />

            <RangeSlider
              label="Kenarlık Yuvarlaklığı"
              value={borderRadius}
              onChange={setBorderRadius}
              min={0}
              max={20}
              step={1}
              suffix="px"
            />

            <RangeSlider
              label="Yazı Boyutu"
              value={fontSize}
              onChange={setFontSize}
              min={10}
              max={20}
              step={1}
              suffix="px"
            />

            <Checkbox
              label="Kenarlık Göster"
              checked={showBorder}
              onChange={setShowBorder}
            />
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Canlı Önizleme
            </Text>
            <Text variant="bodyMd" tone="subdued" as="p">
              Tema ayarlarınızın virtual try-on widget'ında nasıl görüneceğini önizleyin:
            </Text>
            
            <Box
              padding="400"
              background={backgroundType === "transparent" ? "transparent" : 
                        backgroundType === "white" ? "bg-surface" : 
                        backgroundType === "theme_color" ? "bg-surface-secondary" : 
                        backgroundColor}
              borderWidth={showBorder ? "025" : "0"}
              borderColor={borderColor}
              borderRadius={borderRadius}
            >
              <BlockStack gap="300">
                <Text variant="headingSm" as="h3" color={primaryColor}>
                  Virtual Try-On Widget
                </Text>
                <Text variant="bodyMd" as="p" color={secondaryColor}>
                  Bu, mevcut tema ayarlarınızla widget'ınızın nasıl görüneceğidir.
                </Text>
                <Button 
                  size="medium" 
                  variant="primary"
                  style={{ 
                    backgroundColor: primaryColor,
                    color: secondaryColor,
                    borderRadius: `${borderRadius}px`
                  }}
                >
                  Önizleme Oluştur
                </Button>
              </BlockStack>
            </Box>
          </BlockStack>
        </Card>
        </BlockStack>
      </Page>
    </form>
  );
}