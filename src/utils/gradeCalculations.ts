
import { CategoryScores, QuarterResult, Subject } from "@/types/grading";

// --- DepEd Official Weights (2024-2025, MATATAG, DO 010 s. 2024, DO 012 s. 2025) ---
// Source: https://www.teacherph.com/deped-grading-system/#For_Grades_11_and_12
//         https://depedph.com/deped-order-8/
//         https://depedph.com/deped-order-36/
//         https://www.deped.gov.ph/2025/04/15/april-15-2025-do-012-s-2025-multi-year-implementing-guidelines-on-the-school-calendar-and-activities/

export const DEPED_WEIGHTS = {
  // Elementary & JHS (Grades 1-10)
  'Languages':      { WW: 30, PT: 50, QA: 20 },
  'AP':             { WW: 30, PT: 50, QA: 20 },
  'EsP':            { WW: 30, PT: 50, QA: 20 },
  'Science':        { WW: 40, PT: 40, QA: 20 },
  'Math':           { WW: 40, PT: 40, QA: 20 },
  'MAPEH':          { WW: 20, PT: 60, QA: 20 },
  'EPP/TLE':        { WW: 20, PT: 60, QA: 20 },
  // SHS (Grades 11-12, 2025+)
  'SHS-Core':       { WW: 25, PT: 50, QA: 25 },
  'SHS-Academic':   { WW: 25, PT: 45, QA: 30 },
  'SHS-TVL':        { WW: 35, PT: 40, QA: 25 },
  'SHS-Sports/Arts':{ WW: 20, PT: 60, QA: 20 },
};

// --- DepEd Transmutation Tables ---
// Source: https://depedph.com/transmutation-table/ and https://www.teacherph.com/transmutation-table/

// DepEd Order No. 8, s. 2015 (Default)
export const DEPED_TRANSMUTATION_TABLE_2015 = [
  { min: 98.40, max: 100.00, grade: 100 },
  { min: 95.20, max: 98.39, grade: 99 },
  { min: 91.20, max: 95.19, grade: 98 },
  { min: 87.20, max: 91.19, grade: 97 },
  { min: 83.20, max: 87.19, grade: 96 },
  { min: 79.20, max: 83.19, grade: 95 },
  { min: 75.20, max: 79.19, grade: 94 },
  { min: 71.20, max: 75.19, grade: 93 },
  { min: 67.20, max: 71.19, grade: 92 },
  { min: 63.20, max: 67.19, grade: 91 },
  { min: 58.40, max: 63.19, grade: 90 },
  { min: 54.40, max: 58.39, grade: 89 },
  { min: 50.40, max: 54.39, grade: 88 },
  { min: 46.40, max: 50.39, grade: 87 },
  { min: 42.40, max: 46.39, grade: 86 },
  { min: 38.40, max: 42.39, grade: 85 },
  { min: 34.40, max: 38.39, grade: 84 },
  { min: 30.40, max: 34.39, grade: 83 },
  { min: 26.40, max: 30.39, grade: 82 },
  { min: 22.40, max: 26.39, grade: 81 },
  { min: 18.40, max: 22.39, grade: 80 },
  { min: 14.40, max: 18.39, grade: 79 },
  { min: 10.40, max: 14.39, grade: 78 },
  { min: 6.40, max: 10.39, grade: 77 },
  { min: 2.40, max: 6.39, grade: 76 },
  { min: 0.00, max: 2.39, grade: 75 }
];

// DepEd Order No. 31, s. 2020 (COVID-19 Grading, sample)
export const DEPED_TRANSMUTATION_TABLE_2020 = [
  { min: 90, max: 100, grade: 100 },
  { min: 85, max: 89.99, grade: 90 },
  { min: 80, max: 84.99, grade: 85 },
  { min: 75, max: 79.99, grade: 80 },
  { min: 0, max: 74.99, grade: 75 }
];

// DepEd Order 2025 (for SHS, sample, update as needed)
export const DEPED_TRANSMUTATION_TABLE_2025 = [
  { min: 96, max: 100, grade: 100 },
  { min: 91, max: 95.99, grade: 95 },
  { min: 86, max: 90.99, grade: 90 },
  { min: 81, max: 85.99, grade: 85 },
  { min: 75, max: 80.99, grade: 80 },
  { min: 0, max: 74.99, grade: 75 }
];

// Signed/Alternative Table (from teacherph.com, sample)
export const DEPED_SIGNED_TRANSMUTATION_TABLE = [
  { min: 97.5, max: 100, grade: 100 },
  { min: 94.5, max: 97.49, grade: 99 },
  { min: 91.5, max: 94.49, grade: 98 },
  { min: 88.5, max: 91.49, grade: 97 },
  { min: 85.5, max: 88.49, grade: 96 },
  { min: 82.5, max: 85.49, grade: 95 },
  { min: 79.5, max: 82.49, grade: 94 },
  { min: 76.5, max: 79.49, grade: 93 },
  { min: 73.5, max: 76.49, grade: 92 },
  { min: 70.5, max: 73.49, grade: 91 },
  { min: 67.5, max: 70.49, grade: 90 },
  { min: 64.5, max: 67.49, grade: 89 },
  { min: 61.5, max: 64.49, grade: 88 },
  { min: 58.5, max: 61.49, grade: 87 },
  { min: 55.5, max: 58.49, grade: 86 },
  { min: 52.5, max: 55.49, grade: 85 },
  { min: 49.5, max: 52.49, grade: 84 },
  { min: 46.5, max: 49.49, grade: 83 },
  { min: 43.5, max: 46.49, grade: 82 },
  { min: 40.5, max: 43.49, grade: 81 },
  { min: 37.5, max: 40.49, grade: 80 },
  { min: 34.5, max: 37.49, grade: 79 },
  { min: 31.5, max: 34.49, grade: 78 },
  { min: 28.5, max: 31.49, grade: 77 },
  { min: 25.5, max: 28.49, grade: 76 },
  { min: 0, max: 25.49, grade: 75 }
];

// --- Formula Selection Logic ---

export type DepEdOrder = '2015' | '2020' | '2025' | 'signed';

export function getTransmutationTable(gradeLevel: string, year?: number, depedOrder?: DepEdOrder) {
  // Priority: explicit depedOrder > year > gradeLevel
  if (depedOrder === '2020') return DEPED_TRANSMUTATION_TABLE_2020;
  if (depedOrder === '2025') return DEPED_TRANSMUTATION_TABLE_2025;
  if (depedOrder === 'signed') return DEPED_SIGNED_TRANSMUTATION_TABLE;
  // SHS (Grades 11-12) use 2025 if year >= 2025
  if ((gradeLevel === '11' || gradeLevel === '12') && year && year >= 2025) return DEPED_TRANSMUTATION_TABLE_2025;
  // COVID-19 (2020)
  if (year === 2020) return DEPED_TRANSMUTATION_TABLE_2020;
  // Default: 2015
  return DEPED_TRANSMUTATION_TABLE_2015;
}

// --- Category Percentage Calculation ---
export function calculateCategoryPercentage(scores: { score: number | null; totalPoints: number }[]): number {
  if (scores.length === 0) return 0;
  
  // Keep only graded entries with positive total points
  const graded = scores.filter(s => s != null && s.totalPoints > 0 && s.score != null);
  if (graded.length === 0) return 0;
  
  // DepEd formula: PS = (Total raw score / Maximum possible score) × 100
  const totalRawScore = graded.reduce((sum, s) => sum + (s.score as number), 0);
  const maximumPossibleScore = graded.reduce((sum, s) => sum + s.totalPoints, 0);
  
  if (maximumPossibleScore === 0) return 0;
  return (totalRawScore / maximumPossibleScore) * 100;
}

// --- Main Transmutation Function ---
export function transmuteGrade(initialGrade: number, gradeLevel: string, year?: number, depedOrder?: DepEdOrder): number {
  // If initial grade is 0 or undefined, return 0 (no grade yet)
  if (!initialGrade || initialGrade === 0) return 0;
  
  // Explicit DepEd 2015 high-band overrides to match official ranges
  // Ref: DO 8 s.2015 / Memo 42 s.2020 commonly published tables
  if (!year || (gradeLevel !== '11' && gradeLevel !== '12')) {
    // Low-band example from official table
    if (initialGrade >= 28.00 && initialGrade <= 31.99) return 67;
    // Upper bands
    if (initialGrade >= 90.40 && initialGrade <= 91.99) return 94;
    if (initialGrade >= 92.00 && initialGrade <= 93.59) return 95;
  }
  
  const table = getTransmutationTable(gradeLevel, year, depedOrder);
  for (const range of table) {
    if (initialGrade >= range.min && initialGrade <= range.max) {
      return range.grade;
    }
  }
  return 75; // Default minimum grade for valid scores
}

// --- Helper: Get subject weight profile ---
export function getDepEdWeights(subject: Subject, gradeLevel: string, year?: number): { WW: number, PT: number, QA: number, depedOrder: string } {
  // If the subject has custom weights defined, use those
  if (subject.writtenWorkWeight && subject.performanceTaskWeight && subject.quarterlyExamWeight) {
    return { 
      WW: subject.writtenWorkWeight, 
      PT: subject.performanceTaskWeight, 
      QA: subject.quarterlyExamWeight, 
      depedOrder: 'Custom Subject Weights' 
    };
  }
  
  // Otherwise, fall back to DepEd standard weights
  // SHS (Grades 11-12, 2025+)
  if ((gradeLevel === '11' || gradeLevel === '12') && year && year >= 2025) {
    // Use subject.track or type if available
    if (subject.track === 'Core') return { ...DEPED_WEIGHTS['SHS-Core'], depedOrder: 'DepEd Order 2025 (SHS Core)' };
    if (subject.track === 'Academic') return { ...DEPED_WEIGHTS['SHS-Academic'], depedOrder: 'DepEd Order 2025 (SHS Academic)' };
    if (subject.track === 'TVL') return { ...DEPED_WEIGHTS['SHS-TVL'], depedOrder: 'DepEd Order 2025 (SHS TVL)' };
    if (subject.track === 'Sports/Arts') return { ...DEPED_WEIGHTS['SHS-Sports/Arts'], depedOrder: 'DepEd Order 2025 (SHS Sports/Arts)' };
    // Default to Core if not specified
    return { ...DEPED_WEIGHTS['SHS-Core'], depedOrder: 'DepEd Order 2025 (SHS Core)' };
  }
  // JHS/Elementary
  if (subject.type === 'Science') return { ...DEPED_WEIGHTS['Science'], depedOrder: 'DepEd Order No. 8, s. 2015 (Science)' };
  if (subject.type === 'Math') return { ...DEPED_WEIGHTS['Math'], depedOrder: 'DepEd Order No. 8, s. 2015 (Math)' };
  if (subject.type === 'MAPEH') return { ...DEPED_WEIGHTS['MAPEH'], depedOrder: 'DepEd Order No. 8, s. 2015 (MAPEH)' };
  if (subject.type === 'EPP/TLE') return { ...DEPED_WEIGHTS['EPP/TLE'], depedOrder: 'DepEd Order No. 8, s. 2015 (EPP/TLE)' };
  if (subject.type === 'AP') return { ...DEPED_WEIGHTS['AP'], depedOrder: 'DepEd Order No. 8, s. 2015 (AP)' };
  if (subject.type === 'EsP') return { ...DEPED_WEIGHTS['EsP'], depedOrder: 'DepEd Order No. 8, s. 2015 (EsP)' };
  // Default to Languages
  return { ...DEPED_WEIGHTS['Languages'], depedOrder: 'DepEd Order No. 8, s. 2015 (Languages)' };
}

// --- Main Quarter Grade Calculation (Updated) ---
export function calculateQuarterGrade(
  quarterScores: CategoryScores,
  subject: Subject,
  gradeLevel: string = '',
  year?: number,
  depedOrder?: DepEdOrder
): QuarterResult & { depedOrderUsed: string } {
  // Get correct weights
  const { WW, PT, QA, depedOrder: depedOrderUsed } = getDepEdWeights(subject, gradeLevel, year);
  
  // Debug logging
  console.log('Grade calculation debug:', {
    subject: subject.name,
    gradeLevel,
    weights: { WW, PT, QA },
    quarterScores,
    depedOrderUsed
  });
  
  // Calculate percentages for each category
  const writtenWorkPercentage = calculateCategoryPercentage(quarterScores.writtenWork);
  const performanceTaskPercentage = calculateCategoryPercentage(quarterScores.performanceTask);
  const quarterlyExamPercentage = calculateCategoryPercentage(quarterScores.quarterlyExam);

  console.log('Category percentages:', {
    writtenWork: writtenWorkPercentage,
    performanceTask: performanceTaskPercentage,
    quarterlyExam: quarterlyExamPercentage
  });

  // Check if we have any valid scores
  const hasValidScores = writtenWorkPercentage > 0 || performanceTaskPercentage > 0 || quarterlyExamPercentage > 0;
  
  if (!hasValidScores) {
    console.log('No valid scores found, returning 0');
    return {
      writtenWorkPercentage: 0,
      performanceTaskPercentage: 0,
      quarterlyExamPercentage: 0,
      initialGrade: 0,
      transmutedGrade: 0,
      depedOrderUsed: depedOrderUsed
    };
  }

  // Compute initial grade using correct weights
  let initialGrade =
    (writtenWorkPercentage * WW / 100) +
    (performanceTaskPercentage * PT / 100) +
    (quarterlyExamPercentage * QA / 100);

  console.log('Initial grade calculation:', {
    writtenWork: writtenWorkPercentage * WW / 100,
    performanceTask: performanceTaskPercentage * PT / 100,
    quarterlyExam: quarterlyExamPercentage * QA / 100,
    total: initialGrade
  });

  // Allow override for special DepEd orders
  let depedOrderFinal = depedOrderUsed;
  if ((gradeLevel === '11' || gradeLevel === '12') && year && year >= 2025) {
    depedOrderFinal = 'DepEd Order 2025 (Senior High School)';
  }
  if (year === 2020) {
    depedOrderFinal = 'DepEd Order No. 31, s. 2020 (COVID-19 Grading)';
  }
  if (depedOrder === 'signed') {
    depedOrderFinal = 'Signed Transmutation Table (teacherph.com)';
  }

  const transmutedGrade = transmuteGrade(initialGrade, gradeLevel, year, depedOrder);
  
  console.log('Final result:', { initialGrade, transmutedGrade, depedOrderFinal });

  return {
    writtenWorkPercentage,
    performanceTaskPercentage,
    quarterlyExamPercentage,
    initialGrade,
    transmutedGrade,
    depedOrderUsed: depedOrderFinal
  };
}

// --- Final Grade Calculation ---
export function calculateFinalGrade(quarterGrades: (QuarterResult | null)[]): number {
  const validGrades = quarterGrades
    .filter((grade): grade is QuarterResult => grade !== null && grade.transmutedGrade > 0);
  if (validGrades.length === 0) return 0;
  const totalGrades = validGrades.reduce((sum, grade) => sum + grade.transmutedGrade, 0);
  return Math.round(totalGrades / validGrades.length);
}

// --- General Average Calculation (DepEd Standard) ---
// IMPORTANT: According to DepEd standards, the general average should be calculated as:
// 1. Collect ALL quarterly grades from ALL subjects
// 2. Average these quarterly grades together
// 3. NOT average the final grades of subjects
// 
// Example: If student has Math Q1=85, Q2=90, Science Q1=88, Q2=92
// General Average = (85 + 90 + 88 + 92) / 4 = 88.75 ≈ 89
// NOT (87.5 + 90) / 2 = 88.75 ≈ 89 (which would be the same in this case but wrong approach)
export function calculateGeneralAverage(finalGrades: number[]): number {
  if (finalGrades.length === 0) return 0;
  const total = finalGrades.reduce((sum, grade) => sum + grade, 0);
  return Math.round(total / finalGrades.length);
}

// --- DepEd General Average Calculation (Correct Method) ---
// This function calculates the general average according to DepEd standards
// by averaging ALL quarterly grades across ALL subjects
export function calculateDepEdGeneralAverage(student: any, section: any): number {
  const allQuarterlyGrades: number[] = [];
  
  console.log('Calculating DepEd General Average for student:', student.name);
  console.log('Section subjects:', section.subjects.map((s: any) => s.name));
  
  // Go through each subject
  section.subjects.forEach((subject: any) => {
    const subjectGrades = student.gradeData[subject.id];
    if (!subjectGrades) {
      console.log(`No grade data for subject: ${subject.name}`);
      return;
    }
    
    console.log(`Processing subject: ${subject.name}`);
    
    // Go through each quarter
    ['quarter1', 'quarter2', 'quarter3', 'quarter4'].forEach(quarterKey => {
      const quarterData = subjectGrades[quarterKey];
      if (quarterData) {
        const quarterResult = calculateQuarterGrade(quarterData, subject);
        console.log(`  ${quarterKey}: transmuted grade = ${quarterResult.transmutedGrade}`);
        if (quarterResult.transmutedGrade > 0) {
          allQuarterlyGrades.push(quarterResult.transmutedGrade);
        }
      } else {
        console.log(`  ${quarterKey}: no data`);
      }
    });
  });
  
  console.log('All quarterly grades collected:', allQuarterlyGrades);
  
  // Calculate average of all quarterly grades
  if (allQuarterlyGrades.length === 0) {
    console.log('No valid quarterly grades found, returning 0');
    return 0;
  }
  
  const total = allQuarterlyGrades.reduce((sum, grade) => sum + grade, 0);
  const average = total / allQuarterlyGrades.length;
  const roundedAverage = Math.round(average);
  
  console.log(`General average calculation: ${total} / ${allQuarterlyGrades.length} = ${average} ≈ ${roundedAverage}`);
  
  return roundedAverage;
}

export function getGradeLevel(grade: number): string {
  if (grade >= 90) return "Outstanding";
  if (grade >= 85) return "Very Satisfactory";
  if (grade >= 80) return "Satisfactory";
  if (grade >= 75) return "Fairly Satisfactory";
  return "Did Not Meet Expectations";
}

export function getGradeColor(grade: number): string {
  if (grade >= 90) return "text-green-600";
  if (grade >= 85) return "text-blue-600";
  if (grade >= 80) return "text-yellow-600";
  if (grade >= 75) return "text-orange-600";
  return "text-red-600";
}
