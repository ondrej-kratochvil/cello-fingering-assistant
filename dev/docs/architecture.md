# Architektura projektu

## Přehled

Projekt je klientská webová aplikace s **PHP** pro layout (hlavička, patička). Stránky `index.php` a `dev/tests/test.php` includují společný topbar a footer. Veškerá logika běží v prohlížeči, kód je rozdělen do několika JS modulů:

- `assets/js/fingering.js` – datový model hmatníku a algoritmus výpočtu prstokladů.
- `assets/js/ui.js` – prezentační a interakční logika pro `index.php`, vykreslení notové osnovy (VexFlow), textového výstupu a Canvas hmatníku.
- `assets/js/navigation.js` – navigace, dark mode toggle, callback pro překreslení při změně tématu.
- `assets/js/tests.js` – definice testovacích sad (včetně 14 testů stupnic) a jednoduchý test runner, funkce `prepareInputForSolve` pro enharmonické záměny.
- `assets/js/test-runner.js` – UI test runneru pro `dev/tests/test.php` (zobrazuje VexFlow notovou osnovu pro každý test).

### Struktura adresářů

- `index.php` – hlavní UI (PHP, includuje topbar/footer).
- `dev/tests/test.php` – UI pro běh testů (PHP, includuje topbar/footer).
- `assets/js/`
  - `fingering.js` – model a algoritmus.
  - `ui.js` – práce s DOM, VexFlow (notová osnova), kreslení Canvasu, `toDisplayNote`, `initUI`.
  - `i18n.js` – i18n modul, načítání `assets/i18n/*.json`, jazyk a H/B.
  - `navigation.js` – jednotné menu (menuToggle, mainNav), dark mode, vlajky jazyka.
  - `tests.js` – testy a test runner.
  - `test-runner.js` – UI test runneru pro `dev/tests/test.php`.
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



