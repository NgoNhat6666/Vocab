import * as fs from 'fs';

try {
    const content = fs.readFileSync('./src/data/roadmap_vocab.ts', 'utf-8');
    const arrayStart = content.indexOf('[');
    const arrayEnd = content.lastIndexOf(']');
    const arrayString = content.substring(arrayStart, arrayEnd + 1);
    const CAMBRIDGE_ROADMAP = eval('(' + arrayString + ')');

    const wordMap = new Map<string, any[]>();
    const duplicates: any[] = [];

    CAMBRIDGE_ROADMAP.forEach((item: any) => {
        const lowerWord = item.word.toLowerCase().trim();
        if (wordMap.has(lowerWord)) {
            wordMap.get(lowerWord)!.push(item);
            if (!duplicates.includes(lowerWord)) {
                duplicates.push(lowerWord);
            }
        } else {
            wordMap.set(lowerWord, [item]);
        }
    });

    let count = 0;
    duplicates.forEach(dup => {
        if (count < 5) {
            const items = wordMap.get(dup)!;
            console.log(`\nWord: ${dup}`);
            items.forEach(i => {
                console.log(`- Band ${i.band} (${i.id}): ${i.definition}`);
            });
            count++;
        }
    });
    
} catch (error) {
    console.error(error);
}
