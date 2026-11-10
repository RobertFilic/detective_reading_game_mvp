# Prompt for Claude Design: the missing screens and a component sheet

Paste everything below the line into the Claude Design project »Detective Game Mobile App«. Attach the screenshots listed at the end (from `solo/shots/`).

---

## What this round is for

We're taking **»Detektiv v4 – Tiha lupa«** (4b), **»Onboarding«** and **»Landing Page«** in this project as the base for a facelift of the real game. This is a **facelift only**: no new features, no new steps, no new mechanics. Every screen below already exists and works in the game today. The attached screenshots show how they look now. Please redesign them in the v4 style so I can build them in plain HTML/CSS.

**The brand is »Bralni detektivi«.**

## Two changes to the v4 base

1. **No audio.** We don't use read-aloud at all. Please remove every audio affordance: no 🔊 coins, no 👂 »heard« state, no blue `--ear` »playing« fill, no »tap to hear« on titles. Tapping a sentence only selects it. `--ear` may stay as a plain secondary blue if a component needs one (for example the »NAPAČNA SLED!« stamp, which is blue, not red).
2. **The helper is the child's chosen sidekick** (🐶 🐱 🦉 🦊 from Onboarding), not always Babica 🦉. It sits in every hint bubble and in the coach overlay. 🦉 is the default.

## Please make first: one »Komponente« sheet

One page with every reusable part, each in all its states, built only from the v4 tokens. I'll turn each one into a single CSS class. When a new season or case is added later, it must be possible to build any screen from these parts alone.

- **Tokens:** colour (including how a season sets the band hue), type scale, radius, shadow, spacing, motion (the 4c table).
- **Season band** (top): with ✕/←, the step label, the progress line with the season ball, and the question. Also a short version without a question.
- **Sentence row:** idle / picked (deep season colour + 👆 coin) / svetel (gold ring) / marked words (`<mark>`) / used (struck through + face ✕ chip) / disabled. Also with a stamp chip (»To šteje!«, »NAPAČEN ČAS!«, »UGOVOR!«, »NAPAČNA SLED«, 🟨).
- **Face coin:** idle / picked / crossed off (pencil line) / hint pulse / witness (👁️, dashed) / unknown »???« / blushing 😳.
- **Object tile** (scene): idle / found ✓ / dark (needs 🔦) / blank page (needs 🖍️) / hint.
- **Tool toggle:** 🔦 Svetilka and 🖍️ Svinčnik, off/on.
- **Buttons:** main (66px), secondary, quiet, disabled-looking-but-tappable (»not yet«), small chip.
- **Cards:** instruction sheet (the bottom sheet you already have), note card at the bottom with »V redu«, green »done« card, the »truth« card (»Luka pove resnico:«), the excuse card (»Zoja pravi:«).
- **Helper bubble:** idle / gold rim when there's a hint.
- **Stamp:** red (»Primer rešen!«, »UGOVOR!«), blue (»NAPAČNA SLED!«), green (»To šteje!«). Small and big.
- **Coin, pill, counter** (»👜 4 / 9«), tag (»NOVO«, »📅 Kmalu«, »⏳ Še 3 dni«, »Jutri!«), lock 🔒.
- **ID card** (from Onboarding) and the small player chip used in the band.

## Then the missing screens (iPhone 390×844 first)

Every step opens with the instruction sheet (keep your v4 version). Wrong tries never show red or »wrong«: gentle note → hint text → something lights up gold → the answer pulses.

1. **Call with a security camera (📹 film):** after the call, the child taps through 3–4 camera frames (an emoji + one short caption each, one at a time, no timer). The last frame is blurry and shows »something small«. »Na kraj dogodka« sits in the camera's bar on the last frame.
2. **🗣️ Questioning (ask):** looks like a messaging app. The child taps a face, then a question chip. The question goes out as the detective's bubble, the person »types« (…), and the answer arrives as a bubble. Every person has to answer everything. Witnesses (👁️) answer too.
3. **🔤 Word search (words):** a letter grid (6×6 to 8×8, capitals, Č Š Ž one cell). The child taps the first letter, then the last; a found word turns green and is crossed off a list of emoji + word. Optional »geslo«: at the end the leftover letters glow and spell a sentence. The grid must fit an upright phone.
4. **🔐 Code lock (lock):** 3–5 wheels with ▲▼ and an »Odpri« button. It clicks open, then the »next step« button appears.
5. **🕐 Timeline (order):** 3–5 cards (emoji + short sentence) shown mixed; the child taps a card into the next slot (tap again to take it back) and presses »Preveri«. Right ones stay green; the others go back.
6. **✉️ Coded note (cipher):** a message in symbol cells, each with an empty slot under it, a key (symbol → letter), and letter tiles. The child taps a cell, then a letter; a right letter fills every cell with that symbol. One key pair may show »?«.
7. **📜 Torn note (torn):** 3–4 paper strips that make one sentence; works like the timeline (»Preveri«).
8. **❗ UGOVOR (lie):** 1–3 💬 claims (a person's own words, with their face) above the other sentences. The child taps a claim, then the sentence that shows it isn't true. Then the red »UGOVOR!« stamp, the liar blushes 😳, and the truth arrives as a card. The first time ever, a big red »UGOVOR! ❗« button asks the child to shout it out loud.
9. **🧭 Napačna sled? (herring):** 1–2 clue cards, each with an arrow 👉 to the face it points at. The child taps a clue, then the sentence that explains why it doesn't count. The card flips to show the explanation, a blue »NAPAČNA SLED!« stamp lands, the arrow bends away and the face sighs 😮‍💨. A green card »Vse sledi so preverjene« and »Vem, kdo je bil!« follow.
10. **Kdo je bil? with more states:** a sentence tagged 🟨 / UGOVOR! / NAPAČNA SLED, the »Ostal je samo eden. Pokaži dokaz!« moment, and a case that needs **two proofs** (»Eden je pravi!« stays green).
11. **📌 Mystery corkboard on the case board:** the case cards pinned with red string, a new card flying in, the detective thinking out loud, the »👀 zračnik« peek, and »typed pages« for some seasons. The **guess** question after case 3 (»Kaj misliš, kdo …?«, 3 choices with faces) and »Ali še vedno tako misliš?« (👍 Da / 🔄 Spremenim) after case 5. The final's answer (»Tvoj namig je bil pravi!« or not).
12. **Season finales:** the unmasking (»???« turns into the real one), the **book** ending (author's question → »Da!« → a book cover with the child's ID picture and name), and the **cup** ending (a cup under a cloth, »Odgrni prt!«, team names light up one by one, the child's name last with a ⭐).
13. **Start screen (adventures):** a hero card »▶ Nadaljuj« / »▶ Začni«, started and new adventures (»NOVO«), »🔎 skrivnost« tag, the »🏅 Moje medalje« shelf with a medal flying onto it, and »📅 Kmalu nove pustolovščine« teasers with a countdown. New adventures come out **weekly**. Please merge this with your v4 home (badge on top).
14. **Practice case with the coach:** a short classic case (4 sentences, 3 faces) where the helper coaches: the screen dims, a thick gold ring breathes around what to tap and a 👆 bounces at it. Screens: intro, story, »Kdo je bil?«, »Pokaži stavek, ki to dokaže.«, the solved screen.
15. **End of a session:** »Še en primer?« (Da / Dovolj za danes), »Nov primer pride kmalu!«, and the thank-you screen.
16. **Adult screens** (setup and the debrief table). These are for parents, so they can be plain and dense, but in the same tokens.
17. **iPad (820×1180, both ways) and a phone held sideways (844×390)** for the band, a sentence list with faces, the scene and one puzzle. The main button must never be off-screen sideways.

## Rules that still hold

- Ages 6–10, Slovenian text verbatim (Č Š Ž, »…«), long words must not break mid-word.
- No timers, lives, scores, streaks or red »wrong«. Ranks only go up (🔰 Vajenec/Vajenka → 🕵️ Detektiv/ka → ⭐ Višji detektiv/ka → 🎖️ Inšpektor/ica → 👑 Glavni inšpektor/ica).
- Tap targets at least 56px. Sentences at least 18px.
- Suspects are people, never animals.
- Works offline: Lexend will be bundled into the file, with Verdana as the fallback.
- Art is emoji on coins plus the season hue, so a new season needs no illustrator.

## Screenshots of the game today

**Already in this project** (`uploads/`, from the first round), the hotel case g1 on iPad and on a phone held sideways:
- iPad: `screens-…z5qw` board · `…hkwc` call · `…g6j3` UGOVOR · `…4ayk` solved · `…f74t` scene · `…rs02` Kdo je bil?
- Sideways phone: `…e323` board · `…pj3m` call · `…lgre` UGOVOR · `…pwj4` solved · `…raqm` scene · `…6fam` Kdo je bil?

**Attached with this message** (iPhone, from `solo/shots/` in the repo): `g2-se-ask.png` (questioning), `g5-se-words.png` (word search), `m4-se-lock.png` (code lock), `m6-se-order.png` (timeline), `g2-se-cipher.png` (coded note), `g4-se-torn.png` (torn note), `g1-se-lie.png` (UGOVOR), `m1-se-herring.png` (Napačna sled?), `g1-se-solve.png` (Kdo je bil?), `g1-se-board.png` (board with the corkboard), `g6-se-reveal.png` (solved screen with the book).
