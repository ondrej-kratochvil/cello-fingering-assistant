<?php
if (!isset($base)) $base = '';
if (!isset($pageTitle)) $pageTitle = 'Cello Fingering Assistant';
if (!isset($taglineKey)) $taglineKey = 'header.tagline';
if (!isset($taglineFallback)) $taglineFallback = '';
$b = htmlspecialchars($base, ENT_QUOTES, 'UTF-8');
$t = htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8');
$tk = htmlspecialchars($taglineKey, ENT_QUOTES, 'UTF-8');
$tf = htmlspecialchars($taglineFallback, ENT_QUOTES, 'UTF-8');
?>
<header class="app-header bg-indigo-950 p-8 text-white relative">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <a href="<?= $b ?>index.php" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="<?= $b ?>assets/img/logo.svg" alt="Cello Fingering Assistant Logo" class="w-12 h-12">
            <h1 id="pageTitle" class="text-3xl font-black tracking-tight italic"><?= $t ?></h1>
        </a>
        <button type="button" id="menuToggle" class="md:hidden text-indigo-200 hover:text-white transition-colors touch-target relative z-50" aria-label="Otevřít menu" data-i18n-aria-label="aria.menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </button>
        <nav id="mainNav" class="main-nav md:ml-auto" aria-label="Hlavní">
            <a href="<?= $b ?>index.php" class="nav-link text-indigo-200 hover:text-white font-medium transition-colors" data-i18n="nav.home">Home</a>
            <a href="<?= $b ?>dev/tests/test.php" class="nav-link text-indigo-200 hover:text-white font-medium transition-colors" data-i18n="nav.tests">Testy</a>
            <a href="<?= $b ?>index.php" id="menuAboutLink" class="nav-link text-indigo-200 hover:text-white font-medium transition-colors" data-i18n="nav.about">O aplikaci</a>
            <button type="button" class="dark-mode-toggle text-indigo-200 hover:text-white transition-colors touch-target p-1 nav-link" aria-label="Přepnout Dark Mode" data-i18n-aria-label="aria.darkMode">
                <svg class="dark-mode-icon w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
            </button>
            <span class="flex items-center gap-1">
                <button type="button" class="lang-flag text-xl leading-none p-0.5 rounded hover:opacity-80 transition-opacity" data-lang="cs" aria-label="Čeština" data-i18n-aria-label="aria.langCs">🇨🇿</button>
                <button type="button" class="lang-flag text-xl leading-none p-0.5 rounded hover:opacity-80 transition-opacity" data-lang="en" aria-label="English" data-i18n-aria-label="aria.langEn">🇬🇧</button>
            </span>
        </nav>
    </div>
    <p id="pageTagline" class="text-indigo-300 font-medium mt-2 text-xs tracking-widest" data-i18n="<?= $tk ?>"><?= $tf ?></p>
</header>
