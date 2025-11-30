import { useEffect, useState } from "react";
import { readContract } from "@wagmi/core";
import { config } from "../wagmi";
import dexABI from "../abi/CharonDex.json";
import { formatUnits } from "viem";

const DEX = "0x2BdA2Ab20D679f8EE829DFe531De3659D4c260Ae";

export default function Analytics() {
  const [reserves, setReserves] = useState({ chr: 0, feth: 0 });
  const [price, setPrice] = useState(0);
  const [tvl, setTvl] = useState(0);
  const [volume24h, setVolume24h] = useState(0);

  async function loadData() {
    try {
      const [r0, r1] = await readContract({
        address: DEX,
        abi: dexABI,
        functionName: "getReserves",
        config
      });

      const chrRes = Number(formatUnits(r0, 18));
      const fethRes = Number(formatUnits(r1, 18));

      // Price is just FETH per CHR
      const priceCalc = fethRes / chrRes;

      // Random volume for demo purposes
      const randomVolume = (Math.random() * 1000).toFixed(2);

      // Rough TVL estimate assuming FETH = $2000
      const tvlCalc = fethRes * 2000 + chrRes * (priceCalc * 2000);

      setReserves({ chr: chrRes, feth: fethRes });
      setPrice(priceCalc);
      setVolume24h(randomVolume);
      setTvl(tvlCalc);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatCard title="CHR Price" value={`${price.toFixed(6)} FETH`} />
        <StatCard title="Total Liquidity (TVL)" value={`$${tvl.toFixed(2)}`} />
        <StatCard title="24H Volume" value={`$${volume24h}`} />

        <StatCard title="Pool CHR Reserve" value={`${reserves.chr.toFixed(2)} CHR`} />
        <StatCard title="Pool FETH Reserve" value={`${reserves.feth.toFixed(4)} FETH`} />
      </div>

      <div className="mt-10 p-6 rounded-xl bg-white/5 border border-white/10">
        <div className="text-lg font-semibold mb-3">Price Chart</div>
        <div className="h-64 rounded-lg bg-gradient-to-br from-emerald-500/10 to-black"></div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="p-5 bg-white/5 border border-white/10 rounded-xl shadow-lg backdrop-blur">
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="text-2xl font-semibold text-emerald-400 mt-1">{value}</div>
    </div>
  );
}
