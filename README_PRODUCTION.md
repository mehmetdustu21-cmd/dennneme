# 🚀 Virtual Try-On - Production Deployment Guide

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

**Required Variables:**
- `SHOPIFY_API_KEY` - From Partner Dashboard
- `SHOPIFY_API_SECRET` - From Partner Dashboard  
- `FAL_KEY` - Get from [fal.ai](https://fal.ai)
- `CLOUDINARY_*` - Get from [Cloudinary](https://cloudinary.com)
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Random secure string

### 2. Database Setup

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 3. Build

```bash
npm run build
```

### 4. Deploy to Render.com

1. Connect your GitHub repo to Render
2. Add all environment variables in Render Dashboard
3. Deploy!

**Build Command:** `npm install && npm run setup`  
**Start Command:** `npm start`

---

## 📋 Pre-Launch Checklist

### ✅ Code
- [x] Hardcoded API keys removed
- [x] Environment variables configured
- [x] Database schema migrated
- [x] Build successful
- [x] GDPR webhooks implemented

### ✅ Shopify Partner Dashboard

**App Setup:**
- App URL: `https://your-app.onrender.com`
- Redirect URLs: 
  - `https://your-app.onrender.com/auth/callback`
  - `https://your-app.onrender.com/auth/shopify/callback`

**Distribution (for Public App):**
- [ ] App name
- [ ] App icon (1200x1200 px)
- [ ] Screenshots (min 3, 1600x1200 px)
- [ ] Description (EN + other languages)
- [ ] Privacy Policy URL: `https://your-app.onrender.com/privacy`
- [ ] Support URL: `https://your-app.onrender.com/support`
- [ ] Pricing details

### ✅ Testing
- [ ] Install on 3+ test stores
- [ ] Test all features (generate, models, analytics)
- [ ] Test GDPR webhooks: `shopify webhook trigger --topic=customers/data_request`
- [ ] Test theme extension on multiple themes
- [ ] Performance test

---

## 🔒 Security Best Practices

1. **Never commit `.env` file**
2. **Rotate API keys regularly**
3. **Enable 2FA on all services**
4. **Monitor error logs** (use Sentry or similar)
5. **Set up rate limiting** (if needed)

---

## 📊 Monitoring

### Recommended Services
- **Errors:** Sentry, Rollbar
- **Performance:** New Relic, Datadog
- **Uptime:** Pingdom, UptimeRobot
- **Analytics:** Google Analytics, Mixpanel

### Key Metrics to Track
- Generation success rate
- API response times
- Credit usage patterns
- Customer churn rate

---

## 💰 Pricing Strategy

### Recommended Plans

**Free Tier:**
- 25 credits
- Basic support
- Default models only

**Starter - $19/month:**
- 100 credits/month
- Priority support
- Custom model upload
- Theme customization

**Pro - $49/month:**
- 500 credits/month
- Priority support
- Bulk generation
- API access

**Enterprise - Custom:**
- Unlimited credits
- Dedicated support
- White-label option
- Custom integrations

---

## 🐛 Troubleshooting

### Common Issues

**"FAL_KEY not set" error**
```bash
# Make sure env variable is set in production
echo $FAL_KEY

# If empty, add it in Render dashboard
```

**Database connection error**
```bash
# Check DATABASE_URL format
# PostgreSQL: postgresql://user:pass@host:5432/db
# Make sure to run migrations
npx prisma migrate deploy
```

**Webhook not receiving events**
```bash
# Verify webhook URLs in shopify.app.toml
# Check Render logs for incoming requests
# Test with Shopify CLI:
shopify webhook trigger --topic=app/uninstalled
```

---

## 📞 Support

- Email: support@virtual-tryon.app
- Documentation: [Link to docs]
- Status Page: [Link to status]

---

## 🚀 Launch Steps

1. ✅ Complete all checklist items above
2. ✅ Test thoroughly on staging
3. ✅ Deploy to production
4. ✅ Submit for Shopify review
5. ✅ Wait 3-7 days for approval
6. 🎉 Launch!

---

## Post-Launch

### Week 1
- Monitor error rates closely
- Respond to user feedback quickly
- Fix any critical bugs immediately

### Month 1
- Collect user feedback
- Analyze usage patterns
- Plan feature updates

### Ongoing
- Regular security updates
- Performance optimization
- New features based on feedback

---

**Good luck with your launch! 🚀**

