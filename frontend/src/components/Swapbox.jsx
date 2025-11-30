import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import Navbar from "./Navbar";
import Starfield from "./Starfield";

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

  const [price, setPrice] = useState(null);
  const [priceImpact, setPriceImpact] = useState(null);
  const [lpFeeAmount, setLpFeeAmount] = useState(null);
  const [minReceived, setMinReceived] = useState(null);

  useEffect(() => {
    if (!reserves || !amountIn || Number(amountIn) <= 0) {
      setAmountOut("");
      setPrice(null);
      setPriceImpact(null);
      setLpFeeAmount(null);
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
      const actualOut = numerator / denominator;

      setAmountOut(formatUnits(actualOut, DECIMALS));

      const priceRaw = Number(reserveOut) / Number(reserveIn);
      setPrice(priceRaw);

      const idealOut = (input * reserveOut) / reserveIn;
      const impact = 1 - Number(actualOut) / Number(idealOut);
      setPriceImpact(impact * 100);

      const fee = input - amountInWithFee;
      setLpFeeAmount(Number(formatUnits(fee, DECIMALS)));

      const slippageBps = BigInt(Math.floor(slippage * 100));
      const minOut = (actualOut * (10000n - slippageBps)) / 10000n;
      setMinReceived(Number(formatUnits(minOut, DECIMALS)));
    } catch {
      setAmountOut("");
    }
  }, [amountIn, reserves, slippage, swapCHRtoFETH]);

  const openToast = (type, title, desc, hash) => setToast({ type, title, desc, hash });
  const closeToast = () => setToast(null);

  const handleApprove = async () => {
    if (!amountIn) return;
    try {
      setIsApproving(true);
      openToast("pending", "Approve Pending", "Confirm in your wallet…");

      const hash = await writeContractAsync({
        address: TOKEN_IN,
        abi: TOKEN_IN_ABI,
        functionName: "approve",
        args: [DEX_ADDRESS, parseUnits(amountIn, DECIMALS)],
      });

      openToast("submitted", "Approval Submitted", "Waiting for confirmation…", hash);
    } catch (err) {
      openToast("error", "Approval Failed", err?.shortMessage || "Transaction reverted");
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

      openToast("success", "Swap Successful!", `${amountIn} ${TOKEN_IN_SYMBOL} → ${Number(amountOut).toFixed(6)} ${TOKEN_OUT_SYMBOL}`, hash);

      setHistory(prev => [{
        ts: Date.now(),
        dir: swapCHRtoFETH ? "CHR → FETH" : "FETH → CHR",
        in: amountIn,
        out: amountOut,
        hash,
      }, ...prev.slice(0, 4)]);

      setAmountIn("");
    } catch (err) {
      openToast("error", "Swap Failed", err?.shortMessage || "Transaction reverted");
    } finally {
      setIsSwapping(false);
    }
  };

  const primaryLabel = !address
    ? "Connect Wallet"
    : insufficientBalance
    ? "Insufficient Balance"
    : needsApproval
    ? isApproving ? "Approving…" : `Approve ${TOKEN_IN_SYMBOL}`
    : isSwapping ? "Swapping…" : "Swap";

  const canSwap = address && amountIn && !insufficientBalance && !needsApproval && !isSwapping;

  return (
    <div className="relative min-h-screen bg-[#050709] text-white font-inter overflow-hidden">
      <div className="absolute inset-0 opacity-[0.18]"><Starfield /></div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.16),transparent_55%),radial-gradient(circle_at_bottom,rgba(22,101,52,0.5),#02040a_70%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main className="flex flex-1 items-center justify-center px-6 py-20">
          <div className="w-full max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/40 px-5 py-1.5 text-xs font-medium text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.45)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CharonDEX • AMM on Sepolia
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Swap Tokens
            </h1>

            <p className="mt-6 text-base text-zinc-300 max-w-xl mx-auto">
              Trade CHR ↔ FETH with 0.3% fees and deep liquidity. Powered by constant product AMM.
            </p>

            <div className="mt-12 mx-auto max-w-lg">
              <div className="relative rounded-3xl bg-black/40 border border-white/10 backdrop-blur-2xl p-8 shadow-2xl overflow-hidden">
                <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

                <div className="relative z-10">

                  <button
                    onClick={() => setSwapCHRtoFETH(v => !v)}
                    className="w-full py-3 rounded-2xl bg-black/50 border border-zinc-700 text-sm font-medium text-zinc-300 hover:border-emerald-500 hover:text-emerald-300 transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <span>{swapCHRtoFETH ? "CHR → FETH" : "FETH → CHR"}</span>
                    <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">↔</span>
                  </button>

                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-zinc-400 mb-2">
                      <span>From</span>
                      <span>Balance: {balance.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl p-4 hover:border-emerald-500/50 transition-all">
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-lg">
                        {TOKEN_IN_SYMBOL}
                      </div>
                      <input
                        type="number"
                        value={amountIn}
                        onChange={(e) => setAmountIn(e.target.value)}
                        placeholder="0.0"
                        className="flex-1 bg-transparent text-right text-2xl font-medium outline-none placeholder-zinc-600"
                      />
                      <button
                        onClick={() => setAmountIn(balance.toString())}
                        className="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 hover:bg-emerald-500/30 transition"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-sm text-zinc-400 mb-2">To</div>
                    <div className="flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl p-4">
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-lg">
                        {TOKEN_OUT_SYMBOL}
                      </div>
                      <input
                        disabled
                        value={amountOut}
                        placeholder="0.0"
                        className="flex-1 bg-transparent text-right text-2xl font-medium text-zinc-400"
                      />
                    </div>
                  </div>

                  {amountOut && (
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <div className="text-zinc-500">Price Impact</div>
                        <div className={`font-bold ${priceImpact > 5 ? "text-red-400" : priceImpact > 1 ? "text-yellow-300" : "text-emerald-400"}`}>
                          {priceImpact?.toFixed(2)}%
                        </div>
                      </div>
                      <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <div className="text-zinc-500">Min Received</div>
                        <div className="font-bold text-emerald-300">
                          {minReceived?.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!canSwap && !needsApproval}
                    onClick={needsApproval ? handleApprove : handleSwap}
                    className={`
                      mt-8 w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300
                      ${canSwap || (needsApproval && !isApproving)
                        ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_32px_rgba(16,185,129,0.6)] hover:shadow-[0_0_48px_rgba(16,185,129,0.8)]"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      }
                    `}
                  >
                    {primaryLabel}
                  </button>

                  <button
                    onClick={() => setShowSlippageModal(true)}
                    className="mt-4 w-full text-center text-xs text-zinc-400 hover:text-emerald-300 transition"
                  >
                    Slippage Tolerance: {slippage}%
                  </button>
                </div>
              </div>

              {history.length > 0 && (
                <div className="mt-8 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                  <h3 className="text-sm font-medium text-zinc-400 mb-4">Recent Swaps</h3>
                  {history.map((h, i) => (
                    <div key={i} className="flex justify-between items-center py-2 text-sm">
                      <span className="text-zinc-300">
                        {h.in} {h.dir.includes("CHR") ? "CHR" : "FETH"} → {Number(h.out).toFixed(6)} {h.dir.includes("FETH") ? "FETH" : "CHR"}
                      </span>
                      <a href={`https://sepolia.etherscan.io/tx/${h.hash}`} target="_blank" className="text-emerald-400 hover:underline">
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="border-t border-white/10 bg-black/40 py-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} CharonDEX · Experimental DeFi lab by Luka Turunen
        </footer>
      </div>

      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/70" onClick={closeToast} />
          <div className="relative pointer-events-auto animate-in fade-in zoom-in duration-300">
            <div className="rounded-2xl bg-black/80 border border-white/10 backdrop-blur-2xl p-8 shadow-2xl max-w-sm mx-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-2xl font-bold ${toast.type === "success" ? "text-emerald-400" : toast.type === "error" ? "text-red-400" : "text-yellow-300"}`}>
                    {toast.title}
                  </p>
                  <p className="text-sm text-zinc-300 mt-2">{toast.desc}</p>
                  {toast.hash && (
                    <a href={`https://sepolia.etherscan.io/tx/${toast.hash}`} target="_blank" className="block mt-4 text-emerald-400 underline text-sm">
                      View on Etherscan
                    </a>
                  )}
                </div>
                <button onClick={closeToast} className="text-zinc-500 hover:text-white">✕</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSlippageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowSlippageModal(false)} />
          <div className="relative bg-black/80 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl shadow-2xl max-w-xs w-full mx-4">
            <h3 className="text-xl font-bold mb-6">Slippage Tolerance</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[0.5, 1, 3].map(v => (
                <button key={v} onClick={() => setSlippage(v)} className={`py-3 rounded-xl font-medium transition ${slippage === v ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                  {v}%
                </button>
              ))}
            </div>
            <input
              type="number"
              value={slippage}
              onChange={e => setSlippage(Math.max(0.1, Math.min(50, parseFloat(e.target.value) || 0)))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-center text-lg font-medium outline-none focus:border-emerald-500"
            />
            <button onClick={() => setShowSlippageModal(false)} className="mt-6 w-full py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}