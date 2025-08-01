import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { observer } from "mobx-react-lite";

import { useStores } from "@stores";

import Button, { ButtonProps } from "./Button";

interface Props extends ButtonProps {
  connectText?: string;
  children: React.ReactNode;
  targetKey: string;
}

export const ConnectWalletButton: React.FC<Props> = observer(
  ({ connectText = "Connect wallet", children, ...props }) => {
    const { accountStore } = useStores();
    const { login } = usePrivy();

    const handleConnectClick = async () => {
      await login();
    };

    if (!accountStore.isConnected) {
      return (
        <Button green {...props} onClick={handleConnectClick}>
          {connectText}
        </Button>
      );
    }

    return <>{children}</>;
  },
);
