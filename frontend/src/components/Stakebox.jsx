import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import Navbar from "./Navbar";
import Starfield from "./Starfield";

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

  const apr = totalStaked > 0 && rewardRate > 0
    ? (rewardRate * SECONDS_PER_YEAR * 100) / totalStaked
    : 0;

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
      openToast("pending", "Staking…", "Confirm in your wallet");

      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "stake",
        args: [parseUnits(amount, DECIMALS)],
      });

      openToast("success", "Staked!", `${amount} CHR locked and earning`);
      setAmount("");
    } catch (err) {
      openToast("error", "Stake Failed", err?.shortMessage || "Transaction rejected");
    } finally {
      setIsStaking(false);
    }
  }

  async function handleWithdraw() {
    if (!canWithdraw) return;
    try {
      setIsWithdrawing(true);
      openToast("pending", "Withdrawing…", "Confirm in your wallet");

      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "withdraw",
        args: [parseUnits(amount, DECIMALS)],
      });

      openToast("success", "Withdrawn!", `${amount} CHR returned to wallet`);
      setAmount("");
    } catch (err) {
      openToast("error", "Withdraw Failed", err?.shortMessage || "Transaction rejected");
    } finally {
      setIsWithdrawing(false);
    }
  }

  async function handleClaim() {
    if (!canClaim) return;
    try {
      setIsClaiming(true);
      openToast("pending", "Claiming rewards…", "Confirm in your wallet");

      await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "getReward",
        args: [],
      });

      openToast("success", "Rewards Claimed!", `${pending.toFixed(6)} CHR sent to wallet`);
    } catch (err) {
      openToast("error", "Claim Failed", err?.shortMessage || "Transaction rejected");
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050709] text-white font-inter overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.18]"><Starfield /></div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,222,128,0.16),transparent_55%),radial-gradient(circle_at_bottom,rgba(22,101,52,0.5),#02040a_70%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        {/* HERO */}
        <main className="flex flex-1 items-center justify-center px-6 py-20">
          <div className="w-full max-w-2xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/40 px-5 py-1.5 text-xs font-medium text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.45)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CHR Staking Vault • Earn Passive Yield
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Stake CHR
            </h1>

            <p className="mt-6 text-base text-zinc-300 max-w-xl mx-auto">
              Lock your CHR to earn auto-compounding rewards. APR adjusts dynamically with pool size.
            </p>

            {/* Stats Grid */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl p-6 shadow-xl">
                <p className="text-sm text-zinc-500">Current APR</p>
                <p className="text-4xl font-bold text-emerald-400 mt-2">
                  {apr > 0 ? `${apr.toFixed(1)}%` : "—"}
                </p>
              </div>
              <div className="rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl p-6 shadow-xl">
                <p className="text-sm text-zinc-500">Total Staked</p>
                <p className="text-4xl font-bold text-emerald-300 mt-2">
                  {totalStaked.toFixed(2)}
                </p>
              </div>
              <div className="rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl p-6 shadow-xl">
                <p className="text-sm text-zinc-500">Your Rewards</p>
                <p className="text-4xl font-bold text-emerald-400 mt-2 animate-pulse">
                  {pending.toFixed(6)}
                </p>
              </div>
            </div>

            {/* Staking Card */}
            <div className="mt-12 mx-auto max-w-lg">
              <div className="relative rounded-3xl bg-black/40 border border-white/10 backdrop-blur-2xl p-10 shadow-2xl overflow-hidden">
                <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />

                <div className="relative z-10">
                  {/* Your Position */}
                  <div className="grid grid-cols-2 gap-6 mb-8 text-center">
                    <div>
                      <p className="text-sm text-zinc-500">Wallet Balance</p>
                      <p className="text-2xl font-bold text-emerald-300 mt-1">{walletChr.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Staked Amount</p>
                      <p className="text-2xl font-bold text-emerald-400 mt-1">{staked.toFixed(4)}</p>
                    </div>
                  </div>

                  {/* Pool Share */}
                  {staked > 0 && (
                    <div className="mb-8">
                      <div className="flex justify-between text-sm text-zinc-400 mb-3">
                        <span>Your Pool Share</span>
                        <span className="text-emerald-300">{poolShare.toFixed(4)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-zinc-900 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] transition-all duration-1000"
                          style={{ width: `${poolShare}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="mb-8">
                    <div className="flex justify-between text-sm text-zinc-400 mb-3">
                      <span>Amount to stake / unstake</span>
                      <button
                        onClick={() => setAmount(staked > walletChr ? staked.toString() : walletChr.toString())}
                        className="text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        MAX
                      </button>
                    </div>
                    <div className="flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/50 transition-all">
                      <span className="text-2xl">CHR</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        className="flex-1 bg-transparent text-right text-3xl font-medium outline-none placeholder-zinc-600"
                      />
                    </div>
                    {paused && (
                      <p className="mt-3 text-sm text-yellow-300 text-center">
                        New staking paused — withdrawals & claims still active
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleStake}
                      disabled={!canStake || isStaking}
                      className={`
                        py-5 rounded-2xl font-bold text-lg transition-all duration-300
                        ${canStake && !isStaking
                          ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_32px_rgba(16,185,129,0.6)] hover:shadow-[0_0_48px_rgba(16,185,129,0.8)]"
                          : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        }
                      `}
                    >
                      {isStaking ? "Staking…" : "Stake CHR"}
                    </button>

                    <button
                      onClick={handleWithdraw}
                      disabled={!canWithdraw || isWithdrawing}
                      className={`
                        py-5 rounded-2xl font-bold text-lg transition-all duration-300 border
                        ${canWithdraw && !isWithdrawing
                          ? "border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                          : "border-zinc-800 text-zinc-600 cursor-not-allowed"
                        }
                      `}
                    >
                      {isWithdrawing ? "Unstaking…" : "Unstake"}
                    </button>
                  </div>

                  {/* Claim Button */}
                  <button
                    onClick={handleClaim}
                    disabled={!canClaim || isClaiming}
                    className={`
                      mt-6 w-full py-5 rounded-2xl font-bold text-lg transition-all
                      ${canClaim && !isClaiming
                        ? "bg-gradient-to-r from-emerald-600 to-cyan-500 text-black hover:shadow-[0_0_40px_rgba(16,185,129,0.7)]"
                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      }
                    `}
                  >
                    {isClaiming ? "Claiming…" : `Claim ${pending.toFixed(6)} CHR Rewards`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/10 bg-black/40 py-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} CharonDEX · Experimental DeFi lab by Luka Turunen
        </footer>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/70" onClick={closeToast} />
          <div className="relative pointer-events-auto animate-in fade-in zoom-in duration-300">
            <div className="rounded-2xl bg-black/80 border border-white/10 backdrop-blur-2xl p-8 shadow-2xl max-w-sm mx-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-2xl font-bold ${toast.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                    {toast.title}
                  </p>
                  <p className="text-sm text-zinc-300 mt-2">{toast.desc}</p>
                </div>
                <button onClick={closeToast} className="text-zinc-500 hover:text-white">X</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}