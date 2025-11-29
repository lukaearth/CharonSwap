import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Pages */
import Landing from "./pages/Landing";
import Swap from "./pages/Swap";
import Staking from "./pages/Staking";
import Liquidity from "./pages/Liquidity";
import Faucet from "./pages/Faucet";
import About from "./pages/About";

/* Tailwind */
import "./index.css";

/* Fonts */
import "@fontsource/inter";

/* RainbowKit */
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";

/* Wagmi */
import { WagmiProvider } from "wagmi";
import { config } from "./wagmi";
import { sepolia } from "wagmi/chains";

/* React Query */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

const theme = darkTheme({
  accentColor: "#41FFA6",
  accentColorForeground: "black",
  borderRadius: "large",
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={[sepolia]} theme={theme}>
          <BrowserRouter>

            <Routes>

              <Route path="/" element={<Landing />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/staking" element={<Staking />} />
              <Route path="/liquidity" element={<Liquidity />} />
              <Route path="/faucet" element={<Faucet />} />
              <Route path="/about" element={<About />} />

            </Routes>

          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
