import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/auth/redirect";

const OTP_TYPES = new Set(["signup", "email", "recovery", "invite", "email_change", "magiclink"]);

/**
 * Landing point for links in Supabase auth emails (sign-up confirmation,
 * password reset). Supports both link styles:
 * - `?token_hash=…&type=…` from the customised email templates (works in any
 *   browser), see supabase/README.md
 * - `?code=…` from Supabase's default templates (PKCE; same browser only)
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = safeRedirectPath(
    searchParams.get("next"),
    type === "recovery" ? "/reset-password/update" : "/dashboard",
  );

  const supabase = await createClient();
  let error = new Error("missing token");

  if (tokenHash && OTP_TYPES.has(type)) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  }

  if (error) {
    const reason = type === "recovery" || next.startsWith("/reset-password")
      ? "reset_link_invalid"
      : "confirm_link_invalid";
    return NextResponse.redirect(`${origin}/login?error=${reason}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
