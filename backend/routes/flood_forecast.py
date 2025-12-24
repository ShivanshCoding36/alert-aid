"""
Advanced Flood Forecast API Routes
Exposes ML ensemble predictions, anomaly detection, and smart alerts
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
import httpx
import os

# Import ML modules
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.ensemble_predictor import EnsembleFloodPredictor
from ml.anomaly_detector import AnomalyDetector
from ml.smart_alerts import SmartAlertEngine, AlertSeverity

router = APIRouter(prefix="/flood", tags=["Advanced Flood Prediction"])

# Initialize ML components
ensemble_predictor = EnsembleFloodPredictor()
anomaly_detector = AnomalyDetector()
smart_alert_engine = SmartAlertEngine()

# Weather API configuration
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "1801423b3942e324ab80f5b47afe0859")


class FloodPredictionRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude")
    district: Optional[str] = Field(None, description="District name")
    state: Optional[str] = Field(None, description="State name")
    region_type: Optional[str] = Field("default", description="Region type: default, coastal, riverine, urban, hilly")


class AnomalyCheckRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    time_window_hours: Optional[int] = Field(24, description="Hours of data to analyze")


async def fetch_weather_data(lat: float, lon: float) -> Dict:
    """Fetch current weather and forecast from OpenWeatherMap"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Current weather
            current_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
            current_resp = await client.get(current_url)
            current_data = current_resp.json() if current_resp.status_code == 200 else {}
            
            # 5-day forecast
            forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
            forecast_resp = await client.get(forecast_url)
            forecast_data = forecast_resp.json() if forecast_resp.status_code == 200 else {}
        
        # Extract relevant metrics
        rainfall_1h = current_data.get("rain", {}).get("1h", 0)
        rainfall_3h = current_data.get("rain", {}).get("3h", rainfall_1h * 3)
        humidity = current_data.get("main", {}).get("humidity", 70)
        temp = current_data.get("main", {}).get("temp", 25)
        pressure = current_data.get("main", {}).get("pressure", 1013)
        wind_speed = current_data.get("wind", {}).get("speed", 5)
        clouds = current_data.get("clouds", {}).get("all", 50)
        
        # Calculate 24h rainfall forecast from forecast data
        rainfall_24h = 0
        max_intensity = 0
        if "list" in forecast_data:
            for item in forecast_data["list"][:8]:  # First 24 hours (3h intervals)
                rain = item.get("rain", {}).get("3h", 0)
                rainfall_24h += rain
                max_intensity = max(max_intensity, rain / 3)  # Convert to hourly
        
        return {
            "current": {
                "rainfall_1h": rainfall_1h,
                "rainfall_3h": rainfall_3h,
                "humidity": humidity,
                "temperature": temp,
                "pressure": pressure,
                "wind_speed": wind_speed,
                "cloud_cover": clouds,
                "timestamp": datetime.now().isoformat()
            },
            "forecast": {
                "rainfall_24h_forecast": rainfall_24h,
                "max_rainfall_intensity": max_intensity
            },
            "source": "OpenWeatherMap"
        }
    except Exception as e:
        print(f"Weather fetch error: {e}")
        # Return simulated data if API fails
        return {
            "current": {
                "rainfall_1h": 5.2,
                "rainfall_3h": 12.8,
                "humidity": 85,
                "temperature": 28,
                "pressure": 1008,
                "wind_speed": 12,
                "cloud_cover": 78,
                "timestamp": datetime.now().isoformat()
            },
            "forecast": {
                "rainfall_24h_forecast": 45,
                "max_rainfall_intensity": 8.5
            },
            "source": "simulated"
        }


def generate_environmental_data(weather: Dict, lat: float, lon: float) -> Dict:
    """Generate environmental data for ML models from weather"""
    current = weather.get("current", {})
    forecast = weather.get("forecast", {})
    
    # Simulate discharge and water level based on rainfall
    rainfall = current.get("rainfall_3h", 0) + forecast.get("rainfall_24h_forecast", 0) / 8
    base_discharge = 150  # Base discharge in m³/s
    
    # Discharge increases with rainfall
    discharge = base_discharge + (rainfall * 15) + (current.get("humidity", 70) - 50) * 2
    
    # Water level correlates with discharge
    water_level = min(0.95, 0.3 + (discharge / 1000) + (rainfall / 100))
    
    # Soil moisture from humidity and recent rainfall
    soil_moisture = min(100, current.get("humidity", 70) + rainfall * 2)
    
    return {
        "rainfall_mm": current.get("rainfall_1h", 0) * 24,  # Daily estimate
        "humidity": current.get("humidity", 70),
        "temperature": current.get("temperature", 25),
        "river_discharge": discharge,
        "water_level": water_level,
        "soil_moisture": soil_moisture,
        "pressure": current.get("pressure", 1013),
        "wind_speed": current.get("wind_speed", 5),
        "cloud_cover": current.get("cloud_cover", 50),
        "elevation": 50 + (lat % 1) * 200,  # Simulated elevation
        "slope": 0.02 + (lon % 1) * 0.05  # Simulated slope
    }


@router.post("/predict")
async def ensemble_flood_prediction(request: FloodPredictionRequest):
    """
    Advanced Ensemble Flood Prediction
    
    Combines:
    - LSTM time-series forecasting
    - XGBoost risk classification
    - GNN river network analysis
    
    Returns predictions for 6h, 12h, and 24h horizons with confidence scores
    """
    try:
        # Fetch real weather data
        weather = await fetch_weather_data(request.latitude, request.longitude)
        
        # Generate environmental data
        env_data = generate_environmental_data(weather, request.latitude, request.longitude)
        
        # Prepare location object
        location = {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "elevation": env_data.get("elevation", 100),
            "slope": env_data.get("slope", 0.02),
            "district": request.district or "Unknown",
            "distance_to_river": 500,  # Default value
            "drainage_density": 0.5,
            "urbanization": 0.3
        }
        
        # Prepare weather data for ensemble predictor
        rainfall_hourly = [env_data.get("rainfall_mm", 0) / 24] * 24  # Distribute daily to hourly
        weather_data = {
            "rainfall_hourly": rainfall_hourly,
            "discharge_hourly": [env_data.get("river_discharge", 150)] * 24,
            "humidity_hourly": [env_data.get("humidity", 70)] * 24,
            "soil_moisture": env_data.get("soil_moisture", 50)
        }
        
        # Run ensemble prediction
        prediction = ensemble_predictor.predict(
            location=location,
            weather_data=weather_data
        )
        
        # Add metadata
        prediction["location"] = {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "district": request.district,
            "state": request.state,
            "region_type": request.region_type
        }
        prediction["weather_source"] = weather.get("source", "unknown")
        prediction["api_version"] = "2.0"
        
        return {
            "success": True,
            "prediction": prediction
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/predict")
async def ensemble_flood_prediction_get(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    region_type: Optional[str] = Query("default")
):
    """GET endpoint for ensemble prediction"""
    request = FloodPredictionRequest(
        latitude=latitude,
        longitude=longitude,
        district=district,
        state=state,
        region_type=region_type
    )
    return await ensemble_flood_prediction(request)


@router.post("/anomaly")
async def check_anomalies(request: AnomalyCheckRequest):
    """
    Anomaly Detection for Early Warning
    
    Uses:
    - Isolation Forest for outlier detection
    - Autoencoder for pattern reconstruction
    
    Returns anomaly scores and early warning signals
    """
    try:
        # Fetch weather data
        weather = await fetch_weather_data(request.latitude, request.longitude)
        
        # Generate environmental data
        env_data = generate_environmental_data(weather, request.latitude, request.longitude)
        
        # Simulate time series data (24 hours of readings)
        # Format: Dict[feature_name, List[values]]
        time_series_dict: Dict[str, List[float]] = {
            "rainfall_hourly": [],
            "humidity": [],
            "temperature": [],
            "river_discharge": [],
            "water_level": [],
            "soil_moisture": []
        }
        
        base_data = env_data.copy()
        for i in range(request.time_window_hours):
            variation = (i % 6) / 6  # Diurnal variation
            time_series_dict["rainfall_hourly"].append(base_data["rainfall_mm"] * (0.8 + variation * 0.4) / 24)
            time_series_dict["humidity"].append(base_data["humidity"] + (i % 3 - 1) * 2)
            time_series_dict["temperature"].append(base_data["temperature"] + variation * 3)
            time_series_dict["river_discharge"].append(base_data["river_discharge"] * (0.9 + variation * 0.2))
            time_series_dict["water_level"].append(base_data["water_level"] + (i / 24) * 0.05)
            time_series_dict["soil_moisture"].append(base_data["soil_moisture"] + (i % 4) * 2)
        
        # Run anomaly detection
        result = anomaly_detector.detect(
            current_data=env_data,
            time_series=time_series_dict
        )
        
        # Add metadata
        result["location"] = {
            "latitude": request.latitude,
            "longitude": request.longitude
        }
        result["time_window_hours"] = request.time_window_hours
        result["timestamp"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "anomaly_result": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")


@router.get("/anomaly")
async def check_anomalies_get(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    time_window_hours: int = Query(24, ge=1, le=168)
):
    """GET endpoint for anomaly detection"""
    request = AnomalyCheckRequest(
        latitude=latitude,
        longitude=longitude,
        time_window_hours=time_window_hours
    )
    return await check_anomalies(request)


@router.post("/alerts/smart")
async def get_smart_alerts(request: FloodPredictionRequest):
    """
    ML-Triggered Smart Alerts
    
    Combines ensemble prediction + anomaly detection for intelligent alerts.
    NOT simple thresholds - uses multi-condition logic:
    
    IF flood_probability > 0.72
    AND anomaly_score > 0.6
    AND rainfall_forecast > 90th_percentile
    THEN Alert = "High Risk"
    """
    try:
        # Fetch weather data
        weather = await fetch_weather_data(request.latitude, request.longitude)
        
        # Generate environmental data
        env_data = generate_environmental_data(weather, request.latitude, request.longitude)
        
        # Prepare location and weather data for ensemble predictor
        location = {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "elevation": env_data.get("elevation", 100),
            "slope": env_data.get("slope", 0.02),
            "district": request.district or "Unknown",
            "distance_to_river": 500,
            "drainage_density": 0.5,
            "urbanization": 0.3
        }
        
        rainfall_hourly = [env_data.get("rainfall_mm", 0) / 24] * 24
        weather_data = {
            "rainfall_hourly": rainfall_hourly,
            "discharge_hourly": [env_data.get("river_discharge", 150)] * 24,
            "humidity_hourly": [env_data.get("humidity", 70)] * 24,
            "soil_moisture": env_data.get("soil_moisture", 50)
        }
        
        # Get ensemble prediction
        flood_prediction = ensemble_predictor.predict(
            location=location,
            weather_data=weather_data
        )
        
        # Simulate time series for anomaly detection (Dict[str, List[float]] format)
        time_series_dict: Dict[str, List[float]] = {
            "rainfall_hourly": [env_data.get("rainfall_mm", 0) / 24 * (0.9 + (i / 24) * 0.2) for i in range(24)],
            "humidity": [env_data.get("humidity", 70) + (i % 3 - 1) * 2 for i in range(24)],
            "temperature": [env_data.get("temperature", 25) + (i % 6) / 6 * 3 for i in range(24)],
            "river_discharge": [env_data.get("river_discharge", 150) * (0.9 + (i % 6) / 6 * 0.2) for i in range(24)],
            "water_level": [env_data.get("water_level", 0.5) + (i / 24) * 0.05 for i in range(24)],
            "soil_moisture": [env_data.get("soil_moisture", 50) + (i % 4) * 2 for i in range(24)]
        }
        
        # Get anomaly detection
        anomaly_result = anomaly_detector.detect(env_data, time_series_dict)
        
        # Update location object with all fields for alert generation
        location = {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "district": request.district or "Unknown",
            "state": request.state or "Unknown",
            "region_type": request.region_type or "default",
            "near_river": True  # Could be determined from GIS data
        }
        
        # Weather forecast for alert generation
        weather_forecast = {
            "rainfall_24h_forecast": weather["forecast"]["rainfall_24h_forecast"],
            "max_rainfall_intensity": weather["forecast"]["max_rainfall_intensity"]
        }
        
        # Generate smart alert
        alert = smart_alert_engine.generate_alert(
            location=location,
            flood_prediction=flood_prediction,
            anomaly_result=anomaly_result,
            weather_forecast=weather_forecast
        )
        
        return {
            "success": True,
            "alert": alert,
            "underlying_data": {
                "flood_prediction_summary": {
                    "probability": flood_prediction["ensemble_prediction"]["flood_probability"],
                    "confidence": flood_prediction["ensemble_prediction"]["confidence"],
                    "risk_level": flood_prediction["ensemble_prediction"]["risk_level"]
                },
                "anomaly_summary": {
                    "score": anomaly_result["combined_anomaly_score"],
                    "alert_level": anomaly_result["alert_level"],
                    "early_warnings_count": len(anomaly_result.get("early_warnings", []))
                }
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Smart alert generation failed: {str(e)}")


@router.get("/alerts/smart")
async def get_smart_alerts_get(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    region_type: Optional[str] = Query("default")
):
    """GET endpoint for smart alerts"""
    request = FloodPredictionRequest(
        latitude=latitude,
        longitude=longitude,
        district=district,
        state=state,
        region_type=region_type
    )
    return await get_smart_alerts(request)


@router.get("/alerts/active")
async def get_active_alerts(
    latitude: Optional[float] = Query(None, ge=-90, le=90),
    longitude: Optional[float] = Query(None, ge=-180, le=180)
):
    """Get all currently active alerts, optionally filtered by location"""
    location = None
    if latitude is not None and longitude is not None:
        location = {"latitude": latitude, "longitude": longitude}
    
    alerts = smart_alert_engine.get_active_alerts(location)
    
    return {
        "success": True,
        "active_alerts_count": len(alerts),
        "alerts": alerts
    }


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Acknowledge an alert"""
    success = smart_alert_engine.acknowledge_alert(alert_id)
    if success:
        return {"success": True, "message": f"Alert {alert_id} acknowledged"}
    raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")


@router.delete("/alerts/{alert_id}")
async def clear_alert(alert_id: str):
    """Clear/deactivate an alert"""
    success = smart_alert_engine.clear_alert(alert_id)
    if success:
        return {"success": True, "message": f"Alert {alert_id} cleared"}
    raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")


@router.get("/models/status")
async def get_model_status():
    """Get status of all ML models"""
    return {
        "success": True,
        "models": {
            "ensemble_predictor": {
                "status": "active",
                "components": {
                    "lstm_simulator": "ready",
                    "xgboost_simulator": "ready",
                    "gnn_simulator": "ready"
                },
                "weights": ensemble_predictor.weights
            },
            "anomaly_detector": {
                "status": "active",
                "components": {
                    "isolation_forest": "ready",
                    "autoencoder": "ready"
                }
            },
            "smart_alert_engine": {
                "status": "active",
                "active_alerts": len(smart_alert_engine.active_alerts),
                "thresholds": smart_alert_engine.thresholds
            }
        },
        "api_version": "2.0",
        "note": "This is a hackathon simulation. Production would use real trained models."
    }
