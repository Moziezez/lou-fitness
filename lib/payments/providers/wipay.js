/**
 * WiPay Caribbean adapter (Jamaica: jm.wipayfinancial.com).
 * Hosted checkout: POST to /plugins/payments/request → redirect to returned `url`
 * → WiPay redirects back to `response_url` with status, order_id, transaction_id, total, hash.
 *
 * Credentials required before live use:
 * - WIPAY_ACCOUNT_NUMBER
 * - WIPAY_API_KEY (also the secret for the return hash: md5(transaction_id + total + api_key))
 * - WIPAY_ENVIRONMENT (sandbox | live)
 * - WIPAY_REQUEST_URL (default https://jm.wipayfinancial.com/plugins/payments/request)
 * - WIPAY_FEE_STRUCTURE (customer_pay | merchant_absorb | split)
 */

function assertConfigured() {
  if (!process.env.WIPAY_ACCOUNT_NUMBER || !process.env.WIPAY_API_KEY) {
    throw new Error(
      "WiPay is selected but WIPAY_ACCOUNT_NUMBER / WIPAY_API_KEY are not configured. Use PAYMENT_PROVIDER=test for local development."
    );
  }
}

export const wipayProvider = {
  id: "wipay",

  /**
   * @param {import('../types.js').CheckoutInput} input
   */
  async createCheckout(input) {
    assertConfigured();
    // To be implemented: build the form payload (account_number, country_code=JM, currency,
    // environment, fee_structure, method=credit_card, order_id, origin, response_url, total)
    // and return the hosted checkout `url` from WiPay's JSON response.
    void input;
    throw new Error("WiPay checkout is not implemented yet.");
  },

  async verifyWebhook() {
    // To be implemented: verify `hash` server-side with a timing-safe compare, then confirm
    // amount/currency against the payments row before treating the result as authoritative.
    throw new Error("WiPay return verification is not implemented yet.");
  },

  async getPaymentStatus() {
    throw new Error("WiPay status lookup is not implemented yet.");
  },
};
