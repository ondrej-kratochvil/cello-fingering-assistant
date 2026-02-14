<?php
/**
 * Skrývatelný úvodní popis na stránce nástroje. Použití: nastavte $toolKey, $introKey a include.
 * Volitelně $toolTitleKey – pak se vykreslí h2 a tlačítko v jednom řádku (nadpis vlevo, Skrýt popis vpravo).
 * Po první interakci (volání markToolUsed() z JS) se skryje a stav se uloží do localStorage.
 */
if (!isset($toolKey) || !isset($introKey)) return;
$tk = htmlspecialchars($toolKey, ENT_QUOTES, 'UTF-8');
$ik = htmlspecialchars($introKey, ENT_QUOTES, 'UTF-8');
$ttk = isset($toolTitleKey) ? htmlspecialchars($toolTitleKey, ENT_QUOTES, 'UTF-8') : '';
?>
<section id="toolIntroSection" class="mb-6" data-tool-key="<?= $tk ?>" data-intro-key="<?= $ik ?>" data-tool-title-key="<?= $ttk ?>">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-2">
        <?php if ($ttk): ?>
            <h2 class="text-2xl font-bold text-slate-800" data-i18n="<?= $ttk ?>"></h2>
        <?php endif; ?>
        <button type="button" id="toolIntroToggle" class="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors text-sm font-medium <?= $ttk ? 'ml-auto' : '' ?>" aria-expanded="true" data-i18n-expanded="tool.toggleAboutClose" data-i18n-collapsed="tool.toggleAbout">
            <span id="toolIntroToggleText" data-i18n="tool.toggleAboutClose">Skrýt popis</span>
            <svg id="toolIntroChevron" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
    </div>
    <div id="toolIntroContent" class="mt-4">
        <p class="text-slate-600" data-i18n="<?= $ik ?>"></p>
    </div>
</section>
