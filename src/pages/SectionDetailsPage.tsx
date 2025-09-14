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
import { useBottomNav } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

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
  const [query, setQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'connected' | 'lrn'>('name');
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const hubColor = isDark ? '#233876' : '#2563eb';
  const { bottomNavClass } = useBottomNav();

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
    const studentWithGender: Student = {
      ...updatedStudent,
      gender: (updatedStudent.gender ?? userData?.gender) as any,
    };
    const updatedSection = {
      ...section,
      students: section.students.map(s =>
        s.id === updatedStudent.id ? studentWithGender : s
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
          studentWithGender,
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
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#181c24]' : 'bg-background'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const connectedStudentsCount = section.students.filter(s => s.connectedUserId).length;

  // Compute filtered/sorted students for display
  const displayStudents = section.students
    .filter(s => {
      const matchesQuery = query.trim().length === 0 ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        (s.lrn ?? '').toLowerCase().includes(query.toLowerCase());
      const matchesGender = genderFilter === 'all' || s.gender === genderFilter;
      const matchesConnected = !showConnectedOnly || !!s.connectedUserId;
      return matchesQuery && matchesGender && matchesConnected;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'connected') {
        const aConn = a.connectedUserId ? 0 : 1;
        const bConn = b.connectedUserId ? 0 : 1;
        if (aConn !== bConn) return aConn - bConn; // connected first
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'lrn') {
        const aHas = a.lrn ? 0 : 1;
        const bHas = b.lrn ? 0 : 1;
        if (aHas !== bHas) return aHas - bHas; // with LRN first
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <div className={`min-h-screen bg-background dark:bg-[#181c24] px-2 ${bottomNavClass}`}>
      <div className="pt-6 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-2 text-foreground dark:text-white">MarkIt</h1>
        <div className="flex items-center mb-6 max-w-7xl mx-auto">
          <Button variant="ghost" className={`mr-4 ${isDark ? 'text-white hover:bg-gray-700' : 'text-foreground hover:bg-accent'}`} onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div>
            <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>Section: {section.name}</div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Manage students, subjects, and grades for this section.</div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-4">
        <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-[#232a36]' : 'bg-card'}`}>
          {/* Section Overview Stats */}
          <div className="mb-6">
            <h2 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-foreground'}`}>Section Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Total Students Card */}
              <div className={`relative overflow-hidden rounded-lg p-4 ${isDark ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>Total Students</p>
                    <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-blue-900'}`}>{section.students.length}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                      {section.students.length === 1 ? 'Student enrolled' : 'Students enrolled'}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${isDark ? 'bg-blue-800/50' : 'bg-blue-100'}`}>
                    <Users className={`w-5 h-5 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                  </div>
                </div>
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-full ${isDark ? 'bg-blue-700/20' : 'bg-blue-200/50'}`} style={{ transform: 'translate(8px, -8px)' }}></div>
              </div>

              {/* Connected Students Card */}
              <div className={`relative overflow-hidden rounded-lg p-4 ${isDark ? 'bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-700/30' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-green-200' : 'text-green-600'}`}>Connected Students</p>
                    <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-green-900'}`}>{connectedStudentsCount}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                      {connectedStudentsCount === 0 ? 'No connections' : 
                       connectedStudentsCount === 1 ? 'Student connected' : 
                       `${Math.round((connectedStudentsCount / section.students.length) * 100)}% connected`}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${isDark ? 'bg-green-800/50' : 'bg-green-100'}`}>
                    <div className="relative">
                      <Users className={`w-5 h-5 ${isDark ? 'text-green-300' : 'text-green-600'}`} />
                      {connectedStudentsCount > 0 && (
                        <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-500'}`}></div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-full ${isDark ? 'bg-green-700/20' : 'bg-green-200/50'}`} style={{ transform: 'translate(8px, -8px)' }}></div>
              </div>

              {/* Subjects Card */}
              <div className={`relative overflow-hidden rounded-lg p-4 ${isDark ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-purple-200' : 'text-purple-600'}`}>Subjects</p>
                    <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-purple-900'}`}>{section.subjects.length}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                      {section.subjects.length === 0 ? 'No subjects' : 
                       section.subjects.length === 1 ? 'Subject configured' : 'Subjects configured'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className={`p-2 rounded-full ${isDark ? 'bg-purple-800/50' : 'bg-purple-100'}`}>
                      <BookOpen className={`w-5 h-5 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`text-xs px-2 py-1 h-7 ${isDark ? 'text-purple-200 border-purple-600 hover:bg-purple-800/30' : 'text-purple-600 border-purple-300 hover:bg-purple-100'}`}
                      onClick={() => setShowSubjectManager(true)}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Manage
                  </Button>
                  </div>
                </div>
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-full ${isDark ? 'bg-purple-700/20' : 'bg-purple-200/50'}`} style={{ transform: 'translate(8px, -8px)' }}></div>
              </div>
            </div>
          </div>

          {/* Grade Visibility Controls */}
          {connectedStudentsCount > 0 && (
            <Card className={isDark ? 'mb-6 bg-[#202634]' : 'mb-6 bg-card'}>
              <CardHeader>
                <CardTitle className={isDark ? 'text-white' : 'text-foreground'}>Grade Visibility Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    onClick={() => toggleAllGradesVisibility(false)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Show All Grades
                  </Button>
                  <Button
                    onClick={() => toggleAllGradesVisibility(true)}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <EyeOff className="w-4 h-4" />
                    Hide All Grades
                  </Button>
                </div>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                  Bulk show/hide grades for all {connectedStudentsCount} connected students in this section.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Students Toolbar */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>Students</h2>
              <div className="flex items-center gap-2">
                <Button onClick={() => navigate(`/section/${sectionId}/students`)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Students
              </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="col-span-1 sm:col-span-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search students by name or LRN"
                />
              </div>
              <Select value={sortBy} onValueChange={(v: 'name' | 'connected' | 'lrn') => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort: Name</SelectItem>
                  <SelectItem value="connected">Sort: Connected First</SelectItem>
                  <SelectItem value="lrn">Sort: With LRN First</SelectItem>
                </SelectContent>
              </Select>
              <Select value={genderFilter} onValueChange={(v: 'all' | 'male' | 'female') => setGenderFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showConnectedOnly} onCheckedChange={setShowConnectedOnly} id="connected-only" />
              <label htmlFor="connected-only" className={`text-sm ${isDark ? 'text-gray-300' : 'text-muted-foreground'}`}>Show connected only</label>
            </div>
            </div>

            {section.students.length === 0 ? (
            <Card className={isDark ? 'bg-[#202634]' : 'bg-card'}>
                <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-foreground'}`}>No students yet</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-muted-foreground'} mb-4`}>
                    Add students to this section to start managing their grades.
                  </p>
                <Button onClick={() => navigate(`/section/${sectionId}/students`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Student
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayStudents.map((student) => (
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

        <SubjectManager
          isOpen={showSubjectManager}
          onClose={() => setShowSubjectManager(false)}
          subjects={section.subjects}
          onSubjectsChange={handleSubjectsChange}
        />

        {showGradingModal && selectedStudent && selectedSubject && section && (
          <StudentSubjectGradingModal
            isOpen={showGradingModal}
            onClose={() => setShowGradingModal(false)}
            student={selectedStudent}
            subject={selectedSubject}
            section={section}
            setSection={setSection}
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
