import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import { RosProvider } from "./context/RosContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <RosProvider>
        <App />
      </RosProvider>
    </BrowserRouter>
  </StrictMode>
);