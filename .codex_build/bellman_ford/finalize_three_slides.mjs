import path from 'node:path';
import { pathToFileURL } from 'node:url';

const skillDir = '/Users/anushkamaurya/.codex/plugins/cache/openai-primary-runtime/presentations/26.1116.12020/skills/presentations';
const workspaceDir = '/Users/anushkamaurya/Desktop/Currency_Exchange _ADSA_Project';
const candidatePath = path.join(workspaceDir, '.codex_build/bellman_ford/three-slides-candidate-v2.pptx');
const finalPath = path.join(workspaceDir, 'deliverables/Bellman_Ford_Theory_Example_Architecture_v2.pptx');
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href);
const result = await finalizePresentation({
  explicitTotalSlideCount: 3,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: '/Users/anushkamaurya/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
  integrityValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  fontPolicy: { basis: 'design', families: ['Helvetica Neue'] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(workspaceDir, '.codex_build/bellman_ford/three-slides-validation-v2.json'),
});
console.log(JSON.stringify(result, null, 2));
