import { getContract } from "viem";
import type { Config } from "wagmi";
import { getPublicClient } from "wagmi/actions";

import { RANGE_POOL_ABI } from "../../abi/rangePoolABI";

export class RangePoolService {
  private poolAddress: string;
  private contract: any;
  private publicClient: any;

  constructor(poolAddress: string, wagmiConfig: Config) {
    if (!poolAddress || poolAddress === "0x..." || poolAddress.length !== 42) {
      throw new Error(`Invalid pool address: ${poolAddress}`);
    }

    this.poolAddress = poolAddress;
    this.publicClient = getPublicClient(wagmiConfig);

    if (!this.publicClient) {
      throw new Error("Public client not available");
    }

    this.contract = getContract({
      address: poolAddress as `0x${string}`,
      abi: RANGE_POOL_ABI,
      client: this.publicClient,
    });
  }

  async getNormalizedWeights(): Promise<string[]> {
    if (!this.contract || typeof this.contract.getNormalizedWeights !== "function") {
      throw new Error("Contract method getNormalizedWeights not available");
    }

    return await this.contract.getNormalizedWeights();
  }
}
