# The December leaflet: »Prva uganka je na papirju«

The producer's idea (2026-11-19), worked out. One A5 leaflet, handed to **parents**, with one Skrivnostne sobe room to solve on paper. The QR code checks the answer and opens the rest. Every leaflet is also a channel test (one code per place) and a message test (two variants). Draft until the producer approves it.

## Why this works for the hypotheses
- **Paper first answers the screen-time worry (H3).** The first puzzle is solved with a pencil at the kitchen table, together. The screen comes second, and only for a few minutes.
- **The parent opens the door (H1/H2).** A child of 7–8 can't scan a QR code without the parent's phone, so every scan is a parent's choice. What happens next (do they keep playing together?) is what we measure.
- **It costs almost nothing to build.** Skrivnostne sobe already exists, with a design tool, a checker and events. `?uganka=` already opens a room directly.

## The leaflet (A5, two sides)
**Front, the puzzle (for the child, read with the parent):**
- Title and a one-line story, e.g. »Kdo je odgriznil medenjak?« (a December room, **never** about Miklavž, Božiček or Dedek Mraz as culprits).
- A 4×4 floor plan, large, printable in black and white: rooms with names, objects drawn as simple icons, empty cells.
- Four people with a face and one sentence each (≤ 8 words).
- »Kako se igra?« in three lines: everyone in one cell; one per row and column; the culprit was alone with the missing thing.
- A row of small letters to write in the cells (A, B, C, D) and »Kdo je bil? _______«.

**Back, for the parent:**
- The variant's headline and two lines (below).
- **QR code: »Preveri rešitev«**, and the short address in letters for typing: `bralnidetektivi.si/?l=a01`.
- What it is: a Slovenian reading game for 7–8, two kinds of detective work (cases and secret rooms), and new ones keep coming (no rhythm promised: docs/TWO_GAMES.md).
- Trust line: »Brez računa. Brez oglasov. Ime in napredek ostanejo na vaši napravi.«
- The publisher's name and contact (LEGAL.md §6.1).

## Two message variants (H1 vs H2)
Slovenian drafts; the copywriter rewrites them, the Slovenian editor checks them.

| | **A · Skupaj** (H1) | **B · Sam, z vami v ozadju** (H2) |
|---|---|---|
| Headline | »15 minut skupnega branja. Najprej na papirju.« | »Bralna igra, ki jo otrok igra sam.« |
| Line 2 | »Otrok bere, vi pomagate. Skupaj najdeta krivca.« | »Kratki stavki, namigi, nikoli kazni. Vi vidite, kaj je prebral.« |
| Code | `A01` … `A30` | `B01` … `B30` |

Both claims are true today: the help ladder and the adult debrief exist. **Each place gets a shuffled stack of both** (half A, half B), so place and message aren't mixed up in the results.

## Codes and the distribution log
- Code = variant letter + place number: `A07` and `B07` are the same place. Up to 30 places.
- The log is a small sheet the producer keeps: code, place, type (library, paediatrician, bookshop, toy shop, fair, kindergarten board, teacher, friends), person who agreed, date, leaflets left, leaflets topped up. I can make it as a Sheet.
- A teacher who hands out leaflets for home gets their own code (type »teacher«): that is the H5 test.
- **Hand leaflets to parents, not to children.** Ask permission everywhere. Nothing on or next to school grounds without the principal's yes.

## What happens after the scan
1. `bralnidetektivi.si/?l=a01` → the start page with `src = a01` (stored on the device, ANALYTICS.md §3). The address is short so the QR code stays small and easy to scan.
2. A card on the start page: **»Si rešil uganko z letaka?«** with two buttons:
   - **»Da, preveri!«** → the four faces; tap who it was. Right: the stamp, »Bravo, detektiv!«, and the room's `heart` (the warm reason why). Wrong: »Poglej še enkrat, kdo je bil sam s …« and the room opens on screen, already explained.
   - **»Rešimo jo na zaslonu«** → the same room in Skrivnostne sobe.
3. Then: **»Še več skrivnostnih sob in pravi detektivski primeri«**, with Skrivnostne sobe and »Igraj!« side by side, and the install hint.
4. Logged as `paper` (`how: paper | screen`, `right`, `src`): ANALYTICS.md §4.

## The printable: »Natisni uganko«
A PDF on the landing page with the leaflet room and two more easy rooms, for parents who prefer paper. Logged as `print`. Choosing print over play is a direct measure of H3. It also gives libraries and kindergartens something to print themselves.

## What to build
| What | Who | Notes |
|---|---|---|
| The leaflet room | puzzle designer | `tools/kjekdo-design.mjs`, group `lahko`, 4×4, 0 claim steps, band of the easiest rooms. It must pass `tools/kjekdo.mjs` and also be solvable on paper **without** the in-game help (play-test it on paper with one child). Hidden from the room list (`paper: true`), opened by the leaflet flow and, after the check, listed like any other room. |
| `/l/<code>` | developer | A tiny page or Worker route: validates `^[ab]\d{2}$`, stores `src`, goes to `/?leaflet`. An unknown code goes to `/` with no `src`. |
| The check card and flow | developer | On the start page (`index.html`), with the `ui-*` look. |
| The printable PDF | developer, from the Claude Design leaflet | Black and white, A4 with two rooms. |
| The leaflet layout | Claude Design (producer), copy by the copywriter | Export a print PDF (A5, 3 mm bleed). The QR codes are generated per code (`solo/vendor/qrcode.js` can make them). |
| Browser test | developer | `tools/tests/leaflet.mjs`: `/l/a01` stores `src`, the check takes the right and a wrong answer, an unknown code is ignored. |

## Print and timing
- 1,000 copies, A5, two sides, colour on the front only if the budget allows (the puzzle must also work in black and white). Ask a local printer for a quote; order by **11-28**.
- Wave 1 from 11-30, around Miklavž; mid readout 12-09; wave 2 to 12-20 (VALIDATION.md).

## Open questions for the producer
1. The publisher's name and a contact e-mail for the back of the leaflet (LEGAL.md §6.1–6.2): needed before print.
2. ~~Test-family sign-up on the leaflet~~: no (producer, 2026-11-20). No e-mail addresses are collected; test families are recruited by hand.
3. Which places can you reach yourself in wave 1 (libraries, a paediatrician, a bookshop, friends' kindergartens)?
