import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import arrow from "../assets/down-arrow1.png";   // <-- FIXED IMPORT

export default function Fkooter() {
  const [openMore, setOpenMore] = useState(false);

  return (        
  <footer className="border-t border-white/10 bg-black/40 py-4 text-center text-xs text-zinc-500">
    © {new Date().getFullYear()} CharonSwap · Experimental DeFi lab project by Luka Turunen.
  </footer>

    );
}
