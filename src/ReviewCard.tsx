import { useRef, useState } from "react";
import type { PpcEntry } from "./lib/pp";
import { abs } from "./lib/pp";
import { PipisMascot, PixelStar } from "./fx";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-[2px]" title={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden>
          <path
            d="M6 0l1.6 3.9L12 4.4 8.9 7l1 4.3L6 8.9 2.1 11.3l1-4.3L0 4.4l4.4-.5z"
            fill={i <= full ? "#ffd900" : "#3a3a4a"}
            stroke="#000"
            strokeWidth="0.8"
          />
        </svg>
      ))}
      <span className="font-crt text-lg text-[#ffd900] ml-1">{rating.toFixed(1)}/5</span>
    </span>
  );
}

function BannerSlot({ entry }: { entry: PpcEntry }) {
  const [failed, setFailed] = useState(false);
  const target = entry.repo || entry.src;
  if (failed) {
    return (
      <a
        href={target}
        target="_blank"
        rel="noopener noreferrer"
        className="banner-slot block group"
        title={entry.repo ? `open ${entry.repo}` : entry.src}
      >
        <div className="relative overflow-hidden">
          <div className="barber h-4" />
          <div className="px-4 py-8 text-center bg-black">
            <div className="font-px text-[10px] text-[#ff3b1f] blink">✖ banner.gif NOT FOUND ✖</div>
            <div className="font-crt text-lg text-[#00e5ff] mt-2 leading-tight break-all">
              hunted at: {entry.bannerUrl}
            </div>
            <div className="font-toon font-bold text-[13px] text-white mt-2">
              webmaster says: drop the banner at <span className="text-[#ffd900]">/pipisclub/banner.gif</span> in
              the repo — or set <span className="text-[#ffd900]">banner=</span> in the .ppc. it is clickable once
              it exists, promise.
            </div>
          </div>
          <div className="barber h-4" />
        </div>
      </a>
    );
  }
  return (
    <a
      href={target}
      target="_blank"
      rel="noopener noreferrer"
      className="banner-slot block relative overflow-hidden group"
      title="CLICK THE BANNER → repo"
    >
      <img
        src={entry.bannerUrl}
        alt={`${entry.name} banner`}
        className="w-full h-[130px] object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        style={{ imageRendering: "pixelated" }}
        onError={() => setFailed(true)}
      />
      <span className="absolute right-2 bottom-2 font-px text-[8px] bg-black text-[#ffd900] px-2 py-1 border-2 border-[#ffd900] opacity-0 group-hover:opacity-100 transition-opacity">
        CLICK ►
      </span>
    </a>
  );
}

/* ---------- inline embed (iframe) window ---------- */
function EmbedWindow({ entry }: { entry: PpcEntry }) {
  const [loaded, setLoaded] = useState(false);
  const url = abs(entry.embed as string);
  return (
    <div className="mx-4 mb-4 border-3 border-black bg-[#0f0f1e] shadow-[6px_6px_0_rgba(0,0,0,0.7)]">
      {/* titlebar */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-b-3 border-black" style={{ background: "var(--m)" }}>
        <PixelStar size={12} className="spin-slow" />
        <span className="font-px text-[8px] text-black truncate">
          EMBED.EXE — {entry.name}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto font-px text-[7px] bg-black text-[#ff5cf0] px-2 py-1 border border-[#ff5cf0] hover:bg-[#ff5cf0] hover:text-black transition-colors"
          title="pop it out into its own window"
        >
          ⬒ POP OUT
        </a>
      </div>
      {/* body */}
      <div className="relative h-[320px] sm:h-[380px] bg-black">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <PipisMascot size={56} className="hop" />
            <div className="font-px text-[8px] text-[#ffd900] blink">BUFFERING THE EMBED ...</div>
            <div className="dialbar w-2/3 max-w-[280px]" />
          </div>
        )}
        <iframe
          src={url}
          title={`${entry.name} embedded`}
          className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          allow="autoplay; fullscreen; gamepad"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
      {/* statusbar */}
      <div className="px-2 py-1 border-t-2 border-[#333] bg-black flex items-center gap-2 flex-wrap">
        <span className="font-crt text-base text-[#4dff4d] truncate flex-1">{url}</span>
        <span className="font-toon font-bold text-[11px] text-[#8888aa]">
          {loaded ? "running in-place ✔" : "loading..."}
        </span>
      </div>
    </div>
  );
}

/* ---------- the actual card body (hooks live here) ---------- */
function ReviewCardBody({ entry, index }: { entry: PpcEntry; index: number }) {
  const [embedOpen, setEmbedOpen] = useState(false);
  const e = entry;
  const hasEmbed = !!e.embed;

  return (
    <article className="panel p-0 overflow-hidden transition-transform duration-150 hover:-translate-y-1 hover:shadow-[12px_12px_0_rgba(0,0,0,0.9)]">
      {/* banner */}
      <BannerSlot entry={e} />

      {/* title strip */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 border-y-3 border-black" style={{ background: "var(--y)" }}>
        <h3 className="font-px text-[12px] sm:text-sm text-black">{e.name}</h3>
        {index < 2 && <span className="font-px text-[8px] text-white bg-[#ff3b1f] px-1.5 py-1 blink-fast border-2 border-black">NEW!</span>}
        <span className="ml-auto font-toon font-bold text-[12px] text-black/80">
          by {e.author}
          {e.added ? ` · ${e.added}` : ""}
        </span>
      </div>

      <div className="p-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="font-toon text-[15px] leading-snug text-white">{e.desc}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
            <span
              className="font-px text-[8px] px-2 py-1.5 border-2 border-black"
              style={{ background: "var(--c)", color: "#000" }}
              title="the style, as declared in the .ppc"
            >
              STYLE: {e.style}
            </span>
            {typeof e.rating === "number" && <Stars rating={e.rating} />}
            {e.version && <span className="font-crt text-lg text-[#4dff4d]">v{e.version}</span>}
            {e.size && <span className="font-crt text-lg text-[#4dff4d]">{e.size}</span>}
          </div>

          {e.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {e.tags.map((t) => (
                <span key={t} className="font-toon font-bold text-[11px] px-2 py-0.5 bg-black border-2 border-[#ff9500] text-[#ff9500]">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* action column */}
        <div className="flex sm:flex-col gap-2 items-stretch sm:items-end justify-start sm:justify-center">
          {e.repo ? (
            <a className="ng-btn red text-[9px]" href={e.repo} target="_blank" rel="noopener noreferrer" title={e.repo}>
              ▼ NOT-DEMO<br />VERSION
            </a>
          ) : (
            <span className="ng-btn red text-[9px] opacity-50 cursor-not-allowed" title="no repo= in the .ppc">
              ▼ NOT-DEMO<br />VERSION
            </span>
          )}

          {e.release && (
            <a className="ng-btn grn text-[9px]" href={abs(e.release)} target="_blank" rel="noopener noreferrer" title="grab the release build">
              📦 RELEASE
            </a>
          )}

          {e.manual && (
            <a className="ng-btn org text-[9px]" href={abs(e.manual)} target="_blank" rel="noopener noreferrer" title="read the manual">
              📖 MANUAL
            </a>
          )}

          {e.demo && (
            <a className="ng-btn cy text-[9px]" href={abs(e.demo)} target="_blank" rel="noopener noreferrer">
              ► TRY DEMO
            </a>
          )}

          {hasEmbed && (
            <button
              className={`ng-btn ${embedOpen ? "mag" : "cy"} text-[9px]`}
              onClick={() => setEmbedOpen((v) => !v)}
              aria-pressed={embedOpen}
              title={embedOpen ? "close the inline embed" : "run it right here, no new tab"}
            >
              {embedOpen ? "✕ CLOSE EMBED" : "▶ RUN EMBED"}
            </button>
          )}

          <a className="ng-btn text-[9px]" href={e.src} target="_blank" rel="noopener noreferrer" title="view the raw .ppc metadata">
            ✎ VIEW .PPC
          </a>
        </div>
      </div>

      {/* inline embed window (only when open + configured) */}
      {embedOpen && hasEmbed && <EmbedWindow entry={e} />}

      {/* repo strip */}
      <div className="px-4 py-2 bg-black border-t-2 border-[#333] flex items-center gap-2 flex-wrap">
        <PixelStar size={12} className="spin-slow" />
        <span className="font-crt text-lg text-[#4dff4d] truncate">
          {e.repo ? e.repo : "( no repo link in this .ppc — mysterious )"}
        </span>
      </div>
    </article>
  );
}

export function ReviewCard({ entry, index }: { entry: PpcEntry; index: number }) {
  if (entry.status === "loading") {
    return (
      <article className="panel p-4">
        <div className="font-px text-[10px] text-[#ffd900] mb-3">
          DIALING .PPC №{index + 1} ... <span className="blink">▊</span>
        </div>
        <div className="dialbar w-2/3" />
        <div className="font-crt text-lg text-[#4dff4d] mt-2 break-all">{entry.src}</div>
      </article>
    );
  }

  if (entry.status === "error") {
    return (
      <article className="panel panel-red p-4">
        <div className="font-px text-[11px] text-[#ff3b1f] mb-2">✖ PPC TRANSMISSION FAILED ✖</div>
        <div className="font-crt text-xl text-white break-all">
          {entry.error} — {entry.src}
        </div>
        <div className="font-toon font-bold text-[13px] text-[#ffd900] mt-2">
          check that URL in <span className="font-crt text-base">.ppconf</span> → [ppc]. raw.githubusercontent.com
          links work best.
        </div>
      </article>
    );
  }

  return <ReviewCardBody entry={entry} index={index} />;
}
