import * as fs from 'fs';

const content = fs.readFileSync('./src/data/roadmap_vocab.ts', 'utf-8');
const arrayStart = content.indexOf('[');
const arrayEnd = content.lastIndexOf(']');
const arrayString = content.substring(arrayStart, arrayEnd + 1);
const CAMBRIDGE_ROADMAP = eval('(' + arrayString + ')');

const band7Words = CAMBRIDGE_ROADMAP.filter((w: any) => w.band === 7);
console.log(`Total Band 7 words: ${band7Words.length}`);
const lastWord = band7Words[band7Words.length - 1];
console.log(`Last Band 7 word: ${lastWord.word} (ID: ${lastWord.id})`);
