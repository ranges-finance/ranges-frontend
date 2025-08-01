import { useCallback, useEffect, useState } from "react";
import { usePrivy, Wallet } from "@privy-io/react-auth";

import { useStores } from "@stores";

export const useWallet = () => {
  const { accountStore } = useStores();
  const { connect, isConnecting } = { connect: () => {}, isConnecting: false }; //todo
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const { user, authenticated, logout } = usePrivy();

  const handleDisconnect = useCallback(async () => {
    await logout();
    await accountStore.disconnect();
    setWallet(null);
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (authenticated && user) {
        const wallet = user?.wallet ?? null;
        setWallet(wallet);
      }
    };
    checkConnection();
  }, [user, authenticated]);

  useEffect(() => {
    if (!user?.wallet) {
      setWallet(null);
    } else {
      accountStore.connect(user?.wallet);
    }
  }, [authenticated, user]);

  return {
    isConnected: authenticated,
    isConnecting,
    wallet,
    connect,
    disconnect: handleDisconnect,
  };
};
