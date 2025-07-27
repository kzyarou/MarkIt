import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, BookOpen, Plus, Eye, EyeOff, Calendar, Settings } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Section, Student } from '@/types/grading';
import { getSections, saveSection, StudentUserService, GradesService } from '@/services/gradesService';
import { loadDraft, saveDraft } from '@/utils/localDrafts';
import { StudentCard } from '@/components/StudentCard';
import { SubjectManager } from '@/components/SubjectManager';
import { StudentSubjectGradingModal } from '@/components/StudentSubjectGradingModal';
import { UserConnectionModal } from '@/components/UserConnectionModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

export default function SectionDetailsPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [section, setSection] = useState<Section | null>(null);
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const hubColor = isDark ? '#233876' : '#2563eb';

  useEffect(() => {
    async function fetchSection() {
      if (sectionId) {
        setLoading(true);
        // Try to load draft from localStorage first
        const draftSection = loadDraft<Section>(user?.id, 'section', sectionId);
        if (draftSection) {
          setSection(draftSection);
          setLoading(false);
          return;
        }
        // Otherwise, fetch from server
        const sectionsArr = await getSections();
        const foundSection = sectionsArr.find(s => s.id === sectionId);
        if (foundSection) {
          setSection(foundSection);
          loadConnectedUsers(sectionId);
        }
        setLoading(false);
      }
    }
    fetchSection();
    // eslint-disable-next-line
  }, [sectionId]);

  const loadConnectedUsers = async (sectionId: string) => {
    try {
      const result = await StudentUserService.getSectionConnectedUsers(sectionId);
      if (result.success && result.data) {
        setConnectedUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading connected users:', error);
    }
  };

  const handleSubjectsChange = async (subjects: any[]) => {
    if (section) {
      const updatedSection = { ...section, subjects };
      setSection(updatedSection);
      // If draft, save to localStorage; else, save to server
      const isDraft = !!loadDraft<Section>(user?.id, 'section', updatedSection.id);
      if (isDraft) {
        saveDraft(user?.id, 'section', updatedSection.id, updatedSection);
      } else {
        await saveSection(updatedSection);
      }
      toast({
        title: "Subjects Updated",
        description: "Section subjects have been updated successfully."
      });
    }
  };

  const handleManageSubjects = (student: Student) => {
    navigate(`/section/${sectionId}/student/${student.id}`);
  };

  const handleManageConnection = (student: Student) => {
    setSelectedStudent(student);
    setShowConnectionModal(true);
  };

  const handleStudentConnect = async (updatedStudent: Student, userData: any) => {
    if (!section) return;
    const updatedSection = {
      ...section,
      students: section.students.map(s =>
        s.id === updatedStudent.id ? updatedStudent : s
      )
    };
    setSection(updatedSection);
    // If draft, save to localStorage; else, save to server
    const isDraft = !!loadDraft<Section>(user?.id, 'section', updatedSection.id);
    if (isDraft) {
      saveDraft(user?.id, 'section', updatedSection.id, updatedSection);
    } else {
      await saveSection(updatedSection);
      // Connect student to user in Firestore
      try {
        await StudentUserService.connectStudentToUser(
          updatedStudent,
          userData,
          updatedSection,
          user?.id || 'system'
        );
        // Automatically sync all grades for this student to the connected user is handled in the service
      } catch (error) {
        throw error;
      }
      loadConnectedUsers(updatedSection.id);
    }
  };

  const handleStudentDisconnect = async (student: Student) => {
    if (!section) return;
    // Remove connection fields instead of setting to undefined
    const updatedStudent = { ...student };
    delete updatedStudent.connectedUserId;
    delete updatedStudent.connectedUserLRN;
    delete updatedStudent.connectedUserEmail;
    const updatedSection = {
      ...section,
      students: section.students.map(s =>
        s.id === updatedStudent.id ? updatedStudent : s
      )
    };
    setSection(updatedSection);
    // If draft, save to localStorage; else, save to server
    const isDraft = !!loadDraft<Section>(user?.id, 'section', updatedSection.id);
    if (isDraft) {
      saveDraft(user?.id, 'section', updatedSection.id, updatedSection);
    } else {
      await saveSection(updatedSection);
      // Disconnect student from user in Firestore
      try {
        await StudentUserService.disconnectStudentFromUser(
          student.id,
          student.connectedUserId!,
          section.id
        );
      } catch (error) {
        throw error;
      }
      loadConnectedUsers(section.id);
    }
  };

  const handleGradeSave = async (updatedStudent: Student, hidden = false) => {
    if (!section || !user) return;

    // Update section data
    const updatedSection = {
      ...section,
      students: section.students.map(s => 
        s.id === updatedStudent.id ? updatedStudent : s
      )
    };
    setSection(updatedSection);
    // If draft, save to localStorage; else, save to server
    const isDraft = !!loadDraft<Section>(user?.id, 'section', updatedSection.id);
    if (isDraft) {
      saveDraft(user?.id, 'section', updatedSection.id, updatedSection);
    } else {
      await saveSection(updatedSection);
      // Sync grades if user is connected
      if (updatedStudent.connectedUserId) {
        try {
          await GradesService.syncGradesFromSection(
            updatedStudent.connectedUserId,
            section.id,
            updatedStudent,
            section,
            hidden
          );
        } catch (error) {
          console.error('Error syncing grades:', error);
        }
      }
    }
    toast({
      title: "Grades Saved",
      description: `Grades for ${updatedStudent.name} have been saved${hidden ? ' (hidden)' : ''}.`
    });
  };

  const toggleAllGradesVisibility = async (hidden: boolean) => {
    if (!section || !user) return;

    const connectedStudents = section.students.filter(s => s.connectedUserId);
    let updatedCount = 0;

    for (const student of connectedStudents) {
      try {
        await GradesService.toggleGradesVisibility(
          student.connectedUserId!,
          section.id,
          hidden
        );
        updatedCount++;
      } catch (error) {
        console.error(`Error updating visibility for student ${student.id}:`, error);
      }
    }

    toast({
      title: hidden ? "Grades Hidden" : "Grades Shown",
      description: `Updated visibility for ${updatedCount} connected students.`
    });
  };

  // Add this handler for force syncing grades
  const handleForceSync = async (student: Student) => {
    if (!section || !student.connectedUserId) return;
    try {
      await GradesService.syncGradesFromSection(
        student.connectedUserId,
        section.id,
        student,
        section
      );
      toast({
        title: 'Grades Synced',
        description: `Grades for ${student.name} have been force-synced to the connected user.`
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync grades.',
        variant: 'destructive'
      });
    }
  };

  const handleShowGrades = async (student: Student) => {
    if (!section || !student.connectedUserId) return;
    try {
      await GradesService.toggleGradesVisibility(
        student.connectedUserId,
        section.id,
        false // show grades
      );
      // Force sync grades to ensure Firestore is up to date
      await GradesService.syncGradesFromSection(
        student.connectedUserId,
        section.id,
        student,
        section,
        false
      );
      toast({
        title: 'Grades Shown',
        description: `Grades for ${student.name} are now visible to the connected user.`
      });
    } catch (error) {
      toast({
        title: 'Failed to Show Grades',
        description: error instanceof Error ? error.message : 'Could not update grade visibility.',
        variant: 'destructive'
      });
    }
  };

  if (loading || !section) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181c24]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const connectedStudentsCount = section.students.filter(s => s.connectedUserId).length;

  return (
    <div className="min-h-screen bg-background dark:bg-[#181c24] pb-8 px-2">
      <div className="pt-6 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-2 text-foreground dark:text-white">EducHub</h1>
        <div className="flex items-center mb-6 max-w-7xl mx-auto">
          <Button variant="ghost" className="text-white mr-4" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div>
            <div className="text-lg font-semibold text-white">Section: {section.name}</div>
            <div className="text-sm text-gray-300">Manage students, subjects, and grades for this section.</div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-4">
        <div className="bg-card dark:bg-[#232a36] rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-[#202634]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Students</CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{section.students.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#202634]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Connected Users</CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{connectedStudentsCount}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#202634]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Subjects</CardTitle>
                <BookOpen className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-white">{section.subjects.length}</div>
                  <Button size="sm" variant="outline" className="text-white border-gray-600" onClick={() => setShowSubjectManager(true)}>
                    <Settings className="w-4 h-4 mr-1" />
                    Manage Subjects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grade Visibility Controls */}
          {connectedStudentsCount > 0 && (
            <Card className="mb-6 bg-[#202634]">
              <CardHeader>
                <CardTitle className="text-white">Grade Visibility Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={() => toggleAllGradesVisibility(false)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    variant="outline"
                  >
                    <Eye className="w-4 h-4" />
                    Show All Grades
                  </Button>
                  <Button
                    onClick={() => toggleAllGradesVisibility(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                    variant="outline"
                  >
                    <EyeOff className="w-4 h-4" />
                    Hide All Grades
                  </Button>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Bulk show/hide grades for all {connectedStudentsCount} connected students in this section.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Students</h2>
              <Button onClick={() => navigate(`/section/${sectionId}/students`)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Students
              </Button>
            </div>

            {section.students.length === 0 ? (
              <Card className="bg-[#202634]">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No students yet</h3>
                  <p className="text-gray-400 mb-4">
                    Add students to this section to start managing their grades.
                  </p>
                  <Button onClick={() => navigate(`/section/${sectionId}/students`)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Student
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.students.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onManageSubjects={handleManageSubjects}
                    onManageConnection={handleManageConnection}
                    onForceSync={handleForceSync}
                    onShowGrades={handleShowGrades}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <SubjectManager
          isOpen={showSubjectManager}
          onClose={() => setShowSubjectManager(false)}
          subjects={section.subjects}
          onSubjectsChange={handleSubjectsChange}
        />

        {showGradingModal && selectedStudent && selectedSubject && (
          <StudentSubjectGradingModal
            isOpen={showGradingModal}
            onClose={() => setShowGradingModal(false)}
            student={selectedStudent}
            subject={selectedSubject}
            onSave={handleGradeSave}
          />
        )}

        {showConnectionModal && selectedStudent && (
          <UserConnectionModal
            isOpen={showConnectionModal}
            onClose={() => setShowConnectionModal(false)}
            student={selectedStudent}
            onConnect={handleStudentConnect}
            onDisconnect={handleStudentDisconnect}
          />
        )}
      </div>
    </div>
  );
}
