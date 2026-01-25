// --- UI FUNCTIONS ---
import { solve, model } from './fingering.js';
import { t, setNoteNaming, getNoteNaming, getNoteNamingCurrent, applyTranslations } from './i18n.js';

/**
 * Mapování tónů na MIDI čísla (ISO: C2=36, C3=48, C4=60)
 * Cello prázdné struny: C2=36, G2=43, D3=50, A3=57
 * Kontra oktáva (C1–B1): MIDI 24–35. Velké Ces = kontra H = H1 = MIDI 35.
 */
function getMidiNumber(noteName) {
    const n = normalizeOctaveAccidentalSwap(noteName);
    const noteMap = {
        'Hb1': 34, 'Cb': 35, 'H1': 35,
        'C': 36, 'C#': 37, 'D': 38, 'D#': 39, 'E': 40, 'Fb': 40, 'E#': 41, 'F': 41, 'F#': 42,
        'G': 43, 'G#': 44, 'A': 45, 'A#': 46, 'Hb': 46, 'H': 47, 'B': 47,
        'H#': 48, 'c': 48, 'c#': 49, 'd': 50, 'd#': 51, 'e': 52, 'fb': 52, 'e#': 53, 'f': 53, 'f#': 54,
        'g': 55, 'g#': 56, 'a': 57, 'a#': 58, 'hb': 58, 'h': 59, 'b': 59, 'cb': 59,
        'h#': 60, 'c1': 60, 'c1#': 61, 'db1': 61, 'd1': 62, 'd1#': 63, 'eb1': 63, 'e1': 64, 'fb1': 64,
        'e1#': 65, 'f1': 65, 'f1#': 66, 'gb1': 66, 'g1': 67, 'g1#': 68, 'ab1': 68, 'a1': 69,
        'a1#': 70, 'hb1': 70, 'bb1': 70, 'h1': 71, 'b1': 71, 'cb1': 71,
        'c2': 72, 'c2#': 73, 'db2': 73,
    };
    return noteMap[n] || noteMap[n.toLowerCase()] || 60;
}

/**
 * Převod MIDI čísla na Y pozici v basové osnově (v pixelech)
 * Basový klíč pozice (odspodu):
 * - 1. linka = G2 (MIDI 43)
 * - 2. linka = B2 (MIDI 47)
 * - 3. linka = D3 (MIDI 50)
 * - 4. linka = F3 (MIDI 53)
 * - 5. linka = A3 (MIDI 57)
 *
 * Požadované pozice v basovém klíči:
 * - C2 (MIDI 36, velké C) = 2. pomocná linka pod osnovou
 * - D2 (MIDI 38) = pod 1. pomocnou linkou pod osnovou (v mezeře)
 * - c (MIDI 48, malé c = C3) = 1. mezera nad osnovou nebo na 1. pomocné lince nad
 * - c1 (MIDI 60, c1 = C4 = střední C) = 1. pomocná linka nad osnovou
 * - g1 (MIDI 67) = 3. pomocná linka nad osnovou
 *
 * @param {number} midiNumber - MIDI číslo tónu
 * @param {number} baseLineY - Y pozice 1. linky (spodní) v pixelech
 * @param {number} lineSpacing - Vzdálenost mezi linkami v pixelech
 * @param {number} staffTop - Y pozice 5. linky (vrchní) v pixelech
 * @returns {number} Y pozice noty v pixelech
 */
function getNoteYPosition(midiNumber, baseLineY, lineSpacing, staffTop) {
    // V basovém klíči - správné mapování podle MIDI čísel:
    // G2 (MIDI 43) = 1. linka (spodní) = baseLineY
    // B2 (MIDI 47) = 2. linka = baseLineY - 1 * lineSpacing
    // D3 (MIDI 50) = 3. linka = baseLineY - 2 * lineSpacing
    // F3 (MIDI 53) = 4. linka = baseLineY - 3 * lineSpacing
    // A3 (MIDI 57) = 5. linka (vrchní) = staffTop = baseLineY - 4 * lineSpacing
    // C4 (MIDI 60, střední C) = 1. pomocná linka nad = staffTop - lineSpacing
    //
    // Pro noty pod osnovou:
    // C2 (MIDI 36, velké C) = 2. pomocná linka pod = baseLineY + 3.5 * lineSpacing
    // D2 (MIDI 38) = pod 1. pomocnou linkou = baseLineY + 3 * lineSpacing (v mezeře)
    // E2 (MIDI 40) = 1. pomocná linka pod = baseLineY + 2.5 * lineSpacing
    // F2 (MIDI 41) = pod osnovou v mezeře = baseLineY + 2 * lineSpacing

    // Přímé mapování podle MIDI čísel pro basový klíč
    const notePositions = {
        // Kontra oktáva (H1 = B1 = MIDI 35, Hb1 = Bb1 = 34) – pod C2
        34: baseLineY + 4 * lineSpacing,     // Bb1 (Hb1)
        35: baseLineY + 3.75 * lineSpacing,  // B1 (H1, Cb velké)
        // Noty pod osnovou (pomocné linky) - POZOR: větší Y = níže
        36: baseLineY + 3.5 * lineSpacing,   // C2 - 2. pomocná pod osnovou
        37: baseLineY + 3.25 * lineSpacing,  // C#2
        38: baseLineY + 2.5 * lineSpacing, // D2 - pod 1. pomocnou linkou (v mezeře pod linkou)
        39: baseLineY + 2.75 * lineSpacing, // D#2
        40: baseLineY + 2.5 * lineSpacing, // E2 - 1. pomocná pod osnovou
        41: baseLineY + 2 * lineSpacing, // F2 - v mezeře pod osnovou
        42: baseLineY + 1.75 * lineSpacing, // F#2
        // G2 na 1. lince
        43: baseLineY, // G2 - 1. linka (spodní)
        44: baseLineY - 0.25 * lineSpacing, // G#2
        45: baseLineY - 0.5 * lineSpacing, // A2 - 1. mezera
        46: baseLineY - 0.75 * lineSpacing, // A#2
        47: baseLineY - 1 * lineSpacing, // B2 - 2. linka
        48: baseLineY - 1.25 * lineSpacing, // c (C3) - v mezeře mezi 2. a 3. linkou
        49: baseLineY - 1.5 * lineSpacing, // c#3
        50: baseLineY - 2 * lineSpacing, // d (D3) - 3. linka
        51: baseLineY - 2.25 * lineSpacing, // d#3
        52: baseLineY - 2.5 * lineSpacing, // e (E3) - v mezeře mezi 3. a 4. linkou
        53: baseLineY - 3 * lineSpacing, // f (F3) - 4. linka
        54: baseLineY - 3.25 * lineSpacing, // f#3
        55: baseLineY - 3.5 * lineSpacing, // g (G3) - v mezeře mezi 4. a 5. linkou
        56: baseLineY - 3.75 * lineSpacing, // g#3
        57: baseLineY - 4 * lineSpacing, // a (A3) - 5. linka (vrchní) = staffTop
        58: baseLineY - 4.25 * lineSpacing, // a#3
        59: baseLineY - 4.5 * lineSpacing, // h (B3) - v mezeře nad osnovou
        60: staffTop - lineSpacing, // c1 (C4, střední C) - 1. pomocná linka nad osnovou
        61: staffTop - 1.25 * lineSpacing, // c1#4
        62: staffTop - 1.5 * lineSpacing, // d1 (D4) - 2. pomocná linka nad osnovou
        63: staffTop - 1.75 * lineSpacing, // d1#4
        64: staffTop - 2 * lineSpacing, // e1 (E4) - 3. pomocná linka nad osnovou
        65: staffTop - 2.25 * lineSpacing, // f1 (F4)
        66: staffTop - 2.5 * lineSpacing, // f1#4
        67: staffTop - 3 * lineSpacing, // g1 (G4) - 3. pomocná linka nad osnovou (na lince)
        68: staffTop - 3.25 * lineSpacing, // a1 (A4)
        69: staffTop - 3.5 * lineSpacing, // a1# (A#4)
        70: staffTop - 3.75 * lineSpacing, // hb1 / bb1 (Bb4)
        71: staffTop - 4 * lineSpacing, // h1 (B4)
        72: staffTop - 4.25 * lineSpacing, // c2 (C5)
        73: staffTop - 4.5 * lineSpacing, // c2# (C#5) / db2
    };

    // Pokud máme přesné mapování, použij ho
    if (notePositions[midiNumber] !== undefined) {
        return notePositions[midiNumber];
    }

    // Fallback: lineární interpolace
    if (midiNumber < 36) {
        // Velmi nízké noty - extrapolace dolů
        return baseLineY + ((43 - midiNumber) * 0.5 * lineSpacing);
    } else if (midiNumber > 67) {
        // Velmi vysoké noty - extrapolace nahoru
        return staffTop - ((midiNumber - 60) * 0.5 * lineSpacing);
    } else {
        // Interpolace mezi známými hodnotami
        const lower = Math.floor(midiNumber);
        const upper = Math.ceil(midiNumber);
        if (notePositions[lower] !== undefined && notePositions[upper] !== undefined) {
            const ratio = midiNumber - lower;
            return notePositions[lower] + (notePositions[upper] - notePositions[lower]) * ratio;
        }
        // Poslední fallback - standardní výpočet
        return baseLineY - ((midiNumber - 43) * 0.5 * lineSpacing);
    }
}

/**
 * Vykreslí notovou osnovu s basovým klíčem a notami
 * @returns {number} Skutečná šířka klíče včetně mezer
 */
function drawStaff(canvas, input, result) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Nastavení stylů
    const bodyStyles = getComputedStyle(document.body);
    const rootStyles = getComputedStyle(document.documentElement);
    const isDarkMode = document.body.classList.contains('dark-mode');
    const staffColor = bodyStyles.getPropertyValue('--color-text-primary').trim() ||
                      rootStyles.getPropertyValue('--color-text-primary').trim() ||
                      (isDarkMode ? '#f1f5f9' : '#0f172a');

    ctx.strokeStyle = staffColor;
    ctx.fillStyle = staffColor;
    ctx.lineWidth = 1.5;

    // Vymazat canvas
    ctx.clearRect(0, 0, width, height);

    // Nastavení osnovy
    // Osnova je uprostřed canvasu, aby bylo místo pro pomocné linky nad i pod
    const staffTop = 30; // Posunuto dolů, aby bylo místo pro pomocné linky nad osnovou
    const staffBottom = 80; // Posunuto dolů
    const lineSpacing = (staffBottom - staffTop) / 4; // 4 mezery mezi 5 linkami
    const noteSpacing = 44; // Stejné jako min-w-[44px]
    const noteStartX = 60; // Zarovnáno s prsty (stejný offset)
    const baseLineY = staffBottom; // 1. linka (spodní) = G2 (MIDI 43)

    // Vykreslit basový klíč (F klíč) vlevo a získat jeho šířku
    const clefWidth = drawBassClef(ctx, 5, staffTop, staffBottom);

    // Vypočítat skutečnou šířku potřebnou pro všechny noty
    const totalNotesWidth = result.length * noteSpacing;
    const staffEndX = noteStartX + totalNotesWidth + 20; // Konec poslední noty + mezera
    // Poznámka: totalNotesWidth se používá i na konci funkce pro return

    // Vykreslit 5 linek osnovy - až na konec sekvence
    const actualStaffWidth = Math.max(width, staffEndX);
    for (let i = 0; i < 5; i++) {
        const y = staffTop + (i * lineSpacing);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(actualStaffWidth, y); // Linky až na konec sekvence
        ctx.stroke();
    }

    input.forEach((noteName, idx) => {
        // X pozice: přesně pod prsty (stejné jako prsty s offsetem)
        // Prsty: offset 60px + idx * 44px, střed každého prstu je na 60 + idx * 44 + 22
        // Noty: noteStartX (60px) + idx * noteSpacing + střed (22px) = 60 + idx * 44 + 22
        // To je stejné jako prsty, takže zarovnání je správné
        const x = noteStartX + (idx * noteSpacing) + (noteSpacing / 2); // Střed sloupce
        const midiNumber = getMidiNumber(noteName);
        const noteY = getNoteYPosition(midiNumber, baseLineY, lineSpacing, staffTop);

        // Vykreslit notu (plná hlavička bez nožičky)
        drawNote(ctx, x, noteY, staffColor);

        // Vykreslit pomocné linky pokud je nota mimo osnovu
        const topLine = staffTop;
        const bottomLine = staffBottom;
        if (noteY > bottomLine + 2 || noteY < topLine - 2) {
            drawLedgerLines(ctx, x, noteY, staffTop, staffBottom, lineSpacing, staffColor);
        }
    });

    // Vrátit skutečnou šířku: offset pro klíč (60px) + všechny noty + malá mezera na konci
    return 60 + totalNotesWidth + 20; // Offset + šířka všech not + mezera
}

/**
 * Vykreslí basový klíč (F klíč)
 * Klíč má začínat na 2. lince shora, horním obloukem se dotýkat 1. linky, končit mezi 4. a 5. linkou
 * Tečky v 1. a 2. mezeře shora
 */
function drawBassClef(ctx, x, staffTop, staffBottom) {
    const lineSpacing = (staffBottom - staffTop) / 4;

    // Pozice linek (odshora):
    const line1 = staffTop; // 1. linka shora
    const line2 = staffTop + lineSpacing; // 2. linka shora
    const line3 = staffTop + (2 * lineSpacing); // 3. linka shora
    const line4 = staffTop + (3 * lineSpacing); // 4. linka shora
    const line5 = staffBottom; // 5. linka shora

    // Mezery (odshora):
    const space1 = staffTop + (lineSpacing / 2); // 1. mezera shora
    const space2 = staffTop + (1.5 * lineSpacing); // 2. mezera shora

    // Větší basový klíč - začíná na 2. lince shora
    const clefStartY = line2;
    const clefTopY = line1; // Horní oblouk se dotýká 1. linky
    const clefBottomY = line4 + (lineSpacing / 2); // Končí mezi 4. a 5. linkou

    const clefHeight = clefBottomY - clefStartY;
    // Zvětšit klíč - použít větší font (o 50% větší pro lepší viditelnost)
    const clefFontSize = clefHeight * 1.5;
    const clefWidth = clefFontSize * 0.7; // Poměr šířky k výšce

    // Vykreslit basový klíč jako stylizovaný symbol (větší)
    ctx.font = `bold ${clefFontSize}px serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    // Posunout nahoru, aby horní oblouk se dotýkal 1. linky
    ctx.fillText('𝄢', x, clefStartY - (clefFontSize * 0.15)); // Unicode symbol basového klíče

    // Tečky v 1. a 2. mezeře shora (pouze jednou, ne duplicitní)
    const dotRadius = 3;
    const dotX = x + clefWidth + 8; // Pozice teček za klíčem

    // 1. mezera shora
    ctx.beginPath();
    ctx.arc(dotX, space1, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. mezera shora
    ctx.beginPath();
    ctx.arc(dotX, space2, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // Vrátit šířku klíče pro offset
    return clefWidth + 20; // Šířka klíče + mezera + tečky
}

/**
 * Vykreslí notu (plná hlavička)
 */
function drawNote(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    // Plná eliptická hlavička
    ctx.ellipse(x, y, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Vykreslí pomocné linky (ledger lines) pro noty mimo osnovu
 */
function drawLedgerLines(ctx, x, y, staffTop, staffBottom, lineSpacing, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    // Pokud je nota pod osnovou
    if (y > staffBottom) {
        const lines = Math.ceil((y - staffBottom) / (lineSpacing / 2));
        for (let i = 1; i <= lines; i++) {
            const lineY = staffBottom + (i * (lineSpacing / 2));
            if (Math.abs(lineY - y) < 3) { // Pouze linky blízko noty
                ctx.beginPath();
                ctx.moveTo(x - 12, lineY);
                ctx.lineTo(x + 12, lineY);
                ctx.stroke();
            }
        }
    }

    // Pokud je nota nad osnovou
    if (y < staffTop) {
        const lines = Math.ceil((staffTop - y) / (lineSpacing / 2));
        for (let i = 1; i <= lines; i++) {
            const lineY = staffTop - (i * (lineSpacing / 2));
            if (Math.abs(lineY - y) < 3) { // Pouze linky blízko noty
                ctx.beginPath();
                ctx.moveTo(x - 12, lineY);
                ctx.lineTo(x + 12, lineY);
                ctx.stroke();
            }
        }
    }
}

// Uložit poslední výsledek pro překreslení canvasu při změně dark mode
let lastResult = null;
let lastInputForSolve = null;
/** Původní vstup uživatele (bez enharmonických převodů). Používá se pro zobrazení výstupu. */
let lastInput = null;

// Aktuální režim výstupu: 'staff' (notová osnova) nebo 'text' (textový výstup)
let currentOutputFormat = 'staff';

/** Režim označení poloh: 'diatonic' (I, II↓, …) nebo 'chromatic' (I–XIV, římsky). Výchozí diatonické. */
let currentPositionLabelMode = 'diatonic';

/** Mapování chromatické polohy (1–14) na diatonické označení (struna A, 1. prst). 15+ = palcová poloha. */
const POSITION_LABEL_MAP = {
    1: 'I↓', 2: 'I', 3: 'II↓', 4: 'II↑', 5: 'III', 6: 'III↑',
    7: 'IV', 8: 'IV↑', 9: 'V', 10: 'VI', 11: 'VII↓', 12: 'VII',
    13: 'VIII', 14: 'IX'
};

/** Chromatické polohy 1–14 jako římské číslice I–XIV. */
const CHROMATIC_ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];

/**
 * Vrátí označení polohy pro zobrazení.
 * @param {number} p - Chromatická poloha (0 = prázdná, 1–14)
 * @param {'diatonic'|'chromatic'} mode
 * @returns {string}
 */
function toPositionLabel(p, mode) {
    if (p === 0) return '';
    if (mode === 'chromatic') return CHROMATIC_ROMAN[p] ?? String(p);
    return POSITION_LABEL_MAP[p] ?? String(p);
}

/**
 * Vykreslí textový výstup (původní stav - bez osnovy)
 */
function renderTextOutput(container, result, input, positionChanges, stringColors, toRoman) {
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
    const legendTitle = document.createElement('p');
    legendTitle.className = 'text-sm font-bold text-slate-700 mb-2';
    legendTitle.textContent = t('legend.strings');
    legend.appendChild(legendTitle);

    const legendItems = document.createElement('div');
    legendItems.className = 'flex flex-wrap gap-4 text-sm';

    Object.entries(stringColors).forEach(([string, color]) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'flex items-center gap-2';
        legendItem.innerHTML = `
            <span class="w-4 h-4 rounded" style="background-color: ${color}"></span>
            <span class="font-bold">${t('legend.string', { s: string })}</span>
        `;
        legendItems.appendChild(legendItem);
    });

    legend.appendChild(legendItems);
    container.appendChild(legend);
}

/** c#1 → c1#, d1b → db1, c#2 → c2#, d2b → db2 (přehození oktávy a posuvky pro alternativní zadání) */
function normalizeOctaveAccidentalSwap(token) {
    const m1 = token.match(/^([a-g])(#)(1)$/i);
    if (m1) return m1[1] + '1' + m1[2];
    const m2 = token.match(/^([a-g])(1)(b)$/i);
    if (m2) return m2[1] + 'b' + m2[2];
    const m3 = token.match(/^([a-g])(#)(2)$/i);
    if (m3) return m3[1] + '2' + m3[2];
    const m4 = token.match(/^([a-g])(2)(b)$/i);
    if (m4) return m4[1] + 'b' + m4[2];
    return token;
}

/** Podle nastavení H/B vrací zobrazovaný tón (H/Hes vs B/Bb). Vstup je normalizovaný token (H, Hb, h, hb, h1, hb1…). */
function toDisplayNote(token) {
    if (!token || typeof token !== 'string') return token;
    const mode = getNoteNamingCurrent();
    const HtoB = {
        'H': 'B', 'Hb': 'Bb', 'h': 'b', 'hb': 'bb',
        'h1': 'b1', 'hb1': 'bb1', 'H1': 'B1', 'Hb1': 'Bb1'
    };
    const BtoH = {
        'B': 'H', 'Bb': 'Hes', 'b': 'h', 'bb': 'hes',
        'b1': 'h1', 'bb1': 'hb1', 'B1': 'H1', 'Bb1': 'Hb1'
    };
    const map = mode === 'B' ? HtoB : BtoH;
    return map[token] ?? token;
}

/**
 * Převod názvu noty na VexFlow formát
 * Oktávy: C/1 = kontra (MIDI 24–35), C/2 = velká, C/3 = malá, C/4 = jednočárkovaná
 * Velké Ces = kontra H = H1 → Cb/1 resp. B/1 (ISO B1, MIDI 35)
 */
function noteToVexFlow(noteName) {
    const n = normalizeOctaveAccidentalSwap(noteName);
    const noteMap = {
        'Hb1': 'Bb/1', 'Cb': 'Cb/1', 'H1': 'B/1',
        'C': 'C/2', 'C#': 'C#/2', 'D': 'D/2', 'D#': 'D#/2', 'E': 'E/2', 'Fb': 'Fb/2', 'E#': 'E#/2', 'F': 'F/2', 'F#': 'F#/2',
        'G': 'G/2', 'G#': 'G#/2', 'A': 'A/2', 'A#': 'A#/2', 'Hb': 'Bb/2', 'H': 'B/2', 'B': 'B/2',
        'Db': 'Db/2', 'Eb': 'Eb/2', 'Gb': 'Gb/2', 'Ab': 'Ab/2', 'H#': 'B#/2',
        'c': 'C/3', 'c#': 'C#/3', 'd': 'D/3', 'd#': 'D#/3', 'e': 'E/3', 'fb': 'Fb/3', 'e#': 'E#/3', 'f': 'F/3', 'f#': 'F#/3',
        'g': 'G/3', 'g#': 'G#/3', 'a': 'A/3', 'a#': 'A#/3', 'hb': 'Bb/3', 'h': 'B/3', 'b': 'B/3',
        'cb': 'Cb/3', 'db': 'Db/3', 'eb': 'Eb/3', 'gb': 'Gb/3', 'ab': 'Ab/3', 'bb': 'Bb/3', 'h#': 'B#/3',
        'c1': 'C/4', 'c1#': 'C#/4', 'db1': 'Db/4', 'd1': 'D/4', 'd1#': 'D#/4', 'eb1': 'Eb/4', 'e1': 'E/4', 'fb1': 'Fb/4',
        'e1#': 'E#/4', 'f1': 'F/4', 'f1#': 'F#/4', 'gb1': 'Gb/4', 'g1': 'G/4', 'g1#': 'G#/4', 'ab1': 'Ab/4', 'a1': 'A/4',
        'a1#': 'A#/4', 'hb1': 'Bb/4', 'bb1': 'Bb/4', 'h1': 'B/4', 'b1': 'B/4', 'cb1': 'Cb/4',
        'c2': 'C/5', 'c2#': 'C#/5', 'db2': 'Db/5',
    };
    return noteMap[n] || noteMap[n.toLowerCase()] || 'C/4';
}

/**
 * Vykreslí notovou osnovu pomocí VexFlow s polohami, prsty, osnovou a tóny
 * @param {Object} [opts] - Volitelné: { skipLegend: true } pro vynechání legendy (např. na stránce testů)
 */
export { toPositionLabel };
export function renderStaffOutput(container, result, input, positionChanges, stringColors, toRoman, opts = {}) {
    // Zkontrolovat, jestli je VexFlow načten
    if (typeof Vex === 'undefined' || !Vex.Flow) {
        console.error('VexFlow není načten. Použijte textový výstup nebo načtěte VexFlow z CDN.');
        // Fallback na textový výstup
        renderTextOutput(container, result, input, positionChanges, stringColors, toRoman);
        return;
    }

    const { Renderer, Stave, StaveNote, Voice, Formatter, Annotation, Accidental } = Vex.Flow;

    // Nastavení osnovy
    const noteSpacing = 44;
    const clefOffset = 60;
    const totalWidth = clefOffset + (result.length * noteSpacing) + 20;
    // Zvětšená výška pro noty pod osnovou a anotace (více místa nahoře i dole)
    const totalHeight = 250;

    // Vytvořit div pro VexFlow renderer
    const staffDiv = document.createElement('div');
    staffDiv.id = 'vexflow-staff-' + Date.now();
    staffDiv.className = 'staff-output rounded-lg';

    // Vytvořit VexFlow renderer
    const renderer = new Renderer(staffDiv, Renderer.Backends.SVG);
    renderer.resize(totalWidth, totalHeight);
    const context = renderer.getContext();

    // Barva pro klíč, noty, polohy, tóny (černá ve světlém, bílá v dark mode)
    const bodyStyles = getComputedStyle(document.body);
    const staffInk = bodyStyles.getPropertyValue('--color-staff-ink').trim() || bodyStyles.getPropertyValue('--color-text-primary').trim() || '#0f172a';

    // Vytvořit osnovu s basovým klíčem (posunuta dolů, aby bylo místo pro noty pod osnovou a anotace)
    const stave = new Stave(0, 100, totalWidth);
    stave.addClef('bass');
    context.setFillStyle(staffInk);
    context.setStrokeStyle(staffInk);
    stave.setContext(context).draw();

    // Převést noty na VexFlow formát a vytvořit StaveNote objekty s anotacemi
    const notes = input.map((noteName, idx) => {
        const step = result[idx];
        const vexFlowNote = noteToVexFlow(noteName);

        const note = new StaveNote({
            clef: 'bass',
            keys: [vexFlowNote],
            duration: 'w' // whole note (celá nota bez nožičky)
        });
        // Posuvka před notou: explicitně přidat křížek nebo béčko, aby bylo vždy zobrazeno
        if (/[A-Ga-g]#\/\d/.test(vexFlowNote)) {
            try { note.addModifier(new Accidental('#'), 0); } catch (e) { /* ignorovat */ }
        } else if (/^[A-Ga-g]b\/\d/.test(vexFlowNote)) {
            try { note.addModifier(new Accidental('b'), 0); } catch (e) { /* ignorovat */ }
        }
        // Skrýt nožičku - whole notes v VexFlow obvykle nemají nožičku
        try {
            if (note.setStemStyle) {
                note.setStemStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' });
            }
        } catch (e) {
            // Ignorovat chyby
        }

        // Přidat anotace: poloha (nahoře), prst (u noty), tón (dole)
        const annotations = [];

        // Prst (u noty) - vždy zobrazit, přidat jako první
        const rootStylesLocal = getComputedStyle(document.documentElement);
        const fingerColor = stringColors[step.s] || bodyStyles.getPropertyValue('--color-text-primary').trim() || staffInk;
        let fingerText = step.f === 0 ? '0' : step.f.toString();
        if (step.ext === 1) {
            fingerText += '↑';
        }
        const fingerAnnotation = new Annotation(fingerText);
        fingerAnnotation.setFont('Arial', 14, 'bold');
        fingerAnnotation.setStyle({ fillStyle: fingerColor });
        annotations.push(fingerAnnotation);

        // Poloha (nahoře) - pouze pokud je změna polohy, přidat jako druhou
        if (positionChanges.includes(idx) && step.p > 0) {
            const positionAnnotation = new Annotation(toRoman(step.p));
            positionAnnotation.setVerticalJustification(Annotation.VerticalJustify.TOP);
            positionAnnotation.setFont('Arial', 12, 'bold');
            positionAnnotation.setStyle({ fillStyle: staffInk });
            annotations.push(positionAnnotation);
        }

        // Tón (dole) - přidat jako poslední
        const toneAnnotation = new Annotation(input[idx]);
        toneAnnotation.setVerticalJustification(Annotation.VerticalJustify.BOTTOM);
        toneAnnotation.setFont('Arial', 12, 'normal');
        toneAnnotation.setStyle({ fillStyle: staffInk });
        annotations.push(toneAnnotation);

        // Přidat anotace k notě
        annotations.forEach(ann => note.addModifier(ann, 0));

        return note;
    });

    // Vytvořit Voice a formátovat noty
    const voice = new Voice({ num_beats: notes.length, beat_value: 1 });
    voice.addTickables(notes);

    // Formátovat noty s pevnou šířkou
    const formatter = new Formatter();
    formatter.joinVoices([voice]);
    formatter.format([voice], totalWidth - clefOffset - 20);

    // Vykreslit noty (kontext barvy pro note heady)
    context.setFillStyle(staffInk);
    context.setStrokeStyle(staffInk);
    voice.draw(context, stave);

    // Kontejner pro osnovu s horizontálním scrollováním
    const staffContainer = document.createElement('div');
    staffContainer.className = 'overflow-x-auto -mx-8 px-8 md:mx-0 md:px-0';
    staffContainer.appendChild(staffDiv);
    container.appendChild(staffContainer);

    if (opts.skipLegend) return;

    // Legenda barev strun
    const legend = document.createElement('div');
    legend.className = 'mt-6 pt-4 border-t border-slate-200';
    const legendTitle = document.createElement('p');
    legendTitle.className = 'text-sm font-bold text-slate-700 mb-2';
    legendTitle.textContent = t('legend.strings');
    legend.appendChild(legendTitle);
    const legendItems = document.createElement('div');
    legendItems.className = 'flex flex-wrap gap-4 text-sm';
    Object.entries(stringColors).forEach(([s, color]) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'flex items-center gap-2';
        legendItem.innerHTML = `
            <span class="w-4 h-4 rounded" style="background-color: ${color}"></span>
            <span class="font-bold">${t('legend.string', { s })}</span>
        `;
        legendItems.appendChild(legendItem);
    });
    legend.appendChild(legendItems);
    container.appendChild(legend);
}

// Inicializace sekce Nastavení
function initSettings() {
    const settingsSection = document.getElementById('settingsSection');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsContent = document.getElementById('settingsContent');
    const settingsToggleIcon = document.getElementById('settingsToggleIcon');

    if (!settingsSection || !settingsToggle || !settingsContent) return;

    // Toggle skrývání/zobrazování nastavení
    settingsToggle.addEventListener('click', () => {
        const isHidden = settingsContent.classList.contains('hidden');
        settingsContent.classList.toggle('hidden');
        settingsToggleIcon.textContent = isHidden ? '▲' : '▼';
    });

    // Přepínání mezi režimy výstupu
    const radioButtons = document.querySelectorAll('input[name="outputFormat"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentOutputFormat = e.target.value;
            if (lastResult && lastInputForSolve) runSolver(true);
        });
    });
    const defaultFormat = document.querySelector('input[name="outputFormat"][value="staff"]');
    if (defaultFormat) { defaultFormat.checked = true; currentOutputFormat = 'staff'; }

    // Označení poloh: diatonické (výchozí) vs chromatické
    const savedLabel = localStorage.getItem('positionLabelMode');
    if (savedLabel === 'chromatic' || savedLabel === 'diatonic') {
        currentPositionLabelMode = savedLabel;
        const radio = document.querySelector(`input[name="positionLabel"][value="${savedLabel}"]`);
        if (radio) radio.checked = true;
    }
    const positionLabelRadios = document.querySelectorAll('input[name="positionLabel"]');
    positionLabelRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentPositionLabelMode = e.target.value;
            localStorage.setItem('positionLabelMode', currentPositionLabelMode);
            if (lastResult && lastInputForSolve) runSolver(true);
        });
    });

    // H/B: načíst uložený, při změně setNoteNaming + runSolver
    const naming = getNoteNaming();
    const namingRadio = document.querySelector(`input[name="noteNaming"][value="${naming}"]`);
    if (namingRadio) namingRadio.checked = true;
    document.querySelectorAll('input[name="noteNaming"]').forEach((radio) => {
        radio.addEventListener('change', (e) => {
            setNoteNaming(e.target.value === 'B' ? 'B' : 'H');
            if (lastResult && lastInputForSolve) runSolver(true);
        });
    });
}

const bToHMap = {
    B: 'H', Bb: 'Hb', b: 'h', bb: 'hb', b1: 'h1', bb1: 'hb1', B1: 'H1', Bb1: 'Hb1'
};

function runSolver(skipHideAbout = false) {
    const inputVal = document.getElementById('melodyInput').value.trim();
    const display = document.getElementById('pathDisplay');
    const wrapper = document.getElementById('resultsWrapper');

    let result, inputForSolve, input = null;
    if (inputVal) {
        input = inputVal.split(/\s+/);
        const flatToSharpMap = {
            Cb: 'H', Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Hb: 'A#',
            cb: 'h', db: 'c#', eb: 'd#', fb: 'e', gb: 'f#', ab: 'g#', bb: 'a#', hb: 'a#',
            cb1: 'h1', db1: 'c1#', eb1: 'd1#', fb1: 'e1', gb1: 'f1#', ab1: 'g1#', hb1: 'a1#', bb1: 'a1#',
            cb2: 'h1', db2: 'c2#'
        };
        const sharpToNaturalMap = {
            'E#': 'F', 'e#': 'f', 'e1#': 'f1', 'E1#': 'f1',
            'H#': 'c', 'h#': 'c1'
        };
        inputForSolve = input.map((token) => {
            let x = normalizeOctaveAccidentalSwap(token);
            x = bToHMap[x] || bToHMap[x.toLowerCase()] || x;
            const flat = flatToSharpMap[x] || flatToSharpMap[x.toLowerCase()];
            if (flat) return flat;
            const sharp = sharpToNaturalMap[x] || sharpToNaturalMap[x.toLowerCase()];
            if (sharp) return sharp;
            return x;
        });
        result = solve(inputForSolve);
    } else {
        if (!lastResult || !lastInputForSolve) return;
        result = lastResult;
        inputForSolve = lastInputForSolve;
    }

    const inputForDisplay = input !== null ? input : (lastInput || lastInputForSolve);
    const displayTokens = inputForDisplay.map((t) => toDisplayNote(normalizeOctaveAccidentalSwap(t)));

    display.innerHTML = '';
    if (result === null || result === undefined) {
        display.innerHTML = `<p class="text-red-500 font-bold p-4 text-center w-full">${t('errors.outOfRange')}</p>`;
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

        const toPositionLabelFn = (p) => toPositionLabel(p, currentPositionLabelMode);

        // Zjistit, kde se mění poloha (ignorovat prázdnou strunu - pozice 0)
        const positionChanges = [];
        let lastNonZeroPosition = null;

        for (let i = 0; i < result.length; i++) {
            const currentPos = result[i].p;
            // Ignorovat prázdnou strunu (pozice 0)
            if (currentPos > 0) {
                if (lastNonZeroPosition === null || currentPos !== lastNonZeroPosition) {
                    positionChanges.push(i);
                    lastNonZeroPosition = currentPos;
                }
            }
        }

        // Vytvořit kontejner pro výstup
        const container = document.createElement('div');
        container.className = 'w-full space-y-4';

        // Zobrazit výstup podle vybraného režimu (displayTokens = původní vstup + H/B podle nastavení)
        if (currentOutputFormat === 'staff') {
            renderStaffOutput(container, result, displayTokens, positionChanges, stringColors, toPositionLabelFn);
        } else {
            renderTextOutput(container, result, displayTokens, positionChanges, stringColors, toPositionLabelFn);
        }

        display.appendChild(container);

        // Uložit výsledek pro pozdější překreslení (výstup zobrazuje původní vstup uživatele)
        lastResult = result;
        lastInputForSolve = inputForSolve;
        if (input !== null) lastInput = input;

        // Vykreslit vizualizaci hmatníku na Canvas
        drawFingerboard(result, displayTokens);

        // Zobrazit wrapper výsledků
        if (wrapper) {
            wrapper.classList.remove('hidden');
        }

        // Zobrazit sekci Nastavení
        const settingsSection = document.getElementById('settingsSection');
        if (settingsSection) {
            settingsSection.classList.remove('hidden');
        }
    }
}

function drawFingerboard(path, input) {
    const canvas = document.getElementById('fretboardCanvas');
    if (!canvas || !path || path.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const bodyStyles = getComputedStyle(document.body);
    const rootStyles = getComputedStyle(document.documentElement);
    const stringColors = {
        'C': bodyStyles.getPropertyValue('--cello-string-c').trim() || rootStyles.getPropertyValue('--cello-string-c').trim(),
        'G': bodyStyles.getPropertyValue('--cello-string-g').trim() || rootStyles.getPropertyValue('--cello-string-g').trim(),
        'D': bodyStyles.getPropertyValue('--cello-string-d').trim() || rootStyles.getPropertyValue('--cello-string-d').trim(),
        'A': bodyStyles.getPropertyValue('--cello-string-a').trim() || rootStyles.getPropertyValue('--cello-string-a').trim()
    };

    const fingerboardBg = bodyStyles.getPropertyValue('--color-fingerboard').trim() || rootStyles.getPropertyValue('--color-fingerboard').trim() || '#0d0d0d';
    const fingerboardString = bodyStyles.getPropertyValue('--color-fingerboard-string').trim() || rootStyles.getPropertyValue('--color-fingerboard-string').trim() || '#505050';
    const fingerboardFret = bodyStyles.getPropertyValue('--color-fingerboard-fret').trim() || rootStyles.getPropertyValue('--color-fingerboard-fret').trim() || '#404040';
    const fingerboardText = bodyStyles.getPropertyValue('--color-fingerboard-text').trim() || rootStyles.getPropertyValue('--color-fingerboard-text').trim() || '#b0b0b0';
    const fingerboardStroke = bodyStyles.getPropertyValue('--color-fingerboard-stroke').trim() || rootStyles.getPropertyValue('--color-fingerboard-stroke').trim() || '#e0e0e0';

    const strings = ['A', 'D', 'G', 'C'];
    const stringYPositions = {};
    const stringSpacing = height / (strings.length + 1);
    strings.forEach((str, idx) => { stringYPositions[str] = stringSpacing * (idx + 1); });

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = fingerboardBg;
    ctx.fillRect(0, 0, width, height);

    const rightMargin = 40;
    const stringLabelX = 6;
    const openStringX = 44;
    const openCircleR = 12;
    const positionSpan = (width - rightMargin) - openStringX;

    const k = 0.92;
    const numPositions = 14; // 1–14 normální + 15+ palcová
    const gap0 = Math.round(0.14 * positionSpan);
    const rest = positionSpan - gap0;
    const geomSum = (1 - Math.pow(k, numPositions - 1)) / (1 - k);
    const gap1 = rest / geomSum;
    const posX = [openStringX];
    let acc = openStringX + gap0;
    posX.push(acc);
    for (let i = 1; i < numPositions; i++) {
        acc += gap1 * Math.pow(k, i - 1);
        posX.push(acc);
    }

    const stringThickness = { 'C': 4, 'G': 3, 'D': 2.5, 'A': 2 };
    ctx.strokeStyle = fingerboardString;
    strings.forEach(str => {
        ctx.lineWidth = stringThickness[str] || 2;
        ctx.beginPath();
        ctx.moveTo(0, stringYPositions[str]);
        ctx.lineTo(width, stringYPositions[str]);
        ctx.stroke();
        ctx.fillStyle = stringColors[str];
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(str, stringLabelX, stringYPositions[str] + 5);
    });

    ctx.strokeStyle = fingerboardFret;
    ctx.lineWidth = 1;
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = fingerboardText;
    ctx.textAlign = 'center';
    for (let pos = 1; pos <= numPositions; pos++) {
        const x = posX[pos];
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.fillText(toPositionLabel(pos, currentPositionLabelMode), x, 20);
    }

    path.forEach((step, idx) => {
        if (step.p === 0 && step.f === 0) {
            const y = stringYPositions[step.s];
            const tone = input[idx] || '';
            ctx.fillStyle = stringColors[step.s];
            ctx.beginPath();
            ctx.arc(openStringX, y, openCircleR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = fingerboardStroke;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = fingerboardStroke;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('0', openStringX, y + 4);
            ctx.fillStyle = fingerboardText;
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText(tone, openStringX, y + 28);
        }
    });

    const points = path.map((step, idx) => {
        let x;
        if (step.p === 0) {
            x = openStringX;
        } else {
            let targetS;
            if (step.ext === 0) {
                targetS = step.p + (step.f - 1);
            } else {
                const offset = step.f === 2 ? 2 : (step.f === 3 ? 3 : 4);
                targetS = step.p + offset;
            }
            const idx2 = Math.min(targetS, numPositions);
            x = posX[idx2];
        }
        const y = stringYPositions[step.s];
        return { x, y, step, tone: input[idx] || '', index: idx };
    });

    if (points.length > 1) {
        ctx.strokeStyle = fingerboardText;
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

    const wideColor = bodyStyles.getPropertyValue('--color-wide-extended').trim() || rootStyles.getPropertyValue('--color-wide-extended').trim() || '#f59e0b';
    points.forEach(({ x, y, step, tone }) => {
        if (step.p === 0) return;
        const baseColor = step.ext === 1 ? wideColor : stringColors[step.s];
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = fingerboardStroke;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = fingerboardStroke;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(step.f.toString(), x, y + 5);
        ctx.fillStyle = fingerboardText;
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
/** Překreslí výstup a hmatník (např. po změně tématu). Použije lastResult a lastInputForSolve. */
window.redrawResults = function redrawResults() {
    if (lastResult && lastInputForSolve) runSolver(true);
};
Object.defineProperty(window, 'lastResult', {
    get: () => lastResult,
    set: (val) => { lastResult = val; }
});
Object.defineProperty(window, 'lastInputForSolve', {
    get: () => lastInputForSolve,
    set: (val) => { lastInputForSolve = val; }
});

/** Inicializace UI (pouze na hlavní stránce, ne na Testech). Volá se po initI18n. */
export function initUI() {
    if (!document.getElementById('pathDisplay')) return;

    const jsonDisplay = document.getElementById('jsonDisplay');
    if (jsonDisplay) jsonDisplay.textContent = JSON.stringify(model, null, 2);

    const urlParams = new URLSearchParams(window.location.search);
    const sequenceParam = urlParams.get('sequence');
    const melodyInputEl = document.getElementById('melodyInput');
    if (sequenceParam && melodyInputEl) {
        melodyInputEl.value = decodeURIComponent(sequenceParam);
    }

    const mainElement = document.querySelector('main');
    const aboutSection = document.getElementById('aboutSection');
    const menuAboutLink = document.getElementById('menuAboutLink');

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
        document.body.classList.remove('nav-open');
    }

    if (mainElement && aboutSection) {
        const collapsed = localStorage.getItem('aboutCollapsed') === 'true';
        mainElement.classList.toggle('hidden', collapsed);
        if (menuAboutLink) menuAboutLink.addEventListener('click', (e) => { e.preventDefault(); toggleAboutSection(); });
    }

    if (melodyInputEl) {
        melodyInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); runSolver(); }
        });
    }

    const solveButton = document.getElementById('solveButton');
    if (solveButton) solveButton.addEventListener('click', () => runSolver());

    const toggleJsonButton = document.getElementById('toggleJsonButton');
    if (toggleJsonButton) toggleJsonButton.addEventListener('click', toggleJson);

    initSettings();

    window.addEventListener('languageChange', () => {
        if (lastResult && lastInputForSolve) runSolver(true);
    });

    runSolver(true);
}

