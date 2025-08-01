import React from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { observer } from "mobx-react-lite";

import { useStores } from "@stores";

import Button, { ButtonProps } from "./Button";

interface Props extends ButtonProps {
  connectText?: string;
  children?: React.ReactNode;
  targetKey?: string;
}

export const ConnectWalletButton: React.FC<Props> = observer(
  ({ connectText = "Connect wallet", children, ...props }) => {
    const { openConnectModal } = useConnectModal();
    const { accountStore } = useStores();

    const handleConnectClick = async () => {
      openConnectModal?.();
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
