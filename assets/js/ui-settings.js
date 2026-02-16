/**
 * Nastavení a přepínače – outputFormat, positionLabelMode, noteNaming.
 * @param {Object} deps - { state, runSolver, setEditMode, t, getNoteNaming, setNoteNaming }
 */
export function initSettings(deps) {
    const { state, runSolver, setEditMode, t, getNoteNaming, setNoteNaming } = deps;

    const settingsSection = document.getElementById('settingsSection');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsContent = document.getElementById('settingsContent');

    if (!settingsSection || !settingsToggle || !settingsContent) return;

    const syncSettingsToggleLabel = () => {
        const isHidden = settingsContent.classList.contains('hidden');
        settingsToggle.textContent = isHidden ? t('button.settingsOpen') : t('button.settingsClose');
        settingsToggle.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
    };
    settingsToggle.addEventListener('click', () => {
        settingsContent.classList.toggle('hidden');
        syncSettingsToggleLabel();
    });
    syncSettingsToggleLabel();
    window.addEventListener('languageChange', syncSettingsToggleLabel);

    const radioButtons = document.querySelectorAll('input[name="outputFormat"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.currentOutputFormat = e.target.value;
            if (state.currentOutputFormat !== 'staff') setEditMode(false);
            if (state.lastResult && state.lastInputForSolve) runSolver({ skipHideAbout: true, preserveState: true });
        });
    });
    const defaultFormat = document.querySelector('input[name="outputFormat"][value="staff"]');
    if (defaultFormat) { defaultFormat.checked = true; state.currentOutputFormat = 'staff'; }

    const savedLabel = localStorage.getItem('positionLabelMode');
    if (savedLabel === 'chromatic' || savedLabel === 'diatonic') {
        state.currentPositionLabelMode = savedLabel;
        const radio = document.querySelector(`input[name="positionLabel"][value="${savedLabel}"]`);
        if (radio) radio.checked = true;
    }
    const positionLabelRadios = document.querySelectorAll('input[name="positionLabel"]');
    positionLabelRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.currentPositionLabelMode = e.target.value;
            localStorage.setItem('positionLabelMode', state.currentPositionLabelMode);
            if (state.lastResult && state.lastInputForSolve) runSolver({ skipHideAbout: true, preserveState: true });
        });
    });

    const naming = getNoteNaming();
    const namingRadio = document.querySelector(`input[name="noteNaming"][value="${naming}"]`);
    if (namingRadio) namingRadio.checked = true;
    document.querySelectorAll('input[name="noteNaming"]').forEach((radio) => {
        radio.addEventListener('change', (e) => {
            setNoteNaming(e.target.value === 'B' ? 'B' : 'H');
            if (state.lastResult && state.lastInputForSolve) runSolver({ skipHideAbout: true, preserveState: true });
        });
    });
}
