# Algoritmus prstokladu

Tento dokument popisuje hlavní heuristiky a penalizace v algoritmu `solve(sequence)` v `js/fingering.js`.

## Cíl

Algoritmus má najít „dobrý“ violoncellový prstoklad pro sekvenci tónů tak, aby:

- minimalizoval počet použitých **poloh**,
- preferoval **nižší** polohy,
- minimalizoval **shifty** paže,
- udržoval konzistentní **extenzi** (úzká/široká),
- upřednostňoval úzkou polohu o 1 vyšší před širokou v nižší, pokud dávají stejný tón (s výjimkami založenými na kontextu),
- respektoval specifická očekávání ověřovaná testy v `js/tests.js`.

## Lokální náklady (linkCost)

Výpočet nákladů přechodu mezi prstoklady `prev` → `curr`:

### 1. Shifty

- Základní cena shifu:
  - `+5000` za jakýkoli posun polohy.
  - `+100 * abs(curr.p - prev.p)` – čím větší skok, tím vyšší cena.
- Dodatečné pravidlo:
  - Pokud se z polohy odchází po **jediném tónu** (`groupSize === 1`), přidá se další `+10000`.
  - Cíl: vyhnout se osamoceným tónům v poloze.
  - Odchod po 2, 3, 4 tónech **dále nepenalizujeme**, aby byly sekvence 2–3 tónů v jedné poloze preferovány před rozbitím do více poloh.

### 2. Konzistence extenze

Platí pouze, pokud jsme ve stejné poloze (`isSamePos`):

- Změna mezi úzkou a širokou dlaní mezi prsty 2–4:
  - pokud `prev.f > 1`, `curr.f > 1` a `prev.ext !== curr.ext` → `+3000`.
- Anticipace extenze v rámci skupiny:
  - pokud `prevStep.hasWideInGroup` a `curr.ext === 0` a `curr.f > 1` → `+2000`.

### 3. Široká vs. úzká poloha

- Základní cena široké polohy:
  - pokud `curr.ext === 1` → `+500`.
- Pokud existuje úzká alternativa o 1 vyšší:
  - `hasNarrowAlternative === true` → `+10000`.
  - Široká poloha v p s prstem f odpovídá úzké poloze `p+1` s prstem `f` (ne `f-1`).
  - Důsledek: **úzká poloha o 1 vyšší je obecně preferovaná** před širokou v nižší poloze.

### 4. Výška polohy a změna struny

- Penalizace za výšku polohy:
  - `linkCost += curr.p * 10`.
  - pokud `curr.p > 6` → další `(curr.p - 6) * 500`.
- Přechod mezi strunami:
  - pokud `prev.s !== curr.s` → `+200`.

## Globální náklady (finální výběr)

Po dopočítání všech vrstev:

- Z poslední vrstvy (`lastLayer`) se pro každý stav spočítá:

  - `lastPenalty` – penalizace za osamocený tón na konci:
    - pokud `groupSize === 1` → `+10000`;
    - dříve se penalizovala i skupina 3, ale to vedlo k preferenci 3 poloh se dvojicemi před 2 polohami s trojicí; nyní se penalizuje jen velikost 1.

  - `positionPenalty` – penalizace za počet poloh:
    - `positions` = množina všech použitých poloh (`p > 0`) v cestě,
    - `positionPenalty = (positions.size - 1) * 25000`.
    - Cíl: silná preference **co nejmenšího počtu poloh**.

  - `maxPositionPenalty` – penalizace za vysoké polohy:
    - `maxPosition = max(positions)` (pokud nějaké jsou),
    - pokud `maxPosition > 6` → `+ (maxPosition - 6) * 2000`.

Celková cena:

- `total = state.cost + lastPenalty + positionPenalty + maxPositionPenalty`.
- Vybere se stav s nejnižším `total`.

## Druhé průchody (post‑processing vítězné cesty)

Nad vítěznou cestou se aplikují dodatečná pravidla:

1. **Oprava kolem 4. prstu v široké poloze**  
   - Pokud je v cestě `4. prst` v široké poloze (`f === 4`, `ext === 1`), zkontroluje se soused:
     - předchozí / následující tón: `3. prst` v úzké poloze ve stejné poloze `p` a na stejné struně `s`,
     - takový tón se upraví na `2. prst` v široké poloze (`f = 2`, `ext = 1`).
   - Motivace: pokud tóny v široké poloze odpovídají tónům v o 1 vyšší úzké poloze, má se upřednostnit široká poloha i pro sousední tóny.

2. **Oprava osamoceného posledního tónu v poloze**  
   - Najde se poslední skupina tónů ve stejné poloze a na stejné struně.
   - Pokud má tato skupina velikost 1 (osamocený poslední tón v poloze) a existuje pro předchozí tón alternativa ve stejné poloze/struně:
     - předchozí tón se nahradí touto alternativou.
   - Typický příklad: sekvence `d1 e1 f1 g1` – algoritmus může dát `... 5. poloha ... 7. poloha` s jedním tónem v 7. poloze; druhý průchod přesune `f1` do 7. polohy tak, aby **poslední poloha obsahovala 2 tóny**.

## Testy a ladění

Správnost a chování algoritmu je ověřováno v `js/tests.js`:

- Jsou definovány sady tónů a očekávané prstoklady, např.:
  - `e f# g#` – setrvání v I. poloze (D02) se širokým držením.
  - `d1 e1 f1 g1` – sekvence s posuny mezi polohami 5 a 7.
  - `g a h c1 d1 e1 f1# g1` – dlouhá sekvence preferující 2 polohy.

Pro ladění se používají `console.log` výpisy v `solve`, které ukazují:

- náklady přechodů mezi prstoklady,
- detekci širokých poloh s úzkými alternativami,
- top kandidáty v jednotlivých vrstvách,
- finální vybranou cestu včetně penalizací.



