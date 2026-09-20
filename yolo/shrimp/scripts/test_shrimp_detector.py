import cv2
import os
import random
from pathlib import Path
from detect_shrimp_candidates import detect_shrimp_candidates

# --- Configuration ---
# Configurable dataset root (defaults to the notebook's path)
DATASET_ROOT = os.getenv("SHRIMP_DATASET_ROOT", r"C:\Users\MURALIKRISHNA\Downloads\ShrimpDiseaseImageBD\Root")
RAW_DIR = Path(DATASET_ROOT) / "Raw Images" / "Raw Images"

OUTPUT_DIR = Path(__file__).parent.parent / "test_outputs" / "candidate_boxes"

CATEGORIES = {
    "Healthy": RAW_DIR / "1. Healthy",
    "BG": RAW_DIR / "2. BG",
    "WSSV": RAW_DIR / "3. WSSV",
    "WSSV_BG": RAW_DIR / "4. WSSV_BG",
}

SAMPLES_PER_CATEGORY = 5
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

def main():
    print("==================================================")
    print("Shrimp Candidate Detector - 20 Image Test")
    print("==================================================")
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Collect samples
    test_images = []
    for category, folder in CATEGORIES.items():
        if not folder.exists():
            print(f"Warning: Category folder not found: {folder}")
            continue
            
        images = [p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS]
        
        # Select random samples
        random.seed(42)  # For reproducibility
        selected = random.sample(images, min(SAMPLES_PER_CATEGORY, len(images)))
        for img_path in selected:
            test_images.append((category, img_path))
            
    print(f"Selected {len(test_images)} images for testing.\n")
    
    # Metrics
    total_images = len(test_images)
    successful = 0
    failed = 0
    cat_success = {cat: 0 for cat in CATEGORIES.keys()}
    area_ratios = []

    for category, img_path in test_images:
        print(f"[{category}] Processing: {img_path.name}")
        
        # Run detector
        box = detect_shrimp_candidates(img_path)
        
        if box is None:
            print("  -> Result: FAILED (No valid candidate found)\n")
            failed += 1
            # Save failed visualization
            image = cv2.imread(str(img_path))
            if image is not None:
                out_path = OUTPUT_DIR / f"FAILED_{category}_{img_path.name}"
                cv2.putText(image, "NO BOX FOUND", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                cv2.imwrite(str(out_path), image)
            continue
            
        # Box found
        x1, y1, x2, y2 = box
        bw = x2 - x1
        bh = y2 - y1
        
        # Load image to get dimensions and draw
        image = cv2.imread(str(img_path))
        if image is None:
            print("  -> Result: FAILED (Image read error)\n")
            failed += 1
            continue
            
        img_h, img_w = image.shape[:2]
        img_area = img_w * img_h
        box_area = bw * bh
        area_ratio = box_area / img_area
        
        # Update metrics
        successful += 1
        cat_success[category] += 1
        area_ratios.append(area_ratio)
        
        # Report
        print(f"  -> Result: SUCCESS")
        print(f"  -> Coords: ({x1}, {y1}) to ({x2}, {y2})")
        print(f"  -> Size: {bw}x{bh}")
        print(f"  -> Area Ratio: {area_ratio:.2%}\n")
        
        # Visualization
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 0, 255), 3)
        cv2.putText(image, f"Candidate (Area: {area_ratio:.1%})", (x1, max(y1-10, 20)), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                    
        out_path = OUTPUT_DIR / f"SUCCESS_{category}_{img_path.name}"
        cv2.imwrite(str(out_path), image)

    # Summary
    print("==================================================")
    print("TEST SUMMARY")
    print("==================================================")
    print(f"Total Images        : {total_images}")
    print(f"Successful Detections: {successful}")
    print(f"Failed Detections    : {failed}")
    print("Detections by Category:")
    for cat, count in cat_success.items():
        print(f"  - {cat:10}: {count} / {SAMPLES_PER_CATEGORY}")
        
    if area_ratios:
        print("\nBox Area Ratios:")
        print(f"  - Min: {min(area_ratios):.2%}")
        print(f"  - Max: {max(area_ratios):.2%}")
        print(f"  - Avg: {sum(area_ratios)/len(area_ratios):.2%}")
    print(f"\nVisualizations saved to:\n{OUTPUT_DIR.resolve()}")

if __name__ == "__main__":
    main()
