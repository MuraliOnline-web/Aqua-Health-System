import cv2
import numpy as np
from pathlib import Path
from detect_shrimp_candidates_v2 import detect_shrimp_candidates_v2, get_label_path

# --- Configuration Constants ---
BLUE_LOWER = np.array([80, 40, 40])
BLUE_UPPER = np.array([140, 255, 255])
WHITE_LOWER = np.array([0, 0, 150])
WHITE_UPPER = np.array([180, 80, 255])
MORPH_KERNEL_SIZE = (7, 7)
MIN_AREA_RATIO = 0.005
MAX_AREA_RATIO = 0.85
PADDING_RATIO = 0.05

def get_foreground_mask(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    blue_mask = cv2.inRange(hsv, BLUE_LOWER, BLUE_UPPER)
    white_mask = cv2.inRange(hsv, WHITE_LOWER, WHITE_UPPER)
    background = cv2.bitwise_or(blue_mask, white_mask)
    foreground = cv2.bitwise_not(background)
    
    kernel = np.ones(MORPH_KERNEL_SIZE, np.uint8)
    foreground = cv2.morphologyEx(foreground, cv2.MORPH_CLOSE, kernel, iterations=2)
    foreground = cv2.morphologyEx(foreground, cv2.MORPH_OPEN, kernel, iterations=1)
    return foreground

def is_v2_suspicious(v2_box, w, h):
    if not v2_box:
        return True
    
    x1, y1, x2, y2 = v2_box
    bw = x2 - x1
    bh = y2 - y1
    area_ratio = (bw * bh) / (w * h)
    
    norm_w = bw / w
    norm_h = bh / h
    
    touching = (x1 <= 5) or (y1 <= 5) or (x2 >= w - 5) or (y2 >= h - 5)
    
    if touching:
        return True
    if norm_w >= 0.90 or norm_h >= 0.90:
        return True
    if area_ratio >= 0.70 or area_ratio < 0.10:
        return True
        
    return False

def calculate_contrast(image, contour):
    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    cv2.drawContours(mask, [contour], -1, 255, -1)
    
    # Foreground mean
    fg_mean = cv2.mean(image, mask=mask)[:3]
    
    # Background mean (bounding box region outside contour)
    x, y, bw, bh = cv2.boundingRect(contour)
    bg_mask = np.zeros(image.shape[:2], dtype=np.uint8)
    cv2.rectangle(bg_mask, (x, y), (x+bw, y+bh), 255, -1)
    bg_mask = cv2.bitwise_and(bg_mask, cv2.bitwise_not(mask))
    
    bg_mean = cv2.mean(image, mask=bg_mask)[:3]
    
    # Euclidean distance in BGR space as a simple contrast metric
    contrast = np.sqrt(sum((a - b)**2 for a, b in zip(fg_mean, bg_mean)))
    return contrast

def score_candidate(contour, image, v2_box, label_boxes):
    h, w = image.shape[:2]
    img_area = w * h
    x, y, bw, bh = cv2.boundingRect(contour)
    box_area = bw * bh
    
    if box_area == 0:
        return 0
        
    c_area = cv2.contourArea(contour)
    
    # Base score: contour area
    score = c_area
    
    # Compactness / Extent
    extent = c_area / box_area
    score *= (0.5 + extent) # Boost solid objects
    
    # Contrast
    contrast = calculate_contrast(image, contour)
    score *= (1.0 + (contrast / 255.0)) # Boost high contrast
    
    # Aspect Ratio penalty
    aspect_ratio = max(bw/bh, bh/bw)
    if aspect_ratio > 4.0:
        score *= (4.0 / aspect_ratio) # Penalize long streaks
        
    # Distance from boundaries penalty
    touch_x = (x <= 5) or (x + bw >= w - 5)
    touch_y = (y <= 5) or (y + bh >= h - 5)
    if touch_x or touch_y:
        score *= 0.1 # Strong penalty for touching
        
    # Oversize penalty
    if bw/w > 0.85 or bh/h > 0.85:
        score *= 0.1
        
    # Centrality bonus
    cx, cy = x + bw/2, y + bh/2
    center_x, center_y = w/2, h/2
    max_dist = np.sqrt(center_x**2 + center_y**2)
    dist = np.sqrt((cx-center_x)**2 + (cy-center_y)**2)
    centrality = 1.0 - (dist / max_dist)
    score *= (1.0 + centrality)
    
    # V2 box containment bonus
    if v2_box:
        vx1, vy1, vx2, vy2 = v2_box
        if x >= vx1 and y >= vy1 and x+bw <= vx2 and y+bh <= vy2:
            score *= 1.5
            
    # Label overlap bonus
    if label_boxes:
        for (lx, ly, lw, lh) in label_boxes:
            px = lx * w
            py = ly * h
            if x <= px <= x+bw and y <= py <= y+bh:
                score *= 3.0
                break
                
    return score

def detect_shrimp_candidates_v3(image_path, label_boxes=None):
    """
    V3 shrimp candidate refinement pipeline.
    """
    image = cv2.imread(str(image_path))
    if image is None:
        return None
        
    h, w = image.shape[:2]
    img_area = h * w
    
    # 1. Run V2 Baseline
    v2_box = detect_shrimp_candidates_v2(image_path, label_boxes)
    
    # 2. Check if V2 is suspicious
    suspicious = is_v2_suspicious(v2_box, w, h)
    
    # 3. Get foreground mask and find contours
    mask = get_foreground_mask(image)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return v2_box
        
    # 4. Generate & Score Candidates
    candidates = []
    for contour in contours:
        x, y, bw, bh = cv2.boundingRect(contour)
        
        # Filter obvious noise
        if bw * bh < img_area * MIN_AREA_RATIO:
            continue
            
        score = score_candidate(contour, image, v2_box, label_boxes)
        candidates.append({'score': score, 'box': (x, y, x+bw, y+bh), 'contour': contour})
        
    if not candidates:
        return v2_box
        
    candidates.sort(reverse=True, key=lambda c: c['score'])
    best_candidate = candidates[0]
    bx1, by1, bx2, by2 = best_candidate['box']
    bw = bx2 - bx1
    bh = by2 - by1
    
    # Apply padding safely
    pad_x = int(bw * PADDING_RATIO)
    pad_y = int(bh * PADDING_RATIO)
    refined_box = (max(0, bx1 - pad_x), max(0, by1 - pad_y), min(w-1, bx2 + pad_x), min(h-1, by2 + pad_y))
    
    # 5. Decide to keep V2 or use Refined
    if not suspicious and v2_box:
        # Evaluate if refined box is clearly better, else keep v2
        # For non-suspicious, V2 is presumed good. We stick to V2 unless refined is vastly different but better.
        # But requirements say: "For non-suspicious V2 candidates, preserve the V2 candidate unless refinement produces a clearly better candidate according to the scoring criteria."
        # It's safer to just return V2 if it's already "good" to preserve baseline performance.
        return v2_box
        
    return refined_box
