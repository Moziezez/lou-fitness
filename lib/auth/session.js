import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
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
  // getClaims() checks the token expiry with Date.now(). With partial
  // prefetching, that counts as sync IO in the runtime prerender stage, so
  // defer the whole check to request time.
  await connection();
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

/**
 * For admin pages and actions: the current user if they are an admin.
 * Signed-out users go to /login, everyone else gets a 404.
 * @param {string} [next] Where to return after signing in.
 * @returns {Promise<CurrentUser>}
 */
export async function requireAdmin(next = "/admin") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (user.role !== "admin") notFound();
  return user;
}
