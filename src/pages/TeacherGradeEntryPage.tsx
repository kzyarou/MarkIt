import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, RefreshCw, ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { calculateQuarterGrade, getGradeColor, getGradeLevel } from '@/utils/gradeCalculations';
import { useToast } from '@/hooks/use-toast';
import { saveSection, getSections } from '@/services/gradesService';
import { GradesService } from '@/services/gradesService';
import { Student, Subject, ScoreEntry, CategoryScores, QuarterGrades, Section } from '@/types/grading';

const CATEGORY_KEYS = [
  { key: 'writtenWork', label: 'Written Work' },
  { key: 'performanceTask', label: 'Performance Tasks' },
  { key: 'quarterlyExam', label: 'Quarterly Exam' },
];

const QUARTERS = [
  { key: 'quarter1', label: 'Quarter 1' },
  { key: 'quarter2', label: 'Quarter 2' },
  { key: 'quarter3', label: 'Quarter 3' },
  { key: 'quarter4', label: 'Quarter 4' },
];

const SEMESTERS = [
  { key: 'sem1', label: '1st Semester' },
  { key: 'sem2', label: '2nd Semester' },
];

export default function TeacherGradeEntryPage() {
  const { sectionId, subjectId, studentId } = useParams<{ sectionId: string; subjectId: string; studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [section, setSection] = useState<Section | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [gradeData, setGradeData] = useState<QuarterGrades>({
    quarter1: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
    quarter2: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
    quarter3: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
    quarter4: { writtenWork: [], performanceTask: [], quarterlyExam: [] }
  });
  const [hideGrades, setHideGrades] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<string>('quarter1');
  const [loading, setLoading] = useState(true);

  // Load section, student, and subject data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!sectionId || !subjectId || !studentId) return;
        
        setLoading(true);
        // Fetch sections from server
        const sections = await getSections();
        const foundSection = sections.find(s => s.id === sectionId);
        
        if (!foundSection) {
          toast({
            title: "Error",
            description: "Section not found.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        setSection(foundSection);
        
        // Find student and subject
        const foundStudent = foundSection.students.find(s => s.id === studentId);
        const foundSubject = foundSection.subjects.find(s => s.id === subjectId);
        
        if (!foundStudent) {
          toast({
            title: "Error",
            description: "Student not found.",
            variant: "destructive"
          });
          navigate(`/section/${sectionId}`);
          return;
        }
        
        if (!foundSubject) {
          toast({
            title: "Error",
            description: "Subject not found.",
            variant: "destructive"
          });
          navigate(`/section/${sectionId}/student/${studentId}`);
          return;
        }
        
        setStudent(foundStudent);
        setSubject(foundSubject);
        
        // Initialize grade data
        if (foundStudent.gradeData && foundStudent.gradeData[subjectId]) {
          setGradeData(foundStudent.gradeData[subjectId]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load student and subject data.",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    loadData();
  }, [sectionId, subjectId, studentId, toast, navigate]);

  // Determine if section is junior or senior
  const gradeNum = Number(section?.gradeLevel);
  const isSenior = section?.classification === 'senior' || gradeNum === 11 || gradeNum === 12;
  const periodList = isSenior ? SEMESTERS : QUARTERS;

  // Helper to get the current quarter for editing
  function getCurrentQuarter() {
    if (isSenior) {
      const sem = SEMESTERS.find(tab => tab.key === currentPeriod);
      return (sem ? (currentPeriod === 'sem1' ? 'quarter1' : 'quarter3') : 'quarter1') as 'quarter1' | 'quarter2' | 'quarter3' | 'quarter4';
    }
    return currentPeriod as 'quarter1' | 'quarter2' | 'quarter3' | 'quarter4';
  }

  const currentQuarter = getCurrentQuarter();

  // Calculate period grade
  const periodResult = subject ? calculateQuarterGrade(
    gradeData[currentQuarter],
    subject,
    section?.gradeLevel || '',
    undefined,
    '2015'
  ) : {
    writtenWorkPercentage: 0,
    performanceTaskPercentage: 0,
    quarterlyExamPercentage: 0,
    initialGrade: 0,
    transmutedGrade: 0
  };

  // Debug logging for grade calculations
  console.log('Current quarter grade data:', gradeData[currentQuarter]);
  console.log('Subject weights:', {
    writtenWork: subject?.writtenWorkWeight,
    performanceTask: subject?.performanceTaskWeight,
    quarterlyExam: subject?.quarterlyExamWeight
  });
  console.log('Period result:', periodResult);
  
  // Debug individual category calculations
  if (subject) {
    const wwScores = gradeData[currentQuarter].writtenWork;
    const ptScores = gradeData[currentQuarter].performanceTask;
    const qeScores = gradeData[currentQuarter].quarterlyExam;
    
    console.log('Written Work scores:', wwScores);
    console.log('Performance Task scores:', ptScores);
    console.log('Quarterly Exam scores:', qeScores);
    
    // Manual calculation check
    const wwGraded = wwScores.filter(s => s.score != null && s.totalPoints > 0);
    const ptGraded = ptScores.filter(s => s.score != null && s.totalPoints > 0);
    const qeGraded = qeScores.filter(s => s.score != null && s.totalPoints > 0);
    
    const wwTotal = wwGraded.reduce((sum, s) => sum + (s.score as number), 0);
    const wwMax = wwGraded.reduce((sum, s) => sum + s.totalPoints, 0);
    const ptTotal = ptGraded.reduce((sum, s) => sum + (s.score as number), 0);
    const ptMax = ptGraded.reduce((sum, s) => sum + s.totalPoints, 0);
    const qeTotal = qeGraded.reduce((sum, s) => sum + (s.score as number), 0);
    const qeMax = qeGraded.reduce((sum, s) => sum + s.totalPoints, 0);
    
    console.log('Manual calculation check:', {
      ww: { total: wwTotal, max: wwMax, percent: wwMax > 0 ? (wwTotal / wwMax) * 100 : 0, gradedCount: wwGraded.length },
      pt: { total: ptTotal, max: ptMax, percent: ptMax > 0 ? (ptTotal / ptMax) * 100 : 0, gradedCount: ptGraded.length },
      qe: { total: qeTotal, max: qeMax, percent: qeMax > 0 ? (qeTotal / qeMax) * 100 : 0, gradedCount: qeGraded.length }
    });
  }

  // Add assessment for all students
  const addAssessment = (category: 'writtenWork' | 'performanceTask' | 'quarterlyExam', quarter: 'quarter1' | 'quarter2' | 'quarter3' | 'quarter4') => {
    if (!section || !subject) return;

    const count = (subject.assessments || []).filter(a => a.category === category && a.quarter === quarter).length + 1;
    const prefix = category === 'writtenWork' ? 'WW' : category === 'performanceTask' ? 'PT' : 'QE';
    const newAssessment = {
      id: Date.now().toString(),
      name: `${prefix}#${count}`,
      category,
      quarter,
      totalPoints: 100
    };

    // Update subject assessments
    const updatedAssessments = [...(subject.assessments || []), newAssessment];
    const updatedSubject = { ...subject, assessments: updatedAssessments };
    setSubject(updatedSubject);

    // Add score entry for the current student
    setGradeData(prev => ({
      ...prev,
      [quarter]: {
        ...prev[quarter],
        [category]: [
          ...prev[quarter][category],
          {
            id: newAssessment.id,
            name: newAssessment.name,
            score: null,
            totalPoints: newAssessment.totalPoints
          }
        ]
      }
    }));

    // Update section
    const updatedSection = { ...section };
    updatedSection.subjects = updatedSection.subjects.map(subj =>
      subj.id === subject.id ? updatedSubject : subj
    );
    setSection(updatedSection);
  };

  // Update assessment
  const updateAssessment = (assessmentId: string, field: 'name' | 'totalPoints', value: string | number) => {
    if (!section || !subject) return;

    const updatedAssessments = (subject.assessments || []).map(a => 
      a.id === assessmentId ? { ...a, [field]: value } : a
    );
    const updatedSubject = { ...subject, assessments: updatedAssessments };
    setSubject(updatedSubject);

    // Update section
    const updatedSection = { ...section };
    updatedSection.subjects = updatedSection.subjects.map(subj =>
      subj.id === subject.id ? updatedSubject : subj
    );
    setSection(updatedSection);
  };

  // Remove assessment
  const removeAssessment = async (assessmentId: string) => {
    if (!section || !subject) return;

    console.log('Removing assessment:', assessmentId);
    console.log('Current grade data before removal:', gradeData);

    const updatedAssessments = (subject.assessments || []).filter(a => a.id !== assessmentId);
    const updatedSubject = { ...subject, assessments: updatedAssessments };
    setSubject(updatedSubject);

    // Remove the score entry from the current student's grade data
    setGradeData(prev => {
      const updated = { ...prev };
      // Remove from all quarters and categories
      Object.keys(updated).forEach(quarter => {
        Object.keys(updated[quarter as keyof QuarterGrades]).forEach(category => {
          const categoryKey = category as keyof CategoryScores;
          const beforeCount = updated[quarter as keyof QuarterGrades][categoryKey].length;
          updated[quarter as keyof QuarterGrades][categoryKey] = updated[quarter as keyof QuarterGrades][categoryKey].filter(
            score => score.id !== assessmentId
          );
          const afterCount = updated[quarter as keyof QuarterGrades][categoryKey].length;
          if (beforeCount !== afterCount) {
            console.log(`Removed ${beforeCount - afterCount} score entries from ${quarter}.${categoryKey}`);
          }
        });
      });
      console.log('Updated grade data after removal:', updated);
      return updated;
    });

    // Update section
    const updatedSection = { ...section };
    updatedSection.subjects = updatedSection.subjects.map(subj =>
      subj.id === subject.id ? updatedSubject : subj
    );
    setSection(updatedSection);
  };

  // Update student score
  const updateScore = (category: keyof CategoryScores, scoreId: string, field: keyof ScoreEntry, value: string | number | null) => {
    setGradeData(prev => ({
      ...prev,
      [currentQuarter]: {
        ...prev[currentQuarter],
        [category]: prev[currentQuarter][category].map(score =>
          score.id === scoreId ? { ...score, [field]: value as any } : score
        )
      }
    }));
  };

  // Save grades
  const handleSave = async () => {
    if (!section || !subject || !student) return;

    try {
      // Update the subject in the section
      const updatedSection = { ...section };
      updatedSection.subjects = updatedSection.subjects.map(subj =>
        subj.id === subject.id ? subject : subj
      );

      // Update the student's grade data
      const updatedStudent = {
        ...student,
        gradeData: {
          ...student.gradeData,
          [subject.id]: gradeData
        }
      };

      updatedSection.students = updatedSection.students.map(s => 
        s.id === student.id ? updatedStudent : s
      );

      // Save to backend
      await saveSection(updatedSection);

      // Sync grades for connected students
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

      toast({
        title: hideGrades ? "Grades Saved (Hidden)" : "Grades Saved",
        description: `Grades for ${student.name} in ${subject.name} have been saved${hideGrades ? ' and hidden from student view' : ''}.`
      });

      // Navigate back
      navigate(`/section/${sectionId}/student/${studentId}`);
    } catch (error) {
      console.error('Error saving grades:', error);
      toast({
        title: "Error",
        description: "Failed to save grades. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Render assessment category
  const renderAssessmentCategory = (category: 'writtenWork' | 'performanceTask' | 'quarterlyExam', title: string) => {
    if (!subject) return null;

    const categoryAssessments = (subject.assessments || []).filter(a => a.category === category && a.quarter === currentQuarter);
    const studentScores = gradeData[currentQuarter][category];
    
    // Calculate progress for this category
    const totalEarned = studentScores.reduce((sum: number, s: any) => sum + (Number(s.score) || 0), 0);
    const totalPoints = studentScores.reduce((sum: number, s: any) => sum + (Number(s.totalPoints) || 0), 0);
    const progress = totalPoints > 0 ? Math.min(100, Math.round((totalEarned / totalPoints) * 100)) : 0;
    
    return (
      <AccordionItem key={category} value={category}>
        <AccordionTrigger>
          <div className="flex items-center justify-between w-full pr-4">
            <div className="font-medium">{title}</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{studentScores.length} items</Badge>
              <Badge variant="secondary">{progress}%</Badge>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="mb-3">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex justify-end mb-2">
            <Button size="sm" onClick={() => addAssessment(category, currentQuarter)}>
              <Plus className="w-4 h-4 mr-1" /> Add {title.split(' ')[0]} {title.split(' ')[1]}
            </Button>
          </div>
          {categoryAssessments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No assessments yet. Click Add to get started.</p>
          ) : (
            categoryAssessments.map((assessment) => {
              const scoreEntry = studentScores.find(s => s.id === assessment.id);
              return (
                <div key={assessment.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-3 border rounded mb-2">
                  <div>
                    <Label>Name</Label>
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
                      value={scoreEntry ? (scoreEntry.score == null ? '' : scoreEntry.score) : ''}
                      onChange={e => {
                        const text = e.target.value;
                        const value = text === '' ? null : (isNaN(parseFloat(text)) ? null : parseFloat(text));
                        if (scoreEntry) {
                          updateScore(category, scoreEntry.id, 'score', value as any);
                        }
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
                    onClick={() => removeAssessment(assessment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          )}
        </AccordionContent>
      </AccordionItem>
    );
  };

  if (loading || !section || !student || !subject) {
    return (
      <div className="max-w-3xl mx-auto w-full p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(`/section/${sectionId}/student/${studentId}`)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Grade Entry</h1>
            <p className="text-sm text-muted-foreground">
              {student.name} - {subject.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" /> Save Grades
          </Button>
        </div>
      </div>

      {/* Subject & Weights Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <CardTitle>Subject & Weights</CardTitle>
            <Badge variant="secondary">Teacher Mode</Badge>
          </div>
          <div className="text-xs text-muted-foreground">Subject configuration and grading weights.</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Subject Name</Label>
            <Input value={subject.name} disabled />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Written Work %</Label>
              <Input value={subject.writtenWorkWeight} disabled />
            </div>
            <div>
              <Label>Performance Task %</Label>
              <Input value={subject.performanceTaskWeight} disabled />
            </div>
            <div>
              <Label>Quarterly Exam %</Label>
              <Input value={subject.quarterlyExamWeight} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Entry Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Grade Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-md border mb-4">
            <Tabs value={currentPeriod} onValueChange={setCurrentPeriod}>
              <TabsList className={`grid w-full grid-cols-${periodList.length}`}>
                {periodList.map(p => (
                  <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <Accordion type="single" collapsible className="w-full mb-4">
            {renderAssessmentCategory('writtenWork', `Written Work (${subject.writtenWorkWeight}%)`)}
            {renderAssessmentCategory('performanceTask', `Performance Tasks (${subject.performanceTaskWeight}%)`)}
            {renderAssessmentCategory('quarterlyExam', `Quarterly Exam (${subject.quarterlyExamWeight}%)`)}
          </Accordion>
        </CardContent>
      </Card>

      {/* Period Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isSenior
                ? `${SEMESTERS.find(tab => tab.key === currentPeriod)?.label} Summary`
                : `Quarter ${currentQuarter.slice(-1)} Summary`}
            </CardTitle>
            <Badge variant="outline">{periodList.find(p => p.key === currentPeriod)?.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded border">
              <p className="text-sm text-gray-600">Written Work</p>
              <p className="text-2xl font-bold">{periodResult.writtenWorkPercentage.toFixed(1)}%</p>
            </div>
            <div className="text-center p-3 rounded border">
              <p className="text-sm text-gray-600">Performance Tasks</p>
              <p className="text-2xl font-bold">{periodResult.performanceTaskPercentage.toFixed(1)}%</p>
            </div>
            <div className="text-center p-3 rounded border">
              <p className="text-sm text-gray-600">Quarterly Exam</p>
              <p className="text-2xl font-bold">{periodResult.quarterlyExamPercentage.toFixed(1)}%</p>
            </div>
            <div className="text-center p-3 rounded border">
              <p className="text-sm text-gray-600">Initial Grade</p>
              <p className="text-2xl font-bold">{periodResult.initialGrade.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Final Quarter Grade</p>
            <p className={`text-4xl font-bold ${getGradeColor(periodResult.transmutedGrade)}`}>
              {periodResult.transmutedGrade}
            </p>
            <div className="mt-2">
              <span className="inline-block px-3 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">
                {getGradeLevel(periodResult.transmutedGrade)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Visibility Toggle */}
      <Card className="mb-6">
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
    </div>
  );
} 