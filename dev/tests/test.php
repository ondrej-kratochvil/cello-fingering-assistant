<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Testovací stránka pro ověření správnosti algoritmu prstokladu violoncella.">
    <title>Testy - Cello Fingering Assistant</title>
    <link rel="icon" type="image/svg+xml" href="../../assets/img/favicon.svg">
    <link rel="stylesheet" href="../../assets/css/main.css">
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

            <button onclick="runAllTests()"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95 mb-6"
                    data-i18n="test.runAll">
                Spustit všechny testy
            </button>

            <div id="testResults" class="space-y-4"></div>
        </main>

<?php require __DIR__ . '/../../assets/partials/footer.php'; ?>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/vexflow@4.2.5/build/cjs/vexflow.min.js"></script>
    <script type="module">
        import { initI18n } from '../../assets/js/i18n.js';
        import { initNavigation, setCanvasRedrawCallback } from '../../assets/js/navigation.js';
        import { runAllTests } from '../../assets/js/test-runner.js';

        async function main() {
            if (document.readyState === 'loading') {
                await new Promise(r => document.addEventListener('DOMContentLoaded', r));
            }
            await initI18n();
            // Překreslit osnovy při změně dark mode
            setCanvasRedrawCallback(() => {
                // Překreslit všechny testy při změně dark mode
                const testResults = document.getElementById('testResults');
                if (testResults && testResults.children.length > 0) {
                    runAllTests();
                }
            });
            // Překreslit testy při změně jazyka
            window.addEventListener('languageChange', () => {
                const testResults = document.getElementById('testResults');
                if (testResults && testResults.children.length > 0) {
                    runAllTests();
                }
            });
            await initNavigation();
            runAllTests();
        }
        main();
    </script>
</body>
</html>
