<?php declare(strict_types=1);
$base = '';
$pageTitle = 'Přístupnost';
$pageTitleKey = 'accessibility.pageTitle';
$taglineKey = 'accessibility.tagline';
$taglineFallback = 'Prohlášení o přístupnosti a klávesové zkratky';
?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Prohlášení o přístupnosti aplikace Cello Fingering Assistant – úroveň souladu, kontakt, klávesové zkratky.">
    <title>Přístupnost - Cello Fingering Assistant</title>
    <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
    <link rel="stylesheet" href="assets/css/main.css?v=<?= filemtime(__DIR__ . '/assets/css/main.css') ?>">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 p-4 md:p-8 font-sans text-slate-900">
    <div class="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
<?php require __DIR__ . '/assets/partials/topbar.php'; ?>

        <main class="p-8 bg-white">
            <h1 class="text-2xl font-bold text-slate-800 mb-6" data-i18n="accessibility.pageTitle">Prohlášení o přístupnosti</h1>

            <section class="space-y-4 text-slate-700 leading-relaxed mb-8">
                <p data-i18n="accessibility.intro" data-i18n-html>Aplikace Cello Fingering Assistant se snaží být přístupná v souladu s požadavky na přístupnost webového obsahu.</p>
                <p data-i18n="accessibility.compliance" data-i18n-html>Úroveň souladu: Částečně v souladu s WCAG 2.1 (úroveň AA) – sémantické HTML, kontrast, popisky formulářů a tlačítek, podpora klávesnice. Některé interaktivní prvky (např. vizualizace hmatníku) mohou být plně využitelné především s myší nebo dotykem.</p>
                <p data-i18n="accessibility.contact" data-i18n-html>Kontakt pro připomínky k přístupnosti: Sensio.cz s.r.o., https://www.sensio.cz/</p>
                <p data-i18n="accessibility.revised">Datum poslední revize: únor 2026</p>
            </section>

            <section class="mb-8">
                <h2 class="text-xl font-bold text-slate-800 mb-3" data-i18n="accessibility.shortcutsTitle">Klávesové zkratky</h2>
                <ul class="list-disc list-inside space-y-2 text-slate-700">
                    <li data-i18n="accessibility.shortcutEnter">Enter – v poli pro zadání tónů spustí návrh prstokladu (tlačítko „Navrhnout prstoklad“)</li>
                    <li data-i18n="accessibility.shortcutEscape">Escape – zavře otevřený dialog (modal)</li>
                </ul>
            </section>
        </main>

<?php require __DIR__ . '/assets/partials/footer.php'; ?>
    </div>

<?php
$jsDir = __DIR__ . '/assets/js';
$i18nDir = __DIR__ . '/assets/i18n';
$JS_VERSIONS = [
    'i18n' => filemtime($jsDir . '/i18n.js'),
    'navigation' => filemtime($jsDir . '/navigation.js'),
];
$I18N_VERSION = max(filemtime($i18nDir . '/cs.json'), filemtime($i18nDir . '/en.json'));
?>
    <script>window.__JS_VERSIONS__ = <?= json_encode($JS_VERSIONS) ?>; window.__I18N_VERSION__ = <?= (int) $I18N_VERSION ?>;</script>
    <script>window.__I18N_SCRIPT__ = './assets/js/i18n.js' + (window.__JS_VERSIONS__ && window.__JS_VERSIONS__.i18n != null ? '?v=' + window.__JS_VERSIONS__.i18n : '');</script>
    <script type="module">
        const V = window.__JS_VERSIONS__ || {};
        const { initI18n } = await import(window.__I18N_SCRIPT__);
        const { initNavigation } = await import('./assets/js/navigation.js' + (V.navigation != null ? '?v=' + V.navigation : ''));

        async function main() {
            if (document.readyState === 'loading') {
                await new Promise(r => document.addEventListener('DOMContentLoaded', r));
            }
            await initI18n();
            await initNavigation();
        }
        main();
    </script>
</body>
</html>
