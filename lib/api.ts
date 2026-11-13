// The WaveWarZ API, as wavewarz.info serves it today. Everything the pages show comes
// through here, so pointing WW_API_BASE at another backend (WaveWarZ Africa's) is the only
// change needed as long as it answers these two routes in this shape.
import "server-only";

export type Side = "artist1" | "artist2";
export type BattleType = "quick" | "main" | "mainEvent" | "community" | string;

export type Artist = {
  name: string;
  wallet: string | null;
  musicLink: string | null;
  profilePictureUrl: string | null;
  twitterHandle: string | null;
  albumArtUrl: string | null;
  poolSol: number;
  volumeSol: number;
};

export type Battle = {
  battleId: number;
  type: BattleType;
  live: boolean;
  winnerDecided: boolean;
  winnerSide: Side | null;
  artist1: Artist;
  artist2: Artist;
  factors: {
    pollWinner: Side | null;
    pollVotesArtist1: number;
    pollVotesArtist2: number;
    djWavyWinner: Side | null;
    djWavyReasoning: string | null;
  } | null;
  imageUrl: string | null;
  createdAt: string;
  endsAt: string | null;
  url: string | null;
};

export type Stats = {
  updatedAt: string;
  solPriceUsd: number;
  volume: { totalSol: number; totalUsd: number; last24hSol: number; last7dSol: number };
  liveBattle: Battle | null;
  artistPayouts: { totalSol: number; totalUsd: number; note?: string };
  traderClaims: { totalSol: number; totalUsd: number; withdrawalCount: number; note?: string };
  battles: { total: number; mainEvents: number; mainBattles: number; quickBattles: number; communityBattles: number };
};

export const site = {
  name: process.env.WW_SITE_NAME || "WaveWarZ Africa",
  region: process.env.WW_REGION || "Africa",
  apiBase: (process.env.WW_API_BASE || "https://wavewarz.info").replace(/\/+$/, ""),
  battleUrlBase: process.env.WW_BATTLE_URL_BASE || "https://wavewarz.com/battle/",
  revalidate: Number(process.env.WW_REVALIDATE) || 60,
};

async function get<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${site.apiBase}${path}`, {
      headers: { accept: "application/json", "user-agent": "wavewarz-africa" },
      next: { revalidate: site.revalidate },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch (err) {
    console.warn(`[ww] ${path} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function getStats(): Promise<Stats | null> {
  return get<Stats>("/api/public/stats");
}

export async function getBattles(limit = 200, offset = 0): Promise<Battle[]> {
  const j = await get<{ battles?: Battle[] }>(`/api/public/battles?limit=${limit}&offset=${offset}`);
  return j?.battles ?? [];
}

// Every battle, newest first (the API pages by 200). Capped so a runaway backend cannot stall a page.
export async function getAllBattles(max = 5000): Promise<Battle[]> {
  const all: Battle[] = [];
  for (let offset = 0; offset < max; offset += 200) {
    const page = await getBattles(200, offset);
    all.push(...page);
    if (page.length < 200) break;
  }
  return all.sort((a, b) => (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0));
}

export async function getBattle(id: number): Promise<Battle | null> {
  const all = await getAllBattles();
  return all.find((b) => b.battleId === id) ?? null;
}

export type ArtistRow = {
  name: string;
  battles: number;
  wins: number;
  losses: number;
  winRate: number;
  volumeSol: number;
  poolSol: number;
  songs: string[];
  art: string | null;
  pfp: string | null;
  twitter: string | null;
  wallet: string | null;
  lastBattle: string;
};

// The leaderboard the API does not have: one row per artist name, from every battle.
export function leaderboard(battles: Battle[]): ArtistRow[] {
  const rows = new Map<string, ArtistRow>();
  for (const b of battles) {
    for (const side of ["artist1", "artist2"] as Side[]) {
      const a = b[side];
      if (!a?.name) continue;
      const key = a.name.trim();
      const row = rows.get(key) ?? { name: key, battles: 0, wins: 0, losses: 0, winRate: 0, volumeSol: 0, poolSol: 0, songs: [], art: null, pfp: null, twitter: null, wallet: null, lastBattle: "" };
      row.battles++;
      if (b.winnerDecided) {
        if (b.winnerSide === side) row.wins++;
        else row.losses++;
      }
      row.volumeSol += a.volumeSol || 0;
      row.poolSol += a.poolSol || 0;
      if (a.musicLink && !row.songs.includes(a.musicLink)) row.songs.push(a.musicLink);
      row.art ||= a.albumArtUrl;
      row.pfp ||= a.profilePictureUrl;
      row.twitter ||= a.twitterHandle;
      row.wallet ||= a.wallet;
      if (b.createdAt > row.lastBattle) row.lastBattle = b.createdAt;
      rows.set(key, row);
    }
  }
  return [...rows.values()]
    .map((r) => ({ ...r, winRate: r.wins + r.losses ? Math.round((100 * r.wins) / (r.wins + r.losses)) : 0 }))
    .sort((a, b) => b.wins - a.wins || b.volumeSol - a.volumeSol || a.name.localeCompare(b.name));
}

export const battleUrl = (b: Battle) => b.url || `${site.battleUrlBase}${b.battleId}`;
export const typeLabel = (t: BattleType) =>
  t === "quick" ? "Quick battle" : t === "main" ? "Main battle" : t === "mainEvent" ? "Main event" : t === "community" ? "Community battle" : t;
