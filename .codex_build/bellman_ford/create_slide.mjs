import fs from 'node:fs/promises';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const outDir = '/Users/anushkamaurya/Desktop/Currency_Exchange _ADSA_Project/.codex_build/bellman_ford';
const finalCandidate = `${outDir}/candidate-v2.pptx`;
const previewPath = `${outDir}/slide-01-v2.png`;
const font = 'Helvetica Neue';
const C = {
  bg: '#F6F8FC', white: '#FFFFFF', ink: '#0B1220', muted: '#5B6B86',
  border: '#DDE4F0', soft: '#EEF2F9', green: '#00805A', greenFill: '#00B37E',
  indigo: '#4F5BFF', amber: '#C77700', paleGreen: '#E5F6EF', paleAmber: '#FFF4DE',
  quiet: '#9AA8BB',
};

const presentation = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const slide = presentation.slides.add();
slide.background.fill = C.bg;

function shape(geometry, name, x, y, w, h, fill = 'none', stroke = 'none', sw = 0) {
  return slide.shapes.add({
    geometry, name,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { style: 'solid', fill: stroke, width: sw },
  });
}

function text(name, value, x, y, w, h, size, color = C.ink, opts = {}) {
  const box = shape('textbox', name, x, y, w, h);
  box.text = value;
  box.text.style = {
    typeface: font,
    fontSize: `${size}pt`,
    color,
    bold: opts.bold ?? false,
    alignment: opts.align ?? 'left',
    verticalAlignment: opts.valign ?? 'middle',
    autoFit: 'shrinkText',
    wrap: opts.wrap ?? 'square',
    insets: opts.insets ?? 0,
    ...(opts.italic ? { italic: true } : {}),
  };
  return box;
}

// Header
text('section-label', 'GRAPH ALGORITHMS  /  SHORTEST PATHS', 72, 35, 480, 24, 11, C.indigo, { bold: true });
text('slide-title', 'Bellman–Ford Algorithm', 72, 65, 810, 62, 39, C.ink, { bold: true });
text('slide-subtitle', 'Find shortest paths—even when some edge weights are negative.', 74, 132, 900, 35, 19, C.muted);
shape('rect', 'header-rule', 72, 185, 1136, 1, C.border);

// Definition and process on the left.
text('definition-label', 'WHAT IT DOES', 72, 216, 300, 22, 11, C.indigo, { bold: true });
text('definition', 'Bellman–Ford finds the shortest route from one source vertex to every reachable vertex in a weighted, directed graph.', 72, 244, 365, 95, 17, C.ink);

const steps = [
  { n: '01', y: 355, title: 'Initialize', body: 'Set the source to 0; set every other distance to ∞.' },
  { n: '02', y: 423, title: 'Relax every edge', body: 'If a route is shorter, update the destination distance.' },
  { n: '03', y: 491, title: 'Repeat and check', body: 'Run up to V−1 passes. One extra scan checks for a reachable negative cycle.' },
];
for (const s of steps) {
  shape('ellipse', `step-${s.n}-circle`, 72, s.y, 31, 31, C.white, C.border, 1.2);
  text(`step-${s.n}-number`, s.n, 72, s.y + 1, 31, 29, 9, C.indigo, { bold: true, align: 'center' });
  text(`step-${s.n}-title`, s.title, 117, s.y - 1, 300, 26, 15, C.ink, { bold: true });
  text(`step-${s.n}-body`, s.body, 117, s.y + 25, 320, 42, 12, C.muted);
}

shape('roundRect', 'relaxation-rule-bg', 72, 578, 365, 77, C.ink, C.ink, 1);
text('relaxation-rule-label', 'RELAXATION RULE', 91, 588, 300, 18, 9, '#8EA0FF', { bold: true });
text('relaxation-rule', 'd[v] = min(d[v], d[u] + w)', 91, 609, 330, 31, 17, C.white, { bold: true });

// Worked graph. Highlighted path: S → A → B → C, with total weight 5.
text('example-heading', 'Worked example', 492, 214, 340, 30, 20, C.ink, { bold: true });
text('example-subheading', 'Edge weights shown beside each arrow', 493, 245, 500, 24, 12, C.muted);

const nodes = {
  S: shape('ellipse', 'vertex-S', 526, 328, 78, 78, C.white, C.greenFill, 2.4),
  A: shape('ellipse', 'vertex-A', 777, 248, 78, 78, C.white, C.greenFill, 2.4),
  B: shape('ellipse', 'vertex-B', 777, 438, 78, 78, C.white, C.greenFill, 2.4),
  C: shape('ellipse', 'vertex-C', 1042, 328, 78, 78, C.white, C.greenFill, 2.4),
};

const edges = [
  ['S', 'A', '4', 'active', 'right', 'left'],
  ['S', 'B', '5', 'muted', 'right', 'left'],
  ['A', 'B', '−2', 'active', 'bottom', 'top'],
  ['A', 'C', '4', 'muted', 'right', 'left'],
  ['B', 'C', '3', 'active', 'right', 'left'],
];
for (const [from, to, weight, tone, fromSide, toSide] of edges) {
  slide.shapes.connect(nodes[from], nodes[to], {
    kind: 'straight', fromSide, toSide,
    line: { style: 'solid', fill: tone === 'active' ? C.greenFill : C.quiet, width: tone === 'active' ? 3 : 1.8 },
    tail: { type: 'triangle', width: 'med', length: 'med' },
  });
}

for (const [key, value] of Object.entries({ S: 'START', A: 'A', B: 'B', C: 'C' })) {
  const pos = { S: [526, 328], A: [777, 248], B: [777, 438], C: [1042, 328] }[key];
  text(`vertex-label-${key}`, value, pos[0], pos[1] + 17, 78, 40, key === 'S' ? 11 : 20, key === 'S' ? C.green : C.ink, { bold: true, align: 'center' });
}

// Weight labels are kept clear of the connectors and remain editable.
const weightLabels = [
  ['weight-S-A', '4', 660, 274, C.green],
  ['weight-S-B', '5', 660, 428, C.muted],
  ['weight-A-B', '−2', 805, 354, C.green],
  ['weight-A-C', '4', 928, 278, C.muted],
  ['weight-B-C', '3', 928, 424, C.green],
];
for (const [name, label, x, y, color] of weightLabels) {
  shape('roundRect', `${name}-bg`, x, y, 38, 29, C.white, C.border, 1);
  text(name, label, x, y, 38, 27, 14, color, { bold: true, align: 'center' });
}

// Worked distances after the edge-relaxation passes.
shape('rect', 'graph-bottom-rule', 492, 536, 716, 1, C.border);
text('path-result-label', 'SHORTEST PATH', 492, 550, 150, 18, 10, C.indigo, { bold: true });
text('path-result', 'S → A → B → C  =  4 + (−2) + 3  =  5', 492, 573, 700, 31, 18, C.green, { bold: true });
text('distance-pass-label', 'DISTANCES FROM S  ·  ORDER: S / A / B / C', 492, 616, 330, 18, 10, C.muted, { bold: true });
text('distance-initial', 'Start: 0 / ∞ / ∞ / ∞', 492, 638, 210, 24, 11, C.muted);
shape('rect', 'distance-divider-1', 713, 638, 1, 21, C.border);
text('distance-pass-1', 'Pass 1: 0 / 4 / 2 / 5', 728, 636, 198, 26, 11, C.ink, { bold: true });
shape('rect', 'distance-divider-2', 938, 638, 1, 21, C.border);
text('distance-pass-2', 'Pass 2: unchanged → stop', 953, 631, 255, 38, 10, C.muted);

// The slide explains the standard source-based variant; the final scan checks only reachable cycles.
slide.speakerNotes.text = 'Start at S with distance 0 and all other distances infinite. Relax the edges in the shown order: S→A gives A=4; S→B initially gives B=5; A→B improves B to 2; A→C gives C=8; B→C improves C to 5. A second pass makes no changes, so the algorithm stops early. In general, Bellman–Ford runs at most V−1 passes, then scans once more; any further improvement indicates a negative-weight cycle reachable from the source.';

const png = await presentation.export({ slide, format: 'png', scale: 1 });
await fs.writeFile(previewPath, new Uint8Array(await png.arrayBuffer()));
const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(finalCandidate);
console.log(JSON.stringify({ candidatePath: finalCandidate, previewPath, slideCount: presentation.slides.items.length, font }));
