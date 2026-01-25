// --- TEST RUNNER UI ---
// UI logika pro test runner v prohlížeči

import { solve } from './fingering.js';
import { compareFingering, formatFingering, prepareInputForSolve, testSuites } from './tests.js';
import { renderStaffOutput, toPositionLabel } from './ui.js';
import { t } from './i18n.js';

function getStringColors() {
    const body = getComputedStyle(document.body);
    const root = getComputedStyle(document.documentElement);
    return {
        'C': body.getPropertyValue('--cello-string-c').trim() || root.getPropertyValue('--cello-string-c').trim(),
        'G': body.getPropertyValue('--cello-string-g').trim() || root.getPropertyValue('--cello-string-g').trim(),
        'D': body.getPropertyValue('--cello-string-d').trim() || root.getPropertyValue('--cello-string-d').trim(),
        'A': body.getPropertyValue('--cello-string-a').trim() || root.getPropertyValue('--cello-string-a').trim()
    };
}

function toPositionLabelDiatonic(p) {
    return toPositionLabel(p, 'diatonic');
}

function getPositionChanges(result) {
    const positionChanges = [];
    let lastNonZeroPosition = null;
    for (let i = 0; i < result.length; i++) {
        const currentPos = result[i].p;
        if (currentPos > 0) {
            if (lastNonZeroPosition === null || currentPos !== lastNonZeroPosition) {
                positionChanges.push(i);
                lastNonZeroPosition = currentPos;
            }
        }
    }
    return positionChanges;
}

/**
 * Spustí všechny testy a zobrazí výsledky v UI (notová osnova jako na Home)
 */
export function runAllTests() {
    const resultsDiv = document.getElementById('testResults');
    const summaryTop = document.getElementById('testSummaryTop');

    if (!resultsDiv) return;

    resultsDiv.innerHTML = '';

    const stringColors = getStringColors();
    let passed = 0;
    let failed = 0;

    testSuites.forEach((suite, index) => {
        const testDiv = document.createElement('div');
        testDiv.className = 'p-6 rounded-2xl border-2 test-running space-y-4';
        testDiv.id = `test-${index}`;

        const inputForSolve = prepareInputForSolve(suite.input);
        const result = solve(inputForSolve);
        const isSuccessOnly = !!suite.successOnly;
        const isPass = isSuccessOnly
            ? (result != null && result.length === suite.input.length)
            : compareFingering(result, suite.expected);

        if (isPass) {
            passed++;
            testDiv.className = 'p-6 rounded-2xl border-2 test-pass space-y-4';
        } else {
            failed++;
            testDiv.className = 'p-6 rounded-2xl border-2 test-fail space-y-4';
        }

        const sequenceParam = encodeURIComponent(suite.input.join(' '));
        const indexUrl = `../../index.php?sequence=${sequenceParam}`;
        const hasValidResult = result != null && result.length === suite.input.length;

        const nameStr = (suite.nameKey && t(suite.nameKey)) || suite.name;
        const descStr = (suite.descriptionKey && t(suite.descriptionKey)) || suite.description;
        const header = document.createElement('div');
        header.innerHTML = `
            <div class="flex items-start justify-between mb-2">
                <h3 class="text-lg font-bold ${isPass ? 'text-green-800' : 'text-red-800'}">
                    ${isPass ? '✅' : '❌'} ${nameStr}
                </h3>
                <span class="text-xs font-bold ${isPass ? 'text-green-600' : 'text-red-600'}">
                    ${isPass ? t('test.pass') : t('test.fail')}
                </span>
            </div>
            <p class="text-sm text-slate-600 mb-3">${descStr}</p>
        `;
        testDiv.appendChild(header);

        if (!isPass && !isSuccessOnly && suite.expected) {
            const expectedBlock = document.createElement('div');
            expectedBlock.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4';
            expectedBlock.innerHTML = `
                <div>
                    <p class="font-bold text-slate-700 mb-1">${t('test.expected')}</p>
                    <p class="font-mono bg-slate-100 p-2 rounded">${formatFingering(suite.expected)}</p>
                </div>
                <div>
                    <p class="font-bold text-slate-700 mb-1">${t('test.actual')}</p>
                    <p class="font-mono bg-slate-100 p-2 rounded">${formatFingering(result)}</p>
                </div>
            `;
            testDiv.appendChild(expectedBlock);
        }
        if (!isPass && isSuccessOnly) {
            const errBlock = document.createElement('div');
            errBlock.className = 'text-sm mb-4';
            errBlock.innerHTML = `
                <p class="font-bold text-slate-700 mb-1">${t('test.actual')}</p>
                <p class="font-mono bg-slate-100 p-2 rounded">${result == null ? t('test.solverNoResult') : t('test.countMismatch', { n: result.length, expected: suite.input.length })}</p>
            `;
            testDiv.appendChild(errBlock);
        }

        if (hasValidResult) {
            const positionChanges = getPositionChanges(result);
            const staffContainer = document.createElement('div');
            staffContainer.className = 'w-full';
            renderStaffOutput(staffContainer, result, suite.input, positionChanges, stringColors, toPositionLabelDiatonic, { skipLegend: true });
            testDiv.appendChild(staffContainer);
        }

        const linkWrap = document.createElement('div');
        linkWrap.className = 'pt-4 border-t border-slate-200';
        linkWrap.innerHTML = `
            <a href="${indexUrl}" target="_blank"
               class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-md active:scale-95 text-sm">
                <span>🔍</span>
                <span>${t('test.showFingering')}</span>
            </a>
        `;
        testDiv.appendChild(linkWrap);

        resultsDiv.appendChild(testDiv);
    });

    // Sdílená legenda strun (jako na Home)
    const legendWrap = document.createElement('div');
    legendWrap.className = 'mt-6 pt-4 border-t border-slate-200';
    legendWrap.innerHTML = `<p class="text-sm font-bold text-slate-700 mb-2">${t('legend.strings')}</p>`;
    const legendItems = document.createElement('div');
    legendItems.className = 'flex flex-wrap gap-4 text-sm';
    Object.entries(stringColors).forEach(([str, color]) => {
        const item = document.createElement('div');
        item.className = 'flex items-center gap-2';
        item.innerHTML = `<span class="w-4 h-4 rounded" style="background-color:${color}"></span><span class="font-bold">${t('legend.string', { s: str })}</span>`;
        legendItems.appendChild(item);
    });
    legendWrap.appendChild(legendItems);
    resultsDiv.appendChild(legendWrap);

    // Přidat souhrn
    const summaryDiv = document.createElement('div');
    summaryDiv.className = `p-6 rounded-2xl border-2 mt-6 ${failed === 0 ? 'test-pass' : 'test-fail'}`;
    summaryDiv.innerHTML = `
        <h2 class="text-2xl font-black mb-2">📊 ${t('test.summary')}</h2>
        <p class="text-lg">
            <span class="font-bold text-green-600">${passed} ${t('test.passed')}</span> /
            <span class="font-bold text-red-600">${failed} ${t('test.failed')}</span> /
            <span class="font-bold">${passed + failed} ${t('test.total')}</span>
        </p>
        ${failed === 0 ?
            `<p class="text-green-700 font-bold mt-2">${t('test.allPassed')}</p>` :
            `<p class="text-red-700 font-bold mt-2">${t('test.someFailed')}</p>`
        }
    `;
    resultsDiv.appendChild(summaryDiv);

    // Aktualizovat souhrn nahoře
    if (summaryTop) {
        summaryTop.className = `p-4 rounded-2xl border-2 flex items-center justify-between mb-6 ${
            failed === 0 ? 'test-pass' : 'test-fail'
        }`;
        summaryTop.innerHTML = `
            <div>
                <h2 class="text-lg font-black">${t('test.summary')}</h2>
                <p class="text-sm">
                    <span class="font-bold text-green-700">${passed} ${t('test.passed')}</span> /
                    <span class="font-bold text-red-700">${failed} ${t('test.failed')}</span> /
                    <span class="font-bold">${passed + failed} ${t('test.total')}</span>
                </p>
            </div>
            <div class="text-sm font-bold ${failed === 0 ? 'text-green-800' : 'text-red-800'}">
                ${failed === 0 ? t('test.allPassed') : t('test.someFailed')}
            </div>
        `;
        summaryTop.classList.remove('hidden');
    }
}

// Export na window pro onclick atribut
window.runAllTests = runAllTests;
