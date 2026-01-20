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

// Pomocná funkce pro formátování prstokladu pro zobrazení
function formatFingering(fingering) {
    if (!fingering) return 'null';
    return fingering.map(f => `${f.s}${f.p.toString().padStart(2, '0')}${f.f}${f.ext}`).join(' ');
}

// Testovací sady
const testSuites = [
    {
        name: 'Základní sekvence e f# g#',
        input: ['e', 'f#', 'g#'],
        expected: [
            { s: 'D', p: 2, f: 1, ext: 0 },  // e na D struně, 2. poloha, 1. prst
            { s: 'D', p: 2, f: 2, ext: 1 },  // f# na D struně, 2. poloha, 2. prst, široká
            { s: 'D', p: 2, f: 4, ext: 1 }   // g# na D struně, 2. poloha, 4. prst, široká
        ],
        description: 'Mělo by zůstat v I. poloze (D02) a použít široké držení'
    },
    {
        name: 'Sekvence d1 e1 f1 g1',
        input: ['d1', 'e1', 'f1', 'g1'],
        expected: [
            { s: 'A', p: 5, f: 1, ext: 0 },  // d1
            { s: 'A', p: 5, f: 3, ext: 0 },  // e1
            { s: 'A', p: 7, f: 2, ext: 0 },  // f1
            { s: 'A', p: 7, f: 4, ext: 0 }   // g1
        ],
        description: 'Sekvence s posuny mezi polohami'
    },
    {
        name: 'Sekvence C D E F',
        input: ['C', 'D', 'E', 'F'],
        expected: [
            { s: 'C', p: 0, f: 0, ext: 0 },  // C - otevřená struna
            { s: 'C', p: 2, f: 1, ext: 0 },  // D
            { s: 'C', p: 2, f: 3, ext: 0 },  // E
            { s: 'C', p: 2, f: 4, ext: 0 }   // F
        ],
        description: 'C struna, II. poloha'
    },
    {
        name: 'Sekvence a h c1 d1',
        input: ['a', 'h', 'c1', 'd1'],
        expected: [
            { s: 'A', p: 0, f: 0, ext: 0 },  // a - otevřená struna
            { s: 'A', p: 2, f: 1, ext: 0 },  // h
            { s: 'A', p: 2, f: 2, ext: 0 },  // c1
            { s: 'A', p: 2, f: 4, ext: 0 }   // d1
        ],
        description: 'A struna, zůstává v II. poloze'
    },
    {
        name: 'Sekvence g a h c',
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
        description: 'Dlouhá sekvence přes více poloh na A struně'
    }
];

// Spuštění testů
function runTests() {
    const runner = new TestRunner();

    testSuites.forEach(suite => {
        runner.test(suite.name, () => {
            const result = solve(suite.input);
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
export { TestRunner, runTests, compareFingering, formatFingering, testSuites };

