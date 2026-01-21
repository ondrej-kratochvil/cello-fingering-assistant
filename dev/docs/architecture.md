# Architektura projektu

## Přehled

Projekt je čistě klientská webová aplikace bez backendu. Veškerá logika běží v prohlížeči, kód je rozdělen do tří hlavních JS modulů:

- `js/fingering.js` – datový model hmatníku a algoritmus výpočtu prstokladů.
- `js/ui.js` – prezentační a interakční logika pro `index.html`.
- `js/tests.js` – definice testovacích sad a jednoduchý test runner.

### Struktura adresářů

- `index.html` – hlavní UI.
- `test.html` – UI pro běh testů.
- `js/`
  - `fingering.js` – model a algoritmus.
  - `ui.js` – práce s DOM, kreslení Canvasu.
  - `tests.js` – testy a test runner.
- `dev/docs/` – tato dokumentace.

## Datový model hmatníku

Datový model je definován v `js/fingering.js`:

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

Funkce `solve(sequence)` v `js/fingering.js`:

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



