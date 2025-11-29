import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import SwapBox from "./components/Swapbox";      // keep as your actual file name
import RightPanel from "./components/RightPanel";
import Starfield from "./components/Starfield";
import StakeBox from "./components/Stakebox";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [activeTab, setActiveTab] = useState("swap"); // "swap" | "stake"

  return (
    <div className="min-h-screen bg-[#050609] text-white relative overflow-hidden">
      {/* Background */}
      <Starfield />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.16),_transparent_60%)] mix-blend-screen" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top nav */}
        <header className="border-b border-white/5 bg-[#050609]/70 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_18px_rgba(16,185,129,0.6)]">
                <span className="text-sm font-semibold text-emerald-400">
                  C
                </span>
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">
                  <span className="text-emerald-400">Charon</span>
                  <span className="text-zinc-100">DEX</span>
                </div>
                <div className="text-[11px] text-zinc-500">
                  CHR / FETH • Sepolia • v1
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <nav className="hidden sm:flex items-center gap-2 text-xs font-medium">
                <button
                  onClick={() => setActiveTab("swap")}
                  className={`px-3 py-1.5 rounded-full border transition ${
                    activeTab === "swap"
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      : "border-transparent text-zinc-400 hover:text-emerald-200 hover:border-emerald-500/40"
                  }`}
                >
                  Swap
                </button>
                <button
                  onClick={() => setActiveTab("stake")}
                  className={`px-3 py-1.5 rounded-full border transition ${
                    activeTab === "stake"
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      : "border-transparent text-zinc-400 hover:text-emerald-200 hover:border-emerald-500/40"
                  }`}
                >
                  Stake
                </button>
              </nav>

              <ConnectButton />
            </div>
          </div>
        </header>

        {/* Main section */}
        <main className="flex-1 max-w-6xl mx-auto px-4 lg:px-8 py-10">
          {activeTab === "swap" ? (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="w-full lg:max-w-md">
                <SwapBox />
              </div>
              <div className="w-full flex-1">
                <RightPanel />
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="w-full lg:max-w-md">
                <StakeBox />
              </div>
              <div className="w-full flex-1 flex flex-col gap-4">
                <RightPanel />
                <AdminPanel />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
