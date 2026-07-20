import { siteConfig } from "@/lib/config";

export type Metadata = {
  title?: string;
  description?: string;
  keywords?: string[];
  authors?: { name: string; url: string }[];
  creator?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    siteName?: string;
    url?: string;
    images?: { url: string; width: number; height: number; alt: string }[];
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    images?: string[];
    creator?: string;
  };
  icons?: string;
  metadataBase?: URL;
  robots?: {
    index: boolean;
    follow: boolean;
  };
};

export function constructMetadata({
  title = siteConfig.title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    keywords: siteConfig.keywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: siteConfig.name,
      url: siteConfig.url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: siteConfig.twitterHandle,
    },
    icons,
    metadataBase: new URL(HOME_DOMAIN),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export const HOME_DOMAIN =
  process.env.VITE_VERCEL_ENV === "production"
    ? "https://www.Genia.tech"
    : process.env.VITE_VERCEL_ENV === "preview"
      ? `https://${process.env.VITE_VERCEL_URL}`
      : "http://localhost:3000";
