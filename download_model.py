from huggingface_hub import snapshot_download
import os

HF_TOKEN = os.getenv("HF_TOKEN")

snapshot_download(
    repo_id="Saon110/fish-shrimp-disease-classifier",
    local_dir="backend/model",
    token=HF_TOKEN
)

print("Model downloaded successfully")
