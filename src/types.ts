export interface Attachment {
  id: string;
  type: 'file' | 'youtube' | 'article' | 'google-drive' | 'link';
  name: string;
  url: string;
  fileType?: string;
  customThumbnail?: string;
}

export interface WorkoutComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  date: string;
}

export interface Workout {
  id: string;
  userId: string;
  date: string;
  name: string;
  content?: string;
  exercises: Exercise[];
  attachments?: Attachment[];
  comments?: WorkoutComment[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
}

export interface DailyStats {
  date: string;
  steps: number;
  calories: number;
  activeMinutes: number;
  weight: number;
}

export interface PlannedExercise {
  id: string;
  name: string;
  details: string;
  completed: boolean;
}

export interface DayPlan {
  day: string;
  type: string;
  exercises: PlannedExercise[];
}

export interface YogaPose {
  id: string;
  name: string;
  duration: number; // in seconds
  description?: string;
  counterPose?: string;
}

export interface YogaFlow {
  id: string;
  name: string;
  description: string;
  poses: YogaPose[];
}

export interface Article {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
  isAI?: boolean;
  reads?: number;
  shares?: number;
  likes?: number;
  likedBy?: string[];
  url?: string;
  thumbnailUrl?: string;
  excerpt?: string;
}

export interface ArticleComment {
  id: string;
  articleId: string;
  userId: string | null;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  updatedAt?: string;
}

export interface UserProfile {
  uid?: string;
  name: string;
  email?: string;
  isSubscribed?: boolean;
  subscriptionType?: 'monthly' | 'lifetime';
  height: number;
  currentWeight: number;
  targetWeight: number;
  currentSteps?: number;
  currentCalories?: number;
  currentDistance?: number;
  currentRHR?: number;
  currentHRV?: number;
  weeklyHealthData?: {
    day: string;
    date: string;
    steps: number;
    calories: number;
    distance: number;
  }[];
  personalRecords?: {
    id: string;
    label: string;
    date: string;
    value: string;
    category: string;
  }[];
  stepGoal: number;
  shortTermGoal: string;
  longTermGoal: string;
  maxPullUps: number;
  oneRMWeighted: number;
  avatarUrl: string;
  seenQuoteIds?: string[];
  markedQuotes?: { 
    id: string; 
    date: string; 
    wisdomGrade?: string; 
    comment?: string;
    text?: string;
    author?: string;
    source?: string;
    category?: string;
    isAI?: boolean;
  }[];
  dailyExercises?: { id: string; name: string; completed: boolean }[];
  dailyExerciseHistory?: { date: string; completedCount: number; totalCount: number }[];
  isDatingModeEnabled?: boolean;
  datingPreferences?: {
    genderInterest?: 'male' | 'female' | 'both' | 'all';
    minAge?: number;
    maxAge?: number;
  };
  compatibilityScore?: number;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  biography?: string;
  role?: 'user' | 'admin';
  integrations?: {
    fitbit?: {
      connected: boolean;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
      userId?: string;
      lastSync?: string;
    };
    googleFit?: {
      connected: boolean;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
      lastSync?: string;
    };
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface Quote {
  id?: string;
  text: string;
  author: string;
  source: string;
  randomId: number;
  isCustom?: boolean;
  isAI?: boolean;
  userId?: string;
  markedDate?: string;
  wisdomGrade?: string;
  comment?: string;
  category?: 'fitness' | 'wisdom' | 'stoic' | 'jewish' | 'psychology' | 'finance' | 'balkan' | 'chinese' | 'japanese' | 'daily';
  shortExplanation?: string;
  stoicParallel?: string;
  jewishParallel?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  category: 'latin' | 'jewish' | 'history' | 'psychology';
  wisdom: string; // the "lesson" behind the answer
}

export interface VideoHistoryItem {
  id: string;
  type: 'tiktok' | 'youtube' | 'direct';
  videoId: string; // URL for direct type
  title: string;
  category: 'History' | 'Stoicism' | 'Philosophy' | 'Training';
}

export interface PublicProfile {
  uid: string;
  name: string;
  avatarUrl?: string;
  biography?: string;
  updatedAt?: any; // Server timestamp or string
  isOnline?: boolean;
  lastActive?: string;
  friends?: string[];
  
  // Dating profile & cover fields
  coverUrl?: string;
  relationshipIntent?: string;
  location?: string;
  height?: string;
  intellectualInterests?: string[];
  fitnessStyle?: string;
  morningEnergy?: string;

  // Psychology personality metrics
  mbti?: string;
  mbtiName?: string;
  bigFive?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  mmpiResilience?: number; // scale 0-100
  mmpiTruthScore?: number; // lies detected or not
  mmpiStatus?: string;
  quizTakenAt?: string;

  // Custom favorite academics
  favoritePhilosophers?: string;
  favoritePsychologists?: string;
  userPhotos?: string[];
  userPhotosVisibility?: string[];
  isDatingModeEnabled?: boolean;
  datingPreferences?: {
    genderInterest?: 'male' | 'female' | 'both' | 'all';
    minAge?: number;
    maxAge?: number;
  };
  compatibilityScore?: number;
  gender?: 'male' | 'female' | 'other';
  age?: number;
}

export interface FriendRequest {
  id: string; // "senderId_receiverId"
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaType: 'none' | 'image' | 'video' | 'youtube' | 'tiktok';
  mediaUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any; // Server timestamp or string
  likes?: string[]; // array of UIDs
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  participantAvatars?: string[];
  lastMessage?: string;
  lastMessageAt?: any;
}

export interface DMMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
  updatedAt?: any;
}

