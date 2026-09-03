import { useEffect, useState } from "react";
import { prjUrl } from "./lib/pp";
import { Reveal, SectionTitle, Starfield, PipisMascot } from "./fx";

/* ============================================================
   PipisHost™ — free sub-site hosting.
   each project = ./pipishost/prjs/<name>/index.html (+ own js/css)
   names are wired in .ppconf under [pipishost].
   ============================================================ */

type PrjState = "checking" | "online" | "missing";

async function checkAlive(url: string): Promise<PrjState> {
  try {
    let r = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (r.status === 405 || r.status === 501) r = await fetch(url, { cache: "no-store" });
    return r.ok ? "online" : "missing";
  } catch {
    return "missing";
  }
}

function ProjectCard({ name }: { name: string }) {
  const url = prjUrl(name);
  const sub = `${name.toLowerCase()}.pipisclub.net`;
  const [state, setState] = useState<PrjState>("checking");
  const [frameKey, setFrameKey] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    setState("checking");
    checkAlive(url).then((s) => {
      if (live) setState(s);
    });
    return () => {
      live = false;
    };
  }, [url, frameKey]);

  const reload = () => {
    setLoaded(false);
    setFrameKey((k) => k + 1);
  };

  return (
    <article className="panel panel-cy p-0 overflow-hidden transition-transform duration-150 hover:-translate-y-1 hover:shadow-[12px_12px_0_rgba(0,0,0,0.9)] flex flex-col">
      {/* fake browser titlebar */}
      <div
        className="flex items-center gap-1.5 px-2 py-1 border-b-2 border-black"
        style={{ background: "linear-gradient(90deg,#000080,#1084d0)" }}
      >
        <span className="font-px text-[8px] text-white truncate">PIPISHOST.EXE — {sub}</span>
        <span className="ml-auto flex gap-1 select-none" aria-hidden>
          {["_", "□", "×"].map((g) => (
            <span key={g} className="w95 !border-2 font-bold text-[10px] leading-none px-1.5 py-0.5">
              {g}
            </span>
          ))}
        </span>
      </div>

      {/* fake toolbar + address bar */}
      <div className="w95 !border-x-0 flex items-center gap-1 px-2 py-1.5">
        <button className="btn95 text-[11px]" disabled title="back (back where?)" aria-label="back">
          ◄
        </button>
        <button className="btn95 text-[11px]" disabled title="forward (there is no forward)" aria-label="forward">
          ►
        </button>
        <button className="btn95 text-[11px]" onClick={reload} title="reload project + re-check" aria-label="reload">
          ⟳
        </button>
        <div className="w95-in flex-1 min-w-0 px-2 py-0.5 font-crt text-lg text-[#333] truncate" title={url}>
          {url}
        </div>
        <span
          className={`font-px text-[7px] px-1.5 py-1 border-2 border-black shrink-0 ${
            state === "online"
              ? "bg-[#00aa00] text-white"
              : state === "missing"
                ? "bg-[#c00000] text-white blink"
                : "bg-[#888888] text-black"
          }`}
        >
          {state === "online" ? "● ON" : state === "missing" ? "● 404" : "● ..."}
        </span>
      </div>

      {/* viewport */}
      <div className="relative bg-black flex-1">
        {state === "missing" ? (
          <div className="px-4 py-8 text-center">
            <div className="barber h-3" />
            <div className="font-px text-[10px] text-[#ff3b1f] blink mt-4">404 — SUBDOMAIN PARKED</div>
            <div className="font-toon font-bold text-[13px] text-white mt-3 leading-snug">
              <span className="font-crt text-lg text-[#4dff4d] break-all">pipishost/prjs/{name}/</span> is empty. drop
              an <span className="text-[#ffd900]">index.html</span> (plus ur own .js / .css) in that folder and hit{" "}
              <span className="text-[#4dff4d]">⟳</span> — it loads right here.
            </div>
            <div className="barber h-3 mt-4" />
          </div>
        ) : (
          <>
            <iframe
              key={frameKey}
              src={url}
              title={`${sub} — hosted on PipisHost`}
              className="w-full h-[230px] block bg-white"
              onLoad={() => setLoaded(true)}
            />
            {!loaded && (
              <div className="absolute inset-0 grid place-items-center bg-black">
                <div className="text-center px-4">
                  <div className="dialbar w-44 mx-auto" />
                  <div className="font-crt text-lg text-[#4dff4d] mt-2">
                    BUFFERING <span className="text-[#ffd900]">{sub}</span> over 28.8k ...
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* status bar */}
      <div className="px-3 py-1.5 bg-black border-t-2 border-[#333] flex items-center gap-2 flex-wrap">
        <span className="font-crt text-lg text-[#4dff4d] truncate flex-1 min-w-0" title={url}>
          C:\PIPISHOST\PRJS\{name.toUpperCase()}\INDEX.HTML
        </span>
        {state === "online" && (
          <a
            className="font-px text-[8px] bg-[#ffd900] text-black px-2 py-1.5 border-2 border-black hover:invert shrink-0"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            OPEN ↗
          </a>
        )}
      </div>
    </article>
  );
}

export function PipisHost({ names }: { names: string[] }) {
  return (
    <Reveal as="section">
      <SectionTitle id="pipishost" color="var(--m)">
        PIPISHOST™ — FREE SUB-SITE HOSTING
      </SectionTitle>
      <div className="font-crt text-lg text-[#4dff4d] mt-3 break-all">
        C:\&gt; files live at ./pipishost/prjs/&lt;name&gt;/index.html (plus ur own .js / .css) — every name under
        [pipishost] in .ppconf gets a window below
      </div>

      {names.length === 0 ? (
        <div className="panel p-6 text-center relative overflow-hidden mt-4">
          <Starfield count={25} />
          <PipisMascot size={72} className="hop mx-auto relative" />
          <div className="font-px text-[11px] text-[#ffd900] mt-3 blink relative">★ NO SUBDOMAINS RENTED YET ★</div>
          <div className="font-toon font-bold text-[14px] mt-3 max-w-lg mx-auto leading-snug relative">
            PipisHost has infinite rack space and zero customers. open{" "}
            <span className="font-crt text-xl text-[#4dff4d]">.ppconf</span>, add a name under{" "}
            <span className="font-crt text-xl">[pipishost]</span>, drop ur files at{" "}
            <span className="font-crt text-xl text-[#4dff4d]">pipishost/prjs/&lt;name&gt;/index.html</span> and boom —{" "}
            <span className="font-crt text-xl">&lt;name&gt;.pipisclub.net</span> goes live on this very page.
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-5 mt-4 lg:grid-cols-2">
            {names.map((n, i) => (
              <ProjectCard key={n + i} name={n} />
            ))}
          </div>
          <div className="font-toon text-[13px] font-bold text-[#8888aa] mt-3">
            want <span className="text-[#ffd900]">&lt;ur-name&gt;.pipisclub.net</span>? one line under [pipishost] in
            .ppconf — hosting is 100% free (paid in fried pipis).
          </div>
        </>
      )}
    </Reveal>
  );
}
