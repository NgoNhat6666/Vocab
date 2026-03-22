/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Star,
  Home,
  X,
  Check,
  Shield,
  User as UserIcon,
  Calendar,
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
  Volume2,
  Mic,
  MicOff,
  Settings,
  Search,
  ChevronDown,
  Target,
  LogOut,
  LogIn,
  Sparkles,
  Send,
  Loader2
} from 'lucide-react';
import { QuizQuestion, QuizState, UserStats, Word } from './types';
import { generateQuizForWords, getWordsForTopic, getTopicStats, getReviewWords } from './utils/quizGenerator';
import { BAND_TOPICS, Topic } from './data/topics';
import { CAMBRIDGE_ROADMAP } from './data/roadmap_vocab';
import { GRAMMAR_LESSONS } from './data/grammar';
import { MICRO_SKILLS } from './data/microSkills';
import { getAIExplanation, getWritingFeedback, generateAIChatResponse } from './services/geminiService';
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';

const INITIAL_STATS: UserStats = {
  xp: 0,
  streak: 0,
  lastActive: new Date().toISOString(),
  unlockedBands: [1],
  unlockedTopics: ['1-1'],
  completedWords: [],
  completedTopics: [],
  completedGrammar: [],
  completedMicroSkills: []
};

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border-2 border-brand-red/20">
            <div className="w-20 h-20 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={48} />
            </div>
            <h2 className="text-2xl font-black text-ink mb-4 font-display">Something went wrong</h2>
            <p className="text-ink-muted mb-8 font-medium">
              We encountered an error. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 active:translate-y-1 transition-all"
            >
              Refresh App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  
  const [view, setView] = useState<'roadmap' | 'learn' | 'quiz' | 'finished' | 'profile' | 'notebook' | 'grammar_theory' | 'daily_plan' | 'micro_skills' | 'micro_skill_detail' | 'leaderboard' | 'ai_lab' | 'ai_writing' | 'ai_chat'>('roadmap');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [learnWords, setLearnWords] = useState<Word[]>([]);
  const [learnIndex, setLearnIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionReviewWords, setSessionReviewWords] = useState<Word[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Notebook states
  const [notebookFilter, setNotebookFilter] = useState<'all' | 'learned' | 'review'>('all');
  const [notebookSearch, setNotebookSearch] = useState('');
  const [selectedNotebookWord, setSelectedNotebookWord] = useState<Word | null>(null);

  // Grammar states
  const [selectedGrammarId, setSelectedGrammarId] = useState<string | null>(null);

  // Micro-skills states
  const [selectedMicroSkillId, setSelectedMicroSkillId] = useState<string | null>(null);
  const [microSkillAnswer, setMicroSkillAnswer] = useState('');
  const [showMicroSkillFeedback, setShowMicroSkillFeedback] = useState(false);
  const [isMicroSkillCorrect, setIsMicroSkillCorrect] = useState(false);

  // New states for interactive quizzes
  const [typingInput, setTypingInput] = useState('');
  const [sentenceBlocks, setSentenceBlocks] = useState<string[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [matchingSelected, setMatchingSelected] = useState<{text: string, lang: 'en'|'vi'} | null>(null);
  const [matchedItems, setMatchedItems] = useState<string[]>([]);
  const [matchingOptions, setMatchingOptions] = useState<{text: string, lang: 'en'|'vi'}[]>([]);
  const [matchingErrors, setMatchingErrors] = useState<string[]>([]);

  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechScore, setSpeechScore] = useState<number | null>(null);

  // AI Lab states
  const [aiWritingText, setAiWritingText] = useState('');
  const [aiWritingFeedback, setAiWritingFeedback] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatTopic, setAiChatTopic] = useState('Daily Life');
  const [aiExplanation, setAiExplanation] = useState<{ word: string, content: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load stats from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setStats(userDoc.data() as UserStats);
          } else {
            // Initialize new user stats
            const newStats = {
              ...INITIAL_STATS,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL
            };
            await setDoc(userDocRef, newStats);
            setStats(newStats);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setStats(INITIAL_STATS);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && isAuthReady) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setStats(doc.data() as UserStats);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      });
      return () => unsubscribe();
    }
  }, [user, isAuthReady]);

  useEffect(() => {
    if (user && isAuthReady) {
      const saveStats = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          await setDoc(userDocRef, stats, { merge: true });
          
          // Also update leaderboard
          const leaderboardRef = doc(db, 'leaderboard', user.uid);
          await setDoc(leaderboardRef, {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || '',
            xp: stats.xp
          }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      };
      
      // Debounce save to avoid too many writes
      const timeoutId = setTimeout(saveStats, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [stats, user, isAuthReady]);

  useEffect(() => {
    if (view === 'leaderboard') {
      const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(10));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        setLeaderboardData(data);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'leaderboard');
      });
      return () => unsubscribe();
    }
  }, [view]);

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
    // localStorage sync removed, now using Firestore
  }, [stats]);

  // Daily Plan Generation
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (!stats.dailyPlan || stats.dailyPlan.date !== today) {
      // Generate new plan
      const vocabTopics = Object.values(BAND_TOPICS).flat().filter(t => t.type === 'vocabulary' && !stats.completedTopics?.includes(t.id));
      const grammarTopics = Object.values(BAND_TOPICS).flat().filter(t => t.type === 'grammar' && !stats.completedGrammar?.includes(t.id));
      
      const selectedVocab = vocabTopics.sort(() => 0.5 - Math.random()).slice(0, 2);
      const selectedGrammar = grammarTopics.sort(() => 0.5 - Math.random()).slice(0, 1);
      
      const tasks: any[] = [];
      
      selectedVocab.forEach(t => {
        tasks.push({
          id: `task-v-${t.id}`,
          type: 'vocabulary',
          targetId: t.id,
          isDone: false,
          title: `Học từ vựng: ${t.title}`,
          description: t.description
        });
      });
      
      selectedGrammar.forEach(t => {
        tasks.push({
          id: `task-g-${t.id}`,
          type: 'grammar',
          targetId: t.id,
          isDone: false,
          title: `Học ngữ pháp: ${t.title}`,
          description: t.description
        });
      });
      
      tasks.push({
        id: 'task-review',
        type: 'review',
        targetId: 'review',
        isDone: false,
        title: 'Ôn tập hàng ngày',
        description: 'Ôn tập các từ vựng đã học để ghi nhớ lâu hơn'
      });
      
      setStats(prev => ({
        ...prev,
        dailyPlan: {
          date: today,
          tasks,
          isCompleted: false
        }
      }));
    }
  }, [stats.dailyPlan?.date, stats.completedTopics, stats.completedGrammar]);

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsPlayingAudio(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = (targetWord: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechTranscript('');
      setSpeechScore(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setSpeechTranscript(transcript);
      
      const target = targetWord.toLowerCase().replace(/[.,?!]/g, '');
      const spoken = transcript.replace(/[.,?!]/g, '');
      
      if (spoken.includes(target) || target.includes(spoken)) {
        setSpeechScore(100);
        setSelectedOption(targetWord); // to trigger enable Next button
      } else {
        setSpeechScore(0);
        setSelectedOption(transcript); // user answered something
      }
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const startReview = () => {
    const words = getReviewWords(stats.wordProgress || {}, 10);
    
    if (words.length === 0) {
      alert('Tuyệt vời! Bạn không có từ vựng nào cần ôn tập lúc này.');
      return;
    }

    setLearnWords(words);
    setLearnIndex(0);
    setIsFlipped(false);
    setSessionReviewWords([]);
    setQuizState({
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      userAnswers: [],
      isFinished: false,
      band: -1, // special band for review
      topicId: 'review'
    });
    setView('learn');
    
    setTimeout(() => playAudio(words[0].word), 500);
  };

  const startLearning = (band: number, topicId: string) => {
    const words = getWordsForTopic(band, topicId, stats.completedWords, 5);
    setLearnWords(words);
    setLearnIndex(0);
    setIsFlipped(false);
    setSessionReviewWords([]);
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

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentWord = learnWords[learnIndex];
    
    let updatedReviewWords = [...sessionReviewWords];
    if (direction === 'left') {
      updatedReviewWords.push(currentWord);
      setSessionReviewWords(updatedReviewWords);
    }

    if (learnIndex < learnWords.length - 1) {
      setLearnIndex(prev => prev + 1);
      setIsFlipped(false);
      setTimeout(() => playAudio(learnWords[learnIndex + 1].word), 500);
    } else {
      // Finished learning, start quiz
      if (quizState) {
        // If they marked all as "Got it", we still give a quick quiz or just use all words
        const wordsToQuiz = updatedReviewWords.length > 0 ? updatedReviewWords : learnWords;
        const questions = generateQuizForWords(wordsToQuiz);
        setQuizState({
          ...quizState,
          questions
        });
        setView('quiz');
        setSelectedOption(null);
        setShowFeedback(false);
        
        if (questions[0] && questions[0].type === 'audio') {
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
    } else if (currentQuestion.type === 'speaking') {
      hasAnswer = speechScore !== null;
      isCorrectAnswer = speechScore === 100;
    } else {
      hasAnswer = selectedOption !== null;
      isCorrectAnswer = selectedOption === currentQuestion.correctAnswer;
    }

    if (!hasAnswer) return;

    if (!showFeedback) {
      setIsCorrect(isCorrectAnswer);
      setShowFeedback(true);

      // Update SRS for this specific question
      const wordId = currentQuestion.wordId;
      if (wordId) {
        setStats(prev => {
          const newWordProgress = { ...(prev.wordProgress || {}) };
          const currentProgress = newWordProgress[wordId] || { srsLevel: 0, nextReview: new Date().toISOString() };
          
          if (isCorrectAnswer) {
            currentProgress.srsLevel += 1;
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + Math.pow(2, currentProgress.srsLevel));
            currentProgress.nextReview = nextDate.toISOString();
          } else {
            currentProgress.srsLevel = 0;
            currentProgress.nextReview = new Date().toISOString();
          }
          
          newWordProgress[wordId] = currentProgress;
          return { ...prev, wordProgress: newWordProgress };
        });
      }

      return;
    }

    const nextIndex = quizState.currentQuestionIndex + 1;
    const isFinished = nextIndex >= quizState.questions.length;

    if (isFinished) {
      const finalScore = isCorrectAnswer ? quizState.score + 1 : quizState.score;
      const xpGained = finalScore * 20;
      
      setStats(prev => {
        const newXp = prev.xp + xpGained;
        const totalQuestions = quizState.questions.length;
        const isPassed = totalQuestions > 0 && (finalScore / totalQuestions) >= 0.6; // 60% to pass
        
        const newCompletedTopics = [...(prev.completedTopics || [])];
        const newCompletedWords = [...(prev.completedWords || [])];
        const newCompletedGrammar = [...(prev.completedGrammar || [])];
        
        if (quizState.topicId.startsWith('g-')) {
          if (isPassed && !newCompletedGrammar.includes(quizState.topicId)) {
            newCompletedGrammar.push(quizState.topicId);
          }
        } else {
          // Add words from this session to completed list if user passed
          if (isPassed) {
            learnWords.forEach(w => {
              if (!newCompletedWords.includes(w.id)) {
                newCompletedWords.push(w.id);
              }
            });
          }

          // Check if topic is fully completed
          const topicStats = getTopicStats(quizState.band, quizState.topicId, newCompletedWords);
          if (topicStats.completed === topicStats.total && !newCompletedTopics.includes(quizState.topicId)) {
            newCompletedTopics.push(quizState.topicId);
          }
        }

        // Update Daily Plan Task
        let newDailyPlan = prev.dailyPlan ? { ...prev.dailyPlan } : undefined;
        if (newDailyPlan && isPassed) {
          const taskIndex = newDailyPlan.tasks.findIndex(t => t.targetId === quizState.topicId);
          if (taskIndex !== -1) {
            newDailyPlan.tasks[taskIndex].isDone = true;
          }
          
          // Check if all tasks are done
          const allDone = newDailyPlan.tasks.every(t => t.isDone);
          if (allDone && !newDailyPlan.isCompleted) {
            newDailyPlan.isCompleted = true;
          }
        }

        // Update Streak only if daily plan is completed
        const isDailyPlanCompleted = newDailyPlan?.isCompleted || false;
        const lastActiveDate = prev.lastActive.split('T')[0];
        const todayDate = new Date().toISOString().split('T')[0];
        
        let newStreak = prev.streak;
        if (isDailyPlanCompleted && lastActiveDate !== todayDate) {
          newStreak += 1;
        }
        
        return {
          ...prev,
          xp: newXp,
          completedTopics: newCompletedTopics,
          completedWords: newCompletedWords,
          completedGrammar: newCompletedGrammar,
          dailyPlan: newDailyPlan,
          streak: newStreak,
          lastActive: new Date().toISOString()
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
      setSpeechTranscript('');
      setSpeechScore(null);
      
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
      Brain, Scale, PieChart, Book, Feather, Home, MessageSquare, Link, Layers,
      Zap, Shield, UserIcon, Calendar, Flame, Diamond
    };

    return (
      <div className="min-h-screen bg-surface pb-32 flex flex-col items-center">
        {/* Top Header - Modern Dashboard Style */}
        <div className="sticky top-0 z-50 w-full bg-white border-b-2 border-line px-6 py-4 flex justify-between items-center max-w-2xl mx-auto shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-brand-orange font-black text-lg">
              <Flame fill="currentColor" size={22} className="drop-shadow-sm" /> 
              <span className="font-display tracking-tight">{stats.streak}</span>
            </div>
            <div className="flex items-center gap-2 text-brand-blue font-black text-lg">
              <Diamond fill="currentColor" size={22} className="drop-shadow-sm" /> 
              <span className="font-display tracking-tight">{stats.xp}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-brand-red font-black text-lg">
            <Heart fill="currentColor" size={22} className="drop-shadow-sm" /> 
            <span className="font-display tracking-tight">5</span>
          </div>
        </div>

        {/* Path Area */}
        <div className="py-10 flex flex-col items-center gap-12 relative w-full max-w-md mx-auto">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((band) => {
            const topics = BAND_TOPICS[band] || [];
            if (topics.length === 0) return null;
            
            return (
              <div key={`band-${band}`} className="w-full px-4 mb-12">
                {/* Band Header Card - More Editorial Style */}
                <div className={`w-full p-6 rounded-[2rem] border-2 mb-10 text-white shadow-lg overflow-hidden relative ${band === 0 ? 'bg-brand-orange border-[#e58700]' : 'bg-brand-blue border-[#1899d6]'}`}>
                  <div className="relative z-10">
                    <h2 className="text-3xl font-black font-display uppercase tracking-tight mb-1">{band === 0 ? 'Beginner' : `Band ${band}`}</h2>
                    <p className="font-bold opacity-90 text-sm">{band === 0 ? 'Start your journey here' : 'Master complex topics'}</p>
                  </div>
                  {/* Decorative Circle */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </div>

                {/* Topics Path */}
                <div className="flex flex-col items-center gap-16 relative">
                  {/* Thick Spine Background - Dotted/Dashed for modern look */}
                  <div className="absolute left-1/2 top-4 bottom-4 w-3 border-l-4 border-dashed border-line -translate-x-1/2" />

                  {topics.map((topic, i) => {
                    const isGrammar = topic.type === 'grammar';
                    const isCompleted = isGrammar 
                      ? (stats.completedGrammar || []).includes(topic.id)
                      : (() => {
                          const topicStats = getTopicStats(band, topic.id, stats.completedWords || []);
                          return topicStats.completed === topicStats.total && topicStats.total > 0;
                        })();
                        
                    const topicStats = !isGrammar ? getTopicStats(band, topic.id, stats.completedWords || []) : null;
                    const offset = getOffset(i);
                    const IconComponent = topic.icon && IconMap[topic.icon] ? IconMap[topic.icon] : Star;

                    return (
                      <div key={topic.id} className="relative z-10 flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (isGrammar) {
                              setSelectedGrammarId(topic.id);
                              setView('grammar_theory');
                            } else {
                              startLearning(band, topic.id);
                            }
                          }}
                          className={`
                            w-24 h-24 rounded-[2rem] flex items-center justify-center text-3xl font-bold transition-all relative
                            ${isCompleted 
                              ? 'bg-brand-green text-white shadow-[0_8px_0_0_#46a302]' 
                              : isGrammar
                                ? 'bg-[#ce82ff] text-white shadow-[0_8px_0_0_#a560f2]'
                                : band === 0 
                                  ? 'bg-brand-orange text-white shadow-[0_8px_0_0_#e58700]'
                                  : 'bg-brand-blue text-white shadow-[0_8px_0_0_#1899d6]'
                            }
                          `}
                        >
                          <IconComponent fill={isCompleted ? "currentColor" : "none"} size={36} strokeWidth={2.5} />
                          
                          {/* Progress Ring */}
                          {!isCompleted && !isGrammar && topicStats && topicStats.total > 0 && (
                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-2xl border-2 border-line flex items-center justify-center text-[11px] font-black text-ink shadow-md">
                              {Math.round((topicStats.completed / topicStats.total) * 100)}%
                            </div>
                          )}
                        </motion.button>
                        <div className="mt-4 bg-white px-4 py-1.5 rounded-2xl border-2 border-line shadow-sm">
                           <p className="text-[11px] font-black text-ink-muted uppercase tracking-widest">
                             {isGrammar ? 'Grammar' : `${topicStats?.completed}/${topicStats?.total} words`}
                           </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Daily Plan Button */}
        <div className="fixed bottom-28 right-6 z-50">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setView('daily_plan')}
            className="w-18 h-18 bg-brand-green text-white rounded-[1.5rem] flex items-center justify-center shadow-[0_6px_0_0_#46a302] transition-all relative"
          >
            <Calendar size={36} strokeWidth={2.5} />
            {!stats.dailyPlan?.isCompleted && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-red rounded-full border-2 border-white flex items-center justify-center text-[12px] font-black shadow-sm">
                !
              </div>
            )}
          </motion.button>
        </div>

        {/* Floating Micro-skills Button */}
        <div className="fixed bottom-28 left-6 z-50">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setView('micro_skills')}
            className="w-18 h-18 bg-brand-orange text-white rounded-[1.5rem] flex items-center justify-center shadow-[0_6px_0_0_#e58700] transition-all relative"
          >
            <Zap size={36} strokeWidth={2.5} />
          </motion.button>
        </div>

        {renderBottomNav()}
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
        <div className="px-6 py-6 flex items-center gap-6 max-w-3xl mx-auto w-full border-b border-line">
          <button onClick={() => setView('roadmap')} className="text-ink-muted hover:text-ink transition-colors">
            <X size={28} strokeWidth={2.5} />
          </button>
          <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand-orange rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', bounce: 0 }}
            />
          </div>
        </div>

        {/* Flashcard Area */}
        <div className="flex-1 px-6 max-w-2xl mx-auto w-full flex flex-col items-center justify-center py-10">
          <motion.div 
            key={`${currentWord.id}-${isFlipped}`}
            initial={{ opacity: 0, y: 20, rotateX: isFlipped ? -90 : 0 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-white border-2 border-line rounded-[2.5rem] p-10 shadow-[0_12px_0_0_#e5e5e5] flex flex-col items-center text-center cursor-pointer hover:shadow-[0_16px_0_0_#e5e5e5] transition-all"
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); playAudio(currentWord.word); }}
              className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all mb-8 ${
                isPlayingAudio 
                  ? 'bg-brand-blue text-white shadow-[0_4px_0_0_#1899d6] translate-y-1 animate-pulse' 
                  : 'bg-brand-blue/10 text-brand-blue border-2 border-brand-blue shadow-[0_8px_0_0_#1cb0f6] hover:bg-brand-blue/20 active:shadow-[0_4px_0_0_#1cb0f6] active:translate-y-1'
              }`}
            >
              <Volume2 size={44} strokeWidth={2.5} />
            </motion.button>
            
            <h2 className="text-5xl font-black text-ink mb-3 font-display tracking-tight">{currentWord.word}</h2>
            {currentWord.ipa && (
              <p className="text-2xl text-ink-muted font-mono mb-8 opacity-60 tracking-wider">{currentWord.ipa}</p>
            )}

            {isFlipped && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex flex-col items-center"
              >
                {currentWord.image && (
                  <div className="w-full mb-8 rounded-[2rem] overflow-hidden border-2 border-line shadow-sm">
                    <img 
                      src={currentWord.image} 
                      alt={currentWord.word} 
                      className="w-full h-56 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                
                <div className="w-full h-px bg-line my-6"></div>
                
                <p className="text-3xl font-black text-brand-blue mb-6 font-display">{currentWord.vietnameseDefinition}</p>
                
                <div className="bg-surface rounded-[1.5rem] p-6 w-full text-left mt-4 border border-line/50">
                  <p className="text-ink font-bold mb-3 text-xl leading-relaxed">"{currentWord.example}"</p>
                  <p className="text-ink-muted font-medium italic">{currentWord.vietnameseExample}</p>
                </div>

                {currentWord.collocations && currentWord.collocations.length > 0 && (
                  <div className="w-full mt-8 text-left">
                    <h3 className="text-sm font-black text-ink-muted mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Link size={18} strokeWidth={3} /> Collocations
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {currentWord.collocations.map((col, idx) => {
                        const parts = col.split(new RegExp(`(${currentWord.word})`, 'gi'));
                        return (
                          <div 
                            key={idx}
                            className="px-5 py-3 bg-white border-2 border-line text-ink rounded-2xl font-black cursor-default hover:bg-brand-blue/5 hover:border-brand-blue hover:text-brand-blue hover:-translate-y-1 transition-all duration-200 shadow-[0_3px_0_0_#e5e5e5] hover:shadow-[0_5px_0_0_#1cb0f6] font-display"
                          >
                            {parts.map((part, i) => 
                              part.toLowerCase() === currentWord.word.toLowerCase() 
                                ? <span key={i} className="text-brand-blue">{part}</span>
                                : <span key={i}>{part}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            
            {!isFlipped && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-line border-t-brand-blue animate-spin"></div>
                <p className="text-ink-muted font-black uppercase tracking-widest text-xs">Tap to reveal</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Action Area */}
        <div className="mt-auto border-t-2 p-6 sm:p-10 bg-white border-line">
          <div className="max-w-2xl mx-auto flex gap-6">
            {!isFlipped ? (
              <button 
                onClick={() => setIsFlipped(true)}
                className="w-full py-5 bg-brand-blue text-white rounded-[1.5rem] font-black text-2xl uppercase tracking-widest shadow-[0_6px_0_0_#1899d6] active:translate-y-1 active:shadow-none transition-all font-display"
              >
                Flip Card
              </button>
            ) : (
              <>
                <button 
                  onClick={() => handleSwipe('left')}
                  className="flex-1 py-5 bg-white border-2 border-brand-red text-brand-red rounded-[1.5rem] font-black text-2xl uppercase tracking-widest shadow-[0_6px_0_0_#d33131] active:translate-y-1 active:shadow-none transition-all font-display"
                >
                  Review
                </button>
                <button 
                  onClick={() => handleSwipe('right')}
                  className="flex-1 py-5 bg-brand-green text-white rounded-[1.5rem] font-black text-2xl uppercase tracking-widest shadow-[0_6px_0_0_#46a302] active:translate-y-1 active:shadow-none transition-all font-display"
                >
                  Got it
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!quizState) return null;
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const progress = ((quizState.currentQuestionIndex) / quizState.questions.length) * 100;

    const checkAnswer = () => {
      let correct = false;
      if (currentQuestion.type === 'typing') {
        correct = typingInput.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
      } else if (currentQuestion.type === 'sentence_building') {
        correct = sentenceBlocks.join(' ') === currentQuestion.correctAnswer;
      } else if (currentQuestion.type === 'matching') {
        correct = matchedItems.length === (currentQuestion.pairs?.length || 0) * 2;
      } else if (currentQuestion.type === 'speaking') {
        correct = (speechScore || 0) >= 70;
      } else {
        correct = selectedOption === currentQuestion.correctAnswer;
      }

      setIsCorrect(correct);
      setShowFeedback(true);

      if (correct) {
        setStats(prev => ({
          ...prev,
          xp: prev.xp + 10,
          completedWords: Array.from(new Set([...(prev.completedWords || []), currentQuestion.wordId]))
        }));
      }
    };

    const nextQuestion = () => {
      if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        setQuizState(prev => prev ? { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 } : null);
        setSelectedOption(null);
        setTypingInput('');
        setSentenceBlocks([]);
        setAvailableBlocks(quizState.questions[quizState.currentQuestionIndex + 1].type === 'sentence_building' ? [...(quizState.questions[quizState.currentQuestionIndex + 1].scrambledWords || [])].sort(() => Math.random() - 0.5) : []);
        setMatchedItems([]);
        setMatchingSelected(null);
        setMatchingErrors([]);
        setSpeechScore(null);
        setShowFeedback(false);
        setIsCorrect(false);
      } else {
        setView('finished');
      }
    };

    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Quiz Header */}
        <div className="sticky top-0 z-50 w-full bg-white px-6 py-4 flex items-center gap-6 max-w-2xl mx-auto border-b border-line">
          <button onClick={() => setView('roadmap')} className="text-ink-muted hover:text-ink transition-colors">
            <X size={28} strokeWidth={2.5} />
          </button>
          <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-brand-green"
            />
          </div>
          <div className="flex items-center gap-2 text-brand-red font-black text-lg">
            <Heart fill="currentColor" size={22} /> 
            <span className="font-display">5</span>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 px-6 max-w-2xl mx-auto w-full flex flex-col py-8 overflow-y-auto">
          <h2 className="text-2xl font-black text-ink mb-10 leading-tight font-display">
            {currentQuestion.question}
          </h2>

          {currentQuestion.type === 'audio' && (
            <div className="flex justify-center mb-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => playAudio(currentQuestion.correctAnswer)}
                className={`w-28 h-28 rounded-[2rem] flex items-center justify-center transition-all ${
                  isPlayingAudio 
                    ? 'bg-brand-blue text-white shadow-[0_4px_0_0_#1899d6] translate-y-1 animate-pulse' 
                    : 'bg-brand-blue/10 text-brand-blue border-2 border-brand-blue shadow-[0_8px_0_0_#1cb0f6] hover:bg-brand-blue/20 active:shadow-[0_4px_0_0_#1cb0f6] active:translate-y-1'
                }`}
              >
                <Volume2 size={48} strokeWidth={2.5} />
              </motion.button>
            </div>
          )}

          {currentQuestion.type === 'image_selection' ? (
            <div className="grid grid-cols-2 gap-6">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option;
                let btnClass = "relative aspect-square rounded-[2rem] border-2 transition-all overflow-hidden ";
                
                if (showFeedback) {
                  if (option === currentQuestion.correctAnswer) {
                    btnClass += "border-brand-green ring-4 ring-brand-green/20";
                  } else if (isSelected) {
                    btnClass += "border-brand-red opacity-50";
                  } else {
                    btnClass += "border-line opacity-50";
                  }
                } else {
                  if (isSelected) {
                    btnClass += "border-brand-blue ring-4 ring-brand-blue/20 shadow-[0_4px_0_0_#1cb0f6] translate-y-[-4px]";
                  } else {
                    btnClass += "border-line shadow-[0_4px_0_0_#e5e5e5] hover:bg-surface active:shadow-[0_0px_0_0_#e5e5e5] active:translate-y-[4px]";
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
                placeholder="Type your answer..."
                className={`w-full p-6 rounded-[1.5rem] border-2 text-2xl font-black transition-all outline-none font-display ${
                  showFeedback 
                    ? isCorrect ? "bg-brand-green/10 border-brand-green text-brand-green" : "bg-brand-red/10 border-brand-red text-brand-red"
                    : "bg-surface border-line text-ink focus:border-brand-blue focus:bg-white"
                }`}
                autoFocus
              />
            </div>
          ) : currentQuestion.type === 'sentence_building' ? (
            <div className="w-full flex flex-col gap-10">
              <div className="min-h-[100px] w-full border-b-2 border-line pb-6 flex flex-wrap gap-3 items-start">
                {sentenceBlocks.map((block, i) => (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={`sb-${i}`}
                    onClick={() => {
                      if (showFeedback) return;
                      setSentenceBlocks(prev => prev.filter((_, index) => index !== i));
                      setAvailableBlocks(prev => [...prev, block]);
                    }}
                    className="px-5 py-3.5 bg-white border-2 border-line rounded-2xl font-black text-ink shadow-[0_3px_0_0_#e5e5e5] active:translate-y-[2px] active:shadow-none font-display"
                  >
                    {block}
                  </motion.button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {availableBlocks.map((block, i) => (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={`ab-${i}`}
                    onClick={() => {
                      if (showFeedback) return;
                      setAvailableBlocks(prev => prev.filter((_, index) => index !== i));
                      setSentenceBlocks(prev => [...prev, block]);
                    }}
                    className="px-5 py-3.5 bg-white border-2 border-line rounded-2xl font-black text-ink shadow-[0_3px_0_0_#e5e5e5] active:translate-y-[2px] active:shadow-none font-display"
                  >
                    {block}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : currentQuestion.type === 'matching' ? (
            <div className="grid grid-cols-2 gap-5 w-full">
              {matchingOptions.map((opt, i) => {
                const isMatched = matchedItems.includes(opt.text);
                const isSelected = matchingSelected?.text === opt.text;
                const isError = matchingErrors.includes(opt.text);
                
                let btnClass = "p-5 rounded-[1.5rem] border-2 font-black text-xl transition-all text-center min-h-[90px] flex items-center justify-center font-display ";
                
                if (isMatched) {
                  btnClass += "bg-line border-line text-transparent shadow-none pointer-events-none";
                } else if (isError) {
                  btnClass += "bg-brand-red/10 border-brand-red text-brand-red";
                } else if (isSelected) {
                  btnClass += "bg-brand-blue/10 border-brand-blue text-brand-blue shadow-[0_4px_0_0_#1cb0f6] translate-y-[-4px]";
                } else {
                  btnClass += "bg-white border-line text-ink shadow-[0_4px_0_0_#e5e5e5] hover:bg-surface active:shadow-[0_0px_0_0_#e5e5e5] active:translate-y-[4px]";
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
          ) : currentQuestion.type === 'speaking' ? (
            <div className="flex flex-col items-center gap-10 my-10 w-full">
              <div className="text-5xl font-black text-ink text-center font-display tracking-tight">{currentQuestion.correctAnswer}</div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => isListening ? null : startListening(currentQuestion.correctAnswer)}
                disabled={showFeedback}
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-brand-red text-white animate-pulse shadow-[0_0_30px_rgba(255,75,75,0.4)]' 
                    : showFeedback 
                      ? 'bg-line text-ink-muted'
                      : 'bg-brand-blue text-white shadow-[0_8px_0_0_#1899d6] active:translate-y-2 active:shadow-none'
                }`}
              >
                {isListening ? <MicOff size={44} strokeWidth={2.5} /> : <Mic size={44} strokeWidth={2.5} />}
              </motion.button>
              
              {speechTranscript && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center mt-6 p-6 rounded-[2rem] border-2 border-line bg-surface w-full max-w-sm shadow-sm"
                >
                  <p className="text-ink-muted font-black mb-2 uppercase tracking-widest text-xs">You said:</p>
                  <p className={`text-3xl font-black font-display ${speechScore === 100 ? 'text-brand-green' : 'text-brand-red'}`}>
                    "{speechTranscript}"
                  </p>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option;
                let btnClass = "p-5 rounded-[1.5rem] border-2 text-left font-black text-xl transition-all font-display ";
                
                if (showFeedback) {
                  if (option === currentQuestion.correctAnswer) {
                    btnClass += "bg-brand-green/10 border-brand-green text-brand-green";
                  } else if (isSelected) {
                    btnClass += "bg-brand-red/10 border-brand-red text-brand-red";
                  } else {
                    btnClass += "border-line text-ink-muted";
                  }
                } else {
                  if (isSelected) {
                    btnClass += "bg-brand-blue/10 border-brand-blue text-brand-blue shadow-[0_4px_0_0_#1cb0f6] translate-y-[-4px]";
                  } else {
                    btnClass += "bg-white border-line text-ink shadow-[0_4px_0_0_#e5e5e5] hover:bg-surface active:shadow-[0_0px_0_0_#e5e5e5] active:translate-y-[4px]";
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
        <div className={`mt-auto border-t-2 p-6 sm:p-10 transition-all duration-500 ${showFeedback ? (isCorrect ? 'bg-brand-green/10 border-brand-green/20' : 'bg-brand-red/10 border-brand-red/20') : 'bg-white border-line'}`}>
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-6 items-center justify-between">
            {showFeedback && (
              <div className="flex items-center gap-6 w-full sm:w-auto mb-6 sm:mb-0">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${isCorrect ? 'bg-brand-green text-white' : 'bg-brand-red text-white'}`}>
                  {isCorrect ? <Check size={40} strokeWidth={4} /> : <X size={40} strokeWidth={4} />}
                </div>
                <div className="flex-1">
                  <h3 className={`text-3xl font-black font-display uppercase tracking-tight ${isCorrect ? 'text-brand-green' : 'text-brand-red'}`}>
                    {isCorrect ? 'Excellent!' : 'Not quite'}
                  </h3>
                  <p className={`font-bold mt-1 text-lg ${isCorrect ? 'text-brand-green/80' : 'text-brand-red/80'}`}>
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
                (currentQuestion.type === 'speaking' && speechScore === null) ||
                (currentQuestion.type !== 'typing' && currentQuestion.type !== 'sentence_building' && currentQuestion.type !== 'matching' && currentQuestion.type !== 'speaking' && selectedOption === null)
              );
              
              return (
                <button 
                  onClick={showFeedback ? nextQuestion : checkAnswer}
                  disabled={isDisabled}
                  className={`
                    w-full sm:w-64 py-5 rounded-[1.5rem] font-black text-2xl uppercase tracking-widest transition-all font-display
                    ${isDisabled 
                      ? 'bg-line text-ink-muted cursor-not-allowed' 
                      : showFeedback 
                        ? isCorrect 
                          ? 'bg-brand-green text-white shadow-[0_6px_0_0_#46a302] active:translate-y-1 active:shadow-none' 
                          : 'bg-brand-red text-white shadow-[0_6px_0_0_#d33131] active:translate-y-1 active:shadow-none'
                        : 'bg-brand-green text-white shadow-[0_6px_0_0_#46a302] active:translate-y-1 active:shadow-none'
                    }
                  `}
                >
                  {showFeedback ? 'Continue' : 'Check'}
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
    const accuracy = Math.round((quizState.score / quizState.questions.length) * 100);
    const xpGained = quizState.score * 10;

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          className="mb-10"
        >
          <div className="w-48 h-48 bg-brand-orange rounded-[3rem] flex items-center justify-center shadow-[0_12px_0_0_#e58700] relative">
            <Star fill="white" size={80} strokeWidth={2.5} className="drop-shadow-lg" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-4 -right-4 w-16 h-16 bg-brand-red rounded-2xl flex items-center justify-center shadow-lg border-4 border-white"
            >
              <Flame fill="white" size={32} />
            </motion.div>
          </div>
        </motion.div>

        <h1 className="text-5xl font-black text-ink mb-3 font-display tracking-tight">Lesson Complete!</h1>
        <p className="text-xl text-ink-muted font-bold mb-12">You're making amazing progress!</p>

        <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-12">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-2 border-brand-orange rounded-[2rem] p-6 shadow-[0_8px_0_0_#e58700]"
          >
            <p className="text-brand-orange font-black uppercase tracking-widest text-xs mb-2">Total XP</p>
            <div className="flex items-center justify-center gap-2 text-3xl font-black text-ink font-display">
              <Diamond fill="#1cb0f6" size={24} />
              {xpGained}
            </div>
          </motion.div>
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white border-2 border-brand-green rounded-[2rem] p-6 shadow-[0_8px_0_0_#46a302]"
          >
            <p className="text-brand-green font-black uppercase tracking-widest text-xs mb-2">Accuracy</p>
            <div className="flex items-center justify-center gap-2 text-3xl font-black text-ink font-display">
              <Star fill="#58cc02" size={24} />
              {accuracy}%
            </div>
          </motion.div>
        </div>

        <div className="w-full max-w-md space-y-4">
          <button 
            onClick={() => {
              const newStats = {
                ...stats,
                xp: stats.xp + xpGained,
                completedWords: [...new Set([...(stats.completedWords || []), ...quizState.questions.map(q => q.id)])]
              };
              setStats(newStats);
              setView('roadmap');
              setQuizState(null);
            }}
            className="w-full py-5 bg-brand-blue text-white rounded-[1.5rem] font-black text-2xl uppercase tracking-widest shadow-[0_6px_0_0_#1899d6] active:translate-y-1 active:shadow-none transition-all font-display"
          >
            Continue
          </button>
          <button 
            onClick={() => setView('roadmap')}
            className="w-full py-5 bg-white border-2 border-line text-ink-muted rounded-[1.5rem] font-black text-xl uppercase tracking-widest hover:bg-surface transition-all font-display"
          >
            Review Lesson
          </button>
        </div>
      </div>
    );
  };

  const renderGrammarTheory = () => {
    if (!selectedGrammarId || !GRAMMAR_LESSONS[selectedGrammarId]) return null;
    
    const lesson = GRAMMAR_LESSONS[selectedGrammarId];
    
    const startGrammarQuiz = () => {
      setQuizState({
        questions: lesson.questions,
        currentQuestionIndex: 0,
        score: 0,
        userAnswers: [],
        isFinished: false,
        band: 0, // Grammar doesn't strictly follow band logic for scoring
        topicId: selectedGrammarId
      });
      setView('quiz');
    };

    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-50 w-full bg-white border-b-2 border-line px-6 py-5 flex items-center gap-6 max-w-2xl mx-auto shadow-sm">
          <button onClick={() => setView('roadmap')} className="text-ink-muted hover:text-ink transition-colors">
            <X size={28} strokeWidth={2.5} />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-ink font-display tracking-tight leading-none">{lesson.title}</h2>
            <p className="text-xs font-black text-ink-muted uppercase tracking-widest mt-1">Grammar Guide</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full overflow-y-auto">
          <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-p:text-ink prose-p:leading-relaxed prose-strong:text-brand-blue prose-code:text-brand-purple prose-code:bg-brand-purple/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md">
            <ReactMarkdown
              components={{
                h3: ({node, ...props}) => <h3 className="text-2xl font-black text-ink mt-10 mb-4 font-display" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 text-ink leading-relaxed" {...props} />,
                li: ({node, ...props}) => <li className="ml-6 mb-3 text-ink font-medium list-disc" {...props} />,
                strong: ({node, ...props}) => <strong className="font-black text-brand-blue" {...props} />,
                em: ({node, ...props}) => <em className="italic text-ink-muted font-bold" {...props} />,
              }}
            >
              {lesson.theory}
            </ReactMarkdown>
          </div>

          {/* Practice Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-12 p-8 bg-brand-blue/5 border-2 border-brand-blue rounded-[2.5rem] flex flex-col items-center text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-brand-blue text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg">
              <Zap fill="white" size={40} />
            </div>
            <h3 className="text-2xl font-black text-ink mb-2 font-display">Ready to practice?</h3>
            <p className="text-ink-muted font-bold mb-8">Test your knowledge of {lesson.title} with a quick quiz.</p>
            <button 
              onClick={startGrammarQuiz}
              className="w-full py-5 bg-brand-blue text-white rounded-[1.5rem] font-black text-2xl uppercase tracking-widest shadow-[0_6px_0_0_#1899d6] active:translate-y-1 active:shadow-none transition-all font-display"
            >
              Start Quiz
            </button>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderBottomNav = () => {
    const reviewCount = Object.entries(stats.wordProgress || {}).filter(([_, p]) => (p as any).nextReview <= new Date().toISOString()).length;

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2rem] p-2 flex justify-around items-center z-50 shadow-2xl shadow-black/5">
        <button 
          onClick={() => setView('roadmap')} 
          className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${view === 'roadmap' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 -translate-y-1' : 'text-ink-muted hover:bg-ink/5'}`}
        >
          <Home fill={view === 'roadmap' ? "white" : "none"} size={24} />
        </button>
        <button 
          onClick={() => setView('daily_plan')} 
          className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${view === 'daily_plan' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/30 -translate-y-1' : 'text-ink-muted hover:bg-ink/5'}`}
        >
          <Calendar fill={view === 'daily_plan' ? "white" : "none"} size={24} />
        </button>
        <button 
          onClick={() => setView('leaderboard')} 
          className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${view === 'leaderboard' ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30 -translate-y-1' : 'text-ink-muted hover:bg-ink/5'}`}
        >
          <Trophy fill={view === 'leaderboard' ? "white" : "none"} size={24} />
        </button>
        <button 
          onClick={() => setView('ai_lab')} 
          className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${view === 'ai_lab' || view === 'ai_writing' || view === 'ai_chat' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 -translate-y-1' : 'text-ink-muted hover:bg-ink/5'}`}
        >
          <Sparkles fill={view === 'ai_lab' || view === 'ai_writing' || view === 'ai_chat' ? "white" : "none"} size={24} />
        </button>
        <button 
          onClick={startReview} 
          className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 text-ink-muted hover:bg-ink/5 relative`}
        >
          <Shield size={24} />
          {reviewCount > 0 && (
            <div className="absolute top-3 right-3 w-4 h-4 bg-brand-red rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black">
              {reviewCount}
            </div>
          )}
        </button>
        <button 
          onClick={() => setView('notebook')} 
          className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${view === 'notebook' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 -translate-y-1' : 'text-ink-muted hover:bg-ink/5'}`}
        >
          <Book fill={view === 'notebook' ? "white" : "none"} size={24} />
        </button>
        <button 
          onClick={() => setView('profile')} 
          className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${view === 'profile' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 -translate-y-1' : 'text-ink-muted hover:bg-ink/5'}`}
        >
          <UserIcon fill={view === 'profile' ? "white" : "none"} size={24} />
        </button>
      </div>
    );
  };

  const renderAILab = () => {
    return (
      <div className="min-h-screen bg-bg pb-32 flex flex-col items-center">
        <div className="w-full bg-white/80 backdrop-blur-md border-b border-ink/5 px-6 py-10 flex flex-col gap-2 max-w-2xl mx-auto sticky top-0 z-40">
          <h1 className="text-3xl font-black text-ink font-display tracking-tight text-center">AI Learning Lab</h1>
          <p className="text-center text-ink-muted font-bold">Nâng cao kỹ năng tiếng Anh với trợ lý AI thông minh.</p>
        </div>

        <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('ai_writing')}
            className="p-8 bg-white border-2 border-ink/5 rounded-[2.5rem] shadow-sm hover:border-brand-blue/30 transition-all text-left flex items-center gap-6"
          >
            <div className="w-20 h-20 bg-brand-blue/10 text-brand-blue rounded-3xl flex items-center justify-center">
              <Feather size={40} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-ink font-display mb-1">AI Writing Assistant</h3>
              <p className="text-ink-muted font-bold">Viết đoạn văn và nhận phản hồi chi tiết từ AI.</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setAiChatMessages([]);
              setView('ai_chat');
            }}
            className="p-8 bg-white border-2 border-ink/5 rounded-[2.5rem] shadow-sm hover:border-brand-orange/30 transition-all text-left flex items-center gap-6"
          >
            <div className="w-20 h-20 bg-brand-orange/10 text-brand-orange rounded-3xl flex items-center justify-center">
              <MessageCircle size={40} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-ink font-display mb-1">AI Conversation Partner</h3>
              <p className="text-ink-muted font-bold">Luyện nói và chat với người bản xứ AI.</p>
            </div>
          </motion.button>

          <div className="bg-brand-purple/5 border-2 border-brand-purple/10 rounded-[2.5rem] p-8 mt-4">
            <h4 className="text-brand-purple font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
              <Sparkles size={18} /> AI Tip of the Day
            </h4>
            <p className="text-ink font-bold italic">"Sử dụng AI để giải thích các sắc thái nghĩa khác nhau của từ vựng sẽ giúp bạn ghi điểm cao hơn trong phần Lexical Resource của IELTS."</p>
          </div>
        </div>
        {renderBottomNav()}
      </div>
    );
  };

  const renderAIWriting = () => {
    const handleGetFeedback = async () => {
      if (!aiWritingText.trim()) return;
      setIsAiLoading(true);
      try {
        const feedback = await getWritingFeedback(aiWritingText, stats.completedWords.slice(-5));
        setAiWritingFeedback(feedback);
      } catch (error) {
        console.error(error);
      } finally {
        setIsAiLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-bg flex flex-col max-w-2xl mx-auto">
        <div className="p-6 flex items-center gap-4 bg-white border-b border-ink/5 sticky top-0 z-40">
          <button onClick={() => setView('ai_lab')} className="w-10 h-10 rounded-xl flex items-center justify-center text-ink-muted hover:bg-ink/5">
            <X size={24} />
          </button>
          <h1 className="text-xl font-black text-ink font-display tracking-tight uppercase">Writing Assistant</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-32">
          <div className="mb-8">
            <label className="block text-xs font-black text-ink-muted uppercase tracking-widest mb-3 ml-2">Your Writing</label>
            <textarea
              value={aiWritingText}
              onChange={(e) => setAiWritingText(e.target.value)}
              placeholder="Hãy viết một đoạn văn ngắn (50-100 từ) về bất kỳ chủ đề nào..."
              className="w-full h-64 bg-white border-2 border-ink/5 rounded-[2rem] p-8 font-medium text-lg text-ink outline-none focus:border-brand-blue focus:shadow-xl transition-all resize-none"
            />
          </div>

          {!aiWritingFeedback && (
            <button
              onClick={handleGetFeedback}
              disabled={isAiLoading || !aiWritingText.trim()}
              className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                aiWritingText.trim() && !isAiLoading ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 active:translate-y-1' : 'bg-ink/5 text-ink-muted cursor-not-allowed'
              }`}
            >
              {isAiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {isAiLoading ? 'Analyzing...' : 'Get AI Feedback'}
            </button>
          )}

          {aiWritingFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-brand-blue/20 rounded-[2.5rem] p-8 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-brand-blue font-display uppercase tracking-tight">AI Feedback</h3>
                <button onClick={() => setAiWritingFeedback('')} className="text-ink-muted hover:text-ink font-bold text-sm">Clear</button>
              </div>
              <div className="prose prose-ink max-w-none">
                <ReactMarkdown>{aiWritingFeedback}</ReactMarkdown>
              </div>
              <button
                onClick={() => setView('ai_lab')}
                className="w-full mt-8 py-4 bg-brand-green text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-green/20"
              >
                Back to Lab
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const renderAIChat = () => {
    const handleSendMessage = async () => {
      if (!aiChatInput.trim() || isAiLoading) return;
      
      const userMessage = { role: 'user' as const, parts: [{ text: aiChatInput }] };
      const newMessages = [...aiChatMessages, userMessage];
      setAiChatMessages(newMessages);
      setAiChatInput('');
      setIsAiLoading(true);

      try {
        const aiResponse = await generateAIChatResponse(newMessages, aiChatTopic);
        setAiChatMessages([...newMessages, { role: 'model' as const, parts: [{ text: aiResponse }] }]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsAiLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-bg flex flex-col max-w-2xl mx-auto">
        <div className="p-6 flex items-center gap-4 bg-white border-b border-ink/5 sticky top-0 z-40">
          <button onClick={() => setView('ai_lab')} className="w-10 h-10 rounded-xl flex items-center justify-center text-ink-muted hover:bg-ink/5">
            <X size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-ink font-display tracking-tight uppercase">AI Chat Partner</h1>
            <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Topic: {aiChatTopic}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {aiChatMessages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-50">
              <div className="w-20 h-20 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-6">
                <MessageCircle size={40} />
              </div>
              <p className="text-ink font-bold text-lg">Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn chào hỏi!</p>
              <p className="text-ink-muted text-sm mt-2">AI sẽ giúp bạn luyện tập phản xạ và sửa lỗi ngữ pháp.</p>
            </div>
          )}
          {aiChatMessages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`max-w-[85%] p-5 rounded-[2rem] font-medium text-lg ${
                msg.role === 'user' 
                  ? 'bg-brand-blue text-white self-end rounded-tr-none' 
                  : 'bg-white border-2 border-ink/5 text-ink self-start rounded-tl-none shadow-sm'
              }`}
            >
              <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
            </motion.div>
          ))}
          {isAiLoading && (
            <div className="bg-white border-2 border-ink/5 text-ink self-start rounded-[2rem] rounded-tl-none p-5 shadow-sm flex gap-2">
              <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-ink/5 sticky bottom-0">
          <div className="relative flex items-center gap-3">
            <input
              type="text"
              value={aiChatInput}
              onChange={(e) => setAiChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-bg border-2 border-ink/5 rounded-2xl py-4 px-6 font-bold text-ink outline-none focus:border-brand-blue focus:bg-white transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!aiChatInput.trim() || isAiLoading}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                aiChatInput.trim() && !isAiLoading ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-ink/5 text-ink-muted'
              }`}
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDailyPlan = () => {
    const plan = stats.dailyPlan;
    if (!plan) return null;

    const completedCount = plan.tasks.filter(t => t.isDone).length;
    const totalCount = plan.tasks.length;
    const progress = (completedCount / totalCount) * 100;

    const startTask = (task: any) => {
      if (task.type === 'vocabulary') {
        let foundTopic: any = null;
        let foundBand: number = 0;
        
        Object.entries(BAND_TOPICS).forEach(([bandStr, topics]) => {
          const topic = (topics as any[]).find(t => t.id === task.targetId);
          if (topic) {
            foundTopic = topic;
            foundBand = parseInt(bandStr);
          }
        });

        if (foundTopic) {
          const words = getWordsForTopic(foundBand, foundTopic.id, stats.completedWords, 5);
          setLearnWords(words);
          setLearnIndex(0);
          setView('learn');
        }
      } else if (task.type === 'grammar') {
        setSelectedGrammarId(task.targetId);
        setView('grammar_theory');
      } else if (task.type === 'review') {
        startReview();
      }
    };

    return (
      <div className="min-h-screen bg-bg pb-32 flex flex-col items-center">
        {/* Header */}
        <div className="w-full bg-white/80 backdrop-blur-md border-b border-ink/5 px-6 py-8 flex flex-col gap-6 max-w-2xl mx-auto sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-ink font-display tracking-tight">Daily Plan</h1>
            <div className="flex items-center gap-2 bg-brand-orange/10 px-4 py-2 rounded-2xl">
              <Flame className="text-brand-orange" fill="currentColor" size={20} />
              <span className="font-black text-brand-orange">{stats.streak} Day Streak</span>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-brand-green/5 border-2 border-brand-green/20 rounded-[2rem] p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-ink-muted font-bold text-sm uppercase tracking-widest mb-1">Today's Progress</p>
                <h2 className="text-2xl font-black text-ink font-display">
                  {completedCount === totalCount ? "Goal Reached! 🎉" : `${totalCount - completedCount} tasks to go`}
                </h2>
              </div>
              <span className="text-3xl font-black text-brand-green font-display">{Math.round(progress)}%</span>
            </div>
            <div className="h-4 bg-ink/5 rounded-full overflow-hidden border border-ink/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-brand-green rounded-full shadow-[0_0_12px_rgba(88,204,2,0.3)]"
              />
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-6">
          {/* Task List */}
          <div className="flex flex-col gap-4">
            {plan.tasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                  task.isDone 
                    ? 'bg-ink/5 border-transparent opacity-60 grayscale' 
                    : 'bg-white border-ink/5 hover:border-brand-green/30 hover:shadow-xl hover:shadow-black/5'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  task.isDone ? 'bg-ink-muted' : 
                  task.type === 'vocabulary' ? 'bg-brand-blue shadow-brand-blue/20' :
                  task.type === 'grammar' ? 'bg-brand-purple shadow-brand-purple/20' :
                  'bg-brand-orange shadow-brand-orange/20'
                }`}>
                  {task.type === 'vocabulary' ? <BookOpen size={32} /> : 
                   task.type === 'grammar' ? <Zap size={32} /> : 
                   <Shield size={32} />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink-muted">
                      {task.type}
                    </span>
                    {task.isDone && (
                      <span className="bg-brand-green/10 text-brand-green text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-ink font-display leading-tight">{task.title}</h3>
                  <p className="text-ink-muted font-bold text-sm mt-1">{task.description}</p>
                </div>

                {!task.isDone && (
                  <button
                    onClick={() => startTask(task)}
                    className="w-12 h-12 rounded-2xl bg-brand-green text-white flex items-center justify-center shadow-lg shadow-brand-green/20 hover:scale-110 active:scale-95 transition-all"
                  >
                    <Zap fill="white" size={24} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {plan.isCompleted && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-brand-green text-white rounded-[2.5rem] p-10 text-center shadow-2xl shadow-brand-green/20 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)]" />
              <div className="text-6xl mb-6 relative z-10">🏆</div>
              <h2 className="text-3xl font-black uppercase mb-2 font-display relative z-10">Daily Goal Met!</h2>
              <p className="font-bold text-white/90 relative z-10">You've completed all tasks for today. Your streak is safe and your brain is growing!</p>
            </motion.div>
          )}
        </div>

        {renderBottomNav()}
      </div>
    );
  };

  const renderMicroSkills = () => {
    return (
      <div className="min-h-screen bg-bg pb-32 flex flex-col items-center">
        {/* Header */}
        <div className="w-full bg-white/80 backdrop-blur-md border-b border-ink/5 px-6 py-10 flex flex-col gap-2 max-w-2xl mx-auto sticky top-0 z-40">
          <h1 className="text-3xl font-black text-ink font-display tracking-tight text-center">IELTS Micro-Skills</h1>
          <p className="text-center text-ink-muted font-bold">Master specific IELTS question types with bite-sized practice.</p>
        </div>

        <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MICRO_SKILLS.map((skill, idx) => {
              const isCompleted = stats.completedMicroSkills?.includes(skill.id);
              const isReading = skill.type === 'reading';
              
              return (
                <motion.button
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedMicroSkillId(skill.id);
                    setMicroSkillAnswer('');
                    setShowMicroSkillFeedback(false);
                    setView('micro_skill_detail');
                  }}
                  className="group relative flex flex-col p-6 rounded-[2rem] bg-white border-2 border-ink/5 hover:border-brand-blue/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 text-left overflow-hidden"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 ${
                    isReading ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                  }`}>
                    {isReading ? <BookOpen size={28} /> : <Volume2 size={28} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                        isReading ? 'bg-brand-blue/10 text-brand-blue' : 'bg-brand-orange/10 text-brand-orange'
                      }`}>
                        {isReading ? 'Reading' : 'Listening'}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-brand-green uppercase tracking-widest">
                          <CheckCircle2 size={12} /> Done
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-ink text-xl font-display leading-tight mb-2">{skill.title}</h3>
                    <p className="text-ink-muted font-bold text-sm line-clamp-2">{skill.question}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-1.5 flex-1 bg-ink/5 rounded-full overflow-hidden mr-4">
                      <div className={`h-full rounded-full ${isCompleted ? 'w-full bg-brand-green' : 'w-0 bg-ink/20'}`} />
                    </div>
                    <div className="text-ink-muted group-hover:text-brand-blue transition-colors">
                      <MoreHorizontal size={20} />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {renderBottomNav()}
      </div>
    );
  };

  const renderMicroSkillDetail = () => {
    const skill = MICRO_SKILLS.find(s => s.id === selectedMicroSkillId);
    if (!skill) return null;

    const checkAnswer = () => {
      const normalizedUser = microSkillAnswer.trim().toLowerCase();
      const normalizedCorrect = skill.correctAnswer.trim().toLowerCase();
      const correct = normalizedUser === normalizedCorrect;
      
      setIsMicroSkillCorrect(correct);
      setShowMicroSkillFeedback(true);

      if (correct) {
        setStats(prev => ({
          ...prev,
          xp: prev.xp + 10,
          completedMicroSkills: Array.from(new Set([...(prev.completedMicroSkills || []), skill.id]))
        }));
      }
    };

    return (
      <div className="min-h-screen bg-bg flex flex-col max-w-2xl mx-auto">
        {/* Header */}
        <div className="p-6 flex items-center gap-4 bg-white border-b border-ink/5 sticky top-0 z-40">
          <button 
            onClick={() => setView('micro_skills')} 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-ink-muted hover:bg-ink/5 transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-ink font-display tracking-tight uppercase">{skill.title}</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-32">
          {skill.type === 'reading' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-ink/5 rounded-[2rem] p-8 mb-8 shadow-sm"
            >
              <p className="text-ink text-lg leading-relaxed font-medium italic relative">
                <span className="text-4xl text-brand-blue/20 absolute -top-4 -left-4 font-serif">"</span>
                {skill.passage}
                <span className="text-4xl text-brand-blue/20 absolute -bottom-8 -right-2 font-serif">"</span>
              </p>
            </motion.div>
          )}

          {skill.type === 'listening' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 mb-10 p-10 bg-white border-2 border-ink/5 rounded-[2.5rem] shadow-sm"
            >
              <button 
                onClick={() => playAudio(skill.audioText || '')}
                className={`w-28 h-28 rounded-[2rem] flex items-center justify-center transition-all duration-300 ${
                  isPlayingAudio 
                    ? 'bg-brand-orange text-white animate-pulse shadow-2xl shadow-brand-orange/40' 
                    : 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20'
                }`}
              >
                <Volume2 size={48} />
              </button>
              <div className="text-center">
                <p className="text-ink font-black text-lg mb-1">Listen to the passage</p>
                <p className="text-ink-muted font-bold text-sm uppercase tracking-widest">Tap the icon to play audio</p>
              </div>
            </motion.div>
          )}

          <div className="mb-10">
            <h2 className="text-2xl font-black text-ink mb-6 font-display leading-tight">{skill.question}</h2>
            
            {skill.options ? (
              <div className="grid grid-cols-1 gap-4">
                {skill.options.map((opt, idx) => (
                  <motion.button
                    key={opt}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => !showMicroSkillFeedback && setMicroSkillAnswer(opt)}
                    className={`group p-6 rounded-2xl border-2 font-bold text-lg transition-all duration-300 text-left relative overflow-hidden ${
                      microSkillAnswer === opt 
                        ? 'bg-brand-blue/5 border-brand-blue text-brand-blue shadow-lg shadow-brand-blue/5' 
                        : 'bg-white border-ink/5 text-ink hover:border-brand-blue/30'
                    } ${showMicroSkillFeedback && opt === skill.correctAnswer ? 'bg-brand-green/10 border-brand-green text-brand-green' : ''}
                      ${showMicroSkillFeedback && microSkillAnswer === opt && opt !== skill.correctAnswer ? 'bg-brand-red/10 border-brand-red text-brand-red' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black border-2 transition-colors ${
                        microSkillAnswer === opt ? 'bg-brand-blue border-brand-blue text-white' : 'bg-white border-ink/10 text-ink-muted'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      {opt}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <input 
                type="text"
                value={microSkillAnswer}
                onChange={(e) => !showMicroSkillFeedback && setMicroSkillAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full bg-white border-2 border-ink/5 rounded-2xl py-5 px-8 font-bold text-xl text-ink outline-none focus:border-brand-blue focus:shadow-xl focus:shadow-brand-blue/5 transition-all"
              />
            )}
          </div>

          {showMicroSkillFeedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-8 rounded-[2rem] border-2 shadow-xl ${
                isMicroSkillCorrect 
                  ? 'bg-brand-green text-white border-transparent shadow-brand-green/20' 
                  : 'bg-brand-red text-white border-transparent shadow-brand-red/20'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {isMicroSkillCorrect ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                </div>
                <h3 className="text-2xl font-black uppercase font-display tracking-tight">
                  {isMicroSkillCorrect ? 'Excellent!' : 'Not quite right'}
                </h3>
              </div>
              <p className="font-bold text-lg mb-8 opacity-90 leading-relaxed">{skill.explanation}</p>
              <button 
                onClick={() => setView('micro_skills')}
                className="w-full py-5 bg-white text-ink rounded-2xl font-black uppercase tracking-widest shadow-lg active:translate-y-1 active:shadow-none transition-all"
              >
                Continue
              </button>
            </motion.div>
          )}
        </div>

        {!showMicroSkillFeedback && (
          <div className="p-6 bg-white border-t border-ink/5 sticky bottom-0 z-40">
            <button 
              onClick={checkAnswer}
              disabled={!microSkillAnswer}
              className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all duration-300 ${
                microSkillAnswer 
                  ? 'bg-brand-green text-white shadow-[0_6px_0_0_#46a302] active:translate-y-1 active:shadow-none' 
                  : 'bg-ink/5 text-ink-muted cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderLogin = () => {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border-2 border-ink/5"
        >
          <div className="w-24 h-24 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <BookOpen size={56} />
          </div>
          <h1 className="text-4xl font-black text-ink mb-4 font-display tracking-tight uppercase">IELTS Master</h1>
          <p className="text-ink-muted mb-10 font-medium text-lg leading-relaxed">
            Chinh phục IELTS với lộ trình cá nhân hóa và phương pháp học thông minh.
          </p>
          <button 
            onClick={signInWithGoogle}
            className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 active:translate-y-1 transition-all flex items-center justify-center gap-4 text-lg"
          >
            <LogIn size={24} />
            Đăng nhập với Google
          </button>
          <p className="mt-8 text-xs text-ink-muted font-bold uppercase tracking-widest opacity-50">
            Bắt đầu hành trình của bạn ngay hôm nay
          </p>
        </motion.div>
      </div>
    );
  };

  const renderProfile = () => {
    return (
      <div className="min-h-screen bg-bg pb-32 flex flex-col items-center">
        {/* Header */}
        <div className="sticky top-0 z-50 w-full bg-white border-b border-ink/5 px-6 py-6 flex justify-between items-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-black text-ink font-display tracking-tight uppercase">Profile</h1>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-ink-muted hover:bg-ink/5 transition-colors">
            <Settings size={24} />
          </button>
        </div>
        
        <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-8 mt-4">
          {/* User Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-ink/5 rounded-[2.5rem] p-8 shadow-sm flex items-center gap-8"
          >
            <div className="relative">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-28 h-28 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue border-4 border-white shadow-xl">
                  <UserIcon size={56} />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-brand-green rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-ink font-display leading-none mb-2">{user?.displayName || 'IELTS Learner'}</h2>
              <div className="flex items-center gap-2 text-ink-muted font-bold text-sm uppercase tracking-widest">
                <Calendar size={14} />
                Joined March 2026
              </div>
            </div>
          </motion.div>

          {/* Statistics Grid */}
          <div>
            <h3 className="text-xl font-black text-ink font-display uppercase tracking-tight mb-6 flex items-center gap-3">
              <div className="w-2 h-6 bg-brand-orange rounded-full" />
              Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white border-2 border-ink/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm"
              >
                <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
                  <Flame fill="currentColor" size={28} />
                </div>
                <div>
                  <div className="text-3xl font-black text-ink font-display leading-none mb-1">{stats.streak}</div>
                  <div className="text-xs font-black text-ink-muted uppercase tracking-widest">Day Streak</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white border-2 border-ink/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm"
              >
                <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue">
                  <Diamond fill="currentColor" size={28} />
                </div>
                <div>
                  <div className="text-3xl font-black text-ink font-display leading-none mb-1">{stats.xp}</div>
                  <div className="text-xs font-black text-ink-muted uppercase tracking-widest">Total XP</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white border-2 border-ink/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm"
              >
                <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-brand-purple">
                  <Trophy fill="currentColor" size={28} />
                </div>
                <div>
                  <div className="text-3xl font-black text-ink font-display leading-none mb-1">
                    {stats.completedTopics?.length || 0}
                  </div>
                  <div className="text-xs font-black text-ink-muted uppercase tracking-widest">Topics</div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-white border-2 border-ink/5 rounded-[2rem] p-6 flex flex-col gap-4 shadow-sm"
              >
                <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green">
                  <BookOpen fill="currentColor" size={28} />
                </div>
                <div>
                  <div className="text-3xl font-black text-ink font-display leading-none mb-1">
                    {stats.completedWords.length}
                  </div>
                  <div className="text-xs font-black text-ink-muted uppercase tracking-widest">Words</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Achievements Placeholder */}
          <div>
            <h3 className="text-xl font-black text-ink font-display uppercase tracking-tight mb-6 flex items-center gap-3">
              <div className="w-2 h-6 bg-brand-purple rounded-full" />
              Achievements
            </h3>
            <div className="bg-white border-2 border-ink/5 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-20 h-20 bg-bg rounded-full flex items-center justify-center text-ink-muted/30">
                <Trophy size={40} />
              </div>
              <div>
                <p className="text-ink font-black text-lg">No achievements yet</p>
                <p className="text-ink-muted font-bold text-sm">Keep learning to unlock special badges!</p>
              </div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full py-4 bg-white border-2 border-brand-red/20 text-brand-red rounded-2xl font-black uppercase tracking-widest shadow-sm active:translate-y-1 transition-all flex items-center justify-center gap-3 mt-4"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
        {renderBottomNav()}
      </div>
    );
  };

  const renderLeaderboard = () => {
    return (
      <div className="min-h-screen bg-bg pb-32">
        <div className="sticky top-0 z-50 w-full bg-white border-b border-ink/5 px-6 py-6 flex justify-between items-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-black text-ink font-display tracking-tight uppercase">Leaderboard</h1>
          <div className="w-10 h-10 bg-brand-purple/10 text-brand-purple rounded-xl flex items-center justify-center">
            <Trophy size={24} />
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-4">
          {leaderboardData.map((entry, index) => (
            <motion.div
              key={entry.uid}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white border-2 rounded-3xl p-4 flex items-center gap-4 shadow-sm ${
                entry.uid === user?.uid ? 'border-brand-blue bg-brand-blue/5' : 'border-ink/5'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                index === 0 ? 'bg-brand-orange text-white' : 
                index === 1 ? 'bg-slate-300 text-ink' :
                index === 2 ? 'bg-orange-300 text-ink' : 'text-ink-muted'
              }`}>
                {index + 1}
              </div>
              
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                {entry.photoURL ? (
                  <img src={entry.photoURL} alt={entry.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                    <UserIcon size={24} />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-black text-ink leading-none mb-1">{entry.displayName}</h3>
                {entry.uid === user?.uid && <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">You</span>}
              </div>

              <div className="flex items-center gap-2 bg-brand-blue/10 px-4 py-2 rounded-2xl text-brand-blue">
                <Diamond fill="currentColor" size={16} />
                <span className="font-black">{entry.xp}</span>
              </div>
            </motion.div>
          ))}

          {leaderboardData.length === 0 && (
            <div className="text-center py-20">
              <p className="text-ink-muted font-bold">Chưa có dữ liệu xếp hạng.</p>
            </div>
          )}
        </div>
        {renderBottomNav()}
      </div>
    );
  };

  const renderNotebook = () => {
    let filteredWords = CAMBRIDGE_ROADMAP;
    
    if (notebookFilter === 'learned') {
      filteredWords = filteredWords.filter(w => stats.completedWords.includes(w.id));
    } else if (notebookFilter === 'review') {
      const now = new Date().toISOString();
      filteredWords = filteredWords.filter(w => {
        const p = stats.wordProgress?.[w.id];
        return p && p.nextReview <= now;
      });
    }

    if (notebookSearch.trim()) {
      const q = notebookSearch.toLowerCase();
      filteredWords = filteredWords.filter(w => 
        w.word.toLowerCase().includes(q) || 
        w.vietnameseDefinition.toLowerCase().includes(q)
      );
    }

    return (
      <div className="min-h-screen bg-bg pb-32 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-50 w-full bg-white border-b border-ink/5 px-6 py-6 max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black text-ink font-display tracking-tight uppercase">Notebook</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-blue/10 rounded-full text-brand-blue text-xs font-black uppercase">
              <Book size={14} />
              {filteredWords.length} Words
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
            <input 
              type="text"
              value={notebookSearch}
              onChange={(e) => setNotebookSearch(e.target.value)}
              placeholder="Search vocabulary..."
              className="w-full bg-bg border-2 border-ink/5 rounded-2xl py-4 pl-12 pr-6 font-bold text-ink outline-none focus:border-brand-blue focus:bg-white transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'all', label: 'All Words', icon: <Layers size={16} /> },
              { id: 'learned', label: 'Learned', icon: <CheckCircle2 size={16} /> },
              { id: 'review', label: 'To Review', icon: <Clock size={16} /> }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setNotebookFilter(filter.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm whitespace-nowrap transition-all ${
                  notebookFilter === filter.id 
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                    : 'bg-bg text-ink-muted hover:bg-ink/5'
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto p-6 flex flex-col gap-4">
          {filteredWords.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-20 h-20 bg-white border-2 border-ink/5 rounded-[2rem] flex items-center justify-center text-ink-muted/30">
                <Search size={40} />
              </div>
              <div>
                <p className="text-ink font-black text-lg">No words found</p>
                <p className="text-ink-muted font-bold text-sm">Try a different search or filter</p>
              </div>
            </div>
          ) : (
            filteredWords.map((word, idx) => {
              const isLearned = stats.completedWords.includes(word.id);
              const progress = stats.wordProgress?.[word.id];
              const isExpanded = selectedNotebookWord?.id === word.id;

              return (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                  className={`bg-white border-2 rounded-[2rem] transition-all duration-300 overflow-hidden ${
                    isExpanded ? 'border-brand-blue shadow-xl shadow-brand-blue/5' : 'border-ink/5 hover:border-brand-blue/30'
                  }`}
                >
                  <button 
                    onClick={() => setSelectedNotebookWord(isExpanded ? null : word)}
                    className="w-full p-6 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${
                        isLearned ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-blue/10 text-brand-blue'
                      }`}>
                        {word.word.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-ink leading-none mb-1">{word.word}</h3>
                        <p className="text-ink-muted font-bold text-sm italic">{word.vietnameseDefinition}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isLearned && <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center text-white"><Check size={14} /></div>}
                      <ChevronDown size={20} className={`text-ink-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 border-t border-ink/5 bg-bg/30"
                      >
                        <div className="pt-6 flex flex-col gap-4">
                          <div>
                            <p className="text-xs font-black text-brand-blue uppercase tracking-widest mb-1">Meaning</p>
                            <p className="text-ink font-bold text-lg">{word.vietnameseDefinition}</p>
                          </div>
                          {word.example && (
                            <div>
                              <p className="text-xs font-black text-brand-orange uppercase tracking-widest mb-1">Example</p>
                              <p className="text-ink font-medium italic bg-white p-4 rounded-xl border border-ink/5">
                                "{word.example}"
                              </p>
                              {word.vietnameseExample && (
                                <p className="text-ink-muted text-sm mt-2">{word.vietnameseExample}</p>
                              )}
                            </div>
                          )}
                          {progress && (
                            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-ink/5">
                              <div className="flex-1">
                                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-1">Mastery</p>
                                <div className="h-2 bg-bg rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-brand-green transition-all duration-500" 
                                    style={{ width: `${(progress.srsLevel / 5) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest mb-1">Level</p>
                                <p className="text-sm font-black text-brand-green">{progress.srsLevel}/5</p>
                              </div>
                            </div>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(word.word);
                            }}
                            className="flex items-center justify-center gap-2 py-3 bg-brand-blue text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-brand-blue/20 active:translate-y-1 active:shadow-none transition-all"
                          >
                            <Volume2 size={18} />
                            Listen Pronunciation
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
        {renderBottomNav()}
      </div>
    );
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-ink-muted font-black uppercase tracking-widest text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return renderLogin();
  }

  return (
    <div className="min-h-screen font-sans selection:bg-[#ddf4ff] selection:text-[#1cb0f6]">
      {view === 'roadmap' && renderRoadmap()}
      {view === 'learn' && renderLearn()}
      {view === 'quiz' && renderQuiz()}
      {view === 'finished' && renderFinished()}
      {view === 'profile' && renderProfile()}
      {view === 'notebook' && renderNotebook()}
      {view === 'leaderboard' && renderLeaderboard()}
      {view === 'grammar_theory' && renderGrammarTheory()}
      {view === 'daily_plan' && renderDailyPlan()}
      {view === 'micro_skills' && renderMicroSkills()}
      {view === 'micro_skill_detail' && renderMicroSkillDetail()}
      {view === 'ai_lab' && renderAILab()}
      {view === 'ai_writing' && renderAIWriting()}
      {view === 'ai_chat' && renderAIChat()}
    </div>
  );
}

