import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * @typedef {Object} CurrentUser
 * @property {string} id
 * @property {string} email
 * @property {string | null} fullName
 * @property {"customer" | "admin"} role
 */

/**
 * The signed-in user with their profile, or null. Reads cookies, so callers
 * must render inside a <Suspense> boundary. Deduplicated per request.
 * Uses getClaims(), which verifies the JWT; never trust getSession() on the
 * server.
 * @returns {Promise<CurrentUser | null>}
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: claims.email ?? "",
    fullName: profile?.full_name ?? null,
    role: profile?.role === "admin" ? "admin" : "customer",
  };
});
