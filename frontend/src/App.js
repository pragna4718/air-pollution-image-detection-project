import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Dashboard from './Dashboard';

// ✅ ROUTING
import {
  Routes,
  Route
} from "react-router-dom";

// ✅ YOUR PAGES
import ImageDetection from "./ImageDetection";

const fallbackCities = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai'
];

function AppContent() {

  const [data, setData] = useState(null);
  const [city, setCity] = useState('Mumbai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputCity, setInputCity] = useState('');

  // =========================
  // FETCH DASHBOARD DATA
  // =========================
  const fetchDashboardData = useCallback(async (cityName, retryIndex = 0) => {

    setLoading(true);
    setError(null);

    try {

      const response = await fetch(
        `http://localhost:3001/api/dashboard?city=${encodeURIComponent(cityName)}`
      );

      if (!response.ok) {

        // Try fallback cities
        if (retryIndex < fallbackCities.length) {

          const nextCity = fallbackCities[retryIndex];

          console.log(`Trying fallback city: ${nextCity}`);

          return fetchDashboardData(nextCity, retryIndex + 1);
        }

        throw new Error(`City not found: ${cityName}`);
      }

      const result = await response.json();

      setData(result);
      setCity(cityName);
      setInputCity('');
      setLoading(false);

    } catch (err) {

      setError(err.message);

      console.error('Error fetching data:', err);

      setLoading(false);
    }

  }, []);

  // =========================
  // LOAD DEFAULT CITY
  // =========================
  useEffect(() => {
    fetchDashboardData('Mumbai');
  }, [fetchDashboardData]);

  // =========================
  // CITY CHANGE
  // =========================
  const handleCityChange = (e) => {

    e.preventDefault();

    if (inputCity.trim()) {
      fetchDashboardData(inputCity);
    }
  };

  return (

    <Routes>

      {/* =========================
          DASHBOARD PAGE
      ========================= */}

      <Route
        path="/"
        element={

          data ? (

            <Dashboard
              data={data}
              city={city}
              onCityChange={handleCityChange}
              inputCity={inputCity}
              setInputCity={setInputCity}
              loading={loading}
              error={error}
            />

          ) : loading ? (

            <div className="loading">

              <div className="spinner"></div>

              <p>Loading dashboard...</p>

            </div>

          ) : error ? (

            <div className="error">

              <div className="error-icon">⚠️</div>

              <p>Error: {error}</p>

              <button
                onClick={() => fetchDashboardData('Mumbai')}
              >
                Retry with Default City
              </button>

            </div>

          ) : null
        }
      />

      {/* =========================
          IMAGE DETECTION PAGE
      ========================= */}

      <Route
        path="/image-detection"
        element={<ImageDetection />}
      />

    </Routes>
  );
}

// =========================
// MAIN APP
// =========================

function App() {

  return (
    <>
      {/* MAIN CONTENT */}
      <AppContent />
    </>
  );
}

export default App;