from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import io
import os

from tensorflow.keras.models import load_model

app = FastAPI()
# test comment
# CORS (React support)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = os.path.dirname(__file__)

type_model = load_model(os.path.join(BASE_DIR, "model", "type_classifier.h5"))
fish_model = load_model(os.path.join(BASE_DIR, "model", "fish_disease_model.h5"))
shrimp_model = load_model(os.path.join(BASE_DIR, "model", "shrimp_disease_model.h5"))

# ✅ FINAL CLASS MAPPING
fish_classes = {
    0: "Red Spot Disease",
    1: "Hemorrhagic Septicemia",
    2: "Gill Disease",
    3: "Fungal Infection",
    4: "Healthy",
    5: "Parasitic Infection",
    6: "Fin Rot / Tail Rot"
}

shrimp_classes = {
    0: "Black Spot Disease",
    1: "White Syndrome (Shell Damage)",
    2: "Red Body Disease",
    3: "White Muscle Disease"
}

# ✅ SMART ADVISORY DATA
disease_info = {
    "Red Spot Disease": {
        "symptoms": "Red lesions on body",
        "causes": "Bacterial infection",
        "treatment": "Use antibacterial medicines",
        "prevention": "Maintain clean water"
    },
    "Hemorrhagic Septicemia": {
        "symptoms": "Bleeding, red streaks",
        "causes": "Severe bacterial infection",
        "treatment": "Antibiotics + water treatment",
        "prevention": "Avoid overcrowding"
    },
    "Gill Disease": {
        "symptoms": "Damaged gills, breathing issues",
        "causes": "Poor water quality",
        "treatment": "Salt bath treatment",
        "prevention": "Maintain oxygen levels"
    },
    "Fungal Infection": {
        "symptoms": "White cotton-like patches",
        "causes": "Fungal growth",
        "treatment": "Antifungal medicine",
        "prevention": "Avoid injuries"
    },
    "Healthy": {
        "symptoms": "No visible disease",
        "causes": "—",
        "treatment": "No treatment needed",
        "prevention": "Maintain water quality"
    },
    "Parasitic Infection": {
        "symptoms": "Scratching behavior",
        "causes": "Parasites",
        "treatment": "Anti-parasitic drugs",
        "prevention": "Quarantine new fish"
    },
    "Fin Rot / Tail Rot": {
        "symptoms": "Damaged fins/tail",
        "causes": "Bacteria or poor water",
        "treatment": "Antibiotics",
        "prevention": "Clean environment"
    },

    # Shrimp
    "Black Spot Disease": {
        "symptoms": "Black spots on shell",
        "causes": "Bacterial infection",
        "treatment": "Water treatment",
        "prevention": "Clean pond"
    },
    "White Syndrome (Shell Damage)": {
        "symptoms": "White patches, shell damage",
        "causes": "Virus or bacteria",
        "treatment": "Isolate infected",
        "prevention": "Avoid contamination"
    },
    "Red Body Disease": {
        "symptoms": "Red body color",
        "causes": "Stress/infection",
        "treatment": "Improve water quality",
        "prevention": "Maintain pH"
    },
    "White Muscle Disease": {
        "symptoms": "White muscle tissue",
        "causes": "Viral infection",
        "treatment": "No cure, isolate",
        "prevention": "Biosecurity measures"
    }
}

# Preprocess
def preprocess_image(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.get("/")
def home():
    return {"message": "Aqua Health System API running 🚀"}

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        img = preprocess_image(image)

        # 🔹 Step 1: Type classification
        type_pred = float(type_model.predict(img)[0][0])

        if type_pred < 0.5:
            obj_type = "Fish 🐟"
            disease_model = fish_model
            class_map = fish_classes
        else:
            obj_type = "Shrimp 🦐"
            disease_model = shrimp_model
            class_map = shrimp_classes

        # 🔹 Step 2: Disease prediction
        probs = disease_model.predict(img)[0]
        index = int(np.argmax(probs))
        confidence = float(probs[index])

        disease_name = class_map[index]

        # 🔥 Step 3: UNKNOWN DETECTION
        if confidence < 0.5:
            return {
                "type": obj_type,
                "disease": "Unknown Disease",
                "confidence": round(confidence * 100, 2),
                "severity": "Uncertain",
                "message": "This disease is not recognized in the trained dataset. Please consult an aquaculture expert."
            }

        # 🔹 Step 4: Severity
        if confidence > 0.8:
            severity = "High"
        elif confidence > 0.6:
            severity = "Moderate"
        else:
            severity = "Low"

        # 🔹 Step 5: Detailed advisory
        info = disease_info.get(disease_name, {})

        return {
            "type": obj_type,
            "disease": disease_name,
            "confidence": round(confidence * 100, 2),
            "severity": severity,
            "symptoms": info.get("symptoms", ""),
            "causes": info.get("causes", ""),
            "treatment": info.get("treatment", ""),
            "prevention": info.get("prevention", "")
        }

    except Exception as e:
        return {"error": str(e)}