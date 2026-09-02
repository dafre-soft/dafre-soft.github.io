import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";

/* ---------------- random starfield ---------------- */
const STAR_COLORS = ["#ffffff", "#ffe9a0", "#a8e7ff", "#ffc2de", "#d0ffa8"];

export function Starfield({
  count = 70,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() < 0.82 ? 2 : 3,
        delay: Math.random() * 4,
        dur: 1.4 + Math.random() * 3.2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      })),
    [count]
  );
  return (
    <div aria-hidden className={`starfield ${className}`}>
      {stars.map((s) => (
        <i
          key={s.id}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: s.color,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
            animationDelay: `${s.delay}s`,
            ["--tw" as string]: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- sparkle cursor trail ---------------- */
export function SparkleTrail() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const glyphs = ["✦", "★", "✧", "+", "·"];
    let last = 0;
    let count = 0;
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - last < 70 || count > 34) return;
      last = now;
      count++;
      const el = document.createElement("span");
      el.className = "sparkle";
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.left = `${e.clientX + (Math.random() * 14 - 7)}px`;
      el.style.top = `${e.clientY + (Math.random() * 10 - 5)}px`;
      el.style.fontSize = `${9 + Math.random() * 8}px`;
      document.body.appendChild(el);
      setTimeout(() => {
        el.remove();
        count--;
      }, 720);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return null;
}

/* ---------------- scroll reveal ---------------- */
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (ents) => {
        ents.forEach((en) => {
          if (en.isIntersecting) {
            el.classList.add("vis");
            io.disconnect();
          }
        });
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}

/* ---------------- hazard stripe bar ---------------- */
export function Hazard({ className = "h-3" }: { className?: string }) {
  return <div aria-hidden className={`hazard ${className}`} />;
}

/* ---------------- pixel star svg ---------------- */
export function PixelStar({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden
    >
      <g fill="#000">
        <rect x="5" y="0" width="2" height="12" />
        <rect x="0" y="5" width="12" height="2" />
        <rect x="2" y="2" width="2" height="2" />
        <rect x="8" y="2" width="2" height="2" />
        <rect x="2" y="8" width="2" height="2" />
        <rect x="8" y="8" width="2" height="2" />
      </g>
      <g fill="#ffd900">
        <rect x="5" y="1" width="2" height="10" />
        <rect x="1" y="5" width="10" height="2" />
        <rect x="5" y="5" width="2" height="2" fill="#fff3a0" />
      </g>
    </svg>
  );
}

/* ---------------- the pipis mascot (pixel blob) ---------------- */
export function PipisMascot({
  size = 64,
  className = "",
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const P = {
    k: "#000",
    y: "#ffd900",
    l: "#fff3a0",
    d: "#b78e00",
    w: "#ffffff",
    r: "#ff3b1f",
  };
  // 12x10 grid
  const rows = [
    "....kkkk....",
    "..kkylllyykk..",
    ".kyllyyyyllk.",
    ".kyyyyyyyyyk.",
    "kywkywwwkywky".slice(0, 12),
    "kykkywwwkkyky".slice(0, 12),
    ".kyyrrryyrk.",
    ".kyyyyyyyk..",
    "..kyyyyyyk..",
    "...kk..kk...",
  ];
  const px: ReactNode[] = [];
  rows.forEach((row, y) => {
    row.split("").forEach((ch, x) => {
      const c = ch === "k" ? P.k : ch === "y" ? P.y : ch === "l" ? P.l : ch === "d" ? P.d : ch === "w" ? P.w : ch === "r" ? P.r : null;
      if (c) px.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={c} />);
    });
  });
  return (
    <svg
      width={size}
      height={size * (10 / 12)}
      viewBox="0 0 12 10"
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden
    >
      {px}
    </svg>
  );
}

/* ---------------- section title bar ---------------- */
export function SectionTitle({
  id,
  children,
  color = "var(--y)",
}: {
  id?: string;
  children: ReactNode;
  color?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div
        className="flex items-center gap-3 px-4 py-3 border-3 border-black"
        style={{ background: color, boxShadow: "5px 5px 0 #000" }}
      >
        <PixelStar size={20} className="spin-slow shrink-0" />
        <h2 className="font-px text-[13px] sm:text-base text-black leading-relaxed">{children}</h2>
        <PixelStar size={20} className="spin-slow shrink-0 ml-auto" />
      </div>
      <Hazard className="h-2" />
    </div>
  );
}
