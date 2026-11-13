# WaveWarZ Africa

The frontend for WaveWarZ Africa. Battles, artists and the numbers, read live from the WaveWarZ API you point it at. Zaal has the backend; this is the site in front of it.

Zaal, 13 Nov 2026: "BUILD WAVEWARZ AFRICA. i have the backend, give me a frontend, make a repo, ill connect my apis and we can test it."

## Connect your API

One env var. Server-side only, never sent to the browser.

```
WW_API_BASE=https://your-backend.example   # default: https://wavewarz.info
```

The backend has to answer two routes in the wavewarz.info shape (which it already does if it is the WaveWarZ codebase):

| Route | Used for |
|---|---|
| `GET /api/public/battles?limit=200&offset=0` | `{ battles: [...] }`: every page. Each battle: `battleId, type, live, winnerDecided, winnerSide, artist1, artist2, factors, imageUrl, createdAt, endsAt, url`; each artist: `name, wallet, musicLink, profilePictureUrl, twitterHandle, albumArtUrl, poolSol, volumeSol` |
| `GET /api/public/stats` | the headline tiles: volume, artist payouts, trader claims, battle counts, SOL price |

Nothing else is required. The artist leaderboard, the per-artist pages, the poll and DJ Wavy agreement rates and the battles-a-month chart are all computed here from the battles list.

Other env vars (all optional, see `.env.example`): `WW_SITE_NAME`, `WW_REGION`, `WW_BATTLE_URL_BASE` (where "Open on WaveWarZ" goes when a battle has no `url`), `WW_REVALIDATE` (seconds between API reads, default 60).

## Pages

- `/` Now: live battles, open battles, just decided, headline numbers.
- `/battles` every battle, filter by live/open/decided/kind, search by artist or id, paged.
- `/battles/<id>` one battle: both sides with cover art, song link, pool, volume, poll votes, X, wallet; how it was called (crowd poll, DJ Wavy, result); open on WaveWarZ.
- `/artists` leaderboard by wins, volume, battles or win rate; `/artists?q=<name>` one artist and all their battles.
- `/stats` the numbers, how often the poll and DJ Wavy matched the result, battles a month.
- `/api/health` which backend is connected and whether it answers.

## Run it

```
npm install
cp .env.example .env.local   # set WW_API_BASE
npm run dev                  # http://localhost:3000
```

Next.js 16 (App Router, server components, ISR), React 19, no UI library, no client state. Mobile-first, dark by default, light when the device asks. Deploy: Vercel, import the repo, set `WW_API_BASE`.

## Test with Zaal's API

1. Set `WW_API_BASE` to the backend's URL in Vercel (or `.env.local`).
2. Open `/api/health`: `ok: true` and a battle count means the two routes answer.
3. Open `/`, `/battles`, one battle, `/artists`, `/stats`. Anything blank means a field is missing or named differently; `lib/api.ts` has the types, one file to adjust.

Part of the ZAO estate. MIT.
