const fs = require('fs');
const path = require('path');

const API_JSON_DIR = path.join(__dirname, '..', 'api-json', 'api');
const TOC_PATH = path.join(API_JSON_DIR, 'toc.json');

function expandItem(item) {
    if (item.href) {
        const filePath = path.join(API_JSON_DIR, item.href);
        if (fs.existsSync(filePath)) {
            try {
                let fileContent = fs.readFileSync(filePath, 'utf-8');
                fileContent = fileContent.replace(/,\s*([\]}])/g, '$1');
                // Strip HTML tags from summary values before parsing
                // to avoid unescaped quotes/attributes breaking JSON
                fileContent = fileContent.replace(/"summary":\s*"((?:[^"\\]|\\.)*)"/g, (match, val) => {
                    let clean = val;
                    // Decode HTML entities first
                    clean = clean.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
                    // Strip HTML tags
                    clean = clean.replace(/<[^>]*>/g, '');
                    // Collapse whitespace and escaped newlines
                    clean = clean.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
                    // Escape any double quotes for valid JSON
                    clean = clean.replace(/"/g, '\\"');
                    return `"summary": "${clean}"`;
                });
                const content = JSON.parse(fileContent);
                // Replace href with the actual JSON content
                delete item.href;
                Object.assign(item, content);
            } catch (e) {
                console.warn(`Warning: could not parse ${item.href}: ${e.message}`);
            }
        }
    }
    // Recurse into nested items
    if (item.items && Array.isArray(item.items)) {
        item.items.forEach(expandItem);
    }
}

// Read & fix trailing commas from Mustache output (e.g. single-item arrays)
let raw = fs.readFileSync(TOC_PATH, 'utf-8');
raw = raw.replace(/,\s*([\]}])/g, '$1');

const toc = JSON.parse(raw);

toc.forEach(expandItem);

fs.writeFileSync(TOC_PATH, JSON.stringify(toc, null, 2), 'utf-8');
console.log(`Expanded ${TOC_PATH} — all hrefs inlined.`);
