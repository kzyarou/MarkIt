
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Student, Section, SubjectFinalGrade } from '@/types/grading';
import { calculateQuarterGrade, calculateFinalGrade, calculateDepEdGeneralAverage } from '@/utils/gradeCalculations';

interface DepEdReportCardProps {
  student: Student;
  section: Section;
}

export function DepEdReportCard({ student, section }: DepEdReportCardProps) {
  // Editable fields state
  const [lrn, setLrn] = useState(student.lrn || '');
  const [gradeLevel, setGradeLevel] = useState(section.gradeLevel.toString());
  const [sectionName, setSectionName] = useState(section.name);
  const [school, setSchool] = useState('Sample School');
  const [division, setDivision] = useState('Sample Division');
  const [region, setRegion] = useState('Sample Region');

  const calculateStudentGrades = (): SubjectFinalGrade[] => {
    return section.subjects.map(subject => {
      const subjectGrades = student.gradeData[subject.id];
      const quarters = {
        quarter1: subjectGrades?.quarter1 ? calculateQuarterGrade(subjectGrades.quarter1, subject) : null,
        quarter2: subjectGrades?.quarter2 ? calculateQuarterGrade(subjectGrades.quarter2, subject) : null,
        quarter3: subjectGrades?.quarter3 ? calculateQuarterGrade(subjectGrades.quarter3, subject) : null,
        quarter4: subjectGrades?.quarter4 ? calculateQuarterGrade(subjectGrades.quarter4, subject) : null,
      };
      
      const validGrades = Object.values(quarters).filter(q => q !== null);
      const finalGrade = validGrades.length > 0 ? calculateFinalGrade(validGrades) : 0;
      
      return {
        subjectName: subject.name,
        quarters,
        finalGrade
      };
    });
  };

  const subjectGrades = calculateStudentGrades();
  
  // Fix: Calculate general average according to DepEd standards
  // General average should be the average of ALL quarterly grades across ALL subjects
  // NOT the average of final grades per subject
  const generalAverage = calculateDepEdGeneralAverage(student, section);

  return (
    <div className="max-w-4xl mx-auto bg-card">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-xl font-bold">DEPARTMENT OF EDUCATION</h1>
        <h2 className="text-lg font-semibold">REPORT ON LEARNING PROGRESS AND ACHIEVEMENT</h2>
        <p className="text-sm mt-2">School Year: 2024-2025</p>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
        <div>
          <div className="mb-2">
            <span className="font-semibold">Name: </span>
            <span className="border-b border-black inline-block min-w-[200px]">{student.name}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">LRN: </span>
            <input
              className="border-b border-black inline-block min-w-[150px] bg-transparent outline-none px-1"
              value={lrn}
              onChange={e => setLrn(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <span className="font-semibold">Grade & Section: </span>
            <span className="inline-flex gap-1 border-b border-black min-w-[150px]">
              <input
                className="w-10 bg-transparent outline-none text-center"
                value={gradeLevel}
                onChange={e => setGradeLevel(e.target.value)}
              />
              <span>-</span>
              <input
                className="w-24 bg-transparent outline-none"
                value={sectionName}
                onChange={e => setSectionName(e.target.value)}
              />
            </span>
          </div>
        </div>
        <div>
          <div className="mb-2">
            <span className="font-semibold">School: </span>
            <input
              className="border-b border-black inline-block min-w-[200px] bg-transparent outline-none px-1"
              value={school}
              onChange={e => setSchool(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <span className="font-semibold">Division: </span>
            <input
              className="border-b border-black inline-block min-w-[150px] bg-transparent outline-none px-1"
              value={division}
              onChange={e => setDivision(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <span className="font-semibold">Region: </span>
            <input
              className="border-b border-black inline-block min-w-[150px] bg-transparent outline-none px-1"
              value={region}
              onChange={e => setRegion(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="border-2 border-black mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="border-r border-black p-2 text-left">LEARNING AREAS</th>
              <th className="border-r border-black p-2">Q1</th>
              <th className="border-r border-black p-2">Q2</th>
              <th className="border-r border-black p-2">Q3</th>
              <th className="border-r border-black p-2">Q4</th>
              <th className="border-r border-black p-2">FINAL GRADE</th>
              <th className="p-2">REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {subjectGrades.map((subjectGrade, index) => {
              // Find the subject object to get track/type
              const subj = section.subjects.find(s => s.name === subjectGrade.subjectName);
              return (
                <tr key={index} className="border-b border-black">
                  <td className="border-r border-black p-2 font-semibold">
                    {subjectGrade.subjectName}
                    {subj?.track && (
                      <><br /><span className="text-xs text-blue-600">Track: {subj.track}</span></>
                    )}
                    {subj?.type && (
                      <><br /><span className="text-xs text-green-600">Type: {subj.type}</span></>
                    )}
                  </td>
                  <td className="border-r border-black p-2 text-center">
                    {subjectGrade.quarters.quarter1?.transmutedGrade || '-'}
                  </td>
                  <td className="border-r border-black p-2 text-center">
                    {subjectGrade.quarters.quarter2?.transmutedGrade || '-'}
                  </td>
                  <td className="border-r border-black p-2 text-center">
                    {subjectGrade.quarters.quarter3?.transmutedGrade || '-'}
                  </td>
                  <td className="border-r border-black p-2 text-center">
                    {subjectGrade.quarters.quarter4?.transmutedGrade || '-'}
                  </td>
                  <td className="border-r border-black p-2 text-center font-bold">
                    {subjectGrade.finalGrade > 0 ? subjectGrade.finalGrade : '-'}
                  </td>
                  <td className="p-2 text-center">
                    {subjectGrade.finalGrade >= 75 ? 'PASSED' : subjectGrade.finalGrade > 0 ? 'FAILED' : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* General Average */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <div className="text-sm mb-4">
            <span className="font-semibold">General Average: </span>
            <span className="text-xl font-bold border-b-2 border-black inline-block min-w-[80px] text-center">
              {generalAverage > 0 ? generalAverage : '-'}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-semibold">Remarks: </span>
            <span className="border-b border-black inline-block min-w-[150px]">
              {generalAverage >= 75 ? 'PROMOTED' : generalAverage > 0 ? 'RETAINED' : '-'}
            </span>
          </div>
        </div>
        <div className="text-xs">
          <h4 className="font-semibold mb-2">GRADING SCALE:</h4>
          <div className="space-y-1">
            <div>90-100 - Outstanding</div>
            <div>85-89 - Very Satisfactory</div>
            <div>80-84 - Satisfactory</div>
            <div>75-79 - Fairly Satisfactory</div>
            <div>Below 75 - Did Not Meet Expectations</div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-3 gap-8 mt-8 text-sm">
        <div className="text-center">
          <div className="border-b border-black mb-2 h-12"></div>
          <p className="font-semibold">Adviser</p>
        </div>
        <div className="text-center">
          <div className="border-b border-black mb-2 h-12"></div>
          <p className="font-semibold">Principal</p>
        </div>
        <div className="text-center">
          <div className="border-b border-black mb-2 h-12"></div>
          <p className="font-semibold">Parent/Guardian</p>
        </div>
      </div>
    </div>
  );
}
