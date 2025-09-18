import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as FirebaseUser, EmailAuthProvider, reauthenticateWithCredential, deleteUser, GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteAllUserData } from '../services/gradesService';
import { createAuthError, createNetworkError, createValidationError } from '@/utils/errorHandling';
import { cacheService } from '../services/cacheService';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'farmer' | 'fisherman' | 'buyer' | 'admin';
  profileImage?: string;
  phoneNumber?: string;
  location?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    region: string;
    province: string;
    city: string;
  };
  businessInfo?: {
    businessName: string;
    businessType: 'individual' | 'cooperative' | 'company' | 'restaurant' | 'school' | 'hospital' | 'retailer';
    licenseNumber?: string;
    description?: string;
  };
  verificationStatus?: {
    isVerified: boolean;
    verifiedAt?: string;
    documents: { type: 'BIR' | 'BarangayClearance'; url: string; uploadedAt: string }[];
  };
  membershipStatus?: {
    tier: 'lifetime' | 'temporary' | 'none';
    documentType?: 'BIR' | 'BarangayClearance';
    expiresAt?: string;
  };
  rating?: {
    average: number;
    totalReviews: number;
  };
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    email: string;
    password: string;
    name: string;
    role: 'farmer' | 'fisherman' | 'buyer' | 'admin';
    phoneNumber?: string;
    location?: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      region: string;
      province: string;
      city: string;
    };
    businessInfo?: {
      businessName: string;
      businessType: 'individual' | 'cooperative' | 'company' | 'restaurant' | 'school' | 'hospital' | 'retailer';
      licenseNumber?: string;
      description?: string;
    };
    verificationStatus?: User['verificationStatus'];
    membershipStatus?: User['membershipStatus'];
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
  const [isLoading, setIsLoading] = useState(true);

  // Add this useEffect to restore user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Validate input
      if (!email || !password) {
        throw createValidationError('Email and password are required', 'Login Validation');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Check cache first for user profile
      const cacheKey = `user_profile_${firebaseUser.uid}`;
      let userProfile = cacheService.get(cacheKey);
      
      if (!userProfile) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          userProfile = userDoc.data();
          // Cache the profile for 10 minutes
          cacheService.set(cacheKey, userProfile, 10 * 60 * 1000);
        } else {
          // Create a basic user profile if it doesn't exist
          const basicProfile = {
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            role: 'farmer', // Default role
            phoneNumber: '',
            verificationStatus: {
              isVerified: false,
              documents: []
            },
            rating: {
              average: 0,
              totalReviews: 0
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), basicProfile);
          userProfile = basicProfile;
          // Cache the profile for 10 minutes
          cacheService.set(cacheKey, userProfile, 10 * 60 * 1000);
        }
      }
      
      // Update lastLogin timestamp (only if document exists)
      const lastLogin = new Date().toISOString();
      if (userProfile) {
        await updateDoc(doc(db, 'users', firebaseUser.uid), { lastLogin });
      }
      
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: (userProfile as any)?.name || firebaseUser.displayName || '',
        role: (firebaseUser.email === 'zacharythanos@gmail.com') ? 'admin' : ((userProfile as any)?.role || 'buyer'),
        profileImage: (userProfile as any)?.profileImage || '',
        phoneNumber: (userProfile as any)?.phoneNumber || '',
        location: (userProfile as any)?.location || undefined,
        businessInfo: (userProfile as any)?.businessInfo || undefined,
        verificationStatus: (userProfile as any)?.verificationStatus || {
          isVerified: false,
          documents: []
        },
        membershipStatus: (userProfile as any)?.membershipStatus || { tier: 'none' },
        rating: (userProfile as any)?.rating || {
          average: 0,
          totalReviews: 0
        },
        lastLogin: lastLogin,
        createdAt: (userProfile as any)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    } catch (error: any) {
      // Enhanced error handling with specific error types
      let appError;
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        appError = createAuthError('Invalid email or password', 'Login Authentication');
      } else if (error.code === 'auth/too-many-requests') {
        appError = createAuthError('Too many failed attempts. Please try again later.', 'Login Rate Limit');
      } else if (error.code === 'auth/network-request-failed') {
        appError = createNetworkError('Network error. Please check your connection.', 'Login Network');
      } else if (error.code === 'auth/user-disabled') {
        appError = createAuthError('Account has been disabled. Please contact support.', 'Login Account Status');
      } else {
        appError = createAuthError(
          error.message || 'An unexpected error occurred during login',
          'Login Unknown Error'
        );
      }
      
      console.error('Login error:', appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'farmer' | 'fisherman' | 'buyer' | 'admin';
    phoneNumber?: string;
    location?: {
      address: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      region: string;
      province: string;
      city: string;
    };
    businessInfo?: {
      businessName: string;
      businessType: 'individual' | 'cooperative' | 'company' | 'restaurant' | 'school' | 'hospital' | 'retailer';
      licenseNumber?: string;
      description?: string;
    };
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Validate input
      if (!userData.email || !userData.password || !userData.name) {
        throw createValidationError('Email, password, and name are required', 'Signup Validation');
      }

      if (userData.password.length < 6) {
        throw createValidationError('Password must be at least 6 characters long', 'Signup Validation');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;
      
      // Save user profile to Firestore
      const userProfile: any = {
        name: userData.name,
        email: firebaseUser.email,
        role: userData.role,
        phoneNumber: userData.phoneNumber || '',
        verificationStatus: {
          isVerified: Boolean(userData.verificationStatus?.isVerified) || false,
          documents: userData.verificationStatus?.documents || []
        },
        membershipStatus: userData.membershipStatus || { tier: 'none' },
        rating: {
          average: 0,
          totalReviews: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Only add optional fields if they exist and are not undefined
      if (userData.location) {
        userProfile.location = userData.location;
      }
      if (userData.businessInfo) {
        userProfile.businessInfo = userData.businessInfo;
      }
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      
      const newUser: any = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData.name,
        role: userData.role,
        profileImage: '',
        phoneNumber: userData.phoneNumber || '',
        verificationStatus: userData.verificationStatus || {
          isVerified: false,
          documents: []
        },
        membershipStatus: userData.membershipStatus || { tier: 'none' },
        rating: {
          average: 0,
          totalReviews: 0
        },
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Only add optional fields if they exist
      if (userData.location) {
        newUser.location = userData.location;
      }
      if (userData.businessInfo) {
        newUser.businessInfo = userData.businessInfo;
      }
      
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      return true;
    } catch (error: any) {
      // Enhanced error handling with specific error types
      let appError;
      
      if (error.code === 'auth/email-already-in-use') {
        appError = createAuthError('An account with this email already exists', 'Signup Duplicate Email');
      } else if (error.code === 'auth/invalid-email') {
        appError = createValidationError('Please enter a valid email address', 'Signup Email Validation');
      } else if (error.code === 'auth/weak-password') {
        appError = createValidationError('Password is too weak. Please choose a stronger password', 'Signup Password Validation');
      } else if (error.code === 'auth/network-request-failed') {
        appError = createNetworkError('Network error. Please check your connection.', 'Signup Network');
      } else if (error.code === 'auth/operation-not-allowed') {
        appError = createAuthError('Email/password accounts are not enabled. Please contact support.', 'Signup Configuration');
      } else {
        appError = createAuthError(
          error.message || 'An unexpected error occurred during signup',
          'Signup Unknown Error'
        );
      }
      
      console.error('Signup error:', appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
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
      const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
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
      // Delete all user data (harvests, bids, transactions)
      await deleteAllUserData(user.id);
      await deleteDoc(doc(db, 'users', user.id));
      setUser(null);
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
