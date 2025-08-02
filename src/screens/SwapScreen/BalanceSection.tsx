import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Text from "@components/Text";

import WalletIcon from "@assets/icons/wallet.svg?react";

interface BalanceSectionProps {
  isLoaded: boolean | null;
  balance: string;
  balanceUSD?: string;
  handleMaxAmount: () => void;
}

export const BalanceSection = observer(({ isLoaded, balance, balanceUSD, handleMaxAmount }: BalanceSectionProps) => {
  const theme = useTheme();

  return (
    <Root>
      <Text type="BODY">${balanceUSD ?? "-"}</Text>
      {isLoaded ? (
        <Balance onClick={handleMaxAmount}>
          <Text color={theme.colors.greenLight} type="BODY">
            {balance}
          </Text>
          <WalletIcon />
        </Balance>
      ) : null}
    </Root>
  );
});

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Balance = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;
