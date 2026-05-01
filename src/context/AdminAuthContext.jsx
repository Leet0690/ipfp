import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  // Check if admin is already logged in (on app load)
  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_session');
    if (storedAdmin) {
      try {
        const parsed = JSON.parse(storedAdmin);
        setAdminUser(parsed);
        setIsAdmin(true);
      } catch (error) {
        console.error('Failed to parse admin session:', error);
        localStorage.removeItem('admin_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
      const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const admin = {
          id: 'admin_001',
          email,
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        setAdminUser(admin);
        setIsAdmin(true);
        localStorage.setItem('admin_session', JSON.stringify(admin));
        localStorage.setItem('admin_lastLogin', new Date().toISOString());

        return { success: true, admin };
      } else {
        return { success: false, error: 'Email or password incorrect' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_lastLogin');
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, adminUser, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
