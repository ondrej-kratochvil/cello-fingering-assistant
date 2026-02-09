/**
 * Smyky – načte výstup z Prstokladu, aplikuje smykový pattern (legato = oblouček), vykreslí VexFlow.
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
        'C': 36, 'C#': 37, 'D': 38, 'D#': 39, 'E': 40, 'F': 41, 'F#': 42, 'G': 43, 'A': 45, 'H': 47, 'Hb': 46, 'B': 47,
        'c': 48, 'd': 50, 'e': 52, 'f': 53, 'g': 55, 'a': 57, 'h': 59, 'hb': 58, 'b': 59,
        'c1': 60, 'd1': 62, 'e1': 64, 'f1': 65, 'g1': 67, 'a1': 69, 'h1': 71, 'hb1': 70, 'b1': 71, 'c2': 72
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

        const state = loadState();
        if (!state) {
            noData.classList.remove('hidden');
            content.classList.add('hidden');
            return;
        }
        noData.classList.add('hidden');
        content.classList.remove('hidden');

        BOWING_PATTERNS.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            patternSelect.appendChild(opt);
        });

        function updateStaff() {
            const selected = patternSelect.value;
            const pattern = BOWING_PATTERNS.find(p => p.id === selected) || BOWING_PATTERNS[0];
            const slurRanges = getSlurRanges(state.input.length, pattern);
            renderStaff(staffContainer, state.input, slurRanges);
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
