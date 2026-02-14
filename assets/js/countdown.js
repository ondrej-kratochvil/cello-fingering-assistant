/**
 * Odpočet (minutka) – zadaný čas v minutách, start / pauza / reset.
 * Stav v localStorage (celloapp:countdown) pro zobrazení widgetu v hlavičce na všech stránkách.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'celloapp:countdown';
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

    function playAlarm() {
        const ctx = getCtx();
        const freqs = [523.25, 659.25, 523.25];
        let t = ctx.currentTime;
        freqs.forEach((freq) => {
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

    let isPausedFlag = false;
    function saveState() {
        try {
            const paused = isPausedFlag || (timerId == null && remainingSeconds > 0 && document.getElementById('countdownPause')?.dataset?.paused === 'true');
            const running = timerId != null;
            if (!running && !paused) {
                localStorage.removeItem(STORAGE_KEY);
                return;
            }
            if (remainingSeconds <= 0) {
                localStorage.removeItem(STORAGE_KEY);
                return;
            }
            const state = {
                remaining: remainingSeconds,
                paused: !!paused,
                endTime: paused ? Date.now() + remainingSeconds * 1000 : endTime
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { /* ignore */ }
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const state = JSON.parse(raw);
            if (!state || typeof state.remaining !== 'number' || state.remaining <= 0) return null;
            return state;
        } catch (e) {
            return null;
        }
    }

    function showTopbarWidget(show) {
        const widget = document.getElementById('countdownTopbarWidget');
        if (!widget) return;
        if (show) {
            widget.classList.remove('hidden');
            widget.classList.add('flex');
        } else {
            widget.classList.add('hidden');
            widget.classList.remove('flex');
        }
    }

    function updateTopbarWidget() {
        const timeEl = document.getElementById('countdownTopbarTime');
        const playBtn = document.getElementById('countdownTopbarPlay');
        const pauseBtn = document.getElementById('countdownTopbarPause');
        const pauseBtnPage = document.getElementById('countdownPause');
        const isPaused = isPausedFlag || pauseBtnPage?.dataset?.paused === 'true';
        const isRunning = timerId != null;
        if (timeEl) timeEl.textContent = formatTime(remainingSeconds);
        if (playBtn) playBtn.classList.toggle('hidden', !isPaused);
        if (pauseBtn) pauseBtn.classList.toggle('hidden', isPaused || !isRunning);
    }

    function updateDisplay(sec) {
        const el = document.getElementById('countdownDisplay');
        if (el) el.textContent = formatTime(sec);
        if (document.location.pathname.endsWith('odpocet.php')) {
            document.title = formatTime(sec) + ' | ' + TITLE_BASE;
        }
        updateTopbarWidget();
    }

    function resetTitle() {
        document.title = TITLE_BASE;
    }

    function tick() {
        remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        updateDisplay(remainingSeconds);
        saveState();
        if (remainingSeconds <= 0) {
            if (timerId != null) clearInterval(timerId);
            timerId = null;
            endTime = null;
            playAlarm();
            resetTitle();
            saveState();
            showTopbarWidget(false);
            const startBtn = document.getElementById('countdownStart');
            const pauseBtn = document.getElementById('countdownPause');
            if (startBtn) startBtn.dataset.running = '';
            if (pauseBtn) pauseBtn.dataset.paused = '';
            return;
        }
    }

    function start() {
        if (typeof window.markToolUsed === 'function') window.markToolUsed();
        getCtx().resume().catch(() => {});
        isPausedFlag = false;
        const startBtn = document.getElementById('countdownStart');
        const pauseBtn = document.getElementById('countdownPause');
        if (startBtn?.dataset?.running === 'true') return;
        const minsInput = document.getElementById('countdownMinutes');
        if (pauseBtn?.dataset?.paused === 'true') {
            endTime = Date.now() + remainingSeconds * 1000;
        } else {
            const mins = Math.max(1, Math.min(120, parseInt(minsInput?.value, 10) || 30));
            totalSeconds = mins * 60;
            remainingSeconds = totalSeconds;
            endTime = Date.now() + totalSeconds * 1000;
        }
        if (startBtn) startBtn.dataset.running = 'true';
        if (pauseBtn) pauseBtn.dataset.paused = '';
        if (timerId != null) clearInterval(timerId);
        timerId = setInterval(tick, 200);
        tick();
        saveState();
        showTopbarWidget(true);
    }

    function pause() {
        if (timerId != null) clearInterval(timerId);
        timerId = null;
        isPausedFlag = true;
        const startBtn = document.getElementById('countdownStart');
        const pauseBtn = document.getElementById('countdownPause');
        if (startBtn) startBtn.dataset.running = '';
        if (pauseBtn) pauseBtn.dataset.paused = 'true';
        resetTitle();
        saveState();
        updateTopbarWidget();
    }

    function reset() {
        if (timerId != null) clearInterval(timerId);
        timerId = null;
        endTime = null;
        isPausedFlag = false;
        const minsInput = document.getElementById('countdownMinutes');
        const mins = Math.max(1, Math.min(120, parseInt(minsInput?.value, 10) || 30));
        remainingSeconds = mins * 60;
        const startBtn = document.getElementById('countdownStart');
        const pauseBtn = document.getElementById('countdownPause');
        if (startBtn) startBtn.dataset.running = '';
        if (pauseBtn) pauseBtn.dataset.paused = '';
        updateDisplay(remainingSeconds);
        resetTitle();
        saveState();
        showTopbarWidget(false);
    }

    function topbarPlay() {
        const state = loadState();
        if (!state) return;
        isPausedFlag = false;
        remainingSeconds = state.remaining;
        endTime = Date.now() + remainingSeconds * 1000;
        if (timerId != null) clearInterval(timerId);
        timerId = setInterval(tick, 200);
        tick();
        const pauseBtnPage = document.getElementById('countdownPause');
        if (pauseBtnPage) pauseBtnPage.dataset.paused = '';
        const startBtn = document.getElementById('countdownStart');
        if (startBtn) startBtn.dataset.running = 'true';
        saveState();
        updateTopbarWidget();
    }

    function topbarPause() {
        if (timerId != null) clearInterval(timerId);
        timerId = null;
        isPausedFlag = true;
        const pauseBtnPage = document.getElementById('countdownPause');
        if (pauseBtnPage) pauseBtnPage.dataset.paused = 'true';
        const startBtn = document.getElementById('countdownStart');
        if (startBtn) startBtn.dataset.running = '';
        saveState();
        updateTopbarWidget();
    }

    function restoreFromStorage() {
        const state = loadState();
        if (!state) return;
        remainingSeconds = state.remaining;
        if (state.paused) {
            showTopbarWidget(true);
            updateTopbarWidget();
            const pauseBtnPage = document.getElementById('countdownPause');
            if (pauseBtnPage) pauseBtnPage.dataset.paused = 'true';
            return;
        }
        endTime = state.endTime;
        if (endTime && endTime > Date.now()) {
            if (timerId != null) clearInterval(timerId);
            timerId = setInterval(tick, 200);
            tick();
            showTopbarWidget(true);
            const startBtn = document.getElementById('countdownStart');
            const pauseBtnPage = document.getElementById('countdownPause');
            if (startBtn) startBtn.dataset.running = 'true';
            if (pauseBtnPage) pauseBtnPage.dataset.paused = '';
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    function init() {
        document.getElementById('countdownStart')?.addEventListener('click', start);
        document.getElementById('countdownPause')?.addEventListener('click', pause);
        document.getElementById('countdownReset')?.addEventListener('click', reset);
        document.getElementById('countdownTopbarPlay')?.addEventListener('click', topbarPlay);
        document.getElementById('countdownTopbarPause')?.addEventListener('click', topbarPause);
        restoreFromStorage();
        if (!loadState()) {
            updateDisplay(remainingSeconds);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
