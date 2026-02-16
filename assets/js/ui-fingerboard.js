/**
 * Vizualizace hmatníku – canvas vykreslení prstokladu na hmatníku.
 */
import { toPositionLabel } from './ui-staff.js';

/**
 * Vykreslí hmatník s prstokladem na canvas.
 * @param {Object[]} path - výsledek solveru (pole kroků s s, p, f, ext)
 * @param {string[]} input - vstupní tóny
 * @param {'diatonic'|'chromatic'} positionLabelMode - režim označení poloh
 */
export function drawFingerboard(path, input, positionLabelMode = 'diatonic') {
    const canvas = document.getElementById('fretboardCanvas');
    if (!canvas || !path || path.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const bodyStyles = getComputedStyle(document.body);
    const rootStyles = getComputedStyle(document.documentElement);
    const stringColors = {
        'C': bodyStyles.getPropertyValue('--cello-string-c').trim() || rootStyles.getPropertyValue('--cello-string-c').trim(),
        'G': bodyStyles.getPropertyValue('--cello-string-g').trim() || rootStyles.getPropertyValue('--cello-string-g').trim(),
        'D': bodyStyles.getPropertyValue('--cello-string-d').trim() || rootStyles.getPropertyValue('--cello-string-d').trim(),
        'A': bodyStyles.getPropertyValue('--cello-string-a').trim() || rootStyles.getPropertyValue('--cello-string-a').trim()
    };

    const fingerboardBg = bodyStyles.getPropertyValue('--color-fingerboard').trim() || rootStyles.getPropertyValue('--color-fingerboard').trim() || '#0d0d0d';
    const fingerboardString = bodyStyles.getPropertyValue('--color-fingerboard-string').trim() || rootStyles.getPropertyValue('--color-fingerboard-string').trim() || '#505050';
    const fingerboardFret = bodyStyles.getPropertyValue('--color-fingerboard-fret').trim() || rootStyles.getPropertyValue('--color-fingerboard-fret').trim() || '#404040';
    const fingerboardText = bodyStyles.getPropertyValue('--color-fingerboard-text').trim() || rootStyles.getPropertyValue('--color-fingerboard-text').trim() || '#b0b0b0';
    const fingerboardStroke = bodyStyles.getPropertyValue('--color-fingerboard-stroke').trim() || rootStyles.getPropertyValue('--color-fingerboard-stroke').trim() || '#e0e0e0';

    const strings = ['A', 'D', 'G', 'C'];
    const isDarkMode = document.body.classList.contains('dark-mode');
    const cStringTextColor = isDarkMode ? '#0f172a' : '#ffffff';
    const stringYPositions = {};
    const stringSpacing = height / (strings.length + 1);
    strings.forEach((str, idx) => { stringYPositions[str] = stringSpacing * (idx + 1); });

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = fingerboardBg;
    ctx.fillRect(0, 0, width, height);

    const rightMargin = 40;
    const stringLabelX = 6;
    const openStringX = 44;
    const openCircleR = 12;
    const positionSpan = (width - rightMargin) - openStringX;

    const k = 0.92;
    const numPositions = 14;
    const gap0 = Math.round(0.14 * positionSpan);
    const rest = positionSpan - gap0;
    const geomSum = (1 - Math.pow(k, numPositions - 1)) / (1 - k);
    const gap1 = rest / geomSum;
    const posX = [openStringX];
    let acc = openStringX + gap0;
    posX.push(acc);
    for (let i = 1; i < numPositions; i++) {
        acc += gap1 * Math.pow(k, i - 1);
        posX.push(acc);
    }

    const stringThickness = { 'C': 4, 'G': 3, 'D': 2.5, 'A': 2 };
    ctx.strokeStyle = fingerboardString;
    strings.forEach(str => {
        ctx.lineWidth = stringThickness[str] || 2;
        ctx.beginPath();
        ctx.moveTo(0, stringYPositions[str]);
        ctx.lineTo(width, stringYPositions[str]);
        ctx.stroke();
        const labelColor = (str === 'C' && !isDarkMode) ? '#ffffff' : stringColors[str];
        ctx.fillStyle = labelColor;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(str, stringLabelX, stringYPositions[str] + 5);
    });

    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = fingerboardText;
    ctx.textAlign = 'center';
    for (let pos = 1; pos <= numPositions; pos++) {
        const x = posX[pos];
        const isHighlighted = pos === 2 || pos === 7 || pos === 12;

        if (isHighlighted) {
            ctx.strokeStyle = '#707070';
            ctx.lineWidth = 1.5;
        } else {
            ctx.strokeStyle = fingerboardFret;
            ctx.lineWidth = 1;
        }
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.fillText(toPositionLabel(pos, positionLabelMode), x, 20);
    }

    path.forEach((step, idx) => {
        if (step.p === 0 && step.f === 0) {
            const y = stringYPositions[step.s];
            const tone = input[idx] || '';
            ctx.fillStyle = stringColors[step.s];
            ctx.beginPath();
            ctx.arc(openStringX, y, openCircleR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = fingerboardStroke;
            ctx.lineWidth = 2;
            ctx.stroke();
            const openNumberColor = step.s === 'C' ? cStringTextColor : fingerboardStroke;
            ctx.fillStyle = openNumberColor;
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('0', openStringX, y + 4);
            ctx.fillStyle = fingerboardText;
            ctx.font = 'bold 10px sans-serif';
            ctx.fillText(tone, openStringX, y + 28);
        }
    });

    const points = path.map((step, idx) => {
        let x;
        if (step.p === 0) {
            x = openStringX;
        } else {
            let targetS;
            if (step.ext === 0) {
                targetS = step.p + (step.f - 1);
            } else {
                const offset = step.f === 2 ? 2 : (step.f === 3 ? 3 : 4);
                targetS = step.p + offset;
            }
            const idx2 = Math.min(targetS, numPositions);
            x = posX[idx2];
        }
        const y = stringYPositions[step.s];
        return { x, y, step, tone: input[idx] || '', index: idx };
    });

    if (points.length > 1) {
        ctx.strokeStyle = fingerboardText;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    const wideColor = bodyStyles.getPropertyValue('--color-wide-extended').trim() || rootStyles.getPropertyValue('--color-wide-extended').trim() || '#f59e0b';
    points.forEach(({ x, y, step, tone }) => {
        if (step.p === 0) return;
        const baseColor = step.ext === 1 ? wideColor : stringColors[step.s];
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = fingerboardStroke;
        ctx.lineWidth = 2;
        ctx.stroke();
        const fingerNumberColor = step.s === 'C' ? cStringTextColor : fingerboardStroke;
        ctx.fillStyle = fingerNumberColor;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(step.f.toString(), x, y + 5);
        ctx.fillStyle = fingerboardText;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(tone, x, y + 30);
    });
}
