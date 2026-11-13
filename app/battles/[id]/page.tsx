import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Battle, Side } from "@/lib/api";
import { battleUrl, getBattle, typeLabel } from "@/lib/api";
import { int, short, sol, songHost, songTitle, when } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const b = await getBattle(Number((await params).id));
  return { title: b ? `${b.artist1.name} vs ${b.artist2.name}` : "Battle" };
}

function Panel({ b, side }: { b: Battle; side: Side }) {
  const a = b[side];
  const f = b.factors;
  const votes = (f?.pollVotesArtist1 ?? 0) + (f?.pollVotesArtist2 ?? 0);
  const won = b.winnerDecided && b.winnerSide === side;
  return (
      <section className={`panel${won ? " won" : ""}`} aria-label={a.name}>
        {a.albumArtUrl && <img src={a.albumArtUrl} alt={`Cover for ${a.name}`} />}
        <h2 style={{ margin: "12px 0 4px" }}>{a.name} {won && <span className="badge won">winner</span>}</h2>
        <dl>
          {a.musicLink && <><dt>Song</dt><dd><a href={a.musicLink} target="_blank" rel="noopener">{songTitle(a.musicLink)} on {songHost(a.musicLink)}</a></dd></>}
          <dt>Pool</dt><dd>{sol(a.poolSol, 3)}</dd>
          <dt>Volume</dt><dd>{sol(a.volumeSol, 3)}</dd>
          {f && <><dt>Poll votes</dt><dd>{int(side === "artist1" ? f.pollVotesArtist1 : f.pollVotesArtist2)}{votes ? ` of ${int(votes)}` : ""}</dd></>}
          {a.twitterHandle && <><dt>X</dt><dd><a href={`https://x.com/${a.twitterHandle.replace(/^@/, "")}`} target="_blank" rel="noopener">@{a.twitterHandle.replace(/^@/, "")}</a></dd></>}
          {a.wallet && <><dt>Wallet</dt><dd className="mono">{short(a.wallet, 6, 6)}</dd></>}
        </dl>
        <p style={{ marginTop: 12 }}><Link href={`/artists?q=${encodeURIComponent(a.name)}`} className="small">All battles by {a.name}</Link></p>
      </section>
  );
}

export default async function BattlePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const b = await getBattle(id);
  if (!b) notFound();
  const f = b.factors;

  return (
    <main>
      <p className="small"><Link href="/battles">Battles</Link> / {typeLabel(b.type)} #{b.battleId}</p>
      <h1>{b.artist1.name} <span className="muted">vs</span> {b.artist2.name}</h1>
      <p className="muted row">
        {b.live ? <span className="badge live">live</span> : b.winnerDecided ? <span className="badge won">decided</span> : <span className="badge">open</span>}
        <span>started {when(b.createdAt)}</span>
        {b.endsAt && <span>· ends {when(b.endsAt)}</span>}
        <span>· {sol((b.artist1.volumeSol || 0) + (b.artist2.volumeSol || 0), 3)} traded</span>
      </p>
      <div className="row" style={{ margin: "10px 0 18px" }}>
        <a className="btn" href={battleUrl(b)} target="_blank" rel="noopener">Open on WaveWarZ</a>
        {b.imageUrl && <a className="btn ghost" href={b.imageUrl} target="_blank" rel="noopener">Battle image</a>}
      </div>
      <div className="battle">
        <Panel b={b} side="artist1" />
        <Panel b={b} side="artist2" />
      </div>
      {f && (
        <>
          <h2>How it was called</h2>
          <div className="panel">
            <dl>
              <dt>Crowd poll</dt><dd>{f.pollWinner ? `${b[f.pollWinner].name} (${int(f.pollVotesArtist1)} to ${int(f.pollVotesArtist2)})` : "no votes yet"}</dd>
              <dt>DJ Wavy</dt><dd>{f.djWavyWinner ? b[f.djWavyWinner].name : "not yet"}{f.djWavyReasoning ? `: ${f.djWavyReasoning}` : ""}</dd>
              <dt>Result</dt><dd>{b.winnerDecided && b.winnerSide ? `${b[b.winnerSide].name} won` : "not decided"}</dd>
            </dl>
            <p className="small muted" style={{ marginBottom: 0 }}>The chart (what people traded) decides the split; the poll and DJ Wavy are the two other reads on the battle.</p>
          </div>
        </>
      )}
    </main>
  );
}
