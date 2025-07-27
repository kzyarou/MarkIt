import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as FirebaseUser, EmailAuthProvider, reauthenticateWithCredential, deleteUser, GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteAllUserData } from '../services/gradesService';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student' | 'parent';
  lrn?: string;
  avatarUrl?: string;
  bio?: string;
  contactNo?: string;
  age?: number;
  employeeNumber?: string;
  facebook?: string;
  lastLogin?: string;
  gender?: 'male' | 'female'; // <-- Added gender
  gradeLevel?: string;
}

interface AuthContextType {
  user: User | null;
  userLRN: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    email: string;
    password: string;
    name: string;
    role: 'teacher' | 'student' | 'parent';
    lrn?: string;
    avatarUrl?: string;
    bio?: string;
    contactNo?: string;
    age?: number;
    employeeNumber?: string;
    facebook?: string;
    lastLogin?: string;
    gender?: 'male' | 'female'; // <-- Added gender
    gradeLevel?: string;
  }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  deleteUserProfile: () => Promise<boolean>;
  deleteUserProfileWithPassword: (password: string) => Promise<boolean>;
  deleteUserProfileWithPasswordOrGoogle: (password?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userLRN, setUserLRN] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add this useEffect to restore user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUserLRN(parsedUser.lrn || null);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userProfile = null;
      if (userDoc.exists()) {
        userProfile = userDoc.data();
      }
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userProfile?.name || firebaseUser.displayName || '',
        role: userProfile?.role || 'student',
        lrn: userProfile?.lrn || null,
        avatarUrl: userProfile?.avatarUrl || '',
        bio: userProfile?.bio || '',
        contactNo: userProfile?.contactNo || '',
        age: userProfile?.age || null,
        employeeNumber: userProfile?.employeeNumber || '',
        facebook: userProfile?.facebook || '',
        lastLogin: userProfile?.lastLogin || '',
        gender: userProfile?.gender || undefined, // <-- Added gender
        gradeLevel: userProfile?.gradeLevel || '',
      });
      setUserLRN(userProfile?.lrn || null);
      localStorage.setItem('currentUser', JSON.stringify({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userProfile?.name || firebaseUser.displayName || '',
        role: userProfile?.role || 'student',
        lrn: userProfile?.lrn || null,
        avatarUrl: userProfile?.avatarUrl || '',
        bio: userProfile?.bio || '',
        contactNo: userProfile?.contactNo || '',
        age: userProfile?.age || null,
        employeeNumber: userProfile?.employeeNumber || '',
        facebook: userProfile?.facebook || '',
        lastLogin: userProfile?.lastLogin || '',
        gender: userProfile?.gender || undefined, // <-- Added gender
        gradeLevel: userProfile?.gradeLevel || '',
      }));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'teacher' | 'student' | 'parent';
    lrn?: string;
    avatarUrl?: string;
    bio?: string;
    contactNo?: string;
    age?: number;
    employeeNumber?: string;
    facebook?: string;
    lastLogin?: string;
    gender?: 'male' | 'female'; // <-- Added gender
    gradeLevel?: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;
      // Save user profile to Firestore
      const userProfile: any = {
        name: userData.name,
        email: firebaseUser.email,
        role: userData.role,
        lrn: userData.lrn || null,
        bio: userData.bio || '',
        gender: userData.gender || undefined, // <-- Added gender
        gradeLevel: userData.gradeLevel || '',
      };
      if (userData.avatarUrl) userProfile.avatarUrl = userData.avatarUrl;
      if (userData.contactNo !== undefined) userProfile.contactNo = userData.contactNo;
      if (userData.age !== undefined) userProfile.age = userData.age;
      if (userData.employeeNumber !== undefined) userProfile.employeeNumber = userData.employeeNumber;
      if (userData.facebook !== undefined) userProfile.facebook = userData.facebook;
      if (userData.lastLogin !== undefined) userProfile.lastLogin = userData.lastLogin;
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData.name,
        role: userData.role,
        lrn: userData.lrn,
        avatarUrl: userData.avatarUrl || '',
        bio: userData.bio || '',
        contactNo: userData.contactNo || '',
        age: userData.age || null,
        employeeNumber: userData.employeeNumber || '',
        facebook: userData.facebook || '',
        lastLogin: userData.lastLogin || '',
        gender: userData.gender || undefined, // <-- Added gender
        gradeLevel: userData.gradeLevel || '',
      });
      setUserLRN(userData.lrn || null);
      localStorage.setItem('currentUser', JSON.stringify({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData.name,
        role: userData.role,
        lrn: userData.lrn,
        avatarUrl: userData.avatarUrl || '',
        bio: userData.bio || '',
        contactNo: userData.contactNo || '',
        age: userData.age || null,
        employeeNumber: userData.employeeNumber || '',
        facebook: userData.facebook || '',
        lastLogin: userData.lastLogin || '',
        gender: userData.gender || undefined, // <-- Added gender
        gradeLevel: userData.gradeLevel || '',
      }));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserLRN(null);
    localStorage.removeItem('currentUser');
    signOut(auth);
  };

  // Add update and delete user profile functions
  const updateUserProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    try {
      // Filter out undefined fields
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );
      await updateDoc(doc(db, 'users', user.id), filteredUpdates);
      setUser({ ...user, ...updates });
      if (updates.lrn !== undefined) setUserLRN(updates.lrn || null);
      if (updates.avatarUrl !== undefined) setUser({ ...user, ...updates });
      if (updates.bio !== undefined) setUser({ ...user, ...updates });
      if (updates.contactNo !== undefined) setUser({ ...user, ...updates });
      if (updates.age !== undefined) setUser({ ...user, ...updates });
      if (updates.employeeNumber !== undefined) setUser({ ...user, ...updates });
      if (updates.facebook !== undefined) setUser({ ...user, ...updates });
      if (updates.lastLogin !== undefined) setUser({ ...user, ...updates });
      if (updates.gender !== undefined) setUser({ ...user, ...updates });
      if (updates.gradeLevel !== undefined) setUser({ ...user, ...updates });
      localStorage.setItem('currentUser', JSON.stringify({ ...user, ...updates }));
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // New: Delete user profile with password confirmation or Google re-auth
  const deleteUserProfileWithPasswordOrGoogle = async (password?: string): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    try {
      if (!auth.currentUser || !user.email) throw new Error('No current user');
      // Detect provider
      const providerId = auth.currentUser.providerData[0]?.providerId;
      if (providerId === 'password') {
        if (!password) throw new Error('Password required');
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
      } else if (providerId === 'google.com') {
        const googleProvider = new GoogleAuthProvider();
        await reauthenticateWithPopup(auth.currentUser, googleProvider);
      } else {
        throw new Error('Unsupported authentication provider');
      }
      // Delete all user data (grades, sections, connections)
      await deleteAllUserData(user.id);
      await deleteDoc(doc(db, 'users', user.id));
      // Delete the Firebase Auth user account
      await deleteUser(auth.currentUser);
      setUser(null);
      setUserLRN(null);
      localStorage.removeItem('currentUser');
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUserProfile = async (): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    try {
      // Delete all user data (grades, sections, connections)
      await deleteAllUserData(user.id);
      await deleteDoc(doc(db, 'users', user.id));
      setUser(null);
      setUserLRN(null);
      localStorage.removeItem('currentUser');
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userLRN,
      login,
      signup,
      logout,
      isLoading,
      updateUserProfile,
      deleteUserProfile,
      deleteUserProfileWithPassword: deleteUserProfileWithPasswordOrGoogle,
      deleteUserProfileWithPasswordOrGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
}
