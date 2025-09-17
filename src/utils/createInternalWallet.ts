import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

// Создаем внутренний кошелек для RangePoolQueriesService
// Используем тестовый приватный ключ (в продакшене нужно использовать переменную окружения)
const INTERNAL_PRIVATE_KEY = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

export function createInternalWallet() {
  const account = privateKeyToAccount(INTERNAL_PRIVATE_KEY as `0x${string}`);

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http("https://ethereum-sepolia.publicnode.com"),
  });

  return { account, walletClient };
}
