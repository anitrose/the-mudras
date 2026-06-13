import os

folder = "datasets/train"

for file in os.listdir(folder):
    if "Mayura" in file:
        print(file)
        break