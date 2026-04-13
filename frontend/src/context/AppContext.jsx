import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes contextually
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName || 'Collector');
        setUserPhoto(user.photoURL || '');
        setIsAuthenticated(true);
      } else {
        setUserId('');
        setUserName('');
        setUserPhoto('');
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserProfile = async (photoURL) => {
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { photoURL });
        setUserPhoto(photoURL);
      } catch (error) {
        console.error('Update profile error:', error);
      }
    }
  };

  return (
    <AppContext.Provider value={{ userId, userName, userPhoto, isAuthenticated, logout, updateUserProfile }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
