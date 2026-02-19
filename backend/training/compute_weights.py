from sklearn.utils.class_weight import compute_class_weight
import numpy as np
import os

base_path = os.path.join(os.path.dirname(__file__), "..", "dataset", "dataset", "raw", "train")
base_path = os.path.abspath(base_path)

labels = []

for class_name in os.listdir(base_path):
    class_path = os.path.join(base_path, class_name)
    
    if os.path.isdir(class_path):
        count = len(os.listdir(class_path))
        labels.extend([int(class_name)] * count)

labels = np.array(labels)

class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(labels),
    y=labels
)

class_weights_dict = dict(enumerate(class_weights))

print("Class Weights:\n")
for k, v in class_weights_dict.items():
    print(f"Class {k}: {v:.4f}")
