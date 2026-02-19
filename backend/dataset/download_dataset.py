from datasets import load_dataset
import os

dataset = load_dataset("Saon110/bd-fish-disease-dataset")

save_path = "dataset/raw"
os.makedirs(save_path, exist_ok=True)

for split in dataset:
    for i, item in enumerate(dataset[split]):
        image = item['image']
        label = str(item['label'])

        class_dir = os.path.join(save_path, split, label)
        os.makedirs(class_dir, exist_ok=True)

        image.save(f"{class_dir}/{i}.jpg")

print("Dataset downloaded successfully ✅")
