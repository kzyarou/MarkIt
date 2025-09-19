import React, { useState, useEffect, useRef } from 'react';
import { Mail, Hash, Phone, User, Edit2, Facebook, Calendar, BadgeCheck, Upload } from 'lucide-react';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ProfileViewProps {
  profile: any;
  editable?: boolean;
  onSave?: (updates: any) => Promise<void>;
  loading?: boolean;
  sections?: any[];
  sectionsLoading?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  editable = false,
  onSave,
  loading = false,
  sections = [],
  sectionsLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editProfile, setEditProfile] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    contactNo: profile?.contactNo || '',
    age: profile?.age || '',
    facebook: profile?.facebook || '',
    role: profile?.role || 'student',
    employeeNumber: profile?.employeeNumber || '',
  });
  useEffect(() => {
    setEditProfile({
      name: profile?.name || '',
      bio: profile?.bio || '',
      contactNo: profile?.contactNo || '',
      age: profile?.age || '',
      facebook: profile?.facebook || '',
      role: profile?.role || 'student',
      employeeNumber: profile?.employeeNumber || '',
    });
  }, [profile]);

  const isAdmin = profile?.email === 'zacharythanos@gmail.com' || profile?.role === 'admin';
  const displayedRole = isAdmin ? 'admin' : (profile?.role || '');
  const handle = profile?.email
    ? `@${profile.email.split('@')[0]}`
    : profile?.name
    ? `@${profile.name.replace(/\s+/g, '').toLowerCase()}`
    : '';

  const getSeniority = (gradeLevel: string) => {
    if (!gradeLevel) return '';
    const num = parseInt(gradeLevel.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return '';
    if (num >= 11) return 'Senior';
    if (num >= 7) return 'Junior';
    return '';
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setEditProfile({
      name: profile?.name || '',
      bio: profile?.bio || '',
      contactNo: profile?.contactNo || '',
      age: profile?.age || '',
      facebook: profile?.facebook || '',
      role: profile?.role || 'student',
      employeeNumber: profile?.employeeNumber || '',
    });
  };
  const handleSave = async () => {
    if (onSave) {
      await onSave({
        name: editProfile.name,
        bio: editProfile.bio,
        contactNo: editProfile.contactNo,
        age: editProfile.age ? Number(editProfile.age) : undefined,
        facebook: editProfile.facebook,
        role: editProfile.role,
        employeeNumber: editProfile.role === 'teacher' ? editProfile.employeeNumber : undefined,
      });
      setIsEditing(false);
    }
  };

  const handleAvatarClick = () => {
    if (!editable) return;
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `users/${profile?.id || 'unknown'}/profile/${Date.now()}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      if (onSave) {
        await onSave({ profileImage: url });
      }
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // UI
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 text-foreground">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={profile?.profileImage || ''} alt={profile?.name || ''} />
                  <AvatarFallback className={isAdmin ? 'bg-red-600 text-white font-bold' : ''}>{isAdmin ? 'DEV' : (profile?.name || '?').slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {editable && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-7 w-7"
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    title="Upload profile photo"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className={`text-2xl font-bold ${isAdmin ? 'text-red-700 dark:text-red-300' : ''}`}>{profile?.name || '—'}</h2>
                  {profile?.role && (
                    <Badge variant={isAdmin ? 'destructive' : 'secondary'} className="capitalize">{displayedRole}</Badge>
                  )}
                </div>
                <p className={`text-muted-foreground ${isAdmin ? 'text-red-700/70 dark:text-red-300/80' : ''}`}>{handle}</p>
              </div>
            </div>
            {editable && !isEditing && (
              <Button onClick={handleEdit} variant="default" size="sm" className="inline-flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </Button>
            )}
          </div>
          {!isEditing ? (
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">{profile?.bio || 'No bio yet.'}</p>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="flex gap-2 flex-wrap items-center">
                <Badge variant="outline" className="capitalize">{editProfile.role}</Badge>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input value={editProfile.name} disabled className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input value={profile?.email || ''} disabled className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea value={editProfile.bio} onChange={e => setEditProfile(p => ({ ...p, bio: e.target.value }))} rows={3} className="mt-1" />
                </div>
                {editProfile.role === 'teacher' && (
                  <div>
                    <label className="text-sm font-medium">Employee Number</label>
                    <Input value={editProfile.employeeNumber} onChange={e => setEditProfile(p => ({ ...p, employeeNumber: e.target.value }))} className="mt-1" />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Contact No.</label>
                    <Input value={editProfile.contactNo} onChange={e => setEditProfile(p => ({ ...p, contactNo: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Age</label>
                    <Input type="number" value={editProfile.age} onChange={e => setEditProfile(p => ({ ...p, age: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Facebook</label>
                    <Input value={editProfile.facebook} onChange={e => setEditProfile(p => ({ ...p, facebook: e.target.value }))} className="mt-1" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={handleSave} disabled={loading} className="min-w-[6rem]">{loading ? 'Saving…' : 'Save'}</Button>
                <Button onClick={handleCancel} variant="outline">Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-blue-500" /> Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span className="font-medium">Email:</span> <span>{profile?.email || 'Not set'}</span></div>
            <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-muted-foreground" /><span className="font-medium">Role:</span> <span className="capitalize">{displayedRole || 'Not set'}</span></div>

          </CardContent>
        </Card>

        {profile?.role === 'student' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Hash className="w-5 h-5 text-blue-500" /> Student Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-muted-foreground" /><span className="font-medium">LRN:</span> <span>{profile?.lrn || 'Not set'}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span className="font-medium">Contact No:</span> <span>{profile?.contactNo || 'Not set'}</span></div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span className="font-medium">Age:</span> <span>{profile?.age !== undefined && profile?.age !== null ? profile.age : 'Not set'}</span></div>
              <div className="flex items-start gap-2"><User className="w-4 h-4 text-muted-foreground mt-0.5" /><span className="font-medium">Section(s):</span> <div>{sectionsLoading ? 'Loading...' : sections.length > 0 ? sections.map((s, i) => (
                <span key={s.sectionId || i} className="inline-block bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 rounded px-2 py-1 text-xs mr-1 mb-1">{s.sectionName} ({s.gradeLevel})</span>
              )) : <span>None</span>}</div></div>
              <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-muted-foreground" /><span className="font-medium">Seniority:</span> <span>{sections.length > 0 ? getSeniority(sections[0].gradeLevel) : 'Not set'}</span></div>
            </CardContent>
          </Card>
        )}

        {profile?.role === 'teacher' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-blue-500" /> Teacher Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-muted-foreground" /><span className="font-medium">Employee Number:</span> <span>{profile?.employeeNumber || 'Not set'}</span></div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span className="font-medium">Age:</span> <span>{profile?.age !== undefined && profile?.age !== null ? profile.age : 'Not set'}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span className="font-medium">Contact No:</span> <span>{profile?.contactNo || 'Not set'}</span></div>
              <div className="flex items-center gap-2"><Facebook className="w-4 h-4 text-muted-foreground" /><span className="font-medium">Facebook:</span> <span>{profile?.facebook || 'Not set'}</span></div>
              <div className="flex items-start gap-2"><User className="w-4 h-4 text-muted-foreground mt-0.5" /><span className="font-medium">Sections Handling:</span> <div>{sectionsLoading ? 'Loading...' : sections.length > 0 ? sections.map((s, i) => (
                <span key={s.id || i} className="inline-block bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 rounded px-2 py-1 text-xs mr-1 mb-1">{s.name} ({s.gradeLevel})</span>
              )) : <span>None</span>}</div></div>
            </CardContent>
          </Card>
        )}

        {/* Documents & Verification */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-green-600" /> Documents & Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Membership: <span className="font-medium capitalize">{profile?.membershipStatus?.tier || 'none'}</span>
                {profile?.membershipStatus?.documentType && (
                  <span> • via {profile.membershipStatus.documentType}</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(profile?.verificationStatus?.documents || []).map((doc: any, idx: number) => (
                  <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="p-3 border rounded hover:bg-accent text-sm truncate">
                    <span className="font-medium">{doc.type}</span>
                    <span className="ml-2 text-muted-foreground">{new Date(doc.uploadedAt).toLocaleString()}</span>
                  </a>
                ))}
                {(!profile?.verificationStatus?.documents || profile.verificationStatus.documents.length === 0) && (
                  <div className="text-sm text-muted-foreground">No documents uploaded yet.</div>
                )}
              </div>
              {editable && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAvatarClick}
                  className="w-full sm:w-auto whitespace-normal leading-tight text-left"
                >
                  <span className="sm:hidden">Upload document via photo</span>
                  <span className="hidden sm:inline">Upload new document via Profile Photo button (BIR or Barangay)</span>
                </Button>
              </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 