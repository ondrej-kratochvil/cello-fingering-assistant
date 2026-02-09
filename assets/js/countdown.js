/**
 * Odpočet (minutka) – zadaný čas v minutách, start / pauza / reset.
 * Zvuk zvonění na konci (delší než metronom). Zobrazení času v title stránky.
 */
(function () {
    'use strict';

    const TITLE_BASE = 'Cello App Kit – Odpočet';
    let totalSeconds = 30 * 60;
    let remainingSeconds = 30 * 60;
    let timerId = null;
    let endTime = null;
    let audioContext = null;

    function getCtx() {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return audioContext;
    }

    /** Delší zvonění na konec (několik tónů). */
    function playAlarm() {
        const ctx = getCtx();
        const freqs = [523.25, 659.25, 523.25];
        let t = ctx.currentTime;
        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
            osc.start(t);
            osc.stop(t + 0.4);
            t += 0.45;
        });
    }

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return m + ':' + String(s).padStart(2, '0');
    }

    function updateDisplay(sec) {
        const el = document.getElementById('countdownDisplay');
        if (el) el.textContent = formatTime(sec);
        document.title = formatTime(sec) + ' | ' + TITLE_BASE;
    }

    function resetTitle() {
        document.title = TITLE_BASE;
    }

    function tick() {
        remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        updateDisplay(remainingSeconds);
        if (remainingSeconds <= 0) {
            if (timerId != null) clearInterval(timerId);
            timerId = null;
            playAlarm();
            resetTitle();
            const startBtn = document.getElementById('countdownStart');
            if (startBtn) startBtn.dataset.running = '';
            return;
        }
    }

    function start() {
        const startBtn = document.getElementById('countdownStart');
        const pauseBtn = document.getElementById('countdownPause');
        if (startBtn?.dataset?.running === 'true') return;
        const minsInput = document.getElementById('countdownMinutes');
        if (pauseBtn?.dataset?.paused === 'true') {
            endTime = Date.now() + remainingSeconds * 1000;
        } else {
            const mins = Math.max(1, Math.min(120, Number(minsInput?.value, 10) || 30));
            totalSeconds = mins * 60;
            remainingSeconds = totalSeconds;
            endTime = Date.now() + totalSeconds * 1000;
        }
        if (startBtn) startBtn.dataset.running = 'true';
        if (pauseBtn) pauseBtn.dataset.paused = '';
        if (timerId != null) clearInterval(timerId);
        timerId = setInterval(tick, 200);
        tick();
    }

    function pause() {
        if (timerId != null) clearInterval(timerId);
        timerId = null;
        const startBtn = document.getElementById('countdownStart');
        const pauseBtn = document.getElementById('countdownPause');
        if (startBtn) startBtn.dataset.running = '';
        if (pauseBtn) pauseBtn.dataset.paused = 'true';
        resetTitle();
    }

    function reset() {
        if (timerId != null) clearInterval(timerId);
        timerId = null;
        const minsInput = document.getElementById('countdownMinutes');
        const mins = Math.max(1, Math.min(120, Number(minsInput?.value, 10) || 30));
        remainingSeconds = mins * 60;
        const startBtn = document.getElementById('countdownStart');
        const pauseBtn = document.getElementById('countdownPause');
        if (startBtn) startBtn.dataset.running = '';
        if (pauseBtn) pauseBtn.dataset.paused = '';
        updateDisplay(remainingSeconds);
        resetTitle();
    }

    function init() {
        document.getElementById('countdownStart')?.addEventListener('click', start);
        document.getElementById('countdownPause')?.addEventListener('click', pause);
        document.getElementById('countdownReset')?.addEventListener('click', reset);
        updateDisplay(remainingSeconds);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
