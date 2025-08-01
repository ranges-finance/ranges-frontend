import assert from "assert";

import { ethers } from "ethers";

import TOKEN_LOGOS from "@constants/tokenLogos";

import { Token } from "@entity";

import configProdJSON from "@src/config.json";

export interface Market {
  isOpen: boolean;
  marketName: string;
  owner: string;
  baseAssetId: string;
  baseAssetDecimals: number;
  quoteAssetId: string;
  quoteAssetDecimals: number;
  priceDecimals: number;
  version: number;
  contractId: string;
  precision: number;
}

function createConfig() {
  const CURRENT_CONFIG_VER = "1.8.1";
  const configJSON = configProdJSON;
  assert(configJSON.version === CURRENT_CONFIG_VER, "Version mismatch");

  const tokens = configJSON.tokens.map(({ name, symbol, decimals, assetId, priceFeed }) => {
    return new Token({
      name,
      symbol,
      decimals,
      assetId,
      logo: TOKEN_LOGOS[symbol],
      priceFeed,
    });
  });

  const markets = configJSON.markets.filter((m) => m.isOpen) as Market[];

  const tokensBySymbol = tokens.reduce((acc, t) => ({ ...acc, [t.symbol]: t }), {} as Record<string, Token>);

  const tokensByAssetId = tokens.reduce(
    (acc, t) => ({ ...acc, [t.assetId.toLowerCase()]: t }),
    {} as Record<string, Token>,
  );

  const RPC_URLS = {
    MAINNET: "https://ethereum.publicnode.com",
  };

  // Создаем провайдер для основной сети
  const mainnetProvider = new ethers.JsonRpcProvider(RPC_URLS.MAINNET);

  return {
    APP: configJSON,
    MARKETS: markets,
    ALL_MARKETS: configJSON.markets,
    TOKENS: tokens,
    TOKENS_BY_SYMBOL: tokensBySymbol,
    TOKENS_BY_ASSET_ID: tokensByAssetId,
    RPC_URLS,
    PROVIDERS: {
      MAINNET: mainnetProvider,
    },
  };
}

export const CONFIG = createConfig();
