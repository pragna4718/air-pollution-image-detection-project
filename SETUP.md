# 🚀 Quick Setup Guide

## One-Command Installation

Run this command from the project root to install all dependencies:

```bash
npm run install-all
```

## Start the Dashboard

### All-in-One (Recommended)
```bash
npm run start-all
```

### Manual Start (Separate Terminals)

**Terminal 1 - Backend:**
```bash
npm run start-backend
```

**Terminal 2 - Frontend:**
```bash
npm run start-frontend
```

## Access Points

- **Dashboard UI**: http://localhost:3000
- **API Server**: http://localhost:3001
- **API Endpoint**: http://localhost:3001/api/dashboard?city=Bangalore

## File Organization

| Component | Location | Purpose |
|-----------|----------|---------|
| Backend Server | `backend/server.js` | Express API server |
| Frontend App | `frontend/src/App.js` | Main React component |
| Dashboard UI | `frontend/src/Dashboard.js` | Dashboard component |
| Styling | `frontend/src/Dashboard.css` | Beautiful CSS styles |
| Background | `frontend/src/assets/background1.jpeg` | Dashboard background |
| Env Config | `backend/.env` | API keys & config |

## Default Settings

- **Default City**: Bangalore
- **Backend Port**: 3001
- **Frontend Port**: 3000
- **Background Image**: `frontend/src/assets/background1.jpeg`

## Features Included

✅ Real-time weather data
✅ Air quality monitoring with harmful gases
✅ UV index tracking
✅ 3-day forecast
✅ City search functionality
✅ Beautiful glassmorphism UI
✅ Responsive design
✅ Health recommendations
✅ Navigation arrow for future pages

## Next Steps After Setup

1. Visit http://localhost:3000
2. View Bangalore weather and air pollution data
3. Try searching for different cities
4. Expand "More Details" section
5. Check health recommendations
6. Click navigation arrow (bottom-right) for future features

## Troubleshooting

### If ports are in use:
```bash
# Kill port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### If dependencies fail to install:
```bash
# Clear npm cache
npm cache clean --force

# Then retry
npm run install-all
```

---

**You're all set! Enjoy the dashboard! 🎉**
