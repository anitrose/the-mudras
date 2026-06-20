import pandas as pd
import numpy as np
import json
import os


def to_points(flat):
    return np.array(flat, dtype=float).reshape(21, 3)


def align_landmarks(points):
    points = points.copy()
    points -= points[0].copy()

    scale = np.linalg.norm(points[9]) + 1e-6
    points /= scale

    # Target (0, -1) instead of (0, 1) — image coordinates have y increasing
    # downward, so "up" on screen is negative y.
    ref_vec = points[9][:2]
    angle = np.arctan2(ref_vec[1], ref_vec[0]) - np.arctan2(-1, 0)
    cos_a, sin_a = np.cos(-angle), np.sin(-angle)
    rot = np.array([[cos_a, -sin_a], [sin_a, cos_a]])
    for i in range(len(points)):
        points[i][:2] = rot @ points[i][:2]

    return points

def compute_aligned_reference(rows):
    """rows: array of flat 63-length landmark arrays for one mudra class."""
    aligned = [align_landmarks(to_points(row)) for row in rows]
    avg = np.mean(np.array(aligned), axis=0)
    return avg.flatten().tolist()


data = pd.read_csv('datasets/landmarks.csv', header=None)
X = data.iloc[:, :-1]
y = data.iloc[:, -1]

references = {}
for mudra in y.unique():
    mask = y == mudra
    rows = X[mask].values  # shape: (n_samples, 63)
    references[mudra] = compute_aligned_reference(rows)

with open('datasets/reference_landmarks.json', 'w') as f:
    json.dump(references, f)

print(f"Saved aligned references for {len(references)} mudras")