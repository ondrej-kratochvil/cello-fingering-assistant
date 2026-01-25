// Jednoduchý testovací framework
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    run() {
        console.log('🧪 Spouštění testů...\n');
        this.tests.forEach(({ name, testFn }) => {
            try {
                testFn();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.error(`❌ ${name}`);
                console.error(`   Chyba: ${error.message}`);
                if (error.expected !== undefined) {
                    console.error(`   Očekáváno: ${JSON.stringify(error.expected)}`);
                }
                if (error.actual !== undefined) {
                    console.error(`   Skutečnost: ${JSON.stringify(error.actual)}`);
                }
                this.failed++;
            }
        });
        console.log(`\n📊 Výsledky: ${this.passed} prošlo, ${this.failed} selhalo`);
        return this.failed === 0;
    }

    assertEqual(actual, expected, message) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            const error = new Error(message || 'Hodnoty se neshodují');
            error.expected = expected;
            error.actual = actual;
            throw error;
        }
    }

    assertTrue(condition, message) {
        if (!condition) {
            throw new Error(message || 'Podmínka není pravdivá');
        }
    }
}

// Pomocná funkce pro porovnání prstokladů
// Podporuje i pole očekávaných hodnot (alternativní správné výsledky)
function compareFingering(actual, expected) {
    if (!actual) return false;

    // Pokud je expected pole polí (alternativní výsledky)
    if (Array.isArray(expected) && expected.length > 0 && Array.isArray(expected[0])) {
        return expected.some(exp => compareFingering(actual, exp));
    }

    // Standardní porovnání
    if (!expected) return false;
    if (actual.length !== expected.length) return false;

    for (let i = 0; i < actual.length; i++) {
        const a = actual[i];
        const e = expected[i];
        if (a.s !== e.s || a.p !== e.p || a.f !== e.f || a.ext !== e.ext) {
            return false;
        }
    }
    return true;
}

// Mapování béček na enharmonické křížky pro solve (model používá pouze křížky)
const flatToSharpMap = {
    Cb: 'H', Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Hb: 'A#',
    cb: 'H', db: 'c#', eb: 'd#', fb: 'e', gb: 'f#', ab: 'g#', hb: 'a#', bb: 'a#',
    cb1: 'h', db1: 'c1#', eb1: 'd1#', fb1: 'e1', gb1: 'f1#', ab1: 'g1#', hb1: 'a1#', bb1: 'a1#'
};
// Křížky na přirozené (E# = F, H# = c)
const sharpToNaturalMap = {
    'E#': 'F', 'e#': 'f', 'e1#': 'f1', 'E1#': 'f1',
    'H#': 'c', 'h#': 'c1'
};
// B/Bb → H/Hb (enharmonická záměna pro solver)
const bToHMap = {
    B: 'H', Bb: 'Hb', b: 'h', bb: 'hb', b1: 'h1', bb1: 'hb1', B1: 'H1', Bb1: 'Hb1'
};

function normalizeOctaveAccidentalSwap(token) {
    const m1 = token.match(/^([a-g])(#)(1)$/i);
    if (m1) return m1[1] + '1' + m1[2];
    const m2 = token.match(/^([a-g])(1)(b)$/i);
    if (m2) return m2[1] + 'b' + m2[2];
    return token;
}

function prepareInputForSolve(input) {
    return input.map((token) => {
        let x = normalizeOctaveAccidentalSwap(token);
        x = bToHMap[x] || bToHMap[x.toLowerCase()] || x;
        const flat = flatToSharpMap[x] || flatToSharpMap[x.toLowerCase()];
        if (flat) return flat;
        const sharp = sharpToNaturalMap[x] || sharpToNaturalMap[x.toLowerCase()];
        if (sharp) return sharp;
        return x;
    });
}

// Pomocná funkce pro formátování prstokladu pro zobrazení
function formatFingering(fingering) {
    if (!fingering) return 'null';
    return fingering.map(f => `${f.s}${f.p.toString().padStart(2, '0')}${f.f}${f.ext}`).join(' ');
}

// Testovací sady
const testSuites = [
    {
        name: 'Základní sekvence e f# g#',
        nameKey: 'test.basic.name',
        descriptionKey: 'test.basic.desc',
        input: ['e', 'f#', 'g#'],
        expected: [
            { s: 'D', p: 2, f: 1, ext: 0 },  // e na D struně, 2. poloha, 1. prst
            { s: 'D', p: 2, f: 2, ext: 1 },  // f# na D struně, 2. poloha, 2. prst, široká
            { s: 'D', p: 2, f: 4, ext: 1 }   // g# na D struně, 2. poloha, 4. prst, široká
        ],
        description: 'Široká poloha'
    },
    {
        name: 'Sekvence d1 e1 f1 g1',
        nameKey: 'test.d1e1f1g1.name',
        descriptionKey: 'test.d1e1f1g1.desc',
        input: ['d1', 'e1', 'f1', 'g1'],
        expected: [
            { s: 'A', p: 5, f: 1, ext: 0 },  // d1
            { s: 'A', p: 5, f: 3, ext: 0 },  // e1
            { s: 'A', p: 7, f: 2, ext: 0 },  // f1
            { s: 'A', p: 7, f: 4, ext: 0 }   // g1
        ],
        description: 'Dvě polohy po 2 tónech'
    },
    {
        name: 'Sekvence C D E F',
        nameKey: 'test.CDEF.name',
        descriptionKey: 'test.CDEF.desc',
        input: ['C', 'D', 'E', 'F'],
        expected: [
            { s: 'C', p: 0, f: 0, ext: 0 },  // C - otevřená struna
            { s: 'C', p: 2, f: 1, ext: 0 },  // D
            { s: 'C', p: 2, f: 3, ext: 0 },  // E
            { s: 'C', p: 2, f: 4, ext: 0 }   // F
        ],
        description: 'C struna, zůstává ve stejné poloze'
    },
    {
        name: 'Sekvence a h c1 d1',
        nameKey: 'test.ahc1d1.name',
        descriptionKey: 'test.ahc1d1.desc',
        input: ['a', 'h', 'c1', 'd1'],
        expected: [
            { s: 'A', p: 0, f: 0, ext: 0 },  // a - otevřená struna
            { s: 'A', p: 2, f: 1, ext: 0 },  // h
            { s: 'A', p: 2, f: 2, ext: 0 },  // c1
            { s: 'A', p: 2, f: 4, ext: 0 }   // d1
        ],
        description: 'A struna, zůstává ve stejné poloze'
    },
    {
        name: 'Sekvence g a h c',
        nameKey: 'test.gahc.name',
        descriptionKey: 'test.gahc.desc',
        input: ['g', 'a', 'h', 'c'],
        expected: [
            { s: 'D', p: 2, f: 4, ext: 0 },  // g
            { s: 'A', p: 0, f: 0, ext: 0 },  // a - otevřená struna
            { s: 'A', p: 2, f: 1, ext: 0 },  // h
            { s: 'G', p: 2, f: 4, ext: 0 }   // c
        ],
        description: 'Sekvence přes více strun'
    },
    {
        name: 'Dlouhá sekvence g a h c1 d1 e1 f1# g1',
        nameKey: 'test.long.name',
        descriptionKey: 'test.long.desc',
        input: ['g', 'a', 'h', 'c1', 'd1', 'e1', 'f1#', 'g1'],
        expected: [
            { s: 'D', p: 2, f: 4, ext: 0 },  // g
            { s: 'A', p: 0, f: 0, ext: 0 },  // a - otevřená struna
            { s: 'A', p: 2, f: 1, ext: 0 },  // h
            { s: 'A', p: 2, f: 2, ext: 0 },  // c1
            { s: 'A', p: 2, f: 4, ext: 0 },  // d1
            { s: 'A', p: 7, f: 1, ext: 0 },  // e1
            { s: 'A', p: 7, f: 3, ext: 0 },  // f1#
            { s: 'A', p: 7, f: 4, ext: 0 }   // g1
        ],
        description: 'Jen 2 polohy'
    },
    {
        name: 'C dur',
        nameKey: 'test.scale.cdur.name',
        descriptionKey: 'test.scale.cdur.desc',
        input: 'C D E F G A H c d e f g a h c1 d1 e1 f1 g1'.split(' '),
        expected: [
            { s: 'C', p: 0, f: 0, ext: 0 }, { s: 'C', p: 2, f: 1, ext: 0 }, { s: 'C', p: 2, f: 3, ext: 0 }, { s: 'C', p: 2, f: 4, ext: 0 },
            { s: 'G', p: 0, f: 0, ext: 0 }, { s: 'G', p: 2, f: 1, ext: 0 }, { s: 'G', p: 2, f: 3, ext: 0 }, { s: 'G', p: 2, f: 4, ext: 0 },
            { s: 'D', p: 0, f: 0, ext: 0 }, { s: 'D', p: 2, f: 1, ext: 0 }, { s: 'D', p: 2, f: 2, ext: 0 }, { s: 'D', p: 2, f: 4, ext: 0 },
            { s: 'A', p: 0, f: 0, ext: 0 }, { s: 'A', p: 2, f: 1, ext: 0 }, { s: 'A', p: 2, f: 2, ext: 0 }, { s: 'A', p: 2, f: 4, ext: 0 },
            { s: 'A', p: 7, f: 1, ext: 0 }, { s: 'A', p: 7, f: 2, ext: 0 }, { s: 'A', p: 7, f: 4, ext: 0 }
        ],
        description: 'Stupnice C dur'
    },
    {
        name: 'Cis dur',
        nameKey: 'test.scale.cisdur.name',
        descriptionKey: 'test.scale.cisdur.desc',
        input: 'C# D# E# F# G# A# H# c# d# e# f# g# a# h# c1# d1# e1# f1# g1#'.split(' '),
        expected: [
            { s: 'C', p: 1, f: 1, ext: 0 }, { s: 'C', p: 1, f: 3, ext: 0 }, { s: 'C', p: 3, f: 3, ext: 0 }, { s: 'C', p: 3, f: 4, ext: 0 },
            { s: 'G', p: 1, f: 1, ext: 0 }, { s: 'G', p: 1, f: 3, ext: 0 }, { s: 'G', p: 5, f: 1, ext: 0 }, { s: 'G', p: 5, f: 2, ext: 0 }, { s: 'G', p: 5, f: 4, ext: 0 },
            { s: 'D', p: 3, f: 1, ext: 0 }, { s: 'D', p: 3, f: 2, ext: 0 }, { s: 'D', p: 3, f: 4, ext: 0 },
            { s: 'A', p: 1, f: 1, ext: 0 }, { s: 'A', p: 1, f: 3, ext: 0 }, { s: 'A', p: 1, f: 4, ext: 0 },
            { s: 'A', p: 6, f: 1, ext: 0 }, { s: 'A', p: 6, f: 3, ext: 0 }, { s: 'A', p: 8, f: 2, ext: 0 }, { s: 'A', p: 8, f: 4, ext: 0 }
        ],
        description: 'Stupnice Cis dur'
    },
    {
        name: 'Des dur',
        nameKey: 'test.scale.desdur.name',
        descriptionKey: 'test.scale.desdur.desc',
        input: 'Db Eb F Gb Ab Hb c db eb f gb ab hb c1 db1 eb1 f1 gb1'.split(' '),
        expected: [
            { s: 'C', p: 1, f: 1, ext: 0 }, { s: 'C', p: 1, f: 3, ext: 0 }, { s: 'C', p: 3, f: 3, ext: 0 }, { s: 'C', p: 3, f: 4, ext: 0 },
            { s: 'G', p: 1, f: 1, ext: 0 }, { s: 'G', p: 1, f: 3, ext: 0 }, { s: 'G', p: 5, f: 1, ext: 0 }, { s: 'G', p: 5, f: 2, ext: 0 }, { s: 'G', p: 5, f: 4, ext: 0 },
            { s: 'D', p: 3, f: 1, ext: 0 }, { s: 'D', p: 3, f: 2, ext: 0 }, { s: 'D', p: 3, f: 4, ext: 0 },
            { s: 'A', p: 1, f: 1, ext: 0 }, { s: 'A', p: 1, f: 3, ext: 0 }, { s: 'A', p: 1, f: 4, ext: 0 },
            { s: 'A', p: 5, f: 2, ext: 0 }, { s: 'A', p: 5, f: 4, ext: 0 }, { s: 'A', p: 5, f: 4, ext: 1 }
        ],
        description: 'Stupnice Des dur'
    },
    {
        name: 'D dur',
        nameKey: 'test.scale.ddur.name',
        descriptionKey: 'test.scale.ddur.desc',
        input: 'D E F# G A H c# d e f# g a h c1# d1 e1 f1# g1'.split(' '),
        expected: [
            { s: 'C', p: 2, f: 1, ext: 0 }, { s: 'C', p: 2, f: 2, ext: 1 }, { s: 'C', p: 2, f: 4, ext: 1 },
            { s: 'G', p: 0, f: 0, ext: 0 }, { s: 'G', p: 2, f: 1, ext: 0 }, { s: 'G', p: 2, f: 2, ext: 1 }, { s: 'G', p: 2, f: 4, ext: 1 },
            { s: 'D', p: 0, f: 0, ext: 0 }, { s: 'D', p: 2, f: 1, ext: 0 }, { s: 'D', p: 2, f: 3, ext: 0 }, { s: 'D', p: 2, f: 4, ext: 0 },
            { s: 'A', p: 0, f: 0, ext: 0 }, { s: 'A', p: 2, f: 1, ext: 0 }, { s: 'A', p: 2, f: 3, ext: 0 }, { s: 'A', p: 2, f: 4, ext: 0 },
            { s: 'A', p: 7, f: 1, ext: 0 }, { s: 'A', p: 7, f: 3, ext: 0 }, { s: 'A', p: 7, f: 4, ext: 0 }
        ],
        description: 'Stupnice D dur'
    },
    {
        name: 'Es dur',
        nameKey: 'test.scale.esdur.name',
        descriptionKey: 'test.scale.esdur.desc',
        input: 'Eb F G Ab Hb c d eb f g ab hb c1 d1 eb1 f1 g1'.split(' '),
        expected: [
            { s: 'C', p: 2, f: 2, ext: 0 }, { s: 'C', p: 2, f: 4, ext: 0 },
            { s: 'G', p: 0, f: 0, ext: 0 }, { s: 'G', p: 1, f: 1, ext: 0 }, { s: 'G', p: 1, f: 3, ext: 0 }, { s: 'G', p: 2, f: 4, ext: 0 },
            { s: 'D', p: 0, f: 0, ext: 0 }, { s: 'G', p: 7, f: 2, ext: 0 }, { s: 'G', p: 7, f: 4, ext: 0 },
            { s: 'D', p: 5, f: 1, ext: 0 }, { s: 'D', p: 5, f: 2, ext: 0 }, { s: 'D', p: 5, f: 4, ext: 0 },
            { s: 'A', p: 3, f: 1, ext: 0 }, { s: 'A', p: 3, f: 3, ext: 0 }, { s: 'A', p: 3, f: 4, ext: 0 },
            { s: 'A', p: 7, f: 2, ext: 0 }, { s: 'A', p: 7, f: 4, ext: 0 }
        ],
        description: 'Stupnice Es dur'
    },
    {
        name: 'E dur',
        nameKey: 'test.scale.edur.name',
        descriptionKey: 'test.scale.edur.desc',
        input: 'E F# G# A H c# d# e f# g# a h c1# d1# e1 f1# g1#'.split(' '),
        expected: [
            { s: 'C', p: 3, f: 2, ext: 0 }, { s: 'C', p: 3, f: 4, ext: 0 },
            { s: 'G', p: 1, f: 1, ext: 0 }, { s: 'G', p: 1, f: 2, ext: 0 }, { s: 'G', p: 1, f: 4, ext: 0 },
            { s: 'G', p: 6, f: 1, ext: 0 }, { s: 'G', p: 6, f: 3, ext: 0 }, { s: 'G', p: 6, f: 4, ext: 0 },
            { s: 'D', p: 4, f: 1, ext: 0 }, { s: 'D', p: 4, f: 3, ext: 0 },
            { s: 'A', p: 0, f: 0, ext: 0 }, { s: 'A', p: 2, f: 1, ext: 0 }, { s: 'A', p: 2, f: 3, ext: 0 },
            { s: 'A', p: 6, f: 1, ext: 0 }, { s: 'A', p: 6, f: 2, ext: 0 }, { s: 'A', p: 8, f: 2, ext: 0 }, { s: 'A', p: 8, f: 4, ext: 0 }
        ],
        description: 'Stupnice E dur'
    },
    {
        name: 'F dur',
        nameKey: 'test.scale.fdur.name',
        descriptionKey: 'test.scale.fdur.desc',
        input: 'F G A Hb c d e f g a hb c1 d1 e1 f1 g1'.split(' '),
        expected: [
            { s: 'C', p: 2, f: 4, ext: 0 },
            { s: 'G', p: 0, f: 0, ext: 0 }, { s: 'G', p: 2, f: 1, ext: 0 }, { s: 'G', p: 2, f: 2, ext: 0 }, { s: 'G', p: 2, f: 4, ext: 0 },
            { s: 'D', p: 0, f: 0, ext: 0 }, { s: 'D', p: 2, f: 1, ext: 0 }, { s: 'D', p: 2, f: 2, ext: 0 }, { s: 'D', p: 2, f: 4, ext: 0 },
            { s: 'A', p: 0, f: 0, ext: 0 }, { s: 'A', p: 1, f: 1, ext: 0 }, { s: 'A', p: 1, f: 3, ext: 0 },
            { s: 'A', p: 5, f: 1, ext: 0 }, { s: 'A', p: 5, f: 3, ext: 0 }, { s: 'A', p: 7, f: 2, ext: 0 }, { s: 'A', p: 7, f: 4, ext: 0 }
        ],
        description: 'Stupnice F dur'
    },
    {
        name: 'Fis dur',
        nameKey: 'test.scale.fisdur.name',
        descriptionKey: 'test.scale.fisdur.desc',
        input: 'F# G# A# H c# d# e# f# g# a# h c1# d1# e1# f1# g1#'.split(' '),
        expected: [
            { s: 'C', p: 5, f: 2, ext: 0 }, { s: 'C', p: 5, f: 4, ext: 0 },
            { s: 'G', p: 3, f: 1, ext: 0 }, { s: 'G', p: 3, f: 2, ext: 0 }, { s: 'G', p: 3, f: 4, ext: 0 },
            { s: 'G', p: 8, f: 1, ext: 0 }, { s: 'G', p: 8, f: 3, ext: 0 }, { s: 'G', p: 8, f: 4, ext: 0 },
            { s: 'D', p: 6, f: 1, ext: 0 }, { s: 'D', p: 6, f: 3, ext: 0 }, { s: 'D', p: 6, f: 4, ext: 0 },
            { s: 'A', p: 4, f: 1, ext: 0 }, { s: 'A', p: 4, f: 3, ext: 0 },
            { s: 'A', p: 8, f: 1, ext: 0 }, { s: 'A', p: 8, f: 2, ext: 0 }, { s: 'A', p: 8, f: 4, ext: 0 }
        ],
        description: 'Stupnice Fis dur'
    },
    {
        name: 'Ges dur',
        nameKey: 'test.scale.gesdur.name',
        descriptionKey: 'test.scale.gesdur.desc',
        input: 'Gb Ab Hb cb db eb f gb ab hb cb1 db1 eb1 f1 gb1'.split(' '),
        expected: [
            { s: 'C', p: 5, f: 2, ext: 0 }, { s: 'C', p: 5, f: 4, ext: 0 },
            { s: 'G', p: 2, f: 2, ext: 0 }, { s: 'A', p: 2, f: 1, ext: 0 }, { s: 'G', p: 5, f: 2, ext: 0 }, { s: 'G', p: 5, f: 4, ext: 0 },
            { s: 'D', p: 3, f: 1, ext: 0 }, { s: 'D', p: 3, f: 2, ext: 0 }, { s: 'D', p: 3, f: 4, ext: 0 }, { s: 'D', p: 8, f: 1, ext: 0 },
            { s: 'A', p: 8, f: 4, ext: 1 }, { s: 'A', p: 4, f: 1, ext: 0 }, { s: 'A', p: 4, f: 3, ext: 0 },
            { s: 'A', p: 8, f: 1, ext: 0 }, { s: 'A', p: 8, f: 2, ext: 0 }
        ],
        description: 'Stupnice Ges dur'
    },
    {
        name: 'G dur',
        nameKey: 'test.scale.gdur.name',
        descriptionKey: 'test.scale.gdur.desc',
        input: 'G A H c d e f# g a h c1 d1 e1 f1# g1'.split(' '),
        expected: [
            { s: 'G', p: 0, f: 0, ext: 0 }, { s: 'G', p: 2, f: 1, ext: 0 }, { s: 'G', p: 2, f: 3, ext: 0 }, { s: 'G', p: 2, f: 4, ext: 0 },
            { s: 'D', p: 0, f: 0, ext: 0 }, { s: 'D', p: 2, f: 1, ext: 0 }, { s: 'D', p: 2, f: 3, ext: 0 }, { s: 'D', p: 2, f: 4, ext: 0 },
            { s: 'A', p: 0, f: 0, ext: 0 }, { s: 'A', p: 2, f: 1, ext: 0 }, { s: 'A', p: 2, f: 2, ext: 0 }, { s: 'A', p: 2, f: 4, ext: 0 },
            { s: 'A', p: 7, f: 1, ext: 0 }, { s: 'A', p: 7, f: 3, ext: 0 }, { s: 'A', p: 7, f: 4, ext: 0 }
        ],
        description: 'Stupnice G dur'
    },
    {
        name: 'As dur',
        nameKey: 'test.scale.asdur.name',
        descriptionKey: 'test.scale.asdur.desc',
        input: 'Ab Hb c db eb f g ab hb c1 db1 eb1 f1 g1'.split(' '),
        expected: [
            { s: 'G', p: 1, f: 1, ext: 0 }, { s: 'G', p: 1, f: 3, ext: 0 }, { s: 'G', p: 5, f: 1, ext: 0 }, { s: 'G', p: 5, f: 2, ext: 0 }, { s: 'G', p: 5, f: 4, ext: 0 },
            { s: 'D', p: 3, f: 1, ext: 0 }, { s: 'D', p: 3, f: 3, ext: 0 }, { s: 'D', p: 3, f: 4, ext: 0 },
            { s: 'A', p: 1, f: 1, ext: 0 }, { s: 'A', p: 1, f: 3, ext: 0 }, { s: 'A', p: 1, f: 4, ext: 0 },
            { s: 'A', p: 6, f: 1, ext: 0 }, { s: 'A', p: 6, f: 2, ext: 1 }, { s: 'A', p: 6, f: 4, ext: 1 }
        ],
        description: 'Stupnice As dur'
    },
    {
        name: 'A dur',
        nameKey: 'test.scale.adur.name',
        descriptionKey: 'test.scale.adur.desc',
        input: 'A H c# d e f# g# a h c1# d1 e1 f1# g1#'.split(' '),
        expected: [
            { s: 'G', p: 2, f: 1, ext: 0 }, { s: 'G', p: 2, f: 3, ext: 0 }, { s: 'G', p: 3, f: 4, ext: 0 },
            { s: 'D', p: 0, f: 0, ext: 0 }, { s: 'D', p: 2, f: 1, ext: 0 }, { s: 'D', p: 2, f: 3, ext: 0 }, { s: 'D', p: 3, f: 4, ext: 0 },
            { s: 'A', p: 0, f: 0, ext: 0 }, { s: 'A', p: 2, f: 1, ext: 0 }, { s: 'A', p: 2, f: 3, ext: 0 }, { s: 'A', p: 2, f: 4, ext: 0 },
            { s: 'A', p: 7, f: 1, ext: 0 }, { s: 'A', p: 7, f: 2, ext: 1 }, { s: 'A', p: 7, f: 4, ext: 1 }
        ],
        description: 'Stupnice A dur'
    },
    {
        name: 'Hes dur',
        nameKey: 'test.scale.hesdur.name',
        descriptionKey: 'test.scale.hesdur.desc',
        input: 'Hb c d eb f g a hb c1 d1 eb1 f1 g1'.split(' '),
        expected: [
            { s: 'G', p: 2, f: 2, ext: 0 }, { s: 'G', p: 2, f: 4, ext: 0 },
            { s: 'D', p: 0, f: 0, ext: 0 }, { s: 'G', p: 7, f: 2, ext: 0 }, { s: 'G', p: 7, f: 4, ext: 0 },
            { s: 'D', p: 5, f: 1, ext: 0 },
            { s: 'A', p: 0, f: 0, ext: 0 }, { s: 'A', p: 1, f: 1, ext: 0 }, { s: 'A', p: 1, f: 3, ext: 0 },
            { s: 'A', p: 5, f: 1, ext: 0 }, { s: 'A', p: 5, f: 2, ext: 0 }, { s: 'A', p: 7, f: 2, ext: 0 }, { s: 'A', p: 7, f: 4, ext: 0 }
        ],
        description: 'Stupnice Hes dur'
    },
    {
        name: 'H dur',
        nameKey: 'test.scale.hdur.name',
        descriptionKey: 'test.scale.hdur.desc',
        input: 'H c# d# e f# g# a# h c1# d1# e1 f1# g1#'.split(' '),
        expected: [
            { s: 'G', p: 4, f: 1, ext: 0 }, { s: 'G', p: 4, f: 3, ext: 0 },
            { s: 'G', p: 8, f: 1, ext: 0 }, { s: 'G', p: 8, f: 2, ext: 0 }, { s: 'G', p: 8, f: 4, ext: 0 },
            { s: 'D', p: 6, f: 1, ext: 0 }, { s: 'D', p: 6, f: 3, ext: 0 }, { s: 'D', p: 6, f: 4, ext: 0 },
            { s: 'A', p: 4, f: 1, ext: 0 }, { s: 'A', p: 4, f: 3, ext: 0 }, { s: 'A', p: 4, f: 4, ext: 0 },
            { s: 'A', p: 8, f: 2, ext: 0 }, { s: 'A', p: 8, f: 4, ext: 0 }
        ],
        description: 'Stupnice H dur'
    }
];

// Spuštění testů
function runTests() {
    const runner = new TestRunner();

    testSuites.forEach(suite => {
        runner.test(suite.name, () => {
            const inputForSolve = prepareInputForSolve(suite.input);
            const result = solve(inputForSolve);
            if (suite.successOnly) {
                runner.assertTrue(result != null && result.length === suite.input.length,
                    `Solver nevrátil platný výsledek pro ${suite.name}: ${suite.input.join(' ')}`);
                return;
            }
            runner.assertTrue(result !== null && result !== undefined,
                `Algoritmus nevrátil výsledek pro sekvenci: ${suite.input.join(' ')}`);
            runner.assertTrue(compareFingering(result, suite.expected),
                `Prstoklad se neshoduje pro ${suite.name}.\n` +
                `Očekáváno: ${formatFingering(suite.expected)}\n` +
                `Skutečnost: ${formatFingering(result)}\n` +
                `Popis: ${suite.description}`);
        });
    });

    return runner.run();
}

// Export funkcí pro ESM
export { TestRunner, runTests, compareFingering, formatFingering, prepareInputForSolve, testSuites };

