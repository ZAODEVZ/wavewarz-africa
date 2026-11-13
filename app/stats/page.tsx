import type { Metadata } from "next";
import { getAllBattles, getStats, site } from "@/lib/api";
import { int, sol, usd, when } from "@/lib/format";

export const revalidate = 60;
export const metadata: Metadata = { title: "Numbers" };

export default async function StatsPage() {
  const [s, all] = await Promise.all([getStats(), getAllBattles()]);
  const byMonth = new Map<string, number>();
  for (const b of all) {
    const m = b.createdAt?.slice(0, 7);
    if (m) byMonth.set(m, (byMonth.get(m) ?? 0) + 1);
  }
  const months = [...byMonth.entries()].sort().slice(-12);
  const max = Math.max(1, ...months.map(([, n]) => n));
  const decided = all.filter((b) => b.winnerDecided);
  const pollRight = decided.filter((b) => b.factors?.pollWinner === b.winnerSide).length;
  const wavyRight = decided.filter((b) => b.factors?.djWavyWinner === b.winnerSide).length;

  return (
    <main>
      <h1>Numbers</h1>
      <p className="muted">From {site.apiBase.replace(/^https?:\/\//, "")}{s?.updatedAt ? `, updated ${when(s.updatedAt)}` : ""}.</p>
      {s ? (
        <div className="tiles">
          <div className="tile"><b>{int(s.battles.total)}</b><span>battles: {int(s.battles.mainEvents)} main events, {int(s.battles.mainBattles)} main, {int(s.battles.quickBattles)} quick, {int(s.battles.communityBattles)} community</span></div>
          <div className="tile"><b>{sol(s.volume.totalSol, 0)}</b><span>traded in all, {usd(s.volume.totalUsd)}</span></div>
          <div className="tile"><b>{sol(s.volume.last24hSol)}</b><span>last 24 hours; {sol(s.volume.last7dSol)} last 7 days</span></div>
          <div className="tile"><b>{sol(s.artistPayouts.totalSol)}</b><span>paid to artists ({usd(s.artistPayouts.totalUsd)}), 1% of volume plus a settlement bonus, on chain</span></div>
          <div className="tile"><b>{sol(s.traderClaims.totalSol, 0)}</b><span>withdrawn by traders over {int(s.traderClaims.withdrawalCount)} claims</span></div>
          <div className="tile"><b>${s.solPriceUsd}</b><span>SOL price used</span></div>
        </div>
      ) : <div className="empty">The stats endpoint did not answer.</div>}

      {decided.length > 0 && (
        <>
          <h2>How battles get called</h2>
          <div className="tiles">
            <div className="tile"><b>{Math.round((100 * pollRight) / decided.length)}%</b><span>of {int(decided.length)} decided battles went the crowd poll&apos;s way</span></div>
            <div className="tile"><b>{Math.round((100 * wavyRight) / decided.length)}%</b><span>went DJ Wavy&apos;s way</span></div>
          </div>
        </>
      )}

      {months.length > 0 && (
        <>
          <h2>Battles a month</h2>
          <div className="panel" role="img" aria-label={months.map(([m, n]) => `${m}: ${n}`).join(", ")}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${months.length}, 1fr)`, gap: 6, alignItems: "end", height: 160 }}>
              {months.map(([m, n]) => (
                <div key={m} title={`${m}: ${n}`} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                  <div className="small mono" style={{ textAlign: "center", color: "var(--muted)" }}>{n}</div>
                  <div style={{ height: `${Math.max(3, (100 * n) / max)}%`, background: "var(--gold)", borderRadius: 6 }} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${months.length}, 1fr)`, gap: 6, marginTop: 6 }}>
              {months.map(([m]) => <div key={m} className="small mono muted" style={{ textAlign: "center" }}>{m.slice(2).replace("-", "/")}</div>)}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
