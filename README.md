# AHS Project Workflow and Technical Documentation

## 1. Project Summary

AHS is an end-to-end fish and shrimp disease detection system with:

- `backend/`: FastAPI inference service using TensorFlow/Keras models
- `frontend/`: React + Vite + TypeScript web/mobile UI (Capacitor Android enabled)

The system classifies an uploaded image in 2 stages:

1. Animal type detection (`fish` vs `shrimp`)
2. Disease classification using type-specific model

It returns disease advisory details (symptoms, causes, treatment, prevention) and severity guidance.

---

## 2. Repository Structure

```text
AHS/
  backend/
    main.py
    model/
      type_classifier.h5
      fish_disease_model.h5
      shrimp_disease_model.h5
    training/
      train_type_model.py
      train_fish_model.py
      train_shrimp_model.py
      compute_weights.py
    Maindataset/
      download_dataset.py
      analyze_dataset.py
      create_type_dataset.py
      balance_type_dataset.py
      create_fish_dataset.py
      balance_shrimp_dataset.py
      view_samples.py
      check_labels.py
      dataset/
        raw/
        type/
        type_balanced/
      fish_disease/
      shrimp_disease/
  frontend/
    src/
      pages/
      services/
      data/
      lib/
    android/
    capacitor.config.ts
    vite.config.ts
```

---

## 3. Technology Stack

### Backend

- Python 3.11
- FastAPI + Uvicorn
- TensorFlow / Keras
- Pillow (image preprocessing)
- NumPy

See `backend/requirements.txt` and `backend/runtime.txt`.

### Frontend

- React 18 + TypeScript
- Vite
- React Router DOM
- TanStack Query
- Tailwind + shadcn-ui + Radix UI
- Capacitor (Android packaging)

See `frontend/package.json`.

---

## 4. ML Models Used

Three model files are loaded by `backend/main.py`:

1. `type_classifier.h5`
   - Purpose: binary type classification (`fish` vs `shrimp`)
   - Training script: `backend/training/train_type_model.py`
   - Architecture: MobileNetV2 base (`include_top=False`, ImageNet weights), frozen base, GAP + Dense(128, relu) + Dense(1, sigmoid)
   - Input size: `224x224x3`

2. `fish_disease_model.h5`
   - Purpose: fish disease multiclass classification (7 classes)
   - Training script: `backend/training/train_fish_model.py`
   - Architecture: MobileNetV2 base, frozen base, GAP + Dense(128, relu) + Dropout(0.5) + Dense(7, softmax)
   - Input size: `224x224x3`

3. `shrimp_disease_model.h5`
   - Purpose: shrimp disease multiclass classification (4 classes)
   - Training script: `backend/training/train_shrimp_model.py`
   - Architecture: MobileNetV2 base, frozen base, GAP + Dense(128, relu) + Dropout(0.5) + Dense(4, softmax)
   - Input size: `224x224x3`

### Inference-time Class Mapping

In `backend/main.py`:

- Fish class indices (0-6) map to:
  - `Red Spot Disease`
  - `Hemorrhagic Septicemia`
  - `Gill Disease`
  - `Fungal Infection`
  - `Healthy`
  - `Parasitic Infection`
  - `Fin Rot / Tail Rot`

- Shrimp original labels are numeric folders `7, 8, 9, 10`
- Because Keras sorts folder names lexicographically, index order becomes `10, 7, 8, 9`
- Runtime mapping is explicitly corrected in code before returning disease names.

---

## 5. Dataset and Training Workflow

## 5.1 Source Dataset

- Dataset source script: `backend/Maindataset/download_dataset.py`
- Dataset ID: `Saon110/bd-fish-disease-dataset` (Hugging Face datasets)
- Raw output format: `Maindataset/dataset/raw/<split>/<label>/image.jpg`

## 5.2 Label Groups

- Fish labels: `0,1,2,3,4,5,6`
- Shrimp labels: `7,8,9,10`

## 5.3 Preparation Scripts

1. `create_fish_dataset.py`
   - Copies fish classes from raw training split to fish-only training directory.

2. `balance_shrimp_dataset.py`
   - Copies shrimp classes to shrimp training directory.
   - Downsamples classes over target count (`TARGET_COUNT=400`) for balancing.

3. `create_type_dataset.py`
   - Creates binary type dataset (`fish` and `shrimp`) from all class folders.
   - Prefixes filename with class id to avoid collisions.

4. `balance_type_dataset.py`
   - Balances type classes to target size (`TARGET=1400`) using downsampling.

5. `analyze_dataset.py` / `view_samples.py`
   - Distribution checks and quick visual inspection.

6. `compute_weights.py`
   - Computes class weights from raw training labels.

## 5.4 Training Scripts

- `train_type_model.py`: binary classifier
- `train_fish_model.py`: 7-class fish disease classifier
- `train_shrimp_model.py`: 4-class shrimp disease classifier

All use image normalization (`rescale=1./255`) and augmentation.

---

## 6. Backend Runtime Workflow

Main service file: `backend/main.py`

### 6.1 Startup

- Initializes FastAPI app
- Enables permissive CORS (`allow_origins=["*"]`)
- Loads all 3 model files into memory
- Builds disease metadata dictionary (`disease_info`) for advisory text

### 6.2 API Endpoints

1. `GET /`
   - Returns service-up message

2. `GET /health`
   - Returns health status (`{"status":"ok"}`)

3. `POST /predict/`
   - Input: multipart form-data with `file`
   - Pipeline:
     1. Read image bytes
     2. Convert to RGB
     3. Resize to `224x224`
     4. Normalize [0..1]
     5. Predict type via `type_model`
     6. Route to fish or shrimp disease model
     7. Compute top class + confidence
     8. If confidence < 0.5, return `Unknown Disease`
     9. Else compute severity:
        - `> 0.8` -> `High`
        - `> 0.6` -> `Moderate`
        - else -> `Low`
    10. Attach advisory info (`symptoms`, `causes`, `treatment`, `prevention`)

### 6.3 Response Payload Shape

Typical successful response:

```json
{
  "type": "Fish 🐟",
  "disease": "Red Spot Disease",
  "confidence": 91.27,
  "severity": "High",
  "symptoms": "...",
  "causes": "...",
  "treatment": "...",
  "prevention": "..."
}
```

Unknown response path includes:

```json
{
  "disease": "Unknown Disease",
  "severity": "Uncertain",
  "message": "This disease is not recognized in the trained dataset..."
}
```

---

## 7. Frontend Runtime Workflow

Root frontend app entry:

- `frontend/src/main.tsx` -> mounts app
- `frontend/src/App.tsx` -> Router + providers

### 7.0 Frontend Overview

The frontend is a React + Vite + TypeScript app with:

- React 18
- TypeScript
- Vite
- React Router DOM
- TanStack Query
- Tailwind CSS
- shadcn/ui and Radix UI components
- Capacitor for Android packaging

### 7.1 Routing Map

- `/` -> Home
- `/scan` -> Scan
- `/result` -> Result
- `/disease-library` -> Disease list
- `/disease-library/:id` -> Disease detail
- `/history` -> Scan history
- `/profile` -> User profile/settings
- `*` -> NotFound

### 7.2 API Integration

File: `frontend/src/services/api.ts`

- In dev: `API_URL = http://localhost:8000`
- In prod: `API_URL = VITE_API_URL` fallback `http://localhost:8000`
- Uploads image to `POST ${API_URL}/predict/`

### 7.3 User Scan Flow (Active)

1. Home page action buttons route to scan mode.
2. Scan page lets user capture (`capture=environment`) or upload image.
3. Frontend calls `predictDisease(file)`.
4. Receives backend result.
5. Saves scan to browser localStorage key `scanHistory` (max 50 entries).
6. Navigates to `/result` with route state `{ result, image }`.
7. Result page renders prediction + advisory details.
8. History page reads, filters, paginates, copies/shares/deletes past scans.

### 7.4 Local State Persistence

- `scanHistory` (localStorage)
- `userProfile` (localStorage)

File `frontend/src/lib/appSettings.ts` manages:

- User profile schema
- Save/read profile utilities
- i18n translations (`english`, `hindi`, `telugu`)
- Severity/type translation helpers

### 7.5 Disease Library

- Static data file: `frontend/src/data/diseaseLibrary.ts`
- Supports search + fish/shrimp filtering
- Disease detail page shows causes/treatment/prevention from static content

### 7.6 Legacy/Alternate UI Path (Not Routed)

`frontend/src/pages/Index.tsx` and related components (`AppHeader`, `ImageUpload`, `DetectionButton`, `ResultsSection`) represent an alternate detector UX but are not connected in `App.tsx` route definitions.

### 7.7 API Integration

File: `frontend/src/services/api.ts`

- In dev: `API_URL = http://localhost:8000`
- In prod: `API_URL = VITE_API_URL` fallback `http://localhost:8000`
- Uploads image to `POST ${API_URL}/predict/`
- Health check uses `GET ${API_URL}/`

### 7.8 Local Setup

1. Install dependencies.

```powershell
cd C:\AHS\frontend
npm install
```

2. Start the frontend dev server.

```powershell
npm run dev
```

3. Optional: point the frontend to a deployed backend by setting `VITE_API_URL`.

### 7.9 Available Scripts

- `npm run dev` -> Start Vite dev server
- `npm run build` -> Build for production
- `npm run preview` -> Preview the production build locally
- `npm run lint` -> Run ESLint
- `npm run test` -> Run Vitest once
- `npm run test:watch` -> Run Vitest in watch mode

### 7.10 Android Build

The project includes Capacitor Android support under `frontend/android/`.

Typical release flow:

```powershell
cd C:\AHS\frontend
npm run build
npx cap sync android
npx cap open android
```

Make sure the production backend URL is configured before building the mobile app.

### 7.11 Frontend Notes

- Scan history is stored in browser local storage under `scanHistory`.
- Profile data is stored in browser local storage under `userProfile`.
- Disease reference data lives in `frontend/src/data/diseaseLibrary.ts`.

---

## 8. Dev/Execution Commands

## 8.1 Backend

```powershell
cd C:\AHS\backend
& .\.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

## 8.2 Frontend

```powershell
cd C:\AHS\frontend
npm run dev
```

Default dev URLs:

- Frontend: Vite on port `8080`
- Backend: FastAPI on port `8000`

---

## 9. Mobile (Android) Workflow

Capacitor is configured in `frontend/capacitor.config.ts`:

- `appId`: `com.aquahealth.fishdetector`
- Web build directory: `dist`
- Android scheme: `https`
- `cleartext: true`

Build flow (after setting production API URL):

```bash
npm run build
npx cap sync android
npx cap open android
```

Then build APK from Android Studio.

---

## 10. Deployment Workflow

## 10.1 Backend Deployment

Configuration files:

- `backend/Procfile`
- `backend/render.yaml`

Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## 10.2 Frontend Deployment

- Deploy static Vite output (`dist`) to Vercel/Netlify/etc.
- Set `VITE_API_URL` to deployed backend URL.

## 10.3 Production Wiring

1. Deploy backend
2. Copy backend URL
3. Set frontend production env `VITE_API_URL`
4. Build and deploy frontend
5. For APK: rebuild + sync capacitor with production URL

---

## 11. Configuration Notes and Caveats

1. TypeScript config
   - `frontend/tsconfig.app.json` includes path alias support with `baseUrl` + `paths`.
   - `ignoreDeprecations` is set to `6.0` to suppress current TS deprecation warning for `baseUrl`.

2. Documentation drift exists
   - Some docs reference old folder names (`C:\projects\...`) from earlier setup; current workspace root is `C:\AHS`.

3. Backend docs vs implementation
   - Some external docs mention `/predict` without trailing slash and different `/health` payload.
   - Current implemented endpoint is `/predict/` and health payload is `{"status":"ok"}`.

4. Model files are required at runtime
   - Missing `.h5` files under `backend/model/` will break backend startup.

---

## 12. End-to-End Sequence Diagram (Text)

1. User opens frontend app (`/`).
2. User selects image on Scan page.
3. Frontend sends multipart request to backend `/predict/`.
4. Backend preprocesses image and runs type model.
5. Backend chooses fish or shrimp disease model.
6. Backend computes top class and confidence.
7. Backend attaches advisory metadata and returns JSON.
8. Frontend stores result in local history and displays Result page.
9. User can revisit in History or explore static Disease Library.

---

## 13. Quick Validation Checklist

- Backend starts and responds at `/health`
- Frontend starts and opens in browser
- Upload image from `/scan`
- Prediction appears on `/result`
- Entry appears in `/history`
- Language change in `/profile` updates text globally

---

## 14. Recommended Next Improvements

1. Add persistent backend database for scan records (currently browser-only).
2. Add model versioning and model metadata endpoint.
3. Add API contract tests for `/predict/` response schema.
4. Unify docs to remove old path references and endpoint drift.
5. Decide whether to delete or integrate legacy `pages/Index.tsx` flow.
