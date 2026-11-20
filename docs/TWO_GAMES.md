# Two games, one detective: the landing page and the home screen

Plan for showing both games (🕵️ Detektivski primeri and 🚪 Skrivnostne sobe) on the landing page and inside the game. Proposed 2026-11-19; the producer's decisions are below; the mock-up is the Claude Design canvas »Bralni detektivi – dve igri, en detektiv« (https://claude.ai/artifact/Q5Pc7fkZmENK7Ym6qRdDLB). **Built 2026-11-19 (steps 1–4), tested, waiting for the producer's look before the push.** Not yet: the `door`/`tab` events (§5) wait for the privacy page (docs/marketing/ANALYTICS.md §8). Copy is a Slovenian draft for the Slovenian editor; screens go to the UX reviewer.

## Decisions (producer, 2026-11-19)
1. **The names stay:** »Detektivski primeri« (the cases) and »Skrivnostne sobe« (the rooms).
2. **New content keeps coming for every game, with no fixed rhythm** (new cases and new rooms, and any later game). No count, day or date in any public promise: »Novi primeri in sobe prihajajo«, never »vsak četrtek«, »vsak dan« or »28 sob«. The weekly release plan stays an internal plan (docs/studio/RELEASES.md), not a promise.
3. **One rank only**, for every kind of game, now and later (a third game is likely). No separate counter for rooms. **How it is calculated stays hidden** from the child; a case weighs much more than a room (§3).
4. **One main button** on the landing page: »▶ Igraj zdaj« opens the detective's office, and the child picks the game there.
5. **The landing page is approved** as mocked up (canvas board »Začetna stran«), including the rooms visual drawn like the real board (pastel rooms, dark walls, name tokens; room 1).
6. **Navigation: the office, then a dashboard per game** (canvas boards »✔ 1–3«): the office (B) holds only the detective, the rank and one door per game; inside a game the band (A) shows a small detective card, which goes back to the office, and the tabs »🕵️ Primeri | 🚪 Sobe« that switch straight to the other game. Each game has its own dashboard; nothing of one game shows on the other's.

## 1. The landing page (`index.html`)
- **Hero:** »Vsak stavek je sled.« · »Otrok postane detektiv. Rešuje primere in skrivnostne sobe – in pri tem bere.« · one button »▶ Igraj zdaj« → `solo/?play` (the home).
- **Two equal cards under the hero** (they replace the »Novo!« card). They explain the games and also link straight in, as a shortcut:
  - 🕵️ **Detektivski primeri:** »Kdo je bil? Preberi zgodbo in najdi dokaz.« · »Zgodbe v nadaljevanjih« → `solo/?play`
  - 🚪 **Skrivnostne sobe:** »Kje je bil kdo? Preberi namige in postavi vse na pravo mesto.« · »Od lahkih do težjih« → `kje-je-kdo/`
- **The phone mock-up** shows a case screen and a room board in turn.
- **»Kako deluje«** has two tabs: »Primer« (the five steps) and »Soba« (»Preberi namig« → »Postavi na pravo mesto« → »Kdo je bil sam?«).
- **»Vsak teden« becomes »Vedno kaj novega«:** »Novi primeri in sobe prihajajo.« No day or rhythm; the 🎄 advent band can be shown in December as an example. The hero note »Vsak teden nova pustolovščina« becomes »Vedno kaj novega.«
- **»Zakaj branje«:** each skill shows which game trains it (the rooms: the small words *ob, v, na, ni* and logic; the cases: understanding, order, inference).
- **Menu:** »Igre« instead of »Skrivnostne sobe novo«. The »12 ugank« line goes (decision 2).
- The age line (»od 6 do 10 let«) changes with the validation copy (docs/marketing/), not here.

## 2. The office and one dashboard per game
**The office** (`solo/`, a new first screen of the home; canvas »✔ 1 · Pisarna«), where »▶ Igraj zdaj« lands:
1. The band: 👥 (who plays), the brand, ❓; the detective's badge, the rank with the total (»🕵️ Detektivka · ✔ 15«), the name. A tap on the badge edits the ID card, as today.
2. »Kam greš danes?« and **one door per game**, each in its own look:
   - 🕵️ **Detektivski primeri:** in the colour of the adventure played last, its icon, »Kdo je bil?«, and where the child is (»Sneženi možje · Primer 3«).
   - 🚪 **Skrivnostne sobe:** a small real board, »Kje je bil kdo?«, the next room (»Uganka 27 te čaka«), and »NOVA SOBA« when an open room is not solved yet.
3. »Dovolj za danes«.
A future game adds a door here.

**Inside a game** (canvas »✔ 2 · Primeri«, »✔ 3 · Sobe«), the same band on top of both games:
- **The small detective card** (‹, the picture, the name, the rank and total): a tap goes back to the office.
- **The tabs »🕵️ Primeri | 🚪 Sobe«** switch straight to the other game's dashboard; »NOVO« on the Sobe tab when a room waits. A future game adds a tab (up to 3–4).
- **Primeri's dashboard** = today's home without the badge: the big adventure card, the advent band, the adventures, the medals, the teasers.
- **Sobe's dashboard** = today's rooms list (the »NOVA SOBA« card, the groups), under the new green band instead of today's cream bar.
- The game remembers the last tab; a returning child still starts in the office.

**Data:** the office must know which rooms are open without opening the rooms game. The rooms' `id`, `date` and `group` move into a small shared file (e.g. `kje-je-kdo/rooms.js`) that both pages load and `sw.js` caches. Solved rooms are already per detective (`dp_kjekdo_v1` is in `KID_KEYS`). The rooms stay their own page (`kje-je-kdo/`); the band is one shared component both pages draw the same way.

## 3. One rank for every game
Today the rank counts solved cases: 0 / 3 / 6 / 10 / 15 (`RANKS`). A room is much faster to solve than a case, so counted 1:1 the rooms would carry a child to Glavni inšpektor in a few days. So:
- **Every solve earns points: a case 3, a room 1.** The weights live in one table (`GAME_POINTS`); a future game gets its own line there.
- **The thresholds triple:** 0 / 9 / 18 / 30 / 45 points. A child's points from cases alone are three times their cases, so **every existing child keeps exactly their rank.**
- **Hidden from the child.** The card shows the total of what was solved, »✔ 15 rešenih«, and the rank. No points, no weights on any child's screen.
- **Calibrate from real play.** Once the events show the median minutes per first solve (`solved`, `sec`) for a room and for a case, set the weight to roughly that ratio. Tuning is safe because of the next rule.
- **A rank is never lost.** Today it never drops because solves are never removed; with weights that can change, the card stores the highest rank reached per detective (in the profile, so it moves with export, import and QR prenos) and shows the higher of stored and computed.
- The rank-up moment can now come after a room too (the stamp on the rooms' solved screen).

## 4. Moving between the games, and nudges
- **The ways across:** the office's doors, the tabs in the band, and the small card back to the office. The rooms' old ← to the landing page goes; the landing page stays one tap away in the office's adult area.
- **When the next case isn't out yet** (»⏳ Primer 4 pride kmalu …«), the board offers »Medtem odpri skrivnostno sobo 🚪« (it opens the Sobe tab).
- **The first time:** after the child's first real case (never in the warm-up), the companion points at the Sobe door in the office once: »Tu so skrivnostne sobe. Preizkusi eno!«.
- **Direct links keep working:** the leaflet (docs/marketing/LEAFLET.md) and `kje-je-kdo/?uganka=` open a room straight away, with the band on top.

## 5. Measured (docs/marketing/ANALYTICS.md)
`cta` on the landing page (`which: solo | sobe`), a `door` event in the office and a `tab` event in the band (`which: primeri | sobe`). They show which game a family picks first and whether a device plays both.

## Build order
1. **The office and the band** (developer): the office screen with the doors, the shared band (small card + tabs) on both games, Primeri's dashboard without the badge, the shared rooms file. Tests: `start.mjs`, `kjekdo.mjs`, `detectives.mjs`, a new `doors.mjs` (landing → office → each door → tab across → card back to the office).
2. **One rank:** `GAME_POINTS`, the tripled `RANKS`, the stored best rank, the total on the card and in the band, the rank-up after a room. Tests: the rank tests and `detectives.mjs`.
3. **The landing page** as approved (copywriter and Slovenian editor read the final text; UX reviewer on three screens). Test: `landing.mjs`.
4. **The nudges** and the companion's pointer, last (UX reviewer).
