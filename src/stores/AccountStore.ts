import { Wallet } from "@privy-io/react-auth";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { AssetBlockData } from "@components/SelectAssets/SelectAssetsInput";

import { CONFIG } from "@utils/getConfig";

import RootStore from "./RootStore";

export interface SerializedAccountStore {
  privateKey: Nullable<string>;
}

class AccountStore {
  initialized = false;

  constructor(
    private rootStore: RootStore,
    initState?: SerializedAccountStore,
  ) {
    makeAutoObservable(this);
    if (initState) {
      if (initState.privateKey) {
        this.connectWalletByPrivateKey(initState.privateKey);
      }
    }

    this.init();
  }

  init = async () => {
    this.initialized = true;
  };

  connect = async (_wallet: Wallet) => {
    const { notificationStore } = this.rootStore;

    try {
      // todo: connect wallet
    } catch (error: any) {
      notificationStore.error({
        text: "Unexpected error. Please try again.",
      });
    }
  };

  connectWalletByPrivateKey = async (_privateKey: string) => {
    // TODO: set address
    const { notificationStore } = this.rootStore;

    try {
      // todo: connect wallet by private key
    } catch (error: any) {
      notificationStore.error({
        text: "Unexpected error. Please try again.",
      });
    }
  };

  get formattedBalanceInfoList(): AssetBlockData[] {
    // const { oracleStore } = this.rootStore; //todo

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

  addAsset = async (_assetId: string) => {
    // todo: add asset to wallet
  };

  disconnect = async () => {
    // todo: disconnect wallet
  };

  get address(): Nullable<any> {
    // todo: get address
    return null;
  }

  get isConnected() {
    // todo: check if wallet is connected
    return false;
  }

  serialize = (): SerializedAccountStore => {
    // todo: serialize account
    return {
      privateKey: null,
      // address: bcNetwork.getAddress() ?? null,
    };
  };
}

export default AccountStore;
