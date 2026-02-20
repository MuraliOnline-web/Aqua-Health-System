import os

base_path = "dataset/raw/train"

class_counts = {}

for class_name in os.listdir(base_path):
    class_path = os.path.join(base_path, class_name)
    
    if os.path.isdir(class_path):
        count = len(os.listdir(class_path))
        class_counts[class_name] = count

print("Class Distribution:\n")

for cls, count in class_counts.items():
    print(f"Class {cls}: {count} images")
