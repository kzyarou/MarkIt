
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, BookOpen, Settings, X } from 'lucide-react';
import { Subject } from '@/types/grading';
import { useToast } from '@/hooks/use-toast';

interface SubjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
}

export function SubjectManager({ isOpen, onClose, subjects, onSubjectsChange }: SubjectManagerProps) {
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    writtenWorkWeight: 40,
    performanceTaskWeight: 40,
    quarterlyExamWeight: 20,
    track: undefined,
    type: undefined
  });
  const [customQuickAdd, setCustomQuickAdd] = useState<string[]>([]);
  const [newQuickAddSubject, setNewQuickAddSubject] = useState('');
  const [showCustomizeQuickAdd, setShowCustomizeQuickAdd] = useState(false);
  const { toast } = useToast();

  // Load custom quick add subjects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customQuickAddSubjects');
    if (saved) {
      setCustomQuickAdd(JSON.parse(saved));
    } else {
      // Set default subjects if none are saved
      setCustomQuickAdd(['Mathematics', 'English', 'Science', 'Filipino', 'Araling Panlipunan', 'Physical Education']);
    }
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      writtenWorkWeight: 40,
      performanceTaskWeight: 40,
      quarterlyExamWeight: 20,
      track: undefined,
      type: undefined
    });
    setEditingSubject(null);
  };

  const validateWeights = () => {
    const total = formData.writtenWorkWeight + formData.performanceTaskWeight + formData.quarterlyExamWeight;
    return total === 100;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateWeights()) {
      toast({
        title: "Invalid Weights",
        description: "Weight percentages must total exactly 100%",
        variant: "destructive"
      });
      return;
    }

    if (editingSubject) {
      // Update existing subject
      const updatedSubjects = subjects.map(subject =>
        subject.id === editingSubject.id
          ? { ...subject, ...formData }
          : subject
      );
      onSubjectsChange(updatedSubjects);
      toast({
        title: "Subject Updated",
        description: `${formData.name} has been updated successfully.`
      });
    } else {
      // Add new subject
      const newSubject: Subject = {
        id: Date.now().toString(),
        ...formData
      };
      onSubjectsChange([...subjects, newSubject]);
      toast({
        title: "Subject Added",
        description: `${formData.name} has been added successfully.`
      });
    }

    resetForm();
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      writtenWorkWeight: subject.writtenWorkWeight,
      performanceTaskWeight: subject.performanceTaskWeight,
      quarterlyExamWeight: subject.quarterlyExamWeight,
      track: subject.track,
      type: subject.type
    });
  };

  const handleDelete = (subjectId: string) => {
    const updatedSubjects = subjects.filter(subject => subject.id !== subjectId);
    onSubjectsChange(updatedSubjects);
    toast({
      title: "Subject Deleted",
      description: "Subject has been removed successfully."
    });
  };

  const addDefaultSubject = (subjectName: string) => {
    // Check if subject already exists
    const existingSubject = subjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
    if (existingSubject) {
      toast({
        title: "Subject Already Exists",
        description: `${subjectName} is already in your subjects list.`,
        variant: "destructive"
      });
      return;
    }

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: subjectName,
      writtenWorkWeight: 40,
      performanceTaskWeight: 40,
      quarterlyExamWeight: 20
    };
    
    onSubjectsChange([...subjects, newSubject]);
    toast({
      title: "Subject Added",
      description: `${subjectName} has been added successfully.`
    });
  };

  const addCustomQuickAddSubject = () => {
    if (!newQuickAddSubject.trim()) return;
    
    if (customQuickAdd.includes(newQuickAddSubject.trim())) {
      toast({
        title: "Subject Already Exists",
        description: "This subject is already in your quick add list.",
        variant: "destructive"
      });
      return;
    }

    const updated = [...customQuickAdd, newQuickAddSubject.trim()];
    setCustomQuickAdd(updated);
    localStorage.setItem('customQuickAddSubjects', JSON.stringify(updated));
    setNewQuickAddSubject('');
    toast({
      title: "Quick Add Subject Added",
      description: `${newQuickAddSubject.trim()} added to quick add list.`
    });
  };

  const removeCustomQuickAddSubject = (subjectName: string) => {
    const updated = customQuickAdd.filter(s => s !== subjectName);
    setCustomQuickAdd(updated);
    localStorage.setItem('customQuickAddSubjects', JSON.stringify(updated));
    toast({
      title: "Quick Add Subject Removed",
      description: `${subjectName} removed from quick add list.`
    });
  };

  const totalWeight = formData.writtenWorkWeight + formData.performanceTaskWeight + formData.quarterlyExamWeight;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto mx-4">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
             <BookOpen className="w-5 h-5 text-primary" />
             Manage Subjects - EducHub
           </DialogTitle>
           <DialogDescription>
             Add, edit, or remove subjects for this section. Adjust weights and details as needed.
           </DialogDescription>
         </DialogHeader>

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
           {/* Subject Form */}
           <Card>
             <CardHeader className="pb-4">
               <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                 <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                 {editingSubject ? 'Edit Subject' : 'Add Subject'}
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {/* Quick Add Subjects Section */}
               {!editingSubject && (
                 <div className="p-3 sm:p-4 bg-card rounded-lg">
                   <div className="flex items-center justify-between mb-3">
                     <h4 className="font-medium text-sm sm:text-base">Quick Add Subjects</h4>
                     <Button
                       type="button"
                       variant="ghost"
                       size="sm"
                       onClick={() => setShowCustomizeQuickAdd(!showCustomizeQuickAdd)}
                       className="h-8 px-2"
                     >
                       <Settings className="w-4 h-4" />
                     </Button>
                   </div>
                   
                   {/* Customize Quick Add Section */}
                   {showCustomizeQuickAdd && (
                     <div className="mb-4 p-3 bg-card rounded border">
                       <h5 className="font-medium text-sm mb-2">Customize Quick Add List</h5>
                       <div className="flex gap-2 mb-3">
                         <Input
                           placeholder="Enter subject name"
                           value={newQuickAddSubject}
                           onChange={(e) => setNewQuickAddSubject(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && addCustomQuickAddSubject()}
                           className="flex-1 text-sm"
                         />
                         <Button
                           type="button"
                           size="sm"
                           onClick={addCustomQuickAddSubject}
                           disabled={!newQuickAddSubject.trim()}
                         >
                           Add
                         </Button>
                       </div>
                       <div className="space-y-1">
                         {customQuickAdd.map((subject, index) => (
                           <div key={index} className="flex items-center justify-between py-1 px-2 bg-card rounded text-sm">
                             <span>{subject}</span>
                             <Button
                               type="button"
                               variant="ghost"
                               size="sm"
                               onClick={() => removeCustomQuickAddSubject(subject)}
                               className="h-6 w-6 p-0 hover:bg-accent"
                             >
                               <X className="w-3 h-3 text-red-600" />
                             </Button>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                   
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                     {customQuickAdd.map((subject) => (
                       <Button
                         key={subject}
                         type="button"
                         variant="outline"
                         size="sm"
                         onClick={() => addDefaultSubject(subject)}
                         className="text-xs sm:text-sm h-8 sm:h-9 px-2"
                       >
                         {subject.length > 12 ? subject.substring(0, 12) + '...' : subject}
                       </Button>
                     ))}
                   </div>
                 </div>
               )}
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <Label htmlFor="name" className="text-sm font-medium">Subject Name</Label>
                   <Input
                     id="name"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     required
                     className="mt-1"
                   />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                     <Label htmlFor="track" className="text-sm font-medium">SHS Track (Grades 11-12)</Label>
                     <select
                       id="track"
                       value={formData.track || ''}
                       onChange={e => setFormData({ ...formData, track: e.target.value || undefined })}
                       className="mt-1 w-full border rounded p-2"
                     >
                       <option value="">-- Select Track (for SHS only) --</option>
                       <option value="Core">Core</option>
                       <option value="Academic">Academic</option>
                       <option value="TVL">TVL</option>
                       <option value="Sports/Arts">Sports/Arts</option>
                     </select>
                   </div>
                   <div>
                     <Label htmlFor="type" className="text-sm font-medium">Subject Type (JHS/Elem)</Label>
                     <select
                       id="type"
                       value={formData.type || ''}
                       onChange={e => setFormData({ ...formData, type: e.target.value || undefined })}
                       className="mt-1 w-full border rounded p-2"
                     >
                       <option value="">-- Select Type (for JHS/Elem) --</option>
                       <option value="Languages">Languages</option>
                       <option value="AP">AP</option>
                       <option value="EsP">EsP</option>
                       <option value="Science">Science</option>
                       <option value="Math">Math</option>
                       <option value="MAPEH">MAPEH</option>
                       <option value="EPP/TLE">EPP/TLE</option>
                     </select>
                   </div>
                 </div>

                 <div className="space-y-3">
                   <Label className="text-sm font-medium">Weight Distribution</Label>
                   
                   <div className="space-y-3">
                     <div>
                       <Label htmlFor="written" className="text-xs text-muted-foreground">Written Work (%)</Label>
                       <Input
                         id="written"
                         type="number"
                         min="0"
                         max="100"
                         value={formData.writtenWorkWeight}
                         onChange={(e) => setFormData({ 
                           ...formData, 
                           writtenWorkWeight: parseInt(e.target.value) || 0 
                         })}
                         required
                         className="mt-1"
                       />
                     </div>

                     <div>
                       <Label htmlFor="performance" className="text-xs text-muted-foreground">Performance Tasks (%)</Label>
                       <Input
                         id="performance"
                         type="number"
                         min="0"
                         max="100"
                         value={formData.performanceTaskWeight}
                         onChange={(e) => setFormData({ 
                           ...formData, 
                           performanceTaskWeight: parseInt(e.target.value) || 0 
                         })}
                         required
                         className="mt-1"
                       />
                     </div>

                     <div>
                       <Label htmlFor="exam" className="text-xs text-muted-foreground">Quarterly Exam (%)</Label>
                       <Input
                         id="exam"
                         type="number"
                         min="0"
                         max="100"
                         value={formData.quarterlyExamWeight}
                         onChange={(e) => setFormData({ 
                           ...formData, 
                           quarterlyExamWeight: parseInt(e.target.value) || 0 
                         })}
                         required
                         className="mt-1"
                       />
                     </div>
                   </div>

                   <div className="text-sm p-2 bg-card rounded">
                     <span className={`font-medium ${totalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                       Total: {totalWeight}%
                     </span>
                     {totalWeight !== 100 && (
                       <span className="text-red-600 ml-2 text-xs">
                         (Must equal 100%)
                       </span>
                     )}
                   </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-2 pt-2">
                   <Button 
                     type="submit" 
                     disabled={!validateWeights()}
                     className="flex-1"
                   >
                     {editingSubject ? 'Update Subject' : 'Add Subject'}
                   </Button>
                   {editingSubject && (
                     <Button 
                       type="button" 
                       variant="outline" 
                       onClick={resetForm}
                       className="flex-1 sm:flex-initial"
                     >
                       Cancel
                     </Button>
                   )}
                 </div>
               </form>
             </CardContent>
           </Card>

           {/* Subject List */}
           <Card>
             <CardHeader className="pb-4">
               <CardTitle className="text-base sm:text-lg">Existing Subjects ({subjects.length})</CardTitle>
             </CardHeader>
             <CardContent>
               {subjects.length === 0 ? (
                 <div className="text-center py-8">
                   <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                   <p className="text-gray-500 text-sm">
                     No subjects added yet. Create your first subject to get started.
                   </p>
                 </div>
               ) : (
                 <div className="space-y-3 max-h-96 overflow-y-auto">
                   {subjects.map((subject) => (
                     <div key={subject.id} className="p-3 border rounded-lg">
                       <div className="flex justify-between items-start mb-2">
                         <h4 className="font-semibold text-sm sm:text-base break-words flex-1 mr-2">{subject.name}</h4>
                         <div className="flex gap-1 flex-shrink-0">
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleEdit(subject)}
                             className="h-8 w-8 p-0"
                           >
                             <Edit className="w-3 h-3" />
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleDelete(subject.id)}
                             className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                           >
                             <Trash2 className="w-3 h-3" />
                           </Button>
                         </div>
                       </div>
                       <div className="flex flex-wrap gap-1">
                         <Badge variant="secondary" className="text-xs">
                           WW: {subject.writtenWorkWeight}%
                         </Badge>
                         <Badge variant="secondary" className="text-xs">
                           PT: {subject.performanceTaskWeight}%
                         </Badge>
                         <Badge variant="secondary" className="text-xs">
                           QE: {subject.quarterlyExamWeight}%
                         </Badge>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </CardContent>
           </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
