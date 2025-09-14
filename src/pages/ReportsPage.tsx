import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Eye, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Section, Student } from '@/types/grading';
import { getSections } from '@/services/gradesService';
import { DepEdReportCard } from '@/components/DepEdReportCard';
import { GradesService } from '@/services/gradesService';
import { useTheme } from 'next-themes';
import { DepEdClassRecord } from '@/components/DepEdClassRecord';
import MarkItHeader from '@/components/MarkItHeader';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useBottomNav } from '@/hooks/use-mobile';

export default function ReportsPage() {
  const navigate = useNavigate();
  const { bottomNavClass } = useBottomNav();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showReportCard, setShowReportCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gradesHidden, setGradesHidden] = useState(false);
  const [togglingGrades, setTogglingGrades] = useState(false);
  const [showClassRecord, setShowClassRecord] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  // Add state for selected subject
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  // Teacher name for ECR
  const { user } = useAuth();
  const [teacherName, setTeacherName] = useState<string>('');
  useEffect(() => {
    setTeacherName(user?.name || '');
  }, [user]);

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const hubColor = isDark ? '#52677D' : '#2563eb';

  useEffect(() => {
    async function fetchSections() {
      setLoading(true);
      const allSections = await getSections();
      setSections(allSections);
      setLoading(false);
    }
    fetchSections();
  }, []);

  // Check if grades are hidden for the selected student in the selected section
  useEffect(() => {
    async function checkGradesHidden() {
      if (selectedStudent && selectedSection) {
        // Fetch grades for this student in this section
        const grades = await GradesService.getGradesForUser(selectedStudent.connectedUserId || selectedStudent.id, true);
        const sectionGrades = grades.filter(g => g.sectionId === selectedSection.id);
        setGradesHidden(sectionGrades.length > 0 && sectionGrades.every(g => g.hidden));
      } else {
        setGradesHidden(false);
      }
    }
    checkGradesHidden();
  }, [selectedStudent, selectedSection, showReportCard]);

  // Handler to toggle grades visibility for the selected student
  const handleToggleGradesVisibility = async () => {
    if (!selectedStudent || !selectedSection) return;
    setTogglingGrades(true);
    try {
      await GradesService.toggleGradesVisibility(
        selectedStudent.connectedUserId || selectedStudent.id,
        selectedSection.id,
        !gradesHidden
      );
      setGradesHidden(!gradesHidden);
    } catch (error) {
      alert('Failed to toggle grade visibility.');
    } finally {
      setTogglingGrades(false);
    }
  };

  const generateReport = (section: Section) => {
    const reportData = {
      sectionName: section.name,
      gradeLevel: section.gradeLevel,
      studentsCount: section.students.length,
      subjectsCount: section.subjects.length,
      students: section.students.map(student => ({
        name: student.name,
        lrn: student.lrn,
        subjects: section.subjects.map(subject => ({
          name: subject.name,
          grades: student.gradeData[subject.id] || {}
        }))
      })),
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${section.name}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewSectionStudents = (section: Section) => {
    setSelectedSection(section);
    setSelectedStudent(null);
    setShowStudents(true);
  };

  const viewStudentReportCard = (student: Student) => {
    setSelectedStudent(student);
    setShowReportCard(true);
  };

  const printReportCard = () => {
    window.print();
  };

  const handleOpenClassRecord = async (subjectId: string) => {
    if (selectedSection) {
      setLoading(true);
      const allSections = await getSections();
      const updatedSection = allSections.find(s => s.id === selectedSection.id);
      if (updatedSection) {
        setSelectedSection(updatedSection);
        setSelectedSubject(subjectId);
        setShowClassRecord(true);
      }
      setLoading(false);
    }
  };

  if (showClassRecord && selectedSection) {
    return (
      <div className="min-h-screen bg-white text-black p-4">
        <Button onClick={() => setShowClassRecord(false)} className="mb-4 print:hidden border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600" variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
        </Button>
        <div className="flex items-center gap-3 mb-3 print:hidden">
          <label className="text-sm font-medium" htmlFor="teacherName">Teacher Name</label>
          <Input id="teacherName" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="max-w-xs" />
        </div>
        <DepEdClassRecord section={selectedSection} teacherName={teacherName} />
        <div className="flex justify-end mt-4 print:hidden">
          <Button onClick={() => window.print()} variant="default">
            <Download className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </div>
    );
  }

  if (selectedSection && !showReportCard && !showClassRecord && showStudents) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MarkItHeader subtitle="Reports" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button 
              onClick={() => setShowStudents(false)} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Subjects
            </Button>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Students in {selectedSection.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Grade {selectedSection.gradeLevel} • {selectedSection.students.length} students
            </p>
          </div>
          {selectedSection.students.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No students in this section</h3>
                <p className="text-gray-600 dark:text-gray-400">Add students to this section to view their cards.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedSection.students.map(student => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                        {student.lrn && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">LRN: {student.lrn}</p>
                        )}
                      </div>
                      <Users className="w-5 h-5 text-blue-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {student.gender || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subjects:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedSection.subjects.length}
                      </span>
                    </div>
                    
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={() => viewStudentReportCard(student)}
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Cards
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  if (selectedSection && !showReportCard && !showClassRecord) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MarkItHeader subtitle="Reports" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button 
              onClick={() => setSelectedSection(null)} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </Button>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Subjects in {selectedSection.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Grade {selectedSection.gradeLevel} • {selectedSection.subjects.length} subjects • {selectedSection.students.length} students
            </p>
          </div>
          
          <div className="mb-6">
            <Button 
              onClick={() => setShowStudents(true)} 
              variant="default" 
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              View All Students
            </Button>
          </div>

          {selectedSection.subjects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No subjects in this section</h3>
                <p className="text-gray-600 dark:text-gray-400">Add subjects to this section to view reports.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedSection.subjects.map(subject => (
                <Card key={subject.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">{subject.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => {/* TODO: View students for this subject */}} className="w-full">View Students</Button>
                    <Button onClick={() => handleOpenClassRecord(subject.id)} className="w-full">View Class Record</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0F1A2B] text-white' : 'bg-background'} ${bottomNavClass}`}>
      <MarkItHeader subtitle="Reports" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-mobile-content">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {sections.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                  <p className="text-gray-600">Create sections to generate reports.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => {
                  const gradeNum = Number(section.gradeLevel);
                  const isSenior = section.classification === 'senior' || gradeNum === 11 || gradeNum === 12;
                  const isJunior = section.classification === 'junior' || [7,8,9,10].includes(gradeNum);
                  return (
                    <Card key={section.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{section.name}</h3>
                            <p className="text-sm text-gray-600 font-normal">Grade {section.gradeLevel}</p>
                            <div className="text-xs mt-1">
                              {isSenior ? '2 Semesters' : isJunior ? '4 Quarters' : ''}
                            </div>
                          </div>
                          <FileText className="w-5 h-5 text-blue-600" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Students:</span>
                          <span className="font-medium">{section.students.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subjects:</span>
                          <span className="font-medium">{section.subjects.length}</span>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => viewSectionStudents(section)}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Cards
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setSelectedSection(section); setShowClassRecord(true); setSelectedSubject(null); }}
                            className="flex-1"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            View Class Record
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Report Card Modal */}
      <Dialog open={showReportCard} onOpenChange={setShowReportCard}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="print:hidden">Report Card - {selectedStudent?.name}</span>
              <div className="flex gap-2 print:hidden">
                {selectedStudent && selectedSection && (
                  <Button onClick={handleToggleGradesVisibility} size="sm" variant={gradesHidden ? 'outline' : 'default'} disabled={togglingGrades}>
                    {gradesHidden ? 'Show Grades' : 'Hide Grades'}
                  </Button>
                )}
                <Button onClick={printReportCard} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedStudent && selectedSection && (
            gradesHidden ? (
              <div className="text-center text-orange-600 py-12">
                <h2 className="text-xl font-semibold mb-4">Grades are currently hidden by your teacher.</h2>
                <p>Please check back later or contact your teacher for more information.</p>
              </div>
            ) : (
              <DepEdReportCard student={selectedStudent} section={selectedSection} />
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Class Record Modal */}
      <Dialog open={showClassRecord} onOpenChange={open => { setShowClassRecord(open); if (!open) setSelectedSubject(null); }}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto print:!max-w-full print:!max-h-full print:!overflow-visible">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="print:hidden">Class Record - {selectedSection?.name}</span>
              <div className="flex gap-2 print:hidden">
                <Button onClick={() => { window.print(); }} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {/* Show class record for selected subject */}
          {selectedSection && selectedSubject && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" onClick={() => setShowClassRecord(false)} className="border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600">
                  ← Back
                </Button>
                <h2 className="text-xl font-bold">{selectedSection.subjects.find(s => s.id === selectedSubject)?.name} Class Record</h2>
                <div className="ml-auto flex items-center gap-2 print:hidden">
                  <label className="text-sm font-medium" htmlFor="teacherNameModal">Teacher</label>
                  <Input id="teacherNameModal" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="max-w-xs" />
                </div>
              </div>
              <DepEdClassRecord section={{ ...selectedSection, subjects: [selectedSection.subjects.find(s => s.id === selectedSubject)!] }} teacherName={teacherName} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
