// external app URL for cross-subdomain / cross-app linking.
// In Vite/React client, import.meta.env.VITE_APP_URL is used.
// Override by setting VITE_APP_URL in .env or .env.local

function getAppUrl(): string {
  // Check Vite client env variable
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL
  }

  // Check Node/build process env variables
  if (typeof process !== "undefined") {
    if (process.env.VITE_APP_URL) return process.env.VITE_APP_URL
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  }

  // In local development mode, default to localhost:3000
  const isDev =
    (typeof import.meta !== "undefined" && import.meta.env?.DEV) ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "development") ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"))

  if (isDev) {
    return "http://localhost:3000"
  }

  return "https://app.genia.tech"
}

export const APP_URL = getAppUrl()

export function appUrl(path: string): string {
  const baseUrl = getAppUrl()
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
}
