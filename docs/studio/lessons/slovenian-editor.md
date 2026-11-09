# Lessons: Slovenian editor

Read before every task. Add up to 3 lessons after every task: the rule, then — evidence (what happened, where). A lesson confirmed twice moves up to **Rules**; a lesson proved wrong is deleted. Keep this file under ~60 lines. Playtest evidence beats review opinion.

## Rules
- All Slovenian in the game so far was drafted without a native speaker; treat every line as unchecked until the producer confirms a native read. — status 2026-11-01.

## Lessons
- Lines that address the child in the past tense need both genders (`ga(m, f)`), or a phrasing without gender: »Prav si ugibal / ugibala«. — Bip 6 guess result.
- Two singular subjects take the dual: »Žlička in žica sta skriti« / »sta bili«. — Bip 6.
- `caught` is read inside »Detektivka Ana je ujela ___!«: check the accusative there (Tima, Elo, Kiki, Bipa). — all Bip cases.
- The checker counts »…« as a word (`words()` doesn't strip it): »No ja … « already costs 3 of the 8. Count before adding a word. — Galeb g5 (»… pa je res bil« went to 9).
- Feminine names in -i (Rozi, Gusti): keep the noun undeclined (z Rozi, ujela Gusti, o Gusti). The producer (native speaker) chose the possessive **Rozin listek**, not Rozijin (2026-11-01, Galeb); use the short -in form for such names. — Galeb.
- The child addresses old ladies with **Vi** (»Kdaj greste spat?«, »Kaj ste videli?«): the producer's choice for gospa Vera (2026-11-01). Muzej: the writers mixed ti and Vi to the same adults (m2–m3 Vi, m6 ti); the editor chose **Vi for all museum staff** (Breda, Rambo, Ivo, Mila), **confirmed by the producer 2026-11-05**. Check each adult's address across the whole season, not per case; formal participle stays masculine plural even to a woman (»Kje ste bili?«). — Galeb, Muzej 2026-11-05.
- Swap colloquial forms for standard ones in child text (»ne paše« → »ni prava«, »s tabo« → »s teboj«), and check that a simile makes sense (»Hodnik škriplje kot plaža«: a beach doesn't creak). — Galeb g2, UI.
- UI headings and tags: prefer short words a child decodes at a glance over »pustolovščina« (13 letters, šč); reuse symbols the game already explains (🏅 = »Pustolovščina rešena!«). Standalone sticker »NOVO« needs no agreement (shop convention); unconfirmed by a native. — start screen labels, 2026-11-02.
- Instruction cards (»Najprej navodilo«): one action per sentence, goal question before the action (»Kaj je bilo najprej? Tapni …«), and point at an icon the child can see (»Tapni 💬«) instead of an abstract noun (»trditev«). Unconfirmed by a native. — how* texts, 2026-11-02.
- Impersonal sound verbs work (»Iz zračnika je piskalo«, »je ropotalo«), but not an action verb: »iz sobe 7 je tipkalo« sounds wrong, and »tipkalo« is also a noun (a push-button). Use a subject: »v sobi 7 je nekdo tipkal«. Unconfirmed by a native. — Galeb g6 s3, 2026-11-05.
- A time word with the present tense reads as a habit (»Opoldne so listi mokri« = every noon). Next to a past-tense line, keep the past: »Opoldne so bili listi …«. Unconfirmed by a native. — Vesolje v2 s2, 2026-11-05.
- Two names side by side read as one full name (»Tim Maji bral«); put the verb between them, neutral order verb → dative → object (»Tim bral Maji pravljico«, »učil Bepija plavati«). Unconfirmed by a native. — Bip b4 s1, Galeb g4 s7, 2026-11-05.
- Numbers 3 and 4 take the nominative plural: »Še trije / štirje dnevi«; 2 the dual »dva dneva«; 5+ the genitive »pet dni«. »Še štiri dni« is the common spoken slip. Confirmed by the producer (native speaker) 2026-11-05. — Muzej countdown.
- Scene `label`s are read alone under a picture: avoid a label that is also a function word (»kot« = corner, but reads as »like«); name the object (»zvezek« for 📓). — Muzej m1, 2026-11-05.
- Case data can't switch gender (only UI lines have `ga(m, f)`): »Hej, detektiv!« / »Hvala, detektiv!« in a call or letter speaks only to a boy. Use »Hej, pomagaj!«, »Hej!«, »Hvala!«. Same for two of anything: dual even without »dva« (»Rezultata je povedal Lan«, to match »rezultata obeh tekem«). Unconfirmed by a native. — Pokal p1, p2, p6, 2026-11-06.
- The checker does **not** count reveal / excuse / letter / card.think in step cases (`continue` at cases.mjs:312 skips line 324), and counts lock `h1`/`h2` as one whole line, not per sentence. Count those by hand (a 9-word reveal had passed: p2 »… skrivaj stekel k malemu golu«). — Pokal, 2026-11-06.
- A clitic can't open a sentence in standard Slovenian: »Ga odkriješ?« → »Ali ga odkriješ?«. A process noun can't be a plural's predicate: »Sive risbe so drgnjenje« → »… so odtisi«. Unconfirmed by a native. — Pokal cup q, p6 reveal, 2026-11-06.
- Parent-facing copy uses formal **vi** (»Povlecite«, »vi pomagate«), so a call to parent + child is **»Igrajte skupaj«**, not the dual »Igrajta« (the reader is one person). The install sheet still says ti (»Tapni«, »Izberi«): flagged, not changed. Unconfirmed by a native. — landing page, 2026-11-09.
- Onboarding knows the gender after the avatar pick (`S.mk.g`, not `profile()`, so `ga()` doesn't work there yet): use `m.g === 'f'` for lines after step 1 (»Postala si detektivka!«). — make() card helper, 2026-11-09.
- Watch calques from English design copy: »Veliki stavki« (= long, not big print) → »Velike črke«; logical »zaključek« → »sklep«; »brez nizov« (streaks) is opaque to parents. Unconfirmed by a native. — landing page, 2026-11-09.
