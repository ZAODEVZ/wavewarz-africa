import Link from "next/link";
import type { Metadata } from "next";
import BattleCard from "@/components/BattleCard";
import { getAllBattles, leaderboard } from "@/lib/api";
import { sol, when } from "@/lib/format";

export const revalidate = 60;
export const metadata: Metadata = { title: "Artists" };

export default async function Artists({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const sort = sp.sort ?? "wins";
  const all = await getAllBattles();
  const rows = leaderboard(all);

  if (q) {
    const row = rows.find((r) => r.name.toLowerCase() === q.toLowerCase());
    const theirs = all.filter((b) => b.artist1.name.trim() === q || b.artist2.name.trim() === q);
    return (
      <main>
        <p className="small"><Link href="/artists">Artists</Link> / {q}</p>
        <h1>{q}</h1>
        {row ? (
          <div className="tiles">
            <div className="tile"><b>{row.battles}</b><span>battles</span></div>
            <div className="tile"><b>{row.wins}</b><span>wins ({row.winRate}% of decided)</span></div>
            <div className="tile"><b>{sol(row.volumeSol)}</b><span>traded on their side</span></div>
            <div className="tile"><b>{row.songs.length}</b><span>song{row.songs.length === 1 ? "" : "s"} battled</span></div>
          </div>
        ) : <div className="empty">No artist by that name yet.</div>}
        {row?.songs.length ? (
          <p className="small">Songs: {row.songs.map((s, i) => <span key={s}>{i ? " · " : ""}<a href={s} target="_blank" rel="noopener">{s.replace(/^https?:\/\/(www\.)?/, "").slice(0, 50)}</a></span>)}</p>
        ) : null}
        <h2>Their battles</h2>
        <div className="grid">{theirs.map((b) => <BattleCard key={b.battleId} b={b} />)}</div>
      </main>
    );
  }

  const sorted = [...rows].sort((a, b) =>
    sort === "volume" ? b.volumeSol - a.volumeSol : sort === "battles" ? b.battles - a.battles : sort === "rate" ? (b.battles >= 5 ? b.winRate : -1) - (a.battles >= 5 ? a.winRate : -1) : b.wins - a.wins || b.volumeSol - a.volumeSol,
  ).slice(0, 200);

  return (
    <main>
      <h1>Artists</h1>
      <p className="muted">{rows.length.toLocaleString("en-US")} artists have battled. Top 200 by {sort === "volume" ? "trading volume" : sort === "battles" ? "battles" : sort === "rate" ? "win rate (5+ battles)" : "wins"}.</p>
      <div className="filters">
        {[["wins", "Wins"], ["volume", "Volume"], ["battles", "Battles"], ["rate", "Win rate"]].map(([k, l]) => (
          <Link key={k} href={`/artists?sort=${k}`} aria-current={k === sort ? "true" : undefined}>{l}</Link>
        ))}
      </div>
      <div className="wrap">
        <table>
          <thead><tr><th>#</th><th className="l">Artist</th><th>Battles</th><th>Wins</th><th>Win rate</th><th>Volume</th><th>Last battle</th></tr></thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.name}>
                <td>{i + 1}</td>
                <td className="l">
                  {r.art && <img src={r.art} alt="" loading="lazy" />}
                  <Link href={`/artists?q=${encodeURIComponent(r.name)}`}>{r.name}</Link>
                </td>
                <td>{r.battles}</td>
                <td>{r.wins}</td>
                <td>{r.wins + r.losses ? `${r.winRate}%` : ""}</td>
                <td>{sol(r.volumeSol)}</td>
                <td className="muted">{when(r.lastBattle)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
