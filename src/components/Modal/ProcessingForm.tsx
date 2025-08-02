import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { ethers } from "ethers";
import { observer } from "mobx-react";
import { QRCodeSVG } from "qrcode.react";
import { useConfig, useSendTransaction } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

import Button from "@components/Button";
import { CircularProgress } from "@components/CircularProgress";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import CloseIcon from "@assets/icons/close.svg?react";
import Spinner from "@assets/icons/spinner.svg?react";

import { useStores } from "@stores";

import { contractABI } from "@constants/contractABI";

import Sheet from "../Sheet";

export const ProcessingForm: React.FC = observer(() => {
  const theme = useTheme();
  const { swapStore, accountStore } = useStores();
  const { sendTransactionAsync } = useSendTransaction();
  const config = useConfig();
  const payAmountUSD = swapStore.sellTokenPrice.times(swapStore.payAmount).toSignificant(2).toString();
  const [invoice, setInvoice] = useState<string>("");
  const [, setIsLoading] = useState(false);

  const status = swapStore.isSellEth
    ? {
        waiting_btc_payment: `Waiting payment of ${swapStore.payAmount} BTC ($${payAmountUSD})`,
        waiting_eth_payment: "Paynet confirmed",
        processing: "Processing",
        completed: "✅ Order completed",
        expired: "Order expired",
      }
    : {
        waiting_btc_payment: `Waiting payment of ${swapStore.payAmount} BTC ($${payAmountUSD})`,
        waiting_eth_payment: "Paynet confirmed",
        processing: "Processing",
        completed: "✅ Order completed",
        expired: "Order expired",
      };

  const payEth = async () => {
    const contractAddress = accountStore.networkConfig?.contractAddress;
    if (!swapStore.invoice || !accountStore.address || !contractAddress) {
      console.error("Missing invoice or address");
      return;
    }

    setIsLoading(true);

    // Create contract instance
    const contract = new ethers.Contract(contractAddress, contractABI);

    // Prepare deposit parameters
    const claimer = accountStore.address;
    const expirationTime = swapStore.invoice.timeExpireDate || Math.floor(Date.now() / 1000) + 3600; // 1 hour from now if not provided
    const hashlock = swapStore.invoice.payment_hash || ethers.zeroPadValue("0x", 32); // Convert to bytes32

    try {
      // Prepare the deposit transaction
      const depositData = await contract.deposit.populateTransaction(claimer, expirationTime, hashlock, {
        value: ethers.parseEther(swapStore.payAmount), // Send ETH value
      });
      console.log("Deposit data:", {
        to: contractAddress,
        data: depositData.data as `0x${string}`,
        value: depositData.value,
      });
      // Send the transaction
      const transactionResponse = await sendTransactionAsync({
        to: contractAddress,
        data: depositData.data as `0x${string}`,
        value: depositData.value,
      });

      console.log("Transaction sent:", transactionResponse);

      // Update balances after successful transaction

      const receipt = await waitForTransactionReceipt(config, {
        hash: transactionResponse,
        chainId: accountStore.chainId!,
      });

      if (receipt) {
        accountStore.rootStore.balanceStore.updateTokenBalances();
      }
      console.log("Receipt:", receipt);

      return transactionResponse;
    } catch (error) {
      setIsLoading(false);
      console.error("Error in payEth:", error);
      throw error;
    }
  };

  return (
    <Sheet isOpen={swapStore.modalOpen} onClose={() => swapStore.setModalOpen(false)}>
      <HeaderContainer>
        <Text color={theme.colors.textIconPrimary} type="CP_Header_18_Medium" uppercase>
          Pay on BTC Lightning
        </Text>
        <CloseIconStyled onClick={() => swapStore.setModalOpen(false)} />
      </HeaderContainer>
      {swapStore.isSellEth ? (
        <TextContentContainer>
          {swapStore.invoice === null ? (
            <>
              <Text color="inherit" style={{ marginBottom: 8 }} type="CP_Body_16_Medium">
                Paste your invoice
              </Text>
              <textarea
                style={{ width: 250, height: 250, marginBottom: 8 }}
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
              />
              <Button disabled={!invoice} fitContent green onClick={() => swapStore.attachInvoice(invoice)}>
                Attach invoice
              </Button>
            </>
          ) : (
            <>
              <Text color="inherit" style={{ marginBottom: 8 }} type="CP_Body_16_Medium">
                Pay {swapStore.payAmount} ETH ($${payAmountUSD})
              </Text>
              <Button fitContent green onClick={payEth}>
                Pay
              </Button>
            </>
          )}
        </TextContentContainer>
      ) : (
        <TextContentContainer>
          <Row alignItems="center" justifyContent="center">
            {swapStore.swapDetails?.status === "waiting_btc_payment" && <CircularProgress progress={50} />} &nbsp;&nbsp;
            <Text color="inherit" type="CP_Body_16_Medium">
              {swapStore.swapDetails?.status && status[swapStore.swapDetails?.status as keyof typeof status]}
            </Text>
          </Row>
          {swapStore.swapDetails?.status === "completed" && swapStore.swapDetails?.txId && (
            <a href={accountStore.getExplorerLinkByHash(swapStore.swapDetails?.txId)} rel="noreferrer" target="_blank">
              {`Transaction ID: ${swapStore.swapDetails?.txId}`}
            </a>
          )}
          <SizedBox height={16} />
          {swapStore.swapDetails && swapStore.swapDetails.status === "waiting_btc_payment" && (
            <QRCodeSVG size={250} value={swapStore.invoice?.encoded || ""} />
          )}

          <Row alignItems="center" justifyContent="center" style={{ width: 250, height: 250 }}>
            {swapStore.swapDetails?.status === "processing" ||
              (swapStore.swapDetails?.status === "waiting_eth_payment" && <Spinner height={14} />)}
          </Row>

          <SizedBox height={16} />
          {swapStore.swapDetails?.status !== "completed" && swapStore.swapDetails?.status !== "expired" && (
            <Button fitContent red onClick={() => swapStore.setModalOpen(false)}>
              Cancel order
            </Button>
          )}
        </TextContentContainer>
      )}
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
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.strokePrimary};
  color: ${({ theme }) => theme.colors.textIconPrimary};
`;
