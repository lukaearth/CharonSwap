import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";

import STAKING_ABI from "../abi/CharonStaking.json";
import CHR_ABI from "../abi/Charon.json";

const STAKING_ADDRESS = "0x89519D9E2aE3B945a5Bdeb18C24eAE0c85feD9bD"; // TODO
const OWNER_ADDRESS = "0x14e20cf1a9e7344721b48fd40d6f800ba9cbb314"; // TODO
const DECIMALS = 18;
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export default function AdminPanel() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  if (!address || address.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
    return null;
  }

  const [aprInput, setAprInput] = useState("");
  const [rescueToken, setRescueToken] = useState("");
  const [rescueAmount, setRescueAmount] = useState("");
  const [rescueTo, setRescueTo] = useState("");
  const [adminMsg, setAdminMsg] = useState(null);
  const [isUpdatingAPR, setIsUpdatingAPR] = useState(false);
  const [isRescuing, setIsRescuing] = useState(false);
  const [isTogglingPause, setIsTogglingPause] = useState(false);

  const { data: paused } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "paused",
    watch: true,
  });

  const { data: rewardRateRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "rewardRate",
    watch: true,
  });

  const { data: totalStakedRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "totalSupply",
    watch: true,
  });

  const { data: stakingTokenAddress } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "stakingToken",
    watch: true,
  });

  const { data: contractChrBalanceRaw } = useReadContract({
    address: stakingTokenAddress,
    abi: CHR_ABI,
    functionName: "balanceOf",
    args: [STAKING_ADDRESS],
    query: { enabled: !!stakingTokenAddress },
    watch: true,
  });

  const rewardRate = rewardRateRaw ? Number(formatUnits(rewardRateRaw, DECIMALS)) : 0;
  const totalStaked = totalStakedRaw ? Number(formatUnits(totalStakedRaw, DECIMALS)) : 0;
  const contractChrBalance = contractChrBalanceRaw
    ? Number(formatUnits(contractChrBalanceRaw, DECIMALS))
    : 0;

  const rewardReserve =
    contractChrBalance > totalStaked
      ? contractChrBalance - totalStaked
      : 0;

  const apr =
    totalStaked > 0 && rewardRate > 0
      ? ((rewardRate * SECONDS_PER_YEAR * 100) / totalStaked)
      : 0;

  const runwayDays =
    rewardRate > 0
      ? rewardReserve / (rewardRate * 60 * 60 * 24)
      : 0;

  function setMsg(type, text) {
    setAdminMsg({ type, text });
    setTimeout(() => setAdminMsg(null), 6000);
  }

  async function handleTogglePause() {
    try {
      setIsTogglingPause(true);
      const next = !paused;
      const txHash = await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "setPaused",
        args: [next],
        gas: 200000n,
      });
      setMsg(
        "success",
        `Staking ${next ? "paused" : "unpaused"} (tx: ${txHash}).`
      );
    } catch (err) {
      console.error(err);
      setMsg(
        "error",
        err?.shortMessage || "Failed to toggle paused state."
      );
    } finally {
      setIsTogglingPause(false);
    }
  }

  async function handleUpdateAPR() {
    const aprNum = parseFloat(aprInput);
    if (!aprNum || aprNum <= 0) {
      setMsg("error", "Enter a valid APR percentage.");
      return;
    }
    if (!totalStaked || totalStaked <= 0) {
      setMsg(
        "error",
        "Cannot compute APR with 0 TVL. Stake some CHR first or set rewardRate manually."
      );
      return;
    }

    try {
      setIsUpdatingAPR(true);

      const rewardPerYear = (totalStaked * aprNum) / 100;
      const rewardPerSec = rewardPerYear / SECONDS_PER_YEAR;

      const rewardRateStr = rewardPerSec.toFixed(18);
      const rewardRateBN = parseUnits(rewardRateStr, DECIMALS);

      const txHash = await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "setRewardRate",
        args: [rewardRateBN],
        gas: 300000n,
      });

      setMsg(
        "success",
        `Updated APR target to ~${aprNum.toFixed(
          2
        )}%. Tx: ${txHash}.`
      );
      setAprInput("");
    } catch (err) {
      console.error(err);
      setMsg(
        "error",
        err?.shortMessage || "Failed to update reward rate / APR."
      );
    } finally {
      setIsUpdatingAPR(false);
    }
  }

  async function handleRescue() {
    if (!rescueToken || !rescueAmount || !rescueTo) {
      setMsg("error", "Fill token, amount and recipient.");
      return;
    }

    try {
      setIsRescuing(true);
      const amountBN = parseUnits(rescueAmount, DECIMALS);

      const txHash = await writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "rescueTokens",
        args: [rescueToken, amountBN, rescueTo],
        gas: 400000n,
      });

      setMsg(
        "success",
        `Rescue submitted (tx: ${txHash}).`
      );
      setRescueToken("");
      setRescueAmount("");
      setRescueTo("");
    } catch (err) {
      console.error(err);
      setMsg(
        "error",
        err?.shortMessage || "Rescue transaction failed."
      );
    } finally {
      setIsRescuing(false);
    }
  }

  return (
    <div className="bg-[#05070b]/90 backdrop-blur-2xl rounded-2xl border border-emerald-500/20 shadow-[0_24px_80px_rgba(0,0,0,0.95)] p-5 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 right-0 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
              Admin controls
            </div>
            <div className="text-[11px] text-zinc-500">
              Owner: {OWNER_ADDRESS.slice(0, 6)}…{OWNER_ADDRESS.slice(-4)}
            </div>
          </div>
          <span className="text-[11px] px-2 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
            Owner mode
          </span>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 gap-3 text-[11px] mb-4">
          <div className="rounded-xl bg-black/60 border border-zinc-800/80 px-3 py-2.5">
            <div className="text-zinc-500 mb-1">Total staked</div>
            <div className="text-zinc-50 text-xs">
              {totalStaked.toFixed(2)} <span className="text-zinc-500">CHR</span>
            </div>
          </div>
          <div className="rounded-xl bg-black/60 border border-zinc-800/80 px-3 py-2.5">
            <div className="text-zinc-500 mb-1">Reward reserve</div>
            <div className="text-emerald-300 text-xs">
              {rewardReserve.toFixed(2)} <span className="text-zinc-500">CHR</span>
            </div>
          </div>
          <div className="rounded-xl bg-black/60 border border-zinc-800/80 px-3 py-2.5">
            <div className="text-zinc-500 mb-1">Runway (est.)</div>
            <div className="text-zinc-50 text-xs">
              {runwayDays > 0 ? `${runwayDays.toFixed(1)} days` : "—"}
            </div>
          </div>
        </div>

        {/* APR + pause */}
        <div className="flex flex-wrap gap-3 items-center mb-4 text-[11px]">
          <div className="flex-1">
            <div className="text-zinc-500 mb-1">Current effective APR</div>
            <div className="text-emerald-400 text-xs">
              {apr > 0 ? `${apr.toFixed(2)}%` : "—"}
            </div>
            <div className="text-[10px] text-zinc-500">
              Derived from rewardRate + TVL
            </div>
          </div>
          <button
            onClick={handleTogglePause}
            disabled={isTogglingPause}
            className={`px-3 py-2 rounded-xl text-[11px] font-semibold border transition ${
              paused
                ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                : "border-red-500/60 bg-red-500/10 text-red-300 hover:bg-red-500/20"
            }`}
          >
            {isTogglingPause
              ? "Updating…"
              : paused
              ? "Unpause staking"
              : "Pause staking"}
          </button>
        </div>

        {/* APR editor */}
        <div className="mb-4">
          <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
            <span>Target APR (%)</span>
            <span className="text-zinc-500">
              Requires some CHR staked to compute.
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.1"
              value={aprInput}
              onChange={(e) => setAprInput(e.target.value)}
              placeholder="e.g. 20"
              className="flex-1 bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-xs outline-none text-zinc-100"
            />
            <button
              onClick={handleUpdateAPR}
              disabled={isUpdatingAPR}
              className={`px-3 py-2 rounded-xl text-[11px] font-semibold ${
                isUpdatingAPR
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.6)]"
              }`}
            >
              {isUpdatingAPR ? "Updating…" : "Set APR"}
            </button>
          </div>
        </div>

        {/* emergency drain */}
        <div className="mt-4 pt-4 border-t border-zinc-800/70">
          <div className="text-[11px] text-zinc-400 mb-2">
            Emergency drain (non-CHR tokens only)
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              placeholder="Token"
              value={rescueToken}
              onChange={(e) => setRescueToken(e.target.value)}
              className="bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-[11px] outline-none text-zinc-100"
            />
            <input
              type="text"
              placeholder="Amount"
              value={rescueAmount}
              onChange={(e) => setRescueAmount(e.target.value)}
              className="bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-[11px] outline-none text-zinc-100"
            />
            <input
              type="text"
              placeholder="Recipient"
              value={rescueTo}
              onChange={(e) => setRescueTo(e.target.value)}
              className="bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-[11px] outline-none text-zinc-100"
            />
          </div>
          <button
            onClick={handleRescue}
            disabled={isRescuing}
            className={`w-full h-9 rounded-xl text-[11px] font-semibold ${
              isRescuing
                ? "bg-zinc-900 text-zinc-500 cursor-not-allowed"
                : "bg-zinc-950 text-red-300 border border-red-500/60 hover:bg-red-500/10"
            }`}
          >
            {isRescuing ? "Rescuing…" : "Rescue tokens"}
          </button>
          <div className="text-[10px] text-zinc-500 mt-1">
            Contract blocks rescuing staking/reward token (CHR).
          </div>
        </div>

        {adminMsg && (
          <div
            className={`mt-3 text-[11px] rounded-xl px-3 py-2 border ${
              adminMsg.type === "error"
                ? "border-red-500/60 bg-red-500/10 text-red-200"
                : "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {adminMsg.text}
          </div>
        )}
      </div>
    </div>
  );
}
