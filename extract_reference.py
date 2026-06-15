import pandas as pd
import numpy as np
import json
import os

data = pd.read_csv('datasets/landmarks.csv', header=None)
X = data.iloc[:, :-1]
y = data.iloc[:, -1]

references = {}
for mudra in y.unique():
    mask = y == mudra
    avg = X[mask].mean().values.tolist()
    references[mudra] = avg

with open('datasets/reference_landmarks.json', 'w') as f:
    json.dump(references, f)

print(f"Saved references for {len(references)} mudras")