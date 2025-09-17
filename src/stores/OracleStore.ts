import { HermesClient } from "@pythnetwork/hermes-client";
import { makeAutoObservable } from "mobx";

import RootStore from "@stores/RootStore";

import BN from "@utils/BN";
import { IntervalUpdater } from "@utils/IntervalUpdater";

const PYTH_URL = "https://hermes.pyth.network";

const zeroFeedId = "0x0000000000000000000000000000000000000000000000000000000000000000";

const UPDATE_INTERVAL = 15_000;

class OracleStore {
  private readonly rootStore: RootStore;

  priceServiceConnection: HermesClient;
  prices: Record<string, string> = {};
  initialized: boolean = false;

  private priceUpdater: IntervalUpdater;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    this.priceServiceConnection = new HermesClient(PYTH_URL, {});

    this.initAndGetPythPrices().then(() => this.setInitialized(true));

    this.priceUpdater = new IntervalUpdater(this.initAndGetPythPrices, UPDATE_INTERVAL);
  }

  private initAndGetPythPrices = async () => {
    try {
      // You can find the ids of prices at https://pyth.network/developers/price-feed-ids

      const priceIds = this.rootStore.accountStore.tokens
        .filter((t) => t.priceFeed?.toLowerCase() !== zeroFeedId.toLowerCase())
        .map((t) => t.priceFeed)
        .filter((t) => t !== undefined);

      if (priceIds.length === 0) return;

      const response = await this.priceServiceConnection.getLatestPriceUpdates(priceIds, { parsed: true });

      const lastPriceUpdates = response.parsed ?? [];

      const initPrices = lastPriceUpdates.reduce(
        (acc, priceFeed) => {
          return { ...acc, [`0x${priceFeed.id}`]: priceFeed.price.price };
        },
        {} as Record<string, string>,
      );

      this.setPrices(initPrices);
    } catch (error) {
      console.warn("Failed to fetch Pyth prices:", error);
      // Не выбрасываем ошибку, чтобы не ломать приложение
    }
  };

  getTokenIndexPrice = (priceFeed?: string): BN | null => {
    if (!this.prices || !priceFeed) return null;

    const price = this.prices[priceFeed];

    if (!price) return null;

    const priceBN = new BN(price);

    // Нам нужно докидывать 1 decimal, потому что decimals разный в api и у нас
    return BN.formatUnits(BN.parseUnits(priceBN, 1), 9);
  };

  private setPrices = (v: Record<string, string>) => (this.prices = v);

  private setInitialized = (l: boolean) => (this.initialized = l);
}

export default OracleStore;
