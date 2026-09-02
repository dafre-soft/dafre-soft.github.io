import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const boot = window as unknown as {
  __PPC_MOUNTED?: boolean;
  __ppcBootFail?: (reason: string) => void;
};

try {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
  // the club is alive — tells index.html's boot guard to stand down
  boot.__PPC_MOUNTED = true;
} catch (err) {
  if (typeof boot.__ppcBootFail === "function") {
    boot.__ppcBootFail("render crashed: " + (err instanceof Error ? err.message : String(err)));
  } else {
    throw err; // dev server: let vite's overlay handle it
  }
}
