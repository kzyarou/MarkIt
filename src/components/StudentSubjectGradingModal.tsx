
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Student, Subject, ScoreEntry, CategoryScores, QuarterGrades, Section } from '@/types/grading';
import { calculateQuarterGrade, getGradeColor, getGradeLevel } from '@/utils/gradeCalculations';
import { useToast } from '@/hooks/use-toast';
import { saveSection } from '@/services/gradesService';
import { GradesService } from '@/services/gradesService';

interface StudentSubjectGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  subject: Subject;
  section: Section;
  setSection: (section: Section) => void;
  onSave: (updatedStudent: Student, hidden?: boolean) => void;
}

export function StudentSubjectGradingModal({
  isOpen,
  onClose,
  student,
  subject,
  section,
  setSection,
  onSave
}: StudentSubjectGradingModalProps) {
  const [gradeData, setGradeData] = useState<QuarterGrades>({
    quarter1: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
    quarter2: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
    quarter3: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
    quarter4: { writtenWork: [], performanceTask: [], quarterlyExam: [] }
  });
  const [currentQuarter, setCurrentQuarter] = useState<'quarter1' | 'quarter2' | 'quarter3' | 'quarter4'>('quarter1');
  const [hideGrades, setHideGrades] = useState(false);
  const { toast } = useToast();

  // Use subject.assessments as the source of truth
  const [assessments, setAssessments] = useState<Subject['assessments']>(
    (subject.assessments || []).map(a => ({
      ...a,
      quarter: a.quarter as 'quarter1' | 'quarter2' | 'quarter3' | 'quarter4',
    }))
  );

  // Always sync assessments with the latest from section.subjects
  useEffect(() => {
    const latestSubject = section.subjects.find(s => s.id === subject.id);
    if (latestSubject && latestSubject.assessments) {
      setAssessments(
        latestSubject.assessments.map(a => ({
          ...a,
          quarter: a.quarter as 'quarter1' | 'quarter2' | 'quarter3' | 'quarter4',
        }))
      );
    }
  }, [section, subject.id]);

  useEffect(() => {
    if (student.gradeData[subject.id]) {
      setGradeData(student.gradeData[subject.id]);
    }
  }, [student, subject.id]);

  const addScore = (category: keyof CategoryScores) => {
    // Determine prefix and count for default name
    let prefix = '';
    if (category === 'writtenWork') prefix = 'WW';
    else if (category === 'performanceTask') prefix = 'PT';
    else if (category === 'quarterlyExam') prefix = 'QE';
    const count = gradeData[currentQuarter][category].length + 1;
    const defaultName = `${prefix}#${count}`;

    const newScore: ScoreEntry = {
      id: Date.now().toString(),
      name: defaultName,
      score: 0,
      totalPoints: 0
    };

    setGradeData(prev => ({
      ...prev,
      [currentQuarter]: {
        ...prev[currentQuarter],
        [category]: [...prev[currentQuarter][category], newScore]
      }
    }));
  };

  const updateScore = (category: keyof CategoryScores, scoreId: string, field: keyof ScoreEntry, value: string | number) => {
    setGradeData(prev => ({
      ...prev,
      [currentQuarter]: {
        ...prev[currentQuarter],
        [category]: prev[currentQuarter][category].map(score =>
          score.id === scoreId ? { ...score, [field]: value } : score
        )
      }
    }));
  };

  const removeScore = (category: keyof CategoryScores, scoreId: string) => {
    setGradeData(prev => ({
      ...prev,
      [currentQuarter]: {
        ...prev[currentQuarter],
        [category]: prev[currentQuarter][category].filter(score => score.id !== scoreId)
      }
    }));
  };

  // Add assessment for all students
  const addAssessment = (category: 'writtenWork' | 'performanceTask' | 'quarterlyExam', quarter: 'quarter1' | 'quarter2' | 'quarter3' | 'quarter4') => {
    const count = assessments.filter(a => a.category === category && a.quarter === quarter).length + 1;
    const prefix = category === 'writtenWork' ? 'WW' : category === 'performanceTask' ? 'PT' : 'QE';
    const newAssessment = {
      id: Date.now().toString(),
      name: `${prefix}#${count}`,
      category,
      quarter,
      totalPoints: 0
    };
    const updatedAssessments = [...assessments, newAssessment];
    setAssessments(updatedAssessments);
    // Add score entry for all students
    const updatedSection = { ...section };
    updatedSection.subjects = updatedSection.subjects.map(subj =>
      subj.id === subject.id ? { ...subj, assessments: updatedAssessments } : subj
    );
    updatedSection.students = updatedSection.students.map(s => {
      const gd = { ...s.gradeData };
      if (!gd[subject.id]) gd[subject.id] = { quarter1: { writtenWork: [], performanceTask: [], quarterlyExam: [] }, quarter2: { writtenWork: [], performanceTask: [], quarterlyExam: [] }, quarter3: { writtenWork: [], performanceTask: [], quarterlyExam: [] }, quarter4: { writtenWork: [], performanceTask: [], quarterlyExam: [] } };
      const q = gd[subject.id][quarter];
      q[category] = [...q[category], { id: newAssessment.id, name: newAssessment.name, score: 0, totalPoints: newAssessment.totalPoints }];
      gd[subject.id][quarter] = q;
      return { ...s, gradeData: gd };
    });
    setSection(updatedSection);
  };

  // Update assessment name or totalPoints for all students
  const updateAssessment = (assessmentId: string, field: 'name' | 'totalPoints', value: string | number) => {
    const updatedAssessments = assessments.map(a => a.id === assessmentId ? { ...a, [field]: value } : a);
    setAssessments(updatedAssessments);
    const updatedSection = { ...section };
    updatedSection.subjects = updatedSection.subjects.map(subj =>
      subj.id === subject.id ? { ...subj, assessments: updatedAssessments } : subj
    );
    // Propagate name/totalPoints change to all students' score entries for this assessment
    updatedSection.students = updatedSection.students.map(s => {
      const gd = { ...s.gradeData };
      if (!gd[subject.id]) return s;
      Object.values(gd[subject.id]).forEach((quarter: any) => {
        ['writtenWork', 'performanceTask', 'quarterlyExam'].forEach(cat => {
          quarter[cat] = quarter[cat].map((entry: any) =>
            entry.id === assessmentId ? { ...entry, [field]: value } : entry
          );
        });
      });
      return { ...s, gradeData: gd };
    });
    setSection(updatedSection);
  };

  // Remove assessment for all students
  const removeAssessment = async (assessmentId: string) => {
    // Remove from assessments
    const updatedAssessments = assessments.filter(a => a.id !== assessmentId);
    setAssessments(updatedAssessments);
    // Remove from section.subjects
    const updatedSection = { ...section };
    updatedSection.subjects = updatedSection.subjects.map(subj =>
      subj.id === subject.id ? { ...subj, assessments: updatedAssessments } : subj
    );
    // Remove from all students' gradeData
    updatedSection.students = updatedSection.students.map(s => {
      const gd = { ...s.gradeData };
      if (!gd[subject.id]) return s;
      Object.values(gd[subject.id]).forEach((quarter: any) => {
        ['writtenWork', 'performanceTask', 'quarterlyExam'].forEach(cat => {
          quarter[cat] = quarter[cat].filter((entry: any) => entry.id !== assessmentId);
        });
      });
      return { ...s, gradeData: gd };
    });
    setSection(updatedSection);
    // Sync grades for all connected students in this section after deletion
    for (const s of updatedSection.students) {
      if (s.connectedUserId) {
        await GradesService.syncGradesFromSection(
          s.connectedUserId,
          updatedSection.id,
          s,
          updatedSection
        );
      }
    }
  };

  const handleSave = async () => {
    // Update the subject in the section with the latest assessments
    const updatedSection = { ...section };
    updatedSection.subjects = updatedSection.subjects.map(subj =>
      subj.id === subject.id ? { ...subj, assessments } : subj
    );
    // Propagate assessment changes to all students (ensure all have score entries for all assessments)
    updatedSection.students = updatedSection.students.map(s => {
      if (s.id === student.id) {
        // Update the current student's gradeData with the latest from the modal, preserving other subjects
        return { ...s, gradeData: { ...s.gradeData, [subject.id]: gradeData } };
      }
      const gd = { ...s.gradeData };
      if (!gd[subject.id]) gd[subject.id] = { quarter1: { writtenWork: [], performanceTask: [], quarterlyExam: [] }, quarter2: { writtenWork: [], performanceTask: [], quarterlyExam: [] }, quarter3: { writtenWork: [], performanceTask: [], quarterlyExam: [] }, quarter4: { writtenWork: [], performanceTask: [], quarterlyExam: [] } };
      assessments.forEach(a => {
        const arr = gd[subject.id][a.quarter][a.category];
        if (!arr.find(e => e.id === a.id)) {
          arr.push({ id: a.id, name: a.name, score: 0, totalPoints: a.totalPoints });
        }
      });
      gd[subject.id] = { ...gd[subject.id] };
      return { ...s, gradeData: gd };
    });
    setSection(updatedSection);
    // Save the updated section to the backend
    await saveSection(updatedSection);
    // Sync grades for all connected students in this section
    for (const s of updatedSection.students) {
      if (s.connectedUserId) {
        await GradesService.syncGradesFromSection(
          s.connectedUserId,
          updatedSection.id,
          s,
          updatedSection,
          hideGrades
        );
      }
    }
    // Save the current student's grades
    const updatedStudent = updatedSection.students.find(s => s.id === student.id) || student;
    onSave(updatedStudent, hideGrades);
    onClose();
    toast({
      title: hideGrades ? "Grades Saved (Hidden)" : "Grades Saved",
      description: `Grades for ${student.name} in ${subject.name} have been saved${hideGrades ? ' and hidden from student view' : ''}.`
    });
  };

  // Render assessments for the current quarter and category
  const renderAssessmentCategory = (category: 'writtenWork' | 'performanceTask' | 'quarterlyExam', title: string) => {
    // Filter assessments for this category and current quarter
    const categoryAssessments = assessments.filter(a => a.category === category && a.quarter === currentQuarter);
    // Get the student's scores for this category/quarter
    const studentScores = gradeData[currentQuarter][category];
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {title}
            <Button size="sm" onClick={() => addAssessment(category, currentQuarter)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Assessment
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryAssessments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No assessments yet. Click "Add Assessment" to get started.
            </p>
          ) : (
            categoryAssessments.map((assessment, idx) => {
              // Find the student's score entry for this assessment
              const scoreEntry = studentScores.find(s => s.id === assessment.id);
              return (
                <div key={assessment.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-3 border rounded">
                  <div>
                    <Label>Assessment Name</Label>
                    <Input
                      value={assessment.name}
                      onChange={e => updateAssessment(assessment.id, 'name', e.target.value)}
                      placeholder="Quiz 1, Project A, etc."
                    />
                  </div>
                  <div>
                    <Label>Score</Label>
                    <Input
                      type="number"
                      min="0"
                      value={scoreEntry ? (scoreEntry.score === 0 ? '' : scoreEntry.score) : ''}
                      onChange={e => {
                        const value = parseFloat(e.target.value) || 0;
                        setGradeData(prev => {
                          const updatedScores = prev[currentQuarter][category].some(s => s.id === assessment.id)
                            ? prev[currentQuarter][category].map(s =>
                                s.id === assessment.id ? { ...s, score: value } : s
                              )
                            : [...prev[currentQuarter][category], { id: assessment.id, name: assessment.name, score: value, totalPoints: assessment.totalPoints }];
                          return {
                            ...prev,
                            [currentQuarter]: {
                              ...prev[currentQuarter],
                              [category]: updatedScores
                            }
                          };
                        });
                      }}
                      placeholder="Score"
                    />
                  </div>
                  <div>
                    <Label>Total Points</Label>
                    <Input
                      type="number"
                      min="1"
                      value={assessment.totalPoints === 0 ? '' : assessment.totalPoints}
                      onChange={e => updateAssessment(assessment.id, 'totalPoints', parseFloat(e.target.value) || 0)}
                      placeholder="Total Points"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => await removeAssessment(assessment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    );
  };

  const quarterResult = calculateQuarterGrade(gradeData[currentQuarter], subject);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Grading: {student.name} - {subject.name}
          </DialogTitle>
          <DialogDescription>
            View and edit grades for each quarter and category for this student and subject.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quarter Tabs */}
          <Tabs value={currentQuarter} onValueChange={(value) => setCurrentQuarter(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quarter1">Quarter 1</TabsTrigger>
              <TabsTrigger value="quarter2">Quarter 2</TabsTrigger>
              <TabsTrigger value="quarter3">Quarter 3</TabsTrigger>
              <TabsTrigger value="quarter4">Quarter 4</TabsTrigger>
            </TabsList>

            <TabsContent value={currentQuarter} className="space-y-6">
              {/* Grade Categories */}
              <div className="space-y-4">
                {renderAssessmentCategory('writtenWork', `Written Work (${subject.writtenWorkWeight}%)`)}
                {renderAssessmentCategory('performanceTask', `Performance Tasks (${subject.performanceTaskWeight}%)`)}
                {renderAssessmentCategory('quarterlyExam', `Quarterly Exam (${subject.quarterlyExamWeight}%)`)}
              </div>

              {/* Quarter Summary */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle>Quarter {currentQuarter.slice(-1)} Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Written Work</p>
                      <p className="text-2xl font-bold">
                        {quarterResult.writtenWorkPercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Performance Tasks</p>
                      <p className="text-2xl font-bold">
                        {quarterResult.performanceTaskPercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Quarterly Exam</p>
                      <p className="text-2xl font-bold">
                        {quarterResult.quarterlyExamPercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Initial Grade</p>
                      <p className="text-2xl font-bold">
                        {quarterResult.initialGrade.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-card rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">Final Quarter Grade</p>
                    <p className={`text-4xl font-bold ${getGradeColor(quarterResult.transmutedGrade)}`}>
                      {quarterResult.transmutedGrade}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {getGradeLevel(quarterResult.transmutedGrade)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Grade Visibility Toggle */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {hideGrades ? (
                    <EyeOff className="w-5 h-5 text-orange-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-green-500" />
                  )}
                  <Label htmlFor="hide-grades" className="font-medium">
                    {hideGrades ? 'Hide grades from student' : 'Show grades to student'}
                  </Label>
                </div>
                <Switch
                  id="hide-grades"
                  checked={hideGrades}
                  onCheckedChange={setHideGrades}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {hideGrades 
                  ? 'Grades will be saved but hidden from the student until you choose to show them.'
                  : 'Grades will be visible to the student immediately after saving.'
                }
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {hideGrades ? 'Save Grades (Hidden)' : 'Save Grades'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
