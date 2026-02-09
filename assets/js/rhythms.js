/**
 * Rytmy – načte výstup z Prstokladu (localStorage), aplikuje rytmický pattern, vykreslí VexFlow s čtvrťovými/osminovými notami.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'fingering:last';

    const NOTE_MAP = {
        'C': 'C/2', 'C#': 'C#/2', 'D': 'D/2', 'D#': 'D#/2', 'E': 'E/2', 'F': 'F/2', 'F#': 'F#/2',
        'G': 'G/2', 'G#': 'G#/2', 'A': 'A/2', 'A#': 'A#/2', 'Hb': 'Bb/2', 'H': 'B/2', 'B': 'B/2',
        'c': 'C/3', 'c#': 'C#/3', 'd': 'D/3', 'd#': 'D#/3', 'e': 'E/3', 'f': 'F/3', 'f#': 'F#/3',
        'g': 'G/3', 'g#': 'G#/3', 'a': 'A/3', 'a#': 'A#/3', 'hb': 'Bb/3', 'h': 'B/3', 'b': 'B/3',
        'c1': 'C/4', 'c1#': 'C#/4', 'd1': 'D/4', 'd1#': 'D#/4', 'e1': 'E/4', 'f1': 'F/4', 'f1#': 'F#/4',
        'g1': 'G/4', 'g1#': 'G#/4', 'a1': 'A/4', 'a1#': 'A#/4', 'hb1': 'Bb/4', 'h1': 'B/4', 'b1': 'B/4',
        'c2': 'C/5', 'c2#': 'C#/5', 'db1': 'Db/4', 'db2': 'Db/5', 'eb1': 'Eb/4', 'gb1': 'Gb/4', 'ab1': 'Ab/4', 'bb1': 'Bb/4'
    };

    function noteToVexKey(name) {
        const n = (name || '').trim().replace(/(\d)(#|b)$/, '$2$1');
        return NOTE_MAP[n] || NOTE_MAP[n.toLowerCase()] || 'C/4';
    }

    const A1_MIDI = 69, D1_MIDI = 62;
    const MIDI_MAP = {
        'C': 36, 'C#': 37, 'D': 38, 'D#': 39, 'E': 40, 'F': 41, 'F#': 42, 'G': 43, 'G#': 44, 'A': 45, 'A#': 46, 'H': 47, 'Hb': 46, 'B': 47,
        'c': 48, 'c#': 49, 'd': 50, 'd#': 51, 'e': 52, 'f': 53, 'f#': 54, 'g': 55, 'g#': 56, 'a': 57, 'a#': 58, 'h': 59, 'hb': 58, 'b': 59,
        'c1': 60, 'c1#': 61, 'd1': 62, 'd1#': 63, 'e1': 64, 'f1': 65, 'f1#': 66, 'g1': 67, 'g1#': 68, 'a1': 69, 'a1#': 70, 'h1': 71, 'hb1': 70, 'b1': 71,
        'c2': 72, 'c2#': 73, 'db1': 61, 'eb1': 63, 'gb1': 66, 'ab1': 68, 'bb1': 70
    };
    function getMidi(name) {
        const n = (name || '').trim().replace(/(\d)(#|b)$/, '$2$1');
        return MIDI_MAP[n] || MIDI_MAP[n.toLowerCase()] || 60;
    }
    function getClefPerNote(input) {
        const out = [];
        let clef = 'bass';
        for (let i = 0; i < input.length; i++) {
            const midi = getMidi(input[i]);
            if (midi > A1_MIDI) clef = 'treble';
            else if (clef === 'treble' && midi <= D1_MIDI) clef = 'bass';
            out.push(clef);
        }
        return out;
    }

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

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || !Array.isArray(data.input) || !Array.isArray(data.fingering) || data.input.length !== data.fingering.length) return null;
            return data;
        } catch (e) {
            return null;
        }
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

        const state = loadState();
        if (!state) {
            noData.classList.remove('hidden');
            content.classList.add('hidden');
            return;
        }
        noData.classList.add('hidden');
        content.classList.remove('hidden');

        RHYTHM_PATTERNS.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name + ' (obtížnost ' + p.difficulty + ')';
            patternSelect.appendChild(opt);
        });

        function updateStaff() {
            const selected = patternSelect.value;
            const pattern = RHYTHM_PATTERNS.find(p => p.id === selected) || RHYTHM_PATTERNS[0];
            const durations = getDurationsForSequence(state.input.length, pattern);
            renderStaff(staffContainer, state.input, durations);
        }

        patternSelect.addEventListener('change', updateStaff);
        updateStaff();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
