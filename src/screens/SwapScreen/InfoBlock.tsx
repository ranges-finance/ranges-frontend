import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Text from "@components/Text";
import { media } from "@themes/breakpoints";

import ArrowUpIcon from "@assets/icons/arrowUp.svg?react";

import { useStores } from "@stores";

import BN from "@utils/BN";

// import { SlippageSettings } from "./SlippageSettings";

interface InfoBlockProps {
  // slippage: number;
  // updateSlippage: (percent: number) => void;
}

export const InfoBlock: React.FC<InfoBlockProps> = () => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const { swapStore } = useStores();
  const exchangeRate = 1;

  const virtualBalance = BN.ZERO;
  const factBalance = BN.ZERO;
  const minPrice = BN.ZERO;
  const maxPrice = BN.ZERO;
  return (
    <Root>
      <InfoLine onClick={() => setShowDetails(!showDetails)}>
        <Text type="SUPPORTING">
          1 {swapStore.sellToken.symbol} = <SpanStyled>{new BN(exchangeRate).toSignificant(6)}</SpanStyled>{" "}
          {swapStore.buyToken.symbol}
        </Text>

        <ArrowUpIconStyled showDetails={showDetails} />
      </InfoLine>
      {showDetails && (
        <>
          <InfoLine>
            <Text type="SUPPORTING">Virt / fact balance </Text>
            <Text color={theme.colors.textPrimary} type="BODY">
              <Text primary>{`${virtualBalance.toSignificant(2)} / ${factBalance.toSignificant(2)}`}</Text>
            </Text>
          </InfoLine>
          <InfoLine>
            <Text type="SUPPORTING">Min / max price </Text>
            <Text color={theme.colors.textPrimary} type="BODY">
              <Text primary>{`${minPrice.toSignificant(2)} / ${maxPrice.toSignificant(2)}`}</Text>
            </Text>
          </InfoLine>
        </>
      )}
    </Root>
  );
};

const Root = styled.div`
  display: flex;
  flex-direction: column !important;
  align-items: center;
  border-radius: 16px;
  padding: 5px 20px;
  gap: 6px;
  width: 100%;
  position: relative;

  ${media.mobile} {
    position: static;
  }
`;

const SpanStyled = styled.span`
  color: ${({ theme }) => `${theme.colors.textPrimary}`};
`;

const ArrowUpIconStyled = styled(ArrowUpIcon)<{ showDetails: boolean }>`
  transform: ${({ showDetails }) => (showDetails ? "rotate(-180deg) !important" : "rotate(0deg)")};
  transition: 300ms ease-in-out;
`;

const InfoLine = styled(Text)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 24px;
  &:not(:last-child) {
    border-bottom: 1px solid #0b0b0b;
  }
  &:first-of-type:hover {
    cursor: pointer;
    ${ArrowUpIconStyled} {
      transform: rotate(-90deg);
    }
  }
`;
