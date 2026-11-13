import Link from "next/link";
import BattleCard from "@/components/BattleCard";
import { getBattles, getStats, site } from "@/lib/api";
import { int, sol, usd } from "@/lib/format";

export const revalidate = 60;

export default async function Home() {
  const [stats, recent] = await Promise.all([getStats(), getBattles(60, 0)]);
  const live = recent.filter((b) => b.live);
  const open = recent.filter((b) => !b.live && !b.winnerDecided);
  const decided = recent.filter((b) => b.winnerDecided).slice(0, 12);
  const apiDown = !stats && recent.length === 0;

  return (
    <main>
      <h1>{site.name}</h1>
      <p className="muted">Two songs, one battle, the crowd decides. Artists get paid on chain from the trading around their battle.</p>

      {apiDown && (
        <div className="empty">
          The WaveWarZ API did not answer. The site reads <span className="mono">{site.apiBase}</span>; check <span className="mono">WW_API_BASE</span>.
        </div>
      )}

      {stats && (
        <div className="tiles" aria-label="Headline numbers">
          <div className="tile"><b>{int(stats.battles.total)}</b><span>battles so far</span></div>
          <div className="tile"><b>{sol(stats.volume.totalSol, 0)}</b><span>traded ({usd(stats.volume.totalUsd)})</span></div>
          <div className="tile"><b>{sol(stats.artistPayouts.totalSol)}</b><span>paid to artists, automatically</span></div>
          <div className="tile"><b>{sol(stats.volume.last7dSol)}</b><span>traded in the last 7 days</span></div>
        </div>
      )}

      {live.length > 0 && (
        <>
          <h2>Live now</h2>
          <div className="grid">{live.map((b) => <BattleCard key={b.battleId} b={b} />)}</div>
        </>
      )}

      {open.length > 0 && (
        <>
          <h2>Open battles</h2>
          <div className="grid">{open.map((b) => <BattleCard key={b.battleId} b={b} />)}</div>
        </>
      )}

      {decided.length > 0 && (
        <>
          <h2>Just decided</h2>
          <div className="grid">{decided.map((b) => <BattleCard key={b.battleId} b={b} />)}</div>
          <p className="small"><Link href="/battles">All battles</Link> · <Link href="/artists">Artists by wins</Link></p>
        </>
      )}
    </main>
  );
}
