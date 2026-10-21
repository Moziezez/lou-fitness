/**
 * Shared shapes for payment providers.
 * Providers must never mark a payment as confirmed without server verification.
 */

/** @typedef {'test' | 'wipay'} PaymentProviderId */

/**
 * @typedef {Object} CheckoutInput
 * @property {string} bookingId
 * @property {number} amountCents
 * @property {string} currency
 * @property {string} description
 * @property {string} customerEmail
 * @property {string} successUrl
 * @property {string} cancelUrl
 * @property {Record<string, string>} [metadata]
 */

/**
 * @typedef {Object} CheckoutResult
 * @property {string} checkoutUrl
 * @property {string} providerPaymentId
 * @property {'live' | 'test'} mode
 */

/**
 * @typedef {Object} WebhookResult
 * @property {string} eventId
 * @property {'succeeded' | 'failed' | 'pending' | 'simulated'} status
 * @property {string | null} bookingId
 * @property {number | null} amountCents
 * @property {string | null} currency
 * @property {boolean} isAuthoritative
 */

export {};
