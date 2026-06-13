import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle
import os


# Load CSV

data1 = pd.read_csv('datasets/landmarks.csv', header=None)
feedback_path = 'datasets/feedback_landmarks.csv'
if os.path.exists(feedback_path):
    data2 = pd.read_csv(feedback_path, header=None)
    data = pd.concat([data1, data2], ignore_index=True)
else:
    data = data1

X = data.iloc[:, :-1].values
y = data.iloc[:, -1].values

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train
print("Training...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Accuracy: {acc*100:.2f}%")

# Save
with open('models/mudra_classifier.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Model saved!")