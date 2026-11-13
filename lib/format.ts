export const sol = (n: number | null | undefined, digits = 2) =>
  n == null ? "" : `${Number(n).toLocaleString("en-US", { maximumFractionDigits: digits })} SOL`;
export const usd = (n: number | null | undefined) =>
  n == null ? "" : `$${Math.round(Number(n)).toLocaleString("en-US")}`;
export const int = (n: number | null | undefined) => (n == null ? "" : Math.round(Number(n)).toLocaleString("en-US"));
export const short = (s: string | null | undefined, head = 4, tail = 4) =>
  !s ? "" : s.length <= head + tail + 3 ? s : `${s.slice(0, head)}...${s.slice(-tail)}`;

export function when(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const m = Math.round(diff / 60000);
  if (Math.abs(m) < 60) return m >= 0 ? `${m} min ago` : `in ${-m} min`;
  const h = Math.round(m / 60);
  if (Math.abs(h) < 48) return h >= 0 ? `${h} h ago` : `in ${-h} h`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export const songTitle = (url: string | null | undefined) => {
  if (!url) return "";
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() || u.hostname;
    return decodeURIComponent(last).replace(/[-_]+/g, " ");
  } catch {
    return url;
  }
};
export const songHost = (url: string | null | undefined) => {
  if (!url) return "";
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    return h === "audius.co" ? "Audius" : h.includes("soundcloud") ? "SoundCloud" : h.includes("spotify") ? "Spotify" : h.includes("youtu") ? "YouTube" : h;
  } catch {
    return "";
  }
};
