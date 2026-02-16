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

    /** Zvonění připomínající starý telefon/budík – dvojité cinknutí. */
    function playAlarm() {
        const ctx = getCtx();
        const freq = 880;
        const pattern = [0, 0.15, 0.35, 0.5, 0.65, 0.85];
        pattern.forEach((start, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            const t = ctx.currentTime + start;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
            osc.start(t);
            osc.stop(t + 0.12);
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
            const pauseBtn = document.getElementById('countdownPause') || document.getElementById('countdownPlayPause');
            const paused = isPausedFlag || (timerId == null && remainingSeconds > 0 && pauseBtn?.dataset?.paused === 'true');
            const running = timerId != null;
            if (!running && !paused) {
                localStorage.removeItem(STORAGE_KEY);
                return;
            }
            if (remainingSeconds <= 0) {
                localStorage.removeItem(STORAGE_KEY);
                return;
            }
            const now = Date.now();
            const endTimeVal = paused ? now + remainingSeconds * 1000 : (endTime != null ? endTime : now + remainingSeconds * 1000);
            const state = {
                remaining: remainingSeconds,
                total: totalSeconds,
                paused: !!paused,
                endTime: endTimeVal
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
        const pauseBtnPage = document.getElementById('countdownPause') || document.getElementById('countdownPlayPause');
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
        if (document.location.pathname.endsWith('odpocet.php')) {
            document.title = TITLE_BASE;
        }
    }

    function showToast(message, durationMs) {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 300);
        }, durationMs);
    }

    function tick() {
        remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        updateDisplay(remainingSeconds);
        saveState();
        if (remainingSeconds <= 0) {
            if (timerId != null) clearInterval(timerId);
            timerId = null;
            endTime = null;
            const t = typeof window.t === 'function' ? window.t : (k, v) => (v?.m != null ? v.m + ' minutes elapsed' : k);
            showToast(t('countdown.elapsed', { m: Math.round(totalSeconds / 60) }), 3000);
            playAlarm();
            resetTitle();
            saveState();
            showTopbarWidget(false);
            const startBtn = document.getElementById('countdownStart') || document.getElementById('countdownPlayPause');
            const pauseBtn = document.getElementById('countdownPause') || document.getElementById('countdownPlayPause');
            if (startBtn) startBtn.dataset.running = '';
            if (pauseBtn) pauseBtn.dataset.paused = '';
            return;
        }
    }

    function start() {
        if (typeof window.markToolUsed === 'function') window.markToolUsed();
        getCtx().resume().catch(() => {});
        isPausedFlag = false;
        const playPauseBtn = document.getElementById('countdownPlayPause') || document.getElementById('countdownStart');
        const pauseBtn = document.getElementById('countdownPause') || document.getElementById('countdownPlayPause');
        if (playPauseBtn?.dataset?.running === 'true') return;
        const minsInput = document.getElementById('countdownMinutes');
        if (pauseBtn?.dataset?.paused === 'true') {
            endTime = Date.now() + remainingSeconds * 1000;
        } else {
            const mins = Math.max(1, Math.min(120, parseInt(minsInput?.value, 10) || 30));
            totalSeconds = mins * 60;
            remainingSeconds = totalSeconds;
            endTime = Date.now() + totalSeconds * 1000;
        }
        if (playPauseBtn) {
            playPauseBtn.dataset.running = 'true';
            playPauseBtn.dataset.paused = '';
            updatePlayPauseButtonUI(playPauseBtn, true);
        }
        if (pauseBtn && pauseBtn !== playPauseBtn) pauseBtn.dataset.paused = '';
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
        if (endTime != null) remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        updateDisplay(remainingSeconds);
        const playPauseBtn = document.getElementById('countdownPlayPause') || document.getElementById('countdownStart');
        const pauseBtn = document.getElementById('countdownPause') || document.getElementById('countdownPlayPause');
        if (playPauseBtn) {
            playPauseBtn.dataset.running = '';
            playPauseBtn.dataset.paused = 'true';
            updatePlayPauseButtonUI(playPauseBtn, false);
        }
        if (pauseBtn && pauseBtn !== playPauseBtn) pauseBtn.dataset.paused = 'true';
        resetTitle();
        saveState();
        updateTopbarWidget();
    }

    function updatePlayPauseButtonUI(btn, running) {
        if (!btn) return;
        const iconPlay = btn.querySelector('.countdown-icon-play');
        const iconPause = btn.querySelector('.countdown-icon-pause');
        const btnText = btn.querySelector('.countdown-btn-text');
        const t = typeof window.t === 'function' ? window.t : (k) => k;
        if (iconPlay) iconPlay.classList.toggle('hidden', running);
        if (iconPause) iconPause.classList.toggle('hidden', !running);
        if (btnText) btnText.textContent = running ? t('countdown.pause') : t('countdown.start');
        btn.classList.toggle('bg-emerald-600', !running);
        btn.classList.toggle('hover:bg-emerald-700', !running);
        btn.classList.toggle('bg-amber-600', running);
        btn.classList.toggle('hover:bg-amber-700', running);
        btn.setAttribute('aria-label', running ? t('countdown.pause') : t('countdown.start'));
    }

    function reset() {
        if (timerId != null) clearInterval(timerId);
        timerId = null;
        endTime = null;
        isPausedFlag = false;
        const minsInput = document.getElementById('countdownMinutes');
        const mins = Math.max(1, Math.min(120, parseInt(minsInput?.value, 10) || 30));
        remainingSeconds = mins * 60;
        const playPauseBtn = document.getElementById('countdownPlayPause') || document.getElementById('countdownStart');
        const pauseBtn = document.getElementById('countdownPause') || document.getElementById('countdownPlayPause');
        if (playPauseBtn) {
            playPauseBtn.dataset.running = '';
            playPauseBtn.dataset.paused = '';
            updatePlayPauseButtonUI(playPauseBtn, false);
        }
        if (pauseBtn && pauseBtn !== playPauseBtn) pauseBtn.dataset.paused = '';
        updateDisplay(remainingSeconds);
        resetTitle();
        saveState();
        showTopbarWidget(false);
    }

    function topbarPlay() {
        const state = loadState();
        if (!state) return;
        getCtx().resume().catch(() => {});
        isPausedFlag = false;
        remainingSeconds = state.remaining;
        if (typeof state.total === 'number' && state.total > 0) totalSeconds = state.total;
        endTime = Date.now() + remainingSeconds * 1000;
        if (timerId != null) clearInterval(timerId);
        timerId = setInterval(tick, 200);
        tick();
        const pauseBtnPage = document.getElementById('countdownPause') || document.getElementById('countdownPlayPause');
        if (pauseBtnPage) pauseBtnPage.dataset.paused = '';
        const startBtn = document.getElementById('countdownStart') || document.getElementById('countdownPlayPause');
        if (startBtn) {
            startBtn.dataset.running = 'true';
            updatePlayPauseButtonUI(startBtn, true);
        }
        saveState();
        updateTopbarWidget();
    }

    function topbarPause() {
        if (timerId != null) clearInterval(timerId);
        timerId = null;
        isPausedFlag = true;
        if (endTime != null) remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        updateDisplay(remainingSeconds);
        const pauseBtnPage = document.getElementById('countdownPause') || document.getElementById('countdownPlayPause');
        if (pauseBtnPage) pauseBtnPage.dataset.paused = 'true';
        const startBtn = document.getElementById('countdownStart') || document.getElementById('countdownPlayPause');
        if (startBtn) {
            startBtn.dataset.running = '';
            updatePlayPauseButtonUI(startBtn, false);
        }
        resetTitle();
        saveState();
        updateTopbarWidget();
    }

    function restoreFromStorage() {
        const state = loadState();
        if (!state) return;
        remainingSeconds = state.remaining;
        if (typeof state.total === 'number' && state.total > 0) totalSeconds = state.total;
        if (state.paused) {
            isPausedFlag = true;
            updateDisplay(remainingSeconds);
            showTopbarWidget(true);
            updateTopbarWidget();
            const pauseBtnPage = document.getElementById('countdownPause') || document.getElementById('countdownPlayPause');
            if (pauseBtnPage) {
                pauseBtnPage.dataset.paused = 'true';
                updatePlayPauseButtonUI(pauseBtnPage, false);
            }
            return;
        }
        endTime = state.endTime;
        if (endTime && endTime > Date.now()) {
            if (timerId != null) clearInterval(timerId);
            timerId = setInterval(tick, 200);
            tick();
            showTopbarWidget(true);
            const startBtn = document.getElementById('countdownStart') || document.getElementById('countdownPlayPause');
            const pauseBtnPage = document.getElementById('countdownPause') || document.getElementById('countdownPlayPause');
            if (startBtn) {
                startBtn.dataset.running = 'true';
                updatePlayPauseButtonUI(startBtn, true);
            }
            if (pauseBtnPage) pauseBtnPage.dataset.paused = '';
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    function togglePlayPause() {
        const playPauseBtn = document.getElementById('countdownPlayPause') || document.getElementById('countdownStart');
        if (playPauseBtn?.dataset?.running === 'true') pause();
        else start();
    }

    function init() {
        const playPauseBtn = document.getElementById('countdownPlayPause');
        const startBtn = document.getElementById('countdownStart');
        const pauseBtn = document.getElementById('countdownPause');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', togglePlayPause);
        } else {
            startBtn?.addEventListener('click', start);
            pauseBtn?.addEventListener('click', pause);
        }
        document.getElementById('countdownReset')?.addEventListener('click', reset);
        document.getElementById('countdownTopbarPlay')?.addEventListener('click', topbarPlay);
        document.getElementById('countdownTopbarPause')?.addEventListener('click', topbarPause);
        restoreFromStorage();
        if (!loadState()) {
            updateDisplay(remainingSeconds);
        }
        const pp = document.getElementById('countdownPlayPause');
        if (pp) updatePlayPauseButtonUI(pp, timerId != null);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
