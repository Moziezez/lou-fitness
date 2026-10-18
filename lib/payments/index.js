import { testProvider } from "./providers/test";
import { paynowproProvider } from "./providers/paynowpro";
import { fygaroProvider } from "./providers/fygaro";

const providers = {
  test: testProvider,
  paynowpro: paynowproProvider,
  fygaro: fygaroProvider,
};

export function getPaymentProvider() {
  const id = (process.env.PAYMENT_PROVIDER || "test").toLowerCase();
  const provider = providers[id];

  if (!provider) {
    throw new Error(`Unknown PAYMENT_PROVIDER "${id}". Use test | paynowpro | fygaro.`);
  }

  return provider;
}

export function listPaymentProviders() {
  return Object.keys(providers);
}
