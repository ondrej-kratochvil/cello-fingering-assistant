// --- NAVIGATION & UI HELPERS ---
// Společné funkce pro navigaci a dark mode

/**
 * Inicializuje mobile menu toggle (menuToggle + mainNav, body.nav-open)
 */
export function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener('click', () => {
        document.body.classList.toggle('nav-open');
    });

    mainNav.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
    });
}

/**
 * Aktualizuje ikonu dark mode podle aktuálního stavu
 * @param {HTMLElement} iconElement - SVG element ikony
 * @param {boolean} isDark - Zda je aktivní dark mode
 */
function updateDarkModeIcon(iconElement, isDark) {
    if (!iconElement) return;

    if (isDark) {
        // Ikona slunce (light mode)
        iconElement.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
    } else {
        // Ikona měsíce (dark mode)
        iconElement.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
    }
}

/**
 * Callback funkce pro překreslení canvasu při změně dark mode
 * @type {Function|null}
 */
let canvasRedrawCallback = null;

/**
 * Nastaví callback pro překreslení canvasu při změně dark mode
 * @param {Function} callback - Funkce pro překreslení canvasu
 */
export function setCanvasRedrawCallback(callback) {
    canvasRedrawCallback = callback;
}

/**
 * Inicializuje dark mode toggle (prvky s třídami .dark-mode-toggle a .dark-mode-icon v menu)
 * @param {Object} options - Volitelné nastavení
 * @param {Function} options.onToggle - Callback volaný při změně dark mode
 */
export function initDarkMode(options = {}) {
    const toggles = document.querySelectorAll('.dark-mode-toggle');
    const icons = document.querySelectorAll('.dark-mode-icon');

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedMode = localStorage.getItem('darkMode');
    const isDark = savedMode === 'true' || (savedMode === null && prefersDark);

    if (isDark) document.body.classList.add('dark-mode');
    icons.forEach((el) => updateDarkModeIcon(el, isDark));

    const handleToggle = () => {
        document.body.classList.toggle('dark-mode');
        const isDarkNow = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkNow.toString());
        icons.forEach((el) => updateDarkModeIcon(el, isDarkNow));
        if (canvasRedrawCallback) canvasRedrawCallback();
        if (options.onToggle) options.onToggle(isDarkNow);
    };

    toggles.forEach((btn) => btn.addEventListener('click', handleToggle));
}

/**
 * Inicializuje přepínač jazyka (vlajky .lang-flag[data-lang] v menu)
 */
export async function initLanguageSwitcher() {
    const { setLanguage, getLanguage } = await import('./i18n.js');
    const flags = document.querySelectorAll('.lang-flag[data-lang]');
    if (!flags.length) return;

    const updateActive = () => {
        const lang = getLanguage();
        flags.forEach((btn) => {
            const active = btn.getAttribute('data-lang') === lang;
            btn.style.opacity = active ? '1' : '0.5';
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    };

    updateActive();
    flags.forEach((btn) => {
        btn.addEventListener('click', async () => {
            const locale = btn.getAttribute('data-lang');
            if (locale !== getLanguage()) {
                await setLanguage(locale);
                updateActive();
            }
        });
    });
}

/**
 * Inicializuje všechny navigační funkce
 * @param {Object} options - Volitelné nastavení pro dark mode
 */
export async function initNavigation(options = {}) {
    initMobileMenu();
    initDarkMode(options);
    await initLanguageSwitcher();
}
