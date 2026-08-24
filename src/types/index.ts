export type Category = "HTML" | "CSS" | "JavaScript" | "Python";

export type QuestionType = "mcq" | "truefalse" | "code" | "drag" | "fix";

export type MCQQuestion = {
  id: number;
  type: "mcq";
  category: Category;
  topic: string;
  question: string;
  options: string[];
  answer: string;
  hint: string;
  points: number;
};

export type TrueFalseQuestion = {
  id: number;
  type: "truefalse";
  category: Category;
  topic: string;
  question: string;
  answer: boolean;
  hint: string;
  points: number;
};

export type CodeQuestion = {
  id: number;
  type: "code";
  category: Category;
  topic: string;
  question: string;
  placeholder?: string;
  accepted: string[];
  hint: string;
  points: number;
};

export type DragQuestion = {
  id: number;
  type: "drag";
  category: Category;
  topic: string;
  question: string;
  tokens: string[];
  correctOrder: string[];
  hint: string;
  points: number;
};

export type FixQuestion = {
  id: number;
  type: "fix";
  category: Category;
  topic: string;
  question: string;
  brokenCode: string;
  accepted: string[];
  hint: string;
  points: number;
};

export type Question =
  | MCQQuestion
  | TrueFalseQuestion
  | CodeQuestion
  | DragQuestion
  | FixQuestion;

export type SessionAnswer =
  | { type: "mcq"; selected: number | null }
  | { type: "truefalse"; selected: boolean | null }
  | { type: "code"; value: string }
  | { type: "fix"; value: string }
  | { type: "dragdrop"; order: number[]; touched: boolean };

export type ExamResult = {
  id: number;
  student_name: string;
  score: number;
  total_points: number;
  violation_count: number;
  duration_minutes: number;
  answers: Record<string, SessionAnswer>;
  category_order: Record<Category, number[]>;
  option_orders: Record<string, number[]>;
  drag_orders: Record<string, number[]>;
  group_code?: string;
  start_time: string;
  submitted_at: string;
  created_at: string;
};

export type ExamGroup = {
  id?: number | string;
  group_name: string;
  group_code: string;
  counts: Record<Category, number>;
  duration_minutes: number;
  max_students: number; // min 1, max 30
  is_active: boolean;
  created_at?: string;
};

export type ExamSettings = {
  counts: Record<Category, number>;
  durationMinutes: number;
  maxViolations?: number;
  penaltyPerViolation?: number;
  enforceFullscreen?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
};

export type TabType = "dashboard" | "groups" | "results" | "questions" | "settings";
