import React, { useState, useEffect, useRef, useCallback, useMemo, ChangeEvent, Component } from 'react';
import { INITIAL_QUOTES } from './data/initialQuotes';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Dumbbell, 
  TrendingUp, 
  User, 
  Plus, 
  ChevronRight, 
  Calendar, 
  Flame, 
  Footprints, 
  Clock,
  ChevronLeft,
  Trash2,
  CheckCircle2,
  ListTodo,
  Square,
  CheckSquare,
  Sun,
  Moon,
  MessageSquare,
  Send,
  Loader2,
  LogOut,
  LogIn,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Database,
  Sparkles,
  Sprout,
  Heart,
  BookOpen,
  Compass,
  GraduationCap,
  Scroll,
  Mountain,
  Bird,
  Share2,
  Youtube,
  Link,
  FileText,
  Video,
  Music,
  File,
  Globe,
  ExternalLink,
  Edit,
  X,
  Wind,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Folder,
  Layout,
  Cloud,
  Lock,
  DollarSign,
  Clover,
  Radio,
  Sword,
  Trophy,
  Medal,
  Star,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, startOfToday, getDay } from 'date-fns';
import { cn } from './lib/utils';
import type { Workout, DailyStats, Exercise, WorkoutSet, DayPlan, PlannedExercise, UserProfile, ChatMessage, Quote, WorkoutComment } from './types';
import { auth, db, googleProvider, signInWithPopup, signOut } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc,
  orderBy, 
  serverTimestamp,
  getDocFromServer,
  limit,
  getCountFromServer,
  documentId
} from 'firebase/firestore';
import { GoogleGenAI, Modality } from "@google/genai";
import YogaView from './components/YogaView';

// Error Boundary Component
class ErrorBoundary extends (Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 text-center">
          <div className="max-w-md space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <Activity className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Something went wrong</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              The application encountered an unexpected error. This might be due to a browser limitation or a temporary connection issue.
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Error Details:</p>
              <pre className="text-[10px] text-zinc-400 overflow-auto max-h-32 font-mono">
                {this.state.error?.message || "Unknown error"}
              </pre>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-emerald-500 text-zinc-950 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Mock Data
const AVATARS = [
  { name: 'Marcus Aurelius', url: 'https://compcharity.org/wp-content/uploads/2026/04/images.jpg' },
  { name: 'Seneca', url: 'https://compcharity.org/wp-content/uploads/2026/04/senecaa.jpg' },
  { name: 'Epictetus', url: 'https://compcharity.org/wp-content/uploads/2026/04/web-Epictetus-Bust-750x400-1.jpg' },
  { name: 'Xunzi', url: 'https://compcharity.org/wp-content/uploads/2026/04/hqdefault.jpg' },
  { name: 'Musonius Rufus', url: 'https://compcharity.org/wp-content/uploads/2026/04/maxresdefault-1.jpg' },
  { name: 'Zeno', url: 'https://compcharity.org/wp-content/uploads/2026/04/zeno_of_citium.jpg' },
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Guest',
  height: 182,
  currentWeight: 80,
  targetWeight: 75,
  stepGoal: 10000,
  shortTermGoal: '+60 kg',
  longTermGoal: '+100 kg',
  maxPullUps: 14,
  oneRMWeighted: 30,
  avatarUrl: AVATARS[0].url,
  seenQuoteIds: [],
  markedQuotes: [],
  dailyExercises: [],
  dailyExerciseHistory: []
};

const WISDOM_LEVELS = [
  { threshold: 10000, title: 'Real Wise Guy', icon: Bird, description: 'Master of all traditions. The ultimate wise guy.', color: 'text-yellow-500' },
  { threshold: 5000, title: 'Sage', icon: Mountain, description: 'A beacon of wisdom and tranquility.', color: 'text-blue-500' },
  { threshold: 1000, title: 'Philosopher', icon: Scroll, description: 'Deeply understands the nature of existence.', color: 'text-purple-500' },
  { threshold: 500, title: 'Scholar', icon: GraduationCap, description: 'A dedicated student of ancient teachings.', color: 'text-emerald-500' },
  { threshold: 100, title: 'Seeker', icon: Compass, description: 'Actively searching for truth and meaning.', color: 'text-orange-500' },
  { threshold: 50, title: 'Apprentice', icon: BookOpen, description: 'Beginning to grasp the core principles.', color: 'text-blue-400' },
  { threshold: 0, title: 'Novice', icon: Sprout, description: 'Just starting the journey of wisdom.', color: 'text-zinc-400' },
];

const getWisdomLevel = (count: number) => {
  const currentLevel = WISDOM_LEVELS.find(l => count >= l.threshold) || WISDOM_LEVELS[WISDOM_LEVELS.length - 1];
  const nextLevelIndex = WISDOM_LEVELS.indexOf(currentLevel) - 1;
  const nextLevel = nextLevelIndex >= 0 ? WISDOM_LEVELS[nextLevelIndex] : null;

  return {
    ...currentLevel,
    nextGoal: nextLevel ? nextLevel.threshold : currentLevel.threshold * 10,
    nextTitle: nextLevel ? nextLevel.title : 'Legend'
  };
};

function WisdomScoreboard({ userProfile, isDarkMode }: { userProfile: UserProfile, isDarkMode: boolean }) {
  const wisdomCount = userProfile.seenQuoteIds?.length || 0;
  const level = getWisdomLevel(wisdomCount);
  const Icon = level.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={cn(
        "backdrop-blur-md border rounded-3xl p-6 transition-colors duration-500",
        isDarkMode ? "bg-zinc-900/60 border-zinc-800/50" : "bg-white/80 border-zinc-200 shadow-sm"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold">Wisdom Scoreboard</h3>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
        )}>
          <Icon className="w-3.5 h-3.5" />
          {level.title}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold">{wisdomCount.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">Wise Quotes Ticked</p>
          </div>
          {wisdomCount >= 10000 && (
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/40 animate-bounce">
                <Bird className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tighter">Real Wise Guy</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Progress to Next Level</span>
            <span>{Math.min(100, (wisdomCount / level.nextGoal) * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (wisdomCount / level.nextGoal) * 100)}%` }}
              className="h-full bg-emerald-500"
            />
          </div>
          <p className="text-[10px] text-zinc-500 text-center italic">
            "{wisdomCount.toLocaleString()} / {level.nextGoal.toLocaleString()} to reach {level.nextTitle}"
          </p>
        </div>
        
        <div className="pt-4 border-t border-zinc-800/50">
          <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2">Wisdom Levels</p>
          <div className="grid grid-cols-1 gap-2">
            {WISDOM_LEVELS.map((l) => (
              <div key={l.title} className="flex items-start gap-2">
                <l.icon className={cn("w-3 h-3 mt-0.5", l.color)} />
                <div>
                  <p className={cn("text-[10px] font-bold", l.color)}>{l.title} ({l.threshold}+)</p>
                  <p className="text-[9px] text-zinc-500">{l.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Mock Data
const MOCK_STATS: DailyStats[] = Array.from({ length: 7 }).map((_, i) => ({
  date: format(subDays(startOfToday(), 6 - i), 'yyyy-MM-dd'),
  steps: Math.floor(Math.random() * 5000) + 5000,
  calories: Math.floor(Math.random() * 1000) + 1500,
  activeMinutes: Math.floor(Math.random() * 60) + 30,
  weight: 80 - (i * 0.2) + (Math.random() * 0.5)
}));

const INITIAL_WEEKLY_PLAN: DayPlan[] = [
  {
    day: 'Monday',
    type: 'Heavy',
    exercises: [
      { id: 'm1', name: 'Pull-ups +20kg', details: '5-4-3-2-1 (15 reps)', completed: false },
      { id: 'm2', name: 'Pull-ups +15kg', details: '5-4-3-2-1 (15 reps)', completed: false },
      { id: 'm3', name: 'Dips +15kg', details: '4 x 8-10 (32-40 reps)', completed: false },
    ]
  },
  {
    day: 'Tuesday',
    type: 'Easy',
    exercises: [
      { id: 't1', name: 'Pull-ups BW', details: '10-9-8-7-6 (40 reps)', completed: false },
      { id: 't2', name: 'Dips BW', details: '3 x 12-15 (36-45 reps)', completed: false },
      { id: 't3', name: 'Dead hang', details: '3 x 30-45 sec', completed: false },
    ]
  },
  {
    day: 'Wednesday',
    type: 'Volume',
    exercises: [
      { id: 'w1', name: 'Pull-ups BW', details: '12-10-8-6 (36 reps)', completed: false },
      { id: 'w2', name: 'Dips +15kg', details: '5 x 8 (40 reps)', completed: false },
    ]
  },
  {
    day: 'Thursday',
    type: 'Light',
    exercises: [
      { id: 'th1', name: 'Pull-ups BW', details: '8-7-6-5 (26 reps)', completed: false },
      { id: 'th2', name: 'Dips BW', details: '3 x 15 (45 reps)', completed: false },
    ]
  },
  {
    day: 'Friday',
    type: 'Mixed',
    exercises: [
      { id: 'f1', name: 'Pull-ups +15kg', details: '6-5-4-3 (18 reps)', completed: false },
      { id: 'f2', name: 'Pull-ups BW', details: '10-8-6 (24 reps)', completed: false },
      { id: 'f3', name: 'Dips +15kg', details: '4 x 10 (40 reps)', completed: false },
    ]
  },
  {
    day: 'Saturday',
    type: 'Simple',
    exercises: [
      { id: 's1', name: 'Pull-ups BW', details: '5 x 10 (50 reps)', completed: false },
      { id: 's2', name: 'Optional dips BW', details: '3 x 10 (30 reps)', completed: false },
    ]
  },
  {
    day: 'Sunday',
    type: 'Off',
    exercises: [
      { id: 'su1', name: 'Dead hang + shoulder stretch', details: 'Recovery only', completed: false },
    ]
  }
];

const MOCK_WORKOUTS: Workout[] = [
  {
    id: '1',
    userId: 'mock-user',
    date: format(subDays(startOfToday(), 1), 'yyyy-MM-dd'),
    name: 'Upper Body Power',
    exercises: [
      {
        id: 'e1',
        name: 'Bench Press',
        sets: [
          { id: 's1', reps: 10, weight: 60 },
          { id: 's2', reps: 8, weight: 65 },
          { id: 's3', reps: 6, weight: 70 },
        ]
      },
      {
        id: 'e2',
        name: 'Pull Ups',
        sets: [
          { id: 's4', reps: 12, weight: 0 },
          { id: 's5', reps: 10, weight: 0 },
        ]
      }
    ]
  }
];

type View = 'dashboard' | 'plan' | 'workouts' | 'progress' | 'profile' | 'chat' | 'library' | 'yoga';

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [historySubView, setHistorySubView] = useState<'journal' | 'plans'>('journal');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(INITIAL_WEEKLY_PLAN);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<DailyStats[]>(MOCK_STATS);
  const [newWeight, setNewWeight] = useState('');
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [quoteCount, setQuoteCount] = useState(0);
  const [isGeneratingQuotes, setIsGeneratingQuotes] = useState(false);
  const [libraryQuotes, setLibraryQuotes] = useState<(Quote & { markedDate?: string })[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [isGeneratingAIQuote, setIsGeneratingAIQuote] = useState(false);
  const [aiCountdown, setAiCountdown] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editComment, setEditComment] = useState('');
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [newQuote, setNewQuote] = useState({ 
    text: '', 
    author: '', 
    source: 'Philosophy',
    wisdomGrade: 'A daily reminder',
    comment: 'This quote changed my life'
  });
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [dashboardWisdomGrade, setDashboardWisdomGrade] = useState('A daily reminder');
  const [dashboardComment, setDashboardComment] = useState('This quote changed my life');
  const [isYogaSessionActive, setIsYogaSessionActive] = useState(false);
  const [isAutoFlowActive, setIsAutoFlowActive] = useState(false);
  const [isAILoopActive, setIsAILoopActive] = useState(false);
  const [autoFlowTimer, setAutoFlowTimer] = useState(30);
  const [activeSoundscape, setActiveSoundscape] = useState<string | null>(null);
  const [quotesPool, setQuotesPool] = useState<Quote[]>([]);
  const quotesPoolRef = useRef<Quote[]>([]);
  const isRefillingPoolRef = useRef(false);
  const isFetchingQuoteRef = useRef(false);
  const [isRefillingPool, setIsRefillingPool] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(new Set());
  const [isLibrarySelectMode, setIsLibrarySelectMode] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('petar_theme');
      return saved ? saved === 'dark' : true;
    } catch (e) {
      return true;
    }
  });
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [currentQuote, setCurrentQuote] = useState<Quote>({
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    source: "Stoic",
    randomId: 0
  });
  const [quoteHistory, setQuoteHistory] = useState<Quote[]>([{
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    source: "Stoic",
    randomId: 0
  }]);
  const quoteHistoryRef = useRef<Quote[]>(quoteHistory);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    quoteHistoryRef.current = quoteHistory;
  }, [quoteHistory]);

  // Initialize Gemini lazily
  const ai = React.useMemo(() => {
    try {
      const key = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
      if (!key) {
        console.warn('GEMINI_API_KEY is missing');
        return null;
      }
      return new GoogleGenAI({ apiKey: key as string });
    } catch (e) {
      console.error('Failed to initialize Gemini:', e);
      return null;
    }
  }, []);

  // Audio State
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleSpeak = useCallback(async (text: string, index: number) => {
    if (isSpeaking === index) {
      currentSourceRef.current?.stop();
      setIsSpeaking(null);
      return;
    }

    if (!ai) return;
    setIsSpeaking(index);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say in a calm, stoic, and authoritative voice: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const pcmData = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          float32Data[i] = pcmData[i] / 32768.0;
        }

        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const buffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        
        currentSourceRef.current = source;
        source.start();
        source.onended = () => {
          setIsSpeaking(null);
          currentSourceRef.current = null;
        };
      }
    } catch (error: any) {
      console.error('TTS failed:', error);
      // Check for quota error (429)
      if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || JSON.stringify(error).includes('429')) {
        console.warn('Daily voice limit reached (Quota 429).');
        // Optional: Show a user-friendly message in the UI if you have a toast system
      }
      setIsSpeaking(null);
    }
  }, [ai, isSpeaking]);

  const fetchAIQuote = useCallback(async (history: Quote[] = []): Promise<Quote | null> => {
    if (!ai) {
      console.warn('AI not initialized - skipping AI quote generation');
      return null;
    }
    setIsGeneratingAIQuote(true);
    setAiCountdown(12);
    
    // Start countdown
    const timer = setInterval(() => {
      setAiCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    console.log('--- GEMINI API CALL START ---');
    console.log('Model: gemini-3-flash-preview');
    console.log('Timestamp:', new Date().toISOString());
    
    try {
      // Pass the last 30 quotes to ensure variety
      const recentTexts = history.slice(-30).map(q => q.text.substring(0, 100)).join(' | ');
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a unique, powerful wise quote from Latin, Jewish, Psychology, Chinese, Japanese, or Latin American traditions. 
        Format as JSON: {text, author, source}.
        
        STRICT RULES:
        1. CRITICAL: Do NOT repeat or paraphrase any of these recent quotes: ${recentTexts}. 
        2. NO DUPLICATES: Ensure the quote is distinct in meaning, wording, and author from the ones listed above.
        3. DIVERSITY: You MUST rotate the tradition. If the last quote was Jewish, pick Psychology, Latin American, or Latin.
        4. FRESHNESS: Avoid the most "cliché" or common quotes if they have been shown recently.
        5. DEPTH: Prefer profound, lesser-known insights over generic motivational phrases.
        
        Seed: ${Math.random()}`,
        config: {
          responseMimeType: "application/json",
          temperature: 1.0,
          topP: 0.95
        }
      });
      
      console.log('--- GEMINI API CALL SUCCESS ---');
      const data = JSON.parse(response.text || '{}');
      if (data.text && data.author) {
        return {
          id: `ai-${Date.now()}`,
          text: data.text,
          author: data.author,
          source: data.source || 'AI Wisdom',
          randomId: Math.random(),
          isAI: true
        };
      }
      return null;
    } catch (error: any) {
      console.error('--- GEMINI API CALL FAILED ---');
      console.error('Error generating AI quote:', error);
      
      if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED' || JSON.stringify(error).includes('429')) {
        console.warn('Daily AI generation limit reached (Quota 429).');
      }
      
      return null;
    } finally {
      clearInterval(timer);
      setIsGeneratingAIQuote(false);
      setAiCountdown(0);
    }
  }, [ai]);

  const refillQuotesPool = useCallback(async (force = false): Promise<Quote[]> => {
    if (isRefillingPoolRef.current || (!force && quotesPoolRef.current.length > 50)) return [];
    
    isRefillingPoolRef.current = true;
    setIsRefillingPool(true);
    try {
      const quotesRef = collection(db, 'quotes');
      const randomStart = Math.random();
      
      // Fetch a large batch of 200 quotes to minimize reads
      const q = query(
        quotesRef, 
        where('randomId', '>=', randomStart), 
        orderBy('randomId'),
        limit(200)
      );
      
      let snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        const q2 = query(
          quotesRef, 
          where('randomId', '<=', randomStart), 
          orderBy('randomId', 'desc'),
          limit(200)
        );
        snapshot = await getDocs(q2);
      }
      
      const newQuotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote));
      
      // Shuffle the new quotes locally
      const shuffled = [...newQuotes].sort(() => Math.random() - 0.5);
      
      setQuotesPool(prev => {
        const existingIds = new Set(prev.map(q => q.id));
        const filtered = shuffled.filter(q => !existingIds.has(q.id));
        return [...prev, ...filtered];
      });
      
      return shuffled;
    } catch (error) {
      console.error('Error refilling quotes pool:', error);
      return [];
    } finally {
      isRefillingPoolRef.current = false;
      setIsRefillingPool(false);
    }
  }, []);

  const fetchRandomQuote = useCallback(async (excludeIds: string[] = [], forceAI: boolean = false) => {
    if (isFetchingQuoteRef.current) return;
    isFetchingQuoteRef.current = true;

    const useLocalFallback = () => {
      const localQuotes = INITIAL_QUOTES;
      const randomIndex = Math.floor(Math.random() * localQuotes.length);
      const fallbackQuote = {
        ...localQuotes[randomIndex],
        id: `local-${Date.now()}-${randomIndex}`,
        randomId: Math.random()
      } as Quote;
      
      setCurrentQuote(fallbackQuote);
      const nextIndex = historyIndex + 1 >= 50 ? 49 : historyIndex + 1;
      setQuoteHistory(prev => {
        const nextHistory = [...prev.slice(0, historyIndex + 1), fallbackQuote];
        if (nextHistory.length > 50) return nextHistory.slice(-50);
        return nextHistory;
      });
      setHistoryIndex(nextIndex);
    };

    try {
      // 1. QUOTA SAVER: If we know quota is exceeded or it's "danger hours" (10PM - 8AM Dublin), use local
      const now = new Date();
      const dublinHour = (now.getUTCHours() + 1) % 24;
      const isDangerHours = dublinHour >= 22 || dublinHour < 8;

      if (isQuotaExceeded || (isDangerHours && !forceAI)) {
        console.log('Quota Saver Active: Using local JSON quotes.');
        useLocalFallback();
        isFetchingQuoteRef.current = false;
        return;
      }

      let selectedQuote: Quote | null = null;

      // 2. Try AI first if forced
      if (forceAI) {
        selectedQuote = await fetchAIQuote(quoteHistoryRef.current);
        if (!selectedQuote) {
          // If AI fails and it was forced, we should probably notify the user
          // For now, we'll just return null to indicate failure
          isFetchingQuoteRef.current = false;
          return null;
        }
      }

      // 2. Try from Pool (Local Cache) - This is the primary optimization
      if (!selectedQuote && !forceAI && quotesPoolRef.current.length > 0) {
        const markedIds = (userProfile.markedQuotes || []).map(q => q.id);
        const seenIds = userProfile.seenQuoteIds || [];
        const historyIds = quoteHistoryRef.current.map(q => q.id).filter(Boolean) as string[];
        
        // Combine all exclusions: passed IDs, marked, seen, and current session history
        const allExcluded = new Set([...excludeIds, ...markedIds, ...seenIds, ...historyIds]);
        
        // Find first quote in pool not in excluded
        const poolIndex = quotesPoolRef.current.findIndex(q => !allExcluded.has(q.id || ''));
        
        if (poolIndex !== -1) {
          selectedQuote = quotesPoolRef.current[poolIndex];
          // Remove from pool immediately in state
          const quoteToPick = selectedQuote;
          setQuotesPool(prev => prev.filter(q => q.id !== quoteToPick.id));
          
          // Trigger refill if pool is getting low (background task)
          if (quotesPoolRef.current.length < 30) {
            refillQuotesPool();
          }
        }
      }

      // 3. Fallback to direct Firestore fetch ONLY if pool is empty or no valid quote found
      if (!selectedQuote) {
        // If pool is empty or exhausted, we must refill it
        const freshQuotes = await refillQuotesPool(true);
        
        if (freshQuotes.length > 0) {
          const markedIds = (userProfile.markedQuotes || []).map(q => q.id);
          const seenIds = userProfile.seenQuoteIds || [];
          const historyIds = quoteHistoryRef.current.map(q => q.id).filter(Boolean) as string[];
          const allExcluded = new Set([...excludeIds, ...markedIds, ...seenIds, ...historyIds]);
          
          selectedQuote = freshQuotes.find(q => !allExcluded.has(q.id || '')) || freshQuotes[0];
        }
      }

      if (selectedQuote) {
        setCurrentQuote(selectedQuote);
        const nextIndex = historyIndex + 1 >= 50 ? 49 : historyIndex + 1;
        setQuoteHistory(prev => {
          const nextHistory = [...prev.slice(0, historyIndex + 1), selectedQuote!];
          if (nextHistory.length > 50) return nextHistory.slice(-50);
          return nextHistory;
        });
        setHistoryIndex(nextIndex);

        // Auto-speak if it's a forced AI generation
        if (selectedQuote.isAI && forceAI) {
          handleSpeak(selectedQuote.text, nextIndex);
        }
      } else {
        // FINAL FALLBACK: Use local INITIAL_QUOTES if everything else fails (Quota exceeded)
        const localQuotes = INITIAL_QUOTES;
        const randomIndex = Math.floor(Math.random() * localQuotes.length);
        const fallbackQuote = {
          ...localQuotes[randomIndex],
          id: `local-${Date.now()}-${randomIndex}`,
          randomId: Math.random()
        } as Quote;
        
        setCurrentQuote(fallbackQuote);
        const nextIndex = historyIndex + 1 >= 50 ? 49 : historyIndex + 1;
        setQuoteHistory(prev => {
          const nextHistory = [...prev.slice(0, historyIndex + 1), fallbackQuote];
          if (nextHistory.length > 50) return nextHistory.slice(-50);
          return nextHistory;
        });
        setHistoryIndex(nextIndex);
        console.warn('Using local fallback quote due to quota or network issues.');
      }
    } catch (error: any) {
      console.error('Firestore fetch failed, attempting AI fallback...', error);
      
      // Check if this was a quota error
      if (error?.message?.includes('Quota') || error?.code === 'resource-exhausted') {
        setIsQuotaExceeded(true);
      }

      try {
        const aiQuote = await fetchAIQuote(quoteHistoryRef.current);
        if (aiQuote) {
          setCurrentQuote(aiQuote);
          const nextIndex = historyIndex + 1 >= 50 ? 49 : historyIndex + 1;
          setQuoteHistory(prev => {
            const nextHistory = [...prev.slice(0, historyIndex + 1), aiQuote!];
            if (nextHistory.length > 50) return nextHistory.slice(-50);
            return nextHistory;
          });
          setHistoryIndex(nextIndex);
          
          if (forceAI) {
            handleSpeak(aiQuote.text, nextIndex);
          }
        } else {
          throw new Error('AI Fallback also failed');
        }
      } catch (aiError) {
        // ULTIMATE FALLBACK: Local quotes
        const localQuotes = INITIAL_QUOTES;
        const randomIndex = Math.floor(Math.random() * localQuotes.length);
        const fallbackQuote = {
          ...localQuotes[randomIndex],
          id: `local-err-${Date.now()}`,
          randomId: Math.random()
        } as Quote;
        setCurrentQuote(fallbackQuote);
        setQuoteHistory(prev => [...prev, fallbackQuote].slice(-50));
        setHistoryIndex(prev => Math.min(prev + 1, 49));
        console.warn('All quote sources exhausted (Quota?). Using local fallback.');
      }
    } finally {
      isFetchingQuoteRef.current = false;
    }
  }, [ai, historyIndex, refillQuotesPool, userProfile.markedQuotes, userProfile.seenQuoteIds, handleSpeak, fetchAIQuote]);

  const goToNextQuote = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isAutoFlowActive) {
      setAutoFlowTimer(30);
    }
    if (isAILoopActive) {
      fetchRandomQuote([], true); // Force AI generation in loop
    } else if (historyIndex < quoteHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCurrentQuote(quoteHistory[nextIndex]);
    } else {
      fetchRandomQuote([], false); // Pull from database by default
    }
  }, [isAutoFlowActive, isAILoopActive, historyIndex, quoteHistory, fetchRandomQuote]);

  const goToPreviousQuote = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isAutoFlowActive) {
      setAutoFlowTimer(30);
    }
    if (quoteHistory.length > 0) {
      const prevIndex = historyIndex > 0 ? historyIndex - 1 : quoteHistory.length - 1;
      setHistoryIndex(prevIndex);
      setCurrentQuote(quoteHistory[prevIndex]);
    }
  };

  const speakQuote = useCallback((quote: Quote) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${quote.text}. By ${quote.author}`);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoFlowActive) {
      interval = setInterval(() => {
        setAutoFlowTimer(prev => {
          if (prev <= 1) {
            goToNextQuote();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setAutoFlowTimer(30);
    }
    return () => clearInterval(interval);
  }, [isAutoFlowActive, goToNextQuote]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAILoopActive && !isAutoFlowActive) {
      interval = setInterval(() => {
        setAutoFlowTimer(prev => {
          if (prev <= 1) {
            goToNextQuote();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAILoopActive, isAutoFlowActive, goToNextQuote]);

  useEffect(() => {
    if (isAutoFlowActive) {
      speakQuote(currentQuote);
    }
  }, [currentQuote, isAutoFlowActive, speakQuote]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const generateAIQuote = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    fetchRandomQuote([], true); // Force AI generation
  };

  const getQuoteId = useCallback((quote: Quote) => {
    return quote.id || `local-${quote.text.slice(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${quote.author.slice(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
  }, []);

  const alreadySaved = useMemo(() => {
    if (!currentQuote) return false;
    const qId = getQuoteId(currentQuote);
    return userProfile.markedQuotes?.some(m => m.id === qId);
  }, [currentQuote, userProfile.markedQuotes, getQuoteId]);

  const markQuoteAsSeen = async () => {
    if (!user) {
      alert("Please sign in to save quotes to your library.");
      return;
    }
    
    // Safety check: Don't proceed if profile isn't loaded to avoid overwriting with empty data
    // We check if the profile UID matches the current user UID
    if (userProfile.uid !== user.uid) {
      console.warn('User profile not yet loaded or UID mismatch:', { profileUid: userProfile.uid, userUid: user.uid });
      // If we have no UID in profile, it might be the initial guest profile
      if (!userProfile.uid) {
        alert("Initializing your profile... Please try again in a moment.");
      }
      return;
    }
    
    // Generate a stable ID if missing (for local initial quotes)
    const quoteId = getQuoteId(currentQuote);
    
    // Prevent duplicate entries for the same quote ID in markedQuotes
    const existingMarked = userProfile.markedQuotes || [];
    const isAlreadyMarked = existingMarked.some(m => m.id === quoteId);
    
    if (isAlreadyMarked) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      return;
    }

    const newSeenIds = Array.from(new Set([...(userProfile.seenQuoteIds || []), quoteId]));
    
    const newMarkedQuotes = [...existingMarked, { 
      id: quoteId, 
      date: new Date().toISOString(),
      wisdomGrade: dashboardWisdomGrade || 'A daily reminder',
      comment: dashboardComment || '',
      text: currentQuote.text || 'Unknown Quote',
      author: currentQuote.author || 'Unknown Author',
      source: currentQuote.source || 'Philosophy',
      category: currentQuote.category || 'wisdom',
      isAI: currentQuote.isAI || false
    }];
    
    try {
      console.log('Attempting to save quote to library:', quoteId);
      
      // Optimistic update to UI state
      setUserProfile(prev => ({
        ...prev,
        seenQuoteIds: newSeenIds,
        markedQuotes: newMarkedQuotes
      }));

      await setDoc(doc(db, 'users', user.uid), { 
        seenQuoteIds: newSeenIds,
        markedQuotes: newMarkedQuotes
      }, { merge: true });
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      
      // Reset comments to current quote's default or standard fallback
      const nextComment = 'This quote changed my life';
      setDashboardWisdomGrade('A daily reminder');
      setDashboardComment(nextComment);
      
      // fetchRandomQuote will be triggered by the useEffect that watches for markedQuotes changes
    } catch (error: any) {
      console.error('Error marking quote as seen:', error);
      if (error?.message?.includes('Quota') || error?.code === 'resource-exhausted') {
        setIsQuotaExceeded(true);
        alert("Daily database limit exceeded. Your progress will be saved locally but might not sync until tomorrow.");
        // Show local success feedback at least
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        alert("Failed to save quote: " + (error.message || "Unknown error"));
      }
    }
  };

  useEffect(() => {
    if (currentQuote && currentQuote.comment) {
      setDashboardComment(currentQuote.comment);
    } else {
      setDashboardComment('This quote changed my life');
    }
  }, [currentQuote]);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const seedQuotes = async () => {
      // Check if already seeded in this session to save reads
      try {
        if (sessionStorage.getItem('wisefit_quotes_seeded_v3')) return;
      } catch (e) {}
      
      try {
        const quotesRef = collection(db, 'quotes');
        const snapshot = await getDocs(query(quotesRef, limit(1)));
        
        if (snapshot.empty) {
          console.log('Seeding initial quotes...');
          for (const q of INITIAL_QUOTES) {
            await addDoc(quotesRef, {
              ...q,
              randomId: Math.random()
            });
          }
        } else {
          // Check if Balkan quotes are already seeded
          const balkanQuery = query(quotesRef, where('source', '==', 'Balkan'), limit(1));
          const balkanSnapshot = await getDocs(balkanQuery);
          
          if (balkanSnapshot.empty) {
            console.log('Seeding Balkan proverbs...');
            const balkanQuotes = INITIAL_QUOTES.filter(q => q.source === 'Balkan');
            for (const q of balkanQuotes) {
              await addDoc(quotesRef, {
                ...q,
                randomId: Math.random()
              });
            }
          }

          // Check if Finance quotes are already seeded
          const financeQuery = query(quotesRef, where('category', '==', 'finance'), limit(1));
          const financeSnapshot = await getDocs(financeQuery);
          
          if (financeSnapshot.empty) {
            console.log('Seeding Finance quotes...');
            const financeQuotes = INITIAL_QUOTES.filter(q => q.category === 'finance');
            if (financeQuotes.length > 0) {
              console.log(`Found ${financeQuotes.length} finance quotes to seed.`);
              for (const q of financeQuotes) {
                await addDoc(quotesRef, {
                  ...q,
                  randomId: Math.random()
                });
              }
              console.log('Finance quotes seeded successfully.');
            }
          } else {
            console.log('Finance quotes already present in database.');
          }

          // Check if Rubenstein quotes are already seeded
          const rubensteinQuery = query(quotesRef, where('author', '==', 'Richard Rubenstein'), limit(1));
          const rubensteinSnapshot = await getDocs(rubensteinQuery);
          
          if (rubensteinSnapshot.empty) {
            console.log('Seeding Rubenstein quotes...');
            const rubensteinQuotes = INITIAL_QUOTES.filter(q => q.author === 'Richard Rubenstein');
            for (const q of rubensteinQuotes) {
              await addDoc(quotesRef, {
                ...q,
                randomId: Math.random()
              });
            }
            console.log('Rubenstein quotes seeded successfully.');
          }

          // Check if Irish quotes are already seeded
          const irishQuery = query(quotesRef, where('source', '==', 'Irish'), limit(1));
          const irishSnapshot = await getDocs(irishQuery);
          
          if (irishSnapshot.empty) {
            console.log('Seeding Irish proverbs...');
            const irishQuotes = INITIAL_QUOTES.filter(q => q.source === 'Irish');
            for (const q of irishQuotes) {
              await addDoc(quotesRef, {
                ...q,
                randomId: Math.random()
              });
            }
          }

          // Check if Psychology quotes are already seeded
          const psychQuery = query(quotesRef, where('source', '==', 'Psychology'), limit(1));
          const psychSnapshot = await getDocs(psychQuery);
          
          if (psychSnapshot.empty) {
            console.log('Seeding Psychology quotes...');
            const psychQuotes = INITIAL_QUOTES.filter(q => q.source === 'Psychology');
            for (const q of psychQuotes) {
              await addDoc(quotesRef, {
                ...q,
                randomId: Math.random()
              });
            }
          }

          // Check if Machiavelli quotes are already seeded
          const machiavelliQuery = query(quotesRef, where('source', '==', 'Machiavelli'));
          const machiavelliSnapshot = await getDocs(machiavelliQuery);
          const existingMachTexts = new Set(machiavelliSnapshot.docs.map(d => d.data().text));
          
          const machiavelliQuotes = INITIAL_QUOTES.filter(q => q.source === 'Machiavelli');
          for (const q of machiavelliQuotes) {
            if (!existingMachTexts.has(q.text)) {
              await addDoc(quotesRef, {
                ...q,
                randomId: Math.random()
              });
            }
          }

          // Check if Legendary quotes are already seeded
          const legendaryQuery = query(quotesRef, where('source', '==', 'Legendary'));
          const legendarySnapshot = await getDocs(legendaryQuery);
          const existingLegendaryTexts = new Set(legendarySnapshot.docs.map(d => d.data().text));
          
          const legendaryQuotes = INITIAL_QUOTES.filter(q => q.source === 'Legendary');
          for (const q of legendaryQuotes) {
            if (!existingLegendaryTexts.has(q.text)) {
              await addDoc(quotesRef, {
                ...q,
                randomId: Math.random()
              });
            }
          }

          // Check if Jewish quotes are already seeded (expanded)
          const jewishQuery = query(quotesRef, where('source', '==', 'Jewish'));
          const jewishSnapshot = await getDocs(jewishQuery);
          const existingJewishTexts = new Set(jewishSnapshot.docs.map(d => d.data().text));
          
          const jewishQuotes = INITIAL_QUOTES.filter(q => q.source === 'Jewish');
          for (const q of jewishQuotes) {
            if (!existingJewishTexts.has(q.text)) {
              await addDoc(quotesRef, {
                ...q,
                randomId: Math.random()
              });
            }
          }

          // Check if Latin quotes are already seeded
          const latinQuery = query(quotesRef, where('source', '==', 'Latin'));
          const latinSnapshot = await getDocs(latinQuery);
          const existingLatinTexts = new Set(latinSnapshot.docs.map(d => d.data().text));
          
          const latinQuotes = INITIAL_QUOTES.filter(q => q.source === 'Latin');
          for (const q of latinQuotes) {
            if (!existingLatinTexts.has(q.text)) {
              await addDoc(quotesRef, {
                ...q,
                randomId: Math.random()
              });
            }
          }

          // Check if Christian quotes are already seeded (the 125 Jesus Christ quotes)
          const christianQuery = query(quotesRef, where('source', '==', 'Christian'));
          const christianSnapshot = await getDocs(christianQuery);
          const existingChristianTexts = new Set(christianSnapshot.docs.map(d => d.data().text));
          
          const christianQuotes = INITIAL_QUOTES.filter(q => q.source === 'Christian');
          for (const q of christianQuotes) {
            if (!existingChristianTexts.has(q.text)) {
              await addDoc(quotesRef, {
                ...q,
                randomId: Math.random()
              });
            }
          }

          // Check if Stoic/Epictetus quotes are already seeded (the 1000 quotes batch)
          const stoicQuery = query(quotesRef, where('author', '==', 'Epictetus'));
          const stoicSnapshot = await getDocs(stoicQuery);
          const existingStoicTexts = new Set(stoicSnapshot.docs.map(d => d.data().text));
          
          const epictetusQuotes = INITIAL_QUOTES.filter(q => q.author === 'Epictetus');
          let epictetusSeedCount = 0;
          for (const q of epictetusQuotes) {
            if (!existingStoicTexts.has(q.text)) {
              await addDoc(quotesRef, {
                ...q,
                randomId: Math.random()
              });
              epictetusSeedCount++;
            }
          }
          if (epictetusSeedCount > 0) {
            console.log(`Seeded ${epictetusSeedCount} new Epictetus quotes.`);
          }
          
          const totalSnapshot = await getDocs(quotesRef);
          console.log(`TOTAL QUOTES IN DATABASE: ${totalSnapshot.size}`);
        }
        try {
          sessionStorage.setItem('wisefit_quotes_seeded_v8', 'true');
        } catch (e) {}
      } catch (error) {
        // Only log if it's not a permission error (which is expected for non-admins)
        if (error instanceof Error && !error.message.includes('permission')) {
          console.error('Error seeding quotes:', error);
        }
      }
    };

    const fetchCount = async () => {
      // Use cached count if available to save reads
      try {
        const cachedCount = localStorage.getItem('wisefit_quote_count');
        if (cachedCount) {
          setQuoteCount(Number(cachedCount));
          // Only re-fetch every hour or so
          const lastFetch = localStorage.getItem('wisefit_quote_count_time');
          if (lastFetch && Date.now() - Number(lastFetch) < 3600000) return;
        }
      } catch (e) {
        // Ignore storage errors
      }

      try {
        const quotesRef = collection(db, 'quotes');
        const snapshot = await getCountFromServer(quotesRef);
        const count = snapshot.data().count;
        setQuoteCount(count);
        try {
          localStorage.setItem('wisefit_quote_count', count.toString());
          localStorage.setItem('wisefit_quote_count_time', Date.now().toString());
        } catch (e) {}
      } catch (error) {
        handleFirestoreError(error, 'get', 'quoteCount');
      }
    };

    // Initial setup
    seedQuotes().then(() => {
      refillQuotesPool(true).then(() => {
        fetchRandomQuote();
      });
      fetchCount();
    });

    // Rotate quotes every 60 seconds from the database pool
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchRandomQuote([], false); // Pull from pool
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthReady, user?.uid]); // Only depend on auth readiness and user ID

  // Safety check: If current quote is marked, fetch a new one
  useEffect(() => {
    if (currentQuote.id && userProfile.markedQuotes?.some(q => q.id === currentQuote.id)) {
      const markedIds = (userProfile.markedQuotes || []).map(q => q.id);
      const excluded = Array.from(new Set([...(userProfile.seenQuoteIds || []), ...markedIds]));
      fetchRandomQuote(excluded);
    }
  }, [userProfile.markedQuotes, currentQuote.id]);

  const generateMoreQuotes = async () => {
    if (isGeneratingQuotes || !ai) return;
    setIsGeneratingQuotes(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generate 50 unique, powerful wise quotes from Stoic, Chinese, Japanese, Jewish, and Christian traditions. Format as JSON array: [{text, author, source}]. No markdown formatting, just the raw JSON array.",
        config: {
          responseMimeType: "application/json"
        }
      });

      const newQuotes = JSON.parse(response.text || '[]');
      const quotesRef = collection(db, 'quotes');
      
      for (const q of newQuotes) {
        await addDoc(quotesRef, {
          ...q,
          randomId: Math.random()
        });
      }
      
      const snapshot = await getCountFromServer(quotesRef);
      const newCount = snapshot.data().count;
      setQuoteCount(newCount);
      alert(`Successfully added ${newQuotes.length} new quotes! Total: ${newCount}`);
    } catch (error) {
      console.error('Error generating quotes:', error);
      alert('Failed to generate quotes. Please try again.');
    } finally {
      setIsGeneratingQuotes(false);
    }
  };

  const generateLatinQuotes = async () => {
    if (isGeneratingQuotes || !ai) return;
    setIsGeneratingQuotes(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generate 50 unique, powerful Latin expressions and philosophical quotes with their English translations. Format as JSON array: [{text, author, source}]. The 'text' field should contain the Latin expression followed by the English translation in parentheses. The 'author' should be the historical figure or 'Ancient Proverb'. The 'source' should be 'Latin'. No markdown formatting, just the raw JSON array.",
        config: {
          responseMimeType: "application/json"
        }
      });

      const newQuotes = JSON.parse(response.text || '[]');
      const quotesRef = collection(db, 'quotes');
      
      for (const q of newQuotes) {
        await addDoc(quotesRef, {
          ...q,
          randomId: Math.random()
        });
      }
      
      const snapshot = await getCountFromServer(quotesRef);
      const newCount = snapshot.data().count;
      setQuoteCount(newCount);
      alert(`Successfully added ${newQuotes.length} new Latin expressions! Total: ${newCount}`);
    } catch (error) {
      console.error('Error generating Latin quotes:', error);
      alert('Failed to generate Latin quotes. Please try again.');
    } finally {
      setIsGeneratingQuotes(false);
    }
  };

  useEffect(() => {
    return () => {
      currentSourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const [copiedQuote, setCopiedQuote] = useState(false);

  const handleShareQuote = async () => {
    const shareText = `"${currentQuote.text}" — ${currentQuote.author} (via WiseFit)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WiseFit Wisdom',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard if share is not supported
      handleCopyQuote();
    }
  };

  const handleCopyQuote = () => {
    const shareText = `"${currentQuote.text}" — ${currentQuote.author}`;
    navigator.clipboard.writeText(shareText);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(null), 2000);
  };

  const handleLogWeight = async () => {
    if (!newWeight || isNaN(Number(newWeight))) return;
    
    const weight = Number(newWeight);
    if (weight < 20 || weight > 500) return; // Basic sanity check
    
    const today = format(startOfToday(), 'yyyy-MM-dd');
    
    const updatedStats = [...stats];
    const existingIndex = updatedStats.findIndex(s => s.date === today);
    
    if (existingIndex >= 0) {
      updatedStats[existingIndex] = { ...updatedStats[existingIndex], weight };
    } else {
      updatedStats.push({
        date: today,
        steps: 0,
        calories: 0,
        activeMinutes: 0,
        weight
      });
    }
    
    setStats(updatedStats);
    setNewWeight('');
    setIsLoggingWeight(false);
    
    // Update user profile current weight
    const updatedProfile = { ...userProfile, currentWeight: weight };
    setUserProfile(updatedProfile);
    
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        currentWeight: weight
      });
      // Also save stats to a separate collection if needed, 
      // but for now we'll just keep it in state and profile.
    }
  };
  const handleAddDailyExercise = async () => {
    if (!newDailyExercise.trim() || (userProfile.dailyExercises?.length || 0) >= 10) return;
    
    const newEx = {
      id: Math.random().toString(36).substr(2, 9),
      name: newDailyExercise,
      completed: false
    };
    
    const updatedProfile = {
      ...userProfile,
      dailyExercises: [...(userProfile.dailyExercises || []), newEx]
    };
    
    setUserProfile(updatedProfile);
    setNewDailyExercise('');
    
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        dailyExercises: updatedProfile.dailyExercises
      });
    }
  };

  const toggleDailyExercise = async (id: string) => {
    const updatedExercises = userProfile.dailyExercises?.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    );
    
    const today = format(startOfToday(), 'yyyy-MM-dd');
    const completedCount = updatedExercises?.filter(ex => ex.completed).length || 0;
    const totalCount = updatedExercises?.length || 0;
    
    const history = userProfile.dailyExerciseHistory || [];
    const existingHistoryIndex = history.findIndex(h => h.date === today);
    
    let updatedHistory = [...history];
    if (existingHistoryIndex >= 0) {
      updatedHistory[existingHistoryIndex] = { date: today, completedCount, totalCount };
    } else {
      updatedHistory.push({ date: today, completedCount, totalCount });
    }
    
    const updatedProfile = { 
      ...userProfile, 
      dailyExercises: updatedExercises,
      dailyExerciseHistory: updatedHistory
    };
    setUserProfile(updatedProfile);
    
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        dailyExercises: updatedExercises,
        dailyExerciseHistory: updatedHistory
      });
    }
  };

  const deleteDailyExercise = async (id: string) => {
    const updatedExercises = userProfile.dailyExercises?.filter(ex => ex.id !== id);
    const updatedProfile = { ...userProfile, dailyExercises: updatedExercises };
    setUserProfile(updatedProfile);
    
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        dailyExercises: updatedExercises
      });
    }
  };

  const handleAddAttachment = async (type: 'file' | 'youtube' | 'article' | 'google-drive', name: string, url: string, fileType?: string) => {
    let finalUrl = url;
    
    // If it's a file, we should ideally store it persistently.
    // Since we don't have Firebase Storage, we'll use Base64 for small files (< 700KB)
    // to ensure they stay there after refresh.
    if (type === 'file' && url.startsWith('blob:')) {
      setIsUploadingFile(true);
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        if (blob.size > 700 * 1024) {
          alert('File is too large (>700KB). Please use a smaller file or a link to ensure it stays saved.');
          // We'll still keep the blob URL for the current session, but it won't persist.
        } else {
          finalUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } catch (error) {
        console.error('Error converting file to base64:', error);
      } finally {
        setIsUploadingFile(false);
      }
    }

    setNewWorkout(prev => ({
      ...prev,
      attachments: [
        ...(prev.attachments || []),
        { id: Math.random().toString(36).substr(2, 9), type, name, url: finalUrl, fileType }
      ]
    }));
  };

  const handleSaveWorkout = async () => {
    if (!newWorkout.name) return;
    
    if (editingWorkoutId) {
      const updatedWorkout = {
        name: newWorkout.name,
        content: newWorkout.content,
        exercises: newWorkout.exercises || [],
        attachments: newWorkout.attachments || []
      };
      
      setWorkouts(prev => prev.map(w => w.id === editingWorkoutId ? { ...w, ...updatedWorkout } : w));
      setIsAddingWorkout(false);
      setEditingWorkoutId(null);
      setNewWorkout({ name: '', content: '', exercises: [], attachments: [] });
      
      if (user) {
        try {
          await updateDoc(doc(db, 'workouts', editingWorkoutId), updatedWorkout);
        } catch (error) {
          console.error('Error updating workout:', error);
        }
      }
      return;
    }

    const workout: Workout = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.uid || 'anonymous',
      date: new Date().toISOString(),
      name: newWorkout.name,
      content: newWorkout.content,
      exercises: newWorkout.exercises || [],
      attachments: newWorkout.attachments || [],
      comments: []
    };
    
    setWorkouts(prev => [workout, ...prev]);
    setIsAddingWorkout(false);
    setNewWorkout({ name: '', content: '', exercises: [], attachments: [] });
    
    if (user) {
      try {
        await addDoc(collection(db, 'workouts'), {
          ...workout,
          userId: user.uid
        });
      } catch (error) {
        handleFirestoreError(error, 'create', 'workouts');
      }
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
    if (user) {
      try {
        await deleteDoc(doc(db, 'workouts', id));
      } catch (error) {
        console.error('Error deleting workout:', error);
      }
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    setNewWorkout({
      name: workout.name,
      content: workout.content,
      exercises: workout.exercises,
      attachments: workout.attachments
    });
    setEditingWorkoutId(workout.id);
    setIsAddingWorkout(true);
  };

  const handleUpdateWorkout = async (updatedWorkout: Workout) => {
    setWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
    if (user) {
      try {
        await updateDoc(doc(db, 'workouts', updatedWorkout.id), {
          attachments: updatedWorkout.attachments
        });
      } catch (error) {
        console.error('Error updating workout:', error);
      }
    }
  };

  const handleAddComment = async (workoutId: string, text: string) => {
    if (!text.trim() || !user) return;
    
    const workoutCommentObj: WorkoutComment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      userName: userProfile.name,
      userAvatar: userProfile.avatarUrl,
      text: text,
      date: new Date().toISOString()
    };
    
    setWorkouts(prev => prev.map(w => {
      if (w.id === workoutId) {
        return { ...w, comments: [...(w.comments || []), workoutCommentObj] };
      }
      return w;
    }));
    
    if (user) {
      try {
        const workoutRef = doc(db, 'workouts', workoutId);
        const workoutSnap = await getDoc(workoutRef);
        if (workoutSnap.exists()) {
          const currentComments = workoutSnap.data().comments || [];
          await updateDoc(workoutRef, {
            comments: [...currentComments, workoutCommentObj]
          });
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!user || !userProfile.markedQuotes) return;
    
    console.log('Cleaning up duplicate quotes...');
    const seen = new Set();
    const uniqueMarked = [];
    
    // Keep the most recent version of each quote (by ID or by text)
    const sorted = [...userProfile.markedQuotes].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const q of sorted) {
      const key = q.id || q.text;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMarked.push(q);
      }
    }
    
    if (uniqueMarked.length === userProfile.markedQuotes.length) {
      console.log('No duplicates found.');
      return;
    }

    try {
      await setDoc(doc(db, 'users', user.uid), { 
        markedQuotes: uniqueMarked.reverse() // Restore chronological order
      }, { merge: true });
      console.log(`Cleaned up ${userProfile.markedQuotes.length - uniqueMarked.length} duplicate quotes.`);
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
    }
  };

  const handleDeleteQuotesFromLibrary = async (quoteIdsToDelete: string[]) => {
    if (!user || !userProfile.markedQuotes || quoteIdsToDelete.length === 0) return;
    
    console.log('Deleting quotes from library:', quoteIdsToDelete.length);

    // Filter out any potential non-string values just in case
    const validIds = quoteIdsToDelete.filter(id => typeof id === 'string' && id);
    if (validIds.length === 0) return;

    // Optimistic update
    const previousMarkedQuotes = [...userProfile.markedQuotes];
    const previousLibraryQuotes = [...libraryQuotes];
    const newMarkedQuotes = userProfile.markedQuotes.filter(q => !validIds.includes(q.id));
    const newLibraryQuotes = libraryQuotes.filter(q => q.id && !validIds.includes(q.id));

    setUserProfile(prev => ({ ...prev, markedQuotes: newMarkedQuotes }));
    setLibraryQuotes(newLibraryQuotes);

    // If we are in selection mode, clear selection immediately for UI responsiveness
    if (isLibrarySelectMode) {
      setSelectedLibraryIds(new Set());
      setIsLibrarySelectMode(false);
    }

    try {
      await setDoc(doc(db, 'users', user.uid), { 
        markedQuotes: newMarkedQuotes 
      }, { merge: true });
      
      // Also check customQuotes collection and delete if any of these were custom
      const customToDelete = validIds.filter(id => {
        const q = libraryQuotes.find(l => l.id === id);
        return q?.isCustom;
      });
      
      if (customToDelete.length > 0) {
        for (const id of customToDelete) {
          try {
            await deleteDoc(doc(db, 'customQuotes', id!));
          } catch (e) {
            console.warn('Could not delete custom quote doc:', id, e);
          }
        }
      }
      console.log('Successfully deleted quotes:', validIds);
    } catch (error) {
      console.error('Error deleting quotes:', error);
      // Revert optimistic update on error
      setUserProfile(prev => ({ ...prev, markedQuotes: previousMarkedQuotes }));
      setLibraryQuotes(previousLibraryQuotes);
    }
  };

  const toggleLibraryQuoteSelection = (id: string) => {
    setSelectedLibraryIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Partial<Workout>>({
    name: '',
    content: '',
    exercises: [],
    attachments: []
  });
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [newDailyExercise, setNewDailyExercise] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          await ensureUserDoc(firebaseUser);
          // Check if admin
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          setIsAdminUser(
            firebaseUser.email === 'petar.dekanovic@gmail.com' || 
            (userDoc.exists() && userDoc.data().role === 'admin')
          );
        } else {
          setIsAdminUser(false);
        }
      } catch (err: any) {
        handleFirestoreError(err, 'init', 'auth');
      } finally {
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchLibraryQuotes = useCallback(async () => {
    if (!user) return;
    setIsLibraryLoading(true);
    console.log('Fetching library quotes for user:', user.uid);
    try {
      const marked = userProfile.markedQuotes || [];
      console.log('Marked quotes in profile:', marked.length);
      
      const markedIds = Array.from(new Set(marked.map(m => m.id).filter(Boolean) as string[]));
      console.log('Unique marked IDs:', markedIds.length);
      
      let allFetchedQuotes: Quote[] = [];

      // Fetch global quotes that are marked as wise
      if (markedIds.length > 0) {
        const quotesRef = collection(db, 'quotes');
        const batches = [];
        // Firestore 'in' query limit is 30
        for (let i = 0; i < markedIds.length; i += 30) {
          batches.push(markedIds.slice(i, i + 30));
        }

        const batchPromises = batches.map(batch => 
          getDocs(query(quotesRef, where(documentId(), 'in', batch)))
        );
        
        const snapshots = await Promise.all(batchPromises);
        allFetchedQuotes = snapshots.flatMap(snapshot => 
          snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote))
        );
        console.log('Fetched global quotes from Firestore:', allFetchedQuotes.length);
      }
      
      // Combine with metadata from markedQuotes
      const filtered = allFetchedQuotes.map(q => {
        const markInfo = marked.find(m => m.id === q.id);
        return { 
          ...q, 
          text: markInfo?.text || q.text,
          author: markInfo?.author || q.author,
          markedDate: markInfo?.date || new Date().toISOString(), 
          wisdomGrade: markInfo?.wisdomGrade || 'A daily reminder',
          comment: markInfo?.comment || '' 
        };
      });

      // Also include marked quotes that might not be in the global collection anymore
      // or were the default quote
      const missingGlobalQuotes = marked
        .filter(m => !allFetchedQuotes.some(q => q.id === m.id))
        .map(m => ({
          id: m.id,
          text: m.text || 'Unknown Quote',
          author: m.author || 'Unknown Author',
          source: m.source || 'Philosophy',
          category: m.category || 'wisdom',
          markedDate: m.date || new Date().toISOString(),
          wisdomGrade: m.wisdomGrade || 'A daily reminder',
          comment: m.comment || '',
          isAI: m.isAI || false
        }));

      console.log('Missing global quotes (using profile data):', missingGlobalQuotes.length);
      
      // Fetch custom quotes
      const customQuotesRef = collection(db, 'customQuotes');
      const qCustom = query(customQuotesRef, where('userId', '==', user.uid));
      const customSnapshot = await getDocs(qCustom);
      const customQuotes = customSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        isCustom: true,
        markedDate: doc.data().date || new Date().toISOString()
      } as Quote));
      console.log('Fetched custom quotes:', customQuotes.length);
        
      // Sort by marked date descending
      const combined = [...filtered, ...missingGlobalQuotes, ...customQuotes].sort((a, b) => {
        const dateA = new Date(a.markedDate || 0).getTime();
        const dateB = new Date(b.markedDate || 0).getTime();
        // Handle invalid dates
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA;
      });

      console.log('Total library quotes combined:', combined.length);
      setLibraryQuotes(combined);
    } catch (error) {
      console.error('Error fetching library quotes:', error);
    } finally {
      setIsLibraryLoading(false);
    }
  }, [user, userProfile.markedQuotes]);

  useEffect(() => {
    if (activeView === 'library') {
      fetchLibraryQuotes();
    }
  }, [activeView, fetchLibraryQuotes]);

  const handleUpdateWisdomData = async (quoteId: string, isCustom: boolean) => {
    if (!user) return;
    
    try {
      if (isCustom) {
        await setDoc(doc(db, 'customQuotes', quoteId), { 
          text: editText,
          author: editAuthor,
          wisdomGrade: editGrade,
          comment: editComment
        }, { merge: true });
      } else {
        const newMarkedQuotes = (userProfile.markedQuotes || []).map(m => 
          m.id === quoteId ? { ...m, text: editText, author: editAuthor, wisdomGrade: editGrade, comment: editComment } : m
        );
        
        await setDoc(doc(db, 'users', user.uid), { 
          markedQuotes: newMarkedQuotes
        }, { merge: true });
      }
      
      setEditingQuoteId(null);
      fetchLibraryQuotes();
    } catch (error) {
      console.error('Error updating wisdom data:', error);
    }
  };

  const handleAddCustomQuote = async () => {
    if (!user || !newQuote.text.trim()) return;
    
    try {
      const quoteData = {
        ...newQuote,
        userId: user.uid,
        date: new Date().toISOString(),
        randomId: Math.random(),
        isCustom: true
      };
      
      await addDoc(collection(db, 'customQuotes'), quoteData);
      setNewQuote({ 
        text: '', 
        author: '', 
        source: 'Philosophy', 
        wisdomGrade: 'A daily reminder',
        comment: 'This quote changed my life'
      });
      setIsAddingQuote(false);
      
      // Re-fetch library quotes using optimized function
      fetchLibraryQuotes();
    } catch (error) {
      console.error('Error adding custom quote:', error);
    }
  };

  const ensureUserDoc = async (firebaseUser: FirebaseUser) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const newProfile: UserProfile = {
        ...INITIAL_PROFILE,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: 'user'
      };
      console.log('Creating new user profile for:', firebaseUser.uid);
      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);
    } else {
      const data = userDoc.data();
      console.log('Loaded existing user profile for:', firebaseUser.uid, 'Marked quotes:', data.markedQuotes?.length || 0);
      setUserProfile({ ...INITIAL_PROFILE, ...data, markedQuotes: data.markedQuotes || [] } as UserProfile);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Listen to user profile
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        console.log('User profile updated via snapshot:', data.name, 'Marked quotes:', data.markedQuotes?.length || 0);
        setUserProfile({ ...INITIAL_PROFILE, ...data, markedQuotes: data.markedQuotes || [] } as UserProfile);
      }
    }, (error) => handleFirestoreError(error, 'get', `users/${user.uid}`));

    // Listen to workouts
    const qWorkouts = query(collection(db, 'workouts'), where('userId', '==', user.uid), orderBy('date', 'desc'));
    const unsubWorkouts = onSnapshot(qWorkouts, (snapshot) => {
      setWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)));
    }, (error) => handleFirestoreError(error, 'list', 'workouts'));

    // Listen to plans
    const qPlans = query(collection(db, 'plans'), where('uid', '==', user.uid));
    const unsubPlans = onSnapshot(qPlans, (snapshot) => {
      if (!snapshot.empty) {
        setWeeklyPlan(snapshot.docs[0].data().plan as DayPlan[]);
      } else {
        // Use a one-time check to prevent infinite loops in onSnapshot
        const checkAndSeed = async () => {
          try {
            if (sessionStorage.getItem(`wisefit_plan_seeded_${user.uid}`)) return;
          } catch (e) {}
          
          const checkSnapshot = await getDocs(qPlans);
          if (checkSnapshot.empty) {
            await addDoc(collection(db, 'plans'), { uid: user.uid, plan: INITIAL_WEEKLY_PLAN });
            try {
              sessionStorage.setItem(`wisefit_plan_seeded_${user.uid}`, 'true');
            } catch (e) {}
          }
        };
        checkAndSeed();
      }
    }, (error) => handleFirestoreError(error, 'list', 'plans'));

    return () => {
      unsubProfile();
      unsubWorkouts();
      unsubPlans();
    };
  }, [user]);

  const handleFirestoreError = (error: any, operationType: string, path: string) => {
    if (error.message?.includes('Quota limit exceeded') || error.message?.includes('quota') || error.code === 'resource-exhausted') {
      setIsQuotaExceeded(true);
      // Don't set fatal error, let app continue in local mode
      return;
    }
    
    const errInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email
      }
    };
    console.error('Firestore Error:', JSON.stringify(errInfo));
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(INITIAL_PROFILE);
      setWeeklyPlan(INITIAL_WEEKLY_PLAN);
      setWorkouts([]);
      setActiveView('dashboard');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const toggleExercise = async (dayIndex: number, exerciseId: string) => {
    if (!user) return;
    const newPlan = [...weeklyPlan];
    const day = newPlan[dayIndex];
    const exercise = day.exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      exercise.completed = !exercise.completed;
      setWeeklyPlan(newPlan);
      
      // Update in Firestore
      try {
        const qPlans = query(collection(db, 'plans'), where('uid', '==', user.uid));
        const snapshot = await getDocs(qPlans);
        if (!snapshot.empty) {
          const planDoc = snapshot.docs[0];
          await setDoc(planDoc.ref, { plan: newPlan }, { merge: true });
        }
      } catch (error) {
        handleFirestoreError(error, 'update', 'plans');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading || !ai) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);
    
    // Stop any current speaking
    if (isSpeaking !== null) {
      currentSourceRef.current?.stop();
      setIsSpeaking(null);
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: chatMessages.concat(userMessage),
        config: {
          systemInstruction: `You are AI Stoic, an expert fitness coach and a master of ancient wisdom. 
          Your coaching style is deeply rooted in:
          1. Stoicism (Marcus Aurelius, Seneca, Epictetus): Focus on what you can control, endurance, and mental fortitude.
          2. Chinese Philosophy (especially Xunzi): Emphasize that human nature can be refined through deliberate effort and discipline.
          3. Japanese Wisdom (Bushido, Zen): Focus on precision, mindfulness, and the way of the warrior.
          4. Jewish Wisdom: Emphasize community, resilience, and the value of every small action.
          5. Teachings of Jesus Christ: Focus on compassion, humility, and inner transformation.
          
          Help the user (Petar) with their workout plan (pull-ups and dips), nutrition, and motivation. 
          Integrate quotes and principles from these traditions naturally into your advice. 
          Be encouraging but firm in the pursuit of excellence.
          
          Always start your response with a short, powerful quote from one of these traditions that relates to the user's current situation or question.`,
        }
      });

      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: response.text || 'Sorry, I could not generate a response.' }] };
      setChatMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Gemini Error:', error);
      setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Error connecting to the Force. Please try again.' }] }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthReady && !user) {
      try {
        const hasSeenWelcome = sessionStorage.getItem('wisefit_welcome_seen');
        if (!hasSeenWelcome) {
          setShowWelcomeModal(true);
        }
      } catch (e) {
        setShowWelcomeModal(true);
      }
    }
  }, [isAuthReady, user]);

  const dismissWelcome = () => {
    setShowWelcomeModal(false);
    try {
      sessionStorage.setItem('wisefit_welcome_seen', 'true');
    } catch (e) {}
  };

  const handleWelcomeLogin = async () => {
    dismissWelcome();
    handleLogin();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem('petar_theme', isDarkMode ? 'dark' : 'light');
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [isDarkMode]);

  const todayStats = (stats && stats.length > 0) ? stats[stats.length - 1] : MOCK_STATS[0];
  const currentDayIndex = (getDay(new Date()) + 6) % 7; // Monday is 0

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-emerald-500/30 overflow-x-hidden relative transition-colors duration-500",
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcomeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismissWelcome}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border shadow-2xl",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
              )}
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto">
                  <Activity className="w-10 h-10 text-emerald-500" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Welcome to WiseFit</h2>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    isDarkMode ? "text-zinc-400" : "text-zinc-500"
                  )}>
                    Embark on a journey of physical mastery and ancient wisdom. You can explore all features as a guest.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    onClick={dismissWelcome}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95",
                      isDarkMode ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    )}
                  >
                    Continue as Guest
                  </button>
                  <button
                    onClick={handleWelcomeLogin}
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    Sign In to Save Progress
                  </button>
                </div>

                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  Login is only required for admins to post content
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Background Graphic Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          isDarkMode ? "opacity-20" : "opacity-10"
        )}>
          <img 
            src="https://compcharity.org/wp-content/uploads/2026/04/e0efb5a2-1d04-40b2-b3fa-459dfdab069e_839bb3b2-scaled.jpg" 
            alt="Stoic Background" 
            className="w-full h-full object-cover scale-110 animate-pulse-slow"
            referrerPolicy="no-referrer"
          />
          {/* Vignette Effect */}
          <div className={cn(
            "absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]",
            !isDarkMode && "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.4)_100%)]"
          )} />
          {/* Subtle Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://compcharity.org/wp-content/uploads/2026/04/StoicsColourPainting.jpg')]" />
        </div>
        
        <div className={cn(
          "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000",
          isDarkMode ? "bg-emerald-500/10" : "bg-emerald-500/5"
        )} />
        <div className={cn(
          "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000",
          isDarkMode ? "bg-purple-500/10" : "bg-purple-500/5"
        )} />
      </div>

      {/* Header */}
      <header className={cn(
        "sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between transition-colors duration-500",
        isDarkMode ? "bg-zinc-950/60 border-zinc-800/50" : "bg-white/60 border-zinc-200"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center overflow-hidden border border-emerald-500/20">
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20 80 Q50 95 80 80 Q90 40 50 20 Q10 40 20 80' fill='%23064e3b'/%3E%3Ccircle cx='35' cy='50' r='12' fill='white'/%3E%3Ccircle cx='65' cy='50' r='12' fill='white'/%3E%3Ccircle cx='35' cy='50' r='5' fill='%23064e3b'/%3E%3Ccircle cx='65' cy='50' r='5' fill='%23064e3b'/%3E%3Cpath d='M46 60 L54 60 L50 70 Z' fill='%23fbbf24'/%3E%3Cpath d='M50 15 Q55 25 50 35 Q45 25 50 15' fill='%23f59e0b'/%3E%3Cpath d='M25 35 L15 20 L35 30' fill='%23064e3b'/%3E%3Cpath d='M75 35 L85 20 L65 30' fill='%23064e3b'/%3E%3C/svg%3E" 
              alt="WiseFit Logo" 
              className="w-8 h-8"
            />
          </div>
          <div>
            <h1 className={cn(
              "text-xl font-bold tracking-tight transition-colors",
              isDarkMode ? "text-emerald-400" : "text-emerald-600"
            )}>WiseFit</h1>
            <p className={cn(
              "text-xs font-medium uppercase tracking-widest transition-colors",
              isDarkMode ? "text-zinc-500" : "text-zinc-400"
            )}>
              {format(new Date(), 'EEEE, MMM d')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!user && (
            <button 
              onClick={handleLogin}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95",
                isDarkMode ? "bg-emerald-500 text-zinc-950" : "bg-emerald-600 text-white"
              )}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-2 rounded-xl transition-all active:scale-90",
              isDarkMode ? "bg-zinc-900 text-yellow-400 border border-zinc-800" : "bg-zinc-100 text-zinc-600 border border-zinc-200"
            )}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className={cn(
            "w-10 h-10 rounded-full border flex items-center justify-center overflow-hidden transition-colors",
            isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-200 border-zinc-300"
          )}>
            <img 
              src={userProfile.avatarUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pb-24 px-4 pt-6 max-w-md mx-auto">
        {isQuotaExceeded && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-6 p-4 rounded-2xl border flex items-center gap-3",
              isDarkMode ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : "bg-orange-50/50 border-orange-200 text-orange-600"
            )}
          >
            <Database className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold">Quota Saver Active</p>
              <p className="opacity-80">Daily limit reached. Using local JSON quotes until reset (8am Dublin).</p>
            </div>
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="space-y-6"
            >
              {/* Daily Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  index={0}
                  isDarkMode={isDarkMode}
                  icon={<Footprints className="w-5 h-5 text-blue-400" />}
                  label="Steps"
                  value={todayStats.steps.toLocaleString()}
                  goal={userProfile.stepGoal.toLocaleString()}
                  progress={todayStats.steps / userProfile.stepGoal}
                  color="bg-blue-500"
                />
                <StatCard 
                  index={1}
                  isDarkMode={isDarkMode}
                  icon={<Flame className="w-5 h-5 text-orange-400" />}
                  label="Calories"
                  value={todayStats.calories.toLocaleString()}
                  goal="2,500"
                  progress={todayStats.calories / 2500}
                  color="bg-orange-500"
                />
                <StatCard 
                  index={2}
                  isDarkMode={isDarkMode}
                  icon={<Clock className="w-5 h-5 text-emerald-400" />}
                  label="Active"
                  value={`${todayStats.activeMinutes}m`}
                  goal="60m"
                  progress={todayStats.activeMinutes / 60}
                  color="bg-emerald-500"
                />
                <StatCard 
                  index={3}
                  isDarkMode={isDarkMode}
                  icon={<Activity className="w-5 h-5 text-purple-400" />}
                  label="Weight"
                  value={`${userProfile.currentWeight.toFixed(1)}kg`}
                  goal={`${userProfile.targetWeight}kg`}
                  progress={userProfile.targetWeight / userProfile.currentWeight}
                  color="bg-purple-500"
                />
              </div>

              {/* Stoic Quote of the Day */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  "backdrop-blur-md border rounded-3xl p-6 relative overflow-hidden transition-all duration-500",
                  currentQuote.source === 'Legendary'
                    ? (isDarkMode ? "bg-amber-900/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "bg-amber-50/50 border-amber-200 shadow-sm")
                    : currentQuote.source === 'Machiavelli'
                      ? (isDarkMode ? "bg-red-900/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "bg-red-50/50 border-red-200 shadow-sm")
                      : currentQuote.source === 'Jewish'
                        ? (isDarkMode ? "bg-cyan-900/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]" : "bg-cyan-50/50 border-cyan-200 shadow-sm")
                        : currentQuote.source === 'Latin'
                          ? (isDarkMode ? "bg-slate-900/10 border-slate-500/30 shadow-[0_0_20px_rgba(100,116,139,0.1)]" : "bg-slate-50/50 border-slate-200 shadow-sm")
                          : currentQuote.category === 'finance'
                            ? (isDarkMode ? "bg-emerald-900/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-emerald-50/50 border-emerald-200 shadow-sm")
                            : currentQuote.isAI
                              ? (isDarkMode ? "bg-purple-900/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]" : "bg-purple-50/50 border-purple-200 shadow-sm")
                              : currentQuote.source === 'Christian'
                          ? (isDarkMode ? "bg-indigo-900/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]" : "bg-indigo-50/50 border-indigo-200 shadow-sm")
                          : (isDarkMode ? "bg-zinc-900/60 border-zinc-800/50" : "bg-white/80 border-zinc-200 shadow-sm")
                )}
              >
                <div className="absolute top-[-20px] right-[-20px] opacity-10">
                  {currentQuote.source === 'Irish' ? (
                    <Clover className="w-24 h-24 text-emerald-500" />
                  ) : currentQuote.source === 'Machiavelli' ? (
                    <Sword className="w-24 h-24 text-red-500" />
                  ) : currentQuote.source === 'Legendary' ? (
                    <Trophy className="w-24 h-24 text-amber-500" />
                  ) : currentQuote.source === 'Jewish' ? (
                    <Star className="w-24 h-24 text-cyan-500" />
                  ) : currentQuote.source === 'Latin' ? (
                    <Scroll className="w-24 h-24 text-slate-500" />
                  ) : currentQuote.source === 'Christian' ? (
                    <Heart className="w-24 h-24 text-indigo-500" />
                  ) : currentQuote.category === 'finance' ? (
                    <DollarSign className="w-24 h-24 text-emerald-500" />
                  ) : (
                    <Flame className="w-24 h-24 text-emerald-500" />
                  )}
                </div>
                {currentQuote.source === 'Legendary' && (
                  <div className="absolute bottom-[-20px] left-[-20px] opacity-10">
                    <Medal className="w-24 h-24 text-amber-500" />
                  </div>
                )}
                <div className="relative z-10 space-y-3">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuote.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                            currentQuote.source === 'Irish'
                              ? (isDarkMode ? "text-emerald-400" : "text-emerald-600")
                              : currentQuote.category === 'finance'
                                ? (isDarkMode ? "text-emerald-400" : "text-emerald-600")
                                : currentQuote.isAI 
                                  ? (isDarkMode ? "text-purple-400" : "text-purple-600")
                                  : (isDarkMode ? "text-emerald-500/70" : "text-emerald-600/70")
                          )}>{currentQuote.source} Wisdom</p>
                          {currentQuote.source === 'Irish' && (
                            <div className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-tighter",
                              isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                            )}>
                              <Clover className="w-2 h-2" />
                              Irish Wisdom
                            </div>
                          )}
                          {currentQuote.category === 'finance' && currentQuote.source !== 'Irish' && (
                            <div className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-tighter",
                              isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                            )}>
                              <DollarSign className="w-2 h-2" />
                              Financial Wisdom
                            </div>
                          )}
                          {currentQuote.isAI && (
                            <div className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-tighter",
                              isDarkMode ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-purple-50 border-purple-100 text-purple-600"
                            )}>
                              <Sparkles className="w-2 h-2" />
                              AI Generated
                            </div>
                          )}
                        </div>
                        <p className={cn(
                          "text-lg font-serif italic leading-relaxed transition-colors",
                          currentQuote.category === 'finance'
                            ? (isDarkMode ? "text-emerald-50" : "text-emerald-900")
                            : currentQuote.isAI
                              ? (isDarkMode ? "text-purple-100" : "text-purple-900")
                              : (isDarkMode ? "text-zinc-100" : "text-zinc-900")
                        )}>
                          "{currentQuote.text}"
                        </p>
                        <p className={cn(
                          "text-[11px] font-bold transition-colors",
                          currentQuote.category === 'finance'
                            ? (isDarkMode ? "text-emerald-400" : "text-emerald-600")
                            : currentQuote.isAI
                              ? (isDarkMode ? "text-purple-400" : "text-purple-600")
                              : (isDarkMode ? "text-blue-400" : "text-blue-600")
                        )}>{currentQuote.author}</p>
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block text-center">Comment:</label>
                          <textarea
                            value={dashboardComment}
                            onChange={(e) => setDashboardComment(e.target.value)}
                            placeholder="Add a personal reflection..."
                            className={cn(
                              "w-full p-2 rounded-lg border text-[10px] focus:outline-none focus:ring-1 transition-all resize-none h-10 text-center",
                              isDarkMode 
                                ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-emerald-500/50" 
                                : "bg-white border-zinc-200 text-zinc-900 focus:ring-emerald-500/20"
                            )}
                          />
                          <button
                            type="button"
                            onClick={markQuoteAsSeen}
                            className={cn(
                              "w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-sm mt-1",
                              isDarkMode 
                                ? "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-emerald-400" 
                                : "bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-zinc-100 hover:text-emerald-600"
                            )}
                          >
                            COMMENT
                          </button>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={goToPreviousQuote}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm",
                                isDarkMode 
                                  ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20" 
                                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100"
                              )}
                            >
                              <ChevronLeft className="w-3 h-3" />
                              Previous
                            </button>
                            <button
                              type="button"
                              onClick={goToNextQuote}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm",
                                isDarkMode 
                                  ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20" 
                                  : "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100"
                              )}
                            >
                              Next Quote
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setIsAutoFlowActive(!isAutoFlowActive);
                            }}
                            className={cn(
                              "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm",
                              isAutoFlowActive
                                ? (isDarkMode ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-50 text-emerald-600 border border-emerald-100")
                                : (isDarkMode ? "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200")
                            )}
                          >
                            {isAutoFlowActive ? (
                              <>
                                <Volume2 className="w-3 h-3 animate-pulse" />
                                Auto-Flow Active ({autoFlowTimer}s)
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                Start Auto-Flow (30s)
                              </>
                            )}
                          </button>
                          
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={generateAIQuote}
                              disabled={isGeneratingAIQuote || !isAdminUser}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm relative overflow-hidden",
                                (isGeneratingAIQuote || !isAdminUser) ? "opacity-50 cursor-not-allowed" : "",
                                isDarkMode 
                                  ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30" 
                                  : "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100"
                              )}
                            >
                              {isGeneratingAIQuote ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Generating ({aiCountdown}s)
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3 h-3" />
                                  Create New (AI)
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const nextState = !isAILoopActive;
                                setIsAILoopActive(nextState);
                                if (nextState) setAutoFlowTimer(30);
                              }}
                              className={cn(
                                "px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm flex items-center gap-1",
                                isAILoopActive
                                  ? (isDarkMode ? "bg-purple-500 text-white" : "bg-purple-600 text-white")
                                  : (isDarkMode ? "bg-zinc-800 text-zinc-400 border border-zinc-700" : "bg-zinc-100 text-zinc-600 border border-zinc-200")
                              )}
                              title="Toggle AI Generation Loop"
                            >
                              <RefreshCw className={cn("w-3 h-3", isAILoopActive && "animate-spin")} />
                              {isAILoopActive ? `Looping (${autoFlowTimer}s)` : "Loop"}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={handleCopyQuote}
                            className={cn(
                              "p-2 rounded-lg transition-all active:scale-95",
                              isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                            )}
                            title="Copy Quote"
                          >
                            {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => speakQuote(currentQuote)}
                            className={cn(
                              "p-2 rounded-lg transition-all active:scale-95",
                              isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                            )}
                            title="Listen to Quote"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleShareQuote}
                            className={cn(
                              "p-2 rounded-lg transition-all active:scale-95",
                              isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                            )}
                            title="Share Quote"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={markQuoteAsSeen}
                            disabled={(isSaved && !alreadySaved)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95",
                              (isSaved || alreadySaved) 
                                ? "bg-emerald-500 text-white" 
                                : (isDarkMode ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100")
                            )}
                          >
                            {isSaved || alreadySaved ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {alreadySaved ? 'In Library' : 'Saved!'}
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                Mark as Wise
                              </>
                            )}
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block text-center">Grade:</label>
                          <select
                            value={dashboardWisdomGrade}
                            onChange={(e) => setDashboardWisdomGrade(e.target.value)}
                            className={cn(
                              "w-full p-2 rounded-lg border text-[9px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 transition-all cursor-pointer text-center appearance-none",
                              isDarkMode 
                                ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-emerald-500/50" 
                                : "bg-white border-zinc-200 text-zinc-900 focus:ring-emerald-500/20"
                            )}
                          >
                              <option value="The wisest quote ever" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>The wisest quote ever</option>
                              <option value="My favourite" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>My favourite</option>
                              <option value="This one changed my life for better" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>This one changed my life for better</option>
                              <option value="I realised this quote is so true in my own experience" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>I realised this quote is so true in my own experience</option>
                              <option value="A daily reminder" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>A daily reminder</option>
                              <option value="Deeply profound" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Deeply profound</option>
                              <option value="Simple but powerful" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Simple but powerful</option>
                              <option value="Hidden gem" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Hidden gem</option>
                              <option value="Timeless truth" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Timeless truth</option>
                              <option value="A guiding star" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>A guiding star</option>
                              <option value="Pure inspiration" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Pure inspiration</option>
                              <option value="Soul-stirring" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Soul-stirring</option>
                              <option value="Mind-expanding" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Mind-expanding</option>
                              <option value="Life-affirming" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Life-affirming</option>
                              <option value="Brutally honest" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Brutally honest</option>
                              <option value="Quietly powerful" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Quietly powerful</option>
                              <option value="A spark in the dark" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>A spark in the dark</option>
                              <option value="Universal truth" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Universal truth</option>
                              <option value="Soul-nourishing" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Soul-nourishing</option>
                              <option value="Intellectually stimulating" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Intellectually stimulating</option>
                              <option value="A beacon of hope" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>A beacon of hope</option>
                              <option value="Profoundly simple" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Profoundly simple</option>
                              <option value="Echoes of the ancients" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Echoes of the ancients</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>

              {/* Ritual Soundscapes */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-3xl border transition-all duration-500 mt-4",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/60 border-zinc-200 shadow-sm"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Ritual Soundscapes</h3>
                  </div>
                  {activeSoundscape && (
                    <button 
                      onClick={() => setActiveSoundscape(null)}
                      className="text-[9px] font-bold uppercase text-red-500 hover:text-red-400 transition-colors"
                    >
                      Stop Music
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveSoundscape('focus')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      activeSoundscape === 'focus'
                        ? (isDarkMode ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <Volume2 className="w-3 h-3" />
                    Focus Mode
                  </button>
                  <button
                    onClick={() => setActiveSoundscape('techno')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      activeSoundscape === 'techno'
                        ? (isDarkMode ? "bg-purple-500/20 border-purple-500/40 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <Activity className="w-3 h-3" />
                    Techno/House
                  </button>
                  <button
                    onClick={() => setActiveSoundscape('jazz')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      activeSoundscape === 'jazz'
                        ? (isDarkMode ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <Music className="w-3 h-3" />
                    Smooth Jazz
                  </button>
                  <button
                    onClick={() => setActiveSoundscape('classical')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      activeSoundscape === 'classical'
                        ? (isDarkMode ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <Scroll className="w-3 h-3" />
                    Classical
                  </button>
                </div>

                {activeSoundscape && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 overflow-hidden rounded-2xl border border-zinc-800/50"
                  >
                    <div className="bg-zinc-900/80 p-2 text-[8px] font-bold uppercase tracking-tighter text-zinc-500 flex justify-between items-center">
                      <span>Live Stream Active</span>
                      <span className="text-emerald-500 animate-pulse">● Volume tip: Adjust in player</span>
                    </div>
                    {activeSoundscape === 'jazz' || activeSoundscape === 'classical' ? (
                      <div className="relative h-20 bg-zinc-950 flex items-center px-4 gap-4">
                        <img 
                          src={activeSoundscape === 'jazz' ? "https://picsum.photos/seed/jazz-sax/200/200" : "https://picsum.photos/seed/classical-violin/200/200"} 
                          alt={activeSoundscape === 'jazz' ? "Jazz" : "Classical"} 
                          className="w-12 h-12 rounded-lg object-cover border border-zinc-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-zinc-100 uppercase tracking-wider">
                            {activeSoundscape === 'jazz' ? "WRTI Jazz Radio" : "Classic FM"}
                          </p>
                          <p className="text-[8px] text-zinc-500 uppercase tracking-tighter">Live Stream</p>
                        </div>
                        <audio
                          autoPlay
                          controls
                          className="h-8 w-32 opacity-80"
                          src={activeSoundscape === 'jazz' ? "https://wrti-live.streamguys1.com/jazz-mp3" : "https://media-ice.musicradio.com/ClassicFMMP3"}
                        />
                      </div>
                    ) : (
                      <iframe
                        width="100%"
                        height="80"
                        src={
                          activeSoundscape === 'focus' ? "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1" :
                          "https://www.youtube.com/embed/4xDzrJKXOOY?autoplay=1"
                        }
                        title="Ritual Soundscape"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="opacity-80 grayscale hover:grayscale-0 transition-all duration-500"
                      />
                    )}
                  </motion.div>
                )}
              </motion.div>

              {/* Wisdom Scoreboard */}
              <WisdomScoreboard userProfile={userProfile} isDarkMode={isDarkMode} />

              {/* Activity Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(
                  "backdrop-blur-md border rounded-3xl p-6 transition-colors duration-500",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/60 border-zinc-200 shadow-sm"
                )}
              >
                <h3 className={cn(
                  "text-sm font-semibold mb-4 uppercase tracking-wider transition-colors",
                  isDarkMode ? "text-zinc-400" : "text-zinc-500"
                )}>Weekly Activity</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#27272a" : "#e4e4e7"} vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(str) => format(new Date(str), 'EEE')}
                        stroke={isDarkMode ? "#71717a" : "#a1a1aa"}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#18181b' : '#ffffff', 
                          border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`, 
                          borderRadius: '12px',
                          color: isDarkMode ? '#ffffff' : '#000000'
                        }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="steps" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorSteps)" 
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Today's Plan Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Today's Plan</h3>
                  <button 
                    onClick={() => setActiveView('plan')}
                    className="text-sm text-emerald-500 font-medium flex items-center gap-1"
                  >
                    Full Plan <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className={cn(
                  "backdrop-blur-md border rounded-3xl p-5 transition-colors duration-500",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/60 border-zinc-200 shadow-sm"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-emerald-500">{weeklyPlan[currentDayIndex].day} - {weeklyPlan[currentDayIndex].type}</h4>
                  </div>
                  <div className="space-y-3">
                    {weeklyPlan[currentDayIndex].exercises.map(ex => (
                      <div key={ex.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleExercise(currentDayIndex, ex.id)}>
                            {ex.completed ? (
                              <CheckSquare className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Square className={cn(
                                "w-5 h-5 transition-colors",
                                isDarkMode ? "text-zinc-600" : "text-zinc-300"
                              )} />
                            )}
                          </button>
                          <div className={cn(
                            "transition-all",
                            ex.completed && (isDarkMode ? "opacity-50 line-through" : "opacity-40 line-through")
                          )}>
                            <p className="text-sm font-bold">{ex.name}</p>
                            <p className={cn(
                              "text-[10px] font-medium",
                              isDarkMode ? "text-zinc-500" : "text-zinc-400"
                            )}>{ex.details}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Weekly Plan</h2>
                <div className={cn(
                  "px-3 py-1 border rounded-full transition-colors",
                  isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
                )}>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Pull-up & Dip</span>
                </div>
              </div>

              <div className="space-y-6">
                {weeklyPlan.map((day, dayIdx) => (
                  <motion.div 
                    key={day.day}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIdx * 0.05 }}
                    className={cn(
                      "backdrop-blur-md border rounded-3xl p-5 transition-all",
                      dayIdx === currentDayIndex 
                        ? (isDarkMode ? "border-emerald-500/50 ring-1 ring-emerald-500/20 bg-zinc-900/60" : "border-emerald-500/50 ring-1 ring-emerald-500/20 bg-white/80 shadow-md")
                        : (isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/60 border-zinc-200 shadow-sm")
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={cn("font-bold text-lg transition-colors", dayIdx === currentDayIndex ? "text-emerald-500" : (isDarkMode ? "text-zinc-100" : "text-zinc-900"))}>
                          {day.day}
                          {dayIdx === currentDayIndex && <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">TODAY</span>}
                        </h3>
                        <p className={cn(
                          "text-xs font-medium uppercase tracking-widest transition-colors",
                          isDarkMode ? "text-zinc-500" : "text-zinc-400"
                        )}>{day.type}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {day.exercises.map(ex => (
                        <div key={ex.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => toggleExercise(dayIdx, ex.id)}
                              className="focus:outline-none"
                            >
                              {ex.completed ? (
                                <CheckSquare className="w-6 h-6 text-emerald-500" />
                              ) : (
                                <Square className={cn(
                                  "w-6 h-6 transition-colors",
                                  isDarkMode ? "text-zinc-700 group-hover:text-zinc-500" : "text-zinc-300 group-hover:text-zinc-400"
                                )} />
                              )}
                            </button>
                            <div className={cn(
                              "transition-all",
                              ex.completed && (isDarkMode ? "opacity-40 line-through scale-[0.98]" : "opacity-30 line-through scale-[0.98]")
                            )}>
                              <p className="font-bold text-sm">{ex.name}</p>
                              <p className={cn(
                                "text-xs transition-colors",
                                isDarkMode ? "text-zinc-500" : "text-zinc-400"
                              )}>{ex.details}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className={cn(
                "backdrop-blur-md border rounded-2xl p-4 text-[10px] space-y-2 transition-colors duration-500",
                isDarkMode ? "bg-zinc-900/30 border-zinc-800/50 text-zinc-500" : "bg-zinc-100/50 border-zinc-200/50 text-zinc-400"
              )}>
                <p className={cn("font-bold uppercase transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>Rules & Progression</p>
                <p>• Rest 2-3 min • Stop 1-2 reps before failure • Clean reps only</p>
                <p>• Test max every 4 weeks. Add 1 rep or 1-2 kg when easy.</p>
              </div>
            </motion.div>
          )}

          {activeView === 'workouts' && (
            <motion.div
              key="workouts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Daily To-Do List Section */}
              <div className={cn(
                "backdrop-blur-md border rounded-3xl p-6 transition-all",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/80 border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold">Daily Exercises</h3>
                    <p className="text-xs text-zinc-500">Max 10 per day</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {userProfile.dailyExercises?.filter(e => e.completed).length || 0} / {userProfile.dailyExercises?.length || 0}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {userProfile.dailyExercises?.map(ex => (
                    <div key={ex.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleDailyExercise(ex.id)}
                          className="focus:outline-none"
                        >
                          {ex.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          ) : (
                            <Square className={cn(
                              "w-6 h-6 transition-colors",
                              isDarkMode ? "text-zinc-700 group-hover:text-zinc-500" : "text-zinc-300 group-hover:text-zinc-400"
                            )} />
                          )}
                        </button>
                        <span className={cn(
                          "text-sm font-medium transition-all",
                          ex.completed && (isDarkMode ? "text-zinc-600 line-through" : "text-zinc-400 line-through")
                        )}>{ex.name}</span>
                      </div>
                      <button 
                        onClick={() => deleteDailyExercise(ex.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500/50 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!userProfile.dailyExercises || userProfile.dailyExercises.length === 0) && (
                    <div className="text-center py-6 border-2 border-dashed border-zinc-800/20 rounded-2xl">
                      <p className="text-xs text-zinc-500">No exercises added for today.</p>
                    </div>
                  )}
                </div>

                {(userProfile.dailyExercises?.length || 0) < 10 && (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newDailyExercise}
                      onChange={(e) => setNewDailyExercise(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddDailyExercise()}
                      placeholder="Add exercise..."
                      className={cn(
                        "flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all",
                        isDarkMode ? "bg-zinc-900/50 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                    <button 
                      onClick={handleAddDailyExercise}
                      className="bg-emerald-500 text-zinc-950 p-3 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">History</h2>
                  <div className={cn(
                    "flex p-1 rounded-xl",
                    isDarkMode ? "bg-zinc-900/50" : "bg-zinc-100"
                  )}>
                    <button 
                      onClick={() => setHistorySubView('journal')}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        historySubView === 'journal' 
                          ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" 
                          : isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600"
                      )}
                    >
                      <Layout className="w-3.5 h-3.5" />
                      Journal
                    </button>
                    <button 
                      onClick={() => setHistorySubView('plans')}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        historySubView === 'plans' 
                          ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" 
                          : isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600"
                      )}
                    >
                      <Folder className="w-3.5 h-3.5" />
                      Exercise Plans
                    </button>
                  </div>
                </div>
                {isAdminUser && (
                  <button 
                    onClick={() => setIsAddingWorkout(true)}
                    className="bg-emerald-500 text-zinc-950 p-2 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                )}
              </div>

              {historySubView === 'journal' ? (
                <div className="space-y-4">
                  {workouts.map(workout => (
                    <WorkoutCard 
                      key={workout.id} 
                      workout={workout} 
                      full 
                      isDarkMode={isDarkMode} 
                      onDelete={handleDeleteWorkout}
                      onEdit={handleEditWorkout}
                      onAddComment={handleAddComment}
                      onUpdateWorkout={handleUpdateWorkout}
                      currentUserId={user?.uid}
                      isAdminUser={isAdminUser}
                    />
                  ))}
                  {workouts.length === 0 && (
                    <div className={cn(
                      "flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed",
                      isDarkMode ? "border-zinc-800" : "border-zinc-200"
                    )}>
                      <Scroll className="w-12 h-12 text-zinc-700 mb-4" />
                      <p className="text-zinc-500 font-medium">No workout logs yet.</p>
                      <p className="text-zinc-600 text-xs mt-1">Start tracking your journey today!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {/* Exercise Plans Folder (Files & Drive Links) */}
                  {workouts.flatMap(w => (w.attachments || []).map(att => ({ ...att, workoutName: w.name, workoutDate: w.date })))
                    .filter(att => att.type === 'file' || att.type === 'google-drive' || att.type === 'link')
                    .map(att => (
                      <a 
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                          isDarkMode ? "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40" : "bg-white/60 border-zinc-200 hover:bg-zinc-50/80 shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-3 rounded-xl",
                            isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
                          )}>
                            {att.type === 'google-drive' && <Cloud className="w-5 h-5 text-blue-500" />}
                            {att.type === 'link' && (
                              <>
                                {att.url.includes('tiktok.com') ? <Music className="w-5 h-5 text-zinc-400" /> : <Link className="w-5 h-5 text-blue-400" />}
                              </>
                            )}
                            {att.type === 'file' && (
                              <>
                                {att.fileType?.includes('mp4') && <Video className="w-5 h-5 text-purple-500" />}
                                {att.fileType?.includes('mp3') && <Music className="w-5 h-5 text-emerald-500" />}
                                {(!att.fileType?.includes('mp4') && !att.fileType?.includes('mp3')) && <FileText className="w-5 h-5 text-orange-500" />}
                              </>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{att.name}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                              From: {att.workoutName} • {format(new Date(att.workoutDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                      </a>
                    ))}
                  {workouts.flatMap(w => w.attachments || []).filter(att => att.type === 'file' || att.type === 'google-drive' || att.type === 'link').length === 0 && (
                    <div className={cn(
                      "flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed",
                      isDarkMode ? "border-zinc-800" : "border-zinc-200"
                    )}>
                      <Folder className="w-12 h-12 text-zinc-700 mb-4" />
                      <p className="text-zinc-500 font-medium">No exercise plans saved yet.</p>
                      <p className="text-zinc-600 text-xs mt-1">Upload files to your workouts to see them here.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'yoga' && (
            <motion.div
              key="yoga"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <YogaView 
                isDarkMode={isDarkMode} 
                onMarkAsWise={markQuoteAsSeen}
                isSessionActive={isYogaSessionActive}
                setIsSessionActive={setIsYogaSessionActive}
              />
            </motion.div>
          )}

          {activeView === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Progress</h2>
              
              <div className={cn(
                "backdrop-blur-md border rounded-3xl p-6 transition-colors duration-500",
                isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white/60 border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={cn(
                    "text-sm font-semibold uppercase tracking-wider transition-colors",
                    isDarkMode ? "text-zinc-400" : "text-zinc-500"
                  )}>Weight Trend (kg)</h3>
                  <button 
                    onClick={() => setIsLoggingWeight(true)}
                    className="text-xs font-bold text-emerald-500 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Log Weight
                  </button>
                </div>

                {isLoggingWeight && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mb-6 flex gap-2"
                  >
                    <input 
                      type="number"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      placeholder="Enter weight in kg..."
                      className={cn(
                        "flex-1 px-4 py-2 rounded-xl text-sm focus:outline-none border transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                    <button 
                      onClick={handleLogWeight}
                      className="bg-emerald-500 text-zinc-950 px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsLoggingWeight(false)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-colors",
                        isDarkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                      )}
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#27272a" : "#e4e4e7"} vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(str) => format(new Date(str), 'MMM d')}
                        stroke={isDarkMode ? "#71717a" : "#a1a1aa"}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        domain={['auto', 'auto']}
                        stroke={isDarkMode ? "#71717a" : "#a1a1aa"}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${val.toFixed(0)}kg`}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#18181b' : '#ffffff', 
                          border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`, 
                          borderRadius: '12px',
                          color: isDarkMode ? '#ffffff' : '#000000'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  "backdrop-blur-md border rounded-2xl p-4 transition-colors duration-500",
                  isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white/60 border-zinc-200 shadow-sm"
                )}>
                  <p className={cn(
                    "text-xs uppercase font-bold mb-1 transition-colors",
                    isDarkMode ? "text-zinc-500" : "text-zinc-400"
                  )}>Total Workouts</p>
                  <p className="text-2xl font-bold text-emerald-500">{workouts.length}</p>
                  <div className="mt-4 pt-4 border-t border-zinc-800/50">
                    <p className={cn(
                      "text-[10px] uppercase font-bold mb-1 transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Wise Quotes Learned</p>
                    <p className="text-xl font-bold text-yellow-500">{(userProfile.markedQuotes?.length || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className={cn(
                  "backdrop-blur-md border rounded-2xl p-4 transition-colors duration-500 flex flex-col justify-between",
                  isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white/60 border-zinc-200 shadow-sm"
                )}>
                  <div>
                    <p className={cn(
                      "text-xs uppercase font-bold mb-1 transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Consistency</p>
                    {(() => {
                      const history = userProfile.dailyExerciseHistory || [];
                      const totalCompleted = history.reduce((acc, h) => acc + h.completedCount, 0);
                      const totalAssigned = history.reduce((acc, h) => acc + h.totalCount, 0);
                      const consistency = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;
                      return (
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-blue-500">{consistency.toFixed(0)}%</p>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-1000" 
                              style={{ width: `${consistency}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800/50">
                    <p className={cn(
                      "text-[10px] uppercase font-bold mb-1 transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Avg Calories</p>
                    <p className="text-xl font-bold text-orange-500">2,140</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={cn(
                  "w-24 h-24 rounded-full border-4 flex items-center justify-center overflow-hidden transition-colors",
                  isDarkMode ? "bg-zinc-800 border-emerald-500/20" : "bg-zinc-200 border-emerald-500/10"
                )}>
                  <img 
                    src={userProfile.avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                  <p className={cn(
                    "font-medium transition-colors",
                    isDarkMode ? "text-zinc-500" : "text-zinc-400"
                  )}>{user?.email}</p>
                </div>
              </div>

              <div className={cn(
                "backdrop-blur-md border rounded-3xl p-6 space-y-4 transition-colors duration-500",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/60 border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "text-sm font-bold uppercase tracking-widest transition-colors",
                    isDarkMode ? "text-zinc-400" : "text-zinc-500"
                  )}>Current Stats</h3>
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="text-xs text-emerald-500 font-bold"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={cn(
                      "text-[10px] uppercase font-bold transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Max Pull-ups</p>
                    <p className="text-xl font-bold">{userProfile.maxPullUps} reps</p>
                  </div>
                  <div>
                    <p className={cn(
                      "text-[10px] uppercase font-bold transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>1RM Weighted</p>
                    <p className="text-xl font-bold">+{userProfile.oneRMWeighted} kg</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <ProfileItem label="Height" value={`${userProfile.height} cm`} isDarkMode={isDarkMode} />
                <ProfileItem label="Current Weight" value={`${userProfile.currentWeight} kg`} isDarkMode={isDarkMode} />
                <ProfileItem label="Target Weight" value={`${userProfile.targetWeight} kg`} isDarkMode={isDarkMode} />
                <ProfileItem label="Goal" value="23 Max Pull-ups" isDarkMode={isDarkMode} />
                <ProfileItem label="Short-term Goal" value={userProfile.shortTermGoal} isDarkMode={isDarkMode} />
                <ProfileItem label="Long-term Goal" value={userProfile.longTermGoal} isDarkMode={isDarkMode} />
              </div>

              <WisdomScoreboard userProfile={userProfile} isDarkMode={isDarkMode} />

              <div className={cn(
                "backdrop-blur-md border rounded-3xl p-6 space-y-4 transition-colors duration-500",
                isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white/60 border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <Database className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-bold">Quote Database</h3>
                      <p className={cn(
                        "text-xs font-medium",
                        isDarkMode ? "text-zinc-500" : "text-zinc-400"
                      )}>{quoteCount.toLocaleString()} Quotes Loaded</p>
                    </div>
                  </div>
                </div>
                
                <p className={cn(
                  "text-sm leading-relaxed",
                  isDarkMode ? "text-zinc-400" : "text-zinc-500"
                )}>
                  Expand your library of wisdom. Use AI to generate unique quotes from global traditions.
                </p>

                <button 
                  onClick={generateMoreQuotes}
                  disabled={isGeneratingQuotes || !isAdminUser}
                  className={cn(
                    "w-full py-3 rounded-2xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2",
                    (isGeneratingQuotes || !isAdminUser)
                      ? (isDarkMode ? "bg-zinc-800 text-zinc-600" : "bg-zinc-100 text-zinc-400")
                      : "bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/20"
                  )}
                >
                  {isGeneratingQuotes ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Wisdom...
                    </>
                  ) : !isAdminUser ? (
                    "Admin Access Required"
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate 50 More Quotes
                    </>
                  )}
                </button>

                {isAdminUser && (
                  <button 
                    onClick={generateLatinQuotes}
                    disabled={isGeneratingQuotes}
                    className={cn(
                      "w-full py-3 rounded-2xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2",
                      isGeneratingQuotes
                        ? (isDarkMode ? "bg-zinc-800 text-zinc-600" : "bg-zinc-100 text-zinc-400")
                        : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                    )}
                  >
                    {isGeneratingQuotes ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Latin...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5" />
                        Generate 50 Latin Expressions
                      </>
                    )}
                  </button>
                )}
              </div>

              <button 
                onClick={handleLogout}
                className={cn(
                  "w-full py-4 border rounded-2xl font-bold text-red-500 active:scale-95 transition-all flex items-center justify-center gap-2",
                  isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                )}
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </motion.div>
          )}

          {activeView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-[calc(100vh-180px)]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl overflow-hidden flex items-center justify-center border border-emerald-500/20">
                  <img 
                    src={AVATARS[0].url} 
                    alt="AI Stoic" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Stoic</h2>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Powered by Gemini</p>
                </div>
              </div>

              <div className={cn(
                "flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl border mb-4 no-scrollbar",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/60 border-zinc-200 shadow-sm"
              )}>
                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <Flame className="w-8 h-8 text-emerald-500/50" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-zinc-500">The obstacle is the way, Petar.</p>
                      <p className="text-sm text-zinc-600">Ask me anything about your training, discipline, or how to master the pull-up.</p>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={cn(
                    "flex items-end gap-2",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-zinc-700/30">
                      <img 
                        src={msg.role === 'user' ? userProfile.avatarUrl : AVATARS[0].url} 
                        alt={msg.role === 'user' ? "User" : "AI Stoic"} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-2xl text-sm relative group",
                      msg.role === 'user' 
                        ? "bg-emerald-500 text-zinc-950 font-medium rounded-br-none" 
                        : (isDarkMode ? "bg-zinc-800 text-zinc-100 rounded-bl-none" : "bg-zinc-100 text-zinc-900 rounded-bl-none")
                    )}>
                      {msg.parts[0].text}
                      {msg.role === 'model' && (
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                          <button
                            onClick={() => handleSpeak(msg.parts[0].text, idx)}
                            className={cn(
                              "p-2 rounded-xl transition-all shadow-sm",
                              isSpeaking === idx 
                                ? "bg-emerald-500 text-zinc-950" 
                                : (isDarkMode ? "bg-zinc-700/80 text-zinc-100 hover:bg-zinc-600" : "bg-zinc-200/80 text-zinc-900 hover:bg-zinc-300")
                            )}
                            title="Listen"
                          >
                            {isSpeaking === idx ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleCopy(msg.parts[0].text, idx)}
                            className={cn(
                              "p-2 rounded-xl transition-all shadow-sm",
                              copiedIndex === idx 
                                ? "bg-emerald-500 text-zinc-950" 
                                : (isDarkMode ? "bg-zinc-700/80 text-zinc-100 hover:bg-zinc-600" : "bg-zinc-200/80 text-zinc-900 hover:bg-zinc-300")
                            )}
                            title="Copy"
                          >
                            {copiedIndex === idx ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className={cn(
                      "p-4 rounded-2xl rounded-tl-none",
                      isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
                    )}>
                      <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask your coach..."
                  className={cn(
                    "flex-1 border rounded-2xl px-4 py-4 focus:outline-none focus:border-emerald-500 transition-all",
                    isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900 shadow-sm"
                  )}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-emerald-500 text-zinc-950 p-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {activeView === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Library of Wisdom</h2>
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-xs font-medium",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>{libraryQuotes.length} Quotes Ticked</p>
                    {libraryQuotes.length > 1 && (
                      <button 
                        onClick={handleCleanupDuplicates}
                        className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        (Clean Duplicates)
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {libraryQuotes.length > 0 && (
                    <button
                      onClick={() => {
                        setIsLibrarySelectMode(!isLibrarySelectMode);
                        setSelectedLibraryIds(new Set());
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                        isLibrarySelectMode 
                          ? "bg-red-500 text-white" 
                          : (isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200")
                      )}
                    >
                      {isLibrarySelectMode ? 'Cancel' : 'Select'}
                    </button>
                  )}
                  {isLibrarySelectMode && (
                    <button
                      onClick={() => {
                        if (selectedLibraryIds.size === libraryQuotes.length) {
                          setSelectedLibraryIds(new Set());
                        } else {
                          setSelectedLibraryIds(new Set(libraryQuotes.map(q => q.id!)));
                        }
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                        isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      )}
                    >
                      {selectedLibraryIds.size === libraryQuotes.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                  {isLibrarySelectMode && selectedLibraryIds.size > 0 && (
                    <button
                      onClick={() => handleDeleteQuotesFromLibrary(Array.from(selectedLibraryIds))}
                      className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-500 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete ({selectedLibraryIds.size})
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddingQuote(true)}
                    className={cn(
                      "p-2 rounded-xl transition-all hover:scale-110",
                      isDarkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600 shadow-sm"
                    )}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <div className={cn(
                    "p-2 rounded-xl",
                    isDarkMode ? "bg-zinc-900 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                  )}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isAddingQuote && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "p-5 rounded-3xl border overflow-hidden",
                      isDarkMode ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                    )}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-purple-500">Add Your Wisdom</h3>
                        <button onClick={() => setIsAddingQuote(false)} className="text-zinc-500 hover:text-zinc-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        placeholder="Enter your quote..."
                        value={newQuote.text}
                        onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                        className={cn(
                          "w-full p-4 rounded-2xl border text-sm font-serif italic focus:outline-none focus:ring-2 transition-all",
                          isDarkMode 
                            ? "bg-zinc-800/50 border-zinc-700 text-zinc-100 focus:ring-purple-500/50" 
                            : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-purple-500/20"
                        )}
                        rows={3}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Author"
                          value={newQuote.author}
                          onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                          className={cn(
                            "p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all",
                            isDarkMode 
                              ? "bg-zinc-800/50 border-zinc-700 text-zinc-100 focus:ring-purple-500/50" 
                              : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-purple-500/20"
                          )}
                        />
                        <select
                          value={newQuote.source}
                          onChange={(e) => setNewQuote({ ...newQuote, source: e.target.value })}
                          className={cn(
                            "p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all cursor-pointer",
                            isDarkMode 
                              ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-purple-500/50" 
                              : "bg-white border-zinc-200 text-zinc-900 focus:ring-purple-500/20"
                          )}
                        >
                          <option value="Philosophy" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Philosophy</option>
                          <option value="Psychology" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Psychology</option>
                          <option value="Doctor's Quote" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Doctor's Quote</option>
                          <option value="Science" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Science</option>
                          <option value="Personal" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Personal</option>
                          <option value="Stoic" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Stoic</option>
                          <option value="Zen" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Zen</option>
                          <option value="Ancient Wisdom" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Ancient Wisdom</option>
                          <option value="Modern Insight" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Modern Insight</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-purple-500 px-1">Wisdom Grade</label>
                        <select
                          value={newQuote.wisdomGrade}
                          onChange={(e) => setNewQuote({ ...newQuote, wisdomGrade: e.target.value })}
                          className={cn(
                            "w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all cursor-pointer",
                            isDarkMode 
                              ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-purple-500/50" 
                              : "bg-white border-zinc-200 text-zinc-900 focus:ring-purple-500/20"
                          )}
                        >
                          <option value="The wisest quote ever" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>The wisest quote ever</option>
                          <option value="My favourite" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>My favourite</option>
                          <option value="This one changed my life for better" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>This one changed my life for better</option>
                          <option value="I realised this quote is so true in my own experience" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>I realised this quote is so true in my own experience</option>
                          <option value="A daily reminder" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>A daily reminder</option>
                          <option value="Deeply profound" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Deeply profound</option>
                          <option value="Simple but powerful" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Simple but powerful</option>
                          <option value="Hidden gem" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Hidden gem</option>
                          <option value="Timeless truth" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Timeless truth</option>
                          <option value="A guiding star" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>A guiding star</option>
                          <option value="Pure inspiration" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Pure inspiration</option>
                          <option value="Soul-stirring" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Soul-stirring</option>
                          <option value="Mind-expanding" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Mind-expanding</option>
                          <option value="Life-affirming" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Life-affirming</option>
                          <option value="Brutally honest" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Brutally honest</option>
                          <option value="Quietly powerful" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Quietly powerful</option>
                          <option value="A spark in the dark" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>A spark in the dark</option>
                          <option value="Universal truth" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Universal truth</option>
                          <option value="Soul-nourishing" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Soul-nourishing</option>
                          <option value="Intellectually stimulating" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Intellectually stimulating</option>
                          <option value="A beacon of hope" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>A beacon of hope</option>
                          <option value="Profoundly simple" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Profoundly simple</option>
                          <option value="Echoes of the ancients" className={isDarkMode ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}>Echoes of the ancients</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-purple-500 px-1">Personal Comment</label>
                        <textarea
                          value={newQuote.comment}
                          onChange={(e) => setNewQuote({ ...newQuote, comment: e.target.value })}
                          placeholder="Add a personal reflection..."
                          className={cn(
                            "w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all resize-none h-20",
                            isDarkMode 
                              ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-purple-500/50" 
                              : "bg-white border-zinc-200 text-zinc-900 focus:ring-purple-500/20"
                          )}
                        />
                      </div>
                      <button
                        onClick={handleAddCustomQuote}
                        disabled={!newQuote.text.trim() || !isAdminUser}
                        className={cn(
                          "w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                          (!newQuote.text.trim() || !isAdminUser)
                            ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                            : "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20"
                        )}
                      >
                        {isAdminUser ? (
                          <>
                            <Plus className="w-4 h-4" />
                            Save Wisdom
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Admin Access Required
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLibraryLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="text-sm text-zinc-500">Opening the scrolls...</p>
                </div>
              ) : libraryQuotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                    <Scroll className="w-8 h-8 text-zinc-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">No Wisdom Yet</h3>
                    <p className="text-sm text-zinc-500 max-w-[200px] mx-auto">Mark quotes as wise on your dashboard to build your library.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    // Pre-calculate global indices based on oldest-first chronological order
                    const sortedChronological = [...libraryQuotes].sort((a, b) => {
                      const dateA = a.markedDate ? new Date(a.markedDate).getTime() : 0;
                      const dateB = b.markedDate ? new Date(b.markedDate).getTime() : 0;
                      return dateA - dateB; // Oldest first
                    });
                    
                    const quoteToGlobalIndex = new Map(
                      sortedChronological.map((q, idx) => [q.id, idx + 1])
                    );

                    return Array.from(new Set(libraryQuotes.map(q => q.source))).sort().map(source => (
                      <div key={source} className="space-y-3">
                        <h3 className={cn(
                          "text-[10px] font-bold uppercase tracking-[0.2em] px-2",
                          isDarkMode ? "text-emerald-500/70" : "text-emerald-600/70"
                        )}>{source} Tradition</h3>
                        <div className="grid gap-3">
                          {libraryQuotes
                            .filter(q => q.source === source)
                            .sort((a, b) => {
                              const dateA = a.markedDate ? new Date(a.markedDate).getTime() : 0;
                              const dateB = b.markedDate ? new Date(b.markedDate).getTime() : 0;
                              return dateB - dateA; // Newest first
                            })
                            .map(quote => (
                              <motion.div
                                key={quote.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                  "p-5 rounded-3xl border transition-all relative group overflow-hidden",
                                  quote.category === 'finance'
                                    ? (isDarkMode ? "bg-emerald-900/20 border-emerald-800/50" : "bg-emerald-50/50 border-emerald-200 shadow-sm")
                                    : (quote.isCustom || quote.isAI)
                                      ? (isDarkMode ? "bg-purple-900/20 border-purple-800/50" : "bg-purple-50/50 border-purple-200 shadow-sm")
                                      : quote.wisdomGrade
                                        ? (isDarkMode ? "bg-yellow-900/20 border-yellow-800/50" : "bg-yellow-50/50 border-yellow-200 shadow-sm")
                                        : (isDarkMode ? "bg-zinc-900/60 border-zinc-800/50" : "bg-white border-zinc-200 shadow-sm")
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 right-1 h-10 flex items-center gap-2 px-3 transition-opacity",
                                  isLibrarySelectMode ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                                )}>
                                  {isLibrarySelectMode ? (
                                    <button
                                      onClick={() => toggleLibraryQuoteSelection(quote.id!)}
                                      className={cn(
                                        "p-2 rounded-xl transition-all shadow-sm",
                                        selectedLibraryIds.has(quote.id!)
                                          ? "bg-red-500 text-white"
                                          : (isDarkMode ? "bg-zinc-800 text-zinc-500" : "bg-white text-zinc-400 border border-zinc-100")
                                      )}
                                    >
                                      {selectedLibraryIds.has(quote.id!) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleDeleteQuotesFromLibrary([quote.id!])}
                                      className={cn(
                                        "p-2 rounded-xl transition-all shadow-sm",
                                        isDarkMode 
                                          ? "bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10" 
                                          : "bg-white border border-zinc-100 text-zinc-400 hover:text-red-500 hover:bg-red-50"
                                      )}
                                      title="Remove from Library"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                <div className={cn(
                                  "absolute top-0 left-0 px-3 py-1 rounded-br-2xl text-[10px] font-black tracking-tighter",
                                  quote.category === 'finance'
                                    ? (isDarkMode ? "bg-emerald-800/30 text-emerald-400" : "bg-emerald-100 text-emerald-500")
                                    : (quote.isCustom || quote.isAI)
                                      ? (isDarkMode ? "bg-purple-800/30 text-purple-400" : "bg-purple-100 text-purple-500")
                                      : quote.wisdomGrade
                                        ? (isDarkMode ? "bg-yellow-800/30 text-yellow-400" : "bg-yellow-100 text-yellow-500")
                                        : (isDarkMode ? "bg-zinc-800 text-zinc-600" : "bg-zinc-100 text-zinc-400")
                                )}>
                                  #{quoteToGlobalIndex.get(quote.id)}
                                </div>
                                <p className={cn(
                                  "text-sm font-serif italic leading-relaxed mb-1 mt-2",
                                  isDarkMode ? "text-zinc-100" : "text-zinc-900"
                                )}>
                                  "{quote.text}"
                                </p>
                                  <div className="mt-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <div className={cn("h-[1px] flex-1", quote.category === 'finance' ? "bg-emerald-500/20" : quote.isCustom ? "bg-purple-500/20" : "bg-yellow-500/20")} />
                                      <span className={cn(
                                        "text-[8px] font-black uppercase tracking-[0.2em]",
                                        quote.category === 'finance' ? "text-emerald-400/70" : quote.isCustom ? "text-purple-400/70" : "text-yellow-500/70"
                                      )}>Wisdom Data</span>
                                      <div className={cn("h-[1px] flex-1", quote.category === 'finance' ? "bg-emerald-500/20" : quote.isCustom ? "bg-purple-500/20" : "bg-yellow-500/20")} />
                                    </div>
                                    
                                    {editingQuoteId === quote.id ? (
                                      <div className="space-y-4 p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/50 shadow-inner">
                                        <div className="space-y-2">
                                          <label className="text-[7px] font-black uppercase tracking-[0.2em] text-emerald-500/70 px-1">Wisdom Text</label>
                                          <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className={cn(
                                              "w-full p-3 rounded-2xl border text-xs font-serif italic focus:outline-none focus:ring-1 transition-all resize-none min-h-[80px] leading-relaxed",
                                              isDarkMode 
                                                ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-emerald-500/50" 
                                                : "bg-white border-zinc-200 text-zinc-900 focus:ring-emerald-500/20 shadow-sm"
                                            )}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-[7px] font-black uppercase tracking-[0.2em] text-emerald-500/70 px-1">Author Identity</label>
                                          <input
                                            type="text"
                                            value={editAuthor}
                                            onChange={(e) => setEditAuthor(e.target.value)}
                                            className={cn(
                                              "w-full p-2.5 rounded-xl border text-[11px] font-black focus:outline-none focus:ring-1 transition-all",
                                              isDarkMode 
                                                ? "bg-zinc-950 border-zinc-800 text-blue-400 focus:ring-emerald-500/50" 
                                                : "bg-white border-zinc-200 text-blue-600 focus:ring-emerald-500/20 shadow-sm"
                                            )}
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-1.5">
                                            <label className="text-[7px] font-bold uppercase tracking-widest text-zinc-500 px-1">Grade</label>
                                            <select
                                              value={editGrade}
                                              onChange={(e) => setEditGrade(e.target.value)}
                                              className={cn(
                                                "w-full p-2 rounded-xl border text-[10px] focus:outline-none focus:ring-1 transition-all cursor-pointer",
                                                isDarkMode 
                                                  ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-emerald-500/50" 
                                                  : "bg-white border-zinc-200 text-zinc-900 focus:ring-emerald-500/20 shadow-sm"
                                              )}
                                            >
                                              <option value="A daily reminder">A daily reminder</option>
                                              <option value="The wisest quote ever">The wisest quote ever</option>
                                              <option value="My favourite">My favourite</option>
                                              <option value="This one changed my life for better">This one changed my life for better</option>
                                              <option value="I realised this quote is so true in my own experience">I realised this quote is so true in my own experience</option>
                                              <option value="Pure gold">Pure gold</option>
                                              <option value="Timeless truth">Timeless truth</option>
                                              <option value="Echoes of the ancients">Echoes of the ancients</option>
                                            </select>
                                          </div>
                                          <div className="space-y-1.5">
                                            <label className="text-[7px] font-bold uppercase tracking-widest text-zinc-500 px-1">Reflection</label>
                                            <textarea
                                              value={editComment}
                                              onChange={(e) => setEditComment(e.target.value)}
                                              placeholder="Personal notes..."
                                              className={cn(
                                                "w-full p-2 rounded-xl border text-[10px] focus:outline-none focus:ring-1 transition-all resize-none h-[38px] leading-snug",
                                                isDarkMode 
                                                  ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-emerald-500/50" 
                                                  : "bg-white border-zinc-200 text-zinc-900 focus:ring-emerald-500/20 shadow-sm"
                                              )}
                                            />
                                          </div>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                          <button
                                            onClick={() => handleUpdateWisdomData(quote.id!, quote.isCustom || false)}
                                            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98]"
                                          >
                                            Save Changes
                                          </button>
                                          <button
                                            onClick={() => setEditingQuoteId(null)}
                                            className="px-4 py-2.5 bg-zinc-800 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-zinc-700 transition-all active:scale-[0.98]"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-2 group/data relative">
                                        <button
                                          onClick={() => {
                                            setEditingQuoteId(quote.id!);
                                            setEditText(quote.text);
                                            setEditAuthor(quote.author);
                                            setEditGrade(quote.wisdomGrade || 'A daily reminder');
                                            setEditComment(quote.comment || '');
                                          }}
                                          className="absolute -top-6 right-0 transition-opacity text-[8px] font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-400"
                                        >
                                          EDIT
                                        </button>
                                        {quote.wisdomGrade && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-500">Grade:</span>
                                            <p className={cn(
                                              "text-[9px] font-bold uppercase tracking-wider",
                                              quote.isCustom ? "text-purple-400" : "text-yellow-500"
                                            )}>
                                              {quote.wisdomGrade}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                <div className="mt-3 pt-3 border-t border-zinc-800/10 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[16px] font-bold text-blue-500">{quote.author}</p>
                                    {quote.markedDate && (
                                      <p className={cn(
                                        "text-[9px] font-medium",
                                        isDarkMode ? "text-zinc-600" : "text-zinc-400"
                                      )}>
                                        {format(new Date(quote.markedDate), 'MMM d, yyyy')}
                                      </p>
                                    )}
                                  </div>
                                  {quote.comment && !editingQuoteId && (
                                    <div className={cn(
                                      "p-2 rounded-xl text-[10px] leading-relaxed italic border-l-2",
                                      quote.isCustom 
                                        ? "bg-purple-500/5 border-purple-500/30 text-purple-300/70" 
                                        : "bg-yellow-500/5 border-yellow-500/30 text-yellow-300/70"
                                    )}>
                                      "{quote.comment}"
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {!isYogaSessionActive && (
        <nav className={cn(
          "fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t px-6 py-3 pb-8 transition-colors duration-500",
          isDarkMode ? "bg-zinc-950/90 border-zinc-800/50" : "bg-white/90 border-zinc-200 shadow-lg"
        )}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          <NavButton 
            active={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')}
            icon={<Activity className="w-6 h-6" />}
            label="Home"
            isDarkMode={isDarkMode}
          />
          <NavButton 
            active={activeView === 'plan'} 
            onClick={() => setActiveView('plan')}
            icon={<ListTodo className="w-6 h-6" />}
            label="Plan"
            isDarkMode={isDarkMode}
          />
          <NavButton 
            active={activeView === 'workouts'} 
            onClick={() => setActiveView('workouts')}
            icon={<Dumbbell className="w-6 h-6" />}
            label="History"
            isDarkMode={isDarkMode}
          />
          <NavButton 
            active={activeView === 'yoga'} 
            onClick={() => setActiveView('yoga')}
            icon={<Wind className="w-6 h-6" />}
            label="Yoga"
            isDarkMode={isDarkMode}
          />
          <NavButton 
            active={activeView === 'progress'} 
            onClick={() => setActiveView('progress')}
            icon={<TrendingUp className="w-6 h-6" />}
            label="Stats"
            isDarkMode={isDarkMode}
          />
          <NavButton 
            active={activeView === 'chat'} 
            onClick={() => setActiveView('chat')}
            icon={<MessageSquare className="w-6 h-6" />}
            label="Stoic"
            isDarkMode={isDarkMode}
          />
          <NavButton 
            active={activeView === 'library'} 
            onClick={() => setActiveView('library')}
            icon={<BookOpen className="w-6 h-6" />}
            label="Library"
            isDarkMode={isDarkMode}
          />
          <NavButton 
            active={activeView === 'profile'} 
            onClick={() => setActiveView('profile')}
            icon={<User className="w-6 h-6" />}
            label="Profile"
            isDarkMode={isDarkMode}
          />
        </div>
      </nav>
      )}

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className={cn(
                "w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border transition-colors duration-500",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-2xl"
              )}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Edit Profile</h3>
                  <button onClick={() => setIsEditingProfile(false)} className={isDarkMode ? "text-zinc-500" : "text-zinc-400"}>
                    <ChevronLeft className="w-6 h-6 rotate-[-90deg]" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Height (cm)</label>
                    <input 
                      type="number" 
                      value={userProfile.height}
                      onChange={(e) => setUserProfile({ ...userProfile, height: Number(e.target.value) })}
                      className={cn(
                        "w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                  </div>
                  <div>
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Weight (kg)</label>
                    <input 
                      type="number" 
                      value={userProfile.currentWeight}
                      onChange={(e) => setUserProfile({ ...userProfile, currentWeight: Number(e.target.value) })}
                      className={cn(
                        "w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                  </div>
                  <div>
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Target (kg)</label>
                    <input 
                      type="number" 
                      value={userProfile.targetWeight}
                      onChange={(e) => setUserProfile({ ...userProfile, targetWeight: Number(e.target.value) })}
                      className={cn(
                        "w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                  </div>
                  <div>
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Step Goal</label>
                    <input 
                      type="number" 
                      value={userProfile.stepGoal}
                      onChange={(e) => setUserProfile({ ...userProfile, stepGoal: Number(e.target.value) })}
                      className={cn(
                        "w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className={cn(
                    "text-xs font-bold uppercase block transition-colors",
                    isDarkMode ? "text-zinc-500" : "text-zinc-400"
                  )}>Choose Your Avatar</label>
                  <div className="grid grid-cols-3 gap-3">
                    {AVATARS.map((avatar) => (
                      <button
                        key={avatar.name}
                        onClick={() => setUserProfile({ ...userProfile, avatarUrl: avatar.url })}
                        className={cn(
                          "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all active:scale-95",
                          userProfile.avatarUrl === avatar.url 
                            ? "border-emerald-500 ring-2 ring-emerald-500/20" 
                            : (isDarkMode ? "border-zinc-800 bg-zinc-800 hover:border-zinc-700" : "border-zinc-100 bg-zinc-100 hover:border-zinc-200")
                        )}
                      >
                        <img 
                          src={avatar.url} 
                          alt={avatar.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {userProfile.avatarUrl === avatar.url && (
                          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 drop-shadow-lg" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={cn(
                    "text-xs font-bold uppercase block transition-colors",
                    isDarkMode ? "text-zinc-500" : "text-zinc-400"
                  )}>Or Custom Avatar URL</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/image.jpg"
                    value={userProfile.avatarUrl && !AVATARS.some(a => a.url === userProfile.avatarUrl) ? userProfile.avatarUrl : ''}
                    onChange={(e) => setUserProfile({ ...userProfile, avatarUrl: e.target.value })}
                    className={cn(
                      "w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all",
                      isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                    )}
                  />
                </div>

                <button 
                  onClick={async () => {
                    if (user) {
                      try {
                        await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
                        setIsEditingProfile(false);
                      } catch (error) {
                        handleFirestoreError(error, 'update', `users/${user.uid}`);
                      }
                    }
                  }}
                  className="w-full py-4 bg-emerald-500 text-zinc-950 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                >
                  Save Changes
                </button>

                {/* Debug Info Section */}
                <div className={cn(
                  "mt-8 p-4 rounded-2xl border border-dashed",
                  isDarkMode ? "border-zinc-800 bg-zinc-900/30" : "border-zinc-200 bg-zinc-50"
                )}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Debug Information</p>
                  <div className="space-y-1 font-mono text-[10px] text-zinc-400">
                    <p>UID: {user?.uid}</p>
                    <p>Email: {user?.email}</p>
                    <p>Marked Quotes: {userProfile.markedQuotes?.length || 0}</p>
                    <p>Library Quotes: {libraryQuotes.length}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Workout Modal */}
      <AnimatePresence>
        {isAddingWorkout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className={cn(
                "w-full max-w-md h-[80vh] rounded-t-3xl sm:rounded-3xl overflow-hidden border transition-colors duration-500 flex flex-col",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-2xl"
              )}
            >
              <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Log Workout</h3>
                  <button onClick={() => setIsAddingWorkout(false)} className={isDarkMode ? "text-zinc-500" : "text-zinc-400"}>
                    <ChevronLeft className="w-6 h-6 rotate-[-90deg]" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Workout Name</label>
                    <input 
                      type="text" 
                      value={newWorkout.name}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Chest & Triceps"
                      className={cn(
                        "w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                  </div>

                  <div>
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Content / Description</label>
                    <textarea 
                      value={newWorkout.content}
                      onChange={(e) => setNewWorkout(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Share your thoughts, progress, or training notes..."
                      rows={4}
                      className={cn(
                        "w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all resize-none",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                  </div>

                  {/* Exercises Section */}
                  <div className="space-y-3">
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Exercises</label>
                    
                    <div className="space-y-2">
                      {newWorkout.exercises?.map((ex, idx) => (
                        <div key={idx} className={cn(
                          "p-4 rounded-2xl border",
                          isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200"
                        )}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm">{ex.name}</span>
                            <button 
                              onClick={() => setNewWorkout(prev => ({
                                ...prev,
                                exercises: prev.exercises?.filter((_, i) => i !== idx)
                              }))}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            {ex.sets.map((s, sIdx) => (
                              <div key={sIdx} className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                {s.reps} x {s.weight}kg
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => {
                        const name = prompt('Exercise Name:');
                        if (name) {
                          setNewWorkout(prev => ({
                            ...prev,
                            exercises: [
                              ...(prev.exercises || []),
                              { id: Math.random().toString(36).substr(2, 9), name, sets: [{ id: '1', reps: 10, weight: 0 }] }
                            ]
                          }));
                        }
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 transition-colors",
                        isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-400"
                      )}
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-sm font-medium">Add Exercise</span>
                    </button>
                  </div>

                  {/* Attachments Section */}
                  <div className="space-y-3">
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Attachments</label>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={async () => {
                          const url = prompt('Enter YouTube URL:');
                          if (url) await handleAddAttachment('youtube', 'YouTube Video', url);
                        }}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border transition-all",
                          isDarkMode ? "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                        )}
                      >
                        <Youtube className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold">YouTube</span>
                      </button>
                      <button 
                        onClick={async () => {
                          const url = prompt('Enter Article URL:');
                          if (url) await handleAddAttachment('article', 'Website Article', url);
                        }}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border transition-all",
                          isDarkMode ? "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                        )}
                      >
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold">Article</span>
                      </button>
                      <button 
                        onClick={async () => {
                          const url = prompt('Paste your Google Drive "Share" link here:');
                          if (url) {
                            const name = prompt('Give this file a name (e.g., Training Plan PDF):', 'Drive File');
                            await handleAddAttachment('google-drive', name || 'Drive File', url);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border transition-all",
                          isDarkMode ? "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                        )}
                      >
                        <Cloud className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold">Google Drive</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-500 px-1">
                      Tip: Use Google Drive for files larger than 1MB. Make sure the link is set to "Anyone with the link".
                    </p>

                    <div className="flex flex-col gap-2">
                      <label className={cn(
                        "flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed cursor-pointer transition-all",
                        isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100"
                      )}>
                        <Plus className="w-5 h-5" />
                        <span className="text-sm font-medium">Upload File (PDF, MP4, MP3...)</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handleAddAttachment('file', file.name, URL.createObjectURL(file), file.type);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {newWorkout.attachments && newWorkout.attachments.length > 0 && (
                      <div className="space-y-2">
                        {newWorkout.attachments.map(att => (
                          <div key={att.id} className={cn(
                            "flex items-center justify-between p-3 rounded-xl border",
                            isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-200"
                          )}>
                            <div className="flex items-center gap-2">
                              {att.type === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                              {att.type === 'article' && <Globe className="w-4 h-4 text-blue-500" />}
                              {att.type === 'google-drive' && <Cloud className="w-4 h-4 text-blue-500" />}
                              {att.type === 'file' && <FileText className="w-4 h-4 text-emerald-500" />}
                              <span className="text-xs font-bold truncate max-w-[150px]">{att.name}</span>
                            </div>
                            <button 
                              onClick={() => setNewWorkout(prev => ({
                                ...prev,
                                attachments: prev.attachments?.filter(a => a.id !== att.id)
                              }))}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-800/20">
                <button 
                  onClick={handleSaveWorkout}
                  disabled={!newWorkout.name || isUploadingFile || !isAdminUser}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2",
                    (!newWorkout.name || isUploadingFile || !isAdminUser)
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-emerald-500 text-zinc-950 shadow-emerald-500/20"
                  )}
                >
                  {isUploadingFile ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing File...
                    </>
                  ) : !isAdminUser ? (
                    <>
                      <Lock className="w-5 h-5" />
                      Admin Access Required
                    </>
                  ) : 'Save Workout'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, goal, progress, color, index, isDarkMode }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "backdrop-blur-md border rounded-3xl p-4 space-y-3 transition-all group",
        isDarkMode 
          ? "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40" 
          : "bg-white/60 border-zinc-200 hover:bg-zinc-50/80 shadow-sm"
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn(
          "p-2 rounded-xl group-hover:scale-110 transition-transform",
          isDarkMode ? "bg-zinc-800/50" : "bg-zinc-100"
        )}>
          {icon}
        </div>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          isDarkMode ? "text-zinc-500" : "text-zinc-400"
        )}>Goal: {goal}</span>
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
        <p className={cn(
          "text-xs font-medium",
          isDarkMode ? "text-zinc-500" : "text-zinc-400"
        )}>{label}</p>
      </div>
      <div className={cn(
        "h-1.5 w-full rounded-full overflow-hidden",
        isDarkMode ? "bg-zinc-800/50" : "bg-zinc-100"
      )}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress * 100, 100)}%` }}
          transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </motion.div>
  );
}

interface WorkoutCardProps {
  workout: Workout;
  full?: boolean;
  isDarkMode?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (workout: Workout) => void;
  onAddComment?: (workoutId: string, text: string) => void;
  onUpdateWorkout?: (workout: Workout) => void;
  currentUserId?: string;
  isAdminUser?: boolean;
  key?: any;
}

function WorkoutCard({ workout, full = false, isDarkMode, onDelete, onEdit, onAddComment, onUpdateWorkout, currentUserId, isAdminUser }: WorkoutCardProps) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});
  const [tiktokThumbnails, setTiktokThumbnails] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTikTokThumbnails = async () => {
      const tiktokRegex = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/[^\s]+/g;
      const links = workout.content?.match(tiktokRegex) || [];
      
      for (const link of links) {
        if (!tiktokThumbnails[link]) {
          try {
            const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(link)}`);
            if (response.ok) {
              const data = await response.json();
              if (data.thumbnail_url) {
                setTiktokThumbnails(prev => ({ ...prev, [link]: data.thumbnail_url }));
              }
            }
          } catch (e) {
            console.error("TikTok oEmbed error:", e);
          }
        }
      }
    };
    
    if (workout.content) {
      fetchTikTokThumbnails();
    }
  }, [workout.content]);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|u\/\w\/|shorts\/))([^#\&\?]*)/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  const getYoutubeThumbnail = (url: string) => {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
  };

  const handleCustomThumbnailUpload = (e: ChangeEvent<HTMLInputElement>, attachmentId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const updatedAttachments = workout.attachments?.map(att => 
          att.id === attachmentId ? { ...att, customThumbnail: base64 } : att
        );
        onUpdateWorkout?.({ ...workout, attachments: updatedAttachments });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn(
      "backdrop-blur-md border rounded-3xl p-5 transition-all group",
      isDarkMode 
        ? "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40" 
        : "bg-white/60 border-zinc-200 hover:bg-zinc-50/80 shadow-sm"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl group-hover:scale-110 transition-transform",
            isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50"
          )}>
            <Dumbbell className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h4 className="font-bold">{workout.name}</h4>
            <p className={cn(
              "text-xs flex items-center gap-1 font-medium",
              isDarkMode ? "text-zinc-500" : "text-zinc-400"
            )}>
              <Calendar className="w-3 h-3" /> {format(new Date(workout.date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdminUser && (
            <>
              <button 
                onClick={() => onEdit?.(workout)}
                className="p-2 rounded-xl hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500 transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete?.(workout.id)}
                className="p-2 rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <ChevronRight className={cn(
            "w-5 h-5 transition-colors",
            isDarkMode ? "text-zinc-600 group-hover:text-emerald-500" : "text-zinc-300 group-hover:text-emerald-500"
          )} />
        </div>
      </div>

      {workout.content && (
        <div className="space-y-3 mb-4">
          <p className={cn(
            "text-sm leading-relaxed break-words",
            isDarkMode ? "text-zinc-300" : "text-zinc-600"
          )}>
            {workout.content.split(/(\s+)/).map((part, i) => {
              if (part.match(/^https?:\/\/[^\s]+$/)) {
                return (
                  <a 
                    key={i} 
                    href={part} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-emerald-500 hover:underline break-all"
                  >
                    {part}
                  </a>
                );
              }
              return part;
            })}
          </p>
          {(() => {
            const id = getYoutubeId(workout.content);
            if (id) {
              return (
                <a 
                  href={`https://www.youtube.com/watch?v=${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative aspect-video w-full rounded-2xl overflow-hidden bg-black group/thumb"
                >
                  <img 
                    src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`} 
                    alt="YouTube Preview" 
                    className="w-full h-full object-cover opacity-90 group-hover/thumb:opacity-100 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl transform group-hover/thumb:scale-110 transition-transform">
                      <Youtube className="w-7 h-7 text-white fill-white" />
                    </div>
                  </div>
                </a>
              );
            }
            return null;
          })()}

          {(() => {
            const tiktokRegex = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/[^\s]+/g;
            const links = workout.content?.match(tiktokRegex) || [];
            if (links.length > 0) {
              return (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {links.map((link, idx) => (
                    <a 
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 relative aspect-[9/16] w-32 rounded-2xl overflow-hidden bg-zinc-900 group/tiktok"
                    >
                      {tiktokThumbnails[link] ? (
                        <img 
                          src={tiktokThumbnails[link]} 
                          alt="TikTok Preview" 
                          className="w-full h-full object-cover opacity-80 group-hover/tiktok:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <Video className="w-8 h-8 text-zinc-700" />
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">TikTok</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 transform group-hover/tiktok:scale-110 transition-transform">
                          <Music className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
      
      <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar mb-4">
        {workout.exercises.map(ex => (
          <div key={ex.id} className={cn(
            "flex-shrink-0 px-3 py-2 rounded-xl border transition-colors",
            isDarkMode ? "bg-zinc-800/30 border-zinc-700/30" : "bg-zinc-100/50 border-zinc-200/50"
          )}>
            <p className={cn(
              "text-xs font-bold",
              isDarkMode ? "text-zinc-300" : "text-zinc-600"
            )}>{ex.name}</p>
            <p className={cn(
              "text-[10px]",
              isDarkMode ? "text-zinc-500" : "text-zinc-400"
            )}>{ex.sets.length} sets</p>
          </div>
        ))}
      </div>

      {workout.attachments && workout.attachments.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-zinc-800/20 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Attachments</p>
          <div className="grid grid-cols-1 gap-2">
            {workout.attachments.map(att => {
              const thumbnail = att.customThumbnail || (att.type === 'youtube' ? getYoutubeThumbnail(att.url) : null);
              const isFailed = failedThumbnails[att.id];

              return (
                <div key={att.id} className="relative group/att">
                  <input 
                    type="file" 
                    ref={activeAttachmentId === att.id ? fileInputRef : null}
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleCustomThumbnailUpload(e, att.id)}
                  />
                  
                  <a 
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex flex-col p-3 rounded-2xl border transition-all overflow-hidden",
                      isDarkMode ? "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                    )}
                  >
                    {(thumbnail && !isFailed) ? (
                      <div className="relative aspect-video w-full mb-3 rounded-xl overflow-hidden bg-black">
                        <img 
                          src={thumbnail} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                          onError={(e) => {
                            if (att.customThumbnail) {
                              setFailedThumbnails(prev => ({ ...prev, [att.id]: true }));
                            } else {
                              const id = getYoutubeId(att.url);
                              if (id && !(e.target as HTMLImageElement).src.includes('hqdefault')) {
                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                              } else {
                                setFailedThumbnails(prev => ({ ...prev, [att.id]: true }));
                              }
                            }
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                            <Youtube className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>
                        
                        {currentUserId === workout.userId && (
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveAttachmentId(att.id);
                              setTimeout(() => fileInputRef.current?.click(), 0);
                            }}
                            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-lg opacity-0 group-hover/att:opacity-100 transition-opacity hover:bg-emerald-500 hover:text-zinc-950"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      currentUserId === workout.userId && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveAttachmentId(att.id);
                            setTimeout(() => fileInputRef.current?.click(), 0);
                          }}
                          className={cn(
                            "aspect-video w-full mb-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all",
                            isDarkMode ? "border-zinc-700 bg-zinc-800/50 hover:border-emerald-500/50" : "border-zinc-200 bg-zinc-50 hover:border-emerald-500/50"
                          )}
                        >
                          <Plus className="w-6 h-6 text-zinc-500" />
                          <span className="text-[10px] font-bold uppercase text-zinc-500">Add Custom Thumbnail</span>
                        </button>
                      )
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isDarkMode ? "bg-zinc-700" : "bg-white shadow-sm"
                        )}>
                          {att.type === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                          {att.type === 'article' && <Globe className="w-4 h-4 text-blue-500" />}
                          {att.type === 'google-drive' && <Cloud className="w-4 h-4 text-blue-500" />}
                          {att.type === 'file' && (
                            <>
                              {att.fileType?.includes('mp4') && <Video className="w-4 h-4 text-purple-500" />}
                              {att.fileType?.includes('mp3') && <Music className="w-4 h-4 text-emerald-500" />}
                              {(!att.fileType?.includes('mp4') && !att.fileType?.includes('mp3')) && <FileText className="w-4 h-4 text-orange-500" />}
                            </>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold truncate max-w-[150px]">{att.name}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{att.type}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="pt-3 border-t border-zinc-800/20">
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-emerald-500 transition-colors mb-3"
        >
          <MessageSquare className="w-3 h-3" />
          {workout.comments?.length || 0} Comments
        </button>

        <AnimatePresence>
          {showComments && workout.comments && workout.comments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-3 overflow-hidden"
            >
              {workout.comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img src={comment.userAvatar} alt={comment.userName} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                  <div className={cn(
                    "flex-1 p-3 rounded-2xl text-xs",
                    isDarkMode ? "bg-zinc-800/50" : "bg-zinc-50"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{comment.userName}</span>
                      <span className="text-[10px] text-zinc-500">{format(new Date(comment.date), 'MMM d, HH:mm')}</span>
                    </div>
                    <p className={isDarkMode ? "text-zinc-300" : "text-zinc-600"}>{comment.text}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <input 
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && commentText.trim()) {
                onAddComment?.(workout.id, commentText);
                setCommentText('');
              }
            }}
            placeholder="Add a comment..."
            className={cn(
              "flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-all",
              isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
            )}
          />
          <button 
            onClick={() => {
              if (commentText.trim() && isAdminUser) {
                onAddComment?.(workout.id, commentText);
                setCommentText('');
              }
            }}
            disabled={!isAdminUser}
            className={cn(
              "p-2 bg-emerald-500 text-zinc-950 rounded-xl active:scale-95 transition-transform",
              !isAdminUser && "opacity-50 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, isDarkMode }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300 relative",
        active 
          ? "text-emerald-500" 
          : (isDarkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600")
      )}
    >
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute -top-1 w-1 h-1 bg-emerald-500 rounded-full"
        />
      )}
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function ProfileItem({ label, value, isDarkMode }: { label: string, value: string, isDarkMode?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 backdrop-blur-md border rounded-2xl transition-all hover:bg-opacity-80",
      isDarkMode 
        ? "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40" 
        : "bg-white/60 border-zinc-200 hover:bg-zinc-50/80 shadow-sm"
    )}>
      <span className={cn(
        "text-sm font-medium",
        isDarkMode ? "text-zinc-500" : "text-zinc-400"
      )}>{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}
