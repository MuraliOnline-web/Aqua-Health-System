import os
import shutil

# Base paths
base_dir = os.path.dirname(__file__)

source = os.path.join(base_dir, "dataset", "raw", "train")
dest = os.path.join(base_dir, "fish_disease", "train")

fish_classes = ["0", "1", "2", "3", "4", "5", "6"]

for cls in fish_classes:
    src_path = os.path.join(source, cls)
    dst_path = os.path.join(dest, cls)

    os.makedirs(dst_path, exist_ok=True)

    for img in os.listdir(src_path):
        shutil.copy(
            os.path.join(src_path, img),
            os.path.join(dst_path, img)
        )

print("Fish disease dataset created ✅")