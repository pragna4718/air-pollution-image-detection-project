import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from './App';
import VisualizationPage from './VisualizationPage';
import RecommendationsPage from './RecommendationsPage';
import ImageDetection from './ImageDetection';
import DataAnalysis from './DataAnalysis';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/visualization" element={<VisualizationPage />} />
        <Route path="/image-detection" element={<ImageDetection />} />
        <Route path="/data-analysis" element={<DataAnalysis />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);