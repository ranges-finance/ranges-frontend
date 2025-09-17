import { makeAutoObservable, reaction, runInAction } from "mobx";

import { fetchChainBalances, type PortfolioBalances, type TokenBalance } from "../utils/portfolioFetcher";

import RootStore from "./RootStore";

class BalanceStore {
  public readonly rootStore: RootStore;
  portfolioBalances: PortfolioBalances = {};
  prices: Record<string, number> = {};
  initialized: boolean = false;
  private isUpdatingBalances: boolean = false;
  private currentRequestId: number = 0;
  private updateBalancesTimeout: NodeJS.Timeout | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    reaction(
      () => [rootStore.accountStore.address, rootStore.accountStore.chainId],
      (currentValues) => {
        const [address, chainId] = currentValues;
        if (address && chainId) {
          setTimeout(() => {
            Promise.all([this.debouncedUpdateTokenBalances()]).then(() => this.setInitialized(true));
          }, 300);
        } else {
          runInAction(() => {
            this.portfolioBalances = {};
            this.setInitialized(false);
          });
        }
      },
      { fireImmediately: true },
    );

    setInterval(() => this.updateTokenBalances(), 5 * 60 * 1000);
  }

  get balances(): Record<string, TokenBalance> {
    const chainId = this.rootStore.accountStore.chainId;
    if (!chainId) return {};
    const result: Record<string, TokenBalance> = {};

    const tokenBalances = this.portfolioBalances[chainId]?.tokenBalances || [];
    tokenBalances.forEach((token) => (result[token.symbol] = token));

    const nativeBalance = this.portfolioBalances[chainId]?.nativeBalance;
    nativeBalance && (result[nativeBalance.symbol] = nativeBalance);

    return result;
  }

  setInitialized = (initialized: boolean) => (this.initialized = initialized);

  debouncedUpdateTokenBalances = () => {
    if (this.updateBalancesTimeout) {
      clearTimeout(this.updateBalancesTimeout);
    }

    this.updateBalancesTimeout = setTimeout(() => {
      this.updateTokenBalances();
    }, 100);
  };

  updateTokenBalances = async () => {
    const { address, chainId, networkConfig } = this.rootStore.accountStore;
    if (!address || !chainId || !networkConfig || this.isUpdatingBalances) {
      return;
    }

    const requestId = ++this.currentRequestId;
    this.isUpdatingBalances = true;

    try {
      const currentChainBalances = await fetchChainBalances(
        chainId,
        address,
        networkConfig,
        Object.values(networkConfig.tokens),
      );

      // Проверяем актуальность запроса
      if (requestId !== this.currentRequestId || this.rootStore.accountStore.chainId !== chainId) {
        return;
      }

      runInAction(() => {
        if (currentChainBalances) {
          this.portfolioBalances = {
            ...this.portfolioBalances,
            [chainId]: currentChainBalances,
          };
        }
      });
    } catch (error) {
      console.error("Error fetching current chain balances:", error);
    } finally {
      if (requestId === this.currentRequestId) {
        this.isUpdatingBalances = false;
      }
    }
  };

  cleanup = () => {
    if (this.updateBalancesTimeout) {
      clearTimeout(this.updateBalancesTimeout);
      this.updateBalancesTimeout = null;
    }
  };
}

export default BalanceStore;
