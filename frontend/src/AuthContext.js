import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const storedTheme = localStorage.getItem('theme') || 'dark';
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setTheme(storedTheme);
    setLoading(false);
  }, []);

  const login = (identifier) => {
    // Extract name from email or create from identifier
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, theme, updateTheme }}>
      {children}
    </AuthContext.Provider>
  );
};
