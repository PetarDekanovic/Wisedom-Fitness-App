export interface Attachment {
  id: string;
  type: 'file' | 'youtube' | 'article' | 'google-drive';
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

export interface UserProfile {
  uid?: string;
  name: string;
  email?: string;
  height: number;
  currentWeight: number;
  targetWeight: number;
  stepGoal: number;
  shortTermGoal: string;
  longTermGoal: string;
  maxPullUps: number;
  oneRMWeighted: number;
  avatarUrl: string;
  seenQuoteIds?: string[];
  markedQuotes?: { id: string; date: string; wisdomGrade?: string; comment?: string }[];
  dailyExercises?: { id: string; name: string; completed: boolean }[];
  dailyExerciseHistory?: { date: string; completedCount: number; totalCount: number }[];
  role?: 'user' | 'admin';
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
  userId?: string;
  markedDate?: string;
  wisdomGrade?: string;
  comment?: string;
}
