# 🚨 Alert-AID - AI-Powered Disaster Alert System

A real-time disaster monitoring and emergency response application built with React, TypeScript, and FastAPI. Features ML-powered predictions, interactive evacuation maps, and live weather alerts.

![Alert-AID Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Python](https://img.shields.io/badge/Python-3.10+-yellow)

## ✨ Features

### 🌍 Real-Time Monitoring
- **Live Weather Data** - OpenWeatherMap & Open-Meteo APIs
- **7-Day Forecast** - Accurate predictions with smart caching
- **Air Quality Index** - Real-time AQI monitoring
- **Multi-Hazard Alerts** - Earthquakes, floods, storms, wildfires

### 🗺️ Interactive Maps
- **Evacuation Routes** - OpenStreetMap with Leaflet
- **Real Shelter Locations** - Hospitals, fire stations, police, schools
- **Live Risk Visualization** - Flood zones, earthquake epicenters
- **Route Planning** - Distance to nearest shelters

### 🤖 AI/ML Predictions
- **Disaster Risk Scoring** - Multi-factor risk assessment
- **Weather-Based Alerts** - Predictive warnings
- **Anomaly Detection** - Unusual pattern recognition
- **Ensemble Predictions** - Multiple ML models

### 📱 User Features
- **Geolocation** - Auto-detect user location
- **Push Notifications** - Critical alert system
- **Emergency Contacts** - Quick access to services
- **Safety Checklists** - Evacuation guides

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Alert-AID.git
cd Alert-AID

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Running the App

```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate
python -m uvicorn simple_backend:app --host 0.0.0.0 --port 8000

# Terminal 2: Start frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
Alert-AID/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── Dashboard/      # Main dashboard widgets
│   │   ├── Map/            # Leaflet evacuation maps
│   │   ├── Emergency/      # Emergency response panels
│   │   └── Safety/         # Safety modules
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React contexts
│   └── pages/              # Page components
├── backend/                # FastAPI backend
│   ├── routes/             # API endpoints
│   ├── ml/                 # Machine learning models
│   └── models/             # Trained model files
├── public/                 # Static assets
└── build/                  # Production build
```

## 🔌 API Integrations

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| OpenWeatherMap | Weather data | 1000 calls/day |
| Open-Meteo | Weather backup | Unlimited |
| OpenStreetMap | Maps & tiles | Unlimited |
| Overpass API | Shelter data | Unlimited |
| USGS | Earthquake data | Unlimited |
| NASA EONET | Natural events | Unlimited |

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Styled Components** - CSS-in-JS
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Lucide Icons** - Icon library

### Backend
- **FastAPI** - Python API framework
- **Uvicorn** - ASGI server
- **Scikit-learn** - ML models
- **Pandas/NumPy** - Data processing

## 📊 Dashboard Components

- **GlobeRiskHero** - 3D risk visualization
- **SevenDayForecast** - Weather predictions
- **CurrentAlerts** - Active disaster alerts
- **MultiHazardPanel** - Risk by disaster type
- **AirQualityWidget** - AQI monitoring
- **LeafletEvacuationMap** - Evacuation routes

## 🗺️ Evacuation Map Features

- 📍 Auto-detect user location
- 🏥 Real hospital locations
- 🚒 Fire stations nearby
- 👮 Police stations
- 🏫 Schools (assembly points)
- ➡️ Route lines to shelters
- 📏 Distance calculations
- 🔄 Refresh data on demand

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_OPENWEATHER_API_KEY=your_api_key
```

## 🚢 Deployment

### Vercel (Frontend)
```bash
npm run build
vercel deploy
```

### Render (Backend)
The `render.yaml` file is pre-configured for deployment.

### Docker
```bash
docker build -t alert-aid .
docker run -p 3000:3000 alert-aid
```

## 📱 Screenshots

### Dashboard
- Real-time weather monitoring
- Multi-hazard risk assessment
- Interactive 3D globe visualization

### Evacuation Map
- Leaflet-based interactive map
- Real shelter markers
- Route planning to safety

## 🔒 Security

- No sensitive API keys in client code
- Environment variable protection
- CORS configuration
- Rate limiting on API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 👤 Author

**Ayush**
- GitHub: [@ayush18](https://github.com/ayush18)

## 🙏 Acknowledgments

- OpenStreetMap contributors
- OpenWeatherMap API
- NASA EONET
- USGS Earthquake Hazards Program

---

⭐ **Star this repo if you find it helpful!**

🚨 **Stay Safe, Stay Prepared!**
