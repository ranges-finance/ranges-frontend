import { toast } from "react-toastify";
import { makeAutoObservable } from "mobx";

import { Token } from "@entity";

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
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.tokens = this.rootStore.accountStore.tokens;
    this.sellToken = this.rootStore.accountStore.tokensBySymbol.VOV;
    this.buyToken = this.rootStore.accountStore.tokensBySymbol.LID;
    this.payAmount = "0.00";
    this.receiveAmount = "0.00";
  }

  get sellTokenPrice() {
    return this.rootStore.oracleStore.getPriceBySymbol(this.sellToken.symbol);
  }
  get buyTokenPrice() {
    return this.rootStore.oracleStore.getPriceBySymbol(this.buyToken.symbol);
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
    const tempToken = { ...this.sellToken };
    this.setSellToken(this.buyToken as Token);
    this.setBuyToken(tempToken as Token);
    this.setPayAmount("0.00");
  };

  setIsLoading = (value: boolean) => (this.isLoading = value);

  setSellToken(token: Token) {
    this.sellToken = token;
  }

  setBuyToken(token: Token) {
    this.buyToken = token;
  }

  setPayAmount(value: string) {
    this.payAmount = value;
    const buyTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.buyToken.symbol);
    const sellTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.sellToken.symbol);

    let receiveAmount = "0";
    if (!buyTokenPrice || !sellTokenPrice) {
      console.error("Error getting prices");
      return;
    }
    if (buyTokenPrice.gt(0)) {
      receiveAmount = sellTokenPrice.times(value).div(buyTokenPrice).toString();
    }
    this.receiveAmount = receiveAmount;
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
