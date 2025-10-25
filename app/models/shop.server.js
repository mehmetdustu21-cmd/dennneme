// Shop & Usage Statistics Server Functions
import { prisma } from "../db.server";

/**
 * Get or create shop record
 */
export async function getOrCreateShop(shopDomain) {
  let shop = await prisma.shop.findUnique({
    where: { shop: shopDomain },
  });

  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        shop: shopDomain,
        plan: "free",
        credits: 25, // Free tier credits
        totalCreditsUsed: 0,
        active: true,
      },
    });
  }

  return shop;
}

/**
 * Get shop with detailed statistics
 */
export async function getShopWithStats(shopDomain) {
  const shop = await getOrCreateShop(shopDomain);

  // Get generation statistics (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const generations = await prisma.generation.findMany({
    where: {
      shopId: shop.id,
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate statistics
  const totalGenerations = generations.length;
  const completedGenerations = generations.filter(g => g.status === "completed").length;
  const failedGenerations = generations.filter(g => g.status === "failed").length;
  const pendingGenerations = generations.filter(g => g.status === "pending" || g.status === "processing").length;

  // Calculate cache hit rate (for same product + customer combinations)
  const uniqueCombinations = new Set(
    generations.map(g => `${g.productId}_${g.customerId}`)
  ).size;
  const cacheHitRate = totalGenerations > 0 
    ? ((totalGenerations - uniqueCombinations) / totalGenerations * 100).toFixed(1)
    : 0;

  // Last 7 days data for graph
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const last7Days = await prisma.generation.findMany({
    where: {
      shopId: shop.id,
      createdAt: { gte: sevenDaysAgo },
    },
    select: {
      createdAt: true,
      status: true,
    },
  });

  // Group by day
  const dailyStats = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailyStats[dateKey] = { total: 0, completed: 0, failed: 0 };
  }

  last7Days.forEach(gen => {
    const dateKey = gen.createdAt.toISOString().split('T')[0];
    if (dailyStats[dateKey]) {
      dailyStats[dateKey].total++;
      if (gen.status === 'completed') dailyStats[dateKey].completed++;
      if (gen.status === 'failed') dailyStats[dateKey].failed++;
    }
  });

  // Recent generations
  const recentGenerations = await prisma.generation.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    shop,
    stats: {
      totalGenerations,
      completedGenerations,
      failedGenerations,
      pendingGenerations,
      cacheHitRate: parseFloat(cacheHitRate),
      creditsUsed: shop.totalCreditsUsed,
      creditsRemaining: shop.credits,
      creditsTotal: shop.credits + shop.totalCreditsUsed,
    },
    dailyStats,
    recentGenerations,
  };
}

/**
 * Update shop credits
 */
export async function updateShopCredits(shopId, creditsToAdd) {
  return await prisma.shop.update({
    where: { id: shopId },
    data: {
      credits: {
        increment: creditsToAdd,
      },
    },
  });
}

/**
 * Use credits (deduct)
 */
export async function useCredits(shopId, creditsToUse = 1) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  if (shop.credits < creditsToUse) {
    throw new Error("Insufficient credits");
  }

  return await prisma.shop.update({
    where: { id: shopId },
    data: {
      credits: {
        decrement: creditsToUse,
      },
      totalCreditsUsed: {
        increment: creditsToUse,
      },
    },
  });
}

/**
 * Record a generation
 */
export async function recordGeneration({
  shopId,
  productId,
  variantId,
  customerId,
  customerImage,
  resultImage,
  status = "completed",
  apiCost = 0.05,
  creditsUsed = 1,
  errorMessage = null,
}) {
  return await prisma.generation.create({
    data: {
      shopId,
      productId,
      variantId,
      customerId,
      customerImage,
      resultImage,
      status,
      apiCost,
      creditsUsed,
      errorMessage,
      completedAt: status === "completed" ? new Date() : null,
    },
  });
}

