import { useLoaderData } from "react-router";
import { 
  Page, 
  Card, 
  Text, 
  BlockStack, 
  InlineGrid,
  InlineStack,
  Badge,
  DataTable,
  EmptyState,
  Box,
  Divider
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { getShopWithStats } = await import("../models/shop.server");
  
  const shopData = await getShopWithStats(session.shop);
  
  return {
    shop: session.shop,
    stats: shopData.stats,
    dailyStats: shopData.dailyStats,
    recentGenerations: shopData.recentGenerations,
  };
};

export default function Analytics() {
  const { stats, dailyStats, recentGenerations } = useLoaderData();

  // Prepare daily chart data
  const dailyChartData = Object.entries(dailyStats)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, data]) => {
      const dateObj = new Date(date);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      return [dayName, data.completed, data.failed, data.total];
    });

  // Prepare recent generations table
  const recentRows = recentGenerations.map(gen => {
    const date = new Date(gen.createdAt);
    const timeAgo = formatTimeAgo(date);
    
    return [
      <Badge tone={
        gen.status === 'completed' ? 'success' : 
        gen.status === 'failed' ? 'critical' : 
        gen.status === 'processing' ? 'attention' : 'info'
      }>
        {gen.status}
      </Badge>,
      gen.productId?.substring(0, 12) + '...' || 'N/A',
      timeAgo,
      `${gen.creditsUsed} credit${gen.creditsUsed !== 1 ? 's' : ''}`,
      gen.errorMessage ? (
        <Text variant="bodySm" tone="critical" truncate>
          {gen.errorMessage}
        </Text>
      ) : '—'
    ];
  });

  const successRate = stats.totalGenerations > 0 
    ? ((stats.completedGenerations / stats.totalGenerations) * 100).toFixed(1)
    : 0;

  return (
    <Page 
      title="Analytics & Usage"
      backAction={{ url: "/app" }}
    >
      <TitleBar title="Analytics" />

      <BlockStack gap="400">
        {/* Key Metrics */}
        <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Total Generations</Text>
              <Text variant="heading2xl" as="h3">{stats.totalGenerations}</Text>
              <Text variant="bodySm" tone="subdued">Last 30 days</Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Success Rate</Text>
              <Text variant="heading2xl" as="h3">{successRate}%</Text>
              <InlineStack gap="100">
                <Badge tone="success">{stats.completedGenerations} completed</Badge>
                <Badge tone="critical">{stats.failedGenerations} failed</Badge>
              </InlineStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Cache Hit Rate</Text>
              <Text variant="heading2xl" as="h3">{stats.cacheHitRate}%</Text>
              <Text variant="bodySm" tone="subdued">
                Saves ${(stats.cacheHitRate * 0.05 / 100).toFixed(2)} per generation
              </Text>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Credits Used</Text>
              <Text variant="heading2xl" as="h3">{stats.creditsUsed}</Text>
              <Text variant="bodySm" tone="subdued">
                {stats.creditsRemaining} remaining
              </Text>
            </BlockStack>
          </Card>
        </InlineGrid>

        {/* Daily Activity Chart */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">📈 Daily Activity (Last 7 Days)</Text>
            
            {dailyChartData.length > 0 && dailyChartData.some(([,,,total]) => total > 0) ? (
              <DataTable
                columnContentTypes={['text', 'numeric', 'numeric', 'numeric']}
                headings={['Date', 'Completed', 'Failed', 'Total']}
                rows={dailyChartData}
                totals={['Total', 
                  dailyChartData.reduce((sum, [,completed]) => sum + completed, 0),
                  dailyChartData.reduce((sum, [,,failed]) => sum + failed, 0),
                  dailyChartData.reduce((sum, [,,,total]) => sum + total, 0)
                ]}
              />
            ) : (
              <Box padding="400">
                <Text variant="bodyMd" tone="subdued" alignment="center">
                  No activity in the last 7 days
                </Text>
              </Box>
            )}
          </BlockStack>
        </Card>

        {/* Recent Generations */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">🕐 Recent Generations</Text>
            
            {recentRows.length > 0 ? (
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                headings={['Status', 'Product ID', 'Time', 'Credits', 'Error']}
                rows={recentRows}
              />
            ) : (
              <EmptyState
                heading="No generations yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Start generating virtual try-ons to see your activity here.</p>
              </EmptyState>
            )}
          </BlockStack>
        </Card>

        {/* Cost Analysis */}
        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">💰 Cost Analysis</Text>
            
            <InlineGrid columns={2} gap="400">
              <BlockStack gap="200">
                <Text variant="bodySm" tone="subdued">API Cost (Total)</Text>
                <Text variant="headingLg" as="h3">
                  ${(stats.totalGenerations * 0.05).toFixed(2)}
                </Text>
                <Text variant="bodySm">
                  Based on {stats.totalGenerations} generations @ $0.05 each
                </Text>
              </BlockStack>

              <BlockStack gap="200">
                <Text variant="bodySm" tone="subdued">Cache Savings</Text>
                <Text variant="headingLg" as="h3" tone="success">
                  ${((stats.cacheHitRate / 100) * stats.totalGenerations * 0.05).toFixed(2)}
                </Text>
                <Text variant="bodySm">
                  Saved {Math.round(stats.cacheHitRate)}% through caching
                </Text>
              </BlockStack>
            </InlineGrid>

            <Divider />

            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="bodyMd">Gross API Cost</Text>
                <Text variant="bodyMd">${(stats.totalGenerations * 0.05).toFixed(2)}</Text>
              </InlineStack>
              <InlineStack align="space-between">
                <Text variant="bodyMd">Cache Savings</Text>
                <Text variant="bodyMd" tone="success">
                  -${((stats.cacheHitRate / 100) * stats.totalGenerations * 0.05).toFixed(2)}
                </Text>
              </InlineStack>
              <Divider />
              <InlineStack align="space-between">
                <Text variant="bodyMd" fontWeight="bold">Net API Cost</Text>
                <Text variant="bodyMd" fontWeight="bold">
                  ${((1 - stats.cacheHitRate / 100) * stats.totalGenerations * 0.05).toFixed(2)}
                </Text>
              </InlineStack>
            </BlockStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return Math.floor(seconds) + " seconds ago";
}