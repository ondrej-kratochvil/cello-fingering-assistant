<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cello App Kit – Odpočet</title>
    <meta name="description" content="Minutka pro cvičení – nastavte čas, spusťte odpočet, na konci zazvoní.">
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
$taglineKey = "countdown.tagline";
$taglineFallback = 'Odpočet (minutka)';
require __DIR__ . '/assets/partials/topbar.php';
require __DIR__ . '/assets/php/tools_config.php';
$currentToolKey = 'countdown';
$toolKey = 'countdown';
$introKey = 'countdown.intro';
$toolTitleKey = 'countdown.title';
?>
        <main class="p-8 bg-white">
<?php require __DIR__ . '/assets/partials/tool_intro.php'; ?>

            <div class="max-w-md space-y-6">
                <div>
                    <label for="countdownMinutes" class="block text-sm font-bold text-slate-700 mb-2" data-i18n="countdown.minutes">Čas (minuty):</label>
                    <input type="number" id="countdownMinutes" min="1" max="120" value="30" class="w-full p-3 border-2 border-slate-200 rounded-xl font-mono text-xl">
                </div>
                <div class="flex gap-4">
                    <button type="button" id="countdownPlayPause" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors" data-i18n-aria-label="countdown.start">
                        <svg class="countdown-icon-play w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                        <svg class="countdown-icon-pause w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                        <span class="countdown-btn-text">Start</span>
                    </button>
                    <button type="button" id="countdownReset" class="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2" data-i18n-aria-label="countdown.reset">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        <span data-i18n="countdown.reset">Reset</span>
                    </button>
                </div>
                <div id="countdownDisplay" class="text-5xl font-black text-slate-800 text-center font-mono tabular-nums" aria-live="polite">30:00</div>
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
    </script>
</body>
</html>
