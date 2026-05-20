# ML API

This directory contains the Flask backend for the air pollution image detection feature.

## Setup

1. Create a Python virtual environment:

```bash
python -m venv .venv
```

2. Activate the virtual environment:

```powershell
.venv\Scripts\Activate.ps1
```

3. Install required packages:

```bash
pip install -r ../requirements.txt
```

4. Create a `.env` file from the example:

```bash
copy .env.example .env
```

5. Add your Gemini API key to `.env`:

```text
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

## Running

Start the Flask server:

```bash
python app.py
```

The server runs on `http://127.0.0.1:5000`.

## Image detection endpoint

POST an image file to `/predict-image` using form field `file`.

Example:

```bash
curl -X POST -F "file=@/path/to/image.jpg" http://127.0.0.1:5000/predict-image
```

Expected JSON response:

```json
{
  "prediction": "Clean",
  "confidence": 0.85,
  "cause": "Smoke and vehicle emissions",
  "particles": ["Smoke", "Dust"],
  "suggestion": "Limit outdoor exposure and wear a mask."
}
```

## Notes

- The server uses Google Cloud Vision to analyze the image.
- If `GEMINI_API_KEY` is configured, it will also attempt to refine the output with Gemini.
- If Gemini is unavailable or returns invalid JSON, the server falls back to the Vision-based heuristic.
- Do not commit `.env` to source control.
