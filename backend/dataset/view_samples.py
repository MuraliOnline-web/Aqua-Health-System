import os
import matplotlib.pyplot as plt
from PIL import Image

base_path = "dataset/raw/train"

for cls in os.listdir(base_path):
    cls_path = os.path.join(base_path, cls)
    
    if os.path.isdir(cls_path):
        images = os.listdir(cls_path)[:3]  # show 3 images
        
        plt.figure(figsize=(8, 3))
        
        for i, img_name in enumerate(images):
            img_path = os.path.join(cls_path, img_name)
            img = Image.open(img_path)
            
            plt.subplot(1, 3, i+1)
            plt.imshow(img)
            plt.title(f"Class {cls}")
            plt.axis("off")
        
        plt.show()
