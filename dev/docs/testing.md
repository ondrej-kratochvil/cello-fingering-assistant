# Testování

## Automatizované testy (JS)

Testy jsou definovány v `assets/js/tests.js` a spouštějí se především **přes `dev/tests/test.php`** v prohlížeči. Stránka volá `await initI18n()` a pak `runAllTests()` z `test-runner.js`; UI i názvy/popisy testů se překládají dle zvoleného jazyka.

### Testovací framework

Soubor `assets/js/tests.js` obsahuje jednoduchý `TestRunner`:

- `test(name, fn)` – registrace testu.
- `run()` – spuštění všech testů, logování výsledků do konzole.
- `assertTrue(condition, message)` a `assertEqual(actual, expected)` – asserty.

K porovnání prstokladů slouží:

- `compareFingering(actual, expected)`:
  - porovnává pole objektů `{s, p, f, ext}`,
  - podporuje i více možných správných řešení (pole alternativ).
- `formatFingering(fingering)`:
  - převádí prstoklad na řetězec typu `D0210 D0221 D0241` pro logování a UI testů.

### Testovací sady

`testSuites` obsahuje několik klíčových scénářů:

- Základní sekvence v jedné poloze – např. `e f# g#` na D struně s širokou polohou.
- Posuny mezi polohami – např. `d1 e1 f1 g1` (A struna, přechod z 5. do 7. polohy).
- Jednoduchá stupnice na C struně – `C D E F` ve 2. poloze.
- Přesuny přes více strun – `g a h c`.
- Dlouhá sekvence `g a h c1 d1 e1 f1# g1` ověřující, že algoritmus:
  - používá co nejméně poloh (ideálně 2),
  - preferuje nižší polohy,
  - správně pracuje s širokou/úzkou polohou.

Každý test má:

- `name` – popis (fallback),
- `nameKey`, `descriptionKey` – i18n klíče pro překlad názvu a popisu (např. `test.basic.name`, `test.scale.cdur.desc`),
- `input` – sekvenci tónů,
- `expected` – očekávaný prstoklad (pole `{s, p, f, ext}`); u všech sad včetně stupnic,
- `description` – textový komentář (fallback).
- `prepareInputForSolve` aplikuje B→H, enharmonické záměny a `normalizeOctaveAccidentalSwap`.

### `test.php` – vizuální runner

Stránka `test.php`:

- Načítá `js/fingering.js` a `js/tests.js`.
- Funkce `runAllTests()`:
  - projde `testSuites`,
  - pro každý test zavolá `solve()`,
  - použije `compareFingering()` k vyhodnocení,
  - vykreslí:
    - vstup,
    - **Pro selhané testy s očekávaným výsledkem**: Notové osnovy pro očekávaný i skutečný výsledek s popisky "Očekáváno" a "Skutečnost" nad každou osnovou,
    - **Pro úspěšné testy**: Notovou osnovu se skutečným výsledkem,
    - stav (PROŠLO / SELHALO).
- Nahoře i dole zobrazuje **souhrn**:
  - počet prošlých / selhaných / celkem,
  - krátká zpráva, zda všechny testy prošly.
- U každého testu je tlačítko „Zobrazit prstoklad":
  - otevře `index.php` s danou sekvencí v parametru `sequence`,
  - umožní vizuálně analyzovat konkrétní případ v hlavní aplikaci.
- **Překreslení při změně dark mode**: Callback `setCanvasRedrawCallback` volá `runAllTests()` pro překreslení všech testů při změně tématu.
- **Překreslení při změně jazyka**: Listener na `languageChange` event volá `runAllTests()` pro překreslení všech testů s novými překlady.

## Manuální testy (UI/UX)

Podle projektových pravidel jsou návrhy manuálních testů v souboru [`manual_tests.md`](./manual_tests.md).


