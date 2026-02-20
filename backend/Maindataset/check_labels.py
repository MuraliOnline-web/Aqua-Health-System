from datasets import load_dataset

dataset = load_dataset("Saon110/bd-fish-disease-dataset")

print(dataset["train"].features["label"].names)
