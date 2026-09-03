/* ============================================================
   pp.ts — the .ppconf / .ppc / .ppn wire-up engine
   (c)1999 CopyBite Industries. do not feed after midnight.
   ============================================================ */

export type LoadStatus = "loading" | "ok" | "error";

export interface PpcEntry {
  src: string; // url of the .ppc file itself
  status: LoadStatus;
  error?: string;
  name: string;
  author: string;
  repo: string; // github repo url -> "Not-Demo version" button
  demo?: string; // optional live demo
  release?: string; // link to a release (zip/exe/latest)
  manual?: string; // link to the manual / readme / docs
  embed?: string; // url that can be iframed right inside the review
  desc: string;
  style: string;
  version?: string;
  size?: string;
  added?: string;
  rating?: number;
  tags: string[];
  bannerUrl: string; // clickable banner src
  raw: Record<string, string>;
}

export interface PpnEntry {
  src: string;
  status: LoadStatus;
  error?: string;
  title: string;
  date: string;
  author: string;
  body: string;
}

export interface SiteConf {
  name: string;
  github: string;
  tagline: string;
  ppcUrls: string[];
  ppnUrls: string[];
  pipishost: string[]; // subdomain names -> pipishost/prjs/<name>/index.html
}

/* ---------- tiny INI-ish parser ----------
   key = value          (spaces around = are fine)
   [section]            (recorded, ignored otherwise)
   # or ; comment
   a line starting with whitespace continues the previous value
*/
export function parseIni(
  text: string
): { sections: Record<string, Record<string, string>>; flat: Record<string, string> } {
  const flat: Record<string, string> = {};
  const sections: Record<string, Record<string, string>> = {};
  let cur = "_";
  sections[cur] = {};
  let lastKey: string | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line.trim()) continue;
    if (/^\s*[#;]/.test(line)) continue;

    const sec = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (sec) {
      cur = sec[1].trim().toLowerCase();
      sections[cur] = sections[cur] || {};
      lastKey = null;
      continue;
    }

    if (/^[\t ]/.test(line) && lastKey) {
      const more = line.trim();
      flat[lastKey] += (flat[lastKey] ? " " : "") + more;
      sections[cur][lastKey] = flat[lastKey];
      continue;
    }

    const m = line.match(/^\s*([A-Za-z0-9_.-]+)\s*=\s*(.*)$/);
    if (m) {
      const k = m[1].toLowerCase();
      const v = m[2].trim();
      flat[k] = v;
      sections[cur][k] = v;
      lastKey = k;
    } else {
      lastKey = null;
    }
  }
  return { sections, flat };
}

export function parseConf(text: string): SiteConf {
  const { sections } = parseIni(text);
  const site = sections["site"] || {};
  const list = (s: Record<string, string> | undefined): string[] =>
    s
      ? Object.values(s).map((v) => v.trim()).filter(Boolean)
      : [];
  // also allow bare "url1,url2" style values under [ppc]/[newz]
  const collect = (key: string): string[] => {
    const sec = sections[key] || {};
    const out: string[] = [];
    for (const v of Object.values(sec)) {
      for (const piece of v.split(/\s+/)) if (piece) out.push(piece);
    }
    return out;
  };
  return {
    name: site.name || "ThePipisClub",
    github: site.github || "",
    tagline: site.tagline || "",
    ppcUrls: collect("ppc"),
    ppnUrls: collect("newz"),
    pipishost: collect("pipishost").map((n) => n.replace(/^\/+|\/+$/g, "")).filter(Boolean),
  };
}

/* ---------- url helpers ---------- */
export function abs(url: string): string {
  try {
    return new URL(url, document.baseURI).href;
  } catch {
    return url;
  }
}

/** github.com/OWNER/REPO -> raw.githubusercontent.com/OWNER/REPO/HEAD/<path> */
export function githubRaw(repoUrl: string, path: string): string | null {
  const m = repoUrl.match(/github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?(?=$|[/?#])/i);
  if (!m) return null;
  return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/HEAD/${path}`;
}

/**
 * Banner hunt:
 *  - explicit "banner=" in the .ppc wins (relative = this repo)
 *  - github repo  -> <repo raw>/pipisclub/banner.gif
 *  - local / unknown -> ./banner.gif in THIS repo
 */
export function bannerFor(repo: string, explicit?: string): string {
  if (explicit && explicit.trim()) return abs(explicit.trim());
  if (repo) {
    const raw = githubRaw(repo, "pipisclub/banner.gif");
    if (raw) return raw;
  }
  return abs("banner.gif");
}

/** PipisHost™: subdomain name -> ./pipishost/prjs/<name>/index.html */
export function prjUrl(name: string): string {
  const clean = name.trim().replace(/^\/+|\/+$/g, "");
  return abs(`pipishost/prjs/${clean}/index.html`);
}

/* ---------- fetchers ---------- */
export async function fetchText(url: string): Promise<string> {
  const res = await fetch(abs(url), { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export function makePpc(src: string): PpcEntry {
  return {
    src,
    status: "loading",
    name: "",
    author: "",
    repo: "",
    desc: "",
    style: "",
    tags: [],
    bannerUrl: abs("banner.gif"),
    raw: {},
  };
}

export async function loadPpc(entry: PpcEntry): Promise<PpcEntry> {
  try {
    const text = await fetchText(entry.src);
    const { flat } = parseIni(text);
    const ratingNum = parseFloat(flat["rating"]);
    const next: PpcEntry = {
      ...entry,
      status: "ok",
      name: flat["name"] || flat["title"] || "UNTITLED REPO",
      author: flat["author"] || flat["by"] || "anonymous netizen",
      repo: flat["repo"] || flat["url"] || flat["github"] || "",
      demo: flat["demo"] || undefined,
      release: flat["release"] || flat["releases"] || undefined,
      manual: flat["manual"] || flat["readme"] || flat["docs"] || undefined,
      embed: flat["embed"] || flat["iframe"] || undefined,
      desc: flat["desc"] || flat["description"] || "no description supplied. mysterious!!",
      style: flat["style"] || "Unlabeled",
      version: flat["version"],
      size: flat["size"],
      added: flat["added"] || flat["date"],
      rating: Number.isFinite(ratingNum) ? Math.max(0, Math.min(5, ratingNum)) : undefined,
      tags: (flat["tags"] || "")
        .split(/[;,|]/)
        .map((t) => t.trim())
        .filter(Boolean),
      raw: flat,
    };
    next.bannerUrl = bannerFor(next.repo, flat["banner"]);
    return next;
  } catch (e) {
    return { ...entry, status: "error", error: e instanceof Error ? e.message : "fetch failed" };
  }
}

export async function loadPpn(src: string): Promise<PpnEntry> {
  try {
    const text = await fetchText(src);
    const { flat } = parseIni(text);
    return {
      src,
      status: "ok",
      title: flat["title"] || "UNTITLED NEWZ",
      date: flat["date"] || "??-??-1999",
      author: flat["author"] || "Webmaster",
      body: flat["body"] || flat["text"] || "...",
    };
  } catch (e) {
    return {
      src,
      status: "error",
      error: e instanceof Error ? e.message : "fetch failed",
      title: src,
      date: "",
      author: "",
      body: "",
    };
  }
}

/* ---------- localStorage helpers ---------- */
export function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function lsSet(key: string, val: string) {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* full disk. very 1999. */
  }
}
