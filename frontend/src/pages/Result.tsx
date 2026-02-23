import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Save, RotateCcw, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  USER_PROFILE_UPDATED_EVENT,
  defaultProfile,
  getUserProfile,
  t,
  translateSeverity,
  type UserProfile,
} from "@/lib/appSettings";

interface DetectionResult {
  type: string;
  disease: string;
  confidence: number;
  severity: string;
  symptoms: string;
  causes: string;
  treatment: string;
  prevention: string;
}

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const state = location.state as { result?: DetectionResult; image?: string } | undefined;
  const result = state?.result;
  const image = state?.image;

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

  if (!result || !image) {
    navigate("/scan");
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "destructive";
      case "moderate":
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "outline";
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tr("detectionResult"),
        text: `${tr("diseaseDetected")}: ${result.disease} (${result.confidence}% ${tr("confidence")})`,
      });
    }
  };

  const handleSave = () => {
    alert(tr("reportSaved"));
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
        <h1 className="text-xl font-bold">{tr("detectionResult")}</h1>
      </div>

      <div className="px-4 mt-6 space-y-4 max-w-md mx-auto">
        {/* Image Display */}
        <Card className="p-4">
          <img src={image} alt="Scanned" className="w-full h-auto rounded-lg" />
        </Card>

        {/* Prediction Result */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{tr("type")}</p>
              <p className="text-lg font-semibold">{result.type}</p>
            </div>
            <Badge variant={getSeverityColor(result.severity)} className="text-sm">
              {translateSeverity(profile.language, result.severity)}
            </Badge>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-gray-500">{tr("diseaseDetected")}</p>
            <p className="text-2xl font-bold text-cyan-600">{result.disease}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">{tr("confidenceScore")}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <span className="font-semibold">{result.confidence}%</span>
            </div>
          </div>
        </Card>

        {/* Advisory Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            {tr("advisoryInformation")}
          </h2>

          {result.symptoms && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">🔍 {tr("symptoms")}</p>
              <p className="text-sm text-gray-600">{result.symptoms}</p>
            </div>
          )}

          {result.causes && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">🧪 {tr("causes")}</p>
              <p className="text-sm text-gray-600">{result.causes}</p>
            </div>
          )}

          {result.treatment && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-blue-700 mb-1">💊 {tr("treatment")}</p>
              <p className="text-sm text-blue-600">{result.treatment}</p>
            </div>
          )}

          {result.prevention && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-green-700 mb-1 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                {tr("prevention")}
              </p>
              <p className="text-sm text-green-600">{result.prevention}</p>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={handleSave} variant="outline" className="flex-col h-auto py-3">
            <Save className="h-5 w-5 mb-1" />
            <span className="text-xs">{tr("save")}</span>
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-col h-auto py-3">
            <Share2 className="h-5 w-5 mb-1" />
            <span className="text-xs">{tr("share")}</span>
          </Button>
          <Button
            onClick={() => navigate("/scan")}
            variant="outline"
            className="flex-col h-auto py-3"
          >
            <RotateCcw className="h-5 w-5 mb-1" />
            <span className="text-xs">{tr("testFurther")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Result;
