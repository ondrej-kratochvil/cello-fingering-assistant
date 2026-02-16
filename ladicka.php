<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cello App Kit – Ladička</title>
    <meta name="description" content="Ladička pro otevřené struny violoncella C, G, d, a. Mikrofon, temperované nebo čisté kvinty.">
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
$taglineKey = 'tuner.tagline';
$taglineFallback = 'Ladička – otevřené struny C, G, d, a';
require __DIR__ . '/assets/partials/topbar.php';
require __DIR__ . '/assets/php/tools_config.php';
$currentToolKey = 'tuner';
$toolKey = 'tuner';
$introKey = 'tuner.intro';
$toolTitleKey = 'tuner.title';
?>
        <main class="p-8 bg-white">
<?php require __DIR__ . '/assets/partials/tool_intro.php'; ?>

            <div class="space-y-6 max-w-md">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2" data-i18n="tuner.referenceA">Referenční tón A (Hz):</label>
                    <select id="tunerReference" class="w-full p-3 border-2 border-slate-200 rounded-xl font-mono">
                        <option value="440">440</option>
                        <option value="441">441</option>
                        <option value="442">442</option>
                        <option value="443">443</option>
                    </select>
                </div>
                <div>
                    <span class="block text-sm font-bold text-slate-700 mb-2" data-i18n="tuner.tuning">Ladění:</span>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="tunerMode" value="equal" checked class="w-4 h-4 text-indigo-600">
                            <span data-i18n="tuner.equal">Temperované</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="tunerMode" value="pure" class="w-4 h-4 text-indigo-600">
                            <span data-i18n="tuner.pure">Čisté kvinty</span>
                        </label>
                    </div>
                </div>
                <div>
                    <button type="button" id="tunerMicBtn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl">
                        <span data-i18n="tuner.micStart">Zapnout mikrofon</span>
                    </button>
                    <p id="tunerMicStatus" class="text-sm text-slate-500 mt-2" aria-live="polite"></p>
                </div>
            </div>

            <div id="tunerDisplays" class="mt-8 max-w-md hidden">
                <div class="tuner-string-card border-2 border-slate-200 rounded-2xl p-4" data-string="">
                    <div class="text-xl font-bold text-slate-800 mb-2 tuner-string-label">—</div>
                    <canvas class="tuner-needle w-full h-24 rounded bg-slate-100" width="200" height="96" aria-hidden="true"></canvas>
                    <p class="tuner-status text-sm font-medium mt-2 text-center" data-i18n="tuner.playString">Zahrajte strunu</p>
                    <p class="tuner-freq text-xs text-slate-500 text-center mt-1">— Hz</p>
                </div>
            </div>
<?php require __DIR__ . '/assets/partials/tool_next_bar.php'; ?>
        </main>
<?php require __DIR__ . '/assets/partials/footer.php'; ?>
    </div>
<?php
$jsDir = __DIR__ . '/assets/js';
$i18nDir = __DIR__ . '/assets/i18n';
$JS_VERSIONS = [ 'i18n' => filemtime($jsDir . '/i18n.js'), 'navigation' => filemtime($jsDir . '/navigation.js'), 'toolPage' => filemtime($jsDir . '/tool-page.js'), 'countdown' => filemtime($jsDir . '/countdown.js') ];
$I18N_VERSION = max(filemtime($i18nDir . '/cs.json'), filemtime($i18nDir . '/en.json'));
?>
    <script>window.__JS_VERSIONS__ = <?= json_encode($JS_VERSIONS) ?>; window.__I18N_VERSION__ = <?= (int) $I18N_VERSION ?>;</script>
    <script>window.__I18N_SCRIPT__ = new URL('./assets/js/i18n.js' + (window.__JS_VERSIONS__?.i18n ? '?v=' + window.__JS_VERSIONS__.i18n : ''), document.baseURI || window.location.href).href;</script>
    <script type="module">
        const V = window.__JS_VERSIONS__ || {};
        const { initI18n, t } = await import(window.__I18N_SCRIPT__);
        const { initNavigation } = await import('./assets/js/navigation.js' + (V.navigation ? '?v=' + V.navigation : ''));
        const { initToolPage } = await import('./assets/js/tool-page.js' + (V.toolPage ? '?v=' + V.toolPage : ''));
        if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r));
        await initI18n();
        window.t = t;
        await initNavigation();
        initToolPage(t);
        await import('./assets/js/countdown.js' + (V.countdown ? '?v=' + V.countdown : ''));
        await import('./assets/js/tuner.js?v=<?= filemtime(__DIR__ . '/assets/js/tuner.js') ?>');
    </script>
</body>
</html>
