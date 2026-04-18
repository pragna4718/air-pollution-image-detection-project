require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
