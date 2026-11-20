# The marketing team: validation first, then growth

Bralni detektivi's marketing is run like the studio (docs/studio/README.md): Claude Code agents with a brief and a lessons file each, the main session as the hub, and **the producer** (the founder and parent) deciding. Set up 2026-11-19.

## Where we are
**Validation, not growth.** We don't yet know who the game is really for: a parent and a child playing **together** (H1), or a child playing **alone** with the parent's blessing (H2). Schools are out as a place to play (devices are banned by default), so parents are the audience; screen time is their frame. The December plan tests this: [VALIDATION.md](VALIDATION.md).

## The documents
| File | What | Owner |
|---|---|---|
| [VALIDATION.md](VALIDATION.md) | Hypotheses H1–H5, the scorecard, the December plan, the timeline, the decision rules, the readout | strategist |
| [LEAFLET.md](LEAFLET.md) | The paper puzzle leaflet with QR codes: variants, codes per place, the flow after the scan, what to build | growth lead |
| [ANALYTICS.md](ANALYTICS.md) | The new events and fields, the Worker and privacy page changes, the scorecard queries | growth lead (spec), developer (build), trust reviewer (gate) |
| [RESEARCH.md](RESEARCH.md) | Screener, interviews, the holiday diary, the synthesis | family researcher |
| `FINDINGS.md` | One entry per family, then the synthesis (created with the first interview) | family researcher |
| `MESSAGING.md` | The value proposition and messages per hypothesis, the words parents use (created after five interviews) | copywriter |
| `lessons/<role>.md` | Each agent's lessons, read before and added to after every task | each agent |

## The team
| Agent | File | Owns | Model |
|---|---|---|---|
| 🧭 **Marketing strategist** | [marketing-strategist.md](../../.claude/agents/marketing-strategist.md) | the hypotheses, the scorecard and thresholds, the plan, the readout and the decision recommendation | Opus |
| 🔬 **Family researcher** | [family-researcher.md](../../.claude/agents/family-researcher.md) | the screener, interview and diary guides, reading the producer's notes, the synthesis | Sonnet (Opus for the final synthesis) |
| ✍️ **Conversion copywriter** | [conversion-copywriter.md](../../.claude/agents/conversion-copywriter.md) | the value proposition, the landing page and leaflet copy, the A/B variants, share text | Opus |
| 📈 **Growth lead** | [growth-lead.md](../../.claude/agents/growth-lead.md) | the funnel, the analytics spec, experiments and their readouts, channels and later the growth loops | Sonnet |
| 🛡️ **Trust reviewer** | [trust-reviewer.md](../../.claude/agents/trust-reviewer.md) | the gate: honest claims, privacy, speaking to adults not children | Sonnet |

**Shared with the studio:** the Slovenian editor checks every Slovenian line; the UX reviewer checks every new screen; the developer builds; the puzzle designer makes the leaflet room. **Later, when the message is proven:** an expert and partner scout (paediatricians, psychologists, librarians, reading programmes), a content and channel marketer, a business model analyst.

## How decisions are made
- **The producer approves** the plan, every message that goes out, every new event, and all spending. Agents never commit, post or publish.
- **The clash order:** (1) a child's safety and the parent's trust (the trust reviewer's veto: no false claims, no data we didn't promise, never marketing to the child); (2) evidence (real families beat opinion; a behaviour beats a statement); (3) clarity of the message; (4) style.
- **Findings** use the studio's marks: 🔴 blocker, 🟠 major, ⚪ minor. Unfixed 🟠 go in the »Decisions« line of the document they concern.
- **The thresholds in VALIDATION.md are set before the data comes in** and only the producer moves them.

## What Claude can and can't do here
- **Can:** plan, write copy and specs, design the leaflet with Claude Design, build the analytics with the developer, write queries, read exports and interview notes, write the readouts.
- **Can't:** talk to families, hand out leaflets, post on social media, run ads, or read the D1 database from a claude.ai session (no Cloudflare access): the producer exports the rows or runs `node solo/tools/stats.mjs` locally.

## Ground rules (every marketing agent)
- **Speak to the parent.** The puzzle is for the child; the promise is for the adult. No message urges a child to ask for the app.
- **Only true claims.** »Izboljša branje« needs evidence we don't have; »otrok bere, ker hoče izvedeti, kdo je bil« is what we see. Screen-time claims follow the national guidelines (1 hour a day for 6–9) and never promise health benefits.
- **Privacy is a feature, not small print.** No account, no ads, data stays on the device. Every new field goes on `zasebnost/` before it ships.
- **Mind the token budget** as in the studio: never read `solo/index.html` whole.
- **Slovenian is a draft** until the producer has read it.
