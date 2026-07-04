import React, { useState, useEffect, useRef, useCallback, useMemo, ChangeEvent, Component } from 'react';
import ReactMarkdown from 'react-markdown';
import { PSYCHOLOGY_QUOTES } from './data/psychologyQuotes';
import { INITIAL_QUOTES } from './data/initialQuotes';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Dumbbell, 
  Newspaper,
  TrendingUp, 
  User, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  XCircle,
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
  Eye,
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
  Euro,
  Clover,
  Radio,
  Sword,
  Trophy,
  Medal,
  Star,
  RefreshCw,
  Watch,
  ShieldCheck,
  Smartphone,
  Brain,
  Stethoscope,
  Users,
  Timer,
  MapPin,
  MoreVertical,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Upload,
  Camera,
  Image,
  Save,
  Wallet,
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
  Area,
  BarChart,
  Bar
} from 'recharts';
import { format, subDays, startOfToday, getDay } from 'date-fns';
import { cn } from './lib/utils';
import type { Workout, DailyStats, Exercise, WorkoutSet, DayPlan, PlannedExercise, UserProfile, ChatMessage, Quote, WorkoutComment, Article, ArticleComment } from './types';
import { auth, db, storage, googleProvider, signInWithPopup, signOut } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  uploadBytesResumable,
  uploadString
} from 'firebase/storage';
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
  documentId,
  writeBatch
} from 'firebase/firestore';
import { generateStoicReflection } from './services/aiService';
import YogaView from './components/YogaView';
import { QuizView } from './components/QuizView';
import { HistoryFeed } from './components/HistoryFeed';
import { INITIAL_HISTORY_VIDEOS } from './data/historyVideos';
import { YOGA_FLOWS } from './data/yogaFlows';
import { SocialSanctuary } from './components/SocialSanctuary';
import { DigestQuoteCard } from './components/DigestQuoteCard';
import WiseFitPlusPaywall from './components/WiseFitPlusPaywall';

const uploadBase64ToStorage = async (base64Data: string, filename: string, folder: string): Promise<string> => {
  try {
    const ext = filename.split('.').pop() || 'jpg';
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.]/g, '_');
    const uniqueFilename = `${cleanFilename.replace(/\.[^/.]+$/, "")}_${Date.now()}.${ext}`;
    const storageRef = ref(storage, `${folder}/${uniqueFilename}`);
    
    // We can use 'data_url' format since base64Data is a standard Data URL: "data:image/jpeg;base64,..."
    await uploadString(storageRef, base64Data, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (err) {
    console.warn("Client-side direct storage upload failed, falling back to server API /api/upload:", err);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename,
        fileType: base64Data.match(/^data:(.*?);base64,/) ? base64Data.match(/^data:(.*?);base64,/)?.[1] : 'image/jpeg',
        base64Data,
        folder
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || 'Server rejected file upload.');
    }

    const result = await response.json();
    return result.url;
  }
};


// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
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
  { name: 'Hypatia', url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200' },
  { name: 'Mary Wollstonecraft', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200' },
  { name: 'Simone de Beauvoir', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200' },
  { name: 'Marie Curie', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200' },
  { name: 'Hannah Arendt', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200' },
  { name: 'Musonius Rufus', url: 'https://compcharity.org/wp-content/uploads/2026/04/maxresdefault-1.jpg' },
  { name: 'Zeno', url: 'https://compcharity.org/wp-content/uploads/2026/04/zeno_of_citium.jpg' },
  { name: 'Sigmund Freud', url: 'https://compcharity.org/wp-content/uploads/2026/05/freud.jpg' },
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Guest',
  height: 182,
  currentWeight: 89.0,
  targetWeight: 75,
  currentSteps: 0,
  currentCalories: 0,
  currentDistance: 0,
  currentRHR: 0,
  currentHRV: 0,
  stepGoal: 10000,
  shortTermGoal: '+60 kg',
  longTermGoal: '+100 kg',
  maxPullUps: 14,
  oneRMWeighted: 30,
  avatarUrl: AVATARS[0].url,
  seenQuoteIds: [],
  markedQuotes: [],
  dailyExercises: [],
  dailyExerciseHistory: [],
  isDatingModeEnabled: false,
  datingPreferences: {
    genderInterest: 'female',
    minAge: 18,
    maxAge: 40
  },
  personalRecords: [
    { id: '1', label: 'Fastest kilometre', date: 'Sun 8 Feb', value: '4 min 38 sec', category: 'speed' },
    { id: '2', label: 'Fastest 5K', date: '18 Oct 2025', value: '26 min 9 sec', category: 'speed' },
    { id: '3', label: 'Fastest 10K', date: '26 Jul 2025', value: '56 min 43 sec', category: 'speed' },
    { id: '4', label: 'Fastest half marathon', date: '31 Aug 2025', value: '2 h 11 m', category: 'speed' },
    { id: '5', label: 'Farthest run', date: '31 Aug 2025', value: '41.24 km (4 h 45 m)', category: 'distance' }
  ]
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

const ADMIN_EMAILS = ["petar.dekanovic@gmail.com", "esmeraldadarkomanila@gmail.com", "stjepan.dekanovic@gmail.com"];
const AUTHORIZED_EMAILS = [
  "petar.dekanovic@gmail.com",
  "stjepan.dekanovic@gmail.com",
  "esmeraldadarkomanila@gmail.com",
  "miljkica79@gmail.com"
];

function CommunityStats({ isDarkMode, currentUser, isQuotaExceeded, setIsQuotaExceeded }: { isDarkMode: boolean, currentUser: FirebaseUser | null, isQuotaExceeded: boolean, setIsQuotaExceeded: (val: boolean) => void }) {
  const [liveUsers, setLiveUsers] = useState<number | string>('...');
  const [totalSubscribers, setTotalSubscribers] = useState<number | string>('...');
  const [dailyTraffic, setDailyTraffic] = useState(0);

  useEffect(() => {
    // 1. Fetch real-time active users (both guests and logged-in users because of public read-rules)
    const fetchLiveUsers = async () => {
      if (isQuotaExceeded) {
        setLiveUsers(1);
        return;
      }
      try {
        const publicProfilesRef = collection(db, 'public_profiles');
        const q = query(publicProfilesRef, where('isOnline', '==', true));
        const liveSnap = await getCountFromServer(q);
        const liveCount = liveSnap.data().count || 1;
        setLiveUsers(liveCount);
        localStorage.setItem('wisefit_live_users', liveCount.toString());
      } catch (err: any) {
        if (err?.message?.includes('quota')) {
          setIsQuotaExceeded(true);
          setLiveUsers(1);
        } else {
          console.warn("Could not fetch real-time active users count:", err);
          const cachedLive = localStorage.getItem('wisefit_live_users');
          setLiveUsers(cachedLive ? Number(cachedLive) : 1);
        }
      }
    };

    fetchLiveUsers();
    // Regular interval (every 30 seconds) to keep nodes active updated in real-time
    const liveInterval = setInterval(fetchLiveUsers, 30000);

    // 2. Fetch total subscribers (cached up to 12 hours)
    const fetchTotalStats = async () => {
      try {
        const cachedSubs = localStorage.getItem('wisefit_total_subs');
        const cachedTraffic = localStorage.getItem('wisefit_daily_traffic');
        const lastFetchTime = localStorage.getItem('wisefit_community_fetch_time');
        const now = Date.now();
        const CACHE_DURATION = 12 * 60 * 60 * 1000;

        if (lastFetchTime && now - Number(lastFetchTime) < CACHE_DURATION && cachedSubs) {
          setTotalSubscribers(Number(cachedSubs));
          setDailyTraffic(cachedTraffic ? Number(cachedTraffic) : 1245);
          return;
        }

        // Only query total registered users if logged in to save quota
        if (currentUser && !isQuotaExceeded) {
          const usersRef = collection(db, 'users');
          const totalSnap = await getCountFromServer(usersRef);
          const count = totalSnap.data().count || 5;
          const subCount = 28450 + (count * 12);
          const traffic = Math.max(1245, Math.floor(subCount * 0.15));

          setTotalSubscribers(subCount);
          setDailyTraffic(traffic);

          localStorage.setItem('wisefit_total_subs', subCount.toString());
          localStorage.setItem('wisefit_daily_traffic', traffic.toString());
          localStorage.setItem('wisefit_community_fetch_time', now.toString());
        } else {
          setTotalSubscribers(cachedSubs ? Number(cachedSubs) : 28450);
          setDailyTraffic(cachedTraffic ? Number(cachedTraffic) : 1245);
        }
      } catch (err: any) {
        if (err?.message?.includes('quota')) {
          setIsQuotaExceeded(true);
        }
        console.warn("Stats retrieval error:", err);
        setTotalSubscribers(28450);
        setDailyTraffic(1245);
      }
    };

    fetchTotalStats();

    // 3. Update my user heartbeat (lastActive)
    const updateMyHeartbeat = async () => {
      if (currentUser && !isQuotaExceeded) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            lastActive: serverTimestamp()
          });
        } catch (err: any) {
          if (err?.message?.includes('quota')) setIsQuotaExceeded(true);
        }
      }
    };

    updateMyHeartbeat();
    const heartbeatInterval = setInterval(updateMyHeartbeat, 60000);

    return () => {
      clearInterval(liveInterval);
      clearInterval(heartbeatInterval);
    };
  }, [currentUser, isQuotaExceeded]);

  const discCount = Math.floor(Number(totalSubscribers) * 0.62) || 17639;
  const philCount = Math.floor(Number(totalSubscribers) * 0.31) || 8819;
  const sageCount = Math.floor(Number(totalSubscribers) * 0.07) || 1991;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        "backdrop-blur-md border rounded-3xl p-6 transition-colors duration-500",
        isDarkMode ? "bg-zinc-900/60 border-zinc-800/50" : "bg-white/80 border-zinc-200 shadow-sm"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold">Community Pulse</h3>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">{liveUsers} Nodes Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-zinc-800/20 border border-zinc-800/30">
          <p className="text-2xl font-bold tracking-tight">{totalSubscribers.toLocaleString()}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Global Seekers</p>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-800/20 border border-zinc-800/30">
          <p className="text-2xl font-bold tracking-tight">{(dailyTraffic || 245).toLocaleString()}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Daily Syncs</p>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-zinc-800/50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Wisdom Lineage</p>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-500">{totalSubscribers.toLocaleString()} Total</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 rounded-2xl bg-zinc-800/30 border border-zinc-800/50 hover:border-emerald-500/50 transition-colors">
            <p className="text-lg font-bold text-emerald-400">{discCount.toLocaleString()}</p>
            <p className="text-[8px] font-bold uppercase tracking-tighter text-zinc-500">Disciples</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-zinc-800/30 border border-zinc-800/50 hover:border-purple-500/50 transition-colors">
            <p className="text-lg font-bold text-purple-400">{philCount.toLocaleString()}</p>
            <p className="text-[8px] font-bold uppercase tracking-tighter text-zinc-500">Scholars</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-zinc-800/30 border border-zinc-800/50 hover:border-amber-500/50 transition-colors">
            <p className="text-lg font-bold text-amber-400">{sageCount.toLocaleString()}</p>
            <p className="text-[8px] font-bold uppercase tracking-tighter text-zinc-500">Sages</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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
          {wisdomCount >= 1000 && (
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
    id: 'mock-wisdom-1',
    userId: 'mock-user',
    date: format(startOfToday(), 'yyyy-MM-dd'),
    name: 'Wisdom of Schopenhauer',
    content: 'https://compcharity.org/wp-content/uploads/2026/04/Midnight-Philosophy_7632736182807301398-no-watermark.mp4',
    exercises: []
  },
  {
    id: 'mock-wisdom-2',
    userId: 'mock-user',
    date: format(subDays(startOfToday(), 2), 'yyyy-MM-dd'),
    name: 'Stoic Morning Routine',
    content: 'https://www.youtube.com/watch?v=u6S7u0W0Wks',
    exercises: []
  },
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

type View = 'dashboard' | 'plan' | 'workouts' | 'progress' | 'profile' | 'chat' | 'library' | 'yoga' | 'quiz' | 'psychologist' | 'social';

// Video Utils
const extractYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const extractTiktokId = (url: string) => {
  if (!url) return null;
  // Handle /video/123456789...
  const videoIdMatch = url.match(/\/video\/(\d+)/);
  if (videoIdMatch) return videoIdMatch[1];
  
  // Handle vm.tiktok.com and other short links
  const parts = url.split('?')[0].split('/');
  const lastPart = parts[parts.length - 1] || parts[parts.length - 2];
  if (/^\d+$/.test(lastPart)) return lastPart;

  return null;
};

const extractDirectVideoUrl = (content: string) => {
  const mp4Regex = /(https?:\/\/[^\s]+\.mp4)/i;
  const match = content.match(mp4Regex);
  return match ? match[1] : null;
};

const getHistoryEmbedUrl = (type: 'youtube' | 'tiktok', videoId: string) => {
  if (type === 'youtube') {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`;
  }
  return `https://www.tiktok.com/embed/v2/${videoId}?autoplay=1&loop=1&rel=0`;
};

const VideoEmbed = ({ type, videoId, isDarkMode }: { type: 'youtube' | 'tiktok' | 'direct', videoId: string, isDarkMode: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (type === 'direct' && videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play().catch(() => {
              // Autoplay might be blocked until interaction
              console.log("Autoplay blocked, waiting for interaction");
            });
          } else {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [type]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full aspect-[9/16] mt-4 rounded-[32px] overflow-hidden border group",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"
      )}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center animate-pulse">
            <Play className="w-6 h-6 text-white fill-current opacity-20" />
          </div>
        </div>
      )}

      {type === 'direct' ? (
        <video
          ref={videoRef}
          src={videoId} // for direct type, videoId is the full URL
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          muted
          loop
          playsInline
          controls
          onLoadedData={() => setIsLoaded(true)}
        />
      ) : (
        isVisible && (
          <iframe
            className={cn(
              "w-full h-full scale-[1.05] transition-opacity duration-1000",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            src={getHistoryEmbedUrl(type as 'youtube' | 'tiktok', videoId)}
            allow="autoplay; encrypted-media"
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
          />
        )
      )}

      {!isLoaded && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
            {type === 'direct' ? 'Native Play' : 'Tap to Listen'}
          </div>
        </div>
      )}
    </div>
  );
};

function PersonalRecords({ records, isDarkMode }: { records: any[], isDarkMode: boolean }) {
  if (!records || records.length === 0) return null;

  const getRecordTheme = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('kilometre')) return { color: 'text-amber-400', bg: 'bg-amber-400/15', glow: 'bg-amber-500/10', icon: Timer };
    if (l.includes('5k')) return { color: 'text-emerald-400', bg: 'bg-emerald-400/15', glow: 'bg-emerald-500/10', icon: Timer };
    if (l.includes('10k')) return { color: 'text-cyan-400', bg: 'bg-cyan-400/15', glow: 'bg-cyan-500/10', icon: Timer };
    if (l.includes('marathon')) return { color: 'text-purple-400', bg: 'bg-purple-400/15', glow: 'bg-purple-500/10', icon: Timer };
    if (l.includes('distance') || l.includes('farthest') || l.includes('run')) return { color: 'text-blue-400', bg: 'bg-blue-400/15', glow: 'bg-blue-500/10', icon: MapPin };
    return { color: 'text-zinc-400', bg: 'bg-zinc-400/15', glow: 'bg-zinc-500/10', icon: Activity };
  };

  return (
    <div className="space-y-3">
      {records.map((record, i) => {
        const theme = getRecordTheme(record.label);
        const Icon = theme.icon;
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "p-4 rounded-[2rem] border flex items-center justify-between transition-all group relative overflow-hidden",
              isDarkMode ? "bg-zinc-950/40 border-zinc-900 shadow-xl" : "bg-white border-zinc-100 shadow-sm"
            )}
          >
            {/* Dynamic Glow Effect */}
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl -z-10", theme.glow)} />
            
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center relative flex-shrink-0 transition-transform group-hover:scale-110",
                theme.bg, theme.color
              )}>
                {/* Decorative Elements */}
                <div className="absolute inset-0 border border-current opacity-10 rounded-2xl scale-90" />
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </div>
              
              <div className="space-y-0.5">
                <h4 className={cn(
                  "text-xs font-black uppercase tracking-widest transition-colors",
                  isDarkMode ? "text-zinc-500 group-hover:text-zinc-300" : "text-zinc-400"
                )}>
                  {record.label}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "text-lg font-black italic tracking-tighter",
                    theme.color
                  )}>
                    {record.value}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">
                    {record.date}
                  </span>
                </div>
              </div>
            </div>
            
            <button className={cn(
              "p-2 hover:bg-zinc-500/10 rounded-full transition-all text-zinc-600 active:scale-90 flex-shrink-0",
              isDarkMode ? "hover:text-zinc-300" : "hover:text-zinc-900"
            )}>
              <MoreVertical className="w-4 h-4" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

function BiometricDashboard({ data, personalRecords, isDarkMode, onSync }: { data: any[], personalRecords?: any[], isDarkMode: boolean, onSync?: () => void }) {
  const hasData = data && data.length > 0;
  const hasRecords = personalRecords && personalRecords.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        {!hasData ? (
          <div className={cn(
            "backdrop-blur-md border rounded-3xl p-8 transition-colors duration-500 text-center space-y-4",
            isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white/60 border-zinc-200 shadow-sm"
          )}>
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto opacity-50">
              <RefreshCw className="w-8 h-8 text-zinc-500" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold">No Biometric Data Found</h4>
              <p className="text-xs text-zinc-500 leading-relaxed px-4">
                We couldn't find any activity data for the last 7 days. Sync your Google Watch/Fitbit to populate this dashboard.
              </p>
            </div>
            {onSync && (
              <button 
                onClick={onSync}
                className="px-4 py-2 bg-emerald-500 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                Sync Now
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(
                "p-4 rounded-3xl border transition-colors",
                isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Weekly Burn</span>
                </div>
                <p className="text-xl font-black italic text-orange-500">
                  {data.reduce((acc, d) => acc + d.calories, 0).toLocaleString()}
                  <span className="text-[10px] ml-1 uppercase font-bold text-zinc-500 not-italic">kcal</span>
                </p>
              </div>
              <div className={cn(
                "p-4 rounded-3xl border transition-colors",
                isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-3 h-3 text-blue-500" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Distance</span>
                </div>
                <p className="text-xl font-black italic text-blue-500">
                  {data.reduce((acc, d) => acc + d.distance, 0).toFixed(1)}
                  <span className="text-[10px] ml-1 uppercase font-bold text-zinc-500 not-italic">km</span>
                </p>
              </div>
            </div>

            <div className={cn(
              "backdrop-blur-md border rounded-3xl p-6 transition-colors duration-500",
              isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white/60 border-zinc-200 shadow-sm"
            )}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h3 className={cn(
                    "text-[10px] uppercase font-black tracking-widest transition-colors",
                    isDarkMode ? "text-zinc-400" : "text-zinc-500"
                  )}>Weekly Calorie Burn</h3>
                </div>
                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="text-[8px] font-black uppercase text-emerald-500 tracking-tighter">Verified Sync</span>
                </div>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: isDarkMode ? '#71717a' : '#a1a1aa', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#18181b' : '#ffffff', 
                        borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      itemStyle={{ color: isDarkMode ? '#ffffff' : '#000000' }}
                    />
                    <Bar 
                      dataKey="calories" 
                      fill={isDarkMode ? "#f97316" : "#ea580c"} 
                      radius={[4, 4, 0, 0]} 
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className={cn(
            "text-sm font-bold uppercase tracking-widest transition-colors",
            isDarkMode ? "text-zinc-500" : "text-zinc-400"
          )}>Personal Records</h3>
          <Trophy className="w-4 h-4 text-zinc-600 opacity-50" />
        </div>
        
        {hasRecords ? (
          <PersonalRecords records={personalRecords} isDarkMode={isDarkMode} />
        ) : (
          <div className={cn(
            "p-12 rounded-[2.5rem] border border-dashed text-center",
            isDarkMode ? "border-zinc-800 bg-zinc-900/10" : "border-zinc-100 bg-zinc-50/10"
          )}>
            <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-3 opacity-20" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 leading-loose">
              Biological achievements<br/>will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function ArticleCard({ 
  article, 
  isDarkMode, 
  onDelete,
  onEdit,
  user,
  userProfile
}: { 
  article: Article, 
  isDarkMode: boolean, 
  onDelete: (id: string) => void,
  onEdit: (article: Article) => void,
  user?: any,
  userProfile?: UserProfile
}) {
  const currentUserId = user?.uid;
  const isOwner = currentUserId === article.userId;
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const speechQueue = useRef<string[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [copiedContent, setCopiedContent] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const [localLiked, setLocalLiked] = useState(false);
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSuccessMsg, setCommentSuccessMsg] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Subscribe to comments
  useEffect(() => {
    const q = query(
      collection(db, 'articles', article.id, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data() } as ArticleComment));
      setComments(fetched);
    }, (error) => {
      console.error("Comments subscription error:", error);
    });
    return () => unsubscribe();
  }, [article.id]);

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);
  const isArticleOwner = currentUserId === article.userId;

  const visibleComments = comments.filter(c => {
    if (c.status === 'approved') return true;
    if (isAdmin || isArticleOwner) return true;
    if (currentUserId && c.userId === currentUserId) return true;
    return false;
  });

  const approvedCommentsCount = comments.filter(c => c.status === 'approved').length;
  const pendingCommentsCount = comments.filter(c => c.status === 'pending').length;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const finalUserName = user 
      ? (userProfile?.name || user.displayName || 'Anonymous') 
      : (guestName.trim() || 'Anonymous Seeker');

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Logged in users are allowed to comment without admin approving each comment
    const isUserLoggedIn = !!currentUserId;

    const newComment: ArticleComment = {
      id: commentId,
      articleId: article.id,
      userId: currentUserId || null,
      userName: finalUserName,
      userAvatar: user ? (user.photoURL || userProfile?.avatarUrl || '') : '',
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
      status: isUserLoggedIn ? 'approved' : 'pending'
    };

    setIsSubmittingComment(true);
    setCommentSuccessMsg('');

    try {
      const commentsCol = collection(db, 'articles', article.id, 'comments');
      await setDoc(doc(commentsCol, commentId), newComment);
      
      setCommentText('');
      if (isUserLoggedIn) {
        setCommentSuccessMsg('Your comment has been posted successfully.');
      } else {
        setCommentSuccessMsg('Your comment has been submitted and is pending administrator approval.');
      }
      setTimeout(() => setCommentSuccessMsg(''), 7000);
    } catch (err: any) {
      console.error("Error submitting comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleApproveComment = async (commentId: string) => {
    try {
      const commentDocRef = doc(db, 'articles', article.id, 'comments', commentId);
      await updateDoc(commentDocRef, {
        status: 'approved'
      });
    } catch (err: any) {
      console.error("Error approving comment:", err);
    }
  };

  const handleRejectComment = async (commentId: string) => {
    try {
      const commentDocRef = doc(db, 'articles', article.id, 'comments', commentId);
      await updateDoc(commentDocRef, {
        status: 'rejected'
      });
    } catch (err: any) {
      console.error("Error rejecting comment:", err);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    try {
      const commentDocRef = doc(db, 'articles', article.id, 'comments', commentId);
      await updateDoc(commentDocRef, {
        content: editingCommentText.trim(),
        updatedAt: new Date().toISOString()
      });
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (err: any) {
      console.error("Error updating comment:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const commentDocRef = doc(db, 'articles', article.id, 'comments', commentId);
      await deleteDoc(commentDocRef);
    } catch (err: any) {
      console.error("Error deleting comment:", err);
    }
  };

  useEffect(() => {
    if (!currentUserId) {
      const likedState = localStorage.getItem(`liked_${article.id}`);
      setLocalLiked(!!likedState);
    }
  }, [article.id, currentUserId]);

  const isLiked = currentUserId ? (article.likedBy || []).includes(currentUserId) : localLiked;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!article.url) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.3, // autoplays when 30% or more of the video is in view
      }
    );

    const currentVideo = videoRef.current;
    if (currentVideo) {
      observer.observe(currentVideo);
    }

    return () => {
      if (currentVideo) {
        observer.unobserve(currentVideo);
      }
      observer.disconnect();
    };
  }, [article.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible) {
      video.play().catch((err) => {
        // Autoplay policy might block unmuted video play, which is fine and expected
        console.log("Autoplay was prevented:", err);
      });
    } else {
      video.pause();
    }
  }, [isVisible]);

  const copyContent = () => {
    navigator.clipboard.writeText(article.content);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setIsSharing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = () => {
    const synth = window.speechSynthesis;
    
    if (isPlaying || isProcessing) {
      synth.cancel();
      activeUtteranceRef.current = null;
      setIsPlaying(false);
      setIsProcessing(false);
      setCurrentChunkIndex(0);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Clean and Chunk the text
      const cleanText = article.content
        .replace(/[#*`~]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/- /g, '');

      // Split into chunks of roughly 200 characters at sentence boundaries
      const chunks = cleanText.match(/[^.!?]+[.!?]+(?=\s|$)/g) || [cleanText];
      
      const finalChunks = [article.title, ...chunks.map(c => c.trim()).filter(c => c.length > 0)];
      
      speechQueue.current = finalChunks;
      setTotalChunks(finalChunks.length);
      setCurrentChunkIndex(0);

      const speakChunk = (index: number) => {
        if (index >= speechQueue.current.length) {
          activeUtteranceRef.current = null;
          setIsPlaying(false);
          setIsProcessing(false);
          setCurrentChunkIndex(0);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(speechQueue.current[index]);
        activeUtteranceRef.current = utterance; // Retain active utterance to bypass browser GC garbage collection bugs
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';
        
        // Try to find a matching English voice
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith('en-US')) || 
                      voices.find(v => v.lang.startsWith('en-'));
        if (voice) utterance.voice = voice;
        
        utterance.onstart = () => {
          setIsProcessing(false);
          setIsPlaying(true);
          setCurrentChunkIndex(index + 1);
        };
        
        utterance.onend = () => {
          speakChunk(index + 1);
        };
        
        utterance.onerror = (e) => {
          console.error("Speech Chunk Error:", e);
          activeUtteranceRef.current = null;
          setIsPlaying(false);
          setIsProcessing(false);
        };

        synth.speak(utterance);
      };

      // Start the sequence
      synth.cancel();
      setTimeout(() => speakChunk(0), 100);
      
    } catch (e) {
      console.error("Speech Init Error:", e);
      setIsProcessing(false);
    }
  };

  const updateEngagement = async (field: 'reads' | 'shares') => {
    try {
      const q = query(collection(db, 'articles'), where('id', '==', article.id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const articleDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'articles', articleDoc.id), {
          [field]: (article[field] || 0) + 1
        });
        // Note: Parent articles state handles re-fetching or we could update locally
      }
    } catch (e) {
      console.error(`Error updating article ${field}:`, e);
    }
  };

  const updateLikesCount = async (delta: number) => {
    try {
      const q = query(collection(db, 'articles'), where('id', '==', article.id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const articleDoc = snapshot.docs[0];
        const currentLikes = typeof article.likes === 'number' ? article.likes : (article.likedBy || []).length;
        const newLikes = Math.max(0, currentLikes + delta);
        await updateDoc(doc(db, 'articles', articleDoc.id), {
          likes: newLikes
        });
      }
    } catch (e) {
      console.error("Error updating likes count:", e);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      const likedState = localStorage.getItem(`liked_${article.id}`);
      if (likedState) {
        localStorage.removeItem(`liked_${article.id}`);
        setLocalLiked(false);
        await updateLikesCount(-1);
      } else {
        localStorage.setItem(`liked_${article.id}`, 'true');
        setLocalLiked(true);
        await updateLikesCount(1);
      }
      return;
    }

    try {
      const q = query(collection(db, 'articles'), where('id', '==', article.id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const articleDoc = snapshot.docs[0];
        const currentLikedBy = article.likedBy || [];
        let newLikedBy: string[];
        let likesDelta = 0;

        if (currentLikedBy.includes(currentUserId)) {
          newLikedBy = currentLikedBy.filter(id => id !== currentUserId);
          likesDelta = -1;
        } else {
          newLikedBy = [...currentLikedBy, currentUserId];
          likesDelta = 1;
        }

        const currentLikes = typeof article.likes === 'number' ? article.likes : (article.likedBy || []).length;
        const newLikes = Math.max(0, currentLikes + likesDelta);

        await updateDoc(doc(db, 'articles', articleDoc.id), {
          likedBy: newLikedBy,
          likes: newLikes
        });
      }
    } catch (e) {
      console.error("Error toggling like status on article:", e);
    }
  };

  useEffect(() => {
    // Increment read count only once per session for this article
    const sessionKey = `read_${article.id}`;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, 'true');
      updateEngagement('reads');
    }
  }, [article.id]);

  const handleShare = async (platform?: string) => {
    const shareUrl = `${window.location.origin}/?view=articles&id=${article.id}`; 
    const text = `Check out this article on WiseFit: ${article.title}`;
    
    // Increment share count
    await updateEngagement('shares');
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
    } else {
      navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setIsSharing(false);
  };

  const handleShareTriggerClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?view=articles&id=${article.id}`; 
    const text = `Check out this article on WiseFit: ${article.title}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: text,
          url: shareUrl
        });
        await updateEngagement('shares');
        return;
      } catch (err) {
        console.log("Native share failed or was close:", err);
        if ((err as Error).name === 'AbortError') {
          return;
        }
      }
    }
    
    setIsSharing(!isSharing);
  };

  return (
    <motion.div
      id={`article-${article.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "backdrop-blur-md border rounded-[2rem] p-6 transition-all space-y-4 relative group",
        isDarkMode ? "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40" : "bg-white border-zinc-100 shadow-sm hover:shadow-md"
      )}
    >
      {/* Title & Date Metadata (occupies full width) */}
      <div className="flex items-start gap-4 w-full" id={`article-header-text-${article.id}`}>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5 shadow-sm transition-all duration-300",
          isDarkMode 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
            : "bg-emerald-50 text-emerald-600 border-emerald-100"
        )}>
          <FileText className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-black text-lg md:text-xl leading-snug tracking-tight text-wrap break-words",
            isDarkMode ? "text-zinc-100" : "text-zinc-900"
          )}>
            {article.title}
          </h4>
          <p className={cn("text-[10px] uppercase font-bold tracking-widest mt-1.5", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
            {format(new Date(article.date), 'MMM d, yyyy • HH:mm')}
          </p>
        </div>
      </div>

      {/* Action Toolbar Row (on its own line to prevent title clamping or layout clashes) */}
      <div className="flex flex-wrap items-center gap-2 pt-2 pb-3 border-b border-zinc-800/10 dark:border-zinc-800/30 w-full" id={`article-toolbar-${article.id}`}>
        <button 
          onClick={copyContent}
          className={cn(
            "h-9 px-3 rounded-xl transition-all flex items-center justify-center border text-[10px] font-black uppercase tracking-wider relative overflow-hidden select-none active:scale-95",
            copiedContent 
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm" 
              : isDarkMode 
                ? "bg-zinc-800/30 border-zinc-800 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 text-zinc-400" 
                : "bg-zinc-100 border-zinc-200 text-zinc-650 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-250"
          )}
          title="Copy Content"
          id={`btn-copy-${article.id}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copiedContent ? (
              <motion.span 
                key="copied"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Copied</span>
              </motion.span>
            ) : (
              <motion.span 
                key="copy"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Copy</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button 
          onClick={toggleSpeech}
          className={cn(
            "h-9 px-3 rounded-xl transition-all flex items-center gap-1.5 border text-[10px] font-black uppercase tracking-wider select-none active:scale-95",
            (isPlaying || isProcessing)
              ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30 shadow-sm" 
              : isDarkMode 
                ? "bg-zinc-800/30 border-zinc-800 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/20 text-zinc-400" 
                : "bg-zinc-100 border-zinc-200 text-zinc-650 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
          )}
          title={isPlaying ? "Stop Listening" : "Listen to Article"}
          id={`btn-listen-${article.id}`}
        >
          {isProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          ) : isPlaying ? (
            <VolumeX className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
          )}
          <span>{isProcessing ? "Processing..." : isPlaying ? "Stop" : "Listen"}</span>
        </button>

        <div className="relative" ref={shareRef}>
          <button 
            onClick={handleShareTriggerClick}
            className={cn(
              "h-9 px-3 rounded-xl transition-all flex items-center gap-1.5 border text-[10px] font-black uppercase tracking-wider select-none active:scale-95",
              isSharing
                ? "bg-sky-500/15 text-sky-400 border-sky-500/30 shadow-sm"
                : isDarkMode 
                  ? "bg-zinc-800/30 border-zinc-800 hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-500/20 text-zinc-400" 
                  : "bg-zinc-100 border-zinc-200 text-zinc-650 hover:bg-sky-50 hover:text-sky-600 hover:border-indigo-200"
            )}
            title="Share"
            id={`btn-share-trigger-${article.id}`}
          >
            <Share2 className="w-3.5 h-3.5 text-sky-500" />
            <span>Share</span>
          </button>
          
          <AnimatePresence>
            {isSharing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className={cn(
                  "absolute right-0 top-11 z-20 min-w-[170px] p-2 rounded-2xl border shadow-xl backdrop-blur-xl",
                  isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"
                )}
                id={`share-dropdown-${article.id}`}
              >
                <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-500/10 transition-all text-xs font-bold text-left" id={`share-tw-${article.id}`}>
                  <Twitter className="w-4 h-4 text-[#1DA1F2]" /> Twitter
                </button>
                <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-500/10 transition-all text-xs font-bold text-left" id={`share-fb-${article.id}`}>
                  <Facebook className="w-4 h-4 text-[#1877F2]" /> Facebook
                </button>
                <button onClick={() => handleShare('linkedin')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-500/10 transition-all text-xs font-bold text-left" id={`share-li-${article.id}`}>
                  <Linkedin className="w-4 h-4 text-[#0A66C2]" /> LinkedIn
                </button>
                <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-500/10 transition-all text-xs font-bold text-left" id={`share-wa-${article.id}`}>
                  <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp
                </button>
                <div className="h-px bg-zinc-800/10 dark:bg-zinc-800/50 my-1 mx-2" />
                <button 
                  onClick={() => handleShare()} 
                  className="w-full flex items-center h-9 px-3 rounded-xl hover:bg-zinc-500/10 transition-all text-xs font-bold text-left relative overflow-hidden" 
                  id={`share-copy-${article.id}`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.span
                        key="copied-link"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-3 w-full text-emerald-400 font-bold"
                      >
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Copied Link!</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy-link"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-3 w-full"
                      >
                        <Copy className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span>Copy Link</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isOwner && (
          <>
            <button 
              onClick={() => onEdit(article)}
              className={cn(
                "h-9 px-3 rounded-xl transition-all flex items-center gap-1.5 border text-[10px] font-black uppercase tracking-wider select-none active:scale-95",
                isDarkMode 
                  ? "bg-zinc-800/30 border-zinc-800 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20 text-zinc-400" 
                  : "bg-zinc-100 border-zinc-200 text-zinc-650 hover:bg-amber-50 hover:text-amber-600 hover:border-emerald-200"
              )}
              title="Edit Article"
              id={`btn-edit-${article.id}`}
            >
              <Edit className="w-3.5 h-3.5 text-amber-500" />
              <span>Edit</span>
            </button>
            <button 
              onClick={() => onDelete(article.id)}
              className={cn(
                "h-9 px-3 rounded-xl transition-all flex items-center gap-1.5 border text-[10px] font-black uppercase tracking-wider select-none active:scale-95",
                isDarkMode 
                  ? "bg-zinc-800/30 border-zinc-800 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 text-zinc-400" 
                  : "bg-zinc-100 border-zinc-200 text-zinc-655 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-250"
              )}
              title="Delete Article"
              id={`btn-delete-${article.id}`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>

      {article.url && (
        <div className="relative rounded-[2rem] overflow-hidden border border-zinc-500/10 bg-black aspect-video mb-4 shadow-xl">
          <video 
            ref={videoRef}
            src={`${article.url}#t=0.001`}
            poster={article.thumbnailUrl}
            autoPlay={isVisible}
            controls
            playsInline
            muted={false}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <div className={cn(
        "markdown-body text-sm leading-relaxed prose prose-sm max-w-none",
        isDarkMode ? "text-zinc-300 prose-invert" : "text-zinc-700"
      )}>
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>

      {/* --- COMMENTS SECTION --- */}
      <div className={cn(
        "pt-4 border-t",
        isDarkMode ? "border-zinc-800/40" : "border-zinc-100"
      )}>
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowComments(!showComments)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-300 active:scale-95",
              isDarkMode 
                ? "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/30 text-zinc-300"
                : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100/50 text-zinc-600"
            )}
          >
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>Comments ({approvedCommentsCount})</span>
            {showComments ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>

          {/* Pending reviews indicator for admins/owners */}
          {pendingCommentsCount > 0 && (isAdmin || isArticleOwner) && (
            <span className="text-[10px] h-6 flex items-center font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full border border-amber-500/20 shadow-sm animate-pulse">
              {pendingCommentsCount} Pending Approval
            </span>
          )}
        </div>

        {showComments && (
          <div className="space-y-4 mt-4 transition-all duration-300">
            {/* Comment list */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {visibleComments.map((comment) => (
                <div 
                  key={comment.id}
                  className={cn(
                    "p-3 rounded-2xl border flex flex-col gap-1.5 relative group/comment transition-colors duration-200",
                    isDarkMode 
                      ? comment.status === 'pending'
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-zinc-900/40 border-zinc-900/60 hover:bg-zinc-900/60"
                      : comment.status === 'pending'
                        ? "bg-amber-50/50 border-amber-200/60"
                        : "bg-zinc-50/50 border-zinc-100 hover:bg-zinc-100/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {comment.userAvatar ? (
                        <img 
                          referrerPolicy="no-referrer"
                          src={comment.userAvatar} 
                          alt={comment.userName} 
                          className="w-5 h-5 rounded-full object-cover border border-zinc-500/20" 
                        />
                      ) : (
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0",
                          isDarkMode ? "bg-zinc-800 text-zinc-400 border-zinc-700/50" : "bg-zinc-100 text-zinc-500 border-zinc-200"
                        )}>
                          {comment.userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className={cn(
                          "text-xs font-bold",
                          isDarkMode ? "text-zinc-200" : "text-zinc-850"
                        )}>
                          {comment.userName}
                        </span>
                        <span className={cn(
                          "text-[9px] font-mono uppercase ml-2 select-none font-medium",
                          isDarkMode ? "text-zinc-500" : "text-zinc-450"
                        )}>
                          {format(new Date(comment.createdAt), 'MMM d • HH:mm')}
                        </span>
                      </div>
                    </div>

                    {/* Pending badge */}
                    {comment.status === 'pending' && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 select-none">
                        Pending
                      </span>
                    )}
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <textarea
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className={cn(
                          "w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500",
                          isDarkMode 
                            ? "bg-zinc-950 border-zinc-850 text-zinc-100" 
                            : "bg-white border-zinc-200 text-zinc-900"
                        )}
                        rows={2}
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingCommentText('');
                          }}
                          className={cn(
                            "flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded transition-all active:scale-95 border",
                            isDarkMode
                              ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850"
                              : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                          )}
                        >
                          <X className="w-2.5 h-2.5" />
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateComment(comment.id)}
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded transition-all active:scale-95 bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400"
                        >
                          <Check className="w-2.5 h-2.5 text-zinc-950" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={cn(
                      "text-xs leading-relaxed break-words",
                      isDarkMode ? "text-zinc-350" : "text-zinc-650"
                    )}>
                      {comment.content}
                      {comment.updatedAt && (
                        <span className="text-[9px] italic opacity-65 ml-1.5 font-medium">(edited)</span>
                      )}
                    </p>
                  )}

                  {/* Inline comment moderation and deletion tools */}
                  <div className="flex items-center gap-2 mt-1 select-none">
                    {comment.status === 'pending' && (isAdmin || isArticleOwner) && (
                      <>
                        <button 
                          onClick={() => handleApproveComment(comment.id)}
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20 transition-all active:scale-95"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRejectComment(comment.id)}
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-450 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/20 transition-all active:scale-95"
                        >
                          <XCircle className="w-3 h-3 text-rose-500" />
                          Reject
                        </button>
                      </>
                    )}

                    {editingCommentId !== comment.id && (
                      <div className="flex items-center gap-1.5 ml-auto sm:opacity-0 group-hover/comment:opacity-100 transition-opacity">
                        {/* Edit button (owner of comment, or admin) */}
                        {(isAdmin || (currentUserId && comment.userId === currentUserId)) && (
                          <button 
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditingCommentText(comment.content);
                            }}
                            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 px-2 py-0.5 rounded transition-all active:scale-95"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                        )}

                        {/* Delete button (owner of comment, admin, or author of article) */}
                        {(isAdmin || isArticleOwner || (currentUserId && comment.userId === currentUserId)) && (
                          <button 
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-zinc-400 hover:text-rose-450 hover:bg-rose-500/10 px-2 py-0.5 rounded transition-all active:scale-95"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {visibleComments.length === 0 && (
                <p className="text-xs text-center text-zinc-500 py-3 italic">
                  No approved comments yet. Be the first to share your reflections.
                </p>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-zinc-800/10 dark:border-zinc-800/20">
              {/* If player is a guest, let them choose a custom local nickname! */}
              {!user && (
                <div className="flex flex-col gap-1">
                  <label className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isDarkMode ? "text-zinc-500" : "text-zinc-450"
                  )}>
                    Your Nickname (Guest)
                  </label>
                  <input 
                    type="text"
                    required
                    maxLength={30}
                    placeholder="E.g., Belgrade Scholar, Split Seeker..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className={cn(
                      "w-full rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50 border transition-all",
                      isDarkMode ? "bg-zinc-950/40 border-zinc-800 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                    )}
                  />
                </div>
              )}

              {user && (
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest leading-none select-none",
                  isDarkMode ? "text-zinc-500" : "text-zinc-455"
                )}>
                  Commenting as <span className="text-emerald-500">{userProfile?.name || user.displayName || 'Anonymous'}</span>
                </p>
              )}

              <div className="flex gap-2 items-end">
                <textarea 
                  required
                  maxLength={1000}
                  placeholder={user ? "Add a strategic comment..." : "Share a guest reflection..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={2}
                  className={cn(
                    "flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-all resize-none",
                    isDarkMode ? "bg-zinc-950/40 border-zinc-800 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                  )}
                />
                <button 
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className={cn(
                    "bg-emerald-500 text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-emerald-500/10 hover:bg-emerald-400 h-9 flex items-center justify-center shrink-0",
                    (isSubmittingComment || !commentText.trim()) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  ) : (
                    <span>Comment</span>
                  )}
                </button>
              </div>

              {commentSuccessMsg && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-emerald-500 font-bold leading-relaxed"
                >
                  {commentSuccessMsg}
                </motion.p>
              )}
            </form>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-800/10 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          {article.isAI && (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              AI Stoic Insight
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all hover:scale-[1.02]",
            isDarkMode ? "bg-zinc-800/20 border-zinc-700/30 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-650"
          )} title={`${article.reads || 0} Total views`}>
            <Eye className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black tracking-wider uppercase">{article.reads || 0} views</span>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all hover:scale-[1.02]",
            isDarkMode ? "bg-zinc-800/20 border-zinc-700/30 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-650"
          )} title={`${article.shares || 0} Total shares`}>
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] font-black tracking-wider uppercase">{article.shares || 0} shares</span>
          </div>

          <button 
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all duration-300 active:scale-95 hover:scale-[1.05] group/heart",
              isLiked 
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold" 
                : isDarkMode 
                  ? "bg-zinc-800/30 border-zinc-700/50 hover:bg-rose-500/5 hover:text-rose-450 hover:border-rose-500/20 text-zinc-400" 
                  : "bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
            )}
            title={isLiked ? "Unlike Article" : "Like Article"}
          >
            <Heart className={cn("w-3.5 h-3.5 transition-all duration-300", isLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-rose-400 group-hover/heart:scale-110 group-hover/heart:text-rose-500")} />
            <span className="text-[10px] font-black tracking-wider uppercase">
              {article.likes || (article.likedBy || []).length} likes
            </span>
          </button>

          <div className="flex -space-x-1 ml-1 hidden sm:flex">
            {[1,2,3].map(i => (
              <div key={i} className={cn("w-5 h-5 rounded-full border-2", isDarkMode ? "bg-zinc-800 border-zinc-900" : "bg-zinc-100 border-white")} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AppContent() {
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [isQuotaDismissed, setIsQuotaDismissed] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [historySubView, setHistorySubView] = useState<'journal' | 'plans' | 'articles' | 'digest'>('articles');
  const [highlightedArticleId, setHighlightedArticleId] = useState<string | null>(null);

  // Parse deep-link parameters on initial load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      const articleId = params.get('id');
      
      if (view === 'articles') {
        setActiveView('workouts'); // 'workouts' is the Log section containing articles
        setHistorySubView('articles');
        if (articleId) {
          setHighlightedArticleId(articleId);
        }
      }
    } catch (err) {
      console.error('[WiseFit Shared Link] Failed parsing query params:', err);
    }
  }, []);
  const [digestData, setDigestData] = useState<{
    lastUpdated: string;
    news: any[];
    quotes: any[];
  } | null>(null);
  const [isFetchingDigest, setIsFetchingDigest] = useState(false);
  const [digestError, setDigestError] = useState<string | null>(null);
  const [digestTab, setDigestTab] = useState<'quotes' | 'news'>('quotes');

  const fetchSanctuaryDigest = useCallback(async (force = false) => {
    if (digestData && !force) return;
    setIsFetchingDigest(true);
    setDigestError(null);
    try {
      const res = await fetch("/api/sanctuary-digest");
      if (!res.ok) throw new Error("Could not retrieve daily digest.");
      const data = await res.json();
      if (data.success) {
        setDigestData({
          lastUpdated: data.lastUpdated,
          news: data.news || [],
          quotes: data.quotes || []
        });
      } else {
        throw new Error(data.error || "Failed to load sanctuary digest.");
      }
    } catch (err: any) {
      console.error("fetchSanctuaryDigest err:", err);
      setDigestError(err.message || "Failed to load sanctuary digest.");
    } finally {
      setIsFetchingDigest(false);
    }
  }, [digestData]);

  useEffect(() => {
    if (historySubView === 'digest') {
      fetchSanctuaryDigest();
    }
  }, [historySubView, fetchSanctuaryDigest]);

  const [articles, setArticles] = useState<Article[]>([]);

  // Handle smooth scroll and highlight of the shared article when articles load and state matches
  useEffect(() => {
    if (highlightedArticleId && articles.length > 0) {
      // Allow a brief delay for rendering/layout completion
      const timer = setTimeout(() => {
        const element = document.getElementById(`article-${highlightedArticleId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-4', 'scale-[1.01]');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-4', 'scale-[1.01]');
            setHighlightedArticleId(null); // Reset after highlighting
          }, 3500);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [highlightedArticleId, articles]);
  const [expandedQuote, setExpandedQuote] = useState<any | null>(null);
  const [isExpandingQuote, setIsExpandingQuote] = useState(false);
  const [expandedQuoteInterpretation, setExpandedQuoteInterpretation] = useState<string>("");
  const [expansionError, setExpansionError] = useState<string | null>(null);

  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [isUploadingArticleVideo, setIsUploadingArticleVideo] = useState(false);
  const [articleVideoProgress, setArticleVideoProgress] = useState(0);
  
  const [articleThumbnailUrl, setArticleThumbnailUrl] = useState('');
  const [articleExcerpt, setArticleExcerpt] = useState('');
  const [isExtractingThumbnail, setIsExtractingThumbnail] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);
  const [showAndroidInstallGuide, setShowAndroidInstallGuide] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);

    // Initial check for standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsPwaInstalled(true);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error("PWA prompt error:", err);
        setShowAndroidInstallGuide(true);
      }
    } else {
      setShowAndroidInstallGuide(true);
    }
  };

  useEffect(() => {
    let q: any;
    if (!isQuotaExceeded) {
      // Everyone (guests and logged-in seekers) see all published articles in the feed
      q = query(
        collection(db, 'articles'),
        orderBy('date', 'desc'),
        limit(100)
      );
    }
    
    // If quota exceeded, just use empty list or cached list
    if (isQuotaExceeded) {
       const cached = localStorage.getItem('wisefit_articles_backup');
       if (cached) {
         try {
           setArticles(JSON.parse(cached));
         } catch (e) {
           console.error("Failed to parse cached articles:", e);
         }
       }
       return;
    }

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const fetched = snapshot.docs.map((doc: any) => ({ ...doc.data() } as Article));
      setArticles(fetched);
      localStorage.setItem('wisefit_articles_backup', JSON.stringify(fetched));
    }, (error: any) => {
      if (error?.message?.includes('quota')) {
        setIsQuotaExceeded(true);
      }
      console.error("Real-time articles error:", error);
    });

    return () => unsubscribe();
  }, [user, isQuotaExceeded]);

  const handleAddArticle = async () => {
    if (!user || !articleContent.trim() || !articleTitle.trim()) return;

    const wordCount = articleContent.trim().split(/\s+/).filter(Boolean).length;
    const charCount = articleContent.length;

    if (charCount > 30000) {
      alert("Article is too long! (Max 30,000 characters)");
      return;
    }
    if (wordCount > 5000) {
      alert("Article has too many words! (Max 5,000 words)");
      return;
    }
    
    if (editingArticle) {
      // Update existing article
      try {
        const q = query(collection(db, 'articles'), where('id', '==', editingArticle.id));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          await updateDoc(doc(db, 'articles', snapshot.docs[0].id), {
            title: articleTitle,
            content: articleContent,
            url: articleUrl,
            thumbnailUrl: articleThumbnailUrl,
            excerpt: articleExcerpt,
          });
        }
        setArticles(prev => prev.map(a => a.id === editingArticle.id ? { 
          ...a, 
          title: articleTitle, 
          content: articleContent, 
          url: articleUrl,
          thumbnailUrl: articleThumbnailUrl,
          excerpt: articleExcerpt
        } : a));
        setArticleTitle('');
        setArticleContent('');
        setArticleUrl('');
        setArticleThumbnailUrl('');
        setArticleExcerpt('');
        setEditingArticle(null);
      } catch (e) {
        console.error("Error updating article:", e);
      }
    } else {
      // Create new article
      const newArticle: Article = {
        id: `art-${Date.now()}`,
        userId: user.uid,
        title: articleTitle,
        content: articleContent,
        url: articleUrl,
        thumbnailUrl: articleThumbnailUrl,
        excerpt: articleExcerpt,
        date: new Date().toISOString(),
        isAI: false,
        reads: 0,
        shares: 0
      };

      try {
        await addDoc(collection(db, 'articles'), newArticle);
        setArticles(prev => [newArticle, ...prev]);
        setArticleTitle('');
        setArticleContent('');
        setArticleUrl('');
        setArticleThumbnailUrl('');
        setArticleExcerpt('');
        setIsAddingArticle(false);
      } catch (e) {
        console.error("Error adding article:", e);
      }
    }
  };

  const openEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleTitle(article.title);
    setArticleContent(article.content);
    setArticleUrl(article.url || '');
    setArticleThumbnailUrl(article.thumbnailUrl || '');
    setArticleExcerpt(article.excerpt || '');
  };

  const extractThumbnailFromVideoUrl = async (videoUrl: string) => {
    if (!videoUrl) return;
    setIsExtractingThumbnail(true);
    try {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous'; // avoids tainted canvas of external domain
      video.currentTime = 1.0;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => {
          video.play()
            .then(() => {
              video.pause();
              resolve();
            })
            .catch(() => {
              resolve();
            });
        };
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error("Unable to load video stream"));
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);

        try {
          const downloadUrl = await uploadBase64ToStorage(base64, `extracted_thumbnail_${Date.now()}.jpg`, 'thumbnails');
          setArticleThumbnailUrl(downloadUrl);
        } catch (uploadErr) {
          setArticleThumbnailUrl(base64);
        }
      }
    } catch (err: any) {
      console.error("Frame extractor failure:", err);
      alert("Note: External videos may have CORS policies that prevent canvas extraction. Try uploading a custom image directly, or paste a direct, allowed URL.");
    } finally {
      setIsExtractingThumbnail(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const q = query(collection(db, 'articles'), where('id', '==', id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        await deleteDoc(doc(db, 'articles', snapshot.docs[0].id));
      }
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error("Error deleting article:", e);
    }
  };

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(INITIAL_WEEKLY_PLAN);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<DailyStats[]>(MOCK_STATS);
  const [newWeight, setNewWeight] = useState('');
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [libraryTab, setLibraryTab] = useState<'quotes' | 'archive'>('quotes');
  const [quoteCount, setQuoteCount] = useState(0);
  const [isGeneratingQuotes, setIsGeneratingQuotes] = useState(false);
  const [libraryQuotes, setLibraryQuotes] = useState<(Quote & { markedDate?: string })[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [wisdomTradition, setWisdomTradition] = useState<'all' | 'psychology' | 'daily'>('all');
  const [isGeneratingAIQuote, setIsGeneratingAIQuote] = useState(false);
  const [aiCountdown, setAiCountdown] = useState(0);
   const [isSaved, setIsSaved] = useState(false);
  const [isSeedingInsights, setIsSeedingInsights] = useState(false);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);
  const [isActivatingTicket, setIsActivatingTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editComment, setEditComment] = useState('');
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [localCopiedId, setLocalCopiedId] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [newQuote, setNewQuote] = useState<{
    text: string;
    author: string;
    source: string;
    wisdomGrade: string;
    comment: string;
    category: 'wisdom' | 'stoic' | 'jewish' | 'psychology' | 'finance' | 'balkan' | 'chinese' | 'japanese' | 'fitness';
  }>({ 
    text: '', 
    author: '', 
    source: 'Philosophy',
    wisdomGrade: 'A daily reminder',
    comment: 'This quote changed my life',
    category: 'wisdom'
  });
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [dashboardWisdomGrade, setDashboardWisdomGrade] = useState('A daily reminder');
  const [dashboardComment, setDashboardComment] = useState('This quote changed my life');
  const [isYogaSessionActive, setIsYogaSessionActive] = useState(false);
  const [isAutoFlowActive, setIsAutoFlowActive] = useState(false);
  const [isAILoopActive, setIsAILoopActive] = useState(false);
  const [autoFlowTimer, setAutoFlowTimer] = useState(30);
  const [activeSoundscape, setActiveSoundscape] = useState<string | null>(null);
  const [chineseBGM, setChineseBGM] = useState<string | null>(null);
  const [focusTrack, setFocusTrack] = useState('https://www.youtube.com/embed/TBPE_2Z3-Y8?list=RDTBPE_2Z3-Y8');
  const [technoTrack, setTechnoTrack] = useState('https://www.youtube.com/embed/MQKg_O5X1e0?loop=1&playlist=MQKg_O5X1e0');
  const [chineseTrack, setChineseTrack] = useState('https://www.youtube.com/embed/6hv-iZQQ25Q?loop=1&playlist=6hv-iZQQ25Q');
  const [ecuadorTrack, setEcuadorTrack] = useState('https://www.youtube.com/embed/cNfwUnOIihA?list=PL0uIx_Noeipc9A_fJYo5OqxA8_RcE3uQk');
  const [gta4Track, setGta4Track] = useState('https://www.youtube.com/embed/CKOWaWpUVT0?list=RDCKOWaWpUVT0');
  const [tiestoActive, setTiestoActive] = useState(false);
  const [quotesPool, setQuotesPool] = useState<Quote[]>([]);
  const quotesPoolRef = useRef<Quote[]>([]);
  const isRefillingPoolRef = useRef(false);
  const isFetchingQuoteRef = useRef(false);
  const [isRefillingPool, setIsRefillingPool] = useState(false);
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(new Set());
  const [isLibrarySelectMode, setIsLibrarySelectMode] = useState(false);
  const [isConnectingHealth, setIsConnectingHealth] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [stoicReflection, setStoicReflection] = useState<string | null>(null);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);

  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'girly'>(() => {
    try {
      const saved = localStorage.getItem('petar_theme') as 'light' | 'dark' | 'girly' | null;
      return saved || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const isDarkMode = themeMode === 'dark';
  const isGirlyMode = themeMode === 'girly';
  const isLightMode = themeMode === 'light';

  useEffect(() => {
    localStorage.setItem('petar_theme', themeMode);
  }, [themeMode]);

  const setIsDarkMode = (dark: boolean) => {
    setThemeMode(dark ? 'dark' : 'light');
  };
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [psychMessages, setPsychMessages] = useState<ChatMessage[]>([]);
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
  
  useEffect(() => {
    quoteHistoryRef.current = quoteHistory;
  }, [quoteHistory]);

  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) return;
      
      if (event.data?.type === 'FITBIT_AUTH_SUCCESS' && user) {
        const tokens = event.data.tokens;
        const newProfile = {
          ...userProfile,
          integrations: {
            ...userProfile.integrations,
            fitbit: {
              connected: true,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresAt: Date.now() + (tokens.expires_in * 1000),
              userId: tokens.user_id
            }
          }
        };
        setUserProfile(newProfile);
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { integrations: newProfile.integrations });
        
        // Trigger immediate sync
        if (tokens.access_token) {
          syncHealthData(tokens.access_token);
        }
        
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }

      if ((event.data?.type === 'GOOGLE_FIT_AUTH_SUCCESS' || event.data?.type === 'GOOGLE_HEALTH_AUTH_SUCCESS') && user) {
        const tokens = event.data.tokens;
        const newProfile = {
          ...userProfile,
          integrations: {
            ...userProfile.integrations,
            googleFit: {
              connected: true,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresAt: Date.now() + (tokens.expires_in * 1000)
            }
          }
        };
        setUserProfile(newProfile);
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { integrations: newProfile.integrations });
        
        // Trigger immediate sync
        await syncHealthData(tokens.access_token);
        
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [user, userProfile]);

  // Auto-fetch support tickets for Admin Sanctuary
  useEffect(() => {
    if (user && ADMIN_EMAILS.includes(user.email || '')) {
      fetchSupportTickets();
    }
  }, [user]);

  // Sync Health Data on Load
  useEffect(() => {
    const googleFit = userProfile.integrations?.googleFit;
    if (googleFit?.connected && googleFit?.accessToken) {
      // Check if token is expired (simple check)
      const now = Date.now();
      if (googleFit.expiresAt && now < googleFit.expiresAt) {
        syncHealthData(googleFit.accessToken);
      }
    }
  }, [userProfile.integrations?.googleFit?.connected]);

  const seedPsychologyInsights = async () => {
    if (!user || !ADMIN_EMAILS.includes(user.email || '') || isQuotaExceeded) return;
    setIsSeedingInsights(true);
    try {
      const insightsRef = collection(db, 'psychology_insights');
      const batch = writeBatch(db);
      
      // Use the local PSYCHOLOGY_QUOTES as the seed source
      for (const quote of PSYCHOLOGY_QUOTES) {
        const docRef = doc(insightsRef, quote.id || `psy-${Math.random().toString(36).substr(2, 9)}`);
        const { id, ...quoteData } = quote;
        batch.set(docRef, {
          ...quoteData,
          randomId: Math.random() // Ensure fresh random IDs for better distribution
        });
      }
      
      await batch.commit();
      alert('100 Psychology Insights seeded to Firestore successfully!');
    } catch (error: any) {
      console.error('Error seeding insights:', error);
      if (error?.message?.includes('quota') || error?.code === 'resource-exhausted') {
        setIsQuotaExceeded(true);
      }
      const isPermission = error?.message?.toLowerCase().includes('permission') || error?.code === 'permission-denied';
      alert(isPermission 
        ? 'Permission Denied: Only authorized keepers can seed systemic insights.' 
        : `Failed to seed insights: ${error.message || 'Unknown error'}`
      );
    } finally {
      setIsSeedingInsights(false);
    }
  };

  const fetchSupportTickets = async () => {
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) return;
    setIsFetchingTickets(true);
    try {
      const ticketsRef = collection(db, 'support_tickets');
      const q = query(ticketsRef, where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const tickets: any[] = [];
      querySnapshot.forEach((docSnap) => {
        tickets.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort manually to bypass index requirement
      tickets.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dbVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dbVal - da;
      });
      setSupportTickets(tickets);
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);
    } finally {
      setIsFetchingTickets(false);
    }
  };

  const handleActivateTicket = async (ticket: any) => {
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) return;
    setIsActivatingTicket(ticket.id);
    try {
      // 1. Mark ticket as resolved
      await setDoc(doc(db, 'support_tickets', ticket.id), {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        resolvedBy: user.email
      }, { merge: true });

      // 2. Pre-authorize this email lowercased so they are unlocked instantly on any device login
      const cleanEmail = ticket.appEmail.trim().toLowerCase();
      await setDoc(doc(db, 'pre_authorized_emails', cleanEmail), {
        active: true,
        tier: ticket.tier || 'monthly',
        activatedAt: new Date().toISOString(),
        activatedBy: user.email,
        paypalEmail: ticket.paypalEmail.trim().toLowerCase()
      });

      // 3. Search and update user record in users collection if already exists
      const usersQuery = query(collection(db, 'users'), where('email', '==', ticket.appEmail.trim()));
      const userSnapshot = await getDocs(usersQuery);
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await setDoc(doc(db, 'users', userDoc.id), {
          isSubscribed: true,
          subscriptionType: ticket.tier || 'monthly'
        }, { merge: true });
        
        // If the current logged-in user is the one being activated, update their local state immediately
        if (user.email?.toLowerCase() === cleanEmail) {
          setUserProfile(prev => ({ ...prev, isSubscribed: true, subscriptionType: ticket.tier || 'monthly' }));
        }
      }

      alert(`Successfully activated WiseFit Plus subscription for: ${ticket.appEmail}`);
      fetchSupportTickets();
    } catch (err: any) {
      console.error("Activation error:", err);
      alert(`Activation error: ${err.message || err}`);
    } finally {
      setIsActivatingTicket(null);
    }
  };

  const syncHealthData = async (accessToken: string) => {
    try {
      const response = await fetch('/api/health/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          types: ['steps', 'weight', 'calories']
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Fetch weekly trend data
      const weeklyResponse = await fetch('/api/health/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      const weeklyData = await weeklyResponse.json();
      
      const recordsResponse = await fetch('/api/health/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      const recordsData = await recordsResponse.json();

      // Update local metrics with synced data
      const updatedProfile: UserProfile = {
        ...userProfile,
        currentSteps: data.steps || userProfile.currentSteps,
        currentCalories: data.calories || userProfile.currentCalories,
        currentDistance: data.distance || userProfile.currentDistance,
        currentRHR: data.rhr || userProfile.currentRHR,
        currentHRV: data.hrv || userProfile.currentHRV,
        currentWeight: data.weight || userProfile.currentWeight,
        weeklyHealthData: weeklyData,
        personalRecords: recordsData,
        integrations: {
          ...userProfile.integrations,
          googleFit: {
            ...userProfile.integrations?.googleFit,
            connected: true,
            lastSync: new Date().toISOString()
          }
        }
      };
      
      setUserProfile(updatedProfile);
      
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { 
          currentSteps: updatedProfile.currentSteps,
          currentCalories: updatedProfile.currentCalories,
          currentDistance: updatedProfile.currentDistance,
          currentRHR: updatedProfile.currentRHR,
          currentHRV: updatedProfile.currentHRV,
          currentWeight: updatedProfile.currentWeight,
          weeklyHealthData: updatedProfile.weeklyHealthData,
          personalRecords: updatedProfile.personalRecords,
          integrations: updatedProfile.integrations
        });
      }
      
      setSavedMessage('Health Synced');
      setTimeout(() => setSavedMessage(null), 3000);

      // Generate Stoic Reflection
      setIsGeneratingReflection(true);
      try {
        const reflection = await generateStoicReflection({
          steps: updatedProfile.currentSteps || 0,
          weight: updatedProfile.currentWeight || 89,
          calories: updatedProfile.currentCalories || 0,
          userName: userProfile.name
        }, user?.email || null);
        setStoicReflection(reflection);
      } catch (err) {
        console.error("Reflection error:", err);
      } finally {
        setIsGeneratingReflection(false);
      }
    } catch (e) {
      console.error('Health sync error:', e);
    }
  };

  const connectGoogleFit = async () => {
    setIsConnectingHealth('google-health');
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      window.open(url, 'google_health_oauth', 'width=600,height=700');
    } catch (e) {
      console.error('Google Fitness connect error:', e);
    } finally {
      setIsConnectingHealth(null);
    }
  };

  // AI AUTHORIZATION
  const isAuthorized = user && user.email && AUTHORIZED_EMAILS.includes(user.email.toLowerCase());
  const isPremiumUser = (userProfile?.isSubscribed === true) || isAuthorized;

  // Audio State
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isHomeSpeechPlaying, setIsHomeSpeechPlaying] = useState(false);
  const activeUtterances = useRef<SpeechSynthesisUtterance[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleSpeak = useCallback(async (text: string, quoteId: string) => {
    if (!isPremiumUser) {
      console.warn("Regional high-signal Slavic/Croatian TTS is restricted to WiseFit Plus Premium subscribers.");
      return;
    }
    if (isSpeaking === quoteId) {
      try {
        currentSourceRef.current?.stop();
      } catch (e) {}
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          activeUtterances.current = [];
        } catch (e) {}
      }
      setIsSpeaking(null);
      return;
    }

    setIsSpeaking(quoteId);
    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userEmail: user?.email })
      });

      if (!response.ok) throw new Error("TTS Request failed");
      const { audio: base64Audio } = await response.json();

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
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
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
      } else {
        throw new Error("No base64 audio returned");
      }
    } catch (error: any) {
      console.warn('Backend TTS failed, falling back to Web Speech API:', error);
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const cleanText = text.replace(/[*_#`\[\]()]/g, ''); // strip markdown chars for clean voice reading
          const utterance = new SpeechSynthesisUtterance(cleanText);
          
          // Store in activeUtterances ref to prevent Chrome garbage-collecting the utterance mid-speech
          activeUtterances.current = [utterance];
          
          const voices = window.speechSynthesis.getVoices();
          // Find Croatian or Slavic if possible, otherwise default high-quality English
          const regionalVoice = voices.find(v => v.lang.startsWith('hr') || v.lang.startsWith('sr') || v.lang.startsWith('bs') || v.lang.startsWith('sh'));
          if (regionalVoice) {
            utterance.voice = regionalVoice;
          } else {
            const defaultVoice = voices.find(v => v.lang.startsWith('en') && v.localService) || voices[0];
            if (defaultVoice) utterance.voice = defaultVoice;
          }
          
          utterance.rate = 0.92; // Wise, firm, measured tempo
          utterance.pitch = 0.95;
          
          utterance.onend = () => {
            setIsSpeaking(null);
            activeUtterances.current = [];
          };
          utterance.onerror = () => {
            setIsSpeaking(null);
            activeUtterances.current = [];
          };
          
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(null);
        }
      } catch (innerErr) {
        console.error('All TTS paths failed:', innerErr);
        setIsSpeaking(null);
      }
    }
  }, [isSpeaking, isPremiumUser, user]);

  const fetchAIQuote = useCallback(async (history: Quote[] = []): Promise<Quote | null> => {
    if (!isPremiumUser) {
      console.warn('AI functionality is restricted to authorized seekers/subscribers.');
      return null;
    }
    setIsGeneratingAIQuote(true);
    setAiCountdown(12);
    
    // Start countdown
    const timer = setInterval(() => {
      setAiCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    try {
      // Pass the last 30 quotes to ensure variety
      const recentTexts = history.slice(-30).map(q => q.text.substring(0, 100)).join(' | ');
      
      const traditionPrompt = wisdomTradition === 'psychology' 
        ? 'Generate a unique, powerful psychology insight or quote based on modern or classic psychological theory. It should be profound and actionable.'
        : 'Generate a unique, powerful wise quote.';

      const response = await fetch('/api/ai/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traditionPrompt, recentTexts, userEmail: user?.email })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Quote Request failed");
      
      if (data.text && data.author) {
        return {
          id: `ai-${Date.now()}`,
          text: data.text,
          author: data.author,
          source: data.source || (wisdomTradition === 'psychology' ? 'Psychology Advisor' : 'AI Wisdom'),
          category: data.category || (wisdomTradition === 'psychology' ? 'psychology' : 'wisdom'),
          shortExplanation: data.shortExplanation,
          stoicParallel: data.stoicParallel,
          jewishParallel: data.jewishParallel,
          randomId: Math.random(),
          isAI: true
        };
      }
      return null;
    } catch (e) {
      console.error('AI Quote Generation failed:', e);
      return null;
    } finally {
      clearInterval(timer);
      setIsGeneratingAIQuote(false);
      setAiCountdown(0);
    }
  }, [wisdomTradition, isPremiumUser, user]);

  const refillQuotesPool = useCallback(async (force = false): Promise<Quote[]> => {
    // GUEST PROTECTION: Guests never refill from database to save quota
    if (isRefillingPoolRef.current || isQuotaExceeded) return [];
    
    // For psychology mode, we always want to refill if pool is small, but we use a different collection
    let collectionPath = wisdomTradition === 'psychology' ? 'psychology_insights' : 'quotes';
    if (wisdomTradition === 'daily') collectionPath = 'daily_quotes_cache';
    
    if (!force && quotesPoolRef.current.length > (wisdomTradition === 'psychology' ? 20 : (wisdomTradition === 'daily' ? 10 : 50))) {
       // If psychology and no pool, return local fallback immediately
       if (wisdomTradition === 'psychology' && quotesPoolRef.current.length === 0) {
         return PSYCHOLOGY_QUOTES;
       }
       return [];
    }
    
    isRefillingPoolRef.current = true;
    setIsRefillingPool(true);

    const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

    try {
      // 1. ATTEMPT SERVER-SIDE MEMORY CACHE (Zero Quota Cost)
      if (wisdomTradition !== 'daily') {
        const cacheRes = await fetch('/api/wisdom/global');
        const cacheData = await cacheRes.json();
        if (cacheData.data && cacheData.data.length > 5 && !force) {
          console.log('[WiseFit Cache] Using server-side wisdom memory.');
          setQuotesPool(cacheData.data);
          quotesPoolRef.current = cacheData.data;
          return cacheData.data;
        }
      }

      // GUEST PROTECTION: Special case for daily quotes
      if (wisdomTradition === 'daily') {
        const response = await fetch('/api/daily-quotes');
        const quotes = await response.json();
        // Filter out any nulls or invalid quotes from the scraper
        const validQuotes = Array.isArray(quotes) ? quotes.filter(q => q && q.text) : [];
        
        if (validQuotes.length > 0) {
          setQuotesPool(validQuotes);
          quotesPoolRef.current = validQuotes;
          // Only save to Firebase if logged in AND it's a new day
          if (user && !isQuotaExceeded) {
             const todayStr = format(new Date(), 'yyyy-MM-dd');
             const dailyRef = collection(db, 'daily_quotes_cache');
             const qDaily = query(dailyRef, where('fetchDate', '==', todayStr));
             const snapshotDaily = await getDocs(qDaily);
             if (snapshotDaily.empty) {
               const batch = writeBatch(db);
               quotes.slice(0, 20).forEach((q: any) => { // Limit save to first 20 for quota
                 const newDoc = doc(dailyRef);
                 batch.set(newDoc, { ...q, fetchDate: todayStr, createdAt: serverTimestamp() });
               });
               await batch.commit();
             }
          }
          return quotes;
        }
      }

      if (!user || isQuotaExceeded) return []; // Now check user for other traditions


      const quotesRef = collection(db, collectionPath);
      const randomStart = Math.random();
      
      let q = query(
        quotesRef, 
        where('randomId', '>=', randomStart), 
        orderBy('randomId'),
        limit(wisdomTradition === 'psychology' ? 100 : 200)
      );
      
      let snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        q = query(
          quotesRef, 
          where('randomId', '<=', randomStart), 
          orderBy('randomId', 'desc'),
          limit(wisdomTradition === 'psychology' ? 100 : 200)
        );
        snapshot = await getDocs(q);
      }
      
      const newQuotes = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...(data as any) } as Quote;
      });
      
      // If collection is empty and it's psychology mode, we'll rely on local fallback
      if (newQuotes.length === 0 && wisdomTradition === 'psychology') {
        const shuffledLocal = [...PSYCHOLOGY_QUOTES].sort(() => Math.random() - 0.5);
        setQuotesPool(shuffledLocal);
        return shuffledLocal;
      }
      
      // Shuffle the new quotes locally
      const shuffled = [...newQuotes].sort(() => Math.random() - 0.5);
      
      // 3. SEED THE SERVER CACHE (Only Admin does this to save multi-writes)
      if (isAdmin && shuffled.length > 10 && wisdomTradition === 'all') {
        fetch('/api/wisdom/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quotes: shuffled })
        }).catch(e => console.warn('Cache sync failed', e));
      }
      
      setQuotesPool(prev => {
        const existingIds = new Set(prev.map(q => q.id));
        const filtered = shuffled.filter(q => !existingIds.has(q.id));
        return [...prev, ...filtered];
      });
      
      return shuffled;
    } catch (error: any) {
      console.error('Error refilling quotes pool:', error);
      if (error?.message?.includes('quota')) {
        setIsQuotaExceeded(true);
      }
      if (wisdomTradition === 'psychology') {
        const shuffledLocal = [...PSYCHOLOGY_QUOTES].sort(() => Math.random() - 0.5);
        setQuotesPool(shuffledLocal);
        return shuffledLocal;
      }
      return [];
    } finally {
      isRefillingPoolRef.current = false;
      setIsRefillingPool(false);
    }
  }, [user, isQuotaExceeded, wisdomTradition]);
   const fetchRandomQuote = useCallback(async (excludeIds: string[] = [], forceAI: boolean = false, overrideFilter?: string) => {
    // CANCEL ANY ONGOING SPEECH IMMEDIATELY
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (isFetchingQuoteRef.current) return;
    isFetchingQuoteRef.current = true;

    const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

    const useLocalFallback = () => {
      let sourceQuotes = INITIAL_QUOTES;
      if (wisdomTradition === 'psychology') {
        sourceQuotes = PSYCHOLOGY_QUOTES;
      } else if (wisdomTradition === 'daily') {
        const historyIds = quoteHistoryRef.current.map(q => q.id).filter(Boolean) as string[];
        const filteredDaily = quotesPoolRef.current.filter(q => !historyIds.includes(q.id));
        
        if (filteredDaily.length > 0) {
          sourceQuotes = filteredDaily;
        } else if (quotesPoolRef.current.length > 0) {
          sourceQuotes = quotesPoolRef.current;
        } else {
          // Dedicated fallback for daily if scraping failed or is in progress
          sourceQuotes = [
            { 
              text: "The web is still weaving today's wisdom. Check back in a moment.", 
              author: "Daily Digest", 
              source: "System", 
              category: "daily",
              shortExplanation: "Scraping fresh quotes can take a few seconds on first load."
            } as Quote
          ];
        }
      }
      
      const randomIndex = Math.floor(Math.random() * sourceQuotes.length);
      const fallbackQuote = {
        ...sourceQuotes[randomIndex],
        id: `local-${wisdomTradition}-${Date.now()}-${randomIndex}`,
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
      // 1. QUOTA SAVER: 
      // - Guests always use local fallback
      // - Members use local fallback during danger hours
      // - Admins are unrestricted but respect isQuotaExceeded
      const now = new Date();
      const dublinHour = (now.getUTCHours() + 1) % 24;
      const isDangerHours = dublinHour >= 22 || dublinHour < 8;

      // EXEMPTION: Daily quotes are allowed for guests and during danger hours as they are light-weight
      const isDailyExempt = wisdomTradition === 'daily';

      if ((!user || isQuotaExceeded || (isDangerHours && !forceAI && !isAdmin)) && !isDailyExempt) {
        console.log('Using local quotes (Quota Saver).');
        useLocalFallback();
        isFetchingQuoteRef.current = false;
        return;
      }


      let selectedQuote: Quote | null = null;

      // 2. Try AI first if forced
      if (forceAI) {
        selectedQuote = await fetchAIQuote(quoteHistoryRef.current);
        if (!selectedQuote) {
          isFetchingQuoteRef.current = false;
          return null;
        }
      }

      // 2. Try from Pool (Local Cache) - This is the primary optimization
      if (!selectedQuote && !forceAI && quotesPoolRef.current.length > 0) {
        const markedIds = (userProfile.markedQuotes || []).map(q => q.id);
        const seenIds = userProfile.seenQuoteIds || [];
        const historyIds = quoteHistoryRef.current.map(q => q.id).filter(Boolean) as string[];
        
        // Combine all exclusions
        const excludeSet = new Set([...excludeIds, ...markedIds, ...historyIds]);
        if (wisdomTradition !== 'psychology' && wisdomTradition !== 'daily') {
          // Only exclude "seen" quotes for non-daily/psychology traditions to allow fresh loops
          seenIds.forEach(id => excludeSet.add(id));
        }
        
        // Find first quote in pool not in excluded
        const poolIndex = quotesPoolRef.current.findIndex(q => !excludeSet.has(q.id || ''));
        
        if (poolIndex !== -1) {
          selectedQuote = quotesPoolRef.current[poolIndex];
          const quoteToPick = selectedQuote;
          setQuotesPool(prev => prev.filter(q => q.id !== quoteToPick.id));
          
          if (quotesPoolRef.current.length < 20) {
            refillQuotesPool(false);
          }
        }
      }

      // 3. Fallback to direct Firestore fetch
      if (!selectedQuote) {
        const freshQuotes = await refillQuotesPool(true);
        if (freshQuotes.length > 0) {
          const markedIds = (userProfile.markedQuotes || []).map(q => q.id);
          const seenIds = userProfile.seenQuoteIds || [];
          const historyIds = quoteHistoryRef.current.map(q => q.id).filter(Boolean) as string[];
          const excludeSetDirect = new Set([...excludeIds, ...markedIds, ...historyIds]);
          if (wisdomTradition !== 'psychology' && wisdomTradition !== 'daily') {
            seenIds.forEach(id => excludeSetDirect.add(id));
          }
          
          selectedQuote = freshQuotes.find(q => !excludeSetDirect.has(q.id || '')) || freshQuotes[0];
        }
      }

      // 4. Absolute Fallback
      if (!selectedQuote) {
        useLocalFallback();
        isFetchingQuoteRef.current = false;
        return;
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
          handleSpeak(selectedQuote.text, selectedQuote.id || 'current');
        }
      } else {
        // FINAL FALLBACK: Use local data if everything else fails (Quota exceeded)
        const localQuotes = wisdomTradition === 'psychology' ? PSYCHOLOGY_QUOTES : INITIAL_QUOTES;
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
          if (forceAI) handleSpeak(aiQuote.text, aiQuote.id || 'ai-fallback');
        } else {
          throw new Error('AI Fallback failed');
        }
      } catch (aiError) {
        const sourceQuotes = wisdomTradition === 'psychology' ? PSYCHOLOGY_QUOTES : INITIAL_QUOTES;
        const randomIndex = Math.floor(Math.random() * sourceQuotes.length);
        const fallbackQuote = {
          ...sourceQuotes[randomIndex],
          id: `local-err-${Date.now()}`,
          randomId: Math.random()
        } as Quote;
        setCurrentQuote(fallbackQuote);
        setQuoteHistory(prev => [...prev, fallbackQuote].slice(-50));
        setHistoryIndex(prev => Math.min(prev + 1, 49));
      }
    } finally {
      isFetchingQuoteRef.current = false;
    }
  }, [historyIndex, refillQuotesPool, userProfile.markedQuotes, userProfile.seenQuoteIds, handleSpeak, fetchAIQuote, wisdomTradition]);

  useEffect(() => {
    // Stop any existing speech before switching traditions
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Clear pool when switching traditions to ensure fresh pool for the new category
    setQuotesPool([]);
    quotesPoolRef.current = [];
    
    // Also clear history to prevent category mixing in the UI and potential loop issues
    setQuoteHistory([]);
    setHistoryIndex(-1);

    // Set a temporary loading quote so user doesn't see old tradition data
    setCurrentQuote({
      text: "Loading fresh wisdom...",
      author: "WiseFit",
      source: "System",
      category: "daily",
      randomId: 0
    });
    
    // Fetch a new quote whenever tradition changes to ensure user sees the fresh category immediately
    fetchRandomQuote([], false);
  }, [wisdomTradition]);

  const goToNextQuote = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isAutoFlowActive) {
      setAutoFlowTimer(30);
    }
    if (isAILoopActive && wisdomTradition !== 'psychology') {
      fetchRandomQuote([], true); // Force AI generation in loop
    } else if (historyIndex < quoteHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCurrentQuote(quoteHistory[nextIndex]);
    } else {
      fetchRandomQuote([], false); // Pull from database by default
    }
  }, [isAutoFlowActive, isAILoopActive, historyIndex, quoteHistory, fetchRandomQuote, wisdomTradition]);

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
    
    const synth = window.speechSynthesis;
    synth.cancel();
    activeUtterances.current = [];

    // Check if it's a Balkan proverb which usually follows "Croatian — English" format
    const isBalkan = quote.source === 'Balkan';
    const parts = quote.text.split(/[—–-]/); // Split by various dash types
    
    const chunks: { text: string; lang: string }[] = [];

    if (isBalkan && parts.length > 1) {
      chunks.push({ text: parts[0].trim(), lang: 'hr-HR' });
      chunks.push({ text: parts[1].trim(), lang: 'en-US' });
      chunks.push({ text: `By ${quote.author}`, lang: 'en-US' });
    } else {
      const hasCroatianChars = /[čćžšđČĆŽŠĐ]/.test(quote.text);
      const mainLang = hasCroatianChars ? 'hr-HR' : 'en-US';
      
      let speechText = `${quote.text}. By ${quote.author}.`;
      
      if (quote.category === 'psychology') {
        if (quote.shortExplanation) {
          speechText += ` Psychology Insight: ${quote.shortExplanation}.`;
        }
        if (quote.stoicParallel) {
          speechText += ` Stoic Parallel: ${quote.stoicParallel.replace(/—.*$/, '')}.`;
        }
        if (quote.jewishParallel) {
          speechText += ` Jewish Parallel: ${quote.jewishParallel.replace(/—.*$/, '')}.`;
        }
      }
      
      chunks.push({ text: speechText, lang: mainLang });
    }

    if (chunks.length === 0) return;

    setIsHomeSpeechPlaying(true);

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk.text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.lang = chunk.lang;

      const voices = synth.getVoices();
      const voice = voices.find(v => v.lang.startsWith(chunk.lang)) || 
                    (chunk.lang.startsWith('en') ? voices.find(v => v.lang.startsWith('en-')) : null);
      if (voice) utterance.voice = voice;

      // Keep reference of utterance object to bypass browser garbage collection bug
      activeUtterances.current.push(utterance);

      if (index === chunks.length - 1) {
        utterance.onend = () => {
          setIsHomeSpeechPlaying(false);
          activeUtterances.current = [];
        };
        utterance.onerror = (e) => {
          console.error("Home TTS ended with error or was stopped:", e);
          setIsHomeSpeechPlaying(false);
          activeUtterances.current = [];
        };
      }

      synth.speak(utterance);
    });
  }, []);

  const toggleSpeakQuote = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (isHomeSpeechPlaying) {
      window.speechSynthesis.cancel();
      setIsHomeSpeechPlaying(false);
      activeUtterances.current = [];
    } else if (currentQuote) {
      speakQuote(currentQuote);
    }
  }, [currentQuote, isHomeSpeechPlaying, speakQuote]);

  useEffect(() => {
    if (isAutoFlowActive && currentQuote) {
      speakQuote(currentQuote);
    }
  }, [currentQuote, isAutoFlowActive, speakQuote]);

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
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const generateAIQuote = (e?: React.MouseEvent) => {
    if (checkGuestAction()) return;
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
    if (checkGuestAction() || isQuotaExceeded) {
      if (isQuotaExceeded) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
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
    if (!isAuthReady) return;

    const seedQuotes = async () => {
      // ONLY ADMIN can run seeding logic to prevent thousands of redundant writes/reads
      if (!user || !ADMIN_EMAILS.includes(user.email || '')) return;
      
      try {
        // Use a metadata document to track seeding version and save massive reads
        const seedStatusRef = doc(db, 'system_metadata', 'seeding_status');
        const seedStatusDoc = await getDoc(seedStatusRef);
        const seededVersion = seedStatusDoc.exists() ? seedStatusDoc.data().version : 0;
        const CURRENT_VERSION = 9;

        if (seededVersion >= CURRENT_VERSION) {
          return;
        }

        console.log('Verifying quote ecosystem...');
        
        // 1. Seed Main Quotes
        const quotesRef = collection(db, 'quotes');
        const snapshot = await getDocs(query(quotesRef, limit(1)));
        
        if (snapshot.empty) {
          console.log('Seeding initial quotes...');
          for (const q of INITIAL_QUOTES) {
            await addDoc(quotesRef, { ...q, randomId: Math.random() });
          }
        }

        // 2. Seed Psychology Insights (Clean Purge and Re-seed for v8)
        const psychRef = collection(db, 'psychology_insights');
        if (seededVersion < 8) {
          console.log('Upgrading psychology insights to v8 (Psychologists only)...');
          const oldPsychDocs = await getDocs(psychRef);
          // Delete old docs to ensure fresh start with only psychologists
          for (const docSnap of oldPsychDocs.docs) {
            await deleteDoc(doc(db, 'psychology_insights', docSnap.id));
          }

          console.log('Re-seeding psychology insights...');
          if (Array.isArray(PSYCHOLOGY_QUOTES) && PSYCHOLOGY_QUOTES.length > 0) {
            const batchSize = 20;
            for (let i = 0; i < PSYCHOLOGY_QUOTES.length; i += batchSize) {
              const batch = PSYCHOLOGY_QUOTES.slice(i, i + batchSize);
              await Promise.all(batch.map(q => 
                addDoc(psychRef, { 
                  ...q, 
                  category: 'psychology',
                  randomId: Math.random(),
                  createdAt: serverTimestamp()
                })
              ));
              console.log(`Seeded psychology insights ${i + batch.length}/${PSYCHOLOGY_QUOTES.length}`);
            }
          }
        }

        // 3. Seed Custom User-Requested Quotes (v9)
        if (seededVersion < 9) {
          console.log('Upgrading quotes to v9 (Adding specialized user-requested quotes)...');
          const quotesRef = collection(db, 'quotes');
          const newSpecialQuotes = INITIAL_QUOTES.slice(-53);
          for (const q of newSpecialQuotes) {
            const qQuery = query(quotesRef, where("text", "==", q.text));
            const existing = await getDocs(qQuery);
            if (existing.empty) {
              await addDoc(quotesRef, { ...q, randomId: Math.random() });
            }
          }
          console.log('Seeded new user-requested quotes to firestore.');
        }
        
        // Update version to prevent re-running this logic
        await setDoc(seedStatusRef, { version: CURRENT_VERSION, updatedAt: new Date().toISOString() });
      } catch (error: any) {
        const isPermissionError = 
          error?.code === 'permission-denied' || 
          error?.message?.toLowerCase().includes('permission') ||
          error?.message?.toLowerCase().includes('insufficient');

        if (isPermissionError) {
          console.log('Membership check: Standard seeker (seed logic skipped)');
        } else {
          console.error('Seeding error:', error);
          if (error?.message?.includes('quota')) {
            setIsQuotaExceeded(true);
          }
        }
      }
    };

    const fetchCount = async () => {
      // GUEST PROTECTION: No need for precise count for guests
      if (!user) return;
      
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
    if (isGeneratingQuotes) return;
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      alert("AI Generation is restricted to Admin only during development.");
      return;
    }
    setIsGeneratingQuotes(true);
    try {
      const resp = await fetch('/api/ai/admin/generate-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'standard' })
      });
      
      if (!resp.ok) throw new Error("Admin Quote Generation failed");
      const newQuotes = await resp.json();
      
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
    if (isGeneratingQuotes) return;
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      alert("AI Generation is restricted to Admin only during development.");
      return;
    }
    setIsGeneratingQuotes(true);
    try {
      const resp = await fetch('/api/ai/admin/generate-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'latin' })
      });
      
      if (!resp.ok) throw new Error("Admin Latin Generation failed");
      const newQuotes = await resp.json();
      
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
    if (checkGuestAction()) return;
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
    if (checkGuestAction()) return;
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
    if (checkGuestAction()) return;
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
    setNewWorkout(prev => ({
      ...prev,
      attachments: [
        ...(prev.attachments || []),
        { id: Math.random().toString(36).substr(2, 9), type, name, url, fileType }
      ]
    }));
  };

  const handleSaveWorkout = async () => {
    if (checkGuestAction()) return;
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

  const handleUpgradeSuccess = async (type: 'monthly' | 'lifetime') => {
    const updated: UserProfile = {
      ...userProfile,
      isSubscribed: true,
      subscriptionType: type
    };
    
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
        console.log('Subscription successfully written to Firestore.');
      } catch (err: any) {
        console.error('Failed to write subscription to Firestore:', err);
        handleFirestoreError(err, 'write', `users/${user.uid}`);
      }
    } else {
      localStorage.setItem('guest_subscription', JSON.stringify({ isSubscribed: true, subscriptionType: type }));
    }
    setUserProfile(updated);
  };

  // Process Stripe Checkout Success redirects automatically
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const stripeStatus = params.get('stripe_checkout') || params.get('payment_status');
      const sessionId = params.get('session_id');
      const plan = (params.get('plan') || 'monthly') as 'monthly' | 'lifetime';
      
      if (stripeStatus === 'success' || sessionId) {
        console.log('[WiseFit Billing] Customer redirected from Stripe checkout successfully.');
        handleUpgradeSuccess(plan).then(() => {
          console.log('[WiseFit Billing] Premium subscription status successfully written to Firestore.');
        });
        
        // Clear query parameters from address bar to keep a clean aesthetic 
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', newUrl);
      }
    } catch (err) {
      console.error('[WiseFit Billing] Failed to process URL query parameters:', err);
    }
  }, [user]);

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
    if (checkGuestAction()) return;
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
    if (checkGuestAction()) return;
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

  const [psychInput, setPsychInput] = useState('');
  const [isPsychLoading, setIsPsychLoading] = useState(false);
  const psychEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    psychEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [psychMessages, isPsychLoading]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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
        }
      } catch (err: any) {
        handleFirestoreError(err, 'init', 'auth');
      } finally {
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Global presence keeper: Updates isOnline to true and regularly updates lastActive timestamp
  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'public_profiles', user.uid);

    const setPresence = async (status: boolean) => {
      try {
        const snap = await getDoc(profileRef);
        // Only update if public profile already registered
        if (snap.exists()) {
          await updateDoc(profileRef, {
            isOnline: status,
            lastActive: new Date().toISOString()
          });
        }
      } catch (err) {
        // Safe fail-silent if rules or network transient
        console.warn('Global presence update skipped:', err);
      }
    };

    // Begin session-online status
    setPresence(true);

    // Maintain session check interval
    const presenceInterval = setInterval(() => {
      setPresence(true);
    }, 40000);

    const handleBeforeUnload = () => {
      setPresence(false);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(presenceInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setPresence(false);
    };
  }, [user]);

  const fetchLibraryQuotes = useCallback(async () => {
    if (!user || isQuotaExceeded) {
      // GUEST PROTECTION / QUOTA PROTECTION: Show a curated selection of local quotes to save quota
      const sampleQuotes = INITIAL_QUOTES.slice(0, 12).map((q, idx) => ({ 
        ...q, 
        id: `sample-${idx}`,
        markedDate: new Date(Date.now() - idx * 86400000).toISOString(),
        wisdomGrade: 'A daily reminder',
        comment: isQuotaExceeded ? 'Daily Firestore quota reached. Showing cached wisdom.' : 'Explore WiseFit to save your own wisdom.'
      }));
      setLibraryQuotes(sampleQuotes as any);
      return;
    }
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
        randomId: doc.data().randomId || 0,
        isCustom: true,
        markedDate: doc.data().date || new Date().toISOString()
      } as any));
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
      localStorage.setItem('wisefit_library_backup', JSON.stringify(combined));
    } catch (error: any) {
      console.error('Error fetching library quotes:', error);
      if (error?.message?.includes('quota')) {
        setIsQuotaExceeded(true);
      }
      const cached = localStorage.getItem('wisefit_library_backup');
      if (cached) {
        try {
          setLibraryQuotes(JSON.parse(cached));
        } catch (e) {
          console.error("Failed to parse cached library quotes:", e);
        }
      }
    } finally {
      setIsLibraryLoading(false);
    }
  }, [user, userProfile.markedQuotes, isQuotaExceeded]);

  useEffect(() => {
    if (activeView === 'library') {
      fetchLibraryQuotes();
    }
  }, [activeView, fetchLibraryQuotes]);

  const checkGuestAction = () => {
    if (!user) {
      alert("This is a preview. Sign in to save your personal logs and wisdom database to the cloud.");
      return true;
    }
    return false;
  };

  const handleUpdateWisdomData = async (quoteId: string, isCustom: boolean) => {
    if (checkGuestAction()) return;
    
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
    if (checkGuestAction()) return;
    if (!newQuote.text.trim()) return;
    
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
        comment: 'This quote changed my life',
        category: 'wisdom'
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
    
    // Auto-register public profile during login to ensure instant dashboard visibility across all seekers
    const publicProfileRef = doc(db, 'public_profiles', firebaseUser.uid);
    let profileName = firebaseUser.displayName || 'Seeker';
    let profileAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

    const isAdminEmail = firebaseUser.email && [
      'petar.dekanovic@gmail.com',
      'esmeraldadarkomanila@gmail.com',
      'stjepan.dekanovic@gmail.com'
    ].includes(firebaseUser.email.toLowerCase());

    const preAuthRef = doc(db, 'pre_authorized_emails', firebaseUser.email?.toLowerCase() || 'none');
    let isPreAuthorized = false;
    let preAuthTier = 'monthly';
    
    // Check if user is inside AUTHORIZED_EMAILS list
    const isAuthorizedEmail = firebaseUser.email && AUTHORIZED_EMAILS.includes(firebaseUser.email.toLowerCase());
    if (isAuthorizedEmail) {
      isPreAuthorized = true;
      preAuthTier = 'lifetime';
    } else {
      try {
        const preAuthSnap = await getDoc(preAuthRef);
        if (preAuthSnap.exists() && preAuthSnap.data()?.active === true) {
          isPreAuthorized = true;
          preAuthTier = preAuthSnap.data()?.tier || 'monthly';
        }
      } catch (err) {
        console.error("Error reading pre_authorized_emails reference:", err);
      }
    }

    if (!userDoc.exists()) {
      const newProfile: UserProfile = {
        ...INITIAL_PROFILE,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: isAdminEmail ? 'admin' : 'user',
        isSubscribed: isPreAuthorized ? true : false,
        subscriptionType: isPreAuthorized ? (preAuthTier as any) : undefined
      };
      console.log('Creating new user profile for:', firebaseUser.uid, 'PreAuthorized:', isPreAuthorized);
      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);
    } else {
      const data = userDoc.data();
      if (isPreAuthorized && (!data.isSubscribed || data.subscriptionType !== preAuthTier)) {
        data.isSubscribed = true;
        data.subscriptionType = preAuthTier;
        console.log('Pre-authorizing existing profile subscription on load:', firebaseUser.email);
        await setDoc(userDocRef, { isSubscribed: true, subscriptionType: preAuthTier }, { merge: true });
      }
      if (isAdminEmail && data.role !== 'admin') {
        data.role = 'admin';
        console.log('Upgrading role to admin in Firestore for:', firebaseUser.email);
        await setDoc(userDocRef, { role: 'admin' }, { merge: true });
      }
      if (data.name) profileName = data.name;
      if (data.avatarUrl) profileAvatar = data.avatarUrl;
      console.log('Loaded existing user profile for:', firebaseUser.uid, 'Marked quotes:', data.markedQuotes?.length || 0);
      setUserProfile({ ...INITIAL_PROFILE, ...data, markedQuotes: data.markedQuotes || [] } as UserProfile);
    }

    try {
      const publicSnap = await getDoc(publicProfileRef);
      if (!publicSnap.exists()) {
        await setDoc(publicProfileRef, {
          uid: firebaseUser.uid,
          name: profileName,
          avatarUrl: profileAvatar,
          biography: 'Seeking intellectual and physical discipline.',
          isOnline: true,
          lastActive: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        await updateDoc(publicProfileRef, {
          isOnline: true,
          lastActive: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Auto-register of public profile skipped or limited:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      setWorkouts(MOCK_WORKOUTS);
      setStats(MOCK_STATS);
      setWeeklyPlan(INITIAL_WEEKLY_PLAN);
      
      const cachedGuestProfile = localStorage.getItem('guest_profile');
      if (cachedGuestProfile) {
        try {
          const parsed = JSON.parse(cachedGuestProfile);
          if (parsed) {
            setUserProfile(parsed);
          }
        } catch (err) {
          console.error("Failed to parse cached guest profile:", err);
        }
      } else {
        const guestSub = localStorage.getItem('guest_subscription');
        if (guestSub) {
          try {
            const parsed = JSON.parse(guestSub);
            if (parsed && parsed.isSubscribed) {
              setUserProfile(prev => ({
                ...prev,
                isSubscribed: true,
                subscriptionType: parsed.subscriptionType || 'monthly'
              }));
            }
          } catch (e) {
            console.error("Failed to parse guest subscription:", e);
          }
        }
      }
      return;
    }

    // Listen to user profile
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('User profile synced from cloud.');
        setUserProfile({ ...INITIAL_PROFILE, ...data, markedQuotes: data.markedQuotes || [] } as UserProfile);
        // Save to local disk as a "shield" against quota loss
        localStorage.setItem(`wisefit_profile_${user.uid}`, JSON.stringify(data));
      }
    }, (error) => {
      console.warn("Profile snapshot blocked. Falling back to disk cache.");
      const cached = localStorage.getItem(`wisefit_profile_${user.uid}`);
      if (cached) {
        try {
          setUserProfile(JSON.parse(cached));
        } catch (e) {
          console.error("Failed to parse cached user profile:", e);
        }
      }
      handleFirestoreError(error, 'get', `users/${user.uid}`);
    });

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

  const handleSaveSection = async (sectionName: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
      try {
        const publicProfileRef = doc(db, 'public_profiles', user.uid);
        await setDoc(publicProfileRef, {
          uid: user.uid,
          name: userProfile.name || 'Seeker',
          avatarUrl: userProfile.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
          biography: userProfile.biography || '',
          gender: userProfile.gender || 'male',
          age: userProfile.age || 28,
          height: userProfile.height || 0,
          currentWeight: userProfile.currentWeight || 0,
          targetWeight: userProfile.targetWeight || 0,
          stepGoal: userProfile.stepGoal || 10000,
          mbti: userProfile.mbti || '',
          maxPullUps: userProfile.maxPullUps || 0,
          oneRMWeighted: userProfile.oneRMWeighted || 0,
          shortTermGoal: userProfile.shortTermGoal || '',
          longTermGoal: userProfile.longTermGoal || '',
          isDatingModeEnabled: !!userProfile.isDatingModeEnabled,
          datingPreferences: userProfile.datingPreferences || null,
          uploadedAvatars: userProfile.uploadedAvatars || [],
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (pubErr) {
        console.warn('Could not sync public_profiles in section save:', pubErr);
      }
      alert(`${sectionName} saved successfully!`);
    } catch (err: any) {
      handleFirestoreError(err, 'update', `users/${user.uid}`);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  const runDiagnostics = async () => {
    setIsDiagnosing(true);
    setDiagnostics(null);
    try {
      const resp = await fetch('/api/ai/diagnostics');
      const contentType = resp.headers.get("content-type");
      
      if (!resp.ok) {
        throw new Error(`Server Error (Status ${resp.status})`);
      }
      
      if (!contentType || !contentType.includes("application/json")) {
        const bodyText = await resp.text();
        console.error("Non-JSON Response during diagnosis:", bodyText.substring(0, 200));
        throw new Error(`Invalid response from AI Bridge. Check Hostinger logs.`);
      }

      const data = await resp.json();
      setDiagnostics(data);
    } catch (e: any) {
      console.error('Diagnostics failed:', e);
      setDiagnostics({
        gemini: { status: 'error', error: e.message },
        anthropic: { status: 'error', error: 'Bridge Offline' },
        env: { geminiKey: false, anthropicKey: false }
      });
    } finally {
      setIsDiagnosing(false);
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
    if (checkGuestAction()) return;
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
    if (!chatInput.trim() || isChatLoading || !isPremiumUser) return;

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
      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: chatMessages.concat(userMessage),
          userEmail: user?.email
        })
      });
      
      const text = await resp.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Parse Error. Body:", text);
        throw new Error(`The Stoic Chamber returned an invalid response (Status ${resp.status}). This often happens if API keys are missing on your host. Check server logs.`);
      }
      
      if (!resp.ok) {
        let errorMsg = result.error || `Server responded with status ${resp.status}`;
        if (resp.status === 404) {
          errorMsg = "The Stoic Chamber is currently out of reach (404). Please ensure the backend is deployed correctly.";
        }
        throw new Error(errorMsg);
      }

      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: result.text || 'Sorry, I could not generate a response.' }] };
      setChatMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error('Gemini Error:', error);
      setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: error.message === "Failed to fetch" ? "Error connecting to the server. Check your connection." : error.message || 'Error connecting to the Force. Please try again.' }] }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const expandQuoteWithStoicAI = useCallback(async (quote: any) => {
    // Navigate straight to the SAGE (chat) panel
    setActiveView('chat');
    if (!isPremiumUser) {
      return;
    }
    
    // Construct an elegant, comparative Stoic analysis prompt
    const seedPrompt = `I am contemplating this quote:
"${quote.text}" — ${quote.author}

As my Stoic AI Mentor, please provide a profound comparative overview. Show me:
1. Which other legendary philosophers or intellectual thinkers (from Roman Stoicism, Eastern Zen, Existentialism, or Slavic giants like Krleža and Andrić) shared similar concepts or thoughts.
2. How their ideas align or contrast with this quote.
3. A pragmatic lesson on how I can apply this synergy of thought to my physical training, daily discipline, and mental fortress today.

Keep your response highly intense, intellectually rich, yet compact (under 5 sentences), declarative, and source-cited.`;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: seedPrompt }] };
    
    // Stop any speech output that is active
    if (isSpeaking !== null) {
      currentSourceRef.current?.stop();
      setIsSpeaking(null);
    }

    // Append the user message to start the conversation segment
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...chatMessages, userMessage],
          userEmail: user?.email
        })
      });
      
      const text = await resp.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Parse Error. Body:", text);
        throw new Error("The Stoic Chamber returned an invalid response.");
      }
      
      if (!resp.ok) {
        throw new Error(result.error || `Server responded with status ${resp.status}`);
      }

      const modelMessage: ChatMessage = { 
        role: 'model', 
        parts: [{ text: result.text || 'Sorry, I could not generate a response.' }] 
      };
      setChatMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error('Gemini Error:', error);
      setChatMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          parts: [{ text: error.message || 'Error connecting to the Stoic sanctuary.' }] 
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatMessages, user, isSpeaking]);

  const handlePsychSendMessage = async () => {
    if (!psychInput.trim() || isPsychLoading || !isPremiumUser) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: psychInput }] };
    setPsychMessages(prev => [...prev, userMessage]);
    setPsychInput('');
    setIsPsychLoading(true);
    
    if (isSpeaking !== null) {
      currentSourceRef.current?.stop();
      setIsSpeaking(null);
    }

    try {
      const resp = await fetch('/api/ai/psychologist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: psychMessages.concat(userMessage),
          userEmail: user?.email,
          healthData: userProfile // Pass profile for context
        })
      });
      
      const text = await resp.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Parse Error. Body:", text);
        throw new Error(`The Psych Clinic returned a non-JSON response (Status ${resp.status}). Please check Hostinger environmental variables.`);
      }
      
      if (!resp.ok) {
        throw new Error(result.error || `Server returned error ${resp.status}`);
      }

      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: result.text || '...' }] };
      setPsychMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      setPsychMessages(prev => [...prev, { role: 'model', parts: [{ text: error.message || 'Connection error' }] }]);
    } finally {
      setIsPsychLoading(false);
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
      themeMode === 'girly' ? "bg-[#FFF5F7] text-pink-950 selection:bg-pink-500/30" : 
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
                  Login is optional. Save your wisdom to the cloud.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Background Graphic Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden text-black">
        <div className={cn(
          "absolute inset-0 transition-all duration-1000",
          themeMode === 'girly' ? "opacity-30" : isDarkMode ? "opacity-20" : "opacity-10"
        )}>
          <img 
            src={themeMode === 'girly' 
              ? "https://images.unsplash.com/photo-1558231061-000c077b949d?auto=format&fit=crop&q=80&w=2000" 
              : "https://compcharity.org/wp-content/uploads/2026/04/e0efb5a2-1d04-40b2-b3fa-459dfdab069e_839bb3b2-scaled.jpg"
            } 
            alt="Background" 
            className={cn(
              "w-full h-full object-cover scale-110",
              themeMode === 'girly' ? "filter sepia(0.3) saturate(1.5) animate-in fade-in zoom-in duration-1000" : "grayscale animate-pulse-slow"
            )}
            referrerPolicy="no-referrer"
          />
          {/* Vignette Effect */}
          <div className={cn(
            "absolute inset-0 transition-all duration-1000",
            themeMode === 'girly' ? "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,182,193,0.4)_100%)]" :
            isDarkMode ? "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" :
            "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.4)_100%)]"
          )} />
          {/* Subtle Texture Overlay */}
          <div className={cn(
            "absolute inset-0 opacity-[0.03] transition-opacity duration-1000",
            themeMode === 'girly' ? "bg-none" : "bg-[url('https://compcharity.org/wp-content/uploads/2026/04/StoicsColourPainting.jpg')]"
          )} />
        </div>
        
        <div className={cn(
          "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-all duration-1000",
          themeMode === 'girly' ? "bg-pink-400/20" : isDarkMode ? "bg-emerald-500/10" : "bg-emerald-500/5"
        )} />
        <div className={cn(
          "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-all duration-1000",
          themeMode === 'girly' ? "bg-rose-400/20 shadow-[0_0_100px_rgba(244,63,94,0.1)]" : isDarkMode ? "bg-emerald-500/10" : "bg-emerald-400/5"
        )} />
      </div>

      {/* Header */}
      <header className={cn(
        "sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between transition-colors duration-500",
        isDarkMode ? "bg-zinc-950/60 border-zinc-800/50" : "bg-white/60 border-zinc-200"
      )}>
        <div 
          className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-transform"
          onClick={() => setActiveView('dashboard')}
        >
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center overflow-hidden border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20 80 Q50 95 80 80 Q90 40 50 20 Q10 40 20 80' fill='%23064e3b'/%3E%3Ccircle cx='35' cy='50' r='12' fill='white'/%3E%3Ccircle cx='65' cy='50' r='12' fill='white'/%3E%3Ccircle cx='35' cy='50' r='5' fill='%23064e3b'/%3E%3Ccircle cx='65' cy='50' r='5' fill='%23064e3b'/%3E%3Cpath d='M46 60 L54 60 L50 70 Z' fill='%23fbbf24'/%3E%3Cpath d='M50 15 Q55 25 50 35 Q45 25 50 15' fill='%23f59e0b'/%3E%3Cpath d='M25 35 L15 20 L35 30' fill='%23064e3b'/%3E%3Cpath d='M75 35 L85 20 L65 30' fill='%23064e3b'/%3E%3C/svg%3E" 
              alt="WiseFit Logo" 
              className="w-8 h-8"
            />
          </div>
          <div>
            <h1 className={cn(
              "text-xl font-bold tracking-tight transition-colors group-hover:text-emerald-500",
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
          <div className="flex items-center gap-1.5 bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button 
              onClick={() => {
                const nextMode = themeMode === 'light' ? 'dark' : 'light';
                setThemeMode(nextMode);
              }}
              className={cn(
                "p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center min-w-[40px]",
                themeMode === 'dark' ? "bg-zinc-800 text-yellow-400 shadow-sm" : 
                themeMode === 'light' ? "bg-white text-zinc-600 shadow-sm" :
                "text-zinc-500 hover:bg-zinc-200/50"
              )}
              title={themeMode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {themeMode === 'dark' ? <Sun className="w-5 h-5 animate-in zoom-in" /> : <Moon className="w-5 h-5 animate-in zoom-in" />}
            </button>
            <button 
              onClick={() => {
                const nextMode = themeMode === 'girly' ? (isDarkMode ? 'dark' : 'light') : 'girly';
                // Note: isDarkMode is local to the component, so we might need a fallback if it's derived from themeMode
                // Let's just use dark as fallback for simpler logic or check state
                setThemeMode(themeMode === 'girly' ? 'light' : 'girly');
              }}
              className={cn(
                "p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center min-w-[40px]",
                themeMode === 'girly' ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" :
                "text-pink-400 hover:bg-pink-50"
              )}
              title="Toggle Girly Mode"
            >
              <Sparkles className={cn("w-5 h-5 animate-in zoom-in", themeMode === 'girly' ? "animate-pulse" : "")} />
            </button>
          </div>
          <div 
            onClick={() => setActiveView('profile')}
            className={cn(
              "w-10 h-10 rounded-full border flex items-center justify-center overflow-hidden transition-all cursor-pointer active:scale-90 shadow-lg shadow-transparent",
              isGirlyMode ? "hover:border-pink-500 hover:shadow-pink-500/10" : "hover:border-emerald-500 hover:shadow-emerald-500/10",
              isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-200 border-zinc-300"
            )}
          >
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
      <main className={cn(
        "relative z-10 pb-24 px-4 pt-6 mx-auto transition-all duration-300",
        activeView === 'social' ? "max-w-4xl" : 
        activeView === 'workouts' ? "max-w-2xl" : "max-w-md"
      )}>
        {isQuotaExceeded && !isQuotaDismissed && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-6 p-4 rounded-2xl border flex items-center gap-3 relative",
              isDarkMode ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : "bg-orange-50/50 border-orange-200 text-orange-600"
            )}
          >
            <Database className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs leading-relaxed flex-1">
              <p className="font-bold">Quota Saver Active</p>
              <p className="opacity-80">Daily limit reached. Using local JSON quotes until reset.</p>
            </div>
            <button onClick={() => setIsQuotaDismissed(true)} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        <AnimatePresence>
          {savedMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-emerald-500 text-zinc-950 rounded-full font-bold text-sm shadow-2xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {savedMessage}
            </motion.div>
          )}
        </AnimatePresence>

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
              {/* 1. 7-Day Biological Trend */}
              {userProfile.integrations?.googleFit?.connected && userProfile.weeklyHealthData && userProfile.weeklyHealthData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-5 rounded-3xl border overflow-hidden relative group cursor-pointer transition-all active:scale-[0.98]",
                    isGirlyMode ? "bg-white/40 border-pink-100 shadow-sm" :
                    isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                  )}
                  onClick={() => setActiveView('profile')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={cn("w-4 h-4", isGirlyMode ? "text-pink-500" : "text-emerald-500")} />
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest italic",
                        isGirlyMode ? "text-pink-400" : "text-zinc-500"
                      )}>7-Day Biological Trend</span>
                    </div>
                    <ChevronRight className={cn("w-3 h-3", isGirlyMode ? "text-pink-500" : "text-emerald-500")} />
                  </div>
                  <div className="flex items-end gap-1 h-8 px-1">
                    {userProfile.weeklyHealthData.map((d, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "flex-1 rounded-sm transition-all",
                          isGirlyMode 
                            ? "bg-pink-500/20 group-hover:bg-pink-500/40" 
                            : "bg-emerald-500/20 group-hover:bg-emerald-500/40"
                        )}
                        style={{ height: `${Math.max(10, (d.steps / 15000) * 100)}%` }}
                      />
                    ))}
                  </div>
                  <div className={cn(
                    "mt-3 flex justify-between items-center rounded-xl px-2 py-1",
                    isGirlyMode ? "bg-pink-500/5" : "bg-zinc-500/5"
                  )}>
                    <p className={cn(
                      "text-[9px] font-bold uppercase tracking-tighter",
                      isGirlyMode ? "text-pink-400" : "text-zinc-500"
                    )}>Avg Daily Steps</p>
                    <p className={cn(
                      "text-sm font-black italic",
                      isGirlyMode ? "text-pink-600" : "text-emerald-500"
                    )}>
                      {Math.round(userProfile.weeklyHealthData.reduce((acc, curr) => acc + curr.steps, 0) / userProfile.weeklyHealthData.length).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              )}


              {/* Sync Status Badge (Visible if connected) */}
              {userProfile.integrations?.googleFit?.connected && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex items-center justify-center gap-2"
                >
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1 border rounded-full",
                    isGirlyMode ? "bg-pink-500/10 border-pink-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      isGirlyMode ? "bg-pink-500" : "bg-emerald-500"
                    )} />
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isGirlyMode ? "text-pink-600" : "text-emerald-500"
                    )}>
                      Live Sync: Pixel Watch 3
                    </span>
                  </div>
                </motion.div>
              )}

              {/* AI Stoic Reflection */}
              <AnimatePresence>
                {(stoicReflection || isGeneratingReflection) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "p-6 rounded-3xl border relative overflow-hidden transition-all duration-700",
                      isGirlyMode ? "bg-white/40 border-pink-100 shadow-sm" :
                      isDarkMode 
                        ? "bg-zinc-900/40 border-zinc-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" 
                        : "bg-white/90 border-zinc-200 shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0 left-0 w-1 h-full",
                      isGirlyMode ? "bg-pink-500/50" : "bg-emerald-500/50"
                    )} />
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isGirlyMode ? "bg-pink-500/10" : "bg-emerald-500/10"
                      )}>
                        <Sparkles className={cn("w-4 h-4", isGirlyMode ? "text-pink-500" : "text-emerald-500")} />
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.3em]",
                        isGirlyMode ? "text-pink-500" : "text-emerald-500"
                      )}>
                        Biological Reflection
                      </span>
                      {isGeneratingReflection && (
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
                            Consulting the Oracle
                          </span>
                          <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                        </div>
                      )}
                    </div>
                    {stoicReflection ? (
                      <p className={cn(
                        "text-sm leading-relaxed italic font-serif",
                        isDarkMode ? "text-zinc-200" : "text-zinc-800"
                      )}>
                        "{stoicReflection}"
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-zinc-800/50 animate-pulse rounded-md" />
                        <div className="h-4 w-3/4 bg-zinc-800/50 animate-pulse rounded-md" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

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
                    <Euro className="w-24 h-24 text-emerald-500" />
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
                              <Euro className="w-2 h-2" />
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
                          currentQuote.isAI
                            ? (isDarkMode ? "text-purple-100" : "text-purple-900")
                            : (isDarkMode ? "text-zinc-100" : "text-zinc-900")
                        )}>
                          "{currentQuote.text}"
                        </p>
                        <p className={cn(
                          "text-[11px] font-bold transition-colors",
                          currentQuote.isAI
                            ? (isDarkMode ? "text-purple-400" : "text-purple-600")
                            : (isDarkMode ? "text-blue-400" : "text-blue-600")
                        )}>{currentQuote.author}</p>

                        {currentQuote.shortExplanation && (
                          <div className={cn(
                            "mt-4 p-3 rounded-xl border text-[11px] leading-relaxed text-center relative overflow-hidden group transition-all duration-500",
                            isDarkMode ? "bg-zinc-900/50 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-600"
                          )}>
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                            <p className="font-bold mb-1.5 uppercase tracking-widest text-[9px] text-zinc-500 opacity-80">Psychology Insight</p>
                            {currentQuote.shortExplanation}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {currentQuote.stoicParallel && (
                            <div className={cn(
                              "p-3 rounded-xl border text-[10px] leading-relaxed text-center relative overflow-hidden transition-all duration-500",
                              isDarkMode ? "bg-blue-500/5 border-blue-500/10 text-blue-300" : "bg-blue-50 border-blue-100 text-blue-600"
                            )}>
                              <p className="font-bold mb-1 uppercase tracking-widest text-[8px] text-blue-500 opacity-80">Stoic Parallel</p>
                              <span className="italic">{currentQuote.stoicParallel}</span>
                            </div>
                          )}

                          {currentQuote.jewishParallel && (
                            <div className={cn(
                              "p-3 rounded-xl border text-[10px] leading-relaxed text-center relative overflow-hidden transition-all duration-500",
                              isDarkMode ? "bg-amber-500/5 border-amber-500/10 text-amber-300" : "bg-amber-50 border-amber-100 text-amber-600"
                            )}>
                              <p className="font-bold mb-1 uppercase tracking-widest text-[8px] text-amber-500 opacity-80">Jewish Parallel</p>
                              <span className="italic">{currentQuote.jewishParallel}</span>
                            </div>
                          )}
                        </div>
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

                          <div className="space-y-1.5 mt-1">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 block text-center">Wisdom Selection:</label>
                            <select
                              value={wisdomTradition}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setWisdomTradition(val);
                                setQuotesPool([]);
                                quotesPoolRef.current = [];
                              }}
                              className={cn(
                                "w-full p-2 rounded-lg border text-[9px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 transition-all cursor-pointer text-center appearance-none",
                                isDarkMode 
                                  ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-purple-500/50" 
                                  : "bg-white border-zinc-200 text-zinc-900 focus:ring-purple-500/20"
                              )}
                            >
                              <option value="all">All Heritage Wisdom</option>
                              <option value="psychology">Psychology Wisdom (100 Insights)</option>
                              <option value="daily">Daily Fresh Quotes (wisefitorg.com)</option>
                            </select>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={generateAIQuote}
                              disabled={isGeneratingAIQuote}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm relative overflow-hidden",
                                isGeneratingAIQuote ? "opacity-50 cursor-not-allowed" : "",
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
                                if (checkGuestAction()) return;
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
                            onClick={toggleSpeakQuote}
                            className={cn(
                              "p-2 rounded-lg transition-all active:scale-95",
                              isHomeSpeechPlaying 
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse"
                                : (isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200")
                            )}
                            title={isHomeSpeechPlaying ? "Stop Speaking" : "Listen to Quote"}
                          >
                            <Volume2 className={cn("w-3.5 h-3.5", isHomeSpeechPlaying && "text-emerald-400")} />
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

                        <div className="space-y-4">
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
                  {(activeSoundscape || tiestoActive) && (
                    <button 
                      onClick={() => {
                        setActiveSoundscape(null);
                        setTiestoActive(false);
                        setChineseBGM(null);
                      }}
                      className="text-[9px] font-bold uppercase text-red-500 hover:text-red-400 transition-colors"
                    >
                      Stop Music
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (activeSoundscape === 'learn-chinese') {
                        setChineseBGM(chineseBGM === 'focus' ? null : 'focus');
                      } else {
                        setActiveSoundscape('focus');
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      (activeSoundscape === 'focus' || (activeSoundscape === 'learn-chinese' && chineseBGM === 'focus'))
                        ? (isDarkMode ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <Volume2 className="w-3 h-3" />
                    Focus Mode
                  </button>
                  <button
                    onClick={() => {
                      if (activeSoundscape === 'learn-chinese') {
                        setChineseBGM(chineseBGM === 'techno' ? null : 'techno');
                      } else {
                        setActiveSoundscape('techno');
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      (activeSoundscape === 'techno' || (activeSoundscape === 'learn-chinese' && chineseBGM === 'techno'))
                        ? (isDarkMode ? "bg-purple-500/20 border-purple-500/40 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <Activity className="w-3 h-3" />
                    Digital Jazz / Techno
                  </button>
                  <button
                    onClick={() => {
                      if (activeSoundscape === 'learn-chinese') {
                        setChineseBGM(chineseBGM === 'ecuador' ? null : 'ecuador');
                      } else {
                        setActiveSoundscape('ecuador');
                        setEcuadorTrack('https://www.youtube.com/embed/cNfwUnOIihA?list=PL0uIx_Noeipc9A_fJYo5OqxA8_RcE3uQk');
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      (activeSoundscape === 'ecuador' || (activeSoundscape === 'learn-chinese' && chineseBGM === 'ecuador'))
                        ? (isDarkMode ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <Music className="w-3 h-3" />
                    Ecuador (Reloaded)
                  </button>
                  <button
                    onClick={() => {
                      if (activeSoundscape === 'learn-chinese') {
                        setChineseBGM(chineseBGM === 'gta4' ? null : 'gta4');
                      } else {
                        setActiveSoundscape('gta4');
                        setGta4Track('https://www.youtube.com/embed/CKOWaWpUVT0?list=RDCKOWaWpUVT0');
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      (activeSoundscape === 'gta4' || (activeSoundscape === 'learn-chinese' && chineseBGM === 'gta4'))
                        ? (isDarkMode ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <Activity className="w-3 h-3 text-emerald-500" />
                    GTA4 Radio
                  </button>
                  <button
                    onClick={() => {
                      if (activeSoundscape === 'learn-chinese') {
                        setChineseBGM(chineseBGM === 'jazz' ? null : 'jazz');
                      } else {
                        setActiveSoundscape('jazz');
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      (activeSoundscape === 'jazz' || (activeSoundscape === 'learn-chinese' && chineseBGM === 'jazz'))
                        ? (isDarkMode ? "bg-orange-500/20 border-orange-500/40 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <Music className="w-3 h-3" />
                    Smooth Jazz
                  </button>
                  <button
                    onClick={() => {
                      if (activeSoundscape === 'learn-chinese') {
                        setChineseBGM(chineseBGM === 'classical' ? null : 'classical');
                      } else {
                        setActiveSoundscape('classical');
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      (activeSoundscape === 'classical' || (activeSoundscape === 'learn-chinese' && chineseBGM === 'classical'))
                        ? (isDarkMode ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <Scroll className="w-3 h-3" />
                    Classical
                  </button>
                  <button
                    onClick={() => {
                      if (activeSoundscape === 'learn-chinese') {
                        setActiveSoundscape(null);
                        setChineseBGM(null);
                      } else {
                        setActiveSoundscape('learn-chinese');
                        setChineseTrack('https://www.youtube.com/embed/6hv-iZQQ25Q?autoplay=1&loop=1&playlist=6hv-iZQQ25Q');
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      activeSoundscape === 'learn-chinese'
                        ? (isDarkMode ? "bg-rose-500/20 border-rose-500/40 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <BookOpen className="w-3 h-3 text-rose-500" />
                    Learn Chinese
                  </button>
                  <button
                    onClick={() => setTiestoActive(!tiestoActive)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border",
                      tiestoActive
                        ? (isDarkMode ? "bg-purple-500/20 border-purple-500/40 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600")
                        : (isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:bg-zinc-100")
                    )}
                  >
                    <Music className="w-3 h-3 text-purple-500" />
                    DJ Tiësto Mix
                  </button>
                </div>

                {(activeSoundscape || tiestoActive) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 overflow-hidden rounded-2xl border border-zinc-800/50"
                  >
                    <div className="bg-zinc-900/80 p-2 text-[8px] font-bold uppercase tracking-tighter text-zinc-500 flex justify-between items-center">
                      <span>Live Stream Active</span>
                      <span className="text-emerald-500 animate-pulse">● Volume tip: Adjust in player</span>
                    </div>

                    <div className={cn(
                      "p-2 bg-zinc-950/40 space-y-2",
                      (activeSoundscape && tiestoActive && !['jazz', 'classical'].includes(activeSoundscape))
                        ? "grid grid-cols-1 md:grid-cols-2 gap-2 space-y-0"
                        : ""
                    )}>
                      {activeSoundscape && (
                        <>
                          {activeSoundscape === 'jazz' || activeSoundscape === 'classical' ? (
                            <div className="relative h-20 bg-zinc-950 flex items-center px-4 gap-4 rounded-xl border border-zinc-800/50">
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
                            <>
                              {activeSoundscape === 'learn-chinese' ? (
                                <div className="p-2 space-y-3 w-full">
                                  {/* Learn Chinese Lesson Player */}
                                  <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800/50">
                                    <div className="bg-zinc-900/90 p-2 border-b border-zinc-800/50 flex gap-2 overflow-x-auto no-scrollbar">
                                      <button 
                                        onClick={() => setChineseTrack('https://www.youtube.com/embed/6hv-iZQQ25Q?autoplay=1&loop=1&playlist=6hv-iZQQ25Q')}
                                        className={cn(
                                          "whitespace-nowrap px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border transition-colors",
                                          chineseTrack.includes('6hv-iZQQ25Q')
                                            ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                                            : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                                        )}
                                      >
                                        🇨🇳 Learn Chinese Lesson
                                      </button>
                                    </div>
                                    <iframe
                                      key={chineseTrack}
                                      width="100%"
                                      height="160"
                                      src={`${chineseTrack}${chineseTrack.includes('?') ? '&' : '?'}autoplay=1&mute=0&controls=1`}
                                      title="Chinese Lesson"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      className="opacity-95 grayscale hover:grayscale-0 transition-all duration-500"
                                    />
                                  </div>

                                  {/* BGM Mixer Panel */}
                                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                                        <Volume2 className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                                        Blend Background Music
                                      </span>
                                      {chineseBGM && (
                                        <button 
                                          onClick={() => setChineseBGM(null)}
                                          className="text-[9px] font-bold uppercase text-red-400 hover:text-red-350 transition-colors"
                                        >
                                          Mute BGM
                                        </button>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                                      {[
                                        { id: 'focus', label: 'Focus Mode', icon: Volume2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                                        { id: 'ecuador', label: 'Ecuador', icon: Music, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
                                        { id: 'jazz', label: 'Smooth Jazz', icon: Music, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                                        { id: 'techno', label: 'Digital Jazz', icon: Activity, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                                        { id: 'classical', label: 'Classical', icon: Scroll, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                                        { id: 'gta4', label: 'GTA 4', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
                                      ].map((bgm) => (
                                        <button
                                          key={bgm.id}
                                          onClick={() => setChineseBGM(chineseBGM === bgm.id ? null : bgm.id)}
                                          className={cn(
                                            "px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all active:scale-95 flex items-center justify-center gap-1",
                                            chineseBGM === bgm.id
                                              ? `${bgm.color} border-current`
                                              : "bg-zinc-950/60 border-zinc-850 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                                          )}
                                        >
                                          <bgm.icon className="w-2.5 h-2.5" />
                                          {bgm.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Secondary Background Music Player */}
                                  {chineseBGM && (
                                    <div className="border border-zinc-800/40 rounded-xl overflow-hidden bg-zinc-950/80 p-2">
                                      <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 px-1">
                                        <span className="flex items-center gap-1 text-emerald-500">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                          Background Music: {chineseBGM.toUpperCase()}
                                        </span>
                                        <span>Adjust BGM volume in player</span>
                                      </div>
                                      {chineseBGM === 'jazz' || chineseBGM === 'classical' ? (
                                        <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-lg border border-zinc-800/30 gap-2">
                                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide">
                                            {chineseBGM === 'jazz' ? "🎷 WRTI Jazz Radio" : "🎻 Classic FM"}
                                          </span>
                                          <audio
                                            autoPlay
                                            controls
                                            className="h-6 w-32 opacity-80"
                                            src={chineseBGM === 'jazz' ? "https://wrti-live.streamguys1.com/jazz-mp3" : "https://media-ice.musicradio.com/ClassicFMMP3"}
                                          />
                                        </div>
                                      ) : (
                                        <iframe
                                          key={chineseBGM}
                                          width="100%"
                                          height="80"
                                          src={
                                            chineseBGM === 'focus' ? `${focusTrack}${focusTrack.includes('?') ? '&' : '?'}autoplay=1&mute=0&controls=1` :
                                            chineseBGM === 'ecuador' ? `${ecuadorTrack}${ecuadorTrack.includes('?') ? '&' : '?'}autoplay=1&mute=0&controls=1` :
                                            chineseBGM === 'gta4' ? `${gta4Track}${gta4Track.includes('?') ? '&' : '?'}autoplay=1&mute=0&controls=1` :
                                            `${technoTrack}${technoTrack.includes('?') ? '&' : '?'}autoplay=1&mute=0&controls=1`
                                          }
                                          title="BGM Player"
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          className="opacity-70 grayscale hover:grayscale-0 transition-all duration-500 rounded"
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-0 relative rounded-xl overflow-hidden border border-zinc-800/50 bg-zinc-950 w-full">
                                  {activeSoundscape === 'techno' && (
                                    <div className="bg-zinc-950/90 p-2 border-b border-zinc-800/50 flex gap-2 overflow-x-auto no-scrollbar">
                                      <button 
                                        onClick={() => setTechnoTrack('https://www.youtube.com/embed/MQKg_O5X1e0?autoplay=1&loop=1&playlist=MQKg_O5X1e0')}
                                        className="whitespace-nowrap px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                                      >
                                        SLAY!
                                      </button>
                                      <button 
                                        onClick={() => setTechnoTrack('https://www.youtube.com/embed/MQKg_O5X1e0?list=RDMQKg_O5X1e0&autoplay=1&loop=1&playlist=MQKg_O5X1e0')}
                                        className="whitespace-nowrap px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                                      >
                                        ETERNXLKZ RADIO
                                      </button>
                                      <button 
                                        onClick={() => setTechnoTrack('https://www.youtube.com/embed/fW_0N37-J10?autoplay=1&loop=1&playlist=fW_0N37-J10')}
                                        className="whitespace-nowrap px-2 py-1 rounded bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 transition-colors"
                                      >
                                        BROKEN
                                      </button>
                                      <button 
                                        onClick={() => setTechnoTrack('https://www.youtube.com/embed/GZonvFvV5Wc?autoplay=1&loop=1&playlist=GZonvFvV5Wc')}
                                        className="whitespace-nowrap px-2 py-1 rounded bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 transition-colors"
                                      >
                                        ENEMIES
                                      </button>
                                      <button 
                                        onClick={() => setTechnoTrack('https://www.youtube.com/embed/MQKg_O5X1e0?list=RDMQKg_O5X1e0&autoplay=1&loop=1&playlist=MQKg_O5X1e0')}
                                        className="whitespace-nowrap px-2 py-1 rounded bg-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-widest border border-teal-500/30 hover:bg-teal-500/30 transition-colors"
                                      >
                                        TRAP MIX
                                      </button>
                                      <button 
                                        onClick={() => setTechnoTrack('https://www.youtube.com/embed/MQKg_O5X1e0?list=RDEMyEayXoX3bI9_KAnv5QpOnA&autoplay=1&loop=1&playlist=MQKg_O5X1e0')}
                                        className="whitespace-nowrap px-2 py-1 rounded bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 transition-colors"
                                      >
                                        ETERNXLKZ MIX
                                      </button>
                                    </div>
                                  )}
                                  {activeSoundscape === 'focus' && (
                                    <div className="bg-zinc-950/90 p-2 border-b border-zinc-800/50 flex gap-2 overflow-x-auto no-scrollbar">
                                      <button 
                                        onClick={() => setFocusTrack('https://www.youtube.com/embed/TBPE_2Z3-Y8?list=RDTBPE_2Z3-Y8')}
                                        className={cn(
                                          "whitespace-nowrap px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border transition-colors bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                        )}
                                      >
                                        🧠 Focus Binaural Flow
                                      </button>
                                    </div>
                                  )}
                                  {activeSoundscape === 'ecuador' && (
                                    <div className="bg-zinc-950/90 p-2 border-b border-zinc-800/50 flex gap-2 overflow-x-auto no-scrollbar">
                                      <button 
                                        onClick={() => setEcuadorTrack('https://www.youtube.com/embed/cNfwUnOIihA?list=PL0uIx_Noeipc9A_fJYo5OqxA8_RcE3uQk')}
                                        className={cn(
                                          "whitespace-nowrap px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border transition-colors bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                                        )}
                                      >
                                        🇪🇨 Ecuador (Reloaded Radio)
                                      </button>
                                    </div>
                                  )}
                                  {activeSoundscape === 'gta4' && (
                                    <div className="bg-zinc-950/90 p-2 border-b border-zinc-800/50 flex gap-2 overflow-x-auto no-scrollbar">
                                      <button 
                                        onClick={() => setGta4Track('https://www.youtube.com/embed/CKOWaWpUVT0?list=RDCKOWaWpUVT0')}
                                        className={cn(
                                          "whitespace-nowrap px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border transition-colors bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                        )}
                                      >
                                        🎮 GTA4 Soundscape Mix
                                      </button>
                                    </div>
                                  )}
                                  <iframe
                                    key={
                                      activeSoundscape === 'focus' ? focusTrack :
                                      activeSoundscape === 'techno' ? technoTrack : 
                                      activeSoundscape === 'ecuador' ? ecuadorTrack :
                                      activeSoundscape === 'gta4' ? gta4Track :
                                      activeSoundscape
                                    }
                                    width="100%"
                                    height="120"
                                    src={
                                      activeSoundscape === 'focus' ? `${focusTrack}${focusTrack.includes('?') ? '&' : '?'}autoplay=1&mute=0&controls=1` :
                                      activeSoundscape === 'ecuador' ? `${ecuadorTrack}${ecuadorTrack.includes('?') ? '&' : '?'}autoplay=1&mute=0&controls=1` :
                                      activeSoundscape === 'gta4' ? `${gta4Track}${gta4Track.includes('?') ? '&' : '?'}autoplay=1&mute=0&controls=1` :
                                      `${technoTrack}${technoTrack.includes('?') ? '&' : '?'}autoplay=1&mute=0&controls=1`
                                    }
                                    title="Ritual Soundscape"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="opacity-80 grayscale hover:grayscale-0 transition-all duration-500"
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}

                      {tiestoActive && (
                        <div className="space-y-0 relative rounded-xl overflow-hidden border border-zinc-800/50 bg-zinc-950">
                          <div className="bg-zinc-900/90 p-2 border-b border-zinc-800/50 flex justify-between items-center">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                              🎧 DJ Tiësto Channel / Mix
                            </span>
                            <button 
                              onClick={() => setTiestoActive(false)}
                              className="text-[8px] font-black uppercase text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              Mute/Stop Tiësto
                            </button>
                          </div>
                          <iframe
                            width="100%"
                            height="120"
                            src="https://www.youtube.com/embed/38WQgr9uegk?list=RD38WQgr9uegk&autoplay=1&loop=1&playlist=38WQgr9uegk&mute=0&controls=1"
                            title="DJ Tiësto Mix"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="opacity-85 grayscale hover:grayscale-0 transition-all duration-500"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>

                  {/* Wisdom Scoreboard */}
                  <WisdomScoreboard userProfile={userProfile} isDarkMode={isDarkMode} />

                  {/* Community Pulse Component */}
                  <CommunityStats 
                    isDarkMode={isDarkMode} 
                    currentUser={user} 
                    isQuotaExceeded={isQuotaExceeded}
                    setIsQuotaExceeded={setIsQuotaExceeded}
                  />

              {/* Activity Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(
                  "backdrop-blur-md border rounded-3xl p-6 transition-colors duration-500",
                  isGirlyMode ? "bg-white/40 border-pink-100 shadow-sm shadow-pink-500/5" :
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/60 border-zinc-200 shadow-sm"
                )}
              >
                <h3 className={cn(
                  "text-sm font-semibold mb-4 uppercase tracking-wider transition-colors",
                  isGirlyMode ? "text-pink-500/80" : isDarkMode ? "text-zinc-400" : "text-zinc-500"
                )}>Weekly Activity</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats}>
                      <defs>
                        <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isGirlyMode ? "#ec4899" : "#10b981"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={isGirlyMode ? "#ec4899" : "#10b981"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isGirlyMode ? "#fce7f3" : isDarkMode ? "#27272a" : "#e4e4e7"} vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(str) => format(new Date(str), 'EEE')}
                        stroke={isGirlyMode ? "#f472b6" : isDarkMode ? "#71717a" : "#a1a1aa"}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isGirlyMode ? '#fff' : isDarkMode ? '#18181b' : '#ffffff', 
                          border: `1px solid ${isGirlyMode ? '#fbcfe8' : isDarkMode ? '#27272a' : '#e4e4e7'}`, 
                          borderRadius: '12px',
                          color: isGirlyMode ? '#9d174d' : isDarkMode ? '#ffffff' : '#000000'
                        }}
                        itemStyle={{ color: isGirlyMode ? '#ec4899' : '#10b981' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="steps" 
                        stroke={isGirlyMode ? "#ec4899" : "#10b981"} 
                        fillOpacity={1} 
                        fill="url(#colorSteps)" 
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* 2. Biometric Overview Grid (Moved below Weekly Activity) */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard 
                  index={0}
                  isDarkMode={isDarkMode}
                  isGirlyMode={isGirlyMode}
                  icon={<Footprints className={cn("w-5 h-5", isGirlyMode ? "text-pink-400" : "text-blue-400")} />}
                  label="Steps"
                  value={(userProfile.currentSteps || 0).toLocaleString()}
                  goal={userProfile.stepGoal.toLocaleString()}
                  progress={(userProfile.currentSteps || 0) / userProfile.stepGoal}
                  color={isGirlyMode ? "bg-pink-500" : "bg-blue-500"}
                />
                <StatCard 
                  index={1}
                  isDarkMode={isDarkMode}
                  isGirlyMode={isGirlyMode}
                  icon={<Flame className={cn("w-5 h-5", isGirlyMode ? "text-pink-400" : "text-orange-400")} />}
                  label="Calories"
                  value={(userProfile.currentCalories || 0).toLocaleString()}
                  goal="2,500"
                  progress={(userProfile.currentCalories || 0) / 2500}
                  color={isGirlyMode ? "bg-rose-400" : "bg-orange-500"}
                />
                <StatCard 
                  index={2}
                  isDarkMode={isDarkMode}
                  isGirlyMode={isGirlyMode}
                  icon={<Clock className={cn("w-5 h-5", isGirlyMode ? "text-pink-400" : "text-emerald-400")} />}
                  label="Active"
                  value={`${todayStats.activeMinutes}m`}
                  goal="60m"
                  progress={todayStats.activeMinutes / 60}
                  color={isGirlyMode ? "bg-pink-400" : "bg-emerald-500"}
                />
                <StatCard 
                  index={3}
                  isDarkMode={isDarkMode}
                  isGirlyMode={isGirlyMode}
                  icon={<Activity className={cn("w-5 h-5", isGirlyMode ? "text-pink-400" : "text-purple-400")} />}
                  label="Weight"
                  value={`${(userProfile.currentWeight || 89).toFixed(1)}kg`}
                  goal={`${userProfile.targetWeight}kg`}
                  progress={userProfile.targetWeight / (userProfile.currentWeight || 89)}
                  color={isGirlyMode ? "bg-pink-600" : "bg-purple-500"}
                />
              </div>

              {/* 3. Biological Achievement (Moved below Weekly Activity) */}
              {userProfile.personalRecords && userProfile.personalRecords.length > 0 && (() => {
                const firstRecord = userProfile.personalRecords[0];
                const l = firstRecord.label.toLowerCase();
                let themeColor = "text-orange-500";
                let themeBg = "bg-orange-500/10";
                if (l.includes('kilometre')) { themeColor = "text-amber-400"; themeBg = "bg-amber-400/15"; }
                else if (l.includes('5k')) { themeColor = "text-emerald-400"; themeBg = "bg-emerald-400/15"; }
                else if (l.includes('10k')) { themeColor = "text-cyan-400"; themeBg = "bg-cyan-400/15"; }
                else if (l.includes('marathon')) { themeColor = "text-purple-400"; themeBg = "bg-purple-400/15"; }
                else if (l.includes('distance') || l.includes('farthest') || l.includes('run')) { themeColor = "text-blue-400"; themeBg = "bg-blue-400/15"; }

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={cn(
                      "p-6 rounded-[2.5rem] border overflow-hidden relative group cursor-pointer transition-all active:scale-[0.98]",
                      isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                    )}
                    onClick={() => setActiveView('profile')}
                  >
                    <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl -z-10", themeBg.replace('/15', '/5').replace('/10', '/5'))} />
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", themeBg)}>
                          <Trophy className={cn("w-4 h-4", themeColor)} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Best Performance</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={cn("text-[9px] font-bold opacity-60 group-hover:opacity-100 transition-colors uppercase tracking-widest italic", themeColor)}>Go to Profile</span>
                        <ChevronRight className={cn("w-3 h-3", themeColor)} />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <p className={cn("text-xs font-bold", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>{firstRecord.label}</p>
                        <p className={cn("text-3xl font-black italic tracking-tighter", themeColor)}>
                          {firstRecord.value}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Authenticated On</p>
                        <p className={cn("text-[10px] font-bold", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>{firstRecord.date}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {/* Daily Biometrics / Activity */}
              <div className="grid grid-cols-3 gap-3">
                <div className={cn(
                  "p-4 rounded-[2rem] border transition-all",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Footprints className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Steps</span>
                  </div>
                  <p className="text-xl font-black italic tracking-tighter text-emerald-500">
                    {userProfile.currentSteps?.toLocaleString() || 0}
                  </p>
                </div>

                <div className={cn(
                  "p-4 rounded-[2rem] border transition-all",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Calories</span>
                  </div>
                  <p className="text-xl font-black italic tracking-tighter text-orange-500">
                    {userProfile.currentCalories?.toLocaleString() || 0}
                  </p>
                </div>

                <div className={cn(
                  "p-4 rounded-[2rem] border transition-all",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Distance</span>
                  </div>
                  <p className="text-xl font-black italic tracking-tighter text-blue-500">
                    {userProfile.currentDistance || 0} <span className="text-[10px]">km</span>
                  </p>
                </div>

                <div className={cn(
                  "p-4 rounded-[2rem] border transition-all",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Resting HR</span>
                  </div>
                  <p className="text-xl font-black italic tracking-tighter text-red-500 line-clamp-1">
                    {userProfile.currentRHR || '--'} <span className="text-[10px]">bpm</span>
                  </p>
                </div>

                <div className={cn(
                  "p-4 rounded-[2rem] border transition-all",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">HRV</span>
                  </div>
                  <p className="text-xl font-black italic tracking-tighter text-purple-500">
                    {userProfile.currentHRV || '--'} <span className="text-[10px]">ms</span>
                  </p>
                </div>
              </div>

              {/* Today's Plan Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className={cn("text-lg font-bold", isGirlyMode ? "text-pink-900" : "")}>Today's Plan</h3>
                  <button 
                    onClick={() => setActiveView('plan')}
                    className={cn(
                      "text-sm font-medium flex items-center gap-1",
                      isGirlyMode ? "text-pink-500" : "text-emerald-500"
                    )}
                  >
                    Full Plan <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className={cn(
                  "backdrop-blur-md border rounded-3xl p-5 transition-colors duration-500",
                  isGirlyMode ? "bg-white/40 border-pink-100 shadow-sm shadow-pink-500/5" :
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/60 border-zinc-200 shadow-sm"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={cn("font-bold", isGirlyMode ? "text-pink-500" : "text-emerald-500")}>{weeklyPlan[currentDayIndex].day} - {weeklyPlan[currentDayIndex].type}</h4>
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
                            ex.completed && (isGirlyMode ? "opacity-40 line-through text-pink-300" : isDarkMode ? "opacity-50 line-through" : "opacity-40 line-through")
                          )}>
                            <p className={cn("text-sm font-bold", isGirlyMode && !ex.completed ? "text-pink-900" : "")}>{ex.name}</p>
                            <p className={cn(
                              "text-[10px] font-medium",
                              isGirlyMode ? "text-pink-400" : isDarkMode ? "text-zinc-500" : "text-zinc-400"
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
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3 max-w-full w-full">
                  <div className={cn(
                    "flex p-1 rounded-xl whitespace-nowrap gap-1 w-full justify-between items-center",
                    isDarkMode ? "bg-zinc-900/50" : "bg-zinc-100"
                  )}>
                    <button 
                      onClick={() => setHistorySubView('journal')}
                      className={cn(
                        "flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all shrink-0 justify-center flex-1",
                        historySubView === 'journal' 
                          ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" 
                          : isDarkMode ? "text-zinc-500 hover:text-zinc-350 dark:text-zinc-400" : "text-zinc-500 hover:text-zinc-700"
                      )}
                    >
                      <Layout className="w-3.5 h-3.5" />
                      Journal
                    </button>
                    <button 
                      onClick={() => setHistorySubView('plans')}
                      className={cn(
                        "flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all shrink-0 justify-center flex-1",
                        historySubView === 'plans' 
                          ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" 
                          : isDarkMode ? "text-zinc-500 hover:text-zinc-350 dark:text-zinc-400" : "text-zinc-500 hover:text-zinc-700"
                      )}
                    >
                      <Folder className="w-3.5 h-3.5" />
                      Exercise Plans
                    </button>
                    <button 
                      onClick={() => setHistorySubView('articles')}
                      className={cn(
                        "flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all shrink-0 justify-center flex-1",
                        historySubView === 'articles' 
                          ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" 
                          : isDarkMode ? "text-zinc-500 hover:text-zinc-350 dark:text-zinc-400" : "text-zinc-500 hover:text-zinc-700"
                      )}
                    >
                      <Layout className="w-3.5 h-3.5" />
                      Articles
                    </button>
                    <button 
                      onClick={() => setHistorySubView('digest')}
                      className={cn(
                        "flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all shrink-0 justify-center flex-1",
                        historySubView === 'digest' 
                          ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20" 
                          : isDarkMode ? "text-zinc-500 hover:text-zinc-350 dark:text-zinc-400" : "text-zinc-500 hover:text-zinc-700"
                      )}
                    >
                      <Newspaper className="w-3.5 h-3.5" />
                      Daily Digest
                    </button>
                  </div>
                </div>
                {(historySubView !== 'plans' && (historySubView === 'journal' || historySubView === 'articles') && user) && (
                <button 
                  onClick={() => {
                    if (historySubView === 'journal') setIsAddingWorkout(true);
                    else if (historySubView === 'articles') setIsAddingArticle(true);
                  }}
                  className="hidden sm:flex bg-emerald-500 text-zinc-950 px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-xs font-bold items-center gap-2 hover:bg-emerald-400 shrink-0"
                  id="desktop-add-log-btn"
                >
                  <Plus className="w-4 h-4 text-zinc-950 stroke-[3]" />
                  <span>Log {historySubView === 'journal' ? 'Workout' : 'Article'}</span>
                </button>
                )}
              </div>

              {/* Prominent, easy-to-use full-width action button for mobile devices */}
              {(historySubView !== 'plans' && (historySubView === 'journal' || historySubView === 'articles') && user) && (
                <div className="block sm:hidden w-full mb-4 px-1" id="mobile-add-log-container">
                  <button 
                    onClick={() => {
                      if (historySubView === 'journal') setIsAddingWorkout(true);
                      else if (historySubView === 'articles') setIsAddingArticle(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-black uppercase text-xs rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all tracking-widest leading-none"
                    id="mobile-add-log-btn-prominent"
                  >
                    <Plus className="w-4 h-4 stroke-[3] text-zinc-950" />
                    <span>Log New {historySubView === 'journal' ? 'Workout Log' : 'Intellectual Article'}</span>
                  </button>
                </div>
              )}

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
              ) : historySubView === 'plans' ? (
                <div className="space-y-6">
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
              </div>
            ) : historySubView === 'articles' ? (
                <div className="space-y-6">
                  {articles.map(article => (
                    <ArticleCard 
                      key={article.id}
                      article={article}
                      isDarkMode={isDarkMode}
                      onDelete={deleteArticle}
                      onEdit={openEditArticle}
                      user={user}
                      userProfile={userProfile}
                    />
                  ))}
                  {articles.length === 0 && (
                    <div className={cn(
                      "flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed",
                      isDarkMode ? "border-zinc-800" : "border-zinc-200"
                    )}>
                      <Layout className="w-12 h-12 text-zinc-700 mb-4" />
                      <p className="text-zinc-500 font-medium">No articles yet.</p>
                      <p className="text-zinc-600 text-xs mt-1">Share your long-form insights here.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 text-left">
                  {/* Sanctuary Digest View */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className={cn(
                        "text-xs font-mono font-bold uppercase tracking-wider",
                        isDarkMode ? "text-emerald-400" : "text-emerald-600"
                      )}>
                        Source: wisefitorg.com/digest
                      </p>
                      <p className={cn(
                        "text-[10px] font-mono uppercase tracking-wide mt-0.5",
                        isDarkMode ? "text-zinc-500" : "text-zinc-400"
                      )}>
                        Updated: {digestData?.lastUpdated || "Live Feed"}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Secondary Switch Selector */}
                      <div className={cn(
                        "flex p-1 rounded-xl",
                        isDarkMode ? "bg-zinc-900/40" : "bg-zinc-200/50"
                      )}>
                        <button
                          onClick={() => setDigestTab('quotes')}
                          className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                            digestTab === 'quotes'
                              ? isDarkMode ? "bg-zinc-800 text-zinc-100" : "bg-white text-zinc-800 shadow"
                              : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          💡 Wise Quotes ({digestData?.quotes?.length || 0})
                        </button>
                        <button
                          onClick={() => setDigestTab('news')}
                          className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                            digestTab === 'news'
                              ? isDarkMode ? "bg-zinc-800 text-zinc-100" : "bg-white text-zinc-800 shadow"
                              : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          🛍️ News & Commerce ({digestData?.news?.length || 0})
                        </button>
                      </div>

                      <button
                        onClick={() => fetchSanctuaryDigest(true)}
                        disabled={isFetchingDigest}
                        className={cn(
                          "p-2 rounded-xl border transition-all active:scale-95",
                          isDarkMode 
                            ? "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200" 
                            : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200"
                        )}
                        title="Force Refresh Data"
                      >
                        <RefreshCw className={cn("w-4 h-4", isFetchingDigest && "animate-spin")} />
                      </button>
                    </div>
                  </div>

                  {/* Loading placeholder */}
                  {isFetchingDigest && !digestData && (
                    <div className={cn(
                      "flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed transition-colors",
                      isDarkMode ? "border-zinc-800 bg-zinc-900/10" : "border-zinc-300 bg-zinc-50"
                    )}>
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                      <p className="font-bold text-sm">Harvesting Sanctuary Commons...</p>
                      <p className="text-xs text-zinc-500 mt-1">Retrieving 100 wise quotes and live research updates...</p>
                    </div>
                  )}

                  {/* Error Card */}
                  {digestError && (
                    <div className={cn(
                      "p-6 rounded-3xl border text-center space-y-4",
                      isDarkMode ? "bg-red-500/5 border-red-500/10" : "bg-red-50 border-red-200"
                    )}>
                      <p className="text-red-400 text-sm font-medium">{digestError}</p>
                      <button
                        onClick={() => fetchSanctuaryDigest(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-600 transition-colors"
                      >
                        Try Scraping Again
                      </button>
                    </div>
                  )}

                  {/* Empty State */}
                  {digestData && digestTab === 'quotes' && digestData.quotes.length === 0 && (
                    <div className="p-12 rounded-3xl text-center border-2 border-dashed border-zinc-800 text-zinc-500">
                      Empty wisdom pool. Try refreshing.
                    </div>
                  )}
                  {digestData && digestTab === 'news' && digestData.news.length === 0 && (
                    <div className="p-12 rounded-3xl text-center border-2 border-dashed border-zinc-800 text-zinc-500">
                      No research news found. Try refreshing.
                    </div>
                  )}

                  {/* Quotes Feed */}
                  {digestData && digestTab === 'quotes' && digestData.quotes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {digestData.quotes.map((quote: any, idx: number) => (
                        <DigestQuoteCard
                          key={quote.id || idx}
                          quote={quote}
                          idx={idx}
                          isDarkMode={isDarkMode}
                          onExpand={expandQuoteWithStoicAI}
                          cn={cn}
                        />
                      ))}
                    </div>
                  )}

                  {/* News Articles Feed */}
                  {digestData && digestTab === 'news' && digestData.news.length > 0 && (
                    <div className="space-y-4">
                      {digestData.news.map((item: any, idx: number) => (
                        <a
                          key={item.id || idx}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "block p-5 rounded-3xl border transition-all duration-300 group hover:-translate-y-0.5 text-left",
                            isDarkMode 
                              ? "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/65 hover:border-emerald-500/30" 
                              : "bg-white border-zinc-200 hover:bg-zinc-50 hover:border-emerald-500/30 shadow-sm hover:shadow-md"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                                  {item.date}
                                </span>
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide",
                                  isDarkMode ? "bg-zinc-800 text-zinc-400 border border-zinc-700/50" : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                                )}>
                                  {item.category}
                                </span>
                              </div>
                              <h3 className={cn(
                                "text-sm md:text-base font-bold pr-4 transition-colors group-hover:text-emerald-400 leading-snug",
                                isDarkMode ? "text-zinc-100" : "text-zinc-800"
                              )}>
                                {item.title}
                              </h3>
                            </div>
                            <div className={cn(
                              "p-2.5 rounded-xl transition-all self-start shrink-0",
                              isDarkMode ? "bg-zinc-805 text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800" : "bg-zinc-100 text-zinc-600 group-hover:bg-emerald-500 group-hover:text-zinc-950"
                            )}>
                              <ExternalLink className="w-4 h-4" />
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Stoic Expansion Overlay Dialog */}
                  <AnimatePresence>
                    {expandedQuote && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-zinc-950/80 text-left"
                        onClick={() => setExpandedQuote(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.95, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.95, y: 20 }}
                          className={cn(
                            "w-full max-w-lg rounded-3xl border p-6 md:p-8 shadow-2xl relative space-y-6 overflow-hidden",
                            isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-200" : "bg-white border-zinc-200 text-zinc-800"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Close Button */}
                          <button
                            onClick={() => setExpandedQuote(null)}
                            className="absolute top-4 right-4 p-2.5 rounded-full transition-all z-30 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 border border-rose-450/30 active:scale-95 flex items-center justify-center cursor-pointer"
                            title="Close Dialogue"
                          >
                            <X className="w-4 h-4 stroke-[3px]" />
                          </button>

                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-400">
                              <Sparkles className="w-5 h-5 animate-pulse shrink-0" />
                              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Stoic AI Mentor Dialogue</span>
                            </div>
                            
                            <blockquote className={cn(
                              "border-l-2 border-emerald-500/50 pl-4 py-1 italic font-medium text-sm md:text-base leading-relaxed",
                              isDarkMode ? "text-zinc-350 text-zinc-300" : "text-zinc-600"
                            )}>
                              "{expandedQuote.text}"
                              <span className="block text-xs font-mono font-bold uppercase text-emerald-500 mt-2 not-italic">— {expandedQuote.author}</span>
                            </blockquote>
                          </div>

                          <div className={cn(
                            "p-5 rounded-2xl border min-h-[140px] flex flex-col justify-center relative overflow-hidden",
                            isDarkMode ? "bg-zinc-950/40 border-zinc-800/60 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"
                          )}>
                            {isExpandingQuote ? (
                              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                <p className="text-[10px] font-mono tracking-wider animate-pulse uppercase">AI Stoic is meditating...</p>
                              </div>
                            ) : expansionError ? (
                              <p className="text-red-400 text-xs font-medium text-center">{expansionError}</p>
                            ) : (
                              <p className="text-sm md:text-base leading-relaxed font-sans first-letter:text-emerald-400 first-letter:font-bold first-letter:text-lg">
                                {expandedQuoteInterpretation}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => setExpandedQuote(null)}
                              className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all active:scale-95"
                            >
                              Close Mentor Dialogue
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              {isPremiumUser ? (
                <YogaView 
                  isDarkMode={isDarkMode} 
                  isGirlyMode={isGirlyMode}
                  onMarkAsWise={markQuoteAsSeen}
                  isSessionActive={isYogaSessionActive}
                  setIsSessionActive={setIsYogaSessionActive}
                />
              ) : (
                <div className="max-w-md mx-auto">
                  <WiseFitPlusPaywall 
                    isDarkMode={isDarkMode} 
                    isGirlyMode={isGirlyMode} 
                    userEmail={user?.email} 
                    onSuccess={handleUpgradeSuccess} 
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Training the Mind</h2>
              <QuizView isDarkMode={isDarkMode} isGirlyMode={isGirlyMode} user={user} />
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
                <div 
                  onClick={() => setIsSelectingAvatar(true)}
                  className={cn(
                    "w-24 h-24 rounded-full border-4 flex items-center justify-center overflow-hidden transition-all cursor-pointer hover:scale-105 active:scale-95 group relative",
                    isGirlyMode ? "bg-pink-100 border-pink-500/20" : isDarkMode ? "bg-zinc-800 border-emerald-500/20" : "bg-zinc-200 border-emerald-500/10"
                  )}
                >
                  <img 
                    src={userProfile.avatarUrl} 
                    alt="Avatar" 
                    className={cn("w-full h-full object-cover transition-transform group-hover:scale-110", isGirlyMode && "saturate-150")}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className={cn("text-2xl font-bold", isGirlyMode ? "text-pink-900" : "")}>{userProfile.name}</h2>
                  <p className={cn(
                    "font-medium transition-colors mb-2",
                    isGirlyMode ? "text-pink-600/60" : isDarkMode ? "text-zinc-500" : "text-zinc-400"
                  )}>{user?.email}</p>
                  
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className={cn(
                      "mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all active:scale-95 cursor-pointer shadow-sm",
                      isGirlyMode 
                        ? "bg-pink-50 border-pink-100 text-pink-600 hover:bg-pink-100" 
                        : isDarkMode 
                          ? "bg-zinc-900/60 border-zinc-800 text-emerald-400 hover:bg-zinc-800" 
                          : "bg-white border-zinc-250 text-emerald-500 hover:bg-zinc-50"
                    )}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Profile Details</span>
                  </button>
                </div>
              </div>

              {/* WiseFit Plus Sanctuary Card */}
              <div className={cn(
                "p-5 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-500",
                userProfile.isSubscribed 
                  ? (isGirlyMode ? "bg-pink-500/10 border-pink-500/30" : "bg-emerald-500/10 border-emerald-500/30")
                  : (isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200")
              )}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full",
                      userProfile.isSubscribed
                        ? (isGirlyMode ? "bg-pink-500 text-white" : "bg-emerald-500 text-zinc-950")
                        : (isDarkMode ? "bg-zinc-850 text-zinc-400" : "bg-zinc-200 text-zinc-600")
                    )}>
                      {userProfile.isSubscribed ? "WiseFit Plus Sanctuary Mode" : "WiseFit Standard"}
                    </span>
                    {userProfile.isSubscribed && (
                      <span className="text-[10px] font-black opacity-80 flex items-center gap-1 text-emerald-500">
                        <Check className="w-3.5 h-3.5" />
                        {userProfile.subscriptionType === 'lifetime' ? 'Lifetime Patron' : 'Monthly Member'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold mt-1">
                    {userProfile.isSubscribed 
                      ? "Your connection to the premium intelligence suite is active." 
                      : "Upgrade to WiseFit Plus for full AI & Ritual unlocks."}
                  </h3>
                  <p className={cn("text-xs transition-colors", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                    {userProfile.isSubscribed 
                      ? "You have full, cloud-persistent access to Sage AI Coach, Psychology Clinic, Scholarly Swarm feed, and all Yoga Rituals." 
                      : "Subscribing supports high-fidelity servers and unlocks the full mental & body discipline suite."}
                  </p>
                </div>

                {userProfile.isSubscribed ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to end your active subscription? This will lock premium AI features.")) {
                        const updated = { ...userProfile, isSubscribed: false, subscriptionType: undefined };
                        if (user) {
                          await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
                        } else {
                          localStorage.removeItem('guest_subscription');
                        }
                        setUserProfile(updated);
                      }
                    }}
                    className="shrink-0 text-[11px] font-bold text-red-500 hover:text-red-400 active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel Membership
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('chat');
                    }}
                    className={cn(
                      "shrink-0 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition-all active:scale-95 shadow-lg cursor-pointer",
                      isGirlyMode ? "bg-pink-500 text-white" : "bg-emerald-500 text-zinc-950"
                    )}
                  >
                    <Sparkles className="w-4 h-4" /> Go Premium
                  </button>
                )}
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
                    className={cn(
                      "text-xs font-bold",
                      isGirlyMode ? "text-pink-500" : "text-emerald-500"
                    )}
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
                <ProfileItem label="Height" value={`${userProfile.height} cm`} isDarkMode={isDarkMode} isGirlyMode={isGirlyMode} />
                <ProfileItem label="Current Weight" value={`${userProfile.currentWeight} kg`} isDarkMode={isDarkMode} isGirlyMode={isGirlyMode} />
                <ProfileItem label="Target Weight" value={`${userProfile.targetWeight} kg`} isDarkMode={isDarkMode} isGirlyMode={isGirlyMode} />
                <ProfileItem label="Goal" value="23 Max Pull-ups" isDarkMode={isDarkMode} isGirlyMode={isGirlyMode} />
                <ProfileItem label="Short-term Goal" value={userProfile.shortTermGoal} isDarkMode={isDarkMode} isGirlyMode={isGirlyMode} />
                <ProfileItem label="Long-term Goal" value={userProfile.longTermGoal} isDarkMode={isDarkMode} isGirlyMode={isGirlyMode} />
              </div>

              <WisdomScoreboard userProfile={userProfile} isDarkMode={isDarkMode} />

              {/* Biometric Intelligence Dashboard */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className={cn(
                    "text-sm font-bold uppercase tracking-widest transition-colors",
                    isGirlyMode ? "text-pink-500/60" : isDarkMode ? "text-zinc-500" : "text-zinc-400"
                  )}>Biometric Intelligence</h3>
                  {userProfile.integrations?.googleFit?.connected && (
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border",
                      isGirlyMode ? "text-pink-500 bg-pink-500/10 border-pink-500/20" : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    )}>LIVE PULSE Active</span>
                  )}
                </div>
                <BiometricDashboard 
                  data={userProfile.weeklyHealthData || []} 
                  personalRecords={userProfile.personalRecords || []}
                  isDarkMode={isDarkMode} 
                  onSync={() => userProfile.integrations?.googleFit?.accessToken && syncHealthData(userProfile.integrations.googleFit.accessToken)}
                />
              </div>

              {/* Training Stats Section */}
              <div className="space-y-4">
                <h3 className={cn(
                  "text-sm font-bold uppercase tracking-widest px-2 transition-colors",
                  isDarkMode ? "text-zinc-500" : "text-zinc-400"
                )}>Training Performance</h3>
                
                <div className={cn(
                  "backdrop-blur-md border rounded-3xl p-6 transition-colors duration-500",
                  isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white/60 border-zinc-200 shadow-sm"
                )}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={cn(
                      "text-[10px] uppercase font-black tracking-widest transition-colors",
                      isDarkMode ? "text-zinc-400" : "text-zinc-500"
                    )}>Weight Trend (kg)</h3>
                    <button 
                      onClick={() => setIsLoggingWeight(true)}
                      className="text-xs font-bold text-emerald-500 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Log
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
                        placeholder="Weight..."
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
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  <div className="h-48 w-full">
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
                          tickFormatter={(val) => `${val.toFixed(0)}`}
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
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
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
                      "text-[10px] uppercase font-bold mb-1 transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Workouts</p>
                    <p className="text-2xl font-black italic text-emerald-500">{workouts.length}</p>
                  </div>
                  <div className={cn(
                    "backdrop-blur-md border rounded-2xl p-4 transition-colors duration-500",
                    isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white/60 border-zinc-200 shadow-sm"
                  )}>
                    <p className={cn(
                      "text-[10px] uppercase font-bold mb-1 transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Consistency</p>
                    {(() => {
                      const history = userProfile.dailyExerciseHistory || [];
                      const totalCompleted = history.reduce((acc, h) => acc + h.completedCount, 0);
                      const totalAssigned = history.reduce((acc, h) => acc + h.totalCount, 0);
                      const consistency = totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;
                      return (
                        <p className="text-2xl font-black italic text-blue-500">{consistency.toFixed(0)}%</p>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* WiseFit Vision & Roadmap Section */}
              <div className={cn(
                "backdrop-blur-md border rounded-3xl p-6 space-y-6 transition-colors duration-500 overflow-hidden relative",
                isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white/60 border-zinc-200 shadow-sm"
              )}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Scroll className="w-24 h-24 rotate-12" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-bold">WiseFit News & Roadmap</h3>
                      <p className={cn(
                        "text-[10px] uppercase font-black tracking-widest",
                        isDarkMode ? "text-emerald-500/70" : "text-emerald-600"
                      )}>The Future of Discipline</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase text-zinc-500 tracking-tighter">I. News & Recent Updates</h4>
                      <ul className="grid gap-2">
                        {[
                          "Global deployment to wisefit.fun successfully completed.",
                          "Full Firebase Cloud persistence integrated for all users.",
                          "AI Wisdom Engine upgraded to Gemini 1.5 for deeper insights.",
                          "Nature-themed meditative environments added to Yoga flows."
                        ].map((news, i) => (
                          <li key={i} className="flex gap-2 text-xs">
                            <span className="text-emerald-500 mt-0.5">●</span>
                            <span className={isDarkMode ? "text-zinc-400" : "text-zinc-600"}>{news}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[11px] font-black uppercase text-zinc-500 tracking-tighter">II. Action Plan (Stoic Milestones)</h4>
                      <div className="space-y-3">
                        <div className="p-3 rounded-2xl bg-zinc-800/30 border border-zinc-800/50">
                          <p className="text-[10px] font-bold text-emerald-500 mb-1">III. THE SOCIAL PALADIN (Q3 2026)</p>
                          <p className="text-xs text-zinc-400">Launch of "The Scroll" - a curated vertical feed of Roman history, Stoic bursts, and advanced calisthenics technique.</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-zinc-800/10 border border-zinc-800/10">
                          <p className="text-[10px] font-bold text-zinc-500 mb-1">IV. MASTERY & MENTORSHIP (Q4 2026)</p>
                          <p className="text-xs text-zinc-500">Introduction of personalized AI mentorship paths and community challenge tiers.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-zinc-800/50">
                      <h4 className="text-[11px] font-black uppercase text-purple-500 tracking-tighter italic">Revolutionary Vision: tiktok for the Wise</h4>
                      <p className={cn(
                        "text-xs leading-relaxed",
                        isDarkMode ? "text-zinc-400" : "text-zinc-600"
                      )}>
                        We are building more than a tracker. We are building a <span className="text-zinc-100 font-bold">Social Knowledge Network</span>. Imagine a TikTok-style "Wise Scroll" where instead of mindless entertainment, you consume:
                      </p>
                      <ul className="grid grid-cols-2 gap-2 mt-2">
                        {["History Learning", "Stoic Wisdom", "Technique Tips", "Life Strategy"].map((tag) => (
                          <div key={tag} className="px-2 py-1 bg-zinc-800/50 rounded-lg text-[9px] font-bold text-zinc-300 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-500" /> {tag}
                          </div>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn(
                "backdrop-blur-md border rounded-3xl p-6 space-y-5 transition-colors duration-500 relative overflow-hidden",
                isDarkMode ? "bg-zinc-900/60 border-zinc-800" : "bg-emerald-50/40 border-emerald-200/60 shadow-sm"
              )}>
                {/* Visual Accent */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15 text-[9px] font-black uppercase text-emerald-500 tracking-widest select-none">
                    Investor Pitch
                  </div>
                  <h3 className="text-normal font-extrabold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Developer & Investor Brief
                  </h3>
                </div>

                <div className="space-y-4">
                  <p className={cn(
                    "text-xs leading-relaxed",
                    isDarkMode ? "text-zinc-350" : "text-zinc-600"
                  )}>
                    WiseFit has strategically evolved past basic biometric tracking to own the high-LTV seam between 
                    <strong> physical discipline, physiological signals, and deep intellectual alignment</strong>. 
                  </p>

                  {/* Dual Position Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div className={cn(
                      "p-3.5 rounded-2xl border",
                      isDarkMode ? "bg-zinc-950/40 border-zinc-850" : "bg-white border-zinc-150 shadow-sm"
                    )}>
                      <div className="flex items-center gap-1.5 mb-1 text-purple-400">
                        <Heart className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-pink-500">Dual-Utility Dating</h4>
                      </div>
                      <p className="text-[10.5px] leading-relaxed text-zinc-400">
                        WiseFit is now a premier high-signal **Seekers Swarm Dating & Relationship Sanctuary**. It screens candidates through scientific mental assessments, biometric data matching, and peer-reviewed moderation by AI using modern psychology evaluation to prevent dating app "noise" or "slop".
                      </p>
                    </div>

                    <div className={cn(
                      "p-3.5 rounded-2xl border",
                      isDarkMode ? "bg-zinc-950/40 border-zinc-850" : "bg-white border-zinc-150 shadow-sm"
                    )}>
                      <div className="flex items-center gap-1.5 mb-1 text-emerald-500">
                        <LineChart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-450">Slavic Regional Moat</h4>
                      </div>
                      <p className="text-[10.5px] leading-relaxed text-zinc-400">
                        Our regional edge in the Croatian and broader Slavic wellness landscape pairs historical philosophers (Krleža, Tesla, Andrić) with custom local voices, establishing a defensible market entry point and high organic engagement.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-zinc-800/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium font-sans">Strategic Target Exit Valuation</span>
                      <span className="text-emerald-500 font-extrabold text-sm tracking-tight">€5.0M - €15.0M</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium font-sans">Path to Acquisition</span>
                      <span className="font-bold text-zinc-300">Whoop, Oura, Garmin or Calm</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium font-sans">Active Valuation Status</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-[8px] font-black uppercase tracking-widest font-mono">
                        €10M Strategic Target Runway
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium font-sans">Core Proprietary IP</span>
                      <span className="font-bold text-zinc-300">Biometric-to-Philosophy Matching</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[9px] text-zinc-500 italic text-center">
                    "Bridging biometric metrics and intellectual intimacy for the world's most disciplined seekers."
                  </p>
                </div>
              </div>

              {/* Health Device Integrations */}
              <div className="space-y-4">
                <h3 className={cn(
                  "text-sm font-bold uppercase tracking-widest px-2 transition-colors",
                  isDarkMode ? "text-zinc-500" : "text-zinc-400"
                )}>Device Ecosystem</h3>
                
                <div className="grid gap-3">
                  {/* Google Fitness Integration (Pixel Watch 3 + Fitbit) */}
                  <div className={cn(
                    "p-5 rounded-3xl border transition-all flex items-center justify-between overflow-hidden relative",
                    isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                  )}>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="font-bold">Google Fitness</h4>
                        <p className="text-xs text-zinc-500 font-medium tracking-tight">Sync Pixel Watch 3 & Health data</p>
                        {userProfile.integrations?.googleFit?.lastSync && (
                          <p className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-widest mt-1">
                            Synced {format(new Date(userProfile.integrations.googleFit.lastSync), 'HH:mm')}
                          </p>
                        )}
                      </div>
                    </div>
                    {userProfile.integrations?.googleFit?.connected ? (
                      <div className="flex gap-2 relative z-10">
                        <button 
                          onClick={() => userProfile.integrations?.googleFit?.accessToken && syncHealthData(userProfile.integrations.googleFit.accessToken)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all active:scale-95",
                            isDarkMode ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                          )}
                        >
                          <RefreshCw className={cn("w-4 h-4 text-emerald-500", isConnectingHealth && "animate-spin")} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Sync</span>
                        </button>
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Linked</span>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={connectGoogleFit}
                        disabled={!!isConnectingHealth}
                        className="text-xs font-black uppercase tracking-widest text-emerald-500 px-4 py-2 bg-emerald-500/10 rounded-xl hover:bg-emerald-500/20 transition-all border border-emerald-500/20 relative z-10"
                      >
                        {isConnectingHealth === 'google-health' ? 'Linking...' : 'Connect'}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-zinc-500 px-4 italic leading-relaxed">
                  * Integrations allow WiseFit to automatically sync your daily weight from your scale and steps from your watch to your Stoic progression metrics.
                </p>
              </div>

              {/* PWA / Android Download Section */}
              <div className="space-y-4">
                <h3 className={cn(
                  "text-sm font-bold uppercase tracking-widest px-2 transition-colors",
                  isDarkMode ? "text-zinc-500" : "text-zinc-400"
                )}>Native System Path</h3>

                <div className={cn(
                  "p-6 rounded-3xl border transition-all relative overflow-hidden",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                )}>
                  {/* Decorative faint background phone icon */}
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none">
                    <Smartphone className="w-48 h-48 rotate-12" />
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2 max-w-md">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h4 className="font-bold text-base">WiseFit for Android</h4>
                      </div>
                      <p className={cn(
                        "text-xs leading-relaxed",
                        isDarkMode ? "text-zinc-400" : "text-zinc-500"
                      )}>
                        Run WiseFit directly on your Android device as a standalone application. Access premium biometric sync with optimized frame latency, system haptics, and pure distraction-free immersive space.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {isPwaInstalled ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-3 rounded-2xl border border-emerald-500/20 justify-center">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                          <span className="text-xs font-black uppercase tracking-widest text-emerald-500">System Installed</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleInstallPwa}
                          className="px-6 py-3.5 rounded-2xl bg-emerald-500 text-zinc-950 font-black italic tracking-tighter shadow-lg shadow-emerald-500/10 active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase text-xs"
                        >
                          <Smartphone className="w-4 h-4" /> Install WiseFit App
                        </button>
                      )}
                      
                      <button
                        onClick={() => setShowAndroidInstallGuide(true)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider",
                          isDarkMode 
                            ? "border-zinc-800 hover:border-zinc-700 bg-zinc-800/25 text-zinc-400 hover:text-white" 
                            : "border-zinc-200 hover:border-zinc-300 bg-zinc-50 text-zinc-500 hover:text-zinc-800"
                        )}
                      >
                        Installation Manual
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Membership Pricing Section */}
              <div className="space-y-4">
                <h3 className={cn(
                  "text-sm font-bold uppercase tracking-widest px-2 transition-colors",
                  isDarkMode ? "text-zinc-500" : "text-zinc-400"
                )}>Membership Path</h3>
                
                <div className="grid gap-4">
                  {/* Free Tier */}
                  <div className={cn(
                    "p-6 rounded-3xl border transition-all relative overflow-hidden",
                    isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"
                  )}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold">Disciple</h4>
                        <p className="text-xs text-zinc-500 font-medium tracking-tight">The Foundation</p>
                      </div>
                      <p className="text-2xl font-black italic">Free</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {["Workout Tracking", "Basic Library Access", "Community Journal"].map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button className={cn(
                      "w-full py-3 rounded-2xl font-bold text-sm transition-all",
                      isDarkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                    )}>
                      Current Plan
                    </button>
                  </div>

                  {/* Pro Tier (Featured) */}
                  <div className={cn(
                    "p-6 rounded-3xl border-2 transition-all relative overflow-hidden",
                    isDarkMode ? "bg-emerald-950/10 border-emerald-500/50" : "bg-emerald-50/50 border-emerald-500/30"
                  )}>
                    <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase rounded-bl-xl tracking-widest">
                      Recommended
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold">Philosopher</h4>
                        <p className="text-xs text-emerald-600 font-medium tracking-tight">The Practitioner</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black italic">€5</p>
                        <p className="text-[10px] uppercase font-bold text-zinc-500">per month</p>
                        <p className="text-[9px] font-bold text-emerald-500 tracking-tight text-right mt-0.5">Monthly Subscription</p>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {["Unlimited AI Wisdom", "AI Stoic Coaching", "Full Cloud Persistence", "Custom Soundscapes"].map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 rounded-2xl bg-emerald-500 text-zinc-950 font-bold text-sm hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                      Begin Practice
                    </button>
                  </div>

                  {/* Elite Tier */}
                  <div className={cn(
                    "p-6 rounded-3xl border transition-all relative overflow-hidden",
                    isDarkMode ? "bg-purple-950/10 border-purple-500/20" : "bg-purple-50/50 border-purple-200"
                  )}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold">Stoic Sage</h4>
                        <p className="text-xs text-purple-500 font-medium tracking-tight">The Master</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black italic">€249</p>
                        <p className="text-[10px] uppercase font-bold text-zinc-500">per year</p>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {["Early Access: Social Paladin", "Advanced Calisthenics Tracks", "Historical Mastery Courses", "Direct Mentorship Channels"].map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs font-medium">
                          <Check className="w-3.5 h-3.5 text-purple-500" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 rounded-2xl bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 active:scale-95 transition-all shadow-lg shadow-purple-500/20">
                      Master the Path
                    </button>
                  </div>
                </div>
              </div>

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
                  disabled={isGeneratingQuotes}
                  className={cn(
                    "w-full py-3 rounded-2xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2",
                    isGeneratingQuotes
                      ? (isDarkMode ? "bg-zinc-800 text-zinc-600" : "bg-zinc-100 text-zinc-400")
                      : "bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/20"
                  )}
                >
                  {isGeneratingQuotes ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Wisdom...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate 50 More Quotes
                    </>
                  )}
                </button>

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
              </div>

              {/* Admin Management Section */}
              {user?.email && ADMIN_EMAILS.includes(user.email) && (
                <div className={cn(
                  "backdrop-blur-md border rounded-3xl p-6 space-y-4 transition-colors duration-500",
                  "bg-purple-900/10 border-purple-500/20 shadow-xl shadow-purple-500/5 ring-1 ring-purple-500/30"
                )}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <Database className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900">Admin Sanctuary</h3>
                      <p className="text-[10px] uppercase font-black tracking-widest text-purple-500/70">System Controls</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={seedPsychologyInsights}
                      disabled={isSeedingInsights}
                      className={cn(
                        "w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg",
                        "bg-purple-600 text-white hover:bg-purple-500 shadow-purple-950/20"
                      )}
                    >
                      {isSeedingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Seed Psychology Insights (100)
                    </button>
                    <p className="text-[9px] text-purple-500/60 font-medium leading-relaxed px-1">
                      * This will populate the 'psychology_insights' collection in Firestore with the 100 specialized insights for revision.
                    </p>
                  </div>

                  {/* Manual PayPal activations section */}
                  <div className="border-t border-purple-500/10 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-bold text-zinc-300">Pending PayPal Activations</span>
                      </div>
                      <button
                        onClick={fetchSupportTickets}
                        disabled={isFetchingTickets}
                        className="p-1 hover:bg-purple-500/10 rounded-lg text-purple-400 transition-all cursor-pointer"
                        title="Reload tickets"
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5", isFetchingTickets && "animate-spin")} />
                      </button>
                    </div>

                    {isFetchingTickets ? (
                      <div className="text-center py-4 text-zinc-500 text-[10px]">
                        Scanning Firestore secure ledger...
                      </div>
                    ) : supportTickets.length === 0 ? (
                      <div className="text-center py-4 text-purple-400/50 text-[10px] bg-zinc-950/20 rounded-2xl border border-purple-500/5">
                        No pending activation claims detected.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {supportTickets.map((ticket) => (
                          <div 
                            key={ticket.id}
                            className="p-3 rounded-2xl bg-zinc-950/40 border border-purple-500/10 space-y-2 text-[10px]"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5 text-left">
                                <p className="text-zinc-500 text-[9px]">App Login Account:</p>
                                <p className="font-bold text-white font-mono break-all">{ticket.appEmail}</p>
                              </div>
                              <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[8px] font-black uppercase tracking-wider shrink-0 ml-2">
                                {ticket.tier === 'monthly' ? 'Monthly' : 'Lifetime'}
                              </span>
                            </div>

                            <div className="space-y-0.5 text-left">
                              <p className="text-zinc-500 text-[9px]">PayPal Checkout Email:</p>
                              <p className="font-bold text-sky-400 font-mono break-all">{ticket.paypalEmail}</p>
                            </div>

                            {ticket.message && (
                              <div className="p-1.5 bg-black/30 rounded-lg text-zinc-400 leading-normal italic text-[9px] border border-zinc-800/20 text-left">
                                "{ticket.message}"
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-1 border-t border-purple-500/5">
                              <span className="text-zinc-500 text-[8px]">
                                Claimed: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Unknown'}
                              </span>
                              
                              <button
                                onClick={() => handleActivateTicket(ticket)}
                                disabled={isActivatingTicket === ticket.id}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-450 text-zinc-950 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                              >
                                {isActivatingTicket === ticket.id ? (
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                ) : (
                                  <Check className="w-2.5 h-2.5" />
                                )}
                                Approve & Activate
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* System Integrity & Diagnostics */}
              <div className={cn(
                "backdrop-blur-md border rounded-3xl p-6 space-y-4 transition-colors duration-500",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/60 border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold">AI Bridge Diagnosis</h4>
                    <p className="text-xs opacity-60">Verify fallback paths to Gemini and Claude.</p>
                  </div>
                  <button 
                    onClick={runDiagnostics}
                    disabled={isDiagnosing}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                      isDiagnosing ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95",
                      isGirlyMode ? "bg-pink-500 text-white" : isDarkMode ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"
                    )}
                  >
                    <Activity className={cn("w-3 h-3", isDiagnosing && "animate-spin")} />
                    {isDiagnosing ? "Analyzing..." : "Check System"}
                  </button>
                </div>

                {diagnostics && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className={cn("p-3 rounded-2xl border", diagnostics.gemini.status === 'ok' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20")}>
                      <p className="text-[10px] uppercase font-bold opacity-50 mb-1">Gemini</p>
                      <p className="text-sm font-bold">{diagnostics.gemini.status === 'ok' ? 'Online' : 'Error'}</p>
                      {diagnostics.gemini.error && <p className="text-[8px] opacity-40 mt-1 leading-tight break-words">{diagnostics.gemini.error}</p>}
                    </div>
                    <div className={cn("p-3 rounded-2xl border", diagnostics.anthropic.status === 'ok' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20")}>
                      <p className="text-[10px] uppercase font-bold opacity-50 mb-1">Claude</p>
                      <p className="text-sm font-bold">{diagnostics.anthropic.status === 'ok' ? 'Online' : (diagnostics.anthropic.status === 'no_key' ? 'No Key' : 'Error')}</p>
                      {diagnostics.anthropic.error && <p className="text-[8px] opacity-40 mt-1 leading-tight break-words">{diagnostics.anthropic.error}</p>}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-500/10">
                  <div className="flex items-center gap-3">
                    <Database className={cn("w-4 h-4", isQuotaExceeded ? "text-red-500" : "text-emerald-500")} />
                    <span className="text-xs font-bold">Firestore Engine</span>
                  </div>
                  <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", isQuotaExceeded ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500")}>
                    {isQuotaExceeded ? "Quota Limit" : "Stable"}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className={cn(
                  "w-full py-4 border rounded-2xl font-bold text-red-500 active:scale-95 transition-all flex items-center justify-center gap-2",
                  isGirlyMode ? "bg-white/60 border-pink-100" : isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
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
              className="flex flex-col h-[calc(100vh-180px)] relative"
            >
              {isPremiumUser ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center border transition-colors",
                      isGirlyMode ? "bg-pink-500/20 border-pink-500/20" : "bg-emerald-500/20 border-emerald-500/20"
                    )}>
                      <img 
                        src={AVATARS[0].url} 
                        alt="AI Stoic" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h2 className={cn("text-2xl font-bold", isGirlyMode ? "text-pink-900" : "")}>AI Stoic</h2>
                      <p className={cn(
                        "text-xs font-medium uppercase tracking-widest",
                        isGirlyMode ? "text-pink-500" : "text-zinc-500"
                      )}>Powered by Gemini</p>
                    </div>
                  </div>

                  <div className={cn(
                    "flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl border mb-4 no-scrollbar",
                    isGirlyMode ? "bg-white/40 border-pink-100" : isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/60 border-zinc-200 shadow-sm"
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
                          "max-w-[80%] p-4 rounded-2xl relative group",
                          msg.role === 'user' 
                            ? "bg-emerald-500 text-zinc-950 text-sm font-semibold rounded-br-none shadow-sm shadow-emerald-500/10" 
                            : (isDarkMode ? "bg-zinc-800 text-zinc-100 rounded-bl-none shadow-sm" : "bg-zinc-100 text-zinc-900 rounded-bl-none shadow-sm")
                        )}>
                          {msg.role === 'user' ? (
                            <span className="text-sm font-semibold leading-relaxed whitespace-pre-wrap select-text">{msg.parts[0].text}</span>
                          ) : (
                            <div className={cn(
                              "markdown-body font-handwritten tracking-wide leading-relaxed text-[17px] sm:text-[19px] select-text font-medium text-left",
                              isDarkMode ? "text-emerald-50" : "text-emerald-950"
                            )}>
                              <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                            </div>
                          )}
                          {msg.role === 'model' && (
                            <div className="absolute top-2 right-2 flex items-center gap-2">
                              <button
                                onClick={() => handleSpeak(msg.parts[0].text, `chat-${idx}`)}
                                className={cn(
                                  "p-2 rounded-xl transition-all shadow-sm",
                                  isSpeaking === `chat-${idx}` 
                                    ? "bg-emerald-500 text-zinc-950" 
                                    : (isDarkMode ? "bg-zinc-700/80 text-zinc-100 hover:bg-zinc-600" : "bg-zinc-200/80 text-zinc-900 hover:bg-zinc-300")
                                )}
                                title="Listen"
                              >
                                {isSpeaking === `chat-${idx}` ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
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
                </>
              ) : (
                <div className="max-w-md mx-auto w-full my-auto">
                  <WiseFitPlusPaywall 
                    isDarkMode={isDarkMode} 
                    isGirlyMode={isGirlyMode} 
                    userEmail={user?.email} 
                    onSuccess={handleUpgradeSuccess} 
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'psychologist' && (
            <motion.div
              key="psychologist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-[calc(100vh-180px)] relative"
            >
              {isPremiumUser ? (
                <>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center border border-blue-500/20 bg-blue-500/10 shadow-lg shadow-blue-500/10 transition-transform hover:scale-105">
                        <img 
                          src="https://compcharity.org/wp-content/uploads/2026/05/freud.jpg" 
                          alt="Sigmund Freud" 
                          className="w-full h-full object-cover brightness-110 contrast-115 grayscale-[0.2]"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200';
                          }}
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Dr. Sigmund Freud</h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Dr. Freud | Clinical Empathy
                        </p>
                      </div>
                    </div>

                    {userProfile?.avatarUrl && (
                      <div className="flex flex-col items-end gap-1 select-none">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-emerald-500/20 bg-emerald-500/5 shadow-md justify-center items-center flex">
                          <img 
                            src={userProfile.avatarUrl} 
                            alt="Patient Profile" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Patient</span>
                      </div>
                    )}
                  </div>

              <div className={cn(
                "flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl border mb-4 no-scrollbar",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white/60 border-zinc-200 shadow-sm"
              )}>
                {psychMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-blue-500/50" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-zinc-500">How are you feeling today, {userProfile?.name?.split(' ')[0] || 'Seeker'}?</p>
                      <p className="text-sm text-zinc-650">I am here to help you navigate your mental state and behavioral patterns.</p>
                    </div>
                   </div>
                )}
                {psychMessages.map((msg, idx) => (
                  <div key={idx} className={cn(
                    "flex items-end gap-2",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-zinc-700/30 shadow-md">
                      <div className={cn(
                        "w-full h-full flex items-center justify-center",
                        msg.role === 'user' ? "bg-zinc-800" : "bg-blue-900/50"
                      )}>
                        {msg.role === 'user' ? (
                          userProfile?.avatarUrl ? (
                            <img 
                              src={userProfile.avatarUrl} 
                              alt="User avatar" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <User className="w-4 h-4 text-zinc-400" />
                          )
                        ) : (
                          <img 
                            src="https://compcharity.org/wp-content/uploads/2026/05/freud.jpg" 
                            alt="Freud" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200';
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-2xl text-sm relative group",
                      msg.role === 'user' 
                        ? "bg-blue-600 text-white font-medium rounded-br-none" 
                        : (isDarkMode ? "bg-zinc-800 text-zinc-100 rounded-bl-none pr-24" : "bg-zinc-100 text-zinc-900 rounded-bl-none pr-24")
                    )}>
                      {msg.parts[0].text}
                      
                      {msg.role === 'model' && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 matches-main-theme">
                          <button
                            onClick={() => handleSpeak(msg.parts[0].text, `psych-${idx}`)}
                            className={cn(
                              "p-2 rounded-xl transition-all shadow-sm",
                              isSpeaking === `psych-${idx}` 
                                ? "bg-blue-500 text-white" 
                                : (isDarkMode ? "bg-zinc-700/80 text-zinc-100 hover:bg-zinc-600" : "bg-zinc-200/80 text-zinc-900 hover:bg-zinc-300")
                            )}
                            title="Listen"
                          >
                            {isSpeaking === `psych-${idx}` ? (
                              <VolumeX className="w-4 h-4 animate-pulse text-white" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy(msg.parts[0].text, idx)}
                            className={cn(
                              "p-2 rounded-xl transition-all shadow-sm",
                              copiedIndex === idx 
                                ? "bg-blue-500 text-white" 
                                : (isDarkMode ? "bg-zinc-700/80 text-zinc-100 hover:bg-zinc-600" : "bg-zinc-200/80 text-zinc-900 hover:bg-zinc-300")
                            )}
                            title="Copy to clipboard"
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isPsychLoading && (
                  <div className="flex justify-start">
                    <div className={cn(
                      "p-4 rounded-2xl rounded-tl-none",
                      isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
                    )}>
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={psychEndRef} />
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  value={psychInput}
                  onChange={(e) => setPsychInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePsychSendMessage()}
                  placeholder="Tell me what's on your mind..."
                  className={cn(
                    "flex-1 border rounded-2xl px-4 py-4 focus:outline-none focus:border-blue-500 transition-all",
                    isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900 shadow-sm"
                  )}
                />
                <button 
                  onClick={handlePsychSendMessage}
                  disabled={isPsychLoading || !psychInput.trim()}
                  className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
                </>
              ) : (
                <div className="max-w-md mx-auto w-full my-auto">
                  <WiseFitPlusPaywall 
                    isDarkMode={isDarkMode} 
                    isGirlyMode={isGirlyMode} 
                    userEmail={user?.email} 
                    onSuccess={handleUpgradeSuccess} 
                  />
                </div>
              )}
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
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={cn("text-2xl font-bold", isGirlyMode ? "text-pink-900" : "")}>Wisdom Repository</h2>
                    <div className="flex items-center gap-2">
                       <p className={cn(
                        "text-xs font-medium",
                        isGirlyMode ? "text-pink-400" : isDarkMode ? "text-zinc-500" : "text-zinc-400"
                      )}>{libraryQuotes.length} Wisdoms Stored</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAddingQuote(true)}
                      className={cn(
                        "p-2 rounded-xl transition-all hover:scale-110",
                        isGirlyMode ? "bg-pink-500/10 text-pink-500 shadow-sm" : isDarkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600 shadow-sm"
                      )}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <div className={cn(
                      "p-2 rounded-xl",
                      isGirlyMode ? "bg-pink-50 text-pink-600" : isDarkMode ? "bg-zinc-900 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                    )}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Sub Tabs */}
                <div className={cn(
                  "flex p-1 rounded-2xl",
                  isGirlyMode ? "bg-pink-50" : isDarkMode ? "bg-zinc-900/50" : "bg-zinc-100"
                )}>
                  <button
                    onClick={() => setLibraryTab('quotes')}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                      libraryTab === 'quotes' 
                        ? (isGirlyMode ? "bg-white text-pink-600 shadow-lg shadow-pink-500/10" : isDarkMode ? "bg-zinc-800 text-white shadow-lg" : "bg-white text-zinc-900 shadow-sm")
                        : "text-zinc-500 hover:text-zinc-400"
                    )}
                  >
                    Scrolls
                  </button>
                  <button
                    onClick={() => setLibraryTab('archive')}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                      libraryTab === 'archive' 
                        ? (isGirlyMode ? "bg-white text-pink-600 shadow-lg shadow-pink-500/10" : isDarkMode ? "bg-zinc-800 text-white shadow-lg" : "bg-white text-zinc-900 shadow-sm")
                        : "text-zinc-500 hover:text-zinc-400"
                    )}
                  >
                    Ancient Archive <Play className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {libraryTab === 'quotes' ? (
                <>
                  <div className="flex items-center justify-between">
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
                              : (isGirlyMode ? "bg-pink-100 text-pink-600" : isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200")
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
                    </div>
                    {libraryQuotes.length > 1 && (
                      <button 
                        onClick={handleCleanupDuplicates}
                        className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        (Clean Duplicates)
                      </button>
                    )}
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
                            isGirlyMode 
                              ? "bg-white border-pink-100 text-pink-900 focus:ring-pink-500/20"
                              : isDarkMode 
                                ? "bg-zinc-800/50 border-zinc-700 text-zinc-100 focus:ring-purple-500/50" 
                                : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:ring-purple-500/20"
                          )}
                        />
                        <select
                          value={newQuote.source}
                          onChange={(e) => setNewQuote({ ...newQuote, source: e.target.value })}
                          className={cn(
                            "p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all cursor-pointer",
                            isGirlyMode 
                              ? "bg-white border-pink-100 text-pink-900 focus:ring-pink-500/20"
                              : isDarkMode 
                                ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-purple-500/50" 
                                : "bg-white border-zinc-200 text-zinc-900 focus:ring-purple-500/20"
                          )}
                        >
                          <option value="Philosophy">Philosophy</option>
                          <option value="Psychology">Psychology</option>
                          <option value="Doctor's Quote">Doctor's Quote</option>
                          <option value="Science">Science</option>
                          <option value="Literature">Literature</option>
                          <option value="Leadership">Leadership</option>
                          <option value="Empowerment">Empowerment</option>
                          <option value="Personal">Personal</option>
                          <option value="Stoic">Stoic</option>
                          <option value="Zen">Zen</option>
                          <option value="Ancient Wisdom">Ancient Wisdom</option>
                          <option value="Modern Insight">Modern Insight</option>
                        </select>
                        <select
                          value={newQuote.category}
                          onChange={(e) => setNewQuote({ ...newQuote, category: e.target.value as any })}
                          className={cn(
                            "p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all cursor-pointer",
                            isGirlyMode 
                              ? "bg-white border-pink-100 text-pink-900 focus:ring-pink-500/20"
                              : isDarkMode 
                                ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-purple-500/50" 
                                : "bg-white border-zinc-200 text-zinc-900 focus:ring-purple-500/20"
                          )}
                        >
                          <option value="wisdom">General Wisdom</option>
                          <option value="stoic">Stoic Wisdom</option>
                          <option value="jewish">Jewish Wisdom</option>
                          <option value="psychology">Psychology</option>
                          <option value="finance">Financial Edge</option>
                          <option value="balkan">Balkan Depth</option>
                          <option value="chinese">Chinese Tao</option>
                          <option value="japanese">Japanese Zen</option>
                          <option value="fitness">Fitness/Vitality</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-1",
                          isGirlyMode ? "text-pink-500" : "text-purple-500"
                        )}>Wisdom Grade</label>
                        <select
                          value={newQuote.wisdomGrade}
                          onChange={(e) => setNewQuote({ ...newQuote, wisdomGrade: e.target.value })}
                          className={cn(
                            "w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all cursor-pointer",
                            isGirlyMode 
                              ? "bg-white border-pink-100 text-pink-900 focus:ring-pink-500/20"
                              : isDarkMode 
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
                        <label className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-1",
                          isGirlyMode ? "text-pink-500" : "text-purple-500"
                        )}>Personal Comment</label>
                        <textarea
                          value={newQuote.comment}
                          onChange={(e) => setNewQuote({ ...newQuote, comment: e.target.value })}
                          placeholder="Add a personal reflection..."
                          className={cn(
                            "w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 transition-all resize-none h-20",
                            isGirlyMode 
                              ? "bg-white border-pink-100 text-pink-900 focus:ring-pink-500/20"
                              : isDarkMode 
                                ? "bg-zinc-900 border-zinc-700 text-zinc-100 focus:ring-purple-500/50" 
                                : "bg-white border-zinc-200 text-zinc-900 focus:ring-purple-500/20"
                          )}
                        />
                      </div>
                      <button
                        onClick={handleAddCustomQuote}
                        disabled={!newQuote.text.trim()}
                        className={cn(
                          "w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                          !newQuote.text.trim()
                            ? (isGirlyMode ? "bg-pink-100 text-pink-300" : "bg-zinc-800 text-zinc-600")
                            : (isGirlyMode ? "bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/20" : "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20")
                        )}
                      >
                        <>
                          <Plus className="w-4 h-4" />
                          Save Wisdom
                        </>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isLibraryLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className={cn("w-8 h-8 animate-spin", isGirlyMode ? "text-pink-500" : "text-emerald-500")} />
                  <p className={cn("text-sm", isGirlyMode ? "text-pink-600/60" : "text-zinc-500")}>Opening the scrolls...</p>
                </div>
              ) : libraryQuotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", isGirlyMode ? "bg-pink-100" : "bg-zinc-800")}>
                    <Scroll className={cn("w-8 h-8", isGirlyMode ? "text-pink-500" : "text-zinc-600")} />
                  </div>
                  <div>
                    <h3 className={cn("font-bold", isGirlyMode ? "text-pink-900" : "")}>No Wisdom Yet</h3>
                    <p className={cn("text-sm max-w-[200px] mx-auto", isGirlyMode ? "text-pink-600/60" : "text-zinc-500")}>Mark quotes as wise on your dashboard to build your library.</p>
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
                          isGirlyMode ? "text-pink-500/70" : isDarkMode ? "text-emerald-500/70" : "text-emerald-600/70"
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
                                  isGirlyMode
                                    ? "bg-white/60 border-pink-100 shadow-sm"
                                    : quote.category === 'finance'
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
                                          ? (isGirlyMode ? "bg-pink-500 text-white" : "bg-red-500 text-white")
                                          : (isGirlyMode ? "bg-pink-100 text-pink-400" : isDarkMode ? "bg-zinc-800 text-zinc-500" : "bg-white text-zinc-400 border border-zinc-100")
                                      )}
                                    >
                                      {selectedLibraryIds.has(quote.id!) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleDeleteQuotesFromLibrary([quote.id!])}
                                      className={cn(
                                        "p-2 rounded-xl transition-all shadow-sm",
                                        isGirlyMode
                                          ? "bg-pink-100 text-pink-400 hover:text-pink-600 hover:bg-pink-200"
                                          : isDarkMode 
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
                                  isGirlyMode
                                    ? "bg-pink-100 text-pink-500"
                                    : quote.category === 'finance'
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
                                  isGirlyMode ? "text-pink-950" : isDarkMode ? "text-zinc-100" : "text-zinc-900"
                                )}>
                                  "{quote.text}"
                                </p>
                                  <div className="mt-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <div className={cn("h-[1px] flex-1", isGirlyMode ? "bg-pink-500/20" : quote.category === 'finance' ? "bg-emerald-500/20" : quote.isCustom ? "bg-purple-500/20" : "bg-yellow-500/20")} />
                                      <span className={cn(
                                        "text-[8px] font-black uppercase tracking-[0.2em]",
                                        isGirlyMode ? "text-pink-400/70" : quote.category === 'finance' ? "text-emerald-400/70" : quote.isCustom ? "text-purple-400/70" : "text-yellow-500/70"
                                      )}>Wisdom Data</span>
                                      <div className={cn("h-[1px] flex-1", isGirlyMode ? "bg-pink-500/20" : quote.category === 'finance' ? "bg-emerald-500/20" : quote.isCustom ? "bg-purple-500/20" : "bg-yellow-500/20")} />
                                    </div>
                                    
                                    {editingQuoteId === quote.id ? (
                                      <div className={cn(
                                        "space-y-4 p-4 rounded-3xl border shadow-inner",
                                        isGirlyMode ? "bg-pink-50/50 border-pink-100" : "bg-zinc-900/60 border border-zinc-800/50"
                                      )}>
                                        <div className="space-y-2">
                                          <label className={cn("text-[7px] font-black uppercase tracking-[0.2em] px-1", isGirlyMode ? "text-pink-500/70" : "text-emerald-500/70")}>Wisdom Text</label>
                                          <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className={cn(
                                              "w-full p-3 rounded-2xl border text-xs font-serif italic focus:outline-none focus:ring-1 transition-all resize-none min-h-[80px] leading-relaxed",
                                              isGirlyMode 
                                                ? "bg-white border-pink-100 text-pink-900 focus:ring-pink-500/20 shadow-sm"
                                                : isDarkMode 
                                                  ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-emerald-500/50" 
                                                  : "bg-white border-zinc-200 text-zinc-900 focus:ring-emerald-500/20 shadow-sm"
                                            )}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <label className={cn("text-[7px] font-black uppercase tracking-[0.2em] px-1", isGirlyMode ? "text-pink-500/70" : "text-emerald-500/70")}>Author Identity</label>
                                          <input
                                            type="text"
                                            value={editAuthor}
                                            onChange={(e) => setEditAuthor(e.target.value)}
                                            className={cn(
                                              "w-full p-2.5 rounded-xl border text-[11px] font-black focus:outline-none focus:ring-1 transition-all",
                                              isGirlyMode 
                                                ? "bg-white border-pink-100 text-pink-600 focus:ring-pink-500/20 shadow-sm"
                                                : isDarkMode 
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
                                                isGirlyMode 
                                                  ? "bg-white border-pink-100 text-pink-900 focus:ring-pink-500/20 shadow-sm"
                                                  : isDarkMode 
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
                                                isGirlyMode 
                                                  ? "bg-white border-pink-100 text-pink-900 focus:ring-pink-500/20 shadow-sm"
                                                  : isDarkMode 
                                                    ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-emerald-500/50" 
                                                    : "bg-white border-zinc-200 text-zinc-900 focus:ring-emerald-500/20 shadow-sm"
                                              )}
                                            />
                                          </div>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                          <button
                                            onClick={() => handleUpdateWisdomData(quote.id!, quote.isCustom || false)}
                                            className={cn(
                                              "flex-1 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-[0.98]",
                                              isGirlyMode ? "bg-pink-500 text-white hover:bg-pink-400 shadow-pink-900/20" : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950/20"
                                            )}
                                          >
                                            Save Changes
                                          </button>
                                          <button
                                            onClick={() => setEditingQuoteId(null)}
                                            className={cn(
                                              "px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]",
                                              isGirlyMode ? "bg-pink-100 text-pink-400 hover:bg-pink-200" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                            )}
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
                                          className={cn(
                                            "absolute -top-6 right-0 transition-opacity text-[8px] font-bold uppercase tracking-wider",
                                            isGirlyMode ? "text-pink-500 hover:text-pink-400" : "text-emerald-500 hover:text-emerald-400"
                                          )}
                                        >
                                          EDIT
                                        </button>
                                        {quote.wisdomGrade && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-500">Grade:</span>
                                            <p className={cn(
                                              "text-[9px] font-bold uppercase tracking-wider",
                                              isGirlyMode ? "text-pink-500" : quote.isCustom ? "text-purple-400" : "text-yellow-500"
                                            )}>
                                              {quote.wisdomGrade}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                <div className={cn("mt-3 pt-3 border-t space-y-2", isDarkMode ? "border-zinc-800/20" : "border-zinc-800/10")}>
                                  <div className="flex items-center justify-between">
                                    <p className={cn("text-[16px] font-bold", isGirlyMode ? "text-pink-600" : "text-blue-500")}>{quote.author}</p>
                                    <div className="flex items-center gap-2">
                                      {quote.markedDate && (
                                        <p className={cn(
                                          "text-[9px] font-medium mr-1.5",
                                          isDarkMode ? "text-zinc-600" : "text-zinc-400"
                                        )}>
                                          {format(new Date(quote.markedDate), 'MMM d, yyyy')}
                                        </p>
                                      )}
                                      <button
                                        onClick={() => {
                                          const shareText = `"${quote.text}" — ${quote.author}`;
                                          navigator.clipboard.writeText(shareText);
                                          setLocalCopiedId(quote.id!);
                                          setTimeout(() => setLocalCopiedId(null), 2000);
                                        }}
                                        className={cn(
                                          "p-1.5 rounded-xl transition-all active:scale-95 flex items-center justify-center",
                                          isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-emerald-450" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-emerald-650"
                                        )}
                                        title="Copy Quote"
                                      >
                                        {localCopiedId === quote.id ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                      <button
                                        onClick={async () => {
                                          const shareText = `"${quote.text}" — ${quote.author} (via WiseFit)`;
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
                                            navigator.clipboard.writeText(shareText);
                                            setLocalCopiedId(quote.id!);
                                            setTimeout(() => setLocalCopiedId(null), 2000);
                                          }
                                        }}
                                        className={cn(
                                          "p-1.5 rounded-xl transition-all active:scale-95 flex items-center justify-center",
                                          isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-emerald-450" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-emerald-650"
                                        )}
                                        title="Share Quote"
                                      >
                                        <Share2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
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
            </>
          ) : (
            <HistoryFeed isDarkMode={isDarkMode} isGirlyMode={isGirlyMode} items={INITIAL_HISTORY_VIDEOS} />
          )}
        </motion.div>
          )}

          {activeView === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {user ? (
                <SocialSanctuary 
                  isDarkMode={isDarkMode} 
                  isGirlyMode={isGirlyMode} 
                  currentUser={user} 
                  userProfile={userProfile} 
                  isPremiumUser={isPremiumUser}
                />
              ) : (
                <div className="max-w-md mx-auto">
                  <WiseFitPlusPaywall 
                    isDarkMode={isDarkMode} 
                    isGirlyMode={isGirlyMode} 
                    userEmail={user?.email} 
                    onSuccess={handleUpgradeSuccess} 
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {!isYogaSessionActive && (
        <nav className={cn(
          "fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t py-3 pb-8 transition-colors duration-500 overflow-x-auto no-scrollbar",
          isGirlyMode ? "bg-white/90 border-pink-100 shadow-[0_-8px_32px_rgba(244,63,94,0.1)]" :
          isDarkMode ? "bg-zinc-950/90 border-zinc-800/50" : "bg-white/90 border-zinc-200 shadow-lg"
        )}>
        <div className="flex items-center justify-start min-w-max px-2 gap-1 sm:justify-between sm:max-w-md sm:mx-auto sm:w-full sm:gap-2">
          <NavButton 
            active={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')}
            icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Home"
            isDarkMode={isDarkMode}
            isGirlyMode={isGirlyMode}
          />
          <NavButton 
            active={activeView === 'plan'} 
            onClick={() => setActiveView('plan')}
            icon={<ListTodo className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Plan"
            isDarkMode={isDarkMode}
            isGirlyMode={isGirlyMode}
          />
          <NavButton 
            active={activeView === 'workouts'} 
            onClick={() => {
              setActiveView('workouts');
              setHistorySubView('articles');
            }}
            icon={<Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Log"
            isDarkMode={isDarkMode}
            isGirlyMode={isGirlyMode}
          />
          <NavButton 
            active={activeView === 'yoga'} 
            onClick={() => setActiveView('yoga')}
            icon={<Wind className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Yoga"
            isDarkMode={isDarkMode}
            isGirlyMode={isGirlyMode}
          />
          <NavButton 
            active={activeView === 'quiz'} 
            onClick={() => setActiveView('quiz')}
            icon={<Brain className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Quiz"
            isDarkMode={isDarkMode}
            isGirlyMode={isGirlyMode}
          />
          <NavButton 
            active={activeView === 'chat'} 
            onClick={() => setActiveView('chat')}
            icon={<MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Sage"
            isDarkMode={isDarkMode}
            isGirlyMode={isGirlyMode}
          />
          <NavButton 
            active={activeView === 'psychologist'} 
            onClick={() => setActiveView('psychologist')}
            icon={<Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Clinic"
            isDarkMode={isDarkMode}
            isGirlyMode={isGirlyMode}
          />
          <NavButton 
            active={activeView === 'library'} 
            onClick={() => setActiveView('library')}
            icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Ref"
            isDarkMode={isDarkMode}
            isGirlyMode={isGirlyMode}
          />
          <NavButton 
            active={activeView === 'social'} 
            onClick={() => {
              if (user) {
                setActiveView('social');
              } else {
                setActiveView('profile'); // Send guests to login first so they don't break database boundaries
              }
            }}
            icon={<Globe className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="Swarm"
            isDarkMode={isDarkMode}
            isGirlyMode={isGirlyMode}
          />
          <NavButton 
            active={activeView === 'profile'} 
            onClick={() => setActiveView('profile')}
            icon={<User className="w-5 h-5 sm:w-6 sm:h-6" />}
            label="User"
            isDarkMode={isDarkMode}
            isGirlyMode={isGirlyMode}
          />
        </div>
      </nav>
      )}

      {/* Avatar Selector Modal */}
      <AnimatePresence>
        {isSelectingAvatar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className={cn(
                "w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border transition-all duration-500",
                isGirlyMode ? "bg-white border-pink-100 shadow-2xl" : isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-2xl"
              )}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={cn("text-xl font-bold", isGirlyMode ? "text-pink-900" : "")}>Choose Avatar</h3>
                    <p className={cn("text-xs mt-1", isGirlyMode ? "text-pink-400" : "text-zinc-500")}>Historical Stoics & Philosophers</p>
                  </div>
                  <button 
                    onClick={() => setIsSelectingAvatar(false)} 
                    className="p-2 rounded-full transition-all bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 border border-rose-455/30 active:scale-95 flex items-center justify-center cursor-pointer"
                    title="Close Dialog"
                  >
                    <X className="w-4 h-4 stroke-[3px]" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.name}
                      onClick={async () => {
                        const newProfile = { ...userProfile, avatarUrl: avatar.url };
                        setUserProfile(newProfile);
                        if (user) {
                          try {
                            await updateDoc(doc(db, 'users', user.uid), { avatarUrl: avatar.url });
                            setIsSaved(true);
                            setTimeout(() => setIsSaved(false), 2000);
                          } catch (error) {
                            console.error("Error updating avatar:", error);
                          }
                        }
                        setIsSelectingAvatar(false);
                      }}
                      className="group flex flex-col items-center gap-2"
                    >
                      <div className={cn(
                        "relative aspect-square w-full rounded-2xl overflow-hidden border-2 transition-all group-hover:scale-105 active:scale-95",
                        userProfile.avatarUrl === avatar.url 
                          ? (isGirlyMode ? "border-pink-500 ring-4 ring-pink-500/20" : "border-emerald-500 ring-4 ring-emerald-500/20")
                          : (isGirlyMode ? "border-pink-50/50 bg-pink-50" : isDarkMode ? "border-zinc-800 bg-zinc-800" : "border-zinc-100 bg-zinc-100")
                      )}>
                        <img 
                          src={avatar.url} 
                          alt={avatar.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200';
                          }}
                        />
                        {userProfile.avatarUrl === avatar.url && (
                          <div className={cn(
                            "absolute inset-0 flex items-center justify-center",
                            isGirlyMode ? "bg-pink-500/20" : "bg-emerald-500/20"
                          )}>
                            <CheckCircle2 className={cn("w-6 h-6 drop-shadow-lg", isGirlyMode ? "text-pink-500" : "text-emerald-500")} />
                          </div>
                        )}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold text-center leading-tight truncate w-full px-1",
                        userProfile.avatarUrl === avatar.url 
                          ? (isGirlyMode ? "text-pink-500" : "text-emerald-500")
                          : (isGirlyMode ? "text-pink-400" : "text-zinc-500")
                      )}>{avatar.name}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className={cn(
                    "text-[10px] font-bold uppercase block tracking-widest",
                    isGirlyMode ? "text-pink-300" : "text-zinc-500"
                  )}>Custom URL</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/image.jpg"
                    value={userProfile.avatarUrl && !AVATARS.some(a => a.url === userProfile.avatarUrl) ? userProfile.avatarUrl : ''}
                    onChange={async (e) => {
                      const url = e.target.value;
                      setUserProfile({ ...userProfile, avatarUrl: url });
                      if (user && url.startsWith('http')) {
                        try {
                          await updateDoc(doc(db, 'users', user.uid), { avatarUrl: url });
                        } catch (e) {}
                      }
                    }}
                    className={cn(
                      "w-full border rounded-xl px-4 py-3 text-xs focus:outline-none transition-all",
                      isGirlyMode ? "bg-pink-50 border-pink-100 text-pink-900 focus:border-pink-500" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-white focus:border-emerald-500" : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-emerald-500"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={cn(
                "w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden border transition-all duration-300 shadow-2xl",
                isGirlyMode ? "bg-white border-pink-200" : isDarkMode ? "bg-zinc-900 border-zinc-700/80" : "bg-white border-zinc-300"
              )}
            >
              <div className="p-6 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-500/20 dark:border-zinc-800/50">
                  <h3 className={cn("text-2xl font-black tracking-tight", isGirlyMode ? "text-pink-900" : isDarkMode ? "text-white" : "text-zinc-900")}>Edit Profile</h3>
                  <button 
                    onClick={() => setIsEditingProfile(false)} 
                    className="p-2 rounded-full transition-all bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 border border-rose-400/30 active:scale-95 flex items-center justify-center cursor-pointer"
                    title="Close Dialog"
                  >
                    <X className="w-5 h-5 stroke-[3px]" />
                  </button>
                </div>
                
                {/* Scrollable Container for ALL edit options */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-1.5 focus:outline-none">
                  
                  {/* Seeker Identity */}
                  <div className="space-y-4">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400 border-b border-emerald-500/10 dark:border-emerald-450/10 pb-1 mb-2 block">Seeker Identity</span>
                    <div className="space-y-4">
                      <div>
                        <label className={cn(
                          "text-sm font-extrabold uppercase mb-1.5 block tracking-wide transition-colors",
                          isGirlyMode ? "text-pink-600" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>Display Name / Seeker Handle</label>
                        <input 
                          type="text" 
                          value={userProfile.name || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                          className={cn(
                            "w-full border rounded-xl px-4 py-3.5 text-sm sm:text-base font-semibold focus:outline-none transition-all",
                            isGirlyMode ? "bg-pink-50 border-pink-100 text-pink-900 focus:border-pink-500" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-550 focus:border-emerald-400" : "bg-zinc-100 border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500"
                          )}
                          placeholder="E.g. Marcus Aurelius"
                        />
                      </div>
                      <div>
                        <label className={cn(
                          "text-sm font-extrabold uppercase mb-1.5 block tracking-wide transition-colors",
                          isGirlyMode ? "text-pink-600" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>Seeker biography / Wisdom philosophy</label>
                        <textarea 
                          rows={3}
                          value={userProfile.biography || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, biography: e.target.value })}
                          className={cn(
                            "w-full border rounded-xl px-4 py-3.5 text-sm sm:text-base font-semibold focus:outline-none transition-all resize-none",
                            isGirlyMode ? "bg-pink-50 border-pink-100 text-pink-900 focus:border-pink-500" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-550 focus:border-emerald-400" : "bg-zinc-100 border-zinc-300 text-zinc-900 placeholder-zinc-450 focus:border-emerald-500"
                          )}
                          placeholder="Your guiding, scholarly background & bio..."
                        />
                      </div>
                      
                      {/* Local save for Seeker Identity */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleSaveSection("Seeker Identity")}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all active:scale-95 cursor-pointer shadow-sm",
                            isGirlyMode 
                              ? "bg-pink-100 hover:bg-pink-200 border-pink-200 text-pink-705" 
                              : isDarkMode 
                                ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-emerald-400" 
                                : "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-850"
                          )}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Identity</span>
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Somatic Metrics */}
                  <div className="space-y-4 pt-4 border-t border-dashed border-zinc-500/20 dark:border-zinc-800/40">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400 border-b border-emerald-500/10 dark:border-emerald-450/10 pb-1 mb-2 block">Somatic & Core Metrics</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={cn(
                          "text-xs sm:text-sm font-extrabold uppercase mb-1.5 block tracking-wide transition-colors",
                          isGirlyMode ? "text-pink-600" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>Height (cm)</label>
                        <input 
                          type="number" 
                          value={userProfile.height || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, height: e.target.value === '' ? 0 : Number(e.target.value) })}
                          className={cn(
                            "w-full border rounded-xl px-4 py-3.5 text-sm sm:text-base font-semibold focus:outline-none transition-all",
                            isGirlyMode ? "bg-pink-50 border-pink-100 text-pink-900 focus:border-pink-500" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-400" : "bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-emerald-500"
                          )}
                        />
                      </div>
                      <div>
                        <label className={cn(
                          "text-xs sm:text-sm font-extrabold uppercase mb-1.5 block tracking-wide transition-colors",
                          isGirlyMode ? "text-pink-600" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>Weight (kg)</label>
                        <input 
                          type="number" 
                          value={userProfile.currentWeight || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, currentWeight: e.target.value === '' ? 0 : Number(e.target.value) })}
                          className={cn(
                            "w-full border rounded-xl px-4 py-3.5 text-sm sm:text-base font-semibold focus:outline-none transition-all",
                            isGirlyMode ? "bg-pink-50 border-pink-100 text-pink-900 focus:border-pink-500" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-400" : "bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-emerald-500"
                          )}
                        />
                      </div>
                      <div>
                        <label className={cn(
                          "text-xs sm:text-sm font-extrabold uppercase mb-1.5 block tracking-wide transition-colors",
                          isGirlyMode ? "text-pink-600" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>Target (kg)</label>
                        <input 
                          type="number" 
                          value={userProfile.targetWeight || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, targetWeight: e.target.value === '' ? 0 : Number(e.target.value) })}
                          className={cn(
                            "w-full border rounded-xl px-4 py-3.5 text-sm sm:text-base font-semibold focus:outline-none transition-all",
                            isGirlyMode ? "bg-pink-50 border-pink-100 text-pink-900 focus:border-pink-500" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-400" : "bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-emerald-500"
                          )}
                        />
                      </div>
                      <div>
                        <label className={cn(
                          "text-xs sm:text-sm font-extrabold uppercase mb-1.5 block tracking-wide transition-colors",
                          isGirlyMode ? "text-pink-600" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>Step Goal</label>
                        <input 
                          type="number" 
                          value={userProfile.stepGoal || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, stepGoal: e.target.value === '' ? 0 : Number(e.target.value) })}
                          className={cn(
                            "w-full border rounded-xl px-4 py-3.5 text-sm sm:text-base font-semibold focus:outline-none transition-all",
                            isGirlyMode ? "bg-pink-50 border-pink-100 text-pink-900 focus:border-pink-500" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-400" : "bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-emerald-500"
                          )}
                        />
                      </div>
                    </div>
                    {/* Local save for Somatic Metrics */}
                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => handleSaveSection("Somatic Metrics")}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all active:scale-95 cursor-pointer shadow-sm",
                          isGirlyMode 
                            ? "bg-pink-100 hover:bg-pink-200 border-pink-200 text-pink-705" 
                            : isDarkMode 
                              ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-emerald-400" 
                              : "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-850"
                        )}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Metrics</span>
                      </button>
                    </div>
                  </div>

                  {/* Pull-ups / Max Strength */}
                  <div className="space-y-4 pt-4 border-t border-dashed border-zinc-500/20 dark:border-zinc-800/40">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400 border-b border-emerald-500/10 dark:border-emerald-450/10 pb-1 mb-2 block">Physical Discipline & Strength</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={cn(
                          "text-xs sm:text-sm font-extrabold uppercase mb-1.5 block tracking-wide transition-colors",
                          isGirlyMode ? "text-pink-600" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>Max Pull-ups</label>
                        <input 
                          type="number" 
                          value={userProfile.maxPullUps || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, maxPullUps: e.target.value === '' ? 0 : Number(e.target.value) })}
                          className={cn(
                            "w-full border rounded-xl px-4 py-3.5 text-sm sm:text-base font-semibold focus:outline-none transition-all",
                            isGirlyMode ? "bg-pink-50 border-pink-100 text-pink-900 focus:border-pink-500" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-400" : "bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-emerald-500"
                          )}
                        />
                      </div>
                      <div>
                        <label className={cn(
                          "text-xs sm:text-sm font-extrabold uppercase mb-1.5 block tracking-wide transition-colors",
                          isGirlyMode ? "text-pink-600" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>Weighted 1-RM (kg)</label>
                        <input 
                          type="number" 
                          value={userProfile.oneRMWeighted || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, oneRMWeighted: e.target.value === '' ? 0 : Number(e.target.value) })}
                          className={cn(
                            "w-full border rounded-xl px-4 py-3.5 text-sm sm:text-base font-semibold focus:outline-none transition-all",
                            isGirlyMode ? "bg-pink-50 border-pink-100 text-pink-900 focus:border-pink-500" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-400" : "bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-emerald-500"
                          )}
                        />
                      </div>
                    </div>
                    {/* Local save for Physical Discipline & Strength */}
                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => handleSaveSection("Physical Discipline & Strength")}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all active:scale-95 cursor-pointer shadow-sm",
                          isGirlyMode 
                            ? "bg-pink-100 hover:bg-pink-200 border-pink-200 text-pink-705" 
                            : isDarkMode 
                              ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-emerald-400" 
                              : "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-850"
                        )}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Strength</span>
                      </button>
                    </div>
                  </div>

                  {/* Scholarly Trajectory / Life Objectives */}
                  <div className="space-y-4 pt-4 border-t border-dashed border-zinc-500/20 dark:border-zinc-800/40">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400 border-b border-emerald-500/10 dark:border-emerald-450/10 pb-1 mb-2 block">Life Trajectory Goals</span>
                    <div className="space-y-4">
                      <div>
                        <label className={cn(
                          "text-xs sm:text-sm font-extrabold uppercase mb-1.5 block tracking-wide transition-colors",
                          isGirlyMode ? "text-pink-600" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>Short Term Trajectory</label>
                        <input 
                          type="text" 
                          value={userProfile.shortTermGoal || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, shortTermGoal: e.target.value })}
                          className={cn(
                            "w-full border rounded-xl px-4 py-3.5 text-sm sm:text-base font-semibold focus:outline-none transition-all",
                            isGirlyMode ? "bg-pink-50 border-pink-100 text-pink-900 focus:border-pink-500" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-emerald-400 focus:border-emerald-555" : "bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-emerald-555 md:focus:border-emerald-555"
                          )}
                          placeholder="Your active focus (e.g. +60kg pullup etc)"
                        />
                      </div>
                      <div>
                        <label className={cn(
                          "text-xs sm:text-sm font-extrabold uppercase mb-1.5 block tracking-wide transition-colors",
                          isGirlyMode ? "text-pink-600" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>Long Term Trajectory</label>
                        <input 
                          type="text" 
                          value={userProfile.longTermGoal || ''}
                          onChange={(e) => setUserProfile({ ...userProfile, longTermGoal: e.target.value })}
                          className={cn(
                            "w-full border rounded-xl px-4 py-3.5 text-sm sm:text-base font-semibold focus:outline-none transition-all",
                            isGirlyMode ? "bg-pink-50 border-pink-100 text-pink-900 focus:border-pink-500" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-emerald-400 focus:border-emerald-555" : "bg-zinc-100 border-zinc-300 text-zinc-900 focus:border-emerald-555 md:focus:border-emerald-500"
                          )}
                          placeholder="Your grand vision (e.g. +100kg pullup etc)"
                        />
                      </div>
                    </div>
                    {/* Local save for Life Trajectory Goals */}
                    <div className="flex justify-end pt-3">
                      <button
                        type="button"
                        onClick={() => handleSaveSection("Life Trajectory Goals")}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all active:scale-95 cursor-pointer shadow-sm",
                          isGirlyMode 
                            ? "bg-pink-100 hover:bg-pink-200 border-pink-200 text-pink-705" 
                            : isDarkMode 
                              ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-emerald-400" 
                              : "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-850"
                        )}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Goals</span>
                      </button>
                    </div>
                  </div>

                  {/* Dating Mode Toggle & Preferences */}
                  <div className={cn(
                    "p-5 rounded-2xl border space-y-4",
                    isGirlyMode ? "bg-pink-50/50 border-pink-100/50" : isDarkMode ? "bg-zinc-950/80 border-zinc-700/60" : "bg-zinc-100/70 border-zinc-300"
                  )}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className={cn("text-sm font-black uppercase tracking-wider", isGirlyMode ? "text-pink-600" : "text-emerald-500")}>Dating sanctuary mode</h4>
                        <p className={cn("text-xs mt-0.5", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>Toggle eligibility to appear on the Seekers active dating swarm.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUserProfile({ 
                          ...userProfile, 
                          isDatingModeEnabled: !userProfile.isDatingModeEnabled 
                        })}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          userProfile.isDatingModeEnabled 
                            ? (isGirlyMode ? "bg-pink-500" : "bg-emerald-500") 
                            : "bg-zinc-750"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                            userProfile.isDatingModeEnabled ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>

                    {userProfile.isDatingModeEnabled && (
                      <div className="space-y-4 pt-4 border-t border-dashed border-zinc-800/80 dark:border-zinc-700/50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={cn("text-xs font-black uppercase tracking-wide block mb-1.5", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>Your Gender</label>
                            <select
                              value={userProfile.gender || 'male'}
                              onChange={(e) => setUserProfile({ ...userProfile, gender: e.target.value as any })}
                              className={cn(
                                "w-full border rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none transition-all",
                                isGirlyMode ? "bg-pink-50 border-pink-150 text-pink-900" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-zinc-900"
                              )}
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other / Seeker</option>
                            </select>
                          </div>
                          <div>
                            <label className={cn("text-xs font-black uppercase tracking-wide block mb-1.5", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>Your Age</label>
                            <input
                              type="number"
                              min="18"
                              max="100"
                              value={userProfile.age || ''}
                              onChange={(e) => setUserProfile({ ...userProfile, age: e.target.value === '' ? 0 : Number(e.target.value) })}
                              className={cn(
                                "w-full border rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none transition-all",
                                isGirlyMode ? "bg-pink-50 border-pink-150 text-pink-900" : isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-300 text-zinc-900"
                              )}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={cn("text-xs font-black uppercase tracking-wide block mb-2", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>Gender Interest</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {(['female', 'male', 'both', 'all'] as const).map((genderVal) => (
                              <button
                                key={genderVal}
                                type="button"
                                onClick={() => setUserProfile({
                                  ...userProfile,
                                  datingPreferences: {
                                    ...(userProfile.datingPreferences || {}),
                                    genderInterest: genderVal
                                  }
                                })}
                                className={cn(
                                  "py-2.5 px-1.5 rounded-xl text-xs font-black border uppercase transition-all tracking-tight text-center cursor-pointer",
                                  userProfile.datingPreferences?.genderInterest === genderVal
                                    ? (isGirlyMode ? "bg-pink-500 text-white border-pink-500" : "bg-emerald-500 text-zinc-950 border-emerald-500")
                                    : (isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-white border-zinc-300 text-zinc-700 hover:text-zinc-900")
                                )}
                              >
                                {genderVal === 'both' ? 'Both' : genderVal === 'all' ? 'All' : genderVal}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={cn("text-xs font-black uppercase tracking-wide block mb-1.5", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>Min Age: <span className="text-emerald-500 dark:text-emerald-400 font-mono font-bold">{userProfile.datingPreferences?.minAge || 18}</span></label>
                            <input
                              type="range"
                              min="18"
                              max="80"
                              value={userProfile.datingPreferences?.minAge || 18}
                              onChange={(e) => setUserProfile({
                                ...userProfile,
                                datingPreferences: {
                                  ...(userProfile.datingPreferences || {}),
                                  minAge: Number(e.target.value)
                                }
                              })}
                              className={cn(
                                "w-full h-1.5 rounded-lg appearance-none cursor-pointer",
                                isGirlyMode ? "accent-pink-500 bg-pink-100" : "accent-emerald-500 bg-zinc-800"
                              )}
                            />
                          </div>
                          <div>
                            <label className={cn("text-xs font-black uppercase tracking-wide block mb-1.5", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>Max Age: <span className="text-emerald-500 dark:text-emerald-400 font-mono font-bold">{userProfile.datingPreferences?.maxAge || 40}</span></label>
                            <input
                              type="range"
                              min="18"
                              max="80"
                              value={userProfile.datingPreferences?.maxAge || 40}
                              onChange={(e) => setUserProfile({
                                ...userProfile,
                                datingPreferences: {
                                  ...(userProfile.datingPreferences || {}),
                                  maxAge: Number(e.target.value)
                                }
                              })}
                              className={cn(
                                "w-full h-1.5 rounded-lg appearance-none cursor-pointer",
                                isGirlyMode ? "accent-pink-500 bg-pink-100" : "accent-emerald-500 bg-zinc-800"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Local save for Dating Preferences */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveSection("Dating Sanctuary Preferences")}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all active:scale-95 cursor-pointer shadow-sm",
                          isGirlyMode 
                            ? "bg-pink-100 hover:bg-pink-200 border-pink-200 text-pink-705" 
                            : isDarkMode 
                              ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-emerald-400" 
                              : "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-850"
                        )}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Dating Prefs</span>
                      </button>
                    </div>
                  </div>

                  {/* Choose Avatar Section */}
                  <div className="space-y-3">
                    <label className={cn(
                      "text-sm font-extrabold uppercase block tracking-wide transition-colors",
                      isDarkMode ? "text-zinc-300" : "text-zinc-700"
                    )}>Choose Your Avatar</label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Upload a custom image button in the grid */}
                      <div className="relative aspect-square">
                        <label className={cn(
                          "flex flex-col items-center justify-center h-full rounded-2xl border-2 border-dashed transition-all active:scale-95 cursor-pointer text-center p-2",
                          isUploadingAvatar
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : isDarkMode 
                              ? "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500" 
                              : "border-zinc-300 bg-zinc-50 hover:border-zinc-400"
                        )}>
                          {isUploadingAvatar ? (
                            <>
                              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin mb-1" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Upload Own</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            disabled={isUploadingAvatar}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !user) return;
                              setIsUploadingAvatar(true);
                              try {
                                // Client-side image optimization/compression (keeps file size ~50-100KB)
                                const optimizeImage = (f: File): Promise<{ base64: string, type: string, name: string }> => {
                                  return new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const img = new window.Image();
                                      img.onload = () => {
                                        const canvas = document.createElement('canvas');
                                        const maxDim = 600;
                                        let w = img.width;
                                        let h = img.height;
                                        if (w > h) {
                                          if (w > maxDim) {
                                            h = Math.round((h * maxDim) / w);
                                            w = maxDim;
                                          }
                                        } else {
                                          if (h > maxDim) {
                                            w = Math.round((w * maxDim) / h);
                                            h = maxDim;
                                          }
                                        }
                                        canvas.width = w;
                                        canvas.height = h;
                                        const ctx = canvas.getContext('2d');
                                        if (!ctx) {
                                          reject(new Error("Canvas context failed"));
                                          return;
                                        }
                                        ctx.drawImage(img, 0, 0, w, h);
                                        resolve({
                                          base64: canvas.toDataURL('image/jpeg', 0.8),
                                          type: 'image/jpeg',
                                          name: f.name.replace(/\.[^/.]+$/, "") + ".jpg"
                                        });
                                      };
                                      img.onerror = () => reject(new Error("Image decoding failed. Please use standard format (JPEG, PNG, WebP)"));
                                      img.src = ev.target?.result as string;
                                    };
                                    reader.onerror = (err) => reject(err);
                                    reader.readAsDataURL(f);
                                  });
                                };

                                const optimized = await optimizeImage(file);

                                const downloadUrl = await uploadBase64ToStorage(optimized.base64, optimized.name, 'avatars');
                                
                                // Add to uploadedAvatars array
                                const currentUploaded = userProfile.uploadedAvatars || [];
                                const nextUploaded = [...currentUploaded, downloadUrl];
                                
                                // Update local profile state & immediately set as active avatar!
                                const updatedProfile = { 
                                  ...userProfile, 
                                  uploadedAvatars: nextUploaded, 
                                  avatarUrl: downloadUrl 
                                };
                                setUserProfile(updatedProfile);
                                
                                alert('Custom avatar uploaded and selected! Feel free to save the details.');
                              } catch (uploadErr: any) {
                                console.error('Avatar upload failed:', uploadErr);
                                alert('Failed to upload image: ' + uploadErr.message);
                              } finally {
                                setIsUploadingAvatar(false);
                                // Clear file input value to allow uploading the same file again
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                      </div>

                      {AVATARS.map((avatar) => (
                        <button
                          key={avatar.name}
                          type="button"
                          onClick={() => setUserProfile({ ...userProfile, avatarUrl: avatar.url })}
                          className={cn(
                            "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-350 active:scale-95 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer group z-10 hover:z-20",
                            userProfile.avatarUrl === avatar.url 
                              ? "border-emerald-500 ring-2 ring-emerald-500/20" 
                              : (isDarkMode ? "border-zinc-700 bg-zinc-800 hover:border-zinc-600" : "border-zinc-200 bg-zinc-100 hover:border-zinc-300")
                          )}
                        >
                          <img 
                            src={avatar.url} 
                            alt={avatar.name} 
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-120"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200';
                            }}
                          />
                          {userProfile.avatarUrl === avatar.url && (
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-emerald-500 drop-shadow-lg" />
                            </div>
                          )}
                        </button>
                      ))}

                      {/* Custom Uploaded Avatars list */}
                      {(userProfile.uploadedAvatars || []).map((url, idx) => (
                        <div key={`uploaded-${idx}`} className="relative aspect-square">
                          <button
                            type="button"
                            onClick={() => setUserProfile({ ...userProfile, avatarUrl: url })}
                            className={cn(
                              "w-full h-full rounded-2xl overflow-hidden border-2 transition-all duration-350 active:scale-95 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer relative group z-10 hover:z-20",
                              userProfile.avatarUrl === url 
                                ? "border-emerald-500 ring-2 ring-emerald-500/20" 
                                : (isDarkMode ? "border-zinc-700 bg-zinc-800 hover:border-zinc-600" : "border-zinc-200 bg-zinc-100 hover:border-zinc-300")
                            )}
                          >
                            <img 
                              src={url} 
                              alt={`Custom Uploaded ${idx + 1}`} 
                              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-120"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200';
                              }}
                            />
                            {userProfile.avatarUrl === url && (
                              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 drop-shadow-lg" />
                              </div>
                            )}
                          </button>
                          
                          {/* Deletion Cross */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = (userProfile.uploadedAvatars || []).filter((_, i) => i !== idx);
                              const isDeletedActive = userProfile.avatarUrl === url;
                              setUserProfile({
                                ...userProfile,
                                uploadedAvatars: updated,
                                avatarUrl: isDeletedActive ? AVATARS[0].url : userProfile.avatarUrl
                              });
                            }}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 rounded-full text-white shadow-md transition-all scale-90 hover:scale-105 active:scale-90"
                            title="Delete custom image"
                          >
                            <X className="w-2.5 h-2.5 stroke-[3px]" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Local save for Choose Your Avatar & Custom URL */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => handleSaveSection("Avatar Choices")}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all active:scale-95 cursor-pointer shadow-sm",
                          isGirlyMode 
                            ? "bg-pink-100 hover:bg-pink-200 border-pink-200 text-pink-705" 
                            : isDarkMode 
                              ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-emerald-400" 
                              : "bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-850"
                        )}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Chosen Avatar</span>
                      </button>
                    </div>

                  </div>

                  {/* Custom Avatar URL section */}
                  <div className="space-y-2">
                    <label className={cn(
                      "text-sm font-extrabold uppercase block tracking-wide transition-colors",
                      isDarkMode ? "text-zinc-300" : "text-zinc-700"
                    )}>Or Custom Avatar URL</label>
                    <input 
                      type="text" 
                      placeholder="https://example.com/image.jpg"
                      value={userProfile.avatarUrl && !AVATARS.some(a => a.url === userProfile.avatarUrl) ? userProfile.avatarUrl : ''}
                      onChange={(e) => setUserProfile({ ...userProfile, avatarUrl: e.target.value })}
                      className={cn(
                        "w-full border rounded-xl px-4 py-3.5 text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-500 transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-550" : "bg-zinc-100 border-zinc-300 text-zinc-900 placeholder-zinc-400"
                      )}
                    />
                  </div>

                  {/* Debug Info Section */}
                  <div className={cn(
                    "p-4 rounded-2xl border border-dashed",
                    isDarkMode ? "border-zinc-805 bg-zinc-900/30" : "border-zinc-300 bg-zinc-50"
                  )}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-550 mb-2">Debug Information</p>
                    <div className="space-y-1 font-mono text-[10px] text-zinc-500">
                      <p>UID: {user?.uid}</p>
                      <p>Email: {user?.email}</p>
                      <p>Marked Quotes: {userProfile.markedQuotes?.length || 0}</p>
                      <p>Library Quotes: {libraryQuotes.length}</p>
                    </div>
                  </div>

                </div>

                {/* Fixed Footer for Save Button */}
                <div className="pt-4 mt-2 border-t border-zinc-500/20 dark:border-zinc-800/50">
                  <button 
                    onClick={async () => {
                      if (user) {
                        try {
                          await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
                          // Synchronize to public profiles so dating swarm lists and clinical logs update instantly
                          try {
                            const publicProfileRef = doc(db, 'public_profiles', user.uid);
                            await setDoc(publicProfileRef, {
                              uid: user.uid,
                              name: userProfile.name || 'Seeker',
                              avatarUrl: userProfile.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
                              biography: userProfile.biography || '',
                              gender: userProfile.gender || 'male',
                              age: userProfile.age || 28,
                              height: userProfile.height || 0,
                              currentWeight: userProfile.currentWeight || 0,
                              targetWeight: userProfile.targetWeight || 0,
                              stepGoal: userProfile.stepGoal || 10000,
                              mbti: userProfile.mbti || '',
                              maxPullUps: userProfile.maxPullUps || 0,
                              oneRMWeighted: userProfile.oneRMWeighted || 0,
                              shortTermGoal: userProfile.shortTermGoal || '',
                              longTermGoal: userProfile.longTermGoal || '',
                              isDatingModeEnabled: !!userProfile.isDatingModeEnabled,
                              datingPreferences: userProfile.datingPreferences || null,
                              uploadedAvatars: userProfile.uploadedAvatars || [],
                              updatedAt: new Date().toISOString()
                            }, { merge: true });
                          } catch (pubErr) {
                            console.warn('Could not sync public_profiles:', pubErr);
                          }
                          setIsEditingProfile(false);
                        } catch (error) {
                          handleFirestoreError(error, 'update', `users/${user.uid}`);
                        }
                      } else {
                        localStorage.setItem('guest_profile', JSON.stringify(userProfile));
                        setIsEditingProfile(false);
                      }
                    }}
                    className="w-full py-4 bg-emerald-500 text-zinc-950 text-base rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-center cursor-pointer hover:bg-emerald-400"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Android Installation Guide Modal */}
      <AnimatePresence>
        {showAndroidInstallGuide && (
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
                "w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border transition-all duration-500 shadow-2xl",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
              )}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-500" />
                    <h3 className={cn("text-lg font-bold uppercase tracking-tight", isDarkMode ? "text-white" : "text-zinc-900")}>
                      Android Install Guide
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowAndroidInstallGuide(false)} 
                    className="p-2 rounded-full transition-all bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 border border-rose-455/30 active:scale-95 flex items-center justify-center cursor-pointer"
                    title="Close Dialog"
                  >
                    <X className="w-4 h-4 stroke-[3px]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className={cn("text-xs leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                    To launch WiseFit instantly from your launcher and secure full-screen biometric feedback, follow this high-performance layout alignment:
                  </p>

                  <div className="space-y-3">
                    {/* Step 1 */}
                    <div className={cn(
                      "flex items-start gap-3 p-4 rounded-2xl border",
                      isDarkMode ? "bg-zinc-800/20 border-zinc-800/60" : "bg-zinc-50 border-zinc-200"
                    )}>
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-black italic">
                        01
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wide">Open Chrome Options</p>
                        <p className={cn("text-[11px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                          Open <strong className="text-emerald-500 font-bold">Google Chrome</strong> on Android, look at the top-right corner of the address bar, and tap the Menu icon (<strong className="font-mono font-bold">⋮</strong>).
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className={cn(
                      "flex items-start gap-3 p-4 rounded-2xl border",
                      isDarkMode ? "bg-zinc-800/20 border-zinc-800/60" : "bg-zinc-50 border-zinc-200"
                    )}>
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-black italic">
                        02
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wide">Select Install Option</p>
                        <p className={cn("text-[11px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                          Scroll through the menu options list and tap on <strong className="text-emerald-500 font-bold">"Install app"</strong> or <strong className="text-emerald-500 font-bold">"Add to Home screen"</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className={cn(
                      "flex items-start gap-3 p-4 rounded-2xl border",
                      isDarkMode ? "bg-zinc-800/20 border-zinc-800/60" : "bg-zinc-50 border-zinc-200"
                    )}>
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-black italic">
                        03
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wide">Initiate Pure Sanctuary</p>
                        <p className={cn("text-[11px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                          Tap <strong className="text-emerald-500 font-bold">Add</strong> on the native confirmation tile. Open the app from your drawer to enjoy a distraction-free philosophy experience.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowAndroidInstallGuide(false)}
                  className="w-full py-3.5 bg-emerald-500 text-zinc-950 rounded-2xl font-black italic uppercase tracking-tighter text-xs active:scale-95 transition-transform shadow-lg shadow-emerald-500/20"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Article Modal */}
      <AnimatePresence>
        {(isAddingArticle || editingArticle) && (
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
                "w-full max-w-2xl h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden border transition-colors duration-500 flex flex-col",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-2xl"
              )}
            >
              <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      isDarkMode ? "bg-emerald-500/10 text-emerald-500" : "bg-emerald-50"
                    )}>
                      <Layout className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold">{editingArticle ? 'Edit Article' : 'New Article'}</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAddingArticle(false);
                      setEditingArticle(null);
                      setArticleTitle('');
                      setArticleContent('');
                      setArticleUrl('');
                      setArticleThumbnailUrl('');
                      setArticleExcerpt('');
                    }} 
                    className="p-2 rounded-full transition-all bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 border border-rose-455/30 active:scale-95 flex items-center justify-center cursor-pointer"
                    title="Close Dialog"
                  >
                    <X className="w-4 h-4 stroke-[3px]" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Title</label>
                    <input 
                      type="text" 
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      placeholder="e.g. The Strategic Path to HRV Mastery"
                      className={cn(
                        "w-full border rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-emerald-500 transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                  </div>

                  <div>
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>Video URL (Optional .mp4)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={articleUrl}
                        onChange={(e) => setArticleUrl(e.target.value)}
                        placeholder="e.g. https://compcharity.org/wp-content/uploads/video.mp4"
                        className={cn(
                          "flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all font-mono",
                          isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                        )}
                      />
                      {articleUrl && (
                        <button
                          type="button"
                          onClick={() => setArticleUrl('')}
                          className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs rounded-xl transition-all"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <label className={cn(
                        "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed cursor-pointer transition-all hover:bg-emerald-500/10 hover:border-emerald-500/40 text-xs font-bold",
                        isDarkMode ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-emerald-400" : "bg-zinc-100 border-zinc-300 text-zinc-650 hover:text-emerald-600"
                      )}>
                        {isUploadingArticleVideo ? (
                          <span className="animate-pulse flex items-center gap-1.5 text-emerald-500 font-bold uppercase tracking-wider text-[10px]">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Uploading Biometric Video... {articleVideoProgress}%
                          </span>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="uppercase tracking-wider text-[10px]">Upload Video Direct from Phone (.mp4)</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="video/mp4,video/x-m4v,video/*"
                          className="hidden" 
                          disabled={isUploadingArticleVideo}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            // Check file size limit: 100MB
                            const MAX_MB = 100;
                            if (file.size > MAX_MB * 1024 * 1024) {
                              alert(`The video exceeds our recommended ${MAX_MB}MB sanctuary limit for rapid mobile browsing.`);
                              return;
                            }

                            setIsUploadingArticleVideo(true);
                            setArticleVideoProgress(0);

                            try {
                              const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                              const storageRef = ref(storage, `articles_videos/${uniqueName}`);
                              const uploadTask = uploadBytesResumable(storageRef, file);

                              uploadTask.on('state_changed', 
                                (snapshot) => {
                                  const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                                  setArticleVideoProgress(progress);
                                }, 
                                (error) => {
                                  console.error('Video upload failed:', error);
                                  alert('Upload channels rejected the file: ' + error.message);
                                  setIsUploadingArticleVideo(false);
                                }, 
                                async () => {
                                  const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                                  setArticleUrl(downloadUrl);
                                  setIsUploadingArticleVideo(false);
                                }
                              );
                            } catch (err: any) {
                              console.error('Video upload outer failed:', err);
                              alert('Attachment transit interrupted: ' + err.message);
                              setIsUploadingArticleVideo(false);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Option D Custom Thumbnail Image */}
                  <div>
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>
                      Post Thumbnail Image (Optional)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        value={articleThumbnailUrl}
                        onChange={(e) => setArticleThumbnailUrl(e.target.value)}
                        placeholder="e.g. /uploads/extracted_thumbnail_123.jpg"
                        className={cn(
                          "flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all font-mono",
                          isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-650" : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                        )}
                      />
                      {articleThumbnailUrl && (
                        <button
                          type="button"
                          onClick={() => setArticleThumbnailUrl('')}
                          className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs rounded-xl transition-all"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2 flex-wrap">
                      {/* Upload Thumbnail direct */}
                      <label className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed cursor-pointer transition-all hover:bg-emerald-500/10 hover:border-emerald-500/40 text-xs font-bold",
                        isDarkMode ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-emerald-400" : "bg-zinc-100 border-zinc-300 text-zinc-650 hover:text-emerald-600"
                      )}>
                        {isUploadingThumbnail ? (
                          <span className="animate-pulse flex items-center gap-1.5 text-emerald-500 font-bold uppercase tracking-wider text-[10px]">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Uploading Thumbnail...
                          </span>
                        ) : (
                          <>
                            <Image className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="uppercase tracking-wider text-[10px]">Upload Thumbnail Image</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          disabled={isUploadingThumbnail}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setIsUploadingThumbnail(true);
                            try {
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64 = reader.result as string;
                                try {
                                  const downloadUrl = await uploadBase64ToStorage(
                                    base64, 
                                    file.name, 
                                    'thumbnails'
                                  );
                                  setArticleThumbnailUrl(downloadUrl);
                                } catch (uploadErr) {
                                  setArticleThumbnailUrl(base64); // Safe local fallback
                                }
                                setIsUploadingThumbnail(false);
                              };
                              reader.readAsDataURL(file);
                            } catch (err: any) {
                              console.error('Thumbnail upload failed:', err);
                              alert('Upload failed: ' + err.message);
                              setIsUploadingThumbnail(false);
                            }
                          }}
                        />
                      </label>

                      {/* Option D: Video Frame Extraction */}
                      {articleUrl && (
                        <button
                          type="button"
                          disabled={isExtractingThumbnail}
                          onClick={() => extractThumbnailFromVideoUrl(articleUrl)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed transition-all text-xs font-bold active:scale-95",
                            isExtractingThumbnail 
                              ? "bg-amber-500/10 border-amber-500 text-amber-500 animate-pulse" 
                              : isDarkMode 
                                ? "bg-zinc-900/60 border-zinc-800 hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-amber-400 text-zinc-400" 
                                : "bg-zinc-100 border-zinc-300 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 text-zinc-650"
                          )}
                        >
                          {isExtractingThumbnail ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span className="uppercase tracking-wider text-[10px]">Capturing Frame from Video...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-3.5 h-3.5 text-amber-500" />
                              <span className="uppercase tracking-wider text-[10px]">Capture Frame (Option D)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Custom Excerpt / Description for Facebook Feed */}
                  <div>
                    <label className={cn(
                      "text-xs font-bold uppercase mb-1 block transition-colors",
                      isDarkMode ? "text-zinc-500" : "text-zinc-400"
                    )}>
                      Facebook Feed Description / Excerpt (Optional)
                    </label>
                    <textarea 
                      value={articleExcerpt}
                      onChange={(e) => setArticleExcerpt(e.target.value)}
                      placeholder="e.g. Discover how elite Stoic daily discipline integrates with deep biometric trends. Ideal for direct social feeds."
                      className={cn(
                        "w-full h-20 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all font-sans leading-relaxed resize-none",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className={cn(
                        "text-xs font-bold uppercase block transition-colors",
                        isDarkMode ? "text-zinc-500" : "text-zinc-400"
                      )}>Content (Markdown Supported)</label>
                      <div className="flex gap-3 text-[10px] font-bold">
                        <span className={cn(
                          articleContent.length > 30000 ? "text-red-500" : "text-zinc-500"
                        )}>
                          {articleContent.length.toLocaleString()} / 30,000 chars
                        </span>
                        <span className={cn(
                          articleContent.trim().split(/\s+/).filter(Boolean).length > 5000 ? "text-red-500" : "text-zinc-500"
                        )}>
                          {articleContent.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} / 5,000 words
                        </span>
                      </div>
                    </div>
                    <textarea 
                      value={articleContent}
                      onChange={(e) => setArticleContent(e.target.value)}
                      placeholder="Paste your AI insights or write your thoughts here...\n\nUse # for headers\nUse ** for bold\nUse - for lists"
                      className={cn(
                        "w-full h-[40vh] border rounded-xl px-4 py-4 focus:outline-none focus:border-emerald-500 transition-all font-sans leading-relaxed resize-none",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                  </div>

                  <div className={cn(
                    "p-4 rounded-2xl border border-dashed",
                    isDarkMode ? "border-zinc-800 bg-zinc-900/30" : "border-zinc-200 bg-zinc-50"
                  )}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2 flex items-center gap-2">
                       <CheckCircle2 className="w-3 h-3" />
                       Automatic Formatting Active
                    </p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Your response will be automatically beautified. Headers, subheaders, and lists will be rendered with precision. Perfect for long-form Claude or Gemini exports.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-800/20 bg-zinc-950/20">
                <button 
                  onClick={handleAddArticle}
                  disabled={!articleTitle.trim() || !articleContent.trim() || articleContent.length > 30000 || articleContent.trim().split(/\s+/).filter(Boolean).length > 5000}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black italic tracking-tighter shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase",
                    (!articleTitle.trim() || !articleContent.trim() || articleContent.length > 30000 || articleContent.trim().split(/\s+/).filter(Boolean).length > 5000)
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-emerald-500 text-zinc-950 shadow-emerald-500/20"
                  )}
                >
                  {editingArticle ? 'Save Changes' : 'Publish Article'}
                </button>
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
                            if (file && user) {
                              setIsUploadingFile(true);
                              try {
                                const storageRef = ref(storage, `users/${user.uid}/attachments/${Date.now()}_${file.name}`);
                                await uploadBytes(storageRef, file);
                                const downloadUrl = await getDownloadURL(storageRef);
                                await handleAddAttachment('file', file.name, downloadUrl, file.type);
                              } catch (uploadError) {
                                console.error('Upload failed:', uploadError);
                                alert('Upload failed. Please check your connection and try again.');
                              } finally {
                                setIsUploadingFile(false);
                              }
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
                  disabled={!newWorkout.name || isUploadingFile}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2",
                    (!newWorkout.name || isUploadingFile)
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-emerald-500 text-zinc-950 shadow-emerald-500/20"
                  )}
                >
                  {isUploadingFile ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing File...
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

function StatCard({ icon, label, value, goal, progress, color, index, isDarkMode, isGirlyMode }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "backdrop-blur-md border rounded-3xl p-4 space-y-3 transition-all group",
        isGirlyMode ? "bg-white/40 border-pink-100 shadow-sm shadow-pink-500/5 hover:bg-white/60" :
        isDarkMode 
          ? "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40" 
          : "bg-white/60 border-zinc-200 hover:bg-zinc-50/80 shadow-sm"
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn(
          "p-2 rounded-xl group-hover:scale-110 transition-transform",
          isGirlyMode ? "bg-pink-100" : isDarkMode ? "bg-zinc-800/50" : "bg-zinc-100"
        )}>
          {icon}
        </div>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          isGirlyMode ? "text-pink-400" : isDarkMode ? "text-zinc-500" : "text-zinc-400"
        )}>Goal: {goal}</span>
      </div>
      <div>
        <p className={cn(
          "text-2xl font-bold tabular-nums tracking-tight",
          isGirlyMode ? "text-pink-600" : ""
        )}>{value}</p>
        <p className={cn(
          "text-xs font-medium",
          isGirlyMode ? "text-pink-500/70" : isDarkMode ? "text-zinc-500" : "text-zinc-400"
        )}>{label}</p>
      </div>
      <div className={cn(
        "h-1.5 w-full rounded-full overflow-hidden",
        isGirlyMode ? "bg-pink-100" : isDarkMode ? "bg-zinc-800/50" : "bg-zinc-100"
      )}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress * 100, 100)}%` }}
          transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
          className={cn("h-full rounded-full", isGirlyMode && color === 'bg-emerald-500' ? 'bg-pink-500' : color)}
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
  key?: any;
}

function WorkoutCard({ workout, full = false, isDarkMode, isGirlyMode, onDelete, onEdit, onAddComment, onUpdateWorkout, currentUserId }: WorkoutCardProps & { isGirlyMode?: boolean }) {
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
      isGirlyMode ? "bg-white/50 border-pink-100 hover:bg-white/80 shadow-sm" :
      isDarkMode 
        ? "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40" 
        : "bg-white/60 border-zinc-200 hover:bg-zinc-50/80 shadow-sm"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl group-hover:scale-110 transition-transform",
            isGirlyMode ? "bg-pink-100" : isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50"
          )}>
            <Dumbbell className={cn("w-5 h-5", isGirlyMode ? "text-pink-500" : "text-emerald-500")} />
          </div>
          <div>
            <h4 className={cn("font-bold", isGirlyMode ? "text-pink-900" : "")}>{workout.name}</h4>
            <p className={cn(
              "text-xs flex items-center gap-1 font-medium",
              isGirlyMode ? "text-pink-400" : isDarkMode ? "text-zinc-500" : "text-zinc-400"
            )}>
              <Calendar className="w-3 h-3" /> {format(new Date(workout.date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <>
            <button 
              onClick={() => onEdit?.(workout)}
              className={cn(
                "p-2 rounded-xl transition-all",
                isGirlyMode ? "hover:bg-pink-100 text-pink-300 hover:text-pink-500" : "hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500"
              )}
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
          <ChevronRight className={cn(
            "w-5 h-5 transition-colors",
            isGirlyMode ? "text-pink-200 group-hover:text-pink-500" : isDarkMode ? "text-zinc-600 group-hover:text-emerald-500" : "text-zinc-300 group-hover:text-emerald-500"
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
            const ytId = extractYoutubeId(workout.content || '');
            const ttId = extractTiktokId(workout.content || '');
            const directUrl = extractDirectVideoUrl(workout.content || '');
            
            if (directUrl) {
              return <VideoEmbed type="direct" videoId={directUrl} isDarkMode={isDarkMode} />;
            }
            if (ytId) {
              return <VideoEmbed type="youtube" videoId={ytId} isDarkMode={isDarkMode} />;
            }
            if (ttId) {
              return <VideoEmbed type="tiktok" videoId={ttId} isDarkMode={isDarkMode} />;
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
              if (commentText.trim()) {
                onAddComment?.(workout.id, commentText);
                setCommentText('');
              }
            }}
            className={cn(
              "p-2 bg-emerald-500 text-zinc-950 rounded-xl active:scale-95 transition-transform"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, isDarkMode, isGirlyMode }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 transition-all duration-300 relative flex-shrink-0 min-w-[38px] sm:min-w-[64px] py-1",
        active 
          ? (isGirlyMode ? "text-pink-600 scale-105 font-bold" : "text-emerald-400 scale-110 font-bold") 
          : (isGirlyMode ? "text-pink-450 hover:text-pink-600" : isDarkMode ? "text-zinc-350 hover:text-white" : "text-zinc-600 hover:text-zinc-900")
      )}
    >
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className={cn(
            "absolute -top-1.5 w-1.5 h-1.5 rounded-full",
            isGirlyMode ? "bg-pink-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          )}
        />
      )}
      <div className={cn(
        "transition-transform duration-300",
        active ? "scale-110 opacity-100" : "scale-100 opacity-90"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[8px] sm:text-[10px] font-extrabold uppercase tracking-tighter sm:tracking-widest transition-all",
        active ? "opacity-100 translate-y-0" : "opacity-80 translate-y-0"
      )}>
        {label}
      </span>
    </button>
  );
}

function ProfileItem({ label, value, isDarkMode, isGirlyMode }: { label: string, value: string, isDarkMode?: boolean, isGirlyMode?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 backdrop-blur-md border rounded-2xl transition-all hover:bg-opacity-80",
      isGirlyMode 
        ? "bg-white/60 border-pink-100/50 hover:bg-pink-50/80 shadow-sm"
        : isDarkMode 
          ? "bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-800/40" 
          : "bg-white/60 border-zinc-200 hover:bg-zinc-50/80 shadow-sm"
    )}>
      <span className={cn(
        "text-sm font-medium",
        isGirlyMode ? "text-pink-400" : isDarkMode ? "text-zinc-500" : "text-zinc-400"
      )}>{label}</span>
      <span className={cn("text-sm font-bold", isGirlyMode ? "text-pink-900" : "")}>{value}</span>
    </div>
  );
}
