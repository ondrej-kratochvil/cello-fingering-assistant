<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cello App Kit – Nástroje pro violoncellisty</title>
    <meta name="description" content="Cello App Kit – odpočet, ladička, prstoklad, rytmy, smyky, metronom a seznam not. Sada nástrojů pro violoncellisty.">
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
$taglineKey = 'header.tagline';
$taglineFallback = 'Nástroje pro violoncellisty';
require __DIR__ . '/assets/partials/topbar.php';
require __DIR__ . '/assets/php/tools_config.php';
?>
        <main class="p-8 bg-white">
            <p class="text-slate-700 leading-relaxed mb-8" data-i18n="home.intro">
                Cello App Kit je sada nástrojů pro violoncellisty: odpočet na cvičení, ladička, prstoklad, rytmy, smyky, metronom a seznam not. Níže najdete přehled nástrojů v doporučeném pořadí.
            </p>

            <section id="aboutSection" class="mb-8">
                <button type="button" id="homeAboutToggle" class="flex items-center gap-2 text-left w-full text-lg font-bold text-slate-800 py-2 hover:text-indigo-600 transition-colors" aria-expanded="true" data-i18n-expanded="home.toggleAboutClose" data-i18n-collapsed="home.toggleAbout">
                    <span id="homeAboutToggleText" data-i18n="home.toggleAboutClose">Skrýt popis</span>
                    <svg id="homeAboutChevron" class="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div id="homeAboutContent" class="mt-4 space-y-6">
                    <h2 class="text-xl font-bold text-slate-800" data-i18n="home.aboutTitle">O aplikaci</h2>
                    <ul class="space-y-4 list-none pl-0">
<?php foreach ($TOOLS_ORDER as $num => $tool): ?>
                        <li class="border-l-4 border-indigo-200 pl-4 py-2">
                            <a href="<?= htmlspecialchars($tool['url'], ENT_QUOTES, 'UTF-8') ?>" class="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"><?= $num ?>. <span data-i18n="<?= $tool['navKey'] ?>"></span></a>
                            <p class="text-slate-600 text-sm mt-1" data-i18n="home.tool<?= $num ?>Desc"></p>
                        </li>
<?php endforeach; ?>
                    </ul>
                </div>
            </section>

            <div class="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-200">
                <a href="<?= $TOOLS_ORDER[1]['url'] ?>" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors" data-i18n="home.startPractice">Začít cvičit</a>
                <label class="sr-only" for="homeToolSelect" data-i18n="home.gotoToolPlaceholder">Přejít na jinou aplikaci</label>
                <select id="homeToolSelect" class="p-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 bg-white min-w-[200px]" aria-label="Přejít na jinou aplikaci">
                    <option value="" data-i18n="home.gotoToolPlaceholder">Přejít na jinou aplikaci</option>
<?php foreach ($TOOLS_ORDER as $num => $tool): ?>
                    <option value="<?= htmlspecialchars($tool['url'], ENT_QUOTES, 'UTF-8') ?>" data-num="<?= (int)$num ?>" data-nav-key="<?= htmlspecialchars($tool['navKey'], ENT_QUOTES, 'UTF-8') ?>"><?= $num ?>. </option>
<?php endforeach; ?>
                </select>
            </div>
        </main>
<?php require __DIR__ . '/assets/partials/footer.php'; ?>
    </div>
<?php
$jsDir = __DIR__ . '/assets/js';
$i18nDir = __DIR__ . '/assets/i18n';
$JS_VERSIONS = [ 'i18n' => filemtime($jsDir . '/i18n.js'), 'navigation' => filemtime($jsDir . '/navigation.js') ];
$I18N_VERSION = max(filemtime($i18nDir . '/cs.json'), filemtime($i18nDir . '/en.json'));
?>
    <script>window.__JS_VERSIONS__ = <?= json_encode($JS_VERSIONS) ?>; window.__I18N_VERSION__ = <?= (int) $I18N_VERSION ?>;</script>
    <script>window.__I18N_SCRIPT__ = new URL('./assets/js/i18n.js' + (window.__JS_VERSIONS__?.i18n ? '?v=' + window.__JS_VERSIONS__.i18n : ''), document.baseURI || window.location.href).href;</script>
    <script type="module">
        const V = window.__JS_VERSIONS__ || {};
        const { initI18n, t, applyTranslations } = await import(window.__I18N_SCRIPT__);
        const { initNavigation } = await import('./assets/js/navigation.js' + (V.navigation ? '?v=' + V.navigation : ''));
        if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r));
        await initI18n();
        await initNavigation();

        const toggle = document.getElementById('homeAboutToggle');
        const content = document.getElementById('homeAboutContent');
        const toggleText = document.getElementById('homeAboutToggleText');
        const chevron = document.getElementById('homeAboutChevron');
        if (toggle && content) {
            const keyExpanded = 'home.toggleAboutClose';
            const keyCollapsed = 'home.toggleAbout';
            toggle.addEventListener('click', () => {
                const isHidden = content.classList.toggle('hidden');
                toggle.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
                const key = isHidden ? keyCollapsed : keyExpanded;
                if (toggleText) {
                    toggleText.setAttribute('data-i18n', key);
                    toggleText.textContent = t(key);
                }
                if (chevron) chevron.style.transform = isHidden ? 'rotate(-90deg)' : '';
            });
        }

        function refreshHomeToolSelect() {
            const sel = document.getElementById('homeToolSelect');
            if (!sel) return;
            sel.querySelectorAll('option[data-nav-key]').forEach(opt => {
                opt.textContent = opt.getAttribute('data-num') + '. ' + t(opt.getAttribute('data-nav-key'));
            });
            const placeholder = sel.querySelector('option[value=""]');
            if (placeholder) placeholder.textContent = t('home.gotoToolPlaceholder');
        }
        const select = document.getElementById('homeToolSelect');
        if (select) {
            refreshHomeToolSelect();
            select.addEventListener('change', function() { const v = this.value; if (v) window.location.href = v; });
        }
        window.addEventListener('languageChange', () => {
            const content = document.getElementById('homeAboutContent');
            const toggleText = document.getElementById('homeAboutToggleText');
            if (content && toggleText) {
                const collapsed = content.classList.contains('hidden');
                const key = collapsed ? 'home.toggleAbout' : 'home.toggleAboutClose';
                toggleText.setAttribute('data-i18n', key);
                toggleText.textContent = t(key);
            }
            refreshHomeToolSelect();
        });
    </script>
</body>
</html>
