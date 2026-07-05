import fs from 'fs';

const html = fs.readFileSync('d:\\TNCB\\thamkhao\\Apple (Việt Nam) (7_5_2026 4：39：43 PM).html', 'utf8');

// Find all CSS class definitions containing "hero" or "tile"
const cssBlocks = [];
const regex = /<style[^>]*>([\s\S]*?)<\/style>/g;
let match;
while ((match = regex.exec(html)) !== null) {
  cssBlocks.push(match[1]);
}

console.log('--- CSS Blocks Found ---', cssBlocks.length);

// Let's search inside cssBlocks for class definitions
const rules = [];
cssBlocks.forEach(css => {
  const lines = css.split('\n');
  lines.forEach(line => {
    if (line.includes('.section-hero') || line.includes('.tile-') || line.includes('.promo')) {
      rules.push(line.trim());
    }
  });
});

console.log('--- Matching CSS Lines ---');
console.log(rules.slice(0, 50));
