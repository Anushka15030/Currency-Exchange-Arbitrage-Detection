import fs from 'node:fs/promises';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const outDir = '/Users/anushkamaurya/Desktop/Currency_Exchange _ADSA_Project/.codex_build/bellman_ford';
const candidatePath = `${outDir}/three-slides-candidate-v2.pptx`;
const font = 'Helvetica Neue';
const C = {
  bg: '#F6F8FC', white: '#FFFFFF', ink: '#0B1220', muted: '#5B6B86',
  border: '#DDE4F0', soft: '#EEF2F9', green: '#00805A', greenFill: '#00B37E',
  indigo: '#4F5BFF', amber: '#C77700', paleGreen: '#E5F6EF', paleAmber: '#FFF4DE',
  quiet: '#9AA8BB',
};
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function addShape(slide, geometry, name, x, y, w, h, fill = 'none', stroke = 'none', sw = 0) {
  return slide.shapes.add({ geometry, name, position: { left: x, top: y, width: w, height: h }, fill, line: { style: 'solid', fill: stroke, width: sw } });
}
function addText(slide, name, value, x, y, w, h, size, color = C.ink, opts = {}) {
  const box = addShape(slide, 'textbox', name, x, y, w, h);
  box.text = value;
  box.text.style = { typeface: font, fontSize: `${size}pt`, color, bold: opts.bold ?? false, alignment: opts.align ?? 'left', verticalAlignment: opts.valign ?? 'middle', autoFit: 'shrinkText', wrap: opts.wrap ?? 'square', insets: opts.insets ?? 0, ...(opts.italic ? { italic: true } : {}) };
  return box;
}
function makeSlide(kicker, title, subtitle) {
  const slide = deck.slides.add();
  slide.background.fill = C.bg;
  addText(slide, 'section-label', kicker.toUpperCase(), 72, 35, 500, 24, 11, C.indigo, { bold: true });
  addText(slide, 'slide-title', title, 72, 65, 930, 62, 39, C.ink, { bold: true });
  addText(slide, 'slide-subtitle', subtitle, 74, 132, 1080, 35, 18, C.muted);
  addShape(slide, 'rect', 'header-rule', 72, 185, 1136, 1, C.border);
  return slide;
}

// Slide 1 — theory, independent of the project.
{
  const slide = makeSlide('01  /  Theory', 'Bellman–Ford Algorithm', 'A single-source shortest-path algorithm that allows negative edge weights.');
  addText(slide, 'definition-label', 'THE IDEA', 72, 217, 200, 22, 11, C.indigo, { bold: true });
  addText(slide, 'definition', 'Given a weighted, directed graph and a starting vertex, Bellman–Ford finds the minimum-cost route to every reachable vertex. It can also detect a reachable negative-weight cycle.', 72, 244, 1125, 64, 19, C.ink);

  const steps = [
    { n: '01', x: 72, title: 'Initialize', body: 'Set the source distance to 0; set all others to ∞.' },
    { n: '02', x: 358, title: 'Relax edges', body: 'If d[u] + w(u,v) is smaller, update d[v].' },
    { n: '03', x: 644, title: 'Repeat', body: 'Scan all edges for up to V−1 passes; stop early if unchanged.' },
    { n: '04', x: 930, title: 'Check once more', body: 'A further improvement signals a reachable negative cycle.' },
  ];
  addShape(slide, 'rect', 'process-line', 111, 357, 906, 2, C.border);
  for (const s of steps) {
    addShape(slide, 'ellipse', `step-${s.n}-circle`, s.x, 341, 34, 34, C.white, s.n === '04' ? C.amber : C.indigo, 1.5);
    addText(slide, `step-${s.n}-number`, s.n, s.x, 342, 34, 32, 9, s.n === '04' ? C.amber : C.indigo, { bold: true, align: 'center' });
    addText(slide, `step-${s.n}-title`, s.title, s.x, 393, 244, 29, 16, C.ink, { bold: true });
    addText(slide, `step-${s.n}-body`, s.body, s.x, 429, 244, 70, 14, C.muted);
  }

  addShape(slide, 'roundRect', 'relaxation-rule-bg', 72, 547, 680, 91, C.ink, C.ink, 1);
  addText(slide, 'relaxation-rule-label', 'EDGE RELAXATION', 94, 560, 240, 18, 10, '#8EA0FF', { bold: true });
  addText(slide, 'relaxation-rule', 'd[v] ← min(d[v], d[u] + w(u,v))', 94, 583, 620, 39, 20, C.white, { bold: true });
  addText(slide, 'complexity-label', 'COST', 802, 548, 120, 20, 10, C.indigo, { bold: true });
  addText(slide, 'complexity-time', 'Time  O(VE)', 802, 574, 190, 30, 17, C.ink, { bold: true });
  addText(slide, 'complexity-space', 'Space  O(V + E)', 1000, 574, 205, 30, 17, C.ink, { bold: true });
  addText(slide, 'complexity-note', 'V = vertices  ·  E = edges', 802, 607, 390, 22, 12, C.muted);
  slide.speakerNotes.text = 'Bellman–Ford starts with a source distance of zero and all other distances at infinity. It repeatedly relaxes every edge, up to V−1 passes. A final scan checks whether any reachable distance can still decrease; if so, a reachable negative-weight cycle exists, so shortest paths through that cycle are not well-defined.';
}

// Slide 2 — worked graph with one negative edge and pass-by-pass distances.
{
  const slide = makeSlide('02  /  Worked example', 'Worked Example: Edge Relaxation', 'Follow the distance updates from source S through one directed graph.');
  addText(slide, 'trace-label', 'DISTANCE TRACE', 72, 215, 250, 22, 11, C.indigo, { bold: true });
  addText(slide, 'initialize-title', 'Initialize', 72, 246, 280, 27, 16, C.ink, { bold: true });
  addText(slide, 'initialize-values', 'S = 0;  A = B = C = ∞', 72, 278, 340, 30, 15, C.green, { bold: true });
  addText(slide, 'pass-one-title', 'Pass 1 · relax each edge', 72, 331, 340, 27, 16, C.ink, { bold: true });
  addText(slide, 'pass-one-body', 'S→A sets A=4. S→B first sets B=5; A→B (−2) improves B to 2. A→C sets C=8; B→C (3) improves C to 5.', 72, 364, 340, 105, 14, C.muted);
  addText(slide, 'pass-two-title', 'Pass 2', 72, 487, 280, 27, 16, C.ink, { bold: true });
  addText(slide, 'pass-two-body', 'No distance changes, so the algorithm stops early. The extra scan finds no negative cycle in this example.', 72, 520, 340, 65, 14, C.muted);
  addShape(slide, 'roundRect', 'example-result-bg', 72, 603, 340, 56, C.paleGreen, '#BFE7D6', 1);
  addText(slide, 'example-result', 'Shortest route to C: S → A → B → C = 5', 87, 611, 310, 42, 14, C.green, { bold: true });

  addText(slide, 'graph-heading', 'Directed graph · edge weights', 475, 213, 490, 30, 19, C.ink, { bold: true });
  const nodes = {
    S: addShape(slide, 'ellipse', 'vertex-S', 512, 320, 78, 78, C.white, C.greenFill, 2.4),
    A: addShape(slide, 'ellipse', 'vertex-A', 770, 246, 78, 78, C.white, C.greenFill, 2.4),
    B: addShape(slide, 'ellipse', 'vertex-B', 770, 424, 78, 78, C.white, C.greenFill, 2.4),
    C: addShape(slide, 'ellipse', 'vertex-C', 1040, 320, 78, 78, C.white, C.greenFill, 2.4),
  };
  const edges = [
    ['S', 'A', 'right', 'left', C.greenFill, 3],
    ['S', 'B', 'right', 'left', C.quiet, 1.8],
    ['A', 'B', 'bottom', 'top', C.greenFill, 3],
    ['A', 'C', 'right', 'left', C.quiet, 1.8],
    ['B', 'C', 'right', 'left', C.greenFill, 3],
  ];
  for (const [from, to, fromSide, toSide, color, width] of edges) {
    slide.shapes.connect(nodes[from], nodes[to], { kind: 'straight', fromSide, toSide, line: { style: 'solid', fill: color, width }, tail: { type: 'triangle', width: 'med', length: 'med' } });
  }
  const nodePositions = { S: [512, 320, 'START'], A: [770, 246, 'A'], B: [770, 424, 'B'], C: [1040, 320, 'C'] };
  for (const [key, [x, y, label]] of Object.entries(nodePositions)) addText(slide, `vertex-label-${key}`, label, x, y + 17, 78, 42, key === 'S' ? 10 : 20, key === 'S' ? C.green : C.ink, { bold: true, align: 'center' });
  const weights = [
    ['S-A', '4', 640, 264, C.green], ['S-B', '5', 640, 415, C.muted],
    ['A-B', '−2', 798, 342, C.green], ['A-C', '4', 923, 273, C.muted], ['B-C', '3', 923, 416, C.green],
  ];
  for (const [id, value, x, y, color] of weights) {
    addShape(slide, 'roundRect', `weight-${id}-bg`, x, y, 40, 28, C.white, C.border, 1);
    addText(slide, `weight-${id}`, value, x, y, 40, 27, 13, color, { bold: true, align: 'center' });
  }
  addShape(slide, 'rect', 'graph-bottom-rule', 475, 538, 733, 1, C.border);
  addText(slide, 'distance-order', 'DISTANCES FROM S  ·  ORDER: S / A / B / C', 475, 550, 420, 19, 10, C.muted, { bold: true });
  addText(slide, 'distance-initial', 'Start   0 / ∞ / ∞ / ∞', 475, 579, 205, 24, 11, C.muted);
  addShape(slide, 'rect', 'distance-divider', 690, 581, 1, 20, C.border);
  addText(slide, 'distance-pass-1', 'Pass 1   0 / 4 / 2 / 5', 706, 577, 204, 27, 11, C.ink, { bold: true });
  addShape(slide, 'rect', 'distance-divider-2', 922, 581, 1, 20, C.border);
  addText(slide, 'distance-pass-2', 'Pass 2   unchanged → stop', 938, 573, 270, 35, 10, C.muted);
  slide.speakerNotes.text = 'Distances are shown in S, A, B, C order. On the first pass, S→A sets A=4 and S→B initially sets B=5. A→B has weight −2, so B improves to 2. A→C first gives C=8, then B→C with weight 3 improves C to 5. The second pass makes no changes. The shortest route to C is S→A→B→C, with total weight 4−2+3=5.';
}

// Slide 3 — architecture of the actual Exchange Lab implementation.
{
  const slide = makeSlide('03  /  System design', 'Project Architecture', 'A browser interface connects to a lightweight C++ server and its analysis pipeline.');
  addText(slide, 'browser-label', 'CLIENT', 72, 230, 150, 20, 10, C.indigo, { bold: true });
  const browser = addShape(slide, 'roundRect', 'browser-component', 72, 262, 285, 278, C.white, C.border, 1.3);
  addText(slide, 'browser-title', 'Browser UI', 94, 283, 240, 32, 20, C.ink, { bold: true });
  addText(slide, 'browser-files', 'HTML  ·  CSS  ·  JavaScript', 94, 320, 240, 22, 11, C.indigo, { bold: true });
  addShape(slide, 'rect', 'browser-rule', 94, 354, 238, 1, C.border);
  addText(slide, 'browser-pages-label', 'THREE PAGES', 94, 369, 200, 18, 10, C.muted, { bold: true });
  addText(slide, 'browser-pages', 'Overview\nExchange rates\nArbitrage analysis', 94, 393, 235, 83, 14, C.ink);
  addText(slide, 'browser-role', 'Collects amount and fee; displays rates, routes and results.', 94, 483, 238, 45, 12, C.muted);

  // The grouped server region contains the API handlers and analysis code.
  addShape(slide, 'roundRect', 'server-boundary', 415, 226, 793, 370, C.soft, C.border, 1.3);
  addText(slide, 'server-label', 'C++ HTTP SERVER  ·  src/server.cpp', 440, 242, 700, 25, 11, C.indigo, { bold: true });

  const api = addShape(slide, 'roundRect', 'api-module', 440, 294, 212, 242, C.white, C.border, 1.1);
  addText(slide, 'api-title', 'HTTP API', 458, 312, 175, 29, 17, C.ink, { bold: true });
  addText(slide, 'api-get', 'GET  /api/rates', 458, 359, 175, 24, 12, C.green, { bold: true });
  addText(slide, 'api-get-desc', 'Returns the sample rate book', 458, 385, 175, 38, 11, C.muted);
  addText(slide, 'api-post', 'POST  /api/analyze', 458, 439, 175, 24, 12, C.indigo, { bold: true });
  addText(slide, 'api-post-desc', 'Accepts starting amount + fee', 458, 465, 175, 42, 11, C.muted);

  const engine = addShape(slide, 'roundRect', 'analysis-module', 680, 294, 277, 242, C.white, C.border, 1.1);
  addText(slide, 'engine-title', 'Analysis pipeline', 700, 312, 235, 29, 17, C.ink, { bold: true });
  addText(slide, 'engine-data', 'Sample rates → directed graph', 700, 354, 235, 27, 12, C.ink, { bold: true });
  addText(slide, 'engine-weight', 'Weight each edge: −ln(rate × (1 − fee))', 700, 389, 235, 46, 11, C.muted);
  addText(slide, 'engine-bf', 'Bellman–Ford checks for negative cycles', 700, 442, 235, 43, 12, C.green, { bold: true });
  addText(slide, 'engine-enum', 'Unique cycles are enumerated and ranked by net return.', 700, 489, 235, 38, 11, C.muted);

  const output = addShape(slide, 'roundRect', 'json-output', 985, 294, 198, 242, C.white, C.border, 1.1);
  addText(slide, 'output-title', 'JSON results', 1004, 312, 160, 29, 17, C.ink, { bold: true });
  addText(slide, 'output-items', 'Cycle paths\nGross / net rates\nFinal amount\nEstimated profit', 1004, 361, 158, 102, 12, C.ink);
  addShape(slide, 'roundRect', 'json-chip', 1004, 480, 152, 31, C.paleGreen, '#BFE7D6', 1);
  addText(slide, 'json-chip-text', 'Returned to browser', 1004, 482, 152, 26, 10, C.green, { bold: true, align: 'center' });

  // Browser/server exchange and internal module flow.
  const clientRequest = slide.shapes.connect(browser, api, { kind: 'straight', fromSide: 'right', toSide: 'left', line: { style: 'solid', fill: C.indigo, width: 2.5 }, tail: { type: 'triangle', width: 'sm', length: 'sm' } });
  const apiToEngine = slide.shapes.connect(api, engine, { kind: 'straight', fromSide: 'right', toSide: 'left', line: { style: 'solid', fill: C.greenFill, width: 2.5 }, tail: { type: 'triangle', width: 'sm', length: 'sm' } });
  const engineToOutput = slide.shapes.connect(engine, output, { kind: 'straight', fromSide: 'right', toSide: 'left', line: { style: 'solid', fill: C.greenFill, width: 2.5 }, tail: { type: 'triangle', width: 'sm', length: 'sm' } });
  clientRequest.bringToFront();apiToEngine.bringToFront();engineToOutput.bringToFront();
  addText(slide, 'request-label', 'HTTP / JSON', 355, 344, 83, 42, 9, C.indigo, { bold: true, align: 'center' });
  addText(slide, 'internal-label', 'rates + inputs', 620, 551, 119, 20, 9, C.muted, { align: 'center' });
  addText(slide, 'architecture-footnote', 'Illustrative sample data only  ·  No live market feed or order execution', 415, 620, 793, 23, 12, C.muted, { align: 'center' });
  slide.speakerNotes.text = 'The browser interface has Overview, Exchange Rates, and Analysis pages. The vanilla JavaScript client requests the sample rates and submits the amount and fee to the C++ HTTP server. The server serves the pages and exposes GET /api/rates and POST /api/analyze. Inside the server, rates are transformed into edge weights, Bellman–Ford checks for negative cycles, unique conversion cycles are enumerated and ranked, and the server returns route and amount data as JSON. The sample rates are illustrative and no live market data or trading orders are used.';
}

const preview = await deck.export({ format: 'webp', montage: true });
await fs.writeFile(`${outDir}/three-slides-montage.webp`, new Uint8Array(await preview.arrayBuffer()));
for (const [i, slide] of deck.slides.items.entries()) {
  const png = await deck.export({ slide, format: 'png', scale: 1 });
  await fs.writeFile(`${outDir}/three-slides-${String(i + 1).padStart(2, '0')}.png`, new Uint8Array(await png.arrayBuffer()));
}
const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(candidatePath);
console.log(JSON.stringify({ candidatePath, slideCount: deck.slides.items.length, font }));
