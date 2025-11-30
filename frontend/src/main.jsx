import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Swap from "./pages/Swap";
import Staking from "./pages/Staking";
import Liquidity from "./pages/Liquidity";
import Faucet from "./pages/Faucet";
import About from "./pages/About";
import Charon from "./pages/Charon"

import "./index.css";
import "@fontsource/inter";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";

import { WagmiProvider } from "wagmi";
import { config } from "./wagmi";
import { sepolia } from "wagmi/chains";

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
              <Route path="/charon" element={<Charon />} />

            </Routes>

          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
