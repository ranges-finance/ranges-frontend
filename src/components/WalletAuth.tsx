import { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useAccount, useChainId, useConfig, useWalletClient } from "wagmi";

import { useStores } from "../stores/useStores";

const WalletAuth: React.FC = observer(() => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const { data: walletClient } = useWalletClient();

  const { accountStore } = useStores();
  const hasTriggeredAuth = useRef(false);
  const lastAddress = useRef<string | undefined>(undefined);

  useEffect(() => {
    accountStore.setAddress(address);
    accountStore.setIsConnected(isConnected);
    accountStore.setChainId(chainId);
    accountStore.setWagmiConfig(config);
  }, [address, isConnected, chainId]);

  useEffect(() => {
    // Сбрасываем флаг если кошелек отключен или изменился адрес
    if (!accountStore.isConnected || accountStore.address !== lastAddress.current) {
      hasTriggeredAuth.current = false;
      lastAddress.current = accountStore.address;
    }

    // Проверяем, что кошелек подключен, есть адрес, есть walletClient и аутентификация еще не запущена
    if (
      accountStore.isConnected &&
      accountStore.address &&
      walletClient &&
      !accountStore.isAuthenticating &&
      !hasTriggeredAuth.current
    ) {
      hasTriggeredAuth.current = true;
      // accountStore.triggerAuthentication(walletClient);
    }
  }, [accountStore.isConnected, accountStore.address, walletClient, accountStore.isAuthenticating]);

  return null; // Этот компонент не рендерит ничего
});

export default WalletAuth;
