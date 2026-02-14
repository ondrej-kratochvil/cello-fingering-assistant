/**
 * Ladička – otevřené struny C, G, d, a.
 * Mikrofon, detekce výšky tónu, zobrazení jehly (nízko / správně / vysoko).
 * Temperované ladění nebo čisté kvinty (3/2), referenční A = 440–443 Hz.
 */
(function () {
    'use strict';

    const STRINGS = ['C', 'G', 'D', 'A']; // C2, G2, D3, A3

    function getTargetFrequencies(referenceA, usePureFifths) {
        const A3 = referenceA / 2;
        if (usePureFifths) {
            const ratio = 2 / 3;
            return {
                C: (A3 * ratio * ratio * ratio).toFixed(2),
                G: (A3 * ratio * ratio).toFixed(2),
                D: (A3 * ratio).toFixed(2),
                A: A3.toFixed(2)
            };
        }
        const semitone = Math.pow(2, 1 / 12);
        const A3_et = referenceA / 2;
        const D3_et = A3_et / Math.pow(semitone, 7);
        const G2_et = D3_et / Math.pow(semitone, 7);
        const C2_et = G2_et / Math.pow(semitone, 7);
        return {
            C: C2_et.toFixed(2),
            G: G2_et.toFixed(2),
            D: D3_et.toFixed(2),
            A: A3_et.toFixed(2)
        };
    }

    /**
     * YIN pitch detection – lepší detekce fundamentální frekvence než autocorrelation.
     * Viz http://audition.ens.fr/adc/pdf/2002_JASA_YIN.pdf
     */
    function detectPitchYin(float32Array, sampleRate) {
        const size = float32Array.length;
        const tauMax = Math.min(Math.floor(size / 2), Math.floor(sampleRate / 40));
        const thresh = 0.15;
        const rms = Math.sqrt(float32Array.reduce((s, x) => s + x * x, 0) / size);
        if (rms < 0.01) return null;

        const diff = new Float32Array(tauMax);
        for (let tau = 1; tau < tauMax; tau++) {
            let sum = 0;
            for (let j = 0; j < tauMax; j++) {
                const d = float32Array[j] - float32Array[j + tau];
                sum += d * d;
            }
            diff[tau] = sum;
        }
        diff[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < tauMax; tau++) {
            runningSum += diff[tau];
            if (runningSum > 0) diff[tau] = diff[tau] * tau / runningSum;
        }
        let tau = 2;
        while (tau < tauMax - 1) {
            if (diff[tau] < thresh && diff[tau] <= diff[tau - 1] && diff[tau] <= diff[tau + 1]) {
                const s0 = diff[tau - 1];
                const s1 = diff[tau];
                const s2 = diff[tau + 1];
                let adj = 0;
                const denom = s0 - 2 * s1 + s2;
                if (Math.abs(denom) > 1e-10) adj = 0.5 * (s0 - s2) / denom;
                const period = Math.max(1, tau + adj);
                const freq = sampleRate / period;
                if (freq >= 30 && freq <= 500) return freq;
            }
            tau++;
        }
        return null;
    }

    function findClosestString(freq, targets) {
        const f = parseFloat(freq);
        if (!Number.isFinite(f) || f < 30 || f > 500) return null;
        let closest = null;
        let minDiff = Infinity;
        for (const [name, targetStr] of Object.entries(targets)) {
            const target = parseFloat(targetStr);
            const diff = Math.abs(f - target);
            if (diff < minDiff) {
                minDiff = diff;
                closest = { name, target, diff };
            }
        }
        return closest;
    }

    /** Odchylka v centech: 100 * 12 * log2(freq / target). */
    function centsOff(freq, target) {
        if (!target || target <= 0) return 0;
        return 100 * 12 * Math.log2(freq / target);
    }

    function drawNeedle(canvas, cents, label) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        const centerX = w / 2;
        const maxCents = 50;
        const needleAngle = Math.max(-maxCents, Math.min(maxCents, cents)) * (Math.PI / 180) * 0.8;
        const ink = getComputedStyle(document.body).getPropertyValue('--color-staff-ink')?.trim() || '#0f172a';
        const isDark = document.body.classList.contains('dark-mode');
        ctx.strokeStyle = isDark ? '#e2e8f0' : ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, h - 4);
        ctx.lineTo(centerX + Math.sin(needleAngle) * (w / 2 - 8), 4 + Math.cos(needleAngle) * (h / 2 - 4));
        ctx.stroke();
        ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
    }

    function getStatusKey(cents) {
        if (cents === null) return 'playString';
        if (Math.abs(cents) <= 5) return 'inTune';
        if (cents < 0) return 'tooLow';
        return 'tooHigh';
    }

    const tunerStrings = {
        tuner: {
            playString: 'Zahrajte strunu',
            inTune: 'Správně',
            tooLow: 'Nízko',
            tooHigh: 'Vysoko',
            micStart: 'Zapnout mikrofon',
            micStop: 'Vypnout mikrofon',
            micListening: 'Poslouchám…',
            micError: 'Chyba přístupu k mikrofonu: '
        }
    };
    const t = (key) => {
        if (typeof window !== 'undefined' && window.t) return window.t(key);
        const parts = key.split('.');
        let v = tunerStrings;
        for (const p of parts) { v = v?.[p]; }
        return typeof v === 'string' ? v : key;
    };

    function init() {
        const refSelect = document.getElementById('tunerReference');
        const micBtn = document.getElementById('tunerMicBtn');
        const micStatus = document.getElementById('tunerMicStatus');
        const displays = document.getElementById('tunerDisplays');
        const modeRadios = document.querySelectorAll('input[name="tunerMode"]');

        let audioContext = null;
        let stream = null;
        let analyser = null;
        let animationId = null;
        const bufferLength = 4096;
        const dataArray = new Float32Array(bufferLength);

        function getReferenceA() {
            return parseInt(refSelect?.value || 440, 10) || 440;
        }
        function usePureFifths() {
            return document.querySelector('input[name="tunerMode"]:checked')?.value === 'pure';
        }

        function updateTargets() {
            const targets = getTargetFrequencies(getReferenceA(), usePureFifths());
            const card = displays?.querySelector('.tuner-string-card');
            if (card) card.dataset.targets = JSON.stringify(targets);
        }

        let smoothedCents = 0;
        const freqHistory = [];
        const FREQ_HISTORY_SIZE = 7;

        function medianFilter(freq) {
            if (freq == null || !Number.isFinite(freq)) return null;
            freqHistory.push(freq);
            if (freqHistory.length > FREQ_HISTORY_SIZE) freqHistory.shift();
            const sorted = [...freqHistory].sort((a, b) => a - b);
            return sorted[Math.floor(sorted.length / 2)];
        }

        function updateDisplay(detectedFreq, targets) {
            const closest = findClosestString(detectedFreq, targets);
            const card = displays?.querySelector('.tuner-string-card');
            const canvas = card?.querySelector('.tuner-needle');
            const statusEl = card?.querySelector('.tuner-status');
            const freqEl = card?.querySelector('.tuner-freq');
            const labelEl = card?.querySelector('.tuner-string-label');
            if (!card || !canvas || !statusEl || !freqEl || !labelEl) return;
            if (!closest) {
                labelEl.textContent = '—';
                drawNeedle(canvas, 0, '');
                statusEl.textContent = t('tuner.playString');
                freqEl.textContent = '— Hz';
                return;
            }
            const c = centsOff(detectedFreq, closest.target);
            smoothedCents = smoothedCents * 0.7 + c * 0.3;
            labelEl.textContent = closest.name === 'A' ? 'a' : (closest.name === 'D' ? 'd' : closest.name);
            drawNeedle(canvas, smoothedCents, closest.name);
            statusEl.textContent = t('tuner.' + getStatusKey(c));
            freqEl.textContent = detectedFreq.toFixed(1) + ' Hz';
        }

        function updateDisplayIdle() {
            const card = displays?.querySelector('.tuner-string-card');
            const canvas = card?.querySelector('.tuner-needle');
            const statusEl = card?.querySelector('.tuner-status');
            const freqEl = card?.querySelector('.tuner-freq');
            const labelEl = card?.querySelector('.tuner-string-label');
            if (!card || !canvas || !statusEl || !freqEl || !labelEl) return;
            labelEl.textContent = '—';
            drawNeedle(canvas, 0, '');
            statusEl.textContent = t('tuner.playString');
            freqEl.textContent = '— Hz';
            smoothedCents = 0;
            freqHistory.length = 0;
        }

        function tick() {
            if (!analyser || displays?.classList.contains('hidden')) {
                animationId = requestAnimationFrame(tick);
                return;
            }
            analyser.getFloatTimeDomainData(dataArray);
            const sampleRate = audioContext?.sampleRate || 44100;
            const rawFreq = detectPitchYin(dataArray, sampleRate);
            const freq = medianFilter(rawFreq);
            const targets = getTargetFrequencies(getReferenceA(), usePureFifths());
            const targetObj = {};
            STRINGS.forEach(s => { targetObj[s] = targets[s]; });
            if (freq) {
                updateDisplay(freq, targetObj);
            } else {
                updateDisplayIdle();
            }
            animationId = requestAnimationFrame(tick);
        }

        function stopMic() {
            if (animationId != null) cancelAnimationFrame(animationId);
            animationId = null;
            if (stream) stream.getTracks().forEach(tr => tr.stop());
            stream = null;
            if (audioContext) {
                audioContext.close().catch(() => {});
                audioContext = null;
            }
            analyser = null;
            if (micBtn) {
                micBtn.textContent = typeof t === 'function' ? t('tuner.micStart') : 'Zapnout mikrofon';
                micBtn.dataset.active = 'false';
            }
            if (micStatus) micStatus.textContent = '';
            displays?.classList.add('hidden');
        }

        let micStartPending = false;
        let micStartCancelled = false;
        function startMic() {
            if (typeof window.markToolUsed === 'function') window.markToolUsed();
            if (micBtn?.dataset.active === 'true' || micStartPending) return;
            micStartPending = true;
            micStartCancelled = false;
            const ref = getReferenceA();
            const pure = usePureFifths();
            updateTargets();
            if (!navigator.mediaDevices?.getUserMedia) {
                micStartPending = false;
                if (micStatus) micStatus.textContent = 'Mikrofon není podporován.';
                return;
            }
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((s) => {
                    if (micStartCancelled) {
                        s.getTracks().forEach(tr => tr.stop());
                        micStartPending = false;
                        return;
                    }
                    stream = s;
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const src = audioContext.createMediaStreamSource(stream);
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = bufferLength * 2;
                    analyser.smoothingTimeConstant = 0.9;
                    src.connect(analyser);
                    displays?.classList.remove('hidden');
                    if (micBtn) {
                        micBtn.textContent = typeof t === 'function' ? t('tuner.micStop') : 'Vypnout mikrofon';
                        micBtn.dataset.active = 'true';
                    }
                    if (micStatus) micStatus.textContent = typeof t === 'function' ? t('tuner.micListening') : 'Poslouchám…';
                    micStartPending = false;
                    tick();
                })
                .catch((err) => {
                    micStartPending = false;
                    if (micStartCancelled) return;
                    if (micBtn) {
                        micBtn.dataset.active = 'false';
                        micBtn.textContent = typeof t === 'function' ? t('tuner.micStart') : 'Zapnout mikrofon';
                    }
                    if (micStatus) micStatus.textContent = (typeof t === 'function' ? t('tuner.micError') : 'Chyba: ') + (err.message || '');
                });
        }

        if (micBtn) {
            micBtn.addEventListener('click', () => {
                if (micStartPending) {
                    micStartCancelled = true;
                    return;
                }
                if (micBtn.dataset.active === 'true') stopMic();
                else startMic();
            });
        }
        refSelect?.addEventListener('change', updateTargets);
        modeRadios?.forEach(r => r.addEventListener('change', updateTargets));

        updateTargets();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
