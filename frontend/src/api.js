/**
 * Central API configuration helper.
 * Reads VITE_API_BASE_URL if set (e.g. for production deployment where frontend
 * is hosted separately from backend on Vercel/Netlify/Render).
 * Defaults to '' so relative paths (/api/...) work out-of-the-box in local dev
 * and unified server environments.
 */
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

export function apiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${cleanPath}`
}
