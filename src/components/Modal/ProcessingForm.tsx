import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import { QRCodeSVG } from "qrcode.react";

import { CircularProgress } from "@components/CircularProgress";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import CloseIcon from "@assets/icons/close.svg?react";
import Spinner from "@assets/icons/spinner.svg?react";

import { useStores } from "@stores";

import Sheet from "../Sheet";

export const ProcessingForm: React.FC = observer(() => {
  const theme = useTheme();
  const { swapStore, accountStore } = useStores();
  const payAmountUSD = swapStore.sellTokenPrice.times(swapStore.payAmount).toSignificant(2).toString();

  const status = {
    waiting_btc_payment: `Waiting payment of ${swapStore.payAmount} BTC ($${payAmountUSD})`,
    waiting_eth_payment: "Paynet confirmed",
    processing: "Processing",
    completed: "✅ Order completed",
    expired: "Order expired",
  };
  return (
    <Sheet isOpen={swapStore.modalOpen} onClose={() => swapStore.setModalOpen(false)}>
      <HeaderContainer>
        <Text color={theme.colors.textIconPrimary} type="CP_Header_18_Medium" uppercase>
          Pay on BTC Lightning
        </Text>
        <CloseIconStyled onClick={() => swapStore.setModalOpen(false)} />
      </HeaderContainer>
      <TextContentContainer>
        <Row alignItems="center" justifyContent="center">
          {swapStore.invoice?.status === "waiting_btc_payment" && <CircularProgress progress={50} />} &nbsp;&nbsp;
          <Text color="inherit" type="CP_Body_16_Medium">
            {swapStore.invoice?.status && status[swapStore.invoice?.status as keyof typeof status]}
          </Text>
        </Row>
        {swapStore.invoice?.status === "completed" && swapStore.invoice?.txId && (
          <a href={accountStore.getExplorerLinkByHash(swapStore.invoice?.txId)} rel="noreferrer" target="_blank">
            {`Transaction ID: ${swapStore.invoice?.txId}`}
          </a>
        )}
        <SizedBox height={16} />
        {swapStore.invoice && swapStore.invoice.status === "waiting_btc_payment" && (
          <QRCodeSVG size={250} value={swapStore.invoice.encoded} />
        )}
        {swapStore.invoice?.status === "processing" ||
          (swapStore.invoice?.status === "waiting_eth_payment" && (
            <Row alignItems="center" justifyContent="center" style={{ width: 250, height: 250 }}>
              <Spinner height={14} />
            </Row>
          ))}
        <SizedBox height={16} />
      </TextContentContainer>
    </Sheet>
  );
});

const HeaderContainer = styled(SmartFlex)`
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokePrimary};
`;

const CloseIconStyled = styled(CloseIcon)`
  width: 14px;
  height: 14px;

  path {
    fill: ${({ theme }) => theme.colors.textIconPrimary};
  }

  cursor: pointer;
`;

const TextContentContainer = styled(SmartFlex)`
  min-height: 400px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokePrimary};
  color: ${({ theme }) => theme.colors.textIconPrimary};
`;
