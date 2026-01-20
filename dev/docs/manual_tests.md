# Manuální testy (UI/UX)

Tyto testy jsou určené pro lidského testera. Ověřují aspekty, které se hůře automatizují (pocit z ovládání, čitelnost, chování na různých zařízeních).

## 1. Pocit z ovládání a čitelnost prstokladu

1. Otevři `index.html` na desktopu.
2. Zadej několik různých sekvencí, např.:
   - `e f# g#`
   - `d1 e1 f1 g1`
   - `g a h c1 d1 e1 f1# g1`
   - `C c c1 c1# gb`
3. Sleduj:
   - zda jsou tóny ve spodním řádku dobře čitelné (velikost písmen se nemění),
   - zda jsou čísla prstů barevně konzistentní se strunovou legendou,
   - zda je šipka `↑` pro širokou polohu intuitivně pochopitelná.
4. Zhodnoť subjektivně, zda je výsledek „čitelny na první pohled“ a jestli bys s tím reálně hrál z papíru / obrazovky.

## 2. Vizualizace hmatníku (Canvas)

1. Na `index.html` zadej delší sekvenci (např. `g a h c1 d1 e1 f1# g1`).
2. Zkontroluj:
   - zda 4 horizontální struny odpovídají pořadí A–D–G–C shora dolů,
   - zda se pozice 1–12 zobrazují nahoře jako svislé linky s římskými číslicemi,
   - zda body pro tóny:
     - leží na správných strunách,
     - mění se v poloze podle očekávaného prstokladu,
     - mají jinou barvu pro širokou polohu (`ext === 1`),
     - jsou propojené čarou tak, že je dobře vidět trajektorie ruky.
3. Posuď, jestli vizualizace pomáhá rychle pochopit prstoklad (pocitově „mapa ruky na hmatníku“).

## 3. Responzivita a různé šířky obrazovky

1. Otevři `index.html` na:
   - **mobilu / úzkém okně (~320 px)**,
   - **tabletu (~768 px)**,
   - **širokém monitoru / 4K**.
2. Na všech šířkách:
   - zadej sekvenci `g a h c1 d1 e1 f1# g1`,
   - ověř, že:
     - se vstupní pole a tlačítko nezalamují nelogicky,
     - výstup prstokladu a Canvas jsou stále čitelné,
     - nic nepřetéká mimo obrazovku horizontálním scrollováním (ideálně jen vertikální scroll).
3. U mobilu si všímej zejména:
   - dotykové cíle (tlačítko „Navrhnout prstoklad“, toggle JSON),
   - velikost textu tónů a prstů,
   - výkon při opakovaném volání solveru (zda UI nepůsobí „těžkopádně“).


