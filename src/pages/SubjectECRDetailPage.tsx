import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSections, saveSection } from "@/services/gradesService";
import { Section, Student, Subject, ScoreEntry, CategoryScores, QuarterGrades } from "@/types/grading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";

const QUARTERS = [
  { key: "quarter1", label: "Quarter 1" },
  { key: "quarter2", label: "Quarter 2" },
  { key: "quarter3", label: "Quarter 3" },
  { key: "quarter4", label: "Quarter 4" },
];

const CATEGORY_KEYS = ["writtenWork", "performanceTask", "quarterlyExam"] as const;
type CategoryKey = typeof CATEGORY_KEYS[number];

const CATEGORY_TABS = [
  { key: "writtenWork", label: "Written Work" },
  { key: "performanceTask", label: "Performance Task" },
  { key: "quarterlyExam", label: "Quarterly Exam" },
] as const;

type QuarterKey = "quarter1" | "quarter2" | "quarter3" | "quarter4";

type Assessment = {
  name: string;
  score: string;
  total: string;
};

const emptyAssessment = (): Assessment => ({ name: "", score: "", total: "" });

const SubjectECRDetailPage = () => {
  const { sectionId, subjectId } = useParams<{ sectionId: string; subjectId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [section, setSection] = useState<Section | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterKey>("quarter1");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Record<CategoryKey, ScoreEntry[]>>({
    writtenWork: [],
    performanceTask: [],
    quarterlyExam: [],
  });
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("writtenWork");

  // Fetch section/subject/students only once on mount
  useEffect(() => {
    async function fetchSectionAndSubject() {
      setLoading(true);
      const sections = await getSections();
      const foundSection = sections.find(s => s.id === sectionId);
      if (!foundSection) {
        setSection(null);
        setSubject(null);
        setStudents([]);
        setSelectedStudentId(null);
        setLoading(false);
        return;
      }
      setSection(foundSection);
      setStudents(foundSection.students);
      const foundSubject = foundSection.subjects.find(sub => sub.id === subjectId);
      setSubject(foundSubject || null);
      // Default to first student
      const firstStudent = foundSection.students[0] || null;
      setSelectedStudentId(firstStudent ? firstStudent.id : null);
      setLoading(false);
    }
    if (sectionId && subjectId) fetchSectionAndSubject();
    // eslint-disable-next-line
  }, [sectionId, subjectId]);

  // Update assessments when selected student or quarter changes
  useEffect(() => {
    if (!students.length || !subject || !selectedStudentId) return;
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;
    const emptyCategoryScores: CategoryScores = { writtenWork: [], performanceTask: [], quarterlyExam: [] };
    const gradeData = (student.gradeData?.[subject.id]?.[selectedQuarter] as CategoryScores) ?? emptyCategoryScores;
    setAssessments({
      writtenWork: gradeData.writtenWork || [],
      performanceTask: gradeData.performanceTask || [],
      quarterlyExam: gradeData.quarterlyExam || [],
    });
  }, [students, subject, selectedStudentId, selectedQuarter]);

  const handleAssessmentChange = (cat: CategoryKey, idx: number, field: keyof ScoreEntry, value: string) => {
    setAssessments(prev => ({
      ...prev,
      [cat]: prev[cat].map((a, i) => i === idx ? { ...a, [field]: field === 'score' || field === 'totalPoints' ? Number(value) : value } : a)
    }));
  };

  const handleAddAssessment = (cat: CategoryKey) => {
    setAssessments(prev => {
      const count = prev[cat].length + 1;
      const prefix = cat === "writtenWork" ? "WW" : cat === "performanceTask" ? "PT" : "QE";
      const newEntry: ScoreEntry = {
        id: Date.now().toString(),
        name: `${prefix}#${count}`,
        score: 0,
        totalPoints: 0
      };
      return {
        ...prev,
        [cat]: [...prev[cat], newEntry]
      };
    });
  };

  const handleDeleteAssessment = (cat: CategoryKey, idx: number) => {
    setAssessments(prev => ({
      ...prev,
      [cat]: prev[cat].filter((_, i) => i !== idx)
    }));
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
  };

  const handleSave = async () => {
    if (!section || !subject || !selectedStudentId) return;
    setSaving(true);
    
    try {
      // Update gradeData for the selected student, subject, and quarter
      const updatedStudents = students.map(s => {
        if (s.id !== selectedStudentId) return s;
        
        const prevGradeData = s.gradeData || {} as any;
        const createEmptyCategoryScores = (): CategoryScores => ({ 
          writtenWork: [], 
          performanceTask: [], 
          quarterlyExam: [] 
        });
        const createEmptyQuarterGrades = (): QuarterGrades => ({
          quarter1: createEmptyCategoryScores(),
          quarter2: createEmptyCategoryScores(),
          quarter3: createEmptyCategoryScores(),
          quarter4: createEmptyCategoryScores(),
        });
        
        const prevSubjectData: QuarterGrades = prevGradeData[subject.id] || createEmptyQuarterGrades();
        
        return {
          ...s,
          gradeData: {
            ...prevGradeData,
            [subject.id]: {
              ...prevSubjectData,
              [selectedQuarter]: {
                writtenWork: [...assessments.writtenWork],
                performanceTask: [...assessments.performanceTask],
                quarterlyExam: [...assessments.quarterlyExam],
              }
            }
          }
        };
      });
      
      const updatedSection: Section = {
        ...section,
        students: updatedStudents
      };
      
      // Save to backend
      await saveSection(updatedSection);
      
      // Update local state immediately for real-time feedback
      setSection(updatedSection);
      setStudents(updatedStudents);
      
      // Force a re-render by updating the selected student
      const updatedStudent = updatedStudents.find(s => s.id === selectedStudentId);
      if (updatedStudent) {
        setSelectedStudentId(updatedStudent.id);
      }
      
    } catch (error) {
      console.error('Error saving grades:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#181c24]' : 'bg-background'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!section || !subject || !students.length || !selectedStudentId) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#181c24]' : 'bg-background'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-foreground'}`}>Section, Subject, or Student not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const student = students.find(s => s.id === selectedStudentId)!;

  return (
    <div className={`min-h-screen pb-24 px-2 ${isDark ? 'bg-[#181c24]' : 'bg-background'}`}>
      <div className="pt-6 pb-2">
        <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-6 ${isDark ? 'text-white' : 'text-foreground'}`}>MarkIt</h1>
      </div>
      <div className={`max-w-4xl mx-auto mt-8 rounded-lg shadow-lg p-6 ${isDark ? 'bg-[#232a36]' : 'bg-card'}`}>
        <div className="flex items-center mb-6">
          <Button variant="ghost" className={`mr-4 ${isDark ? 'text-white hover:bg-gray-700' : 'text-foreground hover:bg-accent'}`} onClick={() => navigate(`/section/${section.id}/subjects-ecr`)}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div>
            <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>Grading: {student.name} - {subject.name}</div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>View and edit grades for each quarter and category for this student and subject.</div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Students List */}
          <div className="w-full md:w-1/4">
            <Card className={isDark ? "bg-[#202634]" : "bg-card"}>
              <CardHeader>
                <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-foreground'}`}>Students</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className={`${isDark ? 'divide-y divide-gray-700' : 'divide-y divide-border'}`}>
                  {students.map(s => (
                    <li key={s.id}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${selectedStudentId === s.id ? 'bg-blue-600 text-white font-bold' : isDark ? 'bg-[#232a36] text-gray-200 hover:bg-blue-900' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}
                        onClick={() => handleSelectStudent(s.id)}
                      >
                        {s.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          {/* Main Grading UI */}
          <div className="w-full md:w-3/4">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-2 mt-2">
              {CATEGORY_TABS.map(cat => (
                <button
                  key={cat.key}
                  className={`flex-1 px-4 py-2 rounded-t font-semibold border-b-2 ${selectedCategory === cat.key ? (isDark ? 'border-blue-400 bg-[#181c24] text-white' : 'border-blue-400 bg-accent text-foreground') : (isDark ? 'bg-[#232a36] text-white border-transparent' : 'bg-secondary text-secondary-foreground border-transparent')}`}
                  onClick={() => setSelectedCategory(cat.key as CategoryKey)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {/* Quarter Tabs */}
            <div className="flex gap-2 mb-6 mt-2">
              {QUARTERS.map(q => (
                <button
                  key={q.key}
                  className={`flex-1 px-4 py-2 rounded-t font-semibold border-b-2 ${selectedQuarter === q.key ? (isDark ? 'border-blue-400 bg-[#181c24] text-white' : 'border-blue-400 bg-accent text-foreground') : (isDark ? 'bg-[#232a36] text-white border-transparent' : 'bg-secondary text-secondary-foreground border-transparent')}`}
                  onClick={() => setSelectedQuarter(q.key as QuarterKey)}
                >
                  {q.label}
                </button>
              ))}
            </div>
            {/* Assessments for selected category and quarter */}
            <div className={`rounded-lg p-4 mb-6 shadow ${isDark ? 'bg-[#202634]' : 'bg-card'}`}>
              <div className="flex justify-between items-center mb-2">
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>{CATEGORY_TABS.find(c => c.key === selectedCategory)?.label}</div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAddAssessment(selectedCategory)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Assessment
                </Button>
              </div>
              {assessments[selectedCategory].length === 0 ? (
                <div className={`italic ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>No assessments yet.</div>
              ) : (
                assessments[selectedCategory].map((a, idx) => (
                  <div key={a.id} className={`flex items-center gap-2 mb-3 p-3 rounded ${isDark ? 'bg-[#232a36]' : 'bg-secondary'}`}>
                    <Input
                      className={`w-32 ${isDark ? 'bg-[#181c24] text-white border-gray-600' : 'bg-background text-foreground border-input'}`}
                      placeholder="Assessment Name"
                      value={a.name}
                      onChange={e => handleAssessmentChange(selectedCategory, idx, "name", e.target.value)}
                    />
                    <div className="flex items-center gap-1">
                      <span className={isDark ? 'text-gray-300' : 'text-muted-foreground'}>Score</span>
                      <Input
                        className={`w-16 ${isDark ? 'bg-[#181c24] text-white border-gray-600' : 'bg-background text-foreground border-input'}`}
                        type="number"
                        min={0}
                        value={a.score}
                        onChange={e => handleAssessmentChange(selectedCategory, idx, "score", e.target.value)}
                      />
                    </div>
                    <span className={isDark ? 'text-gray-300' : 'text-muted-foreground'}>/</span>
                    <div className="flex items-center gap-1">
                      <span className={isDark ? 'text-gray-300' : 'text-muted-foreground'}>Total Points</span>
                      <Input
                        className={`w-16 ${isDark ? 'bg-[#181c24] text-white border-gray-600' : 'bg-background text-foreground border-input'}`}
                        type="number"
                        min={0}
                        value={a.totalPoints}
                        onChange={e => handleAssessmentChange(selectedCategory, idx, "totalPoints", e.target.value)}
                      />
                    </div>
                    <Button size="icon" variant="ghost" className="text-red-400 ml-2" onClick={() => handleDeleteAssessment(selectedCategory, idx)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded">
                {saving ? "Saving..." : "Save All"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectECRDetailPage; 