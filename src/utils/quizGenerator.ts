import { Word, QuizQuestion } from '../types';
import { CAMBRIDGE_ROADMAP } from '../data/roadmap_vocab';
import { BAND_TOPICS } from '../data/topics';

export const getWordsForTopic = (band: number, topicId: string, count: number = 5): Word[] => {
  // Try to filter words by band and topicId first
  let topicWords = CAMBRIDGE_ROADMAP.filter(w => w.band === band && w.topicId === topicId);
  
  // If no words found for this specific topicId, fallback to the slicing logic
  if (topicWords.length === 0) {
    const bandWords = CAMBRIDGE_ROADMAP.filter(w => w.band === band);
    const topicsForBand = BAND_TOPICS[band] || [];
    const topicIndex = topicsForBand.findIndex(t => t.id === topicId);
    
    if (topicIndex !== -1 && topicsForBand.length > 0) {
      const wordsPerTopic = Math.ceil(bandWords.length / topicsForBand.length);
      const startIndex = topicIndex * wordsPerTopic;
      const endIndex = startIndex + wordsPerTopic;
      topicWords = bandWords.slice(startIndex, endIndex);
    } else {
      topicWords = bandWords;
    }
  }

  // If still no words (e.g., empty band), return empty
  if (topicWords.length === 0) return [];

  // Also get some words from previous bands/topics for review
  const otherWords = CAMBRIDGE_ROADMAP.filter(w => w.band < band);
  
  // Mix topic words with review words
  // 70% from current topic, 30% from review
  const mainCount = Math.ceil(count * 0.7);
  const reviewCount = count - mainCount;

  const shuffledTopicWords = [...topicWords].sort(() => 0.5 - Math.random());
  const shuffledReviewWords = [...otherWords].sort(() => 0.5 - Math.random());

  const selectedWords = shuffledTopicWords.slice(0, mainCount);
  
  if (selectedWords.length < count && shuffledReviewWords.length > 0) {
    selectedWords.push(...shuffledReviewWords.slice(0, count - selectedWords.length));
  }

  // If still not enough words, take more from the current topic
  if (selectedWords.length < count) {
    const remainingTopicWords = shuffledTopicWords.slice(mainCount);
    selectedWords.push(...remainingTopicWords.slice(0, count - selectedWords.length));
  }

  return selectedWords;
};

export const generateQuiz = (band: number, topicId: string, count: number = 5): QuizQuestion[] => {
  const selectedWords = getWordsForTopic(band, topicId, count);

  return selectedWords.map((word) => {
    const typeRand = Math.random();
    let type: QuizQuestion['type'] = 'definition';
    let question = '';
    let correctAnswer = '';
    let options: string[] = [];
    let explanation = '';
    let pairs: { en: string; vi: string }[] | undefined;
    let scrambledWords: string[] | undefined;

    if (word.image && typeRand < 0.15) {
      type = 'image_selection';
    } else if (typeRand < 0.3) {
      type = 'definition';
    } else if (typeRand < 0.45) {
      type = 'collocation';
    } else if (typeRand < 0.55) {
      type = 'example';
    } else if (typeRand < 0.65) {
      type = 'fill_in_blank';
    } else if (typeRand < 0.75) {
      type = 'audio';
    } else if (typeRand < 0.85) {
      type = 'matching';
    } else if (typeRand < 0.95) {
      type = 'typing';
    } else {
      type = 'sentence_building';
    }

    if (type === 'image_selection') {
      question = `Chọn hình ảnh đúng cho từ: "${word.word}"`;
      correctAnswer = word.image!;
      explanation = `Hình ảnh này minh họa cho từ "${word.word}" (${word.vietnameseDefinition}).`;
      
      const otherImages = CAMBRIDGE_ROADMAP
        .filter(w => w.id !== word.id && w.image)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.image as string);
        
      options = [correctAnswer, ...otherImages].sort(() => 0.5 - Math.random());
      
      if (options.length < 4) {
         type = 'definition'; // fallback
      }
    }
    
    if (type === 'definition') {
      question = `Nghĩa của từ "${word.word}" là gì?`;
      correctAnswer = word.vietnameseDefinition;
      explanation = `"${word.word}" có nghĩa là: ${word.vietnameseDefinition} (${word.definition})`;
      
      const otherDefs = CAMBRIDGE_ROADMAP
        .filter(w => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.vietnameseDefinition);
      options = [correctAnswer, ...otherDefs].sort(() => 0.5 - Math.random());
    } else if (type === 'collocation') {
      const collocation = word.collocations[Math.floor(Math.random() * word.collocations.length)];
      const parts = collocation.split(' ');
      
      // Try to blank out a word that is NOT the main vocabulary word to test collocation knowledge
      const mainWordLower = word.word.toLowerCase();
      let targetIndex = parts.findIndex(p => p.toLowerCase() !== mainWordLower && p.length > 2);
      
      if (targetIndex === -1) {
        targetIndex = Math.floor(Math.random() * parts.length);
      }
      
      const targetWord = parts[targetIndex];
      const blankedCollocation = parts.map((p, i) => i === targetIndex ? '_______' : p).join(' ');
      
      // Check if example contains the collocation
      const collocationRegex = new RegExp(`\\b${collocation}\\b`, 'i');
      
      if (collocationRegex.test(word.example)) {
         const blankedSentence = word.example.replace(collocationRegex, blankedCollocation);
         question = `Điền từ thích hợp để tạo thành cụm từ đúng:\n"${blankedSentence}"`;
      } else {
         question = `Điền từ thích hợp để hoàn thành cụm từ (collocation) sau:\n"${blankedCollocation}"`;
      }
      
      correctAnswer = targetWord;
      explanation = `Cụm từ đúng là "${collocation}".`;
      
      const otherWords = CAMBRIDGE_ROADMAP
        .filter(w => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.word.toLowerCase());
      options = [correctAnswer, ...otherWords].sort(() => 0.5 - Math.random());
    } else if (type === 'example') {
      let sentence = word.example;
      let viSentence = word.vietnameseExample;

      question = `Hoàn thành câu: "${sentence.replace(new RegExp(`\\b${word.word}\\b`, 'gi'), '_______')}"\n(${viSentence})`;
      correctAnswer = word.word;
      explanation = `Từ đúng là "${word.word}". Ví dụ: ${sentence}`;
      
      const otherWords = CAMBRIDGE_ROADMAP
        .filter(w => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.word);
      options = [correctAnswer, ...otherWords].sort(() => 0.5 - Math.random());
    } else if (type === 'fill_in_blank') {
      let sentence = word.example;

      question = `Điền từ thích hợp vào chỗ trống:\n"${sentence.replace(new RegExp(`\\b${word.word}\\b`, 'gi'), '_______')}"`;
      correctAnswer = word.word;
      explanation = `Từ cần điền là "${word.word}". Nghĩa: ${word.vietnameseDefinition}`;
      
      const otherWords = CAMBRIDGE_ROADMAP
        .filter(w => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.word);
      options = [correctAnswer, ...otherWords].sort(() => 0.5 - Math.random());
    } else if (type === 'audio') {
      question = `Nghe và chọn từ đúng:`;
      correctAnswer = word.word;
      explanation = `Từ bạn vừa nghe là "${word.word}" (${word.vietnameseDefinition}).`;
      
      const otherWords = CAMBRIDGE_ROADMAP
        .filter(w => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.word);
      options = [correctAnswer, ...otherWords].sort(() => 0.5 - Math.random());
    } else if (type === 'matching') {
      question = "Ghép các từ tiếng Anh với nghĩa tiếng Việt tương ứng:";
      const otherWords = CAMBRIDGE_ROADMAP
        .filter(w => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      const allWords = [word, ...otherWords];
      pairs = allWords.map(w => ({ en: w.word, vi: w.vietnameseDefinition }));
      correctAnswer = "matched_all";
      explanation = `Tuyệt vời! Bạn đã ghép đúng tất cả các từ.`;
    } else if (type === 'typing') {
      question = `Gõ từ tiếng Anh có nghĩa là:\n"${word.vietnameseDefinition}"`;
      correctAnswer = word.word;
      explanation = `Từ đúng là "${word.word}".`;
    } else if (type === 'sentence_building') {
      question = `Sắp xếp các từ sau thành câu hoàn chỉnh:\n(${word.vietnameseExample})`;
      const cleanSentence = word.example.replace(/[.,?!]/g, '');
      const words = cleanSentence.split(' ').filter(w => w.trim().length > 0);
      let scrambled = [...words].sort(() => 0.5 - Math.random());
      while (scrambled.join(' ') === words.join(' ') && words.length > 1) {
        scrambled = [...words].sort(() => 0.5 - Math.random());
      }
      scrambledWords = scrambled;
      correctAnswer = words.join(' ');
      explanation = `Câu hoàn chỉnh là: "${word.example}"`;
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      question,
      options,
      correctAnswer,
      explanation,
      wordId: word.id,
      pairs,
      scrambledWords
    };
  });
};
