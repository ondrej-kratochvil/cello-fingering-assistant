/**
 * Sdílené rytmické patterny pro Rytmy, Smyky a Metronom.
 */
export const RHYTHM_PATTERNS = [
    { id: 'q-q', nameKey: 'rhythms.pattern2q', pattern: ['q', 'q'], difficulty: 1 },
    { id: 'q-q-e-e', nameKey: 'rhythms.pattern2q2e', pattern: ['q', 'q', 'e', 'e'], difficulty: 2 },
    { id: 'e-e-q-q', nameKey: 'rhythms.pattern2e2q', pattern: ['e', 'e', 'q', 'q'], difficulty: 2 },
    { id: 'q-e-e-q', nameKey: 'rhythms.pattern1q2e1q', pattern: ['q', 'e', 'e', 'q'], difficulty: 3 },
    { id: 'e-q-q-e', nameKey: 'rhythms.pattern1e2q1e', pattern: ['e', 'q', 'q', 'e'], difficulty: 3 },
    { id: 'q-q-q', nameKey: 'rhythms.pattern3q', pattern: ['q', 'q', 'q'], difficulty: 1 },
    { id: 'e-e-e-e-q-q', nameKey: 'rhythms.pattern4e2q', pattern: ['e', 'e', 'e', 'e', 'q', 'q'], difficulty: 4 },
    { id: 'q-q-e-e-e-e', nameKey: 'rhythms.pattern2q4e', pattern: ['q', 'q', 'e', 'e', 'e', 'e'], difficulty: 4 },
];

export function getDurationsForSequence(length, pattern) {
    const p = pattern.pattern;
    const out = [];
    for (let i = 0; i < length; i++) {
        out.push(p[i % p.length]);
    }
    return out;
}
