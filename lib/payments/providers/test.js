/**
 * Development-only payment provider.
 * Simulated checkouts are NEVER treated as confirmed paid payments.
 */

export const testProvider = {
  id: "test",

  /**
   * @param {import('../types.js').CheckoutInput} input
   * @returns {Promise<import('../types.js').CheckoutResult>}
   */
  async createCheckout(input) {
    const url = new URL("/checkout/test", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    url.searchParams.set("bookingId", input.bookingId);
    url.searchParams.set("amount", String(input.amountCents));
    url.searchParams.set("currency", input.currency);
    url.searchParams.set("mode", "test");

    return {
      checkoutUrl: url.toString(),
      providerPaymentId: `test_${input.bookingId}`,
      mode: "test",
    };
  },

  /**
   * @returns {Promise<import('../types.js').WebhookResult>}
   */
  async verifyWebhook() {
    return {
      eventId: `test_evt_${Date.now()}`,
      status: "simulated",
      bookingId: null,
      amountCents: null,
      currency: null,
      isAuthoritative: false,
    };
  },

  async getPaymentStatus(providerPaymentId) {
    return {
      status: "simulated",
      providerPaymentId,
      amountCents: null,
      currency: null,
      isAuthoritative: false,
    };
  },
};
