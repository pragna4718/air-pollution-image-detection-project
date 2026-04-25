import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import backgroundImage from './assets/backgroung2.jpg';
import './DataAnalysis.css';

ChartJS.register(LineElement, BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const DataAnalysis = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('aqi');

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    try {
      const response = await fetch('/api/visualization-data');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      // Generate mock data for analysis
      generateMockData();
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const aqi = Array.from({ length: 24 }, () => Math.floor(Math.random() * 150) + 20);
    const temperature = Array.from({ length: 24 }, () => Math.floor(Math.random() * 15) + 20);
    const humidity = Array.from({ length: 24 }, () => Math.floor(Math.random() * 50) + 40);
    const wind_speed = Array.from({ length: 24 }, () => Math.floor(Math.random() * 20) + 5);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    setData({
      aqi,
      temperature,
      humidity,
      wind_speed,
      hours,
      months
    });
  };

  const getAQILevel = (value) => {
    if (value <= 50) return { level: 'Good', color: '#00b894', emoji: '😊' };
    if (value <= 100) return { level: 'Moderate', color: '#ffeaa7', emoji: '😐' };
    if (value <= 150) return { level: 'Unhealthy for Sensitive', color: '#fdcb6e', emoji: '😟' };
    if (value <= 200) return { level: 'Unhealthy', color: '#e17055', emoji: '😷' };
    if (value <= 300) return { level: 'Very Unhealthy', color: '#d63031', emoji: '😢' };
    return { level: 'Hazardous', color: '#6c5ce7', emoji: '💀' };
  };

  if (loading) {
    return (
      <div style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '24px'
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ animation: 'spin 1s linear infinite', marginBottom: '20px' }}>⚙️</div>
          Loading analysis data...
        </div>
      </div>
    );
  }

  if (!data) {
    return <div style={{ color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No data available</div>;
  }

  const aqiList = data.aqi || [];
  const temperatureList = data.temperature || [];
  const humidityList = data.humidity || [];
  const windList = data.wind_speed || [];

  // Calculate statistics
  const avgAQI = Math.round(aqiList.reduce((a, b) => a + b, 0) / aqiList.length);
  const maxAQI = Math.max(...aqiList);
  const minAQI = Math.min(...aqiList);
  const aqiTrend = aqiList[aqiList.length - 1] - aqiList[0];

  // Calculate correlations
  const computeCorrelation = (x, y) => {
    const n = Math.min(x.length, y.length);
    if (!n) return 0;
    const xVals = x.slice(0, n);
    const yVals = y.slice(0, n);
    const meanX = xVals.reduce((sum, v) => sum + v, 0) / n;
    const meanY = yVals.reduce((sum, v) => sum + v, 0) / n;
    const numerator = xVals.reduce((sum, v, idx) => sum + (v - meanX) * (yVals[idx] - meanY), 0);
    const denomX = Math.sqrt(xVals.reduce((sum, v) => sum + (v - meanX) ** 2, 0));
    const denomY = Math.sqrt(yVals.reduce((sum, v) => sum + (v - meanY) ** 2, 0));
    return denomX && denomY ? (numerator / (denomX * denomY)).toFixed(2) : 0;
  };

  const tempAqiCorr = computeCorrelation(temperatureList, aqiList);
  const humidityAqiCorr = computeCorrelation(humidityList, aqiList);
  const windAqiCorr = computeCorrelation(windList, aqiList);

  // AQI Category Distribution
  const categoryCounts = aqiList.reduce((counts, value) => {
    let key = 'Unknown';
    if (value <= 50) key = 'Good';
    else if (value <= 100) key = 'Moderate';
    else if (value <= 150) key = 'Unhealthy for Sensitive';
    else if (value <= 200) key = 'Unhealthy';
    else if (value <= 300) key = 'Very Unhealthy';
    else key = 'Hazardous';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  // Chart configurations
  const aqiTrendChart = {
    labels: data.hours,
    datasets: [{
      label: 'AQI Trend',
      data: aqiList,
      borderColor: '#e74c3c',
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: '#e74c3c',
    }]
  };

  const pollutantComparisonChart = {
    labels: data.hours,
    datasets: [
      {
        label: 'AQI',
        data: aqiList,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
      },
      {
        label: 'Temperature',
        data: temperatureList,
        borderColor: '#f39c12',
        backgroundColor: 'rgba(243, 156, 18, 0.2)',
      },
      {
        label: 'Humidity (%)',
        data: humidityList,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
      }
    ]
  };

  const categoryChart = {
    labels: Object.keys(categoryCounts),
    datasets: [{
      data: Object.values(categoryCounts),
      backgroundColor: ['#00b894', '#ffeaa7', '#fdcb6e', '#e17055', '#d63031', '#6c5ce7'],
      borderColor: 'rgba(255, 255, 255, 0.1)',
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: { size: 12, weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12 },
        bodyFont: { size: 11 }
      }
    },
    scales: {
      x: {
        ticks: { color: '#aaa', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        ticks: { color: '#aaa', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: { size: 12, weight: 'bold' }
        }
      }
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        minHeight: '100vh',
        padding: '40px 20px',
        borderRadius: '0'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '20px'
          }}>
            <h1 style={{ color: '#fff', margin: 0, fontSize: '36px', fontWeight: 'bold' }}>📊 Data Analysis & Insights</h1>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Key Statistics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {[
              { label: 'Average AQI', value: avgAQI, icon: '📈', color: '#3498db' },
              { label: 'Highest AQI', value: maxAQI, icon: '⚠️', color: '#e74c3c' },
              { label: 'Lowest AQI', value: minAQI, icon: '✅', color: '#27ae60' },
              { label: 'AQI Trend', value: aqiTrend > 0 ? `+${aqiTrend}` : aqiTrend, icon: '📊', color: aqiTrend > 0 ? '#e74c3c' : '#27ae60' }
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${stat.color}`,
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{stat.icon}</div>
                <p style={{ color: '#aaa', margin: 0, fontSize: '12px', marginBottom: '8px' }}>{stat.label}</p>
                <p style={{ color: stat.color, margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {/* AQI Trend */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(5px)'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>📈 AQI Trend Over Time</h3>
              <div style={{ height: '300px' }}>
                <Line data={aqiTrendChart} options={chartOptions} />
              </div>
            </div>

            {/* Category Distribution */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(5px)'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>🥧 AQI Category Distribution</h3>
              <div style={{ height: '300px' }}>
                <Pie data={categoryChart} options={pieChartOptions} />
              </div>
            </div>

            {/* Pollutant Comparison */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(5px)',
              gridColumn: '1 / -1'
            }}>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>🔄 Pollutant & Weather Comparison</h3>
              <div style={{ height: '300px' }}>
                <Line data={pollutantComparisonChart} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Correlation Analysis */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '40px'
          }}>
            <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '25px', fontSize: '24px' }}>🔗 Correlation Analysis</h2>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>Correlation coefficient between pollutants and weather factors (Range: -1 to 1)</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {[
                { name: 'Temperature ↔ AQI', value: tempAqiCorr, icon: '🌡️' },
                { name: 'Humidity ↔ AQI', value: humidityAqiCorr, icon: '💧' },
                { name: 'Wind Speed ↔ AQI', value: windAqiCorr, icon: '💨' }
              ].map((corr, idx) => {
                const corrValue = parseFloat(corr.value);
                let color = '#3498db';
                if (corrValue > 0.5) color = '#e74c3c';
                else if (corrValue < -0.5) color = '#27ae60';
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '15px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>{corr.icon}</div>
                    <p style={{ color: '#aaa', margin: 0, fontSize: '12px', marginBottom: '8px' }}>{corr.name}</p>
                    <p style={{ color, margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{corr.value}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '30px'
          }}>
            <h2 style={{ color: '#fff', marginTop: 0, marginBottom: '25px', fontSize: '24px' }}>💡 Key Insights</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {[
                {
                  title: '📊 AQI Status',
                  content: `Current average AQI is ${avgAQI}. ${avgAQI <= 50 ? 'Air quality is excellent!' : avgAQI <= 100 ? 'Air quality is moderate.' : 'Air quality needs attention.'}`,
                  color: '#3498db'
                },
                {
                  title: '🔍 Pollution Levels',
                  content: `Highest AQI recorded: ${maxAQI} | Lowest: ${minAQI}. Range indicates ${maxAQI - minAQI > 50 ? 'significant variation' : 'stable conditions'} throughout the day.`,
                  color: '#e74c3c'
                },
                {
                  title: '🌡️ Weather Impact',
                  content: `Temperature and humidity show correlation with pollution levels. Weather patterns significantly influence air quality in this region.`,
                  color: '#f39c12'
                }
              ].map((insight, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: `2px solid ${insight.color}`,
                    borderRadius: '8px',
                    padding: '15px',
                    borderLeft: `4px solid ${insight.color}`
                  }}
                >
                  <h3 style={{ color: insight.color, margin: '0 0 10px 0', fontSize: '16px' }}>{insight.title}</h3>
                  <p style={{ color: '#ccc', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{insight.content}</p>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;

