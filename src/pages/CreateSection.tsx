import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Section } from '@/types/grading';
import { saveSection, getSections } from '@/services/gradesService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useDrafts } from '@/contexts/DraftsContext';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function CreateSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveDraft, deleteDraft } = useDrafts();
  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: '',
  });
  // Add derived state for classification
  const gradeNum = Number(formData.gradeLevel);
  const isJunior = [7,8,9,10].includes(gradeNum);
  const isSenior = [11,12].includes(gradeNum);
  const classification = isJunior ? 'junior' : isSenior ? 'senior' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const newSection: Section = {
      id: Date.now().toString(),
      name: formData.name,
      gradeLevel: formData.gradeLevel,
      students: [],
      subjects: [],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      ...(classification ? { classification } : {}),
    };

    await saveSection(newSection);
    
    toast({
      title: "Section Created",
      description: `${formData.name} has been created successfully.`
    });

    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    // Check if user has uploaded any section
    const allSections = await getSections();
    const userSections = allSections.filter(s => s.createdBy === user.id);
    if (userSections.length === 0) {
      toast({
        title: 'Upload Required',
        description: 'You must upload a section before you can save a draft.',
        variant: 'destructive',
      });
      return;
    }
    const newSection: Section = {
      id: Date.now().toString(),
      name: formData.name,
      gradeLevel: formData.gradeLevel,
      students: [],
      subjects: [],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      ...(classification ? { classification } : {}),
    };
    console.log('Saving draft:', { userId: user.id, newSection });
    saveDraft(newSection);
    toast({
      title: 'Draft Saved',
      description: `${formData.name} has been saved as a draft.`
    });
    navigate('/');
  };

  const handleCreateAndUpload = async () => {
    if (!user) return;
    const newSection: Section = {
      id: Date.now().toString(),
      name: formData.name,
      gradeLevel: formData.gradeLevel,
      students: [],
      subjects: [],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      ...(classification ? { classification } : {}),
    };
    await saveSection(newSection);
    deleteDraft(newSection.id);
    toast({
      title: 'Section Uploaded',
      description: `${formData.name} has been uploaded.`
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={handleBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New Section</h1>
              <p className="text-muted-foreground">Set up a new class section</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Section Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={e => { e.preventDefault(); handleSaveDraft(); }} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base font-medium">
                  Section Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grade 10-A, Section Marigold"
                  required
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Choose a descriptive name for your section
                </p>
              </div>

              <div>
                <Label htmlFor="gradeLevel" className="text-base font-medium">
                  Grade Level
                </Label>
                <Select
                  value={formData.gradeLevel}
                  onValueChange={value => setFormData({ ...formData, gradeLevel: value })}
                  required
                >
                  <SelectTrigger id="gradeLevel" className="mt-1">
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="11">11</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.gradeLevel === '' ? 'Select the grade level for this section' :
                    isJunior ? 'Junior High School (4 quarters)' :
                    isSenior ? 'Senior High School (2 semesters)' : ''}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save as Draft
                </Button>
                <Button type="button" variant="default" onClick={handleCreateAndUpload}>
                  Upload Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
