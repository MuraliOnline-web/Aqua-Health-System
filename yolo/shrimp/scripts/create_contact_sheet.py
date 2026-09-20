import cv2
import matplotlib.pyplot as plt
from pathlib import Path
import math

INPUT_DIR = Path(r"C:\AHS\yolo\shrimp\test_outputs\candidate_boxes")
OUTPUT_FILE = Path(r"C:\AHS\yolo\shrimp\test_outputs\contact_sheet.png")

def main():
    # Gather all images in the input directory
    valid_exts = {".jpg", ".jpeg", ".png"}
    images = [p for p in INPUT_DIR.glob("*.*") if p.is_file() and p.suffix.lower() in valid_exts]
    
    # Sort them by category for a cleaner sheet
    images = sorted(images, key=lambda x: x.name)
    
    if not images:
        print(f"No images found in {INPUT_DIR}")
        return

    n_images = len(images)
    cols = 5
    rows = math.ceil(n_images / cols)
    
    # Create a large figure to hold high-resolution thumbnails
    fig, axes = plt.subplots(rows, cols, figsize=(cols * 4, rows * 4))
    axes = axes.flatten()
    
    for i, img_path in enumerate(images):
        ax = axes[i]
        
        # Read and convert BGR -> RGB for Matplotlib
        img = cv2.imread(str(img_path))
        if img is not None:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            ax.imshow(img)
        else:
            ax.text(0.5, 0.5, 'Image Load Failed', ha='center', va='center')
            
        # The filename inherently contains the status, category, and raw filename
        # e.g., SUCCESS_Healthy_Healthy-75-img-2.jpg
        # The candidate area and box are already drawn on the image by the previous script.
        ax.set_title(img_path.name, fontsize=9)
        ax.axis("off")
        
    # Turn off any remaining unused axes
    for j in range(n_images, len(axes)):
        axes[j].axis("off")
        
    plt.tight_layout()
    
    # Save the high-resolution contact sheet
    plt.savefig(OUTPUT_FILE, dpi=300, bbox_inches='tight')
    print(f"Contact sheet saved to: {OUTPUT_FILE.resolve()}")

if __name__ == "__main__":
    main()
