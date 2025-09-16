import { type Address, createPublicClient, http } from "viem";

import { TNetworkConfig } from "@constants/networkConfig";
import { ERC20TokenConfig, NativeTokenConfig, TOKEN_TYPE, TTokenConfig } from "@constants/tokenConfig";

import BN from "./BN";

// Минимальный ABI для ERC-20 токенов
const ERC20_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface TokenBalance {
  symbol: string;
  balance: number;
  decimals: number;
  address?: `0x${string}`;
  isNative?: boolean;
  chainId: number;
  chainName: string;
}

export interface PortfolioBalances {
  [chainId: number]: {
    chainName: string;
    nativeBalance: TokenBalance;
    tokenBalances: TokenBalance[];
  };
}

// Получение всех токенов для сети
function getTokens(tokens: TTokenConfig[]) {
  return {
    nativeToken: tokens.find((token) => token.type === TOKEN_TYPE.Native) as NativeTokenConfig,
    erc20Tokens: tokens.filter((token) => token.type === TOKEN_TYPE.ERC20 && token.address) as ERC20TokenConfig[],
  };
}

// Получение балансов для одной сети
export async function fetchChainBalances(
  chainId: number,
  address: Address,
  networkConfig: TNetworkConfig,
  tokens: TTokenConfig[],
): Promise<PortfolioBalances[number] | null> {
  // console.log("fetchChainBalances", chainId, address, networkConfig);
  try {
    const rpcUrl = networkConfig.rpc;
    if (!rpcUrl) {
      console.warn(`No RPC configured for chain ${chainId}`);
      return null;
    }

    const client = createPublicClient({
      chain: {
        id: chainId,
        name: networkConfig.name,
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: { default: { http: [rpcUrl] } },
      },
      transport: http(),
    });

    const { nativeToken, erc20Tokens } = getTokens(tokens);

    // Получаем нативный баланс
    const nativeBalance = await client.getBalance({ address });

    // Подготавливаем контракты для мультиколла
    const contracts = [];

    // ERC-20 токены
    for (const token of erc20Tokens) {
      if (token.address) {
        contracts.push({
          address: token.address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        });
      }
    }

    // Выполняем мультиколл
    let multicallResults: any[] = [];
    if (contracts.length > 0) {
      try {
        multicallResults = await client.multicall({
          contracts,
          allowFailure: true,
        });
      } catch (error) {
        console.warn(`Multicall failed for chain ${chainId}, fetching individually:`, error);

        // Fallback: получаем балансы по одному
        multicallResults = await Promise.all(
          contracts.map(async (contract) => {
            try {
              const result = await client.readContract({
                address: contract.address,
                abi: contract.abi,
                functionName: "balanceOf" as const,
                args: contract.args as [`0x${string}`],
              });
              return { status: "success", result };
            } catch (err) {
              console.error(`Error fetching balance for ${contract.address}:`, err);
              return { status: "failure", result: 0n };
            }
          }),
        );
      }
    }

    // Обрабатываем результаты
    const tokenBalances: TokenBalance[] = [];

    // Обрабатываем ERC-20 токены
    for (let i = 0; i < erc20Tokens.length; i++) {
      const token = erc20Tokens[i];
      const result = multicallResults[i];

      if (token.address && result?.status === "success") {
        const balance = BN.formatUnits(result.result, token.decimals).toNumber();
        tokenBalances.push({
          symbol: token.symbol,
          balance,
          decimals: token.decimals,
          address: token.address,
          isNative: false,
          chainId,
          chainName: networkConfig.name,
        });
      }
    }

    // Нативный токен
    const nativeBalanceFormatted: TokenBalance = {
      symbol: nativeToken?.symbol || "ETH",
      balance: BN.formatUnits(nativeBalance.toString(), nativeToken?.decimals || 18).toNumber(),
      decimals: nativeToken?.decimals || 18,
      isNative: true,
      chainId,
      chainName: networkConfig.name,
    };

    return {
      chainName: networkConfig.name,
      nativeBalance: nativeBalanceFormatted,
      tokenBalances,
    };
  } catch (error) {
    console.error(`Error fetching balances for chain ${chainId}:`, error);
    return null;
  }
}

// Утилита для форматирования балансов в удобный формат
export function formatBalancesForStore(portfolioBalances: PortfolioBalances): Record<string, any> {
  const formatted: Record<string, any> = {};

  Object.values(portfolioBalances).forEach((chainData) => {
    // Добавляем нативный баланс
    if (chainData.nativeBalance) {
      formatted[chainData.nativeBalance.symbol] = {
        balance: chainData.nativeBalance.balance,
        decimals: chainData.nativeBalance.decimals,
        isNative: chainData.nativeBalance.isNative,
        symbol: chainData.nativeBalance.symbol,
        chainId: chainData.nativeBalance.chainId,
        chainName: chainData.nativeBalance.chainName,
      };
    }

    // Добавляем ERC-20 токены
    chainData.tokenBalances.forEach((token: TokenBalance) => {
      formatted[token.symbol] = {
        balance: token.balance,
        decimals: token.decimals,
        address: token.address,
        isNative: token.isNative,
        symbol: token.symbol,
        chainId: token.chainId,
        chainName: token.chainName,
      };
    });
  });

  return formatted;
}
