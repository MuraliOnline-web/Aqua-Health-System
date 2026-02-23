import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { diseaseLibraryData } from "@/data/diseaseLibrary";
import {
  USER_PROFILE_UPDATED_EVENT,
  defaultProfile,
  getUserProfile,
  t,
  translateType,
  type UserProfile,
} from "@/lib/appSettings";

const DiseaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

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

  const disease = diseaseLibraryData.find((d) => d.id === id);

  if (!disease) {
    navigate("/disease-library");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 flex items-center gap-4">
        <Button
          onClick={() => navigate("/disease-library")}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">{tr("diseaseDetails")}</h1>
      </div>

      <div className="px-4 mt-6 space-y-4 max-w-md mx-auto">
        {/* Disease Image */}
        <Card className="p-4">
          <div className="w-full h-48 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg" />
        </Card>

        {/* Disease Info */}
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold">{disease.name}</h2>
            <Badge variant="outline">{translateType(profile.language, disease.type)}</Badge>
          </div>

          <p className="text-gray-600">{disease.description}</p>

          <Separator />

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">🔍 {tr("symptomsToRecognize")}</p>
            <p className="text-sm text-gray-600">{disease.symptoms}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">🧪 {tr("causes")}</p>
            <p className="text-sm text-gray-600">{disease.causes}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-blue-700 mb-2">💊 {tr("treatment")}</p>
            <p className="text-sm text-blue-600">{disease.treatment}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-green-700 mb-2">🚫 {tr("prevention")}</p>
            <p className="text-sm text-green-600">{disease.prevention}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DiseaseDetail;
