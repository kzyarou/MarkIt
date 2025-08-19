import React, { useEffect, useState } from 'react';
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
import { useBottomNav } from '@/hooks/use-mobile';

export default function CreateSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveDraft, deleteDraft } = useDrafts();
  const { bottomNavClass } = useBottomNav();
  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: '',
  });
  const [nameError, setNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);

  // Add derived state for classification
  const gradeNum = Number(formData.gradeLevel);
  const isJunior = [7,8,9,10].includes(gradeNum);
  const isSenior = [11,12].includes(gradeNum);
  const classification = isJunior ? 'junior' : isSenior ? 'senior' : '';

  // Debounced uniqueness check
  useEffect(() => {
    let timer: number | undefined;
    if (formData.name.trim().length > 0) {
      setIsCheckingName(true);
      timer = window.setTimeout(async () => {
        const all = await getSections();
        const target = formData.name.trim().toLowerCase();
        const exists = all.some(s => (s.name || '').trim().toLowerCase() === target);
        setNameError(exists ? 'A section with this name already exists.' : null);
        setIsCheckingName(false);
      }, 350);
    } else {
      setNameError(null);
      setIsCheckingName(false);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [formData.name]);

  const buildNewSection = (): Section | null => {
    if (!user) return null;
    return {
      id: Date.now().toString(),
      name: formData.name.trim(),
      gradeLevel: formData.gradeLevel,
      students: [],
      subjects: [],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      ...(classification ? { classification } : {}),
    };
  };

  const validateBeforePersist = async (): Promise<boolean> => {
    if (!formData.name.trim() || !formData.gradeLevel) {
      toast({ title: 'Missing fields', description: 'Please enter a section name and select a grade level.', variant: 'destructive' });
      return false;
    }
    // Final uniqueness check (non-debounced) to avoid race
    const all = await getSections();
    const target = formData.name.trim().toLowerCase();
    const exists = all.some(s => (s.name || '').trim().toLowerCase() === target);
    if (exists) {
      setNameError('A section with this name already exists.');
      toast({ title: 'Duplicate name', description: 'Please choose a different section name.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!(await validateBeforePersist())) return;
    const newSection = buildNewSection();
    if (!newSection) return;
    await saveSection(newSection);
    deleteDraft(newSection.id);
    toast({ title: 'Section Created', description: `${newSection.name} has been created successfully.` });
    navigate('/');
  };

  const handleSaveAsDraft = async () => {
    if (!user) return;
    if (!formData.name.trim() || !formData.gradeLevel) {
      toast({ title: 'Missing fields', description: 'Please enter a section name and select a grade level.', variant: 'destructive' });
      return;
    }
    // Allow drafts to be saved even if duplicate (so user can rename later), but warn
    if (nameError) {
      toast({ title: 'Duplicate name', description: 'This name already exists. Consider renaming before upload.' });
    }
    const newSection = buildNewSection();
    if (!newSection) return;
    saveDraft(newSection);
    toast({ title: 'Draft Saved', description: `${newSection.name} has been saved as a draft.` });
    navigate('/');
  };

  const handleBack = () => navigate('/');

  return (
    <div className={`min-h-screen bg-background ${bottomNavClass}`}>
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-3 sm:px-6">
          <div className="flex items-center py-3">
            <Button variant="ghost" onClick={handleBack} className="mr-2 sm:mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Create Section</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Set up a new class</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Section Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Section Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grade 10 - Marigold"
                  required
                  className="mt-1"
                  aria-invalid={!!nameError}
                />
                <div className="mt-1 h-5 flex items-center">
                  {isCheckingName && (
                    <span className="text-xs text-muted-foreground">Checking name…</span>
                  )}
                  {!isCheckingName && nameError && (
                    <span className="text-xs text-destructive">{nameError}</span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="gradeLevel" className="text-sm font-medium">Grade Level</Label>
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
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.gradeLevel === '' ? 'Select the grade level' :
                    isJunior ? 'Junior High School' :
                    isSenior ? 'Senior High School' : ''}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack} className="sm:order-first">
                  Cancel
                </Button>
                <Button type="button" variant="secondary" onClick={handleSaveAsDraft}>
                  Save Draft
                </Button>
                <Button type="button" onClick={handleCreate} disabled={!!nameError || isCheckingName}>
                  Create Section
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
