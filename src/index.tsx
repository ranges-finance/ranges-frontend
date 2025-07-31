import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@themes/fonts";

import App from "./App";

import "react-toastify/dist/ReactToastify.css";
import "rc-dialog/assets/index.css";
import "./index.css";
import "normalize.css";

console.warn(`Version: ${process.env.__COMMIT_HASH__}`);

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <Router>
      <App />
    </Router>
  </QueryClientProvider>,
  // </React.StrictMode>,
);
