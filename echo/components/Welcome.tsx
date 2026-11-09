"use client";
import { useEffect, useState } from "react";

type P = { w: number; h: number; x: number; y: number; o: number; fx: number; fy: number; fz: number; r: number; ax: number; ay: number };
// Resting geometry (120×120 mark) + exploded offsets per piece.
const PIECES: P[] = [
  { w: 22, h: 120, x: 0, y: 0, o: 1, fx: -90, fy: -30, fz: 120, r: -70, ax: 0, ay: 1 },
  { w: 86, h: 22, x: 34, y: 0, o: 1, fx: 80, fy: -80, fz: 160, r: 55, ax: 1, ay: 0 },
  { w: 62, h: 22, x: 34, y: 49, o: 0.72, fx: 120, fy: 10, fz: -90, r: -45, ax: 1, ay: 1 },
  { w: 38, h: 22, x: 34, y: 98, o: 0.44, fx: 40, fy: 90, fz: 140, r: 80, ax: 0, ay: 1 },
];
const DEPTH = [0, -6, -12, -18]; // faux extrusion layers

export function Welcome({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("echo-welcome") === "1";
    if (reduce || seen) return onDone();
    sessionStorage.setItem("echo-welcome", "1");
    const t1 = setTimeout(() => setLeaving(true), 4300);
    const t2 = setTimeout(onDone, 5100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      role="dialog" aria-label="Echo welcome"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink transition-all duration-[800ms] ease-[cubic-bezier(.7,0,.2,1)]"
      style={{ opacity: leaving ? 0 : 1, transform: leaving ? "scale(1.04)" : "none", filter: leaving ? "blur(6px)" : "none" }}
    >
      <div className="logo-stage" style={{ width: 120, height: 120 }}>
        <div className="logo-spin relative h-full w-full">
          {PIECES.map((p, i) => (
            <div
              key={i}
              className="logo-piece absolute inset-0"
              style={{ "--x": `${p.fx}px`, "--y": `${p.fy}px`, "--z": `${p.fz}px`, "--r": `${p.r}deg`, "--ax": p.ax, "--ay": p.ay } as React.CSSProperties}
            >
              {DEPTH.map((z, d) => (
                <div
                  key={d}
                  className="absolute"
                  style={{
                    left: p.x, top: p.y, width: p.w, height: p.h,
                    transform: `translateZ(${z}px)`,
                    background: d === 0 ? "#D6A24A" : d === DEPTH.length - 1 ? "#6B4F1F" : "#9C7430",
                    opacity: p.o,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="rise mt-8 font-display text-2xl tracking-tight text-bone" style={{ animationDelay: "2.9s" }}>Echo</p>
      <p className="label rise mt-2" style={{ animationDelay: "3.2s" }}>Verifiable signals, not opinions</p>
      <button onClick={onDone} className="label absolute bottom-6 right-6 hover:text-bone">Skip</button>
    </div>
  );
}
