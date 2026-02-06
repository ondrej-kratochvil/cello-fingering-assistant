<?php declare(strict_types=1); ?>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- SEO Meta Tags -->
    <title>Cello Fingering Assistant - Nástroj pro optimální prstoklad violoncella</title>
    <meta name="description" content="Aplikace pro nalezení optimálního prstokladu pro violoncello pomocí pokročilého algoritmu. Zadejte sekvenci tónů a získejte doporučený prstoklad s vizualizací hmatníku.">
    <meta name="keywords" content="violoncello, cello, prstoklad, fingering, hmatník, hudební nástroj, violoncellová technika">
    <meta name="author" content="Sensio.cz s.r.o.">
    <meta name="robots" content="index, follow">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Cello Fingering Assistant - Nástroj pro optimální prstoklad violoncella">
    <meta property="og:description" content="Aplikace pro nalezení optimálního prstokladu pro violoncello pomocí pokročilého algoritmu.">
    <meta property="og:locale" content="cs_CZ">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Cello Fingering Assistant">
    <meta name="twitter:description" content="Aplikace pro nalezení optimálního prstokladu pro violoncello pomocí pokročilého algoritmu.">

    <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
    <link rel="stylesheet" href="assets/css/main.css?v=<?= filemtime(__DIR__ . '/assets/css/main.css') ?>">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 p-4 md:p-8 font-sans text-slate-900">

    <div class="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
<?php
$base = '';
$pageTitle = 'Cello Fingering Assistant';
$pageTitleKey = 'header.pageTitle';
$taglineKey = 'header.tagline';
$taglineFallback = 'Pro zadané tóny doporučí vhodný prstoklad';
require __DIR__ . '/assets/partials/topbar.php';
?>
        <!-- Homepage Content -->
        <main class="p-8 bg-white">
            <!-- Hlavička sekce O aplikaci - skrývatelná s obsahem -->
            <div id="aboutHeader" class="mb-4">
                <h2 class="text-2xl font-bold text-slate-800" data-i18n="about.title">O aplikaci</h2>
            </div>

            <!-- Obsah sekce O aplikaci - skrývatelný -->
            <section id="aboutSection" class="mb-8">
                <div id="aboutContent" class="space-y-4">
                    <p class="text-slate-700 leading-relaxed" data-i18n="about.p1" data-i18n-html>
                        <strong>Cello Fingering Assistant</strong> je klientská webová aplikace pro návrh optimálního prstokladu pro violoncello.
                        Aplikace využívá pokročilý algoritmus založený na dynamickém programování, který analyzuje sekvenci tónů
                        a doporučuje nejvhodnější prstoklad s ohledem na polohovou stabilitu, minimalizaci posunů a efektivní využití hmatníku.
                    </p>
                    <p class="text-slate-700 leading-relaxed" data-i18n="about.p2" data-i18n-html>
                        Algoritmus upřednostňuje zůstat v jedné poloze, minimalizuje počet posunů mezi polohami a preferuje nižší polohy.
                        Podporuje enharmonické záměny pro správné zpracování všech stupnic.
                        Formát výstupu (notová osnova / text) se mění v sekci <strong>Nastavení</strong> pod výsledky.
                    </p>
                </div>
            </section>

            <section id="featuresSection" class="mb-8">
                <h2 class="text-2xl font-bold text-slate-800 mb-4" data-i18n="features.title">Hlavní funkce</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="p-6 bg-indigo-50 rounded-xl border border-indigo-100">
                        <h3 class="text-lg font-bold text-indigo-900 mb-2" data-i18n="features.algo.title">🎯 Inteligentní algoritmus</h3>
                        <p class="text-slate-700 text-sm" data-i18n="features.algo.desc" data-i18n-html>
                            Pokročilý algoritmus založený na metodice, který optimalizuje prstoklad s ohledem na polohovou stabilitu,
                            minimalizaci posunů a preferenci nižších poloh.
                        </p>
                    </div>
                    <div class="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                        <h3 class="text-lg font-bold text-emerald-900 mb-2" data-i18n="features.staff.title">🎵 Notová osnova a textový výstup</h3>
                        <p class="text-slate-700 text-sm" data-i18n="features.staff.desc" data-i18n-html>
                            Volitelný výstup: <strong>notová osnova</strong> (VexFlow, basový klíč, celé noty, polohy nad notami, prsty a tóny jako anotace, barevné struny)
                            nebo <strong>textový výstup</strong> (polohy, prsty, tóny). Přepínání v Nastavení. Horizontální scroll na menších displejích.
                        </p>
                    </div>
                    <div class="p-6 bg-amber-50 rounded-xl border border-amber-100">
                        <h3 class="text-lg font-bold text-amber-900 mb-2" data-i18n="features.fingerboard.title">🎨 Vizuální hmatník</h3>
                        <p class="text-slate-700 text-sm" data-i18n="features.fingerboard.desc" data-i18n-html>
                            Realistická vizualizace hmatníku na Canvas s <strong>černým pozadím</strong> (ve světlém i tmavém režimu),
                            která zobrazuje doporučený prstoklad s barevným rozlišením strun a propojením pohybu ruky.
                            Rozestupy mezi polohami jsou <strong>proporční</strong> (menší směrem k mostku), odpovídají skutečným vzdálenostem na violoncelle.
                            Responzivní s horizontálním posuvem.
                        </p>
                    </div>
                    <div class="p-6 bg-purple-50 rounded-xl border border-purple-100">
                        <h3 class="text-lg font-bold text-purple-900 mb-2" data-i18n="features.tech.title">⚙️ Technické vychytávky</h3>
                        <p class="text-slate-700 text-sm" data-i18n="features.tech.desc" data-i18n-html>
                            Světlé/tmavé téma (dle nastavení zařízení nebo manuálně v menu), vícejazyčnost (menu – vlajky), označení H/B v Nastavení. Testovací stránka pro ověření algoritmu. V patičce najdete odkaz na Prohlášení o přístupnosti a popis klávesových zkratek (např. Enter v poli pro tóny spustí návrh prstokladu).
                        </p>
                    </div>
                </div>
            </section>

            <section id="tonesSection" class="mb-8">
                <h2 class="text-2xl font-bold text-slate-800 mb-4" data-i18n="tones.title">Tóny, prsty a polohy</h2>
                <p class="text-slate-700 mb-4" data-i18n="tones.intro">
                    Převodní tabulka označení poloh: diatonické (I, II↓, …) versus chromatické (I–XII, římsky).
                    Tón uvádí nota na struně A s 1. prstem v dané poloze.
                </p>
                <div class="overflow-x-auto rounded-xl border border-slate-200">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-100 text-slate-700 font-bold">
                            <tr>
                                <th class="px-4 py-3 rounded-tl-xl" data-i18n="tones.thDiatonic">Diatonicky</th>
                                <th class="px-4 py-3" data-i18n="tones.thAbbr">Zkratka</th>
                                <th class="px-4 py-3" data-i18n="tones.thChromatic">Chromaticky</th>
                                <th class="px-4 py-3 rounded-tr-xl" data-i18n="tones.thTone">Tón (struna A, 1. prst)</th>
                            </tr>
                        </thead>
                        <tbody class="text-slate-600 divide-y divide-slate-200">
                            <tr><td class="px-4 py-2" data-i18n="tones.row1">Půltónová (Snížená I)</td><td class="px-4 py-2 font-mono">I↓</td><td class="px-4 py-2 font-mono">I</td><td class="px-4 py-2">Hes / B</td></tr>
                            <tr><td class="px-4 py-2" data-i18n="tones.row2">I poloha</td><td class="px-4 py-2 font-mono">I</td><td class="px-4 py-2 font-mono">II</td><td class="px-4 py-2">H</td></tr>
                            <tr><td class="px-4 py-2" data-i18n="tones.row3">II poloha nízká</td><td class="px-4 py-2 font-mono">II↓</td><td class="px-4 py-2 font-mono">III</td><td class="px-4 py-2">C</td></tr>
                            <tr><td class="px-4 py-2" data-i18n="tones.row4">II poloha vysoká</td><td class="px-4 py-2 font-mono">II↑</td><td class="px-4 py-2 font-mono">IV</td><td class="px-4 py-2">Cis / Des</td></tr>
                            <tr><td class="px-4 py-2" data-i18n="tones.row5">III poloha</td><td class="px-4 py-2 font-mono">III</td><td class="px-4 py-2 font-mono">V</td><td class="px-4 py-2">D</td></tr>
                            <tr><td class="px-4 py-2" data-i18n="tones.row6">III poloha vysoká</td><td class="px-4 py-2 font-mono">III↑</td><td class="px-4 py-2 font-mono">VI</td><td class="px-4 py-2">Dis / Es</td></tr>
                            <tr><td class="px-4 py-2" data-i18n="tones.row7">IV poloha</td><td class="px-4 py-2 font-mono">IV</td><td class="px-4 py-2 font-mono">VII</td><td class="px-4 py-2">E</td></tr>
                            <tr><td class="px-4 py-2" data-i18n="tones.row8">IV poloha vysoká</td><td class="px-4 py-2 font-mono">IV↑</td><td class="px-4 py-2 font-mono">VIII</td><td class="px-4 py-2">F</td></tr>
                            <tr><td class="px-4 py-2" data-i18n="tones.row9">V poloha</td><td class="px-4 py-2 font-mono">V</td><td class="px-4 py-2 font-mono">IX</td><td class="px-4 py-2">Fis / Ges</td></tr>
                            <tr><td class="px-4 py-2" data-i18n="tones.row10">VI poloha</td><td class="px-4 py-2 font-mono">VI</td><td class="px-4 py-2 font-mono">X</td><td class="px-4 py-2">G</td></tr>
                            <tr><td class="px-4 py-2" data-i18n="tones.row11">VII poloha nízká</td><td class="px-4 py-2 font-mono">VII↓</td><td class="px-4 py-2 font-mono">XI</td><td class="px-4 py-2">Gis / As</td></tr>
                            <tr><td class="px-4 py-2" data-i18n="tones.row12">VII poloha</td><td class="px-4 py-2 font-mono">VII</td><td class="px-4 py-2 font-mono">XII</td><td class="px-4 py-2">A (oktáva)</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </main>

        <div class="p-8 border-b border-slate-100 bg-slate-50">
            <label for="melodyInput" class="block text-sm font-bold text-slate-700 mb-2 tracking-wider" data-i18n="input.label">
                Zadejte tóny včetně rozlišení oktáv a posuvek oddělené mezerami, např. C c c1 c1# gb
            </label>
            <div class="space-y-4">
                <div class="flex-1 relative">
                    <input type="text" id="melodyInput"
                           class="w-full p-4 pr-12 text-xl border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all font-mono shadow-inner"
                           value="C D E F G A H c d e f g a h c1 d1 e1 f1 g1 a1 h1 c2">
                    <button type="button" id="clearInputButton"
                            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                            aria-label="Vymazat vstup" data-i18n-aria-label="aria.clearInput">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <button id="solveButton"
                            class="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95"
                            data-i18n="button.solve"
                            data-i18n-title="aria.solveShortcut">
                        Navrhnout prstoklad
                    </button>
                    <button id="editFingeringButton" type="button"
                            class="bg-slate-700 hover:bg-slate-800 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95"
                            data-i18n="button.editStart">
                        Editovat prstoklad
                    </button>
                    <button id="saveTestButton" type="button"
                            class="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95"
                            data-i18n="button.saveTest">
                        Uložit jako test
                    </button>
                    <button id="settingsToggle" type="button"
                            class="bg-white hover:bg-slate-100 text-slate-700 font-black py-4 px-10 rounded-2xl transition-all shadow-lg border border-slate-200 active:scale-95"
                            data-i18n="button.settingsOpen" aria-expanded="false">
                        Nastavení
                    </button>
                </div>
                <div id="settingsSection" class="mt-2">
                    <div id="settingsContent" class="hidden space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <div>
                            <span class="block text-sm font-bold text-slate-700 mb-2" data-i18n="settings.outputFormat">Formát výstupu:</span>
                            <div class="space-y-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="outputFormat" value="staff" checked class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.outputStaff">Notová osnova</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="outputFormat" value="text" class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.outputText">Textový výstup</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <span class="block text-sm font-bold text-slate-700 mb-2" data-i18n="settings.positionLabel">Označení poloh:</span>
                            <div class="space-y-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="positionLabel" value="diatonic" checked class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.positionDiatonic">Diatonické (I, II↓, II↑, …)</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="positionLabel" value="chromatic" class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.positionChromatic">Chromatické (I–XII)</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <span class="block text-sm font-bold text-slate-700 mb-2" data-i18n="settings.noteNaming">Označení tónu H/B:</span>
                            <div class="space-y-2">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="noteNaming" value="H" checked class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.noteH">H (Hes)</span>
                                </label>
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="noteNaming" value="B" class="w-4 h-4 text-indigo-600">
                                    <span data-i18n="settings.noteB">B (Bb)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="resultsWrapper" class="p-8 hidden">
            <div class="overflow-x-auto -mx-8 px-8 md:mx-0 md:px-0">
                <div id="pathDisplay" class="flex flex-nowrap md:flex-wrap justify-center md:justify-start gap-4 min-w-max md:min-w-0"></div>
            </div>

            <div class="overflow-x-auto -mx-8 px-8 md:mx-0 md:px-0 mt-10">
                <canvas id="fretboardCanvas" width="1000" height="400" class="border border-slate-300 rounded-lg"></canvas>
            </div>
        </div>

        <div class="p-8 bg-white border-t border-slate-100 text-center">
            <button id="toggleJsonButton" class="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors" data-i18n="button.jsonShow">
                Zobrazit JSON Model
            </button>
            <div id="jsonContainer" class="hidden mt-4 bg-slate-900 rounded-2xl p-6 text-left overflow-hidden">
                <pre id="jsonDisplay" class="text-emerald-400 text-xs overflow-auto max-h-[300px]"></pre>
            </div>
        </div>

<?php require __DIR__ . '/assets/partials/footer.php'; ?>
    </div>

<?php
$jsDir = __DIR__ . '/assets/js';
$JS_VERSIONS = [
    'i18n' => filemtime($jsDir . '/i18n.js'),
    'navigation' => filemtime($jsDir . '/navigation.js'),
    'fingering' => filemtime($jsDir . '/fingering.js'),
    'tests' => filemtime($jsDir . '/tests.js'),
    'ui' => filemtime($jsDir . '/ui.js'),
    'testRunner' => filemtime($jsDir . '/test-runner.js'),
];
?>
    <script>window.__JS_VERSIONS__ = <?= json_encode($JS_VERSIONS) ?>;</script>
    <script src="https://cdn.jsdelivr.net/npm/vexflow@4.2.5/build/cjs/vexflow.min.js"></script>
    <script type="module">
        const V = window.__JS_VERSIONS__ || {};

        const { initI18n } = await import('./assets/js/i18n.js' + (V.i18n ? '?v=' + V.i18n : ''));
        const { initNavigation, setCanvasRedrawCallback } = await import('./assets/js/navigation.js' + (V.navigation ? '?v=' + V.navigation : ''));
        const ui = await import('./assets/js/ui.js' + (V.ui ? '?v=' + V.ui : ''));

        async function main() {
            if (document.readyState === 'loading') {
                await new Promise(r => document.addEventListener('DOMContentLoaded', r));
            }
            await ui.ready;
            await initI18n();
            setCanvasRedrawCallback(() => {
                if (typeof window.redrawResults === 'function') window.redrawResults();
            });
            await initNavigation();
            ui.initUI();
        }
        main();
    </script>
</body>
</html>
