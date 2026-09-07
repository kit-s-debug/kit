import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Privacy } from "./Privacy";
import { mountAnalytics } from "./lib/analytics";
import "./styles.css";

mountAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Privacy />
  </StrictMode>,
);
