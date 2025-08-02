import { makeAutoObservable } from "mobx";
import type { Config } from "wagmi";

import { AssetBlockData } from "@components/SelectAssets/SelectAssetsInput";

import { NetworkConfig } from "@constants/networkConfig";
import TOKEN_LOGOS from "@constants/tokenLogos";

import { Token } from "@entity";

import RootStore from "./RootStore";

class AccountStore {
  public readonly rootStore: RootStore;
  address?: `0x${string}`;
  isConnected: boolean = false;
  isProcessing: boolean = false;
  chainId: number | null = NetworkConfig.ethereum.chainId;
  wagmiConfig: Config | null = null;

  isAuthenticating: boolean = false;

  isLoading: boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setAddress = (address?: `0x${string}`) => (this.address = address);
  setIsConnected = (isConnected: boolean) => (this.isConnected = isConnected);
  setChainId = (chainId: number | null) => (this.chainId = chainId);
  setWagmiConfig = (config: Config) => (this.wagmiConfig = config);
  setLoading = (loading: boolean) => (this.isLoading = loading);

  get networkConfig() {
    return Object.values(NetworkConfig).find((network) => network.chainId === this.chainId);
  }

  get formattedBalanceInfoList(): AssetBlockData[] {
    const tokens = this.tokens;

    return tokens.map((token) => {
      const balance = this.rootStore.balanceStore.getFormattedBalance(token.symbol);
      return {
        assetId: token.assetId,
        asset: token,
        balance: balance,
        price: this.rootStore.oracleStore.getTokenIndexPrice(token.priceFeed).toString(),
      };
    });
  }

  get tokens() {
    return (
      this.networkConfig?.tokens.map(
        (token) =>
          new Token({
            name: token.symbol,
            symbol: token.symbol,
            decimals: token.decimals,
            assetId: token.symbol,
            logo: TOKEN_LOGOS[token.symbol],
            priceFeed: token.priceFeed ?? "",
          }),
      ) ?? []
    );
  }

  get tokensBySymbol() {
    return this.tokens.reduce(
      (acc, token) => {
        acc[token.symbol] = token;
        return acc;
      },
      {} as Record<string, Token>,
    );
  }

  getExplorerLinkByHash = (hash: string) => {
    return `${this.networkConfig?.explorer}/tx/${hash}`;
  };

  getExplorerLinkByAddress = (address: string) => {
    return `${this.networkConfig?.explorer}/account/${address}`;
  };

  serialize = () => ({});
}

export default AccountStore;
