const fs = require('fs/promises');
const path = require('path');
const { JSDOM } = require('jsdom');
const { marked } = require('marked');

const SRC_ROOT = path.resolve(__dirname, '../../src');
const OUT_ROOT = path.resolve(__dirname, '../../_site');

build();

async function build() {
    traverse(SRC_ROOT, '', handleFile);
}

async function handleFile(file) {
    const srcPath = path.join(SRC_ROOT, file);
    const outPath = path.join(OUT_ROOT, file);
    const outDir = path.dirname(outPath);
    await fs.mkdir(outDir, { recursive: true });

    if (path.extname(file) == '.md') {
        const dom = await getTemplate();
        const { document } = dom.window;
        const md = await fs.readFile(srcPath, 'utf8');
        document.querySelector('main').innerHTML = marked.parse(md);
        await fs.writeFile(path.join(outDir, path.basename(file, '.md') + '.html'), dom.serialize(), 'utf8');
    } else {
        await fs.copyFile(srcPath, outPath);
    }
}

async function traverse(root, dir, callback) {
    const entries = await fs.readdir(path.resolve(root, dir), { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            traverse(root, path.join(dir, entry.name), callback);
        } else {
            callback(path.join(dir, entry.name));
        }
    }
}

/**
 * @returns {Promise<JSDOM>}
 */
async function getTemplate() {
    return new JSDOM(await fs.readFile('../../templates/article.html', 'utf8'));
}
