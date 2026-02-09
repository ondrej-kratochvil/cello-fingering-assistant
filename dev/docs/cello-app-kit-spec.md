# Cello App Kit – Specifikace (dohodnuto)

Dokument shrnuje dohodnuté požadavky na rozšíření aplikace na **Cello App Kit** – sadu nástrojů pro violoncellisty. Slouží jako zdroj pravdy pro implementaci.

---

## Název a koncept

- **Název aplikace**: Cello App Kit
- **Koncept**: Jedna aplikace, více nástrojů (miniaplikací), každý na **samostatné stránce**.
- **Navigace**: Menu umožňuje přímý přístup k libovolnému nástroji. Průvodce cvičením na homepage postupuje krok za krokem s tlačítkem „Další“ na další nástroj v pořadí.
- **Mobile-first**: Přepínání mezi nástroji musí být na mobilu snadné a nezabírat moc místa.

---

## Pořadí implementace (priority)

1. Vylepšení Prstokladu (vstup, výstup, přehrávání, zvýraznění)
2. Ladička
3. Metronom
4. Odpočet
5. Rytmy
6. Smyky
7. Seznam not
8. Odkaz na Portál o violoncelle
9. Homepage – Průvodce cvičením

---

## 1. Prstoklad (vylepšení stávající stránky)

### Vstup

- **Tóny -is/-es**: Podpora zadávání i zobrazení v německé notaci (cis, ces, dis, es …). Vstup se parsuje na vnitřní formu (#/b), ale **výstup zobrazuje to, co uživatel zadal** (stejný princip jako u jiných alternativ vstupu).
- **Textarea**: Jediný vstupní prvek pro tóny je **textarea**. Výchozí výška odpovídá jednomu řádku. **Automatické navyšování výšky** podle obsahu, aby všechny tóny zůstaly ve viewportu. Zalomení řádku = pouze vizuální / zvětšení textarea, **tokeny se rozpoznávají jen podle mezer** (jedna sekvence).
- **Název**: Pole pro název **není** na hlavní stránce. V modalu „Uložit jako test“ uživatel zadá název bez předvyplnění.

### Výstup

- **Zvukové přehrávání**: Web Audio API. Všechny noty zatím **celé**. Ovládání: start, pauza, na začátek.
- **Tempo**: Nastavitelné BPM, **výchozí 480 BPM**. Celé noty = 2 za sekundu.
- **Zvýraznění noty**: Synchronní s přehráváním. Zvýraznění **pouze na notové osnově** (VexFlow). Kurzor/zvýraznění = právě znějící nota.

---

## 2. Ladička

- **Struny**: Pouze otevřené struny C, G, d, a.
- **Vstup**: Mikrofon (Web Audio API / AnalyserNode).
- **Ladění**: Přepínání mezi **temperovaným** a **čistými kvintami** (sweetener). Referenční tón = **A** (např. A = 440 Hz), od něj čisté kvinty.
- **Nastavení**: Volba A = 440 / 441 / 442 / 443 Hz.
- **Zobrazení**: Jako u klasické ladičky – **jehla/ukazatel** + indikace nízko / správně / vysoko.

---

## 3. Metronom

- **Funkce**: Zadání tempa (BPM), start, stop.
- **Zvuky**: Pouze **předpřipravené** zvuky (krátké údery).
- **Důraz**: **Dva typy úderů** – silný (první doba) a slabší (ostatní). Možnost vybrat počet dob v taktu: 2, 3, 4, 6.

---

## 4. Odpočet (minutka)

- **Funkce**: Zadání času (např. 30 minut), start, pauza, reset.
- **Zvuk zvonění**: **Jiná sada** než u metronomu – delší zvonění (konec cvičení).
- **Zobrazení**: Odpočet v obsahu stránky **a v title stránky** (záložka prohlížeče).

---

## 5. Rytmy

- **Samostatná stránka**. Načte **výstup z Prstokladu** (sekvence + prstoklad).
- **Rytmus = pattern**: Např. „2 čtvrťové a 2 osminové“. Délky patternů: **2, 3, 4, 6 nebo 8 not**.
- **Aplikace**: Pattern se opakuje na celou sekvenci (1.–4. nota, 5.–8. nota …). **Neúplná poslední skupina**: aplikovat jen začátek patternu (A).
- **Obtížnost**: Předpřipravené patterny s přiřazenou obtížností; uživatel volí obtížnost, případně „vyšší“ = těžší pattern.
- **Výstup**: Notový zápis ve **VexFlow** – místo celých not **čtvrťové a osminové** podle patternu. Bez synchronizace s metronomem (pouze vizuál).

---

## 6. Smyky

- **Samostatná stránka**. Načte **výstup z Prstokladu** (sekvence + prstoklad).
- **Smyk = pattern**: Např. „2 legato, 2 samostatně“ → 1. a 2. nota svázány obloučkem (slur), 3. a 4. bez úpravy.
- **Aplikace**: Pattern se opakuje po sekvenci. **Zbytek sekvence**: použít **část patternu** (např. „2 legato“).
- **Výstup**: Notový zápis ve **VexFlow** včetně obloučků (slur) podle patternu.

---

## 7. Seznam not

- **Formulář**: Odkaz (URL), název skladby, autor, obtížnost (**1–10**).
- **Úložiště**: Zatím **localStorage**; později PHP + DB. Zatím **bez nahrávání souborů**.
- **Funkce**: Řazení podle sloupce (název, autor, obtížnost) **a filtry** (např. obtížnost 1–3).

---

## 8. Odkaz na Portál o violoncelle

- Odkaz na **violoncello.ondrejkratochvil.eu** v menu nebo v patičce.

---

## 9. Homepage – Průvodce cvičením

- **Úvod**: Textový úvod – co celá sada miniaplikací umí.
- **Průvodce**: Wizard – **jeden krok na obrazovku**. Číslo kroku a název jako **&lt;h2&gt;**.
- **Tlačítko „Další“**: Přejde na **další nástroj v pořadí** (např. Odpočet → Ladička → …).
- **Menu**: Uživatel může **přes menu** přejít přímo na libovolný nástroj (ne nutně postupovat průvodcem).

**Pořadí kroků (návrh)**:
1. Stanovit délku hraní (odpočet)
2. Naladit (ladička)
3. Vybrat noty (seznam not / prstoklad)
4. Udělat prstoklad (prstoklad)
5. Zvolit rytmus (rytmy)
6. Zvolit smyk (smyky)
7. Pustit metronom (metronom)
8. Pustit minutku a cvičit do zvonění

---

## Technické poznámky

- **Stránky**: Každý nástroj na **samostatné stránce** (např. `index.php` = průvodce, `prstoklad.php`, `ladicka.php`, …).
- **Sdílení stavu mezi stránkami**: Prstoklad → Rytmy / Smyky: předat výstup (např. URL parametry, sessionStorage nebo localStorage) tak, aby Rytmy a Smyky mohly načíst „předchozí výstup“.
- **i18n**: Zachovat podporu češtiny a angličtiny u nových textů.

---

*Datum poslední aktualizace: únor 2026*
