<?php declare(strict_types=1);
if (!isset($base)) $base = '';
?>
<footer class="app-footer bg-slate-100 border-t border-slate-200 py-6 text-center text-sm text-slate-600">
    <p>© <?= date('Y') ?> <a href="https://www.sensio.cz" class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">Sensio.cz s.r.o.</a> <span class="mx-2" aria-hidden="true">|</span> <a href="<?= htmlspecialchars($base, ENT_QUOTES, 'UTF-8') ?>accessibility.php" class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors" data-i18n="nav.accessibility">Přístupnost</a></p>
</footer>
