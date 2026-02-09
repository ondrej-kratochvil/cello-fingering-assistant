<?php
/**
 * Pořadí nástrojů Cello App Kit (1–7). Použito v menu, homepage a pro tlačítko Další.
 * Prstoklad má submenu Testy (hover).
 */
if (!isset($base)) $base = '';
$b = htmlspecialchars($base, ENT_QUOTES, 'UTF-8');

$TOOLS_ORDER = [
    1 => [ 'url' => $b . 'odpocet.php',     'key' => 'countdown', 'navKey' => 'nav.countdown' ],
    2 => [ 'url' => $b . 'ladicka.php',     'key' => 'tuner',     'navKey' => 'nav.tuner' ],
    3 => [ 'url' => $b . 'seznam-not.php',  'key' => 'sheetList', 'navKey' => 'nav.sheetList' ],
    4 => [ 'url' => $b . 'prstoklad.php',   'key' => 'fingering', 'navKey' => 'nav.fingering', 'submenu' => [
        [ 'url' => $b . 'dev/tests/test.php', 'navKey' => 'nav.tests' ],
    ]],
    5 => [ 'url' => $b . 'rytmy.php',       'key' => 'rhythms',   'navKey' => 'nav.rhythms' ],
    6 => [ 'url' => $b . 'smyky.php',       'key' => 'bowing',    'navKey' => 'nav.bowing' ],
    7 => [ 'url' => $b . 'metronom.php',    'key' => 'metronome', 'navKey' => 'nav.metronome' ],
];
