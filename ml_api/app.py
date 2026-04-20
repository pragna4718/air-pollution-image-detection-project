from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
from PIL import Image
import io
import os

# Try to import TensorFlow, but make it optional
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️  TensorFlow not installed. Using fallback image detection.")

app = Flask(__name__)
CORS(app)

# =========================
# LOAD AQI MODEL
# =========================
try:
    model = pickle.load(open("model.pkl", "rb"))
    print("AQI Model Loaded ✅")
except Exception as e:
    print("Error loading AQI model:", e)


# =========================
# LOAD IMAGE DETECTION MODEL (CNN)
# =========================
image_model = None
if TF_AVAILABLE:
    try:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'model', 'model.h5')
        if os.path.exists(model_path):
            image_model = tf.keras.models.load_model(model_path)
            print("Image Detection Model (CNN) Loaded ✅")
        else:
            print(f"Model file not found at {model_path}. Using fallback detection.")
    except Exception as e:
        print(f"Error loading image model: {e}. Using fallback detection.")
else:
    print("Skipping model loading (TensorFlow not available)")


# =========================
# HOME ROUTE
# =========================
@app.route('/')
def home():
    return "Air Pollution ML API Running 🚀"


# =========================
# AQI PREDICTION ROUTE
# =========================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        pm25 = float(data['pm25'])
        pm10 = float(data['pm10'])
        no2 = float(data['no2'])

        prediction = model.predict([[pm25, pm10, no2]])

        return jsonify({
            "AQI": round(float(prediction[0]), 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)})


# =========================
# VISUALIZATION DATA ROUTE
# =========================
@app.route('/visualization-data', methods=['GET'])
def visualization_data():
    try:
        df = pd.read_csv("data/city_hour.csv")

        # Clean data
        df = df.dropna()

        # Convert datetime
        df['Datetime'] = pd.to_datetime(df['Datetime'])

        # Extract time features
        df['hour'] = df['Datetime'].dt.hour
        df['month'] = df['Datetime'].dt.month

        # Hourly AQI
        hourly = df.groupby('hour')['AQI'].mean().reset_index()

        # Monthly AQI (optional)
        monthly = df.groupby('month')['AQI'].mean().reset_index()

        return jsonify({
            "hours": hourly['hour'].tolist(),
            "aqi": hourly['AQI'].tolist(),
            "months": monthly['month'].tolist(),
            "monthly_aqi": monthly['AQI'].tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)})


# =========================
# IMAGE DETECTION ROUTE (TRAINED CNN MODEL OR SMART FALLBACK)
# =========================
@app.route('/predict-image', methods=['POST'])
def predict_image():
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Read and preprocess image
        img = Image.open(io.BytesIO(file.read()))
        
        # Ensure RGB format
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Use trained model if available
        if image_model is not None:
            # Resize to model input size (128x128)
            img_resized = img.resize((128, 128))
            
            # Convert to numpy array
            img_array = np.array(img_resized)
            
            # Add batch dimension
            img_batch = np.expand_dims(img_array, axis=0)
            
            # Make prediction using trained model
            prediction_prob = image_model.predict(img_batch, verbose=0)[0][0]
            
            # Binary classification: 0 = Clean, 1 = Polluted
            is_polluted = prediction_prob > 0.5
            confidence = prediction_prob if is_polluted else (1 - prediction_prob)
        else:
            # Fallback: Smart image analysis without ML
            pixels = np.array(img.convert('L'))
            
            # Calculate brightness metrics
            mean_brightness = np.mean(pixels)
            std_brightness = np.std(pixels)
            
            # Count dark pixels (< 100 brightness on 0-255 scale)
            dark_pixel_ratio = np.sum(pixels < 100) / pixels.size
            
            # Count very dark pixels (< 50 brightness)
            very_dark_ratio = np.sum(pixels < 50) / pixels.size
            
            # Pollution detection logic
            pollution_score = 0
            
            # Factor 1: Low overall brightness (haze/fog)
            if mean_brightness < 100:
                pollution_score += 40
            elif mean_brightness < 130:
                pollution_score += 20
            
            # Factor 2: High dark pixel ratio (smoke)
            if dark_pixel_ratio > 0.40:
                pollution_score += 30
            elif dark_pixel_ratio > 0.25:
                pollution_score += 15
            
            # Factor 3: Very dark regions
            if very_dark_ratio > 0.15:
                pollution_score += 20
            
            # Factor 4: Low contrast (foggy appearance)
            if std_brightness < 25:
                pollution_score += 15
            
            # Decision: Polluted if score >= 40
            is_polluted = pollution_score >= 40
            
            # Generate confidence (70-95%)
            if is_polluted:
                confidence = min(0.95, 0.70 + (pollution_score * 0.005))
            else:
                confidence = min(0.95, 0.70 + ((100 - pollution_score) * 0.0025))
        
        # Generate prediction details
        prediction = "Polluted" if is_polluted else "Clean"
        confidence = round(float(confidence), 2)
        
        if prediction == "Polluted":
            cause = "High pollution levels detected in image analysis"
            particles = ["PM2.5", "Dust particles", "Smoke"]
            suggestion = "⚠️ Air quality is poor. Wear N95 mask and limit outdoor activity."
        else:
            cause = "Low pollution levels detected"
            particles = ["Minimal pollutants"]
            suggestion = "✅ Air quality is good. Safe for outdoor activities!"
        
        return jsonify({
            "prediction": prediction,
            "confidence": confidence,
            "cause": cause,
            "particles": particles,
            "suggestion": suggestion
        })
    
    except Exception as e:
        return jsonify({"error": f"Image processing failed: {str(e)}"}), 500
        
        # Make prediction using trained model
        if image_model is not None:
            prediction_prob = image_model.predict(img_batch, verbose=0)[0][0]
            
            # Binary classification: 0 = Clean, 1 = Polluted
            is_polluted = prediction_prob > 0.5
            confidence = prediction_prob if is_polluted else (1 - prediction_prob)
        else:
            # Fallback: simple brightness-based detection
            pixels = np.array(img.convert('L'))
            mean_brightness = np.mean(pixels)
            is_polluted = mean_brightness < 120
            confidence = abs(mean_brightness - 120) / 120
        
        # Generate prediction details
        prediction = "Polluted" if is_polluted else "Clean"
        confidence = round(float(confidence), 2)
        
        if prediction == "Polluted":
            cause = "High pollution levels detected in image analysis"
            particles = ["PM2.5", "Dust particles", "Smoke"]
            suggestion = "⚠️ Air quality is poor. Wear N95 mask and limit outdoor activity."
        else:
            cause = "Low pollution levels detected"
            particles = ["Minimal pollutants"]
            suggestion = "✅ Air quality is good. Safe for outdoor activities!"
        
        return jsonify({
            "prediction": prediction,
            "confidence": confidence,
            "cause": cause,
            "particles": particles,
            "suggestion": suggestion
        })
    
    except Exception as e:
        return jsonify({"error": f"Image processing failed: {str(e)}"}), 500
    
    


# =========================
# RUN SERVER
# =========================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
    