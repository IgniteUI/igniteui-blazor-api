const fs = require('fs');
const path = require('path');

const API_JSON_DIR = path.join(__dirname, '..', 'api-json', 'api');
const TOC_PATH = path.join(API_JSON_DIR, 'toc.json');


function expandItem(item) {
    const ref = item.href || item.uid + '.json';
    if (ref) {
        const filePath = path.join(API_JSON_DIR, ref);
        if (fs.existsSync(filePath)) {
            try {
                let fileContent = fs.readFileSync(filePath, 'utf-8');
                fileContent = fileContent.replace(/,\s*([\]}])/g, '$1');
                // Strip HTML tags from "text" values inside summary arrays
                // to avoid unescaped quotes/attributes breaking JSON
                fileContent = fileContent.replace(/"text":\s*"((?:[^"\\]|\\.)*)"/g, (match, val) => {
                    let clean = val;
                    // Decode HTML entities first
                    clean = clean.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
                    // Strip HTML tags
                    clean = clean.replace(/<[^>]*>/g, '');
                    // Collapse whitespace and escaped newlines
                    clean = clean.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
                    // Escape any double quotes for valid JSON
                    clean = clean.replace(/"/g, '\\"');
                    return `"text": "${clean}"`;
                });
                const content = JSON.parse(fileContent);
                Object.assign(item, content);
                delete item.href;
            } catch (e) {
                console.warn(`Warning: could not parse ${ref}: ${e.message}`);
            }
        }
    }
    // Recurse into nested items
    if (item.children && Array.isArray(item.children)) {
        item.children.forEach(expandItem);
    }
}

// Read & fix trailing commas from Mustache output (e.g. single-item arrays)
let raw = fs.readFileSync(TOC_PATH, 'utf-8');
raw = raw.replace(/,\s*([\]}])/g, '$1');

const toc = JSON.parse(raw);
toc.children.forEach(expandItem);

const TOC_PATH_2 = path.join(__dirname, '..', 'api-json', toc.name + '.json');
fs.writeFileSync(TOC_PATH_2, JSON.stringify(toc, null, 2), 'utf-8');
console.log(`Expanded ${TOC_PATH_2} — all hrefs inlined.`);
