# Testování

## Automatizované testy (JS)

Testy jsou definovány v `js/tests.js` a spouštějí se ve dvou režimech:

1. **Přes `test.html` v prohlížeči**
2. **Přes Node.js (modulový režim)** – pokud je k dispozici, díky podmínce `if (typeof module !== 'undefined' && module.exports)`.

### Testovací framework

Soubor `js/tests.js` obsahuje jednoduchý `TestRunner`:

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

- `name` – popis,
- `input` – sekvenci tónů,
- `expected` – očekávaný prstoklad (pole `{s, p, f, ext}`),
- `description` – textový komentář.

### `test.html` – vizuální runner

Stránka `test.html`:

- Načítá `js/fingering.js` a `js/tests.js`.
- Funkce `runAllTests()`:
  - projde `testSuites`,
  - pro každý test zavolá `solve()`,
  - použije `compareFingering()` k vyhodnocení,
  - vykreslí:
    - vstup,
    - očekávaný prstoklad,
    - skutečný prstoklad,
    - stav (PROŠLO / SELHALO).
- Nahoře i dole zobrazuje **souhrn**:
  - počet prošlých / selhaných / celkem,
  - krátká zpráva, zda všechny testy prošly.
- U každého testu je tlačítko „Zobrazit prstoklad“:
  - otevře `index.html` s danou sekvencí v parametru `sequence`,
  - umožní vizuálně analyzovat konkrétní případ v hlavní aplikaci.

## Manuální testy (UI/UX)

Podle projektových pravidel jsou návrhy manuálních testů v souboru [`manual_tests.md`](./manual_tests.md).


