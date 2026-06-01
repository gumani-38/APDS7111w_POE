import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// 🛡️ Disable React DevTools in production to prevent "n is not a function" errors
if (process.env.NODE_ENV === "production") {
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    for (const key in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] =
        typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] === "function"
          ? () => {}
          : null;
    }
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
