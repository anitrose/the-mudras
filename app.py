from flask import Flask, render_template, Response, jsonify, request
import cv2
import numpy as np
import pickle
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from collections import deque, Counter
from flask_cors import CORS
import csv
import os
from flask import send_from_directory

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "http://127.0.0.1:8080"]}})

# Load classifier
with open('models/mudra_classifier.pkl', 'rb') as f:
    model = pickle.load(f)

# Setup MediaPipe
base_options = python.BaseOptions(model_asset_path='hand_landmarker.task')
options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=1)
detector = vision.HandLandmarker.create_from_options(options)

mudra_info = {
    'Pathaka': 'Flag | Used for: stop, cloud, forest, river',
    'Alapadmam': 'Bloomed Lotus | Used for: beauty, moon, breasts',
    'Katrimukha': 'Scissors | Used for: cutting, separation, slender',
    'Mrigasirsha': 'Deer Head | Used for: deer, calling someone',
    'Mushti': 'Fist | Used for: holding, strength, wrestling',
    'Sikharam': 'Peak | Used for: bow, pillar, husband',
    'Padmakosha': 'Lotus Bud | Used for: fruits, flowers, pot',
    'Suchi': 'Needle | Used for: one, universe, threatening',
    'Aralam': 'Side Glance | Used for: leaves, wind',
    'Mayura': 'Peacock | Used for: peacock, applying tilak'
}

prediction_buffer = deque(maxlen=20)
current_prediction = {'mudra': '', 'confidence': 0, 'info': '', 'raw_mudra': '', 'raw_confidence': 0}
current_landmarks = []
cap = cv2.VideoCapture(0)

def generate_frames():
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        )

        result = detector.detect(mp_image)

        if result.hand_landmarks:
            landmarks = result.hand_landmarks[0]
            h, w, _ = frame.shape
            points = []
            for lm in landmarks:
                cx, cy = int(lm.x * w), int(lm.y * h)
                points.append((cx, cy))
                cv2.circle(frame, (cx, cy), 5, (0, 0, 0), -1)

            connections = [
                (0,1),(1,2),(2,3),(3,4),
                (0,5),(5,6),(6,7),(7,8),
                (0,9),(9,10),(10,11),(11,12),
                (0,13),(13,14),(14,15),(15,16),
                (0,17),(17,18),(18,19),(19,20),
                (5,9),(9,13),(13,17)
            ]
            for a, b in connections:
                cv2.line(frame, points[a], points[b], (255,0,0), 2)

            row = []
            for lm in landmarks:
                row.extend([lm.x, lm.y, lm.z])

            prediction = model.predict([row])[0]
            confidence = max(model.predict_proba([row])[0])
            prediction_buffer.append(prediction)
            stable_prediction = Counter(prediction_buffer).most_common(1)[0][0]

            current_prediction['raw_mudra'] = stable_prediction
            current_prediction['raw_confidence'] = round(confidence * 100, 1)

            if confidence > 0.5:
                current_prediction['mudra'] = stable_prediction
                current_prediction['confidence'] = round(confidence * 100, 1)
                current_prediction['info'] = mudra_info.get(stable_prediction, '')
                current_landmarks.clear()
                current_landmarks.extend(row)
            else:
                current_prediction['mudra'] = ''
                current_prediction['confidence'] = 0
                current_prediction['info'] = ''
                current_landmarks.clear()

        ret2, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect')
def detect():
    return render_template('detect.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/prediction')
def prediction():
    return jsonify(current_prediction)

@app.route('/reference/<mudra_name>')
def reference(mudra_name):
    import json
    with open('datasets/reference_landmarks.json', 'r') as f:
        references = json.load(f)
    if mudra_name in references:
        return jsonify({'mudra': mudra_name, 'landmarks': references[mudra_name]})
    else:
        return jsonify({'error': 'Mudra not found'}), 404
    


@app.route('/sample_image/<mudra_name>')
def sample_image(mudra_name):
    filename = f"{mudra_name.lower()}_themed.jpg"
    folder = os.path.join('datasets', 'themed')
    filepath = os.path.join(folder, filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'not found'}), 404
    return send_from_directory(folder, filename)


@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.get_json()
    mudra = data.get('mudra', '')
    correct = data.get('correct', True)
    predicted = data.get('predicted', '')

    # Save label feedback
    feedback_path = 'datasets/feedback.csv'
    file_exists = os.path.exists(feedback_path)
    with open(feedback_path, 'a', newline='') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['mudra', 'correct', 'predicted'])
        writer.writerow([mudra, correct, predicted])

    # Save landmark data for retraining
    if current_landmarks:
        landmarks_feedback_path = 'datasets/feedback_landmarks.csv'
        with open(landmarks_feedback_path, 'a', newline='') as f:
            writer = csv.writer(f)
            row_data = list(current_landmarks) + [mudra]
            writer.writerow(row_data)
        
            

    return jsonify({'status': 'saved'})
if __name__ == '__main__':
    app.run(debug=True)