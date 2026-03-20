/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Star,
  Home,
  X,
  Check,
  Shield,
  User,
  MoreHorizontal,
  Heart,
  Diamond,
  Zap,
  Trophy,
  MessageCircle,
  Users,
  Coffee,
  Clock,
  Plane,
  Briefcase,
  Leaf,
  Activity,
  Smartphone,
  Globe,
  Microscope,
  TrendingUp,
  BookOpen,
  Brain,
  Scale,
  PieChart,
  Book,
  Feather,
  MessageSquare,
  Link,
  Layers,
  Volume2
} from 'lucide-react';
import { QuizQuestion, QuizState, UserStats, Word } from './types';
import { generateQuiz, getWordsForTopic } from './utils/quizGenerator';
import { BAND_TOPICS, Topic } from './data/topics';

const INITIAL_STATS: UserStats = {
  xp: 0,
  streak: 0,
  lastActive: new Date().toISOString(),
  unlockedBands: [1],
  unlockedTopics: ['1-1'],
  completedWords: [],
  completedTopics: []
};

export default function App() {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('ielts_master_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });
  
  const [view, setView] = useState<'roadmap' | 'learn' | 'quiz' | 'finished'>('roadmap');
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [learnWords, setLearnWords] = useState<Word[]>([]);
  const [learnIndex, setLearnIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // New states for interactive quizzes
  const [typingInput, setTypingInput] = useState('');
  const [sentenceBlocks, setSentenceBlocks] = useState<string[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [matchingSelected, setMatchingSelected] = useState<{text: string, lang: 'en'|'vi'} | null>(null);
  const [matchedItems, setMatchedItems] = useState<string[]>([]);
  const [matchingOptions, setMatchingOptions] = useState<{text: string, lang: 'en'|'vi'}[]>([]);
  const [matchingErrors, setMatchingErrors] = useState<string[]>([]);

  useEffect(() => {
    if (view === 'quiz' && quizState && !showFeedback) {
      const q = quizState.questions[quizState.currentQuestionIndex];
      if (q && q.type === 'sentence_building' && q.scrambledWords) {
        setAvailableBlocks([...q.scrambledWords]);
        setSentenceBlocks([]);
      }
      if (q && q.type === 'matching' && q.pairs) {
        const opts: {text: string, lang: 'en'|'vi'}[] = [];
        q.pairs.forEach(p => {
          opts.push({ text: p.en, lang: 'en' });
          opts.push({ text: p.vi, lang: 'vi' });
        });
        setMatchingOptions(opts.sort(() => 0.5 - Math.random()));
        setMatchedItems([]);
        setMatchingSelected(null);
        setMatchingErrors([]);
      }
    }
  }, [quizState?.currentQuestionIndex, view, showFeedback]);

  useEffect(() => {
    localStorage.setItem('ielts_master_stats', JSON.stringify(stats));
  }, [stats]);

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsPlayingAudio(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startLearning = (band: number, topicId: string) => {
    const words = getWordsForTopic(band, topicId, 5);
    setLearnWords(words);
    setLearnIndex(0);
    setQuizState({
      questions: [], // Will be generated after learning
      currentQuestionIndex: 0,
      score: 0,
      userAnswers: [],
      isFinished: false,
      band,
      topicId
    });
    setView('learn');
    
    // Play audio for first word
    if (words.length > 0) {
      setTimeout(() => playAudio(words[0].word), 500);
    }
  };

  const nextLearnWord = () => {
    if (learnIndex < learnWords.length - 1) {
      setLearnIndex(prev => prev + 1);
      setTimeout(() => playAudio(learnWords[learnIndex + 1].word), 500);
    } else {
      // Finished learning, start quiz
      if (quizState) {
        const questions = generateQuiz(quizState.band, quizState.topicId, 5);
        setQuizState({
          ...quizState,
          questions
        });
        setView('quiz');
        setSelectedOption(null);
        setShowFeedback(false);
        
        if (questions[0].type === 'audio') {
          setTimeout(() => playAudio(questions[0].correctAnswer), 500);
        }
      }
    }
  };

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return;
    setSelectedOption(option);
  };

  const handleMatchingClick = (item: {text: string, lang: 'en'|'vi'}) => {
    if (matchedItems.includes(item.text)) return;
    
    if (!matchingSelected) {
      setMatchingSelected(item);
    } else {
      if (matchingSelected.lang === item.lang) {
        setMatchingSelected(item);
      } else {
        const q = quizState!.questions[quizState!.currentQuestionIndex];
        const isMatch = q.pairs!.some(p => 
          (p.en === matchingSelected.text && p.vi === item.text) ||
          (p.vi === matchingSelected.text && p.en === item.text)
        );
        
        if (isMatch) {
          setMatchedItems(prev => [...prev, matchingSelected.text, item.text]);
          setMatchingSelected(null);
        } else {
          setMatchingErrors([matchingSelected.text, item.text]);
          setTimeout(() => setMatchingErrors([]), 800);
          setMatchingSelected(null);
        }
      }
    }
  };

  const handleNext = () => {
    if (!quizState) return;

    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    
    let hasAnswer = false;
    let isCorrectAnswer = false;
    
    if (currentQuestion.type === 'typing') {
      hasAnswer = typingInput.trim().length > 0;
      isCorrectAnswer = typingInput.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    } else if (currentQuestion.type === 'sentence_building') {
      hasAnswer = sentenceBlocks.length > 0;
      isCorrectAnswer = sentenceBlocks.join(' ').toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    } else if (currentQuestion.type === 'matching') {
      hasAnswer = matchedItems.length === (currentQuestion.pairs?.length || 0) * 2;
      isCorrectAnswer = hasAnswer;
    } else {
      hasAnswer = selectedOption !== null;
      isCorrectAnswer = selectedOption === currentQuestion.correctAnswer;
    }

    if (!hasAnswer) return;

    if (!showFeedback) {
      setIsCorrect(isCorrectAnswer);
      setShowFeedback(true);
      return;
    }

    const nextIndex = quizState.currentQuestionIndex + 1;
    const isFinished = nextIndex >= quizState.questions.length;

    if (isFinished) {
      const finalScore = isCorrectAnswer ? quizState.score + 1 : quizState.score;
      const xpGained = finalScore * 20;
      
      setStats(prev => {
        const newXp = prev.xp + xpGained;
        const isPassed = finalScore >= 3; // 3 out of 5 to pass
        
        const newCompletedTopics = [...(prev.completedTopics || [])];
        if (isPassed && !newCompletedTopics.includes(quizState.topicId)) {
          newCompletedTopics.push(quizState.topicId);
        }
        
        return {
          ...prev,
          xp: newXp,
          completedTopics: newCompletedTopics,
          streak: prev.streak + 1 // Simplified streak for demo
        };
      });
      
      setQuizState({
        ...quizState,
        currentQuestionIndex: nextIndex,
        score: finalScore,
        userAnswers: [...quizState.userAnswers, selectedOption || ''],
        isFinished: true,
      });
      setView('finished');
    } else {
      setQuizState({
        ...quizState,
        currentQuestionIndex: nextIndex,
        score: isCorrectAnswer ? quizState.score + 1 : quizState.score,
        userAnswers: [...quizState.userAnswers, selectedOption || ''],
        isFinished: false,
      });
      setSelectedOption(null);
      setShowFeedback(false);
      setTypingInput('');
      setSentenceBlocks([]);
      setMatchedItems([]);
      setMatchingSelected(null);
      
      // Play audio automatically if next question is audio type
      if (quizState.questions[nextIndex].type === 'audio') {
        setTimeout(() => playAudio(quizState.questions[nextIndex].correctAnswer), 500);
      }
    }
  };

  const renderRoadmap = () => {
    const maxUnlockedBand = Math.max(...stats.unlockedBands);

    // Zigzag pattern for nodes
    const getOffset = (index: number) => {
      const pattern = [0, -40, -60, -40, 0, 40, 60, 40];
      return pattern[index % pattern.length];
    };

    const IconMap: Record<string, React.ElementType> = {
      Star, MessageCircle, Users, Coffee, Clock, Heart, Plane, Briefcase,
      Leaf, Activity, Smartphone, Globe, Microscope, TrendingUp, BookOpen,
      Brain, Scale, PieChart, Book, Feather, Home, MessageSquare, Link, Layers
    };

    return (
      <div className="min-h-screen bg-white pb-24 flex flex-col items-center">
        {/* Top Header */}
        <div className="sticky top-0 z-50 w-full bg-white border-b-2 border-[#e5e5e5] px-4 py-3 flex justify-between items-center max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-[#ff9600] font-bold text-lg">
            <Flame fill="currentColor" size={24} /> {stats.streak}
          </div>
          <div className="flex items-center gap-2 text-[#1cb0f6] font-bold text-lg">
            <Diamond fill="currentColor" size={24} /> {stats.xp}
          </div>
          <div className="flex items-center gap-2 text-[#ff4b4b] font-bold text-lg">
            <Heart fill="currentColor" size={24} /> 5
          </div>
        </div>

        {/* Path Area */}
        <div className="py-8 flex flex-col items-center gap-8 relative w-full max-w-md mx-auto">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((band) => {
            const topics = BAND_TOPICS[band] || [];
            if (topics.length === 0) return null;
            
            return (
              <div key={`band-${band}`} className="w-full px-4 mb-8">
                {/* Band Header */}
                <div className={`w-full p-4 rounded-2xl border-2 mb-8 text-white ${band === 0 ? 'bg-[#ff9600] border-[#e58700]' : 'bg-[#1cb0f6] border-[#1899d6]'}`}>
                  <h2 className="text-2xl font-black uppercase tracking-wider">{band === 0 ? 'Nhập môn' : `Band ${band}`}</h2>
                  <p className="font-bold opacity-90">{band === 0 ? 'Làm quen với tiếng Anh' : 'Chọn chủ đề bất kỳ để học'}</p>
                </div>

                {/* Topics Path */}
                <div className="flex flex-col items-center gap-12 relative">
                  {/* Thick Spine Background */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-8 bg-[#e5e5e5] -translate-x-1/2 rounded-full" />

                  {topics.map((topic, i) => {
                    const isCompleted = stats.completedTopics?.includes(topic.id);
                    const offset = getOffset(i);
                    const IconComponent = topic.icon && IconMap[topic.icon] ? IconMap[topic.icon] : Star;

                    return (
                      <div key={topic.id} className="relative z-10 flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
                        <button 
                          onClick={() => startLearning(band, topic.id)}
                          className={`
                            w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold transition-all relative
                            ${isCompleted 
                              ? 'bg-[#58cc02] text-white shadow-[0_8px_0_0_#46a302] active:shadow-[0_0px_0_0_#46a302] active:translate-y-2' 
                              : band === 0 
                                ? 'bg-[#ff9600] text-white shadow-[0_8px_0_0_#e58700] active:shadow-[0_0px_0_0_#e58700] active:translate-y-2'
                                : 'bg-[#1cb0f6] text-white shadow-[0_8px_0_0_#1899d6] active:shadow-[0_0px_0_0_#1899d6] active:translate-y-2'
                            }
                          `}
                        >
                          <IconComponent fill={isCompleted ? "currentColor" : "none"} size={32} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 w-full bg-white border-t-2 border-[#e5e5e5] px-6 py-3 flex justify-around items-center z-50 max-w-2xl mx-auto">
          <button className="flex flex-col items-center text-[#1cb0f6] p-2 rounded-xl hover:bg-[#ddf4ff] transition-colors">
            <Home fill="currentColor" size={28} />
          </button>
          <button className="flex flex-col items-center text-[#afafaf] p-2 rounded-xl hover:bg-[#f7f7f7] transition-colors">
            <Shield size={28} />
          </button>
          <button className="flex flex-col items-center text-[#afafaf] p-2 rounded-xl hover:bg-[#f7f7f7] transition-colors">
            <User size={28} />
          </button>
          <button className="flex flex-col items-center text-[#afafaf] p-2 rounded-xl hover:bg-[#f7f7f7] transition-colors">
            <MoreHorizontal size={28} />
          </button>
        </div>
      </div>
    );
  };

  const renderLearn = () => {
    if (learnWords.length === 0) return null;
    const currentWord = learnWords[learnIndex];
    const progress = ((learnIndex) / learnWords.length) * 100;

    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        {/* Top Progress */}
        <div className="px-4 py-6 flex items-center gap-4 max-w-3xl mx-auto w-full">
          <button onClick={() => setView('roadmap')} className="text-[#afafaf] hover:text-[#777777] transition-colors">
            <X size={28} strokeWidth={3} />
          </button>
          <div className="flex-1 h-4 bg-[#e5e5e5] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#ff9600] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', bounce: 0 }}
            />
          </div>
        </div>

        {/* Flashcard Area */}
        <div className="flex-1 px-4 max-w-2xl mx-auto w-full flex flex-col items-center justify-center">
          <motion.div 
            key={currentWord.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white border-2 border-[#e5e5e5] rounded-3xl p-8 shadow-[0_8px_0_0_#e5e5e5] flex flex-col items-center text-center"
          >
            <button
              onClick={() => playAudio(currentWord.word)}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all mb-6 ${
                isPlayingAudio 
                  ? 'bg-[#1cb0f6] text-white shadow-[0_4px_0_0_#1899d6] translate-y-1' 
                  : 'bg-[#ddf4ff] text-[#1cb0f6] shadow-[0_8px_0_0_#84d8ff] hover:bg-[#bce9ff] active:shadow-[0_4px_0_0_#84d8ff] active:translate-y-1'
              }`}
            >
              <Volume2 size={40} />
            </button>
            
            <h2 className="text-4xl font-black text-[#4b4b4b] mb-2">{currentWord.word}</h2>
            {currentWord.ipa && (
              <p className="text-xl text-[#afafaf] font-mono mb-6">{currentWord.ipa}</p>
            )}

            {currentWord.image && (
              <div className="w-full mb-6 rounded-2xl overflow-hidden border-2 border-[#e5e5e5]">
                <img 
                  src={currentWord.image} 
                  alt={currentWord.word} 
                  className="w-full h-48 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            
            <div className="w-full h-px bg-[#e5e5e5] my-4"></div>
            
            <p className="text-2xl font-bold text-[#1cb0f6] mb-4">{currentWord.vietnameseDefinition}</p>
            
            <div className="bg-[#f7f7f7] rounded-2xl p-4 w-full text-left mt-4">
              <p className="text-[#4b4b4b] font-medium mb-2 text-lg">"{currentWord.example}"</p>
              <p className="text-[#afafaf]">{currentWord.vietnameseExample}</p>
            </div>

            {currentWord.collocations && currentWord.collocations.length > 0 && (
              <div className="w-full mt-6 text-left">
                <h3 className="text-lg font-bold text-[#afafaf] mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Link size={20} /> Cụm từ thường gặp
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentWord.collocations.map((col, idx) => {
                    const parts = col.split(new RegExp(`(${currentWord.word})`, 'gi'));
                    return (
                      <div 
                        key={idx}
                        className="px-4 py-2 bg-white border-2 border-[#e5e5e5] text-[#4b4b4b] rounded-xl font-bold cursor-default hover:bg-[#ddf4ff] hover:border-[#84d8ff] hover:text-[#1cb0f6] hover:-translate-y-1 transition-all duration-200 shadow-[0_2px_0_0_#e5e5e5] hover:shadow-[0_4px_0_0_#84d8ff]"
                      >
                        {parts.map((part, i) => 
                          part.toLowerCase() === currentWord.word.toLowerCase() 
                            ? <span key={i} className="text-[#1cb0f6]">{part}</span>
                            : <span key={i}>{part}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Action Area */}
        <div className="mt-auto border-t-2 p-4 sm:p-8 bg-white border-[#e5e5e5]">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={nextLearnWord}
              className="w-full py-4 bg-[#58cc02] text-white rounded-2xl font-bold text-xl uppercase tracking-wider shadow-[0_4px_0_0_#46a302] hover:bg-[#46a302] active:shadow-none active:translate-y-1 transition-all"
            >
              {learnIndex < learnWords.length - 1 ? 'Tiếp tục' : 'Bắt đầu bài tập'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!quizState) return null;
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const progress = ((quizState.currentQuestionIndex) / quizState.questions.length) * 100;

    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        {/* Top Progress */}
        <div className="px-4 py-6 flex items-center gap-4 max-w-3xl mx-auto w-full">
          <button onClick={() => setView('roadmap')} className="text-[#afafaf] hover:text-[#777777] transition-colors">
            <X size={28} strokeWidth={3} />
          </button>
          <div className="flex-1 h-4 bg-[#e5e5e5] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#58cc02] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', bounce: 0 }}
            />
          </div>
          <div className="text-[#ff4b4b] font-bold flex items-center gap-1 text-lg">
            <Heart fill="currentColor" size={24} /> 5
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 px-4 max-w-2xl mx-auto w-full flex flex-col">
          <h2 className="text-2xl font-bold text-[#4b4b4b] mb-8 mt-4 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {currentQuestion.type === 'audio' && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => playAudio(currentQuestion.correctAnswer)}
                className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all ${
                  isPlayingAudio 
                    ? 'bg-[#1cb0f6] text-white shadow-[0_4px_0_0_#1899d6] translate-y-1' 
                    : 'bg-[#ddf4ff] text-[#1cb0f6] shadow-[0_8px_0_0_#84d8ff] hover:bg-[#bce9ff] active:shadow-[0_4px_0_0_#84d8ff] active:translate-y-1'
                }`}
              >
                <Volume2 size={48} />
              </button>
            </div>
          )}

          {currentQuestion.type === 'image_selection' ? (
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option;
                let btnClass = "relative aspect-square rounded-2xl border-2 transition-all overflow-hidden ";
                
                if (showFeedback) {
                  if (option === currentQuestion.correctAnswer) {
                    btnClass += "border-[#58cc02] ring-4 ring-[#58cc02]/20";
                  } else if (isSelected) {
                    btnClass += "border-[#ff4b4b] opacity-50";
                  } else {
                    btnClass += "border-[#e5e5e5] opacity-50";
                  }
                } else {
                  if (isSelected) {
                    btnClass += "border-[#84d8ff] ring-4 ring-[#84d8ff]/20 shadow-[0_4px_0_0_#84d8ff] translate-y-[-4px]";
                  } else {
                    btnClass += "border-[#e5e5e5] shadow-[0_4px_0_0_#e5e5e5] hover:bg-[#f7f7f7] active:shadow-[0_0px_0_0_#e5e5e5] active:translate-y-[4px]";
                  }
                }

                return (
                  <button 
                    key={option} 
                    onClick={() => handleOptionSelect(option)} 
                    disabled={showFeedback} 
                    className={btnClass}
                  >
                    <img 
                      src={option} 
                      alt="Option" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                )
              })}
            </div>
          ) : currentQuestion.type === 'typing' ? (
            <div className="w-full">
              <input 
                type="text"
                value={typingInput}
                onChange={(e) => setTypingInput(e.target.value)}
                disabled={showFeedback}
                placeholder="Nhập câu trả lời của bạn..."
                className={`w-full p-4 rounded-2xl border-2 text-xl font-bold transition-all outline-none ${
                  showFeedback 
                    ? isCorrect ? "bg-[#d7ffb8] border-[#58cc02] text-[#58cc02]" : "bg-[#ffdfe0] border-[#ff4b4b] text-[#ff4b4b]"
                    : "bg-[#f7f7f7] border-[#e5e5e5] text-[#4b4b4b] focus:border-[#1cb0f6] focus:bg-white"
                }`}
                autoFocus
              />
            </div>
          ) : currentQuestion.type === 'sentence_building' ? (
            <div className="w-full flex flex-col gap-8">
              <div className="min-h-[80px] w-full border-b-2 border-[#e5e5e5] pb-4 flex flex-wrap gap-2 items-start">
                {sentenceBlocks.map((block, i) => (
                  <button
                    key={`sb-${i}`}
                    onClick={() => {
                      if (showFeedback) return;
                      setSentenceBlocks(prev => prev.filter((_, index) => index !== i));
                      setAvailableBlocks(prev => [...prev, block]);
                    }}
                    className="px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl font-bold text-[#4b4b4b] shadow-[0_2px_0_0_#e5e5e5] active:translate-y-[2px] active:shadow-none"
                  >
                    {block}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableBlocks.map((block, i) => (
                  <button
                    key={`ab-${i}`}
                    onClick={() => {
                      if (showFeedback) return;
                      setAvailableBlocks(prev => prev.filter((_, index) => index !== i));
                      setSentenceBlocks(prev => [...prev, block]);
                    }}
                    className="px-4 py-3 bg-white border-2 border-[#e5e5e5] rounded-xl font-bold text-[#4b4b4b] shadow-[0_2px_0_0_#e5e5e5] active:translate-y-[2px] active:shadow-none"
                  >
                    {block}
                  </button>
                ))}
              </div>
            </div>
          ) : currentQuestion.type === 'matching' ? (
            <div className="grid grid-cols-2 gap-4 w-full">
              {matchingOptions.map((opt, i) => {
                const isMatched = matchedItems.includes(opt.text);
                const isSelected = matchingSelected?.text === opt.text;
                const isError = matchingErrors.includes(opt.text);
                
                let btnClass = "p-4 rounded-2xl border-2 font-bold text-lg transition-all text-center min-h-[80px] flex items-center justify-center ";
                
                if (isMatched) {
                  btnClass += "bg-[#e5e5e5] border-[#e5e5e5] text-transparent shadow-none pointer-events-none";
                } else if (isError) {
                  btnClass += "bg-[#ffdfe0] border-[#ff4b4b] text-[#ff4b4b]";
                } else if (isSelected) {
                  btnClass += "bg-[#ddf4ff] border-[#84d8ff] text-[#1cb0f6] shadow-[0_4px_0_0_#84d8ff] translate-y-[-4px]";
                } else {
                  btnClass += "bg-white border-[#e5e5e5] text-[#4b4b4b] shadow-[0_4px_0_0_#e5e5e5] hover:bg-[#f7f7f7] active:shadow-[0_0px_0_0_#e5e5e5] active:translate-y-[4px]";
                }

                return (
                  <button
                    key={`match-${i}`}
                    onClick={() => handleMatchingClick(opt)}
                    disabled={showFeedback || isMatched}
                    className={btnClass}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option;
                let btnClass = "p-4 rounded-2xl border-2 text-left font-bold text-lg transition-all ";
                
                if (showFeedback) {
                  if (option === currentQuestion.correctAnswer) {
                    btnClass += "bg-[#d7ffb8] border-[#58cc02] text-[#58cc02]";
                  } else if (isSelected) {
                    btnClass += "bg-[#ffdfe0] border-[#ff4b4b] text-[#ff4b4b]";
                  } else {
                    btnClass += "border-[#e5e5e5] text-[#afafaf]";
                  }
                } else {
                  if (isSelected) {
                    btnClass += "bg-[#ddf4ff] border-[#84d8ff] text-[#1cb0f6] shadow-[0_4px_0_0_#84d8ff] translate-y-[-4px]";
                  } else {
                    btnClass += "bg-white border-[#e5e5e5] text-[#4b4b4b] shadow-[0_4px_0_0_#e5e5e5] hover:bg-[#f7f7f7] active:shadow-[0_0px_0_0_#e5e5e5] active:translate-y-[4px]";
                  }
                }

                return (
                  <button 
                    key={option} 
                    onClick={() => handleOptionSelect(option)} 
                    disabled={showFeedback} 
                    className={btnClass}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom Action Area */}
        <div className={`mt-auto border-t-2 p-4 sm:p-8 transition-colors duration-300 ${showFeedback ? (isCorrect ? 'bg-[#d7ffb8] border-[#d7ffb8]' : 'bg-[#ffdfe0] border-[#ffdfe0]') : 'bg-white border-[#e5e5e5]'}`}>
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
            {showFeedback && (
              <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-white text-[#58cc02]' : 'bg-white text-[#ff4b4b]'}`}>
                  {isCorrect ? <Check size={32} strokeWidth={4} /> : <X size={32} strokeWidth={4} />}
                </div>
                <div>
                  <h3 className={`text-2xl font-black ${isCorrect ? 'text-[#58cc02]' : 'text-[#ff4b4b]'}`}>
                    {isCorrect ? 'Tuyệt vời!' : 'Chưa chính xác'}
                  </h3>
                  <p className={`font-bold mt-1 ${isCorrect ? 'text-[#46a302]' : 'text-[#ea2b2b]'}`}>
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            )}

            {(() => {
              const isDisabled = !showFeedback && (
                (currentQuestion.type === 'typing' && typingInput.trim().length === 0) ||
                (currentQuestion.type === 'sentence_building' && sentenceBlocks.length === 0) ||
                (currentQuestion.type === 'matching' && matchedItems.length < (currentQuestion.pairs?.length || 0) * 2) ||
                (currentQuestion.type !== 'typing' && currentQuestion.type !== 'sentence_building' && currentQuestion.type !== 'matching' && selectedOption === null)
              );
              
              return (
                <button 
                  onClick={handleNext}
                  disabled={isDisabled}
                  className={`w-full sm:w-auto sm:min-w-[150px] py-3 px-6 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all
                    ${isDisabled ? 'bg-[#e5e5e5] text-[#afafaf]' : 
                      showFeedback ? 
                        (isCorrect ? 'bg-[#58cc02] text-white shadow-[0_4px_0_0_#46a302] hover:bg-[#46a302] active:shadow-none active:translate-y-1' : 'bg-[#ff4b4b] text-white shadow-[0_4px_0_0_#ea2b2b] hover:bg-[#ea2b2b] active:shadow-none active:translate-y-1') :
                        'bg-[#58cc02] text-white shadow-[0_4px_0_0_#46a302] hover:bg-[#46a302] active:shadow-none active:translate-y-1'
                    }
                  `}
                >
                  {showFeedback ? 'Tiếp tục' : 'Kiểm tra'}
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  const renderFinished = () => {
    if (!quizState) return null;
    const percentage = Math.round((quizState.score / quizState.questions.length) * 100);
    const xpGained = quizState.score * 20;

    return (
      <div className="min-h-screen flex flex-col bg-white p-4">
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="mb-8"
          >
            <div className="w-40 h-40 bg-[#ffc800] rounded-full flex items-center justify-center shadow-[0_8px_0_0_#e5b400]">
              <Trophy size={80} className="text-white" />
            </div>
          </motion.div>

          <h2 className="text-3xl font-black text-[#ffc800] mb-8 text-center uppercase tracking-wider">
            Bài học hoàn tất!
          </h2>

          <div className="flex gap-4 w-full mb-12">
            <div className="flex-1 bg-[#ffc800] rounded-2xl p-4 text-center border-2 border-[#ffc800] text-white shadow-[0_4px_0_0_#e5b400]">
              <div className="text-sm font-bold uppercase mb-1">Tổng điểm XP</div>
              <div className="text-2xl font-black flex items-center justify-center gap-2">
                <Zap fill="currentColor" /> {xpGained}
              </div>
            </div>
            <div className="flex-1 bg-[#1cb0f6] rounded-2xl p-4 text-center border-2 border-[#1cb0f6] text-white shadow-[0_4px_0_0_#1899d6]">
              <div className="text-sm font-bold uppercase mb-1">Chính xác</div>
              <div className="text-2xl font-black flex items-center justify-center gap-2">
                <CheckCircle2 fill="currentColor" /> {percentage}%
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 max-w-md mx-auto w-full pb-8">
          <button 
            onClick={() => setView('roadmap')}
            className="w-full py-4 bg-[#58cc02] text-white rounded-2xl font-bold text-xl uppercase tracking-wider shadow-[0_4px_0_0_#46a302] active:shadow-none active:translate-y-1 transition-all"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans selection:bg-[#ddf4ff] selection:text-[#1cb0f6]">
      {view === 'roadmap' && renderRoadmap()}
      {view === 'learn' && renderLearn()}
      {view === 'quiz' && renderQuiz()}
      {view === 'finished' && renderFinished()}
    </div>
  );
}

