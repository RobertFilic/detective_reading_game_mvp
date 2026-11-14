# Game events: where players get stuck

Since 2026-11-14, »Skrivnostne sobe« (`kje-je-kdo/`) sends a few anonymous events. They show where children get stuck, which help steps they need, and how many puzzles get solved. Page views stay in Cloudflare Web Analytics: `/` is the start page, `/solo/` the main game, `/kje-je-kdo/` Skrivnostne sobe, and `/home/` launches from the Home Screen icon.

## Privacy rules

- **No name, no detective card, no IP address, no device ID.** Nothing is stored on the device for this.
- **`sid` is a random number that lives in the page's memory.** It ties together the events of one sitting and is gone on reload. So the events count sittings and puzzles, not children.
- **The Worker keeps only the fields listed below.** It drops anything else, and it has request logs switched off (`observability.enabled: false`), because those logs would hold IP addresses.
- **Storage:** D1 database `bralni-dogodki`, EU jurisdiction. Rows older than 365 days are deleted.
- **The privacy page says all this** in »3. Kaj vidimo mi« ([zasebnost/](../zasebnost/)). Any new event or field must be added there first.

## How it works

- **In the game:** [kje-je-kdo/index.html](../kje-je-kdo/index.html) calls `track(ev, data)`, which uses `navigator.sendBeacon('/api/e', …)`. If sending fails, nothing changes in the game.
- **The Worker:** [worker/index.js](../worker/index.js) runs only for `/api/*`. It checks the event and writes one row.
- **Setup:** [wrangler.jsonc](../wrangler.jsonc) holds the settings Workers Builds used to generate on every build, plus the Worker and the D1 binding. The git build still runs `npx wrangler deploy`.
- **Table:** [worker/migrations/0001_events.sql](../worker/migrations/0001_events.sql).

Each row has: `day` (UTC date only), `sid`, `game` (`sobe`), `ev`, `puzzle`, `placed` (people on the board at that moment), `sec` (seconds since the puzzle opened), and `data` (JSON).

| `ev` | When | `data` |
|---|---|---|
| `intro` | The »Kako se igra?« cards close | `card` (the card they closed on, 1–6), `how` (`next` = read to the end, `skip`, `close`), `first` (true = it opened by itself before the first puzzle, so **one per new player**) |
| `start` | A puzzle opens | `first` (false = a replay of a solved puzzle) |
| `wrong` | A wrong tap | `kind`: `clue` (the sentence rules the cell out), `maybe` (the sentence allows it, but it's not that cell), `row` / `col` (someone already stands there), `block` (tree, cake…), `taken`, `answer` (wrong culprit). `who` is the person id. |
| `hint` | Pomoč pressed | `who`, `kind` (`cell` = a sentence leaves few cells, `line` = a row or column needs someone, `notes` = the help writes the possibilities), `step` (1 = read, 2 = where it can be, 3 = the cell) |
| `stuck` | 90 s on the board without placing anyone. Only time with the board in view counts. Sent once per number of people placed. | `hints`, `wrongs`, `undos`, `notes` |
| `solved` | The right culprit is chosen | `hints`, `wrongs`, `undos`, `notes` (pencil used), `first` (the first solve on this device), `done` (how many puzzles this device has solved now) |
| `left` | Back to the list, another puzzle, or the page closed before the puzzle was solved | `hints`, `wrongs`, `undos`, `notes` |

## Reading the numbers

**In the dashboard:** Workers & Pages → D1 → `bralni-dogodki` → Console. **From the terminal:** `cf d1 query 429c1e8e-1b81-4afa-b038-196b57b2e941 --sql "…"`.

```sql
-- per puzzle: started, solved (first time), gave up, got stuck
SELECT puzzle,
  SUM(ev = 'start') AS started,
  SUM(ev = 'solved' AND json_extract(data, '$.first')) AS solved_first,
  SUM(ev = 'left') AS gave_up,
  SUM(ev = 'stuck') AS stuck
FROM events GROUP BY puzzle ORDER BY puzzle;

-- where in a puzzle they get stuck or give up (by how many people were already placed)
SELECT puzzle, ev, placed, COUNT(*) AS n FROM events
WHERE ev IN ('stuck', 'left') GROUP BY puzzle, ev, placed ORDER BY puzzle, ev, placed;

-- which help steps are needed most
SELECT puzzle, json_extract(data, '$.kind') AS kind, json_extract(data, '$.who') AS who, COUNT(*) AS n
FROM events WHERE ev = 'hint' AND json_extract(data, '$.step') = 1
GROUP BY puzzle, kind, who ORDER BY puzzle, n DESC;

-- which sentences are misread (a wrong cell the sentence rules out)
SELECT puzzle, json_extract(data, '$.who') AS who, json_extract(data, '$.kind') AS kind, COUNT(*) AS n
FROM events WHERE ev = 'wrong' GROUP BY puzzle, who, kind ORDER BY n DESC LIMIT 30;

-- how hard each puzzle really is: average helps, mistakes and minutes for a first solve
SELECT puzzle, COUNT(*) AS solves,
  ROUND(AVG(json_extract(data, '$.hints')), 1) AS helps,
  ROUND(AVG(json_extract(data, '$.wrongs')), 1) AS mistakes,
  ROUND(AVG(sec) / 60.0, 1) AS minutes
FROM events WHERE ev = 'solved' AND json_extract(data, '$.first') GROUP BY puzzle ORDER BY puzzle;

-- how far devices get: how many reached N solved puzzles
SELECT json_extract(data, '$.done') AS solved_so_far, COUNT(*) AS devices
FROM events WHERE ev = 'solved' AND json_extract(data, '$.first') GROUP BY solved_so_far ORDER BY solved_so_far;

-- per day: new players (intro opened by itself), sittings, first solves
SELECT day,
  SUM(ev = 'intro' AND json_extract(data, '$.first')) AS new_players,
  COUNT(DISTINCT sid) AS sittings,
  SUM(ev = 'solved' AND json_extract(data, '$.first')) AS solves
FROM events GROUP BY day ORDER BY day DESC LIMIT 30;

-- does the intro lose them? which card they close on and how
SELECT json_extract(data, '$.card') AS card, json_extract(data, '$.how') AS how, COUNT(*) AS n
FROM events WHERE ev = 'intro' AND json_extract(data, '$.first') GROUP BY card, how;
```

**What these numbers can't tell you:**
- **Daily unique players.** Use »new players« (the intro opens by itself once per device) and Web Analytics visits.
- **Why a child got stuck.** For that, watch a playtest.
- **Gaps from offline play and ad blockers.** A device that plays offline, or that blocks the beacon, sends nothing.
