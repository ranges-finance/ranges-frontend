import React from "react";
import { ToastContentProps } from "react-toastify";

import { NotificationProps, Toast } from "@components/Toast";

interface Props extends ToastContentProps<unknown>, NotificationProps {}

export const createToast = (props: Props) => {
  return React.createElement(Toast, props);
};
