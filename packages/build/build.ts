import * as fs from 'fs/promises';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';

export function build(markdown: string, template: string): string {
  const dom = new JSDOM(template);
  const { document } = dom.window;
  const mainElement = document.querySelector('main');
  if (!mainElement) {
    throw new Error('Template does not contain main element.');
  }
  mainElement.innerHTML = marked.parse(markdown);
  return dom.serialize();
}

export async function traverse(root: string, subdir: string, callback: (subpath: string) => Promise<void>): Promise<void> {
  const entries = await fs.readdir(path.resolve(root, subdir), { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      traverse(root, path.join(subdir, entry.name), callback);
    } else {
      await callback(path.join(subdir, entry.name));
    }
  }
}

export async function loadTemplates(dir: string): Promise<{ [name: string]: string }> {
  let templates: { [name: string]: string } = {};
  (await fs.readdir(dir, { withFileTypes: true })).forEach(async entry => {
    if (entry.isFile() && path.extname(entry.name) === '.html') {
      templates[path.basename(entry.name, '.html')] = await fs.readFile(path.join(dir, entry.name), 'utf8');
    }
  });
  return templates;
}
