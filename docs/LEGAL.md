# Zasebnost in pogoji: proposal

Proposal for the privacy policy and terms of use of Bralni detektivi (bralnidetektivi.si), first market Slovenia. Status: **built on 2026-11-12** as `zasebnost/index.html`, which now holds the current text. Producer's decisions: the publisher is named as »Robert«, a private project, with no postal address; contact details are left out until there is an address (so the page has no e-mail line, and the e-mail paragraph in §4 part 3 and »Stik« in §5 part 7 are left out for now); free use at home and in class is confirmed. Still open: §6 points 2 and 4–7, and the lawyer's look.

This is a careful draft, not legal advice. Before it goes live, the Slovenian editor should read the text, and a short look by a lawyer is worth it (§6 lists the exact points to ask about).

## 1. What the documents have to say (checked against the code)

| Fact | Where it comes from |
|---|---|
| No accounts, no login, no e-mail, no payments, no ads, no social plugins, no notifications | whole app |
| Detective's name (max 12 characters), avatar, age band / reading level, solved cases, letters, a play log, and a random player id are saved in the browser's `localStorage` on the device and never sent | `solo/index.html` (`dp_*` keys) |
| Two things are sent: the Cloudflare Web Analytics beacon (cookieless, anonymous visit counts), and since 2026-11-14 anonymous game events from »Skrivnostne sobe« (no name, no card, no IP, no device ID; a random sitting number held in memory only; stored in D1 in the EU, deleted after a year; [EVENTS.md](EVENTS.md)) | `index.html`, `home/index.html`, `solo/index.html`, `kje-je-kdo/index.html`, `worker/index.js` |
| The site is served by Cloudflare (a Worker with static assets), so Cloudflare briefly handles the visitor's IP address to deliver the page | hosting |
| The camera is used only when an adult taps »Skeniraj kodo« in the adult review; the picture is read on the device | `qrScan()` in `solo/index.html` |
| Fonts and QR libraries are bundled; no Google Fonts or other third-party requests | `solo/fonts/`, `solo/vendor/` |
| An adult can export everything to a file (Izvozi JSON) or move it by QR code; both stay in the adult's hands | adult review |

What follows from it:

- **No cookie banner and no consent box.** Game progress in `localStorage` is strictly necessary for the game the visitor asked for, and neither the analytics nor the game events store anything on the device (ZEKom-2, Article 225). There is nothing to consent to, so asking would only add noise.
- **No parental-consent flow.** We never receive a child's data, so the 15-year consent age in ZVOP-2 does not come into play. The policy says so in plain words instead.
- **The readers are parents and teachers**, not the children. Plain Slovenian, short sentences, formal »vi«, no legalese. A parent should get the whole picture from five lines at the top.

## 2. The page

**One page, two sections:** `/zasebnost/` with the title »Zasebnost in pogoji«. Terms of use sit in the same page under `#pogoji`. One page is one thing to keep current and one thing to cache for offline; both documents together are about two phone screens of text.

Layout, top to bottom, in the landing page's look (same tokens, bundled Lexend, the 🔍 coin and brand in the header linking home):

1. **»Na kratko«**: a card with five lines. Most parents stop here, and it must be enough.
2. **Zasebnost**: nine short numbered parts.
3. **Pogoji uporabe**: seven short numbered parts.
4. Foot: »Velja od …« and the contact address.

Static HTML, no script, no analytics beacon on this page. Added to the service worker's page list so it also opens offline.

## 3. Where it is shown

| Place | What | Why |
|---|---|---|
| Landing page, footer | Link »Zasebnost in pogoji« next to »Za odrasle: nastavitve in pregled« | Where every adult looks for it |
| Landing page, »Za starše« section | One trust line under »Igrajte skupaj«: »🔒 Brez računa in brez oglasov. Ime in napredek ostaneta na vaši napravi. [Več o zasebnosti]« | Privacy is a reason to choose the game, so it belongs in the pitch, not only in the footer |
| Game, adult setup (`solo/`) | The existing line »Vse ostane na tej napravi.« gets the link | The adult is already reading about data there |
| Game, adult review (hold the corner 3 s) | Small link next to Izvozi / Uvozi JSON | Same |
| Child screens | **Nothing** | No extra reading, and no way out of the game for a 7-year-old |

No pop-up, no banner, no checkbox at first launch.

## 4. Content: Zasebnost (Slovenian, as it would appear)

> ### Na kratko
> - Brez računa, brez prijave, brez e-naslova.
> - Brez oglasov in brez nakupov.
> - Ime detektiva in napredek ostaneta na vaši napravi. Mi ju ne vidimo.
> - Brez piškotkov. Štejemo samo anonimne obiske strani.
> - Vse lahko kadar koli izbrišete sami.
>
> ### Zasebnost
>
> **1. Kdo smo**
> Bralne detektive pripravlja [IME ALI NAZIV], [NASLOV]. Pišete nam lahko na [E-NASLOV].
>
> **2. Kaj ostane na vaši napravi**
> Igra v brskalnik na vaši napravi shrani:
> - ime ali vzdevek detektiva (največ 12 znakov) in izbrano podobo,
> - starostno skupino in raven branja, če ju nastavi odrasli,
> - rešene primere, pisma in čin,
> - dnevnik igranja za pregled za odrasle,
> - naključno oznako igralca, ki ne vsebuje imena.
>
> Ti podatki naprave ne zapustijo. Ne pošiljamo jih nikamor in jih ne vidimo. Otrok lahko namesto pravega imena vpiše vzdevek.
>
> **3. Kaj vidimo mi**
> (2026-11-14: the live page also has »Anonimni dogodki v ugankah«, see `zasebnost/index.html` and [EVENTS.md](EVENTS.md).)
> - **Anonimno štetje obiskov.** Uporabljamo Cloudflare Web Analytics. Pove nam, katera stran je bila odprta, od kod je prišel obisk, s kakšno napravo in brskalnikom, iz katere države in kako hitro se je stran naložila. Ne uporablja piškotkov, ničesar ne shrani na napravo in obiskovalcev ne prepoznava. Vidimo samo seštevke.
> - **Dostava strani.** Stran gostuje pri podjetju Cloudflare. Ob vsakem obisku ta za kratek čas obdela IP-naslov naprave, da lahko stran pošlje in jo zaščiti pred zlorabami.
> - **E-pošta.** Če nam pišete, vaš naslov in sporočilo uporabimo samo za odgovor. Izbrišemo ju najpozneje po enem letu.
>
> Podlaga za to je naš zakoniti interes, da stran deluje varno in da vemo, koliko ljudi jo uporablja (člen 6(1)(f) Splošne uredbe o varstvu podatkov).
>
> **4. Česa ne počnemo**
> Ne zbiramo imen, e-naslovov ali fotografij. Ne prikazujemo oglasov. Ne sledimo otrokom in ne ustvarjamo profilov. Podatkov ne prodajamo in jih ne delimo. Ne pošiljamo obvestil. Ne uporabljamo lokacije in mikrofona.
>
> **5. Kamera**
> Kamero igra uporabi samo, ko odrasli v pregledu za odrasle tapne »Skeniraj kodo«, da prenese napredek z druge naprave. Slika se obdela na napravi. Ne shrani se in se nikamor ne pošlje.
>
> **6. Kdo nam pomaga**
> Cloudflare, Inc. (ZDA) za gostovanje in štetje obiskov, kot naš pogodbeni obdelovalec. Podatki se lahko obdelajo tudi v ZDA, na podlagi okvira EU–ZDA za varstvo podatkov in standardnih pogodbenih določil. Drugih zunanjih storitev ni.
>
> **7. Izbris in prenos**
> - **Izbris:** v nastavitvah brskalnika izbrišite podatke spletnega mesta bralnidetektivi.si. Če je igra na začetnem zaslonu, odstranite ikono. S tem je izbrisano vse.
> - **Kopija in prenos:** v pregledu za odrasle lahko vse izvozite v datoteko ali s QR kodo prenesete na drugo napravo. Datoteka in koda ostaneta pri vas.
>
> **8. Vaše pravice**
> Imate pravico do dostopa, popravka, izbrisa, omejitve obdelave in ugovora. Pišite nam na [E-NASLOV]. Ker podatkov o otrocih nimamo, vam najpogosteje ne bomo imeli česa poslati, bomo pa vedno odgovorili. Pritožite se lahko tudi pri Informacijskem pooblaščencu, Dunajska cesta 22, 1000 Ljubljana, www.ip-rs.si.
>
> **9. Spremembe**
> Če se bo kar koli od tega spremenilo, bomo to stran popravili, preden bo sprememba začela veljati, in zgoraj zapisali nov datum.

## 5. Content: Pogoji uporabe (Slovenian, as it would appear)

> ### Pogoji uporabe
>
> **1. Kaj je to**
> Bralni detektivi so bralna igra za otroke od 6 do 10 let. Deluje v brskalniku na telefonu, tablici in računalniku.
>
> **2. Kdo jo uporablja**
> Otroci igrajo z vednostjo staršev ali skrbnikov. Te pogoje sprejme odrasli, ki otroku igro omogoči.
>
> **3. Cena**
> Igra je brezplačna. V njej ni nakupov in ni oglasov. Če bomo kdaj ponudili plačljivo vsebino, bo jasno označena, namenjena odraslim in bo imela svoje pogoje.
>
> **4. Vsebina**
> Zgodbe, besedila in podoba igre so naše avtorsko delo. Doma in v razredu jih uporabljajte prosto: igrajte, delite povezavo, berite skupaj. Brez našega dovoljenja jih ne kopirajte, ne objavljajte drugje in ne prodajajte.
>
> **5. Kako deluje**
> Trudimo se, da igra deluje dobro, ne moremo pa obljubiti, da bo vedno na voljo in brez napak. Primere lahko dodajamo, spreminjamo ali umaknemo.
> Napredek je shranjen samo na vaši napravi. Če izbrišete podatke brskalnika ali zamenjate napravo, se izgubi in ga ne moremo povrniti. Kopijo lahko naredite v pregledu za odrasle.
>
> **6. Odgovornost in pravo**
> Odgovarjamo v mejah, ki jih določa zakon. Ti pogoji ne omejujejo pravic, ki jih imate kot potrošnik. Velja pravo Republike Slovenije.
>
> **7. Stik in spremembe**
> Pišite nam na [E-NASLOV]. Če pogoje spremenimo, tu objavimo novo različico z datumom.
>
> *Velja od [DATUM OBJAVE].*

## 6. Open points

Needed from the producer before the page can go live:

1. **Who is the publisher?** Name (private person, s.p. or company) and a postal address for »Kdo smo«. A privacy policy has to name who is responsible, and ZEPT asks service providers for the same.
2. **Contact address.** A domain address such as `info@bralnidetektivi.si` (forwarded with Cloudflare Email Routing, free) rather than a private one.
3. **Classroom use in »Vsebina«.** The draft allows free use at home and in class. Confirm or narrow.

Things that do not match the policy today:

4. **The old address is still live.** `robertfilic.github.io/detective_reading_game_mvp/` still serves the game from GitHub, a second host the policy does not name. Redirect it to bralnidetektivi.si or switch GitHub Pages off.
5. **Playtest exports.** If a parent or teacher ever sends us an exported JSON file, we receive a child's name and play log, and »mi ju ne vidimo« stops being true for that file. Either ask testers to use a code instead of a name before exporting, or add one sentence about playtests.
6. **No one-tap delete.** The policy points parents to the browser settings. A button »Izbriši vse na tej napravi« in the adult review would be kinder and is a small job.
7. **Future accounts.** The random player id exists so that a later account can claim a device's progress. The day anything is sent to a server, this policy, and probably a parental-consent step, must change first.

To ask a lawyer (30 minutes): whether the publisher details in point 1 satisfy ZEPT for a free service, whether "zakoniti interes" is the right basis for the cookieless analytics, and the liability sentence in »Odgovornost in pravo«.

## 7. Build, once approved

1. `zasebnost/index.html`: the static page in the landing page's tokens.
2. `index.html`: footer link and the trust line in »Za starše«.
3. `solo/index.html`: link on the adult setup and the adult review.
4. `sw.js`: add `./zasebnost/` to the cached pages, new cache version.
5. `solo/tools/tests/landing.mjs`: the link is there, the page opens, Slovenian only, no sideways scroll, no third-party requests.
6. Slovenian editor pass over the final text; `README.md` and `solo/README.md` updated.
