// --- UI FUNCTIONS ---
import { solve, model } from './fingering.js';

// Uložit poslední výsledek pro překreslení canvasu při změně dark mode
let lastResult = null;
let lastInput = null;

function runSolver(skipHideAbout = false) {
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
        // Při spuštění solveru z uživatelského vstupu skryjeme celý main a uložíme stav
        if (!skipHideAbout) {
            const mainElement = document.querySelector('main');
            if (mainElement && !mainElement.classList.contains('hidden')) {
                mainElement.classList.add('hidden');
                localStorage.setItem('aboutCollapsed', 'true');
            }
        }

        // Barvy pro struny (z CSS proměnných) – preferuj hodnoty z body (dark-mode)
        const bodyStyles = getComputedStyle(document.body);
        const rootStyles = getComputedStyle(document.documentElement);
        const stringColors = {
            'C': bodyStyles.getPropertyValue('--cello-string-c').trim() || rootStyles.getPropertyValue('--cello-string-c').trim(),
            'G': bodyStyles.getPropertyValue('--cello-string-g').trim() || rootStyles.getPropertyValue('--cello-string-g').trim(),
            'D': bodyStyles.getPropertyValue('--cello-string-d').trim() || rootStyles.getPropertyValue('--cello-string-d').trim(),
            'A': bodyStyles.getPropertyValue('--cello-string-a').trim() || rootStyles.getPropertyValue('--cello-string-a').trim()
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
        positionRow.className = 'flex items-start gap-1 text-sm font-bold text-slate-600';
        
        result.forEach((step, idx) => {
            const positionSpan = document.createElement('span');
            positionSpan.className = 'inline-block text-center min-w-[44px]';
            
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
        fingerRow.className = 'flex items-center gap-1 text-lg font-bold';
        
        result.forEach((step, idx) => {
            const fingerSpan = document.createElement('span');
            fingerSpan.className = 'inline-block text-center min-w-[44px]';
            const rootStylesLocal = getComputedStyle(document.documentElement);
            fingerSpan.style.color = stringColors[step.s] || rootStylesLocal.getPropertyValue('--color-text-primary').trim() || '#000';
            
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
        toneRow.className = 'flex items-center gap-1 text-xl font-mono';
        
        result.forEach((step, idx) => {
            const toneSpan = document.createElement('span');
            toneSpan.className = 'inline-block text-center min-w-[44px]';
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

        // Uložit výsledek pro pozdější překreslení
        lastResult = result;
        lastInput = input;

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
    // Číst z body, protože dark-mode třída je na body
    const bodyStyles = getComputedStyle(document.body);
    const rootStyles = getComputedStyle(document.documentElement);
    const stringColors = {
        'C': bodyStyles.getPropertyValue('--cello-string-c').trim() || rootStyles.getPropertyValue('--cello-string-c').trim(),
        'G': bodyStyles.getPropertyValue('--cello-string-g').trim() || rootStyles.getPropertyValue('--cello-string-g').trim(),
        'D': bodyStyles.getPropertyValue('--cello-string-d').trim() || rootStyles.getPropertyValue('--cello-string-d').trim(),
        'A': bodyStyles.getPropertyValue('--cello-string-a').trim() || rootStyles.getPropertyValue('--cello-string-a').trim()
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
    
    // Pozadí canvasu - použít CSS proměnnou nebo fallback podle dark mode
    // Číst z body, protože dark-mode třída je na body
    const isDarkMode = document.body.classList.contains('dark-mode');
    const canvasBgFromBody = bodyStyles.getPropertyValue('--color-canvas-bg').trim();
    const canvasBgFromRoot = rootStyles.getPropertyValue('--color-canvas-bg').trim();
    const canvasBgVar = canvasBgFromBody || canvasBgFromRoot;
    const canvasBg = canvasBgVar || (isDarkMode ? '#1e293b' : '#f8fafc');
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, width, height);

    // Nastavení pro kreslení
    const leftMargin = 60; // Místo pro prázdné struny (pozice 0)
    const fretAreaWidth = width - leftMargin - 40;
    const fretSpacing = fretAreaWidth / 13; // 12 pozic + 1 pro konec

    // Vykreslit horizontální struny s různými tloušťkami
    // Číst z body, protože dark-mode třída je na body
    const canvasStringColor = bodyStyles.getPropertyValue('--color-canvas-string').trim() || rootStyles.getPropertyValue('--color-canvas-string').trim() || '#e2e8f0';
    ctx.strokeStyle = canvasStringColor;
    // Tloušťky strun: C nejtlustší (4px), G méně (3px), D ještě méně (2.5px), A jen o trochu tlustší (2px)
    const stringThickness = { 'C': 4, 'G': 3, 'D': 2.5, 'A': 2 };
    strings.forEach(str => {
        ctx.lineWidth = stringThickness[str] || 2;
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
    // Číst z body, protože dark-mode třída je na body
    const canvasFretColor = bodyStyles.getPropertyValue('--color-canvas-fret').trim() || rootStyles.getPropertyValue('--color-canvas-fret').trim() || '#cbd5e1';
    const canvasTextColor = bodyStyles.getPropertyValue('--color-canvas-text').trim() || rootStyles.getPropertyValue('--color-canvas-text').trim() || '#475569';
    const canvasStrokeColor = bodyStyles.getPropertyValue('--color-canvas-stroke').trim() || rootStyles.getPropertyValue('--color-canvas-stroke').trim() || '#fff';
    ctx.strokeStyle = canvasFretColor;
    ctx.lineWidth = 1;
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = canvasTextColor;
    ctx.textAlign = 'center';
    
    for (let pos = 1; pos <= 12; pos++) {
        const x = leftMargin + (pos * fretSpacing);
        
        // Vertikální čára
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        
        // Číslo polohy nahoře (tmavší/světlejší podle tématu)
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
            // canvasStrokeColor je už definována výše
            ctx.strokeStyle = canvasStrokeColor;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Číslo prstu (0)
            ctx.fillStyle = canvasStrokeColor;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('0', openStringX, y + 4);
            
            // Tón pod bodem (tmavší/světlejší podle tématu)
            ctx.fillStyle = canvasTextColor;
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText(tone, openStringX, y + 25);
        }
    });

    // Vypočítat pozice všech bodů
    // Pozice se počítá podle vzdálenosti od prázdné struny (targetS), ne podle polohy
    const points = path.map((step, idx) => {
        let x;
        if (step.p === 0) {
            x = openStringX;
        } else {
            // Vypočítat targetS (vzdálenost od prázdné struny v půltónech)
            let targetS;
            if (step.ext === 0) {
                // Úzká poloha: targetS = p + (f - 1)
                targetS = step.p + (step.f - 1);
            } else {
                // Široká poloha: targetS = p + offset
                // offset je 2 pro prst 2, 3 pro prst 3, 4 pro prst 4
                const offset = step.f === 2 ? 2 : (step.f === 3 ? 3 : 4);
                targetS = step.p + offset;
            }
            // Pozice na canvasu = vzdálenost od prázdné struny * spacing
            x = leftMargin + (targetS * fretSpacing);
        }
        const y = stringYPositions[step.s];
        return { x, y, step, tone: input[idx] || '', index: idx };
    });

    // Propojit body čarou
    if (points.length > 1) {
        ctx.strokeStyle = canvasTextColor;
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
        // Číst z body, protože dark-mode třída je na body
        const wideColor = bodyStyles.getPropertyValue('--color-wide-extended').trim() || rootStyles.getPropertyValue('--color-wide-extended').trim() || '#f59e0b';
        const baseColor = step.ext === 1 ? wideColor : stringColors[step.s];
        
        // Bod
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Bílý okraj
        ctx.strokeStyle = canvasStrokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Číslo prstu
        ctx.fillStyle = canvasStrokeColor;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        const fingerText = step.f === 0 ? '0' : step.f.toString();
        ctx.fillText(fingerText, x, y + 5);
        
        // Tón pod bodem (tmavší/světlejší podle tématu)
        ctx.fillStyle = canvasTextColor;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(tone, x, y + 30);
    });
}

function toggleJson() {
    document.getElementById('jsonContainer').classList.toggle('hidden');
}

// Export funkcí na window objekt pro použití v onclick atributech
window.runSolver = runSolver;
window.toggleJson = toggleJson;
window.drawFingerboard = drawFingerboard;
// Exportovat proměnné pro přístup z index.html
Object.defineProperty(window, 'lastResult', {
    get: () => lastResult,
    set: (val) => { lastResult = val; }
});
Object.defineProperty(window, 'lastInput', {
    get: () => lastInput,
    set: (val) => { lastInput = val; }
});

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
    
    // Inicializace sekce O aplikaci (skrytí/zobrazení přes menu)
    const mainElement = document.querySelector('main');
    const menuAboutLink = document.getElementById('menuAboutLink');
    const mobileMenuAboutLink = document.getElementById('mobileMenuAboutLink');
    const mobileMenu = document.getElementById('mobileMenu');
    
    // Funkce pro přepnutí viditelnosti sekce O aplikaci (skrývá celý main)
    function toggleAboutSection() {
        if (mainElement) {
            const isCurrentlyHidden = mainElement.classList.contains('hidden');
            if (isCurrentlyHidden) {
                mainElement.classList.remove('hidden');
                localStorage.setItem('aboutCollapsed', 'false');
            } else {
                mainElement.classList.add('hidden');
                localStorage.setItem('aboutCollapsed', 'true');
            }
        }
        // Zavřít mobilní menu po kliknutí
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    }
    
    if (mainElement) {
        const collapsed = localStorage.getItem('aboutCollapsed') === 'true';
        if (collapsed) {
            mainElement.classList.add('hidden');
        } else {
            mainElement.classList.remove('hidden');
        }

        // Přidat event listenery na odkazy v menu
        if (menuAboutLink) {
            menuAboutLink.addEventListener('click', (e) => {
                e.preventDefault();
                toggleAboutSection();
            });
        }
        
        if (mobileMenuAboutLink) {
            mobileMenuAboutLink.addEventListener('click', (e) => {
                e.preventDefault();
                toggleAboutSection();
            });
        }
    }

    // Enter v inputu spustí solver
    const melodyInput = document.getElementById('melodyInput');
    if (melodyInput) {
        melodyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                runSolver();
            }
        });
    }

    // Spustit solver (bez automatického skrývání sekce)
    runSolver(true);
});

