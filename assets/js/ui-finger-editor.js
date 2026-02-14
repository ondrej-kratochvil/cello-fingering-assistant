/**
 * Editace prstokladu – setActiveNoteIndex, setupFingeringEditor, applyModalSelection, atd.
 * Volající musí před použitím volat initFingerEditor(deps).
 */
import { hasAnyUserDefined } from './ui-staff.js';
import * as modals from './ui-modals.js';

let _deps = null;

export function initFingerEditor(deps) {
    _deps = deps;
}

function getDeps() {
    if (!_deps) throw new Error('ui-finger-editor: initFingerEditor(deps) must be called first');
    return _deps;
}

function buildConstraintsFromResult(result) {
    if (!result) return null;
    return result.map((step) => {
        if (!hasAnyUserDefined(step)) return null;
        const constraint = { userDefined: { ...step.userDefined } };
        if (step.userDefined.f) constraint.f = step.f;
        if (step.userDefined.s) constraint.s = step.s;
        if (step.userDefined.pos) {
            constraint.p = step.p;
            constraint.ext = step.ext;
        }
        return constraint;
    });
}

function applyUserDefinedFlags(result, constraints) {
    if (!constraints) return result;
    return result.map((step, idx) => {
        const constraint = constraints[idx];
        if (!constraint || !constraint.userDefined) return step;
        return { ...step, userDefined: { ...constraint.userDefined } };
    });
}

export function positionModal(anchorEl) {
    const { state } = getDeps();
    const modalEl = state.modalEl;
    if (!modalEl || !anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const modalRect = modalEl.getBoundingClientRect();
    const gap = 8;
    const verticalOffset = -10;
    let top = rect.top + window.scrollY - modalRect.height - gap + verticalOffset;
    if (top < window.scrollY + gap) {
        top = rect.bottom + window.scrollY + gap + verticalOffset;
    }
    let left = rect.left + window.scrollX + (rect.width / 2) - (modalRect.width / 2);
    const minLeft = window.scrollX + gap;
    const maxLeft = window.scrollX + window.innerWidth - modalRect.width - gap;
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;
    modalEl.style.left = `${left}px`;
    modalEl.style.top = `${top}px`;
}

function findScrollableParent(el) {
    let current = el;
    while (current && current !== document.body) {
        if (current.scrollWidth > current.clientWidth + 1) return current;
        current = current.parentElement;
    }
    return null;
}

export function scrollNoteIntoView(anchorEl) {
    const { state } = getDeps();
    const staffScrollContainer = state.staffScrollContainer;
    const containerCandidate = staffScrollContainer && staffScrollContainer.scrollWidth > staffScrollContainer.clientWidth + 1
        ? staffScrollContainer
        : findScrollableParent(anchorEl) || staffScrollContainer;
    if (!containerCandidate) return;

    const margin = 16;
    const attemptScroll = () => {
        const containerRect = containerCandidate.getBoundingClientRect();
        const noteRect = anchorEl.getBoundingClientRect();
        const noteCenter = noteRect.left + (noteRect.width / 2);
        const containerCenter = containerRect.left + (containerRect.width / 2);
        const centerDelta = noteCenter - containerCenter;
        const centerThreshold = Math.min(24, containerRect.width * 0.1);
        if (!containerRect.width || !noteRect.width) {
            if (typeof anchorEl.scrollIntoView === 'function') {
                anchorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
            return;
        }

        if (Math.abs(centerDelta) <= centerThreshold) return;
        const maxScroll = Math.max(0, containerCandidate.scrollWidth - containerCandidate.clientWidth);
        const targetScroll = Math.min(
            Math.max(containerCandidate.scrollLeft + centerDelta, 0),
            maxScroll
        );
        containerCandidate.scrollTo({ left: targetScroll, behavior: 'smooth' });
    };
    window.requestAnimationFrame(attemptScroll);
    window.setTimeout(attemptScroll, 120);
}

function collectFingerElements(svg, expectedCount) {
    const dataElements = Array.from(svg.querySelectorAll('[data-finger-idx]'));
    if (dataElements.length) {
        const mapped = [];
        dataElements.forEach((el) => {
            const idx = Number.parseInt(el.getAttribute('data-finger-idx'), 10);
            if (!Number.isNaN(idx)) mapped[idx] = el;
        });
        if (mapped.filter(Boolean).length >= expectedCount) return mapped;
    }

    const textEls = Array.from(svg.querySelectorAll('text'));
    const fingerRegex = /^[0-4](?:↑)?!?$/;
    const fingerTexts = textEls.filter((el) => fingerRegex.test((el.textContent || '').trim()));
    const sorted = fingerTexts.map((el) => {
        let x = 0;
        try { x = el.getBBox().x; } catch (e) { x = 0; }
        return { el, x };
    }).sort((a, b) => a.x - b.x).map(item => item.el);
    return sorted.slice(0, expectedCount);
}

function createHitbox(svg, anchorEl, idx, handleFingerClick) {
    let bbox;
    try {
        bbox = anchorEl.getBBox();
    } catch (e) {
        return null;
    }
    const size = 44;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', bbox.x + (bbox.width / 2) - (size / 2));
    rect.setAttribute('y', bbox.y + (bbox.height / 2) - (size / 2));
    rect.setAttribute('width', size);
    rect.setAttribute('height', size);
    rect.setAttribute('fill', 'transparent');
    rect.setAttribute('class', 'fingering-hitbox');
    rect.dataset.noteIndex = String(idx);
    rect.style.cursor = 'pointer';
    rect.style.pointerEvents = 'all';
    rect.addEventListener('click', () => handleFingerClick(idx));
    svg.appendChild(rect);
    return rect;
}

export function setActiveNoteIndex(index) {
    const { state, setEditMode } = getDeps();
    const fingerTargets = state.fingerTargets;
    const lastResult = state.lastResult;

    if (!fingerTargets.length || !lastResult) return;
    const clamped = Math.max(0, Math.min(index, lastResult.length - 1));
    state.activeNoteIndex = clamped;
    state.pendingActiveNoteIndex = null;

    fingerTargets.forEach((target, idx) => {
        if (target && target.hitboxEl) {
            target.hitboxEl.classList.toggle('is-active', idx === clamped);
        }
    });

    const target = fingerTargets[clamped];
    if (!target || !target.anchorEl) return;
    modals.ensureModal();
    modals.updateActiveFingerHighlight(target.anchorEl);
    modals.renderModalContent();
    state.modalEl.classList.add('is-open');
    state.modalEl.setAttribute('aria-hidden', 'false');
    scrollNoteIntoView(target.anchorEl);
    positionModal(target.anchorEl);
    window.setTimeout(() => positionModal(target.anchorEl), 200);
}

function handleFingerClick(idx) {
    const { state, setEditMode } = getDeps();
    if (!state.lastResult || state.currentOutputFormat !== 'staff') return;
    if (!state.editModeEnabled) {
        setEditMode(true, idx);
        return;
    }
    setActiveNoteIndex(idx);
}

export function setupFingeringEditor(staffDiv, result) {
    const { state, setEditMode } = getDeps();
    state.fingerTargets = [];
    state.staffScrollContainer = staffDiv ? staffDiv.parentElement : null;
    if (!staffDiv || !result) return;
    const svg = staffDiv.querySelector('svg');
    if (!svg) return;

    svg.querySelectorAll('.fingering-hitbox').forEach((el) => el.remove());
    const anchors = collectFingerElements(svg, result.length);
    if (!anchors || !anchors.length) return;

    state.fingerTargets = anchors.map((anchorEl, idx) => {
        if (!anchorEl) return null;
        const hitboxEl = createHitbox(svg, anchorEl, idx, handleFingerClick);
        return { anchorEl, hitboxEl };
    });

    if (state.editModeEnabled) {
        const nextIndex = state.pendingActiveNoteIndex !== null ? state.pendingActiveNoteIndex : (state.activeNoteIndex ?? 0);
        setActiveNoteIndex(nextIndex);
    }
}

export function teardownFingeringEditor() {
    const { state, setEditMode } = getDeps();
    state.fingerTargets = [];
    state.staffScrollContainer = null;
    if (state.editModeEnabled) setEditMode(false);
}

export function applyModalSelection(field, value, isAuto) {
    const { state, solve, t, renderResults, showModalError, focusEditKeyboardInput } = getDeps();

    if (state.activeNoteIndex === null || !state.lastResult || !state.lastInputForSolve) return;

    const constraints = buildConstraintsFromResult(state.lastResult) || [];
    const current = constraints[state.activeNoteIndex];
    const nextConstraint = {
        ...(current || {}),
        userDefined: { ...(current && current.userDefined ? current.userDefined : {}) }
    };

    if (field === 'f') {
        if (isAuto) {
            delete nextConstraint.userDefined.f;
            delete nextConstraint.f;
        } else {
            nextConstraint.userDefined.f = true;
            nextConstraint.f = Number.parseInt(value, 10);
        }
    }

    if (field === 's') {
        if (isAuto) {
            delete nextConstraint.userDefined.s;
            delete nextConstraint.s;
        } else {
            nextConstraint.userDefined.s = true;
            nextConstraint.s = value;
        }
    }

    if (field === 'pos') {
        if (isAuto) {
            delete nextConstraint.userDefined.pos;
            delete nextConstraint.p;
            delete nextConstraint.ext;
        } else if (value) {
            const [pStr, extStr] = value.split('|');
            nextConstraint.userDefined.pos = true;
            nextConstraint.p = Number.parseInt(pStr, 10);
            nextConstraint.ext = Number.parseInt(extStr, 10);
        }
    }

    if (!nextConstraint.userDefined.f) delete nextConstraint.f;
    if (!nextConstraint.userDefined.s) delete nextConstraint.s;
    if (!nextConstraint.userDefined.pos) {
        delete nextConstraint.p;
        delete nextConstraint.ext;
    }

    if (!Object.keys(nextConstraint.userDefined).length) {
        constraints[state.activeNoteIndex] = null;
    } else {
        constraints[state.activeNoteIndex] = nextConstraint;
    }

    const nextResult = solve(state.lastInputForSolve, constraints);
    if (!nextResult) {
        showModalError(t('errors.unplayableFinger'));
        return;
    }

    const merged = applyUserDefinedFlags(nextResult, constraints);
    const nextIndex = state.activeNoteIndex < merged.length - 1 ? state.activeNoteIndex + 1 : state.activeNoteIndex;
    state.pendingActiveNoteIndex = nextIndex;

    renderResults({
        result: merged,
        inputForSolve: state.lastInputForSolve,
        inputForDisplay: state.lastInput || state.lastInputForSolve,
        inputOriginal: null,
        skipHideAbout: true,
        display: document.getElementById('pathDisplay'),
        wrapper: document.getElementById('resultsWrapper')
    });
    focusEditKeyboardInput();
}

export function isTypingTarget(target) {
    if (!target) return false;
    const tag = target.tagName ? target.tagName.toLowerCase() : '';
    return tag === 'input' || tag === 'textarea' || target.isContentEditable;
}
