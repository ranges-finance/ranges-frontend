import { makeAutoObservable } from "mobx";
import type { Config } from "wagmi";

import { AssetBlockData } from "@components/SelectAssets/SelectAssetsInput";

import { NetworkConfig } from "@constants/networkConfig";
import { CONFIG } from "@utils/getConfig";

import RootStore from "./RootStore";

class AccountStore {
  public readonly rootStore: RootStore;
  address?: `0x${string}`;
  isConnected: boolean = false;
  isProcessing: boolean = false;
  chainId: number | null = null;
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
    const tokens = CONFIG.TOKENS;

    return tokens.map((token) => {
      return {
        assetId: token.assetId,
        asset: token,
        balance: "0", //todo: get balance
        price: "0", //todo: get price
      };
    });
  }

  serialize = () => ({});
}

export default AccountStore;
