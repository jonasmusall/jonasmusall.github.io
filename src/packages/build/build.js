const fs = require('fs/promises');
const { JSDOM } = require('jsdom');
const { marked } = require('marked');

build();

async function build() {
    const dom = await getTemplate();
    const { document } = dom.window;
    const md = await fs.readFile('../../pages/index.md', 'utf8');
    dom.window.document.querySelector('main').innerHTML = marked.parse(md);
    await fs.writeFile('../../../index.html', dom.serialize(), 'utf8');
}

/**
 * @returns {Promise<JSDOM>}
 */
async function getTemplate() {
    return new JSDOM(await fs.readFile('../../templates/article.html', 'utf8'));
}
