import { toast } from "react-toastify";
import * as bolt11 from "bolt11";
import { makeAutoObservable } from "mobx";

import { apiService } from "@utils/api";

import { Token } from "@entity";

import RootStore from "./RootStore";

interface InvoiceDetails {
  timeExpireDate?: number;
  complete?: boolean;
  satoshis?: number | null;
  payment_secret?: string;
  payment_hash?: string;
  encoded: string;
  status?: "waiting_btc_payment" | "waiting_eth_payment" | "processing" | "completed" | "expired";
  txId?: string;
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
          .then(({ status, txId }) => this.invoice && this.setInvoice({ ...this.invoice, status, txId }));
      }
    }, 1000);
  }

  get sellTokenPrice() {
    return this.rootStore.oracleStore.getPriceBySymbol(this.sellToken.symbol);
  }
  get buyTokenPrice() {
    return this.rootStore.oracleStore.getPriceBySymbol(this.buyToken.symbol);
  }

  swapTokens = async () => {
    if (!this.rootStore.accountStore.address) return;

    if (this.isLoading) {
      this.setModalOpen(true);
      return;
    }
    this.setIsLoading(true);
    this.setModalOpen(true);
    try {
      const { lightningNetworkInvoice } = await apiService.createSwap({
        amountBtc: this.payAmount,
        amountEth: this.receiveAmount,
        ethAddress: this.rootStore.accountStore.address,
      });

      const decoded = bolt11.decode(lightningNetworkInvoice);
      console.log(decoded);
      // Extract required fields from decoded invoice
      const timeExpireDate = decoded.timeExpireDate;
      const complete = decoded.complete;
      const satoshis = decoded.satoshis;
      // Find tags by name
      const payment_secret = decoded.tags.find((tag) => tag.tagName === "payment_secret")?.data as string;
      const payment_hash = decoded.tags.find((tag) => tag.tagName === "payment_hash")?.data as string;

      this.setInvoice({
        timeExpireDate,
        complete,
        satoshis,
        payment_secret,
        payment_hash,
        encoded: lightningNetworkInvoice,
      });
      console.log(timeExpireDate, complete, satoshis, payment_secret, payment_hash);
    } catch (err) {
      console.error("er", err);
      toast.error("Error creating swap");
      this.setModalOpen(false);
    } finally {
      this.setIsLoading(false);
    }
  };

  //todo: temporary disabled for a demo
  onSwitchTokens = () => {
    // const sellTokenPrice = parseNumberWithCommas(this.sellTokenPrice);
    // const buyTokenPrice = parseNumberWithCommas(this.buyTokenPrice);
    // const tempToken = { ...this.sellToken };
    // this.setSellToken(this.buyToken as Token);
    // this.setBuyToken(tempToken as Token);
    // this.setPayAmount(this.receiveAmount);
    // const newReceiveAmount = Number(this.receiveAmount) * (buyTokenPrice / sellTokenPrice);
    // this.setReceiveAmount(newReceiveAmount.toFixed(4));
  };

  setModalOpen = (value: boolean) => (this.modalOpen = value);
  setIsLoading = (value: boolean) => (this.isLoading = value);
  setInvoice(invoice: InvoiceDetails) {
    this.invoice = invoice;
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
