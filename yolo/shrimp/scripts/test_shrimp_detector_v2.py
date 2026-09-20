import cv2
import os
import random
from pathlib import Path
from detect_shrimp_candidates import detect_shrimp_candidates
from detect_shrimp_candidates_v2 import detect_shrimp_candidates_v2

# --- Configuration ---
DATASET_ROOT = os.getenv("SHRIMP_DATASET_ROOT", r"C:\Users\MURALIKRISHNA\Downloads\ShrimpDiseaseImageBD\Root")
RAW_DIR = Path(DATASET_ROOT) / "Raw Images" / "Raw Images"
ANNOTATED_DIR = Path(DATASET_ROOT) / "Annotated Diseased Shrimp Images" / "Annotated Diseased Shrimp Images"

OUTPUT_DIR = Path(__file__).parent.parent / "test_outputs" / "candidate_boxes_v2"

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

SAMPLES_PER_CATEGORY = 5
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
                # class_id, xc, yc, bw, bh
                boxes.append([float(x) for x in parts[1:]])
    return boxes if boxes else None

def main():
    print("==================================================")
    print("Shrimp Candidate Detector - V1 vs V2 Comparison")
    print("==================================================")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Collect samples
    test_images = []
    for category, folder in CATEGORIES.items():
        if not folder.exists():
            continue
        images = [p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS]
        random.seed(42)
        selected = random.sample(images, min(SAMPLES_PER_CATEGORY, len(images)))
        for img_path in selected:
            test_images.append((category, img_path))
            
    print(f"Testing {len(test_images)} images...\n")
    
    report_lines = []
    report_lines.append("Filename | Category | Baseline Box | V2 Box | Baseline Area % | V2 Area % | Status")
    report_lines.append("-" * 120)
    
    v1_ratios = []
    v2_ratios = []

    for category, img_path in test_images:
        print(f"Processing: {img_path.name}")
        image = cv2.imread(str(img_path))
        if image is None:
            continue
            
        img_h, img_w = image.shape[:2]
        img_area = img_w * img_h
        
        label_boxes = get_label_boxes(category, img_path.name)
        
        # Run Baseline V1
        box_v1 = detect_shrimp_candidates(img_path)
        # Run V2
        box_v2 = detect_shrimp_candidates_v2(img_path, label_boxes=label_boxes)
        
        v1_str = "None"
        v1_area = 0.0
        if box_v1:
            x1, y1, x2, y2 = box_v1
            bw, bh = x2 - x1, y2 - y1
            v1_area = (bw * bh) / img_area
            v1_ratios.append(v1_area)
            v1_str = f"({x1},{y1})->({x2},{y2})"
            
        v2_str = "None"
        v2_area = 0.0
        if box_v2:
            x1, y1, x2, y2 = box_v2
            bw, bh = x2 - x1, y2 - y1
            v2_area = (bw * bh) / img_area
            v2_ratios.append(v2_area)
            v2_str = f"({x1},{y1})->({x2},{y2})"
            
        status = "Improved" if v2_area < v1_area and v2_area > 0 else "Similar/Worse"
        if not box_v1 and box_v2: status = "Fixed Failure"
        
        report_lines.append(f"{img_path.name} | {category} | {v1_str} | {v2_str} | {v1_area:.2%} | {v2_area:.2%} | {status}")
        
        # Draw V1 (Red) and V2 (Green)
        if box_v1:
            cv2.rectangle(image, (box_v1[0], box_v1[1]), (box_v1[2], box_v1[3]), (0, 0, 255), 2)
            cv2.putText(image, "V1", (box_v1[0], max(box_v1[1]-10, 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        if box_v2:
            cv2.rectangle(image, (box_v2[0], box_v2[1]), (box_v2[2], box_v2[3]), (0, 255, 0), 2)
            cv2.putText(image, "V2", (box_v2[2]-40, max(box_v2[1]-10, 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
        out_path = OUTPUT_DIR / f"COMPARE_{category}_{img_path.name}"
        cv2.imwrite(str(out_path), image)

    print("\n" + "\n".join(report_lines))
    
    print("\n==================================================")
    print("STATISTICS")
    print("==================================================")
    print(f"V1 Area Ratios - Min: {min(v1_ratios):.2%}, Max: {max(v1_ratios):.2%}, Avg: {sum(v1_ratios)/len(v1_ratios):.2%}")
    print(f"V2 Area Ratios - Min: {min(v2_ratios):.2%}, Max: {max(v2_ratios):.2%}, Avg: {sum(v2_ratios)/len(v2_ratios):.2%}")
    print(f"\nSaved comparison images to: {OUTPUT_DIR.resolve()}")
    
    # Save text report
    with open(OUTPUT_DIR / "comparison_report.txt", "w") as f:
        f.write("\n".join(report_lines))

if __name__ == "__main__":
    main()
