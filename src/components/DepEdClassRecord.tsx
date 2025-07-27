import React, { useState } from 'react';
import { Section, Student } from '@/types/grading';
import { calculateQuarterGrade } from '@/utils/gradeCalculations';

interface DepEdClassRecordProps {
  section: Section;
}

// Helper to gather all unique assessments for a category
function getUniqueAssessments(students: Student[], subjectId: string, quarter: string, category: 'writtenWork' | 'performanceTask' | 'quarterlyExam') {
  const allAssessments: { id: string, name: string, totalPoints: number }[] = [];
  students.forEach(student => {
    const gradeData = student.gradeData[subjectId]?.[quarter];
    if (gradeData && gradeData[category]) {
      gradeData[category].forEach((a: any) => {
        if (!allAssessments.find(x => x.id === a.id)) {
          allAssessments.push({ id: a.id, name: a.name, totalPoints: a.totalPoints });
        }
      });
    }
  });
  return allAssessments;
}

function getQuarterData(student: Student, subjectId: string, quarter: string, subject: any) {
  const gradeData = student.gradeData[subjectId]?.[quarter];
  if (!gradeData) return {
    WW: [], WW_Total: '-', WW_PS: '-', WW_WS: '-',
    PT: [], PT_Total: '-', PT_PS: '-', PT_WS: '-',
    QE: [], QE_Total: '-', QE_PS: '-', QE_WS: '-',
    initial: '-', QG: '-'
  };
  const result = calculateQuarterGrade(gradeData, subject);
  const WW_Total = gradeData.writtenWork && gradeData.writtenWork.length > 0 ? gradeData.writtenWork.reduce((sum: number, w: any) => sum + (w.score || 0), 0) : '-';
  const PT_Total = gradeData.performanceTask && gradeData.performanceTask.length > 0 ? gradeData.performanceTask.reduce((sum: number, p: any) => sum + (p.score || 0), 0) : '-';
  const QE_Total = gradeData.quarterlyExam && gradeData.quarterlyExam.length > 0 ? gradeData.quarterlyExam.reduce((sum: number, q: any) => sum + (q.score || 0), 0) : '-';
  return {
    WW: gradeData.writtenWork || [],
    WW_Total,
    WW_PS: result.writtenWorkPercentage?.toFixed(2) ?? '-',
    WW_WS: (result.writtenWorkPercentage * (subject.writtenWorkWeight / 100)).toFixed(2),
    PT: gradeData.performanceTask || [],
    PT_Total,
    PT_PS: result.performanceTaskPercentage?.toFixed(2) ?? '-',
    PT_WS: (result.performanceTaskPercentage * (subject.performanceTaskWeight / 100)).toFixed(2),
    QE: gradeData.quarterlyExam || [],
    QE_Total,
    QE_PS: result.quarterlyExamPercentage?.toFixed(2) ?? '-',
    QE_WS: (result.quarterlyExamPercentage * (subject.quarterlyExamWeight / 100)).toFixed(2),
    initial: result.initialGrade?.toFixed(2) ?? '-',
    QG: result.transmutedGrade ?? '-',
  };
}

export const DepEdClassRecord: React.FC<DepEdClassRecordProps> = ({ section }) => {
  // Add quarter selector state
  const [quarter, setQuarter] = useState<'quarter1' | 'quarter2' | 'quarter3' | 'quarter4'>('quarter2');
  const subject = section.subjects[0];
  const students = section.students;
  const subjectId = subject.id;

  // Use subject.assessments as the source of truth for columns
  const allAssessments = (subject.assessments || []).filter(a => a.quarter === quarter);
  const uniqueWW = allAssessments.filter(a => a.category === 'writtenWork');
  const uniquePT = allAssessments.filter(a => a.category === 'performanceTask');
  const uniqueQE = allAssessments.filter(a => a.category === 'quarterlyExam');

  // Helper to get highest possible score for each assessment
  function getHighestPossible(assessments: { id: string, name: string, totalPoints: number }[]) {
    return assessments.map(a => a.totalPoints);
  }
  const highestWW = getHighestPossible(uniqueWW);
  const highestPT = getHighestPossible(uniquePT);
  const highestQE = getHighestPossible(uniqueQE);

  // Calculate totals for highest possible scores
  const highestWWTotal = highestWW.length > 0 ? highestWW.reduce((a, b) => a + b, 0) : '-';
  const highestPTTotal = highestPT.length > 0 ? highestPT.reduce((a, b) => a + b, 0) : '-';
  const highestQETotal = highestQE.length > 0 ? highestQE.reduce((a, b) => a + b, 0) : '-';

  // Column counts for summary columns
  const summaryCols = 3; // Total, PS, WS

  // Calculate class general average for the selected quarter and subject
  const studentQuarterlyGrades = students.map(student => {
    const qData = getQuarterData(student, subjectId, quarter, subject);
    const qg = parseFloat(qData.QG);
    return isNaN(qg) ? null : qg;
  }).filter(g => g !== null) as number[];
  const classGeneralAverage = studentQuarterlyGrades.length > 0 ? (studentQuarterlyGrades.reduce((a, b) => a + b, 0) / studentQuarterlyGrades.length).toFixed(2) : '-';

  return (
    <div className="bg-white text-black p-2 print:p-2 font-sans">
      {/* Quarter Selector */}
      <div className="flex items-center gap-2 mb-2 print:hidden">
        <label htmlFor="quarter-select" className="font-semibold">Select Quarter:</label>
        <select
          id="quarter-select"
          value={quarter}
          onChange={e => setQuarter(e.target.value as any)}
          className="border border-gray-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 rounded px-2 py-1"
        >
          <option value="quarter1">Quarter 1</option>
          <option value="quarter2">Quarter 2</option>
          <option value="quarter3">Quarter 3</option>
          <option value="quarter4">Quarter 4</option>
        </select>
      </div>
      {/* Header Info */}
      <div className="flex items-center justify-between border-2 border-black p-2 mb-2">
        <div className="flex items-center gap-2">
          <img src="/school-badge.png" alt="School Logo" className="h-16 w-16" />
          <div className="text-center">
            <div className="font-bold text-lg leading-tight">Class Record</div>
            <div className="text-xs">(Pursuant to DepEd Order 8 series of 2015)</div>
          </div>
        </div>
        <img src="/graduation-cap-svgrepo-com.svg" alt="DepEd Logo" className="h-12 w-24 object-contain" />
      </div>
      <div className="grid grid-cols-8 gap-2 text-xs mb-2">
        <div>SECOND QUARTER</div>
        <div>GRADE & SECTION: <span className="font-semibold">{section.name}</span></div>
        <div>TEACHER: <span className="font-semibold">CLEO N. BELANDRES</span></div>
        <div>SUBJECT: <span className="font-semibold">{subject.name}</span></div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-2 border-black text-[10px]">
          <thead>
            {/* Main group headers */}
            <tr>
              <th rowSpan={2} className="border-2 border-black px-1 py-1 align-middle">#</th>
              <th rowSpan={2} className="border-2 border-black px-1 py-1 align-middle">LEARNERS' NAMES</th>
              <th colSpan={uniqueWW.length + summaryCols} className="border-2 border-black px-1 py-1 align-middle">WRITTEN WORKS(40%)</th>
              <th colSpan={uniquePT.length + summaryCols} className="border-2 border-black px-1 py-1 align-middle">PERFORMANCE TASKS(60%)</th>
              <th colSpan={uniqueQE.length + summaryCols} className="border-2 border-black px-1 py-1 align-middle">QUARTERLY EXAMS</th>
              <th rowSpan={2} className="border-2 border-black px-1 py-1 align-middle">Initial<br/>Grade</th>
              <th rowSpan={2} className="border-2 border-black px-1 py-1 align-middle">Quarterly<br/>Grade</th>
              <th rowSpan={2} className="border-2 border-black px-1 py-1 align-middle">Remarks</th>
            </tr>
            {/* Item numbers and summary columns */}
            <tr>
              {/* WW item numbers */}
              {uniqueWW.map((a, i) => (
                <th key={`ww-activity-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{i + 1}</th>
              ))}
              <th className="border-2 border-black px-1 py-1">Total</th>
              <th className="border-2 border-black px-1 py-1">PS</th>
              <th className="border-2 border-black px-1 py-1">WS</th>
              {/* PT item numbers */}
              {uniquePT.map((a, i) => (
                <th key={`pt-activity-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{i + 1}</th>
              ))}
              <th className="border-2 border-black px-1 py-1">Total</th>
              <th className="border-2 border-black px-1 py-1">PS</th>
              <th className="border-2 border-black px-1 py-1">WS</th>
              {/* QE item numbers */}
              {uniqueQE.map((a, i) => (
                <th key={`qe-activity-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{i + 1}</th>
              ))}
              <th className="border-2 border-black px-1 py-1">Total</th>
              <th className="border-2 border-black px-1 py-1">PS</th>
              <th className="border-2 border-black px-1 py-1">WS</th>
            </tr>
          </thead>
          <tbody>
            {/* Activity label row (e.g., WW1, PT1, QE1) */}
            <tr>
              <td className="border-2 border-black px-1 py-1"></td>
              <td className="border-2 border-black px-1 py-1"></td>
              {uniqueWW.map((a, i) => (
                <td key={`ww-label-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">WW{i + 1}</td>
              ))}
              <td className="border-2 border-black px-1 py-1 text-center">-</td>
              <td className="border-2 border-black px-1 py-1 text-center">-</td>
              <td className="border-2 border-black px-1 py-1 text-center">-</td>
              {uniquePT.map((a, i) => (
                <td key={`pt-label-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">PT{i + 1}</td>
              ))}
              <td className="border-2 border-black px-1 py-1 text-center">-</td>
              <td className="border-2 border-black px-1 py-1 text-center">-</td>
              <td className="border-2 border-black px-1 py-1 text-center">-</td>
              {uniqueQE.map((a, i) => (
                <td key={`qe-label-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">QE{i + 1}</td>
              ))}
              <td className="border-2 border-black px-1 py-1 text-center">-</td>
              <td className="border-2 border-black px-1 py-1 text-center">-</td>
              <td className="border-2 border-black px-1 py-1 text-center">-</td>
              <td className="border-2 border-black px-1 py-1 text-center"></td>
              <td className="border-2 border-black px-1 py-1 text-center"></td>
            </tr>
            {/* HIGHEST POSSIBLE SCORE row */}
            <tr>
              <td className="border-2 border-black px-1 py-1"></td>
              <td className="border-2 border-black px-1 py-1 font-bold text-left">HIGHEST POSSIBLE SCORE</td>
              {uniqueWW.map((a, i) => (
                <td key={`ww-max-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{a.totalPoints ?? '-'}</td>
              ))}
              <td className="border-2 border-black px-1 py-1 text-center">{highestWWTotal}</td>
              <td className="border-2 border-black px-1 py-1 text-center">100.00</td>
              <td className="border-2 border-black px-1 py-1 text-center bg-yellow-200 font-bold">40%</td>
              {uniquePT.map((a, i) => (
                <td key={`pt-max-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{a.totalPoints ?? '-'}</td>
              ))}
              <td className="border-2 border-black px-1 py-1 text-center">{highestPTTotal}</td>
              <td className="border-2 border-black px-1 py-1 text-center">100.00</td>
              <td className="border-2 border-black px-1 py-1 text-center bg-yellow-200 font-bold">60%</td>
              {uniqueQE.map((a, i) => (
                <td key={`qe-max-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{a.totalPoints ?? '-'}</td>
              ))}
              <td className="border-2 border-black px-1 py-1 text-center">{highestQETotal}</td>
              <td className="border-2 border-black px-1 py-1 text-center">100.00</td>
              <td className="border-2 border-black px-1 py-1 text-center bg-yellow-200 font-bold">20%</td>
              <td className="border-2 border-black px-1 py-1 text-center"></td>
              <td className="border-2 border-black px-1 py-1 text-center"></td>
            </tr>
            {/* MALE group header row */}
            <tr>
              <td className="border-2 border-black px-1 py-1"></td>
              <td className="border-2 border-black px-1 py-1 font-bold text-left">MALE</td>
              {Array.from({ length: uniqueWW.length + summaryCols + uniquePT.length + summaryCols + uniqueQE.length + summaryCols + 2 }).map((_, i) => (
                <td key={`empty-male-header-${String(i)}`} className="border-2 border-black px-1 py-1"></td>
              ))}
            </tr>
            {/* Male students (first half for demo) */}
            {students.slice(0, Math.ceil(students.length / 2)).map((student, idx) => {
              const qData = getQuarterData(student, subjectId, quarter, subject);
              const qg = parseFloat(qData.QG);
              return (
                <tr key={student.id}>
                  <td className="border-2 border-black px-1 py-1 text-center">{idx + 1}</td>
                  <td className="border-2 border-black px-1 py-1 whitespace-nowrap text-left">{student.name}</td>
                  {/* WW scores */}
                  {uniqueWW.map((a, i) => {
                    const found = student.gradeData[subjectId]?.[quarter]?.writtenWork?.find((w: any) => w.id === a.id);
                    return <td key={`ww-score-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{found ? found.score : '-'}</td>;
                  })}
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.WW_Total}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.WW_PS}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.WW_WS}</td>
                  {/* PT scores */}
                  {uniquePT.map((a, i) => {
                    const found = student.gradeData[subjectId]?.[quarter]?.performanceTask?.find((p: any) => p.id === a.id);
                    return <td key={`pt-score-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{found ? found.score : '-'}</td>;
                  })}
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.PT_Total}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.PT_PS}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.PT_WS}</td>
                  {/* QE scores */}
                  {uniqueQE.map((a, i) => {
                    const found = student.gradeData[subjectId]?.[quarter]?.quarterlyExam?.find((q: any) => q.id === a.id);
                    return <td key={`qe-score-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{found ? found.score : '-'}</td>;
                  })}
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.QE_Total}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.QE_PS}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.QE_WS}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.initial}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.QG}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qg >= 75 ? 'PASSED' : (qg > 0 ? 'FAILED' : '-')}</td>
                </tr>
              );
            })}
            {/* FEMALE group header row */}
            <tr>
              <td className="border-2 border-black px-1 py-1"></td>
              <td className="border-2 border-black px-1 py-1 font-bold text-left">FEMALE</td>
              {Array.from({ length: uniqueWW.length + summaryCols + uniquePT.length + summaryCols + uniqueQE.length + summaryCols + 2 }).map((_, i) => (
                <td key={`empty-female-header-${String(i)}`} className="border-2 border-black px-1 py-1"></td>
              ))}
            </tr>
            {/* Female students (second half for demo) */}
            {students.slice(Math.ceil(students.length / 2)).map((student, idx) => {
              const qData = getQuarterData(student, subjectId, quarter, subject);
              const qg = parseFloat(qData.QG);
              return (
                <tr key={student.id}>
                  <td className="border-2 border-black px-1 py-1 text-center">{Math.ceil(students.length / 2) + idx + 1}</td>
                  <td className="border-2 border-black px-1 py-1 whitespace-nowrap text-left">{student.name}</td>
                  {/* WW scores */}
                  {uniqueWW.map((a, i) => {
                    const found = student.gradeData[subjectId]?.[quarter]?.writtenWork?.find((w: any) => w.id === a.id);
                    return <td key={`ww-score-female-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{found ? found.score : '-'}</td>;
                  })}
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.WW_Total}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.WW_PS}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.WW_WS}</td>
                  {/* PT scores */}
                  {uniquePT.map((a, i) => {
                    const found = student.gradeData[subjectId]?.[quarter]?.performanceTask?.find((p: any) => p.id === a.id);
                    return <td key={`pt-score-female-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{found ? found.score : '-'}</td>;
                  })}
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.PT_Total}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.PT_PS}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.PT_WS}</td>
                  {/* QE scores */}
                  {uniqueQE.map((a, i) => {
                    const found = student.gradeData[subjectId]?.[quarter]?.quarterlyExam?.find((q: any) => q.id === a.id);
                    return <td key={`qe-score-female-${String(i)}`} className="border-2 border-black px-1 py-1 text-center">{found ? found.score : '-'}</td>;
                  })}
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.QE_Total}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.QE_PS}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.QE_WS}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.initial}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qData.QG}</td>
                  <td className="border-2 border-black px-1 py-1 text-center">{qg >= 75 ? 'PASSED' : (qg > 0 ? 'FAILED' : '-')}</td>
                </tr>
              );
            })}
            {/* General Average row */}
            <tr>
              <td className="border-2 border-black px-1 py-1 font-bold text-center" colSpan={2}>CLASS GENERAL AVERAGE</td>
              {/* Fill with empty cells for all assessment columns and summary columns */}
              {Array.from({ length: uniqueWW.length + summaryCols + uniquePT.length + summaryCols + uniqueQE.length + summaryCols }).map((_, i) => (
                <td key={`ga-empty-${String(i)}`} className="border-2 border-black px-1 py-1"></td>
              ))}
              <td className="border-2 border-black px-1 py-1 font-bold text-center" colSpan={3}>{classGeneralAverage}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Grading Scale Legend */}
      <div className="mt-4 border border-black p-2 w-fit text-xs">
        <div className="font-semibold mb-1">GRADING SCALE:</div>
        <div>90-100 - Outstanding</div>
        <div>85-89 - Very Satisfactory</div>
        <div>80-84 - Satisfactory</div>
        <div>75-79 - Fairly Satisfactory</div>
        <div>Below 75 - Did Not Meet Expectations</div>
      </div>
      <div className="mt-4 flex justify-between text-xs">
        <div>Prepared by: <span className="border-b border-black inline-block min-w-[120px]">&nbsp;</span></div>
        <div>Checked by: <span className="border-b border-black inline-block min-w-[120px]">&nbsp;</span></div>
        <div>Noted by: <span className="border-b border-black inline-block min-w-[120px]">&nbsp;</span></div>
      </div>
    </div>
  );
}; 