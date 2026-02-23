import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Camera, Upload, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { predictDisease } from "@/services/api";
import {
  USER_PROFILE_UPDATED_EVENT,
  defaultProfile,
  getUserProfile,
  t,
  type UserProfile,
} from "@/lib/appSettings";

const Scan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const tr = (key: string) => t(profile.language, key);

  useEffect(() => {
    const loadProfile = () => setProfile(getUserProfile());
    loadProfile();

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "userProfile") {
        loadProfile();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(USER_PROFILE_UPDATED_EVENT, loadProfile);
    window.addEventListener("focus", loadProfile);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(USER_PROFILE_UPDATED_EVENT, loadProfile);
      window.removeEventListener("focus", loadProfile);
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e);
  };

  const handleScan = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    try {
      const result = await predictDisease(imageFile);
      
      // Save to history
      const scanResult = {
        id: Date.now().toString(),
        disease: result.disease,
        date: new Date().toLocaleDateString(),
        severity: result.severity,
        thumbnail: image,
        result: result,
      };

      const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
      history.unshift(scanResult);
      localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 50)));

      // Navigate to result page
      navigate("/result", { state: { result, image } });
    } catch (error) {
      alert(tr("scanImageError"));
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 flex items-center gap-4">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">{tr("scanFishShrimp")}</h1>
      </div>

      <div className="px-4 mt-6 space-y-6 max-w-md mx-auto">
        {/* Upload Area */}
        {!image ? (
          <Card className="p-8 text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
              <Camera className="h-16 w-16 text-cyan-600" />
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                size="lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                {tr("openCamera")}
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Upload className="h-5 w-5 mr-2" />
                {tr("chooseFromGallery")}
              </Button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </Card>
        ) : (
          <>
            {/* Image Preview */}
            <Card className="p-4 relative">
              <Button
                onClick={clearImage}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
              >
                <X className="h-5 w-5" />
              </Button>
              <img
                src={image}
                alt={tr("selectedImage")}
                className="w-full h-auto rounded-lg"
              />
            </Card>

            {/* Scan Button */}
            <Button
              onClick={handleScan}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  {tr("analyzingImage")}
                </div>
              ) : (
                tr("testNow")
              )}
            </Button>
          </>
        )}

        {/* Loading Animation */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-8 text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-200" />
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-lg font-semibold text-cyan-600">
                {tr("analyzingImage")}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;
