// --- DATA GENERATION (Consistent with Ondra's JSON logic) ---
function generateFingering(s, targetS) {
    if (targetS === 0) return [{ s, p: 0, f: 0, ext: 0 }];
    let options = [];
    for (let f = 1; f <= 4; f++) {
        let p = targetS - (f - 1);
        if (p >= 1 && p <= 12) options.push({ s, p, f, ext: 0 });
    }
    for (let f = 2; f <= 4; f++) {
        let offset = (f === 2) ? 2 : (f === 3 ? 3 : 4);
        let p = targetS - offset;
        if (p >= 1 && p <= 12) options.push({ s, p, f, ext: 1 });
    }
    return options;
}

const pitchDefs = [
    { n: "C", s: "C", v: 0 }, { n: "C#", s: "C", v: 1 }, { n: "D", s: "C", v: 2 }, { n: "D#", s: "C", v: 3 },
    { n: "E", s: "C", v: 4 }, { n: "F", s: "C", v: 5 }, { n: "F#", s: "C", v: 6 },
    { n: "G", strings: [{s:"G", v:0}, {s:"C", v:7}] }, { n: "G#", strings: [{s:"G", v:1}, {s:"C", v:8}] },
    { n: "A", strings: [{s:"G", v:2}, {s:"C", v:9}] }, { n: "A#", strings: [{s:"G", v:3}, {s:"C", v:10}] },
    { n: "H", strings: [{s:"G", v:4}, {s:"C", v:11}] }, { n: "c", strings: [{s:"G", v:5}, {s:"C", v:12}] },
    { n: "c#", s: "G", v: 6 }, { n: "d", strings: [{s:"D", v:0}, {s:"G", v:7}] }, { n: "d#", s: "G", v: 8 },
    { n: "e", strings: [{s:"D", v:2}, {s:"G", v:9}] }, { n: "f", strings: [{s:"D", v:3}, {s:"G", v:10}] },
    { n: "f#", strings: [{s:"D", v:4}, {s:"G", v:11}] }, { n: "g", strings: [{s:"D", v:5}, {s:"G", v:12}] },
    { n: "g#", s: "D", v: 6 }, { n: "a", strings: [{s:"A", v:0}, {s:"D", v:7}] }, { n: "a#", s: "D", v: 8 },
    { n: "h", strings: [{s:"A", v:2}, {s:"D", v:9}] }, { n: "c1", strings: [{s:"A", v:3}, {s:"D", v:10}] },
    { n: "c1#", s: "A", v: 4 }, { n: "d1", strings: [{s:"A", v:5}, {s:"D", v:12}] }, { n: "d1#", s: "A", v: 6 },
    { n: "e1", s: "A", v: 7 }, { n: "f1", s: "A", v: 8 }, { n: "f1#", s: "A", v: 9 }, { n: "g1", s: "A", v: 10 }
];

// Vytvoření modelu prstokladů
function createFingeringModel() {
    const model = {};
    pitchDefs.forEach(d => {
        let opts = [];
        if (d.strings) d.strings.forEach(st => { opts = opts.concat(generateFingering(st.s, st.v)); });
        else opts = generateFingering(d.s, d.v);
        model[d.n] = opts;
    });
    return model;
}

const model = createFingeringModel();

// --- THE METODICAL ALGORITHM v7 ---

function solve(sequence) {
    console.log('=== ŘEŠENÍ SEKVENCE:', sequence.join(' '), '===');
    let layers = [];

    layers[0] = (model[sequence[0]] || []).map(opt => ({
        path: [opt],
        cost: (opt.p * 10) + (opt.ext * 500),
        lastP: opt.p,
        groupSize: opt.f === 0 ? 0 : 1,
        hasWideInGroup: opt.ext === 1
    }));
    console.log(`Vrstva 0 (${sequence[0]}): ${layers[0].length} možností`);

    for (let i = 1; i < sequence.length; i++) {
        const note = sequence[i];
        const options = model[note];
        if (!options) continue;

        console.log(`\n--- Vrstva ${i}: ${note} (${options.length} možností) ---`);
        layers[i] = [];

        options.forEach(curr => {
            let bestState = null;
            let minTotalCost = Infinity;

            // Kontrola: existuje úzká alternativa o 1 vyšší pro širokou polohu?
            // Široká poloha p s prstem f = úzká poloha p+1 s prstem f (ne f-1!)
            // Důvod: široká f=2 v p=6 dává stejný tón jako úzká f=2 v p=7
            let hasNarrowAlternative = false;
            if (curr.ext === 1 && curr.f >= 2) {
                const narrowAlt = { s: curr.s, p: curr.p + 1, f: curr.f, ext: 0 };
                hasNarrowAlternative = options.some(opt =>
                    opt.s === narrowAlt.s && opt.p === narrowAlt.p &&
                    opt.f === narrowAlt.f && opt.ext === narrowAlt.ext
                );
                if (i >= sequence.length - 3) {
                    if (hasNarrowAlternative) {
                        console.log(`  ✓ Detekována široká ${curr.s}${curr.p.toString().padStart(2, '0')}${curr.f}${curr.ext} s úzkou alternativou ${narrowAlt.s}${narrowAlt.p.toString().padStart(2, '0')}${narrowAlt.f}${narrowAlt.ext}`);
                    } else {
                        // Debug: zobrazit dostupné možnosti
                        const availableNarrow = options.filter(opt => opt.ext === 0 && opt.p === narrowAlt.p);
                        if (availableNarrow.length > 0) {
                            console.log(`  ✗ Široká ${curr.s}${curr.p.toString().padStart(2, '0')}${curr.f}${curr.ext} - úzká alternativa ${narrowAlt.s}${narrowAlt.p.toString().padStart(2, '0')}${narrowAlt.f}${narrowAlt.ext} NENÍ v options`);
                            console.log(`    Dostupné úzké v poloze ${narrowAlt.p}:`, availableNarrow.map(o => `${o.s}${o.p.toString().padStart(2, '0')}${o.f}${o.ext}`).join(', '));
                        }
                    }
                }
            }

            layers[i-1].forEach(prevStep => {
                const prev = prevStep.path[prevStep.path.length - 1];
                let linkCost = 0;

                const isSamePos = (curr.f !== 0 && prev.f !== 0 && curr.p === prev.p);
                const isShift = (curr.f !== 0 && prev.f !== 0 && curr.p !== prev.p);

                // 1. Shift Rules (Vysoká penalizace za pohyb paže)
                if (isShift) {
                    linkCost += 5000; // Zásadní: Shift je drahý oproti extenzi
                    linkCost += Math.abs(curr.p - prev.p) * 100;
                    // Penalizace pouze za odchod po jednom tónu v poloze
                    // (osamocený tón v poloze je nežádoucí)
                    if (prevStep.groupSize === 1) {
                        linkCost += 10000;
                    }
                    // Odchod po 2, 3, 4 tónech už dále NEpenalizujeme,
                    // aby byly trojice a čtveřice tónů v jedné poloze preferované
                    // před rozbíjením do více poloh.
                }

                // 2. Extension Consistency Logic (Fix pro e f# g#)
                if (isSamePos) {
                    // Neutralita 1. prstu: změna extenze z/na 1. prst je OK.
                    // Ale změna mezi prsty 2-4 v jedné poloze je drahá.
                    if (prev.f > 1 && curr.f > 1 && prev.ext !== curr.ext) {
                        linkCost += 3000;
                    }
                    // Anticipace: Pokud skupina vyžaduje extenzi, zůstaň v ní
                    if (prevStep.hasWideInGroup && curr.ext === 0 && curr.f > 1) {
                        linkCost += 2000;
                    }
                }

                // 3. Wide Weight + Preferujeme úzkou polohu o 1 vyšší než široká
                if (curr.ext === 1) {
                    linkCost += 500;
                    // Pokud existuje úzká alternativa o 1 vyšší, silně penalizujeme širokou
                    if (hasNarrowAlternative) {
                        // Vždy silně penalizujeme širokou, pokud existuje úzká alternativa
                        // Toto je důležité pravidlo: úzká o 1 vyšší je vždy lepší než široká
                        linkCost += 10000; // Velmi silná penalizace - preferujeme úzkou o 1 vyšší
                        if (i >= sequence.length - 3) {
                            console.log(`    Široká s úzkou alternativou: ${curr.s}${curr.p.toString().padStart(2, '0')}${curr.f}${curr.ext} -> penalizace +10000`);
                        }
                    }
                }

                // 4. Preferujeme nižší polohy (penalizace za vyšší polohy)
                linkCost += curr.p * 10;
                // Dodatečná penalizace za velmi vysoké polohy
                if (curr.p > 6) linkCost += (curr.p - 6) * 500;

                if (prev.s !== curr.s) linkCost += 200;

                let total = prevStep.cost + linkCost;
                if (total < minTotalCost) {
                    minTotalCost = total;
                    bestState = prevStep;
                    if (i === sequence.length - 1 || i >= sequence.length - 3) {
                        const prevId = `${prev.s}${prev.p.toString().padStart(2, '0')}${prev.f}${prev.ext}`;
                        const currId = `${curr.s}${curr.p.toString().padStart(2, '0')}${curr.f}${curr.ext}`;
                        console.log(`  ✓ Lepší: ${prevId} -> ${currId}, cost=${total.toFixed(0)} (prevCost=${prevStep.cost.toFixed(0)}, linkCost=${linkCost.toFixed(0)})`);
                        if (isShift) console.log(`    Shift: ${prev.p} -> ${curr.p}, groupSize=${prevStep.groupSize}`);
                        if (hasNarrowAlternative && curr.ext === 1) {
                            console.log(`    Široká s úzkou alternativou: ${curr.s}${curr.p.toString().padStart(2, '0')}${curr.f}${curr.ext} -> penalizace +10000`);
                        }
                    }
                }
            });

            if (bestState) {
                const prev = bestState.path[bestState.path.length - 1];
                const samePos = (curr.p === prev.p && curr.f !== 0);

                layers[i].push({
                    path: [...bestState.path, curr],
                    cost: minTotalCost,
                    lastP: curr.p,
                    groupSize: samePos ? (bestState.groupSize + 1) : 1,
                    hasWideInGroup: samePos ? (bestState.hasWideInGroup || curr.ext === 1) : (curr.ext === 1)
                });
            }
        });

        layers[i].sort((a, b) => a.cost - b.cost);
        layers[i] = layers[i].slice(0, 100);

        // Zobrazit top 3 možnosti
        if (i >= sequence.length - 3 || i < 3) {
            console.log(`Top 3 možnosti pro ${note}:`);
            layers[i].slice(0, 3).forEach((state, idx) => {
                const last = state.path[state.path.length - 1];
                const id = `${last.s}${last.p.toString().padStart(2, '0')}${last.f}${last.ext}`;
                const positions = new Set();
                state.path.forEach(step => { if (step.p > 0) positions.add(step.p); });
                console.log(`  ${idx + 1}. ${id}, cost=${state.cost.toFixed(0)}, groupSize=${state.groupSize}, polohy=[${Array.from(positions).sort().join(',')}]`);
            });
        }
    }

    // Finální penalizace: osamocený tón na konci + počet různých poloh
    console.log('\n=== FINÁLNÍ VÝBĚR ===');
    const lastLayer = layers[sequence.length - 1];
    if (!lastLayer) return null;

    // Funkce pro výpočet celkových nákladů s penalizacemi
    const calculateTotalCost = (state) => {
        // Penalizace za osamocený tón na konci
        // Dříve jsme penalizovali i skupinu 3 (1 nebo 3), aby vznikaly dvojice (2+2),
        // ale to vedlo k preferenci více poloh s dvojicemi místo méně poloh s trojicí.
        // Nyní penalizujeme pouze osamocený tón (groupSize === 1),
        // aby globální optimalizace opravdu preferovala co nejméně poloh.
        let lastPenalty = (state.groupSize === 1) ? 10000 : 0;

        // Penalizace za počet různých poloh (globální optimalizace)
        const positions = new Set();
        state.path.forEach(step => {
            if (step.p > 0) positions.add(step.p);
        });

        // Každá další poloha přidá velkou penalizaci (25000 za každou polohu navíc)
        const positionPenalty = (positions.size - 1) * 25000;

        // Dodatečná penalizace za vyšší polohy (preferujeme nižší)
        const maxPosition = positions.size > 0 ? Math.max(...Array.from(positions)) : 0;
        const maxPositionPenalty = maxPosition > 6 ? (maxPosition - 6) * 2000 : 0;

        return {
            total: state.cost + lastPenalty + positionPenalty + maxPositionPenalty,
            baseCost: state.cost,
            lastPenalty,
            positionPenalty,
            maxPositionPenalty,
            positions: Array.from(positions).sort(),
            maxPosition,
            groupSize: state.groupSize
        };
    };

    // Vypočítat náklady pro všechny možnosti
    const optionsWithCosts = lastLayer.map(state => ({
        state,
        costs: calculateTotalCost(state)
    }));

    // Seřadit podle celkových nákladů
    optionsWithCosts.sort((a, b) => a.costs.total - b.costs.total);

    // Zobrazit top 3 možnosti
    console.log('Top 3 možnosti:');
    optionsWithCosts.slice(0, 3).forEach((item, idx) => {
        const pathStr = item.state.path.map(s => `${s.s}${s.p.toString().padStart(2, '0')}${s.f}${s.ext}`).join(' ');
        console.log(`  ${idx + 1}. ${pathStr}`);
        console.log(`     baseCost=${item.costs.baseCost.toFixed(0)}, lastPenalty=${item.costs.lastPenalty}, posPenalty=${item.costs.positionPenalty}, maxPosPenalty=${item.costs.maxPositionPenalty}, TOTAL=${item.costs.total.toFixed(0)}`);
        console.log(`     Polohy: [${item.costs.positions.join(', ')}], maxPos=${item.costs.maxPosition}, groupSize=${item.costs.groupSize}`);
    });

    const winner = optionsWithCosts[0]?.state;
    if (!winner) return null;

    const costs = calculateTotalCost(winner);
    const pathStr = winner.path.map(s => `${s.s}${s.p.toString().padStart(2, '0')}${s.f}${s.ext}`).join(' ');
    console.log(`\n✓ VYBRANÉ ŘEŠENÍ (první průchod): ${pathStr}`);
    console.log(`  Polohy: [${costs.positions.join(', ')}], počet poloh: ${costs.positions.length}`);
    console.log('==================\n');

    // DRUHÝ PRŮCHOD 1: Oprava 3. prstů v úzké poloze na 2. prsty v široké poloze,
    // když okolní tóny mají 4. prst v široké poloze
    console.log('=== DRUHÝ PRŮCHOD 1: Oprava širokých poloh ===');
    let result = [...winner.path];

    const wide4thFingers = [];
    result.forEach((step, idx) => {
        if (step.f === 4 && step.ext === 1) {
            wide4thFingers.push(idx);
        }
    });

    wide4thFingers.forEach(idx => {
        const wide4th = result[idx];

        // Předchozí tón
        if (idx > 0) {
            const prevStep = result[idx - 1];
            if (prevStep.f === 3 && prevStep.ext === 0 &&
                prevStep.p === wide4th.p && prevStep.s === wide4th.s) {
                result[idx - 1] = { ...prevStep, f: 2, ext: 1 };
                console.log(`  Oprava: ${prevStep.s}${prevStep.p.toString().padStart(2, '0')}${prevStep.f}${prevStep.ext} -> ${result[idx - 1].s}${result[idx - 1].p.toString().padStart(2, '0')}${result[idx - 1].f}${result[idx - 1].ext} (před 4. prstem v široké)`);
            }
        }

        // Následující tón
        if (idx < result.length - 1) {
            const nextStep = result[idx + 1];
            if (nextStep.f === 3 && nextStep.ext === 0 &&
                nextStep.p === wide4th.p && nextStep.s === wide4th.s) {
                result[idx + 1] = { ...nextStep, f: 2, ext: 1 };
                console.log(`  Oprava: ${nextStep.s}${nextStep.p.toString().padStart(2, '0')}${nextStep.f}${nextStep.ext} -> ${result[idx + 1].s}${result[idx + 1].p.toString().padStart(2, '0')}${result[idx + 1].f}${result[idx + 1].ext} (po 4. prstu v široké)`);
            }
        }
    });

    // DRUHÝ PRŮCHOD 2: Oprava osamoceného posledního tónu v poloze
    console.log('=== DRUHÝ PRŮCHOD 2: Oprava osamoceného posledního tónu ===');
    if (result.length > 0) {
        const lastIdx = result.length - 1;
        const last = result[lastIdx];

        if (last.f !== 0 && last.p > 0) {
            let groupStart = lastIdx;
            while (groupStart > 0) {
                const prev = result[groupStart - 1];
                if (prev.f !== 0 && prev.p === last.p && prev.s === last.s) {
                    groupStart--;
                } else {
                    break;
                }
            }

            const lastGroupSize = lastIdx - groupStart + 1;

            // Pokud je v poslední poloze jen jeden tón, pokusíme se přidat předchozí tón do stejné polohy
            if (lastGroupSize === 1 && lastIdx > 0) {
                const prevIdx = lastIdx - 1;
                const prevStep = result[prevIdx];
                const prevNote = sequence[prevIdx];
                const prevOptions = model[prevNote] || [];

                const candidates = prevOptions.filter(opt =>
                    opt.s === last.s &&
                    opt.p === last.p &&
                    opt.f !== 0
                );

                if (candidates.length > 0) {
                    candidates.sort((a, b) => {
                        const score = (opt) => (opt.ext * 100) + opt.f;
                        return score(a) - score(b);
                    });

                    const chosen = candidates[0];
                    console.log(
                        `  Oprava osamoceného závěrečného tónu: předchozí tón ${prevStep.s}${prevStep.p.toString().padStart(2, '0')}${prevStep.f}${prevStep.ext}` +
                        ` -> ${chosen.s}${chosen.p.toString().padStart(2, '0')}${chosen.f}${chosen.ext} (přesun do polohy posledního tónu)`
                    );
                    result[prevIdx] = chosen;
                }
            }
        }
    }

    const finalPathStr = result.map(s => `${s.s}${s.p.toString().padStart(2, '0')}${s.f}${s.ext}`).join(' ');
    console.log(`\n✓ FINÁLNÍ ŘEŠENÍ (po opravách): ${finalPathStr}`);
    console.log('==================\n');

    return result;
}

// Export funkcí pro použití v testech a UI (ESM)
export { solve, generateFingering, createFingeringModel, model };

