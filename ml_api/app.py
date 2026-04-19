from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os

app = Flask(__name__)
CORS(app)  # allow frontend connection

# -------------------------------
# LOAD TRAINED MODEL
# -------------------------------
# model = joblib.load("model.pkl")  # Commented out for visualization only

# -------------------------------
# HOME ROUTE
# -------------------------------
@app.route('/')
def home():
    return "ML API is running 🚀"

# -------------------------------
# VISUALIZATION DATA ROUTE
# -------------------------------
@app.route('/visualization-data', methods=['GET'])
def visualization_data():
    df = pd.read_csv("data/air_quality.csv")

    df['Date'] = pd.to_datetime(df['Date'])
    df['month'] = df['Date'].dt.month
    df['hour'] = df['Date'].dt.hour

    payload = {
        "aqi": df['AQI'].tolist(),
        "months": df['month'].tolist(),
        "hours": df['hour'].tolist(),
    }

    if 'Temperature' in df.columns:
        payload['temperature'] = df['Temperature'].tolist()
    if 'Humidity' in df.columns:
        payload['humidity'] = df['Humidity'].tolist()
    if 'Wind Speed' in df.columns:
        payload['wind_speed'] = df['Wind Speed'].tolist()

    return jsonify(payload)

# -------------------------------
# PREDICTION ROUTE (REAL MODEL)
# -------------------------------
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    temperature = data.get('temperature')
    humidity = data.get('humidity')
    wind_speed = data.get('wind_speed')

    features = [[temperature, humidity, wind_speed]]

    prediction = model.predict(features)

    return jsonify({
        "AQI_prediction": float(prediction[0])
    })

# -------------------------------
# IMAGE DETECTION ROUTE (PLACEHOLDER)
# -------------------------------
@app.route('/predict-image', methods=['POST'])
def predict_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    # For now, dummy response (replace later with CNN)
    return jsonify({
        "prediction": "Polluted Air (Demo)"
    })

# -------------------------------
# RUN SERVER
# -------------------------------
if __name__ == '__main__':
    app.run(debug=True)