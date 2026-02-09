/**
 * Společná logika pro stránky nástrojů: skrývatelný popis (po první interakci skrytý),
 * tlačítko Další/Nové cvičení a dropdown nástrojů. Volá každá stránka nástroje po initI18n.
 * První interakci nástroj oznámí voláním window.markToolUsed().
 */
const STORAGE_PREFIX = 'celloapp:used:';

let tFn = null;

function getUsedKey(toolKey) {
    return STORAGE_PREFIX + toolKey;
}

function setIntroCollapsed(collapsed) {
    const content = document.getElementById('toolIntroContent');
    const toggle = document.getElementById('toolIntroToggle');
    const toggleText = document.getElementById('toolIntroToggleText');
    const chevron = document.getElementById('toolIntroChevron');
    if (!content || !tFn) return;
    content.classList.toggle('hidden', collapsed);
    if (toggle) toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    if (toggleText) toggleText.textContent = tFn(collapsed ? 'tool.toggleAbout' : 'tool.toggleAboutClose');
    if (chevron) chevron.style.transform = collapsed ? 'rotate(-90deg)' : '';
}

function markToolUsed() {
    const section = document.getElementById('toolIntroSection');
    if (!section) return;
    const toolKey = section.getAttribute('data-tool-key');
    if (!toolKey) return;
    try {
        localStorage.setItem(getUsedKey(toolKey), '1');
    } catch (e) { /* ignore */ }
    setIntroCollapsed(true);
}

function initToolSelect() {
    const select = document.getElementById('toolSelect');
    if (!select || !tFn) return;
    select.querySelectorAll('option[data-nav-key]').forEach(opt => {
        opt.textContent = opt.getAttribute('data-num') + '. ' + tFn(opt.getAttribute('data-nav-key'));
    });
    const placeholder = select.querySelector('option[value=""]');
    if (placeholder) placeholder.textContent = tFn('home.gotoToolPlaceholder');
    select.addEventListener('change', function () {
        const v = this.value;
        if (v) window.location.href = v;
    });
}

export function initToolPage(i18nT) {
    tFn = typeof i18nT === 'function' ? i18nT : null;
    const section = document.getElementById('toolIntroSection');
    if (!section) {
        window.markToolUsed = function () { };
        initToolSelect();
        return;
    }
    const toolKey = section.getAttribute('data-tool-key');
    if (!toolKey) {
        window.markToolUsed = function () { };
        initToolSelect();
        return;
    }
    window.markToolUsed = markToolUsed;

    try {
        if (localStorage.getItem(getUsedKey(toolKey)) === '1') setIntroCollapsed(true);
    } catch (e) { /* ignore */ }

    const toggle = document.getElementById('toolIntroToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const content = document.getElementById('toolIntroContent');
            if (!content) return;
            const isHidden = content.classList.toggle('hidden');
            setIntroCollapsed(isHidden);
        });
    }

    initToolSelect();
}
