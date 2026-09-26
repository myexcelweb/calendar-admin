import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { missingConfig } from "./lib/firebase";
import "./styles/index.css";

function MissingConfig() {
  return (
    <div className="login-screen">
      <div className="login-card">
        <p className="login-mark">CalendarPro Admin</p>
        <div className="login-error">The Firebase settings are missing, so the site can't start.</div>
        <p className="form-hint">
          Copy <code>.env.example</code> to <code>.env</code> in the website folder, fill in the
          values from the Firebase console, then restart <code>npm run dev</code>.
        </p>
        <p className="form-hint">Missing: {missingConfig.join(", ")}</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {missingConfig.length > 0 ? (
      <MissingConfig />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </React.StrictMode>
);
