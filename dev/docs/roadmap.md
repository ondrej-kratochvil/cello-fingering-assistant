# Roadmapa - Opravy podle .cursorrules

## 🔴 Kritické nedostatky

### 1. UI Standardy - Chybějící prvky

#### 1.1 SVG Logo
- **Status**: ✅ Hotovo
- **Soubor**: `assets/img/logo.svg` (vytvořeno)
- **Implementace**: Logo přidáno do headeru v `index.html` a `dev/tests/test.html`, odkazuje na homepage

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
- **Soubor přesunut**: `test.html` → `dev/tests/test.html`
- **Aktualizace**: Cesty k JS souborům upraveny na relativní (`../../assets/js/`)

#### 3.3 Vytvoření chybějících složek
- **Status**: ✅ Hotovo
- **Vytvořené složky**:
  - `assets/css/` (připraveno pro budoucí CSS)
  - `assets/img/` (obsahuje logo.svg a favicon.svg)
  - `dev/tests/` (obsahuje test.html)
  - `dev/sql/` (připraveno pro budoucí SQL)

#### 3.4 Root soubory
- **Status**: ⚠️ Částečně
- **Úkoly**:
  - Vytvořit `.htaccess` (pro Apache server)
  - Vytvořit `.gitignore` (pokud chybí)
  - Zkontrolovat, že v root jsou pouze: `index.html`, `.htaccess`, `.gitignore`, `README.md`

### 4. HTML - Sémantika a přístupnost

#### 4.1 Sémantické značky
- **Status**: ⚠️ Částečně
- **Úkoly**:
  - Zkontrolovat použití `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`
  - Přidat `<main>` kolem hlavního obsahu
  - Zkontrolovat hierarchii nadpisů (`<h1>`, `<h2>`, atd.)

#### 4.2 SEO a přístupnost
- **Status**: ⚠️ Částečně
- **Úkoly**:
  - Přidat `<meta name="description">` do `<head>`
  - Přidat `alt` atributy k obrázkům (až budou)
  - Zkontrolovat ARIA atributy pro přístupnost
  - Přidat `lang="cs"` (už je)

### 5. JavaScript - ESM moduly

#### 5.1 Převod na ES6 moduly
- **Status**: ✅ Hotovo
- **Implementace**:
  - Přidán `export` v `assets/js/fingering.js`
  - Přidán `export` v `assets/js/tests.js`
  - Přidán `import { solve, model }` v `assets/js/ui.js`
  - Změněno `<script src>` na `<script type="module">` v HTML souborech
  - Testy používají ESM importy v inline scriptu

## 🟡 Doplňkové úkoly

### 6. Responzivita
- **Status**: ✅ Částečně (používá Tailwind)
- **Úkol**: Ověřit responzivitu na:
  - Small Mobile (320px)
  - Tablet (768px)
  - Ultra-Wide / 4K
  - Content Stress Test (dlouhé texty)

### 7. Light/Dark mode
- **Status**: ❌ Chybí
- **Úkol**: Implementovat přepínač Light/Dark mode pomocí CSS proměnných

### 8. Dokumentace
- **Status**: ✅ Hotovo
- **Poznámka**: Dokumentace je v `dev/docs/`, ale měla by být aktualizována o nové změny

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

### Fáze 3 - Vylepšení
8. SEO a přístupnost
9. Light/Dark mode
10. Responzivita testy

## 📝 Poznámky

- Projekt je **client-side** aplikace (žádný PHP), takže PHP audit není relevantní
- Používá se **Tailwind CSS** přes CDN, což je v pořádku, ale měly by se vytvořit CSS proměnné pro vlastní barvy
- Testy jsou funkční a procházejí
- Algoritmus je dobře zdokumentovaný

