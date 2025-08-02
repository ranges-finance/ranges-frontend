import { toast } from "react-toastify";
import * as bolt11 from "bolt11";
import { makeAutoObservable } from "mobx";

import { COINS } from "@constants/networkConfig";
import { apiService, SwapDetails } from "@utils/api";

import { Token } from "@entity";

import RootStore from "./RootStore";

interface InvoiceDetails {
  timeExpireDate?: number;
  complete?: boolean;
  satoshis?: number | null;
  payment_secret?: string;
  payment_hash?: string;
  encoded: string;
}

class SwapStore {
  tokens: Token[];
  sellToken: Token;
  buyToken: Token;
  // maybe use BN
  payAmount: string;
  receiveAmount: string;
  modalOpen: boolean = false;
  isLoading: boolean = false;
  invoice: InvoiceDetails | null = null;
  swapDetails: SwapDetails | null = null;
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.tokens = this.rootStore.accountStore.tokens;
    this.sellToken = this.rootStore.accountStore.tokensBySymbol.BTC;
    this.buyToken = this.rootStore.accountStore.tokensBySymbol.ETH;
    this.payAmount = "0.00";
    this.receiveAmount = "0.00";

    setInterval(() => {
      if (this.invoice && this.invoice.payment_hash) {
        apiService
          .getSwap(this.invoice.payment_hash)
          .then(({ status, txId }) => this.swapDetails && this.setSwapDetails({ ...this.swapDetails, status, txId }));
      }
    }, 1000);
  }

  get sellTokenPrice() {
    return this.rootStore.oracleStore.getPriceBySymbol(this.sellToken.symbol);
  }
  get buyTokenPrice() {
    return this.rootStore.oracleStore.getPriceBySymbol(this.buyToken.symbol);
  }

  private swapTokensBtcEth = async () => {
    if (!this.rootStore.accountStore.address) return;
    const { lightningNetworkInvoice } = await apiService.createSwap({
      amountBtc: this.payAmount,
      amountEth: this.receiveAmount,
      ethAddress: this.rootStore.accountStore.address,
    });
    this.setInvoice(lightningNetworkInvoice);
    apiService.getSwap(lightningNetworkInvoice).then((swapDetails) => this.setSwapDetails(swapDetails));
  };

  attachInvoice = async (invoice: string) => {
    try {
      this.setInvoice(invoice);
    } catch (err) {
      console.error("er", err);
      toast.error("Error attaching invoice");
    }
  };

  swapTokens = async () => {
    if (!this.rootStore.accountStore.address) return;

    if (this.isLoading) {
      this.setModalOpen(true);
      return;
    }
    this.setIsLoading(true);
    this.setModalOpen(true);
    try {
      if (!this.isSellEth) this.swapTokensBtcEth();
    } catch (err) {
      console.error("er", err);
      toast.error("Error creating swap");
      this.setModalOpen(false);
    } finally {
      this.setIsLoading(false);
    }
  };

  get isSellEth() {
    return this.sellToken.symbol === COINS.ETH;
  }

  onSwitchTokens = () => {
    const tempToken = { ...this.sellToken };
    this.setSellToken(this.buyToken as Token);
    this.setBuyToken(tempToken as Token);
    this.setPayAmount("0.00");
  };

  cancelOrder = () => {
    this.setInvoice(null);
    this.setModalOpen(false);
    this.setIsLoading(false);
  };

  setModalOpen = (value: boolean) => (this.modalOpen = value);
  setIsLoading = (value: boolean) => (this.isLoading = value);

  setSwapDetails(swapDetails: SwapDetails | null) {
    this.swapDetails = swapDetails;
  }

  setInvoice(invoice: string | null) {
    if (invoice === null) {
      this.invoice = null;
      this.setSwapDetails(null);
      return;
    }

    const decoded = bolt11.decode(invoice);
    console.log(decoded);
    // Extract required fields from decoded invoice
    const timeExpireDate = decoded.timeExpireDate;
    const complete = decoded.complete;
    const satoshis = decoded.satoshis;
    // Find tags by name
    const payment_secret = decoded.tags.find((tag) => tag.tagName === "payment_secret")?.data as string;
    const payment_hash = decoded.tags.find((tag) => tag.tagName === "payment_hash")?.data as string;

    this.invoice = {
      timeExpireDate,
      complete,
      satoshis,
      payment_secret,
      payment_hash,
      encoded: invoice,
    };
  }

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
    if (buyTokenPrice.gt(0)) {
      receiveAmount = sellTokenPrice.times(value).div(buyTokenPrice).toString();
    }
    this.receiveAmount = receiveAmount;
  }

  setReceiveAmount(value: string) {
    this.receiveAmount = value;
    const buyTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.buyToken.symbol);
    const sellTokenPrice = this.rootStore.oracleStore.getPriceBySymbol(this.sellToken.symbol);

    let payAmount = "0";
    if (sellTokenPrice.gt(0)) {
      payAmount = buyTokenPrice.times(value).div(sellTokenPrice).toString();
    }
    this.payAmount = payAmount;
  }
}

export default SwapStore;
