import os
from PIL import Image

DATASET_PATH = "datasets/selected"

removed = 0
for class_folder in os.listdir(DATASET_PATH):
    class_path = os.path.join(DATASET_PATH, class_folder)
    if not os.path.isdir(class_path):
        continue
    for img_file in os.listdir(class_path):
        img_path = os.path.join(class_path, img_file)
        try:
            img = Image.open(img_path)
            img.verify()
        except Exception:
            print(f"Removing corrupt file: {img_path}")
            os.remove(img_path)
            removed += 1

print(f"Done. Removed {removed} corrupt files.")