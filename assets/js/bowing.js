/**
 * Smyky – načte výstup z Prstokladu, aplikuje smykový pattern (legato = oblouček), vykreslí VexFlow.
 */
import { loadFingeringState, noteToVexKey, getClefPerNote } from './fingering-staff-utils.js';

(function () {
    'use strict';

    /** Pattern: pole 'legato' nebo 'separate' */
    const BOWING_PATTERNS = [
        { id: 'l2-s2', name: '2 legato, 2 samostatně', pattern: ['legato', 'legato', 'separate', 'separate'] },
        { id: 's2-l2', name: '2 samostatně, 2 legato', pattern: ['separate', 'separate', 'legato', 'legato'] },
        { id: 'l1-s3', name: '1 legato, 3 samostatně', pattern: ['legato', 'separate', 'separate', 'separate'] },
        { id: 'l3-s1', name: '3 legato, 1 samostatně', pattern: ['legato', 'legato', 'legato', 'separate'] },
        { id: 'l2-s1', name: '2 legato, 1 samostatně', pattern: ['legato', 'legato', 'separate'] },
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

    function renderStaff(container, input, slurRanges) {
        if (typeof Vex === 'undefined' || !Vex.Flow) return;
        const { Renderer, Stave, StaveNote, Voice, Formatter, Curve, ClefNote } = Vex.Flow;
        const clefPerNote = getClefPerNote(input);
        const noteSpacing = 44;
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

        const notes = [];
        const tickables = [];
        for (let i = 0; i < input.length; i++) {
            if (i > 0 && clefPerNote[i] !== clefPerNote[i - 1]) {
                tickables.push(new ClefNote(clefPerNote[i]));
            }
            const note = new StaveNote({ clef: clefPerNote[i], keys: [noteToVexKey(input[i])], duration: 'w' });
            notes.push(note);
            tickables.push(note);
        }

        const voice = new Voice({ num_beats: input.length, beat_value: 1 });
        voice.addTickables(tickables);
        const formatter = new Formatter();
        formatter.joinVoices([voice]);
        formatter.format([voice], totalWidth - 80);
        voice.draw(ctx, stave);

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

        BOWING_PATTERNS.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            patternSelect.appendChild(opt);
        });

        function updateStaff() {
            const selected = patternSelect.value;
            const pattern = BOWING_PATTERNS.find(p => p.id === selected) || BOWING_PATTERNS[0];
            const slurRanges = getSlurRanges(notes.length, pattern);
            renderStaff(staffContainer, notes, slurRanges);
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
