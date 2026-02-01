import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import ImageUpload from "@/components/ImageUpload";
import DetectionButton from "@/components/DetectionButton";
import ResultsSection, { DetectionResult } from "@/components/ResultsSection";
import ErrorMessage from "@/components/ErrorMessage";

const API_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_URL || "/api";

const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (selectedImage: string, file?: File) => {
    setImage(selectedImage);
    if (file) {
      setImageFile(file);
    }
    setResult(null);
    setError(null);
  };

  const handleImageClear = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError(null);
  };

  const handleDetect = async () => {
    if (!imageFile) {
      setError("No image file selected");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();

      const mappedResult: DetectionResult = {
        diseaseName: data.disease_name || data.label?.replace("Fish_", "") || "Unknown",
        confidence: Math.round((data.confidence || data.score || 0) * 100),
        cause: data.cause || "Information not available from detection model",
        severity: data.severity || "Medium",
        treatment: data.treatment || "Consult a fish disease specialist for proper treatment",
      };

      setResult(mappedResult);
    } catch (err) {
      setError("Unable to connect to detection service. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    handleDetect();
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-md mx-auto">
        <AppHeader />

        <div className="space-y-6">
          <ImageUpload
            image={image}
            onImageSelect={handleImageSelect}
            onImageClear={handleImageClear}
          />

          {image && !result && !error && (
            <DetectionButton isLoading={isLoading} onDetect={handleDetect} />
          )}

          {error && <ErrorMessage message={error} onRetry={handleRetry} />}

          {result && <ResultsSection result={result} />}
        </div>

        <footer className="mt-8 text-center px-4">
          <p className="text-xs text-muted-foreground">
            Powered by AI • For professional aquaculture use
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
