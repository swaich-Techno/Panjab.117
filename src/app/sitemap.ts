import type { MetadataRoute } from "next";

import {
  getPublicSiteOrigin,
  isPublicPreviewIndexingEnabled,
  publicPreviewRoutes,
} from "@/lib/public-site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getPublicSiteOrigin();
  if (!origin || !isPublicPreviewIndexingEnabled()) return [];

  return publicPreviewRoutes.map((route) => ({
    url: `${origin}${route}`,
    changeFrequency: route.endsWith("/survey") ? "weekly" : "monthly",
    priority: route.split("/").length === 2 ? 1 : 0.7,
  }));
}
