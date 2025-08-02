import { makeAutoObservable } from "mobx";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";
import { parseNumberWithCommas } from "@utils/swapUtils";

import { Token } from "@entity";

import RootStore from "./RootStore";

class SwapStore {
  tokens: Token[];
  sellToken: Token;
  buyToken: Token;
  // maybe use BN
  payAmount: string;
  receiveAmount: string;
  buyTokenPrice: string;
  sellTokenPrice: string;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.tokens = this.rootStore.accountStore.tokens;
    console.log(this.rootStore.accountStore.tokensBySymbol.BTC);
    this.sellToken = this.rootStore.accountStore.tokensBySymbol.BTC;
    this.buyToken = this.rootStore.accountStore.tokensBySymbol.ETH;
    this.payAmount = "0.00";
    this.receiveAmount = "0.00";

    this.buyTokenPrice = this.getPrice(this.buyToken);
    this.sellTokenPrice = this.getPrice(this.sellToken);

    // autorun(async () => {
    //   await this.initialize();
    // });
  }

  async initialize() {
    this.updateTokens();
  }

  isBuy = () => {};

  getTokenPair = (_assetId: string) => {};

  getPrice(token: Token): string {
    const { oracleStore } = this.rootStore;
    return token.priceFeed
      ? BN.formatUnits(oracleStore.getTokenIndexPrice(token.priceFeed), DEFAULT_DECIMALS).toFormat(2)
      : "0";
  }

  getMarketPair = (_baseAsset: Token, _quoteToken: Token) => {};

  updateTokens() {
    this.tokens = this.rootStore.accountStore.tokens;
    this.setSellToken(this.tokens.find((el) => el.assetId === this.sellToken.assetId) ?? this.tokens[0]);
    this.setBuyToken(this.tokens.find((el) => el.assetId === this.buyToken.assetId) ?? this.tokens[1]);
    this.buyTokenPrice = this.getPrice(this.buyToken);
    this.sellTokenPrice = this.getPrice(this.sellToken);
  }

  swapTokens = async ({ slippage: _slippage }: { slippage: number }): Promise<boolean> => {
    return true;
  };

  onSwitchTokens = () => {
    const sellTokenPrice = parseNumberWithCommas(this.sellTokenPrice);
    const buyTokenPrice = parseNumberWithCommas(this.buyTokenPrice);

    const tempToken = { ...this.sellToken };

    this.setSellToken(this.buyToken as Token);
    this.setBuyToken(tempToken as Token);

    this.setPayAmount(this.receiveAmount);

    const newReceiveAmount = Number(this.receiveAmount) * (buyTokenPrice / sellTokenPrice);
    this.setReceiveAmount(newReceiveAmount.toFixed(4));
  };

  setSellToken(token: Token) {
    this.sellToken = token;
    this.sellTokenPrice = this.getPrice(token);
  }

  setBuyToken(token: Token) {
    this.buyToken = token;
    this.buyTokenPrice = this.getPrice(token);
  }

  setPayAmount(value: string) {
    this.payAmount = value;
    const buyTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.buyToken.symbol);
    const sellTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.sellToken.symbol);
    console.log(buyTokenPrice.times(value).div(sellTokenPrice).toString());
    this.receiveAmount = buyTokenPrice.times(value).div(sellTokenPrice).toString();
  }

  setReceiveAmount(value: string) {
    this.receiveAmount = value;
    const buyTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.buyToken.symbol);
    const sellTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.sellToken.symbol);
    this.payAmount = sellTokenPrice.times(value).div(buyTokenPrice).toString();
  }
}

export default SwapStore;
