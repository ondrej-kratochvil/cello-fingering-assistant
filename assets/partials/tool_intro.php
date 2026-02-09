<?php
/**
 * Skrývatelný úvodní popis na stránce nástroje. Použití: nastavte $toolKey, $introKey a include.
 * Po první interakci (volání markToolUsed() z JS) se skryje a stav se uloží do localStorage.
 */
if (!isset($toolKey) || !isset($introKey)) return;
$tk = htmlspecialchars($toolKey, ENT_QUOTES, 'UTF-8');
$ik = htmlspecialchars($introKey, ENT_QUOTES, 'UTF-8');
?>
<section id="toolIntroSection" class="mb-6" data-tool-key="<?= $tk ?>" data-intro-key="<?= $ik ?>">
    <button type="button" id="toolIntroToggle" class="flex items-center gap-2 text-left w-full text-lg font-bold text-slate-800 py-2 hover:text-indigo-600 transition-colors" aria-expanded="true" data-i18n-expanded="tool.toggleAboutClose" data-i18n-collapsed="tool.toggleAbout">
        <span id="toolIntroToggleText" data-i18n="tool.toggleAboutClose">Skrýt popis</span>
        <svg id="toolIntroChevron" class="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
    </button>
    <div id="toolIntroContent" class="mt-4">
        <p class="text-slate-600" data-i18n="<?= $ik ?>"></p>
    </div>
</section>
