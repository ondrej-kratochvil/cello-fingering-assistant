/**
 * Seznam not – odkaz, název, autor, obtížnost 1–10. localStorage, řazení, filtry.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'celloapp:sheets';

    function loadSheets() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const data = JSON.parse(raw);
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    function saveSheets(sheets) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
    }

    let sortBy = 'surname';
    let sortAsc = true;
    let filterMin = null;
    let filterMax = null;

    function renderTable(sheets) {
        const tbody = document.getElementById('sheetTableBody');
        if (!tbody) return;
        let list = [...sheets];
        if (filterMin != null && filterMin !== '') list = list.filter(s => s.difficulty >= Number(filterMin));
        if (filterMax != null && filterMax !== '') list = list.filter(s => s.difficulty <= Number(filterMax));
        list.sort((a, b) => {
            let va, vb;
            if (sortBy === 'surname' || sortBy === 'author') {
                va = (a.surname || a.author || '').toLowerCase();
                vb = (b.surname || b.author || '').toLowerCase();
            } else if (sortBy === 'difficulty') {
                va = Number(a.difficulty) || 0;
                vb = Number(b.difficulty) || 0;
                return sortAsc ? va - vb : vb - va;
            } else {
                va = String(a[sortBy] || '').toLowerCase();
                vb = String(b[sortBy] || '').toLowerCase();
            }
            const c = va.localeCompare(vb);
            return sortAsc ? c : -c;
        });
        const playLabel = typeof window.t === 'function' ? window.t('playback.play') : 'Přehrát';
        tbody.innerHTML = list.map(s => {
            const seq = (s.sequence || '').trim();
            const playBtn = seq ? `<button type="button" class="sheet-play p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" data-sequence="${escapeAttr(seq)}" aria-label="${escapeAttr(playLabel)}"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>` : '';
            return `<tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="py-2 px-2">${escapeHtml((s.surname || s.author || '') + (s.firstName ? ' ' + s.firstName : ''))}</td>
                <td class="py-2 px-2 font-medium">${escapeHtml(s.title)}</td>
                <td class="py-2 px-2">${escapeHtml(String(s.difficulty))}</td>
                <td class="py-2 px-2"><a href="${safeHref(s.url) === '#' ? '#' : escapeAttr(safeHref(s.url))}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline truncate max-w-[200px] inline-block">${escapeHtml(s.url || '')}</a></td>
                <td class="py-2 px-2"><button type="button" class="sheet-delete text-red-600 hover:underline text-xs" data-id="${escapeAttr(s.id)}">${typeof window.t === 'function' ? escapeHtml(window.t('sheetList.delete')) : 'Smazat'}</button></td>
                <td class="py-2 px-2">${playBtn}</td>
            </tr>`;
        }).join('');
        tbody.querySelectorAll('.sheet-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const next = loadSheets().filter(s => s.id !== id);
                saveSheets(next);
                renderTable(next);
            });
        });
        tbody.querySelectorAll('.sheet-play').forEach(btn => {
            btn.addEventListener('click', () => {
                const seq = btn.getAttribute('data-sequence');
                if (!seq) return;
                const path = window.location.pathname;
                const dir = path.substring(0, path.lastIndexOf('/') + 1);
                window.location.href = dir + 'prstoklad.php?sequence=' + encodeURIComponent(seq);
            });
        });
    }

    function escapeHtml(s) {
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }
    function escapeAttr(s) {
        return String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }
    /** Pouze http(s) URL pro href; jinak '#' kvůli javascript: a dalším schématům. */
    function safeHref(url) {
        const u = String(url || '').trim().toLowerCase();
        if (!u) return '#';
        if (u.startsWith('https://') || u.startsWith('http://')) return url;
        return '#';
    }

    function init() {
        const form = document.getElementById('sheetForm');
        const formToggle = document.getElementById('sheetFormToggle');
        const filterMinEl = document.getElementById('filterMin');

        formToggle?.addEventListener('click', () => {
            form?.classList.toggle('hidden');
            const isVisible = !form?.classList.contains('hidden');
            formToggle.textContent = typeof window.t === 'function'
                ? (isVisible ? window.t('sheetList.cancelAdd') : window.t('sheetList.addSheet'))
                : (isVisible ? 'Zrušit přidání skladby' : 'Přidat skladbu');
            if (typeof window.markToolUsed === 'function') window.markToolUsed();
        });
        const filterMaxEl = document.getElementById('filterMax');
        const filterApplyBtn = document.getElementById('filterApply');
        const thead = document.querySelector('#sheetForm')?.closest('main')?.querySelector('thead');

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof window.markToolUsed === 'function') window.markToolUsed();
            const url = document.getElementById('sheetUrl')?.value?.trim() || '';
            const title = document.getElementById('sheetTitle')?.value?.trim();
            const surname = document.getElementById('sheetSurname')?.value?.trim() || '';
            const firstName = document.getElementById('sheetFirstName')?.value?.trim() || '';
            const sequence = document.getElementById('sheetSequence')?.value?.trim() || '';
            const difficulty = Math.max(1, Math.min(10, Number(document.getElementById('sheetDifficulty')?.value) || 5));
            if (!title || !surname) return;
            const sheets = loadSheets();
            const id = 's' + Date.now() + '-' + Math.random().toString(36).slice(2, 11);
            sheets.push({ id, url, title, surname, firstName, difficulty, sequence });
            saveSheets(sheets);
            renderTable(sheets);
            form.reset();
            document.getElementById('sheetDifficulty').value = 5;
            form.classList.add('hidden');
        });

        filterApplyBtn?.addEventListener('click', () => {
            filterMin = filterMinEl?.value ?? null;
            filterMax = filterMaxEl?.value ?? null;
            renderTable(loadSheets());
        });

        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.getAttribute('data-sort');
                if (sortBy === key) sortAsc = !sortAsc;
                else { sortBy = key; sortAsc = true; }
                renderTable(loadSheets());
            });
        });

        renderTable(loadSheets());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
