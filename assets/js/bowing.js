/**
 * Smyky – načte výstup z Prstokladu, aplikuje smykový pattern (legato = oblouček) a rytmus, vykreslí VexFlow.
 */
import { loadFingeringState, noteToVexKey, getClefPerNote, getPositionChanges } from './fingering-staff-utils.js';
import { toPositionLabel, getPositionLabelMode } from './ui-staff.js';
import { RHYTHM_PATTERNS, getDurationsForSequence } from './rhythm-patterns.js';

(function () {
    'use strict';

    const RHYTHM_STORAGE_KEY = 'celloapp:lastRhythm';

    /** Pattern: pole 'legato' nebo 'separate'. l1-s3 a l3-s1 prohozeny dle plánu. */
    const BOWING_PATTERNS = [
        { id: 'l2-s2', nameKey: 'bowing.patternL2S2', pattern: ['legato', 'legato', 'separate', 'separate'] },
        { id: 's2-l2', nameKey: 'bowing.patternS2L2', pattern: ['separate', 'separate', 'legato', 'legato'] },
        { id: 's1-l3', nameKey: 'bowing.patternS1L3', pattern: ['separate', 'legato', 'legato', 'legato'] },
        { id: 'l1-s3', nameKey: 'bowing.patternL1S3', pattern: ['legato', 'separate', 'separate', 'separate'] },
        { id: 'l2-s1', nameKey: 'bowing.patternL2S1', pattern: ['legato', 'legato', 'separate'] },
    ];

    function getSlurRanges(length, pattern) {
        const p = pattern.pattern;
        const ranges = [];
        let start = null;
        for (let i = 0; i < length; i++) {
            const isLegato = p[i % p.length] === 'legato';
            if (isLegato) {
                if (start === null) start = i;
            } else {
                if (start !== null && i - start >= 1) ranges.push([start, i - 1]);
                start = null;
            }
        }
        if (start !== null && length - start >= 1) ranges.push([start, length - 1]);
        return ranges;
    }

    function totalBeats(durations) {
        let sum = 0;
        for (const d of durations) {
            sum += d === 'e' ? 0.5 : 1;
        }
        return sum;
    }

    function renderStaff(container, input, slurRanges, durations, fingering) {
        if (typeof Vex === 'undefined' || !Vex.Flow) return;
        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Curve, ClefNote, Annotation } = Vex.Flow;
        const clefPerNote = getClefPerNote(input);
        const noteSpacing = 36;
        const totalWidth = 60 + input.length * noteSpacing + 20;
        const totalHeight = 200;

        const div = document.createElement('div');
        div.className = 'staff-output rounded-lg overflow-x-auto';
        const renderer = new Renderer(div, Renderer.Backends.SVG);
        renderer.resize(totalWidth, totalHeight);
        const ctx = renderer.getContext();
        const ink = getComputedStyle(document.body).getPropertyValue('--color-staff-ink')?.trim() || '#0f172a';
        ctx.setFillStyle(ink);
        ctx.setStrokeStyle(ink);

        const stave = new Stave(0, 50, totalWidth);
        stave.addClef(clefPerNote[0] || 'bass');
        stave.setContext(ctx).draw();

        const positionChanges = fingering?.length ? getPositionChanges(fingering) : [];
        const notes = [];
        const tickables = [];
        for (let i = 0; i < input.length; i++) {
            if (i > 0 && clefPerNote[i] !== clefPerNote[i - 1]) {
                tickables.push(new ClefNote(clefPerNote[i]));
            }
            const dur = durations[i] === 'e' ? '8' : 'q';
            const opts = { clef: clefPerNote[i], keys: [noteToVexKey(input[i])], duration: dur };
            const note = new StaveNote(opts);
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

    function init() {
        const noData = document.getElementById('bowingNoData');
        const content = document.getElementById('bowingContent');
        const patternSelect = document.getElementById('bowingPattern');
        const staffContainer = document.getElementById('bowingStaff');

        const state = loadFingeringState();
        if (!state) {
            noData.classList.remove('hidden');
            content.classList.add('hidden');
            return;
        }
        noData.classList.add('hidden');
        content.classList.remove('hidden');
        const notes = state.inputNormalized && state.inputNormalized.length === state.input.length
            ? state.inputNormalized : state.input;

        function loadLastRhythm() {
            try {
                const id = localStorage.getItem(RHYTHM_STORAGE_KEY);
                if (id && RHYTHM_PATTERNS.some(p => p.id === id)) return id;
            } catch (e) { /* ignore */ }
            return RHYTHM_PATTERNS[0].id;
        }

        function fillPatternOptions() {
            const selected = patternSelect.value;
            patternSelect.innerHTML = '';
            BOWING_PATTERNS.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = (typeof window.t === 'function' ? window.t(p.nameKey) : p.nameKey);
                patternSelect.appendChild(opt);
            });
            if (selected) patternSelect.value = selected;
        }
        fillPatternOptions();
        window.addEventListener('languageChange', fillPatternOptions);

        function updateStaff() {
            const selected = patternSelect.value;
            const pattern = BOWING_PATTERNS.find(p => p.id === selected) || BOWING_PATTERNS[0];
            const rhythmId = loadLastRhythm();
            const rhythm = RHYTHM_PATTERNS.find(p => p.id === rhythmId) || RHYTHM_PATTERNS[0];
            const durations = getDurationsForSequence(notes.length, rhythm);
            const slurRanges = getSlurRanges(notes.length, pattern);
            renderStaff(staffContainer, notes, slurRanges, durations, state.fingering);
        }

        patternSelect.addEventListener('change', () => {
            if (typeof window.markToolUsed === 'function') window.markToolUsed();
            updateStaff();
        });
        updateStaff();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
