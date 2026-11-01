# The studio: how new seasons get made

Detektivska pisarna is made by a small studio of Claude Code agents, with a human producer. The goal: **the most fun detective game in the world for children who are learning to read**, Agatha Christie for 7-year-olds. Every season is new, never a copy of the last one, and the detective work gets harder as the children grow.

## The team

| Agent | File | Owns | Never does |
|---|---|---|---|
| 🎬 **Showrunner** | [.claude/agents/showrunner.md](../../.claude/agents/showrunner.md) | the season: big mystery, red thread, cast, the skill it teaches, the final reveal | write case sentences |
| ✍️ **Case writer** | [.claude/agents/case-writer.md](../../.claude/agents/case-writer.md) | one case: its sentences, alibis, decoy, proof, call, reveal, letter, in the game's data format | change the season plan on its own |
| 🧩 **Puzzle designer** | [.claude/agents/puzzle-designer.md](../../.claude/agents/puzzle-designer.md) | the puzzle in each case, its difficulty and hint ladder; specs for new mechanics | build the mechanic (the main session does) |
| 🔎 **Fair-play tester** | [.claude/agents/fair-play-tester.md](../../.claude/agents/fair-play-tester.md) | proof that each case has exactly one answer, reachable by reading, with no pattern to game | rewrite the case itself |
| 🇸🇮 **Slovenian editor** | [.claude/agents/slovenian-editor.md](../../.claude/agents/slovenian-editor.md) | grammar, natural child-level Slovenian, reading load | change the plot |
| 📱 **UX reviewer** | [.claude/agents/ux-reviewer.md](../../.claude/agents/ux-reviewer.md) | what the child sees and taps, on a small phone, an iPad and a landscape phone | change content |

**The producer is the human** (the parent). They approve the season pitch, play it with their child, and say when to commit. **The main Claude session** runs the pipeline, builds new mechanics (with tests), and is the only one that touches code outside the case data.

## The pipeline for a season

1. **Pitch.** The showrunner reads the playtest notes, the curriculum and the ledger, and writes `docs/studio/seasons/<id>.md`: the premise, the red thread, the six cases in one line each, the skill it teaches, and what is new. → **The producer approves or changes it.** Nothing is written before that.
2. **Puzzles.** The puzzle designer assigns one puzzle per case (two in the final), with difficulty and hints, into the same season file. A new mechanic becomes a spec for the main session.
3. **Writing.** Case writers draft the cases (in parallel, one case each) into `solo/index.html`, and run `node tools/cases.mjs`.
4. **Review.** The fair-play tester and the Slovenian editor review every case. Findings go back to the writer until both pass. The main session builds any new mechanic.
5. **Screens.** The UX reviewer runs `node tools/shots.mjs <caseId>` and reviews the screenshots.
6. **Play.** The producer plays it with the child. What happened goes into [PLAYTEST.md](PLAYTEST.md).
7. **Retro.** Each agent reads the playtest notes and updates its lessons file. The showrunner updates [LEDGER.md](LEDGER.md) and the season's place in [CURRICULUM.md](CURRICULUM.md).

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

## Where things are

| What | Where |
|---|---|
| The game, cases (`CASES`), seasons (`FILES`), cast (`CHARACTERS`), UI lines (`UI_AUDIO`) | `solo/index.html` (cases between `CASES-BEGIN` and `CASES-END`) |
| The case format and step types | [solo/README.md](../../solo/README.md) |
| Checker (rules, solvability, word limits) | `cd solo && node tools/cases.mjs` |
| Screenshots of every screen of a case | `cd solo && node tools/shots.mjs <caseId>` (once: `cd tools && npm install`) |
| Puzzle catalogue | [docs/PUZZLES.md](../PUZZLES.md) |
| Theme backlog | [docs/CASE_FILES.md](../CASE_FILES.md) |
| Why the game is built this way | [docs/IMPROVEMENTS.md](../IMPROVEMENTS.md) |
| The world, cast and tone | [STORY_BIBLE.md](STORY_BIBLE.md) |
| How difficulty grows | [CURRICULUM.md](CURRICULUM.md) |
| What has been used | [LEDGER.md](LEDGER.md) |
| What children actually did | [PLAYTEST.md](PLAYTEST.md) |
