import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { UserProfile } from '../../types/user.types';
import { AuthContextType, SignupParams } from './auth.types';

export type { SignupParams } from './auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered. Please log in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return err.message || 'An unexpected authentication error occurred.';
    }
  };

  const fetchUserProfile = async (uid: string, defaultEmail?: string): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      } else {
        const fallback: UserProfile = {
          uid,
          name: defaultEmail?.split('@')[0] || 'Operator',
          email: defaultEmail || '',
          role: 'operator',
          buildingId: 'building_A',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, fallback);
        return fallback;
      }
    } catch (e) {
      console.error('Error fetching user profile from Firestore:', e);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userProf = await fetchUserProfile(currentUser.uid, currentUser.email || '');
        setProfile(userProf);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const userProf = await fetchUserProfile(res.user.uid, res.user.email || '');
      setProfile(userProf);
    } catch (err: any) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signup = async (params: SignupParams) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, params.email, params.password);
      const newProfile: UserProfile = {
        uid: res.user.uid,
        name: params.name,
        email: params.email,
        role: params.role,
        buildingId: params.buildingId,
        phone: params.phone || '',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setProfile(newProfile);
    } catch (err: any) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setError(null);
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isAuthenticated: !!user, login, signup, logout, resetPassword, error, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};