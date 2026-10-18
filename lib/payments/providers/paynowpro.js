/**
 * PayNowPro adapter (Jamaica / Caribbean).
 * Docs: https://paynowpro.com/docs
 *
 * Credentials required before live use:
 * - PAYNOWPRO_API_KEY
 * - PAYNOWPRO_WEBHOOK_SECRET (confirm signature scheme in dashboard docs)
 * - PAYNOWPRO_BASE_URL (default https://api.paynowpro.com/api/v1)
 */

function assertConfigured() {
  if (!process.env.PAYNOWPRO_API_KEY) {
    throw new Error(
      "PayNowPro is selected but PAYNOWPRO_API_KEY is not configured. Use PAYMENT_PROVIDER=test for local development."
    );
  }
}

export const paynowproProvider = {
  id: "paynowpro",

  /**
   * @param {import('../types.js').CheckoutInput} input
   */
  async createCheckout(input) {
    assertConfigured();

    const baseUrl = process.env.PAYNOWPRO_BASE_URL || "https://api.paynowpro.com/api/v1";

    // Placeholder: wire to Payment Intents create endpoint once credentials exist.
    // Expected flow: POST intent → receive intentId → redirect to hosted checkout.
    const response = await fetch(`${baseUrl}/payment-intents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.PAYNOWPRO_API_KEY,
      },
      body: JSON.stringify({
        amount: input.amountCents,
        currency: input.currency,
        description: input.description,
        customerEmail: input.customerEmail,
        redirectUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
        metadata: {
          bookingId: input.bookingId,
          ...input.metadata,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`PayNowPro checkout failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    const intentId = data.intentId || data.id;
    const checkoutUrl = data.checkoutUrl || data.redirectUrl;

    if (!intentId || !checkoutUrl) {
      throw new Error("PayNowPro response missing intentId or checkout URL. Adjust adapter to match live API.");
    }

    return {
      checkoutUrl,
      providerPaymentId: String(intentId),
      mode: "live",
    };
  },

  async verifyWebhook() {
    // Signature verification to be completed with PayNowPro webhook secret docs.
    throw new Error("PayNowPro webhook verification is not configured yet.");
  },

  async getPaymentStatus() {
    throw new Error("PayNowPro status lookup is not configured yet.");
  },
};
