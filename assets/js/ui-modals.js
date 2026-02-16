/**
 * Modaly a Save Test – edit modal, highlight, edit keyboard input, save test modal.
 * Volající musí před init volat initModals(deps).
 */

let _deps = null;

export function initModals(deps) {
    _deps = deps;
}

function getDeps() {
    if (!_deps) throw new Error('ui-modals: initModals(deps) must be called first');
    return _deps;
}

function matchesConstraint(option, constraint) {
    if (!constraint) return true;
    if (constraint.f !== undefined && option.f !== constraint.f) return false;
    if (constraint.s !== undefined && option.s !== constraint.s) return false;
    if (constraint.p !== undefined && option.p !== constraint.p) return false;
    if (constraint.ext !== undefined && option.ext !== constraint.ext) return false;
    return true;
}

function hasMatchingOption(options, constraint) {
    return options.some(opt => matchesConstraint(opt, constraint));
}

function renderModalButtons(container, field, items, t) {
    container.innerHTML = '';
    items.forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'fingering-modal__btn';
        if (item.active) button.classList.add('is-active');
        if (item.isAuto) button.classList.add('is-auto');
        if (item.disabled) button.classList.add('is-disabled');
        button.disabled = !!item.disabled;
        button.dataset.field = field;
        if (item.isAuto) {
            button.dataset.auto = 'true';
        } else {
            button.dataset.value = String(item.value);
        }
        button.textContent = item.label;
        container.appendChild(button);
    });
}

export function ensureModal() {
    const { state, t, model, toPositionLabel, applyModalSelection } = getDeps();
    if (state.modalEl) return;
    state.modalEl = document.createElement('div');
    state.modalEl.id = 'fingeringModal';
    state.modalEl.className = 'fingering-modal';
    state.modalEl.setAttribute('role', 'dialog');
    state.modalEl.setAttribute('aria-hidden', 'true');
    state.modalEl.innerHTML = `
        <div class="fingering-modal__error" data-role="error" aria-live="polite"></div>
        <div class="fingering-modal__section" data-field="pos">
            <div class="fingering-modal__label" data-role="label"></div>
            <div class="fingering-modal__buttons" data-role="buttons"></div>
        </div>
        <div class="fingering-modal__section" data-field="s">
            <div class="fingering-modal__label" data-role="label"></div>
            <div class="fingering-modal__buttons" data-role="buttons"></div>
        </div>
        <div class="fingering-modal__section" data-field="f">
            <div class="fingering-modal__label" data-role="label"></div>
            <div class="fingering-modal__buttons" data-role="buttons"></div>
        </div>
    `;
    state.modalEl.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-field]');
        if (!button || button.disabled) return;
        const field = button.dataset.field;
        const isAuto = button.dataset.auto === 'true';
        const value = button.dataset.value ?? null;
        applyModalSelection(field, value, isAuto);
    });
    document.body.appendChild(state.modalEl);
}

export function closeModal() {
    const { state } = getDeps();
    if (!state.modalEl) return;
    state.modalEl.classList.remove('is-open');
    state.modalEl.setAttribute('aria-hidden', 'true');
}

export function showModalError(message) {
    const { state } = getDeps();
    if (!state.modalEl) return;
    const errorEl = state.modalEl.querySelector('[data-role="error"]');
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.add('is-visible');
    if (state.modalErrorTimeout) window.clearTimeout(state.modalErrorTimeout);
    state.modalErrorTimeout = window.setTimeout(() => {
        errorEl.textContent = '';
        errorEl.classList.remove('is-visible');
    }, 2000);
}

export function renderModalContent() {
    const { state, t, model, toPositionLabel, applyModalSelection } = getDeps();
    const modalEl = state.modalEl;
    const activeNoteIndex = state.activeNoteIndex;
    const lastResult = state.lastResult;
    const lastInputForSolve = state.lastInputForSolve;

    if (!modalEl || activeNoteIndex === null || !lastResult || !lastInputForSolve) return;
    const step = lastResult[activeNoteIndex];
    const noteKey = lastInputForSolve[activeNoteIndex];
    if (!step || !noteKey) return;

    const options = model[noteKey] || [];
    const userDefined = step.userDefined || {};
    const baseConstraint = {};
    if (userDefined.f) baseConstraint.f = step.f;
    if (userDefined.s) baseConstraint.s = step.s;
    if (userDefined.pos) {
        baseConstraint.p = step.p;
        baseConstraint.ext = step.ext;
    }

    const sections = modalEl.querySelectorAll('.fingering-modal__section');
    sections.forEach((section) => {
        const field = section.getAttribute('data-field');
        const label = section.querySelector('[data-role="label"]');
        const buttonsWrap = section.querySelector('[data-role="buttons"]');
        if (!label || !buttonsWrap) return;

        if (field === 'f') {
            label.textContent = t('modal.finger');
            const autoConstraint = { ...baseConstraint };
            delete autoConstraint.f;
            const items = [
                {
                    label: t('modal.auto'),
                    value: null,
                    isAuto: true,
                    disabled: !hasMatchingOption(options, autoConstraint),
                    active: !userDefined.f
                },
                ...[0, 1, 2, 3, 4].map((f) => {
                    const constraint = { ...baseConstraint, f };
                    return {
                        label: String(f),
                        value: f,
                        isAuto: false,
                        disabled: !hasMatchingOption(options, constraint),
                        active: userDefined.f && step.f === f
                    };
                })
            ];
            renderModalButtons(buttonsWrap, 'f', items, t);
        }

        if (field === 's') {
            label.textContent = t('modal.string');
            const autoConstraint = { ...baseConstraint };
            delete autoConstraint.s;
            const items = [
                {
                    label: t('modal.auto'),
                    value: null,
                    isAuto: true,
                    disabled: !hasMatchingOption(options, autoConstraint),
                    active: !userDefined.s
                },
                ...['C', 'G', 'D', 'A'].map((s) => {
                    const constraint = { ...baseConstraint, s };
                    return {
                        label: s,
                        value: s,
                        isAuto: false,
                        disabled: !hasMatchingOption(options, constraint),
                        active: userDefined.s && step.s === s
                    };
                })
            ];
            renderModalButtons(buttonsWrap, 's', items, t);
        }

        if (field === 'pos') {
            label.textContent = t('modal.position');
            const autoConstraint = { ...baseConstraint };
            delete autoConstraint.p;
            delete autoConstraint.ext;

            const uniquePositions = new Map();
            options.forEach((opt) => {
                if (opt.p > 0) {
                    const key = `${opt.p}|${opt.ext}`;
                    if (!uniquePositions.has(key)) {
                        uniquePositions.set(key, { p: opt.p, ext: opt.ext });
                    }
                }
            });

            const positions = Array.from(uniquePositions.values())
                .sort((a, b) => (a.p - b.p) || (a.ext - b.ext));

            const items = [
                {
                    label: t('modal.auto'),
                    value: null,
                    isAuto: true,
                    disabled: !hasMatchingOption(options, autoConstraint),
                    active: !userDefined.pos
                },
                ...positions.map((pos) => {
                    const constraint = { ...baseConstraint, p: pos.p, ext: pos.ext };
                    const labelText = `${toPositionLabel(pos.p, state.currentPositionLabelMode)} ${pos.ext === 1 ? t('position.wide') : t('position.narrow')}`;
                    return {
                        label: labelText,
                        value: `${pos.p}|${pos.ext}`,
                        isAuto: false,
                        disabled: !hasMatchingOption(options, constraint),
                        active: userDefined.pos && step.p === pos.p && step.ext === pos.ext
                    };
                })
            ];
            renderModalButtons(buttonsWrap, 'pos', items, t);
        }
    });
}

export function ensureHighlightDefs(svg) {
    if (!svg) return;
    if (svg.querySelector('#fingering-highlight-gradient-light') &&
        svg.querySelector('#fingering-highlight-gradient-dark')) return;
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.insertBefore(defs, svg.firstChild);
    }
    const createGradient = (id, innerColor, outerColor, outerOpacity = null) => {
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        gradient.setAttribute('id', id);
        gradient.setAttribute('cx', '50%');
        gradient.setAttribute('cy', '50%');
        gradient.setAttribute('r', '60%');

        const stopInner = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopInner.setAttribute('offset', '0%');
        stopInner.setAttribute('stop-color', innerColor);
        const stopOuter = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopOuter.setAttribute('offset', '100%');
        stopOuter.setAttribute('stop-color', outerColor);
        if (outerOpacity !== null) stopOuter.setAttribute('stop-opacity', String(outerOpacity));
        gradient.appendChild(stopInner);
        gradient.appendChild(stopOuter);
        defs.appendChild(gradient);
    };

    if (!svg.querySelector('#fingering-highlight-gradient-light')) {
        createGradient('fingering-highlight-gradient-light', '#facc15', '#ffffff');
    }
    if (!svg.querySelector('#fingering-highlight-gradient-dark')) {
        createGradient('fingering-highlight-gradient-dark', '#000000', '#000000', 0);
    }
}

export function ensureHighlightLayer(svg) {
    if (!svg) return null;
    let layer = svg.querySelector('g.fingering-highlight-layer');
    if (!layer) {
        layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        layer.setAttribute('class', 'fingering-highlight-layer');
        const defs = svg.querySelector('defs');
        if (defs && defs.nextSibling) {
            svg.insertBefore(layer, defs.nextSibling);
        } else if (defs) {
            svg.appendChild(layer);
        } else {
            svg.insertBefore(layer, svg.firstChild);
        }
    }
    return layer;
}

export function clearActiveFingerHighlight() {
    const { state } = getDeps();
    if (state.activeFingerHighlightEl && state.activeFingerHighlightEl.parentNode) {
        state.activeFingerHighlightEl.parentNode.removeChild(state.activeFingerHighlightEl);
    }
    state.activeFingerHighlightEl = null;
    state.activeFingerHighlightSvg = null;
}

export function updateActiveFingerHighlight(anchorEl) {
    const { state } = getDeps();
    if (!anchorEl) {
        clearActiveFingerHighlight();
        return;
    }
    const svg = anchorEl.ownerSVGElement;
    if (!svg) return;
    ensureHighlightDefs(svg);
    const layer = ensureHighlightLayer(svg);
    if (!layer) return;

    if (state.activeFingerHighlightEl && state.activeFingerHighlightSvg !== svg) {
        clearActiveFingerHighlight();
    }
    if (!state.activeFingerHighlightEl) {
        state.activeFingerHighlightEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        state.activeFingerHighlightEl.classList.add('fingering-highlight');
        state.activeFingerHighlightEl.setAttribute('rx', '8');
        state.activeFingerHighlightEl.setAttribute('ry', '8');
        state.activeFingerHighlightEl.setAttribute('pointer-events', 'none');
        state.activeFingerHighlightEl.setAttribute('stroke', 'none');
        state.activeFingerHighlightEl.setAttribute('stroke-width', '0');
        state.activeFingerHighlightSvg = svg;
    }
    let box;
    try {
        box = anchorEl.getBBox();
    } catch (e) {
        return;
    }
    const padX = 8;
    const padY = 6;
    state.activeFingerHighlightEl.setAttribute('x', String(box.x - padX));
    state.activeFingerHighlightEl.setAttribute('y', String(box.y - padY));
    state.activeFingerHighlightEl.setAttribute('width', String(box.width + padX * 2));
    state.activeFingerHighlightEl.setAttribute('height', String(box.height + padY * 2));

    if (state.activeFingerHighlightEl.parentNode !== layer) {
        layer.appendChild(state.activeFingerHighlightEl);
    }
}

export function ensureEditKeyboardInput() {
    const { state, t, applyModalSelection } = getDeps();
    if (state.editKeyboardInputEl) return;
    state.editKeyboardInputEl = document.createElement('input');
    state.editKeyboardInputEl.type = 'text';
    state.editKeyboardInputEl.inputMode = 'numeric';
    state.editKeyboardInputEl.pattern = '[0-4]*';
    state.editKeyboardInputEl.autocomplete = 'off';
    state.editKeyboardInputEl.className = 'edit-keyboard-input';
    state.editKeyboardInputEl.setAttribute('aria-label', t('aria.editKeyboard'));
    state.editKeyboardInputEl.addEventListener('input', (e) => {
        if (!state.editModeEnabled || state.currentOutputFormat !== 'staff') {
            state.editKeyboardInputEl.value = '';
            return;
        }
        const value = e.target.value || '';
        const digits = value.match(/[0-4]/g);
        if (digits) {
            digits.forEach((digit) => applyModalSelection('f', digit, false));
        }
        state.editKeyboardInputEl.value = '';
    });
    document.body.appendChild(state.editKeyboardInputEl);
}

export function focusEditKeyboardInput() {
    const { state } = getDeps();
    if (!state.editKeyboardInputEl || !state.editModeEnabled || state.currentOutputFormat !== 'staff') return;
    if (document.activeElement === state.editKeyboardInputEl) return;
    try {
        state.editKeyboardInputEl.focus({ preventScroll: true });
    } catch (e) {
        state.editKeyboardInputEl.focus();
    }
}

export function blurEditKeyboardInput() {
    const { state } = getDeps();
    if (!state.editKeyboardInputEl) return;
    if (document.activeElement === state.editKeyboardInputEl) {
        state.editKeyboardInputEl.blur();
    }
}

export function ensureSaveTestModal() {
    const { state, t, appendLocalTest } = getDeps();
    if (state.saveTestModalEl) return;
    state.saveTestModalEl = document.createElement('div');
    state.saveTestModalEl.className = 'save-test-modal';
    state.saveTestModalEl.setAttribute('aria-hidden', 'true');
    state.saveTestModalEl.innerHTML = `
        <div class="save-test-modal__dialog" role="dialog" aria-modal="true">
            <div class="save-test-modal__title" data-role="title"></div>
            <label class="save-test-modal__label" data-role="label" for="saveTestNameInput"></label>
            <div class="save-test-modal__input">
                <input id="saveTestNameInput" type="text" autocomplete="off">
                <button type="button" data-role="clear" aria-label=""></button>
            </div>
            <div class="save-test-modal__actions">
                <button type="button" class="is-secondary" data-role="cancel"></button>
                <button type="button" class="is-primary" data-role="save"></button>
            </div>
        </div>
    `;
    document.body.appendChild(state.saveTestModalEl);

    state.saveTestNameInputEl = state.saveTestModalEl.querySelector('#saveTestNameInput');
    const clearButton = state.saveTestModalEl.querySelector('[data-role="clear"]');
    const cancelButton = state.saveTestModalEl.querySelector('[data-role="cancel"]');
    const saveButton = state.saveTestModalEl.querySelector('[data-role="save"]');

    if (clearButton && state.saveTestNameInputEl) {
        clearButton.textContent = '×';
        clearButton.addEventListener('click', () => {
            state.saveTestNameInputEl.value = '';
            state.saveTestNameInputEl.focus();
        });
    }
    if (cancelButton) {
        cancelButton.addEventListener('click', () => closeSaveTestModal());
    }
    if (saveButton) {
        saveButton.addEventListener('click', () => handleSaveTestConfirm());
    }
    state.saveTestModalEl.addEventListener('click', (e) => {
        if (e.target === state.saveTestModalEl) closeSaveTestModal();
    });
    if (state.saveTestNameInputEl) {
        state.saveTestNameInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeSaveTestModal();
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveTestConfirm();
            }
        });
    }
    updateSaveTestModalTexts();
}

export function updateSaveTestModalTexts() {
    const { state, t } = getDeps();
    if (!state.saveTestModalEl) return;
    const title = state.saveTestModalEl.querySelector('[data-role="title"]');
    const label = state.saveTestModalEl.querySelector('[data-role="label"]');
    const clearButton = state.saveTestModalEl.querySelector('[data-role="clear"]');
    const cancelButton = state.saveTestModalEl.querySelector('[data-role="cancel"]');
    const saveButton = state.saveTestModalEl.querySelector('[data-role="save"]');
    if (title) title.textContent = t('modal.saveTestTitle');
    if (label) label.textContent = t('modal.saveTestLabel');
    if (cancelButton) cancelButton.textContent = t('button.cancel');
    if (saveButton) saveButton.textContent = t('button.save');
    if (clearButton) clearButton.setAttribute('aria-label', t('aria.clearTestName'));
}

export function openSaveTestModal(defaultName) {
    const { state } = getDeps();
    ensureSaveTestModal();
    state.saveTestDefaultName = defaultName || '';
    state.saveTestReturnFocusEl = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    state.saveTestModalEl.classList.add('is-open');
    state.saveTestModalEl.setAttribute('aria-hidden', 'false');
    if (state.saveTestNameInputEl) {
        state.saveTestNameInputEl.value = state.saveTestDefaultName;
        state.saveTestNameInputEl.focus();
        state.saveTestNameInputEl.select();
    }
}

export function closeSaveTestModal() {
    const { state } = getDeps();
    if (!state.saveTestModalEl) return;
    if (state.saveTestReturnFocusEl && typeof state.saveTestReturnFocusEl.focus === 'function') {
        state.saveTestReturnFocusEl.focus();
    } else {
        const saveTestButton = document.getElementById('saveTestButton');
        if (saveTestButton && typeof saveTestButton.focus === 'function') {
            saveTestButton.focus();
        }
    }
    state.saveTestModalEl.classList.remove('is-open');
    state.saveTestModalEl.setAttribute('aria-hidden', 'true');
    state.saveTestReturnFocusEl = null;
}

function handleSaveTestConfirm() {
    const { state, t, appendLocalTest } = getDeps();
    if (!state.lastResult || !state.lastInputForSolve) return;
    const inputVal = state.saveTestNameInputEl ? state.saveTestNameInputEl.value.trim() : '';
    const name = inputVal || state.saveTestDefaultName || 'Test';
    const inputTokens = state.lastInput && state.lastInput.length
        ? state.lastInput
        : state.lastInputForSolve || [];
    if (!inputTokens.length) return;
    const expected = state.lastResult.map(step => ({
        s: step.s,
        p: step.p,
        f: step.f,
        ext: step.ext
    }));
    appendLocalTest({
        id: `local-${Date.now()}`,
        name,
        description: '',
        input: inputTokens,
        expected,
        createdAt: new Date().toISOString()
    });
    closeSaveTestModal();
}
