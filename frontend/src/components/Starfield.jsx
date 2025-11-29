import { useRef, useEffect } from "react";

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    let w, h, stars = [], shootingStars = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // --- STAR DATA ---
    const STAR_COUNT = 250;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseSize: Math.random() * 1.8 + 0.6,
        pulse: Math.random() * 0.04 + 0.01, // blinking speed
        phase: Math.random() * Math.PI * 2, // random timing
        glow: Math.random() * 4 + 4, // halo glow radius
        depth: Math.random() * 0.7 + 0.3, // parallax
      });
    }

    // --- SHOOTING STARS ---
    function spawnShootingStar() {
      shootingStars.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.4,
        len: 200 + Math.random() * 150,
        speed: 10 + Math.random() * 10,
        opacity: 1,
      });

      setTimeout(spawnShootingStar, 3000 + Math.random() * 5000);
    }
    spawnShootingStar();

    // --- LOOP ---
    function animate() {
      ctx.clearRect(0, 0, w, h);

      // 🟢 Nebula
      const nebula = ctx.createRadialGradient(
        w * 0.7, h * 0.3, 0,
        w * 0.5, h * 0.5, w * 0.9
      );
      nebula.addColorStop(0, "rgba(0, 255, 180, 0.12)");
      nebula.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, w, h);

      // ⭐ Stars
      for (const s of stars) {
        s.x -= s.depth * 0.05;
        if (s.x < 0) s.x = w;

        // pulsing brightness
        s.phase += s.pulse;
        const brightness = 0.6 + Math.sin(s.phase) * 0.4;

        // glow halo
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${0.15 * brightness})`;
        ctx.arc(s.x, s.y, s.glow, 0, Math.PI * 2);
        ctx.fill();

        // core bright dot
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${brightness})`;
        ctx.arc(s.x, s.y, s.baseSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 🌠 Shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x -= s.speed;
        s.y += s.speed * 0.3;
        s.opacity -= 0.01;

        if (s.opacity <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const grad = ctx.createLinearGradient(
          s.x, s.y, 
          s.x + s.len, s.y - s.len * 0.3
        );
        grad.addColorStop(0, `rgba(255,255,255,${s.opacity})`);
        grad.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.len, s.y - s.len * 0.3);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.75]"
    />
  );
}
