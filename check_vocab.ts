import * as fs from 'fs';

const content = fs.readFileSync('./src/data/roadmap_vocab.ts', 'utf-8');

const idMatches = [...content.matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]);
const wordMatches = [...content.matchAll(/word:\s*"([^"]+)"/g)].map(m => m[1]);

const idCounts: Record<string, number> = {};
idMatches.forEach(id => {
  idCounts[id] = (idCounts[id] || 0) + 1;
});

const wordCounts: Record<string, number> = {};
wordMatches.forEach(w => {
  const lower = w.toLowerCase();
  wordCounts[lower] = (wordCounts[lower] || 0) + 1;
});

const duplicateIds = Object.entries(idCounts).filter(([_, count]) => count > 1);
const duplicateWords = Object.entries(wordCounts).filter(([_, count]) => count > 1);

console.log(`Total entries: ${idMatches.length}`);
console.log(`Unique IDs: ${Object.keys(idCounts).length}`);
console.log(`Duplicate IDs count: ${duplicateIds.length} (Total duplicate occurrences: ${duplicateIds.reduce((acc, [_, c]) => acc + c - 1, 0)})`);

console.log(`Unique Words: ${Object.keys(wordCounts).length}`);
console.log(`Duplicate Words count: ${duplicateWords.length} (Total duplicate occurrences: ${duplicateWords.reduce((acc, [_, c]) => acc + c - 1, 0)})`);

// Sample of duplicate IDs
console.log(`Sample Duplicate IDs: ${duplicateIds.slice(0, 10).map(d => `${d[0]} (${d[1]}x)`).join(', ')}`);
// Sample of duplicate Words
console.log(`Sample Duplicate Words: ${duplicateWords.slice(0, 10).map(d => `${d[0]} (${d[1]}x)`).join(', ')}`);

