import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from './App';
import VisualizationPage from './VisualizationPage';
import RecommendationsPage from './RecommendationsPage';
import ImageDetection from './ImageDetection';
import DataAnalysis from './DataAnalysis';
import Settings from './Settings';
import Login from './Login';
import Signup from './Signup';
import Chatbot from './Chatbot';
import { AuthProvider, AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return (
    <>
      {children}
      <Chatbot />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><App /></ProtectedRoute>} />
          <Route path="/visualization" element={<ProtectedRoute><VisualizationPage /></ProtectedRoute>} />
          <Route path="/image-detection" element={<ProtectedRoute><ImageDetection /></ProtectedRoute>} />
          <Route path="/data-analysis" element={<ProtectedRoute><DataAnalysis /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);