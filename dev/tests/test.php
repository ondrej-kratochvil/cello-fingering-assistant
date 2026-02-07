<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Testovací stránka pro ověření správnosti algoritmu prstokladu violoncella.">
    <title>Testy - Cello Fingering Assistant</title>
    <link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg">
    <link rel="stylesheet" href="../../assets/css/main.css?v=<?= filemtime(__DIR__ . '/../../assets/css/main.css') ?>">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
<?php
$base = '../../';
$pageTitle = 'Testy prstokladu';
$pageTitleKey = 'test.pageTitle';
$taglineKey = 'test.tagline';
$taglineFallback = 'Ověření správnosti algoritmu';
require __DIR__ . '/../../assets/partials/topbar.php';
?>

        <main class="p-8">
            <!-- Horní souhrn výsledků testů -->
            <div id="testSummaryTop" class="mb-6 hidden">
                <!-- Vyplní se dynamicky v runAllTests() -->
            </div>

            <button id="runAllTestsButton" onclick="runAllTests()" disabled
                    class="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-i18n="test.runAll">
                Spustit všechny testy
            </button>

            <div id="testResults" class="space-y-4"></div>
        </main>

<?php require __DIR__ . '/../../assets/partials/footer.php'; ?>
    </div>

<?php
$jsDir = __DIR__ . '/../../assets/js';
$i18nDir = __DIR__ . '/../../assets/i18n';
$JS_VERSIONS = [
    'i18n' => filemtime($jsDir . '/i18n.js'),
    'navigation' => filemtime($jsDir . '/navigation.js'),
    'fingering' => filemtime($jsDir . '/fingering.js'),
    'tests' => filemtime($jsDir . '/tests.js'),
    'ui' => filemtime($jsDir . '/ui.js'),
    'testRunner' => filemtime($jsDir . '/test-runner.js'),
];
$I18N_VERSION = max(filemtime($i18nDir . '/cs.json'), filemtime($i18nDir . '/en.json'));
?>
    <script>window.__JS_VERSIONS__ = <?= json_encode($JS_VERSIONS) ?>; window.__I18N_VERSION__ = <?= (int) $I18N_VERSION ?>;</script>
    <script src="https://cdn.jsdelivr.net/npm/vexflow@4.2.5/build/cjs/vexflow.min.js"></script>
    <script type="module">
        const V = window.__JS_VERSIONS__ || {};
        const { initI18n } = await import('../../assets/js/i18n.js' + (V.i18n ? '?v=' + V.i18n : ''));
        const { initNavigation, setCanvasRedrawCallback } = await import('../../assets/js/navigation.js' + (V.navigation ? '?v=' + V.navigation : ''));
        const testRunner = await import('../../assets/js/test-runner.js' + (V.testRunner ? '?v=' + V.testRunner : ''));

        async function main() {
            if (document.readyState === 'loading') {
                await new Promise(r => document.addEventListener('DOMContentLoaded', r));
            }
            await testRunner.ready;
            const runBtn = document.getElementById('runAllTestsButton');
            if (runBtn) runBtn.disabled = false;
            await initI18n();
            setCanvasRedrawCallback(() => {
                const testResults = document.getElementById('testResults');
                if (testResults && testResults.children.length > 0) {
                    testRunner.runAllTests();
                }
            });
            window.addEventListener('languageChange', () => {
                const testResults = document.getElementById('testResults');
                if (testResults && testResults.children.length > 0) {
                    testRunner.runAllTests();
                }
            });
            await initNavigation();
            testRunner.runAllTests();
        }
        main();
    </script>
</body>
</html>
