import { useEffect, useRef, useState, type ReactNode } from "react";
import { lsGet, lsSet } from "./lib/pp";

/* ================= visitor counter ================= */
export function HitCounter() {
  const [hits, setHits] = useState(0);
  useEffect(() => {
    const base = 13370 + Math.floor(Math.random() * 900);
    const prev = parseInt(lsGet("ppc_hits") || "", 10);
    const next = (Number.isFinite(prev) && prev > 0 ? prev : base) + 1;
    lsSet("ppc_hits", String(next));
    setHits(next);
  }, []);
  const digits = String(hits).padStart(6, "0").split("");
  return (
    <div className="w95 p-2">
      <div className="font-px text-[8px] text-center mb-1">YOU ARE VISITOR №</div>
      <div className="lcd text-2xl text-center px-2 py-0.5 flex justify-center gap-[3px]">
        {digits.map((d, i) => (
          <span key={i} className="inline-block w-[16px] text-center border border-[#003300]">
            {d}
          </span>
        ))}
      </div>
      <div className="font-toon text-[11px] font-bold text-center mt-1">since 11-30-1999 !!</div>
    </div>
  );
}

/* ================= the important poll ================= */
const POLL_OPTIONS = ["YES", "HELL YES", "OBVIOUSLY"];
const POLL_BASE = [1337, 999, 640];

export function PipisPoll() {
  const [voted, setVoted] = useState<number | null>(null);
  useEffect(() => {
    const v = lsGet("ppc_poll");
    if (v !== null) setVoted(parseInt(v, 10));
  }, []);
  const vote = (i: number) => {
    lsSet("ppc_poll", String(i));
    setVoted(i);
  };
  const counts = POLL_BASE.map((b, i) => b + (voted === i ? 1 : 0));
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <div className="w95 p-2">
      <div className="font-px text-[8px] mb-2 text-center bg-[#000080] text-white py-1">
        ★ OFFICIAL POLL ★
      </div>
      <div className="font-toon font-bold text-[13px] mb-2 text-center leading-tight">
        do U like fried pipis??
      </div>
      {voted === null ? (
        <div className="flex flex-col gap-1">
          {POLL_OPTIONS.map((o, i) => (
            <button key={o} className="btn95 text-[13px]" onClick={() => vote(i)}>
              ▸ {o}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {POLL_OPTIONS.map((o, i) => (
            <div key={o}>
              <div className="flex justify-between font-toon font-bold text-[12px]">
                <span>
                  {o}
                  {voted === i ? " ◄ U!" : ""}
                </span>
                <span>{Math.round((counts[i] / total) * 100)}%</span>
              </div>
              <div className="w95-in h-[14px] p-[2px]">
                <div
                  className="h-full"
                  style={{
                    width: `${(counts[i] / total) * 100}%`,
                    background: i === 0 ? "var(--y)" : i === 1 ? "var(--r)" : "var(--g)",
                    transition: "width .6s steps(8)",
                  }}
                />
              </div>
            </div>
          ))}
          <div className="font-toon text-[11px] text-center mt-1">
            {total} votes. science has spoken.
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= midi-ish chiptune player ================= */
// [midi note, eighths] — 0 = rest. original banger, do not steal.
const TUNE: Array<[number, number]> = [
  [67, 1], [71, 1], [74, 1], [71, 1], [76, 2], [74, 1], [71, 1],
  [69, 1], [72, 1], [76, 2], [74, 1], [72, 1], [71, 2], [0, 1], [74, 1],
  [67, 1], [71, 1], [74, 1], [78, 2], [76, 1], [74, 1], [72, 1], [71, 1],
  [69, 1], [67, 1], [64, 2], [0, 2],
];
const EIGHTH = 0.17;
const freq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export function MidiPlayer() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const scheduleLoop = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const t0 = ctx.currentTime + 0.06;
    let t = t0;
    for (const [note, len] of TUNE) {
      const dur = len * EIGHTH;
      if (note > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = freq(note);
        gain.gain.setValueAtTime(0.055, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.92);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
        // bass shadow, one octave down
        const bass = ctx.createOscillator();
        const bg = ctx.createGain();
        bass.type = "triangle";
        bass.frequency.value = freq(note - 24);
        bg.gain.setValueAtTime(0.05, t);
        bg.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);
        bass.connect(bg).connect(ctx.destination);
        bass.start(t);
        bass.stop(t + dur);
      }
      t += dur;
    }
    const loopMs = (t - t0) * 1000;
    timerRef.current = window.setTimeout(scheduleLoop, loopMs - 40);
  };

  const toggle = () => {
    if (playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      ctxRef.current?.suspend();
      setPlaying(false);
      return;
    }
    const AC: typeof AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctxRef.current) ctxRef.current = new AC();
    ctxRef.current.resume();
    scheduleLoop();
    setPlaying(true);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ctxRef.current?.close();
    },
    []
  );

  return (
    <div className="w95 p-2">
      <div className="font-px text-[8px] mb-1 text-center">♪ NOW SPINNING ♪</div>
      <div className="w95-in flex items-center gap-2 px-2 py-1">
        <button className="btn95 text-[12px] px-2" onClick={toggle} aria-label="play or stop midi">
          {playing ? "■" : "►"}
        </button>
        <div className="min-w-0 flex-1">
          <div className="font-toon font-bold text-[12px] truncate">pipisclub_theme.mid</div>
          <div className="eq h-[16px] flex items-end" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} style={playing ? undefined : { animationPlayState: "paused", height: 3 }} />
            ))}
          </div>
        </div>
      </div>
      <div className="font-toon text-[11px] text-center mt-1">
        {playing ? "crank those speakers!!" : "28.8k friendly (4 KB)"}
      </div>
    </div>
  );
}

/* ================= pipischat lite (a lil bit of chatter) ================= */
type ChatMsg = { who: "u" | "webmaster"; text: string };
const CHAT_SEED: ChatMsg[] = [
  { who: "webmaster", text: "yo!! u made it 2 pipischat lite" },
  { who: "webmaster", text: "say somethin. im ALWAYS online (mom pays the bill)" },
];
const BOT_LINES = [
  "rofl. anyway — fried or non-fried?? answer carefully",
  "brb, mom needs the phone line. DONT GO ANYWHERE",
  "asl? 1999 / M / the internet",
  "have u signed the guestbook?? do it. its the law",
  "that reminds me... i gotta upload my pipis.swf",
  "the y2k bug ate my homework. true story",
  "k00l story. check NEWZ, i posted pure heat up there",
  "dont tell anyone but... the non-fried pipis r watchin",
  "add me on icq: 1337694. ill b there in spirit",
  "*~*~pipis~*~*",
  "A/S/L?? jk... unless?",
  "im typing with gloves on so my fingerprints stay pure",
  "ok real talk: banner.gif is COMING. webmaster is drawing it",
  "lol nice. the pipis approve ✔",
];

export function ChatBox() {
  const [msgs, setMsgs] = useState<ChatMsg[]>(() => {
    try {
      const raw = lsGet("ppc_chat");
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMsg[];
        if (Array.isArray(parsed) && parsed.length) return parsed.slice(-30);
      }
    } catch {
      /* corrupt log — start fresh */
    }
    return CHAT_SEED;
  });
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const liveRef = useRef(true);
  const boxRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    liveRef.current = true;
    const t = timersRef.current;
    return () => {
      liveRef.current = false;
      t.forEach((id) => clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    lsSet("ppc_chat", JSON.stringify(msgs.slice(-30)));
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [msgs, typing]);

  const send = () => {
    const text = draft.trim();
    if (!text || typing) return;
    setMsgs((m) => [...m, { who: "u", text: text.slice(0, 120) }]);
    setDraft("");
    setTyping(true);
    timersRef.current.push(
      window.setTimeout(() => {
        if (!liveRef.current) return;
        const line = BOT_LINES[Math.floor(Math.random() * BOT_LINES.length)];
        setMsgs((m) => [...m, { who: "webmaster", text: line }]);
        setTyping(false);
      }, 900 + Math.random() * 1300)
    );
  };

  return (
    <div className="w95 p-2">
      <div className="flex items-center gap-1 bg-[#000080] text-white px-1.5 py-1 mb-1.5">
        <span className="font-px text-[8px] flex-1 truncate">PIPISCHAT LITE · #pipisclub</span>
        <button
          className="btn95 !p-0 w-[16px] h-[14px] text-[9px] leading-none"
          title="wipe the chat log"
          onClick={() => {
            setMsgs(CHAT_SEED);
            setTyping(false);
          }}
        >
          ×
        </button>
      </div>
      <div ref={boxRef} className="w95-in h-[130px] overflow-auto px-1.5 py-1 space-y-0.5">
        {msgs.map((m, i) => (
          <div key={i} className="font-crt text-lg leading-[1.05] break-words">
            <span className={m.who === "webmaster" ? "text-[#00008b] font-bold" : "text-[#800000] font-bold"}>
              &lt;{m.who === "u" ? "you" : "webmaster"}&gt;
            </span>{" "}
            {m.text}
          </div>
        ))}
        {typing && (
          <div className="font-crt text-lg text-[#555]">
            webmaster is typing
            <span className="blink-fast">...</span>
          </div>
        )}
      </div>
      <form
        className="flex gap-1 mt-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          className="w95-in flex-1 min-w-0 px-1 py-0.5 font-toon font-bold text-[12px] outline-none"
          placeholder="say it..."
          value={draft}
          maxLength={120}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="chat message"
        />
        <button type="submit" className="btn95 text-[12px]" disabled={typing || !draft.trim()}>
          SEND
        </button>
      </form>
      <div className="font-toon text-[10px] text-center mt-1">chat log is saved in ur browser</div>
    </div>
  );
}

/* ================= webring ================= */
const RING = [
  ["Newgrounds", "https://www.newgrounds.com"],
  ["Space Jam (1996)", "https://www.spacejam.com"],
  ["textfiles.com", "http://www.textfiles.com"],
  ["GeoCities archive", "https://archive.org/web/geocities/"],
  ["GitHub", "https://github.com"],
] as const;

export function Webring() {
  const idx = useRef(Math.floor(Math.random() * RING.length));
  const go = (d: number) => {
    idx.current = (idx.current + d + RING.length) % RING.length;
    window.open(RING[idx.current][1], "_blank", "noopener");
  };
  const rand = () => {
    idx.current = Math.floor(Math.random() * RING.length);
    window.open(RING[idx.current][1], "_blank", "noopener");
  };
  return (
    <div className="w95 p-2 text-center">
      <div className="font-px text-[8px] mb-1">◄ THE PIPIS WEBRING ►</div>
      <div className="flex justify-center gap-1">
        <button className="btn95 text-[12px]" onClick={() => go(-1)} title="previous site">
          ◄◄
        </button>
        <button className="btn95 text-[12px]" onClick={rand} title="random site">
          ???
        </button>
        <button className="btn95 text-[12px]" onClick={() => go(1)} title="next site">
          ►►
        </button>
      </div>
      <div className="font-toon text-[11px] mt-1">this site is proud member #0064</div>
    </div>
  );
}

/* ================= 88x31 badges ================= */
const BADGES: Array<[string, string, string]> = [
  ["NETSCAPE", "NOW! 4.0", "#000080"],
  ["800×600", "HI-COLOR", "#005f00"],
  ["Y2K", "COMPLIANT", "#7a0000"],
  ["MADE WITH", "NOTEPAD.EXE", "#3d0066"],
  ["FREE", "PIPIS 4 ALL", "#8a5a00"],
  ["100% CGI", "FREE ZONE", "#004a5f"],
];

export function BadgeWall() {
  return (
    <div className="w95 p-2">
      <div className="font-px text-[8px] mb-2 text-center">COOL BADGES</div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {BADGES.map(([a, b, bg]) => (
          <div
            key={a}
            className="w-[88px] h-[31px] border-2 border-black flex flex-col items-center justify-center cursor-help select-none hover:invert transition-[filter]"
            style={{ background: bg }}
            title="right-click → save image as... (jk, it's CSS)"
          >
            <span className="font-px text-[7px] text-white leading-none">{a}</span>
            <span className="font-px text-[7px] text-[#ffd900] leading-none mt-[3px]">{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= win95 modal ================= */
export function Win95Modal({
  title,
  onClose,
  children,
  width = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,16,0.72)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w95 w-full ${width} shadow-[10px_10px_0_rgba(0,0,0,0.7)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-2 py-1" style={{ background: "linear-gradient(90deg,#000080,#1084d0)" }}>
          <span className="font-px text-[9px] text-white truncate">{title}</span>
          <button className="btn95 !p-0 w-[22px] h-[20px] text-[12px] leading-none" onClick={onClose} aria-label="close">
            ✕
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-auto">{children}</div>
      </div>
    </div>
  );
}

/* ================= guestbook ================= */
interface GbEntry {
  n: string;
  m: string;
  d: string;
}
const GB_SEED: GbEntry[] = [
  { n: "Webmaster", m: "first!!! welcome 2 my site. sign it or the pipis gets it.", d: "11-30-1999" },
  { n: "xX_PipisLord_Xx", m: "K00L site!!! the reviews section slaps. add more .ppc files!!", d: "12-02-1999" },
  { n: "sk8rgrrl2000", m: "found u thru the webring. midi song stuck in my head now. 10/10", d: "12-17-1999" },
];

export function Guestbook({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<GbEntry[]>(GB_SEED);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [thx, setThx] = useState(false);

  useEffect(() => {
    const raw = lsGet("ppc_gb");
    if (raw) {
      try {
        setEntries(JSON.parse(raw) as GbEntry[]);
      } catch {
        /* corrupted save file */
      }
    }
  }, []);

  const sign = () => {
    if (!name.trim() || !msg.trim()) return;
    const next = [{ n: name.trim().slice(0, 24), m: msg.trim().slice(0, 240), d: "12-31-1999" }, ...entries];
    setEntries(next);
    lsSet("ppc_gb", JSON.stringify(next));
    setName("");
    setMsg("");
    setThx(true);
    setTimeout(() => setThx(false), 1600);
  };

  return (
    <Win95Modal title="C:\PIPISCLUB\GUESTBOOK.EXE" onClose={onClose}>
      {thx && (
        <div className="mb-3 p-2 text-center font-px text-[10px] text-black blink" style={{ background: "var(--y)" }}>
          THANX 4 SIGNING!!!
        </div>
      )}
      <div className="space-y-2 mb-4">
        {entries.map((e, i) => (
          <div key={i} className="w95-in p-2">
            <div className="font-toon font-bold text-[13px]">
              <span style={{ color: "#000080" }}>{e.n}</span>{" "}
              <span className="font-normal text-[11px] text-[#555]">wrote on {e.d}:</span>
            </div>
            <div className="font-toon text-[13px] mt-0.5">{e.m}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <input
          className="w95-in font-toon text-[14px] px-2 py-1 outline-none"
          placeholder="ur k00l name"
          value={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w95-in font-toon text-[14px] px-2 py-1 outline-none h-20 resize-none"
          placeholder="say something nice about pipis"
          value={msg}
          maxLength={240}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button className="btn95 text-[14px] py-1" onClick={sign}>
          ★ SIGN THE BOOK ★
        </button>
      </div>
    </Win95Modal>
  );
}
