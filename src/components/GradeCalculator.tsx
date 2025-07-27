import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectLabel, SelectGroup } from './ui/select';
import { calculateQuarterGrade, getGradeColor, getGradeLevel } from '@/utils/gradeCalculations';
import { useAuth } from '@/contexts/AuthContext';

const SUBJECT_TYPES = [
  { label: 'Languages', value: 'Languages' },
  { label: 'AP', value: 'AP' },
  { label: 'EsP', value: 'EsP' },
  { label: 'Science', value: 'Science' },
  { label: 'Math', value: 'Math' },
  { label: 'MAPEH', value: 'MAPEH' },
  { label: 'EPP/TLE', value: 'EPP/TLE' },
];
const SHS_TRACKS = [
  { label: 'Core', value: 'Core' },
  { label: 'Academic', value: 'Academic' },
  { label: 'TVL', value: 'TVL' },
  { label: 'Sports/Arts', value: 'Sports/Arts' },
];
const QUARTERS = [
  { key: 'quarter1', label: 'Quarter 1' },
  { key: 'quarter2', label: 'Quarter 2' },
  { key: 'quarter3', label: 'Quarter 3' },
  { key: 'quarter4', label: 'Quarter 4' },
];
const CATEGORY_KEYS = [
  { key: 'writtenWork', label: 'Written Work' },
  { key: 'performanceTask', label: 'Performance Tasks' },
  { key: 'quarterlyExam', label: 'Quarterly Exam' },
];
const GRADE_LEVELS = [
  { label: 'Grade 7', value: '7' },
  { label: 'Grade 8', value: '8' },
  { label: 'Grade 9', value: '9' },
  { label: 'Grade 10', value: '10' },
  { label: 'Grade 11', value: '11' },
  { label: 'Grade 12', value: '12' },
];
const SEMESTERS = [
  { key: 'sem1', label: '1st Semester' },
  { key: 'sem2', label: '2nd Semester' },
];

const LOCAL_STORAGE_KEY = 'student-grade-calculator';

function getDefaultSubject() {
  return {
    name: '',
    gradeLevel: '',
    writtenWorkWeight: 40,
    performanceTaskWeight: 40,
    quarterlyExamWeight: 20,
    track: '',
    type: '',
  };
}

function getDefaultAssessments(isSenior = false) {
  if (isSenior) {
    return {
      sem1: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
      sem2: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
    };
  }
  return {
    quarter1: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
    quarter2: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
    quarter3: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
    quarter4: { writtenWork: [], performanceTask: [], quarterlyExam: [] },
  };
}

const GradeCalculator: React.FC = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState(getDefaultSubject());
  const [assessments, setAssessments] = useState(getDefaultAssessments());
  const [currentPeriod, setCurrentPeriod] = useState('quarter1');

  // Determine if senior (SHS)
  const isSenior = subject.gradeLevel === '11' || subject.gradeLevel === '12';
  const periodList = isSenior ? SEMESTERS : QUARTERS;

  // If user is student and has gradeLevel, use it and lock the field
  const userGradeLevel = user?.role === 'student' && user?.gradeLevel ? user.gradeLevel : undefined;

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSubject(parsed.subject || getDefaultSubject());
      // If gradeLevel is 11/12, use semesters, else quarters
      const isSavedSenior = parsed.subject?.gradeLevel === '11' || parsed.subject?.gradeLevel === '12';
      setAssessments(parsed.assessments || getDefaultAssessments(isSavedSenior));
      setCurrentPeriod(isSavedSenior ? 'sem1' : 'quarter1');
    } else if (userGradeLevel) {
      setSubject(prev => ({ ...prev, gradeLevel: userGradeLevel }));
      setAssessments(getDefaultAssessments(userGradeLevel === '11' || userGradeLevel === '12'));
      setCurrentPeriod(userGradeLevel === '11' || userGradeLevel === '12' ? 'sem1' : 'quarter1');
    }
  }, [userGradeLevel]);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ subject, assessments }));
  }, [subject, assessments]);

  const handleSubjectChange = (field: string, value: any) => {
    setSubject(prev => {
      // If gradeLevel changes, reset assessments and period
      if (field === 'gradeLevel') {
        const senior = value === '11' || value === '12';
        setAssessments(getDefaultAssessments(senior));
        setCurrentPeriod(senior ? 'sem1' : 'quarter1');
        return { ...prev, [field]: value };
      }
      return { ...prev, [field]: value };
    });
  };

  const addAssessment = (category: string) => {
    setAssessments(prev => ({
      ...prev,
      [currentPeriod]: {
        ...prev[currentPeriod],
        [category]: [
          ...prev[currentPeriod][category],
          { id: Date.now().toString(), name: '', score: 0, totalPoints: 0 },
        ],
      },
    }));
  };

  const updateAssessment = (category: string, idx: number, field: string, value: any) => {
    setAssessments(prev => ({
      ...prev,
      [currentPeriod]: {
        ...prev[currentPeriod],
        [category]: prev[currentPeriod][category].map((a: any, i: number) =>
          i === idx ? { ...a, [field]: field === 'score' || field === 'totalPoints' ? Number(value) : value } : a
        ),
      },
    }));
  };

  const removeAssessment = (category: string, idx: number) => {
    setAssessments(prev => ({
      ...prev,
      [currentPeriod]: {
        ...prev[currentPeriod],
        [category]: prev[currentPeriod][category].filter((_: any, i: number) => i !== idx),
      },
    }));
  };

  // Calculate period grade
  const periodResult = calculateQuarterGrade(
    assessments[currentPeriod],
    {
      id: 'student-calculator',
      ...subject,
      track: subject.track as 'Core' | 'Academic' | 'TVL' | 'Sports/Arts' | undefined,
      type: subject.type as 'Languages' | 'AP' | 'EsP' | 'Science' | 'Math' | 'MAPEH' | 'EPP/TLE' | undefined,
      writtenWorkWeight: Number(subject.writtenWorkWeight),
      performanceTaskWeight: Number(subject.performanceTaskWeight),
      quarterlyExamWeight: Number(subject.quarterlyExamWeight),
    },
    subject.gradeLevel,
    undefined
  );

  // Refresh logic
  const refreshCalculator = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    if (userGradeLevel) {
      setSubject(prev => ({ ...getDefaultSubject(), gradeLevel: userGradeLevel }));
      setAssessments(getDefaultAssessments(userGradeLevel === '11' || userGradeLevel === '12'));
      setCurrentPeriod(userGradeLevel === '11' || userGradeLevel === '12' ? 'sem1' : 'quarter1');
    } else {
      setSubject(getDefaultSubject());
      setAssessments(getDefaultAssessments());
      setCurrentPeriod('quarter1');
    }
  };

  // Scroll-to-refresh
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        refreshCalculator();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [userGradeLevel]);

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" onClick={refreshCalculator} title="Refresh Calculator">
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subject & Weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Subject Name</Label>
            <Input
              value={subject.name}
              onChange={e => handleSubjectChange('name', e.target.value)}
              placeholder="e.g. Mathematics"
            />
          </div>
          <div>
            <Label>Grade Level</Label>
            <Select
              value={subject.gradeLevel || ''}
              onValueChange={val => handleSubjectChange('gradeLevel', val)}
              disabled={!!userGradeLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Grade Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Grade Level</SelectLabel>
                  {GRADE_LEVELS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Removed Subject Type and SHS Track dropdowns as requested */}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Written Work %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={subject.writtenWorkWeight}
                onChange={e => handleSubjectChange('writtenWorkWeight', e.target.value)}
              />
            </div>
            <div>
              <Label>Performance Task %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={subject.performanceTaskWeight}
                onChange={e => handleSubjectChange('performanceTaskWeight', e.target.value)}
              />
            </div>
            <div>
              <Label>Quarterly Exam %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={subject.quarterlyExamWeight}
                onChange={e => handleSubjectChange('quarterlyExamWeight', e.target.value)}
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Weights must total 100%</div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Grade Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentPeriod} onValueChange={setCurrentPeriod} className="mb-4">
            <TabsList className={`grid w-full grid-cols-${periodList.length}`}>
              {periodList.map(p => (
                <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {CATEGORY_KEYS.map(cat => (
            <Card key={cat.key} className="mb-4">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {cat.label}
                  <Button size="sm" onClick={() => addAssessment(cat.key)}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assessments[currentPeriod][cat.key].length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No assessments yet. Click Add to get started.</p>
                ) : (
                  assessments[currentPeriod][cat.key].map((a: any, idx: number) => (
                    <div key={a.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-3 border rounded">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={a.name}
                          onChange={e => updateAssessment(cat.key, idx, 'name', e.target.value)}
                          placeholder="Quiz 1, Project A, etc."
                        />
                      </div>
                      <div>
                        <Label>Score</Label>
                        <Input
                          type="number"
                          min={0}
                          value={a.score === 0 ? '' : a.score}
                          onChange={e => updateAssessment(cat.key, idx, 'score', e.target.value)}
                          placeholder="Score"
                        />
                      </div>
                      <div>
                        <Label>Total Points</Label>
                        <Input
                          type="number"
                          min={1}
                          value={a.totalPoints === 0 ? '' : a.totalPoints}
                          onChange={e => updateAssessment(cat.key, idx, 'totalPoints', e.target.value)}
                          placeholder="Total Points"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeAssessment(cat.key, idx)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isSenior ? 'Semester Summary' : 'Quarter Summary'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Written Work</p>
              <p className="text-2xl font-bold">{periodResult.writtenWorkPercentage.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Performance Tasks</p>
              <p className="text-2xl font-bold">{periodResult.performanceTaskPercentage.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Quarterly Exam</p>
              <p className="text-2xl font-bold">{periodResult.quarterlyExamPercentage.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Initial Grade</p>
              <p className="text-2xl font-bold">{periodResult.initialGrade.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Final {isSenior ? 'Semester' : 'Quarter'} Grade</p>
            <p className={`text-4xl font-bold ${getGradeColor(periodResult.transmutedGrade)}`}>{periodResult.transmutedGrade}</p>
            <div className="mt-2">
              <span className="inline-block px-3 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">{getGradeLevel(periodResult.transmutedGrade)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeCalculator; 