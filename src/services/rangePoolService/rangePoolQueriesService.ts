import { readContract } from "viem/actions";
import type { Config } from "wagmi";
import { getPublicClient } from "wagmi/actions";

import { RANGE_POOL_QUERIES_ABI } from "./rangePoolQueriesABI";

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
}
