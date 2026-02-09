<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cello App Kit – Rytmy</title>
    <meta name="description" content="Aplikace rytmických patternů na sekvenci z Prstokladu.">
    <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
    <link rel="stylesheet" href="assets/css/main.css?v=<?= filemtime(__DIR__ . '/assets/css/main.css') ?>">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
<?php
$base = '';
$pageTitle = 'Cello App Kit';
$taglineKey = 'rhythms.tagline';
$taglineFallback = 'Rytmy';
require __DIR__ . '/assets/partials/topbar.php';
?>
        <main class="p-8 bg-white">
            <h2 class="text-2xl font-bold text-slate-800 mb-4" data-i18n="rhythms.title">Rytmy</h2>
            <p class="text-slate-600 mb-6" data-i18n="rhythms.intro">Načte sekvenci z nástroje Prstoklad a aplikuje na ni zvolený rytmický pattern (čtvrťové a osminové noty).</p>

            <div id="rhythmsNoData" class="hidden p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                <p data-i18n="rhythms.noData">Nejdříve vytvořte prstoklad na stránce Prstoklad.</p>
                <a href="prstoklad.php" class="inline-block mt-3 text-indigo-600 font-bold hover:underline" data-i18n="guide.goFingering">Přejít k Prstoklad</a>
            </div>

            <div id="rhythmsContent" class="hidden space-y-6">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2" data-i18n="rhythms.pattern">Rytmický pattern:</label>
                    <select id="rhythmPattern" class="w-full max-w-md p-3 border-2 border-slate-200 rounded-xl font-mono"></select>
                </div>
                <div id="rhythmsStaff" class="overflow-x-auto"></div>
            </div>
        </main>
<?php require __DIR__ . '/assets/partials/footer.php'; ?>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/vexflow@4.2.5/build/cjs/vexflow.min.js"></script>
<?php
$jsDir = __DIR__ . '/assets/js';
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
    <script type="module" src="assets/js/rhythms.js?v=<?= filemtime(__DIR__ . '/assets/js/rhythms.js') ?>"></script>
</body>
</html>
