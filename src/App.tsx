import React from "react";
import styled from "@emotion/styled";
import { PrivyProvider } from "@privy-io/react-auth";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import Header from "@components/Header";

import { useClearUrlParam } from "@hooks/useClearUrlParam";

import { SwapScreen } from "@screens/SwapScreen";

const App: React.FC = observer(() => {
  // This hooks is used to clear unnecessary URL parameters,
  // specifically "tx_id", after returning from the faucet
  useClearUrlParam("tx_id");

  // usePrivateKeyAsAuth();

  return (
    <Root>
      <PrivyProvider
        appId="cm8m82foo01u7mn0ddk23skci"
        clientId="client-WY5i339oaFdpHqrExfqiKWRCK69JjuiBNh4cumipQNAjS"
        config={{
          appearance: {
            theme: "dark",
            accentColor: "#676FFF",
          },
          loginMethods: ["wallet"],
        }}
      >
        <Header />
        <SwapScreen />
      </PrivyProvider>
    </Root>
  );
});

export default App;

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.bgPrimary};
  height: 100vh;
`;
