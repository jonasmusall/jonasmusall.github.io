const fs = require('fs/promises');
const { JSDOM } = require('jsdom');

build();

async function build() {
    const dom = await getTemplate();
    const { document } = dom.window;
    const content = await fs.readFile('../../pages/index.md', 'utf8');
    const contentElement = document.createElement('div');
    contentElement.textContent = content;
    document.body.appendChild(contentElement);
    await fs.writeFile('../../../index.html', dom.serialize(), 'utf8');
}

/**
 * @returns {Promise<JSDOM>}
 */
async function getTemplate() {
    return new JSDOM(await fs.readFile('../../templates/default.html', 'utf8'));
}
