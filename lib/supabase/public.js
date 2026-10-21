import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Anonymous, cookie-less client for public catalogue reads. Without cookies it
// can run inside "use cache" scopes, and RLS always treats it as `anon`, so it
// only ever sees published rows, even when an admin is browsing.
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createSupabaseClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
