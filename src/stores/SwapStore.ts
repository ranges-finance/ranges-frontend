import { makeAutoObservable } from "mobx";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { getPublicClient, waitForTransactionReceipt, writeContract } from "wagmi/actions";

import { NetworkConfig, NETWORKS } from "@constants/networkConfig";
import { wagmiConfig } from "@constants/wagmiConfig";
import { debounceAsync } from "@utils/debounce";

import { Token } from "@entity";

import { RangePoolQueriesService } from "../services/rangePoolService";
import { VaultService } from "../services/vaultService";

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
  isApproving: boolean = false;
  isSwapping: boolean = false;
  private rangePoolQueriesService: RangePoolQueriesService | null = null;
  private vaultService: VaultService | null = null;
  private debouncedGetQuote: (() => void) | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.tokens = this.rootStore.accountStore.tokens;
    this.sellToken = this.rootStore.accountStore.tokensBySymbol.VOV;
    this.buyToken = this.rootStore.accountStore.tokensBySymbol.LID;
    this.payAmount = "0.00";
    this.receiveAmount = "0.00";

    this.initializeRangePoolQueriesService();
    this.initializeVaultService();
  }

  get sellTokenPrice() {
    return this.rootStore.oracleStore.getTokenIndexPrice(this.sellToken.priceFeed);
  }
  get buyTokenPrice() {
    return this.rootStore.oracleStore.getTokenIndexPrice(this.buyToken.priceFeed);
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

  private initializeVaultService() {
    try {
      const networkConfig = NetworkConfig[NETWORKS.SEPOLIA];
      this.vaultService = new VaultService(networkConfig.vaultAddress, wagmiConfig);
    } catch (error) {
      console.error("Failed to initialize VaultService:", error);
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
    const buyTokenPrice = this.rootStore.oracleStore.getTokenIndexPrice(this.buyToken.priceFeed);
    const sellTokenPrice = this.rootStore.oracleStore.getTokenIndexPrice(this.sellToken.priceFeed);

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

  // Проверяем, нужно ли делать approve
  private async checkAllowance(tokenAddress: string, spenderAddress: string, amount: bigint): Promise<boolean> {
    try {
      const publicClient = getPublicClient(wagmiConfig);
      const allowance = await publicClient?.readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [this.rootStore.accountStore.address!, spenderAddress as `0x${string}`],
      });

      return allowance >= amount;
    } catch (error) {
      console.error("Error checking allowance:", error);
      return false;
    }
  }

  // Выполняем approve токена
  private async approveToken(tokenAddress: string, spenderAddress: string, amount: bigint): Promise<string> {
    try {
      this.setIsApproving(true);

      const hash = await writeContract(wagmiConfig, {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddress as `0x${string}`, amount],
      });

      // Ждем подтверждения транзакции
      await waitForTransactionReceipt(wagmiConfig, {
        hash: hash,
      });

      return hash;
    } catch (error) {
      console.error("Error approving token:", error);
      throw error;
    } finally {
      this.setIsApproving(false);
    }
  }

  // Получаем poolId для swap
  private async getPoolId(): Promise<string> {
    try {
      const publicClient = getPublicClient(wagmiConfig);
      const poolId = await publicClient?.readContract({
        address: NetworkConfig[NETWORKS.SEPOLIA].poolAddress,
        abi: [
          {
            inputs: [],
            name: "getPoolId",
            outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "getPoolId",
      });

      return poolId as string;
    } catch (error) {
      console.error("Error getting pool ID:", error);
      throw error;
    }
  }

  swapTokens = async () => {
    if (!this.rootStore.accountStore.address) return;

    if (this.isLoading) return;

    this.setIsLoading(true);
    try {
      const networkConfig = NetworkConfig[NETWORKS.SEPOLIA];
      const amountIn = parseUnits(this.payAmount, this.sellToken.decimals);
      const amountOut = parseUnits(this.receiveAmount, this.buyToken.decimals);

      // Проверяем, нужно ли делать approve
      const needsApproval = !(await this.checkAllowance(this.sellToken.address!, networkConfig.vaultAddress, amountIn));

      if (needsApproval) {
        this.rootStore.notificationStore.info({ text: "Approving token..." });
        await this.approveToken(this.sellToken.address!, networkConfig.vaultAddress, amountIn);
        this.rootStore.notificationStore.success({ text: "Token approved successfully!" });
      }

      // Выполняем swap
      this.setIsSwapping(true);
      this.rootStore.notificationStore.info({ text: "Executing swap..." });

      const poolId = await this.getPoolId();

      const swapParams = {
        poolId,
        kind: 0, // GIVEN_IN
        assetIn: this.sellToken.address!,
        assetOut: this.buyToken.address!,
        amount: amountIn.toString(),
        userData: "0x",
        sender: this.rootStore.accountStore.address,
        fromInternalBalance: false,
        recipient: this.rootStore.accountStore.address,
        toInternalBalance: false,
        limit: amountOut.toString(),
        deadline: Math.floor(Date.now() / 1000) + 1800, // 30 минут
      };

      const hash = await this.vaultService!.swap(swapParams);

      // Ждем подтверждения транзакции
      await waitForTransactionReceipt(wagmiConfig, {
        hash: hash,
      });

      // Показываем успешный toast с ссылкой на транзакцию
      this.rootStore.notificationStore.success({
        text: "Swap completed successfully!",
        hash: hash,
      });

      // Обновляем балансы после успешного свапа
      await this.rootStore.balanceStore.updateTokenBalances();

      // Сбрасываем суммы
      this.setPayAmount("0.00");
      this.receiveAmount = "0.00";
    } catch (err) {
      console.error("Error during swap:", err);
      this.rootStore.notificationStore.error({
        text: "Error during swap",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      this.setIsLoading(false);
      this.setIsSwapping(false);
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
  setIsApproving = (value: boolean) => (this.isApproving = value);
  setIsSwapping = (value: boolean) => (this.isSwapping = value);

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
