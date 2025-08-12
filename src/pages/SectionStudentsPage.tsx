import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Users, User, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Section, Student } from '@/types/grading';
import { getSections, saveSection } from '@/services/gradesService';
import { loadDraft, saveDraft } from '@/utils/localDrafts';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function SectionStudentsPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [section, setSection] = useState<Section | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentLRN, setNewStudentLRN] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'male' | 'female' | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSection() {
      if (sectionId) {
        setLoading(true);
        // Try to load draft from localStorage first
        const draftSection = loadDraft<Section>(user ? user.id : undefined, 'section', sectionId);
        if (draftSection) {
          setSection(draftSection);
          setLoading(false);
          return;
        }
        // Otherwise, fetch from server
        const sections = await getSections();
        const foundSection = sections.find(s => s.id === sectionId);
        if (foundSection) {
          setSection(foundSection);
        }
        setLoading(false);
      }
    }
    fetchSection();
  }, [sectionId]);

  const handleAddStudent = async () => {
    if (!section || !newStudentName.trim()) return;

    // Only add lrn if it is a non-empty string
    const lrnValue = newStudentLRN.trim();
    const newStudent: Student = {
      id: Date.now().toString(),
      name: newStudentName.trim(),
      gradeData: {}
    };
    if (lrnValue) {
      newStudent.lrn = lrnValue;
    }
    if (newStudentGender) {
      newStudent.gender = newStudentGender;
    }

    const updatedSection = {
      ...section,
      students: [...section.students, newStudent]
    };

    // Remove all undefined values deeply
    const cleanedSection = JSON.parse(JSON.stringify(updatedSection));

    setSection(cleanedSection);
    try {
      // If draft, save to localStorage; else, save to server
      const isDraft = !!loadDraft<Section>(user ? user.id : undefined, 'section', cleanedSection.id);
      if (isDraft) {
        saveDraft(user ? user.id : undefined, 'section', cleanedSection.id, cleanedSection);
      } else {
        await saveSection(cleanedSection);
      }
      setNewStudentName('');
      setNewStudentLRN('');
      setNewStudentGender('');
      toast({
        title: "Student Added",
        description: `${newStudent.name} has been added to the section.`
      });
    } catch (error) {
      toast({
        title: "Error Adding Student",
        description: error instanceof Error ? error.message : 'Failed to save student. Please check your connection or permissions.',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!section) return;

    const updatedSection = {
      ...section,
      students: section.students.filter(s => s.id !== studentId)
    };

    // Remove all undefined values deeply
    const cleanedSection = JSON.parse(JSON.stringify(updatedSection));

    setSection(cleanedSection);
    try {
      // If draft, save to localStorage; else, save to server
      const isDraft = !!loadDraft<Section>(user ? user.id : undefined, 'section', cleanedSection.id);
      if (isDraft) {
        saveDraft(user ? user.id : undefined, 'section', cleanedSection.id, cleanedSection);
      } else {
        await saveSection(cleanedSection);
      }
      toast({
        title: "Student Removed",
        description: "Student has been removed from the section."
      });
    } catch (error) {
      toast({
        title: "Error Removing Student",
        description: error instanceof Error ? error.message : 'Failed to remove student. Please check your connection or permissions.',
        variant: 'destructive'
      });
    }
  };

  if (loading || !section) {
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
                <h1 className="text-2xl font-bold text-foreground">Manage Students</h1>
                <p className="text-muted-foreground">{section.name} - Grade {section.gradeLevel}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Student Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Student
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Student Name"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="LRN (Optional)"
                  value={newStudentLRN}
                  onChange={(e) => setNewStudentLRN(e.target.value)}
                />
              </div>
              <div className="w-48">
                <Select value={newStudentGender} onValueChange={(v) => setNewStudentGender(v as 'male' | 'female')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddStudent}
                disabled={!newStudentName.trim()}
              >
                Add Student
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Students ({section.students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {section.students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No students added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {section.students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{student.name}</h3>
                      {student.lrn && (
                        <p className="text-sm text-gray-600">LRN: {student.lrn}</p>
                      )}
                      {student.gender && (
                        <p className="text-sm text-gray-600 capitalize">Gender: {student.gender}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveStudent(student.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
