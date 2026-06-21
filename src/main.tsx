import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import { LocaleProvider } from "./i18n";
import { ToastProvider } from "./components/common/Toast";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider>
      <LocaleProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </LocaleProvider>
    </ToastProvider>
  </React.StrictMode>,
);
