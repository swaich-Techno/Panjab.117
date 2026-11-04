import type { MetadataRoute } from "next";

import {
  getPublicSiteOrigin,
  isPublicPreviewIndexingEnabled,
} from "@/lib/public-site";

export default function robots(): MetadataRoute.Robots {
  const origin = getPublicSiteOrigin();
  const indexingEnabled = isPublicPreviewIndexingEnabled();

  return {
    rules: indexingEnabled
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: indexingEnabled && origin ? `${origin}/sitemap.xml` : undefined,
  };
}
