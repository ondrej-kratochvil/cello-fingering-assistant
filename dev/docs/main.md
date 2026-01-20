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

## Jak pokračovat v budoucím vývoji

### Technický stack
- **Frontend**: HTML5, CSS3 (design systém s CSS proměnnými), Vanilla JavaScript (ES6+ moduly)
- **Build tools**: Žádné (čistý vanilla stack)
- **Dependencies**: Pouze Tailwind CSS přes CDN (pro rychlý vývoj UI)

### Architektura
- **Struktura**: Root obsahuje pouze `index.html`, `.htaccess`, `.gitignore`, `README.md`
- **Assets**: `/assets/css`, `/assets/js`, `/assets/img`
- **Dokumentace a testy**: `/dev/docs`, `/dev/tests` (nenasazuje se na produkci)

### Rozšíření funkcionality

#### Možné budoucí vylepšení:
1. **Export výsledků**: Umožnit export prstokladu jako PDF nebo obrázek
2. **Historie**: Ukládání nedávných sekvencí do localStorage
3. **Příklady**: Galerie předpřipravených sekvencí (stupnice, arpeggia)
4. **Nastavení**: Možnost upravit váhy algoritmu (pro pokročilé uživatele)
5. **Více nástrojů**: Rozšíření na violu, kontrabas

#### Technické úpravy:
- Pokud bude potřeba rozbalovací seznam s vyhledáváním, implementovat vanilla JS komponentu (styl Select2)
- Přidat `.htaccess` pro správné routování
- Zvážit přidání service worker pro offline funkcionalitu

### Testování
- Všechny testy jsou v `/dev/tests/test.html`
- Při úpravách algoritmu vždy spusť testy a ověř, že všechny procházejí
- Pokud algoritmus vrací jiný (ale stále správný) výsledek, aktualizuj očekávané hodnoty v `assets/js/tests.js`

### Dokumentace
- Všechna dokumentace je v `/dev/docs/`
- Při přidávání nových funkcí aktualizuj příslušné dokumentační soubory
- `main.md` je rozcestník, `roadmap.md` obsahuje seznam úkolů


