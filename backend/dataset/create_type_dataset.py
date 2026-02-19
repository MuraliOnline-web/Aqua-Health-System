import os
import shutil

base_dir = os.path.dirname(__file__)

# ✅ Source path
source = os.path.join(base_dir, "dataset", "raw", "train")

# ✅ Destination path (FIXED)
dest = os.path.join(base_dir, "dataset", "type", "train")

fish_classes = ["0","1","2","3","4","5","6"]
shrimp_classes = ["7","8","9","10"]

for label, classes in [("fish", fish_classes), ("shrimp", shrimp_classes)]:
    for cls in classes:
        src_path = os.path.join(source, cls)
        dst_path = os.path.join(dest, label)
        
        os.makedirs(dst_path, exist_ok=True)
        
        for img in os.listdir(src_path):
            shutil.copy(
                os.path.join(src_path, img),
                os.path.join(dst_path, f"{cls}_{img}")
            )

print("Type dataset created ✅")
