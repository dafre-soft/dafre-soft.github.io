import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// tell index.html the club is alive (skips the raw-source error screen)
(window as unknown as { __PPC_MOUNTED: boolean }).__PPC_MOUNTED = true;

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
