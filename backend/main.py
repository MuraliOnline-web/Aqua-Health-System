from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import io
import os

from tensorflow.keras.models import load_model

app = FastAPI()

# Allow frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODEL_PATH = os.path.join("model", "type_classifier.h5")
model = load_model(MODEL_PATH)

# Image preprocessing
def preprocess_image(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        img = preprocess_image(image)

        prediction = model.predict(img)[0][0]

        if prediction < 0.5:
            label = "Fish 🐟"
            confidence = (1 - prediction) * 100
        else:
            label = "Shrimp 🦐"
            confidence = prediction * 100

        return {
            "type": label,
            "confidence": round(float(confidence), 2)
        }

    except Exception as e:
        return {"error": str(e)}
