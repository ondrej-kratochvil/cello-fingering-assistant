# Uživatelské rozhraní

## CSS Design System – `assets/css/main.css`

Aplikace používá centralizovaný design systém založený na CSS proměnných.

### Hlavní CSS proměnné

#### Barvy strun (specifické pro aplikaci)
- `--cello-string-c`: #1a1a1b (téměř černá)
- `--cello-string-g`: #1d4ed8 (sytě modrá)
- `--cello-string-d`: #ea580c (oranžová)
- `--cello-string-a`: #a21caf (fialovo-purpurová)

#### Primární barvy
- `--color-primary`: #4f46e5 (indigo)
- `--color-primary-dark`: #312e81
- `--color-primary-light`: #6366f1
- `--color-primary-hover`: #4338ca

#### Background barvy
- `--color-bg-primary`: #ffffff (light) / #0f172a (dark)
- `--color-bg-secondary`: #f8fafc (light) / #1e293b (dark)
- `--color-bg-tertiary`: #f1f5f9 (light) / #334155 (dark)
- `--color-bg-header`: #1e1b4b
- `--color-bg-canvas`: #f8fafc (light) / #1e293b (dark)

#### Text barvy
- `--color-text-primary`: #0f172a (light) / #f1f5f9 (dark)
- `--color-text-secondary`: #64748b
- `--color-text-tertiary`: #94a3b8
- `--color-text-inverse`: #ffffff (light) / #0f172a (dark)

#### Status barvy
- `--color-success`: #10b981
- `--color-success-bg`: #d1fae5 (light) / #064e3b (dark)
- `--color-error`: #ef4444
- `--color-error-bg`: #fee2e2 (light) / #7f1d1d (dark)
- `--color-warning`: #f59e0b
- `--color-warning-bg`: #fef3c7 (light) / #78350f (dark)

#### Fingering specifické barvy
- `--color-narrow`: #1e40af
- `--color-narrow-bg`: #eff6ff (light) / #1e3a8a (dark)
- `--color-wide`: #92400e
- `--color-wide-bg`: #fffbeb (light) / #78350f (dark)
- `--color-wide-extended`: #f59e0b (jantarová pro širokou polohu)

#### Canvas barvy
- `--color-canvas-bg`: #f8fafc (light) / #1e293b (dark)
- `--color-canvas-string`: #e2e8f0 (light, světlejší) / #334155 (dark, tmavší)
- `--color-canvas-fret`: #cbd5e1 (light, světlejší) / #475569 (dark, tmavší)
- `--color-canvas-text`: #475569 (light, tmavší) / #e2e8f0 (dark, světlejší)
- `--color-canvas-stroke`: #ffffff

#### Spacing (8px base unit)
- `--spacing-xs`: 0.25rem (4px)
- `--spacing-sm`: 0.5rem (8px)
- `--spacing-md`: 1rem (16px)
- `--spacing-lg`: 1.5rem (24px)
- `--spacing-xl`: 2rem (32px)
- `--spacing-2xl`: 3rem (48px)
- `--spacing-3xl`: 4rem (64px)

#### Typografie
- `--font-family-base`: system font stack
- `--font-family-mono`: 'Courier New', Courier, monospace
- `--font-size-xs` až `--font-size-3xl`: 12px až 30px
- `--line-height-tight`: 1.25
- `--line-height-normal`: 1.5
- `--line-height-relaxed`: 1.75

### Light/Dark Mode

Design systém podporuje automatické přepínání podle `prefers-color-scheme` a manuální přepínání pomocí třídy `.dark-mode` na `<body>` elementu.

### Sémantické třídy

- `.concat-id`: Monospace font pro ID prstokladu
- `.narrow`: Styl pro úzkou polohu
- `.wide`: Styl pro širokou polohu
- `.result-step`: Animace pro výsledky
- `.test-pass`, `.test-fail`, `.test-running`: Stavy testů
- `.word-break`: Zalamování dlouhých textů
- `.touch-target`: Minimální velikost 44x44px pro dotykové prvky

## SEO a Meta tagy

Aplikace obsahuje kompletní SEO meta tagy v `<head>`:
- **Title**: "Cello Fingering Assistant - Nástroj pro optimální prstoklad violoncella"
- **Description**: Detailní popis účelu aplikace
- **Keywords**: violoncello, cello, prstoklad, fingering, hmatník
- **Open Graph**: Tagy pro sdílení na sociálních sítích
- **Twitter Card**: Metadata pro Twitter
- **Lang**: `lang="cs"` správně nastaveno

## Obsah Homepage

Homepage obsahuje dvě hlavní sekce před vstupním formulářem, které jsou skrývatelné:

### Sekce "O aplikaci"
Stručný popis účelu aplikace, algoritmu a jeho priorit (polohová stabilita, minimalizace posunů, preferencia nižších poloh).

### Sekce "Hlavní funkce"
Grid se 4 kartami funkcí:
1. **Inteligentní algoritmus** - popis optimalizačního algoritmu
2. **Vizuální hmatník** - Canvas vizualizace
3. **Textový výstup** - Barevný textový prstoklad
4. **Dark Mode** - Podpora světlého/tmavého režimu

**Skrývání sekcí:**
- Obě sekce jsou obaleny v `<main>` elementu
- Kliknutím na "O aplikaci" v menu se přepíná viditelnost celého `<main>` elementu
- Stav (skryté/zobrazené) se ukládá do `localStorage` pod klíčem `aboutCollapsed`
- Při spuštění solveru (kliknutí na "Navrhnout prstoklad" nebo Enter) se sekce automaticky skryjí, aby ušetřily místo
- Skrývání celého `<main>` místo jen sekcí odstraňuje bílé místo z padding `p-8`

## Hlavní stránka – `index.html`

Stránka `index.html` je hlavním vstupním bodem aplikace **Cello Fingering Assistant**.

### Hlavní prvky

- **Header s logem a menu**
  - SVG logo (`assets/img/logo.svg`) v levém horním rohu, odkazující na `index.html` (relativní cesta)
  - Sémantické `<nav>` menu s položkami:
    - Home (index.html)
    - Testy (dev/tests/test.html)
    - O aplikaci (přepíná viditelnost sekce "O aplikaci" a "Hlavní funkce")
  - Dark Mode toggle tlačítko (ikonka měsíce/slunce)
  - Hamburger menu pro mobilní zobrazení (pravý horní roh)
    - Menu se zobrazuje pod hamburgerem (`top-28`, 7rem)
    - Položky menu mají větší mezery (`gap-5`) a padding (`py-1`) pro lepší klikatelnost na mobilu
  - Nadpis: „Cello Fingering Assistant"
  - Podtitul: „Pro zadané tóny doporučí vhodný prstoklad"

- **Vstupní pole pro tóny**
  - `<input id="melodyInput">` – textové pole pro sekvenci tónů, např.:
    - `C c c1 c1# gb`
  - Tóny se zadávají:
    - s rozlišením oktáv (`c`, `c1`, `d1`, `e1`…),
    - s posuvkami (`#` a `b` – např. `f#`, `gb`),
    - oddělené mezerou.
  - Label vysvětluje formát zadání.

- **Akční tlačítko**
  - Text: „Navrhnout prstoklad“.
  - Volá funkci `runSolver()` z `js/ui.js`.

- **Výstupní oblast**
  - `#resultsWrapper` (na začátku skrytý) obsahuje:
    - `#pathDisplay` – textovou vizualizaci prstokladu:
      - horní řádek: římské číslice poloh, zobrazené pouze na začátku a při změně polohy (p > 0),
      - prostřední řádek: čísla prstů barevně podle struny, se šipkou `↑` pro širokou polohu (`ext === 1`),
      - spodní řádek: zadané tóny přesně tak, jak je uživatel napsal.
    - `<canvas id="fretboardCanvas">` – vizualizace hmatníku ve 2D (4 struny, polohy 1–12).

- **JSON model**
  - Tlačítko „Zobrazit JSON Model" přepíná viditelnost bloku s JSON reprezentací `model` z `assets/js/fingering.js`.

- **Footer**
  - Copyright: „© 2025 Sensio.cz s.r.o." s odkazem na https://www.sensio.cz

- **Favicon**
  - SVG favicon (`assets/img/favicon.svg`) definovaný v `<head>`

## Logika UI – `assets/js/ui.js`

### Funkce `runSolver()`

Zodpovídá za:

1. Načtení vstupu:
   - přečte hodnotu z `#melodyInput`,
   - rozdělí ji na pole tónů pomocí whitespace.

2. Mapování béček na enharmonické křížky:
   - např. `gb` → `f#`, `db` → `c#` apod.,
   - výpočet probíhá nad „sharp“ variantou,
   - ale ve výstupu se zobrazují původní tokeny z inputu.

3. Volání algoritmu:
   - `solve(inputForSolve)` z `assets/js/fingering.js` (import jako ESM modul).

4. Vykreslení textového prstokladu:
   - výsledná cesta `result` se renderuje do tří řádků (poloha, prst, tón),
   - barvy prstů podle strun jsou načtené z CSS proměnných:
     - `--cello-string-c`, `--cello-string-g`, `--cello-string-d`, `--cello-string-a`.

5. Vykreslení hmatníku na Canvas:
   - volá `drawFingerboard(result, input)`.

### Funkce `drawFingerboard(path, input)`

Pracuje s `<canvas id="fretboardCanvas">` o šířce 1000 px a výšce 400 px.

- Vykreslí 4 horizontální struny:
  - pořadí shora dolů: A, D, G, C,
  - každá struna má vlastní barvu z CSS proměnné,
  - **různé tloušťky strun**: C (4px), G (3px), D (2.5px), A (2px),
  - barva čar: světlejší pro světlé téma (`#e2e8f0`), tmavší pro tmavé téma (`#334155`).

- Vykreslí vertikální značky pro pozice 1–12:
  - jemné vertikální linky (barva podle tématu),
  - nahoře se zobrazí číslo polohy římsky (I–XII…) - tmavší/světlejší podle tématu.

- Vykreslí prázdné struny (pozice 0):
  - vlevo před „nultým pražcem",
  - jako barevný kruh s číslem 0 a textem tónu pod ním.

- Vypočítá souřadnice všech bodů:
  - **osa X**: vypočítává se podle vzdálenosti od prázdné struny (`targetS`), ne podle polohy:
    - Pro úzkou polohu: `targetS = p + (f - 1)`
    - Pro širokou polohu: `targetS = p + offset` (offset je 2, 3 nebo 4 pro prsty 2, 3, 4)
    - Pozice na canvasu: `x = leftMargin + (targetS * fretSpacing)`
  - **osa Y**: struna (A–C).

- Propojí body čárkovanou čárou:
  - viditelná trajektorie pohybu ruky a přeskoky strun.

- Vykreslí body pro každý tón:
  - kruh:
    - barva podle struny,
    - nebo jantarová (`#f59e0b`) pro širokou polohu (`ext === 1`),
  - uvnitř číslo prstu (tučné),
  - pod bodem název tónu (tučné, tmavší/světlejší podle tématu) - převzatý z původního vstupu.

### Funkce `toggleJson()`

Jednoduché přepínání `hidden` třídy na `#jsonContainer`.

### Inicializace (`DOMContentLoaded`)

- Naplní `#jsonDisplay` JSON reprezentací `model`.
- Pokud je v URL parametr `sequence`, nastaví ho do `#melodyInput`.
- Automaticky spustí `runSolver(true)` pro výchozí či zadanou sekvenci (bez automatického skrývání sekcí).
- Inicializuje skrývání/zobrazení sekce "O aplikaci" podle `localStorage.getItem('aboutCollapsed')`.
- Přidá event listenery na odkazy "O aplikaci" v menu (desktop i mobilní).
- Přidá event listener na Enter klávesu v input poli pro spuštění solveru.


