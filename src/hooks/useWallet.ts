import { useAccount, useConnect, useDisconnect } from "wagmi";

export const useWallet = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, isPending: isConnectingWagmi } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    isConnected,
    isConnecting: isConnecting || isConnectingWagmi,
    wallet: address ? { address } : null,
    connect,
    disconnect,
  };
};
