# Prompt for Claude Design: Detektivska pisarna

Paste everything below the line into Claude Design. Attach the screenshots listed under "Attachments" (from `solo/shots/`) and, if it accepts code, `solo/index.html`.

---

## Who you're designing for

**Detektivska pisarna** ("The Detective Office") is a Slovenian detective **reading game for children aged 6–9** (core: 7–8, first and second grade). The child is the detective: they get a phone call from a client, search the scene, question people, solve a small puzzle, cross off the innocent and name the culprit by **tapping the sentence that proves it**. The game is a disguised reading lesson: every answer is found by reading a sentence, never by guessing.

Think about the player concretely:
- They read slowly, sound out words, and lose their place in long text. A screen with more than ~4 sentences visible feels like homework.
- Many can't read the instructions reliably, so they skip them and start tapping. (We measured this; it's why every step now opens with an instruction card.)
- They tap fast and often, with imprecise fingers, on a parent's phone or a family iPad, often lying on a sofa.
- They are proud of being "a real detective". Ranks, an ID card with their picture, stamps and a newspaper headline with their name matter a lot.
- They are easily discouraged by red X's, buzzers or "wrong!". They are delighted by a stamp slamming down, a character blushing, a card flying onto a board.

**The design job:** make the game look and feel like a warm, funny, slightly mysterious detective world a 7-year-old wants to come back to, and make every screen easier to read and play. Today it is functional but looks like a generic web form: cream background, white cards, one blue button, system font, emoji as all the art.

## Tone

Cosy mystery: Agatha Christie's village seen through a 7-year-old's eyes. Small places, small mysteries that feel big. **Funny and warm** (every culprit has a kind or silly excuse; the ending is always forgiveness and something nice). **A little spooky is fine, scary is not** (eyes blinking in a vent, a "ghost" in a museum at night, always friendly in the end). No crime aesthetics: no blood, police tape, guns, mugshots, handcuffs, or noir darkness.

## Hard rules (please don't design these away)

1. **No pressure mechanics.** No timers shown to the child, no lives/hearts, no scores, no streaks, no leaderboards, no losing anything. Ranks only go up.
2. **No punishment for wrong taps.** A wrong try gets a gentle note and, after more tries, a stronger hint (a 4-step hint ladder: note → hint text → something lights up → the answer pulses). Never red "wrong" states, shake-of-shame, or buzzers. Celebrate the right answer; be calm and helpful about the wrong one.
3. **Reading comes first.** Text is the gameplay. Sentences must be big (currently 24px rows, min 56px tall), high-contrast, short lines, generous line height, one sentence per row/card. Character names in sentences are **bold**. Nothing that animates over or behind text while the child reads.
4. **Audio only on tap.** Tapping a sentence reads it aloud (pre-recorded). Design a clear, consistent "this can be read to me" affordance and a "now playing / already heard" state (currently a pale blue `--heard` fill). Picking a sentence for an answer is a *different* state (yellow `--sel`) and must look clearly different from "heard".
5. **Tap targets ≥ 56px**, with space between them. Two-step interactions are common ("tap a sentence, then a face"), so the "I'm holding this sentence" state must be unmistakable.
6. **Slovenian text, verbatim.** Keep all UI strings as given (with diacritics Č Š Ž and the Slovenian quotes »…«). Layouts must survive long Slovenian words (e.g. *Preiskovalka*, *Pustolovščine*) without breaking mid-word or overflowing.
7. **Art must scale to new seasons.** A new 6-case season (new place, new cast of ~6–8 people, new objects) is written by AI agents every few weeks, without an illustrator. So the visual system must work with **emoji or a small, reusable set of shapes/frames/colours per season**, not bespoke illustrations per case. Propose how a season gets its own "skin" (colour, pattern, header motif, one hero emoji) from a few parameters.
8. **People, not animals, are suspects.** Suspects are shown as round face avatars (person emoji on a coloured circle). Witnesses (not suspects) have a 👁️ and a dashed border.
9. **Implementation reality:** one HTML file, plain CSS + vanilla JS, no frameworks, no external fonts or images required (it must work offline from the Home Screen). Deliver designs I can translate to CSS: tokens (colour, type, radius, shadow, spacing), component specs and states. A web font is OK only if you also say what the system-font fallback looks like.

## Devices

- **iPhone upright** (390×844, iPhone 14) is now the most common: kids get a link on a parent's phone. Design here first.
- **iPad** (820×1180, portrait and landscape): the original target; use the space, don't just stretch.
- **Landscape phone** (844×390): must stay playable; the main action button must never be off-screen.
- Keep 32px+ clear at the top on phones (iOS status-bar blur), and respect the bottom safe area.

## Current palette and type (to evolve, not necessarily keep)

```
--bg #fdf6e9 (cream)   --ink #2b2a33   --muted #6b6876   --card #fff   --line #e6dcc8
--accent #3d6fd8 (blue, primary button)   --heard #eef3ff   --sel #ffe9a8 / --sel-line #e0a800
--good #dff3e6   --warn #fff1cc   --bad #fbe0dc   --danger #c0392b
Font: system sans 20px/1.4; sentence rows 24px. Newspaper masthead: Georgia. Typed corkboard pages: Courier. Thank-you letter: Chalkboard / Comic Sans.
```

## The world and its recurring objects

These are the "props" of the brand; they should feel like one detective kit:
📞 the phone call · 📹 the security camera · 🔍 the magnifier · 🔦 the torch · 🖍️ the pencil rubbing · 👝 the evidence pocket · 📌 the corkboard with red string · 🪪 the detective ID card · 📰 the newspaper · 📬 the thank-you letter · 🏅 medals · stamps (»Primer rešen!«, »UGOVOR!«, »NAPAČNA SLED!«) · 🟨 the referee's yellow card · 🦉 Babica the owl, the coach.

Seasons so far (each is one place with one big mystery over 6 cases): 🚀 space station (with Bip 👾, a tiny alien in the vent), 🐄 grandma's farm, 🌊 seaside, 🦕 museum at night, ⚽ football tournament (»Skrivnost zlatega pokala«).

## Screen inventory and states

Please design every screen below with its states. Real copy is in quotes.

### A. Getting in
1. **Start page** (outside the game): title, one big »Igraj!« button, a small »Za odrasle ▾« for adults, SL/EN switch, an "add to Home Screen" pill.
2. **»Kdo igra?«** (who's playing): one card per detective on this device (picture, name, rank, solved count) + »Nov detektiv«. Shown only with 2+ detectives.
3. **Detective ID card creation** (first launch): choose avatar (detektiv / detektivka, several skin tones), a sidekick, an optional name. Result: a 🪪 ID card with picture, name and rank. This card reappears later (rank-ups, finale book cover), so it should be iconic.
4. **Practice case** with the owl coach 🦉: screen dims, a thick yellow ring breathes around what to tap, a finger 👆 bounces at it, the owl says one short line. Design the coach overlay as a reusable component.

### B. Choosing what to play
5. **Adventures screen (»Pustolovščine«)**:
   - A big **hero card**: »▶ Nadaljuj« (continue the last adventure) or »▶ Začni« (start one).
   - Other adventures: started (progress e.g. 3/6), new (tag »NOVO«), seasons tagged »🔎 skrivnost«.
   - **»🏅 Moje medalje«** shelf: finished adventures as medals; a newly earned one flies onto the shelf.
   - **»📅 Kmalu nove pustolovščine«**: teaser cards for unreleased seasons (icon, title, a one-line teaser question, countdown »⏳ Še 7 dni« / »Jutri!« / »Kmalu«). Tap only wiggles. Should create anticipation.
   - 👥 button to switch detective; the rank and ID card visible somewhere.
6. **Season board** (one adventure): title + progress (»✔ 0 / 6«), then:
   - **📌 Corkboard of the big mystery** (»Kam je izginil zlati pokal?«): one pinned card per solved case, red string connecting them, empty slots »?«; from 2 cards on, eyes 👀 blink in a vent (tap → »pip-pip!«). After a solved case the new card flies on, the string draws, and the detective "thinks out loud". Midway it asks a **guess** question with 3 choices (»Kaj misliš, kdo …?«), later »Ali še vedno tako misliš?« (👍 Da / 🔄 Spremenim).
   - **Case cards** 1–6: number, emoji, place tag, the question (»Kdo je ob osmih porisal žoge?«), difficulty as 🔍–🔍🔍🔍🔍🔍. States: **open**, **suggested** (glows), **solved** ✔ (replayable), **locked** (»Odpre se po primeru 1.«), **final** (»⭐ Veliki primer«), **coming soon** (»Kmalu nov primer«).
   - »← Pustolovščine« and »Dovolj za danes« (stop for today).
   - Known problems (see the board screenshot): the title and the 0/11 counter wrap badly; the empty corkboard is a big dead brown box; locked cards repeat heavy grey text; the board reads as a form, not a detective's wall.

### C. Inside a case (the core loop)
A case is a sequence of steps, e.g. `call → ask → when → solve` or `call → words → scene → lie → solve`. Every step shares a frame: the case question on top (»❓ Kdo je med tekmo zabil skrivni gol?«), the step instruction with a blue ? (reopens the instruction card), the content, and a bottom bar with ← (back one step), the 👝 pocket counter (»0 / 9«) and the main button to the next step (disabled until done, e.g. »Kdaj? ⏰«, »Je vse res? ❗«, »Vem, kdo je bil!«). Design this **step frame** once, plus a **step progress indicator** (there is none today; a child should see "I'm on step 3 of 5").

Shared overlays inside a case:
- **Instruction card** at the start of every step: step icon + name, the puzzle's own note, 👉 what to do, »Razumem ✓«. Background dimmed and blocked. (Today the dim is a heavy grey that makes the whole screen look disabled.)
- **Message card** at the bottom for a wrong try or a hint, »V redu«; tapping beside it wiggles it.
- **Green "done" card** when a step is complete (»Vse je preiskano«, »Vsi so odgovorili«, »Ostal je samo eden. Pokaži dokaz!«).

Steps:
7. **📞 Call**: the phone rings, a client's face and a short message asking for help. Optionally a **📹 security camera**: frames (emoji + caption) tapped through one at a time, one frame is blurry ("something small"). »Na kraj dogodka« on the last frame.
8. **🔍 Scene** (search the place): 3–8 objects as tiles (emoji + label); tapping opens a sentence that drops into the 👝 pocket. A **dark** object needs the 🔦 »Svetilka« tool; a **blank page** needs the 🖍️ »Svinčnik« tool (grey strokes sweep, white letters appear). States: closed, opened, dark, needs-tool, tool active. Today the objects float in a mostly empty screen; make it feel like a place.
9. **🗣️ Ask** (questioning): looks like a messaging app. Row of faces (suspects + 👁️ witnesses); tap a face, then a question chip; the question goes out as the detective's bubble, the suspect "types" (…), the answer arrives. Everyone must answer everything; show per-person progress. A suspect's claim about themselves is not proof.
10. **Puzzles** (one per case, gives a sentence into the pocket):
    - 🔤 **Word search** (»Osmerosmerka«): letter grid, tap first then last letter; found words turn green and are crossed off a list; leftover letters may glow into a secret sentence (geslo).
    - 🔐 **Code lock**: 3–5 wheels ▲▼ and »Odpri«; clicks open.
    - 🕐 **Timeline**: 3–5 mixed cards (Najprej / Potem / Nato / Na koncu), tap into slots, »Preveri«; right ones stay green.
    - ✉️ **Cipher**: symbols over empty slots, a key, letter tiles; a right letter fills every matching symbol.
    - 📜 **Torn note**: 3–4 paper strips to put in order.
11. **Reasoning steps** (one per case, before solve):
    - ❗ **UGOVOR** ("Objection!"): 1–3 💬 claims; tap a claim, then the sentence that breaks it. A red »UGOVOR!« stamp slams down, the liar blushes 😳, the truth arrives on its own card. First time ever: the owl coaches and a big red »UGOVOR! ❗« button asks the child to shout it out loud.
    - 🧭 **»Kam kaže sled?«** (red herring): 1–2 clue cards with an arrow 👉 to the face they point at; tap a clue, then the sentence that explains it away. The card flips, a blue »NAPAČNA SLED!« stamp lands, the arrow bends away, the face sighs 😮‍💨. Ends with a green »Vse sledi so preverjene«.
    - ⏰ **»Kdaj?«** (when): three bands ⏪ PREJ / ⏰ TAKRAT (with the deed's time) / ⏩ POTEM; tap a sentence card, then a band. Wrong-time cards get a referee's yellow card 🟨, a »NAPAČEN ČAS!« stamp and a whistle; the right time says »To šteje!«.
12. **❌ Solve** (»Kdo je bil?«): suspect faces on top, the pocket's sentences below. Tap a sentence, then a face. An alibi **crosses that face off**; the sentence becomes struck through. When one is left: »Ostal je samo eden. Pokaži dokaz!«, and proof + culprit solves it. Sentences carry tags from earlier steps (UGOVOR!, NAPAČNA SLED, 🟨). Hint ladder: note → hint → a sentence lights up → sentence and face pulse. The **crossing-off moment is the heart of the game**: make it satisfying.

### D. Rewards
13. **Solved screen**: a **newspaper** (season masthead, e.g. »NOGOMETNE NOVICE«) with a »Primer rešen!« stamp, the detective and the culprit, the headline »Detektivka Ana je ujela Bora!« (the child's own name), then the culprit's funny excuse on its own card (»Bor pravi: »Meee! Tudi jaz sem Kozica!««), a **rank-up** when earned, and »📌 Nov namig na tabli skrivnosti!« with the new corkboard card. »Naprej«.
14. **Ranks**: 🔰 Vajenec (0) → 🕵️ Detektiv (3) → ⭐ Višji detektiv (6) → 🎖️ Inšpektor (10) → 👑 Glavni inšpektor (15). Design the rank-up moment and how rank shows on the ID card.
15. **📬 Thank-you letter**: arrives on the next visit, handwritten style, from the client.
16. **Season finale**: the mystery guest is unmasked (a 👀 »???« face turns into the real character); the corkboard reveals the answer and whether the child's guess was right. Then either a **book cover** with the child's ID picture and name as co-author, or a **cup ceremony** (a cup under a cloth, names light up one by one, the child's name last with a ⭐).
17. **»Še en primer?«** / »Dovolj za danes« end-of-session screens.

### E. Adults (low priority, functional is fine)
18. Adult gate (hold the top-left corner 3 s, then a sum), setup (age group, case order, sound check), debrief tables with green/amber/red cells and JSON export. Keep them visually separate from the child's world.

## What I'd like from you, in this order

1. **Design direction** (2–3 options, then one recommended): a mood, the detective-world metaphor (e.g. a detective's desk / case folder / corkboard), palette with light and calm accents, type scale tuned for beginning readers, how emoji sit inside the style, and how a season gets its own skin from a few parameters.
2. **Tokens and components**: colours, type scale, spacing, radius, shadows, and these components with all states: sentence row (default / playing / heard / selected / used-struck / tagged / pulsing hint), face avatar (default / selected / crossed off / witness / mystery »???«), primary and secondary buttons (incl. disabled), instruction card, message card, done card, stamp, step frame + step progress, pocket, case card (all 6 states), coach overlay.
3. **Core loop on iPhone**: board → call → scene → ask → one reasoning step → solve → solved newspaper. Show a wrong try with its hint and the right-answer celebration for solve.
4. **The rest**: puzzles, adventures screen, ID card and ranks, corkboard states, finale, letter, then iPad and landscape-phone layouts of the core screens.

For every animation (stamp, card flying to the corkboard, crossing off, unmasking), describe it in words with rough timing and easing so I can build it in CSS; keep them short (under ~1 s), skippable, and never covering text the child must read. Respect `prefers-reduced-motion`.

Before you design, tell me in a few bullets what you see as the biggest UX problems in the attached screenshots for a 7-year-old, and check your direction against the hard rules above.

## Attachments (from `solo/shots/`)

- `p2-iphone14-board.png`: the season board (corkboard + case cards)
- `p2-iphone14-call.png`: the phone call
- `m3-iphone14-scene.png` and `m3-ipad-scene.png`: search the scene, with the instruction card
- `p2-iphone14-ask.png`: questioning
- `p2-iphone14-when.png`: »Kdaj?«
- `m1-iphone14-herring.png`: »Kam kaže sled?«
- `m3-iphone14-lie.png`: UGOVOR
- `p2-iphone14-solve.png`: solve
- `p2-iphone14-reveal.png`: the solved newspaper
- one puzzle each: `g2-se-cipher.png`, `m5-iphone14-words.png`, `m4-iphone14-lock.png`, `m6-iphone14-order.png`, `p3-iphone14-torn.png`
