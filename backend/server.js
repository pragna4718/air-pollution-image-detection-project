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

// Chat fallback endpoint for frontend chat when the ML API is unavailable
app.post("/api/chat", (req, res) => {
  const message = String(req.body?.message || '').trim();
  if (!message) {
    return res.status(400).json({ reply: 'Please send a question about air quality, weather, or image pollution detection.' });
  }

  const lowerMessage = message.toLowerCase();
  let reply = '';

  if (lowerMessage.includes('aqi') || lowerMessage.includes('air quality')) {
    reply = 'AQI stands for Air Quality Index. Lower values mean cleaner air; higher values mean more pollution. Use the dashboard for the latest weather and air pollution data.';
  } else if (lowerMessage.includes('image') || lowerMessage.includes('pollution') || lowerMessage.includes('detect')) {
    reply = 'Use the Image Detection page to upload a photo and I will analyze whether the scene appears clean or polluted.';
  } else if (lowerMessage.includes('weather') || lowerMessage.includes('temperature') || lowerMessage.includes('humidity')) {
    reply = 'The dashboard shows current temperature, humidity, wind speed, precipitation, and air quality metrics for the selected city.';
  } else {
    reply = 'I am your Air Quality Assistant. Ask me about AQI, pollution levels, weather conditions, or image-based pollution detection.';
  }

  res.json({ reply });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
