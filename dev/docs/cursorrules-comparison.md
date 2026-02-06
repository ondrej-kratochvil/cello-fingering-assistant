# Porovnání .cursorrules – efil-github vs. cello-fingering-assistant

Cíl: jednotný firemní standard mezi projekty, s možností projektových výjimek.

---

## 1. Shrnutí rozdílů

| Oblast | efil-github | cello-fingering-assistant | Doporučení |
|-------|-------------|---------------------------|------------|
| Rozsah | ~320 řádků, podrobnější | ~256 řádků, stručnější | Firemní = rozšířená verze (efil), projekty mohou zužovat |
| Umístění pravidel | — | Sekce „firemní vs. projekt“, .cursorrules vs. .cursor/rules/ | **Přidat do firemního** (cello má dobrou formulaci) |
| Upřesnění před implementací | Ano (zeptat se na nejasnosti) | Ne | **Přidat do firemního** |
| Root / struktura | Čistý root, přesný výčet co smí/nesmí, dev/scripts/ | Volnější, „root může obsahovat i další“ | **Sjednotit na „čistý root“** jako default |
| Homepage | Skrývatelný úvod + localStorage | Jen „stručné informace“ | **Rozšířit firemní** (skrývatelný úvod) |
| Footer | Fixně Sensio.cz s.r.o. + sensio.cz | Obecně „název projektu“ | Firemní = Sensio; projekt může přepsat výjimkou |
| a11y / prohlášení / zkratky / sitemap | Celá sekce | Chybí | **Přidat do firemního** |
| i18n výjimka | „Musí podporovat“ (bez výjimky) | „Projekt může uvést výjimku“ | **Firemní = s výjimkou** (cello) |
| Délka souborů, DRY, modularita | Ano (600/800 řádků, refaktoring) | Ne | **Přidat do firemního** |
| Optimalizace (DB, DOM, cache) | Ano | Ne | **Přidat do firemního** |
| VERIFY | Konkrétní URL + checklist | Obecný popis | Firemní = obecně; projekt doplní cestu |
| Backend | API /api/, Session | Autoloading, bez API/Session | Oba varianty v jednom textu (Full-stack) |

---

## 2. Co je stejné nebo velmi podobné

- **Role**: seniorní full-stack, Vanilla stack, minimální technický dluh, dokumentace.
- **Detekce typu**: index.html → client-side, index.php → PHP/full-stack.
- **Frontend**: HTML5 sémantika, CSS proměnné, Light/Dark (prefers-color-scheme + manuál + localStorage), ESM v `/assets/js`, komponenty (Select2 styl, a11y).
- **Backend (Full-stack)**: PHP 8.4, strict_types, moderní PHP, MariaDB/MySQL + PDO, prepared statements.
- **Header**: Logo SVG, menu max 7 položek / dropdowny, hamburger vpravo.
- **Favicon**: povinná.
- **i18n**: cs + en, JSON soubory, t(key), přepínač v UI, uložení jazyka, dynamický obsah, data-i18n / data-i18n-html.
- **Responzivita**: rem/em, vyhnout se fixním px pro layout, media queries.
- **dev/docs**: main.md, architektura, roadmapa, manuální testy.
- **Testování**: testy v dev/tests/, @Browser rozlišení, manuální testy.
- **Git**: atomické commity, prefixy (feat/fix/docs/refactor/test), **PowerShell – středník**, ne &&.
- **Pracovní postup**: Analýza → Audit → Plán → Implementace → Testy → Verifikace → Dokumentace → COMMIT.
- **Speciální příkazy**: AUDIT, VERIFY, INIT-DOCS, COMMIT.

---

## 3. Jen v efil-github (kandidáti na firemní standard)

1. **Upřesnění před implementací**  
   Před vytvářením/úpravou kódu se při nejasnostech (rozsah, chování, zkratky, konflikty) nejdřív zeptat uživatele.

2. **Detekce typu**  
   „Pokud projekt obsahuje více stran, které jsou HTML, zvaž přepsání do PHP.“

3. **Backend – rozšíření**  
   - API struktura: endpointy v `/api/` podle funkcionalit (auth, …).  
   - Session: `$_SESSION` pro autentizaci a stav.  
   - PDO: „`?` nebo `:name`“ (cello má jen „pojmenované parametry“).

4. **Homepage – skrývatelný úvod**  
   Stručný text o funkcích aplikace; sekce **skrývatelná** (tlačítko Skrýt/Zobrazit úvod); preference „skrýt úvod“ v localStorage.

5. **Footer – firemní**  
   Formát: `© [aktuální rok] [Sensio.cz s.r.o.]`, odkaz https://sensio.cz/

6. **Přístupnost (a11y), prohlášení, zkratky, sitemap**  
   - Pravidla přístupnosti (WCAG), sémantika, kontrast, focus, aria.  
   - **Prohlášení o přístupnosti** (stránka nebo sekce), úroveň souladu, kontakt, datum revize.  
   - **Klávesové zkratky** pro hlavní operace, uvedené v prohlášení i v nápovědě/menu.  
   - **Mapa webu** u rozsáhlejších webů (stránka nebo sitemap.xml).

7. **Čistý root**  
   Root = **pouze** produkční soubory.  
   V rootu **nesmí**: dokumentace (→ dev/docs/), testy (→ dev/tests/), migrace/diagnostika (→ dev/sql/, dev/scripts/), schémata (→ dev/sql/).  
   V rootu **smí**: index, .htaccess, .gitignore, README.md, .env.example, config.php (Full-stack), api/ (Full-stack), assets/, src/ (Full-stack).  
   **dev/scripts/** pro testovací a diagnostické skripty.

8. **Délka souborů a modularita**  
   - JS cca max 600 řádků, PHP/CSS cca max 800 (soft limits).  
   - Refaktor při porušení Single Responsibility.  
   - ES moduly, rozdělení podle domén, vyhnout se „God Objects“.

9. **DRY**  
   Jedna logika = jedna funkce; opakující se pravidla/formátování do pomocných funkcí.

10. **Optimalizace výkonu**  
    - **DB**: Žádné `SELECT *`, vyhnout N+1 (JOIN / WHERE IN), indexy.  
    - **Frontend**: méně přístupů do DOM, event delegation, `defer` u skriptů, `loading="lazy"` u obrázků.  
    - **PHP**: cache-busting (timestamp u CSS/JS), output buffering.

11. **VERIFY – konkrétní postup**  
    Kroky: spustit testy (URL), projít @Browser dle checklistu, vyplnit výsledky. Důraz: testy v dev/tests/, ne v rootu.

---

## 4. Jen v cello-fingering-assistant (co má smysl zachovat firemně)

1. **Umístění pravidel (firemní vs. projekt)**  
   Team Rules vs. Project Rules vs. User Rules, Remote Rule (GitHub), konflikt vs. výjimka.  
   Rozdíl .cursorrules (legacy) vs. .cursor/rules/ (Always Apply).  
   Co dělat, když agent ignoruje pravidla (@, Always Apply, první zpráva).

2. **Projektová výjimka u i18n**  
   „Projekt může uvést výjimku (pouze čeština, interní aplikace) – pak stačí jeden jazyk a přepínač v UI není nutný.“

3. **Footer obecně**  
   „© [aktuální rok] [název společnosti/projektu]“, „odkaz na web (pokud je relevantní)“ – vhodné jako výchozí s poznámkou, že firemně je to Sensio.cz.

4. **Konkrétní projekt**  
   „Tento projekt: index.php pouze pro topbar/footer, logika v prohlížeči.“ – typický příklad projektového zpřesnění, ne měnit.

5. **Backend – Autoloading**  
   „Vlastní jednoduchý PSR-4 autoloader mapující jmenné prostory do /src“ – doplnit do firemního popisu Full-stack backendu vedle API a Session.

---

## 5. Rozdíly ve formulaci (bez konfliktu)

- **Menu**: efil „menu udržuj stručné“, „podobné položky seskupuj“, „více než 7 → strom“. Cello jen „max 7“, „více do dropdownů“. → Sjednotit na jednu formulaci (efil je podrobnější).
- **Homepage**: efil výslovně „skrývatelný úvod“ + localStorage; cello jen „stručné informace“. → Firemní = efil (skrývatelný úvod).
- **Git**: efil „Shell je PowerShell … vždy středník“; cello „Shel**l** PowerShell“ ( překlep „Shel“). → Opravit na „Shell“ a jednotně „středník“.

---

## 6. Návrh dalšího postupu pro jednotný standard

1. **Vytvořit jeden firemní zdroj pravidel**  
   - Varianta A: repozitář `company-cursor-rules` (např. `vanilla-stack.mdc` + `git.mdc`).  
   - Varianta B: jeden „master“ `.cursorrules` v repozitáři šabloně nebo v efil-github jako referenční.

2. **Obsah firemního standardu**  
   - Vzít **efil-github** jako základ (rozsáhlejší).  
   - Doplnit z **cella**:  
     - sekci „Umístění pravidel (firemní vs. projekt)“ a .cursorrules vs. .cursor/rules/,  
     - i18n s možností výjimky („pouze čeština“),  
     - footer jako obecný formát + poznámka „firemně Sensio.cz s.r.o., odkaz sensio.cz“,  
     - PSR-4 autoloading u Full-stack backendu.  
   - Sjednotit: čistý root (jako v efil), menu/homepage/verifikace dle efil, oprava „Shel“ → „Shell“.

3. **Projekty**  
   - **efil-github**: buď odkaz na firemní pravidla (Remote Rule), nebo zkrátit místní `.cursorrules` na odkaz + projektové výjimky (např. konkrétní VERIFY URL).  
   - **cello-fingering-assistant**: doplnit do místního `.cursorrules` odkaz na firemní pravidla a nechat jen projektové zpřesnění („PHP jen topbar/footer“, případné výjimky).  
   - V obou projektech zachovat např. `.cursor/rules/git.mdc` s Always Apply, aby byl PowerShell a středník vždy v kontextu.

4. **Údržba**  
   - Změny standardu jen v jednom místě (firemní repo / master .cursorrules).  
   - Projekty mění jen to, co je výjimka nebo specifika daného projektu.

---

## 7. Rychlé úpravy v tomto projektu (cello)

- V `.cursorrules` opravit překlep: **„Shel“** → **„Shell“** (řádek s PowerShell).
- Pokud budete mít firemní pravidla v samostatném repozitáři, doplnit na začátek tohoto `.cursorrules` odkaz na ně a uvést: „Projektová pravidla: tento soubor. Firemní standard: [odkaz].“
- Volitelně: doplnit krátkou sekci „Upřesnění před implementací“ (zkopírovat z efil) pro konzistenci, dokud nebude jednotný firemní zdroj.

Pokud chcete, mohu v tomto repozitáři připravit konkrétní návrh úprav `.cursorrules` (doplnění odkazů a sekce „Upřesnění před implementací“) nebo návrh obsahu pro `company-cursor-rules` (struktura souborů a znění oddílů).
