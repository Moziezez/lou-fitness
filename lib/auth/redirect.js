/**
 * Only allow same-site relative paths as post-auth destinations, so a crafted
 * `?next=` can't send users to another origin (open redirect).
 * @param {unknown} value
 * @param {string} [fallback]
 */
export function safeRedirectPath(value, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
