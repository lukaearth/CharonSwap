/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        emerald: {
          400: "#41FFA6",
        },
      },
      keyframes: {
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 0px rgba(16,185,129,0.0)" },
          "50%": { boxShadow: "0 0 22px rgba(16,185,129,0.6)" },
          "100%": { boxShadow: "0 0 0px rgba(16,185,129,0.0)" },
        },
        rotate180: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(180deg)" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.25s ease-out forwards",
        glow: "glow 0.5s ease-out",
        "rotate-180": "rotate180 0.25s ease-out",
      },
    },
  },
  animation: {
    "spin-slow": "spin 12s linear infinite",
    "spin-slower": "spin 22s linear infinite",
    "spin-slowest": "spin 35s linear infinite",
    "fade-in-up": "fadeInUp 0.8s ease-out forwards",
  },
  keyframes: {
    fadeInUp: {
      "0%": { opacity: 0, transform: "translateY(20px)" },
      "100%": { opacity: 1, transform: "translateY(0)" },
    },
  },
  extend: {
    animation: {
      "planet-rotate": "planetSpin 60s linear infinite",
    },
    keyframes: {
      planetSpin: {
        "0%": { transform: "translateX(0px)" },
        "100%": { transform: "translateX(-80px)" },
      },
    },
  },
  extend: {
    keyframes: {
      fadeUp: {
        '0%': { opacity: 0, transform: 'translateY(10px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
      },
    },
    animation: {
      fadeUp: 'fadeUp 0.7s ease-out forwards',
    },
  },
  
  
  plugins: [],
  
};
