import { useEffect, useState, type ReactNode } from "react";
import {
  fetchText,
  parseConf,
  makePpc,
  loadPpc,
  loadPpn,
  type SiteConf,
  type PpcEntry,
  type PpnEntry,
} from "./lib/pp";
import { Starfield, SparkleTrail, Reveal, Hazard, SectionTitle, PixelStar, PipisMascot } from "./fx";
import { ReviewCard } from "./ReviewCard";
import { HitCounter, PipisPoll, MidiPlayer, Webring, BadgeWall, Guestbook, ChatBox } from "./widgets";

/* ================================================================
   ThePipisClub — index.html // (c)1999 CopyBite Industries
   ================================================================ */

const TICKER_DEFAULTS = [
  "WELCOME 2 THEPIPISCLUB",
  "HOT .PPC REPO REVIEWS INSIDE",
  "Y2K IS COMING — STOCK UP ON FRIED PIPIS",
  "SIGN THE GUESTBOOK OR THE PIPIS GETS IT",
  "BEST VIEWED @ 800×600 WITH SOUND ON",
  "NOW HIRING: webmaster (unpaid, in pipis)",
];

function SiteBanner({ conf }: { conf: SiteConf | null }) {
  const [gifOk, setGifOk] = useState(true);
  const href = conf?.github || "#top";

  if (gifOk) {
    return (
      <a href={href} target={conf?.github ? "_blank" : undefined} rel="noopener noreferrer" className="block" title="our banner.gif — click it!">
        <img
          src="banner.gif"
          alt="ThePipisClub banner"
          className="w-full block"
          style={{ imageRendering: "pixelated" }}
          onError={() => setGifOk(false)}
        />
      </a>
    );
  }

  return (
    <a href={href} target={conf?.github ? "_blank" : undefined} rel="noopener noreferrer" className="block relative overflow-hidden" style={{ background: "#000014" }}>
      <Starfield count={60} />
      <div className="relative px-4 py-7 sm:py-10 text-center group">
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <PixelStar size={30} className="spin-slow hidden sm:block" />
          <PipisMascot size={64} className="hop hidden md:block" />
          <div>
            <div className="font-px text-[10px] sm:text-xs text-[#00e5ff] tracking-widest">~ WELCOME 2 ~</div>
            <h1 className="hard-title text-2xl sm:text-5xl mt-2 leading-none">
              THE<span className="text-[#ff3b1f]">PIPIS</span>CLUB
            </h1>
            <div className="font-crt text-lg sm:text-2xl text-[#ffd900] mt-2 group-hover:text-white transition-colors">
              {conf?.tagline || "THE #1 UNDERGROUND REPO REVIEW ZINE OF THE INFORMATION SUPERHIGHWAY"}
            </div>
          </div>
          <PipisMascot size={64} className="hop hidden md:block" style={{ transform: "scaleX(-1)" }} />
          <PixelStar size={30} className="spin-slow hidden sm:block" />
        </div>
        <div className="mt-4 inline-block font-px text-[8px] bg-[#ff3b1f] text-white px-2 py-1.5 border-2 border-black wiggle">
          EST. 1999 · 100% HAND-CODED · banner.gif goes HERE (webmaster is drawing it)
        </div>
      </div>
    </a>
  );
}

function Ticker({ ppns }: { ppns: PpnEntry[] }) {
  const headlines = [
    ...ppns.filter((p) => p.status === "ok").map((p) => `★ ${p.date}: ${p.title}`),
    ...TICKER_DEFAULTS,
  ];
  const line = headlines.join("  +++  ") + "  +++  ";
  return (
    <div className="marquee border-y-3 border-black bg-[#00008b] py-1.5">
      <div className="marquee-track font-px text-[10px] text-[#ffd900]" style={{ ["--marq-dur" as string]: `${Math.max(22, headlines.length * 6)}s` }}>
        <span>{line}</span>
        <span aria-hidden>{line}</span>
      </div>
    </div>
  );
}

function Nav({ onGuestbook }: { onGuestbook: () => void }) {
  const items: Array<[string, string]> = [
    ["HOME", "#top"],
    ["REVIEWS", "#reviews"],
    ["NEWZ", "#newz"],
    ["THE .PPC FILE", "#about"],
    ["LINKS", "#links"],
  ];
  return (
    <nav className="sticky top-0 z-50 w95 !border-x-0 shadow-[0_4px_0_rgba(0,0,0,0.6)]">
      <div className="max-w-6xl mx-auto flex flex-wrap items-stretch gap-1 px-2 py-1.5">
        <span className="font-px text-[9px] self-center mr-2 hidden sm:inline">
          <span className="text-[#c00000]">PIPIS</span>NAV™:
        </span>
        {items.map(([label, href], i) => (
          <a key={href} href={href} className="btn95 text-[12px] sm:text-[13px]">
            {label}
            {i === 2 && <span className="blink text-[#c00000]"> ●</span>}
          </a>
        ))}
        <button className="btn95 text-[12px] sm:text-[13px] ml-auto" onClick={onGuestbook}>
          ✍ GUESTBOOK
        </button>
      </div>
    </nav>
  );
}

function WebmasterCard() {
  const Row = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="flex items-baseline gap-1.5 py-0.5 border-b border-dotted border-[#888] last:border-0">
      <span className="font-px text-[7px] shrink-0 text-[#333] uppercase">{label}</span>
      <span className="ml-auto text-right min-w-0 break-all">{children}</span>
    </div>
  );
  return (
    <div className="w95 p-2">
      <div className="font-px text-[8px] mb-2 text-center bg-[#800000] text-white py-1">FIND THE WEBMASTER</div>
      <div>
        <Row label="e-mail">
          <a className="lnk font-crt text-lg" href="mailto:webmaster@pipisclub.net">
            webmaster@pipisclub.net
          </a>
        </Row>
        <Row label="icq">
          <span className="font-crt text-lg font-bold">
            1337694 <span className="text-[#888]">(offline, always)</span>
          </span>
        </Row>
        <Row label="github">
          <a
            className="lnk font-crt text-lg"
            href="https://github.com/thepipisclub"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/thepipisclub
          </a>
        </Row>
        <Row label="newgrounds">
          <a className="lnk font-crt text-lg" href="https://www.newgrounds.com" target="_blank" rel="noopener noreferrer">
            newgrounds.com
          </a>
        </Row>
        <Row label="irc">
          <span className="font-crt text-lg font-bold">#pipisclub @ irc.dal.net</span>
        </Row>
      </div>
      <div className="font-toon text-[10px] font-bold text-center mt-1.5">replies within 3-5 business decades</div>
    </div>
  );
}
const KOOL_LINKS: Array<[string, string]> = [
  ["Space Jam (1996)", "https://www.spacejam.com"],
  ["textfiles.com", "http://www.textfiles.com"],
  ["C64.com", "https://www.c64.com"],
  ["the W3C", "https://www.w3.org"],
];

function LinkBox({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div className="w95 p-2">
      <div className="font-px text-[8px] mb-2 text-center bg-[#000080] text-white py-1">{title}</div>
      <ul className="space-y-1">
        {links.map(([label, url]) => (
          <li key={label}>
            <a href={url} target="_blank" rel="noopener noreferrer" className="lnk font-toon font-bold text-[14px]">
              ▸ {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConstructionBox() {
  return (
    <div className="panel p-0 overflow-hidden">
      <div className="barber h-5" />
      <div className="p-3 text-center">
        <PipisMascot size={52} className="hop mx-auto" />
        <div className="font-px text-[8px] text-[#ffd900] mt-2 blink">UNDER</div>
        <div className="font-px text-[8px] text-[#ffd900]">CONSTRUCTION</div>
        <div className="font-toon text-[12px] font-bold mt-2">since 11-30-1999. forever.</div>
      </div>
      <div className="barber h-5" />
    </div>
  );
}

const PPC_EXAMPLE = `; anything.ppc  (drop it anywhere, link it in .ppconf)
[pipis]
name    = SUPER KOOL REPO
author  = webmaster
repo    = https://github.com/OWNER/REPO
demo    = https://owner.github.io/REPO   ; optional
desc    = what this thing does. be honest.
        ; lines starting with whitespace continue the text
style   = Neon Chaos 9000
version = 1.337
size    = 640 KB
added   = 11-30-1999
rating  = 4.5        ; 0..5
tags    = games;pipis;radical
banner  =            ; optional! default hunt:
        ; <repo>/pipisclub/banner.gif  (via raw.githubusercontent.com)`;

const PPN_EXAMPLE = `; Newz/1999-12-31_y2k.ppn
title  = WE SURVIVED (probably)
date   = 12-31-1999
author = Webmaster
body   = stock up on fried pipis, unplug the modem,
       ; whitespace lines continue the body
       ; see u on the other side, netizens`;

function AboutSection() {
  return (
    <Reveal as="section">
      <SectionTitle id="about" color="var(--c)">
        HOW THIS ZINE WORKS (the .ppc file)
      </SectionTitle>
      <div className="panel p-4 sm:p-5 mt-4 grid gap-5 lg:grid-cols-3">
        <div className="font-toon text-[15px] leading-relaxed">
          <div className="font-px text-[10px] text-[#ffd900] mb-2">STEP 1 — .ppconf</div>
          The whole club runs on ONE file at the site root:{" "}
          <span className="font-crt text-lg text-[#4dff4d]">.ppconf</span>. It lists links to{" "}
          <b className="text-[#ffd900]">.ppc</b> files under <span className="font-crt text-lg">[ppc]</span> and{" "}
          <b className="text-[#ffd900]">.ppn</b> newz files under <span className="font-crt text-lg">[newz]</span>.
          Edit it and this page re-wires itself on reload. No database. No framework brainrot. Just vibes and
          fetch().
        </div>
        <div>
          <div className="font-px text-[10px] text-[#ffd900] mb-2">STEP 2 — write a .ppc</div>
          <pre className="term text-[15px] sm:text-[17px] p-3 overflow-auto leading-tight whitespace-pre">{PPC_EXAMPLE}</pre>
        </div>
        <div>
          <div className="font-px text-[10px] text-[#ffd900] mb-2">STEP 3 — newz go in /Newz</div>
          <pre className="term text-[15px] sm:text-[17px] p-3 overflow-auto leading-tight whitespace-pre">{PPN_EXAMPLE}</pre>
          <div className="font-toon text-[13px] font-bold mt-3 p-2 border-2 border-[#ff9500] text-[#ff9500]">
            ★ BANNER RULE: every repo keeps its clickable banner at{" "}
            <span className="font-crt text-base">/pipisclub/banner.gif</span>. This repo uses{" "}
            <span className="font-crt text-base">./banner.gif</span>. Missing banner = big ugly 404 slot (see
            above, it's a feature).
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function App() {
  const [conf, setConf] = useState<SiteConf | null>(null);
  const [confStatus, setConfStatus] = useState<"loading" | "ok" | "error">("loading");
  const [confErr, setConfErr] = useState("");
  const [ppcs, setPpcs] = useState<PpcEntry[]>([]);
  const [ppns, setPpns] = useState<PpnEntry[]>([]);
  const [modal, setModal] = useState<null | "gb">(null);
  const [egg, setEgg] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const text = await fetchText(".ppconf");
        const c = parseConf(text);
        if (!live) return;
        setConf(c);
        setConfStatus("ok");

        const starters = c.ppcUrls.map(makePpc);
        setPpcs(starters);
        starters.forEach((p, i) =>
          loadPpc(p).then((r) => {
            if (live) setPpcs((prev) => prev.map((x, j) => (j === i ? r : x)));
          })
        );

        setPpns(
          c.ppnUrls.map((u) => ({ src: u, status: "loading" as const, title: "", date: "", author: "", body: "" }))
        );
        c.ppnUrls.forEach((u, i) =>
          loadPpn(u).then((r) => {
            if (live) setPpns((prev) => prev.map((x, j) => (j === i ? r : x)));
          })
        );
      } catch (e) {
        if (live) {
          setConfStatus("error");
          setConfErr(e instanceof Error ? e.message : "fetch failed");
        }
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const okReviews = ppcs.filter((p) => p.status === "ok");

  return (
    <div id="top" className="min-h-screen scanlines relative">
      {/* ambient night sky behind everything */}
      <div className="fixed inset-0 -z-10 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% -20%, #0a0a2a 0%, #04040c 55%)" }}>
        <Starfield count={130} />
      </div>
      <SparkleTrail />

      {/* ======= MASTHEAD ======= */}
      <Hazard className="h-4" />
      <header className="border-b-3 border-black">
        <SiteBanner conf={conf} />
      </header>
      <Ticker ppns={ppns} />
      <Nav onGuestbook={() => setModal("gb")} />

      {/* ======= THE GRID ======= */}
      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-6 grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)_190px] items-start">
        {/* ---- left rail ---- */}
        <aside className="space-y-4 order-2 lg:order-1 grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <HitCounter />
          <PipisPoll />
          <MidiPlayer />
          <BadgeWall />
        </aside>

        {/* ---- center column ---- */}
        <div className="order-1 lg:order-2 space-y-8 min-w-0">
          {/* REVIEWS */}
          <Reveal as="section">
            <SectionTitle id="reviews">HOT REPO REVIEWS (wired via .ppconf)</SectionTitle>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="font-crt text-lg text-[#4dff4d]">
                C:\&gt; read .ppconf ...{" "}
                {confStatus === "loading" && <span className="blink">CONNECTING 28.8kbps▊</span>}
                {confStatus === "error" && <span className="text-[#ff3b1f]">ERROR {confErr}</span>}
                {confStatus === "ok" && `OK! ${conf?.ppcUrls.length ?? 0} .ppc link(s) found`}
              </span>
            </div>

            <div className="relative mt-3">
              <div className="absolute inset-0 -z-10 opacity-70">
                <Starfield count={45} />
              </div>
              <div className="space-y-6">
                {confStatus === "loading" && (
                  <div className="panel p-5">
                    <div className="font-px text-[10px] text-[#ffd900] mb-3">
                      DIALING .ppconf ... <span className="blink">▊</span>
                    </div>
                    <div className="dialbar" />
                  </div>
                )}

                {confStatus === "error" && (
                  <div className="panel panel-red p-5">
                    <div className="font-px text-[11px] text-[#ff3b1f] mb-2">✖ .ppconf NOT FOUND ✖</div>
                    <div className="font-toon font-bold text-[14px]">
                      {confErr} — the master wire-up file must live at the site root as{" "}
                      <span className="font-crt text-lg text-[#ffd900]">.ppconf</span>. without it the club has no
                      clubs.
                    </div>
                  </div>
                )}

                {confStatus === "ok" && ppcs.length === 0 && (
                  <div className="panel p-0 overflow-hidden">
                    <div className="barber h-6" />
                    <div className="p-6 text-center relative">
                      <Starfield count={30} />
                      <PipisMascot size={88} className="hop mx-auto relative" />
                      <div className="font-px text-[12px] sm:text-sm text-[#ffd900] mt-4 blink">★ UNDER CONSTRUCTION ★</div>
                      <div className="font-toon font-bold text-[15px] sm:text-lg mt-3 max-w-xl mx-auto leading-snug relative">
                        0 repositories wired in so far!! open{" "}
                        <span className="font-crt text-xl text-[#4dff4d]">/.ppconf</span>, paste a{" "}
                        <span className="font-crt text-xl text-[#4dff4d]">.ppc</span> link under{" "}
                        <span className="font-crt text-xl">[ppc]</span> and this page becomes a review portal
                        instantly. the format is 30 seconds to learn — scroll down, it's all there.
                      </div>
                      <div className="mt-4 relative">
                        <a className="ng-btn text-[9px]" href="#about">TEACH ME THE .PPC WAY ▼</a>
                      </div>
                    </div>
                    <div className="barber h-6" />
                  </div>
                )}

                {ppcs.map((p, i) => (
                  <ReviewCard key={p.src + i} entry={p} index={i} />
                ))}
              </div>
            </div>
            {okReviews.length > 0 && (
              <div className="font-crt text-lg text-[#4dff4d] mt-3">
                {okReviews.length} repo(s) reviewed &amp; certified pipis-approved ✔
              </div>
            )}
          </Reveal>

          {/* NEWZ */}
          <Reveal as="section">
            <SectionTitle id="newz" color="var(--r)">
              <span className="text-black">FRESH NEWZ from /Newz (*.ppn)</span>
            </SectionTitle>
            <div className="mt-4 space-y-4">
              {confStatus !== "error" && ppns.length === 0 && (
                <div className="panel p-5">
                  <div className="font-px text-[10px] text-[#00e5ff] mb-2">NEWZ DESK IS QUIET...</div>
                  <div className="font-toon font-bold text-[14px] leading-snug">
                    no <span className="font-crt text-lg text-[#4dff4d]">.ppn</span> files listed under{" "}
                    <span className="font-crt text-lg">[newz]</span> in .ppconf yet. drop files in the{" "}
                    <span className="font-crt text-lg text-[#ffd900]">/Newz</span> folder, wire them up, and your
                    headlines hit the ticker up top too. breaking pipis news at 28.8 kbps!!
                  </div>
                </div>
              )}
              {ppns.map((n, i) =>
                n.status === "error" ? (
                  <div key={n.src + i} className="panel panel-red p-4">
                    <span className="font-px text-[9px] text-[#ff3b1f]">✖ PPN LOST IN CYBERSPACE:</span>{" "}
                    <span className="font-crt text-lg break-all">{n.src} ({n.error})</span>
                  </div>
                ) : n.status === "loading" ? (
                  <div key={n.src + i} className="panel p-4">
                    <div className="dialbar w-1/2" />
                  </div>
                ) : (
                  <article key={n.src + i} className="panel p-0 overflow-hidden hover:-translate-y-0.5 transition-transform">
                    <div className="px-4 py-2 flex flex-wrap items-center gap-2 border-b-3 border-black" style={{ background: "var(--r)" }}>
                      <span className="font-px text-[10px] text-white">▚ {n.title}</span>
                      <span className="ml-auto font-crt text-lg text-[#ffe9a0]">
                        {n.date} · by {n.author}
                      </span>
                    </div>
                    <p className="font-toon text-[15px] p-4 leading-snug whitespace-pre-line">{n.body}</p>
                  </article>
                )
              )}
            </div>
          </Reveal>

          {/* ABOUT / docs */}
          <AboutSection />
        </div>

        {/* ---- right rail ---- */}
        <aside id="links" className="space-y-4 order-3 scroll-mt-24 grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <ChatBox />
          <WebmasterCard />
          <LinkBox title="K00L LINKS" links={KOOL_LINKS} />
          <Webring />
          <ConstructionBox />
        </aside>
      </main>

      {/* ======= FOOTER ======= */}
      <Hazard className="h-3" />
      <footer className="relative overflow-hidden border-t-3 border-black" style={{ background: "#000014" }}>
        <Starfield count={90} />
        <div className="relative max-w-4xl mx-auto px-4 py-8 text-center">
          <PipisMascot size={44} className="hop mx-auto" />
          <div className="font-px text-[9px] text-[#00e5ff] mt-3">YOU HAVE REACHED THE BOTTOM OF THE INFORMATION SUPERHIGHWAY</div>

          <div className="mt-5 panel inline-block px-6 py-4">
            <div className="font-toon font-bold text-[14px] text-white">
              © 1999 {conf?.name || "ThePipisClub"} — all pipis reserved.
            </div>
            <div className="font-crt text-xl sm:text-2xl text-[#ffd900] mt-1">
              CopyBite 1999 eat fried pipis, avoid non-fried pipis
            </div>
            <button
              className="mt-3 font-toon italic text-[13px] text-[#8888aa] hover:text-[#ffd900] transition-colors cursor-pointer"
              onClick={() => setEgg((v) => !v)}
              title="?"
            >
              {egg ? (
                <span className="not-italic font-bold text-white">
                  Chris, do you want to be a <span className="blink text-[#ffd900]">[big shot?]</span>
                </span>
              ) : (
                "don't forget."
              )}
            </button>
          </div>

          <div className="font-toon text-[12px] text-[#8888aa] mt-5 space-y-0.5">
            <div>best viewed in Netscape Navigator 4.0 @ 800×600 with sound ON and lights OFF</div>
            <div>
              last updated: <span className="font-crt text-base text-[#4dff4d]">12-31-1999 11:59 PM</span> (Y2K eve — if
              this page still loads, the pipis survived)
            </div>
            <div>
              powered by <span className="font-crt text-base text-[#ffd900]">.ppconf</span> ·{" "}
              <span className="font-crt text-base text-[#ffd900]">.ppc</span> ·{" "}
              <span className="font-crt text-base text-[#ffd900]">.ppn</span> — the pipis document trinity
            </div>
          </div>
        </div>
      </footer>

      {/* ======= MODALS ======= */}
      {modal === "gb" && <Guestbook onClose={() => setModal(null)} />}
    </div>
  );
}
