import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    CartesianGrid,
  } from "recharts";
  
  // Mock price data for the chart
  const data = [
    { time: "10:00", price: 0.00095 },
    { time: "11:00", price: 0.00102 },
    { time: "12:00", price: 0.00098 },
    { time: "13:00", price: 0.0011 },
    { time: "14:00", price: 0.00105 },
    { time: "15:00", price: 0.00118 },
    { time: "16:00", price: 0.00112 },
  ];
  
  function PriceTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
  
    const p = payload[0].value;
  
    return (
      <div className="rounded-lg bg-[#05070b] border border-emerald-500/30 px-3 py-2 text-xs text-zinc-100 shadow-lg">
        <div className="text-[11px] text-zinc-400 mb-1">{label}</div>
        <div className="font-semibold text-emerald-400">
          {p.toFixed(6)} FETH
        </div>
        <div className="text-[11px] text-zinc-500">per 1 CHR</div>
      </div>
    );
  }
  
  export default function RightPanel() {
    return (
      <div className="space-y-6 w-full">
        <div className="bg-[#0b0d11]/90 backdrop-blur-xl rounded-2xl border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.6)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold tracking-tight text-white">
                CHR / FETH
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Constant product AMM — Sepolia Testnet
              </div>
            </div>
  
            <div className="text-right">
              <div className="text-emerald-400 font-medium text-[13px]">
                FETH
              </div>
              <div className="text-[10px] text-zinc-600">Quote asset</div>
            </div>
          </div>
  
          <div className="grid grid-cols-3 gap-4 mt-7">
            {[
              { title: "Pool CHR", value: "—" },
              { title: "Pool FETH", value: "—" },
              { title: "24h Volume", value: "Testnet" },
            ].map((box, i) => (
              <div
                key={i}
                className="bg-[#111418]/80 rounded-xl px-4 py-4 border border-white/5 shadow-inner"
              >
                <div className="text-[11px] text-zinc-500">{box.title}</div>
                <div className="text-[15px] mt-1 font-medium text-zinc-200">
                  {box.value}
                </div>
              </div>
            ))}
          </div>
        </div>
  
        <div className="bg-[#0b0d11]/90 backdrop-blur-xl rounded-2xl border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.6)] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">Price Chart</div>
            <div className="flex gap-2">
              {["1H", "1D", "1W"].map((t, idx) => (
                <button
                  key={t}
                  className={`text-[10px] px-2 py-1 rounded-md border ${
                    idx === 1
                      ? "bg-emerald-500/10 border-emerald-500/60 text-emerald-300"
                      : "bg-[#111418]/80 border-white/5 text-zinc-400 hover:text-white"
                  } transition`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
  
          <div className="h-56 rounded-xl bg-gradient-to-b from-[#141821] to-[#05070b] border border-white/5 px-3 py-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid
                  stroke="#262a33"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  tickFormatter={(v) => v.toFixed(4)}
                />
  
                <defs>
                  <linearGradient id="charonLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="50%" stopColor="#41ffa6" />
                    <stop offset="100%" stopColor="#a7f3d0" />
                  </linearGradient>
                </defs>
  
                <Tooltip
                  content={<PriceTooltip />}
                  cursor={{ stroke: "rgba(148,163,184,0.4)", strokeWidth: 1 }}
                />
  
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="url(#charonLine)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#41ffa6",
                    stroke: "#ecfdf5",
                    strokeWidth: 1.5,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
  
          <p className="text-[11px] text-zinc-600 mt-3">
            Using mock data for now
          </p>
        </div>
      </div>
    );
  }
  