/**
 * Rytmy – načte výstup z Prstokladu (localStorage), aplikuje rytmický pattern, vykreslí VexFlow s čtvrťovými/osminovými notami.
 */
import { loadFingeringState, noteToVexKey, getClefPerNote } from './fingering-staff-utils.js';

(function () {
    'use strict';

    const RHYTHM_PATTERNS = [
        { id: 'q-q', name: '2 čtvrťové', pattern: ['q', 'q'], difficulty: 1 },
        { id: 'q-q-e-e', name: '2 čtvrťové, 2 osminové', pattern: ['q', 'q', 'e', 'e'], difficulty: 2 },
        { id: 'e-e-q-q', name: '2 osminové, 2 čtvrťové', pattern: ['e', 'e', 'q', 'q'], difficulty: 2 },
        { id: 'q-e-e-q', name: '1 čtvrťová, 2 osminové, 1 čtvrťová', pattern: ['q', 'e', 'e', 'q'], difficulty: 3 },
        { id: 'e-q-q-e', name: '1 osminová, 2 čtvrťové, 1 osminová', pattern: ['e', 'q', 'q', 'e'], difficulty: 3 },
        { id: 'q-q-q', name: '3 čtvrťové', pattern: ['q', 'q', 'q'], difficulty: 1 },
        { id: 'e-e-e-e-q-q', name: '4 osminové, 2 čtvrťové', pattern: ['e', 'e', 'e', 'e', 'q', 'q'], difficulty: 4 },
        { id: 'q-q-e-e-e-e', name: '2 čtvrťové, 4 osminové', pattern: ['q', 'q', 'e', 'e', 'e', 'e'], difficulty: 4 },
    ];

    function getDurationsForSequence(length, pattern) {
        const p = pattern.pattern;
        const out = [];
        for (let i = 0; i < length; i++) {
            if (i < p.length) out.push(p[i]);
            else out.push(p[i % p.length]);
        }
        if (length > 0 && length % p.length !== 0) {
            const remainder = length % p.length;
            for (let i = length - remainder; i < length; i++) {
                out[i] = p[i - (length - remainder)];
            }
        }
        return out;
    }

    /** Vrátí celkový počet dob pro Voice (q = 1, e = 0.5). */
    function totalBeats(durations) {
        let sum = 0;
        for (const d of durations) {
            sum += d === 'e' ? 0.5 : 1;
        }
        return sum;
    }

    function renderStaff(container, input, durations) {
        if (typeof Vex === 'undefined' || !Vex.Flow) return;
        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, ClefNote } = Vex.Flow;
        const clefPerNote = getClefPerNote(input);
        const noteSpacing = 36;
        const totalWidth = 60 + input.length * noteSpacing + 20;
        const totalHeight = 180;

        const div = document.createElement('div');
        div.className = 'staff-output rounded-lg overflow-x-auto';
        const renderer = new Renderer(div, Renderer.Backends.SVG);
        renderer.resize(totalWidth, totalHeight);
        const ctx = renderer.getContext();
        const ink = getComputedStyle(document.body).getPropertyValue('--color-staff-ink')?.trim() || '#0f172a';
        ctx.setFillStyle(ink);
        ctx.setStrokeStyle(ink);

        const stave = new Stave(0, 40, totalWidth);
        stave.addClef(clefPerNote[0] || 'bass');
        stave.setContext(ctx).draw();

        const tickables = [];
        for (let i = 0; i < input.length; i++) {
            if (i > 0 && clefPerNote[i] !== clefPerNote[i - 1]) {
                tickables.push(new ClefNote(clefPerNote[i]));
            }
            const key = noteToVexKey(input[i]);
            const dur = durations[i] === 'e' ? '8' : 'q';
            const note = new StaveNote({ clef: clefPerNote[i], keys: [key], duration: dur });
            tickables.push(note);
        }

        const voice = new Voice({ num_beats: totalBeats(durations), beat_value: 4 });
        voice.addTickables(tickables);
        const formatter = new Formatter();
        formatter.joinVoices([voice]);
        formatter.format([voice], totalWidth - 80);

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

        voice.draw(ctx, stave);
        container.innerHTML = '';
        container.appendChild(div);
    }

    function init() {
        const noData = document.getElementById('rhythmsNoData');
        const content = document.getElementById('rhythmsContent');
        const patternSelect = document.getElementById('rhythmPattern');
        const staffContainer = document.getElementById('rhythmsStaff');

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

        RHYTHM_PATTERNS.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name + ' (obtížnost ' + p.difficulty + ')';
            patternSelect.appendChild(opt);
        });

        function updateStaff() {
            const selected = patternSelect.value;
            const pattern = RHYTHM_PATTERNS.find(p => p.id === selected) || RHYTHM_PATTERNS[0];
            const durations = getDurationsForSequence(notes.length, pattern);
            renderStaff(staffContainer, notes, durations);
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
