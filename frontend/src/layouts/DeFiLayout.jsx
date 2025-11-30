import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Starfield from "../components/Starfield";
import Navbar from "../components/Navbar";

export default function DeFiLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-[#050709] text-white font-inter overflow-hidden">
      
      <div className="absolute inset-0 opacity-[0.18]">
        <Starfield />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.16),transparent_55%),radial-gradient(circle_at_bottom,_rgba(22,101,52,0.5),#02040a_70%)]" />

      <div className="relative z-10 flex flex-col min-h-screen">

      <Navbar />

        <main className="flex-1 flex justify-center pt-20 pb-20 px-4">
          {children}
        </main>

        <footer className="border-t border-white/10 bg-black/40 py-4 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} CharonDEX · Experimental DeFi lab project.
        </footer>

      </div>
    </div>
  );
}
