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

#### Hmatník barvy (vždy černý, light i dark)
- `--color-fingerboard`: #0d0d0d (černé pozadí hmatníku)
- `--color-fingerboard-string`: #505050 (struny na hmatníku)
- `--color-fingerboard-fret`: #404040 (pražce/polohy)
- `--color-fingerboard-text`: #b0b0b0 (text na hmatníku)
- `--color-fingerboard-stroke`: #e0e0e0 (obrysy bodů)

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

Design systém podporuje automatické přepínání podle `prefers-color-scheme` a manuální přepínání pomocí třídy `.dark-mode` na `<body>` elementu. Při změně dark mode se automaticky překreslí notové osnovy a hmatník pomocí callback `setCanvasRedrawCallback`.

### Sémantické třídy

- `.concat-id`: Monospace font pro ID prstokladu
- `.narrow`: Styl pro úzkou polohu
- `.wide`: Styl pro širokou polohu
- `.staff-output`: Kontejner notové osnovy (VexFlow); pozadí a barvy dle tématu
- `.result-step`: Animace pro výsledky
- `.test-pass`, `.test-fail`, `.test-running`: Stavy testů
- `.word-break`: Zalamování dlouhých textů
- `.touch-target`: Minimální velikost 44x44px pro dotykové prvky

### Multijazyčnost (i18n)

- **Modul**: `assets/js/i18n.js` – vlastní lehký i18n bez závislostí.
- **Překlady**: `assets/i18n/cs.json`, `assets/i18n/en.json`; snadné přidání dalších jazyků.
- **Funkce**: `t(key)`, `t(key, { var: value })` pro interpolaci; `setLanguage(locale)`, `getLanguage()`; `setNoteNaming('H'|'B')`, `getNoteNaming()`; `applyTranslations()` pro `[data-i18n]`, `[data-i18n-html]`, `[data-i18n-aria-label]` a `[data-i18n-title]` (atribut `title` pro tooltipy).
- **Ukládání**: jazyk a H/B v `localStorage`; při načtení `initI18n()` načte locale, aplikuje překlady, nastaví `lang` na `<html>`.
- **Bootstrap**: `index.php`, `accessibility.php` a `dev/tests/test.php` volají `await initI18n()`; index a test dále `initUI()` resp. `runAllTests()`. Při změně jazyka se překreslí UI a výstup (`runSolver({ skipHideAbout: true, preserveState: true })`).

### Přístupnost a klávesové zkratky

- **Stránka Přístupnost** (`accessibility.php`): Prohlášení o přístupnosti (úroveň souladu WCAG 2.1, kontakt Sensio.cz, datum revize) a sekce Klávesové zkratky (Enter, Escape). Odkaz v patičce na všech stránkách (`nav.accessibility`).
- **Tooltip u hlavní akce**: Tlačítko „Navrhnout prstoklad“ má `data-i18n-title="aria.solveShortcut"` – zobrazí např. „Navrhnout prstoklad (Enter)“.
- **Klávesové zkratky**: Enter v poli pro tóny spustí návrh prstokladu; Escape zavře otevřený dialog (modal).

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
Stručný popis účelu aplikace, algoritmu a jeho priorit (polohová stabilita, minimalizace posunů, preferencia nižších poloh). Odkaz na přístupnost a klávesové zkratky je v kartě Technické vychytávky (Hlavní funkce).

### Sekce "Hlavní funkce"
Grid se **4 kartami**:
- **1–3. Stěžejní funkce**: (1) **Inteligentní algoritmus** – optimalizace prstokladu; (2) **Notová osnova a textový výstup** – VexFlow nebo text, přepínání v Nastavení; (3) **Vizuální hmatník** – Canvas, černé pozadí, proporční rozestupy.
- **4. Technické vychytávky** – světlé/tmavé téma (dle zařízení nebo v menu), vícejazyčnost (vlajky v menu), označení H/B v Nastavení, testovací stránka.

**Skrývání sekcí:**
- Obě sekce jsou obaleny v `<main>` elementu
- Kliknutím na "O aplikaci" v menu se přepíná viditelnost celého `<main>` elementu
- Stav (skryté/zobrazené) se ukládá do `localStorage` pod klíčem `aboutCollapsed`
- Při spuštění solveru (kliknutí na "Navrhnout prstoklad" nebo Enter) se sekce automaticky skryjí, aby ušetřily místo
- Skrývání celého `<main>` místo jen sekcí odstraňuje bílé místo z padding `p-8`

## Hlavní stránka – `index.php`

Stránka `index.php` je hlavním vstupním bodem aplikace **Cello Fingering Assistant**.

### Hlavní prvky

- **Společný layout (PHP includes)**
  - `assets/partials/topbar.php` – header (logo, **jednotné menu**, h1, tagline). Očekává `$base`, `$pageTitle`, `$pageTitleKey`, `$taglineKey`, `$taglineFallback`. Nadpis má `data-i18n` atribut pro aktualizaci při změně jazyka.
  - `assets/partials/footer.php` – patička (copyright Sensio.cz, odkaz Přístupnost). Očekává `$base` (prázdný v rootu, `../../` v dev/tests).
  - `index.php`, `accessibility.php` a `dev/tests/test.php` nastaví proměnné a volají `require …/topbar.php` resp. `footer.php`. Hlavička a patička jsou v prvním HTML (SEO, bez JS).

- **Header a jednotné menu**
  - **Jedno menu** (`#mainNav`), žádná duplikace desktop/mobil. Na desktopu viditelné v řádku (`.main-nav`), na mobilu skryté; hamburger (`#menuToggle`) přepíná `body.nav-open`, CSS zobrazí menu jako overlay.
  - **Hamburger menu**: Vždy viditelný v pravém horním rohu, neobtéká nadpis. CSS zajišťuje správné zkrácení nadpisu (`truncate`) a flex-shrink pro hamburger tlačítko.
  - Položky: Home, Testy, O aplikaci, přepínač Dark/Light, vlajky jazyka (🇨🇿 🇬🇧). O aplikaci na indexu: `preventDefault` + toggle sekce; na testu odkaz na `index.php`.
  - Nadpis a tagline z PHP (`$pageTitle`, `$pageTitleKey`, `$taglineKey`, `$taglineFallback`); i18n doplní překlady v prohlížeči. Nadpis má `data-i18n` atribut a aktualizuje se při změně jazyka.

- **Label/input a ovládací tlačítka**
  - Vstup tónů: `<label for="melodyInput">` asociované s `<input id="melodyInput">`.
  - Pod inputem jsou tlačítka: **Navrhnout prstoklad**, **Editovat prstoklad** (toggle) a **Nastavení** (toggle, rozbalí panel pod tlačítky).
  - Sekce Nastavení používá skupinové popisky (Formát výstupu, Označení poloh, H/B) jako `<span>`, ne `<label>`.

- **Karty „Hlavní funkce“**
  - Popisky s HTML (např. `<strong>`) používají `data-i18n-html`; `applyTranslations` nastaví `innerHTML`.

- **Vstupní pole pro tóny**
  - `<input id="melodyInput">` – textové pole pro sekvenci tónů, např.:
    - `C c c1 c1# gb`
  - Tóny se zadávají:
    - s rozlišením oktáv (`c`, `c1`, `d1`, `e1`…),
    - s posuvkami (`#` a `b` – např. `f#`, `gb`),
    - oddělené mezerou.
  - Label vysvětluje formát zadání.
  - **Tlačítko "Clear input"**: Tlačítko s ikonou X v pravém rohu input pole pro rychlé vymazání hodnoty. Po kliknutí vymaže input a nastaví focus zpět na pole.

- **Akční tlačítka**
  - **Navrhnout prstoklad**: spouští `runSolver()` (nový výpočet).
  - **Editovat prstoklad**: zapíná režim editace (modal nad prsty v notové osnově).
  - **Uložit jako test**: otevře modal pro pojmenování a uloží vstup + prstoklad do `localStorage`.
  - **Nastavení**: rozbaluje/skládá panel Nastavení pod tlačítky.

- **Výstupní oblast**
  - `#resultsWrapper` (na začátku skrytý) obsahuje:
    - `#pathDisplay` – vizualizaci prstokladu podle vybraného formátu (**Nastavení → Formát výstupu**):
      - **Notová osnova (výchozí)**: VexFlow SVG – basový klíč (výchozí), celé noty (whole notes), polohy nad notami (římské číslice při změně), prsty a tóny jako anotace, barevné struny. **Střídání klíčů**: nota > a1 (MIDI 69) → houslový klíč; v houslovém klíči zůstáváme pro e1–a1, zpět na basový až při notě d1 a nižší (MIDI ≤ 62). Logika v `getClefPerNote(input)` (export z `ui.js`). Kontejner `.staff-output`, horizontální scroll s pozadím na mobilních zařízeních.
      - **Textový výstup**: tři řádky – polohy (římské, při změně), prsty (barevně podle struny, `↑` pro širokou), tóny.
    - `<canvas id="fretboardCanvas">` – vizualizace hmatníku ve 2D (4 struny, polohy 1–12) s **černým pozadím** (ve světlém i tmavém režimu).
      Proporční rozestupy mezi polohami (menší směrem k mostku) odpovídají skutečným vzdálenostem na violoncelle.
      **Zesvětlené čáry pro orientační body**: I., IV. a VII. poloha (diatonicky) = pozice 2, 7, 12 (chromaticky) jsou zobrazeny světlejší barvou (#707070) a silnější čarou (1.5px) pro lepší orientaci.
      Horizontální scroll na menších displejích.
- **Sekce Nastavení** (skrývatelná): Formát výstupu (Notová osnova / Textový výstup), Označení poloh (diatonické / chromatické), Označení tónu H/B. Jazyk pouze v menu (vlajky).
  - Panel je umístěn pod tlačítky; zůstává otevřený do ručního zavření.

- **JSON model**
  - Tlačítko „Zobrazit JSON Model" přepíná viditelnost bloku s JSON reprezentací `model` z `assets/js/fingering.js`.

- **Footer**
  - Copyright: „© [aktuální rok] Sensio.cz s.r.o." s odkazem na https://www.sensio.cz

- **Favicon**
  - SVG favicon (`assets/img/favicon.svg`) definovaný v `<head>`

## Logika UI – `assets/js/ui.js`

### Funkce `runSolver()`

Zodpovídá za:

1. Načtení vstupu:
   - přečte hodnotu z `#melodyInput`,
   - při `preserveState: true` (nebo prázdném vstupu) použije `lastResult` / `lastInput` pro **překreslení** bez nového řešení (např. po změně tématu nebo jazyka).

2. Mapování béček na enharmonické křížky (pouze při novém řešení):
   - např. `gb` → `f#`, `db` → `c#` apod.,
   - výpočet probíhá nad „sharp“ variantou,
   - ve výstupu se zobrazují původní tokeny z inputu.

4. Volání algoritmu (pouze při vyplněném vstupu):
   - `solve(inputForSolve)` z `assets/js/fingering.js` (ESM modul).
   - Při editaci se volá `solve(inputForSolve, constraints)` s omezeními z uživatelských úprav.

5. Vykreslení výstupu podle `currentOutputFormat`:
   - **Notová osnova**: `renderStaffOutput()` – VexFlow (basový/houslový klíč dle `getClefPerNote()`), celé noty, anotace polohy/prsty/tóny, barvy strun. Barvy z `--color-staff-ink`, `--color-staff-bg`; kontext `setFillStyle` / `setStrokeStyle` před kreslením.
   - **Textový výstup**: `renderTextOutput()` – tři řádky (poloha, prst, tón), barvy prstů z `--cello-string-*`.

6. Vykreslení hmatníku na Canvas:
   - volá `drawFingerboard(result, input)`.

7. Uložení `lastResult` / `lastInputForSolve` pro pozdější překreslení (např. při změně tématu, jazyka nebo H/B). Překreslení volá `redrawResults()` (alias `runSolver({ skipHideAbout: true, preserveState: true })`).

### Režim editace prstokladu

- Aktivace tlačítkem **Editovat prstoklad** nebo klikem na číslo prstu v notové osnově.
- Nad prsty se vykresluje **klikací hitbox** v SVG (44×44), který otevírá modal.
- Modal je ukotven **nad prstem**, obsahuje volby **Prst / Struna / Poloha** včetně **Auto**.
- Aktivní prst má **zvýrazněné pozadí**: SVG `<rect>` s radiálním přechodem (žlutý střed → bílý okraj) vložený za číslo prstu.
- Neplatné volby jsou **disabled**; chybová hláška se zobrazí **uvnitř modalu** na 2 s.
- Klávesy **0–4** nastaví prst a posunou fokus na další notu (modal zůstává otevřený).
- Šipky **← / →** posouvají fokus mezi notami.
- V režimu editace se na mobilech aktivuje **virtuální numerická klávesnice** (skrytý input s `inputmode="numeric"`).
- Aktivní nota se při editaci **centruje v horizontálním scrollu**, aby byl vidět kontext.
- Uživatelské volby jsou v prstech označeny **vykřičníkem** (`4↑!`) a ukládají se do `userDefined`.

### Funkce `renderStaffOutput(container, result, input, positionChanges, stringColors, toRoman)`

Vykreslí notovou osnovu pomocí **VexFlow** (SVG backend). Používá se, když je `currentOutputFormat === 'staff'`.

- Vytvoří kontejner `.staff-output` (bez borderu), VexFlow `Renderer` + `Stave` (počáteční klíč z `getClefPerNote(input)[0]`), `StaveNote` (celé noty - whole notes) a `Annotation` pro polohy, prsty a tóny.
- **Střídání klíčů**: Funkce `getClefPerNote(input)` vrací pro každou notu `'bass'` nebo `'treble'`. Pravidlo: nota > a1 (MIDI 69) → treble; v treble zpět na bass až při notě d1 a nižší (MIDI ≤ 62). Před každou notou, u které se klíč změní, se vloží `ClefNote(clef)`. Export `getClefPerNote` slouží i testům (ověření `expectedClefs`).
- **Posuvky před notou**: Explicitně přidává `Accidental` modifikátory (`#` nebo `b`) k notám, aby byly vždy zobrazeny.
- **Bez enharmonických záměn**: Noty se zobrazují přesně tak, jak je uživatel zadal (např. `e#` zůstane jako E#, ne F).
- **Menší odsazení shora**: Osnova má menší top padding (50px místo 100px) pro kompaktnější zobrazení.
- Barvy: `--color-staff-ink` (klíč, noty, polohy, tóny), barvy prstů podle strun (`--cello-string-*`). Pozadí z `--color-staff-bg`.
- Kontext `setFillStyle` / `setStrokeStyle` před kreslením stave i před `voice.draw()`.
- V dark mode CSS přepisuje `path` / `line` / `rect` v `[id^="vexflow-staff-"]` na bílou.
- **Překreslení při změně dark mode**: Callback `setCanvasRedrawCallback` volá `redrawResults()` pro překreslení osnov při změně tématu.
- Legenda strun pod osnovou. Výstup v `overflow-x-auto` pro horizontální scroll s pozadím na mobilních zařízeních.

### Funkce `drawFingerboard(path, input)`

Pracuje s `<canvas id="fretboardCanvas">` o šířce 1000 px a výšce 400 px.

- **Černé pozadí hmatníku** (ve světlém i tmavém režimu):
  - používá `--color-fingerboard` (#0d0d0d) pro realistické zobrazení hmatníku,
  - struny, pražce a text používají světlejší barvy pro kontrast na černém pozadí.

- Vykreslí 4 horizontální struny:
  - pořadí shora dolů: A, D, G, C,
  - každá struna má vlastní barvu z CSS proměnné (pro názvy a body),
  - **různé tloušťky strun**: C (4px), G (3px), D (2.5px), A (2px),
  - barva čar: `--color-fingerboard-string` (#505050) pro viditelnost na černém pozadí.

- Vykreslí vertikální značky pro pozice 1–12:
  - jemné vertikální linky (`--color-fingerboard-fret`, #404040),
  - **Zesvětlené čáry pro orientační body**: I., IV. a VII. poloha (diatonicky) = pozice 2, 7, 12 (chromaticky) jsou zobrazeny světlejší barvou (#707070) a silnější čarou (1.5px) pro lepší orientaci na hmatníku,
  - nahoře se zobrazí číslo polohy římsky (I–XII…) v barvě `--color-fingerboard-text` (#b0b0b0).

- Vykreslí prázdné struny (pozice 0):
  - **nepřekrývá se s názvem struny**: název struny je na `x = 6`, prázdná struna na `x = 44` (kruh s poloměrem 12, levý okraj 32),
  - jako barevný kruh s číslem 0 a textem tónu pod ním (offset `y + 28`).

- **Proporční rozestupy mezi polohami**:
  - **menší rozestup I. polohy od prázdné struny**: první mezera (open → I) je 14% z celkové šířky,
  - **proporčně menší mezery směrem k mostku**: geometrická řada s kvocientem 0.92 (I→II, II→III, …, XI→XII),
  - odpovídá skutečným vzdálenostem na violoncelle (zkracující se délka znějící struny).

- Vypočítá souřadnice všech bodů:
  - **osa X**: vypočítává se podle vzdálenosti od prázdné struny (`targetS`), ne podle polohy:
    - Pro úzkou polohu: `targetS = p + (f - 1)`
    - Pro širokou polohu: `targetS = p + offset` (offset je 2, 3 nebo 4 pro prsty 2, 3, 4)
    - Pozice na canvasu: `x = posX[targetS]` (předpočítané pozice s proporčním spacing)
  - **osa Y**: struna (A–C).

- Propojí body čárkovanou čárou:
  - viditelná trajektorie pohybu ruky a přeskoky strun (`--color-fingerboard-text`).

- Vykreslí body pro každý tón:
  - kruh:
    - barva podle struny,
    - nebo jantarová (`#f59e0b`) pro širokou polohu (`ext === 1`),
  - uvnitř číslo prstu (tučné, `--color-fingerboard-stroke`),
  - pod bodem název tónu (tučné, `--color-fingerboard-text`) - převzatý z původního vstupu.

### Funkce `noteToVexFlow(noteName)`

Převádí název noty na VexFlow formát (např. `C/2`, `c#/3`, `c1#/4`).

- **Bez enharmonických záměn**: Noty se zobrazují přesně tak, jak je uživatel zadal (např. `e#` zůstane jako E#, ne F).
- **Alternativní formát**: Podporuje přehozené pořadí posuvky a oktávy (`c#1` → `c1#`, `d1b` → `db1`) pomocí `normalizeOctaveAccidentalSwap`.
- Mapuje oktávy: **kontra** (C/1–B/1, H1, Cb velké), **velká** (C/2–B/2), **malá** (C/3–B/3), **jednočárkovaná** (C/4–B/4) a posuvky (#, b).
- Fallback na `C/4` pokud nota není v mapě.

### Funkce `getMidiNumber(noteName)`

Převádí název noty na MIDI číslo (pro Canvas vizualizaci).

- Podporuje alternativní formát (`c#1` → `c1#`).
- Bez enharmonických záměn (pouze přímý lookup v mapě).
- **Kontra oktáva (ISO C1–B1, MIDI 24–35)**: Velké Ces = enharmonicky kontra H (označení **H1**, neplést s h1 jednočárkovaným). Mapování: `Cb` → MIDI 35, `H1` → 35, `Hb1` → 34. VexFlow: `Cb/1`, `B/1`, `Bb/1`. Pozice v osnově: explicitní `notePositions` pro MIDI 34, 35.

### Funkce `toggleJson()`

Jednoduché přepínání `hidden` třídy na `#jsonContainer`.

### Funkce `toDisplayNote(token)`

Podle **Nastavení → Označení tónu H/B** vrací zobrazovaný tón: H/Hes vs. B/Bb. Vstup je normalizovaný token (H, Hb, h, hb, …). Použito v `renderStaffOutput`, `renderTextOutput` a `drawFingerboard` pro anotace tónů.

### Inicializace

- **Bootstrap** (`index.php`): `await initI18n()` → `setCanvasRedrawCallback(redrawResults)` → `initNavigation()` → `initUI()`. Volá se z async `main()` po `DOMContentLoaded`. Žádné `loadLayout` – topbar/footer jsou PHP include.
- **`initUI()`** (export z `ui.js`): naplní `#jsonDisplay` JSON reprezentací `model`; pokud je v URL parametr `sequence`, nastaví ho do `#melodyInput`; jinak se pokusí obnovit poslední stav z `localStorage` (`fingering:last`). Inicializuje skrývání/zobrazení sekce "O aplikaci" podle `localStorage.getItem('aboutCollapsed')`; přidá listenery na "O aplikaci", Enter v inputu, **tlačítko "Clear input"**, **Editovat prstoklad**, JSON toggle; volá `initSettings()` a `runSolver({ skipHideAbout: true, preserveState: true })`. Listener na `languageChange` event překreslí výstup při změně jazyka.
- **Nastavení**: Formát výstupu, Označení poloh, **Jazyk** (volá `setLanguage`, při změně `runSolver({ skipHideAbout: true, preserveState: true })`), **Označení H/B** (volá `setNoteNaming`, při změně `runSolver({ skipHideAbout: true, preserveState: true })`). Jazyk i H/B se načítají z `localStorage` při startu.
- **Dark mode překreslení**: Při změně dark mode se osnovy a hmatník automaticky překreslí pomocí callback `setCanvasRedrawCallback`, který volá `redrawResults()`.
- **Změna jazyka**: Při změně jazyka se aktualizují všechny texty včetně nadpisu v hlavičce (pomocí `data-i18n` atributu). Na testovací stránce se testy automaticky překreslí při změně jazyka pomocí listeneru na `languageChange` event.


