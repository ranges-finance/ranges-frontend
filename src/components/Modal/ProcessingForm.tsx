import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import { QRCodeSVG } from "qrcode.react";

import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import CloseIcon from "@assets/icons/close.svg?react";
import Spinner from "@assets/icons/spinner.svg?react";

import { useStores } from "@stores";

import Sheet from "../Sheet";

const invoiceData =
  "lnbc100u1p5guy6ypp5eeyft8ntelam75uvpnz8lcx46qpp5aa6a4rrvc2qtc74qaz8776scqzyssp5us7lxaq6xny2e85sjfxa6dttua7v0ag32q2huzue5m67czzj5nes9q7sqqqqqqqqqqqqqqqqqqqsqqqqqysgqdqqmqz9gxqyjw5qrzjqwryaup9lh50kkranzgcdnn2fgvx390wgj5jd07rwr3vxeje0glcllmqlf20lk5u3sqqqqlgqqqqqeqqjqr4dqnmedj6pz9jvh2ufw0v0grfa27khg7tfwvun8u9fcxg952ua5zed68d2naa6whng33z7qnvt8x5x07lzf6lchegvr70xsrjmk8uqpsjef9k";

export const ProcessingForm: React.FC = observer(() => {
  const theme = useTheme();
  const { swapStore } = useStores();
  const payAmountUSD = swapStore.sellTokenPrice.times(swapStore.payAmount).toSignificant(2).toString();

  // 0: show for 10s, 1: show for 5s, 2: until closed
  const [statusStep, setStatusStep] = React.useState(0);

  React.useEffect(() => {
    if (!swapStore.modalOpen) {
      setStatusStep(0);
      return;
    }
    if (statusStep === 0) {
      const timer = setTimeout(() => setStatusStep(1), 10000);
      return () => clearTimeout(timer);
    }
    if (statusStep === 1) {
      const timer = setTimeout(() => setStatusStep(2), 5000);
      return () => clearTimeout(timer);
    }
    if (statusStep === 2) {
      // Очищаем инпуты
      swapStore.setPayAmount("0.00");
      swapStore.setReceiveAmount("0.00");
      swapStore.setIsLoading(false);
      // Ждём 5 секунд и закрываем форму
      const timer = setTimeout(() => {
        swapStore.setModalOpen(false);
        setStatusStep(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [swapStore.modalOpen, statusStep]);

  React.useEffect(() => {
    if (!swapStore.modalOpen) {
      setStatusStep(0);
    }
  }, [swapStore.modalOpen]);

  const status = [
    `Waiting payment of ${swapStore.payAmount} BTC ($${payAmountUSD})`,
    "Paynet confirmed",
    "✅ Order completed",
  ];

  return (
    <Sheet isOpen={swapStore.modalOpen} onClose={() => swapStore.setModalOpen(false)}>
      <HeaderContainer>
        <Text color={theme.colors.textIconPrimary} type="CP_Header_18_Medium" uppercase>
          Pay on BTC Lightning
        </Text>
        <CloseIconStyled onClick={() => swapStore.setModalOpen(false)} />
      </HeaderContainer>
      <TextContentContainer>
        <Text color="inherit" type="CP_Body_16_Medium">
          {statusStep !== 2 && <Spinner height={14} />} {status[statusStep]}
        </Text>
        <SizedBox height={16} />
        {statusStep === 0 ? <QRCodeSVG size={250} value={invoiceData} /> : <SizedBox height={250} />}
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
