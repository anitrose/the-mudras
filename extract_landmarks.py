import cv2
import numpy as np
import os
import csv
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import urllib.request

# Download hand landmarker model if not exists
model_path = "hand_landmarker.task"
if not os.path.exists(model_path):
    print("Downloading hand landmarker model...")
    urllib.request.urlretrieve(
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        model_path
    )
    print("Downloaded!")

# Setup
base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=1
)
detector = vision.HandLandmarker.create_from_options(options)

DATASET_PATH = "datasets/selected"
OUTPUT_CSV = "datasets/landmarks.csv"

rows = []

for class_folder in os.listdir(DATASET_PATH):
    class_path = os.path.join(DATASET_PATH, class_folder)
    if not os.path.isdir(class_path):
        continue
    
    print(f"Processing: {class_folder}")
    
    for img_file in os.listdir(class_path):
        img_path = os.path.join(class_path, img_file)
        
        img = cv2.imread(img_path)
        if img is None:
            continue
        
        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        )
        
        result = detector.detect(mp_image)
        
        if result.hand_landmarks:
            landmarks = result.hand_landmarks[0]
            row = []
            for lm in landmarks:
                row.extend([lm.x, lm.y, lm.z])
            row.append(class_folder)
            rows.append(row)

with open(OUTPUT_CSV, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print(f"Done. Saved {len(rows)} samples to {OUTPUT_CSV}")