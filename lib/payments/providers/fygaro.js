/**
 * Fygaro adapter.
 * Docs:
 * - https://help.fygaro.com/en-us/article/fygaro-links-integration-api-h78p9y/
 * - https://help.fygaro.com/en-us/article/payment-button-hook-1wkui1k/
 *
 * Credentials required:
 * - FYGARO_API_KEY / FYGARO_API_SECRET (JWT for locked amounts)
 * - FYGARO_BUTTON_URL
 * - FYGARO_WEBHOOK_SECRET (HMAC for Fygaro-Signature)
 */

import { createHmac, timingSafeEqual } from "crypto";

function assertConfigured() {
  if (!process.env.FYGARO_BUTTON_URL || !process.env.FYGARO_API_SECRET || !process.env.FYGARO_API_KEY) {
    throw new Error(
      "Fygaro is selected but FYGARO_BUTTON_URL / FYGARO_API_KEY / FYGARO_API_SECRET are incomplete. Use PAYMENT_PROVIDER=test for local development."
    );
  }
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signJwt(payload) {
  const header = { alg: "HS256", typ: "JWT", kid: process.env.FYGARO_API_KEY };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", process.env.FYGARO_API_SECRET)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${data}.${signature}`;
}

export const fygaroProvider = {
  id: "fygaro",

  /**
   * @param {import('../types.js').CheckoutInput} input
   */
  async createCheckout(input) {
    assertConfigured();

    const amount = (input.amountCents / 100).toFixed(2);
    const exp = Math.floor(Date.now() / 1000) + 60 * 60;
    const jwt = signJwt({
      amount,
      currency: input.currency,
      custom_reference: input.bookingId,
      exp,
    });

    const checkoutUrl = `${process.env.FYGARO_BUTTON_URL}?jwt=${encodeURIComponent(jwt)}`;

    return {
      checkoutUrl,
      providerPaymentId: `fygaro_pending_${input.bookingId}`,
      mode: "live",
    };
  },

  /**
   * @param {{ headers: Headers; rawBody: string }} request
   */
  async verifyWebhook(request) {
    const secret = process.env.FYGARO_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("FYGARO_WEBHOOK_SECRET is not configured.");
    }

    const signatureHeader = request.headers.get("fygaro-signature") || "";
    const parts = Object.fromEntries(
      signatureHeader.split(",").map((part) => {
        const [key, ...rest] = part.trim().split("=");
        return [key, rest.join("=")];
      })
    );

    const timestamp = parts.t;
    const hash = parts.v1;
    if (!timestamp || !hash) {
      throw new Error("Malformed Fygaro-Signature header.");
    }

    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
      throw new Error("Stale Fygaro webhook timestamp.");
    }

    const expected = createHmac("sha256", secret)
      .update(`${timestamp}.${request.rawBody}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expected, "utf8");
    const actualBuf = Buffer.from(hash, "utf8");
    if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
      throw new Error("Invalid Fygaro webhook signature.");
    }

    const payload = JSON.parse(request.rawBody);
    const amountCents = payload.amount ? Math.round(Number(payload.amount) * 100) : null;

    return {
      eventId: payload.transactionId || `fygaro_${Date.now()}`,
      status: "succeeded",
      bookingId: payload.customReference || null,
      amountCents,
      currency: payload.currency || null,
      isAuthoritative: true,
    };
  },

  async getPaymentStatus() {
    throw new Error("Fygaro does not expose a generic status poll in this adapter yet; rely on webhooks.");
  },
};
