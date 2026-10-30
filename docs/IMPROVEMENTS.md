# From "fun on day 1" to "can I play the detective?" every day

How to make the solo detective game exciting after the first day. The ideas come from five expert reviews done on 2026-10-29: kids' learning apps, adult detective games, board and card games, video game design, and child reading development. All of them were checked against our 12 cases.

**Status (2026-10-30):** the first prototype case is built. It is case 1 of 👾 *Skrivnost v zračniku* and includes:
- the phone call
- searching the scene, with the 🔦 torch
- crossing suspects off with a sentence
- the newspaper with a stamp and sounds
- the culprit's excuse
- ranks
- the corkboard card
- the next-visit letter

Its case data also fixes the patterns from §2: an innocent animal suspect, no "likes it" decoy, and every suspect gets a sentence. Not built yet: the other steps (UGOVOR!, timeline, thinking screen, cipher, questioning), the office screen, Primer dneva, and the parent mode.

## In short

1. **Several cases can be solved without reading the proof.** A sharp 7-year-old learns the patterns after 3–4 cases (see §2). That is the hidden reason it "feels the same". We fix the cases and make the checker enforce it.
2. **One screen, one move.** Every case is: read a list → tap a face → tap a sentence. Real detectives *search, question, cross people off, catch a lie, and put events in order*. Every case becomes 2–3 **investigation steps** chosen from a set of 8 kinds, so no two cases play the same way (§3).
3. **The stories don't connect.** Each adventure becomes a **season** with one big mystery: a calling card in every case, pinned on a corkboard, unmasked in the final case (§4). A client who calls for help opens each case. Thank-you letters arrive the next day.
4. **Solving has no "wow".** We add a "DOKAZ!" stamp, a newspaper headline with the child's name, and tiny sounds (§5).
5. **The office grows, and each new tool unlocks a new kind of case.** Unlocks depend on cases solved, not calendar days, so there are never streaks to lose (§6).
6. **Later:** an endless "Primer dneva" built from a small pool of sentences (§7), and a "Glavni inšpektor" mode where a parent or sibling plays a witness (§8).

All five experts, working independently, put the **season arc** first. Four of five suggested **tools** and **crossing suspects off**.

---

## 1. What the five experts agreed on

| Idea | Kids' apps | Adult detective games | Board games | Video games | Reading expert |
|---|:-:|:-:|:-:|:-:|:-:|
| One connected mystery per adventure, unmasked at the end | ✔ | ✔ | ✔ | ✔ | ✔ |
| Detective tools that reveal hidden clues (🔦 🔍 🔴👓) | ✔ | | ✔ | ✔ | |
| Crossing off suspects (elimination) | ✔ | ✔ (Murdle) | ✔ (Outfoxed!, Guess Who) | | ✔ |
| Questioning witnesses | ✔ | ✔ (Ace Attorney) | | | ✔ |
| Searching the scene for clues | | ✔ | ✔ (MicroMacro) | | |
| A new short case every day, with no streaks | ✔ | | ✔ | ✔ | |
| Juice: stamp, newspaper, sounds | ✔ | | | ✔ | |
| Rank, office and gadgets | ✔ | ✔ | ✔ | ✔ | ✔ |
| Putting events in order (timeline) | | ✔ | | | ✔ |
| A parent or sibling plays along | | | ✔ | ✔ | ✔ |

---

## 2. First fix the "tells": cases that can be solved without reading

The reading expert found these patterns. I checked each one against the cases.

| Tell | Where | What the child learns |
|---|---|---|
| The suspect who **likes** the thing is never the culprit | v1 s3, v3 s3, v4 s6, v5 s2, k1 s2, k5 s4, k6 s3 | "Likes it" means "not them". |
| Every innocent suspect gets a "busy elsewhere" sentence, and the culprit doesn't | v1, v2, v4, k1, k2, k3 | Pick the one with no alibi, without reading the proof. |
| An animal appears among the suspects only when it did it | v3 (Kiki), k3 (Meta) | 🐭 or 🐐 among the suspects means the animal did it. |
| In slip cases, only the culprit speaks twice | v4 (reče + doda), k4 (reče + vzdihne) | Pick the one who talks most. |
| In alibi cases, innocent suspects are vouched for by a witness and the culprit isn't | v5 s8, k5 s6 | Pick the one with no witness. |
| The proof is the only sentence that joins a name to the object, often with "samo" | v6, k6 | Look for "samo". |
| Every question is "Kdo je …?" and there is always one culprit | all | Nothing is ever surprising. |

There are also two fairness bugs:
- **v2:** Tim's sweat would float in space too, so "poten" (sweaty) is a fair competing trace.
- **v5:** An empty cabin proves that Tim lied, not that he took the camera. A linking sentence is missing.

**Fix.** These go into the case-writing rules, and `tools/cases.mjs` checks them per adventure:
- In at least one case, the suspect who "likes it" **is** the culprit.
- The culprit has an alibi too (a false one), at least from rung 3 up.
- In ≥ 1 ordinary case, an animal is a **suspect but innocent**.
- Innocent suspects also speak twice.
- "samo" is used in at most one case as the proof, and also appears in neutral sentences.
- Questions vary: *Kje je …? Kaj se je zgodilo s …? Kdo NI mogel …? Kdo laže?* Sometimes nobody did it ("Babi je pozabila").

Cost: about 1 evening, mostly rewriting.

## 3. Investigation steps: the main change to the core game

A case stops being "one list, one tap". It becomes **2–3 steps** chosen from a set of moves. Each move trains a reading skill. All of them are emoji + CSS + short sentences.

| Step | What the child does | Example (≤ 8 words) | Reading skill | Inspired by | Cost |
|---|---|---|---|---|---|
| 🔍 **Preišči prizor** (search the scene) | A room of 6–9 emoji objects. Tapping one turns it over and shows one sentence, which goes into the "Žep" (pocket). There are 3–5 magnifier taps. | 🪴 »Pod solato je moker madež.« | finding what matters | MicroMacro, Detective: A Modern Crime Board Game | M |
| ❌ **Prečrtaj** (cross off) | Read a clue, then tap ✖ on everyone it rules out. The portraits turn grey with a stamp. | »Tat ima dolg rep.« | elimination, "ne" / "samo" | Guess Who, Outfoxed!, Murdle | S |
| 🗣️ **Zasliši** (question) | Tap a suspect and pick 1 of 2–3 questions. The answer is a sentence. | »Kje si bil po kosilu?« – »V kuhinji.« | asking good questions | Carmen Sandiego, Chronicles of Crime | M |
| ❗ **UGOVOR!** (objection) | The witness speaks line by line (◀ ▶). Pick a card from your pocket and slam a big red "UGOVOR!" on the line it contradicts. | Tim: »Ves dan sem spal.« + 🚪 »Kabina je bila prazna.« | spotting contradictions | Ace Attorney | M |
| 🔦 **Skrit stavek** (hidden sentence) | One key sentence is dark, blurred or tiny. You need the tool: 🔦 light, 🔍 magnifier, 🔴👓 red glasses. | »Na vratih je droben zelen odtis.« | (excitement, close reading) | spy kits, Clue Jr. | S |
| 🕐 **Časovnica** (timeline) | Drag 3–4 event cards into order. | »Najprej … Potem … Preden …« | time and cause | Golden Idol, reading research | S–M |
| 🧩 **Razmišljanje** (thinking screen) | A sentence with blanks and word chips: `[___] je vzel [___], ker [___].` If 2 of 3 are right: "Skoraj!" | »Tim je vzel kamero, ker je hotel slikati Luno.« | explaining *why* | Golden Idol | M |
| ✉️ **Šifra** (cipher) | Decode 3–5 words with an emoji alphabet or a reversed word. | 🐄🌙🍎 → »KLJUČ JE POD KORITOM« | decoding, fluency | escape rooms for kids | S–M |

The existing "tap the face + tap the proof" stays as the **accusation**, which is always the last step. The difficulty ladder (fact → trace → slip → alibi → pair) stays as the *thinking* ladder. The new steps change what the child *does*. Rules for writers and the checker:
- No two neighbouring cases use the same steps.
- Every adventure uses at least 5 of the 8 steps.
- Slip and alibi cases use **UGOVOR!**, so catching a lie finally feels like catching a lie.

A case gains one field: `steps: ['search', 'crossoff', 'accuse']`. Sentences gain optional `obj` (the emoji they hide behind), `who` (the witness who says them) or `hidden: 'light'`. The current sentence list can stay as it is; the steps only show it in a different way.

## 4. A season that holds together: one big mystery per adventure

**🚀 Vesoljska postaja: "Skrivnost v zračniku" (the mystery in the air vent).** Small shiny things keep vanishing, and at night something in the vents goes "pip-pip". Each case solves its own small mischief as before. In addition, it **pins one clue card** to the 📌 corkboard, with a red string to the last card and a "tap-tap" animation. The final case can only be solved with all the cards. The answer is warm: a tiny lost alien 👾 **Bip** is borrowing shiny bits to build a transmitter and call home. The crew helps.

| # | Small case | Steps | Card for the board |
|---|---|---|---|
| 1 | Who opened the snack cupboard? (Tim, sticky fingers) | 📞 call → 🔍 search → accuse | 🟢 »Na vratih je droben zelen odtis.« (too small for the crew) |
| 2 | Who was where during the blackout? (Robi, charging) | ❌ cross off → accuse | 🔢 »Šifra skladišča je 3-1-4.« + »Iz zračnika piska: pip-pip.« |
| 3 | The cheese is gone. *We know it was Kiki.* »Kiki pravi, da ni bila ona. Dokaži!« | 🎬 we see who did it first (Columbo-style) → proof | ✨ The shiny spoon vanished too. A mouse can't carry a spoon. |
| 4 | Ela says she never touched the antenna. | 🗣️ question → ❗ UGOVOR! | 📡 »Z antene manjka srebrna žica.« The storeroom opens with the code from case 2. |
| 5 | A morning mix-up: 3 small mysteries at once, confirmed only when all 3 are right | ❌ + accuse ×3 | 🗺️ All the missing things were near a vent. |
| 6 ⭐ | **Kdo zbira bleščeče stvari?** (Who is collecting shiny things?) | 🧩 thinking screen + 🕐 timeline of Bip's night | 👾 Bip waves from the vent: »Bip je poklical domov! 🛸« |

**🐄 Kmetija: "Lisica na kmetiji?"** (a fox on the farm?) Night footprints, eggs gone, a sock missing… all signs point to a fox 🦊. In the end it is a **lost puppy** 🐶, and Nik and Pia get to name it. The puppy could become a new sidekick.

To make every case feel like a request for help, the case board shows 📞 **ringing** on the next case. The client speaks first: »📞 Zvoni! Pia kliče: »Moja kapa je izginila!««. After a solved case, the next visit brings 📬 **a thank-you letter** from the client, sometimes with a sticker. Past culprits come back: »Robi spet ne pozna rdečega gumba …«.

**What about the current 12 cases?** We keep them as the base and fix the tells (§2). The story thread, the cards and the new steps go on top. That means rewriting, not throwing away.

## 5. Make solving feel like a win ("juice")

- **Accuse:** the chosen face pops (scale 1.15), the others dim, and a short drum roll plays.
- **Correct proof:** a 🔍 circle zooms onto the sentence and the key words glow. Then a red rubber stamp **»DOKAZ!«** slams down (rotated −8°, from 3× to 1×), with a small screen shake and a thud.
- **Solved:** a newspaper spins in: **»ZAPRT PRIMER! Detektivka Ana ujela Robija«**, with the child's ID-card picture as the photo. Confetti in the adventure's colours, and the sticker flies to the board.
- **Caught:** the culprit blushes and wobbles 😳 and says one funny excuse.
- **Wrong:** a soft wobble and a gentle "hmm". Never a red X or a buzzer.
- **Sound:** 5–6 tiny sounds made in WebAudio, with no audio files: ring, stamp, lamp click, lock click, fanfare, whoosh. Add a mute switch, and respect the device's reduced-motion setting.

Cost: S, about 1 evening. **This is the cheapest big win.**

## 6. A detective office that grows, where tools unlock new kinds of cases

The case board becomes **the office** (a CSS room), and it fills up as the child solves cases. The child gets a rank, and a new tool comes with each rank. **Each tool unlocks a new kind of case** (like new items in Zelda), not just a decoration.

| Rank (cases solved) | New in the office | Now possible |
|---|---|---|
| Vajenec 🔰 (0) | desk, 🔍 magnifier | search the scene |
| Detektiv 🕵️ (3) | 📌 corkboard, 📇 Kartoteka | season cards, suspect cards with a "ULOVLJEN" (caught) stamp |
| Višji detektiv ⭐ (6) | 🔦 torch on the hook, 🏆 trophy shelf | dark cases, replaying the newspapers |
| Inšpektor 🎖️ (10) | 📞 phone, 🗣️ interview chair | questioning and UGOVOR! |
| Glavni inšpektor 👑 (15) | ✉️ cipher box, 🗺️ map | cipher cases, a new adventure door |

- **Kartoteka:** a card per character, with facts learned in the cases ("Ima rad borovnice"). Empty outlines pull the child forward, like a Pokédex.
- **Sealed envelopes** ("NE ODPIRAJ pred 3 rešenimi primeri") deliver each new tool with a little ceremony: the envelope tears open and a sticker comes out.
- Unlocks depend on **cases solved**, never on calendar days. A missed day costs nothing.
- Earned hats and gadgets go on the ID card. Promotions get a stamp sound and the ID card flips over.

## 7. Later: "Primer dneva" (a new case every day without writing new text)

This idea comes from Outfoxed!: the clues stay the same, and **the answer is dealt anew each time**.

**What we write once:** per place, about 8 traits with 3 values each (🥾 muddy boots, 🍓 red fingers, 🌾 hay in the hair, "was in the barn"). Each value gets two sentences:
- a scene clue with no name: »Tat ima seno v laseh.«
- a witness line with the name in the nominative only: »{ime} ima seno v laseh.« Keeping the name in the nominative avoids Slovenian case endings.

Add about 10 story openings. That is roughly 70 short sentences per place.

**What the game does each day, using the date as the seed:**
1. It deals traits to the cast and picks a culprit.
2. A small solver picks clues so that **exactly one** suspect fits, adds one near-miss decoy, and builds the hints by itself.
3. The result is thousands of different days, and a pattern can't be learned by heart.

The cases appear in the office 📬 as "Pismo dneva" (the letter of the day). There is **no streak**: missed letters wait in the mailbox.

Cost: L, about 3–4 evenings. Do it after §2–§6 have shown what the kids like.

## 8. Playing together

- **Glavni inšpektor:** at a 🗣️ question step, a "Daj telefon inšpektorju" screen shows the parent the witness's lines with an acting tip ("Beri jezno, kot Dedek"). The child asks and the parent answers in character. This is cheap, the kids love it, and it is dialogic reading.
- **Razloži šefu** (explain to the boss): before the newspaper, the child explains *why* aloud, and the parent taps ✔. Explaining strengthens the inference.
- **Dva detektiva** (siblings): the clues are split into two hands, and you pass the device. Each child must read their sentences **aloud** to the other. This reuses the idea from the co-op plan.

## 9. Guardrails

- **Reading stays the core.** Every tool, coin and stamp must lead to a sentence that has to be read. Mini-games must never replace the reading.
- **Fair play:** every season mystery can be solved from cards the child already has. Every decoy is disproved by a sentence on the screen, never by outside knowledge.
- **No streaks, timers that punish, notifications or guilt.** The office chief is warm and never sad. After 2–3 cases: »Dober dan za detektiva! Nadaljujemo jutri?«
- **Hints never cost** H3 or the assisted step. Nothing is ever taken away.
- Same privacy as now: everything stays on the device.

## 10. What the first 10 play sessions would look like

| Session | New |
|---|---|
| 1 | ID card, practice case, case 1 with 📞 a call, 🔍 search, the stamp and the newspaper. The first 🟢 card goes on the corkboard. |
| 2 | 📬 a thank-you letter from Tim; ❌ crossing off; the second card plus a "pip-pip" from the vent. Rank: Detektiv. The corkboard and Kartoteka open. |
| 3 | A Columbo-style case: "we know it was Kiki, prove it!" |
| 4 | ✉️ an envelope with the 🔦 torch; the first dark sentence. |
| 5 | 🗣️ questioning and the first **UGOVOR!**; the keypad code from case 2 opens the storeroom. |
| 6 | The morning mix-up (3 mysteries at once). Rank: Višji detektiv. |
| 7 | ⭐ The final case: unmasking Bip, the thinking screen, the timeline. 🏆 the first trophy. |
| 8 | Farm season: "Lisica na kmetiji?" starts with a phone call from Babi. |
| 9 | 🔴👓 red glasses; Glavni inšpektor mode (the parent plays Dedek). |
| 10 | … the puppy is found, and the child gives it a name. |

## 11. Roadmap

| Phase | What | Effort | Why first |
|---|---|---|---|
| **1. Feel and fairness** | §5 juice, §2 tells + checker rules, 📞 client call, 📬 letters | ~2 evenings | Cheapest, and it fixes the hidden cause. |
| **2. Space season** | Corkboard + calling cards, rewrite the 6 space cases into "Skrivnost v zračniku" with 3 new steps (🔍 search, ❌ cross off, ❗ UGOVOR!), 🔦 hidden sentence | ~4 evenings | Proves both the story thread and the new steps. |
| **3. Office and ranks** | the office screen, ranks, envelopes, Kartoteka, the remaining steps (🕐 timeline, 🧩 thinking screen, ✉️ cipher, 🗣️ question) | ~3 evenings | Gives a reason to come back. |
| **4. Farm season** | "Lisica na kmetiji?", Glavni inšpektor mode | ~3 evenings | |
| **5. Primer dneva** | the trait generator and solver | ~3–4 evenings | Endless replay once we know what works. |

**How we'll know it works:** the log already records sessions. We watch whether there is a session on day 2 and on days 5–7, how many cases are played per session, and how often "Še en primer" is tapped. The parent watches whether the kids **ask** to play and whether they **talk about** Bip or the fox away from the device.

## 12. Decisions for you

1. **Start with phase 1 + 2?** That means juice and fixing the tells, then the space season with Bip. Or would you rather go straight to the generator (§7)?
2. **The story for space:** Bip the lost alien, or your own idea? And for the farm, the lost puppy?
3. **How far to change the existing 12 cases:** rewrite the space cases into the season (recommended) and fix only the tells on the farm until its season comes?
4. **Parent mode:** do you want the "Glavni inšpektor" moment, where you act a witness?
5. **Siblings:** do both kids play on one device sometimes? If yes, "Dva detektiva" moves up.
