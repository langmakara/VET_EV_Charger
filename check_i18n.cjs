const fs = require('fs');
const path = require('path');

const dir = 'app/helpers/languages/sources';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const langs = {};

function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(flattenKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

files.forEach(f => {
  const content = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
  langs[f] = new Set(flattenKeys(content));
});

const allKeys = new Set();
Object.values(langs).forEach(set => set.forEach(k => allKeys.add(k)));

console.log(`Total unique keys: ${allKeys.size}`);
files.forEach(f => {
  const missing = [];
  allKeys.forEach(k => {
    if (!langs[f].has(k)) missing.push(k);
  });
  console.log(`${f}: ${langs[f].size} keys, missing ${missing.length} keys`);
  if (missing.length > 0) {
     console.log(`  Missing: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? ' ...' : ''}`);
  }
});
