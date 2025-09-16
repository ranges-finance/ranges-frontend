import lidaLogo from "@src/assets/tokens/lida.jpg";
import vladLogo from "@src/assets/tokens/vlad.jpg";

export enum TOKENS {
  VOV = "VOV",
  LIDA = "LID",
}

export enum TOKEN_TYPE {
  Native = "Native",
  ERC20 = "ERC20",
}

export type NativeTokenConfig = {
  type: TOKEN_TYPE.Native;
  symbol: TOKENS; // should be unique
  name: string;
  decimals: number;
  logo?: string;
  priceFeed?: string;
};

export type ERC20TokenConfig = {
  type: TOKEN_TYPE.ERC20;
  symbol: TOKENS; // should be unique
  name: string;
  decimals: number;
  address: `0x${string}`; // should be unique
  logo?: string;
  priceFeed?: string;
};

export type TTokenConfig = NativeTokenConfig | ERC20TokenConfig;

export const SepoliaTokenConfig: Record<TOKENS, TTokenConfig> = {
  [TOKENS.VOV]: {
    symbol: TOKENS.VOV,
    name: "Vova Token",
    decimals: 18,
    address: "0x86D7Dc8807C1C24b49684104D63a7d009Ccd4Cca",
    type: TOKEN_TYPE.ERC20,
    logo: vladLogo,
  },
  [TOKENS.LIDA]: {
    symbol: TOKENS.LIDA,
    name: "Lida Token",
    decimals: 18,
    address: "0x6778CbA88EDd82244363fd8c77dA539b72f79a9b",
    type: TOKEN_TYPE.ERC20,
    logo: lidaLogo,
  },
};
