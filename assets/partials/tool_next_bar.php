<?php
/**
 * Tlačítko Další / Nové cvičení a rozbalovací seznam nástrojů. Vyžaduje $TOOLS_ORDER a $currentToolKey.
 * $isLastTool = true na metronomu (zobrazí "Nové cvičení" a odkaz na odpočet).
 */
if (!isset($TOOLS_ORDER) || !isset($currentToolKey)) return;
$currentNum = null;
foreach ($TOOLS_ORDER as $num => $tool) {
    if ($tool['key'] === $currentToolKey) { $currentNum = (int)$num; break; }
}
$nextNum = $currentNum !== null ? $currentNum + 1 : null;
$nextUrl = ($nextNum !== null && isset($TOOLS_ORDER[$nextNum])) ? $TOOLS_ORDER[$nextNum]['url'] : ($TOOLS_ORDER[1]['url'] ?? 'odpocet.php');
$isLastTool = $currentNum === 7;
$nextLinkUrl = $isLastTool ? ($TOOLS_ORDER[1]['url'] ?? 'odpocet.php') : $nextUrl;
$nextBtnKey = $isLastTool ? 'home.newPractice' : 'home.nextTool';
?>
<div class="flex flex-wrap items-center gap-4 pt-6 mt-8 border-t border-slate-200">
    <a href="<?= htmlspecialchars($nextLinkUrl, ENT_QUOTES, 'UTF-8') ?>" id="toolNextLink" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors" data-i18n="<?= $nextBtnKey ?>"><?= $isLastTool ? 'Nové cvičení' : 'Další' ?></a>
    <label class="sr-only" for="toolSelect">Přejít na jinou aplikaci</label>
    <select id="toolSelect" class="p-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 bg-white min-w-[200px]" aria-label="Přejít na jinou aplikaci">
        <option value="" data-i18n="home.gotoToolPlaceholder">Přejít na jinou aplikaci</option>
<?php foreach ($TOOLS_ORDER as $num => $tool): ?>
        <option value="<?= htmlspecialchars($tool['url'], ENT_QUOTES, 'UTF-8') ?>" data-num="<?= (int)$num ?>" data-nav-key="<?= htmlspecialchars($tool['navKey'], ENT_QUOTES, 'UTF-8') ?>"><?= $num ?>. </option>
<?php endforeach; ?>
    </select>
</div>
