import { useState } from "react";
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

import STAKING_ABI from "../abi/CharonStaking.json";
import CHR_ABI from "../abi/Charon.json";

const STAKING_ADDRESS = "0x89519D9E2aE3B945a5Bdeb18C24eAE0c85feD9bD";
const CHR_ADDRESS = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";
const DECIMALS = 18;
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export default function Stake() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [amount, setAmount] = useState("");
  const [toast, setToast] = useState(null);
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const { data: stakedRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "balances",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  });

  const { data: totalStakedRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "totalSupply",
    watch: true,
  });

  const { data: rewardRateRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "rewardRate",
    watch: true,
  });

  const { data: pendingRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "earned",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  });

  const { data: paused } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "paused",
    watch: true,
  });

  const { data: walletChrRaw } = useReadContract({
    address: CHR_ADDRESS,
    abi: CHR_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  });

  const staked = stakedRaw ? Number(formatUnits(stakedRaw, DECIMALS)) : 0;
  const totalStaked = totalStakedRaw ? Number(formatUnits(totalStakedRaw, DECIMALS)) : 0;
  const pending = pendingRaw ? Number(formatUnits(pendingRaw, DECIMALS)) : 0;
  const walletChr = walletChrRaw ? Number(formatUnits(walletChrRaw, DECIMALS)) : 0;
  const rewardRate = rewardRateRaw ? Number(formatUnits(rewardRateRaw, DECIMALS)) : 0;

  const apr = totalStaked > 0 ? ((rewardRate * SECONDS_PER_YEAR * 100) / totalStaked) : 0;
  const poolShare = totalStaked > 0 ? (staked / totalStaked) * 100 : 0;

  const openToast = (type, title, desc) => setToast({ type, title, desc });
  const closeToast = () => setToast(null);

  const canStake = address && amount && Number(amount) > 0 && Number(amount) <= walletChr && !paused;
  const canWithdraw = address && amount && Number(amount) > 0 && Number(amount) <= staked;
  const canClaim = address && pending > 0;

  async function handleStake() {
    if (!canStake) return;
    try {
      setIsStaking(true);
      openToast("pending", "Staking…", "Confirm transaction");

      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "stake",
        args: [parseUnits(amount, DECIMALS)],
      });

      openToast("success", "Staked!", `${amount} CHR locked`);
      setAmount("");
    } catch (err) {
      openToast("error", "Stake Failed", err?.shortMessage || "Rejected");
    } finally {
      setIsStaking(false);
    }
  }

  async function handleWithdraw() {
    if (!canWithdraw) return;
    try {
      setIsWithdrawing(true);
      openToast("pending", "Withdrawing…", "Confirm transaction");

      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "withdraw",
        args: [parseUnits(amount, DECIMALS)],
      });

      openToast("success", "Withdrawn!", `${amount} CHR returned`);
      setAmount("");
    } catch (err) {
      openToast("error", "Withdraw Failed", err?.shortMessage || "Rejected");
    } finally {
      setIsWithdrawing(false);
    }
  }

  async function handleClaim() {
    if (!canClaim) return;
    try {
      setIsClaiming(true);
      openToast("pending", "Claiming…", "Confirm transaction");

      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "getReward",
      });

      openToast("success", "Rewards Claimed!", `${pending.toFixed(6)} CHR`);
    } catch (err) {
      openToast("error", "Claim Failed", err?.shortMessage || "Rejected");
    } finally {
      setIsClaiming(false);
    }
  }

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
              CHR Staking Vault
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight"
            >
              Stake your CHR
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-4 text-xs text-zinc-400"
            >
              Lock CHR to earn rewards from the protocol.
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

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-3 gap-3 text-xs mb-6"
                >
                  <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                    <p className="text-zinc-500">APR</p>
                    <p className="text-emerald-400 font-bold mt-1">
                      {apr > 0 ? `${apr.toFixed(1)}%` : "—"}
                    </p>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                    <p className="text-zinc-500">Total</p>
                    <p className="text-emerald-300 font-bold mt-1">
                      {totalStaked.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                    <p className="text-zinc-500">Rewards</p>
                    <p className="text-emerald-400 font-bold mt-1">
                      {pending.toFixed(4)}
                    </p>
                  </div>
                </motion.div>

                {/* Wallet & Staked */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="grid grid-cols-2 gap-3 text-xs mb-6"
                >
                  <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                    <p className="text-zinc-500">Wallet</p>
                    <p className="text-emerald-300 font-bold mt-1">
                      {walletChr.toFixed(4)}
                    </p>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                    <p className="text-zinc-500">Staked</p>
                    <p className="text-emerald-400 font-bold mt-1">
                      {staked.toFixed(4)}
                    </p>
                  </div>
                </motion.div>

                {staked > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-6"
                  >
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>Your Share</span>
                      <span className="text-emerald-300">
                        {poolShare.toFixed(3)}%
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${poolShare}%` }}
                        transition={{ duration: 0.7, delay: 0.45 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  className="mb-6"
                >
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>Amount</span>
                    <button
                      onClick={() =>
                        setAmount(
                          staked > walletChr
                            ? staked.toString()
                            : walletChr.toString()
                        )
                      }
                      className="text-emerald-300 hover:text-emerald-200"
                    >
                      MAX
                    </button>
                  </div>
                  <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-xl p-4">
                    <span className="text-sm text-emerald-300 font-bold">CHR</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 bg-transparent text-right text-xl font-medium outline-none placeholder-zinc-600"
                    />
                  </div>
                  {paused && (
                    <p className="mt-2 text-[11px] text-yellow-300">
                      Staking paused
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <motion.button
                    whileHover={canStake && !isStaking ? { y: -2 } : {}}
                    onClick={handleStake}
                    disabled={!canStake || isStaking}
                    className={`py-3.5 rounded-xl text-sm font-semibold transition ${
                      canStake && !isStaking
                        ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)]"
                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    }`}
                  >
                    {isStaking ? "Staking…" : "Stake"}
                  </motion.button>

                  <motion.button
                    whileHover={canWithdraw && !isWithdrawing ? { y: -2 } : {}}
                    onClick={handleWithdraw}
                    disabled={!canWithdraw || isWithdrawing}
                    className={`py-3.5 rounded-xl text-sm font-semibold border transition ${
                      canWithdraw && !isWithdrawing
                        ? "border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                        : "border-zinc-800 text-zinc-600 cursor-not-allowed"
                    }`}
                  >
                    {isWithdrawing ? "Unstaking…" : "Unstake"}
                  </motion.button>
                </motion.div>

                <motion.button
                  whileHover={canClaim && !isClaiming ? { y: -2 } : {}}
                  onClick={handleClaim}
                  disabled={!canClaim || isClaiming}
                  transition={{ duration: 0.2 }}
                  className={`mt-3 w-full py-3.5 rounded-xl text-sm font-semibold transition ${
                    canClaim && !isClaiming
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-400 text-black hover:opacity-90 shadow-[0_0_20px_rgba(16,185,129,0.45)]"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  {isClaiming ? "Claiming…" : `Claim ${pending.toFixed(4)} CHR`}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </main>

        <Footer />
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeToast}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
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
