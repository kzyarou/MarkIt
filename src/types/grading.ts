
export interface Assessment {
  id: string;
  name: string;
  category: 'writtenWork' | 'performanceTask' | 'quarterlyExam';
  quarter: 'quarter1' | 'quarter2' | 'quarter3' | 'quarter4';
  totalPoints: number;
}

export interface Subject {
  id: string;
  name: string;
  writtenWorkWeight: number;
  performanceTaskWeight: number;
  quarterlyExamWeight: number;
  assessments?: Assessment[]; // Centralized list of assessments for this subject
  /**
   * For SHS: 'Core', 'Academic', 'TVL', 'Sports/Arts'
   * For JHS/Elementary: use 'type' for subject groupings (e.g., 'Science', 'Math', 'MAPEH', etc.)
   */
  track?: 'Core' | 'Academic' | 'TVL' | 'Sports/Arts';
  type?: 'Languages' | 'AP' | 'EsP' | 'Science' | 'Math' | 'MAPEH' | 'EPP/TLE';
}

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  totalPoints: number;
}

export interface CategoryScores {
  writtenWork: ScoreEntry[];
  performanceTask: ScoreEntry[];
  quarterlyExam: ScoreEntry[];
}

export interface QuarterGrades {
  quarter1: CategoryScores;
  quarter2: CategoryScores;
  quarter3: CategoryScores;
  quarter4: CategoryScores;
}

export interface StudentGradeData {
  [subjectId: string]: QuarterGrades;
}

export interface Student {
  id: string;
  name: string;
  lrn?: string;
  gradeData: StudentGradeData;
  gender?: 'male' | 'female';
  connectedUserId?: string;
  connectedUserLRN?: string;
  connectedUserEmail?: string;
}

export interface Section {
  id: string;
  name: string;
  gradeLevel: string;
  students: Student[];
  subjects: Subject[];
  createdBy: string;
  createdAt: string;
  classification?: 'junior' | 'senior'; // Added for DepEd logic
}

export interface Grade {
  id: string;
  userId: string;
  subject: string;
  quarter: number;
  score: number;
  sectionId: string;
  createdAt: string;
  hidden?: boolean;
}

export interface QuarterResult {
  writtenWorkPercentage: number;
  performanceTaskPercentage: number;
  quarterlyExamPercentage: number;
  initialGrade: number;
  transmutedGrade: number;
}

export interface SubjectFinalGrade {
  subjectName: string;
  quarters: {
    quarter1: QuarterResult | null;
    quarter2: QuarterResult | null;
    quarter3: QuarterResult | null;
    quarter4: QuarterResult | null;
  };
  finalGrade: number;
}

export interface StudentConnection {
  id: string;
  studentId: string;
  userId: string;
  userLRN: string;
  userEmail: string;
  sectionId: string;
  sectionName: string;
  gradeLevel: string;
  connectedAt: string;
  connectedBy: string;
  isActive: boolean;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  backgroundColor?: string; // Optional background color for the card
}
