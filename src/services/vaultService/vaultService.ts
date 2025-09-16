import { getContract } from "viem";
import type { Config } from "wagmi";
import { getPublicClient } from "wagmi/actions";

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

  async swap(params: SwapParams) {
    const singleSwap = {
      poolId: params.poolId,
      kind: params.kind,
      assetIn: params.assetIn,
      assetOut: params.assetOut,
      amount: params.amount,
      userData: params.userData,
    };

    const funds = {
      sender: params.sender,
      fromInternalBalance: params.fromInternalBalance,
      recipient: params.recipient,
      toInternalBalance: params.toInternalBalance,
    };

    return await this.contract.swap(singleSwap, funds, params.limit, params.deadline);
  }
}
