<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cello App Kit – Metronom</title>
    <meta name="description" content="Metronom s nastavitelným tempem a důrazem na první dobu.">
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
$taglineKey = 'metronome.tagline';
$taglineFallback = 'Metronom';
require __DIR__ . '/assets/partials/topbar.php';
require __DIR__ . '/assets/php/tools_config.php';
$currentToolKey = 'metronome';
$toolKey = 'metronome';
$introKey = 'metronome.intro';
$toolTitleKey = 'metronome.title';
?>
        <main class="p-8 bg-white">
<?php require __DIR__ . '/assets/partials/tool_intro.php'; ?>

            <div class="max-w-md space-y-6">
                <div>
                    <label for="metronomeBpm" class="block text-sm font-bold text-slate-700 mb-2" data-i18n="metronome.bpm">Tempo (BPM):</label>
                    <input type="number" id="metronomeBpm" min="40" max="240" value="72" class="w-full p-3 border-2 border-slate-200 rounded-xl font-mono text-xl">
                    <input type="range" id="metronomeBpmRange" min="40" max="240" value="72" class="w-full mt-2 h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-indigo-600">
                </div>
                <div>
                    <span class="block text-sm font-bold text-slate-700 mb-2" data-i18n="metronome.beats">Počet dob v taktu:</span>
                    <div class="flex flex-wrap gap-3">
                        <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="metronomeBeats" value="0" checked class="w-4 h-4 text-indigo-600"> <span data-i18n="metronome.noAccent">Bez zvýraznění</span></label>
                        <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="metronomeBeats" value="2" class="w-4 h-4 text-indigo-600"> 2</label>
                        <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="metronomeBeats" value="3" class="w-4 h-4 text-indigo-600"> 3</label>
                        <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="metronomeBeats" value="4" class="w-4 h-4 text-indigo-600"> 4</label>
                        <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="metronomeBeats" value="6" class="w-4 h-4 text-indigo-600"> 6</label>
                    </div>
                </div>
                <div class="flex gap-4">
                    <button type="button" id="metronomePlayStop" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2" data-i18n-aria-label="metronome.startStop" aria-label="" data-state="stopped">
                        <svg class="metronome-icon-play w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                        <svg class="metronome-icon-stop w-6 h-6 hidden" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12v12H6z"/></svg>
                        <span class="metronome-btn-text" data-i18n="metronome.start">Start</span>
                    </button>
                </div>
                <div id="metronomeBeat" class="flex justify-center gap-2 min-h-[3rem] items-center" aria-live="polite" role="status"></div>
            </div>
            <div id="metronomeSequenceSection" class="mt-8 max-w-2xl hidden">
                <h3 class="text-lg font-bold text-slate-800 mb-4" data-i18n="metronome.sequenceTitle">Notová sekvence</h3>
                <div id="metronomeStaff" class="staff-output rounded-lg overflow-x-auto"></div>
            </div>
<?php require __DIR__ . '/assets/partials/tool_next_bar.php'; ?>
        </main>
<?php require __DIR__ . '/assets/partials/footer.php'; ?>
    </div>
<?php
$jsDir = __DIR__ . '/assets/js';
$i18nDir = __DIR__ . '/assets/i18n';
$JS_VERSIONS = [ 'i18n' => filemtime($jsDir . '/i18n.js'), 'navigation' => filemtime($jsDir . '/navigation.js'), 'toolPage' => filemtime($jsDir . '/tool-page.js'), 'metronome' => filemtime($jsDir . '/metronome.js'), 'countdown' => filemtime($jsDir . '/countdown.js') ];
$I18N_VERSION = max(filemtime($i18nDir . '/cs.json'), filemtime($i18nDir . '/en.json'));
?>
    <script src="https://cdn.jsdelivr.net/npm/vexflow@4.2.5/build/cjs/vexflow.min.js"></script>
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
        await import('./assets/js/metronome.js' + (V.metronome ? '?v=' + V.metronome : ''));
    </script>
</body>
</html>
