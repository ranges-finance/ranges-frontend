import { makeAutoObservable, reaction } from "mobx";
import { getBalance } from "wagmi/actions";

import RootStore from "./RootStore";

interface TokenBalance {
  symbol: string;
  balance: string;
  formatted: string;
}

class BalanceStore {
  public readonly rootStore: RootStore;

  // Новые поля для хранения балансов
  tokenBalances: Record<string, TokenBalance> = {};
  isBalancesLoading: boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    reaction(
      () => [this.rootStore.accountStore.address, this.rootStore.accountStore.chainId],
      () => this.updateTokenBalances(),
    );

    setTimeout(() => this.updateTokenBalances(), 500);
    setInterval(() => this.updateTokenBalances(), 10000);
  }

  setTokenBalance = (symbol: string, balance: TokenBalance) => (this.tokenBalances[symbol] = balance);
  setBalancesLoading = (loading: boolean) => (this.isBalancesLoading = loading);
  clearBalances = () => (this.tokenBalances = {});

  updateTokenBalances = async () => {
    const { address, chainId, wagmiConfig, networkConfig } = this.rootStore.accountStore;
    if (!address || !chainId || !wagmiConfig) {
      this.clearBalances();
      return;
    }

    this.setBalancesLoading(true);

    try {
      const networkTokens = networkConfig?.tokens || [];

      // Используем Promise.all для параллельного выполнения всех запросов
      const balancePromises = networkTokens.map(async (token) => {
        try {
          const balance = await getBalance(wagmiConfig, {
            address: address,
            token: !token.isNative ? token.address : undefined,
          });

          const tokenBalance: TokenBalance = {
            symbol: token.symbol,
            balance: balance.value.toString(),
            formatted: balance.formatted || "0",
          };
          this.setTokenBalance(token.symbol, tokenBalance);
        } catch (error) {
          console.error(`Error fetching balance for ${token.symbol}:`, error);
          this.setTokenBalance(token.symbol, {
            symbol: token.symbol,
            balance: "0",
            formatted: "0",
          });
        }
      });

      await Promise.all(balancePromises);
    } catch (error) {
      console.error("Error updating token balances:", error);
    } finally {
      this.setBalancesLoading(false);
    }
  };

  // Геттер для получения баланса конкретного токена
  getTokenBalance = (symbol: string): TokenBalance | null => {
    return this.tokenBalances[symbol] || null;
  };

  // Геттер для получения отформатированного баланса
  getFormattedBalance = (symbol: string): string => {
    const balance = this.getTokenBalance(symbol);
    return balance?.formatted || "0";
  };

  // Геттер для получения баланса в wei
  getBalanceInWei = (symbol: string): string => {
    const balance = this.getTokenBalance(symbol);
    return balance?.balance || "0";
  };
}

export default BalanceStore;
