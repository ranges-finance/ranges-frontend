import { readContract } from "viem/actions";
import type { Config } from "wagmi";
import { getPublicClient } from "wagmi/actions";

import { RANGE_POOL_QUERIES_ABI } from "../../abi/rangePoolQueriesABI";

export class RangePoolQueriesService {
  private queriesAddress: `0x${string}`;
  private publicClient: any;

  constructor(queriesAddress: string, wagmiConfig: Config) {
    if (!queriesAddress || queriesAddress === "0x..." || queriesAddress.length !== 42) {
      throw new Error(`Invalid queries address: ${queriesAddress}`);
    }

    this.queriesAddress = queriesAddress as `0x${string}`;
    this.publicClient = getPublicClient(wagmiConfig);

    if (!this.publicClient) {
      throw new Error("Public client not available");
    }
  }

  /**
   * Получить количество токенов на выходе при обмене
   * @param poolAddress - адрес пула
   * @param amountIn - количество входящих токенов
   * @param assetIn - адрес входящего токена
   * @param assetOut - адрес исходящего токена
   * @returns количество исходящих токенов
   */
  async getAmountOut(poolAddress: string, amountIn: bigint, assetIn: string, assetOut: string): Promise<bigint> {
    try {
      const result = await readContract(this.publicClient, {
        address: this.queriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "getAmountOut",
        args: [poolAddress as `0x${string}`, amountIn, assetIn as `0x${string}`, assetOut as `0x${string}`],
      });

      return result as bigint;
    } catch (error) {
      console.error("Error calling getAmountOut:", error);
      throw new Error(`Failed to get amount out: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Получить количество токенов на входе для получения нужного количества на выходе
   * @param poolAddress - адрес пула
   * @param amountOut - количество исходящих токенов
   * @param assetIn - адрес входящего токена
   * @param assetOut - адрес исходящего токена
   * @returns количество входящих токенов
   */
  async getAmountIn(poolAddress: string, amountOut: bigint, assetIn: string, assetOut: string): Promise<bigint> {
    try {
      const result = await readContract(this.publicClient, {
        address: this.queriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "getAmountIn",
        args: [poolAddress as `0x${string}`, amountOut, assetIn as `0x${string}`, assetOut as `0x${string}`],
      });

      return result as bigint;
    } catch (error) {
      console.error("Error calling getAmountIn:", error);
      throw new Error(`Failed to get amount in: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Получить детальную информацию о свапе
   * @param poolAddress - адрес пула
   * @param amountIn - количество входящих токенов
   * @param assetIn - адрес входящего токена
   * @param assetOut - адрес исходящего токена
   * @returns объект с детальной информацией о свапе
   */
  async getSwapInfo(
    poolAddress: string,
    amountIn: bigint,
    assetIn: string,
    assetOut: string,
  ): Promise<{
    amountOut: bigint;
    amountInAfterFees: bigint;
    feeAmount: bigint;
    virtualBalanceIn: bigint;
    virtualBalanceOut: bigint;
    weightIn: bigint;
    weightOut: bigint;
    swapFeePercentage: bigint;
  }> {
    try {
      const result = await readContract(this.publicClient, {
        address: this.queriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "getSwapInfo",
        args: [poolAddress as `0x${string}`, amountIn, assetIn as `0x${string}`, assetOut as `0x${string}`],
      });

      const resultArray = result as bigint[];
      return {
        amountOut: resultArray[0],
        amountInAfterFees: resultArray[1],
        feeAmount: resultArray[2],
        virtualBalanceIn: resultArray[3],
        virtualBalanceOut: resultArray[4],
        weightIn: resultArray[5],
        weightOut: resultArray[6],
        swapFeePercentage: resultArray[7],
      };
    } catch (error) {
      console.error("Error calling getSwapInfo:", error);
      throw new Error(`Failed to get swap info: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Получить максимальную цену для пары токенов
   * @param poolAddress - адрес пула
   * @param tokenA - адрес первого токена
   * @param tokenB - адрес второго токена
   * @returns максимальная цена
   */
  async getMaxPrice(poolAddress: string, tokenA: string, tokenB: string): Promise<bigint> {
    try {
      const result = await readContract(this.publicClient, {
        address: this.queriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "getMaxPrice",
        args: [poolAddress as `0x${string}`, tokenA as `0x${string}`, tokenB as `0x${string}`],
      });

      return result as bigint;
    } catch (error) {
      console.error("Error calling getMaxPrice:", error);
      throw new Error(`Failed to get max price: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Получить минимальную цену для пары токенов
   * @param poolAddress - адрес пула
   * @param tokenA - адрес первого токена
   * @param tokenB - адрес второго токена
   * @returns минимальная цена
   */
  async getMinPrice(poolAddress: string, tokenA: string, tokenB: string): Promise<bigint> {
    try {
      const result = await readContract(this.publicClient, {
        address: this.queriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "getMinPrice",
        args: [poolAddress as `0x${string}`, tokenA as `0x${string}`, tokenB as `0x${string}`],
      });

      return result as bigint;
    } catch (error) {
      console.error("Error calling getMinPrice:", error);
      throw new Error(`Failed to get min price: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Получить балансы пула
   * @param poolAddress - адрес пула
   * @returns объект с токенами, балансами и poolId
   */
  async getPoolBalances(poolAddress: string): Promise<{
    tokens: `0x${string}`[];
    balances: bigint[];
    poolId: `0x${string}`;
  }> {
    try {
      const result = await readContract(this.publicClient, {
        address: this.queriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "getPoolBalances",
        args: [poolAddress as `0x${string}`],
      });

      const resultArray = result as [`0x${string}`[], bigint[], `0x${string}`];
      return {
        tokens: resultArray[0],
        balances: resultArray[1],
        poolId: resultArray[2],
      };
    } catch (error) {
      console.error("Error calling getPoolBalances:", error);
      throw new Error(`Failed to get pool balances: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Вычислить количество BPT токенов на входе для получения точного количества токенов на выходе
   * @param factBalances - фактические балансы
   * @param amountsOut - количества токенов на выходе
   * @param bptTotalSupply - общий запас BPT токенов
   * @returns количество BPT токенов на входе
   */
  async calcBptInGivenExactTokensOut(
    factBalances: bigint[],
    amountsOut: bigint[],
    bptTotalSupply: bigint,
  ): Promise<bigint> {
    try {
      const result = await readContract(this.publicClient, {
        address: this.queriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "calcBptInGivenExactTokensOut",
        args: [factBalances, amountsOut, bptTotalSupply],
      });

      return result as bigint;
    } catch (error) {
      console.error("Error calling calcBptInGivenExactTokensOut:", error);
      throw new Error(
        `Failed to calculate BPT in given exact tokens out: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Вычислить количество BPT токенов на выходе для точного количества токенов на входе
   * @param factBalances - фактические балансы
   * @param amountsIn - количества токенов на входе
   * @param bptTotalSupply - общий запас BPT токенов
   * @returns количество BPT токенов на выходе
   */
  async calcBptOutGivenExactTokensIn(
    factBalances: bigint[],
    amountsIn: bigint[],
    bptTotalSupply: bigint,
  ): Promise<bigint> {
    try {
      const result = await readContract(this.publicClient, {
        address: this.queriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "calcBptOutGivenExactTokensIn",
        args: [factBalances, amountsIn, bptTotalSupply],
      });

      return result as bigint;
    } catch (error) {
      console.error("Error calling calcBptOutGivenExactTokensIn:", error);
      throw new Error(
        `Failed to calculate BPT out given exact tokens in: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Вычислить количество токенов на входе для получения нужного количества на выходе
   * @param virtualBalanceIn - виртуальный баланс входящего токена
   * @param weightIn - вес входящего токена
   * @param virtualBalanceOut - виртуальный баланс исходящего токена
   * @param weightOut - вес исходящего токена
   * @param amountOut - количество токенов на выходе
   * @returns количество токенов на входе
   */
  async calcInGivenOut(
    virtualBalanceIn: bigint,
    weightIn: bigint,
    virtualBalanceOut: bigint,
    weightOut: bigint,
    amountOut: bigint,
  ): Promise<bigint> {
    try {
      const result = await readContract(this.publicClient, {
        address: this.queriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "calcInGivenOut",
        args: [virtualBalanceIn, weightIn, virtualBalanceOut, weightOut, amountOut],
      });

      return result as bigint;
    } catch (error) {
      console.error("Error calling calcInGivenOut:", error);
      throw new Error(`Failed to calculate in given out: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Вычислить количество токенов на выходе для данного количества на входе
   * @param virtualBalanceIn - виртуальный баланс входящего токена
   * @param weightIn - вес входящего токена
   * @param virtualBalanceOut - виртуальный баланс исходящего токена
   * @param weightOut - вес исходящего токена
   * @param amountIn - количество токенов на входе
   * @param factBalance - фактический баланс
   * @returns количество токенов на выходе
   */
  async calcOutGivenIn(
    virtualBalanceIn: bigint,
    weightIn: bigint,
    virtualBalanceOut: bigint,
    weightOut: bigint,
    amountIn: bigint,
    factBalance: bigint,
  ): Promise<bigint> {
    try {
      const result = await readContract(this.publicClient, {
        address: this.queriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "calcOutGivenIn",
        args: [virtualBalanceIn, weightIn, virtualBalanceOut, weightOut, amountIn, factBalance],
      });

      return result as bigint;
    } catch (error) {
      console.error("Error calling calcOutGivenIn:", error);
      throw new Error(`Failed to calculate out given in: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Вычислить минимальное соотношение
   * @param factBalances - фактические балансы
   * @param amounts - количества токенов
   * @returns минимальное соотношение
   */
  async calcRatioMin(factBalances: bigint[], amounts: bigint[]): Promise<bigint> {
    try {
      const result = await readContract(this.publicClient, {
        address: this.queriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "calcRatioMin",
        args: [factBalances, amounts],
      });

      return result as bigint;
    } catch (error) {
      console.error("Error calling calcRatioMin:", error);
      throw new Error(`Failed to calculate ratio min: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
