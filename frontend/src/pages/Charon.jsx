import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Starfield from "../components/Starfield";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ecosystemProjects = [
  {
    name: "CharonSwap",
    tagline: "Cross-Chain AMM",
    description: "The flagship decentralized exchange enabling seamless liquidity movement across EVM chains on Sepolia testnet.",
    status: "live",
    image: "/ecosystem/charonswap.png",
    link: "/swap",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    name: "CharonNFT",
    tagline: "NFT Marketplace",
    description: "Trade, mint, and collect NFTs with ultra-low fees and cross-chain support (in development).",
    status: "soon",
    image: "/ecosystem/charonnft.png",
    link: "#",
    gradient: "from-purple-500 to-pink-600",
  },
    {
    name: "CharonSafe",
    tagline: "Multisig Wallet",
    description: "Secure multi-signature wallet with role-based permissions and recovery (coming soon).",
    status: "soon",
    image: "/ecosystem/charonsafe.png",
    link: "#",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    name: "CharonLaunch",
    tagline: "Fair Launchpad",
    description: "Token sale platform with anti-bot mechanics and vesting schedules (in stealth).",
    status: "soon",
    image: "/ecosystem/charonlaunch.png",
    link: "#",
    gradient: "from-orange-500 to-red-600",
  },
];

export default function CharonEcosystem() {
  return (
    <div className="relative min-h-screen bg-[#050709] text-white font-inter overflow-hidden">
      <div className="absolute inset-0 opacity-[0.18]">
        <Starfield />
      </div>

      <motion.div
        initial={{ opacity: 0.25 }}
        animate={{ opacity: [0.25, 0.35, 0.25] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(22,101,52,0.4),#02040a_70%)]"
      />

      <Navbar />

      <div className="relative z-10 flex min-h-screen flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/40 px-4 py-1.5 text-xs font-medium text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.45)]"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Charon Protocol Ecosystem
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: [0, -6, 0],
            }}
            transition={{
              duration: 0.9,
              y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            }}
            className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
          >
            One Protocol.
            <span className="block text-emerald-400">Many Rivers to Cross.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="mt-6 max-w-2xl text-lg text-zinc-300"
          >
            The Charon Protocol is expanding into a full DeFi ecosystem — all built with security, simplicity, and cross-chain in mind.
          </motion.p>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ecosystemProjects.map((project, index) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl 
                  transition-all duration-500 hover:border-emerald-400/50 hover:shadow-2xl hover:shadow-emerald-500/20"
              >
                <div className={`h-1.5 bg-gradient-to-r ${project.gradient}`} />

                {project.status === "soon" && (
                  <div className="absolute right-4 top-4 z-10 rounded-full bg-black/70 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-400 shadow-lg">
                    Coming Soon
                  </div>
                )}

                {project.status === "live" && (
                  <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-emerald-900/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live on Testnet
                  </div>
                )}

                <div className="p-8">
                  <div className="relative mb-8 overflow-hidden rounded-xl border border-white/10">
                    <div className="aspect-video w-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center">
                      <svg className="h-16 w-16 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  <h3 className="text-2xl font-bold text-white">{project.name}</h3>
                  <p className="mt-2 text-sm font-medium text-emerald-400">{project.tagline}</p>
                  <p className="mt-4 text-zinc-400">{project.description}</p>

                  <div className="mt-8">
                    {project.status === "live" ? (
                      <Link
                        to={project.link}
                        className="group/button inline-flex items-center gap-3 rounded-lg bg-emerald-500/20 px-6 py-3 text-sm font-semibold text-emerald-300 
                          border border-emerald-500/40 backdrop-blur transition-all hover:bg-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/30"
                      >
                        Enter App
                        <span className="transition-transform group-hover/button:translate-x-1">→</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="inline-flex cursor-not-allowed items-center gap-3 rounded-lg bg-zinc-800/60 px-6 py-3 text-sm font-semibold text-zinc-500 border border-zinc-700"
                      >
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}