# The studio: how new seasons get made

Detektivska pisarna is made by a small studio of Claude Code agents, with a human producer. The goal: **the most fun detective game in the world for children who are learning to read**, Agatha Christie for 7-year-olds. Every season is new, never a copy of the last one, and the detective work gets harder as the children grow.

## The team

| Agent | File | Owns | Never does |
|---|---|---|---|
| 🧭 **Editorial director** | [.claude/agents/editorial-director.md](../../.claude/agents/editorial-director.md) | the catalogue: the season brief (rung, reading knob, feeling, what to avoid, ship date), the review of the pitch against it, the direction after playtests, [STRATEGY.md](STRATEGY.md) | pitch the story, write cases |
| 🎬 **Showrunner** | [.claude/agents/showrunner.md](../../.claude/agents/showrunner.md) | the season: big mystery, red thread, cast, the skill it teaches, the final reveal | write case sentences |
| ✍️ **Case writer** | [.claude/agents/case-writer.md](../../.claude/agents/case-writer.md) | one case: its sentences, alibis, decoy, proof, call, reveal, letter, in the game's data format | change the season plan on its own |
| 🧩 **Puzzle designer** | [.claude/agents/puzzle-designer.md](../../.claude/agents/puzzle-designer.md) | the puzzle in each case, its difficulty and hint ladder; specs for new mechanics | build the mechanic (the developer does) |
| 🔎 **Fair-play tester** | [.claude/agents/fair-play-tester.md](../../.claude/agents/fair-play-tester.md) | proof that each case has exactly one answer, reachable by reading, with no pattern to game | rewrite the case itself |
| 📚 **Book editor** | [.claude/agents/book-editor.md](../../.claude/agents/book-editor.md) | voice and fun: every case is funny, warm, full of character and pulls the child into the next one (the fun checklist) | rewrite the case, change the logic |
| 🇸🇮 **Slovenian editor** | [.claude/agents/slovenian-editor.md](../../.claude/agents/slovenian-editor.md) | grammar, natural child-level Slovenian, reading load | change the plot |
| 📱 **UX reviewer** | [.claude/agents/ux-reviewer.md](../../.claude/agents/ux-reviewer.md) | what the child sees and taps, on a small phone, an iPad and a landscape phone | change content |
| 🛠️ **Developer** | [.claude/agents/developer.md](../../.claude/agents/developer.md) | building a new mechanic from the spec, with its checker rules, README section and browser test | design puzzles, write case content, commit |

**The producer is the human** (the parent). They approve the season brief and the pitch, play it with their child, and say when to commit. **The main Claude session** runs the pipeline, reviews the developer's work, fixes the hard bugs itself (only on a device, only in parallel), and makes the small and cross-cutting code changes. Only the developer and the main session touch code outside the case data.

## The pipeline for a season

0. **Season brief.** The editorial director writes section 0 of `docs/studio/seasons/<id>.md`: the rung, the reading knob, the feeling, must-haves, what to avoid, the ship date.
1. **Pitch.** The showrunner pitches inside the brief, in the same file: the premise, the red thread, the six cases with their language-neutral skeleton, the skill it teaches, and what is new. The director checks it against the brief (the book editor may read it for fun). → **The producer approves or changes it.** Nothing is written before that.
2. **Puzzles.** The puzzle designer assigns one puzzle per case (two in the final), with difficulty and hints, into the same season file. A new mechanic becomes a spec for the developer.
3. **Writing.** Two case writers draft the cases (cases 1–3 and 4–6, in parallel) into `solo/index.html`, and run `node tools/cases.mjs`.
4. **Review.** The fair-play tester, the Slovenian editor and the book editor review every case, in parallel. Findings go back to the writer by severity (below), at most two rounds. The developer builds any new mechanic (Sonnet); the main session reviews it.
5. **Screens.** The UX reviewer runs `node tools/shots.mjs <caseId>` and reviews the screenshots.
6. **Play.** The producer plays it with the child. What happened goes into [PLAYTEST.md](PLAYTEST.md).
7. **Retro.** Each agent reads the playtest notes and updates its lessons file. The showrunner updates [LEDGER.md](LEDGER.md) and the season's place in [CURRICULUM.md](CURRICULUM.md). The editorial director sets the direction for the next seasons in [STRATEGY.md](STRATEGY.md).

## How the agents work together

**They don't talk to each other directly.** The main session is the hub: it starts each agent with a task, the agent reads and writes the shared documents (the season file, the story bible, the ledger, its lessons) and returns a report, and the main session passes what matters to the next agent. So every change can be traced to a report and a document.

**Each role owns its area,** and within it its finding stands: logic → fair-play tester, language → Slovenian editor, voice and fun → book editor, screens → UX reviewer, the season plan → showrunner, the catalogue → editorial director.

**When two findings clash,** the writer first looks for a line that satisfies both (a funnier sentence that is also ≤ 8 words almost always exists). If there is none, this order decides:
1. Safe and appropriate for a child (veto).
2. Fair play: exactly one answer, reachable by reading (veto: a broken case never ships).
3. Reading level (the checker's limits).
4. Correct language.
5. Voice and fun.
6. Fit with the season plan.

A real trade-off (the story's direction, an approved pitch, two good options) goes to **the producer**, with the main session's recommendation.

**Every finding has a severity:**
- 🔴 **Blocker:** the writer must fix it before the case ships.
- 🟠 **Major:** fix it, or write one line in the season file saying why not; the main session decides.
- ⚪ **Minor:** the writer's choice.

There are no 1–10 scores: a model's scores drift and invite writing for the reviewer. The gates are pass/fail: the checker passes, the fair-play tester finds exactly one answer, and no 🔴 is open. The fun checklist in the book editor's brief turns »is it fun?« into seven yes/no questions; every »no« is a 🟠.

**At most two rewrite rounds.** If a case still has a 🔴 after the second round, the problem is in the plan, not the sentences: it goes back to the main session (and the showrunner, or the producer) instead of a third round.

**Decisions are written down.** Each season file ends with a **»Decisions«** section: one line per clash or 🟠 that was not fixed (date, what was decided, why, who). Agents read it before reviewing, so the same argument doesn't come back.

**The real score is the child.** Playtests and the debrief (finished the season, hints needed, asked for more) outrank every review.

## Ready for more languages

The game is Slovenian only, and stays so until it is validated with real children ([STRATEGY.md](STRATEGY.md)). The studio is kept ready for more languages at no extra cost:
- **The season skeleton is language-neutral.** A pitch's case facts (deed, time, place, culprit, motive, proof, alibis, decoy, card) are written as facts, apart from the Slovenian draft lines, so another language can rewrite a season instead of translating it ([seasons/README.md](seasons/README.md)).
- **One style guide per language.** Everything specific to Slovenian is in [languages/sl.md](languages/sl.md); the briefs point there. A new language gets `languages/<code>.md` with the same sections, and the Slovenian editor's brief becomes a language editor that loads the guide it is given.
- **Language-bound clues are flagged** in the season plan (a gender ending that gives the culprit away, a word puzzle, a pun), so another language knows what to rebuild.
- [CURRICULUM.md](CURRICULUM.md) (skills and knobs) is language-neutral; each style guide gives its language's examples.

## How the agents get better

Each agent has a lessons file in [lessons/](lessons/) that it **reads before every task** and **adds to after every task**:
- A lesson is one line: the rule, then the evidence (what happened, in which case).
- Playtest evidence beats opinion. A lesson from a real child outranks a lesson from a review.
- When a lesson has been confirmed twice, it moves up to **Rules**. A lesson that turns out wrong is deleted, not kept.
- Lessons files stay short (about 60 lines): merge duplicates, drop the ones a rule now covers.
- If an agent thinks its own brief (`.claude/agents/*.md`) should change, it says so in its report. The main session or the producer makes the change, so the briefs never drift by accident.

## Shared ground rules (every agent)

- **Fair play.** Every clue the solution needs is on screen, in a sentence the child reads. No secret twins, no unseen passages, no clue that only the reveal mentions.
- **Warm, never scary.** No murder, poison, blood, real danger, or a villain who is cruel. Culprits are funny, kind or misunderstood: a surprise, a prank, a lost alien who wants to call home. Nobody is punished harshly.
- **Reading first.** The child must *read* to win. Any puzzle, picture or sound serves the reading, it never replaces it.
- **Never stuck, never shamed.** Every step has a hint ladder that ends in the answer. A wrong try gets a gentle word, never a red X or a buzzer.
- **Fresh.** Before proposing anything, check [LEDGER.md](LEDGER.md): what has been used, and how often.
- **Privacy.** Names are never logged. Children's data stays on the device.
- **Slovenian is a draft** until a native speaker has read it.
- Agents do not commit, push or edit `docs/PLAN.md`. The producer says when to commit.
- **The cheapest model that does the task very well** (the producer, 2026-11-09): Sonnet for writing, puzzles, building, screens, the season brief and the fun review; Opus only where Sonnet falls short: the season's architecture (showrunner), proving one answer (fair-play tester) and Slovenian grammar (Slovenian editor). A new role starts on Sonnet unless there is a reason.
- **Mind the token budget** (the producer's plan has a session limit, and a season used to run into it):
  - Never read `solo/index.html` whole (300 KB). Print what you need with `cd solo && node tools/case.mjs` (`<ids>`, `--file <season>`, `--cast <season>`, `--format`, `--list`), and grep for anything else.
  - Read only the sections of a season plan your task needs. Don't read an older season's plan as a model; one or two of its cases via `tools/case.mjs` are enough.
  - Keep what you write short: a pitch ≤ 250 lines, the puzzle section ≤ 150 lines, a report within the word limit the brief gives.
  - Keep your lessons file ≤ 60 lines: when you add a lesson, merge or drop an older one it covers.

## Where things are

| What | Where |
|---|---|
| The game, cases (`CASES`), seasons (`FILES`), cast (`CHARACTERS`), UI lines (`UI_AUDIO`) | `solo/index.html` (cases between `CASES-BEGIN` and `CASES-END`) |
| The case format and step types | [solo/README.md](../../solo/README.md) |
| Checker (rules, solvability, word limits) | `cd solo && node tools/cases.mjs` |
| One case, a season or its cast, without reading the whole game | `cd solo && node tools/case.mjs p1` · `--file pokal` · `--cast pokal` · `--format` · `--list` |
| Screenshots of every screen of a case | `cd solo && node tools/shots.mjs <caseId>` (once: `cd tools && npm install`) |
| Puzzle catalogue | [docs/PUZZLES.md](../PUZZLES.md) |
| Theme backlog | [docs/CASE_FILES.md](../CASE_FILES.md) |
| Why the game is built this way | [docs/IMPROVEMENTS.md](../IMPROVEMENTS.md) |
| The plan: audience, goals, next seasons, markets | [STRATEGY.md](STRATEGY.md) |
| Slovenian rules (reading level, grammar traps, names, ti/Vi) | [languages/sl.md](languages/sl.md) |
| The world, cast and tone | [STORY_BIBLE.md](STORY_BIBLE.md) |
| How difficulty grows | [CURRICULUM.md](CURRICULUM.md) |
| What has been used | [LEDGER.md](LEDGER.md) |
| What children actually did | [PLAYTEST.md](PLAYTEST.md) |
