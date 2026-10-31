# Case files (pustolovščine) – themes and backlog

Each adventure is one place with its own cast of 4–5 people and **6 cases that climb the reasoning ladder**, one step per case, plus one twist:

1. 🔍 **fact** – it is written in one sentence.
2. 🔍🔍 **trace** – a trace and whose it is (mud on the boots → the pigs).
3. 🔍🔍 **twist** – a trace again, but an animal of the place did it (a mouse, a goat). At most once per adventure.
4. 🔍🔍🔍 **slip** – the culprit says something only the culprit could know. Phrase it differently each time (no "Nato X reče" formula).
5. 🔍🔍🔍🔍 **alibi** – the culprit says where they were; another sentence shows it isn't true.
6. ⭐ 🔍🔍🔍🔍🔍 **pair** (final, opens when the rest are solved) – two sentences prove it only together: one says what (*green marker*), the other who (*only Ela has a green marker*). Tie it back to the earlier cases.

Vary the shape too: the proof early, in the middle or last; 1 → 3 decoys; 6 sentences in case 1 growing to 11 in the final case; sometimes witness statements (»…«) instead of a story. Cases are written at level A (≤ 8 words per sentence, 3–4 suspects). `solo/tools/cases.mjs` checks the ladder and the variety rules.

## Built
| Adventure | Cast | Cases |
|---|---|---|
| 🚀 Vesoljska postaja Zvezdica | Maja, Tim, Ela, robot Robi; kapitanka Vesna, miška Kiki | fact: space ice cream · trace: the garden (water floats) · twist: the crackers (Kiki) · slip: the red button · alibi: the captain's camera · final pair: the birthday card (green marker) |
| 🐄 Pri babici na kmetiji | Nik, Pia, Dedek, sosed Jan; Babi, poni Blisk, koza Meta | fact: the henhouse door · trace: who fed the pigs (mud) · twist: Dedek's red shirt (Meta) · slip: who rode Blisk (the saddle) · alibi: the first strawberries (the tractor) · final pair: Babi's flowers (only behind the barn) |
| 👾 Skrivnost v zračniku (season) | Tim, Ela, Robi, miška Kiki; client kapitanka Vesna; mystery guest Bip | 1: who opened the cookie cupboard (call → scene with torch → cross off → proof; card: a tiny green footprint) · 2: who pulled the big plug (call → question the suspects → cross off; Robi's own alibi is a lie; card: pip-pip from the vent) · 3: who took Maja's cheese (call → security camera: something small → scene → cross off; Kiki did it; the green footprint is back by the vent; card: the shiny spoon is too heavy for a mouse; then the child guesses what is in the vent) · 4: who bent the antenna (call → 🔤 word search: ANTENA, KOŠ, OKNO, MIZA name where to look → scene → cross off; Ela said she never touched it, her glove lies under it; card: the silver wire is missing; the bin hides the code 3-1-4 for a lock in case 5) · 5: who was in the storeroom at night (call → 🔐 lock with 3-1-4 → scene → cross off; Tim hid a birthday present for Vesna and knocked over the screws; card: something shines behind the vent). Planned arc in [IMPROVEMENTS.md §4](IMPROVEMENTS.md). |

The original 14 forest stories (Bine, Zala, Jure, Neža, incl. the Gran Canaria camel case) were removed; they are in the git history. Bine, Zala and Jure stay for the practice case.

## Backlog (add one by one)
| File | Setting | Case ideas |
|---|---|---|
| ⚽ **Nogometni turnir** | school football tournament | the missing ball before the final · who scored the secret training goal · muddy boots in the changing room · the lost captain's armband · final: who drew the team flag |
| 🏫 Skrivnosti v šoli | school | the class hamster got out · who drew on the board · the lost lunchbox · library mystery |
| 🏖️ Počitnice na morju | Piran / Portorož | the lost sandal · the sandcastle · the ice-cream mix-up · the salt pans |
| 🏝️ Gran Canaria | holiday | the sand camel on the Maspalomas dunes (from the old forest case) · dolphin trip · the market · Roque Nublo |
| 🦕 Noč v muzeju | natural history museum | the missing dinosaur tooth · the moved painting · footprints in the hall |
| ⛷️ Zimske počitnice | Kranjska Gora | the lost ski glove · the snowman · hot chocolate |
| 🐉 Legenda o zmaju | Ljubljana castle, Slovenian legends | who left the dragon footprints |
| 🏴‍☠️ Gusarski otok | treasure hunt | the map torn in two · who hid the key · final: the treasure |
| 🎪 Cirkus prihaja | circus | the clown's lost nose · the juggling balls |
