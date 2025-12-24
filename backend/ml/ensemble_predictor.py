"""
Ensemble Flood Predictor - Multi-Model ML System
Combines LSTM (time-series), XGBoost (tabular), and rule-based predictions
for robust flood forecasting with confidence scoring
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import math

class LSTMSimulator:
    """
    Simulates LSTM time-series flood prediction
    In production: Replace with TensorFlow/PyTorch LSTM model
    Trained on: GloFAS, NOAA River Gauge Data
    """
    
    def __init__(self):
        self.model_name = "LSTM-Flood-v2.1"
        self.sequence_length = 72  # 72 hours lookback
        
    def predict(self, rainfall_series: List[float], discharge_series: List[float],
                humidity_series: List[float]) -> Dict:
        """
        Predict flood probability using time-series patterns
        
        Args:
            rainfall_series: Hourly rainfall (mm) for past 72 hours
            discharge_series: River discharge readings
            humidity_series: Humidity readings
            
        Returns:
            Dict with probabilities for 6h, 12h, 24h horizons
        """
        # Simulate LSTM temporal pattern detection
        if len(rainfall_series) < 24:
            rainfall_series = [0] * 24
            
        # Feature extraction (simulating LSTM hidden states)
        rainfall_trend = self._calculate_trend(rainfall_series[-24:])
        rainfall_intensity = max(rainfall_series[-6:]) if rainfall_series else 0
        cumulative_24h = sum(rainfall_series[-24:]) if len(rainfall_series) >= 24 else 0
        cumulative_72h = sum(rainfall_series) if rainfall_series else 0
        
        # LSTM-style temporal weighting
        recent_weight = 0.6
        historical_weight = 0.4
        
        # Base probability from rainfall patterns
        base_prob = min(1.0, (
            (rainfall_intensity / 50) * 0.3 +  # Intensity factor
            (cumulative_24h / 150) * 0.4 +     # 24h accumulation
            (rainfall_trend + 1) * 0.15 +       # Trend factor
            (cumulative_72h / 400) * 0.15       # 72h context
        ))
        
        # Discharge influence (if available)
        if discharge_series and len(discharge_series) > 0:
            discharge_factor = min(1.0, max(discharge_series[-6:]) / 1000)
            base_prob = base_prob * 0.7 + discharge_factor * 0.3
        
        # Time-decay for different horizons
        prob_6h = min(0.95, base_prob * 1.2)   # Near-term highest confidence
        prob_12h = min(0.95, base_prob * 1.0)  # Medium-term
        prob_24h = min(0.95, base_prob * 0.85) # Longer-term more uncertain
        
        return {
            "model": self.model_name,
            "predictions": {
                "6h": round(prob_6h, 3),
                "12h": round(prob_12h, 3),
                "24h": round(prob_24h, 3)
            },
            "features_used": {
                "rainfall_trend": round(rainfall_trend, 3),
                "rainfall_intensity_mm": round(rainfall_intensity, 1),
                "cumulative_24h_mm": round(cumulative_24h, 1),
                "cumulative_72h_mm": round(cumulative_72h, 1)
            },
            "confidence": round(0.75 + (len(rainfall_series) / 72) * 0.15, 2)
        }
    
    def _calculate_trend(self, series: List[float]) -> float:
        """Calculate trend (-1 to 1) using simple linear regression"""
        if len(series) < 2:
            return 0.0
        n = len(series)
        x_mean = (n - 1) / 2
        y_mean = sum(series) / n
        
        numerator = sum((i - x_mean) * (y - y_mean) for i, y in enumerate(series))
        denominator = sum((i - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            return 0.0
        slope = numerator / denominator
        
        # Normalize to -1 to 1 range
        return max(-1, min(1, slope / 5))


class XGBoostSimulator:
    """
    Simulates XGBoost gradient boosting for risk classification
    In production: Replace with trained XGBoost model
    Features: Structured tabular data, handles missing values well
    """
    
    def __init__(self):
        self.model_name = "XGBoost-FloodRisk-v3.0"
        self.risk_classes = ["Low", "Medium", "High", "Severe"]
        
    def predict(self, features: Dict) -> Dict:
        """
        Classify flood risk level using tabular features
        
        Args:
            features: Dict with rainfall, soil_moisture, elevation, etc.
            
        Returns:
            Risk classification with probabilities
        """
        # Extract features with defaults
        rainfall_24h = features.get("rainfall_24h", 0)
        rainfall_intensity = features.get("rainfall_intensity", 0)
        soil_moisture = features.get("soil_moisture", 50)
        elevation = features.get("elevation", 100)
        slope = features.get("slope", 5)
        distance_to_river = features.get("distance_to_river", 1000)
        historical_flood_freq = features.get("historical_flood_freq", 0.1)
        drainage_density = features.get("drainage_density", 0.5)
        urbanization = features.get("urbanization", 0.3)
        
        # XGBoost-style feature importance weighting
        weights = {
            "rainfall_24h": 0.25,
            "rainfall_intensity": 0.20,
            "soil_moisture": 0.15,
            "elevation": 0.10,
            "distance_to_river": 0.12,
            "historical_flood_freq": 0.10,
            "drainage_density": 0.05,
            "urbanization": 0.03
        }
        
        # Calculate weighted risk score
        risk_score = (
            min(1, rainfall_24h / 100) * weights["rainfall_24h"] +
            min(1, rainfall_intensity / 30) * weights["rainfall_intensity"] +
            (soil_moisture / 100) * weights["soil_moisture"] +
            max(0, 1 - elevation / 500) * weights["elevation"] +
            max(0, 1 - distance_to_river / 2000) * weights["distance_to_river"] +
            historical_flood_freq * weights["historical_flood_freq"] +
            drainage_density * weights["drainage_density"] +
            urbanization * weights["urbanization"]
        )
        
        # Convert to class probabilities (simulating softmax output)
        if risk_score < 0.25:
            probs = [0.7, 0.2, 0.08, 0.02]
            risk_class = "Low"
        elif risk_score < 0.5:
            probs = [0.2, 0.55, 0.2, 0.05]
            risk_class = "Medium"
        elif risk_score < 0.75:
            probs = [0.05, 0.2, 0.55, 0.2]
            risk_class = "High"
        else:
            probs = [0.02, 0.08, 0.25, 0.65]
            risk_class = "Severe"
        
        # Calculate SHAP-like feature importance
        feature_importance = self._calculate_shap_values(features, weights, risk_score)
        
        return {
            "model": self.model_name,
            "risk_class": risk_class,
            "risk_score": round(risk_score, 3),
            "class_probabilities": {
                cls: round(prob, 3) for cls, prob in zip(self.risk_classes, probs)
            },
            "feature_importance": feature_importance,
            "confidence": round(max(probs), 2)
        }
    
    def _calculate_shap_values(self, features: Dict, weights: Dict, 
                                base_score: float) -> Dict:
        """Calculate SHAP-like feature attribution values"""
        shap_values = {}
        
        for feature, weight in weights.items():
            if feature in features:
                value = features[feature]
                # Simplified SHAP: contribution = normalized_value * weight
                if feature == "rainfall_24h":
                    contribution = min(1, value / 100) * weight
                elif feature == "rainfall_intensity":
                    contribution = min(1, value / 30) * weight
                elif feature == "soil_moisture":
                    contribution = (value / 100) * weight
                elif feature == "elevation":
                    contribution = max(0, 1 - value / 500) * weight
                elif feature == "distance_to_river":
                    contribution = max(0, 1 - value / 2000) * weight
                else:
                    contribution = value * weight
                
                shap_values[feature] = round(contribution, 4)
        
        return dict(sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True))


class GNNSimulator:
    """
    Simulates Graph Neural Network for river network analysis
    Models river systems as graphs: nodes = stations, edges = flow direction
    Unique feature for hackathon differentiation
    """
    
    def __init__(self):
        self.model_name = "GNN-RiverNetwork-v1.0"
        
    def predict(self, upstream_data: List[Dict], downstream_location: Dict) -> Dict:
        """
        Predict flood propagation through river network
        
        Args:
            upstream_data: List of upstream station readings
            downstream_location: Target location for prediction
            
        Returns:
            Propagation probability and timing estimates
        """
        if not upstream_data:
            return {
                "model": self.model_name,
                "propagation_probability": 0.0,
                "estimated_arrival": None,
                "confidence": 0.3,
                "message": "No upstream data available"
            }
        
        # Simulate message passing in GNN
        max_upstream_risk = max(s.get("flood_risk", 0) for s in upstream_data)
        avg_upstream_risk = sum(s.get("flood_risk", 0) for s in upstream_data) / len(upstream_data)
        
        # Distance-based attenuation
        distances = [s.get("distance_km", 50) for s in upstream_data]
        min_distance = min(distances) if distances else 50
        
        # River flow velocity estimation (km/h)
        flow_velocity = 5  # Average river flow
        
        # Propagation probability with distance decay
        decay_factor = math.exp(-min_distance / 100)
        propagation_prob = (max_upstream_risk * 0.6 + avg_upstream_risk * 0.4) * decay_factor
        
        # Estimate arrival time
        arrival_hours = min_distance / flow_velocity if flow_velocity > 0 else None
        
        return {
            "model": self.model_name,
            "propagation_probability": round(min(0.95, propagation_prob), 3),
            "estimated_arrival_hours": round(arrival_hours, 1) if arrival_hours else None,
            "upstream_stations_analyzed": len(upstream_data),
            "max_upstream_risk": round(max_upstream_risk, 3),
            "confidence": round(0.6 + (len(upstream_data) / 10) * 0.2, 2),
            "graph_features": {
                "nodes_analyzed": len(upstream_data) + 1,
                "min_distance_km": round(min_distance, 1),
                "flow_velocity_kmh": flow_velocity
            }
        }


class EnsembleFloodPredictor:
    """
    Main Ensemble Predictor combining LSTM, XGBoost, and GNN
    Implements weighted voting and confidence calibration
    """
    
    def __init__(self):
        self.lstm = LSTMSimulator()
        self.xgboost = XGBoostSimulator()
        self.gnn = GNNSimulator()
        
        # Model weights (can be tuned based on validation performance)
        self.weights = {
            "lstm": 0.40,      # Strong on temporal patterns
            "xgboost": 0.45,   # Strong on structured features
            "gnn": 0.15        # Spatial river network context
        }
        
    def predict(self, 
                location: Dict,
                weather_data: Dict,
                historical_data: Optional[Dict] = None,
                river_network: Optional[List[Dict]] = None) -> Dict:
        """
        Generate ensemble flood prediction
        
        Args:
            location: {latitude, longitude, elevation, district}
            weather_data: Current and forecasted weather
            historical_data: Historical flood events
            river_network: Upstream station data for GNN
            
        Returns:
            Comprehensive flood prediction with confidence
        """
        timestamp = datetime.now().isoformat()
        
        # Prepare time-series data for LSTM
        rainfall_series = weather_data.get("rainfall_hourly", [0] * 24)
        discharge_series = weather_data.get("discharge_hourly", [])
        humidity_series = weather_data.get("humidity_hourly", [])
        
        # Get LSTM predictions
        lstm_result = self.lstm.predict(rainfall_series, discharge_series, humidity_series)
        
        # Prepare tabular features for XGBoost
        xgb_features = {
            "rainfall_24h": sum(rainfall_series[-24:]) if len(rainfall_series) >= 24 else sum(rainfall_series),
            "rainfall_intensity": max(rainfall_series[-6:]) if rainfall_series else 0,
            "soil_moisture": weather_data.get("soil_moisture", 50),
            "elevation": location.get("elevation", 100),
            "slope": location.get("slope", 5),
            "distance_to_river": location.get("distance_to_river", 1000),
            "historical_flood_freq": historical_data.get("flood_frequency", 0.1) if historical_data else 0.1,
            "drainage_density": location.get("drainage_density", 0.5),
            "urbanization": location.get("urbanization", 0.3)
        }
        
        # Get XGBoost predictions
        xgb_result = self.xgboost.predict(xgb_features)
        
        # Get GNN predictions (if river network data available)
        gnn_result = self.gnn.predict(river_network or [], location)
        
        # Ensemble combination
        ensemble_prob_24h = (
            lstm_result["predictions"]["24h"] * self.weights["lstm"] +
            xgb_result["risk_score"] * self.weights["xgboost"] +
            gnn_result["propagation_probability"] * self.weights["gnn"]
        )
        
        # Determine risk level
        if ensemble_prob_24h >= 0.75:
            risk_level = "Severe"
        elif ensemble_prob_24h >= 0.50:
            risk_level = "High"
        elif ensemble_prob_24h >= 0.25:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        # Calculate ensemble confidence
        model_confidences = [
            lstm_result["confidence"],
            xgb_result["confidence"],
            gnn_result["confidence"]
        ]
        
        # Agreement-based confidence boost
        predictions = [
            lstm_result["predictions"]["24h"],
            xgb_result["risk_score"],
            gnn_result["propagation_probability"]
        ]
        prediction_std = np.std(predictions)
        agreement_bonus = max(0, 0.15 - prediction_std)
        
        ensemble_confidence = (
            sum(c * w for c, w in zip(model_confidences, self.weights.values())) +
            agreement_bonus
        )
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            lstm_result, xgb_result, gnn_result, 
            ensemble_prob_24h, risk_level
        )
        
        return {
            "timestamp": timestamp,
            "location": location,
            "ensemble_prediction": {
                "flood_probability": round(ensemble_prob_24h, 3),
                "risk_level": risk_level,
                "confidence": round(min(0.95, ensemble_confidence), 2),
                "predictions_by_horizon": {
                    "6h": round(lstm_result["predictions"]["6h"] * 0.9 + xgb_result["risk_score"] * 0.1, 3),
                    "12h": round(lstm_result["predictions"]["12h"] * 0.7 + xgb_result["risk_score"] * 0.3, 3),
                    "24h": round(ensemble_prob_24h, 3)
                }
            },
            "model_outputs": {
                "lstm": lstm_result,
                "xgboost": xgb_result,
                "gnn": gnn_result
            },
            "reasoning": reasoning,
            "recommended_actions": self._get_recommended_actions(risk_level, ensemble_prob_24h),
            "uncertainty": {
                "model_disagreement": round(prediction_std, 3),
                "data_quality_score": round(self._assess_data_quality(weather_data), 2),
                "limitations": self._get_limitations(weather_data, river_network)
            }
        }
    
    def _generate_reasoning(self, lstm: Dict, xgb: Dict, gnn: Dict,
                           prob: float, risk: str) -> str:
        """Generate human-readable explanation of the prediction"""
        reasons = []
        
        # LSTM insights
        if lstm["predictions"]["24h"] > 0.5:
            reasons.append(f"Time-series analysis shows elevated rainfall pattern with {lstm['features_used']['cumulative_24h_mm']}mm in 24h")
        
        # XGBoost insights
        top_features = list(xgb["feature_importance"].items())[:3]
        if top_features:
            feature_str = ", ".join([f"{k}: {v:.2f}" for k, v in top_features])
            reasons.append(f"Key risk factors: {feature_str}")
        
        # GNN insights
        if gnn["propagation_probability"] > 0.3:
            reasons.append(f"Upstream flood risk detected, potential arrival in {gnn.get('estimated_arrival_hours', 'N/A')} hours")
        
        # Overall summary
        if not reasons:
            reasons.append("Current conditions indicate normal flood risk levels")
        
        return " | ".join(reasons)
    
    def _get_recommended_actions(self, risk_level: str, probability: float) -> List[str]:
        """Generate risk-appropriate recommendations"""
        actions = {
            "Severe": [
                "🚨 IMMEDIATE: Evacuate to designated safe zones",
                "🏥 Prepare emergency medical supplies",
                "📱 Keep emergency contacts accessible",
                "🚗 Clear evacuation routes",
                "💧 Move to higher ground immediately"
            ],
            "High": [
                "⚠️ Monitor official alerts continuously",
                "🎒 Prepare emergency go-bag",
                "📍 Identify nearest evacuation centers",
                "🔌 Charge all communication devices",
                "💊 Stock essential medications"
            ],
            "Medium": [
                "📻 Stay tuned to weather updates",
                "🏠 Secure outdoor items",
                "📋 Review family emergency plan",
                "🔦 Check emergency supplies",
                "🚰 Store drinking water"
            ],
            "Low": [
                "✅ Normal precautions apply",
                "📱 Keep weather app notifications on",
                "🗓️ Be aware of seasonal patterns"
            ]
        }
        return actions.get(risk_level, actions["Low"])
    
    def _assess_data_quality(self, weather_data: Dict) -> float:
        """Assess input data quality for uncertainty estimation"""
        score = 0.5  # Base score
        
        if weather_data.get("rainfall_hourly"):
            score += 0.2
        if weather_data.get("discharge_hourly"):
            score += 0.15
        if weather_data.get("soil_moisture"):
            score += 0.1
        if len(weather_data.get("rainfall_hourly", [])) >= 72:
            score += 0.05
            
        return min(1.0, score)
    
    def _get_limitations(self, weather_data: Dict, river_network: Optional[List]) -> List[str]:
        """Identify data limitations for transparency"""
        limitations = []
        
        if not weather_data.get("discharge_hourly"):
            limitations.append("River discharge data not available")
        if not river_network:
            limitations.append("Upstream station network data limited")
        if len(weather_data.get("rainfall_hourly", [])) < 48:
            limitations.append("Limited historical rainfall data (<48 hours)")
        if not weather_data.get("soil_moisture"):
            limitations.append("Soil moisture data estimated")
            
        return limitations if limitations else ["Data coverage adequate for prediction"]
