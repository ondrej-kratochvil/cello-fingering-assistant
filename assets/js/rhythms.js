/**
 * Rytmy – načte výstup z Prstokladu (localStorage), aplikuje rytmický pattern, vykreslí VexFlow s čtvrťovými/osminovými notami.
 */
import { loadFingeringState } from './fingering-staff-utils.js';
import { renderStaffWithRhythm } from './ui-staff.js';
import { RHYTHM_PATTERNS, getDurationsForSequence } from './rhythm-patterns.js';

(function () {
    'use strict';

    const RHYTHM_STORAGE_KEY = 'celloapp:lastRhythm';

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

        function loadLastRhythm() {
            try {
                const id = localStorage.getItem(RHYTHM_STORAGE_KEY);
                if (id && RHYTHM_PATTERNS.some(p => p.id === id)) return id;
            } catch (e) { /* ignore */ }
            return RHYTHM_PATTERNS[0].id;
        }

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
            renderStaffWithRhythm(staffContainer, notes, durations, state.fingering);
            try {
                localStorage.setItem(RHYTHM_STORAGE_KEY, pattern.id);
            } catch (e) { /* ignore */ }
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
