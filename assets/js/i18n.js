/**
 * Jednoduchý i18n modul bez závislostí.
 * Načítá JSON z assets/i18n/{locale}.json, ukládá jazyk a H/B do localStorage.
 */

const STORAGE_LANG = 'language';
const STORAGE_NOTE_NAMING = 'noteNaming';
const DEFAULT_LOCALE = 'cs';
const DEFAULT_NOTE_NAMING = 'H';

/** @type {Record<string, Record<string, string>>} */
const messages = {};

/** @type {string} */
let currentLocale = DEFAULT_LOCALE;

/** @type {'H'|'B'} */
let currentNoteNaming = DEFAULT_NOTE_NAMING;

/** Základní cesta k i18n (relativně k tomuto modulu) */
const I18N_BASE = new URL('../i18n/', import.meta.url).href;

/**
 * Načte překlady pro daný locale.
 * @param {string} locale
 * @returns {Promise<Record<string, string>>}
 */
export async function loadLocale(locale) {
    if (messages[locale]) return messages[locale];
    const url = `${I18N_BASE}${locale}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`i18n: Failed to load ${url}`);
    const data = await res.json();
    messages[locale] = data;
    return data;
}

/**
 * Vrátí přeložený řetězec. Podporuje interpolaci {{key}}.
 * @param {string} key
 * @param {Record<string, string|number>} [vars]
 * @returns {string}
 */
export function t(key, vars = {}) {
    let msg = (messages[currentLocale] && messages[currentLocale][key])
        || (messages[DEFAULT_LOCALE] && messages[DEFAULT_LOCALE][key])
        || key;
    Object.entries(vars).forEach(([k, v]) => {
        msg = msg.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    });
    return msg;
}

/**
 * Aktuální jazyk (cs, en, …). Čte z localStorage, ne z messages.
 * @returns {string}
 */
export function getLanguage() {
    const v = localStorage.getItem(STORAGE_LANG);
    return (v === 'cs' || v === 'en') ? v : DEFAULT_LOCALE;
}

/**
 * Nastaví jazyk, načte překlady, uloží do localStorage a spustí applyTranslations + languageChange.
 * @param {string} locale
 */
export async function setLanguage(locale) {
    await loadLocale(locale);
    currentLocale = locale;
    localStorage.setItem(STORAGE_LANG, locale);
    applyTranslations();
    document.documentElement.lang = locale === 'en' ? 'en' : 'cs';
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { locale } }));
}

/**
 * Vrátí režim označení tónu H/B.
 * @returns {'H'|'B'}
 */
export function getNoteNaming() {
    const v = localStorage.getItem(STORAGE_NOTE_NAMING);
    return v === 'B' ? 'B' : 'H';
}

/**
 * Nastaví režim H/B, uloží a vyvolá překreslení (volající mají naslouchat např. noteNamingChange).
 * @param {'H'|'B'} mode
 */
export function setNoteNaming(mode) {
    currentNoteNaming = mode;
    localStorage.setItem(STORAGE_NOTE_NAMING, mode);
    window.dispatchEvent(new CustomEvent('noteNamingChange', { detail: { mode } }));
}

/** @returns {'H'|'B'} */
export function getNoteNamingCurrent() {
    return currentNoteNaming;
}

/**
 * Projde [data-i18n] a nastaví textContent. U [data-i18n-html] nastaví innerHTML.
 * U placeholderů u inputů hledá [data-i18n-placeholder] a nastaví placeholder.
 */
export function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        const raw = t(key);
        if (el.hasAttribute('data-i18n-html')) {
            el.innerHTML = raw;
        } else {
            el.textContent = raw;
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key && 'placeholder' in el) el.placeholder = t(key);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
        const key = el.getAttribute('data-i18n-aria-label');
        if (key) el.setAttribute('aria-label', t(key));
    });
}

/**
 * Inicializace i18n: načte uložený jazyk a H/B, aplikuje překlady.
 * Vždy načte cs jako fallback, pak aktuální jazyk.
 */
export async function initI18n() {
    const lang = getLanguage();
    const naming = getNoteNaming();
    currentNoteNaming = naming;
    await loadLocale(DEFAULT_LOCALE);
    if (lang !== DEFAULT_LOCALE) await loadLocale(lang);
    currentLocale = lang;
    document.documentElement.lang = lang === 'en' ? 'en' : 'cs';
    applyTranslations();
}
