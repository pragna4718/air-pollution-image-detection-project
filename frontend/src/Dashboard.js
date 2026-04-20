import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import backgroundImage from './assets/background1.jpeg';

const getWeatherEmoji = (weatherCode) => {
  // WMO Weather interpretation codes
  if (weatherCode === 0 || weatherCode === 1) return '☀️';
  if (weatherCode === 2) return '⛅';
  if (weatherCode === 3) return '☁️';
  if (weatherCode === 45 || weatherCode === 48) return '🌫️';
  if (weatherCode >= 51 && weatherCode <= 67) return '🌧️';
  if (weatherCode >= 71 && weatherCode <= 87) return '❄️';
  if (weatherCode >= 80 && weatherCode <= 82) return '🌧️';
  if (weatherCode >= 85 && weatherCode <= 86) return '❄️';
  if (weatherCode >= 90 && weatherCode <= 99) return '⛈️';
  return '🌡️';
};

const getAQILevel = (pm25) => {
  if (pm25 <= 12) return { level: 'Good', color: '#00B894', message: 'Air quality is good' };
  if (pm25 <= 35.4) return { level: 'Moderate', color: '#FFD700', message: 'Air quality is acceptable' };
  if (pm25 <= 55.4) return { level: 'Unhealthy for Sensitive Groups', color: '#FF8C42', message: 'Sensitive groups should limit outdoor activity' };
  if (pm25 <= 150.4) return { level: 'Unhealthy', color: '#FF6B6B', message: 'Air quality is unhealthy' };
  return { level: 'Very Unhealthy', color: '#8B0000', message: 'Serious health effects' };
};

const getUVIndexLevel = (uvIndex) => {
  if (uvIndex < 3) return { level: 'Low', color: '#00B894', message: 'No protection required' };
  if (uvIndex < 6) return { level: 'Moderate', color: '#FFD700', message: 'Wear SPF 30+ sunscreen' };
  if (uvIndex < 8) return { level: 'High', color: '#FF8C42', message: 'Seek shade during midday' };
  if (uvIndex < 11) return { level: 'Very High', color: '#FF6B6B', message: 'Avoid sun exposure' };
  return { level: 'Extreme', color: '#8B0000', message: 'Take precautions' };
};

const getRainfallEstimate = (precipitation, humidity, cloudCover = 50) => {
  // Estimate rainfall probability and intensity based on precipitation, humidity, and weather code
  let probability = 0;
  let intensity = 'None';
  let icon = '☀️';

  if (precipitation > 0) {
    probability = Math.min(100, precipitation * 20);
    if (precipitation < 1) {
      intensity = 'Light';
      icon = '🌦️';
    } else if (precipitation < 5) {
      intensity = 'Moderate';
      icon = '🌧️';
    } else if (precipitation < 10) {
      intensity = 'Heavy';
      icon = '⛈️';
    } else {
      intensity = 'Very Heavy';
      icon = '⛈️';
    }
  } else if (humidity > 80) {
    probability = humidity - 30;
    intensity = 'Possible';
    icon = '☁️';
  } else if (humidity > 60) {
    probability = humidity - 50;
    intensity = 'Slight Chance';
    icon = '⛅';
  }

  return { probability: Math.round(probability), intensity, icon, humidity };
};

const Dashboard = ({ data, city, onCityChange, inputCity, setInputCity, loading, error }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const weather = data?.weather?.current;
  const dailyWeather = data?.weather?.daily;
  const airQuality = data?.airQuality?.current;
  const cityData = data?.city;

  const aqiInfo = getAQILevel(airQuality?.pm2_5);
  const uvInfo = getUVIndexLevel(weather?.uv_index);
  const rainfallInfo = getRainfallEstimate(weather?.precipitation, weather?.relative_humidity_2m);

  return (
    <div
      className="dashboard"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'scroll',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="overlay"></div>

      {/* Header */}
      <div className="header">
        <div className="title-section">
          <h1 className="title">🌍 Weather & Air Pollution Dashboard</h1>
        </div>

        {/* City Search */}
        <div className="city-search">
          <form onSubmit={onCityChange}>
            <input
              type="text"
              placeholder="Enter city name..."
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Current Location */}
        <div className="location-info">
          <p className="location-name">
            📍 {cityData?.name}, {cityData?.country}
          </p>
        </div>

        {/* Hamburger Menu Button */}
        <button 
          className="hamburger-menu" 
          onClick={() => setShowMenu(!showMenu)}
          title="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Right Sidebar Menu */}
      <div className={`right-menu ${showMenu ? 'open' : ''}`}>
        <div className="menu-content">
          <button 
            className="menu-close" 
            onClick={() => setShowMenu(false)}
          >
            ✕
          </button>
          <h2 className="menu-title">Menu</h2>
          <div className="menu-items">
            <button 
              className="menu-item"
              onClick={() => {
                navigate('/image-detection');
                setShowMenu(false);
              }}
            >
              🖼️ Image Detection
            </button>
            <button 
              className="menu-item"
              onClick={() => {
                navigate('/data-analysis');
                setShowMenu(false);
              }}
            >
              📈 Data Analysis
            </button>
            <button 
              className="menu-item"
              onClick={() => {
                navigate('/recommendations');
                setShowMenu(false);
              }}
            >
              💡 Recommendations
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Column - Weather */}
        <div className="left-column">
          {/* Current Weather Card */}
          <div className="weather-card main-card">
            <div className="weather-top">
              <div className="weather-emoji">
                {getWeatherEmoji(weather?.weather_code)}
              </div>
              <div className="temperature-section">
                <div className="temperature">{Math.round(weather?.temperature_2m)}°C</div>
                <div className="feels-like">Feels like {Math.round(weather?.apparent_temperature)}°C</div>
              </div>
            </div>
            <div className="weather-details-grid">
              <div className="weather-detail">
                <span className="label">Humidity</span>
                <span className="value">{weather?.relative_humidity_2m}%</span>
              </div>
              <div className="weather-detail">
                <span className="label">Wind Speed</span>
                <span className="value">{weather?.wind_speed_10m} km/h</span>
              </div>
              <div className="weather-detail">
                <span className="label">Precipitation</span>
                <span className="value">{weather?.precipitation || 0} mm</span>
              </div>
              <div className="weather-detail">
                <span className="label">Pressure</span>
                <span className="value">Normal</span>
              </div>
            </div>
          </div>

          {/* UV Index Card */}
          <div
            className="info-card uv-card"
            style={{ borderLeftColor: uvInfo.color }}
          >
            <div className="card-header">
              <span className="emoji">☀️</span>
              <span className="label">UV Index</span>
            </div>
            <div className="card-main">
              <div className="value" style={{ color: uvInfo.color }}>
                {weather?.uv_index}
              </div>
              <div className="level" style={{ color: uvInfo.color }}>
                {uvInfo.level}
              </div>
            </div>
            <div className="message">{uvInfo.message}</div>
          </div>

          {/* Rainfall Estimation Card */}
          <div className="rainfall-card info-card">
            <div className="rainfall-header">
              <span className="rainfall-icon">{rainfallInfo.icon}</span>
              <h3>🌧️ Rainfall Estimate</h3>
            </div>
            <div className="rainfall-main">
              <div className="rainfall-prob-container">
                <div className="rainfall-probability">
                  <div className="prob-value">{rainfallInfo.probability}%</div>
                  <div className="prob-label">Probability</div>
                </div>
                <div className="rainfall-bar-container">
                  <div className="rainfall-bar">
                    <div 
                      className="rainfall-bar-fill"
                      style={{
                        width: `${rainfallInfo.probability}%`,
                        background: rainfallInfo.probability > 70 ? '#FF6B6B' : 
                                   rainfallInfo.probability > 40 ? '#FFD700' : '#00B894'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="rainfall-details">
                <div className="rainfall-detail">
                  <span className="detail-label">Intensity</span>
                  <span className="detail-value">{rainfallInfo.intensity}</span>
                </div>
                <div className="rainfall-detail">
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{rainfallInfo.humidity}%</span>
                </div>
                <div className="rainfall-detail">
                  <span className="detail-label">Precipitation</span>
                  <span className="detail-value">{weather?.precipitation?.toFixed(1) || 0} mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Card */}
          <div className="forecast-card">
            <h3>📅 3-Day Forecast</h3>
            <div className="forecast-grid">
              {dailyWeather?.time?.slice(0, 3).map((date, index) => (
                <div key={index} className="forecast-item">
                  <div className="date">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="emoji">
                    {getWeatherEmoji(dailyWeather?.weather_code[index])}
                  </div>
                  <div className="temps">
                    <span className="max">{Math.round(dailyWeather?.temperature_2m_max[index])}°</span>
                    <span className="min">{Math.round(dailyWeather?.temperature_2m_min[index])}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Air Quality */}
        <div className="right-column">
          {/* Air Quality Index Card */}
          <div className="air-quality-card main-card">
            <div className="aqi-header">
              <h2>Air Quality Index</h2>
            </div>
            <div className="aqi-display" style={{ borderColor: aqiInfo.color }}>
              <div className="aqi-value" style={{ color: aqiInfo.color }}>
                {Math.round(airQuality?.pm2_5)}
              </div>
              <div className="aqi-unit">PM2.5 μg/m³</div>
            </div>
            <div className="aqi-level" style={{ color: aqiInfo.color }}>
              {aqiInfo.level}
            </div>
            <div className="aqi-message">{aqiInfo.message}</div>
          </div>

          {/* Harmful Gases Card */}
          <div className="gases-card info-card">
            <h3>⚠️ Harmful Gases</h3>
            <div className="gases-grid">
              <div className="gas-item">
                <div className="gas-name">PM10</div>
                <div className="gas-value">
                  {airQuality?.pm10?.toFixed(1)} μg/m³
                </div>
                <div className="gas-bar">
                  <div
                    className="gas-bar-fill"
                    style={{
                      width: `${Math.min(
                        (airQuality?.pm10 / 150) * 100,
                        100
                      )}%`,
                      backgroundColor: airQuality?.pm10 > 50 ? '#FF6B6B' : '#FFD700',
                    }}
                  ></div>
                </div>
              </div>

              <div className="gas-item">
                <div className="gas-name">O₃ (Ozone)</div>
                <div className="gas-value">
                  {airQuality?.ozone?.toFixed(1) || 'N/A'} ppb
                </div>
                <div className="gas-bar">
                  <div
                    className="gas-bar-fill"
                    style={{
                      width: `${Math.min(
                        ((airQuality?.ozone || 0) / 100) * 100,
                        100
                      )}%`,
                      backgroundColor: (airQuality?.ozone || 0) > 50 ? '#FF6B6B' : '#FFD700',
                    }}
                  ></div>
                </div>
              </div>

              <div className="gas-item">
                <div className="gas-name">NO₂ (Nitrogen Dioxide)</div>
                <div className="gas-value">
                  {airQuality?.nitrogen_dioxide?.toFixed(1) || 'N/A'} ppb
                </div>
                <div className="gas-bar">
                  <div
                    className="gas-bar-fill"
                    style={{
                      width: `${Math.min(
                        ((airQuality?.nitrogen_dioxide || 0) / 100) * 100,
                        100
                      )}%`,
                      backgroundColor: (airQuality?.nitrogen_dioxide || 0) > 50 ? '#FF6B6B' : '#FFD700',
                    }}
                  ></div>
                </div>
              </div>

              <div className="gas-item">
                <div className="gas-name">SO₂ (Sulfur Dioxide)</div>
                <div className="gas-value">
                  {airQuality?.sulphur_dioxide?.toFixed(1) || 'N/A'} ppb
                </div>
                <div className="gas-bar">
                  <div
                    className="gas-bar-fill"
                    style={{
                      width: `${Math.min(
                        ((airQuality?.sulphur_dioxide || 0) / 80) * 100,
                        100
                      )}%`,
                      backgroundColor: (airQuality?.sulphur_dioxide || 0) > 30 ? '#FF6B6B' : '#FFD700',
                    }}
                  ></div>
                </div>
              </div>

              <div className="gas-item">
                <div className="gas-name">CO (Carbon Monoxide)</div>
                <div className="gas-value">
                  {airQuality?.carbon_monoxide?.toFixed(2) || 'N/A'} μmol/mol
                </div>
                <div className="gas-bar">
                  <div
                    className="gas-bar-fill"
                    style={{
                      width: `${Math.min(
                        ((airQuality?.carbon_monoxide || 0) / 1) * 100,
                        100
                      )}%`,
                      backgroundColor: (airQuality?.carbon_monoxide || 0) > 0.5 ? '#FF6B6B' : '#FFD700',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Health Recommendations */}
          <div className="recommendations-card info-card">
            <h3>💡 Health Recommendations</h3>
            <ul className="recommendations-list">
              {aqiInfo.color === '#8B0000' && (
                <li>🚫 Avoid outdoor activities</li>
              )}
              {aqiInfo.color === '#FF6B6B' && (
                <li>⚠️ Limit outdoor activities, especially for sensitive groups</li>
              )}
              {aqiInfo.color === '#FF8C42' && (
                <li>👨‍👩‍👧‍👦 Sensitive groups should limit outdoor exposure</li>
              )}
              {(aqiInfo.color === '#FFD700' || aqiInfo.color === '#00B894') && (
                <li>✅ Air quality is good, enjoy outdoor activities</li>
              )}
              {uvInfo.level === 'Extreme' && (
                <li>☀️ Use SPF 50+ sunscreen and protective clothing</li>
              )}
              {uvInfo.level === 'Very High' && (
                <li>🕶️ Wear sunglasses and seek shade during midday</li>
              )}
              {weather?.wind_speed_10m > 20 && (
                <li>💨 High wind speeds, secure loose items</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Visualization call-to-action */}
      <div className="visualization-action" style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
        <button
          className="visualization-button"
          style={{
            padding: '14px 24px',
            borderRadius: '10px',
            background: '#2ecc71',
            color: '#000',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '700'
          }}
          onClick={() => navigate('/visualization')}
        >
          📊 Go to Visualization
        </button>
      </div>

      {/* Navigation Arrow to Next Page */}
      <div className="navigation-arrow">
        <button className="arrow-button" title="View Visualizations" onClick={() => navigate('/visualization')}>
          <span>→</span>
        </button>
      </div>

      {/* Details Toggle Button */}
      <div className="details-toggle">
        <button
          className="toggle-btn"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▼ Less Details' : '▲ More Details'}
        </button>
      </div>

      {/* Additional Details Section */}
      {showDetails && (
        <div className="additional-details">
          <div className="details-grid">
            <div className="detail-item">
              <h4>Weather Details</h4>
              <p>
                <strong>Weather Code:</strong> {weather?.weather_code}
              </p>
              <p>
                <strong>Is Daytime:</strong> {weather?.is_day ? 'Yes ☀️' : 'No 🌙'}
              </p>
            </div>
            <div className="detail-item">
              <h4>Air Quality Standards</h4>
              <p>All values based on international air quality standards</p>
              <p>
                <strong>Data Source:</strong> Open-Meteo Air Quality API
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
