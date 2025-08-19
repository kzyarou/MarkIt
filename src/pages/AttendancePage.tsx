import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Check, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Section } from '@/types/grading';
import { getSections } from '@/services/gradesService';
import { saveAttendanceRecord, getAttendanceForSection, AttendanceRecord } from '@/services/attendanceService';
import { listDrafts, saveDraft, deleteDraft } from '@/utils/localDrafts';
import { useTheme } from 'next-themes';
import EducHubHeader from '@/components/EducHubHeader';
import { useBottomNav } from '@/hooks/use-mobile';

export default function AttendancePage() {
  const navigate = useNavigate();
  const { bottomNavClass } = useBottomNav();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [loading, setLoading] = useState(true);
  const [draftAttendance, setDraftAttendance] = useState<any[]>([]);

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const hubColor = isDark ? '#233876' : '#2563eb';

  useEffect(() => {
    async function fetchSections() {
      setLoading(true);
      const allSections = await getSections();
      setSections(allSections);
      // Load local attendance drafts
      const drafts = listDrafts<any>('attendance').map(d => d.data);
      setDraftAttendance(drafts);
      setLoading(false);
    }
    fetchSections();
  }, []);

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
    // Initialize attendance for all students
    const initialAttendance: Record<string, 'present' | 'absent' | 'late'> = {};
    section.students.forEach(student => {
      initialAttendance[student.id] = 'present';
    });
    setAttendance(initialAttendance);
  };

  const updateAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = async () => {
    if (!selectedSection) return;
    // Save each student's attendance to Firestore
    await Promise.all(selectedSection.students.map(student =>
      saveAttendanceRecord({
        studentId: student.id,
        sectionId: selectedSection.id,
        date: attendanceDate,
        status: attendance[student.id] || 'present',
        teacherId: 'TODO_TEACHER_ID', // Replace with real teacherId from auth
      })
    ));
    // Optionally, fetch and display saved attendance
    // const records = await getAttendanceForSection(selectedSection.id, attendanceDate);
    // console.log('Saved records:', records);
    setSelectedSection(null);
    setAttendance({});
  };

  const handleSaveDraftAttendance = () => {
    if (!selectedSection) return;
    const draft = {
      id: `${selectedSection.id}_${attendanceDate}`,
      sectionId: selectedSection.id,
      date: attendanceDate,
      attendance,
      createdAt: new Date().toISOString()
    };
    saveDraft('attendance', draft.id, draft);
    setDraftAttendance(prev => [...prev, draft]);
  };

  const handleUploadDraftAttendance = async (draft: any) => {
    // draft.attendance is an object: { [studentId]: status }
    const records = Object.entries(draft.attendance).map(([studentId, status]) => ({
      studentId,
      sectionId: draft.sectionId,
      date: draft.date,
      status: status as 'present' | 'absent' | 'late',
      teacherId: draft.teacherId || 'unknown',
    }));
    for (const record of records) {
      await saveAttendanceRecord(record);
    }
    deleteDraft('attendance', draft.id);
    setDraftAttendance(prev => prev.filter(d => d.id !== draft.id));
  };

  const getStatusColor = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present': return <Check className="w-4 h-4" />;
      case 'absent': return <X className="w-4 h-4" />;
      case 'late': return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${bottomNavClass}`}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <EducHubHeader subtitle="Attendance" />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!selectedSection ? (
              <>
                {/* Date Selection */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Select Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </CardContent>
                </Card>

                {/* Section Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Section</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sections.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No sections available</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sections.map((section) => {
                          const gradeNum = Number(section.gradeLevel);
                          const isSenior = section.classification === 'senior' || gradeNum === 11 || gradeNum === 12;
                          const isJunior = section.classification === 'junior' || [7,8,9,10].includes(gradeNum);
                          return (
                            <Card key={section.id} className="cursor-pointer hover:shadow-md transition-shadow">
                              <CardContent className="p-4" onClick={() => handleSectionSelect(section)}>
                                <h3 className="font-medium">{section.name}</h3>
                                <p className="text-sm text-gray-600">Grade {section.gradeLevel}</p>
                                <div className="text-xs mt-1">
                                  {isSenior ? '2 Semesters' : isJunior ? '4 Quarters' : ''}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{section.students.length} students</span>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedSection.name} - Attendance</CardTitle>
                      <p className="text-gray-600">Date: {attendanceDate}</p>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedSection(null)}>
                      Back to Sections
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedSection.students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          {student.lrn && (
                            <p className="text-sm text-gray-600">LRN: {student.lrn}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {(['present', 'late', 'absent'] as const).map((status) => (
                            <Button
                              key={status}
                              size="sm"
                              variant={attendance[student.id] === status ? "default" : "outline"}
                              onClick={() => updateAttendance(student.id, status)}
                              className={attendance[student.id] === status ? getStatusColor(status) : ''}
                            >
                              {getStatusIcon(status)}
                              <span className="ml-1 capitalize">{status}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <Button onClick={saveAttendance} className="w-full">
                      Save Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {draftAttendance.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Draft Attendance Records</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftAttendance.map((draft) => (
                    <Card key={draft.id} className="hover:shadow-md transition-shadow border-dashed border-2 border-yellow-400">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">Section: {draft.sectionId}</h3>
                            <Badge variant="outline" className="ml-2 text-yellow-700 border-yellow-400">Draft</Badge>
                            <div className="text-xs text-gray-500">Date: {draft.date}</div>
                          </div>
                          <Button size="sm" onClick={() => handleUploadDraftAttendance(draft)} className="ml-2 text-green-600 border-green-200 border">Upload</Button>
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleSaveDraftAttendance} variant="outline" className="ml-2">Save as Draft</Button>
          </main>
        </>
      )}
    </div>
  );
}
