import { cache } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

/**
 * Reserved seats per session id for the signed-in user, or null when signed
 * out (the session_seats view is only granted to `authenticated`). Reads
 * cookies, so callers must render inside <Suspense>. One query per request.
 * @returns {Promise<Map<string, number> | null>}
 */
export const getReservedSeats = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("session_seats").select("session_id, reserved");
  if (error) throw new Error(`Plätze konnten nicht geladen werden: ${error.message}`);
  return new Map(data.map((row) => [row.session_id, row.reserved]));
});
