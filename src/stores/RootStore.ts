import { autorun, makeAutoObservable } from "mobx";

import AccountStore from "@stores/AccountStore";

import { saveState } from "@utils/localStorage";

import NotificationStore from "./NotificationStore";
import OracleStore from "./OracleStore";
import SwapStore from "./SwapStore";

export interface SerializedRootStore {}

export default class RootStore {
  static instance?: RootStore;
  accountStore: AccountStore;
  oracleStore: OracleStore;
  swapStore: SwapStore;
  notificationStore: NotificationStore;

  private constructor(_initState?: SerializedRootStore) {
    this.accountStore = new AccountStore(this);
    this.oracleStore = new OracleStore(this);
    this.swapStore = new SwapStore(this);
    this.notificationStore = new NotificationStore(this);
    makeAutoObservable(this);

    autorun(
      () => {
        saveState(this.serialize());
      },
      { delay: 1000 },
    );
  }

  static create = (initState?: SerializedRootStore) => {
    if (!RootStore.instance) {
      RootStore.instance = new RootStore(initState);
    }

    return RootStore.instance;
  };

  serialize = (): SerializedRootStore => ({
    accountStore: this.accountStore.serialize(),
  });
}
