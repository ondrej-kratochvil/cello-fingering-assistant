<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cello App Kit – Seznam not</title>
    <meta name="description" content="Seznam odkazů na noty – skladby, autoři, obtížnost.">
    <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
    <link rel="stylesheet" href="assets/css/main.css?v=<?= filemtime(__DIR__ . '/assets/css/main.css') ?>">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
<?php
$base = '';
$pageTitle = 'Cello App Kit';
$taglineKey = 'sheetList.tagline';
$taglineFallback = 'Seznam not';
require __DIR__ . '/assets/partials/topbar.php';
require __DIR__ . '/assets/php/tools_config.php';
$currentToolKey = 'sheetList';
$toolKey = 'sheetList';
$introKey = 'sheetList.intro';
$toolTitleKey = 'sheetList.title';
?>
        <main class="p-8 bg-white">
<?php require __DIR__ . '/assets/partials/tool_intro.php'; ?>

            <div class="mb-4">
                <button type="button" id="sheetFormToggle" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="sheetList.addSheet">Přidat skladbu</button>
            </div>
            <form id="sheetForm" class="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 max-w-2xl hidden">
                <div>
                    <label for="sheetSurname" class="block text-sm font-bold text-slate-700 mb-1" data-i18n="sheetList.surnameAuthor">Příjmení autora</label>
                    <p class="text-xs text-slate-500 mb-1" data-i18n="sheetList.surnameHint">U lidových písní, stupnic apod. uveďte např. Lidová, Neznámý.</p>
                    <input type="text" id="sheetSurname" class="w-full p-3 border border-slate-300 rounded-xl" required>
                </div>
                <div>
                    <label for="sheetFirstName" class="block text-sm font-bold text-slate-700 mb-1" data-i18n="sheetList.firstNameAuthor">Jméno autora</label>
                    <input type="text" id="sheetFirstName" class="w-full p-3 border border-slate-300 rounded-xl">
                </div>
                <div>
                    <label for="sheetTitle" class="block text-sm font-bold text-slate-700 mb-1" data-i18n="sheetList.titleField">Název skladby:</label>
                    <input type="text" id="sheetTitle" class="w-full p-3 border border-slate-300 rounded-xl" required>
                </div>
                <div>
                    <label for="sheetDifficulty" class="block text-sm font-bold text-slate-700 mb-1" data-i18n="sheetList.difficulty">Obtížnost (1–10):</label>
                    <input type="number" id="sheetDifficulty" min="1" max="10" value="5" class="w-24 p-3 border border-slate-300 rounded-xl">
                </div>
                <div>
                    <label for="sheetSequence" class="block text-sm font-bold text-slate-700 mb-1" data-i18n="sheetList.sequence">Sekvence tónů</label>
                    <textarea id="sheetSequence" class="w-full p-3 border border-slate-300 rounded-xl font-mono text-sm" rows="2" placeholder="c d e f g a h c1"></textarea>
                </div>
                <div>
                    <label for="sheetUrl" class="block text-sm font-bold text-slate-700 mb-1" data-i18n="sheetList.url">Odkaz (URL):</label>
                    <input type="url" id="sheetUrl" class="w-full p-3 border border-slate-300 rounded-xl" placeholder="https://…">
                </div>
                <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="sheetList.add">Přidat</button>
            </form>

            <div class="mb-4 flex flex-wrap items-center gap-4">
                <span class="text-sm font-bold text-slate-700" data-i18n="sheetList.filter">Filtr obtížnosti:</span>
                <input type="number" id="filterMin" min="1" max="10" placeholder="min" class="w-20 p-2 border border-slate-300 rounded">
                <span>–</span>
                <input type="number" id="filterMax" min="1" max="10" placeholder="max" class="w-20 p-2 border border-slate-300 rounded">
                <button type="button" id="filterApply" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded" data-i18n="sheetList.filterApply">Použít</button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse">
                    <thead>
                        <tr class="border-b-2 border-slate-200">
                            <th class="text-left py-3 px-2 cursor-pointer hover:bg-slate-100 rounded" data-sort="surname" data-i18n="sheetList.author">Autor</th>
                            <th class="text-left py-3 px-2 cursor-pointer hover:bg-slate-100 rounded" data-sort="title" data-i18n="sheetList.titleField">Název skladby</th>
                            <th class="text-left py-3 px-2 cursor-pointer hover:bg-slate-100 rounded" data-sort="difficulty" data-i18n="sheetList.difficulty">Obtížnost</th>
                            <th class="text-left py-3 px-2" data-i18n="sheetList.url">Odkaz</th>
                            <th class="w-20"></th>
                            <th class="w-12"></th>
                        </tr>
                    </thead>
                    <tbody id="sheetTableBody"></tbody>
                </table>
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
        await import('./assets/js/sheet-list.js?v=<?= filemtime(__DIR__ . '/assets/js/sheet-list.js') ?>');
    </script>
</body>
</html>
