import Link from "next/link";
import type { Metadata } from "next";
import BattleCard from "@/components/BattleCard";
import { getAllBattles, typeLabel } from "@/lib/api";

export const revalidate = 60;
export const metadata: Metadata = { title: "Battles" };

const PAGE = 48;
const kinds = [["all", "All"], ["live", "Live"], ["open", "Open"], ["decided", "Decided"], ["quick", "Quick"], ["main", "Main"], ["mainEvent", "Main events"], ["community", "Community"]] as const;

export default async function Battles({ searchParams }: { searchParams: Promise<{ kind?: string; page?: string; q?: string }> }) {
  const sp = await searchParams;
  const kind = sp.kind ?? "all";
  const q = (sp.q ?? "").trim().toLowerCase();
  const page = Math.max(1, Number(sp.page) || 1);
  const all = await getAllBattles();
  const filtered = all.filter((b) =>
    (kind === "all" || (kind === "live" ? b.live : kind === "open" ? !b.live && !b.winnerDecided : kind === "decided" ? b.winnerDecided : b.type === kind)) &&
    (!q || b.artist1.name.toLowerCase().includes(q) || b.artist2.name.toLowerCase().includes(q) || String(b.battleId) === q),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice((page - 1) * PAGE, page * PAGE);
  const href = (p: number) => `/battles?kind=${kind}${q ? `&q=${encodeURIComponent(q)}` : ""}&page=${p}`;

  return (
    <main>
      <h1>Battles</h1>
      <p className="muted">{filtered.length.toLocaleString("en-US")} of {all.length.toLocaleString("en-US")} battles{kind !== "all" ? `, ${kinds.find(([k]) => k === kind)?.[1] ?? typeLabel(kind)}` : ""}{q ? `, matching "${q}"` : ""}.</p>
      <form className="row" action="/battles" method="get">
        <input type="hidden" name="kind" value={kind} />
        <input name="q" defaultValue={q} placeholder="Artist or battle id" aria-label="Search battles" style={{ flex: 1, minWidth: 200, padding: "9px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--panel)", color: "var(--text)", font: "inherit" }} />
        <button className="btn ghost" type="submit">Search</button>
      </form>
      <div className="filters">
        {kinds.map(([k, label]) => (
          <Link key={k} href={`/battles?kind=${k}${q ? `&q=${encodeURIComponent(q)}` : ""}`} aria-current={k === kind ? "true" : undefined}>{label}</Link>
        ))}
      </div>
      {slice.length ? <div className="grid">{slice.map((b) => <BattleCard key={b.battleId} b={b} />)}</div> : <div className="empty">No battles here yet.</div>}
      {pages > 1 && (
        <p className="row small" style={{ justifyContent: "center", marginTop: 18 }}>
          {page > 1 && <Link href={href(page - 1)}>Newer</Link>}
          <span className="muted">page {page} of {pages}</span>
          {page < pages && <Link href={href(page + 1)}>Older</Link>}
        </p>
      )}
    </main>
  );
}
