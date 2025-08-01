import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "hits4fun",
  projectId: "79696fd6ff2f660aaa3a3ed92e36472f",

  chains: [sepolia, polygon, mainnet],
  ssr: true,
});
