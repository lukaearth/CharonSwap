import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import arrow from "../assets/down-arrow1.png";

export default function Navbar() {
  const [openMore, setOpenMore] = useState(false);

  return (
    <header className="relative z-50 w-full border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        <div className="flex items-center gap-2 ">

          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/15 shadow-[0_0_25px_rgba(16,185,129,0.55)]">
            <span className="text-sm font-semibold text-emerald-300">C</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-emerald-400">Charon</span>Swap
            </span>
            <span className="text-[11px] text-zinc-400">CHR / FETH • Sepolia</span>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-zinc-200 md:flex relative">

          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/swap" className="hover:text-white">Swap</Link>
          <Link to="/staking" className="hover:text-white">Staking</Link>
          <Link to="/charon" className="hover:text-white">Charon Ecosystem</Link>

          <button
            onClick={() => setOpenMore((prev) => !prev)}
            className="flex items-center gap-1 hover:text-white focus:outline-none"
          >
            More

            <img
              src={arrow}
              alt="arrow"
              className={`h-3 w-3 transition-transform duration-300 ${
                openMore ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          <div
            className={`
              absolute z-50 left-[calc(100%-80px)] top-10 w-40 overflow-hidden 
              rounded-md border border-white/10 bg-black/70 backdrop-blur-xl 
              transition-all duration-300
              ${openMore ? "max-h-60 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}
            `}
          >
            <div className="flex flex-col bg-black py-2 text-sm">

              <Link
                to="https://github.com/luka-turunen"
                className="px-4 py-2 hover:bg-white/10"
                onClick={() => setOpenMore(false)}
              >
                GitHub
              </Link>

              <Link
                to="/about"
                className="px-4 py-2 hover:bg-white/10"
                onClick={() => setOpenMore(false)}
              >
                About
              </Link>

            </div>
          </div>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/faucet"
            className="hidden rounded bg-emerald-400 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/40 hover:bg-emerald-300 md:inline-flex"
          >
            Faucet
          </Link>

          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
