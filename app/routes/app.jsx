import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import "./styles/responsive.css";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();
  
  return (
    <ShopifyAppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={{}}>
        <s-app-nav>
          <s-link href="/app">🏠 Dashboard</s-link>
          <s-link href="/app/generate">✨ Generate Try-On</s-link>
          <s-link href="/app/models">👤 Models</s-link>
          <s-link href="/app/analytics">📊 Analytics</s-link>
          <s-link href="/app/plans">💳 Plans & Billing</s-link>
          <s-link href="/app/theme">🎨 Theme Settings</s-link>
          <s-link href="/app/settings">⚙️ Settings</s-link>
        </s-app-nav>
        <Outlet />
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};