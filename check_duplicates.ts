import * as fs from 'fs';

try {
    const content = fs.readFileSync('./src/data/roadmap_vocab.ts', 'utf-8');
    const arrayStart = content.indexOf('[');
    const arrayEnd = content.lastIndexOf(']');
    const arrayString = content.substring(arrayStart, arrayEnd + 1);
    
    // Parse the array
    const CAMBRIDGE_ROADMAP = eval('(' + arrayString + ')');

    const wordMap = new Map<string, any[]>();
    const duplicates: string[] = [];
    const bandCounts: Record<number, number> = {};

    CAMBRIDGE_ROADMAP.forEach((item: any) => {
        const lowerWord = item.word.toLowerCase().trim();
        
        // Count bands
        bandCounts[item.band] = (bandCounts[item.band] || 0) + 1;

        // Check duplicates
        if (wordMap.has(lowerWord)) {
            wordMap.get(lowerWord)!.push(item);
            if (!duplicates.includes(lowerWord)) {
                duplicates.push(lowerWord);
            }
        } else {
            wordMap.set(lowerWord, [item]);
        }
    });

    console.log(`Total words in database: ${CAMBRIDGE_ROADMAP.length}`);
    console.log('--- Breakdown by Band ---');
    Object.keys(bandCounts).sort().forEach(band => {
        console.log(`Band ${band}: ${bandCounts[parseInt(band)]} words`);
    });
    
    console.log('\n--- Duplicate Check ---');
    if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} duplicate words:`);
        duplicates.forEach(dup => {
            const items = wordMap.get(dup)!;
            console.log(`- "${dup}": found ${items.length} times. Bands: [${items.map(i => i.band).join(', ')}] (IDs: ${items.map(i => i.id).join(', ')})`);
        });
    } else {
        console.log('No duplicate words found! The vocabulary list is clean.');
    }
} catch (error) {
    console.error("Error analyzing data:", error);
}
