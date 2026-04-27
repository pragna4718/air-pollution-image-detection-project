import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [preferences, setPreferences] = useState({
    notifications: true,
    dataSharing: false,
    autoRefresh: false,
    privacyMode: false,
    units: 'AQI',
    locationAlerts: true,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedTheme = localStorage.getItem('theme') || 'dark';
    const storedPreferences = localStorage.getItem('preferences');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences));
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }

    setTheme(storedTheme);
    setLoading(false);
  }, []);

  useEffect(() => {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const login = (identifier) => {
    let name = identifier.split('@')[0] || 'User';
    name = name.charAt(0).toUpperCase() + name.slice(1);
    
    const userData = {
      identifier,
      name,
      email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
      phone: identifier.includes('@') ? '9876543210' : identifier,
      token: 'mock-token-123',
      profilePic: '👤'
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  const signup = (userData) => {
    const completeUserData = {
      ...userData,
      token: 'mock-token-123',
      profilePic: '👤'
    };
    setUser(completeUserData);
    localStorage.setItem('user', JSON.stringify(completeUserData));
    return true;
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const updatePreferences = (updatedPreferences) => {
    const newPreferences = { ...preferences, ...updatedPreferences };
    setPreferences(newPreferences);
    localStorage.setItem('preferences', JSON.stringify(newPreferences));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, theme, updateTheme, preferences, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};
