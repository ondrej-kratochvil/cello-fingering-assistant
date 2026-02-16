/**
 * Metronom – BPM, počet dob (0=bez zvýraznění, 2, 3, 4, 6), táhlo, puntíky, notová sekvence.
 */
import { loadFingeringState } from './fingering-staff-utils.js';
import { renderStaffWithRhythm } from './ui-staff.js';
import { RHYTHM_PATTERNS, getDurationsForSequence } from './rhythm-patterns.js';

(function () {
    'use strict';

    const RHYTHM_STORAGE_KEY = 'celloapp:lastRhythm';

    let audioContext = null;
    let nextTickTime = 0;
    let timerId = null;
    let beatIndex = 0;

    function getCtx() {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return audioContext;
    }

    /** Krátký tón – silný (první doba) nebo slabší. */
    function playTick(accent) {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = accent ? 1000 : 800;
        osc.type = 'sine';
        const vol = accent ? 0.25 : 0.12;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
    }

    function init() {
        const bpmInput = document.getElementById('metronomeBpm');
        const bpmRange = document.getElementById('metronomeBpmRange');
        const beatsRadios = document.querySelectorAll('input[name="metronomeBeats"]');
        const playStopBtn = document.getElementById('metronomePlayStop');
        const beatDisplay = document.getElementById('metronomeBeat');
        const sequenceSection = document.getElementById('metronomeSequenceSection');
        const staffContainer = document.getElementById('metronomeStaff');
        const iconPlay = playStopBtn?.querySelector('.metronome-icon-play');
        const iconStop = playStopBtn?.querySelector('.metronome-icon-stop');
        const btnText = playStopBtn?.querySelector('.metronome-btn-text');
        const t = typeof window.t === 'function' ? window.t : (k) => k;

        function getBpm() {
            const v = parseInt(bpmInput?.value, 10);
            return (Number.isFinite(v) && v >= 40 && v <= 240) ? v : 72;
        }
        function getBeats() {
            const r = document.querySelector('input[name="metronomeBeats"]:checked');
            return parseInt(r?.value, 10) || 0;
        }
        function useAccent() {
            return getBeats() > 0;
        }
        function getDisplayBeats() {
            const b = getBeats();
            return b === 0 ? 4 : b;
        }

        function syncBpmFromInput() {
            const v = getBpm();
            if (bpmRange) bpmRange.value = String(v);
        }
        function syncBpmFromRange() {
            const v = parseInt(bpmRange?.value, 10);
            if (Number.isFinite(v) && bpmInput) bpmInput.value = String(v);
        }

        function renderDots() {
            if (!beatDisplay) return;
            const count = getDisplayBeats();
            beatDisplay.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('span');
                dot.className = 'metronome-dot w-8 h-8 rounded-full bg-slate-300 transition-all';
                dot.dataset.beatIndex = String(i);
                beatDisplay.appendChild(dot);
            }
        }

        function updateDots(activeIndex) {
            const dots = beatDisplay?.querySelectorAll('.metronome-dot');
            if (!dots) return;
            dots.forEach((dot, i) => {
                const isActive = i === activeIndex;
                dot.classList.toggle('metronome-dot--active', isActive);
                dot.classList.toggle('bg-indigo-500', isActive);
                dot.classList.toggle('bg-slate-300', !isActive);
                dot.classList.toggle('scale-125', isActive);
            });
        }

        function scheduleNext() {
            const bpm = getBpm();
            const beats = getDisplayBeats();
            const accent = useAccent();
            const intervalMs = (60 * 1000) / bpm;
            const now = performance.now();
            if (nextTickTime < now) nextTickTime = now;
            const delay = Math.max(0, nextTickTime - performance.now());
            timerId = setTimeout(() => {
                if (playStopBtn?.dataset?.running !== 'true') return;
                playTick(accent && beatIndex === 0);
                updateDots(beatIndex);
                beatIndex = (beatIndex + 1) % beats;
                nextTickTime += intervalMs;
                scheduleNext();
            }, delay);
        }

        let startCancelled = false;
        function start() {
            if (typeof window.markToolUsed === 'function') window.markToolUsed();
            if (playStopBtn?.dataset?.running === 'true') return;
            startCancelled = false;
            getCtx().resume().then(() => {
                if (startCancelled) return;
                beatIndex = 0;
                nextTickTime = performance.now();
                playStopBtn && (playStopBtn.dataset.running = 'true');
                if (iconPlay) iconPlay.classList.add('hidden');
                if (iconStop) iconStop.classList.remove('hidden');
                if (btnText) btnText.textContent = t('metronome.stop');
                playStopBtn?.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
                playStopBtn?.classList.add('bg-slate-600', 'hover:bg-slate-700');
                playStopBtn?.setAttribute('aria-label', t('metronome.startStop'));
                updateDots(0);
                playTick(useAccent());
                beatIndex = 1;
                nextTickTime += (60 * 1000) / getBpm();
                scheduleNext();
            }).catch(() => {});
        }

        function stop() {
            startCancelled = true;
            if (timerId != null) clearTimeout(timerId);
            timerId = null;
            playStopBtn && (playStopBtn.dataset.running = '');
            if (iconPlay) iconPlay.classList.remove('hidden');
            if (iconStop) iconStop.classList.add('hidden');
            if (btnText) btnText.textContent = t('metronome.start');
            playStopBtn?.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
            playStopBtn?.classList.remove('bg-slate-600', 'hover:bg-slate-700');
            playStopBtn?.setAttribute('aria-label', t('metronome.startStop'));
            const dots = beatDisplay?.querySelectorAll('.metronome-dot');
            dots?.forEach((d) => {
                d.classList.remove('metronome-dot--active', 'bg-indigo-500', 'scale-125');
                d.classList.add('bg-slate-300');
            });
        }

        function togglePlayStop() {
            if (playStopBtn?.dataset?.running === 'true') stop();
            else start();
        }

        bpmInput?.addEventListener('input', syncBpmFromInput);
        bpmInput?.addEventListener('change', syncBpmFromInput);
        bpmRange?.addEventListener('input', syncBpmFromRange);
        playStopBtn?.addEventListener('click', togglePlayStop);

        beatsRadios?.forEach((r) => r.addEventListener('change', () => {
            renderDots();
        }));

        syncBpmFromInput();
        renderDots();

        const state = loadFingeringState();
        let lastRhythmId = null;
        try {
            lastRhythmId = localStorage.getItem(RHYTHM_STORAGE_KEY);
        } catch (e) { /* ignore */ }
        const pattern = lastRhythmId && RHYTHM_PATTERNS.some(p => p.id === lastRhythmId)
            ? RHYTHM_PATTERNS.find(p => p.id === lastRhythmId)
            : RHYTHM_PATTERNS[0];

        if (state && sequenceSection && staffContainer) {
            const notes = state.inputNormalized && state.inputNormalized.length === state.input.length
                ? state.inputNormalized : state.input;
            const durations = getDurationsForSequence(notes.length, pattern);
            renderStaffWithRhythm(staffContainer, notes, durations, state.fingering, { staffId: 'vexflow-staff-metronome' });
            sequenceSection.classList.remove('hidden');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
