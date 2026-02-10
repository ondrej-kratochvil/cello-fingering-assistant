/**
 * Sdílené utility pro vykreslování notové osnovy z uloženého stavu Prstokladu.
 * Používá bowing.js a rhythms.js. Tokeny by měly být v kanonické formě (inputNormalized).
 */
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

const A1_MIDI = 69, D1_MIDI = 62;
const MIDI_MAP = {
    'C': 36, 'C#': 37, 'D': 38, 'D#': 39, 'E': 40, 'F': 41, 'F#': 42, 'G': 43, 'G#': 44, 'A': 45, 'A#': 46, 'H': 47, 'Hb': 46, 'B': 47,
    'c': 48, 'c#': 49, 'd': 50, 'd#': 51, 'e': 52, 'f': 53, 'f#': 54, 'g': 55, 'g#': 56, 'a': 57, 'a#': 58, 'h': 59, 'hb': 58, 'b': 59,
    'c1': 60, 'c1#': 61, 'd1': 62, 'd1#': 63, 'e1': 64, 'f1': 65, 'f1#': 66, 'g1': 67, 'g1#': 68, 'a1': 69, 'a1#': 70, 'h1': 71, 'hb1': 70, 'b1': 71,
    'c2': 72, 'c2#': 73, 'db1': 61, 'eb1': 63, 'gb1': 66, 'ab1': 68, 'bb1': 70
};

export function noteToVexKey(name) {
    const n = (name || '').trim();
    return NOTE_MAP[n] || NOTE_MAP[n.toLowerCase()] || 'C/4';
}

export function getMidi(name) {
    const n = (name || '').trim();
    return MIDI_MAP[n] || MIDI_MAP[n.toLowerCase()] || 60;
}

export function getClefPerNote(input) {
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

/**
 * Načte poslední stav Prstokladu z localStorage.
 * @returns {{ input: string[], inputNormalized?: string[], fingering: unknown[] } | null}
 */
export function loadFingeringState() {
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
