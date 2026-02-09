<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cello App Kit – Prstoklad</title>
    <meta name="description" content="Prstoklad: zadejte sekvenci tónů a získejte doporučený prstoklad s vizualizací a přehráváním.">
    <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
    <link rel="stylesheet" href="assets/css/main.css?v=<?= filemtime(__DIR__ . '/assets/css/main.css') ?>">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
<?php
$base = '';
$pageTitle = 'Cello App Kit';
$pageTitleKey = 'header.pageTitle';
$taglineKey = 'header.tagline';
$taglineFallback = 'Prstoklad – pro zadané tóny doporučí vhodný prstoklad';
require __DIR__ . '/assets/partials/topbar.php';
?>
        <main class="p-8 bg-white">
            <h2 class="text-2xl font-bold text-slate-800 mb-4" data-i18n="guide.stepFingering">Prstoklad</h2>
        </main>

        <div class="p-8 border-b border-slate-100 bg-slate-50">
            <label for="melodyInput" class="block text-sm font-bold text-slate-700 mb-2 tracking-wider" data-i18n="input.label">
                Zadejte tóny včetně rozlišení oktáv a posuvek oddělené mezerami, např. C c c1 c1# gb nebo cis1 des
            </label>
            <div class="space-y-4">
                <div class="flex-1 relative">
                    <textarea id="melodyInput" rows="1"
                              class="melody-textarea w-full p-4 pr-12 text-xl border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all font-mono shadow-inner resize-none min-h-[3rem] overflow-y-auto"
                              placeholder="C D E F G A H c d e f g a h c1 d1 e1 f1 g1 a1 h1 c2">C D E F G A H c d e f g a h c1 d1 e1 f1 g1 a1 h1 c2</textarea>
                    <button type="button" id="clearInputButton"
                            class="absolute right-2 top-3 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                            aria-label="Vymazat vstup" data-i18n-aria-label="aria.clearInput">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <button id="solveButton"
                            class="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95"
                            data-i18n="button.solve" data-i18n-title="aria.solveShortcut">Navrhnout prstoklad</button>
                    <button id="editFingeringButton" type="button"
                            class="bg-slate-700 hover:bg-slate-800 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95"
                            data-i18n="button.editStart">Editovat prstoklad</button>
                    <button id="saveTestButton" type="button"
                            class="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95"
                            data-i18n="button.saveTest">Uložit jako test</button>
                    <button id="settingsToggle" type="button"
                            class="bg-white hover:bg-slate-100 text-slate-700 font-black py-4 px-10 rounded-2xl border border-slate-200 active:scale-95"
                            data-i18n="button.settingsOpen" aria-expanded="false">Nastavení</button>
                </div>
                <div id="settingsSection" class="mt-2">
                    <div id="settingsContent" class="hidden space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <div>
                            <span class="block text-sm font-bold text-slate-700 mb-2" data-i18n="settings.outputFormat">Formát výstupu:</span>
                            <div class="space-y-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="outputFormat" value="staff" checked class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.outputStaff">Notová osnova</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="outputFormat" value="text" class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.outputText">Textový výstup</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <span class="block text-sm font-bold text-slate-700 mb-2" data-i18n="settings.positionLabel">Označení poloh:</span>
                            <div class="space-y-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="positionLabel" value="diatonic" checked class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.positionDiatonic">Diatonické (I, II↓, II↑, …)</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="positionLabel" value="chromatic" class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.positionChromatic">Chromatické (I–XII)</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <span class="block text-sm font-bold text-slate-700 mb-2" data-i18n="settings.noteNaming">Označení tónu H/B:</span>
                            <div class="space-y-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="noteNaming" value="H" checked class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.noteH">H (Hes)</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="noteNaming" value="B" class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.noteB">B (Bb)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="resultsWrapper" class="p-8 hidden">
            <div class="overflow-x-auto -mx-8 px-8 md:mx-0 md:px-0">
                <div id="pathDisplay" class="flex flex-nowrap md:flex-wrap justify-center md:justify-start gap-4 min-w-max md:min-w-0"></div>
            </div>
            <div class="overflow-x-auto -mx-8 px-8 md:mx-0 md:px-0 mt-10">
                <canvas id="fretboardCanvas" width="1000" height="400" class="border border-slate-300 rounded-lg"></canvas>
            </div>
        </div>

        <div class="p-8 bg-white border-t border-slate-100 text-center">
            <button id="toggleJsonButton" class="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors" data-i18n="button.jsonShow">Zobrazit JSON Model</button>
            <div id="jsonContainer" class="hidden mt-4 bg-slate-900 rounded-2xl p-6 text-left overflow-hidden">
                <pre id="jsonDisplay" class="text-emerald-400 text-xs overflow-auto max-h-[300px]"></pre>
            </div>
        </div>

<?php require __DIR__ . '/assets/partials/footer.php'; ?>
    </div>
<?php
$jsDir = __DIR__ . '/assets/js';
$i18nDir = __DIR__ . '/assets/i18n';
$JS_VERSIONS = [
    'i18n' => filemtime($jsDir . '/i18n.js'),
    'navigation' => filemtime($jsDir . '/navigation.js'),
    'fingering' => filemtime($jsDir . '/fingering.js'),
    'tests' => filemtime($jsDir . '/tests.js'),
    'ui' => filemtime($jsDir . '/ui.js'),
];
?>
    <script>window.__JS_VERSIONS__ = <?= json_encode($JS_VERSIONS) ?>;</script>
    <script>window.__I18N_SCRIPT__ = new URL('./assets/js/i18n.js' + (window.__JS_VERSIONS__?.i18n ? '?v=' + window.__JS_VERSIONS__.i18n : ''), document.baseURI || window.location.href).href;</script>
    <script src="https://cdn.jsdelivr.net/npm/vexflow@4.2.5/build/cjs/vexflow.min.js"></script>
    <script type="module">
        const V = window.__JS_VERSIONS__ || {};
        const { initI18n } = await import(window.__I18N_SCRIPT__);
        const { initNavigation, setCanvasRedrawCallback } = await import('./assets/js/navigation.js' + (V.navigation ? '?v=' + V.navigation : ''));
        const ui = await import('./assets/js/ui.js' + (V.ui ? '?v=' + V.ui : ''));
        async function main() {
            if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r));
            await ui.ready;
            await initI18n();
            setCanvasRedrawCallback(() => { if (typeof window.redrawResults === 'function') window.redrawResults(); });
            await initNavigation();
            ui.initUI();
        }
        main();
    </script>
</body>
</html>
