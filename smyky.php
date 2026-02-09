<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cello App Kit – Smyky</title>
    <meta name="description" content="Aplikace smykových patternů (legato / samostatně) na sekvenci z Prstokladu.">
    <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
    <link rel="stylesheet" href="assets/css/main.css?v=<?= filemtime(__DIR__ . '/assets/css/main.css') ?>">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
<?php
$base = '';
$pageTitle = 'Cello App Kit';
$taglineKey = 'bowing.tagline';
$taglineFallback = 'Smyky';
require __DIR__ . '/assets/partials/topbar.php';
require __DIR__ . '/assets/php/tools_config.php';
$currentToolKey = 'bowing';
$toolKey = 'bowing';
$introKey = 'bowing.intro';
?>
        <main class="p-8 bg-white">
            <h2 class="text-2xl font-bold text-slate-800 mb-4" data-i18n="bowing.title">Smyky</h2>
<?php require __DIR__ . '/assets/partials/tool_intro.php'; ?>

            <div id="bowingNoData" class="hidden p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                <p data-i18n="bowing.noData">Nejdříve vytvořte prstoklad na stránce Prstoklad.</p>
                <a href="prstoklad.php" class="inline-block mt-3 text-indigo-600 font-bold hover:underline" data-i18n="guide.goFingering">Přejít k Prstoklad</a>
            </div>

            <div id="bowingContent" class="hidden space-y-6">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-2" data-i18n="bowing.pattern">Smykový pattern:</label>
                    <select id="bowingPattern" class="w-full max-w-md p-3 border-2 border-slate-200 rounded-xl font-mono"></select>
                </div>
                <div id="bowingStaff" class="overflow-x-auto"></div>
            </div>
<?php require __DIR__ . '/assets/partials/tool_next_bar.php'; ?>
        </main>
<?php require __DIR__ . '/assets/partials/footer.php'; ?>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/vexflow@4.2.5/build/cjs/vexflow.min.js"></script>
<?php
$jsDir = __DIR__ . '/assets/js';
$JS_VERSIONS = [ 'i18n' => filemtime($jsDir . '/i18n.js'), 'navigation' => filemtime($jsDir . '/navigation.js'), 'toolPage' => filemtime($jsDir . '/tool-page.js') ];
?>
    <script>window.__JS_VERSIONS__ = <?= json_encode($JS_VERSIONS) ?>;</script>
    <script>window.__I18N_SCRIPT__ = new URL('./assets/js/i18n.js' + (window.__JS_VERSIONS__?.i18n ? '?v=' + window.__JS_VERSIONS__.i18n : ''), document.baseURI || window.location.href).href;</script>
    <script type="module">
        const V = window.__JS_VERSIONS__ || {};
        const { initI18n, t } = await import(window.__I18N_SCRIPT__);
        const { initNavigation } = await import('./assets/js/navigation.js' + (V.navigation ? '?v=' + V.navigation : ''));
        const { initToolPage } = await import('./assets/js/tool-page.js' + (V.toolPage ? '?v=' + V.toolPage : ''));
        if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r));
        await initI18n();
        await initNavigation();
        initToolPage(t);
    </script>
    <script type="module" src="assets/js/bowing.js?v=<?= filemtime(__DIR__ . '/assets/js/bowing.js') ?>"></script>
</body>
</html>
