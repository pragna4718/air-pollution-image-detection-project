# 🌍 Weather & Air Pollution Dashboard

A beautiful, responsive web application that displays real-time weather conditions and air pollution data for any city in the world.

## 🌟 Features

### Weather Information
- Current temperature, humidity, wind speed, and precipitation
- "Feels like" temperature
- 3-day forecast
- Weather emoji indicators
- UV index with health recommendations
- Day/night status

### Air Quality Monitoring
- Real-time Air Quality Index (AQI)
- Harmful gases measurement:
  - PM10 (Particulate Matter 10μm)
  - PM2.5 (Fine Particulate Matter)
  - O₃ (Ozone)
  - NO₂ (Nitrogen Dioxide)
  - SO₂ (Sulfur Dioxide)
  - CO (Carbon Monoxide)
- Visual indicators with color-coded progress bars

### User Features
- **City Search**: Change location with a single search
- **Default City**: Bangalore is set as the default city
- **Health Recommendations**: Personalized advice based on air quality and UV levels
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Beautiful UI**: Glassmorphism design with background image
- **Navigation**: Arrow button at bottom-right to navigate to next pages (extensible)

## 🛠️ Tech Stack

### Frontend
- **React 18**: UI library
- **CSS3**: Advanced styling with glassmorphism effects
- **Responsive Design**: Mobile-first approach

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Axios**: HTTP client for API calls
- **CORS**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management

### APIs Used
- **Open-Meteo Weather API**: Free weather data
- **Open-Meteo Air Quality API**: Free air quality data
- **Open-Meteo Geocoding API**: City name to coordinates conversion

## 📁 Project Structure

```
air_pollution_image_detection_project/
├── backend/
│   ├── package.json
│   ├── server.js          # Express server with weather & air quality endpoints
│   └── .env               # Environment variables (API keys)
├── frontend/
│   ├── public/
│   │   └── index.html     # HTML entry point
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # App styles
│   │   ├── Dashboard.js   # Dashboard component
│   │   ├── Dashboard.css  # Dashboard styles
│   │   ├── index.js       # React entry point
│   │   ├── index.css      # Global styles
│   │   ├── Upload.js      # Placeholder for upload functionality
│   │   └── assets/
│   │       └── background1.jpeg  # Dashboard background image
│   └── package.json
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

   This will install dependencies for:
   - Root project
   - Backend server
   - Frontend application

### Running the Application

#### Option 1: Run Both Servers (Recommended)
```bash
npm run start-all
```

#### Option 2: Run Servers Separately

**Terminal 1 - Backend Server:**
```bash
npm run start-backend
# Or for development with auto-reload:
npm run dev-backend
```

**Terminal 2 - Frontend Server:**
```bash
npm run start-frontend
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Dashboard Endpoint**: http://localhost:3001/api/dashboard?city=Bangalore

## 📊 API Endpoints

### GET /api/dashboard
Fetch weather and air quality data for a specific city.

**Query Parameters:**
- `city` (string): City name (default: "Bangalore")

**Response:**
```json
{
  "city": {
    "lat": 12.9716,
    "lon": 77.5946,
    "name": "Bangalore",
    "country": "India"
  },
  "weather": {
    "current": { ... },
    "daily": { ... }
  },
  "airQuality": {
    "current": { ... },
    "hourly": { ... }
  }
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## 🎨 Design Features

### Color Scheme
- **Gradient Background**: Purple to violet gradient
- **Glass Morphism**: Semi-transparent cards with backdrop blur
- **Color-Coded AQI**: Green (Good) → Red (Very Unhealthy)
- **Weather Emojis**: Visual indicators for weather conditions

### Responsive Breakpoints
- **Desktop**: 1600px and above
- **Tablet**: 768px - 1024px
- **Mobile**: Below 768px

## 📱 Features Breakdown

### Dashboard Card Components
1. **Current Weather**: Temperature, humidity, wind speed, precipitation
2. **UV Index**: Level and health recommendations
3. **3-Day Forecast**: Daily highs/lows and conditions
4. **Air Quality Index**: Visual circular display
5. **Harmful Gases**: Gas levels with progress bars
6. **Health Recommendations**: Personalized advice
7. **Additional Details**: Toggle for more information

### Interactive Elements
- **City Search Bar**: Real-time city lookup
- **More Details Button**: Expandable information section
- **Navigation Arrow**: Next page button (bottom-right)
- **Hover Effects**: Cards elevate and highlight on hover
- **Loading States**: User feedback during data fetching

## 🔄 Data Flow

```
User Input (City Search)
    ↓
React Component (App.js)
    ↓
Fetch Request to Backend (http://localhost:3001/api/dashboard)
    ↓
Express Server (server.js)
    ↓
Geocode City → Fetch Weather → Fetch Air Quality
    ↓
Combine Data
    ↓
Return JSON Response
    ↓
React Dashboard Renders
    ↓
Display Beautiful UI
```

## 🌐 Browser Support

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## 📝 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
API_KEY=your_api_key_here
PORT=3001
```

Note: The current implementation uses free APIs that don't require API keys from the `.env` file, but it's prepared for future integration.

## � Air Quality Visualization and Image Detection

### Visualization
1. Place a dataset at `ml_api/data/air_quality.csv` with a `Date` column and either `AQI` or `PM2.5`.
2. Run:

```bash
python ml_api/air_quality_visualization.py
```

3. Generated charts will be saved to `ml_api/plots/`:
   - `aqi_over_time.png`
   - `monthly_average_aqi.png`
   - `hourly_aqi_pattern.png`
   - `correlation_heatmap.png`

### Image-based CNN Pollution Detection
1. Place training images under:
   - `ml_api/data/images/train/Clean`
   - `ml_api/data/images/train/Polluted`
2. Place validation images under:
   - `ml_api/data/images/validation/Clean`
   - `ml_api/data/images/validation/Polluted`
3. Run:

```bash
python ml_api/cnn_image_detection.py
```

4. The trained model will be saved to `model/model.h5` and training plots will be saved in `ml_api/`.

### Flask API Integration
- Load visualization data from: `http://localhost:5000/visualization-data`
- Predict image pollution from: `http://localhost:5000/predict-image`

Example frontend fetch for visualization JSON:

```js
fetch('http://localhost:5000/visualization-data')
  .then((res) => res.json())
  .then((data) => console.log(data));
```

Example frontend upload for image prediction:

```js
const formData = new FormData();
formData.append('image', file);

fetch('http://localhost:5000/predict-image', {
  method: 'POST',
  body: formData,
})
  .then((res) => res.json())
  .then((result) => console.log(result));
```

## �🔮 Future Enhancements

1. **Image Detection Integration**: Connect the ML model for pollution source detection
2. **Historical Data**: Display pollution trends over time
3. **Location Pinning**: Save favorite locations
4. **Notifications**: Alert users of poor air quality days
5. **Offline Mode**: Cache data for offline access
6. **Dark/Light Theme**: Toggle between themes
7. **Multiple Language Support**: i18n implementation
8. **Advanced Analytics**: Pollution patterns and predictions

## 🐛 Troubleshooting

### Port Already in Use
If you get "Port already in use" error:
```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### CORS Errors
The backend includes CORS headers. If you still get CORS errors:
1. Check that backend is running on port 3001
2. Verify frontend proxy setting in `frontend/package.json`
3. Check browser console for specific error messages

### Data Not Loading
1. Verify backend server is running: `curl http://localhost:3001/api/health`
2. Check internet connection
3. Verify the city name is spelled correctly
4. Check browser console for error messages

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Last Updated**: April 18, 2026

Made with ❤️ for clean air and informed decisions
