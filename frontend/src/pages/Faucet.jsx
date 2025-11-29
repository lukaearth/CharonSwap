// FAUCET PAGE — NOW 100% MATCHING SWAP PAGE STYLE
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import Footer from "../components/Footer"
import Navbar from "../components/Navbar";
import Starfield from "../components/Starfield";

import FAUCET_ABI from "../abi/CharonFaucet.json";
import CHR_ABI from "../abi/Charon.json";
import FETH_ABI from "../abi/FakeETH.json";

const FAUCET_ADDRESS = "0xC6C85531c7cFA380A669eddf1a22213c268c7A90";
const CHR_ADDRESS = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";
const FETH_ADDRESS = "0xeF84b001145F02937020bC757f771075f6bB1923";
const DECIMALS = 18;

export default function Faucet() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // READ CONTRACT STATE
  const { data: chrAmountRaw } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "chrAmount",
    watch: true,
  });

  const { data: fethAmountRaw } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "fethAmount",
    watch: true,
  });

  const { data: nextChrRaw } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "nextChrAvailable",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  });

  const { data: nextFethRaw } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "nextFethAvailable",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  });

  const { data: chrWalletRaw } = useReadContract({
    address: CHR_ADDRESS,
    abi: CHR_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  });

  const { data: fethWalletRaw } = useReadContract({
    address: FETH_ADDRESS,
    abi: FETH_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  });

  const chrAmount = chrAmountRaw ? Number(formatUnits(chrAmountRaw, DECIMALS)) : 0;
  const fethAmount = fethAmountRaw ? Number(formatUnits(fethAmountRaw, DECIMALS)) : 0;
  const chrCooldown = nextChrRaw ? Number(nextChrRaw) : 0;
  const fethCooldown = nextFethRaw ? Number(nextFethRaw) : 0;
  const chrWallet = chrWalletRaw ? Number(formatUnits(chrWalletRaw, DECIMALS)) : 0;
  const fethWallet = fethWalletRaw ? Number(formatUnits(fethWalletRaw, DECIMALS)) : 0;

  const canCHR = chrCooldown <= 0;
  const canFETH = fethCooldown <= 0;

  const openToast = (type, title, desc) => setToast({ type, title, desc });
  const closeToast = () => setToast(null);

  async function handleDrip(fnName, token) {
    if (!address) {
      openToast("error", "Wallet not connected", "Connect your wallet to claim tokens.");
      return;
    }

    try {
      setLoading(true);
      openToast("pending", `Claiming ${token}…`, "Confirm in your wallet");

      await writeContractAsync({
        address: FAUCET_ADDRESS,
        abi: FAUCET_ABI,
        functionName: fnName,
      });

      openToast("success", "Success!", `${token} sent to your wallet`);
    } catch (err) {
      openToast("error", "Transaction failed", err?.shortMessage || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <div className="relative min-h-screen bg-[#050709] text-white font-inter overflow-hidden">
      {/* Starfield */}
      <div className="absolute inset-0 opacity-[0.18]">
        <Starfield />
      </div>

      {/* Ambient Glow Pulse – matches Swap exactly */}
      <motion.div
        initial={{ opacity: 0.25 }}
        animate={{ opacity: [0.25, 0.38, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(22,101,52,0.4),#02040a_70%)]"
      />

      <Navbar />

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex flex-1 items-center justify-center px-4 pt-10 pb-16">
          {/* Compact container – same max-w-md as Swap */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full  max-w-md mx-auto text-center"
          >
            {/* Tiny badge – identical to Swap */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-black/40 px-3 py-1 text-[10px] font-medium text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            >
              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
              Testnet Faucet • Sepolia
            </motion.div>

            {/* Title & subcopy – tighter, same as Swap */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight"
            >
              Get Free Test Tokens
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-4 text-xs text-zinc-400"
            >
              Claim CHR and FETH to explore CharonDEX on Sepolia.
            </motion.p>

            {/* Wallet balances – compact cards */}
            {address && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.25 }}
                className="mt-8 grid grid-cols-2 gap-4"
              >
                <div className="rounded-xl bg-black/40 border border-white/10 backdrop-blur-xl p-4 text-left">
                  <p className="text-[11px] text-zinc-500">Your CHR</p>
                  <p className="text-lg font-bold text-emerald-400">{chrWallet.toFixed(4)}</p>
                </div>
                <div className="rounded-xl bg-black/40 border border-white/10 backdrop-blur-xl p-4 text-left">
                  <p className="text-[11px] text-zinc-500">Your FETH</p>
                  <p className="text-lg font-bold text-emerald-400">{fethWallet.toFixed(4)}</p>
                </div>
              </motion.div>
            )}

            {/* Main Card – exact same style & floating animation as Swap */}
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{
                opacity: 1,
                y: [0, -3, 0],
              }}
              transition={{
                duration: 0.8,
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }}
              className="mt-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl p-6 relative overflow-hidden"
            >
              {/* Inner glow blobs – identical to Swap */}
              <div className="absolute -top-20 -left-20 h-40 w-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 h-40 w-40 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* CHR Button */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CHR Token</span>
                    <span className="text-[10px] text-zinc-500">Governance & utility</span>
                  </div>
                  <button
                    onClick={() => handleDrip("dripCHR", "CHR")}
                    disabled={!canCHR || loading}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      canCHR && !loading
                        ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)]"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    {canCHR ? (loading ? "Claiming..." : `Claim ${chrAmount} CHR`) : `Available in ${formatTime(chrCooldown)}`}
                  </button>
                </div>

                {/* FETH Button */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">FETH</span>
                    <span className="text-[10px] text-zinc-500">Fake ETH for testing</span>
                  </div>
                  <button
                    onClick={() => handleDrip("dripFETH", "FETH")}
                    disabled={!canFETH || loading}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                      canFETH && !loading
                        ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)]"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    {canFETH ? (loading ? "Claiming..." : `Claim ${fethAmount} FETH`) : `Available in ${formatTime(fethCooldown)}`}
                  </button>
                </div>

                <p className="text-[10px] text-zinc-500 pt-2">
                  Need more? Return in 12 hours.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </main>

        {/* Tiny footer – matches Swap */}
        <Footer />
      </div>

      {/* Toast – identical to Swap */}
      {toast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/70" onClick={closeToast} />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="relative pointer-events-auto"
          >
            <div className="rounded-xl bg-black/80 border border-white/10 backdrop-blur-2xl p-6 max-w-xs mx-4 text-sm">
              <p className="font-bold mb-1 text-emerald-300">{toast.title}</p>
              <p className="text-zinc-300">{toast.desc}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}