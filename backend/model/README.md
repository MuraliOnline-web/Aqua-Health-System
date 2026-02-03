---
tags:
- image-classification
- vision-transformer
- fish-disease
- shrimp-disease
- aquaculture
- disease-detection
- computer-vision
- pytorch
- agriculture
datasets:
- Saon110/bd-fish-disease-dataset
metrics:
- accuracy
- f1
library_name: transformers
license: apache-2.0
language:
- en
pipeline_tag: image-classification
base_model:
- google/vit-base-patch16-224
---

# 🐟🦐 Fish & Shrimp Disease Classification Model

This model is a fine-tuned version of [google/vit-base-patch16-224](https://huggingface.co/google/vit-base-patch16-224) on the [BD Fish & Shrimp Disease Dataset](https://huggingface.co/datasets/Saon110/bd-fish-disease-dataset).

## 📊 Model Performance

The model achieves excellent results on the evaluation set:
- **Test Accuracy**: 0.9832 (98.32%)
- **Test F1-Score**: 0.9832 (98.32%)
- **Validation Accuracy**: 0.9881 (98.81%)
- **Validation F1-Score**: 0.9881 (98.81%)
- **Test Loss**: 0.0751

## 🎯 Model Description

This Vision Transformer (ViT) model is specifically designed for automated disease detection in aquaculture, focusing on fish and shrimp health monitoring. The model can classify 11 different disease conditions across fish and shrimp species, making it valuable for:

- **Aquaculture Disease Management**: Early detection of diseases in fish and shrimp farms
- **Veterinary Diagnostics**: Supporting veterinarians in disease identification
- **Research Applications**: Automated analysis of aquatic animal health
- **Educational Tools**: Teaching disease recognition in aquaculture programs

## 🏷️ Disease Classes

The model can detect and classify the following 11 conditions:

### Fish Diseases (7 classes):
1. **Fish_Bacterial Red disease** - Bacterial infection causing redness
2. **Fish_Bacterial diseases - Aeromoniasis** - Common bacterial infection in fish
3. **Fish_Bacterial gill disease** - Bacterial infection affecting gills
4. **Fish_Fungal diseases Saprolegniasis** - Fungal infection with cotton-like growth
5. **Fish_Healthy Fish** - Healthy fish without visible diseases
6. **Fish_Parasitic diseases** - Various parasitic infections
7. **Fish_Viral diseases White tail disease** - Viral infection affecting tail region

### Shrimp Diseases (4 classes):
8. **Shrimp_Black_Gill** - Bacterial infection causing black gills
9. **Shrimp_Healthy** - Healthy shrimp without diseases
10. **Shrimp_White_Spot_Syndrome_Virus** - Viral disease causing white spots
11. **Shrimp_White_Spot_Syndrome_Virus_and_Black_Gill** - Combined viral and bacterial infection

## 🗂️ Dataset Information

**Dataset**: [BD Fish & Shrimp Disease Dataset](https://huggingface.co/datasets/Saon110/bd-fish-disease-dataset)

### Dataset Statistics:
- **Total Images**: 5,887 images
- **Training Set**: 4,118 images
- **Validation Set**: 1,175 images  
- **Test Set**: 594 images
- **Image Features**: RGB images with variable dimensions
- **Classes**: 11 disease conditions (7 fish + 4 shrimp)

### Class Distribution in Training Set:
- Fish_Bacterial Red disease: 207 images
- Fish_Bacterial diseases - Aeromoniasis: 207 images
- Fish_Bacterial gill disease: 203 images
- Fish_Fungal diseases Saprolegniasis: 205 images
- Fish_Healthy Fish: 210 images
- Fish_Parasitic diseases: 212 images
- Fish_Viral diseases White tail disease: 212 images
- Shrimp_Black_Gill: 388 images
- Shrimp_Healthy: 1,484 images
- Shrimp_White_Spot_Syndrome_Virus: 381 images
- Shrimp_White_Spot_Syndrome_Virus_and_Black_Gill: 409 images

## 🚀 Usage

### Quick Start with Pipeline

```python
from transformers import pipeline
from PIL import Image

# Load the model
classifier = pipeline("image-classification", model="Saon110/fish-shrimp-disease-classifier")

# Load an image
image = Image.open("path/to/fish_or_shrimp_image.jpg")

# Get predictions
predictions = classifier(image)
print(predictions)

# Output example:
# [
#   {'label': 'Fish_Healthy Fish', 'score': 0.9876},
#   {'label': 'Fish_Bacterial Red disease', 'score': 0.0098},
#   {'label': 'Fish_Parasitic diseases', 'score': 0.0026}
# ]
```

### Advanced Usage with Custom Processing

```python
from transformers import ViTImageProcessor, ViTForImageClassification
import torch
from PIL import Image

# Load model and processor
processor = ViTImageProcessor.from_pretrained("saon110/fish-shrimp-disease-classifier")
model = ViTForImageClassification.from_pretrained("saon110/fish-shrimp-disease-classifier")

# Prepare image
image = Image.open("path/to/image.jpg")
inputs = processor(images=image, return_tensors="pt")

# Get predictions
with torch.no_grad():
    outputs = model(**inputs)
    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
    predicted_class_id = predictions.argmax().item()
    confidence = predictions.max().item()

print(f"Predicted class: {model.config.id2label[predicted_class_id]}")
print(f"Confidence: {confidence:.4f}")
```

## 🎯 Intended Uses & Limitations

### ✅ Intended Uses:
- **Aquaculture Monitoring**: Automated disease detection in fish and shrimp farms
- **Veterinary Support**: Assisting veterinarians in preliminary disease screening
- **Research**: Supporting aquaculture disease research and data collection
- **Education**: Teaching disease recognition in aquaculture and veterinary programs
- **Quality Control**: Monitoring health status in aquaculture production

### ⚠️ Limitations:
- **Domain Specificity**: Trained specifically on fish and shrimp; may not generalize to other aquatic species
- **Image Quality**: Performance may degrade with poor lighting, blurry, or low-resolution images
- **Disease Stages**: May have varying accuracy across different stages of disease progression
- **Geographic Variation**: Trained on specific dataset; disease manifestations may vary by region
- **Clinical Diagnosis**: Should not replace professional veterinary diagnosis for treatment decisions

### 🚨 Important Notes:
- This model is intended for research and educational purposes
- Always consult qualified veterinary professionals for clinical diagnoses
- Model predictions should be validated against expert knowledge
- Performance may vary with different imaging conditions

## 🔬 Training Details

### Training Procedure

The model was fine-tuned using the following configuration:

**Base Model**: google/vit-base-patch16-224 (Vision Transformer)
**Fine-tuning Strategy**: Full model fine-tuning
**Image Resolution**: 224x224 pixels
**Data Augmentation**: Standard ViT preprocessing (resize, normalize)

### Training Hyperparameters:
- **Learning Rate**: 2e-05
- **Batch Size**: 16 (per device)
- **Number of Epochs**: 10
- **Optimizer**: AdamW with β₁=0.9, β₂=0.999, ε=1e-08
- **Learning Rate Schedule**: Linear with 10% warmup
- **Mixed Precision**: FP16 (Native AMP)
- **Evaluation Strategy**: Every epoch
- **Metric for Best Model**: Accuracy

### Training Results:

| Epoch | Training Loss | Validation Loss | Accuracy | F1-Score |
|:-----:|:-------------:|:---------------:|:--------:|:--------:|
| 1.0   | 1.2277        | 0.6380          | 0.8485   | 0.8463   |
| 2.0   | 0.2783        | 0.2241          | 0.9464   | 0.9460   |
| 3.0   | 0.0673        | 0.0811          | 0.9779   | 0.9777   |
| 4.0   | 0.0132        | 0.0470          | 0.9847   | 0.9846   |
| 5.0   | 0.0058        | 0.0496          | 0.9855   | 0.9855   |
| 6.0   | 0.0055        | 0.0469          | **0.9881** | **0.9881** |
| 7.0   | 0.0086        | 0.0580          | 0.9881   | 0.9881   |
| 8.0   | 0.0056        | 0.0605          | 0.9881   | 0.9881   |
| 9.0   | 0.0074        | 0.0662          | 0.9872   | 0.9872   |
| 10.0  | 0.0068        | 0.0628          | 0.9872   | 0.9872   |

**Best Model**: Epoch 6 with 98.81% validation accuracy

## 🛠️ Framework Versions

- **Transformers**: 4.52.4
- **PyTorch**: 2.6.0+cu124
- **Datasets**: 3.6.0
- **Tokenizers**: 0.21.2
- **Python**: 3.11+

## 📖 Citation

If you use this model in your research, please cite:

```bibtex
@misc{fish-shrimp-disease-classifier,
  title={Fish and Shrimp Disease Classification using Vision Transformer},
  author={Saon110},
  year={2024},
  publisher={Hugging Face},
  url={https://huggingface.co/Saon110/fish-shrimp-disease-classifier}
}
```

## 🤝 Contributing

We welcome contributions to improve this model! Please feel free to:
- Report issues or bugs
- Suggest improvements
- Share your use cases and results
- Contribute additional training data

## 📄 License

This model is released under the Apache 2.0 License. See the LICENSE file for details.

## 🙏 Acknowledgments

- **Dataset**: BD Fish & Shrimp Disease Dataset by Saon110
- **Base Model**: Vision Transformer (ViT) by Google Research
- **Framework**: HuggingFace Transformers library
- **Community**: HuggingFace community for tools and support

---

*For questions, issues, or collaborations, please open an issue in the model repository or contact the model authors.*