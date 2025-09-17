import { toast } from "react-toastify";
import { makeAutoObservable } from "mobx";
import { formatUnits, parseUnits } from "viem";

import { NetworkConfig, NETWORKS } from "@constants/networkConfig";
import { wagmiConfig } from "@constants/wagmiConfig";
import { debounceAsync } from "@utils/debounce";

import { Token } from "@entity";

import { RangePoolQueriesService } from "../services/rangePoolService";

import RootStore from "./RootStore";

class SwapStore {
  tokens: Token[];
  sellToken: Token;
  buyToken: Token;
  // maybe use BN
  payAmount: string;
  receiveAmount: string;
  modalOpen: boolean = false;
  isLoading: boolean = false;
  isQuoteLoading: boolean = false;
  private rangePoolQueriesService: RangePoolQueriesService | null = null;
  private debouncedGetQuote: (() => void) | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.tokens = this.rootStore.accountStore.tokens;
    this.sellToken = this.rootStore.accountStore.tokensBySymbol.VOV;
    this.buyToken = this.rootStore.accountStore.tokensBySymbol.LID;
    this.payAmount = "0.00";
    this.receiveAmount = "0.00";

    this.initializeRangePoolQueriesService();
  }

  get sellTokenPrice() {
    return this.rootStore.oracleStore.getPriceBySymbol(this.sellToken.symbol);
  }
  get buyTokenPrice() {
    return this.rootStore.oracleStore.getPriceBySymbol(this.buyToken.symbol);
  }

  private initializeRangePoolQueriesService() {
    try {
      const networkConfig = NetworkConfig[NETWORKS.SEPOLIA];
      this.rangePoolQueriesService = new RangePoolQueriesService(networkConfig.rangePoolQueriesAddress, wagmiConfig);

      // Создаем дебаунсированную функцию для получения котировки
      this.debouncedGetQuote = debounceAsync(this.getQuote.bind(this), 500);
    } catch (error) {
      console.error("Failed to initialize RangePoolQueriesService:", error);
    }
  }

  private async getQuote() {
    if (!this.rangePoolQueriesService || !this.payAmount || this.payAmount === "0.00") {
      this.receiveAmount = "0.00";
      return;
    }

    try {
      this.setIsQuoteLoading(true);

      const networkConfig = NetworkConfig[NETWORKS.SEPOLIA];
      const poolAddress = networkConfig.poolAddress;

      // Получаем адреса токенов
      const assetIn = this.sellToken.address;
      const assetOut = this.buyToken.address;

      if (!assetIn || !assetOut) {
        console.error("Token addresses not available");
        return;
      }

      // Конвертируем сумму в BigInt с учетом decimals
      const amountIn = parseUnits(this.payAmount, this.sellToken.decimals);

      // Получаем котировку
      const amountOut = await this.rangePoolQueriesService.getAmountOut(poolAddress, amountIn, assetIn, assetOut);

      // Конвертируем результат обратно в строку с учетом decimals
      const formattedAmountOut = formatUnits(amountOut, this.buyToken.decimals);
      this.receiveAmount = formattedAmountOut;
    } catch (error) {
      console.error("Error getting quote:", error);
      // В случае ошибки используем старую логику с ценами
      this.fallbackToPriceCalculation();
    } finally {
      this.setIsQuoteLoading(false);
    }
  }

  private fallbackToPriceCalculation() {
    const buyTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.buyToken.symbol);
    const sellTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.sellToken.symbol);

    let receiveAmount = "0";
    if (!buyTokenPrice || !sellTokenPrice) {
      console.error("Error getting prices");
      return;
    }
    if (buyTokenPrice.gt(0)) {
      receiveAmount = sellTokenPrice.times(this.payAmount).div(buyTokenPrice).toString();
    }
    this.receiveAmount = receiveAmount;
  }

  swapTokens = async () => {
    if (!this.rootStore.accountStore.address) return;

    if (this.isLoading) return;

    this.setIsLoading(true);
    try {
      //todo: swap
    } catch (err) {
      console.error("er", err);
      toast.error("Error creating swap");
    } finally {
      this.setIsLoading(false);
    }
  };

  onSwitchTokens = () => {
    const tempToken = this.sellToken;
    this.setSellToken(this.buyToken as Token);
    this.setBuyToken(tempToken as Token);
    this.setPayAmount("0.00");
  };

  setIsLoading = (value: boolean) => (this.isLoading = value);
  setIsQuoteLoading = (value: boolean) => (this.isQuoteLoading = value);

  setSellToken(token: Token) {
    if (this.sellToken.symbol === token.symbol) return;
    this.setPayAmount("0.00");

    if (this.buyToken.symbol === token.symbol) {
      const prevSellToken = this.sellToken;
      this.sellToken = token;
      this.buyToken = prevSellToken;

      return;
    }

    this.sellToken = token;
  }

  setBuyToken(token: Token) {
    if (this.buyToken.symbol === token.symbol) return;
    this.setPayAmount("0.00");

    if (this.sellToken.symbol === token.symbol) {
      const prevBuyToken = this.buyToken;
      this.buyToken = token;
      this.sellToken = prevBuyToken;

      return;
    }

    this.buyToken = token;
  }

  setPayAmount(value: string) {
    this.payAmount = value;

    // Если сумма пустая или равна 0, сбрасываем receiveAmount
    if (!value || value === "0" || value === "0.00") {
      this.receiveAmount = "0.00";
      return;
    }

    // Вызываем дебаунсированную функцию получения котировки
    if (this.debouncedGetQuote) {
      this.debouncedGetQuote();
    } else {
      // Fallback к старой логике, если сервис не инициализирован
      this.fallbackToPriceCalculation();
    }
  }

  // setReceiveAmount(value: string) {
  //   this.receiveAmount = value;
  //   const buyTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.buyToken.symbol);
  //   const sellTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.sellToken.symbol);

  //   let payAmount = "0";
  //   if (sellTokenPrice.gt(0)) {
  //     payAmount = buyTokenPrice.times(value).div(sellTokenPrice).toString();
  //   }
  //   this.payAmount = payAmount;
  // }
}

export default SwapStore;
