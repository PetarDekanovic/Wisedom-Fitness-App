import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { db, auth, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  arrayUnion, 
  arrayRemove,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Heart, 
  Send, 
  Trash2, 
  Edit, 
  X, 
  Plus, 
  Maximize2,
  Sparkles, 
  Link as LinkIcon, 
  Youtube, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  User, 
  Search,
  BookOpen,
  UserCheck,
  UserPlus,
  UserX,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Paperclip,
  Smile,
  Brain,
  Compass,
  MapPin,
  Play,
  Save,
  Share2,
  Twitter,
  Facebook,
  Copy,
  Loader2,
  Upload,
  MessageCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PublicProfile, CommunityPost, Conversation, DMMessage, UserProfile } from '../types';
import { 
  Briefcase, 
  GraduationCap, 
  Music, 
  Coffee, 
  Calendar, 
  Camera, 
  Edit3
} from 'lucide-react';

interface SocialSanctuaryProps {
  isDarkMode: boolean;
  isGirlyMode: boolean;
  currentUser: any; // FirebaseUser
  userProfile: UserProfile;
  isPremiumUser?: boolean;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error in Social Sanctuary:', JSON.stringify(errInfo));
}

interface QuizQuestionConfig {
  id: string;
  category: 'bigfive' | 'mmpi' | 'mbti';
  subcategory?: 'O' | 'C' | 'E' | 'A' | 'N' | 'IE' | 'SN' | 'TF' | 'JP';
  text: string;
  type: 'agree_disagree' | 'true_false';
}

const PSYCH_QUESTIONS: QuizQuestionConfig[] = [
  // --- BIG FIVE ---
  { id: 'ocean_o1', category: 'bigfive', subcategory: 'O', text: "I have a vivid, creative imagination and am deeply drawn to abstract thoughts and speculation.", type: 'agree_disagree' },
  { id: 'ocean_o2', category: 'bigfive', subcategory: 'O', text: "I heavily prefer strict routine and concrete facts over unconventional aesthetic pursuits.", type: 'agree_disagree' },
  { id: 'ocean_o3', category: 'bigfive', subcategory: 'O', text: "I find deep excitement in hearing complex philosophical, scientific, or cosmological ideas.", type: 'agree_disagree' },
  { id: 'ocean_o4', category: 'bigfive', subcategory: 'O', text: "I tend to avoid overly theoretical discussions and prefer a focus on immediate, practical realities.", type: 'agree_disagree' },

  { id: 'ocean_c1', category: 'bigfive', subcategory: 'C', text: "I am extremely disciplined, efficient, organized, and always stick to firm schedules.", type: 'agree_disagree' },
  { id: 'ocean_c2', category: 'bigfive', subcategory: 'C', text: "I find myself acting on random impulse, prioritizing zero-commitment spontaneity.", type: 'agree_disagree' },
  { id: 'ocean_c3', category: 'bigfive', subcategory: 'C', text: "I am highly diligent, double-check my work for errors, and keep my environments immaculate.", type: 'agree_disagree' },
  { id: 'ocean_c4', category: 'bigfive', subcategory: 'C', text: "I frequently postpone tedious obligations and run behind on scheduled target deadlines.", type: 'agree_disagree' },

  { id: 'ocean_e1', category: 'bigfive', subcategory: 'E', text: "I draw a high degree of energy and expressiveness from participating in group discussions.", type: 'agree_disagree' },
  { id: 'ocean_e2', category: 'bigfive', subcategory: 'E', text: "I heavily prefer silent, solitary study, quiet recovery, and direct dialogs over social settings.", type: 'agree_disagree' },
  { id: 'ocean_e3', category: 'bigfive', subcategory: 'E', text: "I actively seek out vibrant environments, express my thoughts eagerly, and like taking the lead.", type: 'agree_disagree' },
  { id: 'ocean_e4', category: 'bigfive', subcategory: 'E', text: "I often remain quiet in large groups and find high-stimulus gatherings physiologically draining.", type: 'agree_disagree' },

  { id: 'ocean_a1', category: 'bigfive', subcategory: 'A', text: "I default to active compassion, mutual trust, and seeking common ground with fellow seekers.", type: 'agree_disagree' },
  { id: 'ocean_a2', category: 'bigfive', subcategory: 'A', text: "I prioritize rigorous analytical skepticism and objective logical accuracy over group harmony.", type: 'agree_disagree' },
  { id: 'ocean_a3', category: 'bigfive', subcategory: 'A', text: "I sympathize deeply with others' emotions and go out of my way to support peers in distress.", type: 'agree_disagree' },
  { id: 'ocean_a4', category: 'bigfive', subcategory: 'A', text: "I am perfectly willing to engage in tough arguments and express dissent when others are mistaken.", type: 'agree_disagree' },

  { id: 'ocean_n1', category: 'bigfive', subcategory: 'N', text: "I find myself easily perturbed, anxious, or emotionally sensitive under strain.", type: 'agree_disagree' },
  { id: 'ocean_n2', category: 'bigfive', subcategory: 'N', text: "I maintain perfect resilience, calm assurance, and internal Stoic control in sudden chaos.", type: 'agree_disagree' },
  { id: 'ocean_n3', category: 'bigfive', subcategory: 'N', text: "I worry frequently about minor errors and feel a sense of psychological fatigue when tired.", type: 'agree_disagree' },
  { id: 'ocean_n4', category: 'bigfive', subcategory: 'N', text: "My emotional mood remains exceptionally stable, and I rarely dwell on regrets or fear.", type: 'agree_disagree' },

  // --- MMPI ---
  { id: 'mmpi_s1', category: 'mmpi', text: "My morning recovery, sleep states, and nervous stability are robustly stable day-to-day.", type: 'true_false' },
  { id: 'mmpi_s2', category: 'mmpi', text: "I experience abrupt emotional oscillations without any logical physiological explanation.", type: 'true_false' },
  { id: 'mmpi_s3', category: 'mmpi', text: "I quickly master nervous impulses when subjected to severe physical stress.", type: 'true_false' },
  { id: 'mmpi_s4', category: 'mmpi', text: "I frequently struggle with unexplained physical fatigue, brain fog, or low cognitive drive.", type: 'true_false' },
  { id: 'mmpi_s5', category: 'mmpi', text: "I feel totally confident in my mental stamina and ability to endure critical life stress.", type: 'true_false' },
  { id: 'mmpi_s6', category: 'mmpi', text: "I experience excessive muscular tension, heart pounding, or tension headaches under tight deadlines.", type: 'true_false' },

  { id: 'mmpi_lie1', category: 'mmpi', text: "I have never in my entire life told a single lie, felt any irritation, or complained about any hardship.", type: 'true_false' },
  { id: 'mmpi_lie2', category: 'mmpi', text: "I have always, without exception, put the comfort and needs of others entirely before my own convenience.", type: 'true_false' },
  { id: 'mmpi_lie3', category: 'mmpi', text: "I have never felt any urge to gossip, laugh at an inappropriate joke, or judge another seeker.", type: 'true_false' },
  { id: 'mmpi_lie4', category: 'mmpi', text: "I always admit my mistakes immediately and completely without ever feeling defensive or seeking an excuse.", type: 'true_false' },
  { id: 'mmpi_lie5', category: 'mmpi', text: "I have never felt a single moment of jealousy, resentment, or competitiveness toward anyone else's progress.", type: 'true_false' },
  { id: 'mmpi_lie6', category: 'mmpi', text: "I have never procrastinated on a duty, wasted time on unconstructive activities, or broken a promise.", type: 'true_false' },

  // --- MBTI ---
  { id: 'mbti_ie1', category: 'mbti', subcategory: 'IE', text: "Do you gain mental focus and recovery by withdrawing into your quiet inner contemplation rather than outgoing social interaction?", type: 'true_false' },
  { id: 'mbti_ie2', category: 'mbti', subcategory: 'IE', text: "In a collaborative academic workspace, do you feel more creative and clear-headed working alone rather than in a brainstorming crowd?", type: 'true_false' },
  { id: 'mbti_ie3', category: 'mbti', subcategory: 'IE', text: "Do you prefer expressing your deepest breakthroughs through rigorous writing and static posts rather than oral presentations?", type: 'true_false' },

  { id: 'mbti_sn1', category: 'mbti', subcategory: 'SN', text: "Do you focus heavily on abstract philosophical connections, future theories, and symbolic logic rather than direct mechanical facts and practical daily reality?", type: 'true_false' },
  { id: 'mbti_sn2', category: 'mbti', subcategory: 'SN', text: "Are you more inspired by what could be—focusing on prospective visions, poetry, or deep speculative science—rather than what is here and now?", type: 'true_false' },
  { id: 'mbti_sn3', category: 'mbti', subcategory: 'SN', text: "Do you naturally search for hidden symbolic connections, patterns, and underlying principles rather than trusting surface level observable evidence?", type: 'true_false' },

  { id: 'mbti_tf1', category: 'mbti', subcategory: 'TF', text: "Do you decide complex issues primarily by applying rigorous objective logical principles rather than personal empathy and direct values?", type: 'true_false' },
  { id: 'mbti_tf2', category: 'mbti', subcategory: 'TF', text: "In an academic debate, do you value unvarnished truth and critical accuracy far more than preserving social consensus and guarding egos?", type: 'true_false' },
  { id: 'mbti_tf3', category: 'mbti', subcategory: 'TF', text: "Do you analyze policies, ideas, and human behaviors using cause-and-effect consistency rather than its emotional value or moral warmth?", type: 'true_false' },

  { id: 'mbti_jp1', category: 'mbti', subcategory: 'JP', text: "Do you prefer a tightly structured existence with firm commitments, clear timelines, and analytical closure rather than keeping plans open and highly flexible?", type: 'true_false' },
  { id: 'mbti_jp2', category: 'mbti', subcategory: 'JP', text: "Do you feel unsettled when projects or schedules remain unresolved, and feel strong satisfaction once an action plan is settled?", type: 'true_false' },
  { id: 'mbti_jp3', category: 'mbti', subcategory: 'JP', text: "Do you habitually rely on strict guidelines, structured task lists, and systematic boundaries to govern your daily recovery?", type: 'true_false' }
];

const DUMMY_SCHOLARS: PublicProfile[] = [
  {
    uid: 'dummy_marcus_aurelius',
    name: 'Marcus Aurelius',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    coverUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600',
    relationshipIntent: 'Long-term partnership',
    location: 'Rome, Italy',
    height: '185',
    biography: 'Emperor of Rome. Author of Meditations. Focuses on stoic temperance, deep morning journaling, and body callisthenics.',
    isOnline: true,
    lastActive: new Date().toISOString(),
    friends: [],
    gender: 'male',
    age: 59,
    isDatingModeEnabled: true,
    datingPreferences: {
      genderInterest: 'female',
      minAge: 18,
      maxAge: 60
    },
    mbti: 'INFJ',
    mbtiName: 'The Counselor / Advocate',
    bigFive: {
      openness: 90,
      conscientiousness: 98,
      extraversion: 35,
      agreeableness: 85,
      neuroticism: 15
    },
    intellectualInterests: ['Stoicism', 'Philosophy', 'Journaling', 'Statecraft'],
    userPhotos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400'
    ]
  },
  {
    uid: 'dummy_seneca_younger',
    name: 'Lucius Seneca',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600',
    relationshipIntent: 'Mindful companionship',
    location: 'Cordoba, Spain',
    height: '178',
    biography: 'Imperial Advisor and playwright. Writing dialogues on tranquility and mental equilibrium under load.',
    isOnline: true,
    lastActive: new Date().toISOString(),
    friends: [],
    gender: 'male',
    age: 65,
    isDatingModeEnabled: true,
    datingPreferences: {
      genderInterest: 'female',
      minAge: 18,
      maxAge: 65
    },
    mbti: 'ENFJ',
    mbtiName: 'The Teacher / Mentor',
    bigFive: {
      openness: 95,
      conscientiousness: 90,
      extraversion: 55,
      agreeableness: 88,
      neuroticism: 25
    },
    intellectualInterests: ['Stoicism', 'Philosophy', 'Rhetoric', 'Tragedies'],
    userPhotos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400'
    ]
  },
  {
    uid: 'dummy_epictetus',
    name: 'Epictetus',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600',
    relationshipIntent: 'Intellectual calisthenic dyads',
    location: 'Hierapolis, Phrygia',
    height: '173',
    biography: 'Born a slave, died a master. Teaching that we suffer not from events, but from our judgment of them.',
    isOnline: true,
    lastActive: new Date().toISOString(),
    friends: [],
    gender: 'male',
    age: 80,
    isDatingModeEnabled: true,
    datingPreferences: {
      genderInterest: 'female',
      minAge: 18,
      maxAge: 85
    },
    mbti: 'INFP',
    mbtiName: 'The Idealist / Healer',
    bigFive: {
      openness: 85,
      conscientiousness: 95,
      extraversion: 30,
      agreeableness: 80,
      neuroticism: 12
    },
    intellectualInterests: ['Stoicism', 'Philosophy', 'Ethics', 'Freedom'],
    userPhotos: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
    ]
  },
  {
    uid: 'dummy_hypatia_alex',
    name: 'Hypatia of Alexandria',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    coverUrl: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&q=80&w=600',
    relationshipIntent: 'Deep philosophical connection',
    location: 'Alexandria, Egypt',
    height: '172',
    biography: 'Neoplatonist philosopher, leading astronomer and mathematician. Seeking physical hygiene and structural clarity.',
    isOnline: true,
    lastActive: new Date().toISOString(),
    friends: [],
    gender: 'female',
    age: 35,
    isDatingModeEnabled: true,
    datingPreferences: {
      genderInterest: 'male',
      minAge: 18,
      maxAge: 45
    },
    mbti: 'INTJ',
    mbtiName: 'The Architect / Mind Master',
    bigFive: {
      openness: 98,
      conscientiousness: 92,
      extraversion: 40,
      agreeableness: 78,
      neuroticism: 18
    },
    intellectualInterests: ['Neoplatonism', 'Astronomy', 'Mathematics', 'Philosophy'],
    userPhotos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    ]
  },
  {
    uid: 'dummy_diotima_mantinea',
    name: 'Diotima of Mantinea',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    coverUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600',
    relationshipIntent: 'Spiritual & intellectual resonance',
    location: 'Mantinea, Greece',
    height: '168',
    biography: 'Ancient Greek priestess and philosopher. Taught Socrates the Ladder of Love (Eros) as a climb from physical desire to eternal truth.',
    isOnline: true,
    lastActive: new Date().toISOString(),
    friends: [],
    gender: 'female',
    age: 38,
    isDatingModeEnabled: true,
    datingPreferences: {
      genderInterest: 'all',
      minAge: 18,
      maxAge: 50
    },
    mbti: 'INFJ',
    mbtiName: 'The Mystic Counselor',
    bigFive: {
      openness: 99,
      conscientiousness: 85,
      extraversion: 50,
      agreeableness: 90,
      neuroticism: 14
    },
    intellectualInterests: ['Philosophy', 'Metaphysics', 'Eros Theory', 'Diads'],
    userPhotos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=400'
    ]
  },
  {
    uid: 'dummy_aspasia_miletus',
    name: 'Aspasia of Miletus',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600',
    relationshipIntent: 'Rhetorical & dialectic partnership',
    location: 'Athens, Greece',
    height: '170',
    biography: 'Intellectual partner of Pericles and dialogue teacher of Socrates. Expert in rhetoric, statecraft, and high-performance lifestyle habits.',
    isOnline: true,
    lastActive: new Date().toISOString(),
    friends: [],
    gender: 'female',
    age: 36,
    isDatingModeEnabled: true,
    datingPreferences: {
      genderInterest: 'male',
      minAge: 18,
      maxAge: 45
    },
    mbti: 'ENTJ',
    mbtiName: 'The Commander / Rhetorician',
    bigFive: {
      openness: 96,
      conscientiousness: 88,
      extraversion: 85,
      agreeableness: 80,
      neuroticism: 22
    },
    intellectualInterests: ['Rhetoric', 'Statecraft', 'Philosophy', 'Debate'],
    userPhotos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=400'
    ]
  }
];

export function SocialSanctuary({ isDarkMode, isGirlyMode, currentUser, userProfile, isPremiumUser }: SocialSanctuaryProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'peers' | 'moderation' | 'personality'>('feed');

  const renderChoiceChips = (
    label: string,
    icon: React.ReactNode,
    options: string[],
    currentVal: string,
    setVal: (v: string) => void
  ) => (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-350">{label}</label>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setVal(opt)}
            className={cn(
              "px-3 py-1.5 text-[10.5px] font-bold rounded-xl border transition-all cursor-pointer active:scale-95",
              currentVal === opt
                ? isDarkMode 
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-extrabold"
                  : "bg-emerald-50 border-emerald-450 text-emerald-850 font-extrabold shadow-sm"
                : isDarkMode 
                  ? "bg-zinc-950/60 border-zinc-850 hover:border-zinc-800 text-zinc-400"
                  : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-650"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
  
  // Public profiles
  const [thisPublicProfile, setThisPublicProfile] = useState<PublicProfile | null>(null);
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);
  const [setupBiography, setSetupBiography] = useState('');
  const [setupName, setSetupName] = useState(userProfile?.name || '');
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);
  const [activeTooltipUid, setActiveTooltipUid] = useState<string | null>(null);
  const [editUserPhotos, setEditUserPhotos] = useState<string[]>([]);
  const [editUserPhotosVisibility, setEditUserPhotosVisibility] = useState<string[]>([]);
  const [uploadingSlots, setUploadingSlots] = useState<{ [key: number]: boolean }>({});
  const [uploadProgressSlots, setUploadProgressSlots] = useState<{ [key: number]: number }>({});

  // Dating, matching and personality states
  const [personalitySubTab, setPersonalitySubTab] = useState<'bio' | 'quiz'>('bio');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editRelationshipIntent, setEditRelationshipIntent] = useState('Deep philosophical connection');
  const [editLocation, setEditLocation] = useState('Zagreb, Croatia');
  const [editHeight, setEditHeight] = useState('180');
  const [editFitnessStyle, setEditFitnessStyle] = useState('Heavy Calisthenics');
  const [editMorningEnergy, setEditMorningEnergy] = useState('Sharp morning riser');
  const [editInterests, setEditInterests] = useState<string[]>(['Stoicism', 'Calisthenics']);
  
  const [editFavoritePhilosophers, setEditFavoritePhilosophers] = useState('');
  const [editFavoritePsychologists, setEditFavoritePsychologists] = useState('');

  // Tinder-inspired premium profile state properties
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [editAnthem, setEditAnthem] = useState('');
  const [editZodiac, setEditZodiac] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editFamilyPlans, setEditFamilyPlans] = useState('');
  const [editCommunicationStyle, setEditCommunicationStyle] = useState('');
  const [editLoveStyle, setEditLoveStyle] = useState('');
  const [editPets, setEditPets] = useState('');
  const [editDrinking, setEditDrinking] = useState('');
  const [editSmoking, setEditSmoking] = useState('');
  const [editAskGoingOut, setEditAskGoingOut] = useState('');
  const [editAskMyWeekends, setEditAskMyWeekends] = useState('');
  const [editAskMePhone, setEditAskMePhone] = useState('');
  const [activePromptBuilder, setActivePromptBuilder] = useState<'going_out' | 'weekends' | 'phone' | null>(null);

  // Interactive scientific-philosophical compatibility simulator states
  const [selectedPartnerArchetype, setSelectedPartnerArchetype] = useState('');
  const [archetypeCompatibilityScore, setArchetypeCompatibilityScore] = useState<number | null>(null);
  const [compatibilityAnalysis, setCompatibilityAnalysis] = useState('');

  
  // Quiz evaluation states
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: boolean | number }>({});
  const [quizCalculated, setQuizCalculated] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [eduSection, setEduSection] = useState<'mbti' | 'ocean' | 'mmpi' | 'matches'>('mbti');

  // Preset covers for classical/academic wellness vibe
  const PRESET_COVERS = [
    { name: "Slate Wisdom", url: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&q=80&w=600" },
    { name: "Classical Ruins", url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600" },
    { name: "Forest Sanctuary", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600" },
    { name: "Infinite Cosmos", url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=600" }
  ];

  // Preset avatars for classical roles
  const PRESET_AVATARS = [
    { name: "Marcus", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300" },
    { name: "Seneca", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300" },
    { name: "Epictetus", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300" },
    { name: "Hypatia", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300" },
    { name: "Athena", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300" }
  ];

  // Instant Engage Direct Message dialogue box
  const [engagePeer, setEngagePeer] = useState<PublicProfile | null>(null);
  const [engageMessage, setEngageMessage] = useState('');
  const [isSendingEngage, setIsSendingEngage] = useState(false);
  const [engageSuccess, setEngageSuccess] = useState(false);
  const [engageError, setEngageError] = useState<string | null>(null);

  // Sync setup name when profile loads
  useEffect(() => {
    if (userProfile?.name && !setupName) {
      setSetupName(userProfile.name);
    }
  }, [userProfile]);

  // Feed states
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const newPostWordCount = newPostContent.trim() ? newPostContent.trim().split(/\s+/).length : 0;
  const isNewPostOverWordLimit = newPostWordCount > 7000;
  const [newPostMediaType, setNewPostMediaType] = useState<'none' | 'image' | 'video' | 'youtube' | 'tiktok'>('none');
  const [isUploadingPostVideo, setIsUploadingPostVideo] = useState(false);
  const [postVideoProgress, setPostVideoProgress] = useState(0);
  const [newPostMediaUrl, setNewPostMediaUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Direct messages states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<DMMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [dummyTypingState, setDummyTypingState] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Peers directory
  const [peers, setPeers] = useState<PublicProfile[]>(() => DUMMY_SCHOLARS.filter(d => d.uid !== currentUser?.uid));
  const [peerSearchQuery, setPeerSearchQuery] = useState('');
  const [selectedPeerWall, setSelectedPeerWall] = useState<PublicProfile | null>(null);
  const [showCompatibilityReport, setShowCompatibilityReport] = useState<boolean>(false);
  const [peerWallPosts, setPeerWallPosts] = useState<CommunityPost[]>([]);

  // Admin moderation queue
  const [pendingPosts, setPendingPosts] = useState<CommunityPost[]>([]);

  // Post edit / delete state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState<string>('');
  const editingPostWordCount = editingPostContent.trim() ? editingPostContent.trim().split(/\s+/).length : 0;
  const isEditingPostOverWordLimit = editingPostWordCount > 7000;
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Sharing states
  const [activeSharePostId, setActiveSharePostId] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Sub-tabs horizontal scrolling & mobile view visibility states
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const handleTabScroll = () => {
    const el = tabContainerRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    // Set a tiny 5px buffer to account for rounding/zoom layouts
    setShowLeftFade(scrollLeft > 5);
    setShowRightFade(scrollLeft < maxScroll - 5);
  };

  useEffect(() => {
    const el = tabContainerRef.current;
    if (el) {
      el.addEventListener('scroll', handleTabScroll);
      // Run immediately
      handleTabScroll();
      // Schedule a staggered update to capture full rendered layout sizes
      const timer = setTimeout(handleTabScroll, 600);
      window.addEventListener('resize', handleTabScroll);
      return () => {
        el.removeEventListener('scroll', handleTabScroll);
        window.removeEventListener('resize', handleTabScroll);
        clearTimeout(timer);
      };
    }
  }, [pendingPosts.length]);

  // Check if current logged in is admin
  const isAdmin = currentUser?.email === 'petar.dekanovic@gmail.com' || userProfile?.role === 'admin';

  // Dummy provisioning states for message system validation
  const [isProvisioningDummy, setIsProvisioningDummy] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // File attachments and upload state
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEngageModal: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit 50MB
    const MAX_SIZE_MB = 50;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    
    if (file.size > MAX_SIZE_BYTES) {
      const errMsg = `File exceeds the safe ${MAX_SIZE_MB}MB sanctuary limit.`;
      if (isEngageModal) setEngageError(errMsg);
      else alert(errMsg);
      return;
    }

    setIsUploadingFile(true);
    if (isEngageModal) setEngageError(null);

    try {
      const reader = new FileReader();
      const fileLoadedPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      
      reader.readAsDataURL(file);
      const base64Data = await fileLoadedPromise;

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          base64Data
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server rejected attachment upload.');
      }

      const uploadResult = await response.json();
      
      const attachmentLabel = `[Attachment: ${file.name}](${uploadResult.url})`;
      if (isEngageModal) {
        setEngageMessage(prev => prev ? `${prev}\n${attachmentLabel}` : attachmentLabel);
      } else {
        setNewMessageText(prev => prev ? `${prev} ${attachmentLabel}` : attachmentLabel);
      }
    } catch (uploadErr: any) {
      console.error('File upload error:', uploadErr);
      const errMsg = uploadErr?.message || 'Sanctuary channels rejected upload. Try a smaller file.';
      if (isEngageModal) setEngageError(errMsg);
      else alert(errMsg);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const renderMessageTextWithAttachments = (text: string, isMine: boolean, isScholar = false) => {
    if (!text) return null;

    const regex = /\[Attachment:\s*(.*?)\]\((.*?)\)/gi;
    const parts = [];
    let lastIndex = 0;
    let match;
    const mediaMatches: { filename: string; url: string }[] = [];

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = regex.lastIndex;
      
      if (start > lastIndex) {
        parts.push(text.substring(lastIndex, start));
      }
      
      const filename = match[1];
      const url = match[2];
      mediaMatches.push({ filename, url });

      lastIndex = end;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    const remainsText = parts.length > 0 ? parts.join("") : text;

    // Separate normal text and find special links
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const textSegments: React.ReactNode[] = [];
    let textLastIndex = 0;
    let urlMatch;
    const richPreviews: { type: 'youtube' | 'tiktok'; url: string; id?: string }[] = [];

    while ((urlMatch = urlRegex.exec(remainsText)) !== null) {
      const start = urlMatch.index;
      const end = urlRegex.lastIndex;
      const matchedUrl = urlMatch[1];

      if (start > textLastIndex) {
        textSegments.push(remainsText.substring(textLastIndex, start));
      }

      const isYoutube = /youtube\.com|youtu\.be/i.test(matchedUrl);
      const isTiktok = /tiktok\.com/i.test(matchedUrl);

      if (isYoutube) {
        let videoId = null;
        const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const ytMatch = matchedUrl.match(ytReg);
        if (ytMatch && ytMatch[2].length === 11) {
          videoId = ytMatch[2];
        } else {
          const shortsMatch = matchedUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
          if (shortsMatch) {
            videoId = shortsMatch[1];
          }
        }
        richPreviews.push({ type: 'youtube', url: matchedUrl, id: videoId || undefined });
      } else if (isTiktok) {
        richPreviews.push({ type: 'tiktok', url: matchedUrl });
      }

      textSegments.push(
        <a 
          key={start}
          href={matchedUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "underline break-all transition-all font-black decoration-2 cursor-pointer z-10 relative px-1 py-0.5 rounded",
            isMine 
              ? "text-white bg-zinc-950/20 hover:bg-zinc-950/30 border border-white/10 hover:text-white" 
              : "text-emerald-400 hover:text-emerald-300 bg-zinc-950/10 hover:bg-zinc-950/25 border border-zinc-700/50"
          )}
        >
          {matchedUrl}
        </a>
      );

      textLastIndex = end;
    }

    if (textLastIndex < remainsText.length) {
      textSegments.push(remainsText.substring(textLastIndex));
    }

    const hasUrls = textSegments.length > 0;

    return (
      <div className="space-y-2">
        {remainsText.trim() && (
          <div className={cn(
            "whitespace-pre-wrap select-text leading-relaxed pt-0.5 text-left font-handwritten text-[18px] sm:text-[20px] font-bold tracking-wide",
            isMine ? "text-zinc-950" : isDarkMode ? "text-emerald-50" : "text-emerald-950"
          )}>
            {hasUrls ? textSegments : <ReactMarkdown>{remainsText}</ReactMarkdown>}
          </div>
        )}

        {richPreviews.length > 0 && (
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-zinc-550/10">
            {richPreviews.map((preview, idx) => {
              if (preview.type === 'youtube' && preview.id) {
                const thumbUrl = `https://img.youtube.com/vi/${preview.id}/mqdefault.jpg`;
                return (
                  <a
                    key={idx}
                    href={preview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "flex items-center gap-2.5 p-1.5 rounded-xl border transition-all hover:scale-[1.01] overflow-hidden text-left cursor-pointer z-10 relative",
                      isMine 
                        ? "bg-zinc-950/30 hover:bg-zinc-950/40 border-zinc-950/20 text-white" 
                        : "bg-zinc-950/40 hover:bg-zinc-950/60 border-zinc-850 text-zinc-100"
                    )}
                  >
                    <div className="relative w-20 h-12 shrink-0 rounded-lg overflow-hidden bg-black/40 border border-white/5 shadow-sm">
                      <img 
                        src={thumbUrl} 
                        alt="YouTube Preview" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=200";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-650 text-white shadow-md">
                          <span className="text-[7px] pl-0.5">▶</span>
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 pr-1 select-none">
                      <p className={cn(
                        "text-[9px] font-extrabold uppercase tracking-wide leading-none font-mono opacity-85",
                        isMine ? "text-emerald-300" : "text-emerald-400"
                      )}>
                        YouTube Video
                      </p>
                      <p className="text-[10px] font-semibold truncate leading-tight mt-0.5">
                        Watch details & demonstrations
                      </p>
                      <p className="text-[7.5px] font-mono truncate tracking-tight opacity-70 leading-none mt-0.5">
                        {preview.url}
                      </p>
                    </div>
                  </a>
                );
              } else if (preview.type === 'tiktok') {
                return (
                  <a
                    key={idx}
                    href={preview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "flex items-center gap-2.5 p-1.5 rounded-xl border transition-all hover:scale-[1.01] overflow-hidden text-left cursor-pointer z-10 relative",
                      isMine 
                        ? "bg-zinc-950/30 hover:bg-zinc-950/40 border-zinc-950/20 text-white" 
                        : "bg-zinc-950/40 hover:bg-zinc-950/60 border-zinc-850 text-zinc-100"
                    )}
                  >
                    <div className="relative w-20 h-12 shrink-0 rounded-lg overflow-hidden bg-zinc-900 border border-white/5 shadow-sm">
                      <img 
                        src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=160"
                        alt="TikTok Preview" 
                        className="w-full h-full object-cover filter brightness-75 contrast-125" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-zinc-950 border border-emerald-500/40 text-emerald-400 text-[8px] font-black shadow-md">
                          🎵
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 pr-1 select-none">
                      <p className={cn(
                        "text-[9px] font-extrabold uppercase tracking-wide leading-none font-mono opacity-85",
                        isMine ? "text-emerald-300" : "text-emerald-400"
                      )}>
                        TikTok Video
                      </p>
                      <p className="text-[10px] font-semibold truncate leading-tight mt-0.5">
                        View routine demonstration
                      </p>
                      <p className="text-[7.5px] font-mono truncate tracking-tight opacity-70 leading-none mt-0.5">
                        {preview.url}
                      </p>
                    </div>
                  </a>
                );
              }
              return null;
            })}
          </div>
        )}
        {mediaMatches.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-zinc-500/10 mt-2">
            {mediaMatches.map((m, i) => {
              const isImage = /\.(jpe?g|png|gif|webp|svg)/i.test(m.url);
              const isVideo = /\.(mp4|webm|mov|ogg)/i.test(m.url);
              const isPdf = /\.pdf/i.test(m.url);

              return (
                <div key={i} className="rounded-xl overflow-hidden bg-black/10 border border-zinc-550/15 p-2 text-left">
                  {isImage && (
                    <div className="space-y-1.5">
                      <img 
                        src={m.url} 
                        alt="attachment" 
                        className="max-h-56 w-full object-cover rounded-lg border border-white/5" 
                        referrerPolicy="no-referrer"
                      />
                      <a 
                        href={m.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[9px] underline font-mono tracking-tight block hover:text-emerald-400 opacity-85"
                      >
                        {m.filename}
                      </a>
                    </div>
                  )}
                  {isVideo && (
                    <div className="space-y-1.5">
                      <video 
                        src={m.url} 
                        controls 
                        className="w-full max-h-56 rounded-lg object-contain bg-black" 
                      />
                      <a 
                        href={m.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[9px] underline font-mono tracking-tight block hover:text-emerald-400 opacity-85"
                      >
                        {m.filename}
                      </a>
                    </div>
                  )}
                  {isPdf && (
                    <div className="flex items-center justify-between gap-2.5 bg-black/20 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-rose-400 shrink-0" />
                        <div className="text-left">
                          <p className="text-[10px] font-bold truncate max-w-[130px] leading-tight text-zinc-100">{m.filename}</p>
                          <p className="text-[8px] text-zinc-500 font-mono">PDF Document</p>
                        </div>
                      </div>
                      <a 
                        href={m.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-[8px] uppercase tracking-wider font-bold shrink-0 border border-zinc-700"
                      >
                        View
                      </a>
                    </div>
                  )}
                  {!isImage && !isVideo && !isPdf && (
                    <div className="flex items-center justify-between gap-2 bg-black/20 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div className="text-left">
                          <p className="text-[10px] font-bold truncate max-w-[130px] leading-tight text-zinc-100">{m.filename}</p>
                          <p className="text-[8px] text-zinc-500 font-mono">Payload File</p>
                        </div>
                      </div>
                      <a 
                        href={m.url} 
                        download 
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-[8px] uppercase tracking-wider font-bold shrink-0"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Friend requests database sync state
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

  // 1. Initial lookup / registration of Public Profile to enable social activity
  useEffect(() => {
    if (!currentUser) return;

    const profileRef = doc(db, 'public_profiles', currentUser.uid);
    const unsub = onSnapshot(profileRef, async (snap) => {
      if (snap.exists()) {
        setThisPublicProfile(snap.data() as PublicProfile);
      } else {
        // Silently provision public profile with defaults to completely prevent blocking the user
        try {
          const profileData: PublicProfile = {
            uid: currentUser.uid,
            name: userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Seeker',
            avatarUrl: userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            biography: 'Seeking intellectual and physical discipline.',
            updatedAt: new Date().toISOString()
          };
          await setDoc(profileRef, profileData);
        } catch (e) {
          console.error('Auto-provision profile failed:', e);
          setIsSettingUpProfile(true);
        }
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `public_profiles/${currentUser.uid}`);
    });

    return () => unsub();
  }, [currentUser, userProfile]);

  // Presence keeper: Updates isOnline to true and regularly updates lastActive timestamp
  useEffect(() => {
    if (!currentUser) return;

    const profileRef = doc(db, 'public_profiles', currentUser.uid);

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
        console.warn('Presence update skipped during setup:', err);
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
  }, [currentUser]);

  // Synchronize persona inputs when the user's public profile is fetched
  useEffect(() => {
    if (thisPublicProfile) {
      setSetupName(thisPublicProfile.name || userProfile?.name || '');
      setEditCoverUrl(thisPublicProfile.coverUrl || '');
      setEditAvatarUrl(thisPublicProfile.avatarUrl || '');
      setEditRelationshipIntent(thisPublicProfile.relationshipIntent || 'Deep philosophical connection');
      setEditLocation(thisPublicProfile.location || 'Zagreb, Croatia');
      setEditHeight(thisPublicProfile.height || '180');
      setEditFitnessStyle(thisPublicProfile.fitnessStyle || 'Heavy Calisthenics');
      setEditMorningEnergy(thisPublicProfile.morningEnergy || 'Sharp morning riser');
      setEditInterests(thisPublicProfile.intellectualInterests || ['Stoicism', 'Calisthenics']);
      setSetupBiography(thisPublicProfile.biography || '');
      setEditFavoritePhilosophers(thisPublicProfile.favoritePhilosophers || '');
      setEditFavoritePsychologists(thisPublicProfile.favoritePsychologists || '');
      setEditUserPhotos(thisPublicProfile.userPhotos || []);
      setEditUserPhotosVisibility(thisPublicProfile.userPhotosVisibility || ['friends', 'friends', 'friends', 'friends']);
      
      setEditJobTitle(thisPublicProfile.jobTitle || '');
      setEditCompany(thisPublicProfile.company || '');
      setEditSchool(thisPublicProfile.school || '');
      setEditAnthem(thisPublicProfile.anthem || '');
      setEditZodiac(thisPublicProfile.zodiac || '');
      setEditEducation(thisPublicProfile.education || '');
      setEditFamilyPlans(thisPublicProfile.familyPlans || '');
      setEditCommunicationStyle(thisPublicProfile.communicationStyle || '');
      setEditLoveStyle(thisPublicProfile.loveStyle || '');
      setEditPets(thisPublicProfile.pets || '');
      setEditDrinking(thisPublicProfile.drinking || '');
      setEditSmoking(thisPublicProfile.smoking || '');
      setEditAskGoingOut(thisPublicProfile.askGoingOut || '');
      setEditAskMyWeekends(thisPublicProfile.askMyWeekends || '');
      setEditAskMePhone(thisPublicProfile.askMePhone || '');
      
      if (thisPublicProfile.bigFive) {
        setQuizCalculated(true);
      }
    }
  }, [thisPublicProfile, userProfile]);

  // Handle uploading specific seeker photo
  const handleUploadPhoto = async (index: number, file: File) => {
    if (!currentUser) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Only JPEG and PNG image formats are securely supported as genuine representations.");
      return;
    }
    
    // Check size limit: 8MB
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("This photograph exceeds our 8MB sanctuary limit for rapid modern rendering.");
      return;
    }

    setUploadingSlots(prev => ({ ...prev, [index]: true }));
    setUploadProgressSlots(prev => ({ ...prev, [index]: 20 }));

    try {
      const reader = new FileReader();
      const fileLoadedPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      
      reader.readAsDataURL(file);
      const base64Data = await fileLoadedPromise;
      setUploadProgressSlots(prev => ({ ...prev, [index]: 50 }));

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          base64Data
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server rejected photo upload.');
      }

      setUploadProgressSlots(prev => ({ ...prev, [index]: 80 }));
      const uploadResult = await response.json();
      const downloadUrl = uploadResult.url;

      const updated = [...editUserPhotos];
      updated[index] = downloadUrl;
      setEditUserPhotos(updated);

      // Determine if this is the first custom uploaded image or if current avatar is default/empty
      const hasNoPriorUploadedPhotos = !thisPublicProfile?.userPhotos?.some((p: string) => p && p.startsWith('http'));
      const isPlaceholderAvatar = !editAvatarUrl || 
        editAvatarUrl.includes('unsplash.com') || 
        editAvatarUrl.includes('images.unsplash.com');

      let nextAvatarUrl = editAvatarUrl;
      if (isPlaceholderAvatar || hasNoPriorUploadedPhotos || index === 0) {
        nextAvatarUrl = downloadUrl;
        setEditAvatarUrl(downloadUrl);
      }

      // Write immediately to Firestore ('public_profiles') so it is NEVER lost on page refresh!
      const docRef = doc(db, 'public_profiles', currentUser.uid);
      await setDoc(docRef, {
        userPhotos: updated,
        avatarUrl: nextAvatarUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Keep the 'users' collection in sync as well
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        avatarUrl: nextAvatarUrl
      }, { merge: true });

      // Refresh local profile state
      setThisPublicProfile(prev => prev ? { ...prev, userPhotos: updated, avatarUrl: nextAvatarUrl } : null);
      setUploadProgressSlots(prev => ({ ...prev, [index]: 100 }));

    } catch (err: any) {
      console.error('Photo upload outer error:', err);
      alert('Outer process interruption: ' + err.message);
    } finally {
      setTimeout(() => {
        setUploadingSlots(prev => ({ ...prev, [index]: false }));
      }, 500);
    }
  };

  // Update biography and dating-compatible parameters
  const handleSaveBiographyAndDating = async () => {
    if (!currentUser) return;
    try {
      const profileUpdates: Partial<PublicProfile> = {
        name: setupName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Seeker',
        coverUrl: editCoverUrl,
        avatarUrl: editAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        relationshipIntent: editRelationshipIntent,
        location: editLocation,
        height: editHeight,
        fitnessStyle: editFitnessStyle,
        morningEnergy: editMorningEnergy,
        intellectualInterests: editInterests,
        biography: setupBiography,
        favoritePhilosophers: editFavoritePhilosophers,
        favoritePsychologists: editFavoritePsychologists,
        userPhotos: editUserPhotos,
        userPhotosVisibility: editUserPhotosVisibility,
        isDatingModeEnabled: userProfile?.isDatingModeEnabled || false,
        datingPreferences: userProfile?.datingPreferences || { genderInterest: 'female', minAge: 18, maxAge: 40 },
        gender: userProfile?.gender || 'male',
        age: userProfile?.age || 28,

        // Tinder style attributes
        jobTitle: editJobTitle,
        company: editCompany,
        school: editSchool,
        anthem: editAnthem,
        zodiac: editZodiac,
        education: editEducation,
        familyPlans: editFamilyPlans,
        communicationStyle: editCommunicationStyle,
        loveStyle: editLoveStyle,
        pets: editPets,
        drinking: editDrinking,
        smoking: editSmoking,
        askGoingOut: editAskGoingOut,
        askMyWeekends: editAskMyWeekends,
        askMePhone: editAskMePhone,

        updatedAt: new Date().toISOString()
      };
      
      const docRef = doc(db, 'public_profiles', currentUser.uid);
      await updateDoc(docRef, profileUpdates);
      setThisPublicProfile(prev => prev ? { ...prev, ...profileUpdates } : null);
      setSaveSuccessMessage('Your dating & academic biography has been permanently locked!');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `public_profiles/${currentUser.uid}`);
    }
  };

  // Perform psychometric analysis based on clinical standards
  const handleCalculatePersonality = async () => {
    // 1. Calculate Big Five (OCEAN) with BFI-25 standard scoring (1 to 5 Likert scale)
    const calculateBigFiveTrait = (posIds: string[], negIds: string[]): number => {
      let sum = 0;
      let count = 0;
      posIds.forEach(id => {
        const val = quizAnswers[id];
        const numVal = typeof val === 'number' ? val : (val === true ? 5 : (val === false ? 1 : 3));
        sum += numVal;
        count++;
      });
      negIds.forEach(id => {
        const val = quizAnswers[id];
        const numVal = typeof val === 'number' ? val : (val === true ? 5 : (val === false ? 1 : 3));
        sum += (6 - numVal); // Reverse key scoring
        count++;
      });
      const minPossible = count * 1;
      const maxPossible = count * 5;
      return Math.round(((sum - minPossible) / (maxPossible - minPossible)) * 100);
    };

    const openness = calculateBigFiveTrait(['ocean_o1', 'ocean_o3'], ['ocean_o2', 'ocean_o4']);
    const conscientiousness = calculateBigFiveTrait(['ocean_c1', 'ocean_c3'], ['ocean_c2', 'ocean_c4']);
    const extraversion = calculateBigFiveTrait(['ocean_e1', 'ocean_e3'], ['ocean_e2', 'ocean_e4']);
    const agreeableness = calculateBigFiveTrait(['ocean_a1', 'ocean_a3'], ['ocean_a2', 'ocean_a4']);
    const neuroticism = calculateBigFiveTrait(['ocean_n1', 'ocean_n3'], ['ocean_n2', 'ocean_n4']);

    // 2. Calculate MMPI Resilience Index (0-100%) - 6 items (Classic True/False diagnostic scale)
    let stabilityHits = 0;
    if (quizAnswers['mmpi_s1'] === true) stabilityHits++;
    if (quizAnswers['mmpi_s2'] === false) stabilityHits++;
    if (quizAnswers['mmpi_s3'] === true) stabilityHits++;
    if (quizAnswers['mmpi_s4'] === false) stabilityHits++;
    if (quizAnswers['mmpi_s5'] === true) stabilityHits++;
    if (quizAnswers['mmpi_s6'] === false) stabilityHits++;
    const mmpiResilience = Math.round((stabilityHits / 6) * 100);

    // Calculate MMPI Lie Tracker Index (0 to 6 positive perfection answers)
    let lieHits = 0;
    if (quizAnswers['mmpi_lie1'] === true) lieHits++;
    if (quizAnswers['mmpi_lie2'] === true) lieHits++;
    if (quizAnswers['mmpi_lie3'] === true) lieHits++;
    if (quizAnswers['mmpi_lie4'] === true) lieHits++;
    if (quizAnswers['mmpi_lie5'] === true) lieHits++;
    if (quizAnswers['mmpi_lie6'] === true) lieHits++;
    
    const mmpiTruthScore = Math.round(((6 - lieHits) / 6) * 100);
    let mmpiStatus = "Verified Integrity";
    if (lieHits >= 1 && lieHits <= 2) {
      mmpiStatus = "Minor Idealization Detected (Plausible answers)";
    } else if (lieHits >= 3 && lieHits <= 4) {
      mmpiStatus = "Major Defense Mechanism (Substantial need to project ideal self)";
    } else if (lieHits >= 5) {
      mmpiStatus = "Amusingly Insincere (Clinical Lie alerts: extreme declared perfection)";
    }

    // 3. Myers-Briggs Typology Mapping - 3 items per axis (5-point Likert scale)
    const calculateMbtiAxis = (ids: string[]): number => {
      let sum = 0;
      ids.forEach(id => {
        const val = quizAnswers[id];
        const numVal = typeof val === 'number' ? val : (val === true ? 5 : (val === false ? 1 : 3));
        sum += numVal;
      });
      return sum;
    };

    const ieScoreValue = calculateMbtiAxis(['mbti_ie1', 'mbti_ie2', 'mbti_ie3']);
    const typeI = ieScoreValue >= 9 ? 'I' : 'E';

    const snScoreValue = calculateMbtiAxis(['mbti_sn1', 'mbti_sn2', 'mbti_sn3']);
    const typeN = snScoreValue >= 9 ? 'N' : 'S';

    const tfScoreValue = calculateMbtiAxis(['mbti_tf1', 'mbti_tf2', 'mbti_tf3']);
    const typeT = tfScoreValue >= 9 ? 'T' : 'F';

    const jpScoreValue = calculateMbtiAxis(['mbti_jp1', 'mbti_jp2', 'mbti_jp3']);
    const typeJ = jpScoreValue >= 9 ? 'J' : 'P';

    const mbti = `${typeI}${typeN}${typeT}${typeJ}`;

    const MBTI_MAP: { [key: string]: string } = {
      "INTJ": "The Architect Scholar",
      "INFJ": "The Seeker Counselor",
      "INTP": "The Analytical Sage",
      "INFP": "The Idealist Thinker",
      "ISTJ": "The Stoic Guardian",
      "ISFJ": "The Altruistic Protector",
      "ISTP": "The Operational Virtuoso",
      "ISFP": "The Tranquil Artist",
      "ENTJ": "The Strategic Commander",
      "ENFJ": "The Radiant Mentor",
      "ENTP": "The Visionary Challenger",
      "ENFP": "The Inspired Campaigner",
      "ESTJ": "The Executive Scholar",
      "ESFJ": "The Caring Coordinator",
      "ESTP": "The Bold Dynamo",
      "ESFP": "The Kinesthetic Companion"
    };
    const mbtiName = MBTI_MAP[mbti] || "The Scholarly Seeker";

    if (currentUser) {
      const updatedProfileParts: Partial<PublicProfile> = {
        mbti,
        mbtiName,
        bigFive: {
          openness,
          conscientiousness,
          extraversion,
          agreeableness,
          neuroticism
        },
        mmpiResilience,
        mmpiTruthScore,
        mmpiStatus,
        quizTakenAt: new Date().toISOString()
      };

      try {
        const docRef = doc(db, 'public_profiles', currentUser.uid);
        await updateDoc(docRef, updatedProfileParts);
        setQuizCalculated(true);
        setThisPublicProfile(prev => prev ? { ...prev, ...updatedProfileParts } : null);
        setSaveSuccessMessage('Psychological assessment calculated successfully and synchronized!');
        setTimeout(() => setSaveSuccessMessage(null), 4000);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `public_profiles/${currentUser.uid}`);
      }
    }
  };

  // Listen to received friend requests
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('receiverId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched: any[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      setFriendRequests(fetched);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'friend_requests');
    });

    return () => unsub();
  }, [currentUser]);

  // Listen to sent friend requests
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'friend_requests'),
      where('senderId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched: any[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      setSentRequests(fetched);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'friend_requests_sent');
    });

    return () => unsub();
  }, [currentUser]);

  // Handle Save Biography
  const handleSavePublicProfile = async () => {
    if (!currentUser) return;
    try {
      const profileData: PublicProfile = {
        uid: currentUser.uid,
        name: setupName || userProfile?.name || 'Anonymous Seeker',
        avatarUrl: userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        biography: setupBiography,
        isDatingModeEnabled: userProfile?.isDatingModeEnabled || false,
        datingPreferences: userProfile?.datingPreferences || { genderInterest: 'female', minAge: 18, maxAge: 40 },
        gender: userProfile?.gender || 'male',
        age: userProfile?.age || 28,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'public_profiles', currentUser.uid), profileData);
      setIsSettingUpProfile(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `public_profiles/${currentUser.uid}`);
    }
  };

  // 2. Fetch standard feed (only status === 'approved' posts, sorted by createdAt desc)
  useEffect(() => {
    if (!currentUser) return;

    const postsRef = collection(db, 'social_posts');
    const q = query(
      postsRef, 
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched: CommunityPost[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as CommunityPost);
      });
      setPosts(fetched);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'social_posts');
    });

    return () => unsub();
  }, [currentUser]);

  // 3. Fetch Admin Queue if current is admin or Petar
  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    const postsRef = collection(db, 'social_posts');
    const q = query(
      postsRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched: CommunityPost[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as CommunityPost);
      });
      setPendingPosts(fetched);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'social_posts/pending');
    });

    return () => unsub();
  }, [currentUser, isAdmin]);

  // 4. Fetch Public peers directory
  useEffect(() => {
    if (!currentUser) {
      setPeers(DUMMY_SCHOLARS);
      return;
    }

    const profilesRef = collection(db, 'public_profiles');
    const unsub = onSnapshot(profilesRef, (snap) => {
      const fetched: PublicProfile[] = [];
      snap.forEach((docSnap) => {
        const u = docSnap.data() as PublicProfile;
        if (u.uid !== currentUser.uid) {
          fetched.push(u);
        }
      });
      
      // Ensure dummy scholars are always present if they don't already exist in the database stream
      DUMMY_SCHOLARS.forEach(dummy => {
        if (!fetched.some(p => p.uid === dummy.uid) && dummy.uid !== currentUser.uid) {
          fetched.push(dummy);
        }
      });

      setPeers(fetched);
    }, (err) => {
      console.warn("Firestore public_profiles list error, falling back to dummy accounts:", err);
      // Keep dummy scholars on list error so they are always interactive!
      setPeers(DUMMY_SCHOLARS.filter(d => d.uid !== currentUser.uid));
    });

    return () => unsub();
  }, [currentUser]);

  // 5. Fetch Ongoing Conversations list
  useEffect(() => {
    if (!currentUser) return;

    const convoRef = collection(db, 'conversations');
    const q = query(
      convoRef,
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const fetched: Conversation[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as Conversation);
      });
      // Sort conversations based on lastMessageAt locally
      fetched.sort((a, b) => {
        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const borderB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return borderB - dateA;
      });
      setConversations(fetched);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'conversations');
    });

    return () => unsub();
  }, [currentUser]);

  // 6. Fetch Chat Messages inside an active DM channel
  useEffect(() => {
    if (!currentUser || !activeChat) return;

    const messagesRef = collection(db, 'conversations', activeChat.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsub = onSnapshot(q, (snap) => {
      const fetched: DMMessage[] = [];
      snap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as DMMessage);
      });
      setChatMessages(fetched);
      
      // Auto-scroll to bottom of conversation
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `conversations/${activeChat.id}/messages`);
    });

    return () => unsub();
  }, [currentUser, activeChat]);

  // 6b. Auto-responder when sending message to any dummy scholar
  useEffect(() => {
    if (!currentUser || !activeChat || chatMessages.length === 0) return;
    
    // Find if active participant is a dummy scholar
    const dummyId = activeChat.participants.find(p => p.startsWith('dummy_'));
    if (!dummyId) return;

    const lastMsg = chatMessages[chatMessages.length - 1];
    
    // Check if the last message is from the user
    if (lastMsg.senderId === currentUser.uid) {
      // Trigger reply simulation
      const replyTimer = setTimeout(async () => {
        // Prevent typing twice and check states
        if (dummyTypingState) return;
        
        // Find scholar name
        const otherIndex = activeChat.participants[0] === currentUser.uid ? 1 : 0;
        const scholarName = activeChat.participantNames[otherIndex] || 'Stoic Mentor';
        
        setDummyTypingState(scholarName);

        // Instantly force scroll to typing state
        setTimeout(() => {
          chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);

        try {
          // Format messages for Gemini api format
          // [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
          const formattedHistory = chatMessages.slice(-8).map(m => ({
            role: m.senderId === currentUser.uid ? 'user' : 'model',
            parts: [{ text: m.text }]
          }));

          const response = await fetch('/api/ai/scholar-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scholarId: dummyId,
              messages: formattedHistory
            })
          });

          if (!response.ok) {
            throw new Error('Scholar is in deep meditation. Try later.');
          }

          const resJson = await response.json();
          const replyText = resJson.text || "I am currently focused in silence. Focus on what lies in your power.";

          // Now save this auto response in Firestore messages list under the dummy scholar's name
          const msgRef = doc(collection(db, 'conversations', activeChat.id, 'messages'));
          const msgPayload: DMMessage = {
            id: msgRef.id,
            conversationId: activeChat.id,
            senderId: dummyId,
            senderName: scholarName,
            text: replyText,
            createdAt: new Date().toISOString()
          };

          await setDoc(msgRef, msgPayload);

          // Update head conversation document
          const convoRef = doc(db, 'conversations', activeChat.id);
          await updateDoc(convoRef, {
            lastMessage: replyText,
            lastMessageAt: new Date().toISOString()
          });

        } catch (err) {
          console.error("Scholar response generation failed:", err);
        } finally {
          setDummyTypingState(null);
          // Wait brief delay then scroll to reply message
          setTimeout(() => {
            chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }

      }, 1500); // 1.5s human-like response delay

      return () => clearTimeout(replyTimer);
    }
  }, [chatMessages, activeChat, currentUser]);

  // Peer Wall overlay sync
  useEffect(() => {
    if (!selectedPeerWall) return;

    const postsRef = collection(db, 'social_posts');
    const q = query(
      postsRef,
      where('userId', '==', selectedPeerWall.uid),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const snapUnsub = onSnapshot(q, (snap) => {
      const f: CommunityPost[] = [];
      snap.forEach((d) => {
        f.push({ id: d.id, ...d.data() } as CommunityPost);
      });
      setPeerWallPosts(f);
    });

    return () => snapUnsub();
  }, [selectedPeerWall]);

  // Action: Create a social post (Defaults to pending unless admin)
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newPostContent.trim()) return;

    setIsPosting(true);
    setPostError(null);

    try {
      const postDocRef = doc(collection(db, 'social_posts'));
      
      const draftPost: CommunityPost = {
        id: postDocRef.id,
        userId: currentUser.uid,
        userName: thisPublicProfile?.name || userProfile?.name || 'Seeker',
        userAvatar: thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        content: newPostContent,
        mediaType: newPostMediaType,
        status: isAdmin ? 'approved' : 'pending',
        createdAt: new Date().toISOString(),
        likes: []
      };

      if (newPostMediaType !== 'none' && newPostMediaUrl.trim()) {
        draftPost.mediaUrl = newPostMediaUrl.trim();
      }

      await setDoc(postDocRef, draftPost);
      
      // Reset inputs
      setNewPostContent('');
      setNewPostMediaType('none');
      setNewPostMediaUrl('');
      
      // Notify user check
      if (!isAdmin) {
        setPostError("Draft transmitted! Your reflection has been sent to Petar's queue for moderation.");
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'social_posts');
      const errorMsg = err?.message || (err?.code ? `Firebase Code: ${err.code}` : JSON.stringify(err));
      setPostError(`Failed to transmit post: ${errorMsg}. Please ensure inputs satisfy schema rules.`);
    } finally {
      setIsPosting(false);
    }
  };

  // Action: Toggle Like on Post
  const handleToggleLike = async (post: CommunityPost) => {
    if (!currentUser) return;
    try {
      const hasLiked = post.likes?.includes(currentUser.uid);
      const postRef = doc(db, 'social_posts', post.id);

      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `social_posts/${post.id}/likes`);
    }
  };

  // Action: Start Editing Post
  const handleEditPostStart = (post: CommunityPost) => {
    setEditingPostId(post.id);
    setEditingPostContent(post.content);
  };

  // Action: Save Edited Post to Firestore
  const handleSaveEditedPost = async (postId: string) => {
    if (!editingPostContent.trim()) return;
    setIsSavingEdit(true);
    try {
      const postRef = doc(db, 'social_posts', postId);
      await updateDoc(postRef, {
        content: editingPostContent,
        updatedAt: new Date().toISOString()
      });
      setEditingPostId(null);
      setEditingPostContent('');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `social_posts/${postId}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Action: Delete Post from Firestore
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this scholarly reflection?")) return;
    try {
      const postRef = doc(db, 'social_posts', postId);
      await deleteDoc(postRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `social_posts/${postId}`);
    }
  };

  // Action: Friend Request Operations
  const handleSendFriendRequest = async (peer: PublicProfile) => {
    if (!currentUser) return;
    const sortedIds = [currentUser.uid, peer.uid].sort();
    const requestId = `${sortedIds[0]}_${sortedIds[1]}`;
    try {
      if (peer.uid.startsWith('dummy_')) {
        // Auto-accept dummy friend requests instantly!
        await setDoc(doc(db, 'friend_requests', requestId), {
          id: requestId,
          senderId: currentUser.uid,
          senderName: thisPublicProfile?.name || userProfile?.name || 'Seeker',
          senderAvatar: thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          receiverId: peer.uid,
          status: 'accepted',
          createdAt: new Date().toISOString()
        });

        // Also update my own friends list safely with merged keys to satisfy security rules
        const myProfileRef = doc(db, 'public_profiles', currentUser.uid);
        await setDoc(myProfileRef, {
          uid: currentUser.uid,
          name: thisPublicProfile?.name || userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Seeker',
          friends: arrayUnion(peer.uid)
        }, { merge: true });
      } else {
        await setDoc(doc(db, 'friend_requests', requestId), {
          id: requestId,
          senderId: currentUser.uid,
          senderName: thisPublicProfile?.name || userProfile?.name || 'Seeker',
          senderAvatar: thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          receiverId: peer.uid,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `friend_requests/${requestId}`);
    }
  };

  const handleAcceptFriendRequest = async (req: any) => {
    try {
      // Update request status to accepted
      await updateDoc(doc(db, 'friend_requests', req.id), {
        status: 'accepted'
      });

      // Update my own profile friends list safely with merged keys to satisfy rules
      const myProfileRef = doc(db, 'public_profiles', currentUser.uid);
      await setDoc(myProfileRef, {
        uid: currentUser.uid,
        name: thisPublicProfile?.name || userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Seeker',
        friends: arrayUnion(req.senderId)
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `friend_requests/${req.id}`);
    }
  };

  const handleDeclineFriendRequest = async (req: any) => {
    try {
      // Direct delete on decline/cancel to allow fresh requests in future
      await deleteDoc(doc(db, 'friend_requests', req.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `friend_requests/${req.id}`);
    }
  };

  const handleRemoveFriend = async (peerId: string) => {
    if (!currentUser) return;
    // Compute deterministic request ID
    const sortedIds = [currentUser.uid, peerId].sort();
    const requestId = `${sortedIds[0]}_${sortedIds[1]}`;
    try {
      // Delete request document
      await deleteDoc(doc(db, 'friend_requests', requestId));

      // Sever relation from my own profile list safely with merged keys to satisfy rules
      const myProfileRef = doc(db, 'public_profiles', currentUser.uid);
      await setDoc(myProfileRef, {
        uid: currentUser.uid,
        name: thisPublicProfile?.name || userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Seeker',
        friends: arrayRemove(peerId)
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `friend_requests/${requestId}`);
    }
  };

  // Action: Direct Message initiate with a Peer
  const handleStartDM = async (peerProfile: PublicProfile) => {
    if (!currentUser) return;
    
    // Sort UIDs to compute deterministic ID for the direct exchange node
    const sortedIds = [currentUser.uid, peerProfile.uid].sort();
    const convoId = `${sortedIds[0]}_${sortedIds[1]}`;

    try {
      const convoRef = doc(db, 'conversations', convoId);
      const convoDoc = await getDoc(convoRef);

      const computedConvo: Conversation = {
        id: convoId,
        participants: sortedIds,
        participantNames: [
          currentUser.uid === sortedIds[0] ? (thisPublicProfile?.name || userProfile?.name || 'Anonymous Seeker') : peerProfile.name,
          currentUser.uid === sortedIds[1] ? (thisPublicProfile?.name || userProfile?.name || 'Anonymous Seeker') : peerProfile.name
        ],
        participantAvatars: [
          currentUser.uid === sortedIds[0] ? (thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200') : (peerProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'),
          currentUser.uid === sortedIds[1] ? (thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200') : (peerProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200')
        ]
      };

      if (!convoDoc.exists()) {
        await setDoc(convoRef, computedConvo);
      }

      setActiveChat(computedConvo);
      setActiveTab('messages');
      setSelectedPeerWall(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `conversations/${convoId}`);
    }
  };

  // Action: Submit instant dialogue transmission in dialogue box
  const handleSendInstantEngageMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !engagePeer || !engageMessage.trim()) return;

    setIsSendingEngage(true);
    setEngageError(null);

    const sortedIds = [currentUser.uid, engagePeer.uid].sort();
    const convoId = `${sortedIds[0]}_${sortedIds[1]}`;

    try {
      const convoRef = doc(db, 'conversations', convoId);
      const convoDoc = await getDoc(convoRef);

      const computedConvo: Conversation = {
        id: convoId,
        participants: sortedIds,
        participantNames: [
          currentUser.uid === sortedIds[0] ? (thisPublicProfile?.name || userProfile?.name || 'Anonymous Seeker') : engagePeer.name,
          currentUser.uid === sortedIds[1] ? (thisPublicProfile?.name || userProfile?.name || 'Anonymous Seeker') : engagePeer.name
        ],
        participantAvatars: [
          currentUser.uid === sortedIds[0] ? (thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200') : (engagePeer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'),
          currentUser.uid === sortedIds[1] ? (thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200') : (engagePeer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200')
        ]
      };

      if (!convoDoc.exists()) {
        await setDoc(convoRef, {
          ...computedConvo,
          lastMessage: engageMessage,
          lastMessageAt: new Date().toISOString()
        });
      }

      // Add message under collection
      const msgRef = doc(collection(db, 'conversations', convoId, 'messages'));
      const msgPayload: DMMessage = {
        id: msgRef.id,
        conversationId: convoId,
        senderId: currentUser.uid,
        senderName: thisPublicProfile?.name || userProfile?.name || 'Seeker',
        text: engageMessage,
        createdAt: new Date().toISOString()
      };

      await setDoc(msgRef, msgPayload);

      // Only update head if it already existed (prevent dual uncommitted write trigger in security rules)
      if (convoDoc.exists()) {
        await updateDoc(convoRef, {
          lastMessage: engageMessage,
          lastMessageAt: new Date().toISOString()
        });
      }

      setEngageSuccess(true);
      
      // Navigate and close after a brief triumph delay
      setTimeout(() => {
        setActiveChat(computedConvo);
        setActiveTab('messages');
        setSelectedPeerWall(null);
        setEngagePeer(null);
        setEngageMessage('');
        setIsSendingEngage(false);
        setEngageSuccess(false);
      }, 1500);

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `conversations/${convoId}/messages`);
      setEngageError(`The scholarly channels are congested. Unable to transmit payload: ${err instanceof Error ? err.message : String(err)}`);
      setIsSendingEngage(false);
    }
  };

  // Action: Send direct message inside active DM channel
  const handleSendDMMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeChat || !newMessageText.trim()) return;

    try {
      const convoRef = doc(db, 'conversations', activeChat.id);
      const msgRef = doc(collection(db, 'conversations', activeChat.id, 'messages'));

      const msgPayload: DMMessage = {
        id: msgRef.id,
        conversationId: activeChat.id,
        senderId: currentUser.uid,
        senderName: thisPublicProfile?.name || userProfile?.name || 'Seeker',
        text: newMessageText,
        createdAt: new Date().toISOString()
      };

      // 1. Submit message payload
      await setDoc(msgRef, msgPayload);

      // 2. Update head node for active list sorting
      await updateDoc(convoRef, {
        lastMessage: newMessageText,
        lastMessageAt: new Date().toISOString()
      });

      setNewMessageText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `conversations/${activeChat.id}/messages`);
    }
  };

  // Action: Edit an existing message in DM channel
  const handleSaveEditMessage = async (messageId: string) => {
    if (!currentUser || !activeChat || !editingText.trim()) return;
    try {
      const msgRef = doc(db, 'conversations', activeChat.id, 'messages', messageId);
      await updateDoc(msgRef, {
        text: editingText,
        updatedAt: new Date().toISOString()
      });
      setEditingMessageId(null);
      setEditingText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `conversations/${activeChat.id}/messages/${messageId}`);
    }
  };

  // Action: Delete an existing message in DM channel
  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUser || !activeChat) return;
    try {
      const msgRef = doc(db, 'conversations', activeChat.id, 'messages', messageId);
      await deleteDoc(msgRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `conversations/${activeChat.id}/messages/${messageId}`);
    }
  };

  // Action: Admin Moderate approval
  const handleModeratePost = async (postId: string, action: 'approve' | 'reject') => {
    try {
      const postRef = doc(db, 'social_posts', postId);
      await updateDoc(postRef, {
        status: action === 'approve' ? 'approved' : 'rejected'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `social_posts/${postId}`);
    }
  };

  // Safe YouTube embedding processor
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      // Handles watch?v=ID, youtu.be/ID, embed/ID, Shorts URLs
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    } catch (e) {
      return '';
    }
  };

  // Safe TikTok check
  const isTikTokUrl = (url: string) => {
    return url.includes('tiktok.com');
  };

  // Connection evaluation filters
  const incomingPending = friendRequests.filter(r => r.status === 'pending');

  const acceptedFriendIds = React.useMemo(() => {
    const ids = new Set<string>();
    friendRequests.forEach(r => {
      if (r.status === 'accepted') ids.add(r.senderId);
    });
    sentRequests.forEach(r => {
      if (r.status === 'accepted') ids.add(r.receiverId);
    });
    return ids;
  }, [friendRequests, sentRequests]);

  const isPeerOnline = (p: PublicProfile) => {
    if (!p.isOnline) return false;
    if (!p.lastActive) return false;
    const lastActiveTime = new Date(p.lastActive).getTime();
    const now = Date.now();
    // Support diverse system clocks with a robust 15-minute window and Math.abs
    return Math.abs(now - lastActiveTime) < 15 * 60 * 1000;
  };

  const computeScholarMatchingScore = (me: PublicProfile | null, rawPeer: PublicProfile): number | null => {
    if (!me || !me.bigFive || !rawPeer.bigFive) return null;
    let diff = 0;
    const meB = me.bigFive;
    const peerB = rawPeer.bigFive;
    
    diff += Math.abs((meB.openness || 50) - (peerB.openness || 50));
    diff += Math.abs((meB.conscientiousness || 50) - (peerB.conscientiousness || 50));
    diff += Math.abs((meB.extraversion || 50) - (peerB.extraversion || 50));
    diff += Math.abs((meB.agreeableness || 50) - (peerB.agreeableness || 50));
    diff += Math.abs((meB.neuroticism || 50) - (peerB.neuroticism || 50));
    
    // Maximum possible difference is 500
    const baseMatch = 100 - (diff / 10);
    let match = Math.max(60, Math.min(99, Math.round(baseMatch + 25)));

    if (me.intellectualInterests && rawPeer.intellectualInterests) {
      // Shared interests multiplier
      const shared = me.intellectualInterests.filter(i => rawPeer.intellectualInterests?.includes(i));
      match += shared.length * 3;
    }
    
    if (me.relationshipIntent && rawPeer.relationshipIntent && me.relationshipIntent === rawPeer.relationshipIntent) {
      match += 8;
    }
    
    return Math.min(99, match);
  };

  const getDetailedCompatibility = (me: PublicProfile | null, rawPeer: PublicProfile) => {
    const reasons: string[] = [];
    if (!me || !me.bigFive || !rawPeer.bigFive) {
      return {
        score: null,
        reasons: ["Complete your personality quiz under the 'Personality' tab to unlock matching analysis."],
        isError: true
      };
    }

    let diff = 0;
    const meB = me.bigFive;
    const peerB = rawPeer.bigFive;
    
    diff += Math.abs((meB.openness || 50) - (peerB.openness || 50));
    diff += Math.abs((meB.conscientiousness || 50) - (peerB.conscientiousness || 50));
    diff += Math.abs((meB.extraversion || 50) - (peerB.extraversion || 50));
    diff += Math.abs((meB.agreeableness || 50) - (peerB.agreeableness || 50));
    diff += Math.abs((meB.neuroticism || 50) - (peerB.neuroticism || 50));
    
    const baseMatch = 100 - (diff / 10);
    let match = Math.max(60, Math.min(99, Math.round(baseMatch + 20)));

    if (diff < 100) {
      reasons.push("Highly aligned psychological traits (direct Big Five spectrum alignment).");
    } else if (diff < 200) {
      reasons.push("Constructive personality traits (balanced extraversion & conscientiousness).");
    } else {
      reasons.push("Complementary cognitive styles (different but highly supportive spectrums).");
    }

    // Age preferences alignment
    const targetAge = rawPeer.age || 25;
    const myAge = me.age || 28;
    const inMyMinAge = !me.datingPreferences?.minAge || targetAge >= me.datingPreferences.minAge;
    const inMyMaxAge = !me.datingPreferences?.maxAge || targetAge <= me.datingPreferences.maxAge;
    const inPeerMinAge = !rawPeer.datingPreferences?.minAge || myAge >= rawPeer.datingPreferences.minAge;
    const inPeerMaxAge = !rawPeer.datingPreferences?.maxAge || myAge <= rawPeer.datingPreferences.maxAge;

    if (inMyMinAge && inMyMaxAge && inPeerMinAge && inPeerMaxAge) {
      match += 6;
      reasons.push(`Optimal maturity matching (ages ${myAge} & ${targetAge} fit within exact preference limits).`);
    } else {
      reasons.push("Generational differences (outside of standard age preference filters).");
    }

    // Gender preferences check
    const meInt = me.datingPreferences?.genderInterest || 'all';
    const peerGender = rawPeer.gender || 'female';
    const peerInt = rawPeer.datingPreferences?.genderInterest || 'all';
    const meGender = me.gender || 'male';

    let genderMatch = true;
    if (meInt !== 'all' && meInt !== 'both') {
      if (meInt !== peerGender) genderMatch = false;
    }
    if (peerInt !== 'all' && peerInt !== 'both') {
      if (peerInt !== meGender) genderMatch = false;
    }

    if (genderMatch) {
      match += 6;
      reasons.push("Perfect romantic orientation harmony.");
    } else {
      match -= 12;
      reasons.push("Partial gender orientation skew (friendly platonic synergy suggested).");
    }

    // Shared intellectual interests
    if (me.intellectualInterests && rawPeer.intellectualInterests) {
      const shared = me.intellectualInterests.filter(i => rawPeer.intellectualInterests?.includes(i));
      if (shared.length > 0) {
        match += shared.length * 3;
        reasons.push(`Shared interest in ${shared.slice(0, 3).join(", ")}.`);
        if (shared.some(s => s.toLowerCase().includes('stoic') || s.toLowerCase().includes('philosoph'))) {
          reasons.push("Shared interest in Stoicism & intellectual inquiries.");
        }
      }
    }

    // Similar activity levels / somatic focus matching
    const physicalKeywords = ['calisthenics', 'training', 'movement', 'body', 'yoga', 'run', 'gym', 'exercise', 'physical'];
    const meHasPhysical = me.biography?.toLowerCase().split(/\s+/).some(w => physicalKeywords.includes(w)) || 
                          me.intellectualInterests?.some(i => physicalKeywords.some(pk => i.toLowerCase().includes(pk)));
    const peerHasPhysical = rawPeer.biography?.toLowerCase().split(/\s+/).some(w => physicalKeywords.includes(w)) || 
                            rawPeer.intellectualInterests?.some(i => physicalKeywords.some(pk => i.toLowerCase().includes(pk))) ||
                            rawPeer.uid === 'dummy_marcus_aurelius';
    
    if (meHasPhysical && peerHasPhysical) {
      match += 5;
      reasons.push("Similar activity levels and disciplined physical regimes.");
    }
    
    if (me.relationshipIntent && rawPeer.relationshipIntent) {
      if (me.relationshipIntent === rawPeer.relationshipIntent) {
        match += 8;
        reasons.push(`Synchronized relationship objective: "${me.relationshipIntent}".`);
      } else {
        reasons.push("Supportive relationship intents.");
      }
    }

    const finalScore = Math.max(40, Math.min(99, match));
    
    return {
      score: finalScore,
      reasons: reasons.slice(0, 5),
      isError: false
    };
  };

  const getFriendRelation = (peerUid: string) => {
    if (acceptedFriendIds.has(peerUid)) {
      return 'friend';
    }
    const outgoing = sentRequests.find(r => r.receiverId === peerUid);
    if (outgoing) {
      return outgoing.status; // 'pending' | 'rejected'
    }
    const incoming = friendRequests.find(r => r.senderId === peerUid);
    if (incoming) {
      return incoming.status === 'pending' ? 'incoming' : incoming.status;
    }
    return 'none';
  };

  const [peerFilter, setPeerFilter] = useState<'all' | 'friends' | 'dating'>('all');

  // Filtered peers list
  const filteredPeers = peers.filter(peer => {
    const matchesSearch = peer.name.toLowerCase().includes(peerSearchQuery.toLowerCase()) ||
      (peer.biography?.toLowerCase() || '').includes(peerSearchQuery.toLowerCase());

    if (peerFilter === 'friends') {
      return matchesSearch && acceptedFriendIds.has(peer.uid);
    }
    if (peerFilter === 'dating') {
      return matchesSearch && peer.isDatingModeEnabled === true;
    }
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      
      {/* 1. Profile Setup Modal/Prompt */}
      <AnimatePresence>
        {isSettingUpProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={cn(
                "w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all duration-300",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
              )}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base uppercase tracking-tight">Record Seeker Bio</h3>
                    <p className={cn("text-[11px]", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>Introduce yourself to the intellectual swarm</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Display Name</label>
                    <input 
                      type="text" 
                      value={setupName}
                      onChange={(e) => setSetupName(e.target.value)}
                      className={cn(
                        "w-full px-4 py-3 text-xs rounded-xl border font-medium focus:ring-1 focus:ring-emerald-500 outline-none",
                        isDarkMode ? "bg-zinc-800/50 border-zinc-700/50 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                      placeholder="Your academic title or pseudonym"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Biography</label>
                    <textarea 
                      value={setupBiography}
                      onChange={(e) => setSetupBiography(e.target.value)}
                      rows={4}
                      className={cn(
                        "w-full px-4 py-3 text-xs rounded-xl border font-medium focus:ring-1 focus:ring-emerald-500 outline-none resize-none",
                        isDarkMode ? "bg-zinc-800/50 border-zinc-700/50 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                      )}
                      placeholder="What field of inquiry or athletic pursuit guides your existence? Under what terms do you run?"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    onClick={handleSavePublicProfile}
                    className="flex-1 py-3 bg-emerald-500 text-zinc-950 rounded-2xl font-black italic uppercase tracking-tighter text-xs active:scale-95 transition-transform shadow-lg shadow-emerald-500/20"
                  >
                    Establish Presence
                  </button>
                  {thisPublicProfile && (
                    <button 
                      onClick={() => setIsSettingUpProfile(false)}
                      className={cn(
                        "px-4 py-3 border rounded-2xl font-bold text-xs uppercase tracking-wider",
                        isDarkMode ? "border-zinc-800 text-zinc-400 hover:text-white" : "border-zinc-200 text-zinc-500 hover:text-zinc-800"
                      )}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Instant Engage Dialogue Box Modal */}
        {engagePeer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={cn(
                "w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all duration-300 relative",
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              <button 
                type="button"
                onClick={() => setEngagePeer(null)}
                className="absolute top-4 right-4 p-2 rounded-full transition-all bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-950/30 active:scale-95 flex items-center justify-center cursor-pointer border border-rose-450 z-30"
                title="Close Secure Dialog"
              >
                <X className="w-4 h-4 stroke-[3px]" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <img 
                      src={engagePeer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-500/10"
                      alt="avatar"
                      referrerPolicy="no-referrer"
                    />
                    {isPeerOnline(engagePeer) ? (
                      <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-zinc-900"></span>
                      </span>
                    ) : (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-zinc-655 border border-zinc-900" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 leading-none">
                      <h3 className="font-black text-sm uppercase tracking-wider">{engagePeer.name}</h3>
                      <span className={cn(
                        "text-[7px] font-mono font-black tracking-widest px-1 py-0.5 rounded border",
                        isPeerOnline(engagePeer) 
                          ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/15" 
                          : "text-zinc-500 bg-zinc-400/5 border-zinc-400/10"
                      )}>
                        {isPeerOnline(engagePeer) ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>
                    <p className="text-[10px] mt-1 font-bold uppercase tracking-widest text-emerald-500">Initiating Scholarly Dialogue</p>
                  </div>
                </div>

                {engageSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-8 flex flex-col items-center justify-center text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                      <Check className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-500">Dialogue Channel Established</p>
                      <p className={cn("text-[10px] mt-1 max-w-[280px]", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                        Your message has been safely queued and transmitted. Navigating to personal conversations...
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSendInstantEngageMessage} className="space-y-4 pt-2">
                    <p className={cn("text-[11px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-550")}>
                      {!isPeerOnline(engagePeer) ? (
                        <span>
                          <strong>{engagePeer.name}</strong> is currently living silently in contemplation. You can transcribe an offline dialogue transmission which they will receive immediately upon re-entering.
                        </span>
                      ) : (
                        <span>
                          Transcribe immediate thoughts, structured inquiries, or rigorous critiques directly into <strong>{engagePeer.name}</strong>'s private network node.
                        </span>
                      )}
                    </p>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Dialogue Transmission</label>
                      <textarea 
                        value={engageMessage}
                        onChange={(e) => setEngageMessage(e.target.value)}
                        rows={4}
                        required
                        disabled={isSendingEngage || isUploadingFile}
                        className={cn(
                          "w-full px-4 py-3 text-[18px] rounded-xl border focus:ring-1 focus:ring-emerald-500 outline-none resize-none font-handwritten tracking-wide font-semibold",
                          isDarkMode ? "bg-zinc-800/80 border-zinc-700/80 text-white placeholder-zinc-550" : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400"
                        )}
                        placeholder="Establish clarity, speak with discipline, and build intellectual/biometric alignment..."
                      />
                    </div>

                    {/* Emojis selection & file uploads row bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                      <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
                        {['❤️', '💔', '💖', '💝', '💕', '🫶', '🔥', '⚡', '✨', '🚀', '🎭', '🌌', '🧘', '🧠', '💪', '🏛️', '⚓', '📜', '🛡️', '⏳'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setEngageMessage(prev => prev + emoji)}
                            className={cn(
                              "w-7 h-7 flex items-center justify-center text-sm rounded-lg border transition-all active:scale-95 shrink-0",
                              isDarkMode 
                                ? "bg-zinc-850 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300" 
                                : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700"
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                         <label className={cn(
                          "w-7 h-7 flex items-center justify-center rounded-lg border cursor-pointer transition-all hover:bg-emerald-500/10 active:scale-95 shrink-0",
                          isUploadingFile ? "animate-pulse" : "",
                          isDarkMode 
                            ? "bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-emerald-400" 
                            : "bg-zinc-50 border-zinc-200 text-zinc-505 hover:text-emerald-600"
                        )}>
                          <Paperclip className="w-3.5 h-3.5" />
                          <input 
                            type="file" 
                            className="hidden" 
                            disabled={isUploadingFile || isSendingEngage} 
                            onChange={(e) => handleFileUpload(e, true)} 
                            accept="image/*,video/mp4,application/pdf"
                          />
                        </label>
                        {isUploadingFile && (
                          <span className="text-[9px] font-mono text-emerald-500 animate-pulse">Uploading...</span>
                        )}
                      </div>
                    </div>

                    {engageError && (
                      <p className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/25 px-3 py-2 rounded-xl">
                        {engageError}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button 
                        type="submit"
                        disabled={isSendingEngage || !engageMessage.trim() || isUploadingFile}
                        className={cn(
                          "flex-1 py-3 bg-emerald-500 text-zinc-950 rounded-2xl font-black italic uppercase tracking-tighter text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20",
                          (isSendingEngage || !engageMessage.trim() || isUploadingFile) && "opacity-55 pointer-events-none"
                        )}
                      >
                        {isSendingEngage ? "Transmitting..." : "Transmit Dialogue"} <Send className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEngagePeer(null)}
                        className={cn(
                          "px-4 py-3 border rounded-2xl font-bold text-xs uppercase tracking-wider",
                          isDarkMode ? "border-zinc-800 text-zinc-400 hover:text-white" : "border-zinc-200 text-zinc-500 hover:text-zinc-800"
                        )}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Banner Header card */}
      <div className={cn(
        "p-6 rounded-3xl border relative overflow-hidden transition-all duration-500",
        isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
      )}>
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] select-none pointer-events-none">
          <Globe className="w-56 h-56 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                P2P SCHOLAR SWARM
              </span>
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">The Commons Sanctuary</h2>
            <p className={cn("text-xs leading-relaxed max-w-xl", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
              Step into the collective intelligence loop. Share biometric breakthroughs, log physical records, evaluate research-backed articles, or establish quiet communication with other disciples.
            </p>
          </div>
          <button 
            onClick={() => {
              setSetupBiography(thisPublicProfile?.biography || '');
              setSetupName(thisPublicProfile?.name || userProfile?.name || '');
              setIsSettingUpProfile(true);
            }}
            className={cn(
              "self-start md:self-center px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
              isDarkMode 
                ? "border-zinc-800 hover:border-zinc-700 bg-zinc-850 text-zinc-400 hover:text-white" 
                : "border-zinc-200 hover:border-zinc-300 bg-zinc-50 text-zinc-500 hover:text-zinc-800"
            )}
          >
            My Biography Card
          </button>
        </div>
      </div>

      {/* 3. Segment Tab Switcher with Horizon Cues */}
      <div className="relative w-full overflow-hidden">
        {/* Left Fading edge overlay with dynamic state */}
        <AnimatePresence>
          {showLeftFade && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r pointer-events-none z-20 flex items-center justify-start pl-1",
                isDarkMode ? "from-zinc-950 to-transparent" : "from-white to-transparent"
              )}
            >
              <div className="p-1 rounded-full bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm shadow text-zinc-400">
                <ChevronLeft className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Fading edge overlay with dynamic state */}
        <AnimatePresence>
          {showRightFade && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l pointer-events-none z-20 flex items-center justify-end pr-1",
                isDarkMode ? "from-zinc-950 to-transparent" : "from-white to-transparent"
              )}
            >
              <div className="flex items-center gap-1 animate-pulse bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-lg text-[8px] font-black tracking-widest text-emerald-400 uppercase shadow-lg shadow-black/40 backdrop-blur-sm">
                <span>More</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Container with ref */}
        <div 
          ref={tabContainerRef}
          onScroll={handleTabScroll}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5 border-b border-zinc-800/10 scroll-smooth pr-14"
        >
          {[
            { id: 'feed', label: 'Scholarly Feed', mobileLabel: 'Feed', icon: <Globe className="w-3.5 h-3.5" /> },
            { id: 'messages', label: 'Direct Dialogs', mobileLabel: 'Dialogs', icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: 'peers', label: 'Seekers Swarm', mobileLabel: 'Swarm', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'personality', label: 'Personality', mobileLabel: 'Personality', icon: <Heart className="w-3.5 h-3.5" /> },
            { id: 'moderation', label: `Moderation (${pendingPosts.length})`, mobileLabel: `Mod (${pendingPosts.length})`, icon: <ShieldCheck className="w-3.5 h-3.5" />, adminOnly: true }
          ].map(tab => {
            if (tab.adminOnly && !isAdmin) return null;
            const active = activeTab === tab.id;
            const isMessagesTab = tab.id === 'messages';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shrink-0 active:scale-95 select-none relative",
                  active 
                    ? "bg-emerald-500 text-zinc-950 font-black italic scale-[0.98] shadow-md shadow-emerald-500/15" 
                    : isMessagesTab
                      ? "bg-zinc-800 border border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 animate-pulse duration-[2000ms] shadow-[0_0_8px_rgba(16,185,129,0.15)] font-black"
                      : isDarkMode
                        ? "text-zinc-500 hover:text-zinc-350 hover:bg-zinc-800/30"
                        : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="inline sm:hidden">{tab.mobileLabel}</span>
                
                {/* Visual red/emerald indicator dot on Direct Dialogs */}
                {isMessagesTab && !active && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2 z-30">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tab Context Views */}
      <div className="space-y-6">
        
        {/* TAB A: SCHOLARLY FEED */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Main feed feed - Column 2 span */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Draft Creator Form */}
              <form onSubmit={handlePostSubmit} className={cn(
                "p-6 rounded-3xl border transition-all duration-300 space-y-4 shadow-md",
                isDarkMode ? "bg-zinc-900 border-zinc-700/80 shadow-black/25" : "bg-zinc-50/50 border-zinc-300 shadow-zinc-100"
              )}>
                <div className="flex items-start gap-3">
                  <img 
                    src={thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-500/10"
                    alt="avatar"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Discharge some research, clinical workouts, or hard-boiled philosophy..."
                      rows={5}
                      maxLength={60000}
                      className={cn(
                        "w-full text-xs font-bold outline-none border-0 bg-transparent resize-none focus:ring-0 leading-relaxed",
                        isDarkMode ? "text-zinc-100 placeholder-zinc-450" : "text-zinc-900 placeholder-zinc-500"
                      )}
                    />
                    <div className="flex justify-end pr-2 pt-1">
                      <span className={cn(
                        "text-[9px] font-mono font-bold uppercase tracking-wider",
                        isNewPostOverWordLimit 
                          ? "text-rose-500 animate-pulse" 
                          : newPostWordCount > 6000 
                            ? "text-amber-500" 
                            : "text-zinc-500"
                      )}>
                        {newPostWordCount.toLocaleString()} / 7,000 words
                      </span>
                    </div>
                  </div>
                </div>

                {/* Optional Media attachments choice bar */}
                <div className="pt-2 border-t border-zinc-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Attach asset:</span>
                    <select
                      value={newPostMediaType}
                      onChange={(e) => {
                        setNewPostMediaType(e.target.value as any);
                        setNewPostMediaUrl('');
                      }}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border outline-none font-sans cursor-pointer transition-all",
                        isDarkMode ? "bg-zinc-800 border-zinc-650 text-emerald-400 hover:border-emerald-500" : "bg-white border-zinc-300 text-emerald-700 hover:border-emerald-500 shadow-sm"
                      )}
                    >
                      <option value="none">None</option>
                      <option value="image">Image Link</option>
                      <option value="video">Direct Video Upload</option>
                      <option value="youtube">YouTube Embed</option>
                      <option value="tiktok">TikTok Video</option>
                    </select>

                    {newPostMediaType !== 'none' && newPostMediaType !== 'video' && (
                      <input 
                        type="url"
                        value={newPostMediaUrl}
                        onChange={(e) => setNewPostMediaUrl(e.target.value)}
                        placeholder={
                          newPostMediaType === 'youtube' ? 'YouTube watch/share URL' :
                          newPostMediaType === 'tiktok' ? 'TikTok URL' : 'Image attachment URL'
                        }
                        className={cn(
                          "flex-1 px-3 py-1.5 text-[10px] rounded-lg border outline-none max-w-[150px] sm:max-w-xs font-semibold",
                          isDarkMode ? "bg-zinc-800 border-zinc-650 text-white placeholder-zinc-500" : "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 shadow-sm"
                        )}
                        required
                      />
                    )}

                    {newPostMediaType === 'video' && (
                      <div className="flex items-center gap-2">
                        <label className={cn(
                          "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-dashed cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/40 text-[9px] font-black transition-all uppercase tracking-wider",
                          isDarkMode ? "bg-zinc-800 border-zinc-650 text-emerald-450 hover:text-emerald-400" : "bg-white border-zinc-300 text-emerald-700 hover:text-emerald-600 shadow-sm"
                        )}>
                          {isUploadingPostVideo ? (
                            <span className="animate-pulse text-emerald-500 flex items-center gap-1">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              Uploading {postVideoProgress}%
                            </span>
                          ) : (
                            <>
                              <Upload className="w-2.5 h-2.5 text-emerald-500" />
                              <span>{newPostMediaUrl ? 'Change Video' : 'Upload MP4 from Phone'}</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="video/mp4,video/x-m4v,video/*"
                            className="hidden" 
                            disabled={isUploadingPostVideo}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const MAX_MB = 100;
                              if (file.size > MAX_MB * 1024 * 1024) {
                                alert(`The video exceeds our recommended ${MAX_MB}MB sanctuary limit for rapid mobile browsing.`);
                                return;
                              }

                              setIsUploadingPostVideo(true);
                              setPostVideoProgress(0);

                              try {
                                const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                                const storageRef = ref(storage, `community_videos/${uniqueName}`);
                                const uploadTask = uploadBytesResumable(storageRef, file);

                                uploadTask.on('state_changed', 
                                  (snapshot) => {
                                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                                    setPostVideoProgress(progress);
                                  }, 
                                  (error) => {
                                    console.error('Feed video upload failed:', error);
                                    alert('Upload failed: ' + error.message);
                                    setIsUploadingPostVideo(false);
                                  }, 
                                  async () => {
                                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                                    setNewPostMediaUrl(downloadUrl);
                                    setIsUploadingPostVideo(false);
                                  }
                                );
                              } catch (err: any) {
                                console.error('Feed video upload outer failed:', err);
                                alert('Upload failed: ' + err.message);
                                setIsUploadingPostVideo(false);
                              }
                            }}
                          />
                        </label>
                        {newPostMediaUrl && (
                          <span className="text-[8px] font-mono text-emerald-500 truncate max-w-[120px]">Uploaded!</span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isPosting || !newPostContent.trim() || isNewPostOverWordLimit}
                    className={cn(
                      "px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-black italic uppercase text-[10px] tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 self-end",
                      (isPosting || !newPostContent.trim() || isNewPostOverWordLimit) && "opacity-50 pointer-events-none"
                    )}
                  >
                    {isPosting ? 'Transmitting...' : 'Transmit Reflect'}
                    <Send className="w-3 h-3" />
                  </button>
                </div>

                {/* Notification/Grader Warning message */}
                {postError ? (
                  <div className={cn(
                    "p-3.5 rounded-2xl border flex items-start gap-2.5 text-[10px] leading-relaxed font-bold transition-all",
                    postError.includes('transmitted') 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                      : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  )}>
                    {postError.includes('transmitted') ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <div>
                      <p>{postError}</p>
                      {!isAdmin && postError.includes('transmitted') && (
                        <p className="mt-1 font-normal opacity-90 text-[9px] uppercase tracking-normal">
                          💡 Planned Feature: Upgraded semantic auto-grader will assess draft's philosophical density prior to auto-publishing.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    "p-3 rounded-2xl border text-[10px] leading-relaxed flex items-center gap-2",
                    isDarkMode ? "bg-zinc-850/50 border-zinc-800/80 text-zinc-500" : "bg-zinc-50 border-zinc-150 text-zinc-400"
                  )}>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500/70 animate-pulse" />
                    <span className="font-medium">
                      All seeker reflections undergo rigorous manual peer moderation by Petar to isolate high signals.
                    </span>
                  </div>
                )}
              </form>

              {/* Feed Lists Render */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-xs">
                    No approved community reflections have entered the sanctuary yet. Write the first draft!
                  </div>
                ) : (
                  posts.map(post => {
                    const embedYt = post.mediaType === 'youtube' && post.mediaUrl ? getYouTubeEmbedUrl(post.mediaUrl) : '';
                    const hasLiked = post.likes?.includes(currentUser?.uid);
                    
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-5 rounded-3xl border transition-all duration-300 space-y-4 relative overflow-hidden",
                          isDarkMode ? "bg-zinc-900/40 border-zinc-800/80" : "bg-white border-zinc-200 shadow-sm"
                        )}
                      >
                        {/* Copy overlay */}
                        <AnimatePresence>
                          {copiedPostId === post.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              className="absolute top-4 right-4 bg-emerald-500 text-zinc-950 font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg z-50 flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Reflection Copied</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Header author alignment */}
                        <div className="flex items-center justify-between">
                          <button 
                            type="button"
                            onClick={() => {
                              if (post.userId === currentUser.uid) {
                                setActiveTab('peers'); // Or view biography. Let's load peer bio list
                              } else {
                                const matched = peers.find(p => p.uid === post.userId);
                                if (matched) {
                                  setSelectedPeerWall(matched);
                                } else {
                                  // Fallback mock
                                  setSelectedPeerWall({
                                    uid: post.userId,
                                    name: post.userName,
                                    avatarUrl: post.userAvatar,
                                    biography: 'No expanded biography recorded by seeker.'
                                  });
                                }
                              }
                            }}
                            className="flex items-center gap-2.5 text-left group"
                          >
                            <img 
                              src={post.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover border border-zinc-500/10 group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                                {post.userName}
                              </p>
                              <p className={cn("text-[9px] font-mono", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
                                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </button>

                          {/* Like, share, edit, delete actions */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleLike(post)}
                                className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  hasLiked 
                                    ? "text-red-500 bg-red-500/10" 
                                    : isDarkMode 
                                      ? "text-zinc-500 hover:text-white hover:bg-zinc-800" 
                                      : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                                )}
                              >
                                <Heart className={cn("w-4 h-4", hasLiked && "fill-current animate-ping-once")} />
                              </button>
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                {post.likes?.length || 0}
                              </span>
                            </div>

                            {/* Share Options dropdown */}
                            <div className="relative">
                              <button
                                onClick={() => setActiveSharePostId(activeSharePostId === post.id ? null : post.id)}
                                className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  activeSharePostId === post.id 
                                    ? "text-emerald-500 bg-emerald-500/10" 
                                    : isDarkMode 
                                      ? "text-zinc-500 hover:text-white hover:bg-zinc-800" 
                                      : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                                )}
                                title="Share reflection"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>

                              <AnimatePresence>
                                {activeSharePostId === post.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                    className={cn(
                                      "absolute right-0 mt-1 w-48 rounded-xl border p-2 shadow-xl z-40 space-y-1",
                                      isDarkMode 
                                        ? "bg-zinc-950 border-zinc-800 text-zinc-300" 
                                        : "bg-white border-zinc-200 text-zinc-700 shadow-zinc-200/40"
                                    )}
                                  >
                                    <button
                                      onClick={() => {
                                        const snippet = post.content.length > 180 ? post.content.substring(0, 180) + '...' : post.content;
                                        const text = `"${snippet}"\n\n— Shared from @WiseFit Digital Sanctuary`;
                                        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin)}`;
                                        window.open(url, '_blank', 'noopener,noreferrer');
                                        setActiveSharePostId(null);
                                      }}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                        isDarkMode ? "hover:bg-zinc-900 hover:text-white" : "hover:bg-zinc-100 hover:text-zinc-900"
                                      )}
                                    >
                                      <Twitter className="w-3.5 h-3.5 text-[#1DA1F2]" />
                                      <span>Share to X (Twitter)</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`;
                                        window.open(url, '_blank', 'noopener,noreferrer');
                                        setActiveSharePostId(null);
                                      }}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                        isDarkMode ? "hover:bg-zinc-900 hover:text-white" : "hover:bg-zinc-100 hover:text-zinc-900"
                                      )}
                                    >
                                      <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                                      <span>Share to Facebook</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        const snippet = post.content.length > 180 ? post.content.substring(0, 180) + '...' : post.content;
                                        const text = `"${snippet}"\n\n— Shared from WiseFit Digital Sanctuary:`;
                                        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + window.location.origin)}`;
                                        window.open(url, '_blank', 'noopener,noreferrer');
                                        setActiveSharePostId(null);
                                      }}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                        isDarkMode ? "hover:bg-zinc-900 hover:text-white" : "hover:bg-zinc-100 hover:text-zinc-900"
                                      )}
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                                      <span>Share to WhatsApp</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(`"${post.content}"\n\n— Shared from WiseFit Digital Sanctuary: ${window.location.origin}`);
                                        setCopiedPostId(post.id);
                                        setActiveSharePostId(null);
                                        setTimeout(() => setCopiedPostId(null), 2500);
                                      }}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                        isDarkMode ? "hover:bg-zinc-900 hover:text-white" : "hover:bg-zinc-100 hover:text-zinc-900"
                                      )}
                                    >
                                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Copy Reflection</span>
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Edit & Delete Actions */}
                            {(post.userId === currentUser?.uid || isAdmin) && (
                              <div className="flex items-center gap-1 border-l border-zinc-500/15 pl-2 ml-1">
                                <button
                                  onClick={() => handleEditPostStart(post)}
                                  className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isDarkMode 
                                      ? "text-zinc-500 hover:text-white hover:bg-zinc-800" 
                                      : "text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100"
                                  )}
                                  title="Edit reflection"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isDarkMode
                                      ? "text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                                      : "text-zinc-400 hover:text-red-600 hover:bg-zinc-100"
                                  )}
                                  title="Delete reflection"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Middle Text Area / Inline Edit Box */}
                        {editingPostId === post.id ? (
                          <div className="space-y-2 mt-2">
                            <textarea
                              value={editingPostContent}
                              onChange={(e) => setEditingPostContent(e.target.value)}
                              rows={5}
                              maxLength={60000}
                              className={cn(
                                "w-full text-xs p-3 rounded-2xl border outline-none font-sans resize-none transition-all duration-300",
                                isDarkMode 
                                  ? "bg-zinc-950 border-zinc-850 text-zinc-200 focus:border-emerald-500/50" 
                                  : "bg-zinc-50 border-zinc-200 text-zinc-850 focus:border-emerald-500/50 shadow-inner"
                              )}
                              placeholder="Edit your scholarly reflection..."
                            />
                            <div className="flex items-center justify-between px-1 text-[10px] uppercase font-black tracking-wider">
                              <span className={cn(
                                "font-mono font-bold",
                                isEditingPostOverWordLimit 
                                  ? "text-rose-500 animate-pulse" 
                                  : editingPostWordCount > 6000 
                                    ? "text-amber-500" 
                                    : "text-zinc-500"
                              )}>
                                {editingPostWordCount.toLocaleString()} / 7,000 words
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingPostId(null);
                                    setEditingPostContent('');
                                  }}
                                  disabled={isSavingEdit}
                                  className={cn(
                                    "px-3.5 py-1.5 rounded-lg border transition-colors",
                                    isDarkMode 
                                      ? "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800" 
                                      : "border-zinc-250 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                                  )}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEditedPost(post.id)}
                                  disabled={isSavingEdit || !editingPostContent.trim() || isEditingPostOverWordLimit}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-black flex items-center gap-1 active:scale-95 disabled:opacity-50 transition-all shadow shadow-emerald-500/10"
                                >
                                  {isSavingEdit ? (
                                    <span>Saving...</span>
                                  ) : (
                                    <>
                                      <Save className="w-3 h-3" /> Save Changes
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className={cn("text-xs leading-relaxed font-normal whitespace-pre-wrap", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>
                            {post.content}
                          </p>
                        )}

                        {/* Media rendering section */}
                        {post.mediaType === 'image' && post.mediaUrl && (
                          <div 
                            onClick={() => setActiveLightboxImg(post.mediaUrl)}
                            className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800/20 bg-zinc-950 cursor-zoom-in group shadow-md"
                            title="Click to enlarge image"
                          >
                            <img 
                              src={post.mediaUrl} 
                              alt="attachment" 
                              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-300"
                              onError={(e) => {
                                (e.target as any).src = 'https://images.unsplash.com/photo-1518152006812-cdff2f4a4c35?auto=format&fit=crop&q=80&w=600';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                            </div>
                          </div>
                        )}

                        {post.mediaType === 'video' && post.mediaUrl && (
                          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800/25 bg-black shadow-lg">
                            <video 
                              src={`${post.mediaUrl}#t=0.001`}
                              controls
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}

                        {post.mediaType === 'youtube' && embedYt && (
                          <div className="aspect-video rounded-2xl overflow-hidden border border-zinc-800/20 bg-zinc-950">
                            <iframe 
                              src={embedYt}
                              title="community_yt"
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {post.mediaType === 'tiktok' && post.mediaUrl && (
                          <div className={cn(
                            "p-4 rounded-2xl border flex items-center justify-between gap-3 bg-zinc-950/20 border-zinc-800",
                            isDarkMode ? "bg-zinc-900/60" : "bg-zinc-50 border-zinc-200"
                          )}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center border border-zinc-800">
                                <Video className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-wider">TikTok Educational Segment</p>
                                <p className={cn("text-[9px] max-w-[200px] truncate", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
                                  URL: {post.mediaUrl}
                                </p>
                              </div>
                            </div>
                            <a 
                              href={post.mediaUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="px-3.5 py-1.5 bg-emerald-500 text-zinc-950 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 select-none"
                            >
                              Open Clip <ExternalLinkIcon className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}

                        {/* Dynamic URL Previews & Thumbnails */}
                        {(() => {
                          const previewUrls = Array.from(new Set([
                            ...extractUrls(post.content),
                            ...(post.mediaUrl ? [post.mediaUrl] : [])
                          ]));
                          if (previewUrls.length === 0) return null;
                          return (
                            <div className="space-y-2 pt-1 pointer-events-auto">
                              {previewUrls.map((url, idx) => (
                                <LinkPreviewCard 
                                  key={`${post.id}-preview-${idx}`} 
                                  url={url} 
                                  isDarkMode={isDarkMode} 
                                />
                              ))}
                            </div>
                          );
                        })()}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sidebar quick insights column */}
            <div className="space-y-6">
              
              {/* Educational grade explainer */}
              <div className={cn(
                "p-5 rounded-3xl border space-y-4",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-spin-slow" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Academic Grade Concept</h4>
                </div>
                <p className={cn("text-[11px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-650")}>
                  Under **Strategic Path D**, this application is preparing to host an automated **Educational IQ Grader**.
                </p>
                <div className="space-y-2 text-[10px] font-semibold">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-zinc-800/10 border border-zinc-800/30">
                    <span className="text-zinc-400">Philosophical Weight</span>
                    <span className="text-emerald-500">Auto evaluation</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-zinc-800/10 border border-zinc-800/30">
                    <span className="text-zinc-400">Hate & Dopamine Filters</span>
                    <span className="text-purple-400">Auto screen</span>
                  </div>
                </div>
                <p className={cn("text-[10px] leading-relaxed italic", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
                  Every post will undergo structured multi-grade analyses using custom Gemini embeddings before entering the public scholarly feed automatically. Zero noise space.
                </p>
              </div>

              {/* General list stats */}
              <div className={cn(
                "p-5 rounded-3xl border space-y-3",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              )}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Disciples Near You</h4>
                </div>
                <div className="space-y-2 pt-1">
                  {peers.slice(0, 4).map(peer => {
                    const online = isPeerOnline(peer);
                    return (
                      <button 
                        key={peer.uid}
                        onClick={() => {
                          setEngagePeer(peer);
                          setEngageMessage('');
                          setEngageSuccess(false);
                          setEngageError(null);
                        }}
                        className={cn(
                          "w-full p-2.5 rounded-2xl border text-left flex items-center justify-between gap-2 group transition-all",
                          isDarkMode ? "border-zinc-800/50 hover:bg-zinc-800/20" : "border-zinc-150 hover:bg-zinc-50"
                        )}
                      >
                        <div className="flex items-center gap-2 max-w-[150px]">
                          <div className="relative shrink-0">
                            <img 
                              src={peer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                              className="w-6 h-6 rounded-full object-cover"
                              alt="peer"
                              referrerPolicy="no-referrer"
                            />
                            {online && (
                              <span className="absolute bottom-0 right-0 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold truncate group-hover:text-emerald-500 transition-colors">{peer.name}</span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 shrink-0">Engage →</span>
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => setActiveTab('peers')}
                    className="w-full text-center text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-emerald-500 transition-colors pt-1 block"
                  >
                    Browse All {peers.length} Seekers
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB B: DIRECT DIALOGS / MESSAGES */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[440px] md:min-h-[550px] h-[480px] xs:h-[510px] sm:h-[560px] md:h-[72vh] max-h-[525px] md:max-h-[750px] mb-20 md:mb-0 overflow-hidden relative">
            <style>{`
              .chat-scrollbar::-webkit-scrollbar {
                width: 5px !important;
                display: block !important;
              }
              .chat-scrollbar::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.03) !important;
                border-radius: 99px !important;
              }
              .chat-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(16, 185, 129, 0.45) !important;
                border-radius: 99px !important;
                border: 1px solid rgba(255, 255, 255, 0.05) !important;
              }
              .chat-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(16, 185, 129, 0.65) !important;
              }
              /* For Firefox */
              .chat-scrollbar {
                scrollbar-width: thin !important;
                scrollbar-color: rgba(16, 185, 129, 0.4) rgba(0, 0, 0, 0.02) !important;
                scrollbar-gutter: stable;
              }
            `}</style>
            
            {/* Conversation list pane */}
            <div className={cn(
              "p-4 pb-24 md:pb-4 rounded-3xl border flex flex-col h-full overflow-hidden",
              isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm",
              activeChat ? "hidden md:flex" : "flex"
            )}>
              <h3 className="text-xs font-black uppercase tracking-wider mb-3 px-1 text-zinc-400">Conversations</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-[10px] text-zinc-500">
                    No historic dialogs. Establish paths by selecting a scholar in the Seekers Swarm tab!
                  </div>
                ) : (
                  conversations.map(convo => {
                    const otherIndex = convo.participants[0] === currentUser.uid ? 1 : 0;
                    const otherUid = convo.participants[otherIndex];
                    const otherName = convo.participantNames[otherIndex] || 'Anonymous';
                    const otherAvatar = convo.participantAvatars ? convo.participantAvatars[otherIndex] : undefined;
                    const active = activeChat?.id === convo.id;

                    const otherPeer = peers.find(p => p.uid === otherUid);
                    const online = otherPeer ? isPeerOnline(otherPeer) : false;

                    return (
                      <button
                        key={convo.id}
                        type="button"
                        onClick={() => setActiveChat(convo)}
                        className={cn(
                          "w-full p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all",
                          active 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                            : isDarkMode 
                              ? "border-zinc-800/80 hover:bg-zinc-800/20 text-white" 
                              : "border-zinc-150 hover:bg-zinc-50 text-zinc-800"
                        )}
                      >
                        <div className="relative shrink-0">
                          <img 
                            src={otherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            className="w-7 h-7 rounded-full object-cover border border-zinc-500/10"
                            alt="usr"
                            referrerPolicy="no-referrer"
                          />
                          {online && (
                            <span className="absolute bottom-0 right-0 flex h-2 w-2">
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-zinc-900"></span>
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black uppercase tracking-tight truncate flex items-center gap-1.5">
                            {otherName}
                            {online && (
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            )}
                          </p>
                          <p className={cn("text-[9px] truncate mt-0.5", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>
                            {convo.lastMessage || 'Open private exchange loop.'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected Active Chat terminal */}
            <div className={cn(
              "md:col-span-2 flex flex-col h-full overflow-hidden",
              activeChat ? "flex" : "hidden md:flex"
            )}>
              {activeChat ? (
                <div className={cn(
                  "p-4 md:p-5 rounded-3xl border flex flex-col h-full relative overflow-hidden",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                )}>
                  {/* Active Header user info */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-855 leading-none shrink-0 mb-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const otherIndex = activeChat.participants[0] === currentUser.uid ? 1 : 0;
                        const otherUid = activeChat.participants[otherIndex];
                        const otherPeer = peers.find(p => p.uid === otherUid);
                        const online = otherPeer ? isPeerOnline(otherPeer) : false;
                        const otherName = activeChat.participants[0] === currentUser.uid 
                          ? activeChat.participantNames[1] 
                          : activeChat.participantNames[0];
                        const otherAvatar = otherPeer?.avatarUrl || (activeChat.participantAvatars ? activeChat.participantAvatars[otherIndex] : undefined) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                        return (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setActiveChat(null)}
                              className="md:hidden p-1 mr-0.5 rounded-xl bg-zinc-850 border border-zinc-800 hover:bg-zinc-800 text-emerald-500 transition-colors"
                              title="Back to conversation list"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            {/* Profile picture inside dialogue box header */}
                            <div className="relative shrink-0 select-none group/hdr cursor-zoom-in">
                              <img 
                                src={otherAvatar}
                                className="w-9 h-9 rounded-full object-cover border border-emerald-500/20 shadow-md transition-transform duration-300 group-hover/hdr:scale-105"
                                alt="peer avatar"
                                referrerPolicy="no-referrer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveLightboxImg(otherAvatar);
                                }}
                                title="Click to zoom profile picture"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/hdr:bg-black/20 rounded-full transition-all flex items-center justify-center">
                                <Maximize2 className="w-3 h-3 text-white opacity-0 group-hover/hdr:opacity-100 transition-opacity" />
                              </div>
                              <span className={cn(
                                "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-zinc-950",
                                online ? "bg-emerald-500" : "bg-zinc-600"
                              )} />
                            </div>

                            <div className="leading-tight">
                              <div className="flex items-center gap-2">
                                <h4 
                                  onClick={() => {
                                    if (otherPeer) {
                                      setSelectedPeerWall(otherPeer);
                                    }
                                  }}
                                  className="text-[12px] font-black uppercase tracking-wider cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                                >
                                  {otherName}
                                </h4>
                                <span className={cn(
                                  "text-[7px] font-bold px-1.5 py-0.5 rounded uppercase leading-none border select-none scale-90 origin-left",
                                  online 
                                    ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-400 font-mono animate-pulse" 
                                    : "bg-zinc-500/5 border-zinc-800 text-zinc-500 font-mono"
                                )}>
                                  {online ? 'ONLINE' : 'OFFLINE'}
                                </span>
                              </div>
                              {otherPeer?.biography ? (
                                <p className="text-[9px] text-zinc-400 font-medium italic line-clamp-1 max-w-[155px] sm:max-w-[280px]">
                                  "{otherPeer.biography}"
                                </p>
                              ) : (
                                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                                  WiseFit Seeker
                                </p>
                              )}
                            </div>
                            
                            {otherPeer && (
                              <button
                                type="button"
                                onClick={() => setSelectedPeerWall(otherPeer)}
                                className="hidden sm:inline-flex items-center gap-1 text-[8.5px] font-black uppercase text-emerald-450 hover:text-emerald-350 border border-emerald-500/15 bg-emerald-500/5 hover:border-emerald-500/25 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow ml-2 shrink-0 select-none"
                              >
                                <Users className="w-3 h-3" />
                                <span>View Wall</span>
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <button 
                      onClick={() => setActiveChat(null)}
                      className="p-1.5 rounded-full transition-all bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-950/30 active:scale-95 flex items-center justify-center cursor-pointer border border-rose-450"
                      title="Exit Dialogue"
                    >
                      <X className="w-4 h-4 stroke-[3px]" />
                    </button>
                  </div>

                  {/* Messages container list */}
                  <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 mb-4 chat-scrollbar">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-16 text-[10px] text-zinc-500 italic">
                        Channel cleared. Speak with rigor.
                      </div>
                    ) : (
                      chatMessages.map(msg => {
                        const isMine = msg.senderId === currentUser.uid;
                        const isEditing = editingMessageId === msg.id;
                        const isScholar = msg.senderId && msg.senderId.startsWith('dummy_');

                        // Resolve sender identity for the message bubble
                        let senderAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                        let senderName = 'Scholar';
                        let peerObj: any = null;
                        
                        if (isMine) {
                          senderAvatar = thisPublicProfile?.avatarUrl || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                          senderName = thisPublicProfile?.name || userProfile?.name || 'Me';
                        } else {
                          const otherIndex = activeChat.participants[0] === currentUser.uid ? 1 : 0;
                          const otherUid = activeChat.participants[otherIndex];
                          peerObj = peers.find(p => p.uid === otherUid);
                          senderAvatar = peerObj?.avatarUrl || (activeChat.participantAvatars ? activeChat.participantAvatars[otherIndex] : undefined) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                          senderName = peerObj?.name || activeChat.participantNames[otherIndex] || 'Peer';
                        }

                        return (
                          <div 
                            key={msg.id}
                            className={cn(
                              "flex gap-2.5 w-full items-start",
                              isMine ? "justify-end text-right" : "justify-start text-left"
                            )}
                          >
                            {/* Recipient Profile Avatar on Incoming Messages */}
                            {!isMine && (
                              <div className="relative shrink-0 select-none group/msgavatar cursor-pointer">
                                <img 
                                  src={senderAvatar}
                                  onClick={() => {
                                    if (peerObj) {
                                      setSelectedPeerWall(peerObj);
                                    } else {
                                      setActiveLightboxImg(senderAvatar);
                                    }
                                  }}
                                  className="w-7.5 h-7.5 rounded-full object-cover border border-emerald-500/15 shadow transition-transform duration-300 group-hover/msgavatar:scale-110"
                                  alt={senderName}
                                  title={`Click to view ${senderName}'s Profile Wall`}
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/msgavatar:bg-black/10 rounded-full transition-colors flex items-center justify-center">
                                  <Maximize2 className="w-2.5 h-2.5 text-white opacity-0 group-hover/msgavatar:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            )}

                            <div 
                              className={cn(
                                "flex flex-col max-w-[76%] rounded-2xl relative group transition-all",
                                isMine 
                                  ? "bg-emerald-500 text-zinc-950 ml-auto border-emerald-400/30 rounded-tr-none px-3.5 py-2.5 text-xs font-semibold border shadow-sm shadow-emerald-500/10" 
                                  : isScholar
                                    ? (isDarkMode 
                                        ? "bg-zinc-900/80 border-emerald-500/20 text-emerald-100 rounded-tl-none shadow-md shadow-emerald-500/5 px-4 py-3 border" 
                                        : "bg-emerald-50/50 border-emerald-205 text-emerald-950 rounded-tl-none shadow-sm px-4 py-3 border")
                                    : isDarkMode 
                                      ? "bg-zinc-800 border-zinc-700/80 text-zinc-50 rounded-tl-none shadow-sm px-3.5 py-2.5 text-xs font-semibold border" 
                                      : "bg-zinc-100 border-zinc-200 text-zinc-900 rounded-tl-none shadow-sm px-3.5 py-2.5 text-xs font-semibold border"
                              )}
                            >
                              {isEditing ? (
                                <div className="space-y-2 min-w-[200px]">
                                  <textarea
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className={cn(
                                      "w-full p-2 text-xs rounded-lg border outline-none font-medium resize-none",
                                      isMine 
                                        ? "bg-emerald-600 text-zinc-950 border-emerald-700 placeholder-emerald-900" 
                                        : "bg-zinc-700/50 text-white border-zinc-600"
                                    )}
                                    rows={2}
                                  />
                                  <div className="flex justify-end gap-1">
                                    <button
                                      onClick={() => setEditingMessageId(null)}
                                      className={cn(
                                        "px-2 py-1 text-[9px] font-black uppercase rounded-lg border",
                                        isMine 
                                          ? "border-zinc-950/20 text-zinc-900 hover:bg-zinc-950/10" 
                                          : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                                      )}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSaveEditMessage(msg.id)}
                                      disabled={!editingText.trim()}
                                      className={cn(
                                        "px-2 py-1 text-[9px] font-black uppercase rounded-lg shadow-sm",
                                        isMine 
                                          ? "bg-zinc-950 text-emerald-400 hover:bg-zinc-900" 
                                          : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                                      )}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {renderMessageTextWithAttachments(msg.text, isMine, isScholar)}
                                  <div className="flex items-center justify-between gap-3 mt-1.5 leading-none shrink-0">
                                    <span className={cn(
                                      "text-[8px] select-none opacity-60 font-mono flex items-center gap-1",
                                      isMine ? "text-zinc-950" : isDarkMode ? "text-zinc-500" : "text-zinc-500"
                                    )}>
                                      <span>
                                        {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      {msg.updatedAt && (
                                        <span className="text-[7px] italic font-sans opacity-75">(edited)</span>
                                      )}
                                    </span>

                                    {isMine && (
                                      <div className="md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity flex items-center gap-2 select-none shrink-0 ml-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingMessageId(msg.id);
                                            setEditingText(msg.text);
                                          }}
                                          className={cn(
                                            "p-1.5 rounded-lg transition-all active:scale-[0.93] flex items-center justify-center border shadow-md cursor-pointer",
                                            isMine 
                                              ? "bg-zinc-950 border-emerald-450/40 text-emerald-400 hover:bg-zinc-900" 
                                              : "bg-zinc-850 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                          )}
                                          title="Edit Message"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteMessage(msg.id)}
                                          className={cn(
                                            "p-1.5 rounded-lg transition-all active:scale-[0.93] flex items-center justify-center border shadow-md cursor-pointer",
                                            isMine 
                                              ? "bg-zinc-950 border-red-500/40 text-red-400 hover:bg-zinc-900 hover:text-red-300" 
                                              : "bg-zinc-850 border-zinc-700 text-red-405 hover:bg-zinc-800"
                                          )}
                                          title="Delete Message"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* My Profile Avatar on Outgoing Messages */}
                            {isMine && (
                              <div className="relative shrink-0 select-none group/mymsgavatar cursor-pointer">
                                <img 
                                  src={senderAvatar}
                                  onClick={() => setActiveLightboxImg(senderAvatar)}
                                  className="w-7.5 h-7.5 rounded-full object-cover border border-emerald-500/15 shadow transition-transform duration-300 group-hover/mymsgavatar:scale-110"
                                  alt={senderName}
                                  title="Click to zoom your photo"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/mymsgavatar:bg-black/10 rounded-full transition-colors flex items-center justify-center">
                                  <Maximize2 className="w-2.5 h-2.5 text-white opacity-0 group-hover/mymsgavatar:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    {dummyTypingState && (
                      <div className={cn(
                        "flex items-center gap-2 self-start rounded-2xl px-3.5 py-2.5 text-xs font-semibold border border-dashed rounded-tl-none animate-pulse max-w-[80%] mr-auto w-fit",
                        isDarkMode
                          ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200"
                      )}>
                        <span>{dummyTypingState} is responding...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Emoji selection & file uploads row bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
                      {['❤️', '💔', '💖', '💝', '💕', '🫶', '🔥', '⚡', '✨', '🚀', '🎭', '🌌', '🧘', '🧠', '💪', '🏛️', '⚓', '📜', '🛡️', '⏳'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewMessageText(prev => prev + emoji)}
                          className={cn(
                            "w-7 h-7 flex items-center justify-center text-sm rounded-lg border transition-all active:scale-95 shrink-0",
                            isDarkMode 
                              ? "bg-zinc-850 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300" 
                              : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                       <label className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-lg border cursor-pointer transition-all hover:bg-emerald-500/10 active:scale-95 shrink-0",
                        isUploadingFile ? "animate-pulse" : "",
                        isDarkMode 
                          ? "bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-emerald-400" 
                          : "bg-zinc-50 border-zinc-200 text-zinc-505 hover:text-emerald-600"
                      )}>
                        <Paperclip className="w-3.5 h-3.5" />
                        <input 
                          type="file" 
                          className="hidden" 
                          disabled={isUploadingFile} 
                          onChange={(e) => handleFileUpload(e, false)} 
                          accept="image/*,video/mp4,application/pdf"
                        />
                      </label>
                      {isUploadingFile && (
                        <span className="text-[9px] font-mono text-emerald-500 animate-pulse">Uploading...</span>
                      )}
                    </div>
                  </div>

                  {/* Input sending bottom form or locked for AI Scholars */}
                  <form onSubmit={handleSendDMMessage} className="flex gap-2 shrink-0">
                      <input 
                        type="text"
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder="Transcribe peaceful thoughts or structured critiques..."
                        className={cn(
                          "flex-1 px-4 py-3 text-[18px] rounded-xl border focus:ring-1 focus:ring-emerald-500 outline-none font-handwritten tracking-wide font-semibold placeholder:font-sans placeholder:text-xs",
                          isDarkMode ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400"
                        )}
                      />
                      <button 
                        type="submit" 
                        disabled={!newMessageText.trim() || isUploadingFile}
                        className={cn(
                          "p-3 rounded-xl bg-emerald-500 text-zinc-950 active:scale-95 transition-transform flex items-center justify-center shadow-lg shadow-emerald-500/10",
                          (!newMessageText.trim() || isUploadingFile) && "opacity-50 pointer-events-none"
                        )}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                </div>
              ) : (
                <div className={cn(
                  "p-12 rounded-3xl border flex flex-col items-center justify-center text-center h-full",
                  isDarkMode ? "bg-zinc-900/10 border-zinc-800" : "bg-zinc-50 border-zinc-150"
                )}>
                  <MessageSquare className="w-10 h-10 text-zinc-600 mb-3 animate-bounce-slow" />
                  <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Direct Message Loop</p>
                  <p className={cn("text-[10px] mt-1 max-w-xs", isDarkMode ? "text-zinc-550" : "text-zinc-450")}>
                    Select a conversation from the list or browse active seekers in the swarm tab to open direct lines of inquiry.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB C: SEEKERS SWARMDIRECTORY */}
        {activeTab === 'peers' && (
          <div className="space-y-4">
            
            {/* Search filter input */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input 
                  type="text"
                  value={peerSearchQuery}
                  onChange={(e) => setPeerSearchQuery(e.target.value)}
                  placeholder="Search seekers by codename, bio credentials, or focus areas..."
                  className={cn(
                    "w-full pl-10 pr-4 py-3.5 text-xs rounded-2xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 transition-all",
                    isDarkMode ? "bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-450" : "bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-500 shadow-inner"
                  )}
                />
              </div>

              {/* Filtering segmented buttons */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPeerFilter('all')}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all",
                    peerFilter === 'all'
                      ? (isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-900 border-zinc-800 text-white shadow-sm")
                      : isDarkMode
                        ? "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        : "border-zinc-200 text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  All Seekers ({peers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPeerFilter('friends')}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer",
                    peerFilter === 'friends'
                      ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-black italic shadow-md shadow-emerald-500/10" 
                      : isDarkMode
                        ? "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        : "border-zinc-200 text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Checked Friends ({acceptedFriendIds.size})
                </button>
                <button
                  type="button"
                  onClick={() => setPeerFilter('dating')}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer",
                    peerFilter === 'dating'
                      ? "bg-rose-500 border-rose-400 text-white font-black italic shadow-md shadow-rose-500/15" 
                      : isDarkMode
                        ? "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                        : "border-zinc-200 text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  <Heart className={cn("w-3.5 h-3.5 fill-current", peerFilter === 'dating' ? "text-white" : "text-rose-500")} /> Dating Swarm ({peers.filter(p => p.isDatingModeEnabled).length})
                </button>
              </div>
            </div>

            {/* Pending Requests component header bucket */}
            {incomingPending.length > 0 && (
              <div className={cn(
                "p-4 rounded-3xl border space-y-3",
                isDarkMode ? "bg-zinc-900/40 border-zinc-800/80" : "bg-zinc-50 border-zinc-200"
              )}>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Pending Connection Requests ({incomingPending.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {incomingPending.map(req => (
                    <div 
                      key={req.id} 
                      className={cn(
                        "p-3 rounded-2xl border flex items-center justify-between gap-3",
                        isDarkMode ? "bg-zinc-955 border-zinc-850" : "bg-white border-zinc-150 shadow-xs"
                      )}
                    >
                      <div className="flex items-center gap-2 max-w-[170px] min-w-0">
                        <img 
                          src={req.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                          alt="req" 
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-zinc-500/10" 
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[10px] font-bold truncate text-zinc-400">{req.senderName}</span>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button 
                          onClick={() => handleDeclineFriendRequest(req)}
                          className={cn(
                            "p-1.5 rounded-lg border hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-all",
                            isDarkMode ? "border-zinc-800" : "border-zinc-200"
                          )}
                          title="Decline"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleAcceptFriendRequest(req)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                          <UserCheck className="w-3 h-3" /> Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid display */}
            {filteredPeers.length === 0 ? (
              <div className="text-center py-12 text-xs text-zinc-500 italic">
                {peerFilter === 'friends' 
                  ? 'No checked scholar friends matching filters in directory. Secure connection links first!'
                  : 'No active seekers matching search terms were registered.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredPeers.map(peer => {
                  const relation = getFriendRelation(peer.uid);
                  const online = isPeerOnline(peer);

                  const score = computeScholarMatchingScore(thisPublicProfile, peer);
                  const compDetails = getDetailedCompatibility(thisPublicProfile, peer);

                  return (
                    <div
                      key={peer.uid}
                      className={cn(
                        "p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden group/card",
                        peer.coverUrl ? "pt-14" : "",
                        isDarkMode ? "bg-zinc-900/60 border-zinc-800/80 hover:border-emerald-500/45 shadow-lg shadow-black/20" : "bg-white border-zinc-200 hover:border-emerald-500/30 shadow-sm"
                      )}
                    >
                      {peer.coverUrl && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightboxImg(peer.coverUrl);
                          }}
                          className="absolute top-0 left-0 right-0 h-16 overflow-hidden select-none cursor-zoom-in group/cover z-10"
                          title="Click to zoom cover"
                        >
                          <img src={peer.coverUrl} className="w-full h-full object-cover opacity-45 group-hover/cover:scale-105 transition-transform duration-300" alt="cover" />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/90"></div>
                        </div>
                      )}

                      <div className="space-y-3 text-xs relative z-10">
                        {/* Top Profile Header */}
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0 select-none group/avatar">
                            <img 
                              src={peer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                              className="w-11 h-11 rounded-full object-cover border border-zinc-500/20 cursor-zoom-in transition-transform duration-300 group-hover/avatar:scale-105 relative z-10"
                              alt="peer"
                              referrerPolicy="no-referrer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveLightboxImg(peer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
                              }}
                              title="Click to enlarge avatar"
                            />
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveLightboxImg(peer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');
                              }}
                              className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/25 rounded-full transition-colors flex items-center justify-center z-20 cursor-zoom-in"
                            >
                              <Maximize2 className="w-3.5 h-3.5 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                            </div>
                            {online ? (
                              <span className="absolute bottom-0 right-0 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-zinc-900 flex-shrink-0"></span>
                              </span>
                            ) : (
                              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-zinc-600 border-2 border-zinc-900 shrink-0"></span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className={cn(
                              "font-black uppercase tracking-tight truncate flex items-center gap-1.5 text-xs",
                              isDarkMode ? "text-zinc-100" : "text-zinc-900"
                            )}>
                              {peer.name}
                              {online && (
                                <span className="text-[7px] font-mono font-black text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 rounded animate-pulse">LIVE</span>
                              )}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              <span className="text-[7.5px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-black uppercase tracking-widest text-center border border-emerald-500/10 inline-block line-clamp-1">
                                {peer.mbti ? `${peer.mbti} · Archetype` : "Seeker"}
                              </span>
                              {score !== null && (
                                <div className="relative group/tooltip inline-block z-35">
                                  <span 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTooltipUid(activeTooltipUid === peer.uid ? null : peer.uid);
                                    }}
                                    className={cn(
                                      "text-[7.5px] px-1.5 py-0.5 rounded font-black tracking-tight shrink-0 flex items-center gap-0.5 leading-none cursor-pointer hover:scale-105 active:scale-95 transition-transform select-none",
                                      peer.isDatingModeEnabled
                                        ? "bg-rose-500 text-white animate-pulse"
                                        : "bg-emerald-500 text-zinc-950"
                                    )}
                                    title="Click to view match breakdown"
                                  >
                                    {peer.isDatingModeEnabled ? "💖" : "⚡"} {score}% {peer.isDatingModeEnabled ? "Fit" : "Match"}
                                  </span>
                                  
                                  {/* Hover & Active Click Tooltip Breakdown */}
                                  <div className={cn(
                                    "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-3 rounded-2xl border text-left shadow-xl transition-all duration-300 z-50 space-y-1.5 backdrop-blur-md",
                                    activeTooltipUid === peer.uid
                                      ? "opacity-100 pointer-events-auto scale-100 translate-y-0"
                                      : "opacity-0 pointer-events-none scale-95 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto group-hover/tooltip:scale-100 group-hover/tooltip:translate-y-0",
                                    isGirlyMode 
                                      ? "bg-white/95 border-pink-100 text-pink-950 shadow-pink-500/10" 
                                      : isDarkMode 
                                        ? "bg-zinc-950/95 border-zinc-805 text-zinc-200 shadow-black/40" 
                                        : "bg-white/95 border-zinc-200 text-zinc-800 shadow-zinc-200/50"
                                  )}>
                                    <div className="flex items-center gap-1.5 border-b border-zinc-850/10 dark:border-zinc-800/35 pb-1.5 mb-1.5">
                                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse shrink-0" />
                                      <span className="font-extrabold uppercase tracking-widest text-[8.5px] text-rose-500">Compatibility Drivers</span>
                                    </div>
                                    {compDetails.isError ? (
                                      <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 italic">Complete physical records and the personality checklist to generate detailed reasons.</p>
                                    ) : (
                                      <div className="space-y-1.5">
                                        {compDetails.reasons.map((r, rIdx) => (
                                          <div key={rIdx} className="flex items-start gap-1.5 leading-normal text-[9.5px]">
                                            <span className="text-rose-500/80 font-bold shrink-0">✦</span>
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{r}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    <div className="text-[7.5px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 text-center pt-1.5 border-t border-zinc-855 dark:border-zinc-800/35 leading-none">
                                      Click tile to open sanctuary wall
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Mini Image Preview Strip */}
                        {peer.userPhotos && peer.userPhotos.length > 0 && (
                          <div className="flex gap-1.5 overflow-x-auto py-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                            {peer.userPhotos.map((photo, i) => (
                              <div 
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveLightboxImg(photo);
                                }}
                                className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-500/10 cursor-zoom-in shrink-0 hover:scale-110 active:scale-95 transition-transform"
                                title="Click to preview photo"
                              >
                                <img src={photo} alt={`profile_${i}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <p className={cn(
                          "text-[12px] leading-relaxed line-clamp-3 font-semibold min-h-[50px] pt-1",
                          isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>
                          {peer.biography || 'No philosopher card established. Living silently in contemplation.'}
                        </p>

                        {/* Dating characteristics mini tags */}
                        {(peer.location || peer.height || peer.relationshipIntent || peer.fitnessStyle || peer.morningEnergy) && (
                          <div className="flex flex-wrap gap-1.5 pt-1.5 opacity-85">
                            {peer.location && (
                              <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                                📍 {peer.location}
                              </span>
                            )}
                            {peer.height && (
                              <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                                📐 {peer.height} cm
                              </span>
                            )}
                            {peer.relationshipIntent && (
                              <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                                ❤️ {peer.relationshipIntent}
                              </span>
                            )}
                            {peer.fitnessStyle && (
                              <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                                ⚡ {peer.fitnessStyle}
                              </span>
                            )}
                            {peer.morningEnergy && (
                              <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                                🌅 {peer.morningEnergy}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Interests pill lists */}
                        {peer.intellectualInterests && peer.intellectualInterests.length > 0 && (
                          <div className="flex flex-wrap gap-1 pb-1 pt-1.5 border-t border-zinc-800/10">
                            {peer.intellectualInterests.map(interest => (
                              <span key={interest} className="text-[7.5px] font-bold px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 rounded-sm">
                                {interest}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Psychometrics block on Peer Card */}
                        {peer.bigFive ? (
                          <div className={cn(
                            "pt-2 border-t text-[9px] space-y-1.5 my-1",
                            isDarkMode ? "border-zinc-800/60" : "border-zinc-200"
                          )}>
                            <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-zinc-500">
                              <span>Psychologist Profile</span>
                              <span className="text-emerald-400 font-mono">{peer.mbti || 'MBTI'}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 leading-none font-semibold">
                              <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[8px]">O: {peer.bigFive.openness}%</span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px]">C: {peer.bigFive.conscientiousness}%</span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px]">E: {peer.bigFive.extraversion}%</span>
                              <span className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 text-[8px]">A: {peer.bigFive.agreeableness}%</span>
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[8px]">N: {peer.bigFive.neuroticism}%</span>
                            </div>
                            {peer.mmpiResilience !== undefined && (
                              <div className="flex items-center justify-between text-[7px] text-zinc-500 font-semibold uppercase leading-tight pt-1">
                                <span>Resilience: <strong className="text-emerald-400">{peer.mmpiResilience}%</strong></span>
                                <span>Lie Scale: <strong className="text-teal-400">{peer.mmpiTruthScore || 100}%</strong></span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={cn(
                            "pt-2 border-t text-[7.5px] italic text-zinc-500 my-1",
                            isDarkMode ? "border-zinc-800/60" : "border-zinc-200"
                          )}>
                            Mental diagnostics unrecorded by seeker.
                          </div>
                        )}

                      </div>

                      <div className="space-y-2.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedPeerWall(peer)}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border shrink-0",
                              isDarkMode 
                                ? "border-zinc-800 hover:border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white" 
                                : "border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
                            )}
                          >
                            Seeker Wall
                          </button>
                          <button
                            onClick={() => {
                              setEngagePeer(peer);
                              setEngageMessage('');
                              setEngageSuccess(false);
                              setEngageError(null);
                            }}
                            className="flex-1 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-black italic uppercase text-[9px] tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-1 hover:bg-emerald-400"
                          >
                            Engage <Send className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* HIGHLY VISIBLE CONNECTION CONTROL ACTIONS */}
                        {(() => {
                          if (relation === 'friend') {
                            return (
                              <button
                                onClick={() => handleRemoveFriend(peer.uid)}
                                className="w-full py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                              >
                                <UserX className="w-3.5 h-3.5" /> Sever Connection (Friend)
                              </button>
                            );
                          } else if (relation === 'pending') {
                            return (
                              <div className={cn(
                                "w-full py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm",
                                isDarkMode ? "border-zinc-800 bg-zinc-950 text-zinc-400" : "border-zinc-200 bg-zinc-50 text-zinc-650"
                              )}>
                                <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> Pending Approval
                              </div>
                            );
                          } else if (relation === 'incoming') {
                            return (
                              <div className="flex gap-2 w-full">
                                <button
                                  onClick={() => {
                                    const req = friendRequests.find(r => r.senderId === peer.uid);
                                    if (req) handleDeclineFriendRequest(req);
                                  }}
                                  className="flex-1 py-2.5 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:text-red-350 text-[9px] font-black uppercase tracking-widest transition-colors"
                                >
                                  Decline
                                </button>
                                <button
                                  onClick={() => {
                                    const req = friendRequests.find(r => r.senderId === peer.uid);
                                    if (req) handleAcceptFriendRequest(req);
                                  }}
                                  className="flex-1 py-2.5 rounded-xl bg-emerald-400 text-zinc-950 hover:bg-emerald-300 font-extrabold text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-400/10"
                                >
                                  <UserCheck className="w-3.5 h-3.5" /> Accept
                                </button>
                              </div>
                            );
                          } else {
                            return (
                              <button
                                onClick={() => handleSendFriendRequest(peer)}
                                className="w-full py-2.5 rounded-xl border border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/5"
                              >
                                <UserPlus className="w-3.5 h-3.5" /> Connect Seeker
                              </button>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB E: PERSONALITY & MATCHING STUDIO */}
        {activeTab === 'personality' && (
          <div className="space-y-6">
            
            {/* Header section with clinical/academic context */}
            <div className={cn(
              "p-6 rounded-3xl border relative overflow-hidden",
              isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
            )}>
              {/* Cover presets or background accent */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-40"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-400" />
                    Personality & Compatibility Studio
                  </h3>
                  <p className={cn("text-xs leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                    Decades of academic validation over shallow corporate "animal" models. Configure your public dating-compatibility card and evaluate your psychological archetype under the Big Five (OCEAN), MMPI resilience, and Myers-Briggs (MBTI) metrics.
                  </p>
                </div>
                
                {/* Segments for profile vs quiz */}
                <div className={cn(
                  "flex p-1 rounded-xl self-start md:self-center shrink-0",
                  isDarkMode ? "bg-zinc-950 border border-zinc-850" : "bg-zinc-100 border border-zinc-205"
                )}>
                  <button
                    type="button"
                    onClick={() => setPersonalitySubTab('bio')}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5",
                      personalitySubTab === 'bio'
                        ? "bg-emerald-500 text-zinc-950 font-black italic shadow-md shadow-emerald-500/15"
                        : isDarkMode ? "text-zinc-500 hover:text-zinc-350" : "text-zinc-500 hover:text-zinc-800"
                    )}
                  >
                    <User className="w-3.5 h-3.5" /> Biography & Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersonalitySubTab('quiz')}
                    className={cn(
                      "px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5",
                      personalitySubTab === 'quiz'
                        ? "bg-emerald-500 text-zinc-950 font-black italic shadow-md shadow-emerald-500/15"
                        : isDarkMode ? "text-zinc-500 hover:text-zinc-350" : "text-zinc-500 hover:text-zinc-800"
                    )}
                  >
                    <Brain className="w-3.5 h-3.5" /> Clinical Psych Quiz
                  </button>
                </div>
              </div>

              {saveSuccessMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold text-center"
                >
                  {saveSuccessMessage}
                </motion.div>
              )}
            </div>

            {/* Sub-tab Content: Bio Settings */}
            {personalitySubTab === 'bio' && (
              <div className="space-y-6">
                {/* Dynamically calculated Profile Completeness Section */}
                {(() => {
                  let score = 0;
                  const total = 12;
                  if (setupName.trim()) score++;
                  if (setupBiography.trim()) score++;
                  if (editAvatarUrl.trim()) score++;
                  if (editCoverUrl.trim()) score++;
                  if (editJobTitle.trim()) score++;
                  if (editSchool.trim()) score++;
                  if (editAnthem.trim()) score++;
                  if (editZodiac.trim()) score++;
                  if (editEducation.trim()) score++;
                  if (editFamilyPlans.trim()) score++;
                  if (editCommunicationStyle.trim() || editLoveStyle.trim()) score++;
                  if (editUserPhotos.filter(p => !!p).length > 0) score++;

                  const pct = Math.round((score / total) * 100);

                  return (
                    <div className={cn(
                      "p-6 rounded-3xl border relative overflow-hidden shadow-xl transition-all",
                      isDarkMode ? "bg-zinc-900/65 border-zinc-800 shadow-black/10" : "bg-white border-zinc-250/80 shadow-md shadow-zinc-200/40"
                    )}>
                      {/* Ambient background blur */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/15 to-teal-500/0 rounded-full filter blur-2xl pointer-events-none"></div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                        {/* Left column: progress */}
                        <div className="lg:col-span-5 flex items-center gap-4 lg:border-r border-zinc-200/10 dark:border-zinc-800 pr-0 lg:pr-6">
                          <div className="relative shrink-0">
                            <div className="w-16 h-16 rounded-full border border-emerald-500/40 overflow-hidden shadow-lg bg-zinc-850">
                              {editAvatarUrl ? (
                                <img src={editAvatarUrl} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-900 font-extrabold text-base">?</div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-zinc-950 text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-900 shadow">
                              {pct}%
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h4 className={cn("text-xs font-black uppercase tracking-wider", isDarkMode ? "text-zinc-200" : "text-zinc-800")}>
                              {setupName || "Seeker Identity Progression"}
                            </h4>
                            <p className="text-[9.5px] font-bold text-zinc-400 block uppercase tracking-wide">
                              {pct < 100 ? "Enhance profile to maximize compatibility ratings" : "Aesthetic profile perfected!"}
                            </p>
                            
                            {/* Visual Bar */}
                            <div className="w-40 sm:w-48 h-2 bg-zinc-200/20 dark:bg-zinc-900 rounded-full overflow-hidden mt-1 relative border border-zinc-800/10">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right column: Action Check Items */}
                        <div className="lg:col-span-7 space-y-2">
                          <h5 className="text-[9px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-450">
                            Dynamic Profile Completion Checklist
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                            {/* Photo check */}
                            <div className={cn(
                              "flex items-center justify-between p-2 rounded-xl border transition-all",
                              editUserPhotos.filter(p => !!p).length > 0
                                ? isDarkMode ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-250 text-emerald-800"
                                : isDarkMode ? "bg-zinc-900/40 border-zinc-800 text-zinc-450" : "bg-zinc-100 border-zinc-205 text-zinc-550"
                            )}>
                              <span className="font-bold flex items-center gap-1.5">📷 Add Portrait Album</span>
                              <span className="font-black">{editUserPhotos.filter(p => !!p).length > 0 ? "✓ Done" : "+15%"}</span>
                            </div>

                            {/* Philosophy Biography check */}
                            <div className={cn(
                              "flex items-center justify-between p-2 rounded-xl border transition-all",
                              setupBiography.trim().length > 10
                                ? isDarkMode ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-250 text-emerald-800"
                                : isDarkMode ? "bg-zinc-900/40 border-zinc-800 text-zinc-450" : "bg-zinc-105 border-zinc-205 text-zinc-550"
                            )}>
                              <span className="font-bold flex items-center gap-1.5">📜 About Me Biography</span>
                              <span className="font-black">{setupBiography.trim().length > 10 ? "✓ Done" : "+15%"}</span>
                            </div>

                            {/* Career details */}
                            <div className={cn(
                              "flex items-center justify-between p-2 rounded-xl border transition-all",
                              (editJobTitle.trim() && editSchool.trim())
                                ? isDarkMode ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-250 text-emerald-805"
                                : isDarkMode ? "bg-zinc-900/40 border-zinc-800 text-zinc-450" : "bg-zinc-105 border-zinc-205 text-zinc-550"
                            )}>
                              <span className="font-bold flex items-center gap-1.5">💼 Career & Academy</span>
                              <span className="font-black">{(editJobTitle.trim() && editSchool.trim()) ? "✓ Done" : "+10%"}</span>
                            </div>

                            {/* Habit details */}
                            <div className={cn(
                              "flex items-center justify-between p-2 rounded-xl border transition-all",
                              (editDrinking.trim() && editSmoking.trim())
                                ? isDarkMode ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-250 text-emerald-805"
                                : isDarkMode ? "bg-zinc-900/40 border-zinc-800 text-zinc-450" : "bg-zinc-105 border-zinc-205 text-zinc-550"
                            )}>
                              <span className="font-bold flex items-center gap-1.5">🍷 Lifestyle Profile Chips</span>
                              <span className="font-black">{(editDrinking.trim() && editSmoking.trim()) ? "✓ Done" : "+10%"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Form column */}
                <div className="md:col-span-2 space-y-6">
                  <div className={cn(
                    "p-6 rounded-3xl border space-y-6 animate-fadeIn shadow-lg",
                    isDarkMode ? "bg-zinc-900 border-zinc-700/80 shadow-black/20" : "bg-zinc-50 border-zinc-300 shadow-zinc-150"
                  )}>
                    {/* Presets Block */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Preset Academic Covers</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {PRESET_COVERS.map(cover => (
                          <button
                            key={cover.name}
                            type="button"
                            onClick={() => setEditCoverUrl(cover.url)}
                            className={cn(
                              "relative h-14 rounded-xl overflow-hidden border transition-all text-left group",
                              editCoverUrl === cover.url ? "border-emerald-500 ring-1 ring-emerald-500" : "border-zinc-800 hover:border-zinc-700/50"
                            )}
                          >
                            <img src={cover.url} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent flex items-end p-1">
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shadow-sm border block w-full text-center truncate",
                                cover.name === "Slate Wisdom" && "bg-slate-900/95 text-slate-350 border-slate-700/50",
                                cover.name === "Classical Ruins" && "bg-amber-950/95 text-amber-300 border-amber-900/40",
                                cover.name === "Forest Sanctuary" && "bg-emerald-950/95 text-emerald-350 border-emerald-800/40",
                                cover.name === "Infinite Cosmos" && "bg-purple-950/95 text-purple-300 border-purple-800/40"
                              )}>
                                {cover.name}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {/* Manual input URL */}
                      <input
                        type="text"
                        value={editCoverUrl}
                        onChange={(e) => setEditCoverUrl(e.target.value)}
                        placeholder="Or input custom cover Image URL..."
                        className={cn(
                          "w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 transition-all",
                          isDarkMode ? "bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-500" : "bg-white border-zinc-350 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-50"
                        )}
                      />
                    </div>

                    {/* Presets Profile Avatars */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-350">Preset Seeker Avatars</h4>
                      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                        {PRESET_AVATARS.map(avatar => (
                          <button
                            key={avatar.name}
                            type="button"
                            onClick={() => setEditAvatarUrl(avatar.url)}
                            className={cn(
                              "relative w-12 h-12 rounded-full overflow-hidden border shrink-0 transition-all shadow-sm",
                              editAvatarUrl === avatar.url ? "border-emerald-500 ring-4 ring-emerald-500/20 scale-95" : "border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
                            )}
                          >
                            <img src={avatar.url} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder="Or input custom profile Avatar URL..."
                        className={cn(
                          "w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 transition-all",
                          isDarkMode ? "bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-500" : "bg-white border-zinc-350 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-50"
                        )}
                      />
                    </div>

                    {/* Display Name and Academic Title */}
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-350">Display Name / Pseudonym</h4>
                      <input
                        type="text"
                        value={setupName}
                        onChange={(e) => setSetupName(e.target.value)}
                        placeholder="Your physical name or chosen seeker title..."
                        className={cn(
                          "w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 transition-all",
                          isDarkMode ? "bg-zinc-955 border-zinc-700 text-zinc-100 placeholder-zinc-500" : "bg-white border-zinc-350 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-50"
                        )}
                      />
                    </div>

                    {/* Biography Description */}
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-350">Philosophy biography</h4>
                      <textarea
                        value={setupBiography}
                        onChange={(e) => setSetupBiography(e.target.value)}
                        rows={3}
                        placeholder="Introduce your intellectual aspirations and recovery priorities..."
                        className={cn(
                          "w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 resize-none transition-all",
                          isDarkMode ? "bg-zinc-955 border-zinc-700 text-zinc-100 placeholder-zinc-500 animate-fadeIn" : "bg-white border-zinc-350 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-50"
                        )}
                      />
                    </div>

                    {/* Dating compatibility specific metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Location */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-350">Metropolitan Location</label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          placeholder="e.g. Zagreb, Croatia"
                          className={cn(
                            "w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 transition-all",
                            isDarkMode ? "bg-zinc-955 border-zinc-700 text-zinc-100 placeholder-zinc-500" : "bg-white border-zinc-350 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-50"
                          )}
                        />
                      </div>

                      {/* Stature */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-350">Stature height (cm)</label>
                        <input
                          type="number"
                          value={editHeight}
                          onChange={(e) => setEditHeight(e.target.value)}
                          placeholder="e.g. 180"
                          className={cn(
                            "w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 transition-all",
                            isDarkMode ? "bg-zinc-955 border-zinc-700 text-zinc-100 placeholder-zinc-500" : "bg-white border-zinc-350 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-50"
                          )}
                        />
                      </div>

                      {/* Training Focus */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-350">Workout & Recovery Focus</label>
                        <select
                          value={editFitnessStyle}
                          onChange={(e) => setEditFitnessStyle(e.target.value)}
                          className={cn(
                            "w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-all",
                            isDarkMode ? "bg-zinc-955 border-zinc-700 text-emerald-450" : "bg-white border-zinc-350 text-emerald-800 shadow-sm"
                          )}
                        >
                          <option value="Heavy Calisthenics">Heavy Calisthenics</option>
                          <option value="Tranquil Vinyasa Flow">Tranquil Vinyasa Flow</option>
                          <option value="Biological Recovery Optimization">Biological Recovery Optimization</option>
                          <option value="VO2 Max / Running">VO2 Max / Running</option>
                          <option value="Strength Powerlifting">Strength Powerlifting</option>
                        </select>
                      </div>

                      {/* Morning energy */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Chronotype Chronology</label>
                        <select
                          value={editMorningEnergy}
                          onChange={(e) => setEditMorningEnergy(e.target.value)}
                          className={cn(
                            "w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-all",
                            isDarkMode ? "bg-zinc-955 border-zinc-700 text-emerald-450" : "bg-white border-zinc-350 text-emerald-800 shadow-sm"
                          )}
                        >
                          <option value="Sharp morning riser">Sharp morning riser (Oura optimized)</option>
                          <option value="Midnight scholar">Midnight scholar (Midnight reading rituals)</option>
                          <option value="Balanced daily rhythm">Balanced equanimity (Flexible daily rhythm)</option>
                        </select>
                      </div>
                    </div>

                    {/* Integrated Save Button for Personality / Location */}
                    <div className="flex justify-between items-center bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/10 mt-3 animate-fadeIn">
                      <div className="space-y-0.5">
                        <h5 className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Save Personality Coordinates</h5>
                        <p className="text-[9px] text-zinc-400">Lock your metropolitan location & physical metrics instantly.</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await handleSaveBiographyAndDating();
                            if (currentUser) {
                              const userRef = doc(db, 'users', currentUser.uid);
                              await setDoc(userRef, {
                                location: editLocation,
                                height: Number(editHeight) || 180,
                                fitnessStyle: editFitnessStyle,
                                morningEnergy: editMorningEnergy
                              }, { merge: true });
                            }
                            alert('Personality coordinates and metropolitan location saved successfully!');
                          } catch (err: any) {
                            console.error('Error saving personality coordinates:', err);
                            alert('Error: ' + err.message);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Data</span>
                      </button>
                    </div>

                    {/* Relationship/Alignment Intent (Tinder style visual cards) */}
                    <div className="space-y-3 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-350">What are you looking for?</h4>
                      </div>
                      <p className="text-[10px] text-zinc-400">All good if it changes. There is a sanctuary category for everyone.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "Long-term partnership", title: "Scholarly Soulmate", desc: "Long-term commitment seeking deep intellectual and life coordination." },
                          { value: "Deep philosophical connection", title: "Hermitage Dialogues", desc: "Open to long-term depth, or meaningful regular exchanges of substance." },
                          { value: "Intellectual calisthenic dyads", title: "Resonant Sovereigns", desc: "Short-term intensity with openness to lifelong companionship." },
                          { value: "Mindful companionship", title: "Quiet Sanctuary Friends", desc: "Peaceful friendship, workout partners, or debating peers." }
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setEditRelationshipIntent(opt.value)}
                            className={cn(
                              "p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-95 cursor-pointer relative overflow-hidden",
                              editRelationshipIntent === opt.value
                                ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                                : isDarkMode 
                                  ? "bg-zinc-900/30 border-zinc-805 hover:border-zinc-700 text-zinc-300"
                                  : "bg-white border-zinc-250 hover:border-zinc-350 text-zinc-700 shadow-sm"
                            )}
                          >
                            <h5 className="font-bold text-xs text-emerald-400 uppercase tracking-wide flex items-center justify-between">
                              {opt.title}
                              {editRelationshipIntent === opt.value && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              )}
                            </h5>
                            <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-snug font-medium">
                              {opt.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary Academic and Career Context Coordinates */}
                    <div className="space-y-4 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-450 dark:text-emerald-400">Scholastic & Professional Coordinates</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">Declare your academic and societal career credentials to clarify compatibility.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-350 flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-zinc-500" /> Job Title
                          </label>
                          <input
                            type="text"
                            value={editJobTitle}
                            onChange={(e) => setEditJobTitle(e.target.value)}
                            placeholder="e.g. Chief Strategist, Biologist"
                            className={cn(
                              "w-full px-3 py-2 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 transition-all",
                              isDarkMode ? "bg-zinc-955 border-zinc-700 text-zinc-100 placeholder-zinc-500" : "bg-white border-zinc-350 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-50"
                            )}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-350 flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-zinc-500" /> Organization / Company
                          </label>
                          <input
                            type="text"
                            value={editCompany}
                            onChange={(e) => setEditCompany(e.target.value)}
                            placeholder="e.g. Bio-S Sanctuary, Ministry"
                            className={cn(
                              "w-full px-3 py-2 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 transition-all",
                              isDarkMode ? "bg-zinc-955 border-zinc-700 text-zinc-100 placeholder-zinc-500" : "bg-white border-zinc-350 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-50"
                            )}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-350 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-zinc-500" /> Institute / School
                          </label>
                          <input
                            type="text"
                            value={editSchool}
                            onChange={(e) => setEditSchool(e.target.value)}
                            placeholder="e.g. University of Zagreb"
                            className={cn(
                              "w-full px-3 py-2 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 transition-all",
                              isDarkMode ? "bg-zinc-955 border-zinc-700 text-zinc-100 placeholder-zinc-500" : "bg-white border-zinc-350 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-50"
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Intellectual Anthem / Custom Maxim Quote */}
                    <div className="space-y-1.5 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4">
                      <div className="flex items-center gap-1.5">
                        <Music className="w-4 h-4 text-emerald-400" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-455 dark:text-zinc-350">My Intellectual Anthem / Core Maxim</label>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Select a classical maxim or customize a personal quote that sounds from your soul.</p>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editAnthem}
                          onChange={(e) => setEditAnthem(e.target.value)}
                          placeholder="e.g. 'Amor Fati' - Marcus Aurelius, or a custom philosophical maxim..."
                          className={cn(
                            "flex-1 px-3.5 py-2.5 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 transition-all",
                            isDarkMode ? "bg-zinc-955 border-zinc-700 text-zinc-100 placeholder-zinc-500" : "bg-white border-zinc-350 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-50"
                          )}
                        />
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              setEditAnthem(e.target.value);
                            }
                          }}
                          className={cn(
                            "px-2 py-2 text-xs rounded-xl border outline-none font-bold focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-all shrink-0 max-w-[150px]",
                            isDarkMode ? "bg-zinc-955 border-zinc-700 text-emerald-405" : "bg-white border-zinc-350 text-emerald-800"
                          )}
                          defaultValue=""
                        >
                          <option value="" disabled>-- Presets --</option>
                          <option value="'Amor Fati' (Love of Fate) - Stoic Maxim">'Amor Fati' (Stoic)</option>
                          <option value="'Memento Mori' (Remember death) - Classical Maxim">'Memento Mori' (Classical)</option>
                          <option value="'Know Thyself' - Temple of Apollo, Delphi">'Know Thyself' (Delphi)</option>
                          <option value="'The unexamined life is not worth living' - Socrates">Unexamined Life (Socrates)</option>
                          <option value="'Silence is the sanctuary of wisdom' - Tesla">Silence (Tesla)</option>
                          <option value="'The first recipe for happiness is: avoid too lengthy meditation' - Krleža">Happy (Krleža)</option>
                        </select>
                      </div>
                    </div>

                    {/* Lifestyle habits (Tinder style chips) */}
                    <div className="space-y-5 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-5">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-450 dark:text-emerald-400">Let's Talk Lifestyle Habits</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">Do your daily regimes and biological habits match? Declare yours below.</p>
                      </div>
                      
                      {renderChoiceChips(
                        "How often do you consume alcohol?",
                        <Coffee className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />,
                        ["Not for me", "Newly teetotal", "Sober curious", "On special occasions", "Socially at weekends", "Most nights"],
                        editDrinking,
                        setEditDrinking
                      )}

                      {renderChoiceChips(
                        "What is your relationship to smoking?",
                        <Sparkles className="w-3.5 h-3.5 text-zinc-400" />,
                        ["Non-smoker", "Social smoker", "Smoker when drinking", "Trying to quit", "Active smoker"],
                        editSmoking,
                        setEditSmoking
                      )}

                      {renderChoiceChips(
                        "Animal Companions",
                        <Users className="w-3.5 h-3.5 text-zinc-400" />,
                        ["Dog", "Cat", "Reptile", "Amphibian", "Bird", "No pets, but love them", "None"],
                        editPets,
                        setEditPets
                      )}
                    </div>

                    {/* More about me (Tinder style chips) */}
                    <div className="space-y-5 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-5">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-450 dark:text-emerald-400">More About Core Philosophy</h3>
                        <p className="text-[10px] text-zinc-400 mt-1">Further specify your cosmic, scholastic, and relational alignment parameters.</p>
                      </div>

                      {renderChoiceChips(
                        "Zodiac Alignment",
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />,
                        ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
                        editZodiac,
                        setEditZodiac
                      )}

                      {renderChoiceChips(
                        "Achieved Scholastic Degree",
                        <GraduationCap className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />,
                        ["Secondary school", "Bachelor's degree", "Master's scholar", "PhD / Doctorate", "Self-educated polymath"],
                        editEducation,
                        setEditEducation
                      )}

                      {renderChoiceChips(
                        "Philosophical Family Intention",
                        <Users className="w-3.5 h-3.5 text-zinc-400" />,
                        ["Want kids", "Don't want kids", "Open to kids", "Undecided / Not sure"],
                        editFamilyPlans,
                        setEditFamilyPlans
                      )}

                      {renderChoiceChips(
                        "Preferred Dialogue Medium",
                        <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />,
                        ["Deep texts always", "In-person dialogue", "Voice notes scholar", "Quick check-ins", "Silence is golden"],
                        editCommunicationStyle,
                        setEditCommunicationStyle
                      )}

                      {renderChoiceChips(
                        "Relational Love Theme",
                        <Heart className="w-3.5 h-3.5 text-zinc-400" />,
                        ["Intellectual debates", "Quality time", "Acts of support", "Words of wisdom", "Co-presence sync"],
                        editLoveStyle,
                        setEditLoveStyle
                      )}
                    </div>

                    {/* Tinder-style Expandable "Ask me about" Prompts / Dialogues */}
                    <div className="space-y-4 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4 animate-fadeIn">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-450 dark:text-emerald-400">Ask Me About... (Scholarly Prompts)</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">Configure conversational parameters other seekers can ask you about. Click to expand and configure your answers.</p>
                      </div>

                      <div className="space-y-3">
                        {[
                          { 
                            id: "going_out" as const, 
                            title: "Going Out", 
                            description: "Select pre-selected common options representing your social & intellectual excursions.",
                            icon: <Compass className="w-4 h-4 text-emerald-400" />, 
                            value: editAskGoingOut,
                            setValue: setEditAskGoingOut,
                            options: [
                              "Debating Classical Rome under Croatian starlight with fine local wine",
                              "Quiet coffee shop sessions reading Krleža and discussing bio-metrics",
                              "A long nighttime walk down Zagreb routes to clear the mind",
                              "Fringe theatrical play followed by rigorous intellectual deconstruction",
                              "Heavy calisthenics by the Sava river followed by warm organic tea",
                              "A classical concert to synchronize heart-rate-variability"
                            ],
                            hasCustomInput: true,
                            placeholder: "Specify custom outings or preferences..."
                          },
                          { 
                            id: "weekends" as const, 
                            title: "My Weekends", 
                            description: "Select from common academic weekend activities and/or type your own custom schedule.",
                            icon: <Calendar className="w-4 h-4 text-emerald-400" />, 
                            value: editAskMyWeekends,
                            setValue: setEditAskMyWeekends,
                            options: [
                              "6am yoga ritual followed by zero screens until sunset",
                              "Deep focus work, fast runs, and cold showers",
                              "Sifting through ancient libraries and local open-air markets",
                              "Croatian mountain hikes and deep metabolic recovery focus",
                              "Intense dyads discussions and collaborative goal setting"
                            ],
                            hasCustomInput: true,
                            placeholder: "Summarize your custom weekend routine e.g. reading, weight training..."
                          },
                          { 
                            id: "phone" as const, 
                            title: "Me + My Phone", 
                            description: "Declare how you manage attention and biological connectivity relative to modern devices.",
                            icon: <MessageSquare className="w-4 h-4 text-emerald-400" />, 
                            value: editAskMePhone,
                            setValue: setEditAskMePhone,
                            options: [
                              "Strict focus mode on; checking daily HRV stats before speaking to civilization",
                              "Only used for classical audio streams and bio-metrics sensor syncing",
                              "All notifications permanently muted, except for severe bio-recovery alerts",
                              "Analog notebook companion. The screen is a secondary tool",
                              "No social feeds. Fully offline and present"
                            ],
                            hasCustomInput: true,
                            placeholder: "Type custom digital hygiene parameters..."
                          }
                        ].map((quiz) => {
                          const isExpanded = activePromptBuilder === quiz.id;
                          const hasValue = !!quiz.value;
                          
                          return (
                            <div 
                              key={quiz.id}
                              className={cn(
                                "rounded-2xl border transition-all duration-300 overflow-hidden",
                                isExpanded 
                                  ? "bg-zinc-955 dark:bg-zinc-950/40 border-emerald-500/40 shadow-md" 
                                  : isDarkMode 
                                    ? "bg-zinc-950/60 border-zinc-850 hover:border-zinc-800"
                                    : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
                              )}
                            >
                              {/* Header trigger */}
                              <button
                                type="button"
                                onClick={() => setActivePromptBuilder(isExpanded ? null : quiz.id)}
                                className="w-full p-4 text-left flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-emerald-500/10 rounded-xl animate-pulse">
                                    {quiz.icon}
                                  </div>
                                  <div className="space-y-0.5">
                                    <h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-200">{quiz.title}</h5>
                                    <p className="text-[10px] text-zinc-400 line-clamp-1 leading-normal">
                                      {quiz.value || "Not established. Click to configure."}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1.5 shrink-0 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 hover:bg-emerald-500/15">
                                  {isExpanded ? "Close" : hasValue ? "Configure ✓" : "Configure"} <Plus className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-45 text-zinc-400")} />
                                </span>
                              </button>

                              {/* Expanded Panel Details */}
                              {isExpanded && (
                                <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-zinc-800/10 dark:border-zinc-850/60 animate-fadeIn">
                                  <p className="text-[10px] text-zinc-400 leading-normal font-medium">
                                    {quiz.description}
                                  </p>

                                  {/* Presets Grid */}
                                  <div className="space-y-1.5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Pre-selected options</span>
                                    <div className="flex flex-wrap gap-2 pt-0.5">
                                      {quiz.options.map((opt) => {
                                        const isSelected = quiz.value.includes(opt);
                                        return (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={() => {
                                              if (isSelected) {
                                                // Remove choice
                                                const cleaned = quiz.value
                                                  .replace(opt, "")
                                                  .replace(/^[ ·\n]+|[ ·\n]+$/g, "")
                                                  .replace(/ ·  · /g, " · ")
                                                  .trim();
                                                quiz.setValue(cleaned);
                                              } else {
                                                // Append choice
                                                if (quiz.value) {
                                                  quiz.setValue(`${quiz.value} · ${opt}`);
                                                } else {
                                                  quiz.setValue(opt);
                                                }
                                              }
                                            }}
                                            className={cn(
                                              "px-3 py-1.5 text-[9.5px] font-bold rounded-xl border text-left cursor-pointer transition-all active:scale-95 leading-normal max-w-full",
                                              isSelected
                                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-extrabold"
                                                : isDarkMode
                                                  ? "bg-zinc-900 border-zinc-800 hover:border-zinc-750 text-zinc-400"
                                                  : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-650 shadow-sm"
                                            )}
                                          >
                                            {isSelected ? "✓ " : "+ "} {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Custom Data Input field for weekends / phone */}
                                  {quiz.hasCustomInput && (
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Custom Input Data Field</label>
                                      <textarea
                                        value={quiz.value}
                                        onChange={(e) => quiz.setValue(e.target.value)}
                                        placeholder={quiz.placeholder}
                                        rows={2}
                                        className={cn(
                                          "w-full px-3 py-2 text-xs rounded-xl border outline-none font-semibold resize-none transition-all",
                                          isDarkMode 
                                            ? "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500" 
                                            : "bg-white border-zinc-250 text-zinc-900 placeholder-zinc-400 focus:bg-zinc-50"
                                        )}
                                      />
                                    </div>
                                  )}

                                  {/* Quick Actions */}
                                  {quiz.value && (
                                    <div className="flex justify-end pt-1">
                                      <button
                                        type="button"
                                        onClick={() => quiz.setValue("")}
                                        className="text-[9px] text-rose-450 hover:underline font-bold uppercase tracking-wider cursor-pointer"
                                      >
                                        Clear parameters
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Academic Favorites (Philosophers & Psychologists) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4">
                      {/* Favorite Philosophers */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-bold">Favorite Philosophers</label>
                        <input
                          type="text"
                          value={editFavoritePhilosophers}
                          onChange={(e) => setEditFavoritePhilosophers(e.target.value)}
                          placeholder="e.g. Seneca, Marcus Aurelius, Nietzsche"
                          className={cn(
                            "w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-medium focus:ring-1 focus:ring-emerald-500",
                            isDarkMode ? "bg-zinc-955 border-zinc-800 text-white placeholder-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                          )}
                        />
                      </div>

                      {/* Favorite Psychologists */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-bold">Favorite Psychologists</label>
                        <input
                          type="text"
                          value={editFavoritePsychologists}
                          onChange={(e) => setEditFavoritePsychologists(e.target.value)}
                          placeholder="e.g. Carl Jung, Viktor Frankl, William James"
                          className={cn(
                            "w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-medium focus:ring-1 focus:ring-emerald-500",
                            isDarkMode ? "bg-zinc-955 border-zinc-805 text-white placeholder-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                          )}
                        />
                      </div>
                    </div>

                    {/* Intellectual Interests checklists checklist */}
                    <div className="space-y-3 pt-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Intellectual Core Axes</label>
                      <div className="flex flex-wrap gap-2">
                        {["Stoicism", "Neuroscience", "Classical Rome", "Slavic Poetry", "Calisthenics", "Biophysics", "Quantum Philosophy", "Cognitive Therapy", "Jewish Wisdom", "Chinese Wisdom", "Balkan Wisdom"].map(item => {
                          const active = editInterests.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (active) {
                                  setEditInterests(editInterests.filter(i => i !== item));
                                } else {
                                  setEditInterests([...editInterests, item]);
                                }
                              }}
                              className={cn(
                                "px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border",
                                active
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-extrabold"
                                  : isDarkMode 
                                    ? "bg-zinc-955 border-zinc-800 text-zinc-400 hover:border-zinc-700" 
                                    : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-400"
                              )}
                            >
                              {active && <Check className="w-2.5 h-2.5 inline mr-1.5 text-emerald-400" />}
                              {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Integrate Specialized Wisdom School click-to-add chips */}
                    <div className="space-y-2 mt-3 pt-2 border-t border-zinc-800/10 dark:border-zinc-800/30 animate-fadeIn">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Integrate Specialized Wisdom School</label>
                      <p className="text-[10px] text-zinc-400">Click any specialized philosophy below to instantly one-add it to your Intellectual Core Axes:</p>
                      
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[
                          "Ancient Greek Philosophy",
                          "Japanese Zen Buddhism",
                          "Vedic Non-Duality",
                          "Islamic Sufi Mysticism",
                          "Existential Phenomenology",
                          "Renaissance Hermeticism",
                          "Taoist Classical Wisdom",
                          "Balkan Gnosticism",
                          "Analytical Jungianism",
                          "Frankl Logotherapy",
                          "Socratic Virtues",
                          "Spinozistic Pantheism",
                          "Schopenhauerian Will",
                          "Kantian Moral Duty",
                          "Nietzschean Overman",
                          "Marcus Aurelius Meditations",
                          "Balkan Scholasticism",
                          "Eudaimonism",
                          "Dialectical Idealism",
                          "Aesthetic Existentialism"
                        ].map(wisdom => {
                          const active = editInterests.includes(wisdom);
                          return (
                            <button
                              key={wisdom}
                              type="button"
                              onClick={() => {
                                if (active) {
                                  setEditInterests(editInterests.filter(i => i !== wisdom));
                                } else {
                                  setEditInterests([...editInterests, wisdom]);
                                }
                              }}
                              className={cn(
                                "px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95 group",
                                active
                                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-extrabold"
                                  : isDarkMode
                                    ? "bg-zinc-950/40 border-zinc-850 hover:border-zinc-800 text-zinc-400"
                                    : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-650 shadow-sm"
                              )}
                            >
                              {active ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Plus className="w-3 h-3 text-zinc-500 group-hover:text-emerald-400" />
                              )}
                              {wisdom}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[9px] text-zinc-500 font-medium">Adds supplementary wisdom pathways directly into your live profile card.</p>
                    </div>
                    </div>

                    {/* Seeker Custom Photo Album Section */}
                    <div className="space-y-4 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-4">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Your Photo Album (Dating Compatibility)</h4>
                        <p className="text-[10px] text-zinc-400 mt-1">Add up to 4 photos of yourself to establish an authentic visual connection for other seekers.</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[0, 1, 2, 3].map((index) => {
                          const currentUrl = editUserPhotos[index] || '';
                          return (
                            <div 
                              key={index} 
                              className={cn(
                                "aspect-[3/4] rounded-2xl border overflow-hidden relative group flex flex-col justify-between p-2.5",
                                isDarkMode ? "bg-zinc-950/80 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                              )}
                            >
                              {uploadingSlots[index] ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-2 text-center py-4 relative z-10 w-full">
                                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest leading-none">
                                    Uploading
                                  </span>
                                  <span className="text-[11px] font-mono font-bold text-zinc-400">
                                    {uploadProgressSlots[index] || 0}%
                                  </span>
                                </div>
                              ) : currentUrl ? (
                                <>
                                  <img 
                                    src={currentUrl} 
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    alt={`Seeker Photo ${index + 1}`}
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...editUserPhotos];
                                      updated[index] = '';
                                      setEditUserPhotos(updated);
                                    }}
                                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-500/80 rounded-lg text-white transition-colors z-10 cursor-pointer"
                                    title="Remove Photo"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <span className="relative z-10 text-[9px] font-black text-white/60 tracking-wider">PHOTO {index + 1}</span>
                                  
                                  {/* Custom Visibility Toggle overlay button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...editUserPhotosVisibility];
                                      while (updated.length <= index) {
                                        updated.push('friends');
                                      }
                                      updated[index] = (updated[index] || 'friends') === 'public' ? 'friends' : 'public';
                                      setEditUserPhotosVisibility(updated);
                                    }}
                                    className={cn(
                                      "absolute bottom-2.5 left-2.5 z-10 px-2 py-1 text-[8px] font-black uppercase rounded-lg border flex items-center justify-center gap-1 cursor-pointer transition-all duration-200 select-none shadow backdrop-blur-md",
                                      (editUserPhotosVisibility[index] || 'friends') === 'public'
                                        ? "bg-emerald-500 text-zinc-950 border-emerald-400 hover:bg-emerald-450"
                                        : "bg-zinc-950/85 text-zinc-350 border-zinc-700 hover:bg-zinc-800"
                                    )}
                                    title="Toggle visibility status"
                                  >
                                    {(editUserPhotosVisibility[index] || 'friends') === 'public' ? (
                                      <>
                                        <Globe className="w-2.5 h-2.5 text-zinc-950" />
                                        <span>Public</span>
                                      </>
                                    ) : (
                                      <>
                                        <Lock className="w-2.5 h-2.5" />
                                        <span>Friends</span>
                                      </>
                                    )}
                                  </button>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full space-y-2 text-center py-3 w-full">
                                  <Plus className="w-4 h-4 text-zinc-500" />
                                  <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider">Empty Slot</span>
                                  <div className="flex flex-col gap-1.5 w-full px-1">
                                    {/* Upload Button */}
                                    <label className="text-[8.5px] px-2.5 py-1.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-extrabold uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1">
                                      <Upload className="w-3 h-3" />
                                      Upload
                                      <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handleUploadPhoto(index, file);
                                          }
                                        }}
                                      />
                                    </label>
                                    {/* Use Preset Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const presets = [
                                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
                                          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400",
                                          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
                                          "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400"
                                        ];
                                        const updated = [...editUserPhotos];
                                        updated[index] = presets[index % presets.length];
                                        setEditUserPhotos(updated);
                                      }}
                                      className="text-[7.5px] px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase rounded-lg hover:bg-emerald-500/20 transition-all cursor-pointer"
                                    >
                                      Use Preset
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Inputs for manual URLs */}
                      <div className="space-y-2">
                        {[0, 1, 2, 3].map((index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <span className="w-14 shrink-0 text-[10px] font-bold text-zinc-500 hover:text-emerald-450 transition-colors lowercase">Photo {index + 1}:</span>
                            <input
                              type="text"
                              value={editUserPhotos[index] || ''}
                              onChange={(e) => {
                                const updated = [...editUserPhotos];
                                updated[index] = e.target.value;
                                setEditUserPhotos(updated);
                              }}
                              placeholder="Paste any portrait Unsplash or direct image URL..."
                              className={cn(
                                "flex-1 px-3 py-2 text-xs rounded-xl border outline-none font-medium focus:ring-1 focus:ring-emerald-500",
                                isDarkMode ? "bg-zinc-955 border-zinc-800 text-white placeholder-zinc-500" : "bg-zinc-50 border-zinc-200 text-zinc-900"
                              )}
                            />
                            {editUserPhotos[index] && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...editUserPhotosVisibility];
                                  while (updated.length <= index) {
                                    updated.push('friends');
                                  }
                                  updated[index] = (updated[index] || 'friends') === 'public' ? 'friends' : 'public';
                                  setEditUserPhotosVisibility(updated);
                                }}
                                className={cn(
                                  "px-2.5 py-2 text-[9px] font-black uppercase rounded-xl border flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap select-none",
                                  (editUserPhotosVisibility[index] || 'friends') === 'public'
                                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                                    : "bg-zinc-500/5 border-zinc-850 text-zinc-400 font-bold"
                                )}
                                title="Click to toggle Public / Friends Only"
                              >
                                {(editUserPhotosVisibility[index] || 'friends') === 'public' ? (
                                  <>
                                    <Globe className="w-3 h-3 text-emerald-400" />
                                    <span>Public</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3 text-zinc-500" />
                                    <span>Friends Only</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={handleSaveBiographyAndDating}
                      className="w-full py-3 bg-emerald-500 text-zinc-950 font-black italic uppercase tracking-tighter text-xs rounded-2xl active:scale-95 transition-transform shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-1.5 shadow-teal-500/5 cursor-pointer"
                    >
                      Lock Seeker Compatibility Biography <Check className="w-4 h-4" />
                    </button>
                    
                  </div>
                </div>

                {/* Right Preview column */}
                <div className="space-y-6">
                  <div className={cn(
                    "p-6 rounded-3xl border space-y-4 text-xs relative overflow-hidden",
                    isDarkMode ? "bg-zinc-900/30 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                  )}>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Card Render</h4>
                    
                    {/* Render active mock card corresponding to the biography edits */}
                    <div className={cn(
                      "rounded-3xl border overflow-hidden relative flex flex-col justify-between gap-4 transition-all duration-300 min-h-[350px]",
                      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-lg shadow-zinc-200/10"
                    )}>
                      {/* Cover Photo banner */}
                      <div className="h-20 w-full relative bg-zinc-800 overflow-hidden shrink-0">
                        {editCoverUrl ? (
                          <img src={editCoverUrl} className="w-full h-full object-cover opacity-75" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                      </div>

                      {/* Body section overlapping cover */}
                      <div className="px-5 pb-5 -mt-10 relative flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                          
                          {/* Avatar Offset */}
                          <div className="relative w-14 h-14 rounded-full border-2 border-zinc-900 overflow-hidden bg-zinc-800 shadow-lg shrink-0">
                            {editAvatarUrl ? (
                              <img src={editAvatarUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400"><User className="w-6 h-6" /></div>
                            )}
                          </div>

                          {/* Profile Details */}
                          <div>
                            <h4 className={cn("font-black capitalize text-sm tracking-tight flex items-center gap-1.5", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>
                              {setupName || "Anonymous Seeker"}
                            </h4>
                            {(editJobTitle || editCompany || editSchool) && (
                              <div className="text-[10px] text-zinc-500 font-semibold flex flex-wrap items-center gap-1 mt-0.5">
                                {editJobTitle && <span className="flex items-center gap-0.5">💼 {editJobTitle}</span>}
                                {editCompany && <span>at {editCompany}</span>}
                                {editSchool && <span className="flex items-center gap-0.5">• 🎓 {editSchool}</span>}
                              </div>
                            )}
                            <span className="text-[7.5px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-black uppercase tracking-widest border border-emerald-500/10 inline-block mt-1">
                              {thisPublicProfile?.mbti ? `${thisPublicProfile.mbti} · Archetype` : "Academically Verified Seeker"}
                            </span>
                          </div>

                          <p className={cn("text-[11px] leading-relaxed line-clamp-3 font-semibold", isDarkMode ? "text-zinc-400" : "text-zinc-650")}>
                            {setupBiography || "No biography established yet. Living silently in contemplation."}
                          </p>

                          {editAnthem && (
                            <div className="p-2 py-1.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 flex items-center gap-1.5 mt-1">
                              <Music className="w-3 h-3 text-emerald-400 shrink-0 animate-pulse" />
                              <div className="space-y-px overflow-hidden">
                                <span className="text-[7px] font-black uppercase tracking-wider text-emerald-500/60 block">Theme Maxim / Soul Anthem</span>
                                <span className="text-[10px] font-black italic line-clamp-1">{editAnthem}</span>
                              </div>
                            </div>
                          )}

                          {/* Chips Grid */}
                          <div className="flex flex-wrap gap-1 pb-1 pt-1">
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                              isDarkMode ? "bg-zinc-850 border-zinc-800 text-zinc-305" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                            )}>
                              📍 {editLocation || "Zagreb, Croatia"}
                            </span>
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                              isDarkMode ? "bg-zinc-850 border-zinc-800 text-zinc-305" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                            )}>
                              📐 {editHeight || "180"} cm
                            </span>
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                              isDarkMode ? "bg-zinc-850 border-zinc-800 text-zinc-350" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                            )}>
                              ❤️ {editRelationshipIntent}
                            </span>
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                              isDarkMode ? "bg-zinc-850 border-zinc-800 text-zinc-350" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                            )}>
                              ⚡ {editFitnessStyle}
                            </span>
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                              isDarkMode ? "bg-zinc-850 border-zinc-800 text-zinc-350" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                            )}>
                              🌅 {editMorningEnergy}
                            </span>
                            {editZodiac && (
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                                isDarkMode ? "bg-zinc-850 border-zinc-800 text-teal-400" : "bg-zinc-100 border-zinc-200 text-teal-850"
                              )}>
                                🪐 {editZodiac}
                              </span>
                            )}
                            {editEducation && (
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                                isDarkMode ? "bg-zinc-850 border-zinc-800 text-purple-400" : "bg-zinc-100 border-zinc-200 text-purple-850"
                              )}>
                                🎓 {editEducation}
                              </span>
                            )}
                            {editFamilyPlans && (
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                                isDarkMode ? "bg-zinc-850 border-zinc-800 text-pink-400" : "bg-zinc-100 border-zinc-200 text-pink-850"
                              )}>
                                👪 {editFamilyPlans}
                              </span>
                            )}
                            {editCommunicationStyle && (
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                                isDarkMode ? "bg-zinc-850 border-zinc-800 text-sky-400" : "bg-zinc-100 border-zinc-200 text-sky-850"
                              )}>
                                💬 {editCommunicationStyle}
                              </span>
                            )}
                            {editLoveStyle && (
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                                isDarkMode ? "bg-zinc-850 border-zinc-800 text-emerald-400" : "bg-zinc-100 border-zinc-200 text-emerald-850"
                              )}>
                                💞 {editLoveStyle}
                              </span>
                            )}
                            {editDrinking && (
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                                isDarkMode ? "bg-zinc-850 border-zinc-800 text-amber-400" : "bg-zinc-100 border-zinc-200 text-amber-750"
                              )}>
                                🍷 {editDrinking}
                              </span>
                            )}
                            {editSmoking && (
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                                isDarkMode ? "bg-zinc-850 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-650"
                              )}>
                                🚬 {editSmoking}
                              </span>
                            )}
                            {editPets && (
                              <span className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1",
                                isDarkMode ? "bg-zinc-850 border-zinc-800 text-blue-400" : "bg-zinc-100 border-zinc-200 text-blue-650"
                              )}>
                                🐾 {editPets}
                              </span>
                            )}
                          </div>

                          {/* Scholarly Favorites */}
                          {(editFavoritePhilosophers || editFavoritePsychologists) && (
                            <div className="space-y-1.5 pt-1.5 border-t border-zinc-800/10 dark:border-zinc-800/35">
                              {editFavoritePhilosophers && (
                                <div className="flex items-start gap-1">
                                  <span className="text-emerald-500 text-[10px]">📜</span>
                                  <span className="text-[9px] leading-tight">
                                    <strong className={isDarkMode ? "text-zinc-500" : "text-zinc-750"}>Philosophers:</strong> <span className={isDarkMode ? "text-zinc-300 font-semibold" : "text-zinc-650 font-semibold"}>{editFavoritePhilosophers}</span>
                                  </span>
                                </div>
                              )}
                              {editFavoritePsychologists && (
                                <div className="flex items-start gap-1">
                                  <span className="text-teal-400 text-[10px]">🧠</span>
                                  <span className="text-[9px] leading-tight">
                                    <strong className={isDarkMode ? "text-zinc-500" : "text-zinc-750"}>Psychologists:</strong> <span className={isDarkMode ? "text-zinc-300 font-semibold" : "text-zinc-650 font-semibold"}>{editFavoritePsychologists}</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Interests */}
                          {editInterests.length > 0 && (
                            <div className="space-y-1 pt-1.5 border-t border-zinc-800/10 dark:border-zinc-800/35">
                              <span className="text-[7.5px] font-black uppercase text-zinc-500 tracking-widest block">Intellectual Core</span>
                              <div className="flex flex-wrap gap-1">
                                {editInterests.map(i => (
                                  <span key={i} className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/10 text-emerald-400">{i}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Psychometrics block on Live Card Render */}
                          {thisPublicProfile?.bigFive ? (
                            <div className="space-y-1.5 pt-1.5 border-t border-zinc-800/10 dark:border-zinc-800/35">
                              <div className="flex justify-between items-center text-[7.5px] font-black uppercase tracking-widest text-zinc-500">
                                <span>Psychometric Spectrum</span>
                                <span className="text-emerald-400 font-mono font-black">{thisPublicProfile.mbti}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/10 text-sky-400">O: {thisPublicProfile.bigFive.openness}%</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/10 text-emerald-400">C: {thisPublicProfile.bigFive.conscientiousness}%</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/10 text-amber-500">E: {thisPublicProfile.bigFive.extraversion}%</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/10 text-pink-400">A: {thisPublicProfile.bigFive.agreeableness}%</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/10 text-purple-400">N: {thisPublicProfile.bigFive.neuroticism}%</span>
                              </div>
                              {thisPublicProfile.mmpiResilience !== undefined && (
                                <div className="flex items-center justify-between text-[7px] text-zinc-500 font-semibold uppercase leading-none pt-0.5">
                                  <span>Stability: <strong className="text-emerald-400 font-bold">{thisPublicProfile.mmpiResilience}%</strong></span>
                                  <span>Lie Factor: <strong className="text-teal-400 font-bold">{thisPublicProfile.mmpiTruthScore || 100}%</strong></span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1 pt-1.5 border-t border-zinc-800/10 dark:border-zinc-800/35 text-[7.5px] italic text-zinc-500">
                              Take "Academic Psychologist Assessment" in the Personality tab to populate psychometrics.
                            </div>
                          )}

                          {/* Live render for Scholar Dialogues prompts */}
                          {(editAskGoingOut || editAskMyWeekends || editAskMePhone) && (
                            <div className="space-y-2 pt-2 border-t border-zinc-805/10 dark:border-zinc-800/35 text-left">
                              <span className="text-[7.5px] font-black uppercase text-zinc-500 tracking-widest block leading-none">Scholar dialogues</span>
                              
                              {editAskGoingOut && (
                                <div className="p-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-left">
                                  <span className="text-[7.5px] font-black uppercase text-zinc-400 flex items-center gap-1 leading-none">
                                    <Compass className="w-2.5 h-2.5 text-emerald-400" /> Going Out
                                  </span>
                                  <span className="text-[9.5px] font-medium block italic text-zinc-800 dark:text-zinc-200 mt-1">"{editAskGoingOut}"</span>
                                </div>
                              )}

                              {editAskMyWeekends && (
                                <div className="p-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-left">
                                  <span className="text-[7.5px] font-black uppercase text-zinc-400 flex items-center gap-1 leading-none">
                                    <Calendar className="w-2.5 h-2.5 text-emerald-400" /> My Weekends
                                  </span>
                                  <span className="text-[9.5px] font-medium block italic text-zinc-800 dark:text-zinc-200 mt-1">"{editAskMyWeekends}"</span>
                                </div>
                              )}

                              {editAskMePhone && (
                                <div className="p-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-left">
                                  <span className="text-[7.5px] font-black uppercase text-zinc-400 flex items-center gap-1 leading-none">
                                    <MessageSquare className="w-2.5 h-2.5 text-emerald-400" /> Me + My Phone
                                  </span>
                                  <span className="text-[9.5px] font-medium block italic text-zinc-800 dark:text-zinc-200 mt-1">"{editAskMePhone}"</span>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Philosophical Match Evaluator */}
                  <div className={cn(
                    "p-6 rounded-3xl border space-y-4 animate-fadeIn relative overflow-hidden",
                    isDarkMode ? "bg-zinc-900/30 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                  )}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <Compass className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Academic Compatibility Simulator</h4>
                        <p className={cn("text-[9px] font-medium", isDarkMode ? "text-zinc-500" : "text-zinc-400")}>Evaluate intellectual & biological synchrony with standard peer archetypes</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Select Target Peer Archetype</label>
                        <select
                          value={selectedPartnerArchetype}
                          onChange={(e) => {
                            setSelectedPartnerArchetype(e.target.value);
                            // Run calculation automatically on select change
                            const archetype = e.target.value;
                            let score = 70;
                            let analysis = "";
                            
                            const userHasStoicism = editInterests.includes("Stoicism") || editInterests.includes("Transcendental Stoic Meditations") || editInterests.includes("Jewish Wisdom") || editInterests.includes("Chinese Wisdom") || editInterests.includes("Balkan Wisdom");
                            const userHasCalisthenics = editInterests.includes("Calisthenics");
                            
                            switch (archetype) {
                              case "The Zen Biophysicist":
                                score = userHasStoicism ? 89 : 76;
                                analysis = `Zen mindfulness paired with ${editFitnessStyle || "your workouts"} yields high physiological equanimity. Your selection of themes matches their research-grade biological rigor.`;
                                break;
                              case "The Stoic Calisthenics Athlete":
                                score = userHasCalisthenics ? 96 : 82;
                                analysis = `Optimal muscular-philosophical synergy detected. Shared athletic dedication triggers direct biochemical fellowship. A path of bodyweight mastery and deep focus.`;
                                break;
                              case "The Existential Nihilist":
                                score = userHasStoicism ? 64 : 85;
                                analysis = `A sharp dialectical tension. Your structured profile directly challenges their void-centric skepticism. Prompts active debate and intense dialogue, but presents recovery coordination friction.`;
                                break;
                              case "The Classical Roman Polymath":
                                score = userHasStoicism ? 93 : 79;
                                analysis = `High-signal academic compatibility. Mutual focus on classical literature and high-density logic forms an imperial alliance. Ideal for mutual reading rituals.`;
                                break;
                              case "The Slavic Romantic Scholar":
                                score = editLocation.toLowerCase().includes("croatia") || editLocation.toLowerCase().includes("zagreb") ? 92 : 75;
                                analysis = `Melancholic literary pairing. Reflects high Slavic cultural resonance and deep poetic alignment in Croatia. Strong for late-night coffee discussions, but demands deliberate morning discipline.`;
                                break;
                              default:
                                score = 80;
                                analysis = `Balanced companionship with medium-high philosophical symmetry. Excellent baseline for collaborative workouts.`;
                            }
                            setArchetypeCompatibilityScore(score);
                            setCompatibilityAnalysis(analysis);
                          }}
                          className={cn(
                            "w-full px-3.5 py-2 text-xs rounded-xl border outline-none font-semibold focus:ring-1 focus:ring-emerald-500",
                            isDarkMode ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"
                          )}
                        >
                          <option value="" disabled>-- Select target peer archetype --</option>
                          <option value="The Zen Biophysicist">The Zen Biophysicist</option>
                          <option value="The Stoic Calisthenics Athlete">The Stoic Calisthenics Athlete</option>
                          <option value="The Existential Nihilist">The Existential Nihilist</option>
                          <option value="The Classical Roman Polymath">The Classical Roman Polymath</option>
                          <option value="The Slavic Romantic Scholar">The Slavic Romantic Scholar</option>
                        </select>
                      </div>

                      {archetypeCompatibilityScore !== null && selectedPartnerArchetype && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-3.5 rounded-2xl border space-y-2.5",
                            isDarkMode ? "bg-zinc-950/80 border-zinc-800/60" : "bg-zinc-50 border-zinc-200"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Dialectical Match Score</span>
                            <span className={cn(
                              "text-xs font-black px-2 py-0.5 rounded-lg border",
                              isDarkMode ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/25" : "bg-emerald-50 border-emerald-200 text-emerald-600"
                            )}>
                              {archetypeCompatibilityScore}% Synced
                            </span>
                          </div>

                          {/* Score Bar */}
                          <div className={cn("w-full h-1.5 rounded-full overflow-hidden", isDarkMode ? "bg-zinc-800" : "bg-zinc-200")}>
                            <div 
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                              style={{ width: `${archetypeCompatibilityScore}%` }}
                            ></div>
                          </div>

                          <p className={cn("text-[9.5px] leading-relaxed font-semibold", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                            {compatibilityAnalysis}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* Sub-tab Content: Psychologist Quiz */}
            {personalitySubTab === 'quiz' && (
              <div className="space-y-6">
                
                {/* Intro clinical citation block */}
                <div className={cn(
                  "p-5 rounded-3xl border space-y-3 animate-fadeIn",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                )}>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" /> Academic Psychologist Assessment Standards (OCEAN & MMPI)
                  </p>
                  <p className={cn("text-[11px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                    When actual research psychologists want to evaluate traits, they use standardized questionnaires validated across decades of peer-reviewed statistical data. Instead of placing you in corporate "animal boxes," they score you along a spectrum of values. Taking this quiz registers your <strong>Big Five (NEO-PI)</strong>, <strong>MMPI Clinical Resilience tracker</strong>, and <strong>Myers-Briggs Type Indicator (MBTI)</strong> in your public seekership profile.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  
                  {/* Left Questionnaire Column */}
                  <div className="md:col-span-2 space-y-6">
                    <div className={cn(
                      "p-6 rounded-3xl border space-y-6",
                      isDarkMode ? "bg-zinc-900/30 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                    )}>
                      
                      {/* Section 1: The Big Five NEO-PI (OCEAN) */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-zinc-800/10 dark:border-zinc-850 pb-2">
                          <CheckCircle2 className="w-4 h-4 text-teal-400" />
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-350 dark:text-zinc-300">Phase 1: The Big Five Traits (OCEAN)</h4>
                        </div>
                        <div className="space-y-6">
                          {PSYCH_QUESTIONS.filter(q => q.category === 'bigfive').map((q) => (
                            <div key={q.id} className="space-y-3 pb-5 border-b border-zinc-800/5 dark:border-zinc-850/50 last:border-0 last:pb-0">
                              <p className={cn("text-xs font-bold leading-relaxed", isDarkMode ? "text-zinc-200" : "text-zinc-800")}>{q.text}</p>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                <span className={cn("text-[8px] font-black uppercase tracking-widest hidden sm:inline shrink-0", isDarkMode ? "text-rose-500/80" : "text-rose-600")}>
                                  Disagree
                                </span>
                                
                                <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-4 w-full sm:w-auto">
                                  <span className={cn("text-[8px] font-black uppercase tracking-widest sm:hidden", isDarkMode ? "text-rose-500/85" : "text-rose-600")}>
                                    Disagree
                                  </span>
                                  
                                  <div className="flex items-center gap-2.5 sm:gap-4 mx-2">
                                    {[1, 2, 3, 4, 5].map((val) => {
                                      const isActive = quizAnswers[q.id] === val;
                                      
                                      let sizeClass = "w-7 h-7 sm:w-8 sm:h-8";
                                      let activeStyle = "";
                                      let hoverStyle = "";
                                      let label = "";
                                      
                                      if (val === 1) {
                                        sizeClass = "w-8 h-8 sm:w-8.5 sm:h-8.5";
                                        hoverStyle = "hover:border-rose-400/50 hover:bg-rose-500/5";
                                        activeStyle = isDarkMode 
                                          ? "bg-rose-500/20 border-rose-505 text-rose-450 ring-2 ring-rose-500/15" 
                                          : "bg-rose-50 border-rose-500 text-rose-600 ring-4 ring-rose-50";
                                        label = "Strongly Disagree";
                                      } else if (val === 2) {
                                        sizeClass = "w-7 h-7 sm:w-7.5 sm:h-7.5";
                                        hoverStyle = "hover:border-amber-400/50 hover:bg-amber-500/5";
                                        activeStyle = isDarkMode 
                                          ? "bg-amber-500/15 border-amber-505 text-amber-450 ring-2 ring-amber-500/15" 
                                          : "bg-amber-50 border-amber-500 text-amber-600 ring-4 ring-amber-50";
                                        label = "Somewhat Disagree";
                                      } else if (val === 3) {
                                        sizeClass = "w-6 h-6 sm:w-6.5 sm:h-6.5";
                                        hoverStyle = "hover:border-zinc-400/50 hover:bg-zinc-500/5";
                                        activeStyle = isDarkMode 
                                          ? "bg-zinc-800/60 border-zinc-500 text-zinc-300 ring-2 ring-zinc-500/10" 
                                          : "bg-zinc-100 border-zinc-400 text-zinc-700 ring-4 ring-zinc-100";
                                        label = "Neutral";
                                      } else if (val === 4) {
                                        sizeClass = "w-7 h-7 sm:w-7.5 sm:h-7.5";
                                        hoverStyle = "hover:border-teal-400/50 hover:bg-teal-500/5";
                                        activeStyle = isDarkMode 
                                          ? "bg-teal-500/15 border-teal-505 text-teal-450 ring-2 ring-teal-500/15" 
                                          : "bg-teal-50 border-teal-500 text-teal-650 ring-4 ring-teal-50";
                                        label = "Somewhat Agree";
                                      } else if (val === 5) {
                                        sizeClass = "w-8 h-8 sm:w-8.5 sm:h-8.5";
                                        hoverStyle = "hover:border-emerald-400/50 hover:bg-emerald-500/5";
                                        activeStyle = isDarkMode 
                                          ? "bg-emerald-500/20 border-emerald-505 text-emerald-450 ring-2 ring-emerald-500/15" 
                                          : "bg-emerald-50 border-emerald-500 text-emerald-650 ring-4 ring-emerald-50";
                                        label = "Strongly Agree";
                                      }
                                      
                                      return (
                                        <button
                                          key={val}
                                          type="button"
                                          title={label}
                                          onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: val }))}
                                          className={cn(
                                            "rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 relative group/btn",
                                            isActive 
                                              ? activeStyle 
                                              : isDarkMode 
                                                ? "bg-zinc-950/20 border-zinc-800 text-zinc-600 hover:text-zinc-400" 
                                                : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-zinc-650",
                                            hoverStyle,
                                            sizeClass
                                          )}
                                        >
                                          <span className={cn(
                                            "w-1.5 h-1.5 rounded-full transition-transform duration-200 scale-0",
                                            isActive && "scale-100",
                                            val === 1 && "bg-rose-450",
                                            val === 2 && "bg-amber-450",
                                            val === 3 && "bg-zinc-400",
                                            val === 4 && "bg-teal-450",
                                            val === 5 && "bg-emerald-450"
                                          )}></span>
                                          
                                          {/* Label Tooltip */}
                                          <span className="absolute bottom-full mb-1.5 scale-0 group-hover/btn:scale-100 transition-transform duration-100 bg-zinc-950 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none z-30 whitespace-nowrap border border-zinc-800">
                                            {label}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  
                                  <span className={cn("text-[8px] font-black uppercase tracking-widest sm:hidden", isDarkMode ? "text-emerald-500/85" : "text-emerald-600")}>
                                    Agree
                                  </span>
                                </div>
                                
                                <span className={cn("text-[8px] font-black uppercase tracking-widest hidden sm:inline shrink-0", isDarkMode ? "text-emerald-500/80" : "text-emerald-600")}>
                                  Agree
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 2: MMPI True/False clinical screener */}
                      <div className="space-y-4 pt-4 border-t border-zinc-800/10 dark:border-zinc-850">
                        <div className="flex items-center gap-2 border-b border-zinc-800/10 dark:border-zinc-850 pb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-350 dark:text-zinc-300">Phase 2: MMPI Clinical Resilience & Truth scale</h4>
                        </div>
                        <div className="space-y-4">
                          {PSYCH_QUESTIONS.filter(q => q.category === 'mmpi').map((q) => (
                            <div key={q.id} className="space-y-2 pb-2">
                              <p className={cn("text-xs font-semibold leading-relaxed", isDarkMode ? "text-zinc-200" : "text-zinc-805")}>{q.text}</p>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-wider text-zinc-500 select-none">
                                  <input
                                    type="radio"
                                    name={q.id}
                                    checked={quizAnswers[q.id] === true}
                                    onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: true }))}
                                    className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
                                  />
                                  TRUE (Verified)
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-wider text-zinc-500 select-none">
                                  <input
                                    type="radio"
                                    name={q.id}
                                    checked={quizAnswers[q.id] === false}
                                    onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: false }))}
                                    className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
                                  />
                                  FALSE (Disagreed)
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 3: MBTI Duality checklist */}
                      <div className="space-y-6 pt-4 border-t border-zinc-800/10 dark:border-zinc-850">
                        <div className="flex items-center gap-2 border-b border-zinc-800/10 dark:border-zinc-850 pb-2">
                          <CheckCircle2 className="w-4 h-4 text-violet-400" />
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-350 dark:text-zinc-300">Phase 3: MBTI Cognitive Preferences</h4>
                        </div>
                        <div className="space-y-6">
                          {PSYCH_QUESTIONS.filter(q => q.category === 'mbti').map((q) => (
                            <div key={q.id} className="space-y-3 pb-5 border-b border-zinc-800/5 dark:border-zinc-850/50 last:border-0 last:pb-0">
                              <p className={cn("text-xs font-bold leading-relaxed", isDarkMode ? "text-zinc-200" : "text-zinc-855")}>{q.text}</p>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                <span className={cn("text-[8px] font-black uppercase tracking-widest hidden sm:inline shrink-0", isDarkMode ? "text-rose-500/80" : "text-rose-600")}>
                                  Disagree
                                </span>
                                
                                <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-4 w-full sm:w-auto">
                                  <span className={cn("text-[8px] font-black uppercase tracking-widest sm:hidden", isDarkMode ? "text-rose-500/85" : "text-rose-600")}>
                                    Disagree
                                  </span>
                                  
                                  <div className="flex items-center gap-2.5 sm:gap-4 mx-2">
                                    {[1, 2, 3, 4, 5].map((val) => {
                                      const isActive = quizAnswers[q.id] === val;
                                      
                                      let sizeClass = "w-7 h-7 sm:w-8 sm:h-8";
                                      let activeStyle = "";
                                      let hoverStyle = "";
                                      let label = "";
                                      
                                      if (val === 1) {
                                        sizeClass = "w-8 h-8 sm:w-8.5 sm:h-8.5";
                                        hoverStyle = "hover:border-rose-400/50 hover:bg-rose-500/5";
                                        activeStyle = isDarkMode 
                                          ? "bg-rose-500/20 border-rose-505 text-rose-450 ring-2 ring-rose-500/15" 
                                          : "bg-rose-50 border-rose-500 text-rose-600 ring-4 ring-rose-50";
                                        label = "Strongly Disagree";
                                      } else if (val === 2) {
                                        sizeClass = "w-7 h-7 sm:w-7.5 sm:h-7.5";
                                        hoverStyle = "hover:border-amber-400/50 hover:bg-amber-500/5";
                                        activeStyle = isDarkMode 
                                          ? "bg-amber-500/15 border-amber-505 text-amber-450 ring-2 ring-amber-500/15" 
                                          : "bg-amber-50 border-amber-500 text-amber-600 ring-4 ring-amber-50";
                                        label = "Somewhat Disagree";
                                      } else if (val === 3) {
                                        sizeClass = "w-6 h-6 sm:w-6.5 sm:h-6.5";
                                        hoverStyle = "hover:border-zinc-400/50 hover:bg-zinc-500/5";
                                        activeStyle = isDarkMode 
                                          ? "bg-zinc-800/60 border-zinc-500 text-zinc-305 ring-2 ring-zinc-500/10" 
                                          : "bg-zinc-100 border-zinc-400 text-zinc-700 ring-4 ring-zinc-100";
                                        label = "Neutral";
                                      } else if (val === 4) {
                                        sizeClass = "w-7 h-7 sm:w-7.5 sm:h-7.5";
                                        hoverStyle = "hover:border-teal-400/50 hover:bg-teal-500/5";
                                        activeStyle = isDarkMode 
                                          ? "bg-teal-500/15 border-teal-505 text-teal-450 ring-2 ring-teal-500/15" 
                                          : "bg-teal-50 border-teal-500 text-teal-650 ring-4 ring-teal-50";
                                        label = "Somewhat Agree";
                                      } else if (val === 5) {
                                        sizeClass = "w-8 h-8 sm:w-8.5 sm:h-8.5";
                                        hoverStyle = "hover:border-emerald-400/50 hover:bg-emerald-500/5";
                                        activeStyle = isDarkMode 
                                          ? "bg-emerald-500/20 border-emerald-505 text-emerald-450 ring-2 ring-emerald-500/15" 
                                          : "bg-emerald-50 border-emerald-500 text-emerald-650 ring-4 ring-emerald-50";
                                        label = "Strongly Agree";
                                      }
                                      
                                      return (
                                        <button
                                          key={val}
                                          type="button"
                                          title={label}
                                          onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: val }))}
                                          className={cn(
                                            "rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 relative group/btn",
                                            isActive 
                                              ? activeStyle 
                                              : isDarkMode 
                                                ? "bg-zinc-950/20 border-zinc-800 text-zinc-650 hover:text-zinc-400" 
                                                : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-zinc-650",
                                            hoverStyle,
                                            sizeClass
                                          )}
                                        >
                                          <span className={cn(
                                            "w-1.5 h-1.5 rounded-full transition-transform duration-200 scale-0",
                                            isActive && "scale-100",
                                            val === 1 && "bg-rose-450",
                                            val === 2 && "bg-amber-450",
                                            val === 3 && "bg-zinc-400",
                                            val === 4 && "bg-teal-450",
                                            val === 5 && "bg-emerald-450"
                                          )}></span>
                                          
                                          {/* Label Tooltip */}
                                          <span className="absolute bottom-full mb-1.5 scale-0 group-hover/btn:scale-100 transition-transform duration-105 bg-zinc-950 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none z-30 whitespace-nowrap border border-zinc-800">
                                            {label}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  
                                  <span className={cn("text-[8px] font-black uppercase tracking-widest sm:hidden", isDarkMode ? "text-emerald-500/85" : "text-emerald-600")}>
                                    Agree
                                  </span>
                                </div>
                                
                                <span className={cn("text-[8px] font-black uppercase tracking-widest hidden sm:inline shrink-0", isDarkMode ? "text-emerald-500/80" : "text-emerald-600")}>
                                  Agree
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Calculate Action */}
                      <button
                        type="button"
                        onClick={handleCalculatePersonality}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-black italic uppercase tracking-widest text-[11px] rounded-2xl active:scale-95 transition-transform shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Evaluate & Publish Personality Diagnostics <Brain className="w-4 h-4 animate-pulse" />
                      </button>

                    </div>
                  </div>

                  {/* Right Diagnostics Dashboard Column */}
                  <div className="space-y-6">
                    <div className={cn(
                      "p-6 sm:p-7 rounded-3xl border space-y-6 text-xs",
                      isDarkMode ? "bg-zinc-900/30 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                    )}>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Diagnostics Report Card</h4>
                      
                      {quizCalculated && thisPublicProfile?.bigFive ? (
                        <div className="space-y-6">
                          
                          {/* MBTI Avatar badge card */}
                          <div className={cn(
                            "p-5 rounded-3xl border text-center relative overflow-hidden",
                            isDarkMode ? "bg-zinc-950/70 border-zinc-900" : "bg-zinc-50 border-zinc-150 shadow-sm"
                          )}>
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-500"></div>
                            
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-violet-400 tracking-widest block uppercase font-mono">
                              {thisPublicProfile.mbti}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mt-1.5 leading-none font-bold">
                              {thisPublicProfile.mbtiName}
                            </span>
                            
                            {/* Jungian Cognitive details to make dashboard MUCH bigger and detailed */}
                            <div className={cn(
                              "mt-3.5 p-4 rounded-2xl text-[10px] text-left space-y-3.5 border",
                              isDarkMode ? "bg-zinc-900 border-zinc-800/80" : "bg-white border-zinc-200"
                            )}>
                              <div>
                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block leading-none">Cognitive Stack Logic</span>
                                <span className="font-mono text-emerald-400 font-bold block mt-1">
                                  {thisPublicProfile.mbti === "INTJ" ? "Ni (Introverted Intuition) → Te (Extraverted Thinking) → Fi (Introverted Feeling) → Se" :
                                   thisPublicProfile.mbti === "INFJ" ? "Ni (Introverted Intuition) → Fe (Extraverted Feeling) → Ti (Introverted Thinking) → Se" :
                                   thisPublicProfile.mbti === "INTP" ? "Ti (Introverted Thinking) → Ne (Extraverted Intuition) → Si (Introverted Sensing) → Fe" :
                                   thisPublicProfile.mbti === "INFP" ? "Fi (Introverted Feeling) → Ne (Extraverted Intuition) → Si (Introverted Sensing) → Te" :
                                   thisPublicProfile.mbti === "ENTJ" ? "Te (Extraverted Thinking) → Ni (Introverted Intuition) → Se (Extraverted Sensing) → Fi" :
                                   thisPublicProfile.mbti === "ENFJ" ? "Fe (Extraverted Feeling) → Ni (Introverted Intuition) → Se (Extraverted Sensing) → Ti" :
                                   thisPublicProfile.mbti === "ENTP" ? "Ne (Extraverted Intuition) → Ti (Introverted Thinking) → Fe (Extraverted Feeling) → Si" :
                                   thisPublicProfile.mbti === "ENFP" ? "Ne (Extraverted Intuition) → Fi (Introverted Feeling) → Te (Extraverted Thinking) → Si" :
                                   thisPublicProfile.mbti === "ISTJ" ? "Si (Introverted Sensing) → Te (Extraverted Thinking) → Fi (Introverted Feeling) → Ne" :
                                   thisPublicProfile.mbti === "ISFJ" ? "Si (Introverted Sensing) → Fe (Extraverted Feeling) → Ti (Introverted Thinking) → Ne" :
                                   "Sx → Tx → Fx → Nx (Balanced)"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block leading-none">Archetypal Tendencies</span>
                                <p className={cn("leading-relaxed font-semibold mt-1", isDarkMode ? "text-zinc-300" : "text-zinc-750")}>
                                  {thisPublicProfile.mbti === "INTJ" ? "You analyze life through complex systemic principles, cold logic, and a deep, far-sighted internal blueprint. You recover by retreating into complete cognitive isolation and structured physical discipline." :
                                   thisPublicProfile.mbti === "INFJ" ? "You combine rich interpersonal empathy with an unyielding structured drive. You search for underlying symbolic connections in everything and seek a clean, warm developmental fellowship with fellow seekers." :
                                   thisPublicProfile.mbti === "INTP" ? "You operate as a rigorous, deconstructive philosopher. You prioritize absolute logical consistency and intellectual correctness over social consensus, needing tranquil quietude to analyze ideas." :
                                   thisPublicProfile.mbti === "INFP" ? "Your interior sanctuary is governed by rich personal values and delicate poetic patterns. You demand absolute congruence between your habits and your spiritual alignment." :
                                   "Your cognitive code represents a highly adaptive, resilient scholarly perspective, capable of rapid problem-solving, active dialogue, and rigorous engagement with physical and classical wisdom disciplines."}
                                </p>
                              </div>
                              <div className="pt-1.5 border-t border-zinc-805/50">
                                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block leading-none">Optimal Dialectical Affinity</span>
                                <span className="text-teal-400 font-bold block mt-1">
                                  {thisPublicProfile.mbti === "INTJ" ? "ENFP / ENTP (Dialectical spark and macro-insight exchange)" :
                                   thisPublicProfile.mbti === "INFJ" ? "ENFP / ENFJ / INFP (Sublime emotional sync & high empathy)" :
                                   thisPublicProfile.mbti === "INTP" ? "ENTJ / INFJ (High-integrity logic matching and critical debate)" :
                                   thisPublicProfile.mbti === "INFP" ? "ENFJ / INFJ (Total spiritual/expressive congruence)" :
                                   "Complementary intuitive seekers with shared philosophical discipline"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Big Five OCEAN spectrum indicators */}
                          <div className="space-y-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block leading-none">The Big Five (OCEAN) spectrum</span>
                            
                            {[
                              { label: "O - Openness to Experience", key: "openness", desc: "Speculative imagination, complexity focus, aesthetic sensitivity", color: "from-sky-500 to-blue-500", bgLight: isDarkMode ? "bg-sky-500/10 text-sky-400" : "bg-sky-50 text-sky-700" },
                              { label: "C - Conscientiousness", key: "conscientiousness", desc: "Structured self-discipline, routine routine organization", color: "from-emerald-500 to-teal-500", bgLight: isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700" },
                              { label: "E - Extraversion", key: "extraversion", desc: "Social dominance, dialogic outgoing energy, verbal drive", color: "from-amber-500 to-orange-500", bgLight: isDarkMode ? "bg-amber-500/10 text-amber-500" : "bg-amber-50 text-amber-700" },
                              { label: "A - Agreeableness", key: "agreeableness", desc: "Altruistic social empathy, cooperative posture, peer supportiveness", color: "from-pink-500 to-rose-500", bgLight: isDarkMode ? "bg-pink-500/10 text-pink-400" : "bg-pink-50 text-pink-700" },
                              { label: "N - Neuroticism (Sensitivity)", key: "neuroticism", desc: "Nervous adrenaline alertness, somatic vigilance reactions", color: "from-purple-500 to-indigo-500", bgLight: isDarkMode ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-705" }
                            ].map(item => {
                              const score = (thisPublicProfile.bigFive as any)?.[item.key] || 50;
                              // Calculate dynamic diagnosis label
                              let evaluationLabel = "";
                              if (item.key === 'openness') {
                                evaluationLabel = score >= 75 ? 'Scholarly Abstractness' : score <= 35 ? 'Pragmatic Empiricist' : 'Balanced Theoretical';
                              } else if (item.key === 'conscientiousness') {
                                evaluationLabel = score >= 75 ? 'Rigorously Structured' : score <= 35 ? 'Spontaneous Adaptive' : 'Pragmatic Rhythm';
                              } else if (item.key === 'extraversion') {
                                evaluationLabel = score >= 75 ? 'Outgoing Dialogue Catalyst' : score <= 35 ? 'Contemplative Quietude' : 'Measured Interactive';
                              } else if (item.key === 'agreeableness') {
                                evaluationLabel = score >= 75 ? 'Warm Companionate' : score <= 35 ? 'Analytical Dissent' : 'Collegiate Balanced';
                              } else if (item.key === 'neuroticism') {
                                evaluationLabel = score >= 75 ? 'High Adrenal Vigilance' : score <= 35 ? 'Stoic Equanimity (Ataraxia)' : 'Vigilant Adaptability';
                              }

                              return (
                                <div key={item.key} className={cn(
                                  "space-y-1.5 p-3 rounded-2xl border",
                                  isDarkMode ? "bg-zinc-950/20 border-zinc-800" : "bg-zinc-50/50 border-zinc-200"
                                )}>
                                  <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
                                    <span className={isDarkMode ? "text-zinc-300" : "text-zinc-800"}>{item.label}</span>
                                    <span className="font-mono font-black text-emerald-400">{score}%</span>
                                  </div>
                                  <div className="h-2 w-full bg-zinc-805 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full bg-gradient-to-r", item.color)} style={{ width: `${score}%` }} />
                                  </div>
                                  <div className="flex justify-between items-start gap-2 pt-0.5 text-[8.5px]">
                                    <span className={cn("leading-relaxed shrink", isDarkMode ? "text-zinc-500" : "text-zinc-650")}>{item.desc}</span>
                                    <span className={cn("px-1.5 py-0.5 rounded font-black uppercase text-[7px] tracking-widest block whitespace-nowrap", item.bgLight)}>
                                      {evaluationLabel}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* MMPI Diagnostics report */}
                          <div className={cn(
                            "p-4 rounded-2xl border space-y-3",
                            isDarkMode ? "bg-zinc-950/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                          )}>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-teal-400" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">MMPI Clinical Stability</span>
                            </div>

                            <div className="space-y-1 text-[10px] font-bold">
                              <div className="flex justify-between">
                                <span className={isDarkMode ? "text-zinc-400" : "text-zinc-600"}>Resilience Index:</span>
                                <span className="text-emerald-400">{thisPublicProfile.mmpiResilience}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={isDarkMode ? "text-zinc-400" : "text-zinc-600"}>Lie-Scale Validity:</span>
                                <span className={cn(
                                  thisPublicProfile.mmpiTruthScore && thisPublicProfile.mmpiTruthScore >= 100 
                                    ? "text-emerald-400" 
                                    : thisPublicProfile.mmpiTruthScore && thisPublicProfile.mmpiTruthScore >= 50 
                                      ? "text-amber-400" 
                                      : "text-rose-505"
                                )}>{thisPublicProfile.mmpiTruthScore}% Truthful</span>
                              </div>
                              <div className={cn("text-[8.5px] mt-1 leading-relaxed leading-normal", isDarkMode ? "text-zinc-500" : "text-zinc-600")}>
                                <strong>Status:</strong> {thisPublicProfile.mmpiStatus}
                              </div>
                            </div>
                          </div>

                          <div className={cn("text-[8px] font-black uppercase tracking-widest text-center mt-3", isDarkMode ? "text-zinc-600" : "text-zinc-400")}>
                            Diagnostics computed at {thisPublicProfile.quizTakenAt ? new Date(thisPublicProfile.quizTakenAt).toLocaleDateString() : ""}
                          </div>

                        </div>
                      ) : (
                        <div className="text-center py-16 border border-dashed border-zinc-700/50 rounded-2xl text-zinc-500 text-xs italic">
                          No diagnostics recorded yet. Agree or disagree to clinical segments on the left and trigger analysis.
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* EDUCATIONAL COMPENDIUM TABBED BOARD - SPECIALLY ADDED TO COMPLY WITH USER'S EXTENSIVE EDUCATIONAL PATHWAY */}
            <div className={cn(
              "p-6 sm:p-8 rounded-3xl border space-y-6 mt-8 relative overflow-hidden transition-all duration-300",
              isDarkMode ? "bg-zinc-900/20 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
            )}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl select-none pointer-events-none"></div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/10 dark:border-zinc-805 pb-5">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-450 block font-mono">Academic Library</span>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400 shrink-0" />
                    Psychometrics & Cognitive Science Compendium
                  </h3>
                  <p className={cn("text-[10px] leading-relaxed max-w-xl font-medium", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                    Examine the scientific parameters, metrics, and cognitive archetypes utilized in our high-signal seekership compatibility network.
                  </p>
                </div>

                {/* Educational Nav bar */}
                <div className={cn(
                  "flex flex-wrap p-1 rounded-xl self-start sm:self-center bg-zinc-950 border border-zinc-800/60"
                )}>
                  {[
                    { id: 'mbti', label: '16 Archetypes (MBTI)' },
                    { id: 'ocean', label: 'Big Five (OCEAN)' },
                    { id: 'mmpi', label: 'Clinical Resilience (MMPI)' },
                    { id: 'matches', label: 'Dialectical Compatibility' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setEduSection(tab.id as any)}
                      className={cn(
                        "px-3 py-1.5 text-[8.5px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                        eduSection === tab.id
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold"
                          : "text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900/50 border border-transparent"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MBTI SECTION BODY */}
              {eduSection === 'mbti' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={cn("p-4 rounded-2xl border space-y-2", isDarkMode ? "bg-zinc-955 border-zinc-850" : "bg-zinc-50 border-zinc-200")}>
                      <span className="text-xl font-mono text-emerald-400 font-black">I vs E</span>
                      <h4 className="text-[10px] font-black uppercase tracking-wider">Introversion vs Extraversion</h4>
                      <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                        Determines the primary source of neural energy. <strong>Introverts</strong> recover focus through deep isolation, quiet contemplation, and standalone reading. <strong>Extraverts</strong> gain active dopamine and intellectual momentum through rapid verbal synthesis in peer circles.
                      </p>
                    </div>
                    <div className={cn("p-4 rounded-2xl border space-y-2", isDarkMode ? "bg-zinc-955 border-zinc-850" : "bg-zinc-50 border-zinc-200")}>
                      <span className="text-xl font-mono text-sky-400 font-black">S vs N</span>
                      <h4 className="text-[10px] font-black uppercase tracking-wider">Sensing vs Intuition</h4>
                      <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                        Defines how raw information is absorbed. <strong>Sensing</strong> types focus on tactile facts, physical exercises, and immediate empirical reality. <strong>Intuitive</strong> seekers focus on symbolic patterns, potential future matrices, and abstract classical philosophies.
                      </p>
                    </div>
                    <div className={cn("p-4 rounded-2xl border space-y-2", isDarkMode ? "bg-zinc-955 border-zinc-850" : "bg-zinc-50 border-zinc-200")}>
                      <span className="text-xl font-mono text-teal-400 font-black">T vs F</span>
                      <h4 className="text-[10px] font-black uppercase tracking-wider">Thinking vs Feeling</h4>
                      <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                        Explains how complex life decisions are structured. <strong>Thinking</strong> scholars apply consistent cause-and-effect logical maps, honoring objective truth over societal consensus. <strong>Feeling</strong> types decide through emotional alignment, team empathy, and subjective ethical resonance.
                      </p>
                    </div>
                    <div className={cn("p-4 rounded-2xl border space-y-2", isDarkMode ? "bg-zinc-955 border-zinc-850" : "bg-zinc-50 border-zinc-200")}>
                      <span className="text-xl font-mono text-purple-400 font-black">J vs P</span>
                      <h4 className="text-[10px] font-black uppercase tracking-wider">Judging vs Perceiving</h4>
                      <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                        Measures the preferred approach to life organization. <strong>Judging</strong> types crave firm closure, strict calisthenics schedules, tidy boundaries, and resolved files. <strong>Perceiving</strong> types thrive in open-ended emergent flexibilities and spontaneous schedules.
                      </p>
                    </div>
                  </div>

                  <div className={cn(
                    "p-5 rounded-2xl border space-y-3.5",
                    isDarkMode ? "bg-zinc-950/30 border-zinc-850" : "bg-zinc-50 border-zinc-150"
                  )}>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Academic Highlight Archetypes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-bold text-emerald-450 font-mono block">INTJ - The Architect Scholar (Petar's Archetype)</span>
                        <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                          Systems-oriented visionary who applies high-density mathematical blueprints and severe logical order. Drives group development through rigorous structural integrity, but requires total silence to restore biological vigor.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-bold text-sky-400 font-mono block">INFJ - The Seeker Counselor</span>
                        <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                          Possesses profound, symbolic human intuition coupled with highly organized personal objectives. Thrives when orchestrating high-fidelity peer mentoring or researching ancient wisdom pathways to restore collective focus.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-bold text-teal-450 font-mono block">INTP - The Analytical Sage</span>
                        <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                          A deconstructive, independent philosopher obsessed with absolute conceptual correctness. Spends massive cognitive energy analyzing the hidden mechanics of physical and mental systems, rejecting unverified dogmas.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-bold text-purple-400 font-mono block">ENTJ - The Strategic Commander</span>
                        <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                          Decisive, macro-focused organizer who handles administrative strain and complex logistics with commanding ease. Thrives when leading physical sanctuaries or coordinating mutual workout parameters.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OCEAN SECTION BODY */}
              {eduSection === 'ocean' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="space-y-4">
                    {[
                      {
                        title: "O - Openness to Experience",
                        desc: "Measures intellectual flexibility, abstract aesthetic appreciation, and willingness to engage challenging speculative metaphysics.",
                        high: "Drawn to complex eastern/western philosophies, custom atmospheric soundtracks, and advanced scientific theories. Open to multi-layered routines.",
                        low: "Highly grounded, concrete operational style. Prefers clear, verified mechanical realities and traditional, practical fitness/life procedures.",
                        color: "text-sky-450 border-sky-500/20 bg-sky-500/5"
                      },
                      {
                        title: "C - Conscientiousness",
                        desc: "Measures executive regulation, structured task adherence, attention to detail, and systemic routine integrity.",
                        high: "Meticulous focus, highly regular workouts (calisthenics/strength sets), and perfect adherence to sleep/recovery metrics.",
                        low: "Spontaneous, adaptive, highly reactive. Allows physical recovery to emerge organically; values intuitive flow over strict clocks.",
                        color: "text-emerald-450 border-emerald-500/20 bg-emerald-500/5"
                      },
                      {
                        title: "E - Extraversion",
                        desc: "Determines the density of social communication and preference for collective vs. single-seeker physical environments.",
                        high: "Draws immediate motivation from the Scholarly Swarm. Passionate about group workouts, open channels, and active oral debates.",
                        low: "Thrives in total self-sufficiency. Restores cognitive reserves in silent, standalone workout sanctuaries and high-quality deep writing.",
                        color: "text-amber-500 border-amber-500/20 bg-amber-500/5"
                      },
                      {
                        title: "A - Agreeableness",
                        desc: "Measures natural interpersonal empathy, collaborative posture, trust of peer nodes, and altruistic balance.",
                        high: "Highly supportive, cooperative, and eager to protect community harmony. Excels at mentoring and group recovery.",
                        low: "Crucially rigorous. Willing to express intellectual dissent, challenge inaccuracies, and prioritize hard logical truth over social comforting.",
                        color: "text-pink-455 border-pink-500/20 bg-pink-500/5"
                      },
                      {
                        title: "N - Neuroticism (Vigilance / Sensitivity)",
                        desc: "Measures the reaction velocity of the nervous system to environmental stress, fatigue, or biochemical oscillations.",
                        high: "Hyper-adrenal alertness. Mind experiences intense peaks and valleys. Demands proactive gentle Yin Yoga, breath cycles, and sleep guidance.",
                        low: "Classical Stoic Ataraxia. Deep biological stability under load; easily quietens physical anxieties and sustains peak cognitive stamina.",
                        color: "text-purple-450 border-purple-500/20 bg-purple-500/5"
                      }
                    ].map(trait => (
                      <div key={trait.title} className={cn("p-4 sm:p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-3.5", isDarkMode ? "bg-zinc-950/40 border-zinc-850" : "bg-zinc-50 border-zinc-200 shadow-xs")}>
                        <div className="space-y-1">
                          <h4 className={cn("text-xs font-black uppercase font-mono tracking-tight", trait.color.split(" ")[0])}>{trait.title}</h4>
                          <p className={cn("text-[9.5px] leading-relaxed font-semibold", isDarkMode ? "text-zinc-500" : "text-zinc-600")}>{trait.desc}</p>
                        </div>
                        <div className="p-3 rounded-xl border border-dashed border-emerald-500/25 bg-emerald-500/5 space-y-1">
                          <span className="text-[7.5px] font-black uppercase text-emerald-400 tracking-widest block font-bold">High Score Indication</span>
                          <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-300" : "text-zinc-650")}>{trait.high}</p>
                        </div>
                        <div className="p-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 space-y-1">
                          <span className="text-[7.5px] font-black uppercase text-zinc-555 tracking-widest block font-bold">Low Score Indication</span>
                          <p className={cn("text-[9px] leading-relaxed text-zinc-400")}>{trait.low}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MMPI SECTION BODY */}
              {eduSection === 'mmpi' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={cn("p-5 rounded-2xl border space-y-3", isDarkMode ? "bg-zinc-955 border-zinc-850" : "bg-zinc-50 border-zinc-200")}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <h4 className="text-xs font-black uppercase tracking-wider">Clinical Resilience Index</h4>
                      </div>
                      <p className={cn("text-[10px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-650")}>
                        Quantifies the seeker's inherent neuropsychological fortitude against depression, fatigue, somatic tension, and severe situational load.
                      </p>
                      <div className="space-y-1.5 pt-2 text-[9.5px] font-bold">
                        <div className="flex justify-between items-center text-emerald-400">
                          <span>80% - 100%: High Fortitude (Roman Stoic)</span>
                          <span>Complete Stress Mastery</span>
                        </div>
                        <p className={cn("text-[9px] font-normal", isDarkMode ? "text-zinc-550" : "text-zinc-500")}>
                          Strong baseline equanimity. Somatic fatigue is managed with breathwork, sustaining high executive function under pressure.
                        </p>
                        <div className="flex justify-between items-center text-amber-500 pt-1">
                          <span>50% - 79%: Standard Adaptive Strength</span>
                          <span>Moderate Somatic Vigilance</span>
                        </div>
                        <p className={cn("text-[9px] font-normal", isDarkMode ? "text-zinc-550" : "text-zinc-500")}>
                          Capable of deep intellectual focus, but requires regular calisthenics or quiet meditation breaks to resolve muscle tightness.
                        </p>
                        <div className="flex justify-between items-center text-rose-500 pt-1">
                          <span>Below 50%: Vulnerable Alert State</span>
                          <span>Needs Restorative Yin Rituals</span>
                        </div>
                        <p className={cn("text-[9px] font-normal", isDarkMode ? "text-zinc-550" : "text-zinc-500")}>
                          The nervous system is currently carrying high stress. The application triggers specialized "Restore Mode" sequences to avoid burnout.
                        </p>
                      </div>
                    </div>

                    <div className={cn("p-5 rounded-2xl border space-y-3", isDarkMode ? "bg-zinc-955 border-zinc-850" : "bg-zinc-50 border-zinc-200")}>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                        <h4 className="text-xs font-black uppercase tracking-wider">L-Scale Validity (Truth Validation)</h4>
                      </div>
                      <p className={cn("text-[10px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-650")}>
                        Evaluates raw psychometric honesty. Traditional corporate quizzes are easily warped by subjects answering with their 'ideal self' rather than real behaviors. The MMPI Lie screener calculates this defensive gap.
                      </p>
                      <div className="space-y-1.5 pt-2 text-[9.5px] font-bold">
                        <div className="flex justify-between items-center text-emerald-400">
                          <span>80% - 100%: Total Transparent Verity</span>
                          <span>Highly Academic</span>
                        </div>
                        <p className={cn("text-[9px] font-normal", isDarkMode ? "text-zinc-550" : "text-zinc-500")}>
                          The user has fully embraced their flaws, shadow elements, and physical vulnerabilities. Provides an accurate metric for pairing.
                        </p>
                        <div className="flex justify-between items-center text-amber-500 pt-1">
                          <span>60% - 79%: Minor Social Shielding</span>
                          <span>Mild Ideal Projection</span>
                        </div>
                        <p className={cn("text-[9px] font-normal", isDarkMode ? "text-zinc-550" : "text-zinc-500")}>
                          Answers contain slight tendencies to project a flawless classical face. Balanced but with small defensive postures.
                        </p>
                        <div className="flex justify-between items-center text-rose-450 pt-1">
                          <span>Below 60%: High Defensive Facade</span>
                          <span>Incomplete Self-Realization</span>
                        </div>
                        <p className={cn("text-[9px] font-normal", isDarkMode ? "text-zinc-550" : "text-zinc-500")}>
                          Subconscious posturing detected. The test results should be interpreted with care. Seeker is advised to retake the test in a quiet, isolated meditation state.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* COMPATIBILITY/MATCHES SECTION BODY */}
              {eduSection === 'matches' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className={cn(
                    "p-5 rounded-2xl border space-y-3.5",
                    isDarkMode ? "bg-zinc-950/50 border-zinc-850" : "bg-zinc-50 border-zinc-200"
                  )}>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 font-mono">The Scholarly Compatibility Rules</h4>
                      <p className={cn("text-[10.5px] leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                        WiseFit doesn't use simple algorithms. Compatibility scoring uses Euclidean vector distances across the Big Five spectrum paired with Myers-Briggs Cognitive complementarity:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-300 block uppercase tracking-wider font-mono">1. Cognitive Sparks</span>
                        <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-500" : "text-zinc-600")}>
                          Intuitive/Abstract (N) types pair best with other intuitive nodes for late-night philosophical exploration. Sensing (S) athletes connect deeply with concrete calisthenics partners for intense mechanical physical trials.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-300 block uppercase tracking-wider font-mono">2. Extraversion Offset</span>
                        <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-550" : "text-zinc-600")}>
                          Dualities (e.g. Introvert paired with Extravert) provide balance. The extroverted node stimulates external dialectics, while the introverted node provides silent, structured, calming depth.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-300 block uppercase tracking-wider font-mono">3. Stoic Ataraxia Baseline</span>
                        <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-zinc-550" : "text-zinc-650")}>
                          High Neuroticism (Sensitivity) nodes require at least one partner with Low Neuroticism (low stress sensitivity) to form a peaceful sanctuary, avoiding compounding anxiety spirals.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB D: MODERATION ADMIN PANEL */}
        {activeTab === 'moderation' && isAdmin && (
          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-2xl border flex items-center gap-3",
              isDarkMode ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-amber-55/10 border-amber-200 text-amber-700"
            )}>
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-tight">Admin Moderation Zone</p>
                <p className="text-[10px] leading-relaxed max-w-xl font-medium mt-0.5 opacity-90">
                  You are validated as Petar or an Admin node. Disciples require active clearance to secure clinical sanity in the scholarly commons. Approve or reject reflections immediately.
                </p>
              </div>
            </div>

            {pendingPosts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-3xl text-zinc-500 text-xs">
                The queue is pure. No pending user posts.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPosts.map(post => (
                  <motion.div
                    key={post.id}
                    layoutId={`mod-${post.id}`}
                    className={cn(
                      "p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden",
                      isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={post.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                          alt="mod"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">{post.userName}</p>
                          <p className={cn("text-[9px] font-mono", isDarkMode ? "text-zinc-550" : "text-zinc-450")}>
                            {new Date(post.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <p className={cn("text-xs leading-relaxed font-normal whitespace-pre-wrap", isDarkMode ? "text-zinc-300" : "text-zinc-750")}>
                        {post.content}
                      </p>

                      {post.mediaUrl && (
                        <div className="p-2 border rounded-xl border-zinc-800 text-[10px] truncate max-w-sm font-mono text-zinc-400">
                          Media link: {post.mediaUrl}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 self-end">
                      <button
                        onClick={() => handleModeratePost(post.id, 'reject')}
                        className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleModeratePost(post.id, 'approve')}
                        className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-900 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-transform shadow-md shadow-emerald-500/10"
                      >
                        Approve Publication
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Test Seekers Provisioner Card */}
            <div className={cn(
              "p-6 rounded-3xl border space-y-4 mt-6",
              isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500">Test Seekers Provisioner</h4>
                  <p className={cn("text-[10px] mt-0.5", isDarkMode ? "text-zinc-400" : "text-zinc-550")}>
                    Instantly deploy historical stoic scholars as active peers for dialog, messaging, and clinical connection testing.
                  </p>
                </div>
                <Users className="w-5 h-5 text-emerald-500 shrink-0" />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsProvisioningDummy(true);
                    setProvisionError(null);
                    setProvisionSuccess(false);

                    try {
                      const dummyUsers = DUMMY_SCHOLARS.map(u => ({
                        ...u,
                        isOnline: true,
                        lastActive: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      }));
 
                      for (const u of dummyUsers) {
                        await setDoc(doc(db, 'public_profiles', u.uid), u);
                      }
                      setProvisionSuccess(true);
                    } catch (err: any) {
                      setProvisionError(err.message || 'Failed to seed dummy seekers');
                    } finally {
                      setIsProvisioningDummy(false);
                    }
                  }}
                  disabled={isProvisioningDummy}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 text-xs font-black uppercase tracking-tight active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  {isProvisioningDummy ? "Provisioning..." : "Provision 6 Stoic Seekers"}
                </button>
              </div>
 
              {provisionSuccess && (
                <p className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-xl">
                  Seekers seeded successfully! Epictetus, Marcus Aurelius, Lucius Seneca, Hypatia, Diotima, and Aspasia are now active inside the Seeker Swarm.
                </p>
              )}
              {provisionError && (
                <p className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                  {provisionError}
                </p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 5. Custom Seeker Wall Modal display overlay */}
      <AnimatePresence>
        {selectedPeerWall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              className={cn(
                "w-full max-w-xl rounded-t-3xl sm:rounded-3xl border p-6 shadow-2xl relative overflow-hidden transition-all duration-300 my-8 max-h-[85vh] flex flex-col",
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              <button 
                onClick={() => setSelectedPeerWall(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full transition-all z-30 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 border border-rose-400/30 active:scale-95 flex items-center justify-center cursor-pointer"
                title="Close Wall"
              >
                <X className="w-5 h-5 stroke-[3px]" />
              </button>

              {/* Scrollable interior block */}
              <div className="overflow-y-auto space-y-6 pr-2 flex-1 scrollable-overlay">
                
                {/* Stunning Top Cover & Large Profile photo block */}
                <div className="relative rounded-2xl overflow-hidden border border-zinc-805/40 bg-zinc-950/20 mb-4 pt-2">
                  {/* Biography card top cover */}
                  <div className="h-32 w-full relative overflow-hidden bg-zinc-800 bg-gradient-to-r from-emerald-950/20 to-zinc-900">
                    {selectedPeerWall.coverUrl ? (
                      <img 
                        src={selectedPeerWall.coverUrl} 
                        className="w-full h-full object-cover opacity-60" 
                        alt="cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/10 via-teal-900/10 to-zinc-900/30"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                  </div>

                  <div className="px-5 pb-5 relative -mt-14 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div className="flex items-end gap-3.5">
                      <div 
                        onClick={() => setActiveLightboxImg(selectedPeerWall.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200')}
                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-zinc-950 cursor-zoom-in shrink-0 shadow-xl group"
                        title="Click to enlarge"
                      >
                        <img 
                          src={selectedPeerWall.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          alt="avatar"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </div>

                      <div className="space-y-1 mb-1">
                        <h3 className="font-extrabold text-xl uppercase tracking-tighter leading-none">{selectedPeerWall.name}</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                          {selectedPeerWall.mbti ? `${selectedPeerWall.mbti} · ` : ''}Established Disciple
                        </p>
                        {selectedPeerWall.location && (
                          <p className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-500" /> {selectedPeerWall.location}
                          </p>
                        )}
                        {selectedPeerWall.height && (
                          <p className="text-[10px] font-medium text-zinc-400">
                            Height: <strong className="text-zinc-305">{selectedPeerWall.height} cm</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setEngagePeer(selectedPeerWall);
                        setEngageMessage('');
                        setEngageSuccess(false);
                        setEngageError(null);
                      }}
                      className="px-5 py-3 bg-emerald-500 text-zinc-950 font-black italic uppercase text-[10px] tracking-wider rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5 self-start sm:self-end shadow-md shadow-emerald-500/10 shrink-0 cursor-pointer"
                    >
                      Secure Dialog <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Seeker Biography Text */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Philosophy biography</h4>
                  <p className={cn(
                    "text-xs leading-relaxed p-4 rounded-2xl border font-medium whitespace-pre-wrap",
                    isDarkMode ? "bg-zinc-850/40 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-150 text-zinc-650"
                  )}>
                    {selectedPeerWall.biography || 'This seeker choice was deep contemplation. No biography documented.'}
                  </p>
                </div>

                {/* Scholar Dialogues Prompt Cards rendering for Peer Wall */}
                {(selectedPeerWall.askGoingOut || selectedPeerWall.askMyWeekends || selectedPeerWall.askMePhone) && (
                  <div className="space-y-3 pt-1 animate-fadeIn">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Seeker Scholar Dialogues</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedPeerWall.askGoingOut && (
                        <div className={cn(
                          "p-4 rounded-2xl border space-y-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] shadow-sm",
                          isDarkMode ? "bg-zinc-850/30 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-750"
                        )}>
                          <div className="flex items-center gap-2 border-b border-zinc-800/10 dark:border-zinc-800/30 pb-2">
                            <Compass className="w-4 h-4 text-emerald-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-405">Going Out</span>
                          </div>
                          <p className="text-xs font-semibold leading-relaxed italic text-zinc-800 dark:text-zinc-200">
                            "{selectedPeerWall.askGoingOut}"
                          </p>
                        </div>
                      )}

                      {selectedPeerWall.askMyWeekends && (
                        <div className={cn(
                          "p-4 rounded-2xl border space-y-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] shadow-sm",
                          isDarkMode ? "bg-zinc-850/30 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-750"
                        )}>
                          <div className="flex items-center gap-2 border-b border-zinc-800/10 dark:border-zinc-800/30 pb-2">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-405">My Weekends</span>
                          </div>
                          <p className="text-xs font-semibold leading-relaxed italic text-zinc-800 dark:text-zinc-200">
                            "{selectedPeerWall.askMyWeekends}"
                          </p>
                        </div>
                      )}

                      {selectedPeerWall.askMePhone && (
                        <div className={cn(
                          "p-4 rounded-2xl border space-y-2 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] shadow-sm",
                          isDarkMode ? "bg-zinc-850/30 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-750"
                        )}>
                          <div className="flex items-center gap-2 border-b border-zinc-800/10 dark:border-zinc-800/30 pb-2">
                            <MessageSquare className="w-4 h-4 text-emerald-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-405">Me + My Phone</span>
                          </div>
                          <p className="text-xs font-semibold leading-relaxed italic text-zinc-800 dark:text-zinc-200">
                            "{selectedPeerWall.askMePhone}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Seeker Premium Photo Gallery (Dating compatibility with visibility controls) */}
                {(() => {
                  if (!selectedPeerWall.userPhotos) return null;
                  
                  const isMeOnWall = currentUser?.uid === selectedPeerWall.uid;
                  const isFriendOnWall = getFriendRelation(selectedPeerWall.uid) === 'friend';
                  const canSeeAllOnWall = isMeOnWall || isFriendOnWall;
                  
                  const nonEmtpyPhotosWithIndex = selectedPeerWall.userPhotos
                    .map((url, origIdx) => ({ url, origIdx }))
                    .filter(item => item.url);

                  if (nonEmtpyPhotosWithIndex.length === 0) return null;

                  const visiblePhotos = nonEmtpyPhotosWithIndex.filter(item => {
                    if (canSeeAllOnWall) return true;
                    const visibility = selectedPeerWall.userPhotosVisibility?.[item.origIdx] || 'friends';
                    return visibility === 'public';
                  });

                  const hiddenCount = nonEmtpyPhotosWithIndex.length - visiblePhotos.length;

                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Seeker Photo Gallery</h4>
                        {canSeeAllOnWall && (
                          <span className="text-[8px] font-bold uppercase text-emerald-450 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0">
                            <UserCheck className="w-2.5 h-2.5" /> Checked Friends-Visible
                          </span>
                        )}
                      </div>
                      
                      {visiblePhotos.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mt-1">
                          {visiblePhotos.map((item, idx) => {
                            const isPhotoPublic = (selectedPeerWall.userPhotosVisibility?.[item.origIdx] || 'friends') === 'public';
                            return (
                              <div 
                                key={idx}
                                onClick={() => setActiveLightboxImg(item.url)}
                                className="aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-805/45 bg-zinc-950/25 relative group cursor-zoom-in shadow-md"
                              >
                                <img 
                                  src={item.url} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                  alt={`Gallery ${idx + 1}`}
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-2.5 flex justify-between items-center">
                                  <div className="flex flex-col">
                                    <span className="text-[8.5px] font-black uppercase text-white tracking-widest leading-none">Photo {idx + 1}</span>
                                    {(isMeOnWall || isFriendOnWall) && (
                                      <span className="text-[7px] text-zinc-300 flex items-center gap-0.5 mt-1 leading-none font-bold">
                                        {isPhotoPublic ? <Globe className="w-2 h-2 text-emerald-400" /> : <Lock className="w-2 h-2 text-zinc-400" />}
                                        {isPhotoPublic ? "Public" : "Friends"}
                                      </span>
                                    )}
                                  </div>
                                  <Maximize2 className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {hiddenCount > 0 && !canSeeAllOnWall && (
                        <div className={cn(
                          "p-4 rounded-2xl border text-center space-y-2 flex flex-col items-center justify-center relative overflow-hidden",
                          isDarkMode ? "bg-zinc-950/95 border-zinc-850" : "bg-zinc-50 border-zinc-200"
                        )}>
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-20 select-none pointer-events-none"></div>
                          <Lock className="w-5 h-5 text-emerald-450 animate-pulse relative z-10" />
                          <div className="space-y-1 relative z-10">
                            <h5 className="font-extrabold uppercase text-[9px] tracking-widest text-zinc-350">
                              {hiddenCount} Seeker Photo{hiddenCount > 1 ? 's' : ''} Locked
                            </h5>
                            <p className="text-[9.5px] font-medium text-zinc-400 max-w-sm leading-normal">
                              Only accepted friends can see these private profile photographs. Send a connection request to unlock their complete dating gallery!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Academic Psychologist Assessment Results */}
                <div className={cn(
                  "p-5 rounded-2xl border space-y-4 text-xs",
                  isDarkMode ? "bg-zinc-950/70 border-zinc-850" : "bg-zinc-50 border-zinc-200 shadow-sm"
                )}>
                  <div className="flex items-center justify-between border-b border-zinc-800/10 dark:border-zinc-800/35 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-emerald-450" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Academic Psychologist Assessment</h4>
                    </div>
                    {selectedPeerWall.quizTakenAt && (
                      <span className="text-[8px] font-mono text-zinc-500">
                        Tested: {new Date(selectedPeerWall.quizTakenAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {selectedPeerWall.bigFive ? (
                    <div className="space-y-4">
                      {/* MBTI Archetype badge */}
                      <div className={cn(
                        "p-3.5 rounded-xl border text-center relative overflow-hidden",
                        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-150 shadow-sm"
                      )}>
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-500"></div>
                        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-violet-400 tracking-widest block uppercase font-mono leading-none py-1">
                          {selectedPeerWall.mbti}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mt-1 leading-none">
                          {selectedPeerWall.mbtiName || "Scholarly Archetype"}
                        </span>
                      </div>

                      {/* Big Five Spectrums */}
                      <div className="space-y-2.5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block leading-none">Big Five Spectrum (OCEAN)</span>
                        {[
                          { label: "O - Openness", key: "openness", desc: "Imagination / Complexity Focus", color: "from-sky-500 to-blue-500" },
                          { label: "C - Conscientiousness", key: "conscientiousness", desc: "Organization / Routine Discipline", color: "from-emerald-500 to-teal-500" },
                          { label: "E - Extraversion", key: "extraversion", desc: "Sociability / Core Vitality Offset", color: "from-amber-500 to-orange-500" },
                          { label: "A - Agreeableness", key: "agreeableness", desc: "Altruism / Skeptical Rationality", color: "from-pink-500 to-rose-500" },
                          { label: "N - Neuroticism", key: "neuroticism", desc: "Biological Strain Resilience", color: "from-purple-500 to-indigo-500" }
                        ].map(item => {
                          const score = (selectedPeerWall.bigFive as any)?.[item.key] || 50;
                          return (
                            <div key={item.key} className="space-y-1">
                              <div className="flex justify-between text-[9px] font-bold tracking-tight leading-none">
                                <span className={cn("capitalize", isDarkMode ? "text-zinc-300" : "text-zinc-700")}>{item.label}</span>
                                <span className={cn("font-semibold", isDarkMode ? "text-zinc-400" : "text-zinc-650")}>{score}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-805 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full bg-gradient-to-r", item.color)} style={{ width: `${score}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* MMPI Validity Status */}
                      {selectedPeerWall.mmpiResilience !== undefined && (
                        <div className={cn(
                          "p-3 rounded-xl border flex items-center justify-between text-[9.5px] font-bold",
                          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-150"
                        )}>
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                            <span className={isDarkMode ? "text-zinc-400" : "text-zinc-650"}>Clinical Resilience:</span>
                          </div>
                          <span className="text-emerald-400 font-mono font-black">{selectedPeerWall.mmpiResilience}%</span>
                          <span className="text-zinc-500">|</span>
                          <span className="text-teal-400 font-mono font-black">{selectedPeerWall.mmpiTruthScore || 100}% Honest</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-zinc-400 text-[10px] font-medium italic">
                      This seeker has not recorded their Scholar Personality Diagnostics yet.
                    </div>
                  )}
                </div>

                {/* Dating Swarms & Personality Compatibility Analysis */}
                {selectedPeerWall.isDatingModeEnabled && (
                  <div className={cn(
                    "p-5 rounded-2xl border space-y-4 text-xs relative overflow-hidden",
                    isGirlyMode ? "bg-pink-55/40 border-pink-100 shadow-sm" : isDarkMode ? "bg-zinc-950/70 border-zinc-850" : "bg-white border-zinc-200 shadow-sm"
                  )}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-full select-none pointer-events-none"></div>
                    <div className="flex items-center gap-1.5 border-b border-zinc-800/10 dark:border-zinc-800/35 pb-2">
                      <Heart className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 dark:text-zinc-400">Dating Compatibility Score</h4>
                    </div>

                    {(() => {
                      const res = getDetailedCompatibility(thisPublicProfile, selectedPeerWall);
                      if (res.isError || res.score === null) {
                        return (
                          <div className="space-y-3">
                            <p className="text-[10.5px] leading-relaxed text-zinc-400">
                              Your romantic and intellectual connection details are currently locked. Complete your personality diagnostics quiz to unlock matchmaking alignment!
                            </p>
                            <button
                              onClick={() => {
                                setActiveTab('personality');
                                setPersonalitySubTab('quiz');
                              }}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all text-center shrink-0 cursor-pointer"
                            >
                              Take Personality Quiz to Unlock
                            </button>
                          </div>
                        );
                      }

                      // We have a score! Display it.
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="relative flex items-center justify-center shrink-0">
                              {/* circular progress design */}
                              <svg className="w-16 h-16 transform -rotate-90">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke={isDarkMode ? "#27272a" : "#f4f4f5"}
                                  strokeWidth="5"
                                  fill="transparent"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke={isGirlyMode ? "#ec4899" : "#f43f5e"}
                                  strokeWidth="5"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 28}
                                  strokeDashoffset={2 * Math.PI * 28 * (1 - res.score / 100)}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-[13px] font-black font-mono text-rose-500 leading-none">
                                {res.score}%
                              </span>
                            </div>
                            
                            <div>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block leading-none">Scholar compatibility index</span>
                              <h5 className="text-[13px] font-extrabold tracking-tight mt-1 text-zinc-800 dark:text-zinc-100">
                                {res.score >= 85 ? "Excellent Academic & Romantic Fit" : res.score >= 70 ? "Strong Philosophical Complementarity" : "Complementary Intellectual Resonance"}
                              </h5>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                                Synthesized using OCEAN scale offsets, romantic preferences, global maturity, and shared interests.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-dashed border-zinc-500/10 dark:border-zinc-800/35">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block leading-none">Algorithmic Match Highlights</span>
                              <button
                                type="button"
                                onClick={() => setShowCompatibilityReport(true)}
                                className={cn(
                                  "text-[9px] font-black uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-all cursor-pointer px-2.5 py-1 rounded-full border shadow-sm",
                                  isGirlyMode 
                                    ? "bg-pink-500 text-white border-pink-400 hover:bg-pink-600 shadow-pink-500/15" 
                                    : "bg-rose-500 text-white border-rose-400 hover:bg-rose-600 shadow-rose-500/15"
                                )}
                              >
                                <Sparkles className="w-2.5 h-2.5" /> Analyze Affinity
                              </button>
                            </div>
                            {res.reasons.map((reason, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-[10px] font-semibold text-zinc-650 dark:text-zinc-350 leading-normal">
                                <span className="text-rose-500 font-bold shrink-0">✦</span>
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Approved posts (The "Wall") */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Scholarly Wall ({peerWallPosts.length} Approved)
                  </h4>
                  {peerWallPosts.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-zinc-800 rounded-2xl text-[11px] text-zinc-500 italic">
                      Zero approved reflections published on this wall yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {peerWallPosts.map(p => {
                        const embedYt = p.mediaType === 'youtube' && p.mediaUrl ? getYouTubeEmbedUrl(p.mediaUrl) : '';
                        const hasLiked = p.likes?.includes(currentUser?.uid);

                        return (
                          <div
                            key={p.id}
                            className={cn(
                              "p-4 rounded-2xl border text-xs font-medium space-y-3 transition-colors relative overflow-hidden",
                              isDarkMode ? "bg-zinc-855/30 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-150 text-zinc-700"
                            )}
                          >
                            {/* Copy overlay */}
                            <AnimatePresence>
                              {copiedPostId === p.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  className="absolute top-3 right-3 bg-emerald-500 text-zinc-950 font-black text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg z-50 flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Reflection Copied</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {editingPostId === p.id ? (
                              <div className="space-y-2 mt-2 text-left">
                                <textarea
                                  value={editingPostContent}
                                  onChange={(e) => setEditingPostContent(e.target.value)}
                                  rows={3}
                                  className={cn(
                                    "w-full text-xs p-3 rounded-2xl border outline-none font-sans resize-none transition-all duration-300",
                                    isDarkMode 
                                      ? "bg-zinc-950 border-zinc-850 text-zinc-200 focus:border-emerald-500/50" 
                                      : "bg-zinc-50 border-zinc-200 text-zinc-850 focus:border-emerald-500/50 shadow-inner"
                                  )}
                                  placeholder="Edit your scholarly reflection..."
                                />
                                <div className="flex justify-end gap-2 text-[10px] font-black uppercase tracking-wider">
                                  <button
                                    onClick={() => {
                                      setEditingPostId(null);
                                      setEditingPostContent('');
                                    }}
                                    disabled={isSavingEdit}
                                    className={cn(
                                      "px-3.5 py-1.5 rounded-lg border transition-colors",
                                      isDarkMode 
                                        ? "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800" 
                                        : "border-zinc-250 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                                    )}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEditedPost(p.id)}
                                    disabled={isSavingEdit || !editingPostContent.trim()}
                                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-black flex items-center gap-1 active:scale-95 disabled:opacity-50 transition-all shadow shadow-emerald-500/10"
                                  >
                                    {isSavingEdit ? (
                                      <span>Saving...</span>
                                    ) : (
                                      <>
                                        <Save className="w-3 h-3" /> Save Changes
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="leading-relaxed whitespace-pre-wrap">{p.content}</p>
                            )}

                            {/* Optional post image rendering */}
                            {p.mediaType === 'image' && p.mediaUrl && (
                              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-800/10 bg-zinc-950">
                                <img src={p.mediaUrl} className="w-full h-full object-cover" alt="wall-image" />
                              </div>
                            )}

                            {p.mediaType === 'video' && p.mediaUrl && (
                              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-800/10 bg-black shadow">
                                <video 
                                  src={`${p.mediaUrl}#t=0.001`}
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}

                            {p.mediaType === 'youtube' && embedYt && (
                              <div className="aspect-video rounded-xl overflow-hidden border border-zinc-800/10 bg-black">
                                <iframe src={embedYt} className="w-full h-full" title="yt_embed" allowFullScreen />
                              </div>
                            )}

                            {/* Dynamic URL Previews & Thumbnails on Peer Wall */}
                            {(() => {
                              const pUrls = Array.from(new Set([
                                ...extractUrls(p.content),
                                ...(p.mediaUrl ? [p.mediaUrl] : [])
                              ]));
                              if (pUrls.length === 0) return null;
                              return (
                                <div className="space-y-2 pt-1 pointer-events-auto">
                                  {pUrls.map((url, idx) => (
                                    <LinkPreviewCard 
                                      key={`${p.id}-wall-preview-${idx}`} 
                                      url={url} 
                                      isDarkMode={isDarkMode} 
                                    />
                                  ))}
                                </div>
                              );
                            })()}

                            <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-zinc-500">
                              <span>Published {new Date(p.createdAt).toLocaleDateString()}</span>
                              <div className="flex items-center gap-3">
                                {/* Edit & Delete inline actions for Peer Wall */}
                                {(p.userId === currentUser?.uid || isAdmin) && (
                                  <div className="flex items-center gap-1.5 border-r border-zinc-500/15 pr-2 mr-1">
                                    <button
                                      onClick={() => handleEditPostStart(p)}
                                      className="p-1 hover:text-emerald-500 transition-colors"
                                      title="Edit reflection"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeletePost(p.id)}
                                      className="p-1 hover:text-red-500 transition-colors"
                                      title="Delete reflection"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleToggleLike(p)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                                      <Heart className={cn("w-3.5 h-3.5", hasLiked && "fill-current text-red-500 animate-ping-once")} />
                                    </button>
                                    <span>{p.likes?.length || 0} Likes</span>
                                  </div>

                                  {/* Share button Peer Wall */}
                                  <div className="relative inline-block text-left">
                                    <button
                                      onClick={() => setActiveSharePostId(activeSharePostId === p.id ? null : p.id)}
                                      className="p-1 text-zinc-400 hover:text-emerald-500 transition-colors"
                                      title="Share reflection"
                                    >
                                      <Share2 className="w-3.5 h-3.5" />
                                    </button>

                                    <AnimatePresence>
                                      {activeSharePostId === p.id && (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                          className={cn(
                                            "absolute right-0 bottom-full mb-1 w-48 rounded-xl border p-2 shadow-xl z-50 space-y-1 text-left",
                                            isDarkMode 
                                              ? "bg-zinc-950 border-zinc-800 text-zinc-300" 
                                              : "bg-white border-zinc-200 text-zinc-700 shadow-zinc-200/40"
                                          )}
                                        >
                                          <button
                                            onClick={() => {
                                              const snippet = p.content.length > 180 ? p.content.substring(0, 180) + '...' : p.content;
                                              const text = `"${snippet}"\n\n— Shared from @WiseFit Digital Sanctuary`;
                                              const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin)}`;
                                              window.open(url, '_blank', 'noopener,noreferrer');
                                              setActiveSharePostId(null);
                                            }}
                                            className={cn(
                                              "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                              isDarkMode ? "hover:bg-zinc-900 hover:text-white" : "hover:bg-zinc-100 hover:text-zinc-900"
                                            )}
                                          >
                                            <Twitter className="w-3.5 h-3.5 text-[#1DA1F2]" />
                                            <span>Share to X (Twitter)</span>
                                          </button>

                                          <button
                                            onClick={() => {
                                              const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`;
                                              window.open(url, '_blank', 'noopener,noreferrer');
                                              setActiveSharePostId(null);
                                            }}
                                            className={cn(
                                              "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                              isDarkMode ? "hover:bg-zinc-900 hover:text-white" : "hover:bg-zinc-100 hover:text-zinc-900"
                                            )}
                                          >
                                            <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                                            <span>Share to Facebook</span>
                                          </button>

                                          <button
                                            onClick={() => {
                                              const snippet = p.content.length > 180 ? p.content.substring(0, 180) + '...' : p.content;
                                              const text = `"${snippet}"\n\n— Shared from WiseFit Digital Sanctuary:`;
                                              const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + window.location.origin)}`;
                                              window.open(url, '_blank', 'noopener,noreferrer');
                                              setActiveSharePostId(null);
                                            }}
                                            className={cn(
                                              "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                              isDarkMode ? "hover:bg-zinc-900 hover:text-white" : "hover:bg-zinc-100 hover:text-zinc-900"
                                            )}
                                          >
                                            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                                            <span>Share to WhatsApp</span>
                                          </button>

                                          <button
                                            onClick={() => {
                                              navigator.clipboard.writeText(`"${p.content}"\n\n— Shared from WiseFit Digital Sanctuary: ${window.location.origin}`);
                                              setCopiedPostId(p.id);
                                              setActiveSharePostId(null);
                                              setTimeout(() => setCopiedPostId(null), 2500);
                                            }}
                                            className={cn(
                                              "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors text-left",
                                              isDarkMode ? "hover:bg-zinc-900 hover:text-white" : "hover:bg-zinc-100 hover:text-zinc-900"
                                            )}
                                          >
                                            <Copy className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Copy Reflection</span>
                                          </button>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Zoomable Lightbox for Seeker compatibility images & portrait clicks */}
      <AnimatePresence>
        {activeLightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveLightboxImg(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-none"
            >
              <img 
                src={activeLightboxImg} 
                className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-zinc-805/30 pointer-events-auto" 
                alt="Enlarged Seeker Media"
                referrerPolicy="no-referrer"
              />
              <span className="mt-3 text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 pointer-events-auto select-none">
                Click anywhere to return
              </span>
            </motion.div>
             <button 
              type="button" 
              onClick={() => setActiveLightboxImg(null)}
              className="absolute top-6 right-6 p-2.5 rounded-full transition-all bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 border border-rose-400/30 active:scale-95 flex items-center justify-center pointer-events-auto cursor-pointer"
              title="Close View"
            >
              <X className="w-5 h-5 stroke-[3px]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Swarm Compatibility Breakdown Modal */}
      <AnimatePresence>
        {showCompatibilityReport && selectedPeerWall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={cn(
                "w-full max-w-lg rounded-3xl border p-6 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-500",
                isGirlyMode ? "bg-white border-pink-100 text-pink-950" : isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              <button
                onClick={() => setShowCompatibilityReport(false)}
                className="absolute top-4 right-4 p-2 rounded-full transition-all bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 border border-rose-450/30 active:scale-95 flex items-center justify-center cursor-pointer font-bold"
                title="Close Breakdown"
              >
                <X className="w-4 h-4 stroke-[3px]" />
              </button>

              <div className="space-y-1 border-b border-zinc-800/10 dark:border-zinc-800/35 pb-4 pr-10">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 animate-pulse shrink-0" />
                  <h3 className="text-lg font-black uppercase tracking-wider text-rose-500">Affinity Analysis</h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Detailed psychological, physical, and intellectual synchronization index with <strong className="text-zinc-700 dark:text-zinc-200">{selectedPeerWall.name}</strong>.
                </p>
              </div>

              {(() => {
                const res = getDetailedCompatibility(thisPublicProfile, selectedPeerWall);
                if (res.isError || res.score === null) return <p className="text-xs text-zinc-500 font-bold">Diagnostics required.</p>;

                return (
                  <div className="space-y-5">
                    {/* Compatibility Ring Indicator */}
                    <div className="flex items-center gap-6 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                      <div className="relative flex items-center justify-center shrink-0">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke={isDarkMode ? "#27272a" : "#f4f4f5"}
                            strokeWidth="6"
                            fill="transparent"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke={isGirlyMode ? "#ec4899" : "#f43f5e"}
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 * (1 - res.score / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-lg font-black font-mono text-rose-500">
                          {res.score}%
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block leading-none">Overall Match Index</span>
                        <h4 className="text-md font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">
                          {res.score >= 85 ? "Excellent Academic & Romantic Fit" : res.score >= 70 ? "Strong Philosophical Complementarity" : "Complementary Intellectual Resonance"}
                        </h4>
                        <p className="text-[10.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                          Matched through the multi-dimensional Seeker compatibility schema.
                        </p>
                      </div>
                    </div>

                    {/* Highlights section with exact user examples */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <span>✦ Match Pillars</span>
                      </h4>
                      <div className="space-y-2.5">
                        {res.reasons.map((reason, idx) => {
                          let subTitle = "Worldview Sync";
                          let desc = "Matched through shared intellectual models and personal intents.";
                          
                          if (reason.includes("Stoicism") || reason.includes("scholarly") || reason.includes("shared interest") || reason.includes("Stoic")) {
                            subTitle = "Intellectual Sanctuary";
                            desc = "Both seek wisdom through classical philosophy. Shared interest in Stoicism is a core driver of cognitive and moral congruence.";
                          } else if (reason.includes("activity") || reason.includes("regimes") || reason.includes("somatic") || reason.includes("Similar activity")) {
                            subTitle = "Disciplined Physical Sync";
                            desc = "Both maintain rigorous physical practices. Your step goals and somatic devotion (e.g. pull-ups, yoga, calisthenics) align tightly.";
                          } else if (reason.includes("maturity") || reason.includes("age")) {
                            subTitle = "Optimal Maturity Blend";
                            desc = "Chronological age and developmental stage align precisely within mutual comfort filters, enhancing long-term outlook.";
                          } else if (reason.includes("psychological") || reason.includes("traits") || reason.includes("OCEAN")) {
                            subTitle = "Big Five Personality Core";
                            desc = "Compatible psychological traits. Direct personality vector match on Openness, Conscientiousness, and emotional resilience.";
                          } else if (reason.includes("relationship") || reason.includes("intent")) {
                            subTitle = "Commitment Model Fit";
                            desc = `Complementary dating targets. Both seek a similar level of connection detail: "${selectedPeerWall.relationshipIntent}".`;
                          }

                          return (
                            <div 
                              key={idx} 
                              className={cn(
                                "p-3.5 rounded-2xl border transition-all text-left space-y-1",
                                isDarkMode ? "bg-zinc-950/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className={cn("text-[10px] px-2 py-0.5 font-bold rounded uppercase tracking-wider", isGirlyMode ? "bg-pink-500/10 text-pink-500" : "bg-rose-500/10 text-rose-500")}>
                                  {subTitle}
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 mt-1">{reason}</p>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-normal">{desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Visual Comparison Matrix between Me and Them */}
                    {thisPublicProfile?.bigFive && selectedPeerWall.bigFive && (
                      <div className={cn(
                        "p-4 rounded-2xl border space-y-3",
                        isDarkMode ? "bg-zinc-950/30 border-zinc-850" : "bg-zinc-50 border-zinc-200"
                      )}>
                        <h4 className="text-[10.5px] font-black uppercase tracking-wider text-zinc-400">Psychological Alignment (Big Five)</h4>
                        <div className="space-y-2.5">
                          {[
                            { label: "Openness (Intellect & Aesthetics)", key: "openness", color: "bg-sky-500" },
                            { label: "Conscientiousness (Order & Discipline)", key: "conscientiousness", color: "bg-emerald-500" },
                            { label: "Extraversion (Social Energy)", key: "extraversion", color: "bg-amber-500" },
                            { label: "Agreeableness (Interpersonal Warmth)", key: "agreeableness", color: "bg-pink-500" },
                            { label: "Neuroticism (Stress Sensitivity)", key: "neuroticism", color: "bg-purple-500" }
                          ].map((trait, tIdx) => {
                            const valMe = (thisPublicProfile.bigFive as any)?.[trait.key] || 50;
                            const valThem = (selectedPeerWall.bigFive as any)?.[trait.key] || 50;
                            return (
                              <div key={tIdx} className="space-y-1 text-xs">
                                <div className="flex justify-between text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                                  <span>{trait.label}</span>
                                  <span>Me: <strong className="text-rose-500">{valMe}%</strong> · Them: <strong className="text-emerald-500">{valThem}%</strong></span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-855 rounded-full overflow-hidden relative">
                                  {/* Me line */}
                                  <div className={cn("absolute top-0 bottom-0 left-0", trait.color, "opacity-40")} style={{ width: `${valMe}%` }} />
                                  {/* Them line overlay or dot */}
                                  <div className="absolute top-0 bottom-0 bg-emerald-500/90 rounded-full" style={{ left: `calc(${valThem}% - 3.5px)`, width: '7px' }} title={`Them: ${valThem}%`} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={() => setShowCompatibilityReport(false)}
                className="w-full py-3.5 bg-rose-500 text-white font-extrabold rounded-2xl shadow-lg shadow-rose-500/20 active:scale-95 transition-transform text-xs uppercase tracking-widest"
              >
                Close Report
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Inline fallback icon helper to prevent typing errors on compile
function ExternalLinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

// URL extraction helper
const extractUrls = (text: string): string[] => {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex) || [];
  // Clean trailing punctuation
  return Array.from(new Set(matches.map(url => url.replace(/[.,;!?)]$/, ''))));
};

const getGoogleDriveId = (url: string) => {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/) || url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch (e) {
    return 'external';
  }
};

interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  logo?: string;
  publisher?: string;
}

// Memory cache for session to avoid repetitive network requests
const previewCache: { [url: string]: LinkPreviewData } = {};

function LinkPreviewCard({ url, isDarkMode }: { url: string; isDarkMode: boolean }) {
  const [data, setData] = useState<LinkPreviewData | null>(previewCache[url] || null);
  const [loading, setLoading] = useState(!previewCache[url]);

  const isVerticalReel = url.includes("tiktok.com") || url.includes("facebook.com") || url.includes("fb.watch");

  useEffect(() => {
    if (data) return;

    let isMounted = true;
    const fetchMeta = async () => {
      try {
        setLoading(true);

        // Google Drive local high-speed preview
        const driveId = getGoogleDriveId(url);
        if (driveId) {
          const mData = {
            title: "Shared Google Drive Asset",
            description: "Click to open and inspect this collaborative cloud document.",
            image: `https://drive.google.com/thumbnail?sz=w600&id=${driveId}`,
            publisher: "Google Drive"
          };
          previewCache[url] = mData;
          if (isMounted) {
            setData(mData);
            setLoading(false);
          }
          return;
        }

        // YouTube local high-speed preview
        const ytId = getYouTubeId(url);
        if (ytId) {
          const mData = {
            title: "YouTube Scholarly Video",
            description: "Click to view this connected multimedia resource.",
            image: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
            publisher: "YouTube"
          };
          previewCache[url] = mData;
          if (isMounted) {
            setData(mData);
            setLoading(false);
          }
          return;
        }

        // Try our premium local server-side scraper first (uses Cheerio + Gemini validation)
        try {
          const sRes = await fetch(`/api/link-metadata?url=${encodeURIComponent(url)}`);
          if (sRes.ok) {
            const sData = await sRes.json();
            if (sData && sData.title) {
              const mData: LinkPreviewData = {
                title: sData.title,
                description: sData.description,
                image: sData.image,
                logo: sData.logo || "",
                publisher: sData.publisher || ""
              };
              previewCache[url] = mData;
              if (isMounted) {
                setData(mData);
                setLoading(false);
              }
              return;
            }
          }
        } catch (serverScrapingErr) {
          console.warn("[LinkPreviewCard] Server-side scraper failed, falling back to Microlink...", serverScrapingErr);
        }

        // Generic URL fetching (including TikTok and arbitrary domains) using Microlink
        const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error();
        const json = await response.json();
        
        if (json.status === "success" && json.data) {
          const mData: LinkPreviewData = {
            title: json.data.title || "",
            description: json.data.description || "",
            image: json.data.image?.url || "",
            logo: json.data.logo?.url || "",
            publisher: json.data.publisher || ""
          };
          previewCache[url] = mData;
          if (isMounted) {
            setData(mData);
          }
        } else {
          throw new Error();
        }
      } catch (e) {
        // Aesthetic fallbacks
        const domain = getDomain(url);
        let titleFallback = `Resource from ${domain}`;
        let descFallback = "Access this connected hyperlink to view external documents and clinical insights.";
        let imgFallback = "https://images.unsplash.com/photo-1546074177-3df148018795?auto=format&fit=crop&q=80&w=600";

        if (url.includes("tiktok.com")) {
          titleFallback = "TikTok Shared Insight";
          descFallback = "Check out this physical training or scholarly breakdown on TikTok.";
          imgFallback = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600";
        } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
          titleFallback = "Facebook Shared Reflection";
          descFallback = "Explore this shared fitness demonstration, community reflection, or classical workout on Facebook.";
          imgFallback = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600";
        }

        const fbData: LinkPreviewData = {
          title: titleFallback,
          description: descFallback,
          image: imgFallback,
          publisher: domain
        };
        previewCache[url] = fbData;
        if (isMounted) {
          setData(fbData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMeta();
    return () => {
      isMounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className={cn(
        "p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 animate-pulse bg-zinc-950/5 border-zinc-500/10 pointer-events-none mt-2",
        isDarkMode ? "bg-zinc-900/20" : "bg-zinc-50 border-zinc-200"
      )}>
        <div className={cn(
          "bg-zinc-700/10 rounded-xl shrink-0",
          isVerticalReel 
            ? "w-[200px] aspect-[9/16] sm:w-[150px] sm:h-[266px] mx-auto sm:mx-0" 
            : "w-full sm:w-28 h-20"
        )} />
        <div className="space-y-2 flex-1 py-1">
          <div className="h-3.5 bg-zinc-700/10 rounded w-1/2" />
          <div className="h-3 bg-zinc-700/10 rounded w-full" />
          <div className="h-2 bg-zinc-700/10 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const displayImage = data.image || "https://images.unsplash.com/photo-1546074177-3df148018795?auto=format&fit=crop&q=80&w=600";
  const domain = getDomain(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group p-3 rounded-2xl border flex flex-col gap-3.5 hover:border-emerald-500/30 transition-all duration-300 pointer-events-auto text-left mt-2 shadow-sm",
        isVerticalReel ? "items-center sm:items-stretch sm:flex-row" : "sm:flex-row",
        isDarkMode 
          ? "bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-900/40" 
          : "bg-zinc-50/50 border-zinc-200 hover:bg-zinc-100"
      )}
    >
      <div className={cn(
        "overflow-hidden border border-zinc-500/10 bg-zinc-900 shrink-0 relative flex items-center justify-center rounded-xl",
        isVerticalReel
          ? "w-[200px] aspect-[9/16] sm:w-[150px] sm:h-[266px] mx-auto sm:mx-0 shadow-md transition-all duration-300"
          : "w-full sm:w-28 h-20"
      )}>
        <img
          src={displayImage}
          alt={data.title || "thumbnail"}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as any).src = "https://images.unsplash.com/photo-1546074177-3df148018795?auto=format&fit=crop&q=80&w=600";
          }}
        />
        {(getYouTubeId(url) || isVerticalReel) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/20 transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-500/95 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <Play className="w-4 h-4 text-zinc-950 fill-current ml-0.5" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5 py-0.5 min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          {data.logo ? (
            <img src={data.logo} alt="logo" className="w-3 h-3 rounded object-contain bg-white" referrerPolicy="no-referrer" />
          ) : (
            <div className={cn(
              "w-3 h-3 rounded flex items-center justify-center text-[7px] font-black uppercase",
              isDarkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-600"
            )}>
              {domain.charAt(0)}
            </div>
          )}
          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">
            {data.publisher || domain}
          </span>
        </div>
        <h5 className={cn(
          "font-bold truncate tracking-tight group-hover:text-emerald-500 transition-colors",
          isVerticalReel ? "text-[12px] sm:text-[13px] whitespace-normal line-clamp-2" : "text-[11px]",
          isDarkMode ? "text-zinc-200" : "text-zinc-850"
        )}>
          {data.title || "Scholarly Resource"}
        </h5>
        <p className={cn(
          "leading-snug",
          isVerticalReel ? "text-[11px] line-clamp-4" : "text-[10px] line-clamp-2",
          isDarkMode ? "text-zinc-450" : "text-zinc-500"
        )}>
          {data.description || "Stream or read external resource code, video tutorials, or public clinical spreadsheets."}
        </p>
      </div>

      <div className="self-center pr-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block shrink-0">
        <ExternalLinkIcon className="w-3.5 h-3.5 text-emerald-500" />
      </div>
    </a>
  );
}
