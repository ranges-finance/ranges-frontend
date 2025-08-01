import React from "react";
import { ThemeProvider } from "@emotion/react";
import { observer } from "mobx-react";

import darkTheme from "@themes/darkTheme";

export enum THEME_TYPE {
  DARK_THEME = "darkTheme",
}

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export const themes = {
  darkTheme,
};
const ThemeWrapper: React.FC<ThemeWrapperProps> = observer(({ children }) => {
  return <ThemeProvider theme={themes[THEME_TYPE.DARK_THEME]}>{children}</ThemeProvider>;
});

export default ThemeWrapper;
