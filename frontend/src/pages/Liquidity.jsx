import { useState, useEffect } from "react";
import { writeContract, readContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "../wagmi";
import dexABI from "../abi/CharonDex.json";
import { parseUnits, formatUnits } from "viem";

const DEX = "0x2BdA2Ab20D679f8EE829DFe531De3659D4c260Ae";
const CHR = "0x1Cf7355a7cfD8Fa9718ABF77873D384995eed6aa";
const FETH = "0xeF84b001145F02937020bC757f771075f6bB1923";

export default function Liquidity() {
  const [chr, setChr] = useState("");
  const [fethNeeded, setFethNeeded] = useState("");
  const [lpBalance, setLpBalance] = useState(0);

  async function loadLP() {
    try {
      const lp = await readContract({
        address: DEX,
        abi: dexABI,
        functionName: "balanceOf",
        args: [window.ethereum.selectedAddress],
        config
      });
      setLpBalance(Number(formatUnits(lp, 18)));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadLP();
  }, []);

  async function handleAdd() {
    try {
      const chrAmount = parseUnits(chr, 18);
      const fethAmount = parseUnits(fethNeeded, 18);

      await writeContract({
        address: CHR,
        abi: erc20ABI,
        functionName: "approve",
        args: [DEX, chrAmount],
        config
      });

      await writeContract({
        address: FETH,
        abi: erc20ABI,
        functionName: "approve",
        args: [DEX, fethAmount],
        config
      });

      const tx = await writeContract({
        address: DEX,
        abi: dexABI,
        functionName: "addLiquidity",
        args: [chrAmount, fethAmount],
        config
      });

      await waitForTransactionReceipt(config, { hash: tx });
      loadLP();
      setChr("");
      setFethNeeded("");
      alert("Liquidity added!");

    } catch (err) {
      console.error(err);
      alert("Error adding liquidity");
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 text-white">

      <h1 className="text-3xl font-bold mb-6">Liquidity</h1>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-lg">

        <label className="block mb-3">
          <span className="text-sm text-zinc-400">CHR Amount</span>
          <input
            value={chr}
            onChange={(e) => {
              setChr(e.target.value);
              setFethNeeded((Number(e.target.value) / 1_000_000).toString());
            }}
            className="w-full mt-1 px-4 py-2 bg-black/40 border border-white/10 rounded-md"
            placeholder="0.0"
          />
        </label>

        <label className="block mb-5">
          <span className="text-sm text-zinc-400">Required FETH</span>
          <input
            value={fethNeeded}
            onChange={(e) => setFethNeeded(e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-black/40 border border-white/10 rounded-md"
            placeholder="0.0"
          />
        </label>

        <button
          onClick={handleAdd}
          className="w-full bg-emerald-500 text-black py-3 rounded-md font-semibold hover:bg-emerald-400 transition"
        >
          Add Liquidity
        </button>

        <div className="mt-6 text-zinc-400 text-sm">
          Your LP balance: <span className="text-white">{lpBalance.toFixed(4)}</span>
        </div>
      </div>

    </div>
  );
}
