import React from "react";
import { ThemeProvider } from "@emotion/react";
import { observer } from "mobx-react";

import { THEME_TYPE, themes } from "./constants";

interface ThemeWrapperProps {
  children: React.ReactNode;
}
const ThemeWrapper: React.FC<ThemeWrapperProps> = observer(({ children }) => {
  return <ThemeProvider theme={themes[THEME_TYPE.DARK_THEME]}>{children}</ThemeProvider>;
});

export default ThemeWrapper;
