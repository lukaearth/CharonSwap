import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Starfield from "../components/Starfield";
import { motion } from "framer-motion";

export default function About() {
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
        <main className="flex-1 px-6 pt-24 pb-32">
          <div className="mx-auto max-w-4xl">

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-black/40 px-4 py-1 text-xs font-medium text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.45)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              About CharonSwap
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: [0, -4, 0],
              }}
              transition={{
                duration: 0.9,
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }}
              className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
            >
              Crossing the River
              <span className="block text-emerald-400 mt-2">
                One Block at a Time.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.15 }}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-300"
            >
              CharonSwap is a testnet sandbox where I prototype complete DeFi systems to build real-world engineering experience. 
              It includes an AMM DEX, staking mechanism, wallet integration, and a fully custom frontend built by me.
            </motion.p>

            <motion.section
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="mt-20 grid md:grid-cols-2 gap-12 items-start"
            >
              <div>
                <h2 className="text-center text-3xl font-bold text-emerald-400">My Objective</h2>
                <p className="text-center mt-4 text-zinc-300 leading-relaxed">
                  My objective with this project was to learn by building real systems on testnet — the fastest path to mastering DeFi engineering. 
                  I started with web development at an early age, then found an even stronger passion for blockchain engineering.
                </p>
              </div>

              <div>
                <h2 className="text-center text-3xl font-bold text-emerald-400">Why I Build</h2>
                <p className="text-center mt-4 text-zinc-300 leading-relaxed">
                  I build DeFi prototypes to deepen my engineering skills and understand how real protocols work under the hood. 
                  I'm hoping to land a job position within a year from writing (11/29/2025) to advance my skills even further.
                </p>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="mt-32"
            >
              <h2 className="text-4xl font-bold text-center mb-12 text-emerald-400">
                Skills Used In This Project
              </h2>

              <motion.div
                className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  visible: { transition: { staggerChildren: 0.12 } },
                }}
              >
                {[
                  "Solidity contracts (AMM, staking, ERC-20)",
                  "Liquidity pool math & swap mechanics",
                  "React + Wagmi + RainbowKit integration",
                  "Custom UI/UX, layout, and visual system",
                  "Hardhat deployment & testing",
                  "Product design and full-stack ownership",
                ].map((item) => (
                  <motion.div
                    key={item}
                    variants={{
                      hidden: { opacity: 0, y: 18 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.6 }}
                    className="rounded-lg border border-white/10 bg-black/30 px-6 py-5 backdrop-blur-sm 
                               hover:border-emerald-400/60 hover:bg-black/50 transition-all duration-300"
                  >
                    <p className="text-base font-medium text-zinc-300">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="mt-32 text-center"
            >
              <h2 className="text-4xl font-bold mb-4">
                Solo-crafted by
              </h2>

              <a
                href="https://luka.earth"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-5xl font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                luka.earth
              </a>

              <p className="mt-8 max-w-xl mx-auto text-zinc-400">
                A 17-year-old full-stack blockchain engineer who believes the best way to learn DeFi 
                is to ship real-feeling products on testnet — fast, iteratively, and in public.
              </p>
            </motion.section>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-10 flex justify-center"
            >
              <motion.a
                href="https://github.com/luka-turunen"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="
                  group relative flex items-center gap-3 
                  px-5 py-3 
                  rounded-full 
                  bg-black/40 
                  border border-white/10 
                  backdrop-blur 
                  shadow-[0_0_20px_rgba(16,185,129,0.25)]
                  transition-all duration-300
                  hover:border-emerald-400/60
                  hover:bg-black/60
                  hover:shadow-[0_0_32px_rgba(16,185,129,0.55)]
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-zinc-300 group-hover:text-emerald-300 transition-colors"
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.45 7.9 10.98.58.1.8-.25.8-.56v-1.97c-3.22.7-3.9-1.55-3.9-1.55-.53-1.33-1.3-1.68-1.3-1.68-1.06-.73.08-.72.08-.72 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.26 3.4.96.1-.75.4-1.26.73-1.55-2.57-.3-5.28-1.28-5.28-5.7 0-1.26.45-2.3 1.2-3.12-.12-.3-.53-1.52.1-3.17 0 0 1-.32 3.3 1.2a11.24 11.24 0 0 1 6 0c2.3-1.52 3.3-1.2 3.3-1.2.63 1.65.22 2.87.1 3.17a4.54 4.54 0 0 1 1.2 3.12c0 4.43-2.73 5.4-5.32 5.68.42.37.8 1.1.8 2.24v3.32c0 .3.2.66.8.55A10.98 10.98 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>

                <span className="text-zinc-300 font-medium group-hover:text-emerald-300 transition-colors">
                  View on GitHub
                </span>
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-14 flex flex-col items-center gap-6"
            >
              <p className="text-xl text-zinc-400">Ready to cross the river?</p>

              <motion.div whileHover={{ y: -3 }}>
                <Link
                  to="/faucet"
                  className="
                    group relative inline-flex items-center justify-center 
                    px-8 py-4 text-lg font-semibold 
                    rounded-md 
                    bg-black/40 mt-2
                    border border-emerald-500/60 
                    text-emerald-300 
                    shadow-[0_0_20px_rgba(16,185,129,0.3)] 
                    backdrop-blur 
                    transition-all duration-300
                    hover:bg-black/60 
                    hover:shadow-[0_0_32px_rgba(16,185,129,0.6)]
                  "
                >
                  Launch the App
                  <span className="ml-3 text-emerald-400 transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </Link>
              </motion.div>
            </motion.div>

          </div>
        </main>

        <footer className="border-t border-white/10 bg-black/40 py-6 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} CharonSwap • Experimental DeFi lab by Luka Turunen
        </footer>
      </div>
    </div>
  );
}
