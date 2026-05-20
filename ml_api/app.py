from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import io
import os
from typing import List
from dotenv import load_dotenv

# Optional local image analysis fallback
try:
    from PIL import Image
except Exception:
    Image = None

# Google Cloud Vision client
try:
    from google.cloud import vision
except Exception:
    vision = None

try:
    import google.generativeai as genai
except Exception:
    genai = None
import json
import requests
import re

# Load environment variables from .env (if present)
load_dotenv()

# =========================
# CREATE FLASK APP
# =========================
app = Flask(__name__)
CORS(app)

# =========================
# LOAD AQI MODEL
# =========================
try:
    model = pickle.load(open("model.pkl", "rb"))
    print("AQI Model Loaded Successfully ✅")

except Exception as e:
    print("Error loading AQI model:", e)

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

        return jsonify({
            "error": str(e)
        })

# =========================
# VISUALIZATION DATA ROUTE
# =========================
@app.route('/visualization-data', methods=['GET'])
def visualization_data():

    try:

        df = pd.read_csv("data/city_hour.csv")

        df = df.dropna()

        df['Datetime'] = pd.to_datetime(df['Datetime'])

        df['hour'] = df['Datetime'].dt.hour
        df['month'] = df['Datetime'].dt.month

        hourly = df.groupby('hour')['AQI'].mean().reset_index()

        monthly = df.groupby('month')['AQI'].mean().reset_index()

        return jsonify({

            "hours": hourly['hour'].tolist(),
            "aqi": hourly['AQI'].tolist(),

            "months": monthly['month'].tolist(),
            "monthly_aqi": monthly['AQI'].tolist()
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })

# =========================
# IMAGE DETECTION ROUTE
# =========================

def _local_image_analysis(image_bytes):
    if Image is None:
        return None
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        np_img = np.array(image)
        if np_img.size == 0:
            return None

        avg_brightness = float(np.mean(np_img))
        channels = np_img.reshape(-1, 3)
        color_diff = np.mean(np.abs(channels[:, 0:1] - channels[:, 1:2]) + np.abs(channels[:, 1:2] - channels[:, 2:3]))
        gray_ratio = float(np.mean(np.all(np.abs(np_img[:, :, :2] - np_img[:, :, 1:3]) < 24, axis=-1)))
        dark_ratio = float(np.mean(np.mean(np_img, axis=2) < 90))

        particles = []
        cause_texts = []
        indicators = []

        if avg_brightness < 100 and gray_ratio > 0.35:
            indicators.append(('Haze', 0.6))
            particles.append('Haze')
            cause_texts.append('Low brightness with grayish tones suggests haze or smoke')
        if dark_ratio > 0.20:
            indicators.append(('Smog', 0.55))
            particles.append('Smog')
            cause_texts.append('A large dark area may indicate polluted sky or smoke')

        prediction = 'Polluted' if indicators else 'Clean'
        confidence = round(float(np.mean([score for (_, score) in indicators])) if indicators else 0.35, 2)
        if confidence < 0.35:
            confidence = 0.35

        cause = (
            f"Detected visual clues: {', '.join(list(dict.fromkeys(cause_texts))[:3])}."
            if cause_texts else 'No dominant pollution artifacts were detected visually.'
        )
        suggestion = (
            'Limit outdoor exposure, wear a mask, and avoid smoky or dusty environments.'
            if prediction == 'Polluted' else
            'Air looks relatively clear visually; continue monitoring AQI for precision.'
        )

        return {
            'prediction': prediction,
            'confidence': confidence,
            'cause': cause,
            'particles': list(dict.fromkeys(particles)),
            'suggestion': suggestion
        }
    except Exception:
        return None


@app.route('/predict-image', methods=['POST'])
def predict_image():

    # This endpoint accepts an uploaded image file under form key 'file'.
    # It uses Google Cloud Vision when available, otherwise it falls back to a
    # lightweight local analysis using Pillow.
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({"error": "No file uploaded (use form key 'file')."}), 400

        image_bytes = file.read()

        if vision is None:
            fallback = _local_image_analysis(image_bytes)
            if fallback is not None:
                return jsonify(fallback)
            return jsonify({"error": "google-cloud-vision is not installed or available, and no local fallback could be performed."}), 500

        # Create Vision client (uses GOOGLE_APPLICATION_CREDENTIALS env var)
        try:
            client = vision.ImageAnnotatorClient()
        except Exception as e:
            print('Vision client init error:', e)
            fallback = _local_image_analysis(image_bytes)
            if fallback is not None:
                return jsonify(fallback)
            return jsonify({"error": "Failed to initialize Google Vision client. Check your credentials and GOOGLE_APPLICATION_CREDENTIALS."}), 500

        image = vision.Image(content=image_bytes)

        # Call multiple detectors
        labels_response = client.label_detection(image=image)
        objects_response = client.object_localization(image=image)
        safe_search = client.safe_search_detection(image=image)
        props = client.image_properties(image=image)

        labels = [(l.description.lower(), l.score) for l in (labels_response.label_annotations or [])]
        objects = [o.name.lower() for o in (objects_response.localized_object_annotations or [])]

        # Image properties — e.g., dominant colors (useful for haze detection)
        dominant_colors = []
        if props and props.image_properties_annotation and props.image_properties_annotation.dominant_colors:
            for col in props.image_properties_annotation.dominant_colors.colors:
                rgb = (col.color.red, col.color.green, col.color.blue)
                dominant_colors.append({'rgb': rgb, 'score': col.score})

        # Safe search info
        safe = {}
        if safe_search and safe_search.safe_search_annotation:
            s = safe_search.safe_search_annotation
            safe = {
                'adult': s.adult,
                'spoof': s.spoof,
                'medical': s.medical,
                'violence': s.violence,
                'racy': s.racy
            }

        # Heuristic rules to extract pollution indicators
        indicators = []
        particles = set()
        cause_texts = []

        # Match keywords in labels and objects
        keyword_map = {
            'smoke': 'Smoke',
            'smog': 'Smog',
            'haze': 'Haze',
            'ash': 'Ash',
            'dust': 'Dust',
            'fog': 'Fog',
            'fire': 'Fire',
            'chimney': 'Industrial emissions',
            'vehicle': 'Vehicle emissions',
            'car': 'Vehicle emissions',
            'truck': 'Vehicle emissions',
            'factory': 'Industrial emissions',
            'construction': 'Construction dust'
        }

        # Check labels
        for desc, score in labels:
            for k, particle_name in keyword_map.items():
                if k in desc:
                    indicators.append((particle_name, score))
                    particles.add(particle_name)
                    cause_texts.append(desc)

        # Check localized objects
        for o in objects:
            for k, particle_name in keyword_map.items():
                if k in o:
                    indicators.append((particle_name, 0.8))
                    particles.add(particle_name)
                    cause_texts.append(o)

        # Use dominant color analysis to guess haze (high gray/low contrast -> haze)
        if dominant_colors:
            # compute average brightness
            avg_brightness = 0.0
            total_weight = 0.0
            for c in dominant_colors:
                r, g, b = c['rgb']
                lum = 0.2126 * (r or 0) + 0.7152 * (g or 0) + 0.0722 * (b or 0)
                avg_brightness += lum * c['score']
                total_weight += c['score']
            if total_weight > 0:
                avg_brightness = avg_brightness / total_weight
                # low contrast / mid brightness may indicate haze
                if 40 < avg_brightness < 200:
                    # add a mild haze indicator
                    particles.add('Haze')
                    indicators.append(('Haze', 0.45))

        # If no explicit indicators found, look for generic pollution labels
        if not indicators:
            for desc, score in labels:
                if 'pollution' in desc or 'air' in desc and score > 0.6:
                    indicators.append(('General pollution', score))
                    particles.add('General pollutants')
                    cause_texts.append(desc)

        # Confidence calculation: combine indicator scores
        if indicators:
            avg_score = float(np.mean([s for (_, s) in indicators]))
            confidence = max(0.0, min(1.0, avg_score))
        else:
            confidence = 0.35

        prediction = 'Polluted' if confidence >= 0.5 or len(particles) > 0 else 'Clean'

        # Build a human-friendly cause string
        if cause_texts:
            cause = f"Detected visual clues: {', '.join(list(dict.fromkeys(cause_texts))[:5])}."
        else:
            cause = 'No dominant pollution sources were visually detected.'

        suggestion = ''
        if prediction == 'Polluted':
            suggestion = 'Limit outdoor exposure, use a mask, and avoid nearby sources (vehicles, fires, construction). Consider checking AQI from the dashboard.'
        else:
            suggestion = 'Air appears clear visually. Continue monitoring AQI for more precise measurements.'

        result_payload = {
            'prediction': prediction,
            'confidence': round(float(confidence), 2),
            'cause': cause,
            'particles': list(particles),
            'suggestion': suggestion
        }

        # If Gemini (Generative AI) is available, attempt to refine the response
        GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
        if GEMINI_API_KEY:
            # Build context text
            context = {
                'labels': labels,
                'objects': objects,
                'dominant_colors': dominant_colors,
                'indicators': indicators,
                'safe_search': safe
            }

            # Build a strict prompt requesting only a single JSON object with exact schema.
            prompt_text = (
                "You are an assistant that analyzes environmental images.\n"
                "Given the vision analysis data provided, produce ONLY a single JSON object with EXACTLY these keys: \n"
                "- prediction: either \"Clean\" or \"Polluted\" (string)\n"
                "- confidence: number between 0.0 and 1.0 (float)\n"
                "- cause: short string describing the most likely cause(s)\n"
                "- particles: array of short strings (e.g. [\"Smoke\", \"Dust\"])\n"
                "- suggestion: short actionable suggestion string\n\n"
                "Return no other text, commentary, or explanation. Return a single valid JSON object.\n\n"
                "Example output exactly like this (use same keys and types):\n"
                "{\n  \"prediction\": \"Polluted\",\n  \"confidence\": 0.87,\n  \"cause\": \"Smoke and vehicle emissions\",\n  \"particles\": [\"Smoke\", \"Dust\"],\n  \"suggestion\": \"Limit outdoor exposure and wear a mask.\"\n}\n\n"
                f"Vision outputs (JSON):\n{json.dumps(context, default=str)}\n"
            )

            # Try native client first
            if genai is not None:
                try:
                    genai.configure(api_key=GEMINI_API_KEY)
                    resp = genai.generate_text(model="models/text-bison-001", prompt=prompt_text)
                    text = getattr(resp, 'text', None) or (resp.get('content') if isinstance(resp, dict) else None)
                    if not text:
                        text = str(resp)
                except Exception as e:
                    print('Gemini client error:', e)
                    text = None
            else:
                text = None

            # REST fallback using requests (if client unavailable or failed)
            if not text:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key={GEMINI_API_KEY}"
                    body = {
                        'prompt': {'text': prompt_text},
                        'temperature': 0.0,
                        'maxOutputTokens': 300
                    }
                    r = requests.post(url, json=body, timeout=20)
                    if r.status_code == 200:
                        j = r.json()
                        # look for candidate output fields
                        text = None
                        if isinstance(j, dict):
                            if 'candidates' in j and isinstance(j['candidates'], list) and len(j['candidates']) > 0:
                                # support different response formats
                                cand = j['candidates'][0]
                                text = cand.get('output') or cand.get('content') or cand.get('text')
                            elif 'output' in j and isinstance(j['output'], list) and len(j['output']) > 0:
                                text = j['output'][0].get('content')
                            else:
                                text = j.get('candidates', [{}])[0].get('content') if j.get('candidates') else None
                    else:
                        print('Gemini REST error:', r.status_code, r.text)
                except Exception as e:
                    print('Gemini REST exception:', e)

            # If we got text, try to parse JSON inside it and validate
            if text:
                try:
                    m = re.search(r"\{[\s\S]*\}", text, re.S)
                    if m:
                        parsed = json.loads(m.group(0))

                        # Validate and normalize parsed result
                        def valid_result(d):
                            try:
                                if not isinstance(d, dict):
                                    return False
                                # required keys
                                for k in ('prediction', 'confidence', 'cause', 'particles', 'suggestion'):
                                    if k not in d:
                                        return False
                                # prediction
                                if not isinstance(d['prediction'], str) or d['prediction'] not in ('Clean', 'Polluted'):
                                    return False
                                # confidence -> float 0.0-1.0
                                conf = float(d['confidence'])
                                if conf > 1 and conf <= 100:
                                    conf = conf / 100.0
                                if not (0.0 <= conf <= 1.0):
                                    return False
                                # particles -> list of strings
                                if not isinstance(d['particles'], list):
                                    return False
                                for p in d['particles']:
                                    if not isinstance(p, str):
                                        return False
                                # cause and suggestion strings
                                if not isinstance(d['cause'], str) or not isinstance(d['suggestion'], str):
                                    return False
                                # normalize confidence
                                d['confidence'] = round(float(conf), 2)
                                # dedupe particles and trim
                                d['particles'] = list(dict.fromkeys([p.strip() for p in d['particles'] if p and isinstance(p, str)]) )
                                return True
                            except Exception:
                                return False

                        if valid_result(parsed):
                            return jsonify(parsed)
                except Exception as e:
                    print('Gemini parse error:', e)

        return jsonify(result_payload)

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

# =========================
# AI CHATBOT ROUTE
# =========================
@app.route('/chat', methods=['POST'])
def chat():

    try:

        data = request.json

        user_message = data.get("message", "")

        user_message_lower = user_message.lower()

        if "pollution" in user_message_lower:

            response = "Air pollution is mainly caused by vehicle emissions, industrial smoke, construction dust, and burning of waste materials."

        elif "aqi" in user_message_lower:

            response = "AQI stands for Air Quality Index. Lower AQI values indicate cleaner air while higher AQI values indicate unhealthy pollution."

        elif "pm2.5" in user_message_lower:

            response = "PM2.5 are tiny particulate pollutants that can enter the lungs and affect human health."

        elif "weather" in user_message_lower:

            response = "Weather conditions such as humidity, wind speed, and temperature can affect pollution levels."

        elif "hello" in user_message_lower or "hi" in user_message_lower:

            response = "Hello 👋 I am your AI environmental assistant. Ask me anything about pollution, AQI, weather, gases, or environment."

        else:

            response = f"You asked: '{user_message}'. I can help with air pollution analysis, AQI, gases, weather, environmental safety, and pollution monitoring."

        return jsonify({
            "reply": response
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })

# =========================
# RUN SERVER
# =========================
if __name__ == '__main__':

    app.run(debug=True, port=5000)