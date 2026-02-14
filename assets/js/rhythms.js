/**
 * Rytmy – načte výstup z Prstokladu (localStorage), aplikuje rytmický pattern, vykreslí VexFlow s čtvrťovými/osminovými notami.
 */
import { loadFingeringState, noteToVexKey, getClefPerNote, getPositionChanges } from './fingering-staff-utils.js';
import { toPositionLabel, getPositionLabelMode } from './ui-staff.js';
import { RHYTHM_PATTERNS, getDurationsForSequence } from './rhythm-patterns.js';

(function () {
    'use strict';

    const RHYTHM_STORAGE_KEY = 'celloapp:lastRhythm';

    /** Vrátí celkový počet dob pro Voice (q = 1, e = 0.5). */
    function totalBeats(durations) {
        let sum = 0;
        for (const d of durations) {
            sum += d === 'e' ? 0.5 : 1;
        }
        return sum;
    }

    function renderStaff(container, input, durations, fingering) {
        if (typeof Vex === 'undefined' || !Vex.Flow) return;
        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, ClefNote, Annotation } = Vex.Flow;
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

        const positionChanges = fingering?.length ? getPositionChanges(fingering) : [];
        const tickables = [];
        for (let i = 0; i < input.length; i++) {
            if (i > 0 && clefPerNote[i] !== clefPerNote[i - 1]) {
                tickables.push(new ClefNote(clefPerNote[i]));
            }
            const key = noteToVexKey(input[i]);
            const dur = durations[i] === 'e' ? '8' : 'q';
            const opts = { clef: clefPerNote[i], keys: [key], duration: dur };
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

        function fillPatternOptions() {
            const selected = patternSelect.value || loadLastRhythm();
            patternSelect.innerHTML = '';
            const byDiff = {};
            RHYTHM_PATTERNS.forEach(p => {
                if (!byDiff[p.difficulty]) byDiff[p.difficulty] = [];
                byDiff[p.difficulty].push(p);
            });
            const sortedDiffs = Object.keys(byDiff).map(Number).sort((a, b) => a - b);
            sortedDiffs.forEach(diff => {
                const group = document.createElement('optgroup');
                group.label = (typeof window.t === 'function' ? window.t('rhythms.difficultyGroup', { n: diff }) : 'Obtížnost ' + diff);
                byDiff[diff].forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = (typeof window.t === 'function' ? window.t(p.nameKey) : p.nameKey);
                    group.appendChild(opt);
                });
                patternSelect.appendChild(group);
            });
            if (selected) patternSelect.value = selected;
        }
        fillPatternOptions();
        window.addEventListener('languageChange', fillPatternOptions);

        function updateStaff() {
            const selected = patternSelect.value;
            const pattern = RHYTHM_PATTERNS.find(p => p.id === selected) || RHYTHM_PATTERNS[0];
            const durations = getDurationsForSequence(notes.length, pattern);
            if (new URLSearchParams(window.location.search).get('dev') === '1' || localStorage.getItem('debug')) {
                console.debug('rhythms: pattern=', pattern.id, 'durations=', durations);
            }
            renderStaff(staffContainer, notes, durations, state.fingering);
            try {
                localStorage.setItem(RHYTHM_STORAGE_KEY, pattern.id);
            } catch (e) { /* ignore */ }
        }

        function loadLastRhythm() {
            try {
                const id = localStorage.getItem(RHYTHM_STORAGE_KEY);
                if (id && RHYTHM_PATTERNS.some(p => p.id === id)) return id;
            } catch (e) { /* ignore */ }
            return RHYTHM_PATTERNS[0].id;
        }

        patternSelect.addEventListener('change', () => {
            if (typeof window.markToolUsed === 'function') window.markToolUsed();
            updateStaff();
        });

        const nextBtn = document.getElementById('rhythmNextBtn');
        const randomBtn = document.getElementById('rhythmRandomBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (typeof window.markToolUsed === 'function') window.markToolUsed();
                const idx = RHYTHM_PATTERNS.findIndex(p => p.id === patternSelect.value);
                const nextIdx = idx < 0 || idx >= RHYTHM_PATTERNS.length - 1 ? 0 : idx + 1;
                patternSelect.value = RHYTHM_PATTERNS[nextIdx].id;
                updateStaff();
            });
        }
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                if (typeof window.markToolUsed === 'function') window.markToolUsed();
                const p = RHYTHM_PATTERNS[Math.floor(Math.random() * RHYTHM_PATTERNS.length)];
                patternSelect.value = p.id;
                updateStaff();
            });
        }

        updateStaff();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
