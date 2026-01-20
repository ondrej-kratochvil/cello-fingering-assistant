# Cello Fingering Assistant

Aplikace pro nalezení optimálního prstokladu pro violoncello pomocí algoritmu založeného na metodice.

## Struktura projektu

- `index.html` - Hlavní aplikace s UI
- `test.html` - Testovací stránka pro ověření správnosti algoritmu
- `js/fingering.js` - Hlavní logika algoritmu prstokladu
- `js/ui.js` - UI funkce pro interakci s uživatelem
- `js/tests.js` - Testovací sady a framework

## Spuštění

1. Otevřete `index.html` v prohlížeči pro použití aplikace
2. Otevřete `test.html` v prohlížeči pro spuštění testů

## Testy

Testy obsahují několik sad tónů s očekávanými prstoklady:

1. **Základní sekvence e f# g#** - Mělo by zůstat v I. poloze (D02) a použít široké držení
2. **Sekvence d1 e1 f1 g1** - Mělo by zůstat v jedné poloze s úzkým držením
3. **Sekvence C D E F** - C struna, I. poloha
4. **Sekvence a h c1 d1** - A struna s posuny
5. **Sekvence g a h c** - Sekvence přes více strun

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
1. Upravte kód v `js/fingering.js`
2. Spusťte testy v `test.html`
3. Ověřte, že všechny testy procházejí
4. Pokud algoritmus vrací jiný (ale stále správný) výsledek, upravte očekávané hodnoty v `js/tests.js`
