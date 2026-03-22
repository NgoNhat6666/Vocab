import * as fs from 'fs';

const content = fs.readFileSync('./src/data/roadmap_vocab.ts', 'utf-8');

// Extract the array part
const arrayStart = content.indexOf('[');
const arrayEnd = content.lastIndexOf(']');
const arrayString = content.substring(arrayStart, arrayEnd + 1);

// Evaluate the array
const CAMBRIDGE_ROADMAP = eval('(' + arrayString + ')');

const uniqueWords = new Map<string, boolean>();
const filteredVocab: any[] = [];

// 1. Lọc từ trùng lặp (giữ lại lần xuất hiện đầu tiên)
for (const item of CAMBRIDGE_ROADMAP) {
  const lowerWord = item.word.toLowerCase().trim();
  if (!uniqueWords.has(lowerWord)) {
    uniqueWords.set(lowerWord, true);
    filteredVocab.push(item);
  }
}

// 2. Đánh lại ID tuần tự cho từng Band
const bandCounters: Record<number, number> = {};
for (const item of filteredVocab) {
  const band = item.band;
  if (!bandCounters[band]) {
    bandCounters[band] = 1;
  }
  item.id = `w_b${band}_${bandCounters[band]}`;
  bandCounters[band]++;
}

// 3. Tạo lại nội dung file
let output = `import { Word } from "../types";\n\nexport const CAMBRIDGE_ROADMAP: Word[] = [\n`;

const entries = filteredVocab.map(item => {
  return `  {
    id: "${item.id}",
    word: ${JSON.stringify(item.word)},
    ipa: ${JSON.stringify(item.ipa)},
    image: ${JSON.stringify(item.image)},
    definition: ${JSON.stringify(item.definition)},
    vietnameseDefinition: ${JSON.stringify(item.vietnameseDefinition)},
    collocations: ${JSON.stringify(item.collocations)},
    example: ${JSON.stringify(item.example)},
    vietnameseExample: ${JSON.stringify(item.vietnameseExample)},
    level: "${item.level}",
    band: ${item.band},
    topicId: "${item.topicId}"
  }`;
});

output += entries.join(',\n');
output += `\n];\n`;

// 4. Ghi đè file
fs.writeFileSync('./src/data/roadmap_vocab.ts', output, 'utf-8');

console.log(`Cleanup complete!`);
console.log(`Original count: ${CAMBRIDGE_ROADMAP.length}`);
console.log(`New count (unique): ${filteredVocab.length}`);
console.log(`Band distribution:`, bandCounters);
