import { useState } from "react";
import { Page, Layout, Card, Text, Button, BlockStack, InlineStack, Badge, Icon, List, Banner } from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";

export default function Plans() {
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      name: "Pay-as-you-go",
      price: billingCycle === "monthly" ? "0" : "0",
      credits: "Pay per use",
      description: "Perfect for testing and occasional use",
      popular: false,
      features: [
        "$0.50 per generation",
        "No monthly commitment",
        "Basic support",
        "Standard processing speed",
        "Powered by branding",
        "Community access"
      ],
      buttonText: "Current Plan",
      buttonVariant: "plain",
      disabled: true
    },
    {
      name: "Basic",
      price: billingCycle === "monthly" ? "29" : "290",
      credits: "100 credits/month",
      description: "Great for small stores getting started",
      popular: false,
      features: [
        "100 generations per month",
        "$0.25 per extra generation",
        "Email support",
        "Priority processing",
        "Remove branding",
        "Basic analytics",
        "Custom models (3)"
      ],
      buttonText: "Upgrade to Basic",
      buttonVariant: "primary"
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? "79" : "790",
      credits: "500 credits/month",
      description: "Best for growing businesses",
      popular: true,
      features: [
        "500 generations per month",
        "$0.15 per extra generation",
        "Priority email & chat support",
        "Fastest processing",
        "Remove branding",
        "Advanced analytics",
        "Custom models (unlimited)",
        "API access",
        "Bulk operations"
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "primary"
    },
    {
      name: "Enterprise",
      price: "Custom",
      credits: "Unlimited",
      description: "For high-volume stores with custom needs",
      popular: false,
      features: [
        "Unlimited generations",
        "Dedicated account manager",
        "24/7 phone & chat support",
        "Maximum processing speed",
        "White-label solution",
        "Custom integration",
        "Custom models (unlimited)",
        "Advanced API access",
        "SLA guarantee",
        "Custom contract terms"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "primary"
    }
  ];

  const savings = Math.round(((parseFloat(plans[1].price) * 12 - parseFloat(plans[1].price.replace('290', '290'))) / (parseFloat(plans[1].price) * 12)) * 100);

  return (
    <Page 
      title="Subscription Plans"
      backAction={{ url: "/app" }}
    >
      <BlockStack gap="500">
        {/* Billing Toggle */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="center" blockAlign="center">
                  <InlineStack gap="300" blockAlign="center">
                    <Button
                      pressed={billingCycle === "monthly"}
                      onClick={() => setBillingCycle("monthly")}
                    >
                      Monthly
                    </Button>
                    <Button
                      pressed={billingCycle === "yearly"}
                      onClick={() => setBillingCycle("yearly")}
                    >
                      Yearly
                    </Button>
                    {billingCycle === "yearly" && (
                      <Badge tone="success">Save 17%</Badge>
                    )}
                  </InlineStack>
                </InlineStack>

                <Banner tone="info">
                  <Text variant="bodyMd">
                    All plans include a 14-day free trial. No credit card required.
                  </Text>
                </Banner>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Pricing Cards */}
        <Layout>
          {plans.map((plan, index) => (
            <Layout.Section key={index} variant={plans.length === 4 ? "oneThird" : "oneHalf"}>
              <Card>
                <BlockStack gap="400">
                  {/* Header */}
                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text variant="headingLg" as="h2">
                        {plan.name}
                      </Text>
                      {plan.popular && (
                        <Badge tone="success">Most Popular</Badge>
                      )}
                    </InlineStack>

                    <Text variant="bodySm" tone="subdued">
                      {plan.description}
                    </Text>
                  </BlockStack>

                  {/* Price */}
                  <BlockStack gap="100">
                    <InlineStack gap="100" blockAlign="end">
                      {plan.price === "Custom" ? (
                        <Text variant="heading2xl" as="h3">
                          Custom
                        </Text>
                      ) : (
                        <>
                          <Text variant="heading2xl" as="h3">
                            ${plan.price}
                          </Text>
                          <Text variant="bodyLg" tone="subdued">
                            /{billingCycle === "monthly" ? "mo" : "yr"}
                          </Text>
                        </>
                      )}
                    </InlineStack>
                    <Text variant="bodySm" tone="subdued">
                      {plan.credits}
                    </Text>
                  </BlockStack>

                  {/* CTA Button */}
                  <Button
                    variant={plan.buttonVariant}
                    size="large"
                    fullWidth
                    disabled={plan.disabled}
                  >
                    {plan.buttonText}
                  </Button>

                  {/* Features */}
                  <BlockStack gap="200">
                    <Text variant="bodyMd" fontWeight="semibold">
                      What's included:
                    </Text>
                    <BlockStack gap="200">
                      {plan.features.map((feature, idx) => (
                        <InlineStack key={idx} gap="200" blockAlign="start">
                          <div style={{ 
                            minWidth: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Icon source={CheckIcon} tone="success" />
                          </div>
                          <Text variant="bodySm">
                            {feature}
                          </Text>
                        </InlineStack>
                      ))}
                    </BlockStack>
                  </BlockStack>
                </BlockStack>
              </Card>
            </Layout.Section>
          ))}
        </Layout>

        {/* FAQ */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Frequently Asked Questions
                </Text>

                <BlockStack gap="300">
                  <BlockStack gap="100">
                    <Text variant="bodyMd" fontWeight="semibold">
                      What happens when I run out of credits?
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      You can purchase additional credits at your plan's overage rate, or upgrade to a higher plan for better rates and more included credits.
                    </Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text variant="bodyMd" fontWeight="semibold">
                      Can I change plans anytime?
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference.
                    </Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text variant="bodyMd" fontWeight="semibold">
                      Do unused credits roll over?
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      For Basic and Pro plans, unused credits do not roll over. Enterprise plans can include custom rollover terms.
                    </Text>
                  </BlockStack>

                  <BlockStack gap="100">
                    <Text variant="bodyMd" fontWeight="semibold">
                      What payment methods do you accept?
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      We accept all major credit cards (Visa, MasterCard, American Express) and payments through your Shopify account.
                    </Text>
                  </BlockStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Enterprise CTA */}
        <Layout>
          <Layout.Section>
            <Card>
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h2">
                    Need a custom solution?
                  </Text>
                  <Text variant="bodySm" tone="subdued">
                    Contact our sales team for enterprise pricing and custom features.
                  </Text>
                </BlockStack>
                <Button variant="primary" size="large">
                  Contact Sales
                </Button>
              </InlineStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}