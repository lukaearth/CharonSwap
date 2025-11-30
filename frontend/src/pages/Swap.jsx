import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import Navbar from "../components/Navbar";
import Starfield from "../components/Starfield";
import { motion } from "framer-motion";
import Footer from "../components/Footer"

import DEX_ABI from "../abi/CharonDex.json";
import CHR_ABI from "../abi/Charon.json";
import FETH_ABI from "../abi/FakeETH.json";

const DEX_ADDRESS = "0x2BdA2Ab20D679f8EE829DFe531De3659D4c260Ae";
const CHR_ADDRESS = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";
const FETH_ADDRESS = "0xeF84b001145F02937020bC757f771075f6bB1923";
const DECIMALS = 18;

export default function Swap() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [swapCHRtoFETH, setSwapCHRtoFETH] = useState(true);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);

  const TOKEN_IN = swapCHRtoFETH ? CHR_ADDRESS : FETH_ADDRESS;
  const TOKEN_OUT = swapCHRtoFETH ? FETH_ADDRESS : CHR_ADDRESS;
  const TOKEN_IN_ABI = swapCHRtoFETH ? CHR_ABI : FETH_ABI;
  const TOKEN_IN_SYMBOL = swapCHRtoFETH ? "CHR" : "FETH";
  const TOKEN_OUT_SYMBOL = swapCHRtoFETH ? "FETH" : "CHR";

  const { data: reserves } = useReadContract({
    address: DEX_ADDRESS,
    abi: DEX_ABI,
    functionName: "getReserves",
    watch: true,
  });

  const { data: balanceRaw } = useReadContract({
    address: TOKEN_IN,
    abi: TOKEN_IN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  });

  const { data: allowanceRaw } = useReadContract({
    address: TOKEN_IN,
    abi: TOKEN_IN_ABI,
    functionName: "allowance",
    args: address ? [address, DEX_ADDRESS] : undefined,
    query: { enabled: !!address },
    watch: true,
  });

  const balance = balanceRaw ? Number(formatUnits(balanceRaw, DECIMALS)) : 0;
  const allowance = allowanceRaw ? Number(formatUnits(allowanceRaw, DECIMALS)) : 0;

  const needsApproval = !!amountIn && allowance < Number(amountIn);
  const insufficientBalance = !!amountIn && balance < Number(amountIn);

  const [priceImpact, setPriceImpact] = useState(null);
  const [minReceived, setMinReceived] = useState(null);

  useEffect(() => {
    if (!reserves || !amountIn || Number(amountIn) <= 0) {
      setAmountOut("");
      setPriceImpact(null);
      setMinReceived(null);
      return;
    }

    try {
      const reserveIn = swapCHRtoFETH ? reserves[0] : reserves[1];
      const reserveOut = swapCHRtoFETH ? reserves[1] : reserves[0];

      const input = parseUnits(amountIn, DECIMALS);
      const amountInWithFee = (input * 997n) / 1000n;
      const numerator = amountInWithFee * reserveOut;
      const denominator = reserveIn + amountInWithFee;
      const outBN = numerator / denominator;

      setAmountOut(formatUnits(outBN, DECIMALS));

      const idealOut = (input * reserveOut) / reserveIn;
      const impact = 1 - Number(outBN) / Number(idealOut);
      setPriceImpact(impact * 100);

      const slippageBps = BigInt(Math.floor(slippage * 100));
      const minOut = (outBN * (10000n - slippageBps)) / 10000n;
      setMinReceived(Number(formatUnits(minOut, DECIMALS)));
    } catch {
      setAmountOut("");
    }
  }, [amountIn, reserves, slippage, swapCHRtoFETH]);

  const openToast = (type, title, desc, hash) =>
    setToast({ type, title, desc, hash });
  const closeToast = () => setToast(null);

  const handleApprove = async () => {
    if (!amountIn) return;
    try {
      setIsApproving(true);
      openToast("pending", "Approve Pending", "Confirm approval in your wallet");

      const hash = await writeContractAsync({
        address: TOKEN_IN,
        abi: TOKEN_IN_ABI,
        functionName: "approve",
        args: [DEX_ADDRESS, parseUnits(amountIn, DECIMALS)],
      });

      openToast(
        "submitted",
        "Approval Submitted",
        "Waiting for confirmation…",
        hash
      );
    } catch (err) {
      openToast(
        "error",
        "Approval Failed",
        err?.shortMessage || "Transaction failed"
      );
    } finally {
      setIsApproving(false);
    }
  };

  const handleSwap = async () => {
    if (!amountIn || !amountOut) return;
    try {
      setIsSwapping(true);
      openToast("pending", "Swapping…", "Confirm transaction");

      const outBN = parseUnits(amountOut, DECIMALS);
      const slippageBps = BigInt(Math.floor(slippage * 100));
      const minOut = (outBN * (10000n - slippageBps)) / 10000n;

      const hash = await writeContractAsync({
        address: DEX_ADDRESS,
        abi: DEX_ABI,
        functionName: "swap",
        args: [TOKEN_IN, parseUnits(amountIn, DECIMALS), minOut],
      });

      openToast(
        "success",
        "Swap Successful!",
        `${amountIn} ${TOKEN_IN_SYMBOL} → ${Number(amountOut).toFixed(
          6
        )} ${TOKEN_OUT_SYMBOL}`,
        hash
      );

      setHistory((prev) => [
        {
          ts: Date.now(),
          dir: swapCHRtoFETH ? "CHR → FETH" : "FETH → CHR",
          in: amountIn,
          out: amountOut,
          hash,
        },
        ...prev.slice(0, 4),
      ]);

      setAmountIn("");
    } catch (err) {
      openToast("error", "Swap Failed", err?.shortMessage || "Transaction failed");
    } finally {
      setIsSwapping(false);
    }
  };

  const primaryLabel = !address
    ? "Connect Wallet"
    : insufficientBalance
    ? "Insufficient Balance"
    : needsApproval
    ? isApproving
      ? "Approving…"
      : `Approve ${TOKEN_IN_SYMBOL}`
    : isSwapping
    ? "Swapping…"
    : "Swap";

  const canSwap =
    address && amountIn && !insufficientBalance && !needsApproval && !isSwapping;

  return (
    <div className="relative min-h-screen bg-[#050709] text-white font-inter overflow-hidden">
      <div className="absolute inset-0 opacity-[0.18]">
        <Starfield />
      </div>

      <motion.div
        initial={{ opacity: 0.25 }}
        animate={{ opacity: [0.25, 0.38, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(22,101,52,0.4),#02040a_70%)]"
      />

      <Navbar />

      <div className="relative z-10 flex min-h-screen flex-col">
        <main className="flex flex-1 items-center justify-center px-4 pt-10 pb-16">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-md mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-black/40 px-3 py-1 text-[10px] font-medium text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            >
              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
              CharonDEX AMM
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight"
            >
              Swap your CHR/FETH
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-4 text-xs text-zinc-400"
            >
              Compact CHR/FETH AMM for instant swaps.
            </motion.p>

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
              <div className="absolute -top-20 -left-20 h-40 w-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 h-40 w-40 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <motion.button
                  whileHover={{ y: -1, scale: 1.01 }}
                  onClick={() => setSwapCHRtoFETH((v) => !v)}
                  className="w-full py-2.5 rounded-xl bg-black/50 border border-zinc-700 text-xs font-medium text-zinc-300 hover:border-emerald-500 transition flex items-center justify-center gap-2"
                >
                  {swapCHRtoFETH ? "CHR → FETH" : "FETH → CHR"}{" "}
                  <span className="text-emerald-400">↕</span>
                </motion.button>

                <div className="mt-6">
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>From</span>
                    <span>Bal: {balance.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-xl p-4">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-semibold text-sm">
                      {TOKEN_IN_SYMBOL}
                    </div>
                    <input
                      type="number"
                      value={amountIn}
                      onChange={(e) => setAmountIn(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 bg-transparent text-right text-xl font-medium outline-none placeholder-zinc-600"
                    />
                    <button
                      onClick={() => setAmountIn(balance.toString())}
                      className="text-[11px] px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/40 hover:bg-emerald-500/30"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[11px] text-zinc-400 mb-1">To</div>
                  <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-xl p-4">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-semibold text-sm">
                      {TOKEN_OUT_SYMBOL}
                    </div>
                    <input
                      disabled
                      value={amountOut}
                      placeholder="0.0"
                      className="flex-1 bg-transparent text-right text-xl font-medium text-zinc-400"
                    />
                  </div>
                </div>

                {amountOut && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-5 grid grid-cols-2 gap-3 text-xs"
                  >
                    <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                      <div className="text-zinc-500">Impact</div>
                      <div
                        className={`font-bold mt-1 ${
                          priceImpact > 5
                            ? "text-red-400"
                            : priceImpact > 1
                            ? "text-yellow-300"
                            : "text-emerald-400"
                        }`}
                      >
                        {priceImpact.toFixed(2)}%
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                      <div className="text-zinc-500">Min Rec.</div>
                      <div className="font-bold text-emerald-300 mt-1">
                        {minReceived?.toFixed(6)}
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={
                    canSwap || (needsApproval && !isApproving)
                      ? { y: -2 }
                      : {}
                  }
                  disabled={(!canSwap && !needsApproval) || isSwapping}
                  onClick={needsApproval ? handleApprove : handleSwap}
                  className={`mt-6 w-full py-3.5 rounded-xl font-semibold text-sm transition ${
                    canSwap || (needsApproval && !isApproving)
                      ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)]"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {primaryLabel}
                </motion.button>

                <button
                  onClick={() => setShowSlippageModal(true)}
                  className="mt-3 w-full text-center text-[11px] text-zinc-400 hover:text-emerald-300 transition"
                >
                  Slippage: {slippage}%
                </button>
              </div>
            </motion.div>

            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mt-6 bg-black/40 border border-white/10 rounded-xl p-4 text-left text-xs backdrop-blur-xl"
              >
                <p className="text-zinc-400 font-medium mb-3">
                  Recent Swaps
                </p>
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex justify-between py-1.5 text-[11px]"
                  >
                    <span className="text-zinc-300">
                      {h.in} → {Number(h.out).toFixed(4)}
                    </span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${h.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </main>

        <Footer />
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeToast}
          />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="relative pointer-events-auto"
          >
            <div className="rounded-xl bg-black/80 border border-white/10 backdrop-blur-2xl p-6 max-w-xs mx-4 text-sm">
              <p className="font-bold mb-1 text-emerald-300">{toast.title}</p>
              <p className="text-zinc-300">{toast.desc}</p>
              {toast.hash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${toast.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-3 text-emerald-400 underline"
                >
                  View on Etherscan
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {showSlippageModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowSlippageModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="relative bg-black/80 border border-white/10 rounded-xl p-6 max-w-xs w-full mx-4 text-sm"
          >
            <h3 className="text-lg font-bold mb-4">Slippage</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[0.5, 1, 3].map((v) => (
                <button
                  key={v}
                  onClick={() => setSlippage(v)}
                  className={`py-2 rounded-md ${
                    slippage === v
                      ? "bg-emerald-500 text-black"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {v}%
                </button>
              ))}
            </div>
            <input
              type="number"
              value={slippage}
              onChange={(e) =>
                setSlippage(
                  Math.max(
                    0.1,
                    Math.min(50, parseFloat(e.target.value) || 0)
                  )
                )
              }
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-center outline-none"
            />
            <button
              onClick={() => setShowSlippageModal(false)}
              className="mt-4 w-full py-2 bg-zinc-800 rounded-md text-zinc-300 hover:bg-zinc-700 transition"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
