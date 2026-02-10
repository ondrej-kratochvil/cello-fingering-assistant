/**
 * Metronom – BPM, počet dob (2, 3, 4, 6), dva typy úderů (silný / slabší).
 */
(function () {
    'use strict';

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
        const beatsRadios = document.querySelectorAll('input[name="metronomeBeats"]');
        const startBtn = document.getElementById('metronomeStart');
        const stopBtn = document.getElementById('metronomeStop');
        const beatDisplay = document.getElementById('metronomeBeat');

        function getBpm() {
            const v = parseInt(bpmInput?.value, 10);
            return (Number.isFinite(v) && v >= 40 && v <= 240) ? v : 72;
        }
        function getBeats() {
            const r = document.querySelector('input[name="metronomeBeats"]:checked');
            return parseInt(r?.value, 10) || 4;
        }

        function scheduleNext() {
            const bpm = getBpm();
            const beats = getBeats();
            const intervalMs = (60 * 1000) / bpm;
            const now = performance.now();
            if (nextTickTime < now) nextTickTime = now;
            const delay = Math.max(0, nextTickTime - performance.now());
            timerId = setTimeout(() => {
                if (!startBtn?.dataset?.running) return;
                playTick(beatIndex === 0);
                if (beatDisplay) beatDisplay.textContent = String(beatIndex + 1);
                beatIndex = (beatIndex + 1) % beats;
                nextTickTime += intervalMs;
                scheduleNext();
            }, delay);
        }

        function start() {
            if (typeof window.markToolUsed === 'function') window.markToolUsed();
            if (startBtn?.dataset?.running === 'true') return;
            beatIndex = 0;
            nextTickTime = performance.now();
            startBtn.dataset.running = 'true';
            if (beatDisplay) beatDisplay.textContent = '1';
            playTick(true);
            beatIndex = 1;
            nextTickTime += (60 * 1000) / getBpm();
            scheduleNext();
        }

        function stop() {
            if (timerId != null) clearTimeout(timerId);
            timerId = null;
            startBtn.dataset.running = '';
            if (beatDisplay) beatDisplay.textContent = '—';
        }

        startBtn?.addEventListener('click', start);
        stopBtn?.addEventListener('click', stop);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
