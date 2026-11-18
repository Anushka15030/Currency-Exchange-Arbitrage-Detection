import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';
const dir = '/Users/anushkamaurya/Desktop/Currency_Exchange _ADSA_Project/.codex_build/bellman_ford';
const deck = await PresentationFile.importPptx(await FileBlob.load('/Users/anushkamaurya/Desktop/Currency_Exchange _ADSA_Project/deliverables/Bellman_Ford_Theory_Example_Architecture_v2.pptx'));
for (const [i, slide] of deck.slides.items.entries()) {
  const png = await deck.export({ slide, format: 'png', scale: 1 });
  await fs.writeFile(`${dir}/final-v2-slide-${String(i + 1).padStart(2, '0')}.png`, new Uint8Array(await png.arrayBuffer()));
}
console.log(JSON.stringify({ slideCount: deck.slides.items.length }));
