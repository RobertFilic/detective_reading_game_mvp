# Validation plan: December 2026

The marketing strategist's plan of record for the first validation. Written 2026-11-19, **draft until the producer approves it.** Keep it under ~150 lines. Results go in »Readout« at the end, not in a new file.

## Why now
- Six December seasons are already planned (🎄 Praznični primeri, a window every Thursday), plus the school winter break around Christmas and New Year. Parents are home with their children and looking for things to do together.
- The game is ready: 6 live seasons, 28 Skrivnostne sobe rooms, an advent band, the diploma on 12-31.
- What's missing is evidence: PLAYTEST.md has nothing since 2026-11-02, and the events can't tell who plays, or whether they come back.

## What we know (context, not hypotheses)
- **Schools are out as a place to play.** The amended primary school law makes devices banned by default; they may only be used when the school's annual work plan calls for it. Teachers can at most recommend the game for home. → Parents are the audience. Teachers are a side test only (H5).
- **Screen time is the parent's frame.** The national guidelines (Zdravniška zbornica, NIJZ, 2021) set a limit of 1 hour a day of leisure screen time for ages 6–9. Every minute of the game competes with that hour.
- **Playing together helps, but rarely happens on its own.** Research on joint media engagement: children learn more when an adult joins. Co-play seldom happens unless a parent makes it happen, and children sometimes push back against a parent joining. The parent's attitude is the strongest predictor of playing together.
- **The product is built for solo play.** STRATEGY.md: »A child of 7–8 must be able to play alone«; the main path is »Igraj sam«; the help fades so the child needs no one. The landing page says »Igrajte skupaj« in one block only.

## The hypotheses
| # | Hypothesis | Supported if | Refuted if |
|---|---|---|---|
| **H1 · Duo** | The game works best as a **shared ritual**: a parent and a child of 7–8 play together, 10–20 minutes, a few times a week. The parent is a user too. | ≥ 50 % of answered sittings are »z odraslim«; duo devices return more than solo ones; parents describe it as »naš čas«. | Most sittings are solo even in families who chose the game; parents say they don't have time to sit with it. |
| **H2 · Supervised solo** | The parent **chooses and allows** it, the child plays alone, and the parent wants proof it's worth the screen time. | Most sittings are solo, return is good, parents ask for a progress view, not for a joint mode. | Parents who let the child play alone don't value it more than any other game. |
| **H3 · Screen-time objection** | Engaged parents' first objection is screen time, and »paper first, then 10 minutes of reading on the screen« lowers it. | ≥ 1 in 2 interviewed parents raise screen time unprompted; the paper leaflet converts better than the message without paper. | Parents don't mention screen time; the objection is something else (price, trust, »my child doesn't want to read«). |
| **H4 · Reading pull** | A child of 7–8 asks to play again (pulls the parent back), because of the story and the weekly new case. | ≥ 25 % of devices come back 7–14 days after the first visit; parents report the child asked. | Return < 10 %; parents had to remind the child. |
| **H5 · Teachers as endorsers** | A teacher's recommendation for home (like a book for domače branje) moves parents. | A teacher-handed leaflet code converts at least as well as the other places. | It converts worse, or teachers won't hand it out. |

H1 and H2 compete. The plan must be able to tell them apart: that is the main job of the »Kdo igra danes?« question (ANALYTICS.md §2).

## The scorecard
Starting thresholds, set before the data comes in so we can't move them afterwards. With tens of families the numbers are **directional**; the interviews say why.

| Stage | Measure | Target | Source |
|---|---|---|---|
| Reach | Leaflets handed out, per place | 1,000 in total | the distribution log (LEAFLET.md) |
| Interest | QR scans ÷ leaflets, per code | ≥ 5 % | `land` with `src` |
| Activation | Of the devices arriving, the share that solves the leaflet room or the first real case in their first sitting | ≥ 50 % | `paper`, `solved` + `n = 1` |
| Return | Devices that come back 7–14 days after their first day | ≥ 25 % | `sitting` with `age` |
| Depth | Devices that finish one December season | ≥ 15 % | `solved` with `done` |
| Who plays | Answered sittings »z odraslim« | report it (H1 vs H2) | `with` |
| Install | Devices that open from the Home Screen | ≥ 20 % of returners | `install`, `/home/` |
| Worth it | Parents who say the game was worth the screen time (debrief, after a season) | ≥ 70 % »da« | `survey` |
| Panel | Test families recruited for the holidays | 15–30 | the producer's list |

**North star (from now on):** reading sittings per family per week, with the share played together next to it.

## The December plan
1. **The leaflet** (LEAFLET.md): one Skrivnostne sobe room on paper, solved at the kitchen table, checked by scanning the QR code, which opens more rooms and the detective game. Two message variants and one code per place, so every leaflet is also a channel test and a message test.
2. **The printable** on the landing page: »Natisni uganko« for parents who prefer paper. How many choose print over play is a direct measure of H3.
3. **Test families** (RESEARCH.md): 15–30 families recruited by hand from the producer's network (no e-mail sign-up, producer 2026-11-20), for »Detektivske počitnice« (12-22 to 01-04): a short interview before, a 1-minute diary card after each sitting, an interview after. The diploma on 12-31 is the reward for finishing.
4. **The analytics** (ANALYTICS.md): who plays, return, source, sitting length, the parent's survey. **Privacy page first**, then the code.
5. **The landing page:** a December version for parents, built for H1 vs H2 (two variants of the hero, selected at random); the copywriter writes it after the first five interviews, not before.

## Timeline
| When | What | Who |
|---|---|---|
| 11-20 → 11-24 | Producer approves this plan. LEGAL.md open points 1–2 settled (publisher, contact e-mail): **needed before any sign-up form or printed leaflet.** Analytics spec reviewed by the trust reviewer; privacy page updated; developer builds §1–§4 of ANALYTICS.md. | strategist, trust reviewer, developer, producer |
| 11-21 → 11-26 | The leaflet room designed (`kjekdo-design.mjs`) and checked; leaflet copy for variants A and B; layout in Claude Design; first 5 parent interviews (screen time, routines). | puzzle designer, copywriter, Slovenian editor, producer |
| 11-27 → 11-29 | Print (A5, 1,000 copies: 500 A + 500 B). Distribution places agreed (permission asked). | producer |
| 11-30 → 12-08 | **Wave 1** around Miklavž (12-05/06): libraries, paediatric waiting rooms, children's bookshops, toy shops, December fairs, kindergarten notice boards (with permission). | producer |
| 12-09 | **Mid readout:** scans per code, activation, first »Kdo igra« answers. Move the remaining leaflets to the places that work. | growth lead |
| 12-09 → 12-20 | **Wave 2**; sign-ups for the panel close 12-20. | producer |
| 12-22 → 01-04 | Detektivske počitnice with the test families (diary study). | researcher, producer |
| 01-05 → 01-11 | Exit interviews; **readout and decision:** H1, H2 or neither → product direction (studio: editorial director, developer) and the January marketing plan. | strategist, researcher, growth lead, producer |

## Decision rules for January
- **H1 wins:** build »Berimo skupaj« (a mode for two: who reads which line, a question for the parent after each case), and reposition the landing page and STRATEGY.md around the shared ritual.
- **H2 wins:** keep solo play, add a parent's weekly view (»Ta teden: 3 sedenja, 34 minut, 120 prebranih stavkov«), and market proof of value.
- **Neither is clear:** run the January cohort with the duo mode as an A/B in the game itself.
- **H4 fails** (no return): the problem is the product, not the marketing. Stop growth work and go back to the playtests.

## Risks
- **Too few answers** to »Kdo igra danes?«: also read the proxies (debrief opened, time of day, sitting length) and lean on the interviews.
- **Leaflets that never reach parents** (left in a pile): one person per place, and a place that brings zero scans in a week gets its leaflets moved.
- **Privacy:** every new field changes the promise on the privacy page. Nothing ships before the page says it.
- **Seasonal bias:** December families are not January families. Read the results as »holiday behaviour«.

## Readout
*(after 12-09 and after 01-11)*
