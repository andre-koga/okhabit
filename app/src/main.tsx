import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

void (async () => {
  try {
    if (!("storage" in navigator) || !("persist" in navigator.storage)) {
      return;
    }

    const alreadyPersistent = await navigator.storage.persisted();
    if (!alreadyPersistent) {
      await navigator.storage.persist();
    }
  } catch (error) {
    console.warn("Persistent storage request failed:", error);
  }
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
