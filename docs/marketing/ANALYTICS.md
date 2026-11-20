# Analytics for validation: the spec

> **Status 2026-11-20:** built and tested (`tools/tests/visits.mjs`, `doors.mjs`), not pushed: §2 »Kdo danes igra?«, §3 the device's counters and `sitting`, §4 `land`, `cta`, `install` (not `paper`, `print`: they wait for the leaflet room, LEAFLET.md), §6 `adult` and `survey`, §7 the Worker, §8 the privacy page. Changed while building: `pause` is replaced by `pm` (the last sitting's minutes, sent once with the next `sitting`), so each sitting is counted once; leaflet codes come as `?l=a07` (no `/l/` route needed). **No e-mail addresses are collected** (producer, 2026-11-20): no sign-up link; test families are recruited by hand. The contact address stays blank for now.

What the developer adds so the December validation (VALIDATION.md) can answer its questions. Written 2026-11-19 by the main session for the growth lead; **draft until the trust reviewer and the producer approve it.** The existing events are in [docs/EVENTS.md](../EVENTS.md); this file only adds. When it is built, its tables move into EVENTS.md and this file keeps only the queries and the reasons.

## 1. Rules (unchanged, and they bind every line below)
- **No id.** No name, no device id, no player id, no IP. `sid` stays a random number in the page's memory.
- **The device computes, the server counts.** The device already knows its own history; it sends **numbers about itself** (how many days since the first visit, which sitting this is), never something that ties two sittings together on the server.
- **The privacy page first** (§8). No new event or field ships before `zasebnost/` says it.
- **The Worker's allowlist** (`worker/index.js`) is the gate: anything not listed is dropped.
- **Small numbers can identify.** No free text, no exact time (hour in 3-hour blocks), no date of first visit (it is derived from `day − days` on the server, per day only).

## 2. Who plays: »Kdo danes igra?« (H1 vs H2)
The most important new signal.
- **When:** at the start of a sitting (§3), when the child taps »Igraj!« on the start page or opens a room: in the 1st sitting, then every 3rd (`n % 3 == 1`). Never during a case, never in the warm-up's guided steps.
- **What:** a small card, not a blocker: »Kdo danes igra?« with two big buttons, »👧 Jaz« and »👧👩 Z odraslim«, and a quiet ✕. The UX reviewer checks it on the three screens; the Slovenian editor the words.
- **Event** `with`: `{ with: 'solo' | 'adult' | 'skip', n, g }` (`g` = `solo` or `sobe`, where it was asked).
- **Proxies** (no question needed): the `adult` event (§6), the time of day and weekday (§3), the sitting's minutes (§5).

## 3. The device's own counters and the source
A new key on the device, **`dp_visits_v1`**, shared by the start page, `solo/` and `kje-je-kdo/` (same origin):
```
{ first: '2026-11-30', n: 4, last: '2026-12-06', src: 'a07', srcAt: '2026-11-30', v: 'b' }
```
- **A sitting** starts on a page load when the last activity was more than 30 minutes ago (`last` keeps the time of the last activity too). `n` counts sittings.
- **`src`**: set from `/l/<code>` (LEAFLET.md) or `?ref=<word>` on any page (for later campaigns: `?ref=fb1`, `?ref=knjiznica`). Validated `^[a-z0-9]{2,12}$`. The first source wins and stays for 60 days, then it is dropped (`srcAt`).
- **`v`**: the landing page's A/B variant, drawn once (`'a'` or `'b'`) and kept, so a device always sees the same page.
- **Event** `sitting`, sent once at the start of each sitting:

| Field | Meaning |
|---|---|
| `n` | this sitting's number on the device (1 = the first visit) |
| `days` | whole days since `first` (0 on the first day); not `age`, which the tests forbid as a child's age |
| `gap` | whole days since the previous sitting (absent on the first) |
| `wk` | `floor(days / 7)`: the week of the device's life (0 = its first week) |
| `fw` | `true` if this is the first sitting in this `wk`; it makes »devices active in week N« countable without an id |
| `wd` | weekday, 1 = Monday … 7 = Sunday |
| `hb` | the hour in 3-hour blocks: 0 = 0–2 … 6 = 18–20, 7 = 21–23 |
| `src`, `v` | the stored source and variant, or absent |
| `pwa` | `true` if opened from the Home Screen (display-mode standalone) |
| `g` | where the sitting started: `web` (start page), `solo`, `sobe` |

## 4. The start page and the leaflet (`game = 'web'`)
The start page sends events for the first time. Page views stay in Cloudflare Web Analytics.

| `ev` | When | `data` |
|---|---|---|
| `land` | The start page opens (once per sitting) | `src`, `v`, `pwa` |
| `cta` | A main button is tapped | `which`: `hero`, `end`, `sobe`, `solo`, `install`, `print`, `leaflet`, `family`; `v` |
| `install` | The install sheet is opened, or the app is installed | `how`: `sheet`, `prompt`, `accepted` |
| `paper` | The leaflet check (LEAFLET.md) | `how`: `paper` (solved on paper, checked) or `screen` (chose to solve it on screen); `right` (boolean, for `paper`); `src` |
| `print` | »Natisni uganko« opened | `src`, `v` |

## 5. How long a sitting is
- **Built as `pm`** on the next `sitting` event: the minutes the last sitting was in view (the device adds them up in `dp_visits_v1.ms`). Each sitting is counted once; the last sitting before a family stops is never reported.

## 6. The parent's voice
- **Event** `adult`: the adult areas open. `how`: `za-odrasle` (the start page link), `gate` (the 3-second corner), `debrief`, `export`, `qr`. A proxy for how involved a parent is.
- **The parent's 30 seconds** (event `survey`): behind the adult gate (»Za odrasle«), never on a child's screen. Offered once a device has finished a season or had 5 sittings, and again after the next finished season. Four taps, every one optional:

| `q` | Question (Slovenian draft) | `a` |
|---|---|---|
| `skupaj` | »Ste igrali skupaj?« | 1 vedno · 2 včasih · 3 otrok sam |
| `vredno` | »Je bil ta čas pred zaslonom dobro porabljen?« | 1 da · 2 ne vem · 3 ne |
| `priporocil` | »Bi igro priporočili prijatelju?« | 0–10 |
| `skrb` | »Kaj vas pri igri najbolj skrbi?« | 1 čas pred zaslonom · 2 premalo časa za skupno igro · 3 igra je pretežka · 4 igra je prelahka · 5 nič |

  Sent as one event per answer: `{ q, a, n }`. No free text (a free-text box goes to the interviews instead).
- **Test families.** For December, the sign-up is a **mailto link** to the contact address (»Želim biti testna družina«), not a form: no new data store. The game and the website collect no e-mail addresses; the producer keeps the list by hand, outside the game data, and deletes it when the study ends. The privacy page gets one general line about e-mails people send us (§8.3).

## 7. Worker changes (`worker/index.js`)
- `GAMES`: add `web`.
- `EVENTS`: add `land`, `cta`, `install`, `paper`, `print`, `sitting`, `pause`, `with`, `adult`, `survey`.
- `DATA`: add `src`, `v`, `pwa`, `g`, `which`, `right`, `n`, `days`, `gap`, `wk`, `fw`, `wd`, `hb`, `min`, `cases`, `rooms`, `with`, `q`, `a`.
- Values stay as today: a boolean, an integer 0–9999, or a short word (`^[a-z0-9_-]{1,24}$`). No migration is needed: the new fields live in `data`.
- Update `docs/EVENTS.md` (the tables) and the comment in `0001_events.sql` (`game` now also `solo`, `web`).

## 8. The privacy page (`zasebnost/`): what changes
Two sentences become untrue and must change **before** the build ships. Slovenian drafts for the Slovenian editor; the producer may want the lawyer to read §8.2.
1. In »3. Kaj vidimo mi«, add: »Z napravo pošljemo tudi nekaj številk o obiskih: koliko dni je minilo od prvega obiska, kateri obisk je to, koliko minut je trajal, dan v tednu in del dneva, ali je bila igra odprta z začetnega zaslona, s katerega letaka ali povezave je prišel obisk in ali je otrok igral sam ali z odraslim (če to izbere). Odrasli lahko v delu »Za odrasle« odgovorijo še na štiri vprašanja o igri. Ti podatki ne povedo, kdo ste, in jih ne povezujemo med seboj.«
2. Replace »Za dogodke na napravo ne shranimo ničesar.« with »Na napravi hranimo samo datum prvega obiska, število obiskov, oznako letaka ali povezave in različico začetne strani. Pošljemo samo iz njih izračunane številke.«
3. »4. Česa ne počnemo« keeps »Ne zbiramo imen, e-naslovov …« (the game and the website collect none). Add one general line, not tied to any study (producer, 2026-11-20): »Če nam pišete, vaš e-naslov uporabimo samo za odgovor. Ne povezujemo ga z igro in ga ne hranimo dlje, kot je treba.«

## 9. The scorecard queries
Run in the D1 console or with `node tools/stats.mjs` once the queries are added there. `day − days` gives a device's first day.

```sql
-- scans per leaflet code, and how many of them went on to play (activation, by code)
SELECT json_extract(data,'$.src') AS code, COUNT(*) AS scans
FROM events WHERE game='web' AND ev='land' AND json_extract(data,'$.src') IS NOT NULL GROUP BY code ORDER BY code;

-- the leaflet check: solved on paper, right or wrong, or on screen; by variant letter
SELECT substr(json_extract(data,'$.src'),1,1) AS variant, json_extract(data,'$.how') AS how,
  json_extract(data,'$.right') AS right_, COUNT(*) AS n
FROM events WHERE ev='paper' GROUP BY variant, how, right_;

-- new devices per first day, and how many were active again in their 2nd week (week-2 return)
SELECT date(day, '-' || json_extract(data,'$.days') || ' days') AS cohort,
  SUM(json_extract(data,'$.n') = 1) AS new_devices,
  SUM(json_extract(data,'$.wk') = 1 AND json_extract(data,'$.fw')) AS active_week2
FROM events WHERE ev='sitting' GROUP BY cohort ORDER BY cohort;

-- who plays: answers to »Kdo danes igra?«, by source variant
SELECT substr(COALESCE(s.src,'-'),1,1) AS variant, json_extract(w.data,'$.with') AS who, COUNT(*) AS n
FROM events w LEFT JOIN (SELECT sid, json_extract(data,'$.src') AS src FROM events WHERE ev='sitting') s ON s.sid = w.sid
WHERE w.ev='with' GROUP BY variant, who;

-- do duo sittings belong to devices that come back? (sitting number at the time of the answer)
SELECT json_extract(data,'$.with') AS who, ROUND(AVG(json_extract(data,'$.n')),1) AS avg_sitting_no, COUNT(*) AS n
FROM events WHERE ev='with' AND json_extract(data,'$.with') != 'skip' GROUP BY who;

-- minutes per sitting (the one before each sitting), and when families play (weekday × part of the day)
SELECT json_extract(data,'$.wd') AS wd, json_extract(data,'$.hb') AS hb, COUNT(*) AS sittings,
  ROUND(AVG(json_extract(data,'$.pm')),1) AS avg_min_of_the_sitting_before
FROM events WHERE ev='sitting' GROUP BY wd, hb ORDER BY wd, hb;

-- landing A/B: the hero's call to action per variant
SELECT json_extract(data,'$.v') AS v, SUM(ev='land') AS lands, SUM(ev='cta' AND json_extract(data,'$.which')='hero') AS hero_taps
FROM events WHERE game='web' GROUP BY v;

-- the parent's 30 seconds
SELECT json_extract(data,'$.q') AS q, json_extract(data,'$.a') AS a, COUNT(*) AS n
FROM events WHERE ev='survey' GROUP BY q, a ORDER BY q, a;
```

## 10. Build order and tests
1. Trust reviewer approves this spec; the privacy page changes (§8) are written and checked. → `zasebnost/` first.
2. `worker/index.js` allowlist (§7).
3. `dp_visits_v1`, the `sitting` and `pause` events, on all three pages (one small shared script, or the same 40 lines in each).
4. `/l/<code>`, `land`, `cta`, `install`, `paper`, `print` on the start page.
5. »Kdo danes igra?« (`with`), then `adult` and `survey`.
6. Tests: a new `tools/tests/visits.mjs` (counters across reloads and a 31-minute gap, `src` from `/l/a07` and `?ref=`, the variant is sticky, the 60-day expiry); `landing.mjs` gets `land`/`cta`; the existing tests must not see the new card (the shared `open()` helper sets `n` so the card isn't due).
7. Producer reads one day of real rows before the leaflets go out.

**Target: built and live by 11-28**, before the leaflets go out on 11-30.

## What these numbers still can't tell us
- **Siblings and shared iPads:** one device is one family, not one child.
- **»Z odraslim« is a child's tap.** Trust the trend, check it in the interviews.
- **Offline play and ad blockers** send nothing, as today.
- **Why.** Only the interviews and the diary cards say why (RESEARCH.md).
