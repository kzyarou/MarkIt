import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const FAQS = [
  // General
  {
    q: 'How are grades calculated?',
    a: (
      <>
        Grades are calculated using the latest DepEd formulas and transmutation tables, based on the subject's track/type and grade level. The app automatically applies the correct weights and formulas for each subject.
      </>
    )
  },
  {
    q: 'What is the official DepEd formula for grade calculation?',
    a: (
      <>
        <div className="mb-2">
          <b>DepEd Formula (General):</b>
          <div className="bg-muted rounded p-2 my-2 text-sm">
            <b>Final Grade = (WW% × WW Weight) + (PT% × PT Weight) + (QA% × QA Weight)</b>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            Where WW = Written Work, PT = Performance Tasks, QA = Quarterly Assessment. Weights depend on subject and grade level.
          </div>
        </div>
        <div className="mb-2">
          <b>Example Code Snippet:</b>
          <pre className="bg-black text-white rounded p-2 text-xs overflow-x-auto">
{`const finalGrade =
  (writtenWorkPercentage * writtenWorkWeight / 100) +
  (performanceTaskPercentage * performanceTaskWeight / 100) +
  (quarterlyExamPercentage * quarterlyExamWeight / 100);`}
          </pre>
        </div>
        <div className="mb-2">
          <b>Transmutation Table:</b> After computing the initial grade, it is transmuted using the official DepEd table for the year/level.
        </div>
      </>
    )
  },
  {
    q: 'Can I see the actual code used for DepEd grade calculation?',
    a: (
      <>
        <div className="mb-2">Yes! Here is a snippet from the app's code (TypeScript):</div>
        <pre className="bg-black text-white rounded p-2 text-xs overflow-x-auto">
{`export function calculateQuarterGrade(
  quarterScores: CategoryScores,
  subject: Subject,
  gradeLevel: string = '',
  year?: number,
  depedOrder?: DepEdOrder
): QuarterResult & { depedOrderUsed: string } {
  const { WW, PT, QA } = getDepEdWeights(subject, gradeLevel, year);
  const writtenWorkPercentage = calculateCategoryPercentage(quarterScores.writtenWork);
  const performanceTaskPercentage = calculateCategoryPercentage(quarterScores.performanceTask);
  const quarterlyExamPercentage = calculateCategoryPercentage(quarterScores.quarterlyExam);
  let initialGrade =
    (writtenWorkPercentage * WW / 100) +
    (performanceTaskPercentage * PT / 100) +
    (quarterlyExamPercentage * QA / 100);
  const transmutedGrade = transmuteGrade(initialGrade, gradeLevel, year, depedOrder);
  return {
    writtenWorkPercentage,
    performanceTaskPercentage,
    quarterlyExamPercentage,
    initialGrade,
    transmutedGrade,
    depedOrderUsed: 'DepEd Order No. 8, s. 2015',
  };
}`}
        </pre>
        <div className="text-xs text-muted-foreground mt-2">You can find this in <b>src/utils/gradeCalculations.ts</b>.</div>
      </>
    )
  },
  // DepEd Orders
  {
    q: 'Which DepEd Orders and Memoranda does this app follow?',
    a: (
      <>
        <div className="mb-2">The app follows the latest and most relevant DepEd Orders and Memoranda for grading and assessment, including:</div>
        <ul className="list-disc pl-6 text-sm mb-2">
          <li>
            <a href="https://depedph.com/deped-order-8/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
              DepEd Order No. 8, s. 2015 <ExternalLink className="inline w-3 h-3" />
            </a> (Policy Guidelines on Classroom Assessment)
          </li>
          <li>
            <a href="https://depedph.com/deped-order-36/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
              DepEd Order No. 36 <ExternalLink className="inline w-3 h-3" />
            </a> (Grading in the K to 12 Basic Education Program)
          </li>
          <li>
            <a href="https://www.deped.gov.ph/2020/10/02/do-031-s-2020/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
              DepEd Order No. 31, s. 2020 <ExternalLink className="inline w-3 h-3" />
            </a> (Interim Guidelines for Assessment and Grading in Light of the COVID-19 Pandemic)
          </li>
          <li>
            <a href="https://www.teacherph.com/deped-grading-system/#For_Grades_11_and_12" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
              DepEd Order 2025 (for SHS) <ExternalLink className="inline w-3 h-3" />
            </a> (New reference for Senior High School grade calculation)
          </li>
          <li>
            <a href="https://www.teacherph.com/deped-grading-system/#google_vignette" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
              DepEd Memorandum No. 60, s. 2015 <ExternalLink className="inline w-3 h-3" />
            </a> (What current teachers follow)
          </li>
        </ul>
        <div className="text-xs text-muted-foreground">All formulas and tables are cross-referenced with <a href="https://www.teacherph.com/deped-grading-system/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">teacherph.com</a> and <a href="https://depedph.com/transmutation-table/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">depedph.com</a>.</div>
      </>
    )
  },
  // Existing
  {
    q: 'What is the difference between subject track and type?',
    a: 'For Senior High School (Grades 11-12), \'track\' refers to Core, Academic, TVL, or Sports/Arts. For JHS/Elementary, \'type\' refers to Languages, AP, EsP, Science, Math, MAPEH, or EPP/TLE. These determine the grading formula used.'
  },
  {
    q: 'Are the grading formulas and tables up to date with DepEd Orders?',
    a: 'Yes. The app uses the latest DepEd Orders, including 2025 for SHS, and references official sources for all calculations.'
  },
  {
    q: 'Can I see which DepEd Order or formula was used for a grade?',
    a: 'Yes. The app displays the DepEd Order or table used for each grade calculation in the UI for transparency.'
  },
  {
    q: 'How do I add a subject with the correct track/type?',
    a: 'When adding a subject, select the appropriate track (for SHS) or type (for JHS/Elementary) in the subject form. This ensures the correct grading formula is used.'
  },
  {
    q: 'Who can see my grades and records?',
    a: 'Only you and your connected teachers/students can see your grades and records. Data privacy is a priority.'
  },
  {
    q: 'Where can I get more help?',
    a: 'Visit the official DepEd website or contact your school administrator for more information. You can also leave feedback in the app.'
  }
];

export default function FAQPage() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-background pb-20 px-4">
      <div className="pt-6 pb-2 max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <h1 className="text-3xl font-extrabold tracking-tight text-center mb-4">Frequently Asked Questions</h1>
        <div className="space-y-3 text-base max-w-2xl mx-auto">
          {FAQS.map((item, idx) => (
            <div key={idx} className="border rounded-lg bg-card">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold focus:outline-none"
                onClick={() => toggle(idx)}
                aria-expanded={openIndex === idx}
              >
                <span>{item.q}</span>
                {openIndex === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openIndex === idx && (
                <div className="px-4 pb-4 text-gray-700 animate-fade-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 