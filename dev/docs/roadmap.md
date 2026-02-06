# Roadmapa - Opravy podle .cursorrules

## 🔴 Kritické nedostatky

### 1. UI Standardy - Chybějící prvky

#### 1.1 SVG Logo
- **Status**: ✅ Hotovo
- **Soubor**: `assets/img/logo.svg` (vytvořeno)
- **Implementace**: Logo přidáno do headeru v `index.php` a `dev/tests/test.php` (topbar partial), odkazuje na homepage

#### 1.2 Favicon
- **Status**: ✅ Hotovo
- **Soubor**: `assets/img/favicon.svg` (vytvořeno)
- **Implementace**: Favicon přidána do `<head>` obou HTML souborů

#### 1.3 Sémantické menu
- **Status**: ✅ Hotovo
- **Implementace**: `<nav>` element s 3 položkami (Home, Testy, Dokumentace) přidán do headeru
- **Mobilní**: Hamburger menu implementováno s JavaScript toggle funkcí

#### 1.4 Footer s copyright Sensio.cz
- **Status**: ✅ Hotovo
- **Implementace**: `<footer>` přidán na konec obou HTML souborů s copyrightem a odkazem na Sensio.cz

### 2. CSS - Převod na CSS proměnné

#### 2.1 Barvy v inline stylech
- **Status**: ✅ Hotovo
- **Soubor**: `assets/css/main.css` vytvořen
- **Implementace**: 
  - Všechny inline `<style>` tagy přesunuty do CSS souboru
  - Všechny hardcodované barvy převedeny na CSS proměnné
  - Barvy z JS (canvas) nyní používají CSS proměnné přes `getComputedStyle`

#### 2.2 Design systém
- **Status**: ✅ Hotovo
- **Implementace**: 
  - Kompletní design systém s CSS proměnnými pro:
    - Barvy (primary, secondary, background, text, borders, status)
    - Spacing (8px base unit, xs až 3xl)
    - Typography (font sizes, weights, line heights)
    - Border radius (sm až full)
    - Shadows (sm až 2xl)
    - Transitions
  - Light/Dark mode podpora:
    - Automatické přepínání přes `@media (prefers-color-scheme: dark)`
    - Manuální přepínání přes třídu `.dark-mode` na `<body>`

### 3. Struktura složek

#### 3.1 Přesun JS souborů
- **Status**: ✅ Hotovo
- **Soubory přesunuty**: 
  - `js/fingering.js` → `assets/js/fingering.js`
  - `js/ui.js` → `assets/js/ui.js`
  - `js/tests.js` → `assets/js/tests.js`
- **Aktualizace**: Cesty upraveny v `index.html` a `dev/tests/test.html`
- **ESM moduly**: JS soubory převedeny na ES6 moduly s `export`/`import`

#### 3.2 Přesun test.html
- **Status**: ✅ Hotovo
- **Soubor přesunut**: `test.html` → `dev/tests/test.html` (nyní `dev/tests/test.php`)
- **Aktualizace**: Cesty k JS souborům upraveny na relativní (`../../assets/js/`)

#### 3.3 Vytvoření chybějících složek
- **Status**: ✅ Hotovo
- **Vytvořené složky**:
  - `assets/css/` (připraveno pro budoucí CSS)
  - `assets/img/` (obsahuje logo.svg a favicon.svg)
  - `dev/tests/` (obsahuje test.php)
  - `dev/sql/` (připraveno pro budoucí SQL)

#### 3.4 Root soubory
- **Status**: ✅ Hotovo
- **Implementace**:
  - Vytvořen `.htaccess` (Apache konfigurace, komprese, cache, zabezpečení)
  - Vytvořen `.gitignore` (OS soubory, editor soubory, logy, dočasné soubory)
  - Root obsahuje: `index.php`, `.htaccess`, `.gitignore`, `README.md`, `.cursorrules`

### 4. HTML - Sémantika a přístupnost

#### 4.1 Sémantické značky
- **Status**: ✅ Hotovo
- **Implementace**:
  - `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>` správně použity v `index.php` (header/footer v partials)
  - `<main>` v `test.php` kolem hlavního obsahu
  - Hierarchie nadpisů: `<h1>` v headeru, `<h2>` v sekcích, `<h3>` v podsekci

#### 4.2 SEO a přístupnost
- **Status**: ✅ Hotovo
- **Implementace**:
  - `<meta name="description">`, `<meta name="keywords">`, `<meta name="author">` přidány
  - Open Graph a Twitter Card meta tagy přidány
  - `alt` atributy u všech obrázků (logo)
  - ARIA atributy u tlačítek (`aria-label` pro dark mode toggle, mobile menu)
  - `lang="cs"` nastaveno na `<html>`

### 5. JavaScript - ESM moduly

#### 5.1 Převod na ES6 moduly
- **Status**: ✅ Hotovo
- **Implementace**:
  - Přidán `export` v `assets/js/fingering.js`
  - Přidán `export` v `assets/js/tests.js`
  - Přidán `import { solve, model }` v `assets/js/ui.js`
  - Změněno `<script src>` na `<script type="module">` v HTML souborech
  - Testy používají ESM importy v inline scriptu
  - Vytvořen `assets/js/navigation.js` pro společné navigační funkce
  - Vytvořen `assets/js/test-runner.js` pro UI test runneru
  - Všechny inline JavaScripty přesunuty do modulů (včetně `toggleJson()`)

## 🟡 Doplňkové úkoly

### 6. Responzivita
- **Status**: ✅ Částečně (používá Tailwind)
- **Úkol**: Ověřit responzivitu na:
  - Small Mobile (320px)
  - Tablet (768px)
  - Ultra-Wide / 4K
  - Content Stress Test (dlouhé texty)

### 7. Light/Dark mode
- **Status**: ✅ Hotovo
- **Implementace**:
  - Přepínač dark mode v headeru (ikona měsíce/slunce)
  - Automatická detekce systémové preference (`prefers-color-scheme`)
  - Ukládání preference do `localStorage`
  - CSS proměnné pro light/dark mode v `main.css`
  - Překreslení **notové osnovy i canvasu** při změně tématu (`runSolver` používá `lastResult`/`lastInput` při prázdném vstupu)
  - Notová osnova: bílé pozadí + černé prvky (light), tmavé pozadí + bílé prvky (dark); `.staff-output`, `--color-staff-ink`, `--color-staff-bg`
  - Implementováno v `assets/js/navigation.js` a `ui.js`

### 8. Dokumentace
- **Status**: ✅ Hotovo
- **Poznámka**: Dokumentace je v `dev/docs/`, ale měla by být aktualizována o nové změny

### 9. Správa testů (lokálně → DB)
- **Status**: 🟡 Rozpracováno
- **Fáze 1 (lokálně)**:
  - Tlačítko **„Uložit jako test“** na Home ukládá aktuální vstup + prstoklad do `localStorage`.
  - Stránka **Testy** spouští statické testy + testy z `localStorage`.
- **Fáze 2 (DB)**:
  - Uložení testů do DB (REST endpointy).
  - Všechny současné testy migrovat do DB.
  - Na Testy přidat tlačítka **Upravit** a **Smazat**.
  - Na Home při editaci testu zobrazit **Uložit** a **Uložit jako nový**.
  - Tlačítko **Uložit jako test** zůstává pro přidání nového testu mimo editaci.
  - **Admin režim**: přidávání/úpravy/mazání dostupné jen při speciálním GET parametru,
    který se přenáší mezi Home a Testy.

### 10. Ukládání uživatelských sekvencí a prstokladů (DB + verze)
- **Status**: 🔴 Nezahájeno
- **Cíl**: ukládat **tónové sekvence** a **verze prstokladů** (včetně `userDefined`) do DB.
- **Flow na Home**:
  1. Uživatel zadá sekvenci tónů a klikne **Navrhnout prstoklad**.
  2. **Okamžitě** se uloží sekvence tónů do DB a vrátí se `sequence_id`.
  3. Při každé úpravě prstokladu se uloží **nová verze** (soft-delete předchozí).
  4. Pokud se změní sekvence tónů, vytvoří se **nové `sequence_id`**.
- **Verzování (soft-delete)**:
  - při nové verzi se u staré nastaví `valid_to`,
  - aktuální verze má `valid_to = NULL`.

#### 10.1 DB schéma – sekvence
- **Tabulka `sequences`**
  - `id` (INT, AI, PK)
  - `input_json` (JSON) – původní tokeny
  - `input_normalized_json` (JSON) – normalizace pro solver
  - `created_at` (DATETIME)
  - `updated_at` (DATETIME)

#### 10.2 DB schéma – prstoklady (verze)
- **Tabulka `fingerings`**
  - `id` (INT, AI, PK)
  - `sequence_id` (INT, FK → `sequences.id`)
  - `json` (JSON) – celý prstoklad `{s,p,f,ext,userDefined}`
  - `valid_from` (DATETIME)
  - `valid_to` (DATETIME, NULL = aktivní)

#### 10.3 DB schéma – testy
- **Tabulka `tests`**
  - `id` (INT, AI, PK)
  - `name` (VARCHAR)
  - `description` (TEXT, NULL)
  - `input_json` (JSON)
  - `expected_json` (JSON) – `{s,p,f,ext}` pro každý tón
  - `valid_from` (DATETIME)
  - `valid_to` (DATETIME, NULL = aktivní)
  - `created_at` (DATETIME)
  - `updated_at` (DATETIME)

#### 10.4 REST API (návrh)
- `POST /api/sequences` → vytvoří sekvenci, vrací `sequence_id`
- `POST /api/fingerings` → uloží novou verzi prstokladu k `sequence_id`
- `GET /api/sequences/{id}` → načte sekvenci + poslední prstoklad
- `GET /api/tests` → aktivní testy
- `POST /api/tests` → vytvoří nový test (admin režim)
- `PUT /api/tests/{id}` → upraví test (admin režim, soft-delete staré verze)
- `DELETE /api/tests/{id}` → soft-delete (admin režim)

#### 10.5 Admin režim (GET token)
- Speciální GET parametr (např. `?admin=1` nebo token) **přenášený** mezi Home/Testy.
- Bez parametru jsou **tlačítka pro správu** skryta.
- V admin režimu:
  - Testy: **Upravit** / **Smazat**
  - Home při editaci testu: **Uložit** / **Uložit jako nový**
  - Home mimo editaci testu: **Uložit jako test**

#### 10.6 Front-end integrace (zatím chybí)
- Po `solve` uložit sekvenci do DB a uložit `sequence_id` do stavu.
- Při změně prstokladu poslat **celý JSON** se `userDefined`.
- Načítání posledního stavu **ze serveru** (místo `localStorage`).

### 11. Refaktoring ui.js (délka souborů, .cursorrules)
- **Status**: 🔴 Nezahájeno
- **Důvod**: Soubor `assets/js/ui.js` má přes 2000 řádků; předpis .cursorrules uvádí soft limit **max. 600 řádků** na JS soubor a doporučuje rozdělení podle Single Responsibility.
- **Cíl**: Rozdělit logiku do více modulů, každý soubor do cca 600 řádků, zachovat funkčnost a projít testy.
- **Návrh rozdělení** (orientační):
  - **ui-results.js** – vykreslení výsledků (path display, notová osnova VexFlow, legend), překreslení při změně tématu/jazyka.
  - **ui-fingerboard.js** – vykreslení hmatníku (Canvas), proporční pozice, barvy strun, interakce s editací.
  - **ui-modals.js** – modaly (Uložit jako test, editace prstu/struny/polohy), otevření/zavření, validace.
  - **ui-settings.js** – sekce Nastavení (formát výstupu, označení poloh, H/B), napojení na localStorage a překreslení výstupu.
  - **ui.js** – inicializace (`initUI`), napojení událostí (tlačítka, input, menu), volání solveru, sdílený stav (`lastResult`, `lastInput`, režim editace), import a sestavení výše uvedených modulů.
- **Postup**: Refaktorovat po částech (jeden modul po druhém), po každém kroku spustit testy a ověřit chování na hlavní stránce. Aktualizovat `index.php` (případně další script tagy pro nové moduly nebo jeden entry point).

## 📋 Priorita úkolů

### Fáze 1 - Kritické (musí být hotovo) ✅ DOKONČENO
1. ✅ SVG Logo + Favicon
2. ✅ Footer s copyright
3. ✅ Přesun souborů do správné struktury (`assets/`, `dev/tests/`)
4. ✅ Aktualizace cest v HTML souborech
5. ✅ ESM moduly

### Fáze 2 - Důležité
5. Sémantické menu
6. CSS proměnné (design systém)
7. Převod na ESM moduly

### Fáze 3 - Vylepšení ✅ DOKONČENO
8. ✅ SEO a přístupnost (meta tagy, OpenGraph, obsah homepage)
9. ✅ Light/Dark mode (hotovo v Fázi 2)
10. ✅ Responzivita testy (utility třídy, word-break, touch-target)
11. ✅ Obsah homepage (sekce O aplikaci a Hlavní funkce)
12. ✅ Menu úpravy (přesun "O aplikaci" do menu, odstranění "Dokumentace", oprava mobilního menu)
13. ✅ Canvas vylepšení (správné pozice tónů, různé tloušťky strun, barvy podle tématu)
14. ✅ Skrývání celého `<main>` místo jen sekcí
15. ✅ Notová osnova (VexFlow): basový klíč, celé noty, anotace polohy/prsty/tóny, barevné struny, horizontální scroll
16. ✅ Sekce Nastavení: skrývatelná, Formát výstupu (Notová osnova / Textový výstup)
17. ✅ Notová osnova bez borderu; pozadí a barvy dle tématu (`--color-staff-bg`, `--color-staff-ink`)

### Fáze 4 - Technický dluh (plán)
18. **Refaktoring ui.js** – rozdělení do modulů (cílově max. 600 řádků/soubor), viz bod 11 v Doplňkových úkolech.

## 📝 Poznámky

- **Únor 2026:** Doplněna stránka Přístupnost (`accessibility.php`), odkaz v patičce, cache-busting (CSS/JS), klávesové zkratky (dokumentace + tooltip u tlačítka Solve), třetí odstavec v O aplikaci (odkaz na přístupnost a zkratky). Dokumentace (`main.md`, `ui.md`) a audit aktualizovány.
- Projekt je **client-side** aplikace (PHP jen pro layout), takže PHP audit je omezený
- **Tailwind CSS** přes CDN je záměrná volba (rychlý vývoj UI); .cursorrules preferuje sémantické CSS – design systém zůstává v `main.css`
- **VexFlow** (CDN, CJS 4.2.5) pro vykreslení notové osnovy (basový klíč, celé noty, anotace polohy/prsty/tóny, posuvky před notou)
- **Nastavení**: skrývatelná sekce pod výstupem, Formát výstupu (Notová osnova / Textový výstup)
- **Překreslení při změně tématu**: `runSolver` při prázdném vstupu překreslí z `lastResult`/`lastInput`; notová osnova i hmatník respektují světlé/tmavé téma
- **Enharmonické záměny**: pouze pro algoritmus (flatToSharpMap, sharpToNaturalMap), VexFlow zobrazuje noty přesně jak zadané
- **Alternativní formát**: podpora `c#1` místo `c1#` (automatická konverze)
- **Hmatník**: černý pozadí (light i dark), proporční spacing (geometrická řada k=0.92), menší rozestup I. polohy (14% z šířky)
- **Multijazyčnost (i18n)**: čeština (výchozí) a angličtina; `assets/js/i18n.js`, `assets/i18n/cs.json` / `en.json`; `data-i18n`, `t(key)`; jazyk a **označení H/B** (H/Hes vs. B/Bb) v Nastavení, ukládání do `localStorage`; snadné přidání dalších jazyků
- Testy jsou funkční a procházejí (včetně 14 testů stupnic); test-runner používá i18n (`t()`, `nameKey`/`descriptionKey`)
- Algoritmus je dobře zdokumentovaný
- Všechny JavaScripty jsou oddělené do ESM modulů v `/assets/js/`
- Root soubory: `index.php`, `.htaccess`, `.gitignore`, `README.md`, `.cursorrules`

