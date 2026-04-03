import { useState, useEffect, useRef } from 'react';
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
  Check
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
import type { Workout, DailyStats, Exercise, Set, DayPlan, PlannedExercise, UserProfile, ChatMessage } from './types';
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
  orderBy, 
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

// Mock Data
const AVATARS = [
  { name: 'Marcus Aurelius', url: 'https://compcharity.org/wp-content/uploads/2026/04/images.jpg' },
  { name: 'Seneca', url: 'https://compcharity.org/wp-content/uploads/2026/04/senecaa.jpg' },
  { name: 'Epictetus', url: 'https://compcharity.org/wp-content/uploads/2026/04/web-Epictetus-Bust-750x400-1.jpg' },
  { name: 'Xunzi', url: 'https://compcharity.org/wp-content/uploads/2026/04/hqdefault.jpg' },
  { name: 'Musonius Rufus', url: 'https://compcharity.org/wp-content/uploads/2026/04/maxresdefault-1.jpg' },
  { name: 'Zeno', url: 'https://compcharity.org/wp-content/uploads/2026/04/zeno_of_citium.jpg' },
];

const WISE_QUOTES = [
  { text: "Don't explain your philosophy, embody it.", author: "Epictetus", source: "Stoic" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius", source: "Stoic" },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca", source: "Stoic" },
  { text: "The nature of man is evil; his goodness is the result of conscious activity.", author: "Xunzi", source: "Chinese" },
  { text: "If there is no inner self-cultivation, how can one govern others?", author: "Xunzi", source: "Chinese" },
  { text: "The way of the warrior is resolute acceptance of death.", author: "Miyamoto Musashi", source: "Japanese" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb", source: "Japanese" },
  { text: "Love your neighbor as yourself.", author: "Jesus Christ", source: "Christian" },
  { text: "Ask and it will be given to you; seek and you will find.", author: "Jesus Christ", source: "Christian" },
  { text: "He who saves a single life, saves the entire world.", author: "The Talmud", source: "Jewish" },
  { text: "If I am not for myself, who will be for me? If I am only for myself, what am I?", author: "Hillel the Elder", source: "Jewish" },
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Petar',
  height: 182,
  currentWeight: 80,
  targetWeight: 75,
  stepGoal: 10000,
  shortTermGoal: '+60 kg',
  longTermGoal: '+100 kg',
  maxPullUps: 14,
  oneRMWeighted: 30,
  avatarUrl: AVATARS[0].url
};

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

type View = 'dashboard' | 'plan' | 'workouts' | 'progress' | 'profile' | 'chat';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [currentQuote, setCurrentQuote] = useState(WISE_QUOTES[0]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('petar_theme');
    return saved ? saved === 'dark' : true;
  });
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>(INITIAL_WEEKLY_PLAN);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats] = useState<DailyStats[]>(MOCK_STATS);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await ensureUserDoc(firebaseUser);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const randomQuote = WISE_QUOTES[Math.floor(Math.random() * WISE_QUOTES.length)];
    setCurrentQuote(randomQuote);
  }, []);

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
      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);
    } else {
      setUserProfile(userDoc.data() as UserProfile);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Listen to user profile
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) setUserProfile(doc.data() as UserProfile);
    }, (error) => handleFirestoreError(error, 'get', `users/${user.uid}`));

    // Listen to workouts
    const qWorkouts = query(collection(db, 'workouts'), where('uid', '==', user.uid), orderBy('date', 'desc'));
    const unsubWorkouts = onSnapshot(qWorkouts, (snapshot) => {
      setWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)));
    }, (error) => handleFirestoreError(error, 'list', 'workouts'));

    // Listen to plans
    const qPlans = query(collection(db, 'plans'), where('uid', '==', user.uid));
    const unsubPlans = onSnapshot(qPlans, (snapshot) => {
      if (!snapshot.empty) {
        setWeeklyPlan(snapshot.docs[0].data().plan as DayPlan[]);
      } else {
        // Create initial plan if none exists
        addDoc(collection(db, 'plans'), { uid: user.uid, plan: INITIAL_WEEKLY_PLAN });
      }
    }, (error) => handleFirestoreError(error, 'list', 'plans'));

    return () => {
      unsubProfile();
      unsubWorkouts();
      unsubPlans();
    };
  }, [user]);

  const handleFirestoreError = (error: any, operationType: string, path: string) => {
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
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: chatInput }] };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...chatMessages, userMessage],
        config: {
          systemInstruction: `You are an expert fitness coach and a master of ancient wisdom. 
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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('petar_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const todayStats = stats[stats.length - 1];
  const currentDayIndex = (getDay(new Date()) + 6) % 7; // Monday is 0

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn(
        "min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500",
        isDarkMode ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
      )}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-sm"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto">
            <Activity className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter">FitTrack</h1>
            <p className="text-zinc-500">Your personal fitness companion. Sign in to track your progress and access your plan.</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-emerald-500 text-zinc-950 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-emerald-500/30 overflow-x-hidden relative transition-colors duration-500",
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    )}>
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
        <div>
          <h1 className={cn(
            "text-xl font-bold tracking-tight transition-colors",
            isDarkMode ? "text-emerald-400" : "text-emerald-600"
          )}>FitTrack</h1>
          <p className={cn(
            "text-xs font-medium uppercase tracking-widest transition-colors",
            isDarkMode ? "text-zinc-500" : "text-zinc-400"
          )}>
            {format(new Date(), 'EEEE, MMM d')}
          </p>
        </div>
        <div className="flex items-center gap-4">
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
                  "backdrop-blur-md border rounded-3xl p-6 relative overflow-hidden transition-colors duration-500",
                  isDarkMode ? "bg-zinc-900/60 border-zinc-800/50" : "bg-white/80 border-zinc-200 shadow-sm"
                )}
              >
                <div className="absolute top-[-20px] right-[-20px] opacity-10">
                  <Flame className="w-24 h-24 text-emerald-500" />
                </div>
                <div className="relative z-10 space-y-3">
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                    isDarkMode ? "text-emerald-500/70" : "text-emerald-600/70"
                  )}>{currentQuote.source} Wisdom</p>
                  <p className={cn(
                    "text-lg font-serif italic leading-relaxed transition-colors",
                    isDarkMode ? "text-zinc-100" : "text-zinc-900"
                  )}>
                    "{currentQuote.text}"
                  </p>
                  <p className={cn(
                    "text-xs font-medium transition-colors",
                    isDarkMode ? "text-zinc-500" : "text-zinc-400"
                  )}>— {currentQuote.author}</p>
                </div>
              </motion.div>

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
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">History</h2>
                <button 
                  onClick={() => setIsAddingWorkout(true)}
                  className="bg-emerald-500 text-zinc-950 p-2 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {workouts.map(workout => (
                  <WorkoutCard key={workout.id} workout={workout} full isDarkMode={isDarkMode} />
                ))}
              </div>
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
                <h3 className={cn(
                  "text-sm font-semibold mb-6 uppercase tracking-wider transition-colors",
                  isDarkMode ? "text-zinc-400" : "text-zinc-500"
                )}>Weight Trend (kg)</h3>
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
                        domain={['dataMin - 1', 'dataMax + 1']}
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
                </div>
                <div className={cn(
                  "backdrop-blur-md border rounded-2xl p-4 transition-colors duration-500",
                  isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white/60 border-zinc-200 shadow-sm"
                )}>
                  <p className={cn(
                    "text-xs uppercase font-bold mb-1 transition-colors",
                    isDarkMode ? "text-zinc-500" : "text-zinc-400"
                  )}>Avg Calories</p>
                  <p className="text-2xl font-bold text-orange-500">2,140</p>
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
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Coach</h2>
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
                      <p className="font-bold text-zinc-500">The Force is strong with you, Petar.</p>
                      <p className="text-sm text-zinc-600">Ask me anything about your training, nutrition, or how to master the pull-up.</p>
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={cn(
                    "flex",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm relative group",
                      msg.role === 'user' 
                        ? "bg-emerald-500 text-zinc-950 font-medium rounded-tr-none" 
                        : (isDarkMode ? "bg-zinc-800 text-zinc-100 rounded-tl-none" : "bg-zinc-100 text-zinc-900 rounded-tl-none")
                    )}>
                      {msg.parts[0].text}
                      {msg.role === 'model' && (
                        <button
                          onClick={() => handleCopy(msg.parts[0].text, idx)}
                          className={cn(
                            "absolute top-2 right-2 p-1.5 rounded-lg transition-all",
                            copiedIndex === idx 
                              ? "bg-emerald-500/20 text-emerald-500" 
                              : "opacity-0 group-hover:opacity-100 bg-zinc-700/30 text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          {copiedIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
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
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
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
            label="Coach"
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
                "w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border transition-colors duration-500",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-2xl"
              )}
            >
              <div className="p-6 space-y-6">
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
                      placeholder="e.g. Chest & Triceps"
                      className={cn(
                        "w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                    />
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2 transition-colors",
                    isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-400"
                  )}>
                    <Plus className="w-6 h-6" />
                    <span className="text-sm font-medium">Add Exercise</span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAddingWorkout(false)}
                  className="w-full py-4 bg-emerald-500 text-zinc-950 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                >
                  Save Workout
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
  key?: string | number;
}

function WorkoutCard({ workout, full = false, isDarkMode }: WorkoutCardProps & { isDarkMode?: boolean }) {
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
        <ChevronRight className={cn(
          "w-5 h-5 transition-colors",
          isDarkMode ? "text-zinc-600 group-hover:text-emerald-500" : "text-zinc-300 group-hover:text-emerald-500"
        )} />
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
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
