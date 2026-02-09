<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cello App Kit – Průvodce cvičením</title>
    <meta name="description" content="Cello App Kit – sada nástrojů pro violoncellisty. Průvodce krok za krokem pro cvičení.">
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
$taglineKey = 'guide.tagline';
$taglineFallback = 'Průvodce cvičením';
require __DIR__ . '/assets/partials/topbar.php';
?>
        <main class="p-8 bg-white">
            <section id="guideIntro" class="mb-8">
                <p class="text-slate-700 leading-relaxed" data-i18n="guide.intro">
                    Cello App Kit je sada miniaplikací pro violoncellisty: odpočet na cvičení, ladička, prstoklad, rytmy, smyky, metronom a seznam not. Níže postupujte krok za krokem – u každého kroku můžete přejít přímo k nástroji nebo pokračovat tlačítkem Další.
                </p>
            </section>

            <div id="guideSteps" class="space-y-0">
                <div class="guide-step hidden" data-step="1">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">1. <span data-i18n="guide.step1Title">Stanovit délku hraní</span></h2>
                    <p class="text-slate-600 mb-4" data-i18n="guide.step1Desc">Nastavte si minutku (odpočet), abyste věděli, kdy skončit s cvičením.</p>
                    <div class="flex flex-wrap gap-3">
                        <a href="index.php?step=2" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="guide.next">Další</a>
                        <a href="odpocet.php" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-xl" data-i18n="guide.goCountdown">Přejít k Odpočet</a>
                    </div>
                </div>
                <div class="guide-step hidden" data-step="2">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">2. <span data-i18n="guide.step2Title">Naladit</span></h2>
                    <p class="text-slate-600 mb-4" data-i18n="guide.step2Desc">Pomocí ladičky naladíte otevřené struny C, G, d, a.</p>
                    <div class="flex flex-wrap gap-3">
                        <a href="index.php?step=3" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="guide.next">Další</a>
                        <a href="ladicka.php" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-xl" data-i18n="guide.goTuner">Přejít k Ladička</a>
                    </div>
                </div>
                <div class="guide-step hidden" data-step="3">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">3. <span data-i18n="guide.step3Title">Vybrat noty</span></h2>
                    <p class="text-slate-600 mb-4" data-i18n="guide.step3Desc">Ze seznamu not si vyberte skladbu nebo stupnici, kterou chcete cvičit.</p>
                    <div class="flex flex-wrap gap-3">
                        <a href="index.php?step=4" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="guide.next">Další</a>
                        <a href="seznam-not.php" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-xl" data-i18n="guide.goSheets">Přejít k Seznam not</a>
                    </div>
                </div>
                <div class="guide-step hidden" data-step="4">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">4. <span data-i18n="guide.step4Title">Udělat prstoklad</span></h2>
                    <p class="text-slate-600 mb-4" data-i18n="guide.step4Desc">Zadejte tóny a nechte si doporučit prstoklad, případně ho upravte.</p>
                    <div class="flex flex-wrap gap-3">
                        <a href="index.php?step=5" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="guide.next">Další</a>
                        <a href="prstoklad.php" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-xl" data-i18n="guide.goFingering">Přejít k Prstoklad</a>
                    </div>
                </div>
                <div class="guide-step hidden" data-step="5">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">5. <span data-i18n="guide.step5Title">Zvolit rytmus</span></h2>
                    <p class="text-slate-600 mb-4" data-i18n="guide.step5Desc">Aplikujte na sekvenci rytmický pattern (čtvrťové, osminové noty).</p>
                    <div class="flex flex-wrap gap-3">
                        <a href="index.php?step=6" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="guide.next">Další</a>
                        <a href="rytmy.php" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-xl" data-i18n="guide.goRhythms">Přejít k Rytmy</a>
                    </div>
                </div>
                <div class="guide-step hidden" data-step="6">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">6. <span data-i18n="guide.step6Title">Zvolit smyk</span></h2>
                    <p class="text-slate-600 mb-4" data-i18n="guide.step6Desc">Aplikujte na sekvenci smykový pattern (legato, samostatně).</p>
                    <div class="flex flex-wrap gap-3">
                        <a href="index.php?step=7" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="guide.next">Další</a>
                        <a href="smyky.php" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-xl" data-i18n="guide.goBowing">Přejít k Smyky</a>
                    </div>
                </div>
                <div class="guide-step hidden" data-step="7">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">7. <span data-i18n="guide.step7Title">Pustit metronom</span></h2>
                    <p class="text-slate-600 mb-4" data-i18n="guide.step7Desc">Nastavte tempo a spusťte metronom před začátkem hraní.</p>
                    <div class="flex flex-wrap gap-3">
                        <a href="index.php?step=8" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="guide.next">Další</a>
                        <a href="metronom.php" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-xl" data-i18n="guide.goMetronome">Přejít k Metronom</a>
                    </div>
                </div>
                <div class="guide-step hidden" data-step="8">
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">8. <span data-i18n="guide.step8Title">Pustit minutku a cvičit do zvonění</span></h2>
                    <p class="text-slate-600 mb-4" data-i18n="guide.step8Desc">Spusťte odpočet a cvičte až do zazvonění.</p>
                    <div class="flex flex-wrap gap-3">
                        <a href="index.php?step=1" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl" data-i18n="guide.restart">Od začátku</a>
                        <a href="odpocet.php" class="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-xl" data-i18n="guide.goCountdown">Přejít k Odpočet</a>
                    </div>
                </div>
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
        const params = new URLSearchParams(window.location.search);
        const step = Math.max(1, Math.min(8, parseInt(params.get('step') || '1', 10) || 1));
        document.querySelectorAll('.guide-step').forEach(el => { el.classList.add('hidden'); });
        const stepEl = document.querySelector('.guide-step[data-step="' + step + '"]');
        if (stepEl) stepEl.classList.remove('hidden');
    </script>
</body>
</html>
