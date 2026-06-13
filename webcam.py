import cv2
import numpy as np
import pickle
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from collections import deque, Counter

with open('models/mudra_classifier.pkl', 'rb') as f:
    model = pickle.load(f)

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

cap = cv2.VideoCapture(0)
cv2.namedWindow('Mudra Detection', cv2.WND_PROP_FULLSCREEN)
cv2.setWindowProperty('Mudra Detection', cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
print("Press Q to quit")

prediction_buffer = deque(maxlen=20)
label = ""
info_text = ""
color = (0, 0, 255)

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
            cv2.circle(frame, (cx, cy), 5, (0, 255, 0), -1)

        connections = [
            (0,1),(1,2),(2,3),(3,4),
            (0,5),(5,6),(6,7),(7,8),
            (0,9),(9,10),(10,11),(11,12),
            (0,13),(13,14),(14,15),(15,16),
            (0,17),(17,18),(18,19),(19,20),
            (5,9),(9,13),(13,17)
        ]
        for a, b in connections:
            cv2.line(frame, points[a], points[b], (0, 200, 255), 2)

        row = []
        for lm in landmarks:
            row.extend([lm.x, lm.y, lm.z])

        prediction = model.predict([row])[0]
        confidence = max(model.predict_proba([row])[0])

        prediction_buffer.append(prediction)
        stable_prediction = Counter(prediction_buffer).most_common(1)[0][0]

        if confidence > 0.5:
            label = f"{stable_prediction}: {confidence*100:.1f}%"
            info_text = mudra_info.get(stable_prediction, '')
            color = (0, 255, 0)
        else:
            label = "Not sure..."
            info_text = ""
            color = (0, 0, 255)

    cv2.putText(frame, label, (10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 2)
    if info_text:
        cv2.putText(frame, info_text, (10, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    cv2.imshow('Mudra Detection', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()