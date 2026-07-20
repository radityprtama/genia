// ponytail: external app URL for cross-subdomain linking.
// Override by setting VITE_APP_URL or NEXT_PUBLIC_APP_URL
export const APP_URL = (typeof process !== "undefined" && (process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL))
  || "https://app.genia.tech"

export function appUrl(path: string): string {
  return `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`
}
