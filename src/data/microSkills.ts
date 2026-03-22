import { MicroSkill } from '../types';

export const MICRO_SKILLS: MicroSkill[] = [
  {
    id: 'reading-1',
    type: 'reading',
    title: 'Reading Mini: True/False/Not Given',
    passage: 'The Great Wall of China is one of the most famous landmarks in the world. It was built over many centuries by different dynasties to protect the country from invasions. Contrary to popular belief, it is not visible from space with the naked eye.',
    question: 'The Great Wall of China was built by a single dynasty.',
    options: ['True', 'False', 'Not Given'],
    correctAnswer: 'False',
    explanation: 'The passage states it was built by "different dynasties", not a single one.',
    hint: 'Look for the word "dynasties" in the text.'
  },
  {
    id: 'reading-2',
    type: 'reading',
    title: 'Reading Mini: Matching Headings',
    passage: 'Coffee is one of the most popular beverages globally. It is grown in over 70 countries, primarily in the equatorial regions of the Americas, Southeast Asia, India, and Africa. The two most commonly grown coffee beans are Arabica and Robusta.',
    question: 'Which heading best fits this paragraph?',
    options: ['The History of Coffee', 'Global Coffee Production', 'The Health Benefits of Coffee'],
    correctAnswer: 'Global Coffee Production',
    explanation: 'The paragraph discusses where coffee is grown and the types of beans produced globally.',
    hint: 'Focus on the geographical locations mentioned.'
  },
  {
    id: 'listening-1',
    type: 'listening',
    title: 'Listening Mini: Form Completion',
    audioText: 'Hello, I would like to book a room for two nights. My name is Mark Thompson, that is T-H-O-M-P-S-O-N.',
    question: 'Name: Mark ________',
    correctAnswer: 'Thompson',
    explanation: 'The speaker spells out his last name: T-H-O-M-P-S-O-N.',
    hint: 'Listen for the spelling.'
  },
  {
    id: 'listening-2',
    type: 'listening',
    title: 'Listening Mini: Number Dictation',
    audioText: 'The total cost of your order comes to forty-five pounds and fifty pence.',
    question: 'Total Cost: £ ________',
    correctAnswer: '45.50',
    explanation: 'The speaker says "forty-five pounds and fifty pence", which is 45.50.',
    hint: 'Listen for the numbers "forty-five" and "fifty".'
  }
];
