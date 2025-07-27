import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, User, Plus } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Section, Student, Subject } from '@/types/grading';
import { getSections, saveSection } from '@/services/gradesService';
import { loadDraft, saveDraft } from '@/utils/localDrafts';
import { calculateQuarterGrade, calculateFinalGrade, getGradeColor, calculateGeneralAverage } from '@/utils/gradeCalculations';
import { StudentSubjectGradingModal } from '@/components/StudentSubjectGradingModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentSubjectsPage() {
  const { sectionId, studentId } = useParams<{ sectionId: string; studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [section, setSection] = useState<Section | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSectionAndStudent() {
      if (sectionId && studentId) {
        setLoading(true);
        // Try to load draft from localStorage first
        const draftSection = loadDraft<Section>(user?.id, 'section', sectionId);
        if (draftSection) {
          setSection(draftSection);
          const foundStudent = draftSection.students.find(s => s.id === studentId);
          if (foundStudent) {
            setStudent(foundStudent);
          }
          setLoading(false);
          return;
        }
        // Otherwise, fetch from server
        const sections = await getSections();
        const foundSection = sections.find(s => s.id === sectionId);
        if (foundSection) {
          setSection(foundSection);
          const foundStudent = foundSection.students.find(s => s.id === studentId);
          if (foundStudent) {
            setStudent(foundStudent);
          }
        }
        setLoading(false);
      }
    }
    fetchSectionAndStudent();
  }, [sectionId, studentId, user?.id]);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowGradingModal(true);
  };

  const handleGradeSave = async (updatedStudent: Student, hidden = false) => {
    if (!section) return;

    const updatedSection = {
      ...section,
      students: section.students.map(s => 
        s.id === updatedStudent.id ? updatedStudent : s
      )
    };
    
    setSection(updatedSection);
    setStudent(updatedStudent);
    // If draft, save to localStorage; else, save to server
    const isDraft = !!loadDraft<Section>(user?.id, 'section', updatedSection.id);
    if (isDraft) {
      saveDraft(user?.id, 'section', updatedSection.id, updatedSection);
    } else {
      await saveSection(updatedSection);
    }

    toast({
      title: "Grades Saved",
      description: `Grades for ${updatedStudent.name} have been saved${hidden ? ' (hidden)' : ''}.`
    });
  };

  // Add a function to reload section and student after modal closes
  const reloadSectionAndStudent = async () => {
    if (sectionId && studentId) {
      setLoading(true);
      const sections = await getSections();
      const foundSection = sections.find(s => s.id === sectionId);
      if (foundSection) {
        setSection(foundSection);
        const foundStudent = foundSection.students.find(s => s.id === studentId);
        if (foundStudent) {
          setStudent(foundStudent);
        }
      }
      setLoading(false);
    }
  };

  if (loading || !section || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate(`/section/${sectionId}`)} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                <p className="text-muted-foreground">{section.name} - Grade {section.gradeLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Student</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{student.name}</div>
              {student.lrn && (
                <div className="text-sm text-muted-foreground">LRN: {student.lrn}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Section</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{section.name}</div>
              <div className="text-sm text-muted-foreground">Grade {section.gradeLevel}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{section.subjects.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Subjects</h2>
          </div>

          {/* General Average Display */}
          {section.subjects.length > 0 && (
            (() => {
              // Compute final grades for all subjects
              const subjectGrades = section.subjects.map(subject => {
                if (student.gradeData && student.gradeData[subject.id]) {
                  const quarters = student.gradeData[subject.id];
                  const quarterResults = [
                    quarters.quarter1 ? calculateQuarterGrade(quarters.quarter1, subject) : null,
                    quarters.quarter2 ? calculateQuarterGrade(quarters.quarter2, subject) : null,
                    quarters.quarter3 ? calculateQuarterGrade(quarters.quarter3, subject) : null,
                    quarters.quarter4 ? calculateQuarterGrade(quarters.quarter4, subject) : null,
                  ];
                  return calculateFinalGrade(quarterResults);
                }
                return 0;
              }).filter(g => g > 0);
              const generalAverage = calculateGeneralAverage(subjectGrades);
              return (
                <div className="flex flex-col items-center justify-center mb-4">
                  <span className={`text-2xl font-bold ${getGradeColor(generalAverage)}`}>{generalAverage > 0 ? generalAverage : '--'}</span>
                  <span className="text-xs text-muted-foreground mt-1">General Average</span>
                </div>
              );
            })()
          )}

          {section.subjects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No subjects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add subjects to this section to start grading.
                </p>
                <Button onClick={() => navigate(`/section/${sectionId}`)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Go to Section
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.subjects.map((subject) => {
                // Compute the student's final grade for this subject
                let finalGrade = 0;
                if (student.gradeData && student.gradeData[subject.id]) {
                  const quarters = student.gradeData[subject.id];
                  const quarterResults = [
                    quarters.quarter1 ? calculateQuarterGrade(quarters.quarter1, subject) : null,
                    quarters.quarter2 ? calculateQuarterGrade(quarters.quarter2, subject) : null,
                    quarters.quarter3 ? calculateQuarterGrade(quarters.quarter3, subject) : null,
                    quarters.quarter4 ? calculateQuarterGrade(quarters.quarter4, subject) : null,
                  ];
                  finalGrade = calculateFinalGrade(quarterResults);
                }
                return (
                  <Card key={subject.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleSubjectClick(subject)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{subject.name}</span>
                        <BookOpen className="w-5 h-5 text-gray-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-4">
                        <span className={`text-3xl font-bold ${getGradeColor(finalGrade)}`}>{finalGrade > 0 ? finalGrade : '--'}</span>
                        <span className="text-xs text-muted-foreground mt-1">Final Grade</span>
                        {subject.track && (
                          <span className="text-xs text-blue-600 mt-1">Track: {subject.track}</span>
                        )}
                        {subject.type && (
                          <span className="text-xs text-green-600 mt-1">Type: {subject.type}</span>
                        )}
                      </div>
                      <Button className="w-full mt-4" size="sm">
                        Enter Grades
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showGradingModal && selectedSubject && (
        <StudentSubjectGradingModal
          isOpen={showGradingModal}
          onClose={async () => {
            setShowGradingModal(false);
            await reloadSectionAndStudent();
          }}
          student={student}
          subject={selectedSubject}
          section={section}
          setSection={setSection}
          onSave={handleGradeSave}
        />
      )}
    </div>
  );
}
