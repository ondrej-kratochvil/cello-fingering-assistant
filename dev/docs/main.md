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

- `index.php` – hlavní stránka aplikace **Cello Fingering Assistant**, input sekvence tónů, vizualizace prstokladu a hmatníku (Canvas). PHP includuje topbar a footer.
- `assets/js/fingering.js` – model hmatníku a hlavní algoritmus `solve(sequence)`.
- `assets/js/ui.js` – napojení UI na algoritmus, vykreslení prstokladu a vizualizace hmatníku.
- `assets/js/i18n.js` – vlastní i18n modul: načítání JSON z `assets/i18n/`, `t(key)`, jazyk a H/B v `localStorage`, `applyTranslations()`.
- `assets/i18n/cs.json`, `assets/i18n/en.json` – překlady UI, O aplikaci, Hlavní funkce, Tóny/prsty/polohy, testů; snadné přidání dalších jazyků.
- `assets/js/tests.js` – sada testů nad algoritmem a pomocný test runner.
- `assets/js/test-runner.js` – UI test runneru pro `dev/tests/test.php` (notová osnova, i18n).
- `dev/tests/test.php` – samostatná stránka pro běh a vizuální zobrazení testů v prohlížeči.
- `assets/css/main.css` – centralizovaný design systém s CSS proměnnými a Light/Dark mode podporou.

Projekt používá **PHP** pro layout (hlavička a patička v `assets/partials/`); logika a UI běží v prohlížeči, databáze není. Podporuje **multijazyčnost** (Čeština, English) a **označení tónu H/B** (H/Hes vs. B/Bb) v Nastavení.

## Jak pokračovat v budoucím vývoji

### Technický stack
- **Frontend**: HTML5, CSS3 (design systém s CSS proměnnými), Vanilla JavaScript (ES6+ moduly)
- **Build tools**: Žádné (čistý vanilla stack)
- **Dependencies**: Pouze Tailwind CSS přes CDN (pro rychlý vývoj UI)

### Architektura
- **Struktura**: Root obsahuje `index.php`, `.htaccess`, `.gitignore`, `README.md`, `.cursorrules`
- **Assets**: `/assets/css`, `/assets/js`, `/assets/img`, `/assets/i18n` (cs.json, en.json); VexFlow (CDN, CJS build)
- **Dokumentace a testy**: `/dev/docs`, `/dev/tests` (nenasazuje se na produkci)
- **i18n**: Vlastní modul `i18n.js`, překlady v JSON; jazyk a H/B ukládány do `localStorage`

### Rozšíření funkcionality

#### Možné budoucí vylepšení:
1. **Export výsledků**: Umožnit export prstokladu jako PDF nebo obrázek
2. **Historie**: Ukládání nedávných sekvencí do localStorage
3. **Příklady**: Galerie předpřipravených sekvencí (stupnice, arpeggia) – základní testy stupnic jsou již implementovány
4. **Nastavení – váhy algoritmu**: Možnost upravit váhy algoritmu (pro pokročilé uživatele); formát výstupu (notová osnova / text) je již implementován
5. **Více nástrojů**: Rozšíření na violu, kontrabas

#### Technické úpravy:
- Pokud bude potřeba rozbalovací seznam s vyhledáváním, implementovat vanilla JS komponentu (styl Select2)
- Přidat `.htaccess` pro správné routování
- Zvážit přidání service worker pro offline funkcionalitu

### Testování
- Všechny testy jsou v `/dev/tests/test.php`
- Při úpravách algoritmu vždy spusť testy a ověř, že všechny procházejí
- Pokud algoritmus vrací jiný (ale stále správný) výsledek, aktualizuj očekávané hodnoty v `assets/js/tests.js`

### Dokumentace
- Všechna dokumentace je v `/dev/docs/`
- Při přidávání nových funkcí aktualizuj příslušné dokumentační soubory
- `main.md` je rozcestník, `roadmap.md` obsahuje seznam úkolů


