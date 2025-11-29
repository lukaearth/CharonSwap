export default function Planet() {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="
            relative
            h-[600px] w-[600px]
            md:h-[750px] md:w-[750px]
            rounded-full 
            overflow-hidden
            animate-planet-rotate
            opacity-[0.22]
          "
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #41FFA6 0%, #0f1a14 45%, #050609 85%)",
            maskImage:
              "radial-gradient(circle at center, black 60%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, black 60%, transparent 100%)",
          }}
        >
          {/* Subtle moving texture */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "url('https://grainy-gradients.vercel.app/noise.png') repeat",
              mixBlendMode: "overlay",
            }}
          ></div>
        </div>
      </div>
    );
  }
  