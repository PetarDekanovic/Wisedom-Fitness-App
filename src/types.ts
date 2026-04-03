export interface Workout {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface Set {
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
