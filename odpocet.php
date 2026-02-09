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
?>
        <main class="p-8 bg-white">
            <h2 class="text-2xl font-bold text-slate-800 mb-4" data-i18n="countdown.title">Odpočet</h2>

            <div class="max-w-md space-y-6">
                <div>
                    <label for="countdownMinutes" class="block text-sm font-bold text-slate-700 mb-2" data-i18n="countdown.minutes">Čas (minuty):</label>
                    <input type="number" id="countdownMinutes" min="1" max="120" value="30" class="w-full p-3 border-2 border-slate-200 rounded-xl font-mono text-xl">
                </div>
                <div class="flex gap-4">
                    <button type="button" id="countdownStart" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="countdown.start">Start</button>
                    <button type="button" id="countdownPause" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="countdown.pause">Pauza</button>
                    <button type="button" id="countdownReset" class="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="countdown.reset">Reset</button>
                </div>
                <div id="countdownDisplay" class="text-5xl font-black text-slate-800 text-center font-mono tabular-nums" aria-live="polite">30:00</div>
            </div>
        </main>
<?php require __DIR__ . '/assets/partials/footer.php'; ?>
    </div>
<?php
$jsDir = __DIR__ . '/assets/js';
$i18nDir = __DIR__ . '/assets/i18n';
$JS_VERSIONS = [ 'i18n' => filemtime($jsDir . '/i18n.js'), 'navigation' => filemtime($jsDir . '/navigation.js') ];
?>
    <script>window.__JS_VERSIONS__ = <?= json_encode($JS_VERSIONS) ?>;</script>
    <script>window.__I18N_SCRIPT__ = new URL('./assets/js/i18n.js' + (window.__JS_VERSIONS__?.i18n ? '?v=' + window.__JS_VERSIONS__.i18n : ''), document.baseURI || window.location.href).href;</script>
    <script type="module">
        const V = window.__JS_VERSIONS__ || {};
        const { initI18n } = await import(window.__I18N_SCRIPT__);
        const { initNavigation } = await import('./assets/js/navigation.js' + (V.navigation ? '?v=' + V.navigation : ''));
        if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r));
        await initI18n();
        await initNavigation();
    </script>
    <script type="module" src="assets/js/countdown.js?v=<?= filemtime(__DIR__ . '/assets/js/countdown.js') ?>"></script>
</body>
</html>
