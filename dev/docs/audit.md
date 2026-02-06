# Audit projektu podle .cursorrules

**Datum:** 4. 2. 2026 (revize po aktualizaci .cursorrules)  
**Předpis:** `.cursorrules` (Vanilla Stack – sjednocený firemní standard)

---

## 1. Shrnutí

Projekt **Cello Fingering Assistant** splňuje většinu pravidel. Po aktualizaci .cursorrules přibyly požadavky na **skrývatelný úvod s localStorage**, **footer Sensio**, **přístupnost (prohlášení, klávesové zkratky)**, **čistý root**, **délku souborů** a **optimalizaci výkonu**. Níže je stav vůči těmto bodům a návrhy úprav.

---

## 2. Co je v pořádku

### Technický stack (Frontend)
- **HTML5**: Sémantické značky (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`), SEO meta tagy.
- **CSS**: Design systém v `assets/css/main.css` – CSS proměnné, Light/Dark (`.dark-mode`).
- **JavaScript**: Vanilla ES6+ moduly v `/assets/js`, načítání přes `type="module"` (moduly se chovají jako defer).
- **Light/Dark mode**: Výchozí téma dle `prefers-color-scheme`, manuální přepínač, ukládání do `localStorage`.

### UI & UX standardy
- **Logo**: SVG, levý horní roh, odkaz na homepage.
- **Favicon**: `assets/img/favicon.svg` v `<head>`.
- **Menu**: ≤ 7 položek (Home, Testy, O aplikaci), hamburger na mobilu.
- **Homepage – úvodní text**: Stručný text o funkcích aplikace (O aplikaci, Hlavní funkce, Tóny a polohy). Sekce je **skrývatelná** (odkaz „O aplikaci“ v menu přepíná zobrazení celého `<main>`). Preference **se ukládá do `localStorage`** (`aboutCollapsed`). ✅
- **Footer**: Formát `© [aktuální rok] Sensio.cz s.r.o.`, odkaz na https://www.sensio.cz/ – **Sensio, ne projekt**. ✅
- **i18n**: Čeština + angličtina, `assets/i18n/cs.json` a `en.json`, `t(key)`, `data-i18n` / `data-i18n-html` / `data-i18n-aria-label`, přepínač jazyka, uložení do `localStorage`, dynamický obsah (včetně modalu „Uložit jako test“ při změně jazyka).

### Architektura a root
- **Root**: Obsahuje pouze `index.php`, `.htaccess`, `.gitignore`, `README.md`, `.env.example`, `assets/`, `.cursorrules`. Žádná dokumentace ani testy v rootu – ty jsou v `dev/docs/` a `dev/tests/`. ✅
- **Struktura**: `assets/` (css, js, img, i18n, partials), `dev/docs/`, `dev/tests/`. Bez `src/`, `api/`, `config.php` (projekt není full-stack). Chybí `dev/scripts/` – nepovinné, pokud nejsou diagnostické skripty.

### Dokumentace a testování
- **dev/docs**: `main.md`, `architecture.md`, `algorithm.md`, `ui.md`, `testing.md`, `manual_tests.md`, `roadmap.md`.
- **Testy**: V `dev/tests/test.php`, přehledná výstupní struktura.

### PHP
- `declare(strict_types=1);` v `index.php`, `dev/tests/test.php`, `topbar.php`, `footer.php`.

---

## 3. Nedostatky a návrhy úprav

### 3.1 Přístupnost – prohlášení o přístupnosti ✅ Vyřešeno

**Předpis:** Každá aplikace má **prohlášení o přístupnosti** (samostatná stránka nebo sekce v nápovědě / footeru). Úroveň souladu, kontakt pro připomínky, datum poslední revize.

**Stav:** Stránka **accessibility.php** s prohlášením (úroveň souladu WCAG 2.1, kontakt Sensio.cz, datum revize), odkaz „Přístupnost“ v patičce. Překlady v cs.json / en.json (accessibility.*).

---

### 3.2 Klávesové zkratky ✅ Vyřešeno

**Předpis:** Nejpoužívanějším operacím přiřadit **klávesové zkratky**. Zkratky uvést v prohlášení o přístupnosti a zobrazit v nápovědě / menu (např. tooltip).

**Stav:** Na stránce Přístupnost je sekce „Klávesové zkratky“ (Enter, Escape). U tlačítka „Navrhnout prstoklad“ je tooltip přes `data-i18n-title="aria.solveShortcut"` (podpora v `i18n.js` – `applyTranslations()` nastavuje `title` z klíče).

---

### 3.3 Mapa webu

**Předpis:** U **rozsáhlejšího webu** (více sekcí, podstránek) vytvořit mapu webu (stránka s odkazy nebo `sitemap.xml`).

**Stav:** Aplikace má v podstatě dvě „stránky“ (index, testy). Rozsah je malý.

**Hodnocení:** Pro současný rozsah **není povinné**. Při přidání dalších sekcí (např. Nápověda, Přístupnost) zvážit jednoduchou stránku s odkazy nebo `sitemap.xml`.

---

### 3.4 Délka souborů – technický dluh (JS)

**Předpis:** **JavaScript**: max. **600 řádků** na soubor (soft limit). Seskupuj logiku, refaktor při porušení Single Responsibility.

**Stav:** Soubor **`assets/js/ui.js`** má **víc než 1800 řádků** (aktuálně přes 2000). Výrazně přesahuje doporučený limit.

**Návrh:** Postupný refaktoring: vyčlenit logické celky do samostatných modulů (např. `ui-results.js` – vykreslení výsledků a notové osnovy, `ui-fingerboard.js` – canvas hmatníku, `ui-modals.js` – modaly a formuláře, `ui-settings.js` – nastavení a vstup). Hlavní `ui.js` by pak pouze skládal inicializaci a napojení událostí. Refaktorovat v menších krocích s testy.

---

### 3.5 Optimalizace výkonu

**Předpis:**  
- **Statické assets:** Cache-busting (např. `style.css?v=<?= filemtime(...) ?>`).  
- **Skripty:** `defer` (moduly jsou defer implicitně).  
- **Obrázky:** Mimo první obrazovku `loading="lazy"`.

**Stav:**  
- **Cache-busting**: V `index.php` a `test.php` jsou CSS a JS načteny **bez query parametru** (např. `assets/css/main.css`). Po nasazení mohou prohlížeče dlouho držet starou verzi.  
- **Skripty**: Použit `type="module"` – chování odpovídá defer. ✅  
- **Obrázky**: Logo a favicon jsou v horní části stránky; další obrázky v obsahu nejsou. Lazy loading nepovinný.

**Návrh:** Přidat cache-busting pro CSS a JS v PHP, např.  
`<link rel="stylesheet" href="assets/css/main.css?v=<?= filemtime(__DIR__ . '/assets/css/main.css') ?>">`  
a u `<script type="module" src="...">` obdobně (pokud jsou scripty s `src` v PHP šabloně). Tím se po změně souboru vynutí nové načtení.

---

### 3.6 Složka dev/scripts/

**Předpis:** `dev/scripts/` pro testovací a diagnostické skripty.

**Stav:** Složka **neexistuje**; v projektu zatím nejsou takové skripty.

**Hodnocení:** **Nepovinné.** Vytvořit při prvním potřebném diagnostickém nebo testovacím skriptu (např. jednorázový export dat).

---

### 3.7 Tlačítko „Skrýt úvod“ / „Zobrazit úvod“

**Předpis:** Úvodní sekce má být skrývatelná, např. tlačítko „Skrýt úvod“ / „Zobrazit úvod“.

**Stav:** Celý blok úvodu (celé `<main>`) se skrývá/zobrazuje přes odkaz **„O aplikaci“** v menu. Preference se ukládá do `localStorage`. Funkčně je požadavek splněn; text tlačítka je „O aplikaci“, ne explicitně „Skrýt úvod“ / „Zobrazit úvod“.

**Návrh:** Volitelné vylepšení – měnit text odkazu podle stavu (např. „Skrýt úvod“ když je main vidět, „Zobrazit úvod“ když je skrytý) a použít odpovídající i18n klíče. Není kritické.

---

## 4. Kontrolní seznam (podle aktualizovaných .cursorrules)

| Oblast | Stav | Poznámka |
|--------|------|----------|
| Umístění pravidel, Role, Upřesnění před implementací | OK | |
| Detekce typu projektu, „Tento projekt“ | OK | |
| Frontend (HTML5, CSS, ESM, Light/Dark) | OK | |
| Header (logo, menu ≤7, hamburger) | OK | |
| Homepage – úvodní text, skrývatelné, localStorage | OK | aboutCollapsed |
| Favicon | OK | |
| Footer – Sensio, aktuální rok, odkaz | OK | |
| **Prohlášení o přístupnosti** | OK | Stránka accessibility.php, odkaz v footeru |
| **Klávesové zkratky (dokumentace / UI)** | OK | Na stránce Přístupnost + tooltip u tlačítka Solve |
| Mapa webu | — | Nepovinné (malý rozsah) |
| i18n (cs, en, t(), dynamický obsah) | OK | |
| Responzivita | OK | |
| Čistý root, struktura, dev/docs, dev/tests | OK | dev/scripts/ chybí – nepovinné |
| **Délka souborů (JS ≤600)** | ❌ | ui.js výrazně přes 600 řádků |
| Délka souborů (CSS ≤800) | OK | main.css na hranici |
| DRY, modularita | ⚠️ | Zhodnotit při refaktoringu ui.js |
| Dokumentace, testování | OK | |
| **Cache-busting (CSS/JS)** | ❌ | Chybí |
| Skripty (defer / moduly) | OK | type="module" |
| PHP strict_types | OK | |

---

## 5. Doporučené další kroky (priorita)

Vyřešeno v této revizi:
1. ✅ **Prohlášení o přístupnosti** – stránka accessibility.php, odkaz v footeru, klávesové zkratky a úroveň souladu.
2. ✅ **Cache-busting** – CSS a JS v index.php, CSS v test.php a accessibility.php.
3. ✅ **Klávesové zkratky** – dokumentace na stránce Přístupnost, tooltip u tlačítka „Navrhnout prstoklad“ (`data-i18n-title`, podpora v i18n.js).

Zbývá (nízká / dlouhodobá priorita):
4. **Refaktoring `ui.js`** – rozdělit do více modulů (výsledky, hmatník, modaly, nastavení) s cílem pod cca 600 řádků a Single Responsibility. Odloženo na později.
5. Volitelně: text odkazu v menu („Skrýt úvod“ / „Zobrazit úvod“) dle stavu sekce.
6. Před většími změnami UI znovu spustit **VERIFY** (testy + @Browser).
