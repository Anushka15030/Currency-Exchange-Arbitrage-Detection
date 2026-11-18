import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';
const filePath = '/Users/anushkamaurya/Desktop/Currency_Exchange _ADSA_Project/deliverables/Bellman_Ford_Algorithm_Explainer.pptx';
const outputPath = '/Users/anushkamaurya/Desktop/Currency_Exchange _ADSA_Project/.codex_build/bellman_ford/final-slide.png';
const deck = await PresentationFile.importPptx(await FileBlob.load(filePath));
const slide = deck.slides.getItem(0);
const png = await deck.export({ slide, format: 'png', scale: 1 });
await fs.writeFile(outputPath, new Uint8Array(await png.arrayBuffer()));
console.log(JSON.stringify({ outputPath, slideCount: deck.slides.items.length }));
