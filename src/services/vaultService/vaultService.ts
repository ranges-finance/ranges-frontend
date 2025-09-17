import { getContract } from "viem";
import type { Config } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { writeContract } from "wagmi/actions";

import { VAULT_ABI } from "./vaultABI";

export interface SwapParams {
  poolId: string;
  kind: number; // 0 for GIVEN_IN, 1 for GIVEN_OUT
  assetIn: string;
  assetOut: string;
  amount: string;
  userData: string;
  sender: string;
  fromInternalBalance: boolean;
  recipient: string;
  toInternalBalance: boolean;
  limit: string;
  deadline: number;
}

export class VaultService {
  private vaultAddress: string;
  private wagmiConfig: Config;
  private contract: any;

  constructor(vaultAddress: string, wagmiConfig: Config) {
    this.vaultAddress = vaultAddress;
    this.wagmiConfig = wagmiConfig;

    const publicClient = getPublicClient(wagmiConfig);
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    this.contract = getContract({
      address: vaultAddress as `0x${string}`,
      abi: VAULT_ABI,
      client: publicClient,
    });
  }

  async swap(params: SwapParams): Promise<`0x${string}`> {
    const singleSwap = {
      poolId: params.poolId as `0x${string}`,
      kind: params.kind as 0 | 1,
      assetIn: params.assetIn as `0x${string}`,
      assetOut: params.assetOut as `0x${string}`,
      amount: BigInt(params.amount),
      userData: params.userData as `0x${string}`,
    };

    const funds = {
      sender: params.sender as `0x${string}`,
      fromInternalBalance: params.fromInternalBalance,
      recipient: params.recipient as `0x${string}`,
      toInternalBalance: params.toInternalBalance,
    };

    return await writeContract(this.wagmiConfig, {
      address: this.vaultAddress as `0x${string}`,
      abi: VAULT_ABI,
      functionName: "swap",
      args: [singleSwap, funds, BigInt(params.limit), BigInt(params.deadline)],
    });
  }
}
