import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSections, saveSection } from "@/services/gradesService";
import { Section, Student, Subject, ScoreEntry, CategoryScores, QuarterGrades } from "@/types/grading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

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
    // Update gradeData for the selected student, subject, and quarter
    const updatedStudents = students.map(s => {
      if (s.id !== selectedStudentId) return s;
      const prevGradeData = s.gradeData || {} as any;
      const createEmptyCategoryScores = (): CategoryScores => ({ writtenWork: [], performanceTask: [], quarterlyExam: [] });
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
              writtenWork: assessments.writtenWork,
              performanceTask: assessments.performanceTask,
              quarterlyExam: assessments.quarterlyExam,
            }
          }
        }
      };
    });
    const updatedSection: Section = {
      ...section,
      students: updatedStudents
    };
    await saveSection(updatedSection);
    setSection(updatedSection);
    setStudents(updatedStudents);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181c24]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!section || !subject || !students.length || !selectedStudentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181c24]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Section, Subject, or Student not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const student = students.find(s => s.id === selectedStudentId)!;

  return (
    <div className="min-h-screen bg-[#181c24] pb-24 px-2">
      <div className="pt-6 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-6 text-white">EducHub</h1>
      </div>
      <div className="max-w-4xl mx-auto mt-8 bg-[#232a36] rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="text-white mr-4" onClick={() => navigate(`/section/${section.id}/subjects-ecr`)}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div>
            <div className="text-lg font-semibold text-white">Grading: {student.name} - {subject.name}</div>
            <div className="text-sm text-gray-300">View and edit grades for each quarter and category for this student and subject.</div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Students List */}
          <div className="w-full md:w-1/4">
            <Card className="bg-[#202634]">
              <CardHeader>
                <CardTitle className="text-white text-base">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-gray-700">
                  {students.map(s => (
                    <li key={s.id}>
                      <button
                        className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${selectedStudentId === s.id ? 'bg-blue-600 text-white font-bold' : 'bg-[#232a36] text-gray-200 hover:bg-blue-900'}`}
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
                  className={`flex-1 px-4 py-2 rounded-t bg-[#232a36] text-white font-semibold border-b-2 ${selectedCategory === cat.key ? 'border-blue-400 bg-[#181c24]' : 'border-transparent'}`}
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
                  className={`flex-1 px-4 py-2 rounded-t bg-[#232a36] text-white font-semibold border-b-2 ${selectedQuarter === q.key ? 'border-blue-400 bg-[#181c24]' : 'border-transparent'}`}
                  onClick={() => setSelectedQuarter(q.key as QuarterKey)}
                >
                  {q.label}
                </button>
              ))}
            </div>
            {/* Assessments for selected category and quarter */}
            <div className="bg-[#202634] rounded-lg p-4 mb-6 shadow">
              <div className="flex justify-between items-center mb-2">
                <div className="text-lg font-semibold text-white">{CATEGORY_TABS.find(c => c.key === selectedCategory)?.label}</div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAddAssessment(selectedCategory)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Assessment
                </Button>
              </div>
              {assessments[selectedCategory].length === 0 ? (
                <div className="text-gray-400 italic">No assessments yet.</div>
              ) : (
                assessments[selectedCategory].map((a, idx) => (
                  <div key={a.id} className="flex items-center gap-2 mb-3 bg-[#232a36] p-3 rounded">
                    <Input
                      className="bg-[#181c24] text-white border-gray-600 w-32"
                      placeholder="Assessment Name"
                      value={a.name}
                      onChange={e => handleAssessmentChange(selectedCategory, idx, "name", e.target.value)}
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-gray-300">Score</span>
                      <Input
                        className="bg-[#181c24] text-white border-gray-600 w-16"
                        type="number"
                        min={0}
                        value={a.score}
                        onChange={e => handleAssessmentChange(selectedCategory, idx, "score", e.target.value)}
                      />
                    </div>
                    <span className="text-gray-300">/</span>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-300">Total Points</span>
                      <Input
                        className="bg-[#181c24] text-white border-gray-600 w-16"
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