import sys
import requests
import json

if len(sys.argv) < 2:
    print("Usage: python test_predict_image.py /path/to/image.jpg")
    sys.exit(1)

image_path = sys.argv[1]
url = 'http://127.0.0.1:5000/predict-image'

with open(image_path, 'rb') as f:
    files = {'file': (image_path, f, 'image/jpeg')}
    try:
        r = requests.post(url, files=files, timeout=30)
        print('STATUS', r.status_code)
        try:
            print(json.dumps(r.json(), indent=2))
        except Exception:
            print(r.text)
    except Exception as e:
        print('ERROR', e)
