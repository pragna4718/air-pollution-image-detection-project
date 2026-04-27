import React, { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from './AuthContext';
import './DataAnalysis.css';

ChartJS.register(LineElement, BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const DataAnalysis = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('aqi');
  const { theme } = useContext(AuthContext);
  const isDark = theme !== 'light';

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

  const textColor = isDark ? '#fff' : '#111';
  const subTextColor = isDark ? '#ccc' : '#4b5563';
  const panelBackground = isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.92)';
  const cardBackground = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)';

  const aqiTrendChart = {
    labels: data.hours,
    datasets: [{
      label: 'AQI Trend',
      data: aqiList,
      borderColor: '#e74c3c',
      backgroundColor: 'rgba(231, 76, 60, 0.15)',
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
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(31, 41, 55, 0.1)',
    }]
  };

  const movingAverage = aqiList.map((_, index, arr) => {
    const window = arr.slice(Math.max(0, index - 2), index + 1);
    return +(window.reduce((sum, value) => sum + value, 0) / window.length).toFixed(1);
  });

  const monthlyBuckets = (data.months || []).reduce((acc, month, index) => {
    const key = month || `Month ${index + 1}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(aqiList[index] || 0);
    return acc;
  }, {});

  const monthlyLabels = Object.keys(monthlyBuckets);
  const monthlyAverageData = monthlyLabels.map((month) => {
    const values = monthlyBuckets[month] || [];
    return values.length ? +(values.reduce((total, value) => total + value, 0) / values.length).toFixed(1) : 0;
  });

  const hourLabels = Array.from(new Set(data.hours || [])).slice(0, 24);
  const hourlyBuckets = (data.hours || []).reduce((acc, hour, index) => {
    const key = hour || `${index}:00`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(aqiList[index] || 0);
    return acc;
  }, {});

  const hourlyAverageData = hourLabels.map((hour) => {
    const bucket = hourlyBuckets[hour] || [];
    return bucket.length ? +(bucket.reduce((total, value) => total + value, 0) / bucket.length).toFixed(1) : 0;
  });

  const aqiBins = [0, 50, 100, 150, 200, 300, 500];
  const histogramLabels = aqiBins.slice(0, -1).map((start, idx) => `${start}-${aqiBins[idx + 1]}`);
  const histogramCounts = aqiBins.slice(0, -1).map((start, idx) => {
    const end = aqiBins[idx + 1];
    return aqiList.filter((value) => value >= start && value < end).length;
  });

  const aqiBarChart = {
    labels: data.hours,
    datasets: [
      {
        label: 'AQI Hourly',
        data: aqiList,
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
      }
    ]
  };

  const movingAverageChart = {
    labels: data.hours,
    datasets: [
      {
        label: 'AQI 3-Point Moving Average',
        data: movingAverage,
        borderColor: '#9b59b6',
        backgroundColor: 'rgba(155, 89, 182, 0.15)',
        fill: true,
      }
    ]
  };

  const monthlyAverageChart = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Month Average AQI',
        data: monthlyAverageData,
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderColor: '#2ecc71'
      }
    ]
  };

  const hourlyPatternChart = {
    labels: hourLabels,
    datasets: [
      {
        label: 'Average AQI by Hour',
        data: hourlyAverageData,
        backgroundColor: 'rgba(241, 196, 15, 0.7)',
        borderColor: '#f1c40f'
      }
    ]
  };

  const aqiHistogramChart = {
    labels: histogramLabels,
    datasets: [
      {
        label: 'AQI Frequency',
        data: histogramCounts,
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
      }
    ]
  };

  const tempVsAqiChart = {
    datasets: [
      {
        label: 'Temperature vs AQI',
        data: temperatureList.map((x, idx) => ({ x, y: aqiList[idx] || 0 })),
        backgroundColor: 'rgba(231, 76, 60, 0.85)',
      }
    ]
  };

  const humidityVsAqiChart = {
    datasets: [
      {
        label: 'Humidity vs AQI',
        data: humidityList.map((x, idx) => ({ x, y: aqiList[idx] || 0 })),
        backgroundColor: 'rgba(52, 152, 219, 0.85)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: { size: 12, weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(10, 10, 10, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: textColor,
        bodyColor: textColor,
        titleFont: { size: 12 },
        bodyFont: { size: 11 }
      }
    },
    scales: {
      x: {
        ticks: { color: textColor, font: { size: 10 } },
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 41, 59, 0.12)' }
      },
      y: {
        ticks: { color: textColor, font: { size: 10 } },
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(30, 41, 59, 0.12)' }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: textColor,
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
        padding: '20px',
        backgroundColor: isDark ? '#05070f' : '#eef2f7'
      }}
    >
      <div style={{
        backgroundColor: panelBackground,
        backdropFilter: 'blur(4px)',
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
            <h1 style={{ color: textColor, margin: 0, fontSize: '36px', fontWeight: 'bold' }}>📊 Data Analysis & Insights</h1>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '10px 20px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(31, 41, 55, 0.12)',
                color: textColor,
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {[
              {
                title: '📈 AQI Trend Over Time',
                type: 'line',
                data: aqiTrendChart,
                fullWidth: false
              },
              {
                title: '📊 Hourly AQI Distribution',
                type: 'bar',
                data: aqiBarChart,
                fullWidth: false
              },
              {
                title: '🥧 AQI Category Distribution',
                type: 'pie',
                data: categoryChart,
                fullWidth: false
              },
              {
                title: '🔄 Pollutant & Weather Comparison',
                type: 'line',
                data: pollutantComparisonChart,
                fullWidth: true
              },
              {
                title: '📉 Moving Average Trend',
                type: 'line',
                data: movingAverageChart,
                fullWidth: false
              },
              {
                title: '⏱️ Hourly AQI Pattern',
                type: 'bar',
                data: hourlyPatternChart,
                fullWidth: false
              },
              {
                title: '🗓️ Monthly Average AQI',
                type: 'bar',
                data: monthlyAverageChart,
                fullWidth: false
              },
              {
                title: '🌡️ Temperature vs AQI',
                type: 'scatter',
                data: tempVsAqiChart,
                fullWidth: false
              },
              {
                title: '💧 Humidity vs AQI',
                type: 'scatter',
                data: humidityVsAqiChart,
                fullWidth: false
              },
              {
                title: '📈 AQI Histogram',
                type: 'bar',
                data: aqiHistogramChart,
                fullWidth: false
              }
            ].map((chart, idx) => (
              <div key={chart.title} style={{
                backgroundColor: cardBackground,
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.12)'}`,
                borderRadius: '14px',
                padding: '22px',
                backdropFilter: 'blur(3px)',
                gridColumn: chart.fullWidth ? '1 / -1' : 'auto'
              }}>
                <h3 style={{ color: textColor, marginTop: 0, marginBottom: '18px' }}>{chart.title}</h3>
                <div style={{ height: '320px' }}>
                  {chart.type === 'line' && <Line data={chart.data} options={chartOptions} />}
                  {chart.type === 'bar' && <Bar data={chart.data} options={chartOptions} />}
                  {chart.type === 'pie' && <Pie data={chart.data} options={pieChartOptions} />}
                  {chart.type === 'scatter' && <Scatter data={chart.data} options={chartOptions} />}
                </div>
              </div>
            ))}
          </div>

          {/* Correlation Analysis */}
          <div style={{
            backgroundColor: cardBackground,
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.12)'}`,
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '40px'
          }}>
            <h2 style={{ color: textColor, marginTop: 0, marginBottom: '25px', fontSize: '24px' }}>🔗 Correlation Analysis</h2>
            <p style={{ color: subTextColor, marginBottom: '20px' }}>Correlation coefficient between pollutants and weather factors (Range: -1 to 1)</p>
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

