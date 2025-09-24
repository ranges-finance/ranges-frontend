import { type Address, createPublicClient, http } from "viem";

import { TNetworkConfig } from "@constants/networkConfig";
import { TTokenConfig } from "@constants/tokenConfig";

import { RANGE_POOL_QUERIES_ABI } from "@src/abi/rangePoolQueriesABI";

import { RANGE_POOL_ABI } from "../abi/rangePoolABI";
import { VAULT_ABI } from "../abi/vaultABI";

import BN from "./BN";

export interface PoolData {
  tokens: Address[];
  virtualBalances: bigint[];
  actualBalances: bigint[];
  minPrice: bigint;
  maxPrice: bigint;
}

export interface FormattedPoolData {
  tokens: Address[];
  virtualBalances: number[];
  actualBalances: number[];
  minPrice: number;
  maxPrice: number;
}

/**
 * Фетчер данных пула
 * Получает виртуальные и фактические балансы, а также реальные цены min/max
 */
export async function fetchRangePoolData(
  networkConfig: TNetworkConfig,
  tokens: TTokenConfig[],
  tokenA: Address,
  tokenB: Address,
): Promise<PoolData | null> {
  try {
    const rpcUrl = networkConfig.rpc;
    if (!rpcUrl) {
      console.warn(`No RPC configured for chain ${networkConfig.chainId}`);
      return null;
    }

    const client = createPublicClient({
      chain: {
        id: networkConfig.chainId,
        name: networkConfig.name,
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: { default: { http: [rpcUrl] } },
      },
      transport: http(),
    });

    // Простые отдельные запросы без мультиколла
    // 1. Получаем poolId
    const poolId = (await client.readContract({
      address: networkConfig.poolAddress,
      abi: RANGE_POOL_ABI,
      functionName: "getPoolId",
      args: [],
    })) as `0x${string}`;

    // 2. Получаем виртуальные балансы
    const virtualBalances = (await client.readContract({
      address: networkConfig.poolAddress,
      abi: RANGE_POOL_ABI,
      functionName: "getVirtualBalances",
      args: [],
    })) as bigint[];

    // 3. Получаем фактические балансы и токены
    const actualBalancesResult = await client.readContract({
      address: networkConfig.vaultAddress,
      abi: VAULT_ABI,
      functionName: "getPoolTokens",
      args: [poolId],
    });

    const [tokens, actualBalances] = actualBalancesResult as [Address[], bigint[], bigint];

    // 4. Получаем реальные цены через RangePoolQueries
    const [minPrice, maxPrice] = await Promise.all([
      client.readContract({
        address: networkConfig.rangePoolQueriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "getMinPrice",
        args: [networkConfig.poolAddress, tokenA, tokenB],
      }) as Promise<bigint>,
      client.readContract({
        address: networkConfig.rangePoolQueriesAddress,
        abi: RANGE_POOL_QUERIES_ABI,
        functionName: "getMaxPrice",
        args: [networkConfig.poolAddress, tokenA, tokenB],
      }) as Promise<bigint>,
    ]);

    const poolData = {
      tokens,
      virtualBalances,
      actualBalances,
      minPrice,
      maxPrice,
    };

    console.log("Successfully fetched pool data:", {
      poolId,
      tokens: poolData.tokens,
      virtualBalances: poolData.virtualBalances.map((b) => b.toString()),
      actualBalances: poolData.actualBalances.map((b) => b.toString()),
      minPrice: poolData.minPrice.toString(),
      maxPrice: poolData.maxPrice.toString(),
    });

    return poolData;
  } catch (error) {
    console.error("Error fetching range pool data:", error);
    console.log("Network config:", {
      chainId: networkConfig.chainId,
      name: networkConfig.name,
      poolAddress: networkConfig.poolAddress,
      vaultAddress: networkConfig.vaultAddress,
      rangePoolQueriesAddress: networkConfig.rangePoolQueriesAddress,
    });
    return null;
  }
}

/**
 * Форматирует данные пула с учетом decimals токенов
 */
export function formatPoolData(poolData: PoolData, tokens: TTokenConfig[]): FormattedPoolData {
  const formatBalance = (balance: bigint, tokenAddress: Address): number => {
    const token = tokens.find((t) => "address" in t && t.address === tokenAddress);
    if (!token || !("address" in token)) return 0;
    return BN.formatUnits(balance.toString(), token.decimals).toNumber();
  };

  return {
    tokens: poolData.tokens,
    virtualBalances: poolData.virtualBalances.map((balance, index) => formatBalance(balance, poolData.tokens[index])),
    actualBalances: poolData.actualBalances.map((balance, index) => formatBalance(balance, poolData.tokens[index])),
    minPrice: BN.formatUnits(poolData.minPrice.toString(), 18).toNumber(),
    maxPrice: BN.formatUnits(poolData.maxPrice.toString(), 18).toNumber(),
  };
}

/**
 * Основная функция для получения всех данных пула
 */
export async function getRangePoolData(
  networkConfig: TNetworkConfig,
  tokens: TTokenConfig[],
  tokenA: Address,
  tokenB: Address,
): Promise<FormattedPoolData | null> {
  const poolData = await fetchRangePoolData(networkConfig, tokens, tokenA, tokenB);

  if (!poolData) {
    return null;
  }

  return formatPoolData(poolData, tokens);
}
