import { testProvider } from "./providers/test";
import { wipayProvider } from "./providers/wipay";

const providers = {
  test: testProvider,
  wipay: wipayProvider,
};

export function getPaymentProvider() {
  const id = (process.env.PAYMENT_PROVIDER || "test").toLowerCase();
  const provider = providers[id];

  if (!provider) {
    throw new Error(`Unknown PAYMENT_PROVIDER "${id}". Use test | wipay.`);
  }

  return provider;
}

export function listPaymentProviders() {
  return Object.keys(providers);
}
