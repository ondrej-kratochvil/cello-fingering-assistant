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

    let sortBy = 'title';
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
            let va = a[sortBy], vb = b[sortBy];
            if (sortBy === 'difficulty') {
                va = Number(va) || 0;
                vb = Number(vb) || 0;
                return sortAsc ? va - vb : vb - va;
            }
            va = String(va || '').toLowerCase();
            vb = String(vb || '').toLowerCase();
            const c = va.localeCompare(vb);
            return sortAsc ? c : -c;
        });
        tbody.innerHTML = list.map(s => `
            <tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="py-2 px-2 font-medium">${escapeHtml(s.title)}</td>
                <td class="py-2 px-2">${escapeHtml(s.author || '')}</td>
                <td class="py-2 px-2">${escapeHtml(String(s.difficulty))}</td>
                <td class="py-2 px-2"><a href="${escapeAttr(s.url || '#')}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline truncate max-w-[200px] inline-block">${escapeHtml(s.url || '')}</a></td>
                <td class="py-2 px-2"><button type="button" class="sheet-delete text-red-600 hover:underline text-xs" data-id="${escapeAttr(s.id)}">${typeof window.t === 'function' ? escapeHtml(window.t('sheetList.delete')) : 'Smazat'}</button></td>
            </tr>
        `).join('');
        tbody.querySelectorAll('.sheet-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const next = loadSheets().filter(s => s.id !== id);
                saveSheets(next);
                renderTable(next);
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

    function init() {
        const form = document.getElementById('sheetForm');
        const filterMinEl = document.getElementById('filterMin');
        const filterMaxEl = document.getElementById('filterMax');
        const filterApplyBtn = document.getElementById('filterApply');
        const thead = document.querySelector('#sheetForm')?.closest('main')?.querySelector('thead');

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof window.markToolUsed === 'function') window.markToolUsed();
            const url = document.getElementById('sheetUrl')?.value?.trim() || '';
            const title = document.getElementById('sheetTitle')?.value?.trim();
            const author = document.getElementById('sheetAuthor')?.value?.trim() || '';
            const difficulty = Math.max(1, Math.min(10, Number(document.getElementById('sheetDifficulty')?.value) || 5));
            if (!title) return;
            const sheets = loadSheets();
            const id = 's' + Date.now();
            sheets.push({ id, url, title, author, difficulty });
            saveSheets(sheets);
            renderTable(sheets);
            form.reset();
            document.getElementById('sheetDifficulty').value = 5;
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
