// --- UI FUNCTIONS ---
import { solve, model } from './fingering.js';

function runSolver() {
    const inputVal = document.getElementById('melodyInput').value.trim();
    if (!inputVal) return;
    const input = inputVal.split(/\s+/);

    // Mapování béček na enharmonické křížky pro výpočet.
    // Uživatel může zadat např. "gb" – výpočet proběhne jako "f#",
    // ale ve výstupu zobrazujeme původní zápis z inputu.
    const flatToSharpMap = {
        cb: 'b',
        db: 'c#',
        eb: 'd#',
        fb: 'e',
        gb: 'f#',
        ab: 'g#',
        bb: 'a#',
    };

    const inputForSolve = input.map((token) => {
        const lower = token.toLowerCase();
        return flatToSharpMap[lower] || token;
    });

    const result = solve(inputForSolve);
    const display = document.getElementById('pathDisplay');
    const wrapper = document.getElementById('resultsWrapper');

    display.innerHTML = '';
    if (!result) {
        display.innerHTML = '<p class="text-red-500 font-bold p-4 text-center w-full">Tón mimo rozsah nebo neznámý zápis.</p>';
    } else {
        // Barvy pro struny (z CSS proměnných)
        const rootStyles = getComputedStyle(document.documentElement);
        const stringColors = {
            'C': rootStyles.getPropertyValue('--cello-string-c').trim(),
            'G': rootStyles.getPropertyValue('--cello-string-g').trim(),
            'D': rootStyles.getPropertyValue('--cello-string-d').trim(),
            'A': rootStyles.getPropertyValue('--cello-string-a').trim()
        };

        // Funkce pro převod čísla na římské číslice
        function toRoman(num) {
            const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
            return roman[num] || num.toString();
        }

        // Zjistit, kde se mění poloha
        const positionChanges = [0]; // vždy začínáme na prvním tónu
        for (let i = 1; i < result.length; i++) {
            if (result[i].p !== result[i-1].p) {
                positionChanges.push(i);
            }
        }

        // Vytvořit kontejner pro výstup
        const container = document.createElement('div');
        container.className = 'w-full space-y-4';

        // Řádek s římskými číslicemi poloh
        const positionRow = document.createElement('div');
        positionRow.className = 'flex items-start gap-2 text-sm font-bold text-slate-600';
        
        result.forEach((step, idx) => {
            const positionSpan = document.createElement('span');
            positionSpan.className = 'inline-block text-center min-w-[60px]';
            
            if (positionChanges.includes(idx) && step.p > 0) {
                positionSpan.textContent = toRoman(step.p);
                positionSpan.classList.add('text-slate-800');
            } else {
                positionSpan.textContent = '';
            }
            
            positionRow.appendChild(positionSpan);
        });
        container.appendChild(positionRow);

        // Řádek s čísly prstů
        const fingerRow = document.createElement('div');
        fingerRow.className = 'flex items-center gap-2 text-lg font-bold';
        
        result.forEach((step, idx) => {
            const fingerSpan = document.createElement('span');
            fingerSpan.className = 'inline-block text-center min-w-[60px]';
            const rootStyles = getComputedStyle(document.documentElement);
            fingerSpan.style.color = stringColors[step.s] || rootStyles.getPropertyValue('--color-text-primary').trim() || '#000';
            
            let fingerText = step.f === 0 ? '0' : step.f.toString();
            if (step.ext === 1) {
                fingerText += ' ↑';
            }
            
            fingerSpan.textContent = fingerText;
            fingerRow.appendChild(fingerSpan);
        });
        container.appendChild(fingerRow);

        // Řádek s tóny
        const toneRow = document.createElement('div');
        toneRow.className = 'flex items-center gap-2 text-xl font-mono';
        
        result.forEach((step, idx) => {
            const toneSpan = document.createElement('span');
            toneSpan.className = 'inline-block text-center min-w-[60px]';
            toneSpan.textContent = input[idx];
            toneRow.appendChild(toneSpan);
        });
        container.appendChild(toneRow);

        // Legenda barev strun
        const legend = document.createElement('div');
        legend.className = 'mt-6 pt-4 border-t border-slate-200';
        legend.innerHTML = '<p class="text-sm font-bold text-slate-700 mb-2">Legenda strun:</p>';
        
        const legendItems = document.createElement('div');
        legendItems.className = 'flex flex-wrap gap-4 text-sm';
        
        Object.entries(stringColors).forEach(([string, color]) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'flex items-center gap-2';
            legendItem.innerHTML = `
                <span class="w-4 h-4 rounded" style="background-color: ${color}"></span>
                <span class="font-bold">${string} struna</span>
            `;
            legendItems.appendChild(legendItem);
        });
        
        legend.appendChild(legendItems);
        container.appendChild(legend);

        display.appendChild(container);

        // Vykreslit vizualizaci hmatníku na Canvas
        drawFingerboard(result, input);
    }
    wrapper.classList.remove('hidden');
}

function drawFingerboard(path, input) {
    const canvas = document.getElementById('fretboardCanvas');
    if (!canvas || !path || path.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Funkce pro převod čísla na římské číslice
    function toRoman(num) {
        const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
        return roman[num] || num.toString();
    }

    // Barvy pro struny (z CSS proměnných)
    const rootStyles = getComputedStyle(document.documentElement);
    const stringColors = {
        'C': rootStyles.getPropertyValue('--cello-string-c').trim(),
        'G': rootStyles.getPropertyValue('--cello-string-g').trim(),
        'D': rootStyles.getPropertyValue('--cello-string-d').trim(),
        'A': rootStyles.getPropertyValue('--cello-string-a').trim()
    };

    const strings = ['A', 'D', 'G', 'C']; // Od nejtenčí po nejtlustší (shora dolů)
    const stringYPositions = {};
    const stringSpacing = height / (strings.length + 1);
    
    // Vypočítat Y pozice pro každou strunu
    strings.forEach((str, idx) => {
        stringYPositions[str] = stringSpacing * (idx + 1);
    });

    // Vymazat canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Nastavení pro kreslení
    const leftMargin = 60; // Místo pro prázdné struny (pozice 0)
    const fretAreaWidth = width - leftMargin - 40;
    const fretSpacing = fretAreaWidth / 13; // 12 pozic + 1 pro konec

    // Vykreslit horizontální struny
    ctx.strokeStyle = rootStyles.getPropertyValue('--color-canvas-string').trim() || '#cbd5e1';
    ctx.lineWidth = 2;
    strings.forEach(str => {
        ctx.beginPath();
        ctx.moveTo(0, stringYPositions[str]);
        ctx.lineTo(width, stringYPositions[str]);
        ctx.stroke();
        
        // Název struny vlevo
        ctx.fillStyle = stringColors[str];
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(str, 10, stringYPositions[str] + 5);
    });

    // Vykreslit vertikální značky pro pozice 1-12
    ctx.strokeStyle = rootStyles.getPropertyValue('--color-canvas-fret').trim() || '#94a3b8';
    ctx.lineWidth = 1;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = rootStyles.getPropertyValue('--color-canvas-text').trim() || '#64748b';
    ctx.textAlign = 'center';
    
    for (let pos = 1; pos <= 12; pos++) {
        const x = leftMargin + (pos * fretSpacing);
        
        // Vertikální čára
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        
        // Číslo polohy nahoře
        ctx.fillText(toRoman(pos), x, 20);
    }

    // Vykreslit prázdné struny (pozice 0) vlevo
    const openStringX = leftMargin / 2;
    path.forEach((step, idx) => {
        if (step.p === 0 && step.f === 0) {
            const y = stringYPositions[step.s];
            const tone = input[idx] || '';
            
            // Bod pro prázdnou strunu
            ctx.fillStyle = stringColors[step.s];
            ctx.beginPath();
            ctx.arc(openStringX, y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Bílý okraj
            ctx.strokeStyle = rootStyles.getPropertyValue('--color-canvas-stroke').trim() || '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Číslo prstu (0)
            ctx.fillStyle = rootStyles.getPropertyValue('--color-canvas-stroke').trim() || '#fff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('0', openStringX, y + 4);
            
            // Tón pod bodem
            ctx.fillStyle = rootStyles.getPropertyValue('--color-canvas-text').trim() || '#64748b';
            ctx.font = '10px sans-serif';
            ctx.fillText(tone, openStringX, y + 25);
        }
    });

    // Vypočítat pozice všech bodů
    const points = path.map((step, idx) => {
        let x;
        if (step.p === 0) {
            x = openStringX;
        } else {
            x = leftMargin + (step.p * fretSpacing);
        }
        const y = stringYPositions[step.s];
        return { x, y, step, tone: input[idx] || '', index: idx };
    });

    // Propojit body čarou
    if (points.length > 1) {
        ctx.strokeStyle = rootStyles.getPropertyValue('--color-canvas-text').trim() || '#64748b';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Vykreslit body pro každý krok
    points.forEach(({ x, y, step, tone, index }) => {
        if (step.p === 0) return; // Prázdné struny už jsou vykreslené
        
        // Barva podle struny, nebo jantarová pro širokou polohu
        const wideColor = rootStyles.getPropertyValue('--color-wide-extended').trim() || '#f59e0b';
        const baseColor = step.ext === 1 ? wideColor : stringColors[step.s];
        
        // Bod
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Bílý okraj
        ctx.strokeStyle = rootStyles.getPropertyValue('--color-canvas-stroke').trim() || '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Číslo prstu
        ctx.fillStyle = rootStyles.getPropertyValue('--color-canvas-stroke').trim() || '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        const fingerText = step.f === 0 ? '0' : step.f.toString();
        ctx.fillText(fingerText, x, y + 5);
        
        // Tón pod bodem
        ctx.fillStyle = rootStyles.getPropertyValue('--color-canvas-text').trim() || '#64748b';
        ctx.font = '11px sans-serif';
        ctx.fillText(tone, x, y + 30);
    });
}

function toggleJson() {
    document.getElementById('jsonContainer').classList.toggle('hidden');
}

// Export funkcí na window objekt pro použití v onclick atributech
window.runSolver = runSolver;
window.toggleJson = toggleJson;

// Inicializace při načtení stránky
window.addEventListener('DOMContentLoaded', () => {
    // Nastavit JSON model do zobrazení
    document.getElementById('jsonDisplay').textContent = JSON.stringify(model, null, 2);
    
    // Zkontrolovat, jestli je v URL parametr 'sequence'
    const urlParams = new URLSearchParams(window.location.search);
    const sequenceParam = urlParams.get('sequence');
    
    if (sequenceParam) {
        // Pokud ano, použít ho místo výchozí hodnoty
        document.getElementById('melodyInput').value = decodeURIComponent(sequenceParam);
    }
    
    // Spustit solver
    runSolver();
});

