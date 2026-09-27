# Shrimp Candidate Detection & Dataset Invariants

These rules govern the development, evaluation, and data assumptions of the YOLO shrimp candidate pipeline in Aqua Health System.

## 1. Dataset Ground Truth Invariant (ShrimpDiseaseImageBD)
- **Constraint**: Under no circumstances should bounding box annotations from `ShrimpDiseaseImageBD` (`Root/Annotated Diseased Shrimp Images/`) be treated as whole-shrimp ground truth.
- **Rationale**: Those annotations are localized disease/lesion bounding boxes (e.g., individual WSSV white spot clusters, black gill necrosis patches). Calculating IoU or bounding box accuracy against these labels for a whole-shrimp detector produces false negatives and fundamentally invalid metrics.
- **Operational Requirement**: Whole-shrimp candidate evaluations must use visual ground truth or separately annotated whole-body test sets. Auxiliary centroid bonuses based on disease labels must not be relied upon for general or healthy shrimp detection.

## 2. OpenCV GrabCut Bounding Box Initialization Trapping
- **Constraint**: In OpenCV GrabCut (`cv2.grabCut`), when initializing with `GC_INIT_WITH_RECT`, the algorithm assigns `GC_BGD` (hard background) to all pixels outside the rectangle. GrabCut can *never* expand outside the bounding box passed to it.
- **Rationale**: If upstream thresholding or connected-component filtering fragments an object (e.g., segmenting only walking legs while masking out a pale carapace), GrabCut initialized on that candidate is trapped inside the fragmented box and cannot recover the missing body.

## 3. Cascaded Detector Isolation & Upstream Mask Decoupling
- **Constraint**: A secondary refinement stage (e.g., V3) must not rely on the exact same binary foreground mask as the primary baseline (V2) if the primary failure mode is upstream mask error.
- **Rationale**: When a refinement tier wraps a baseline detector but scores external contours from the identical thresholded mask, it inherits 100% of the upstream segmentation defects (e.g., boundary contacts, cut-off carapaces), producing negligible refinement.

## 4. Geometric & Boundary Interpretation Rules
- **Boundary Contacts**: A boundary-touching candidate box must NOT be automatically assumed to be background noise. In over 70% of boundary contacts in this dataset, the biological specimen physically touches or is cropped by the camera frame edge.
- **Oversized Boxes (>= 70%)**: An axis-aligned bounding box enclosing >= 70% of image area must NOT be assumed to be a tank floor segmentation failure without checking contour solidity. C-shaped or diagonal shrimp spanning the frame mathematically produce large axis-aligned boxes while tightly framing the specimen.
