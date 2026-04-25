import React, { useEffect, useState } from "react";
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
} from "chart.js";
import { Line, Bar, Pie, Scatter } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import backgroundImage from './assets/backgroung2.jpg';

const pixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
ChartJS.defaults.devicePixelRatio = pixelRatio;

ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function VisualizationPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const endpoints = ['/api/visualization-data', 'http://localhost:3001/api/visualization-data', 'http://localhost:5000/visualization-data'];
      let lastError = null;

      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to fetch visualization data from ${url}`);
          const result = await res.json();
          setData(result);
          setLoading(false);
          return;
        } catch (err) {
          lastError = err;
        }
      }

      setError(lastError?.message || 'Failed to fetch visualization data');
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ backgroundColor: "#000", color: "#fff", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "#000", color: "#fff", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <h2>Error: {error}</h2>
        <button onClick={() => navigate("/")} style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#fff", color: "#000", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { aqi = [], hours = [], months = [], temperature = [], humidity = [], wind_speed = [] } = data;

  const safeArray = (arr) => (Array.isArray(arr) ? arr : []);
  const aqiList = safeArray(aqi).map(Number);
  const hourList = safeArray(hours).map(String);
  const monthList = safeArray(months).map(String);
  const tempList = safeArray(temperature).map(Number);
  const humidityList = safeArray(humidity).map(Number);
  const windList = safeArray(wind_speed).map(Number);

  const pixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: pixelRatio,
    animation: { duration: 0 },
    plugins: {
      legend: { labels: { color: "#fff", font: { size: 16, weight: "bold" } } },
      tooltip: { enabled: true, mode: "nearest", intersect: false, titleFont: { size: 14 }, bodyFont: { size: 13 } },
    },
    layout: { padding: 20 },
    elements: {
      point: {
        radius: 5,
        hoverRadius: 7,
        borderWidth: 2,
      },
      line: {
        tension: 0.25,
      },
    },
    scales: {
      x: { 
        ticks: { color: "#fff", font: { size: 14, weight: "bold" }, maxRotation: 45, minRotation: 0 }, 
        grid: { color: "rgba(255,255,255,0.15)", lineWidth: 1 }, 
        title: { display: true, color: "#fff", font: { size: 16, weight: "bold" } } 
      },
      y: { 
        ticks: { color: "#fff", font: { size: 14, weight: "bold" } }, 
        grid: { color: "rgba(255,255,255,0.15)", lineWidth: 1 }, 
        title: { display: true, color: "#fff", font: { size: 16, weight: "bold" } } 
      },
    },
  };

  const categoryCounts = aqiList.reduce((counts, value) => {
    let key = "Unknown";
    if (value <= 50) key = "Good";
    else if (value <= 100) key = "Moderate";
    else if (value <= 150) key = "Unhealthy for Sensitive";
    else if (value <= 200) key = "Unhealthy";
    else if (value <= 300) key = "Very Unhealthy";
    else key = "Hazardous";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

  const categoryChartData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: ["#00b894", "#ffeaa7", "#fdcb6e", "#e17055", "#d63031", "#6c5ce7"],
      },
    ],
  };

  const movingAverage = aqiList.map((_, index, arr) => {
    const window = arr.slice(Math.max(0, index - 2), index + 1);
    return window.reduce((sum, value) => sum + value, 0) / window.length;
  });

  const monthlyBucket = monthList.reduce((acc, month, index) => {
    const key = month;
    if (!acc[key]) acc[key] = [];
    acc[key].push(aqiList[index] || 0);
    return acc;
  }, {});

  const monthlyLabels = Object.keys(monthlyBucket).sort((a, b) => Number(a) - Number(b));
  const monthlyAverageData = monthlyLabels.map((month) => {
    const values = monthlyBucket[month];
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  });

  const lineData = {
    labels: hourList,
    datasets: [
      {
        label: "AQI",
        data: aqiList,
        borderColor: "#00ff00",
        backgroundColor: "rgba(0,255,0,0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const barData = {
    labels: hourList,
    datasets: [
      {
        label: "AQI",
        data: aqiList,
        backgroundColor: "rgba(255, 0, 0, 0.8)",
      },
    ],
  };

  const hourlyBucket = hourList.reduce((acc, hour, index) => {
    const key = hour;
    if (!acc[key]) acc[key] = [];
    acc[key].push(aqiList[index] || 0);
    return acc;
  }, {});

  const hourLabels = Array.from({ length: 24 }, (_, i) => String(i));
  const hourlyAverageData = hourLabels.map((hour) => {
    const values = hourlyBucket[hour] || [];
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  });

  const scatterData = (xList) => ({
    datasets: [
      {
        label: "AQI",
        data: xList.map((x, index) => ({ x, y: aqiList[index] || 0 })),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
      },
    ],
  });

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
    return denomX && denomY ? numerator / (denomX * denomY) : 0;
  };

  const correlationKeys = ["AQI", "Temperature", "Humidity", "Wind Speed"];
  const correlationValues = [aqiList, tempList, humidityList, windList];
  const correlationMatrix = correlationValues.map((row) => correlationValues.map((col) => computeCorrelation(row, col)));

  const aqiBins = [0, 50, 100, 150, 200, 300, 500];
  const histogramCounts = aqiBins.slice(0, -1).map((start, index) => {
    const end = aqiBins[index + 1];
    return aqiList.filter((value) => value >= start && value < end).length;
  });
  const histogramLabels = aqiBins.slice(0, -1).map((start, index) => `${start}-${aqiBins[index + 1]}`);

  const minAqi = Math.min(...aqiList);
  const maxAqi = Math.max(...aqiList);

  const chartCards = [
    { id: "aqiTime", title: "AQI Over Time", description: "Show AQI across hours.", icon: "📈" },
    { id: "aqiDistribution", title: "AQI Distribution", description: "View hourly AQI bars.", icon: "📊" },
    { id: "aqiCategories", title: "AQI Categories", description: "See category counts.", icon: "🥧" },
    { id: "movingAverage", title: "Moving Average", description: "Smooth AQI trend.", icon: "📉" },
    { id: "monthlyAverage", title: "Monthly Average", description: "Compare month-by-month AQI.", icon: "🗓️" },
    { id: "hourlyPattern", title: "Hourly Pattern", description: "Average AQI by hour.", icon: "⏱️" },
    { id: "tempVsAqi", title: "Temp vs AQI", description: "Temperature correlation.", icon: "🌡️" },
    { id: "humidityVsAqi", title: "Humidity vs AQI", description: "Humidity correlation.", icon: "💧" },
    { id: "windVsAqi", title: "Wind vs AQI", description: "Wind speed correlation.", icon: "🌬️" },
    { id: "correlationHeatmap", title: "Correlation Heatmap", description: "Compare feature correlation.", icon: "🧠" },
    { id: "aqiHistogram", title: "AQI Histogram", description: "AQI range distribution.", icon: "📉" },
    { id: "minMax", title: "Min vs Max", description: "Compare lowest and highest AQI.", icon: "⚖️" },
  ];

  const chartWrapperStyle = {
    backgroundColor: "#111",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "24px",
    minHeight: "520px",
    width: "100%",
    overflow: "auto",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  };

  const renderChartContent = () => {
    const baseOptions = {
      ...chartOptionsBase,
      plugins: {
        ...chartOptionsBase.plugins,
        title: { display: true, color: "#fff", text: "" },
      },
    };

    const chartContainer = (title, chart) => (
      <>
        <h2 style={{ marginBottom: "18px", textAlign: "center", flexShrink: 0 }}>{title}</h2>
        <div style={{ flex: 1, width: "100%", minHeight: "400px", overflow: "auto" }}>
          {chart}
        </div>
      </>
    );

    switch (selectedChart) {
      case "aqiTime":
        return chartContainer(
          "AQI Over Time",
          <Line
            data={lineData}
            style={{ width: "100%", height: "100%" }}
            options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, title: { ...baseOptions.plugins.title, text: "AQI Over Time" } },
              scales: {
                ...baseOptions.scales,
                x: { ...baseOptions.scales.x, title: { display: true, text: "Hour", color: "#fff" } },
                y: { ...baseOptions.scales.y, title: { display: true, text: "AQI", color: "#fff" } },
              },
            }}
          />
        );
      case "aqiDistribution":
        return chartContainer(
          "AQI Distribution",
          <Bar
            data={barData}
            style={{ width: "100%", height: "100%" }}
            options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, title: { ...baseOptions.plugins.title, text: "AQI Distribution" } },
              scales: {
                ...baseOptions.scales,
                x: { ...baseOptions.scales.x, title: { display: true, text: "Hour", color: "#fff" } },
                y: { ...baseOptions.scales.y, title: { display: true, text: "AQI", color: "#fff" } },
              },
            }}
          />
        );
      case "aqiCategories":
        return chartContainer(
          "AQI Categories",
          <Pie
            data={categoryChartData}
            style={{ width: "100%", height: "100%" }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom", labels: { color: "#fff" } },
                title: { display: true, text: "AQI Categories", color: "#fff" },
              },
            }}
          />
        );
      case "movingAverage":
        return chartContainer(
          "Moving Average AQI Trend",
          <Line
            data={{ labels: hourList, datasets: [{ label: "3-point Moving Average", data: movingAverage, borderColor: "#f39c12", backgroundColor: "rgba(243, 156, 18, 0.2)", fill: true, tension: 0.25 }] }}
            style={{ width: "100%", height: "100%" }}
            options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, title: { ...baseOptions.plugins.title, text: "Moving Average AQI Trend" } },
              scales: {
                ...baseOptions.scales,
                x: { ...baseOptions.scales.x, title: { display: true, text: "Hour", color: "#fff" } },
                y: { ...baseOptions.scales.y, title: { display: true, text: "AQI", color: "#fff" } },
              },
            }}
          />
        );
      case "monthlyAverage":
        return chartContainer(
          "Monthly Average AQI",
          <Bar
            data={{ labels: monthlyLabels, datasets: [{ label: "Avg AQI", data: monthlyAverageData, backgroundColor: "rgba(0,123,255,0.85)" }] }}
            style={{ width: "100%", height: "100%" }}
            options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, title: { ...baseOptions.plugins.title, text: "Monthly Average AQI" } },
              scales: {
                ...baseOptions.scales,
                x: { ...baseOptions.scales.x, title: { display: true, text: "Month", color: "#fff" } },
                y: { ...baseOptions.scales.y, title: { display: true, text: "Avg AQI", color: "#fff" } },
              },
            }}
          />
        );
      case "hourlyPattern":
        return chartContainer(
          "Hourly AQI Pattern",
          <Line
            data={{ labels: hourLabels, datasets: [{ label: "Avg AQI", data: hourlyAverageData, borderColor: "#8e44ad", backgroundColor: "rgba(142, 68, 173, 0.2)", fill: true, tension: 0.3 }] }}
            style={{ width: "100%", height: "100%" }}
            options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, title: { ...baseOptions.plugins.title, text: "Hourly AQI Pattern" } },
              scales: {
                ...baseOptions.scales,
                x: { ...baseOptions.scales.x, title: { display: true, text: "Hour", color: "#fff" } },
                y: { ...baseOptions.scales.y, title: { display: true, text: "AQI", color: "#fff" } },
              },
            }}
          />
        );
      case "tempVsAqi":
        return chartContainer(
          "Temperature vs AQI",
          <Scatter
            data={scatterData(tempList)}
            style={{ width: "100%", height: "100%" }}
            options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, title: { ...baseOptions.plugins.title, text: "Temperature vs AQI" } },
              scales: {
                ...baseOptions.scales,
                x: { ...baseOptions.scales.x, type: "linear", beginAtZero: true, title: { display: true, text: "Temperature", color: "#fff" } },
                y: { ...baseOptions.scales.y, beginAtZero: true, title: { display: true, text: "AQI", color: "#fff" } },
              },
            }}
          />
        );
      case "humidityVsAqi":
        return chartContainer(
          "Humidity vs AQI",
          <Scatter
            data={scatterData(humidityList)}
            style={{ width: "100%", height: "100%" }}
            options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, title: { ...baseOptions.plugins.title, text: "Humidity vs AQI" } },
              scales: {
                ...baseOptions.scales,
                x: { ...baseOptions.scales.x, type: "linear", beginAtZero: true, title: { display: true, text: "Humidity", color: "#fff" } },
                y: { ...baseOptions.scales.y, beginAtZero: true, title: { display: true, text: "AQI", color: "#fff" } },
              },
            }}
          />
        );
      case "windVsAqi":
        return chartContainer(
          "Wind Speed vs AQI",
          <Scatter
            data={scatterData(windList)}
            style={{ width: "100%", height: "100%" }}
            options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, title: { ...baseOptions.plugins.title, text: "Wind Speed vs AQI" } },
              scales: {
                ...baseOptions.scales,
                x: { ...baseOptions.scales.x, type: "linear", beginAtZero: true, title: { display: true, text: "Wind Speed", color: "#fff" } },
                y: { ...baseOptions.scales.y, beginAtZero: true, title: { display: true, text: "AQI", color: "#fff" } },
              },
            }}
          />
        );
      case "correlationHeatmap":
        return (
          <>
            <h2 style={{ marginBottom: "18px", textAlign: "center" }}>Correlation Heatmap</h2>
            <div style={{ overflow: "auto", height: "460px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff", minWidth: "600px" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid rgba(255,255,255,0.2)", padding: "12px" }}></th>
                    {correlationKeys.map((key) => (
                      <th key={key} style={{ borderBottom: "1px solid rgba(255,255,255,0.2)", padding: "12px", textAlign: "center" }}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationMatrix.map((row, rowIndex) => (
                    <tr key={correlationKeys[rowIndex]}>
                      <td style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.12)", fontWeight: 700 }}>{correlationKeys[rowIndex]}</td>
                      {row.map((value, colIndex) => {
                        const intensity = Math.round(Math.abs(value) * 255);
                        const background = `rgba(${255 - intensity}, ${255 - intensity}, 255, 0.15)`;
                        return (
                          <td key={`${rowIndex}-${colIndex}`} style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.12)", background }}>
                            {value.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      case "aqiHistogram":
        return chartContainer(
          "AQI Range Histogram",
          <Bar
            data={{ labels: histogramLabels, datasets: [{ label: "Count", data: histogramCounts, backgroundColor: "rgba(255, 206, 86, 0.85)" }] }}
            style={{ width: "100%", height: "100%" }}
            options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, title: { ...baseOptions.plugins.title, text: "AQI Range Histogram" } },
              scales: {
                ...baseOptions.scales,
                x: { ...baseOptions.scales.x, title: { display: true, text: "AQI Range", color: "#fff" } },
                y: { ...baseOptions.scales.y, title: { display: true, text: "Count", color: "#fff" } },
              },
            }}
          />
        );
      case "minMax":
        return chartContainer(
          "Min vs Max AQI Comparison",
          <Bar
            data={{ labels: ["Min AQI", "Max AQI"], datasets: [{ label: "AQI", data: [minAqi, maxAqi], backgroundColor: ["rgba(0,255,0,0.85)", "rgba(255,0,0,0.85)"] }] }}
            style={{ width: "100%", height: "100%" }}
            options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, title: { ...baseOptions.plugins.title, text: "Min vs Max AQI" } },
              scales: {
                ...baseOptions.scales,
                x: { ...baseOptions.scales.x, title: { display: false, color: "#fff" } },
                y: { ...baseOptions.scales.y, title: { display: true, text: "AQI", color: "#fff" } },
              },
            }}
          />
        );
      default:
        return (
          <div style={{ color: "#bbb", textAlign: "center", paddingTop: "180px" }}>
            <p style={{ margin: 0, fontSize: "18px" }}>Click a chart card above to display the graph.</p>
          </div>
        );
    }
  };

  return (
    <div style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: "#fff",
      height: "100vh",
      padding: "20px",
      overflowY: "auto"
    }}>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: "1300px",
        margin: "0 auto"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "14px", color: '#fff' }}>Air Quality Visualizations</h1>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <button onClick={() => navigate("/")} style={{ padding: "12px 20px", backgroundColor: "#fff", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Back to Dashboard
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {chartCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelectedChart(card.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: selectedChart === card.id ? "#0f3" : "#111",
                border: selectedChart === card.id ? "2px solid #00ff00" : "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                borderRadius: "18px",
                padding: "18px",
                minHeight: "150px",
                textAlign: "left",
                cursor: "pointer",
                transition: "transform 0.15s ease, border 0.15s ease, background-color 0.15s ease",
              }}
            >
              <div>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{card.icon}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{card.title}</div>
                <div style={{ fontSize: "14px", color: "#aaa" }}>{card.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={chartWrapperStyle}>
          {renderChartContent()}
        </div>
      </div>
    </div>
  );
}

export default VisualizationPage;
