import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Ranges",
  projectId: "546a21374c699f782f21670a1405a02a", //https://dashboard.reown.com/86d88bdd-a491-4c22-b100-ec81bd008af2/83ff31f5-be6f-47f1-b400-f559a6a68de0

  chains: [sepolia],
  ssr: true,
});
