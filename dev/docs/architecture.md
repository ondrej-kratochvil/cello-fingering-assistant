# Architektura projektu

## Přehled

Projekt je klientská webová aplikace **Cello App Kit** s **PHP** pro layout (hlavička, patička). Stránky includují společný topbar a footer. Veškerá logika běží v prohlížeči, kód je rozdělen do několika JS modulů:

**Základní moduly:**
- `assets/js/fingering.js` – datový model hmatníku a algoritmus výpočtu prstokladů.
- `assets/js/ui.js` – prezentační a interakční logika pro Prstoklad, vykreslení notové osnovy (VexFlow), textového výstupu a Canvas hmatníku.
- `assets/js/navigation.js` – navigace, dark mode toggle, callback pro překreslení při změně tématu.
- `assets/js/tests.js` – definice testovacích sad (včetně 14 testů stupnic) a jednoduchý test runner.
- `assets/js/test-runner.js` – UI test runneru pro `dev/tests/test.php`.

**Moduly nástrojů Cello App Kit:**
- `assets/js/tuner.js` – ladička (YIN pitch detection, Web Audio API, temperované/čisté kvinty).
- `assets/js/countdown.js` – odpočet (minutka), stav v `localStorage`, widget v hlavičce, zvuk zvonění.
- `assets/js/metronome.js` – metronom (BPM, počet dob, puntíky, notová sekvence z Prstokladu).
- `assets/js/rhythms.js` – rytmy (pattern na sekvenci z Prstokladu).
- `assets/js/bowing.js` – smyky (legato/separate pattern, VexFlow s obloučky).
- `assets/js/sheet-list.js` – seznam not (localStorage).

### Struktura adresářů

- `index.php` – homepage (Průvodce cvičením).
- `prstoklad.php`, `ladicka.php`, `metronom.php`, `odpocet.php`, `rytmy.php`, `smyky.php`, `seznam-not.php` – stránky nástrojů.
- `accessibility.php` – prohlášení o přístupnosti (načítá `countdown.js` pro widget).
- `dev/tests/test.php` – UI pro běh testů.
- `assets/js/`
  - `fingering.js` – model a algoritmus prstokladu.
  - `ui.js` – práce s DOM, VexFlow, Canvas hmatníku, `initUI`.
  - `i18n.js` – i18n modul, načítání `assets/i18n/*.json`, jazyk a H/B.
  - `navigation.js` – jednotné menu, dark mode, vlajky jazyka.
  - `tuner.js` – YIN detekce výšky tónu, mediánový filtr.
  - `countdown.js` – odpočet s `localStorage` persistence, topbar widget.
  - `metronome.js`, `rhythms.js`, `bowing.js`, `sheet-list.js` – nástroje.
  - `tests.js`, `test-runner.js` – testy.
- `assets/partials/` – **topbar.php**, **footer.php** (společný layout, PHP include). `topbar.php` očekává `$base`, `$pageTitle`, `$taglineKey`, `$taglineFallback`.
- `assets/i18n/` – překlady (cs.json, en.json).
- `assets/css/main.css` – design systém, styly pro notovou osnovu.
- `dev/docs/` – tato dokumentace.

## Datový model hmatníku

Datový model je definován v `assets/js/fingering.js`:

- `pitchDefs` – pole definic tónů:
  - `n` – název tónu (např. `e`, `g1`, `c1#`).
  - `s` nebo `strings` – struna (`C`, `G`, `D`, `A`), případně více možností.
  - `v` – chromatická „vzdálenost“ v půltónech od prázdné struny.
- `generateFingering(s, targetV)` – pro danou strunu a chromatickou hodnotu vygeneruje všechny možné prstoklady:
  - `s` – struna.
  - `p` – poloha (1–12, 0 = prázdná struna).
  - `f` – prst (0–4).
  - `ext` – 0 úzká, 1 široká poloha.
- `createFingeringModel()` – z `pitchDefs` vytvoří objekt `model`, který mapuje zápis tónu (např. `e1`) na seznam možných prstokladů.

Tento model se používá jako vstup pro algoritmus `solve`.

## Algoritmus a vrstvy (high‑level)

Funkce `solve(sequence)` v `assets/js/fingering.js`:

- Vstup: `sequence` – pole tónů jako řetězce (`['e', 'f#', 'g#']`).
- Vrací: nejlepší nalezený prstoklad jako pole objektů `{ s, p, f, ext }`.

Implementačně:

- Používá **dynamické programování** po vrstvách:
  - `layers[i]` obsahuje nejlepší cesty (stav + kumulovaná cena) pro i‑tý tón.
  - Každý stav má:
    - `path` – dosavadní prstoklady.
    - `cost` – kumulovanou cenu.
    - `lastP` – poslední poloha.
    - `groupSize` – délka „skupiny“ v jedné poloze.
    - `hasWideInGroup` – zda ve skupině byla široká poloha.
- Pro každý možný aktuální prstoklad (`curr`) a předchozí stav (`prevStep`) se počítá:
  - `linkCost` – náklady přechodu (shifty, změny extenze, přechod mezi strunami, výška polohy).
  - `total = prevStep.cost + linkCost`.
- Pro každou možnost se drží jen nejlevnější cesta.

Finální výběr:

- Z poslední vrstvy se dopočítají globální penalizace:
  - `lastPenalty` – penalizace za osamocený poslední tón v poloze.
  - `positionPenalty` – penalizace za počet použitých poloh.
  - `maxPositionPenalty` – penalizace za příliš vysoké polohy.
- Vybere se varianta s nejnižší celkovou cenou.

Dodatečně:

- Implementovány jsou i **druhé průchody** nad vítěznou cestou (např. úprava osamocených tónů v poloze, korekce kolem 4. prstu v široké poloze) – viz detail v `dev/docs/algorithm.md`.



