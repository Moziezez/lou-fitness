"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "./redirect";

/**
 * @typedef {Object} AuthFormState
 * @property {string} [error]
 * @property {string} [message]
 * @property {Record<string, string>} [values] Non-secret fields to refill the form.
 */

const MIN_PASSWORD_LENGTH = 8;

function field(formData, name) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

// Email links must point back at the deployment the user is on (localhost,
// preview or production), so derive the origin from the request.
async function siteOrigin() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_APP_URL;
}

/** @returns {Promise<AuthFormState>} */
export async function signUp(_prevState, formData) {
  const fullName = field(formData, "fullName");
  const email = field(formData, "email");
  const password = String(formData.get("password") ?? "");
  const values = { fullName, email };

  if (!fullName || !email) {
    return { error: "Please enter your name and email.", values };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`,
      values,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    return { error: authErrorMessage(error), values };
  }

  // Only happens when email confirmation is switched off in Supabase.
  if (data.session) {
    redirect("/dashboard");
  }

  // Supabase answers the same way for new and already registered addresses,
  // so this message doesn't reveal which emails have accounts.
  return {
    message: `Almost there. We sent a confirmation link to ${email}. Open it to activate your account.`,
  };
}

/** @returns {Promise<AuthFormState>} */
export async function signIn(_prevState, formData) {
  const email = field(formData, "email");
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(formData.get("next"));

  if (!email || !password) {
    return { error: "Please enter your email and password.", values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: authErrorMessage(error), values: { email } };
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** @returns {Promise<AuthFormState>} */
export async function requestPasswordReset(_prevState, formData) {
  const email = field(formData, "email");
  if (!email) {
    return { error: "Please enter your email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/confirm?next=/reset-password/update`,
  });

  // Rate limits are worth reporting; anything else gets the neutral message so
  // the form doesn't reveal whether an account exists.
  if (error?.code === "over_email_send_rate_limit") {
    return { error: authErrorMessage(error), values: { email } };
  }

  return {
    message: `If an account exists for ${email}, a reset link is on its way.`,
  };
}

/** @returns {Promise<AuthFormState>} */
export async function updatePassword(_prevState, formData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (password !== confirm) {
    return { error: "The passwords don't match." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return {
      error: "Your reset link has expired. Please request a new one.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: authErrorMessage(error) };
  }

  redirect("/dashboard");
}

function authErrorMessage(error) {
  switch (error.code) {
    case "invalid_credentials":
      return "Email or password is incorrect.";
    case "email_not_confirmed":
      return "Please confirm your email first. Check your inbox for the link.";
    case "weak_password":
      return "That password is too weak. Try a longer one.";
    case "same_password":
      return "Choose a password you haven't used before.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Try signing in.";
    case "email_address_invalid":
      return "Please enter a valid email address.";
    case "signup_disabled":
      return "Registration is currently closed.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a few minutes and try again.";
    // Supabase's built-in mailer only sends to project team members until a
    // custom SMTP server is configured (see supabase/README.md).
    case "email_address_not_authorized":
      console.error("Supabase auth error", error.code, error.message);
      return "We can't send emails to this address right now. Please contact us.";
    default:
      console.error("Supabase auth error", error.code, error.message);
      return "Something went wrong. Please try again.";
  }
}
