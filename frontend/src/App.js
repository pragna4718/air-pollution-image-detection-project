import React, { useState, useEffect, useCallback, useContext } from 'react';
import './App.css';
import Dashboard from './Dashboard';
import { AuthContext } from './AuthContext';

const fallbackCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];

function App() {
  const [data, setData] = useState(null);
  const [city, setCity] = useState('Mumbai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputCity, setInputCity] = useState('');

  const fetchDashboardData = useCallback(async (cityName, retryIndex = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard?city=${encodeURIComponent(cityName)}`);
      
      if (!response.ok) {
        if (retryIndex < fallbackCities.length) {
          const nextCity = fallbackCities[retryIndex];
          console.log(`City '${cityName}' not found, trying fallback: ${nextCity}`);
          return fetchDashboardData(nextCity, retryIndex + 1);
        }
        throw new Error(`Unable to fetch data for: ${cityName}`);
      }
      
      const result = await response.json();
      if (!result || !result.weather || !result.airQuality) {
        throw new Error('Invalid data received from server');
      }
      setData(result);
      setCity(result.city?.name || cityName);
      setInputCity('');
      setError(null);
      setLoading(false);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch dashboard data';
      console.error('Error fetching data:', errorMessage);
      
      if (retryIndex >= fallbackCities.length) {
        setError(errorMessage);
        setData(null);
      } else {
        const nextCity = fallbackCities[retryIndex];
        console.log(`Retrying with fallback city: ${nextCity}`);
        return fetchDashboardData(nextCity, retryIndex + 1);
      }
      setLoading(false);
    }
  }, []);

  const { preferences } = useContext(AuthContext);

  useEffect(() => {
    fetchDashboardData('Mumbai');
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!preferences?.autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData(city || 'Mumbai');
    }, 180000);

    return () => clearInterval(interval);
  }, [preferences?.autoRefresh, city, fetchDashboardData]);

  const handleCityChange = (e) => {
    e.preventDefault();
    if (inputCity.trim()) {
      fetchDashboardData(inputCity);
    }
  };

  return (
    data && !error ? (
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
        <p>{error}</p>
        <button onClick={() => fetchDashboardData('Mumbai')}>
          Retry with Mumbai
        </button>
      </div>
    ) : (
      <div className="loading">
        <div className="spinner"></div>
        <p>Initializing...</p>
      </div>
    )
  );
}

export default App;