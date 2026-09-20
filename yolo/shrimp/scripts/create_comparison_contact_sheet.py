import cv2
import matplotlib.pyplot as plt
from pathlib import Path
import math

# Use the old test_outputs for original and baseline if needed, but the new one 
# 'candidate_boxes_v2' has both V1 and V2 drawn on the same image (Red = V1, Green = V2)
# So we can just use those images directly to save space and time.
INPUT_DIR = Path(r"C:\AHS\yolo\shrimp\test_outputs\candidate_boxes_v2")
OUTPUT_FILE = Path(r"C:\AHS\yolo\shrimp\test_outputs\contact_sheet_v2_comparison.png")

def main():
    valid_exts = {".jpg", ".jpeg", ".png"}
    images = [p for p in INPUT_DIR.glob("COMPARE_*.*") if p.is_file() and p.suffix.lower() in valid_exts]
    images = sorted(images, key=lambda x: x.name)
    
    if not images:
        print(f"No comparison images found in {INPUT_DIR}")
        return

    n_images = len(images)
    cols = 5
    rows = math.ceil(n_images / cols)
    
    fig, axes = plt.subplots(rows, cols, figsize=(cols * 5, rows * 5))
    axes = axes.flatten()
    
    for i, img_path in enumerate(images):
        ax = axes[i]
        img = cv2.imread(str(img_path))
        if img is not None:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            ax.imshow(img)
        else:
            ax.text(0.5, 0.5, 'Image Load Failed', ha='center', va='center')
            
        # Title
        # Filename format: COMPARE_{category}_{img_name}
        parts = img_path.name.split('_', 2)
        title = parts[2] if len(parts) >= 3 else img_path.name
        ax.set_title(title, fontsize=10)
        ax.axis("off")
        
    for j in range(n_images, len(axes)):
        axes[j].axis("off")
        
    plt.tight_layout()
    plt.savefig(OUTPUT_FILE, dpi=300, bbox_inches='tight')
    print(f"Comparison contact sheet saved to: {OUTPUT_FILE.resolve()}")

if __name__ == "__main__":
    main()
