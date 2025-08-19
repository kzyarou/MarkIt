import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBottomNav } from '@/hooks/use-mobile';
import { StudentUserService, getTeacherSections } from '@/services/gradesService';
import { useTheme } from 'next-themes';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ProfileView } from '@/components/ProfileView';
import { getDoc, doc as firestoreDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EducHubHeader from '@/components/EducHubHeader';
import type { Section } from '@/types/grading';

interface ProfilePageProps {
  viewOnly?: boolean;
}

export default function ProfilePage({ viewOnly }: ProfilePageProps) {
  const { user, userLRN, updateUserProfile } = useAuth();
  const { bottomNavClass } = useBottomNav();
  const [studentSections, setStudentSections] = useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editProfile, setEditProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    contactNo: user?.contactNo || '',
    age: user?.age || '',
    facebook: user?.facebook || '',
    role: user?.role || 'student',
  });
  const { toast } = useToast();
  const { id } = useParams();
  const [viewUser, setViewUser] = useState<any>(null);
  const [loadingViewUser, setLoadingViewUser] = useState(false);
  const [teacherSections, setTeacherSections] = useState<Section[]>([]);
  const [teacherSectionsLoading, setTeacherSectionsLoading] = useState(false);

  useEffect(() => {
    if (viewOnly && id) {
      setLoadingViewUser(true);
      // Fetch user profile from Firestore
      getDoc(firestoreDoc(db, 'users', id)).then(userDoc => {
        if (userDoc.exists()) setViewUser({ id, ...userDoc.data() });
        else setViewUser(null);
        setLoadingViewUser(false);
      });
    }
  }, [viewOnly, id]);

  // Load sections for teachers (self profile)
  useEffect(() => {
    async function fetchTeacherSections() {
      if (!viewOnly && user?.role === 'teacher') {
        setTeacherSectionsLoading(true);
        const sections = await getTeacherSections(user.id);
        setTeacherSections(sections);
        setTeacherSectionsLoading(false);
      }
    }
    fetchTeacherSections();
  }, [user?.role, user?.id, viewOnly]);

  // Load sections for view-only teacher profile
  useEffect(() => {
    async function fetchViewedTeacherSections() {
      if (viewOnly && viewUser?.role === 'teacher') {
        setTeacherSectionsLoading(true);
        const sections = await getTeacherSections(viewUser.id);
        setTeacherSections(sections);
        setTeacherSectionsLoading(false);
      }
    }
    fetchViewedTeacherSections();
  }, [viewOnly, viewUser?.id, viewUser?.role]);

  // Load sections for students
  useEffect(() => {
    async function fetchStudentSections() {
      if (!viewOnly && user?.role === 'student' && userLRN) {
        setSectionsLoading(true);
        const res = await StudentUserService.getUserSections(userLRN);
        if (res.success && Array.isArray(res.data)) {
          setStudentSections(res.data);
        } else {
          setStudentSections([]);
        }
        setSectionsLoading(false);
      }
    }
    fetchStudentSections();
  }, [user?.role, userLRN, viewOnly]);

  useEffect(() => {
    setEditProfile({
      name: user?.name || '',
      bio: user?.bio || '',
      contactNo: user?.contactNo || '',
      age: user?.age || '',
      facebook: user?.facebook || '',
      role: user?.role || 'student',
    });
  }, [user]);

  const handleSave = async (updates: {
    name?: string;
    bio?: string;
    contactNo?: string;
    age?: number;
    facebook?: string;
    role?: 'teacher' | 'student' | 'parent';
  }) => {
    setIsSaving(true);
    try {
      const success = await updateUserProfile(updates);
      if (success) {
        setIsEditing(false);
        toast({
          title: 'Profile updated',
          description: 'Your profile was updated successfully.',
        });
      } else {
        toast({
          title: 'Update failed',
          description: 'Could not update your profile. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while saving your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (viewOnly) {
    const isViewingAdmin = viewUser?.email === 'zacharyrapiz@gmail.com' || viewUser?.role === 'admin'
    return (
      <div className={`min-h-screen flex flex-col items-center pb-20 transition-colors duration-300 ${isDark ? 'bg-[#0F1A2B] text-white' : (isViewingAdmin ? 'bg-gradient-to-b from-red-50 to-white text-gray-900' : 'bg-gradient-to-b from-blue-50 to-white text-gray-900')}`}>
        <EducHubHeader subtitle="Profile" className="w-full" />
        <ProfileView
          profile={viewUser}
          editable={false}
          loading={loadingViewUser}
          sections={viewUser?.role === 'teacher' ? teacherSections : []}
          sectionsLoading={teacherSectionsLoading}
        />
      </div>
    );
  }

  const isSelfAdmin = user?.email === 'zacharyrapiz@gmail.com' || user?.role === 'admin'
  return (
    <div className={`min-h-screen flex flex-col items-center transition-colors duration-300 ${bottomNavClass} ${isDark ? 'bg-[#0F1A2B] text-white' : (isSelfAdmin ? 'bg-gradient-to-b from-red-50 to-white text-gray-900' : (editProfile.role === 'teacher' ? 'bg-gradient-to-b from-blue-200 to-white text-gray-900' : 'bg-gradient-to-b from-blue-50 to-white text-gray-900'))}`}>
      <EducHubHeader subtitle="Profile" className="w-full" />
      <ProfileView
        profile={user}
        editable={true}
        onSave={handleSave}
        loading={isSaving}
        sections={user?.role === 'teacher' ? teacherSections : studentSections}
        sectionsLoading={user?.role === 'teacher' ? teacherSectionsLoading : sectionsLoading}
      />
    </div>
  );
}
