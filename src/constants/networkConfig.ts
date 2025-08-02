export const NETWORKS = {
  SEPOLIA: "sepolia",
  ETHEREUM: "ethereum",
  POLYGON: "polygon",
};

export const TICKET_PRICE = 0.005;

export const COINS = {
  ETH: "ETH",
  BTC: "BTC",
} as const;

export type TokenConfig = {
  symbol: string;
  decimals: number;
  address?: `0x${string}`;
  isNative?: boolean;
  priceFeed?: string;
};

type NetworkConfig = {
  name: string;
  title?: string;
  chainId: number;
  rpc: string;
  testnet?: boolean;
  tokens: TokenConfig[];
  explorer: string;
};

//price feeds https://www.pyth.network/developers/price-feed-ids
export const NetworkConfig: Record<string, NetworkConfig> = {
  sepolia: {
    name: NETWORKS.SEPOLIA,
    chainId: 11155111,
    rpc: "https://ethereum-sepolia.publicnode.com",
    explorer: "https://sepolia.etherscan.io",
    tokens: [
      {
        symbol: COINS.ETH,
        decimals: 18,
        isNative: true,
        priceFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      },
      {
        symbol: COINS.BTC,
        decimals: 6,
        address: "0xA7e32df83540e02A0E19f9B8CccE10F183Ce0b53",
        priceFeed: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      },
    ],
  },

  ethereum: {
    name: NETWORKS.ETHEREUM,
    chainId: 1,
    rpc: "https://ethereum.publicnode.com",
    explorer: "https://etherscan.io",
    tokens: [
      {
        symbol: COINS.ETH,
        decimals: 18,
        isNative: true,
        priceFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      },
      {
        symbol: COINS.BTC,
        decimals: 6,
        address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        priceFeed: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      },
    ],
  },
  polygon: {
    name: NETWORKS.POLYGON,
    chainId: 137,
    rpc: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
    tokens: [
      {
        symbol: COINS.ETH,
        decimals: 18,
        isNative: true,
        priceFeed: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      },
      {
        symbol: COINS.BTC,
        decimals: 8,
        address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
        priceFeed: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      },
    ],
  },
};
