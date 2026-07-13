export enum LessonType {
  Normal = 'NORMAL',
  Poem = 'POEM'
}

export enum ExerciseType {
  MultipleChoice = 'MULTIPLE_CHOICE',
  FillInTheBlank = 'FILL_IN_THE_BLANK',
  Matching = 'MATCHING',
  TrueFalse = 'TRUE_FALSE'
}

export interface MatchingPair {
  id: string;
  source: string; // e.g. "بر الوالدين"
  target: string; // e.g. "طاعة الوالدين واحترامهما"
}

export interface Question {
  id: string;
  instruction: string;
  type: ExerciseType;
  options?: string[]; // for multiple choice
  correctAnswer: string | string[] | boolean; // single string for blank/choice, array for matching or list
  matchingPairs?: MatchingPair[]; // for matching questions
  userAnswer?: string | string[] | boolean; // dynamically filled by the student
  isCorrect?: boolean;
}

export interface PoemStanza {
  id: string;
  hemistich1: string; // الصدر
  hemistich2: string; // العجز
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  type: LessonType;
  newWords: string[];
  content: string; // Main text for normal lessons
  stanzas?: PoemStanza[]; // For poems
  questions: Question[];
  audioUrl?: string; // Optional predefined, else we use TTS
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  color: string; // Playful color for children's UI
  iconName: string; // Lucide icon name
  lessons: Lesson[];
}

export interface StudentProgress {
  score: number;
  completedLessons: string[]; // lessonIds
  exerciseScores: Record<string, number>; // questionId -> score
}
