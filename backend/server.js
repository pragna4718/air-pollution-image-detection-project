require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const API_KEY = process.env.API_KEY;

app.use(cors());
app.use(express.json());

// Geocode city name to coordinates
async function geocodeCity(cityName) {
  try {
    const response = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`
    );
    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        lat: result.latitude,
        lon: result.longitude,
        name: result.name,
        country: result.country,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Get weather data from Open-Meteo API
async function getWeatherData(lat, lon) {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`
    );
    return response.data;
  } catch (error) {
    console.error("Weather API error:", error);
    return null;
  }
}

// Get air quality data from Open-Meteo API
async function getAirQualityData(lat, lon) {
  try {
    const response = await axios.get(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide&timezone=auto`
    );
    return response.data;
  } catch (error) {
    console.error("Air Quality API error:", error);
    // Return mock data if API fails
    return {
      current: {
        pm10: 45,
        pm2_5: 28,
        nitrogen_dioxide: 35,
        sulphur_dioxide: 8,
        ozone: 65,
        carbon_monoxide: 0.45
      }
    };
  }
}

// Main dashboard endpoint
app.get("/api/dashboard", async (req, res) => {
  const city = req.query.city || "Bangalore";

  try {
    // Geocode the city
    const coordinates = await geocodeCity(city);
    if (!coordinates) {
      return res.status(404).json({ error: "City not found" });
    }

    // Get weather and air quality data in parallel
    const [weatherData, airQualityData] = await Promise.all([
      getWeatherData(coordinates.lat, coordinates.lon),
      getAirQualityData(coordinates.lat, coordinates.lon),
    ]);

    if (!weatherData || !airQualityData) {
      return res.status(500).json({ error: "Failed to fetch data" });
    }

    // Combine all data
    const dashboardData = {
      city: coordinates,
      weather: weatherData,
      airQuality: airQualityData,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Visualization data endpoint
app.get("/api/visualization-data", (req, res) => {
  try {
    const csvPath = path.resolve(__dirname, "../ml_api/data/air_quality.csv");
    const csvText = fs.readFileSync(csvPath, "utf8");
    const rows = csvText.trim().split(/\r?\n/);
    const headers = rows[0].split(",").map((h) => h.trim());
    const dataRows = rows.slice(1).map((row) => row.split(",").map((cell) => cell.trim()));

    const payload = {};
    const addColumn = (columnName, key) => {
      const index = headers.indexOf(columnName);
      if (index !== -1) {
        payload[key] = dataRows.map((row) => row[index]);
      }
    };

    addColumn("AQI", "aqi");
    addColumn("Temperature", "temperature");
    addColumn("Humidity", "humidity");
    addColumn("Wind Speed", "wind_speed");
    addColumn("Date", "dates");

    if (payload.dates) {
      payload.months = payload.dates.map((dateValue) => {
        const date = new Date(dateValue);
        return Number.isFinite(date.getMonth()) ? date.getMonth() + 1 : null;
      });
      payload.hours = payload.dates.map((dateValue) => {
        const date = new Date(dateValue);
        return Number.isFinite(date.getHours()) ? date.getHours() : null;
      });
    }

    return res.json(payload);
  } catch (error) {
    console.error("Visualization data error:", error);
    return res.status(500).json({ error: "Unable to load visualization data" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Visualization data endpoint
app.get("/api/visualization-data", async (req, res) => {
  try {
    // Generate mock historical data for visualization
    const hours = [];
    const months = [];
    const aqi = [];
    const temperature = [];
    const humidity = [];
    const wind_speed = [];

    // Generate hourly data for the last 24 hours
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      hours.push(hour.getHours() + ':00');
      
      // Generate realistic AQI values (0-200 range)
      aqi.push(Math.floor(Math.random() * 150) + 20);
      
      // Generate temperature data (20-35°C range)
      temperature.push(Math.floor(Math.random() * 15) + 20);
      
      // Generate humidity data (40-90% range)
      humidity.push(Math.floor(Math.random() * 50) + 40);
      
      // Generate wind speed data (5-25 km/h range)
      wind_speed.push(Math.floor(Math.random() * 20) + 5);
    }

    // Generate monthly data for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(month.toLocaleString('default', { month: 'short' }));
    }

    res.json({
      aqi,
      hours,
      months,
      temperature,
      humidity,
      wind_speed
    });
  } catch (error) {
    console.error("Visualization data error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
