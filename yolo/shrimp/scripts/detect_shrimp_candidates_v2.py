import cv2
import numpy as np
from pathlib import Path

# --- Configuration Constants ---
BLUE_LOWER = np.array([80, 40, 40])
BLUE_UPPER = np.array([140, 255, 255])
WHITE_LOWER = np.array([0, 0, 150])
WHITE_UPPER = np.array([180, 80, 255])

MORPH_KERNEL_SIZE = (7, 7)
MIN_AREA_RATIO = 0.002
MAX_AREA_RATIO = 0.85
PADDING_RATIO = 0.05  # Reduced padding due to GrabCut accuracy

def get_label_path(image_path):
    """Attempt to find the corresponding disease-region label file."""
    # Based on the notebook's structure:
    # Root / Raw Images / Raw Images / {Cat} / img.jpg
    # Root / Annotated Diseased Shrimp Images / Annotated Diseased Shrimp Images / {Cat_num. Cat} / labels / img.txt
    img_path = Path(image_path)
    
    # Simple fallback: if there's a labels folder nearby or we can guess it.
    # To keep it generic, we just search for the stem.txt in the dataset root if possible, 
    # but for speed, we look in the expected structure.
    # Since we are just a script, we'll try a generic search or accept it if passed.
    return None # We will implement a basic version without the complex path guessing to avoid brittle logic, or we can just pass it.

def detect_shrimp_candidates_v2(image_path, label_boxes=None):
    """
    Improved V2 bounding box heuristic using scored components and GrabCut.
    
    Args:
        image_path (str/Path): Path to the image.
        label_boxes (list): Optional list of normalized disease-region [x_center, y_center, width, height]
    """
    image = cv2.imread(str(image_path))
    if image is None:
        return None

    h, w = image.shape[:2]
    image_area = h * w

    # 1. Base HSV Masking
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    blue_mask = cv2.inRange(hsv, BLUE_LOWER, BLUE_UPPER)
    white_mask = cv2.inRange(hsv, WHITE_LOWER, WHITE_UPPER)
    background = cv2.bitwise_or(blue_mask, white_mask)
    foreground = cv2.bitwise_not(background)

    # 2. Morphological Cleaning (less aggressive open to preserve extremities)
    kernel = np.ones(MORPH_KERNEL_SIZE, np.uint8)
    foreground = cv2.morphologyEx(foreground, cv2.MORPH_CLOSE, kernel, iterations=2)
    foreground = cv2.morphologyEx(foreground, cv2.MORPH_OPEN, kernel, iterations=1)

    # 3. Connected Components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(foreground, connectivity=8)
    if num_labels <= 1:
        return None

    candidates = []
    
    # 4. Multi-signal Scoring
    center_x, center_y = w / 2, h / 2
    
    for i in range(1, num_labels):
        x = stats[i, cv2.CC_STAT_LEFT]
        y = stats[i, cv2.CC_STAT_TOP]
        bw = stats[i, cv2.CC_STAT_WIDTH]
        bh = stats[i, cv2.CC_STAT_HEIGHT]
        area = stats[i, cv2.CC_STAT_AREA]
        
        box_area = bw * bh
        
        # Base filters
        if area < image_area * MIN_AREA_RATIO or box_area > image_area * MAX_AREA_RATIO:
            continue
            
        # Aspect Ratio Filter (shrimp shouldn't be a 1 pixel wide line across the screen)
        if bw == 0 or bh == 0: continue
        aspect_ratio = max(bw/bh, bh/bw)
        if aspect_ratio > 10:  # Extremely long and thin
            continue

        score = area  # Base score is area

        # Penalty: Touching borders
        touch_x = (x <= 5) or (x + bw >= w - 5)
        touch_y = (y <= 5) or (y + bh >= h - 5)
        if touch_x or touch_y:
            score *= 0.1  # 90% penalty for touching boundaries
            
        # Penalty: Distance from center
        cx, cy = centroids[i]
        dist_from_center = np.sqrt((cx - center_x)**2 + (cy - center_y)**2)
        max_dist = np.sqrt(center_x**2 + center_y**2)
        centrality = 1.0 - (dist_from_center / max_dist)
        score *= (0.5 + centrality) # Boost up to 1.5x for being dead center
        
        # Bonus: Disease Region Containment
        if label_boxes:
            for (lx, ly, lw, lh) in label_boxes:
                # convert normalized to pixel
                px = lx * w
                py = ly * h
                # if disease center is inside this component's bounding box
                if x <= px <= x+bw and y <= py <= y+bh:
                    score *= 5.0 # Massive bonus
                    break

        candidates.append((score, x, y, bw, bh))

    if not candidates:
        return None

    # Pick highest scoring candidate
    candidates.sort(reverse=True, key=lambda c: c[0])
    _, x, y, bw, bh = candidates[0]
    
    # Ensure valid rect for GrabCut
    gc_x = max(1, x - 5)
    gc_y = max(1, y - 5)
    gc_w = min(w - gc_x - 1, bw + 10)
    gc_h = min(h - gc_y - 1, bh + 10)
    
    if gc_w <= 0 or gc_h <= 0:
        return (x, y, x+bw, y+bh) # Fallback

    # 5. GrabCut Refinement
    rect = (int(gc_x), int(gc_y), int(gc_w), int(gc_h))
    mask = np.zeros(image.shape[:2], np.uint8)
    bgdModel = np.zeros((1, 65), np.float64)
    fgdModel = np.zeros((1, 65), np.float64)
    
    try:
        cv2.grabCut(image, mask, rect, bgdModel, fgdModel, 3, cv2.GC_INIT_WITH_RECT)
        mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
        
        # Find contours of the GrabCut result
        contours, _ = cv2.findContours(mask2, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            gx, gy, gbw, gbh = cv2.boundingRect(largest_contour)
            
            # 6. Apply Padding
            padding_x = int(gbw * PADDING_RATIO)
            padding_y = int(gbh * PADDING_RATIO)

            x1 = max(0, gx - padding_x)
            y1 = max(0, gy - padding_y)
            x2 = min(w - 1, gx + gbw + padding_x)
            y2 = min(h - 1, gy + gbh + padding_y)
            return (x1, y1, x2, y2)
    except Exception as e:
        print(f"GrabCut failed for {image_path}: {e}")
        pass

    # Fallback if GrabCut fails
    padding_x = int(bw * PADDING_RATIO)
    padding_y = int(bh * PADDING_RATIO)
    return (max(0, x - padding_x), max(0, y - padding_y), min(w-1, x+bw+padding_x), min(h-1, y+bh+padding_y))
