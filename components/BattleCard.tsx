import Link from "next/link";
import type { Battle, Side } from "@/lib/api";
import { typeLabel } from "@/lib/api";
import { sol, when, songTitle } from "@/lib/format";

function SideBox({ b, side }: { b: Battle; side: Side }) {
  const a = b[side];
  const won = b.winnerDecided && b.winnerSide === side;
  return (
    <div className={`side${won ? " won" : ""}`}>
      {a.albumArtUrl ? <img src={a.albumArtUrl} alt="" loading="lazy" /> : <div className="noart" aria-hidden />}
      <div className="name" title={a.name}>{a.name}</div>
      <div className="meta">
        {songTitle(a.musicLink) || "song"}
        {a.volumeSol ? ` · ${sol(a.volumeSol)}` : ""}
        {won ? " · won" : ""}
      </div>
    </div>
  );
}

export default function BattleCard({ b }: { b: Battle }) {
  return (
    <Link href={`/battles/${b.battleId}`} className="card" aria-label={`${b.artist1.name} vs ${b.artist2.name}`}>
      <div className="head">
        <span>{typeLabel(b.type)}</span>
        <span className="row">
          {b.live ? <span className="badge live">live</span> : b.winnerDecided ? <span className="badge won">decided</span> : <span className="badge">open</span>}
          <span>{when(b.createdAt)}</span>
        </span>
      </div>
      <div className="vs">
        <SideBox b={b} side="artist1" />
        <span className="vsmark">VS</span>
        <SideBox b={b} side="artist2" />
      </div>
    </Link>
  );
}
