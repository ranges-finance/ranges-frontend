import lidaLogo from "@src/assets/tokens/lida.jpg";
import vladLogo from "@src/assets/tokens/vlad.png";
import vovaLogo from "@src/assets/tokens/vova.jpg";

export enum TOKENS {
  VOV = "VOV",
  VLD = "VLD",
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
    address: "0xdFa4A4E342E43bd85c7E7Fe4d4114fEC11DebF0D",
    type: TOKEN_TYPE.ERC20,
    logo: vovaLogo,
  },
  [TOKENS.VLD]: {
    symbol: TOKENS.VLD,
    name: "Vlad Token",
    decimals: 18,
    address: "0xAA6ef6F47522c2fb4e8CF8F83Ca98E56A8715bed",
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
