import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Starfield from "../components/Starfield";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import Footer from "../components/Footer"


export default function Landing() {
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

        <main className="flex flex-1 items-center justify-center">
          <section className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-14 pb-24 text-center">

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/40 px-4 py-1 text-xs font-medium text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.45)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Crypto AMM • Testnet
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: [0, -4, 0],
              }}
              transition={{
                duration: 0.8,
                y: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            >
              Built To Move{" "}
              <span className="block text-emerald-400">
                Liquidity Across The River.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mt-6 max-w-2xl text-sm text-zinc-300 sm:text-base"
            >
              CharonSwap is a sandbox built to showcase my ability to design, build, and ship complete DeFi systems — 
              from Solidity contracts to a production-style frontend. Built entirely by me and deployed on the Sepolia testnet.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="pointer-events-none relative mt-5 w-full max-w-3xl"
            >
              <div className="relative h-[100px] w-full overflow-hidden rounded-t-[999px] bg-transparent"></div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 }}
                className="pointer-events-auto relative -mt-20 flex flex-col items-center"
              >

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">

                  <motion.div whileHover={{ y: -3 }}>
                    <Link
                      to="/faucet"
                      className="
                        group relative inline-flex items-center justify-center 
                        px-6 py-3 text-sm font-semibold 
                        rounded-md 
                        bg-black/40 
                        border border-emerald-500/60 
                        text-emerald-300 
                        shadow-[0_0_18px_rgba(16,185,129,0.25)] 
                        backdrop-blur 
                        transition-all duration-300
                        hover:bg-black/60 
                        hover:shadow-[0_0_32px_rgba(16,185,129,0.7)]
                      "
                    >
                      Launch App
                      <span className="ml-2 text-emerald-400 transition-transform duration-300 group-hover:translate-x-1">
                        ↗
                      </span>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ y: -3 }}>
                    <Link
                      to="/about"
                      className="
                        inline-flex items-center justify-center 
                        px-6 py-3 text-sm font-medium 
                        rounded-md 
                        border border-zinc-600 
                        text-zinc-300 
                        bg-black/30 
                        hover:border-emerald-400 
                        hover:text-emerald-300 
                        hover:shadow-[0_0_22px_rgba(16,185,129,0.4)]
                        transition-all duration-300
                      "
                    >
                      Learn More
                    </Link>
                  </motion.div>

                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="mt-10 flex w-full max-w-3xl flex-wrap items-center justify-center gap-8 border-t border-white/5 pt-8 text-[11px] uppercase tracking-[0.16em] text-zinc-500"
            >
              <span className="opacity-60">EVM • Solidity • React</span>
              <span className="opacity-60">
                Developed by{" "}
                <a
                  href="https://luka.earth"
                  target="_blank"
                  className="text-white underline decoration-100 font-bold"
                >
                  luka.earth
                </a>
              </span>
              <span className="opacity-60">Hardhat • Wagmi • RainbowKit</span>
            </motion.div>

          </section>
        </main>

        < Footer />
      </div>
    </div>
  );
}
