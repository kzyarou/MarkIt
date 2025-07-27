import React, { useState, useEffect } from 'react';
import { Mail, Hash, Phone, User, Edit2, Facebook, Calendar, BadgeCheck } from 'lucide-react';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

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
  const [editProfile, setEditProfile] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    contactNo: profile?.contactNo || '',
    age: profile?.age || '',
    facebook: profile?.facebook || '',
    role: profile?.role || 'student',
  });
  useEffect(() => {
    setEditProfile({
      name: profile?.name || '',
      bio: profile?.bio || '',
      contactNo: profile?.contactNo || '',
      age: profile?.age || '',
      facebook: profile?.facebook || '',
      role: profile?.role || 'student',
    });
  }, [profile]);

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
      });
      setIsEditing(false);
    }
  };

  // UI
  return (
    <div className="pt-28 pb-6 px-6 text-center w-full max-w-md text-gray-900 dark:text-white">
      {editable && !isEditing && (
        <button
          onClick={handleEdit}
          className="absolute right-6 top-6 z-30 p-2 rounded-full shadow-lg bg-white dark:bg-gray-900 hover:bg-blue-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
          aria-label="Edit Profile"
        >
          <Edit2 className="w-5 h-5 text-blue-600" />
        </button>
      )}
      {editable && isEditing ? (
        <>
          {/* Profile Type Selector - now read-only */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded-full font-semibold border transition-colors ${editProfile.role === 'teacher' ? 'bg-blue-500 text-white border-blue-700' : 'bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-gray-700'} cursor-not-allowed opacity-60`}
              type="button"
              disabled
            >
              Teacher
            </button>
            <button
              className={`px-4 py-2 rounded-full font-semibold border transition-colors ${editProfile.role === 'student' ? 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border-blue-400 dark:border-blue-800' : 'bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-gray-700'} cursor-not-allowed opacity-60`}
              type="button"
              disabled
            >
              Student
            </button>
          </div>
          <div className="space-y-3 mb-4">
            {/* Name (read-only) */}
            <Input
              value={editProfile.name}
              placeholder="Name"
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            {/* Gmail (read-only) */}
            <Input
              value={profile?.email || ''}
              placeholder="Gmail"
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            {/* Editable fields */}
            <Textarea
              value={editProfile.bio}
              onChange={e => setEditProfile(p => ({ ...p, bio: e.target.value }))}
              placeholder="Bio"
              rows={2}
            />
            <Input
              value={editProfile.contactNo}
              onChange={e => setEditProfile(p => ({ ...p, contactNo: e.target.value }))}
              placeholder="Contact No."
            />
            <Input
              value={editProfile.age}
              onChange={e => setEditProfile(p => ({ ...p, age: e.target.value }))}
              placeholder="Age"
              type="number"
            />
            <Input
              value={editProfile.facebook}
              onChange={e => setEditProfile(p => ({ ...p, facebook: e.target.value }))}
              placeholder="Facebook"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium shadow"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-1 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition-colors text-sm font-medium shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-1">{profile?.name || '—'}</h2>
          <p className="text-blue-600 dark:text-blue-300 font-medium mb-2">{handle}</p>
          <p className="mt-2 text-gray-700 dark:text-gray-300 text-base mb-4">{profile?.bio || 'No bio yet.'}</p>
        </>
      )}
      {/* Info Cards */}
      <div className="mt-6 space-y-5">
        <div className="rounded-2xl p-5 shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <div className="font-semibold text-lg mb-3 flex items-center gap-2"><User className="w-5 h-5 text-blue-500" /> Account Info</div>
          <div className="flex items-center gap-2 mb-1"><Mail className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Gmail:</span> <span className="text-gray-700 dark:text-gray-300">{profile?.email || 'Not set'}</span></div>
          <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Role:</span> <span className="text-gray-700 dark:text-gray-300">{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Not set'}</span></div>
        </div>
        {profile?.role === 'student' && (
          <div className="rounded-2xl p-5 shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-lg mb-3 flex items-center gap-2"><Hash className="w-5 h-5 text-blue-500" /> Student Details</div>
            <div className="flex items-center gap-2 mb-1"><Hash className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">LRN:</span> <span className="text-gray-700 dark:text-gray-300">{profile?.lrn || 'Not set'}</span></div>
            <div className="flex items-center gap-2 mb-1"><Phone className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Contact No:</span> <span className="text-gray-700 dark:text-gray-300">{profile?.contactNo || 'Not set'}</span></div>
            <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Age:</span> <span className="text-gray-700 dark:text-gray-300">{profile?.age !== undefined && profile?.age !== null ? profile.age : 'Not set'}</span></div>
            <div className="flex items-center gap-2 mb-1"><User className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Section(s):</span> {sectionsLoading ? 'Loading...' : sections.length > 0 ? sections.map((s, i) => (
              <span key={s.sectionId || i} className="inline-block bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 rounded px-2 py-1 text-xs mr-1">{s.sectionName} ({s.gradeLevel})</span>
            )) : <span className="text-gray-700 dark:text-gray-300">None</span>}</div>
            <div className="flex items-center gap-2 mb-1"><BadgeCheck className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Seniority:</span> <span className="text-gray-700 dark:text-gray-300">{sections.length > 0 ? getSeniority(sections[0].gradeLevel) : 'Not set'}</span></div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Last Login:</span> <span className="text-gray-700 dark:text-gray-300">{profile?.lastLogin || 'Not set'}</span></div>
          </div>
        )}
        {profile?.role === 'teacher' && (
          <div className="rounded-2xl p-5 shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-lg mb-3 flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-blue-500" /> Teacher Details</div>
            <div className="flex items-center gap-2 mb-1"><Hash className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Employee Number:</span> <span className="text-gray-700 dark:text-gray-300">{profile?.employeeNumber || 'Not set'}</span></div>
            <div className="flex items-center gap-2 mb-1"><Phone className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Contact No:</span> <span className="text-gray-700 dark:text-gray-300">{profile?.contactNo || 'Not set'}</span></div>
            <div className="flex items-center gap-2 mb-1"><Facebook className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Facebook:</span> <span className="text-gray-700 dark:text-gray-300">{profile?.facebook || 'Not set'}</span></div>
            <div className="flex items-center gap-2 mb-1"><User className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Sections Handling:</span> <span className="text-gray-700 dark:text-gray-300">Not set</span></div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-700 dark:text-gray-300">Last Login:</span> <span className="text-gray-700 dark:text-gray-300">{profile?.lastLogin || 'Not set'}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}; 