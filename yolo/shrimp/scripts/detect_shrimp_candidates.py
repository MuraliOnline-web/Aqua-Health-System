import cv2
import numpy as np
from pathlib import Path

# --- Configuration Constants ---
# Blue background HSV thresholds
BLUE_LOWER = np.array([80, 40, 40])
BLUE_UPPER = np.array([140, 255, 255])

# White/light background HSV thresholds
WHITE_LOWER = np.array([0, 0, 150])
WHITE_UPPER = np.array([180, 80, 255])

# Morphological operations kernel size
MORPH_KERNEL_SIZE = (7, 7)

# Filtering thresholds
MIN_AREA_RATIO = 0.002  # Minimum 0.2% of image area
MAX_AREA_RATIO = 0.85   # Maximum 85% of image area

# Padding configuration (8% of bounding box width/height)
PADDING_RATIO = 0.08

def detect_shrimp_candidates(image_path):
    """
    Generate a candidate bounding box around the complete shrimp.
    
    Args:
        image_path (str or Path): Path to the input image.
        
    Returns:
        tuple: (x1, y1, x2, y2) in absolute pixel coordinates, or None if no valid candidate found.
    """
    # 1. Load the image safely
    image = cv2.imread(str(image_path))
    if image is None:
        print(f"Warning: Could not read image at {image_path}")
        return None

    h, w = image.shape[:2]
    image_area = h * w

    # 2. Convert BGR to HSV
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # 3. Create blue-background mask
    blue_mask = cv2.inRange(hsv, BLUE_LOWER, BLUE_UPPER)

    # 4. Create white/light-background mask
    white_mask = cv2.inRange(hsv, WHITE_LOWER, WHITE_UPPER)

    # Combine likely background regions
    background = cv2.bitwise_or(blue_mask, white_mask)

    # 5. Extract foreground (invert background)
    foreground = cv2.bitwise_not(background)

    # 6. Morphological closing and opening to remove noise
    kernel = np.ones(MORPH_KERNEL_SIZE, np.uint8)
    
    # Close small holes inside the foreground
    foreground = cv2.morphologyEx(foreground, cv2.MORPH_CLOSE, kernel, iterations=2)
    # Remove small noise outside the foreground
    foreground = cv2.morphologyEx(foreground, cv2.MORPH_OPEN, kernel, iterations=2)

    # 7. Connected components / Contours extraction
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
        foreground,
        connectivity=8
    )

    if num_labels <= 1:
        return None

    candidates = []

    # 8. Component-area filtering
    for i in range(1, num_labels):
        x = stats[i, cv2.CC_STAT_LEFT]
        y = stats[i, cv2.CC_STAT_TOP]
        bw = stats[i, cv2.CC_STAT_WIDTH]
        bh = stats[i, cv2.CC_STAT_HEIGHT]
        area = stats[i, cv2.CC_STAT_AREA]
        
        box_area = bw * bh
        
        # Filter out tiny noise and massive background components
        if area >= image_area * MIN_AREA_RATIO and box_area <= image_area * MAX_AREA_RATIO:
            candidates.append((area, x, y, bw, bh))

    if not candidates:
        return None

    # 9. Find largest valid foreground component
    candidates.sort(reverse=True, key=lambda c: c[0])
    _, x, y, bw, bh = candidates[0]

    # 10. Bounding-box padding
    padding_x = int(bw * PADDING_RATIO)
    padding_y = int(bh * PADDING_RATIO)

    x1 = max(0, x - padding_x)
    y1 = max(0, y - padding_y)
    x2 = min(w - 1, x + bw + padding_x)
    y2 = min(h - 1, y + bh + padding_y)

    return (x1, y1, x2, y2)
