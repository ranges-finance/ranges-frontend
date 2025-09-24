import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import Header from "@components/Header";

import { useClearUrlParam } from "@hooks/useClearUrlParam";

import { Footer } from "@screens/Footer";
import { SwapScreen } from "@screens/SwapScreen";

import "@rainbow-me/rainbowkit/styles.css";

const App: React.FC = observer(() => {
  // This hooks is used to clear unnecessary URL parameters,
  // specifically "tx_id", after returning from the faucet
  useClearUrlParam("tx_id");

  // usePrivateKeyAsAuth();

  return (
    <Root>
      <Header />
      <SwapScreen />
      <Footer />
    </Root>
  );
});

export default App;

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  min-width: 100vw;
  background: ${({ theme }) => theme.colors.bgPrimary};
  height: 100vh;
`;
