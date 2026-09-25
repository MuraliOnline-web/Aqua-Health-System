import cv2
import os
import random
import json
import csv
import math
import matplotlib.pyplot as plt
from pathlib import Path
from detect_shrimp_candidates_v3 import detect_shrimp_candidates_v3

# --- Configuration ---
DATASET_ROOT = os.getenv("SHRIMP_DATASET_ROOT", r"C:\Users\MURALIKRISHNA\Downloads\ShrimpDiseaseImageBD\Root")
RAW_DIR = Path(DATASET_ROOT) / "Raw Images" / "Raw Images"
ANNOTATED_DIR = Path(DATASET_ROOT) / "Annotated Diseased Shrimp Images" / "Annotated Diseased Shrimp Images"

OUTPUT_DIR = Path(__file__).parent.parent / "test_outputs" / "validation_v3"
VIS_DIR = OUTPUT_DIR / "visualizations"
SHEET_DIR = OUTPUT_DIR / "contact_sheets"

CATEGORIES = {
    "Healthy": RAW_DIR / "1. Healthy",
    "BG": RAW_DIR / "2. BG",
    "WSSV": RAW_DIR / "3. WSSV",
    "WSSV_BG": RAW_DIR / "4. WSSV_BG",
}

ANNOTATION_MAP = {
    "BG": "1. BG",
    "WSSV": "2. WSSV",
    "WSSV_BG": "4. WSSV_BG",
}

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

def get_label_boxes(category, img_name):
    if category not in ANNOTATION_MAP:
        return None
    label_path = ANNOTATED_DIR / ANNOTATION_MAP[category] / "labels" / f"{Path(img_name).stem}.txt"
    if not label_path.exists():
        return None
    boxes = []
    with open(label_path, "r") as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) == 5:
                boxes.append([float(x) for x in parts[1:]])
    return boxes if boxes else None

def get_previous_20_images():
    """Reproduce the first 20-image selection to exclude them."""
    previous_images = set()
    for category, folder in CATEGORIES.items():
        if not folder.exists(): continue
        images = [p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS]
        random.seed(42)
        selected = random.sample(images, min(5, len(images)))
        for img_path in selected:
            previous_images.add(img_path.name)
    return previous_images

def create_contact_sheet(image_paths, output_path, cols=5, title_prefix=""):
    if not image_paths: return
    n = len(image_paths)
    rows = math.ceil(n / cols)
    fig, axes = plt.subplots(rows, cols, figsize=(cols * 4, rows * 4))
    if rows == 1 and cols == 1: axes = np.array([axes])
    axes = axes.flatten()
    
    for i, img_path in enumerate(image_paths):
        ax = axes[i]
        img = cv2.imread(str(img_path))
        if img is not None:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            ax.imshow(img)
        else:
            ax.text(0.5, 0.5, 'Error', ha='center', va='center')
        ax.set_title(title_prefix + img_path.name, fontsize=8)
        ax.axis("off")
        
    for j in range(n, len(axes)):
        axes[j].axis("off")
        
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def main():
    print("==================================================")
    print("Shrimp Candidate Detector V3 - 100 Image Validation")
    print("==================================================")
    
    VIS_DIR.mkdir(parents=True, exist_ok=True)
    SHEET_DIR.mkdir(parents=True, exist_ok=True)
    
    prev_images = get_previous_20_images()
    
    test_images = []
    # Seed for new selection
    random.seed(100)
    
    for category, folder in CATEGORIES.items():
        if not folder.exists(): continue
        images = [p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS]
        # Exclude previous 20
        images = [p for p in images if p.name not in prev_images]
        selected = random.sample(images, min(25, len(images)))
        for img_path in selected:
            test_images.append((category, img_path))
            
    print(f"Selected {len(test_images)} independent images for validation.")
    
    results = []
    cat_success = {cat: 0 for cat in CATEGORIES.keys()}
    cat_area_ratios = {cat: [] for cat in CATEGORIES.keys()}
    
    boundary_touching_count = 0
    zero_box_count = 0
    
    vis_paths = {cat: [] for cat in CATEGORIES.keys()}
    all_vis_paths = []
    
    for i, (category, img_path) in enumerate(test_images, 1):
        print(f"[{i}/100] {category} - {img_path.name}")
        image = cv2.imread(str(img_path))
        if image is None:
            continue
            
        img_h, img_w = image.shape[:2]
        label_boxes = get_label_boxes(category, img_path.name)
        
        box_v3 = detect_shrimp_candidates_v3(img_path, label_boxes=label_boxes)
        
        record = {
            "filename": img_path.name,
            "category": category,
            "image_width": img_w,
            "image_height": img_h,
            "detected": False,
            "x1": None, "y1": None, "x2": None, "y2": None,
            "box_width": None, "box_height": None,
            "norm_x_center": None, "norm_y_center": None,
            "norm_width": None, "norm_height": None,
            "area_ratio": None,
            "touches_boundary": False
        }
        
        if box_v3 is None:
            zero_box_count += 1
            out_path = VIS_DIR / f"FAILED_{category}_{img_path.name}"
            cv2.putText(image, "NO BOX FOUND", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.imwrite(str(out_path), image)
        else:
            x1, y1, x2, y2 = box_v3
            bw, bh = x2 - x1, y2 - y1
            area_ratio = (bw * bh) / (img_w * img_h)
            
            record["detected"] = True
            record["x1"], record["y1"], record["x2"], record["y2"] = x1, y1, x2, y2
            record["box_width"], record["box_height"] = bw, bh
            record["norm_x_center"] = (x1 + bw/2) / img_w
            record["norm_y_center"] = (y1 + bh/2) / img_h
            record["norm_width"] = bw / img_w
            record["norm_height"] = bh / img_h
            record["area_ratio"] = area_ratio
            
            touches = (x1 <= 5) or (y1 <= 5) or (x2 >= img_w - 5) or (y2 >= img_h - 5)
            record["touches_boundary"] = touches
            if touches: boundary_touching_count += 1
            
            cat_success[category] += 1
            cat_area_ratios[category].append(area_ratio)
            
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            color = (0, 0, 255) if touches else (0, 255, 0)
            text = f"{area_ratio:.1%} {'[BOUNDARY]' if touches else ''}"
            cv2.putText(image, text, (x1, max(y1-10, 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            
            out_path = VIS_DIR / f"{category}_{img_path.name}"
            cv2.imwrite(str(out_path), image)
            
            vis_paths[category].append(out_path)
            all_vis_paths.append(out_path)
            
        results.append(record)

    # Export JSON
    with open(OUTPUT_DIR / "validation_report.json", "w") as f:
        json.dump(results, f, indent=4)
        
    # Export CSV
    with open(OUTPUT_DIR / "validation_report.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
        
    # Generate Contact Sheets
    print("\nGenerating contact sheets...")
    for cat, paths in vis_paths.items():
        create_contact_sheet(paths, SHEET_DIR / f"{cat}_contact_sheet.png")
    create_contact_sheet(all_vis_paths, SHEET_DIR / "overall_contact_sheet.png", cols=10)
    
    # Calculate overall stats
    all_areas = [r["area_ratio"] for r in results if r["detected"]]
    
    print("\n==================================================")
    print("VALIDATION SUMMARY")
    print("==================================================")
    print(f"Total Detections   : {len(all_areas)} / {len(test_images)}")
    print(f"Zero-box failures  : {zero_box_count}")
    print(f"Boundary Touching  : {boundary_touching_count}")
    
    if all_areas:
        all_areas.sort()
        n = len(all_areas)
        print(f"\nOverall Area Ratios:")
        print(f"  Min   : {min(all_areas):.2%}")
        print(f"  Max   : {max(all_areas):.2%}")
        print(f"  Mean  : {sum(all_areas)/n:.2%}")
        print(f"  Median: {all_areas[n//2]:.2%}")
        print(f"  < 10% : {sum(1 for a in all_areas if a < 0.10)}")
        print(f"  > 70% : {sum(1 for a in all_areas if a > 0.70)}")
        
    print("\nCategory Breakdown:")
    for cat in CATEGORIES.keys():
        areas = cat_area_ratios[cat]
        if areas:
            print(f"  {cat:10}: {len(areas)}/25 detected | Mean Area: {sum(areas)/len(areas):.2%}")
        else:
            print(f"  {cat:10}: 0/25 detected")
            
    print(f"\nOutputs saved to: {OUTPUT_DIR.resolve()}")

if __name__ == "__main__":
    main()
