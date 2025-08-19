import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, BookOpen, BarChart3, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Section } from '@/types/grading';
import { getSections, deleteSection, GradesService, leaveSection } from '@/services/gradesService';
import { StudentGradesView } from '@/components/StudentGradesView';
import { useNavigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { getAttendanceForStudent } from '@/services/attendanceService';
import GradeCalculator from '@/components/GradeCalculator';
import { listDrafts, deleteDraft } from '@/utils/localDrafts';
import { saveSection } from '@/services/gradesService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { useRef } from 'react';
import { useDrafts } from '@/contexts/DraftsContext';
import { useTheme } from 'next-themes';
import EducHubHeader from '@/components/EducHubHeader';
import { Input } from '@/components/ui/input';
import { useBottomNav } from '@/hooks/use-mobile';

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user, logout } = useAuth();
  const { bottomNavClass } = useBottomNav();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, isDraft: boolean } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { drafts, deleteDraft: deleteDraftContext, refreshDrafts } = useDrafts();
  const [_, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [searchTerm, setSearchTerm] = useState('');
  console.log('Dashboard drafts:', drafts);
  useEffect(() => {
    refreshDrafts();
  }, []);

  useEffect(() => {
    async function fetchSectionsAndTeachers() {
      if (user?.role === 'teacher') {
        setLoading(true);
        const allSections = await getSections();
        setSections(allSections); // Show all sections, not just user's
        // Fetch all teachers
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);
        const map: Record<string, string> = {};
        usersSnap.forEach(doc => {
          const data = doc.data();
          if (data.role === 'teacher') {
            map[doc.id] = data.name;
          }
        });
        setTeacherMap(map);
        setLoading(false);
      }
    }
    fetchSectionsAndTeachers();
  }, [user]);

  React.useEffect(() => {
    const handler = () => forceUpdate();
    window.addEventListener('drafts-updated', handler);
    return () => window.removeEventListener('drafts-updated', handler);
  }, []);

  const createSection = () => {
    navigate('/create-section');
  };

  const handleDeleteSection = async (sectionId: string) => {
    setConfirmDelete({ id: sectionId, isDraft: false });
  };

  const handleDeleteDraft = async (draftId: string) => {
    setConfirmDelete({ id: draftId, isDraft: true });
  };

  const handleUploadDraft = async (draftSection: Section) => {
    await saveSection(draftSection);
    deleteDraftContext(draftSection.id);
    setSections(prev => [...prev, draftSection]);
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id); // Start animation
    // Wait for animation to finish (e.g., 300ms)
    await new Promise(res => setTimeout(res, 300));
    if (confirmDelete.isDraft) {
      // Check if the draft exists in the database
      const serverSections = await getSections();
      const existsInDb = serverSections.some(s => s.id === confirmDelete.id);
      if (existsInDb) {
        await deleteSection(confirmDelete.id);
      }
      deleteDraftContext(confirmDelete.id);
    } else {
      if (user.role === 'student') {
        await leaveSection(user.id, confirmDelete.id);
      } else {
        await deleteSection(confirmDelete.id);
      }
      setSections(prev => prev.filter(s => s.id !== confirmDelete.id));
    }
    setDeletingId(null);
    setConfirmDelete(null);
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0F1A2B] text-white' : 'bg-background'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hubColor = isDark ? '#52677D' : '#2563eb';

  // Student Dashboard
  if (user.role === 'student') {
    const [grades, setGrades] = useState([]);
    const [loadingGrades, setLoadingGrades] = useState(true);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [gradesError, setGradesError] = useState('');
    const [attendanceError, setAttendanceError] = useState('');
    useEffect(() => {
      async function fetchGrades() {
        setLoadingGrades(true);
        setGradesError('');
        try {
          const userGrades = await GradesService.getGradesForUser(user.id);
          setGrades(userGrades);
        } catch (err) {
          setGradesError('Failed to load grades. Please try again.');
        } finally {
          setLoadingGrades(false);
        }
      }
      fetchGrades();
    }, [user.id]);

    useEffect(() => {
      async function fetchAttendance() {
        setLoadingAttendance(true);
        setAttendanceError('');
        try {
          const records = await getAttendanceForStudent(user.id);
          setAttendanceRecords(records);
        } catch (err) {
          setAttendanceError('Failed to load attendance. Please try again.');
        } finally {
          setLoadingAttendance(false);
        }
      }
      fetchAttendance();
    }, [user.id]);

    // Calculate overall grade and subject count
    let overallGrade = null;
    let subjectCount = 0;
    if (grades.length > 0) {
      const subjects = Array.from(new Set(grades.map(g => g.subject)));
      subjectCount = subjects.length;
      const allScores = grades.map(g => g.score);
      overallGrade = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    }

    let attendancePercent = null;
    if (attendanceRecords.length > 0) {
      const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
      attendancePercent = Math.round((presentCount / attendanceRecords.length) * 100);
    }

    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0F1A2B] text-white' : 'bg-background'} ${bottomNavClass}`}>
        <EducHubHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LRN</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.lrn || 'Not Set'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {gradesError ? (
                  <div className="text-red-600 text-sm mb-2">{gradesError} <button className="underline" onClick={() => window.location.reload()}>Retry</button></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-600">
                      {loadingGrades ? <Skeleton className="h-6 w-16" /> : (overallGrade !== null ? overallGrade : '--')}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {loadingGrades ? <Skeleton className="h-4 w-20" /> : (overallGrade !== null ? 'Calculated average' : 'No grades yet')}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingGrades ? <Skeleton className="h-6 w-16" /> : subjectCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loadingGrades ? <Skeleton className="h-4 w-20" /> : 'Active subjects'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {attendanceError ? (
                  <div className="text-red-600 text-sm mb-2">{attendanceError} <button className="underline" onClick={() => window.location.reload()}>Retry</button></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-600">
                      {loadingAttendance ? <Skeleton className="h-6 w-16" /> : (attendancePercent !== null ? `${attendancePercent}%` : '--')}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {loadingAttendance ? <Skeleton className="h-4 w-20" /> : (attendancePercent !== null ? 'This quarter' : 'No attendance data')}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <StudentGradesView userId={user.id} />

        </main>
      </div>
    );
  }

  // Teacher Dashboard
      return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0F1A2B] text-white' : 'bg-background'} ${bottomNavClass}`}>
      <EducHubHeader subtitle="Dashboard" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-semibold">Your Sections</h2>
            <p className="text-sm text-muted-foreground">Manage and track your classes</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search sections..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-56"
            />
            <Button onClick={createSection}>
              <Plus className="w-4 h-4 mr-2" />
              Create Section
            </Button>
          </div>
        </div>

        

        <div className="space-y-6">
          {/* Sections List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sections.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first section to start managing student grades.
                </p>
                <Button onClick={createSection}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Section
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {drafts.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Draft Sections</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drafts.map((section) => (
                      <Card
                        key={section.id}
                        className={`hover:shadow-md transition-shadow border-dashed border-2 border-yellow-400 ${deletingId === section.id ? 'animate-pop-out' : ''}`}
                      >
                        <CardHeader>
                          <CardTitle className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{section.name}</h3>
                              <Badge variant="secondary" className="mt-1">Grade {section.gradeLevel}</Badge>
                              <Badge variant="outline" className="ml-2 text-yellow-700 border-yellow-400">Draft</Badge>
                            </div>
                            <div className="flex flex-col gap-2 ml-2">
                              <Button size="sm" onClick={() => handleUploadDraft(section)} className="text-green-600 border-green-200 border">Upload</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteDraft(section.id)} className="text-red-600 border-red-200 border">Delete Draft</Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Students:</span>
                              <span className="font-medium">{section.students.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Subjects:</span>
                              <span className="font-medium">{section.subjects.length}</span>
                            </div>
                          </div>
                          <Button 
                            className="w-full mt-4 border-yellow-400 text-yellow-700" 
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/section/${section.id}`)}
                          >
                            Manage Draft
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {(() => {
                const term = searchTerm.trim().toLowerCase();
                const visible = term
                  ? sections.filter(s =>
                      s.name.toLowerCase().includes(term) ||
                      String(s.gradeLevel).toLowerCase().includes(term)
                    )
                  : sections;
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visible.map((section) => {
                      const gradeNum = Number(section.gradeLevel);
                      const isSenior = section.classification === 'senior' || gradeNum === 11 || gradeNum === 12;
                      const isJunior = section.classification === 'junior' || [7,8,9,10].includes(gradeNum);
                      return (
                        <Card
                          key={section.id}
                          className={`hover:shadow-md transition-shadow cursor-pointer ${deletingId === section.id ? 'animate-pop-out' : ''}`}
                        >
                          <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{section.name}</h3>
                                <Badge variant="secondary" className="mt-1">Grade {section.gradeLevel}</Badge>
                                <span className="ml-2 text-xs text-gray-500">Created by: {teacherMap[section.createdBy] || section.createdBy}</span>
                                <div className="text-xs mt-1">
                                  {isSenior ? '2 Semesters' : isJunior ? '4 Quarters' : ''}
                                </div>
                              </div>
                              <button
                                className="ml-2 text-red-600 hover:text-red-800 text-xs border border-red-200 rounded px-2 py-1"
                                onClick={e => { e.stopPropagation(); handleDeleteSection(section.id); }}
                                title="Delete Section"
                              >
                                Delete
                              </button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Students:</span>
                                <span className="font-medium">{section.students.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Subjects:</span>
                                <span className="font-medium">{section.subjects.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Connected:</span>
                                <span className="font-medium text-green-600">
                                  {section.students.filter(s => s.connectedUserId).length}
                                </span>
                              </div>
                            </div>
                            <div 
                              className="flex justify-center mt-4 gap-4"
                            >
                              <svg fill="none" width="36" height="36" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer" onClick={() => navigate(`/section/${section.id}`)}>
                                <title>View Section</title>
                                <g>
                                  <path d="M25,26a1,1,0,0,1-1,1H8a1,1,0,0,1-1-1V5H17V3H5V26a3,3,0,0,0,3,3H24a3,3,0,0,0,3-3V13H25Z" fill="currentColor"/>
                                  <path d="M27.12,2.88a3.08,3.08,0,0,0-4.24,0L17,8.75,16,14.05,21.25,13l5.87-5.87A3,3,0,0,0,27.12,2.88Zm-6.86,8.27-1.76.35.35-1.76,3.32-3.33,1.42,1.42Zm5.45-5.44-.71.7L23.59,5l.7-.71h0a1,1,0,0,1,1.42,0A1,1,0,0,1,25.71,5.71Z" fill="currentColor"/>
                                </g>
                              </svg>
                              <button type="button" className="p-0 bg-transparent border-none outline-none cursor-pointer" onClick={() => navigate(`/section/${section.id}/subjects-ecr`)}>
                                <svg width="36" height="36" viewBox="0 0 800 800" className="w-9 h-9 text-green-600 hover:text-green-800 transition-colors" xmlns="http://www.w3.org/2000/svg">
                                  <title>Exam Action</title>
                                  <g>
                                    <path d="M676.637,183.386c0.002-0.002,0.004-0.004,0.005-0.005L522.549,29.287c-3.619-3.62-8.62-5.86-14.145-5.86H137.5   c-11.046,0-20,8.954-20,20v713.146c0,11.046,8.954,20,20,20h525c11.046,0,20-8.954,20-20V197.522   C682.5,192.407,680.426,187.203,676.637,183.386z M642.5,736.573h-485V63.427h342.62l114.096,114.095l-85.812,0v-41.788   c0-11.046-8.954-20-20-20s-20,8.954-20,20v61.788c0,11.046,8.954,20,20,20c0,0,92.404,0,134.096,0V736.573z" fill="currentColor"/>
                                    <path d="M295.217,224.417l-39.854,39.855l-5.697-5.697c-7.811-7.811-20.473-7.811-28.283,0c-7.811,7.81-7.811,20.473,0,28.284   l19.84,19.84c3.75,3.751,8.838,5.858,14.142,5.858c5.305,0,10.392-2.107,14.143-5.858l53.996-53.999   c7.81-7.811,7.81-20.474-0.001-28.284C315.69,216.606,303.027,216.606,295.217,224.417z" fill="currentColor"/>
                                    <path d="M557.831,312.557h6.646c11.046,0,20-8.954,20-20s-8.954-20-20-20h-6.646c-11.046,0-20,8.954-20,20   S546.785,312.557,557.831,312.557z" fill="currentColor"/>
                                    <path d="M367.389,272.557c-11.046,0-20,8.954-20,20s8.954,20,20,20h129.609c11.046,0,20-8.954,20-20s-8.954-20-20-20H367.389z" fill="currentColor"/>
                                    <path d="M557.831,435.552h6.646c11.046,0,20-8.954,20-20s-8.954-20-20-20h-6.646c-11.046,0-20,8.954-20,20   S546.785,435.552,557.831,435.552z" fill="currentColor"/>
                                    <path d="M496.998,395.552H367.389c-11.046,0-20,8.954-20,20s8.954,20,20,20h129.609c11.046,0,20-8.954,20-20   S508.044,395.552,496.998,395.552z" fill="currentColor"/>
                                    <path d="M557.831,558.547h6.646c11.046,0,20-8.954,20-20s-8.954-20-20-20h-6.646c-11.046,0-20,8.954-20,20   S546.785,558.547,557.831,558.547z" fill="currentColor"/>
                                    <path d="M496.998,518.547H367.389c-11.046,0-20,8.954-20,20s8.954,20,20,20h129.609c11.046,0,20-8.954,20-20   S508.044,518.547,496.998,518.547z" fill="currentColor"/>
                                    <path d="M557.831,681.542h6.646c11.046,0,20-8.954,20-20s-8.954-20-20-20h-6.646c-11.046,0-20,8.954-20,20   S546.785,681.542,557.831,681.542z" fill="currentColor"/>
                                    <path d="M496.998,641.542H367.389c-11.046,0-20,8.954-20,20s8.954,20,20,20h129.609c11.046,0,20-8.954,20-20   S508.044,641.542,496.998,641.542z" fill="currentColor"/>
                                    <path d="M255.363,435.552c5.304,0,10.392-2.107,14.142-5.858l53.996-53.996c7.811-7.811,7.811-20.475,0-28.285   s-20.473-7.811-28.283,0l-39.854,39.855l-5.697-5.698c-7.81-7.81-20.474-7.812-28.284-0.001s-7.811,20.474-0.001,28.284   l19.84,19.841C244.972,433.444,250.059,435.552,255.363,435.552z" fill="currentColor"/>
                                    <path d="M234.239,511.547l-12.856,12.857c-7.81,7.811-7.81,20.474,0.001,28.284c3.905,3.905,9.023,5.857,14.142,5.857   s10.237-1.952,14.143-5.858l12.855-12.855l12.856,12.855c3.904,3.906,9.023,5.858,14.142,5.858s10.237-1.952,14.142-5.858   c7.811-7.811,7.811-20.473,0-28.283l-12.855-12.857l12.856-12.857c7.81-7.811,7.81-20.474-0.001-28.284   c-7.811-7.81-20.474-7.81-28.284,0.001l-12.856,12.856l-12.857-12.856c-7.811-7.811-20.473-7.811-28.283,0s-7.811,20.474,0,28.283   L234.239,511.547z" fill="currentColor"/>
                                    <path d="M295.217,593.4l-39.854,39.855l-5.697-5.697c-7.811-7.811-20.473-7.811-28.283,0c-7.811,7.81-7.811,20.473,0,28.283   l19.84,19.84c3.75,3.752,8.838,5.858,14.142,5.858c5.305,0,10.392-2.107,14.143-5.858l53.996-53.998   c7.81-7.811,7.81-20.474-0.001-28.284C315.69,585.59,303.027,585.59,295.217,593.4z" fill="currentColor"/>
                                  </g>
                                </svg>
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                    );
                  })}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </main>
      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={open => { if (!open) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirmDelete?.isDraft ? 'Draft' : 'Section'}?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.isDraft ? (
                <>This will permanently delete your draft and all its data (students, subjects, grades). This action cannot be undone.</>
              ) : (
                <>This will permanently delete the section and all its data (students, subjects, grades, and connections). This action cannot be undone and will affect all users connected to this section.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAction} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
