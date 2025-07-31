import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

const App: React.FC = observer(() => {
  return <Root></Root>;
});

export default App;

const Root = styled.div`
  width: 100%;
  align-items: center;
  height: 100vh;
`;
