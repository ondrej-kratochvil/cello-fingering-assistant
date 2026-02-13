// --- UI FUNCTIONS ---
import { germanToCanonical, normalizeOctaveAccidentalSwap } from './fingering-staff-utils.js';

// Dynamický import s cache-busting (verze z window.__JS_VERSIONS__ v PHP)
const V = typeof window !== 'undefined' && window.__JS_VERSIONS__ || {};
const q = (path, k) => path + (V[k] != null ? '?v=' + V[k] : '');

let solve, model, appendLocalTest, t, setNoteNaming, getNoteNaming, getNoteNamingCurrent, applyTranslations;

export const ready = Promise.all([
  import(q('./fingering.js', 'fingering')).then((m) => { solve = m.solve; model = m.model; }),
  import(q('./tests.js', 'tests')).then((m) => { appendLocalTest = m.appendLocalTest; }),
  import(q('./i18n.js', 'i18n')).then((m) => {
    t = m.t;
    setNoteNaming = m.setNoteNaming;
    getNoteNaming = m.getNoteNaming;
    getNoteNamingCurrent = m.getNoteNamingCurrent;
    applyTranslations = m.applyTranslations;
  }),
]);

/**
 * Mapování tónů na MIDI čísla (ISO: C2=36, C3=48, C4=60)
 * Cello prázdné struny: C2=36, G2=43, D3=50, A3=57
 * Kontra oktáva (C1–B1): MIDI 24–35. Velké Ces = kontra H = H1 = MIDI 35.
 */
function getMidiNumber(noteName) {
    const n = normalizeOctaveAccidentalSwap(germanToCanonical(noteName));
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

/** Prahy pro výběr klíče (notová osnova): nad a1 → houslový; v houslovém zpět na basový až od d1 a nižší */
const A1_MIDI_CLEF = 69;
const D1_MIDI_CLEF = 62;

/**
 * Vrátí pole klíčů ('bass' | 'treble') pro každou notu v pořadí.
 * Pravidlo: nota > a1 → treble; v treble zpět na bass až při notě d1 a nižší (MIDI ≤ 62).
 * @param {string[]} input - pole názvů tónů (např. ['a1','a1#','h1','e1','f1','eb1','d1'])
 * @returns {('bass'|'treble')[]}
 */
export function getClefPerNote(input) {
    const clefPerNote = [];
    let currentClef = 'bass';
    for (let i = 0; i < input.length; i++) {
        const midi = getMidiNumber(input[i]);
        if (midi > A1_MIDI_CLEF) {
            currentClef = 'treble';
        } else if (currentClef === 'treble' && midi <= D1_MIDI_CLEF) {
            currentClef = 'bass';
        }
        clefPerNote.push(currentClef);
    }
    return clefPerNote;
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
const STORAGE_LAST_FINGERING = 'fingering:last';
let editModeEnabled = false;
let activeNoteIndex = null;
let pendingActiveNoteIndex = null;
let fingerTargets = [];
let staffScrollContainer = null;
let modalEl = null;
let modalErrorTimeout = null;
let saveTestModalEl = null;
let saveTestNameInputEl = null;
let saveTestDefaultName = '';
let saveTestReturnFocusEl = null;
let activeFingerHighlightEl = null;
let activeFingerHighlightSvg = null;
let editKeyboardInputEl = null;

// Aktuální režim výstupu: 'staff' (notová osnova) nebo 'text' (textový výstup)
let currentOutputFormat = 'staff';

/** Přehrávání: zvýraznění aktuální noty na osnově */
let currentSetStaffHighlight = null;
/** Stav přehrávání: bpm, playing, currentIndex, timeoutId, audioContext */
let playbackState = { bpm: 480, playing: false, currentIndex: 0, timeoutId: null, audioContext: null };

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

function hasAnyUserDefined(step) {
    if (!step || !step.userDefined) return false;
    return !!(step.userDefined.f || step.userDefined.s || step.userDefined.pos);
}

function buildConstraintsFromResult(result) {
    if (!result) return null;
    return result.map((step) => {
        if (!hasAnyUserDefined(step)) return null;
        const constraint = { userDefined: { ...step.userDefined } };
        if (step.userDefined.f) constraint.f = step.f;
        if (step.userDefined.s) constraint.s = step.s;
        if (step.userDefined.pos) {
            constraint.p = step.p;
            constraint.ext = step.ext;
        }
        return constraint;
    });
}

function applyUserDefinedFlags(result, constraints) {
    if (!constraints) return result;
    return result.map((step, idx) => {
        const constraint = constraints[idx];
        if (!constraint || !constraint.userDefined) return step;
        return { ...step, userDefined: { ...constraint.userDefined } };
    });
}

function normalizeInputTokens(input) {
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
    return input.map((token) => {
        let x = germanToCanonical(token);
        x = normalizeOctaveAccidentalSwap(x);
        x = bToHMap[x] || bToHMap[x.toLowerCase()] || x;
        const flat = flatToSharpMap[x] || flatToSharpMap[x.toLowerCase()];
        if (flat) return flat;
        const sharp = sharpToNaturalMap[x] || sharpToNaturalMap[x.toLowerCase()];
        if (sharp) return sharp;
        return x;
    });
}

function arraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
}

/**
 * Přehrání jedné noty přes Web Audio API (frekvence z MIDI).
 * @param {AudioContext} ctx
 * @param {number} midi - MIDI číslo noty
 * @param {number} durationSeconds - délka tónu v sekundách
 */
function playNote(ctx, midi, durationSeconds) {
    if (!ctx) return;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationSeconds);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationSeconds);
}

/**
 * Zastaví přehrávání a vynuluje stav.
 */
function stopPlayback() {
    if (playbackState.timeoutId != null) {
        clearTimeout(playbackState.timeoutId);
        playbackState.timeoutId = null;
    }
    playbackState.playing = false;
    if (currentSetStaffHighlight) currentSetStaffHighlight(-1);
}

/**
 * Spustí nebo pokračuje v přehrávání sekvence.
 * @param {string[]} noteTokens - normalizované tokeny not (pro getMidiNumber)
 * @param {number} bpm - tempo (celé noty = 4 doby, 2 celé za sekundu při 480 BPM)
 */
function startPlayback(noteTokens, bpm) {
    if (!noteTokens || noteTokens.length === 0) return;
    if (playbackState.playing) return;
    playbackState.playing = true;
    if (playbackState.currentIndex === undefined || playbackState.currentIndex >= noteTokens.length) {
        playbackState.currentIndex = 0;
    }
    playbackState.bpm = bpm;
    const durationSec = (4 * 60) / bpm; // celá nota v sekundách
    if (!playbackState.audioContext) {
        playbackState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = playbackState.audioContext;
    ctx.resume().then(() => {
        scheduleNext();
    }).catch(() => {
        playbackState.playing = false;
    });

    function scheduleNext() {
        if (!playbackState.playing || playbackState.currentIndex >= noteTokens.length) {
            playbackState.playing = false;
            if (currentSetStaffHighlight) currentSetStaffHighlight(-1);
            return;
        }
        const idx = playbackState.currentIndex;
        if (currentSetStaffHighlight) currentSetStaffHighlight(idx);
        const midi = getMidiNumber(noteTokens[idx]);
        playNote(ctx, midi, durationSec * 0.9);
        playbackState.currentIndex += 1;
        playbackState.timeoutId = setTimeout(scheduleNext, durationSec * 1000);
    }

}

function saveLastFingeringState(state) {
    if (!state || !state.input || !state.fingering) return;
    localStorage.setItem(STORAGE_LAST_FINGERING, JSON.stringify(state));
}

function loadLastFingeringState() {
    try {
        const raw = localStorage.getItem(STORAGE_LAST_FINGERING);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.input) || !Array.isArray(data.fingering)) return null;
        if (data.input.length !== data.fingering.length) return null;
        if (data.inputNormalized && data.inputNormalized.length !== data.input.length) return null;
        return data;
    } catch (e) {
        return null;
    }
}

function matchesConstraint(option, constraint) {
    if (!constraint) return true;
    if (constraint.f !== undefined && option.f !== constraint.f) return false;
    if (constraint.s !== undefined && option.s !== constraint.s) return false;
    if (constraint.p !== undefined && option.p !== constraint.p) return false;
    if (constraint.ext !== undefined && option.ext !== constraint.ext) return false;
    return true;
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
    const n = normalizeOctaveAccidentalSwap(germanToCanonical(noteName));
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
export function renderStaffOutput(container, result, input, positionChanges, stringColors, toRoman, opts) {
    opts = opts || {};
    // Zkontrolovat, jestli je VexFlow načten
    if (typeof Vex === 'undefined' || !Vex.Flow) {
        console.error('VexFlow není načten. Použijte textový výstup nebo načtěte VexFlow z CDN.');
        // Fallback na textový výstup
        renderTextOutput(container, result, input, positionChanges, stringColors, toRoman);
        return;
    }

    const { Renderer, Stave, StaveNote, Voice, Formatter, Annotation, Accidental, ClefNote } = Vex.Flow;

    // Nastavení osnovy
    const noteSpacing = 44;
    const clefOffset = 60;
    const totalWidth = clefOffset + (result.length * noteSpacing) + 20;
    // Zmenšená výška - menší odsazení shora
    const totalHeight = 200;

    const clefPerNote = getClefPerNote(input);

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

    // Počáteční klíč dle stavové logiky (clefPerNote[0])
    const initialClef = clefPerNote[0] || 'bass';
    const stave = new Stave(0, 50, totalWidth);
    stave.addClef(initialClef);
    context.setFillStyle(staffInk);
    context.setStrokeStyle(staffInk);
    stave.setContext(context).draw();

    // Převést noty na VexFlow formát a vytvořit StaveNote objekty s anotacemi (klíč dle clefPerNote)
    const notes = input.map((noteName, idx) => {
        const step = result[idx];
        const vexFlowNote = noteToVexFlow(noteName);
        const noteClef = clefPerNote[idx];

        // Použít whole note ('w') - celá nota bez nožičky
        const note = new StaveNote({
            clef: noteClef,
            keys: [vexFlowNote],
            duration: 'w' // whole note (celá nota bez nožičky)
        });
        // Posuvka před notou: explicitně přidat křížek nebo béčko, aby bylo vždy zobrazeno
        if (/[A-Ga-g]#\/\d/.test(vexFlowNote)) {
            try { note.addModifier(new Accidental('#'), 0); } catch (e) { /* ignorovat */ }
        } else if (/^[A-Ga-g]b\/\d/.test(vexFlowNote)) {
            try { note.addModifier(new Accidental('b'), 0); } catch (e) { /* ignorovat */ }
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
        if (hasAnyUserDefined(step)) {
            fingerText += '!';
        }
        const fingerAnnotation = new Annotation(fingerText);
        fingerAnnotation.setFont('Arial', 14, 'bold');
        fingerAnnotation.setStyle({ fillStyle: fingerColor });
        if (typeof fingerAnnotation.setAttribute === 'function') {
            try {
                fingerAnnotation.setAttribute('data-finger-idx', String(idx));
                fingerAnnotation.setAttribute('data-finger-role', 'finger');
            } catch (e) {
                // Ignorovat, pokud VexFlow atributy nepodporuje
            }
        }
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

    // Vytvořit Voice a přidat noty; vložit ClefNote vždy, když se klíč změní oproti předchozí notě
    const tickables = [];
    const noteIndexToTickableIndex = [];
    let tickableIdx = 0;
    for (let i = 0; i < notes.length; i++) {
        if (i > 0 && clefPerNote[i] !== clefPerNote[i - 1]) {
            tickables.push(new ClefNote(clefPerNote[i]));
            tickableIdx++;
        }
        noteIndexToTickableIndex[i] = tickableIdx;
        tickables.push(notes[i]);
        tickableIdx++;
    }
    const voice = new Voice({ num_beats: notes.length, beat_value: 1 });
    voice.addTickables(tickables);

    // Formátovat noty s pevnou šířkou
    const formatter = new Formatter();
    formatter.joinVoices([voice]);
    formatter.format([voice], totalWidth - clefOffset - 20);

    // Vykreslit noty (kontext barvy pro note heady)
    context.setFillStyle(staffInk);
    context.setStrokeStyle(staffInk);
    voice.draw(context, stave);

    // Kontejner pro osnovu s horizontálním scrollováním; vnitřní wrapper scrolluje i s highlightem
    const staffContainer = document.createElement('div');
    staffContainer.className = 'staff-scroll overflow-x-auto md:mx-0 md:px-0';
    const staffInner = document.createElement('div');
    staffInner.className = 'relative';
    staffInner.style.width = totalWidth + 'px';
    staffInner.style.minHeight = totalHeight + 'px';
    staffInner.appendChild(staffDiv);

    let setHighlight = null;
    if (opts.enableHighlight && result.length > 0) {
        const highlightEl = document.createElement('div');
        highlightEl.className = 'staff-note-highlight';
        highlightEl.setAttribute('aria-hidden', 'true');
        highlightEl.style.cssText = 'position:absolute;top:50px;left:0;width:44px;height:150px;pointer-events:none;border-radius:6px;transition:left 0.05s linear;';
        const bodyStyles = getComputedStyle(document.body);
        let highlightColor = 'rgba(99,102,241,0.25)';
        const primary = bodyStyles.getPropertyValue('--color-primary').trim();
        if (primary) {
            const hex6 = primary.match(/^#([0-9a-fA-F]{6})$/);
            if (hex6) {
                const hex = hex6[1];
                highlightColor = `rgba(${parseInt(hex.slice(0,2),16)},${parseInt(hex.slice(2,4),16)},${parseInt(hex.slice(4,6),16)},0.25)`;
            } else if (primary.startsWith('rgba') || primary.startsWith('rgb(')) {
                highlightColor = primary;
            }
        }
        highlightEl.style.backgroundColor = highlightColor;
        highlightEl.style.left = (clefOffset + (noteIndexToTickableIndex[0] ?? 0) * noteSpacing) + 'px';
        staffInner.appendChild(highlightEl);
        setHighlight = (index) => {
            if (index >= 0 && index < result.length) {
                const tickableIdx = noteIndexToTickableIndex[index] ?? index;
                highlightEl.style.left = (clefOffset + tickableIdx * noteSpacing) + 'px';
                highlightEl.style.display = 'block';
            } else {
                highlightEl.style.display = 'none';
            }
        };
        setHighlight(-1);
    }

    staffContainer.appendChild(staffInner);
    container.appendChild(staffContainer);

    if (opts.skipLegend) return (opts.enableHighlight && setHighlight) ? { staffDiv, setHighlight } : staffDiv;

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
    return (opts.enableHighlight && setHighlight) ? { staffDiv, setHighlight } : staffDiv;
}

// Inicializace sekce Nastavení
function initSettings() {
    const settingsSection = document.getElementById('settingsSection');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsContent = document.getElementById('settingsContent');

    if (!settingsSection || !settingsToggle || !settingsContent) return;

    // Toggle skrývání/zobrazování nastavení
    const syncSettingsToggleLabel = () => {
        const isHidden = settingsContent.classList.contains('hidden');
        settingsToggle.textContent = isHidden ? t('button.settingsOpen') : t('button.settingsClose');
        settingsToggle.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
    };
    settingsToggle.addEventListener('click', () => {
        settingsContent.classList.toggle('hidden');
        syncSettingsToggleLabel();
    });
    syncSettingsToggleLabel();
    window.addEventListener('languageChange', syncSettingsToggleLabel);

    // Přepínání mezi režimy výstupu
    const radioButtons = document.querySelectorAll('input[name="outputFormat"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentOutputFormat = e.target.value;
            if (currentOutputFormat !== 'staff') setEditMode(false);
            if (lastResult && lastInputForSolve) runSolver({ skipHideAbout: true, preserveState: true });
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
            if (lastResult && lastInputForSolve) runSolver({ skipHideAbout: true, preserveState: true });
        });
    });

    // H/B: načíst uložený, při změně setNoteNaming + runSolver
    const naming = getNoteNaming();
    const namingRadio = document.querySelector(`input[name="noteNaming"][value="${naming}"]`);
    if (namingRadio) namingRadio.checked = true;
    document.querySelectorAll('input[name="noteNaming"]').forEach((radio) => {
        radio.addEventListener('change', (e) => {
            setNoteNaming(e.target.value === 'B' ? 'B' : 'H');
            if (lastResult && lastInputForSolve) runSolver({ skipHideAbout: true, preserveState: true });
        });
    });
}

const bToHMap = {
    B: 'H', Bb: 'Hb', b: 'h', bb: 'hb', b1: 'h1', bb1: 'hb1', B1: 'H1', Bb1: 'Hb1'
};

function runSolver(options = {}) {
    const { skipHideAbout = false, preserveState = false } = options;
    const inputEl = document.getElementById('melodyInput');
    const inputVal = inputEl ? inputEl.value.trim() : '';
    const display = document.getElementById('pathDisplay');
    const wrapper = document.getElementById('resultsWrapper');

    let result = null;
    let inputForSolve = null;
    let input = null;

    if (inputVal) {
        input = inputVal.split(/\s+/);
        const shouldReuse = preserveState && lastResult && lastInput && arraysEqual(input, lastInput);
        if (shouldReuse) {
            result = lastResult;
            inputForSolve = lastInputForSolve;
        } else {
            inputForSolve = normalizeInputTokens(input);
            result = solve(inputForSolve);
        }
    } else {
        if (!lastResult || !lastInputForSolve) return;
        result = lastResult;
        inputForSolve = lastInputForSolve;
    }

    const inputForDisplay = input !== null ? input : (lastInput || lastInputForSolve);
    renderResults({
        result,
        inputForSolve,
        inputForDisplay,
        inputOriginal: input,
        skipHideAbout,
        display,
        wrapper
    });
}

function renderResults({ result, inputForSolve, inputForDisplay, inputOriginal, skipHideAbout, display, wrapper }) {
    if (!display) return;
    const displayTokens = (inputOriginal !== null && inputOriginal.length === inputForDisplay.length ? inputOriginal : inputForDisplay).map((t) => {
        const canon = normalizeOctaveAccidentalSwap(germanToCanonical(t));
        const forDisplay = toDisplayNote(canon);
        return forDisplay !== canon ? forDisplay : t;
    });

    display.innerHTML = '';
    if (result === null || result === undefined) {
        display.innerHTML = `<p class="text-red-500 font-bold p-4 text-center w-full">${t('errors.outOfRange')}</p>`;
        setEditMode(false);
        updateEditButtonState();
        return;
    }

    // Při spuštění solveru skryjeme blok O aplikaci na stránce Prstoklad (pokud existuje)
    if (!skipHideAbout) {
        const aboutBlock = document.getElementById('fingeringAboutBlock');
        const aboutContent = document.getElementById('fingeringAboutContent');
        if (aboutBlock && aboutContent && !aboutContent.classList.contains('hidden')) {
            aboutContent.classList.add('hidden');
            const toggleBtn = document.getElementById('fingeringAboutToggle');
            const toggleText = document.getElementById('fingeringAboutToggleText');
            const chevron = document.getElementById('fingeringAboutChevron');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            if (toggleText) toggleText.textContent = t('fingering.toggleAbout');
            if (chevron) chevron.style.transform = 'rotate(-90deg)';
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

    // Zastavit přehrávání při novém vykreslení a resetovat pozici
    stopPlayback();
    playbackState.currentIndex = 0;
    currentSetStaffHighlight = null;

    // Zobrazit výstup podle vybraného režimu (displayTokens = původní vstup + H/B podle nastavení)
    let staffDiv = null;
    if (currentOutputFormat === 'staff') {
        const staffResult = renderStaffOutput(container, result, displayTokens, positionChanges, stringColors, toPositionLabelFn, { enableHighlight: true });
        staffDiv = staffResult && staffResult.staffDiv ? staffResult.staffDiv : staffResult;
        const hasStaffHighlight = staffResult && typeof staffResult.setHighlight === 'function';
        if (hasStaffHighlight) currentSetStaffHighlight = staffResult.setHighlight;

        // Pás přehrávání pouze když máme osnovu s highlightem (jinak byl fallback na textový výstup)
        if (hasStaffHighlight) {
            const playbackBar = document.createElement('div');
            playbackBar.className = 'playback-bar flex flex-wrap items-center gap-3 py-2';
            const bpmLabel = document.createElement('label');
            bpmLabel.className = 'text-sm font-bold text-slate-700';
            bpmLabel.textContent = t('playback.bpm');
            bpmLabel.htmlFor = 'playbackBpm';
            const bpmInput = document.createElement('input');
            bpmInput.type = 'number';
            bpmInput.id = 'playbackBpm';
            bpmInput.min = 60;
            bpmInput.max = 600;
            bpmInput.value = playbackState.bpm;
            bpmInput.className = 'w-20 px-2 py-1 border border-slate-300 rounded font-mono text-sm';
            const playBtn = document.createElement('button');
            playBtn.type = 'button';
            playBtn.className = 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg';
            playBtn.textContent = t('playback.play');
            const pauseBtn = document.createElement('button');
            pauseBtn.type = 'button';
            pauseBtn.className = 'bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg';
            pauseBtn.textContent = t('playback.pause');
            const restartBtn = document.createElement('button');
            restartBtn.type = 'button';
            restartBtn.className = 'bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg';
            restartBtn.textContent = t('playback.restart');

            bpmInput.addEventListener('change', () => {
                const v = parseInt(bpmInput.value, 10);
                if (!Number.isNaN(v) && v >= 60 && v <= 600) playbackState.bpm = v;
            });
            playBtn.addEventListener('click', () => {
                if (!playbackState.playing) {
                    const bpm = parseInt(bpmInput.value, 10);
                    if (!Number.isNaN(bpm) && bpm >= 60 && bpm <= 600) playbackState.bpm = bpm;
                    startPlayback(displayTokens, playbackState.bpm);
                }
            });
            pauseBtn.addEventListener('click', stopPlayback);
            restartBtn.addEventListener('click', () => {
                stopPlayback();
                playbackState.currentIndex = 0;
                if (currentSetStaffHighlight) currentSetStaffHighlight(-1);
                const bpm = parseInt(bpmInput.value, 10);
                if (!Number.isNaN(bpm) && bpm >= 60 && bpm <= 600) playbackState.bpm = bpm;
                startPlayback(displayTokens, playbackState.bpm);
            });

            playbackBar.appendChild(bpmLabel);
            playbackBar.appendChild(bpmInput);
            playbackBar.appendChild(playBtn);
            playbackBar.appendChild(pauseBtn);
            playbackBar.appendChild(restartBtn);
            container.appendChild(playbackBar);
        }
    } else {
        renderTextOutput(container, result, displayTokens, positionChanges, stringColors, toPositionLabelFn);
    }

    display.appendChild(container);

    // Uložit výsledek pro pozdější překreslení (výstup zobrazuje původní vstup uživatele)
    lastResult = result;
    lastInputForSolve = inputForSolve;
    if (inputOriginal !== null) lastInput = inputOriginal;

    if (lastInput && lastInputForSolve && lastResult) {
        saveLastFingeringState({
            input: lastInput,
            inputNormalized: lastInputForSolve,
            fingering: lastResult
        });
    }

    // Vykreslit vizualizaci hmatníku na Canvas
    drawFingerboard(result, displayTokens);

    // Zobrazit wrapper výsledků
    if (wrapper) {
        wrapper.classList.remove('hidden');
    }

    const settingsSection = document.getElementById('settingsSection');
    if (settingsSection) {
        settingsSection.classList.remove('hidden');
    }

    if (currentOutputFormat === 'staff') {
        setupFingeringEditor(staffDiv, result);
    } else {
        teardownFingeringEditor();
    }
    updateEditButtonState();
}

function updateEditButtonLabel() {
    const editButton = document.getElementById('editFingeringButton');
    if (!editButton) return;
    editButton.textContent = editModeEnabled ? t('button.editStop') : t('button.editStart');
}

function updateEditButtonState() {
    const editButton = document.getElementById('editFingeringButton');
    if (!editButton) return;
    const disabled = currentOutputFormat !== 'staff' || !lastResult;
    editButton.disabled = disabled;
    editButton.classList.toggle('opacity-60', disabled);
    editButton.classList.toggle('cursor-not-allowed', disabled);
    editButton.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    if (disabled && editModeEnabled) {
        setEditMode(false);
    }
}

function setEditMode(enabled, focusIndex = 0) {
    if (!enabled) {
        editModeEnabled = false;
        activeNoteIndex = null;
        pendingActiveNoteIndex = null;
        closeModal();
        clearActiveFingerHighlight();
        blurEditKeyboardInput();
        updateEditButtonLabel();
        return;
    }
    if (!lastResult || currentOutputFormat !== 'staff') {
        editModeEnabled = false;
        updateEditButtonLabel();
        return;
    }
    editModeEnabled = true;
    pendingActiveNoteIndex = Math.min(focusIndex, lastResult.length - 1);
    if (fingerTargets.length) {
        setActiveNoteIndex(pendingActiveNoteIndex);
    }
    updateEditButtonLabel();
    focusEditKeyboardInput();
}

function ensureModal() {
    if (modalEl) return;
    modalEl = document.createElement('div');
    modalEl.id = 'fingeringModal';
    modalEl.className = 'fingering-modal';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = `
        <div class="fingering-modal__error" data-role="error" aria-live="polite"></div>
        <div class="fingering-modal__section" data-field="pos">
            <div class="fingering-modal__label" data-role="label"></div>
            <div class="fingering-modal__buttons" data-role="buttons"></div>
        </div>
        <div class="fingering-modal__section" data-field="s">
            <div class="fingering-modal__label" data-role="label"></div>
            <div class="fingering-modal__buttons" data-role="buttons"></div>
        </div>
        <div class="fingering-modal__section" data-field="f">
            <div class="fingering-modal__label" data-role="label"></div>
            <div class="fingering-modal__buttons" data-role="buttons"></div>
        </div>
    `;
    modalEl.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-field]');
        if (!button || button.disabled) return;
        const field = button.dataset.field;
        const isAuto = button.dataset.auto === 'true';
        const value = button.dataset.value ?? null;
        applyModalSelection(field, value, isAuto);
    });
    document.body.appendChild(modalEl);
}

function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
}

function showModalError(message) {
    if (!modalEl) return;
    const errorEl = modalEl.querySelector('[data-role="error"]');
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.add('is-visible');
    if (modalErrorTimeout) window.clearTimeout(modalErrorTimeout);
    modalErrorTimeout = window.setTimeout(() => {
        errorEl.textContent = '';
        errorEl.classList.remove('is-visible');
    }, 2000);
}

function hasMatchingOption(options, constraint) {
    return options.some(opt => matchesConstraint(opt, constraint));
}

function renderModalButtons(container, field, items) {
    container.innerHTML = '';
    items.forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'fingering-modal__btn';
        if (item.active) button.classList.add('is-active');
        if (item.isAuto) button.classList.add('is-auto');
        if (item.disabled) button.classList.add('is-disabled');
        button.disabled = !!item.disabled;
        button.dataset.field = field;
        if (item.isAuto) {
            button.dataset.auto = 'true';
        } else {
            button.dataset.value = String(item.value);
        }
        button.textContent = item.label;
        container.appendChild(button);
    });
}

function renderModalContent() {
    if (!modalEl || activeNoteIndex === null || !lastResult || !lastInputForSolve) return;
    const step = lastResult[activeNoteIndex];
    const noteKey = lastInputForSolve[activeNoteIndex];
    if (!step || !noteKey) return;

    const options = model[noteKey] || [];
    const userDefined = step.userDefined || {};
    const baseConstraint = {};
    if (userDefined.f) baseConstraint.f = step.f;
    if (userDefined.s) baseConstraint.s = step.s;
    if (userDefined.pos) {
        baseConstraint.p = step.p;
        baseConstraint.ext = step.ext;
    }

    const sections = modalEl.querySelectorAll('.fingering-modal__section');
    sections.forEach((section) => {
        const field = section.getAttribute('data-field');
        const label = section.querySelector('[data-role="label"]');
        const buttonsWrap = section.querySelector('[data-role="buttons"]');
        if (!label || !buttonsWrap) return;

        if (field === 'f') {
            label.textContent = t('modal.finger');
            const autoConstraint = { ...baseConstraint };
            delete autoConstraint.f;
            const items = [
                {
                    label: t('modal.auto'),
                    value: null,
                    isAuto: true,
                    disabled: !hasMatchingOption(options, autoConstraint),
                    active: !userDefined.f
                },
                ...[0, 1, 2, 3, 4].map((f) => {
                    const constraint = { ...baseConstraint, f };
                    return {
                        label: String(f),
                        value: f,
                        isAuto: false,
                        disabled: !hasMatchingOption(options, constraint),
                        active: userDefined.f && step.f === f
                    };
                })
            ];
            renderModalButtons(buttonsWrap, 'f', items);
        }

        if (field === 's') {
            label.textContent = t('modal.string');
            const autoConstraint = { ...baseConstraint };
            delete autoConstraint.s;
            const items = [
                {
                    label: t('modal.auto'),
                    value: null,
                    isAuto: true,
                    disabled: !hasMatchingOption(options, autoConstraint),
                    active: !userDefined.s
                },
                ...['C', 'G', 'D', 'A'].map((s) => {
                    const constraint = { ...baseConstraint, s };
                    return {
                        label: s,
                        value: s,
                        isAuto: false,
                        disabled: !hasMatchingOption(options, constraint),
                        active: userDefined.s && step.s === s
                    };
                })
            ];
            renderModalButtons(buttonsWrap, 's', items);
        }

        if (field === 'pos') {
            label.textContent = t('modal.position');
            const autoConstraint = { ...baseConstraint };
            delete autoConstraint.p;
            delete autoConstraint.ext;

            const uniquePositions = new Map();
            options.forEach((opt) => {
                if (opt.p > 0) {
                    const key = `${opt.p}|${opt.ext}`;
                    if (!uniquePositions.has(key)) {
                        uniquePositions.set(key, { p: opt.p, ext: opt.ext });
                    }
                }
            });

            const positions = Array.from(uniquePositions.values())
                .sort((a, b) => (a.p - b.p) || (a.ext - b.ext));

            const items = [
                {
                    label: t('modal.auto'),
                    value: null,
                    isAuto: true,
                    disabled: !hasMatchingOption(options, autoConstraint),
                    active: !userDefined.pos
                },
                ...positions.map((pos) => {
                    const constraint = { ...baseConstraint, p: pos.p, ext: pos.ext };
                    const labelText = `${toPositionLabel(pos.p, currentPositionLabelMode)} ${pos.ext === 1 ? t('position.wide') : t('position.narrow')}`;
                    return {
                        label: labelText,
                        value: `${pos.p}|${pos.ext}`,
                        isAuto: false,
                        disabled: !hasMatchingOption(options, constraint),
                        active: userDefined.pos && step.p === pos.p && step.ext === pos.ext
                    };
                })
            ];
            renderModalButtons(buttonsWrap, 'pos', items);
        }
    });
}

function ensureHighlightDefs(svg) {
    if (!svg) return;
    if (svg.querySelector('#fingering-highlight-gradient-light') &&
        svg.querySelector('#fingering-highlight-gradient-dark')) return;
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.insertBefore(defs, svg.firstChild);
    }
    const createGradient = (id, innerColor, outerColor, outerOpacity = null) => {
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        gradient.setAttribute('id', id);
        gradient.setAttribute('cx', '50%');
        gradient.setAttribute('cy', '50%');
        gradient.setAttribute('r', '60%');

        const stopInner = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopInner.setAttribute('offset', '0%');
        stopInner.setAttribute('stop-color', innerColor);
        const stopOuter = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopOuter.setAttribute('offset', '100%');
        stopOuter.setAttribute('stop-color', outerColor);
        if (outerOpacity !== null) stopOuter.setAttribute('stop-opacity', String(outerOpacity));
        gradient.appendChild(stopInner);
        gradient.appendChild(stopOuter);
        defs.appendChild(gradient);
    };

    if (!svg.querySelector('#fingering-highlight-gradient-light')) {
        createGradient('fingering-highlight-gradient-light', '#facc15', '#ffffff');
    }
    if (!svg.querySelector('#fingering-highlight-gradient-dark')) {
        createGradient('fingering-highlight-gradient-dark', '#000000', '#000000', 0);
    }
}

function ensureHighlightLayer(svg) {
    if (!svg) return null;
    let layer = svg.querySelector('g.fingering-highlight-layer');
    if (!layer) {
        layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        layer.setAttribute('class', 'fingering-highlight-layer');
        const defs = svg.querySelector('defs');
        if (defs && defs.nextSibling) {
            svg.insertBefore(layer, defs.nextSibling);
        } else if (defs) {
            svg.appendChild(layer);
        } else {
            svg.insertBefore(layer, svg.firstChild);
        }
    }
    return layer;
}

function clearActiveFingerHighlight() {
    if (activeFingerHighlightEl && activeFingerHighlightEl.parentNode) {
        activeFingerHighlightEl.parentNode.removeChild(activeFingerHighlightEl);
    }
    activeFingerHighlightEl = null;
    activeFingerHighlightSvg = null;
}

function updateActiveFingerHighlight(anchorEl) {
    if (!anchorEl) {
        clearActiveFingerHighlight();
        return;
    }
    const svg = anchorEl.ownerSVGElement;
    if (!svg) return;
    ensureHighlightDefs(svg);
    const layer = ensureHighlightLayer(svg);
    if (!layer) return;

    if (activeFingerHighlightEl && activeFingerHighlightSvg !== svg) {
        clearActiveFingerHighlight();
    }
    if (!activeFingerHighlightEl) {
        activeFingerHighlightEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        activeFingerHighlightEl.classList.add('fingering-highlight');
        activeFingerHighlightEl.setAttribute('rx', '8');
        activeFingerHighlightEl.setAttribute('ry', '8');
        activeFingerHighlightEl.setAttribute('pointer-events', 'none');
        activeFingerHighlightEl.setAttribute('stroke', 'none');
        activeFingerHighlightEl.setAttribute('stroke-width', '0');
        activeFingerHighlightSvg = svg;
    }
    let box;
    try {
        box = anchorEl.getBBox();
    } catch (e) {
        return;
    }
    const padX = 8;
    const padY = 6;
    activeFingerHighlightEl.setAttribute('x', String(box.x - padX));
    activeFingerHighlightEl.setAttribute('y', String(box.y - padY));
    activeFingerHighlightEl.setAttribute('width', String(box.width + padX * 2));
    activeFingerHighlightEl.setAttribute('height', String(box.height + padY * 2));

    if (activeFingerHighlightEl.parentNode !== layer) {
        layer.appendChild(activeFingerHighlightEl);
    }
}

function ensureEditKeyboardInput() {
    if (editKeyboardInputEl) return;
    editKeyboardInputEl = document.createElement('input');
    editKeyboardInputEl.type = 'text';
    editKeyboardInputEl.inputMode = 'numeric';
    editKeyboardInputEl.pattern = '[0-4]*';
    editKeyboardInputEl.autocomplete = 'off';
    editKeyboardInputEl.className = 'edit-keyboard-input';
    editKeyboardInputEl.setAttribute('aria-label', t('aria.editKeyboard'));
    editKeyboardInputEl.addEventListener('input', (e) => {
        if (!editModeEnabled || currentOutputFormat !== 'staff') {
            editKeyboardInputEl.value = '';
            return;
        }
        const value = e.target.value || '';
        const digits = value.match(/[0-4]/g);
        if (digits) {
            digits.forEach((digit) => applyModalSelection('f', digit, false));
        }
        editKeyboardInputEl.value = '';
    });
    document.body.appendChild(editKeyboardInputEl);
}

function focusEditKeyboardInput() {
    if (!editKeyboardInputEl || !editModeEnabled || currentOutputFormat !== 'staff') return;
    if (document.activeElement === editKeyboardInputEl) return;
    try {
        editKeyboardInputEl.focus({ preventScroll: true });
    } catch (e) {
        editKeyboardInputEl.focus();
    }
}

function blurEditKeyboardInput() {
    if (!editKeyboardInputEl) return;
    if (document.activeElement === editKeyboardInputEl) {
        editKeyboardInputEl.blur();
    }
}

function ensureSaveTestModal() {
    if (saveTestModalEl) return;
    saveTestModalEl = document.createElement('div');
    saveTestModalEl.className = 'save-test-modal';
    saveTestModalEl.setAttribute('aria-hidden', 'true');
    saveTestModalEl.innerHTML = `
        <div class="save-test-modal__dialog" role="dialog" aria-modal="true">
            <div class="save-test-modal__title" data-role="title"></div>
            <label class="save-test-modal__label" data-role="label" for="saveTestNameInput"></label>
            <div class="save-test-modal__input">
                <input id="saveTestNameInput" type="text" autocomplete="off">
                <button type="button" data-role="clear" aria-label=""></button>
            </div>
            <div class="save-test-modal__actions">
                <button type="button" class="is-secondary" data-role="cancel"></button>
                <button type="button" class="is-primary" data-role="save"></button>
            </div>
        </div>
    `;
    document.body.appendChild(saveTestModalEl);

    saveTestNameInputEl = saveTestModalEl.querySelector('#saveTestNameInput');
    const clearButton = saveTestModalEl.querySelector('[data-role="clear"]');
    const cancelButton = saveTestModalEl.querySelector('[data-role="cancel"]');
    const saveButton = saveTestModalEl.querySelector('[data-role="save"]');

    if (clearButton && saveTestNameInputEl) {
        clearButton.textContent = '×';
        clearButton.addEventListener('click', () => {
            saveTestNameInputEl.value = '';
            saveTestNameInputEl.focus();
        });
    }
    if (cancelButton) {
        cancelButton.addEventListener('click', () => closeSaveTestModal());
    }
    if (saveButton) {
        saveButton.addEventListener('click', () => handleSaveTestConfirm());
    }
    saveTestModalEl.addEventListener('click', (e) => {
        if (e.target === saveTestModalEl) closeSaveTestModal();
    });
    if (saveTestNameInputEl) {
        saveTestNameInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeSaveTestModal();
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveTestConfirm();
            }
        });
    }
    updateSaveTestModalTexts();
}

function updateSaveTestModalTexts() {
    if (!saveTestModalEl) return;
    const title = saveTestModalEl.querySelector('[data-role="title"]');
    const label = saveTestModalEl.querySelector('[data-role="label"]');
    const clearButton = saveTestModalEl.querySelector('[data-role="clear"]');
    const cancelButton = saveTestModalEl.querySelector('[data-role="cancel"]');
    const saveButton = saveTestModalEl.querySelector('[data-role="save"]');
    if (title) title.textContent = t('modal.saveTestTitle');
    if (label) label.textContent = t('modal.saveTestLabel');
    if (cancelButton) cancelButton.textContent = t('button.cancel');
    if (saveButton) saveButton.textContent = t('button.save');
    if (clearButton) clearButton.setAttribute('aria-label', t('aria.clearTestName'));
}

function openSaveTestModal(defaultName) {
    ensureSaveTestModal();
    saveTestDefaultName = defaultName || '';
    saveTestReturnFocusEl = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    saveTestModalEl.classList.add('is-open');
    saveTestModalEl.setAttribute('aria-hidden', 'false');
    if (saveTestNameInputEl) {
        saveTestNameInputEl.value = saveTestDefaultName;
        saveTestNameInputEl.focus();
        saveTestNameInputEl.select();
    }
}

function closeSaveTestModal() {
    if (!saveTestModalEl) return;
    if (saveTestReturnFocusEl && typeof saveTestReturnFocusEl.focus === 'function') {
        saveTestReturnFocusEl.focus();
    } else {
        const saveTestButton = document.getElementById('saveTestButton');
        if (saveTestButton && typeof saveTestButton.focus === 'function') {
            saveTestButton.focus();
        }
    }
    saveTestModalEl.classList.remove('is-open');
    saveTestModalEl.setAttribute('aria-hidden', 'true');
    saveTestReturnFocusEl = null;
}

function handleSaveTestConfirm() {
    if (!lastResult || !lastInputForSolve) return;
    const inputVal = saveTestNameInputEl ? saveTestNameInputEl.value.trim() : '';
    const name = inputVal || saveTestDefaultName || 'Test';
    const inputTokens = lastInput && lastInput.length
        ? lastInput
        : lastInputForSolve || [];
    if (!inputTokens.length) return;
    const expected = lastResult.map(step => ({
        s: step.s,
        p: step.p,
        f: step.f,
        ext: step.ext
    }));
    appendLocalTest({
        id: `local-${Date.now()}`,
        name,
        description: '',
        input: inputTokens,
        expected,
        createdAt: new Date().toISOString()
    });
    closeSaveTestModal();
}

function setActiveNoteIndex(index) {
    if (!fingerTargets.length || !lastResult) return;
    const clamped = Math.max(0, Math.min(index, lastResult.length - 1));
    activeNoteIndex = clamped;
    pendingActiveNoteIndex = null;

    fingerTargets.forEach((target, idx) => {
        if (target && target.hitboxEl) {
            target.hitboxEl.classList.toggle('is-active', idx === clamped);
        }
    });

    const target = fingerTargets[clamped];
    if (!target || !target.anchorEl) return;
    ensureModal();
    updateActiveFingerHighlight(target.anchorEl);
    renderModalContent();
    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden', 'false');
    scrollNoteIntoView(target.anchorEl);
    positionModal(target.anchorEl);
    window.setTimeout(() => positionModal(target.anchorEl), 200);
}

function positionModal(anchorEl) {
    if (!modalEl || !anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const modalRect = modalEl.getBoundingClientRect();
    const gap = 8;
    const verticalOffset = -10;
    let top = rect.top + window.scrollY - modalRect.height - gap + verticalOffset;
    if (top < window.scrollY + gap) {
        top = rect.bottom + window.scrollY + gap + verticalOffset;
    }
    let left = rect.left + window.scrollX + (rect.width / 2) - (modalRect.width / 2);
    const minLeft = window.scrollX + gap;
    const maxLeft = window.scrollX + window.innerWidth - modalRect.width - gap;
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;
    modalEl.style.left = `${left}px`;
    modalEl.style.top = `${top}px`;
}

function findScrollableParent(el) {
    let current = el;
    while (current && current !== document.body) {
        if (current.scrollWidth > current.clientWidth + 1) return current;
        current = current.parentElement;
    }
    return null;
}

function scrollNoteIntoView(anchorEl) {
    if (!anchorEl) return;
    const containerCandidate = staffScrollContainer && staffScrollContainer.scrollWidth > staffScrollContainer.clientWidth + 1
        ? staffScrollContainer
        : findScrollableParent(anchorEl) || staffScrollContainer;
    if (!containerCandidate) return;

    const margin = 16;
    const attemptScroll = () => {
        const containerRect = containerCandidate.getBoundingClientRect();
        const noteRect = anchorEl.getBoundingClientRect();
        const noteCenter = noteRect.left + (noteRect.width / 2);
        const containerCenter = containerRect.left + (containerRect.width / 2);
        const centerDelta = noteCenter - containerCenter;
        const centerThreshold = Math.min(24, containerRect.width * 0.1);
        if (!containerRect.width || !noteRect.width) {
            if (typeof anchorEl.scrollIntoView === 'function') {
                anchorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
            return;
        }

        if (Math.abs(centerDelta) <= centerThreshold) return;
        const maxScroll = Math.max(0, containerCandidate.scrollWidth - containerCandidate.clientWidth);
        const targetScroll = Math.min(
            Math.max(containerCandidate.scrollLeft + centerDelta, 0),
            maxScroll
        );
        containerCandidate.scrollTo({ left: targetScroll, behavior: 'smooth' });
    };
    window.requestAnimationFrame(attemptScroll);
    window.setTimeout(attemptScroll, 120);
}

function collectFingerElements(svg, expectedCount) {
    const dataElements = Array.from(svg.querySelectorAll('[data-finger-idx]'));
    if (dataElements.length) {
        const mapped = [];
        dataElements.forEach((el) => {
            const idx = Number.parseInt(el.getAttribute('data-finger-idx'), 10);
            if (!Number.isNaN(idx)) mapped[idx] = el;
        });
        if (mapped.filter(Boolean).length >= expectedCount) return mapped;
    }

    const textEls = Array.from(svg.querySelectorAll('text'));
    const fingerRegex = /^[0-4](?:↑)?!?$/;
    const fingerTexts = textEls.filter((el) => fingerRegex.test((el.textContent || '').trim()));
    const sorted = fingerTexts.map((el) => {
        let x = 0;
        try { x = el.getBBox().x; } catch (e) { x = 0; }
        return { el, x };
    }).sort((a, b) => a.x - b.x).map(item => item.el);
    return sorted.slice(0, expectedCount);
}

function createHitbox(svg, anchorEl, idx) {
    let bbox;
    try {
        bbox = anchorEl.getBBox();
    } catch (e) {
        return null;
    }
    const size = 44;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', bbox.x + (bbox.width / 2) - (size / 2));
    rect.setAttribute('y', bbox.y + (bbox.height / 2) - (size / 2));
    rect.setAttribute('width', size);
    rect.setAttribute('height', size);
    rect.setAttribute('fill', 'transparent');
    rect.setAttribute('class', 'fingering-hitbox');
    rect.dataset.noteIndex = String(idx);
    rect.style.cursor = 'pointer';
    rect.style.pointerEvents = 'all';
    rect.addEventListener('click', () => handleFingerClick(idx));
    svg.appendChild(rect);
    return rect;
}

function handleFingerClick(idx) {
    if (!lastResult || currentOutputFormat !== 'staff') return;
    if (!editModeEnabled) {
        setEditMode(true, idx);
        return;
    }
    setActiveNoteIndex(idx);
}

function setupFingeringEditor(staffDiv, result) {
    fingerTargets = [];
    staffScrollContainer = staffDiv ? staffDiv.parentElement : null;
    if (!staffDiv || !result) return;
    const svg = staffDiv.querySelector('svg');
    if (!svg) return;

    svg.querySelectorAll('.fingering-hitbox').forEach((el) => el.remove());
    const anchors = collectFingerElements(svg, result.length);
    if (!anchors || !anchors.length) return;

    fingerTargets = anchors.map((anchorEl, idx) => {
        if (!anchorEl) return null;
        const hitboxEl = createHitbox(svg, anchorEl, idx);
        return { anchorEl, hitboxEl };
    });

    if (editModeEnabled) {
        const nextIndex = pendingActiveNoteIndex !== null ? pendingActiveNoteIndex : (activeNoteIndex ?? 0);
        setActiveNoteIndex(nextIndex);
    }
}

function teardownFingeringEditor() {
    fingerTargets = [];
    staffScrollContainer = null;
    if (editModeEnabled) setEditMode(false);
}

function applyModalSelection(field, value, isAuto) {
    if (activeNoteIndex === null || !lastResult || !lastInputForSolve) return;

    const constraints = buildConstraintsFromResult(lastResult) || [];
    const current = constraints[activeNoteIndex];
    const nextConstraint = {
        ...(current || {}),
        userDefined: { ...(current && current.userDefined ? current.userDefined : {}) }
    };

    if (field === 'f') {
        if (isAuto) {
            delete nextConstraint.userDefined.f;
            delete nextConstraint.f;
        } else {
            nextConstraint.userDefined.f = true;
            nextConstraint.f = Number.parseInt(value, 10);
        }
    }

    if (field === 's') {
        if (isAuto) {
            delete nextConstraint.userDefined.s;
            delete nextConstraint.s;
        } else {
            nextConstraint.userDefined.s = true;
            nextConstraint.s = value;
        }
    }

    if (field === 'pos') {
        if (isAuto) {
            delete nextConstraint.userDefined.pos;
            delete nextConstraint.p;
            delete nextConstraint.ext;
        } else if (value) {
            const [pStr, extStr] = value.split('|');
            nextConstraint.userDefined.pos = true;
            nextConstraint.p = Number.parseInt(pStr, 10);
            nextConstraint.ext = Number.parseInt(extStr, 10);
        }
    }

    if (!nextConstraint.userDefined.f) delete nextConstraint.f;
    if (!nextConstraint.userDefined.s) delete nextConstraint.s;
    if (!nextConstraint.userDefined.pos) {
        delete nextConstraint.p;
        delete nextConstraint.ext;
    }

    if (!Object.keys(nextConstraint.userDefined).length) {
        constraints[activeNoteIndex] = null;
    } else {
        constraints[activeNoteIndex] = nextConstraint;
    }

    const nextResult = solve(lastInputForSolve, constraints);
    if (!nextResult) {
        showModalError(t('errors.unplayableFinger'));
        return;
    }

    const merged = applyUserDefinedFlags(nextResult, constraints);
    const nextIndex = activeNoteIndex < merged.length - 1 ? activeNoteIndex + 1 : activeNoteIndex;
    pendingActiveNoteIndex = nextIndex;

    renderResults({
        result: merged,
        inputForSolve: lastInputForSolve,
        inputForDisplay: lastInput || lastInputForSolve,
        inputOriginal: null,
        skipHideAbout: true,
        display: document.getElementById('pathDisplay'),
        wrapper: document.getElementById('resultsWrapper')
    });
    focusEditKeyboardInput();
}

function isTypingTarget(target) {
    if (!target) return false;
    const tag = target.tagName ? target.tagName.toLowerCase() : '';
    return tag === 'input' || tag === 'textarea' || target.isContentEditable;
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
    const isDarkMode = document.body.classList.contains('dark-mode');
    const cStringTextColor = isDarkMode ? '#0f172a' : '#ffffff';
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
        const labelColor = (str === 'C' && !isDarkMode) ? '#ffffff' : stringColors[str];
        ctx.fillStyle = labelColor;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(str, stringLabelX, stringYPositions[str] + 5);
    });

    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = fingerboardText;
    ctx.textAlign = 'center';
    for (let pos = 1; pos <= numPositions; pos++) {
        const x = posX[pos];
        // Zesvětlit čáry pro I., IV. a VII. polohu (diatonicky)
        // I. poloha (diatonicky) = pozice 2 (chromaticky)
        // IV. poloha (diatonicky) = pozice 7 (chromaticky)
        // VII. poloha (diatonicky) = pozice 12 (chromaticky)
        const isHighlighted = pos === 2 || pos === 7 || pos === 12;

        if (isHighlighted) {
            // Zesvětlená čára pro orientační body
            ctx.strokeStyle = '#707070'; // Světlejší než standardní #404040
            ctx.lineWidth = 1.5;
        } else {
            ctx.strokeStyle = fingerboardFret;
            ctx.lineWidth = 1;
        }
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
            const openNumberColor = step.s === 'C' ? cStringTextColor : fingerboardStroke;
            ctx.fillStyle = openNumberColor;
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
        const fingerNumberColor = step.s === 'C' ? cStringTextColor : fingerboardStroke;
        ctx.fillStyle = fingerNumberColor;
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
    if (lastResult && lastInputForSolve) runSolver({ skipHideAbout: true, preserveState: true });
};
if (!Object.getOwnPropertyDescriptor(window, 'lastResult')) {
    Object.defineProperty(window, 'lastResult', {
        configurable: true,
        enumerable: true,
        get: () => lastResult,
        set: (val) => { lastResult = val; }
    });
}
if (!Object.getOwnPropertyDescriptor(window, 'lastInputForSolve')) {
    Object.defineProperty(window, 'lastInputForSolve', {
        configurable: true,
        enumerable: true,
        get: () => lastInputForSolve,
        set: (val) => { lastInputForSolve = val; }
    });
}

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
    if (!sequenceParam && melodyInputEl) {
        const savedState = loadLastFingeringState();
        if (savedState) {
            melodyInputEl.value = savedState.input.join(' ');
            lastResult = savedState.fingering;
            lastInput = savedState.input;
            lastInputForSolve = savedState.inputNormalized || normalizeInputTokens(savedState.input);
        }
    }

    const fingeringAboutBlock = document.getElementById('fingeringAboutBlock');
    const fingeringAboutContent = document.getElementById('fingeringAboutContent');
    const fingeringAboutToggle = document.getElementById('fingeringAboutToggle');
    const fingeringAboutToggleText = document.getElementById('fingeringAboutToggleText');
    const fingeringAboutChevron = document.getElementById('fingeringAboutChevron');

    if (fingeringAboutBlock && fingeringAboutContent) {
        const collapsed = localStorage.getItem('aboutCollapsed') === 'true';
        fingeringAboutContent.classList.toggle('hidden', collapsed);
        if (fingeringAboutToggle) fingeringAboutToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        if (fingeringAboutToggleText) fingeringAboutToggleText.textContent = t(collapsed ? 'fingering.toggleAbout' : 'fingering.toggleAboutClose');
        if (fingeringAboutChevron) fingeringAboutChevron.style.transform = collapsed ? 'rotate(-90deg)' : '';
        if (fingeringAboutToggle) {
            fingeringAboutToggle.addEventListener('click', () => {
                const isHidden = fingeringAboutContent.classList.toggle('hidden');
                fingeringAboutToggle.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
                if (fingeringAboutToggleText) fingeringAboutToggleText.textContent = t(isHidden ? 'fingering.toggleAbout' : 'fingering.toggleAboutClose');
                if (fingeringAboutChevron) fingeringAboutChevron.style.transform = isHidden ? 'rotate(-90deg)' : '';
                localStorage.setItem('aboutCollapsed', isHidden ? 'true' : 'false');
            });
        }
    }

    function resizeMelodyTextarea() {
        if (!melodyInputEl || melodyInputEl.nodeName !== 'TEXTAREA') return;
        melodyInputEl.style.height = 'auto';
        melodyInputEl.style.height = Math.max(melodyInputEl.scrollHeight, 48) + 'px';
    }

    if (melodyInputEl) {
        if (melodyInputEl.nodeName === 'TEXTAREA') {
            melodyInputEl.addEventListener('input', resizeMelodyTextarea);
            melodyInputEl.addEventListener('change', resizeMelodyTextarea);
            resizeMelodyTextarea();
        }
        melodyInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); runSolver(); }
        });
    }

    const clearInputButton = document.getElementById('clearInputButton');
    if (clearInputButton && melodyInputEl) {
        clearInputButton.addEventListener('click', () => {
            melodyInputEl.value = '';
            if (melodyInputEl.nodeName === 'TEXTAREA') resizeMelodyTextarea();
            melodyInputEl.focus();
        });
    }

    const solveButton = document.getElementById('solveButton');
    if (solveButton) solveButton.addEventListener('click', () => runSolver());

    const editButton = document.getElementById('editFingeringButton');
    if (editButton) {
        editButton.addEventListener('click', () => {
            if (editModeEnabled) {
                setEditMode(false);
                return;
            }
            if (!lastResult) runSolver();
            if (lastResult) setEditMode(true, 0);
        });
    }

    const saveTestButton = document.getElementById('saveTestButton');
    if (saveTestButton) {
        saveTestButton.addEventListener('click', () => {
            if (!lastResult || !lastInputForSolve) {
                runSolver();
            }
            if (!lastResult || !lastInputForSolve) return;
            const inputVal = melodyInputEl ? melodyInputEl.value.trim() : '';
            const defaultName = inputVal || (lastInput ? lastInput.join(' ') : lastInputForSolve.join(' '));
            openSaveTestModal(defaultName);
        });
    }

    const toggleJsonButton = document.getElementById('toggleJsonButton');
    if (toggleJsonButton) toggleJsonButton.addEventListener('click', toggleJson);

    initSettings();

    updateEditButtonLabel();
    ensureEditKeyboardInput();

    window.addEventListener('languageChange', () => {
        updateSaveTestModalTexts();
        updateEditButtonLabel();
        if (lastResult && lastInputForSolve) runSolver({ skipHideAbout: true, preserveState: true });
    });

    document.addEventListener('keydown', (e) => {
        if (!editModeEnabled || currentOutputFormat !== 'staff') return;
        if (e.key === 'Escape') {
            setEditMode(false);
            return;
        }
        if (isTypingTarget(e.target)) return;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const direction = e.key === 'ArrowLeft' ? -1 : 1;
            const currentIndex = activeNoteIndex ?? 0;
            setActiveNoteIndex(currentIndex + direction);
            return;
        }
        if (!/^[0-4]$/.test(e.key)) return;
        e.preventDefault();
        applyModalSelection('f', e.key, false);
    });

    document.addEventListener('mousedown', (e) => {
        if (!editModeEnabled) return;
        if (modalEl && modalEl.contains(e.target)) return;
        if (e.target.closest && e.target.closest('.fingering-hitbox')) return;
        if (editButton && editButton.contains(e.target)) return;
        setEditMode(false);
    });

    window.addEventListener('resize', () => {
        if (editModeEnabled && activeNoteIndex !== null) {
            const target = fingerTargets[activeNoteIndex];
            if (target && target.anchorEl) positionModal(target.anchorEl);
        }
    });

    runSolver({ skipHideAbout: true, preserveState: true });
}

