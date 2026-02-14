/**
 * Notová osnova a textový výstup – getClefPerNote, renderStaffOutput, renderTextOutput, toPositionLabel, renderStaffWithRhythm.
 */
import { germanToCanonical, normalizeOctaveAccidentalSwap, noteToVexKey, getClefPerNote as getClefPerNoteRhythm, getPositionChanges } from './fingering-staff-utils.js';
import { t, getNoteNamingCurrent } from './i18n.js';
import { ensureHighlightDefs, ensureHighlightLayer } from './ui-modals.js';

/** Prahy pro výběr klíče (notová osnova): nad a1 → houslový; v houslovém zpět na basový až od d1 a nižší */
const A1_MIDI_CLEF = 69;
const D1_MIDI_CLEF = 62;

/** Mapování chromatické polohy (1–14) na diatonické označení (struna A, 1. prst). 15+ = palcová poloha. */
export const POSITION_LABEL_MAP = {
    1: 'I↓', 2: 'I', 3: 'II↓', 4: 'II↑', 5: 'III', 6: 'III↑',
    7: 'IV', 8: 'IV↑', 9: 'V', 10: 'VI', 11: 'VII↓', 12: 'VII',
    13: 'VIII', 14: 'IX'
};

/** Chromatické polohy 1–14 jako římské číslice I–XIV. */
export const CHROMATIC_ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];

/**
 * Mapování tónů na MIDI čísla (ISO: C2=36, C3=48, C4=60)
 * Cello prázdné struny: C2=36, G2=43, D3=50, A3=57
 */
export function getMidiNumber(noteName) {
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

/**
 * Vrátí pole klíčů ('bass' | 'treble') pro každou notu v pořadí.
 * @param {string[]} input - pole názvů tónů
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
 * Vrátí aktuální režim označení poloh z localStorage (nastavení v Prstokladu).
 * @returns {'diatonic'|'chromatic'}
 */
export function getPositionLabelMode() {
    if (typeof localStorage === 'undefined') return 'diatonic';
    const v = localStorage.getItem('positionLabelMode');
    return (v === 'chromatic' || v === 'diatonic') ? v : 'diatonic';
}

/**
 * Vrátí označení polohy pro zobrazení.
 * @param {number} p - Chromatická poloha (0 = prázdná, 1–14)
 * @param {'diatonic'|'chromatic'} mode
 * @returns {string}
 */
export function toPositionLabel(p, mode) {
    if (p === 0) return '';
    if (mode === 'chromatic') return CHROMATIC_ROMAN[p] ?? String(p);
    return POSITION_LABEL_MAP[p] ?? String(p);
}

export function hasAnyUserDefined(step) {
    if (!step || !step.userDefined) return false;
    return !!(step.userDefined.f || step.userDefined.s || step.userDefined.pos);
}

/** Podle nastavení H/B vrací zobrazovaný tón (H/Hes vs B/Bb). */
export function toDisplayNote(token) {
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
 * Vykreslí textový výstup (původní stav - bez osnovy)
 */
export function renderTextOutput(container, result, input, positionChanges, stringColors, toRoman) {
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

    const toneRow = document.createElement('div');
    toneRow.className = 'flex items-center gap-1 text-xl font-mono';

    result.forEach((step, idx) => {
        const toneSpan = document.createElement('span');
        toneSpan.className = 'inline-block text-center min-w-[44px]';
        toneSpan.textContent = input[idx];
        toneRow.appendChild(toneSpan);
    });
    container.appendChild(toneRow);

    const legend = document.createElement('div');
    legend.className = 'mt-6 pt-4 border-t border-slate-200';
    const legendTitle = document.createElement('p');
    legendTitle.className = 'text-sm font-bold text-slate-700 mb-2';
    const legendStringsResult = t('legend.strings');
    legendTitle.textContent = legendStringsResult;
    if (typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('dev') === '1' || localStorage.getItem('debug'))) {
        console.log('[legend] key=legend.strings, result=', legendStringsResult);
    }
    legend.appendChild(legendTitle);

    const legendItems = document.createElement('div');
    legendItems.className = 'flex flex-wrap gap-4 text-sm';
    Object.entries(stringColors).forEach(([s, color]) => {
        const legendStringResult = t('legend.string', { s });
        if (typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('dev') === '1' || localStorage.getItem('debug'))) {
            console.log('[legend] key=legend.string, s=', s, ', result=', legendStringResult);
        }
        const legendItem = document.createElement('div');
        legendItem.className = 'flex items-center gap-2';
        legendItem.innerHTML = `
            <span class="w-4 h-4 rounded" style="background-color: ${color}"></span>
            <span class="font-bold">${legendStringResult}</span>
        `;
        legendItems.appendChild(legendItem);
    });
    legend.appendChild(legendItems);
    container.appendChild(legend);
}

/**
 * Vykreslí notovou osnovu pomocí VexFlow s polohami, prsty, osnovou a tóny
 * @param {Object} [opts] - Volitelné: { skipLegend: true } pro vynechání legendy
 */
export function renderStaffOutput(container, result, input, positionChanges, stringColors, toRoman, opts) {
    opts = opts || {};
    if (typeof Vex === 'undefined' || !Vex.Flow) {
        console.error('VexFlow není načten. Použijte textový výstup nebo načtěte VexFlow z CDN.');
        renderTextOutput(container, result, input, positionChanges, stringColors, toRoman);
        return;
    }

    const { Renderer, Stave, StaveNote, Voice, Formatter, Annotation, Accidental, ClefNote } = Vex.Flow;

    const noteSpacing = 44;
    const clefOffset = 60;
    const totalWidth = clefOffset + (result.length * noteSpacing) + 20;
    const totalHeight = 200;

    const clefPerNote = getClefPerNote(input);

    const staffDiv = document.createElement('div');
    staffDiv.id = 'vexflow-staff-' + Date.now();
    staffDiv.className = 'staff-output rounded-lg';

    const renderer = new Renderer(staffDiv, Renderer.Backends.SVG);
    renderer.resize(totalWidth, totalHeight);
    const context = renderer.getContext();

    const bodyStyles = getComputedStyle(document.body);
    const staffInk = bodyStyles.getPropertyValue('--color-staff-ink').trim() || bodyStyles.getPropertyValue('--color-text-primary').trim() || '#0f172a';

    const initialClef = clefPerNote[0] || 'bass';
    const stave = new Stave(0, 50, totalWidth);
    stave.addClef(initialClef);
    context.setFillStyle(staffInk);
    context.setStrokeStyle(staffInk);
    stave.setContext(context).draw();

    const notes = input.map((noteName, idx) => {
        const step = result[idx];
        const vexFlowNote = noteToVexFlow(noteName);
        const noteClef = clefPerNote[idx];

        const note = new StaveNote({
            clef: noteClef,
            keys: [vexFlowNote],
            duration: 'w'
        });
        if (/[A-Ga-g]#\/\d/.test(vexFlowNote)) {
            try { note.addModifier(new Accidental('#'), 0); } catch (e) { /* ignorovat */ }
        } else if (/^[A-Ga-g]b\/\d/.test(vexFlowNote)) {
            try { note.addModifier(new Accidental('b'), 0); } catch (e) { /* ignorovat */ }
        }

        const annotations = [];

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
            } catch (e) { /* ignorovat */ }
        }
        annotations.push(fingerAnnotation);

        if (positionChanges.includes(idx) && step.p > 0) {
            const positionAnnotation = new Annotation(toRoman(step.p));
            positionAnnotation.setVerticalJustification(Annotation.VerticalJustify.TOP);
            positionAnnotation.setFont('Arial', 12, 'bold');
            positionAnnotation.setStyle({ fillStyle: staffInk });
            annotations.push(positionAnnotation);
        }

        const toneAnnotation = new Annotation(input[idx]);
        toneAnnotation.setVerticalJustification(Annotation.VerticalJustify.BOTTOM);
        toneAnnotation.setFont('Arial', 12, 'normal');
        toneAnnotation.setStyle({ fillStyle: staffInk });
        annotations.push(toneAnnotation);

        annotations.forEach(ann => note.addModifier(ann, 0));

        return note;
    });

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

    const formatter = new Formatter();
    formatter.joinVoices([voice]);
    formatter.format([voice], totalWidth - clefOffset - 20);

    context.setFillStyle(staffInk);
    context.setStrokeStyle(staffInk);
    voice.draw(context, stave);

    const staffContainer = document.createElement('div');
    staffContainer.className = 'staff-scroll overflow-x-auto md:mx-0 md:px-0';
    const staffInner = document.createElement('div');
    staffInner.className = 'relative';
    staffInner.style.width = totalWidth + 'px';
    staffInner.style.minHeight = totalHeight + 'px';
    staffInner.appendChild(staffDiv);

    let setHighlight = null;
    if (opts.enableHighlight && result.length > 0) {
        const svg = staffDiv.querySelector('svg');
        if (svg) {
            ensureHighlightDefs(svg);
            const layer = ensureHighlightLayer(svg);
            if (layer) {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.classList.add('fingering-highlight');
                rect.setAttribute('rx', '8');
                rect.setAttribute('ry', '8');
                rect.setAttribute('pointer-events', 'none');
                rect.setAttribute('stroke', 'none');
                rect.setAttribute('stroke-width', '0');
                layer.appendChild(rect);

                function collectAnchors() {
                    const dataEls = Array.from(svg.querySelectorAll('[data-finger-idx]'));
                    if (dataEls.length) {
                        const mapped = [];
                        dataEls.forEach((el) => {
                            const idx = Number.parseInt(el.getAttribute('data-finger-idx'), 10);
                            if (!Number.isNaN(idx)) mapped[idx] = el;
                        });
                        if (mapped.filter(Boolean).length >= result.length) return mapped;
                    }
                    const textEls = Array.from(svg.querySelectorAll('text'));
                    const fingerRegex = /^[0-4](?:↑)?!?$/;
                    const fingerTexts = textEls.filter((el) => fingerRegex.test((el.textContent || '').trim()));
                    const sorted = fingerTexts.map((el) => {
                        let x = 0;
                        try { x = el.getBBox().x; } catch (e) { x = 0; }
                        return { el, x };
                    }).sort((a, b) => a.x - b.x).map(item => item.el);
                    return sorted.slice(0, result.length);
                }

                const anchors = collectAnchors();
                const padX = 8;
                const padY = 6;
                setHighlight = (index) => {
                    if (index >= 0 && index < result.length && anchors[index]) {
                        try {
                            const box = anchors[index].getBBox();
                            rect.setAttribute('x', String(box.x - padX));
                            rect.setAttribute('y', String(box.y - padY));
                            rect.setAttribute('width', String(box.width + padX * 2));
                            rect.setAttribute('height', String(box.height + padY * 2));
                            rect.setAttribute('fill', 'url(#fingering-highlight-gradient-light)');
                            rect.style.display = '';
                        } catch (e) { rect.style.display = 'none'; }
                    } else {
                        rect.style.display = 'none';
                    }
                };
                setHighlight(-1);
            }
        }
    }

    staffContainer.appendChild(staffInner);
    container.appendChild(staffContainer);

    if (opts.skipLegend) return (opts.enableHighlight && setHighlight) ? { staffDiv, setHighlight } : staffDiv;

    const legend = document.createElement('div');
    legend.className = 'mt-6 pt-4 border-t border-slate-200';
    const legendTitle = document.createElement('p');
    legendTitle.className = 'text-sm font-bold text-slate-700 mb-2';
    const legendStringsResult = t('legend.strings');
    legendTitle.textContent = legendStringsResult;
    if (typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('dev') === '1' || localStorage.getItem('debug'))) {
        console.log('[legend] key=legend.strings, result=', legendStringsResult);
    }
    legend.appendChild(legendTitle);
    const legendItems = document.createElement('div');
    legendItems.className = 'flex flex-wrap gap-4 text-sm';
    Object.entries(stringColors).forEach(([s, color]) => {
        const legendStringResult = t('legend.string', { s });
        if (typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('dev') === '1' || localStorage.getItem('debug'))) {
            console.log('[legend] key=legend.string, s=', s, ', result=', legendStringResult);
        }
        const legendItem = document.createElement('div');
        legendItem.className = 'flex items-center gap-2';
        legendItem.innerHTML = `
            <span class="w-4 h-4 rounded" style="background-color: ${color}"></span>
            <span class="font-bold">${legendStringResult}</span>
        `;
        legendItems.appendChild(legendItem);
    });
    legend.appendChild(legendItems);
    container.appendChild(legend);
    return (opts.enableHighlight && setHighlight) ? { staffDiv, setHighlight } : staffDiv;
}

/**
 * Vykreslí notovou osnovu s rytmem (čtvrťové/osminové noty) pro Rytmy, Smyky a Metronom.
 * @param {HTMLElement} container
 * @param {string[]} input - tóny
 * @param {string[]} durations - 'q' nebo 'e' pro každou notu
 * @param {{ s: number, p: number, f: number, ext: number }[]} [fingering]
 * @param {{ slurRanges?: [number, number][] }} [opts] - slurRanges pro smyky (obloučky)
 */
export function renderStaffWithRhythm(container, input, durations, fingering, opts) {
    opts = opts || {};
    if (typeof Vex === 'undefined' || !Vex.Flow) return;
    if (!input || input.length === 0 || !durations || durations.length === 0) {
        container.innerHTML = '';
        return;
    }

    const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, ClefNote, Annotation, Curve } = Vex.Flow;
    const clefPerNote = getClefPerNoteRhythm(input);

    function totalBeats(durs) {
        let sum = 0;
        for (const d of durs) sum += d === 'e' ? 0.5 : 1;
        return sum;
    }

    const noteSpacing = 36;
    const totalWidth = 60 + input.length * noteSpacing + 20;
    const totalHeight = opts.slurRanges?.length ? 200 : 180;

    const div = document.createElement('div');
    div.className = 'staff-output rounded-lg overflow-x-auto';
    if (opts.staffId) div.id = opts.staffId;
    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(totalWidth, totalHeight);
    const ctx = renderer.getContext();
    const ink = getComputedStyle(document.body).getPropertyValue('--color-staff-ink')?.trim() || '#0f172a';
    ctx.setFillStyle(ink);
    ctx.setStrokeStyle(ink);

    const stave = new Stave(0, opts.slurRanges?.length ? 50 : 40, totalWidth);
    stave.addClef(clefPerNote[0] || 'bass');
    stave.setContext(ctx).draw();

    const positionChanges = fingering?.length ? getPositionChanges(fingering) : [];
    const notes = [];
    const tickables = [];
    for (let i = 0; i < input.length; i++) {
        if (i > 0 && clefPerNote[i] !== clefPerNote[i - 1]) {
            tickables.push(new ClefNote(clefPerNote[i]));
        }
        const key = noteToVexKey(input[i]);
        const dur = durations[i] === 'e' ? '8' : 'q';
        const note = new StaveNote({ clef: clefPerNote[i], keys: [key], duration: dur });
        if (fingering?.[i]) {
            const step = fingering[i];
            let fingerText = step.f === 0 ? '0' : String(step.f);
            if (step.ext === 1) fingerText += '↑';
            const fingerAnn = new Annotation(fingerText);
            fingerAnn.setFont('Arial', 12, 'bold');
            fingerAnn.setStyle({ fillStyle: ink });
            note.addModifier(fingerAnn, 0);
            if (positionChanges.includes(i) && step.p > 0) {
                const posAnn = new Annotation(toPositionLabel(step.p, getPositionLabelMode()));
                posAnn.setVerticalJustification(Annotation.VerticalJustify.TOP);
                posAnn.setFont('Arial', 10, 'bold');
                posAnn.setStyle({ fillStyle: ink });
                note.addModifier(posAnn, 0);
            }
        }
        notes.push(note);
        tickables.push(note);
    }

    const beats = Math.max(1, Math.ceil(totalBeats(durations)));
    const voice = new Voice({ num_beats: beats, beat_value: 4 });
    voice.addTickables(tickables);
    const formatter = new Formatter();
    formatter.joinVoices([voice]);
    formatter.format([voice], totalWidth - 80);
    voice.draw(ctx, stave);

    const notesOnly = tickables.filter(t => t instanceof StaveNote);
    let idx = 0;
    while (idx < notesOnly.length) {
        const group = [];
        while (idx < notesOnly.length && notesOnly[idx].getDuration() === '8') {
            group.push(notesOnly[idx]);
            idx++;
        }
        if (group.length > 1) {
            const beam = new Beam(group);
            beam.setContext(ctx).draw();
        }
        if (idx < notesOnly.length && notesOnly[idx].getDuration() !== '8') idx++;
    }

    const slurRanges = opts.slurRanges || [];
    slurRanges.forEach(([fromIdx, toIdx]) => {
        if (fromIdx < toIdx && notes[fromIdx] && notes[toIdx]) {
            try {
                const curve = new Curve(notes[fromIdx], notes[toIdx]);
                curve.setContext(ctx).draw();
            } catch (e) { /* ignore */ }
        }
    });

    container.innerHTML = '';
    container.appendChild(div);
}
