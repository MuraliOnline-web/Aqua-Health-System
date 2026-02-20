import os
import shutil
import random

# Paths
base_dir = os.path.dirname(__file__)
source = os.path.join(base_dir, "dataset", "raw", "train")
dest = os.path.join(base_dir, "shrimp_disease", "train")

shrimp_classes = ["7", "8", "9", "10"]

# Target size (balanced)
TARGET_COUNT = 400

for cls in shrimp_classes:
    src_path = os.path.join(source, cls)
    dst_path = os.path.join(dest, cls)

    os.makedirs(dst_path, exist_ok=True)

    images = os.listdir(src_path)

    # 🔥 Downsample class 8
    if len(images) > TARGET_COUNT:
        images = random.sample(images, TARGET_COUNT)

    for img in images:
        shutil.copy(
            os.path.join(src_path, img),
            os.path.join(dst_path, img)
        )

    print(f"Class {cls}: {len(images)} images copied")

print("Shrimp dataset balanced & created ✅")