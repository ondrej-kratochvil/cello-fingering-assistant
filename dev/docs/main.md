# Cello Fingering Assistant – Dokumentace

Tento projekt je klientská (HTML/JS) aplikace pro návrh violoncellového prstokladu nad jednoduchým modelem hmatníku a dynamickým programováním.

## Struktura dokumentace

- [Architektura projektu](./architecture.md)
- [Algoritmus prstokladu](./algorithm.md)
- [Uživatelské rozhraní](./ui.md)
- [Testování](./testing.md)
- [Manuální testy](./manual_tests.md)
- [Roadmapa](./roadmap.md) - Seznam úkolů k opravě podle .cursorrules

## Stručný přehled projektu

- `index.html` – hlavní stránka aplikace **Cello Fingering Assistant**, input sekvence tónů, vizualizace prstokladu a hmatníku (Canvas).
- `js/fingering.js` – model hmatníku a hlavní algoritmus `solve(sequence)`.
- `js/ui.js` – napojení UI na algoritmus, vykreslení prstokladu a vizualizace hmatníku.
- `js/tests.js` – sada testů nad algoritmem a pomocný test runner.
- `test.html` – samostatná stránka pro běh a vizuální zobrazení testů v prohlížeči.

Projekt aktuálně nemá backend (PHP) ani databázi – jedná se o čistý front‑end prototyp / nástroj.


