# Cello App Kit

Sada miniaplikací pro violoncellisty: Odpočet, Ladička, Prstoklad, Rytmy, Smyky, Metronom, Seznam skladeb. Hlavní nástroj – **Prstoklad** – hledá optimální prstoklad pomocí algoritmu založeného na metodice.

## Struktura projektu

- `index.php` – Homepage s Průvodcem cvičením (krok za krokem). PHP includuje topbar/footer.
- `prstoklad.php`, `ladicka.php`, `metronom.php`, `odpocet.php`, `rytmy.php`, `smyky.php`, `seznam-not.php` – stránky nástrojů.
- `dev/tests/test.php` – Testovací stránka pro ověření správnosti algoritmu prstokladu (PHP includuje topbar/footer)
- `assets/js/fingering.js` – Hlavní logika algoritmu prstokladu
- `assets/js/ui.js` – UI, vykreslení notové osnovy (VexFlow), textového výstupu a hmatníku (Canvas)
- `assets/js/i18n.js` – Vlastní i18n modul: `t(key)`, načítání JSON z `assets/i18n/`, jazyk a H/B v `localStorage`
- `assets/i18n/cs.json`, `assets/i18n/en.json` – Překlady UI, O aplikaci, Hlavní funkce, testů; snadné přidání dalších jazyků
- `assets/js/navigation.js` – Navigace, dark mode, callback pro překreslení při změně tématu
- `assets/js/tuner.js` – Ladička (YIN pitch detection); zobrazuje jen jednu strunu (nejbližší detekované frekvenci), ne všechny 4
- `assets/js/countdown.js` – Odpočet (minutka), widget v hlavičce, persistence v localStorage
- `assets/js/sheet-list.js` – Seznam skladeb: localStorage, řazení, filtr obtížnosti, editace kliknutím na řádek, Smazat ve formuláři, tlačítko se 3 stavy
- `assets/js/ui-staff.js` – Notová osnova (VexFlow): `renderStaffOutput`, `renderStaffWithRhythm` pro Rytmy/Smyky/Metronom (barvy prstů podle strun, tóny pod notami, Beam)
- `assets/js/rhythm-patterns.js` – Rytmické patterny sdílené Rytmy/Smyky/Metronomem
- `assets/js/tests.js` – Testovací sady a framework
- `assets/js/test-runner.js` – UI test runneru pro `dev/tests/test.php` (notová osnova, i18n)
- `assets/css/main.css` – Design systém, styly pro notovou osnovu a světlé/tmavé téma

## Spuštění

1. Otevřete `index.php` v prohlížeči pro použití aplikace (vyžaduje **PHP**, např. WAMP / Apache+PHP)
2. Otevřete `dev/tests/test.php` v prohlížeči pro spuštění testů

**Poznámky:**
- **Multijazyčnost**: čeština (výchozí) a angličtina; jazyk a **označení tónu H/B** (H/Hes vs. B/Bb) v Nastavení, ukládání do `localStorage`
- **Enharmonické záměny** (e# → f, H# → c, Hb → A#, B → H, Bb → Hb …) pro solver; zobrazení dle volby H/B
- Tóny lze zadávat i v **alternativním formátu** (např. `c#1` místo `c1#`, `d1b` místo `db1`)
- **Notová osnova** (VexFlow) zobrazuje posuvky před notou; tóny v osnově, textu a hmatníku podle volby H/B
- **Vizualizace hmatníku** má černé pozadí (ve světlém i tmavém režimu) s proporčními rozestupy mezi polohami

## Nástroje

- **Odpočet** – minutka s widgetem v hlavičce, persistence v localStorage
- **Ladička** – YIN pitch detection, prázdné struny C, G, d, a; zobrazuje jen jednu ladičku (nejbližší strunu)
- **Prstoklad** – hlavní nástroj, algoritmus prstokladu, vizualizace hmatníku, přehrávání
- **Rytmy** – rytmické patterny (čtvrťové, osminové), tlačítka Další/Náhodný
- **Smyky** – smykové patterny (legato/samostatně), tlačítka Další/Náhodný, sdílený rytmus s Rytmy
- **Metronom** – tempo BPM, počet dob, tlačítko Start/Stop s ikonami
- **Seznam skladeb** – odkaz, název, autor, obtížnost; editace kliknutím na řádek, Smazat ve formuláři; tlačítko Přidat skladbu má 3 stavy (Přidat / Zrušit přidání / Zrušit editaci)

## Testy

Testy obsahují několik sad tónů s očekávanými prstoklady:

1. **Základní sekvence e f# g#** - Mělo by zůstat v I. poloze (D02) a použít široké držení
2. **Sekvence d1 e1 f1 g1** - Mělo by zůstat v jedné poloze s úzkým držením
3. **Sekvence C D E F** - C struna, I. poloha
4. **Sekvence a h c1 d1** - A struna s posuny
5. **Sekvence g a h c** - Sekvence přes více strun
6. **Prázdné struny C G d a** - Preferuje prázdné struny
7. **Preference nižší polohy pro g** - Nižší poloha na D struně
8. **Otevřená struna d** - Preferuje otevřenou strunu D

Při úpravách algoritmu musí všechny tyto testy stále procházet, aby byla zajištěna konzistence a správnost řešení.

## Algoritmus

Algoritmus v7 upřednostňuje:
1. **Polohovou stabilitu** - Zůstat v jedné poloze je preferováno před posunem
2. **Sudé dělení (2+2)** - Preferuje skupiny po 2 nebo 4 tónech v jedné poloze
3. **Anticipaci extenze** - Pokud skupina vyžaduje široké držení, zůstane v něm

### Váhy algoritmu

- **Shift (5000)**: Skok polohou je nejdražší operace
- **Ext_Change (3000)**: Změna mezi úzkou a širokou dlaní v jedné poloze je drahá
- **Wide_Base (500)**: Samotná široká poloha je relativně levná

## Vývoj

Při úpravách algoritmu:
1. Upravte kód v `assets/js/fingering.js`
2. Spusťte testy v `dev/tests/test.php`
3. Ověřte, že všechny testy procházejí
4. Pokud algoritmus vrací jiný (ale stále správný) výsledek, upravte očekávané hodnoty v `assets/js/tests.js`

Dokumentace je v `dev/docs/` (architektura, algoritmus, UI, testování, roadmapa).

## Nápověda (editace prstokladu)

- **Klik na prst** v notové osnově otevře modal (Poloha / Struna / Prst).
- **Klávesy 0–4** nastaví prst a posunou fokus na další notu.
- **Šipky ← / →** posouvají fokus mezi notami.
- Na mobilu se v režimu editace aktivuje **numerická klávesnice**.
