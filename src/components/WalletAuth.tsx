import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useAccount, useChainId, useConfig } from "wagmi";

import { useStores } from "../stores/useStores";

const WalletAuth: React.FC = observer(() => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const config = useConfig();

  const { accountStore } = useStores();

  useEffect(() => {
    accountStore.setAddress(address);
    accountStore.setIsConnected(isConnected);
    accountStore.setChainId(chainId);
    accountStore.setWagmiConfig(config);
  }, [address, isConnected, chainId]);

  return null; // Этот компонент не рендерит ничего
});

export default WalletAuth;
