import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import App from "./App.tsx";
import "./App.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import { HelmetProvider } from "react-helmet-async";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <StrictMode>
      <ThemeProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </ThemeProvider>
    </StrictMode>
  </HelmetProvider>
);
