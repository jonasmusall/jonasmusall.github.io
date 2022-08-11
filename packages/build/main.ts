import * as fs from 'fs/promises';
import * as path from 'path';
import { build, loadTemplates, traverse } from './build.js';

const SRC_ROOT = path.resolve('../../src');
const OUT_ROOT = path.resolve('../../_site');
const TEMPLATE_DIR = path.resolve('../../templates');

let templates: { [name: string]: string } = {};

async function main() {
  templates = await loadTemplates(TEMPLATE_DIR);

  traverse(SRC_ROOT, '', handleFile);
}

async function handleFile(subpath: string): Promise<void> {
  const ext = path.extname(subpath);
  const srcPath = path.join(SRC_ROOT, subpath);
  const outPath = path.join(OUT_ROOT, subpath);
  const outDir = path.dirname(outPath);
  await fs.mkdir(outDir, { recursive: true });

  if (ext === '.md') {
    let contents = await fs.readFile(srcPath, 'utf8');
    const endconfig = contents.indexOf('ENDCONFIG');
    let config: any = {};
    if (endconfig >= 0) {
      config = JSON.parse(contents.substring(0, endconfig));
      contents = contents.substring(endconfig + 9);
    }
    let templateName = 'default';
    if (config.template !== undefined && templates[config.template] !== undefined) {
      templateName = config.template;
    }
    console.log(`Building "${subpath}" with template "${templateName}".`);
    await fs.writeFile(
      path.join(outDir, `${path.basename(outPath, '.md')}.html`),
      build(contents, templates[templateName]),
      'utf8'
    );
  } else {
    console.log(`Copying "${subpath}".`);
    await fs.copyFile(srcPath, outPath);
  }
}

main();
