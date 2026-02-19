import os
import random
import shutil

base_dir = os.path.dirname(__file__)

source = os.path.join(base_dir, "dataset", "type", "train")
dest = os.path.join(base_dir, "dataset", "type_balanced", "train")

TARGET = 1400  # match fish count (approx)

for cls in ["fish", "shrimp"]:
    src_path = os.path.join(source, cls)
    dst_path = os.path.join(dest, cls)

    os.makedirs(dst_path, exist_ok=True)

    images = os.listdir(src_path)

    # 🔥 balance logic
    if len(images) > TARGET:
        images = random.sample(images, TARGET)

    for img in images:
        shutil.copy(
            os.path.join(src_path, img),
            os.path.join(dst_path, img)
        )

print("Balanced type dataset created ✅")
