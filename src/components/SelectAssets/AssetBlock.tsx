import React, { CSSProperties } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";

import { useStores } from "@stores";

import { DEFAULT_DECIMALS } from "@constants";
import BN from "@utils/BN";

import { AssetBlockData } from "./SelectAssetsInput";

export interface AssetBlockProps {
  options: {
    showBalance?: "balance" | "walletBalance" | "contractBalance";
    showNullBalance?: boolean;
    isShowBalance?: boolean;
  };
  token: AssetBlockData;
  styleToken?: CSSProperties;
  type?: "rounded" | "square";
}

const AssetBlock: React.FC<AssetBlockProps> = observer(
  ({ styleToken, options: { showNullBalance = true, isShowBalance = true }, token, type = "square" }) => {
    const { oracleStore } = useStores();
    const price = token.asset.priceFeed
      ? BN.formatUnits(oracleStore.getTokenIndexPrice(token.asset.priceFeed), DEFAULT_DECIMALS)
      : null;

    const theme = useTheme();
    if (!showNullBalance && new BN(token.balance).isLessThanOrEqualTo(BN.ZERO)) return null;

    return (
      <TokenContainer center="y" gap="4px" style={styleToken}>
        <SmartFlex alignItems="center" gap="10px">
          <TokenIcon src={token.asset.logo} />
          <div>
            <Text type={type === "rounded" ? "H" : "BUTTON"} primary>
              {token.asset.symbol}
            </Text>
            {isShowBalance && <Text type="BODY">{token.asset.name}</Text>}
          </div>
        </SmartFlex>
        {isShowBalance && (
          <div>
            <Text style={{ textAlign: "right" }} type="TEXT" primary>
              {new BN(token.balance).toSignificant(4)}
            </Text>
            <Text color={theme.colors.greenLight} style={{ textAlign: "right" }} type="BODY">
              ${price ? price.multipliedBy(token.balance).toSignificant(2) : "-"}
            </Text>
          </div>
        )}
      </TokenContainer>
    );
  },
);

export default AssetBlock;

const TokenIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const TokenContainer = styled(SmartFlex)`
  width: 100%;
  border-radius: 8px;
  justify-content: space-between;
`;
