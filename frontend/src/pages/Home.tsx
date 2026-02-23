import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, FileText, BookOpen, Bell, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  USER_PROFILE_UPDATED_EVENT,
  defaultProfile,
  getUserProfile,
  t,
  translateSeverity,
  type UserProfile,
} from "@/lib/appSettings";

interface RecentScan {
  id: string;
  disease: string;
  date: string;
  severity: string;
  thumbnail: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [alertsCount, setAlertsCount] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const tr = (key: string) => t(profile.language, key);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem("scanHistory");
      if (saved) {
        const history = JSON.parse(saved);
        setRecentScans(history.slice(0, 3));
        const highRisk = history.filter((s: RecentScan) => s.severity.toLowerCase() === "high").length;
        setAlertsCount(highRisk);
      } else {
        setRecentScans([]);
        setAlertsCount(0);
      }

      setProfile(getUserProfile());
    };

    loadData();

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "scanHistory" || e.key === "userProfile") {
        loadData();
      }
    };

    const handleProfileUpdate = () => loadData();
    const handleWindowFocus = () => loadData();

    window.addEventListener("storage", handleStorage);
    window.addEventListener(USER_PROFILE_UPDATED_EVENT, handleProfileUpdate);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(USER_PROFILE_UPDATED_EVENT, handleProfileUpdate);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white pb-20">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🐟 {tr("appTitle")}
            </h1>
            <p className="text-cyan-100 text-sm">{tr("appSubtitle")}</p>
          </div>
          <Button
            onClick={() => navigate("/profile")}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <User className="h-6 w-6" />
          </Button>
        </div>

        {/* Profile Summary Card */}
        <Card className="mt-4 p-4 bg-white/10 backdrop-blur border-white/20 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">{tr("welcomeBack")}</p>
              <p className="font-semibold">{profile.name || tr("defaultFarmer")}</p>
            </div>
            {alertsCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {alertsCount} {tr("alerts")}
              </Badge>
            )}
          </div>
        </Card>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Main Action Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            onClick={() => navigate("/scan?mode=camera")}
            className="p-6 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group animated-border"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-all" />
            <div className="relative z-10 text-center space-y-2">
              <Camera className="h-8 w-8 mx-auto text-cyan-600" />
              <p className="font-semibold text-sm">{tr("scanFish")}</p>
            </div>
          </Card>

          <Card
            onClick={() => navigate("/scan?mode=upload")}
            className="p-6 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group animated-border"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all" />
            <div className="relative z-10 text-center space-y-2">
              <Upload className="h-8 w-8 mx-auto text-blue-600" />
              <p className="font-semibold text-sm">{tr("uploadImage")}</p>
            </div>
          </Card>

          <Card
            onClick={() => navigate("/history")}
            className="p-6 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group animated-border"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all" />
            <div className="relative z-10 text-center space-y-2">
              <FileText className="h-8 w-8 mx-auto text-purple-600" />
              <p className="font-semibold text-sm">{tr("viewReports")}</p>
            </div>
          </Card>

          <Card
            onClick={() => navigate("/disease-library")}
            className="p-6 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group animated-border"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-red-500/10 group-hover:from-pink-500/20 group-hover:to-red-500/20 transition-all" />
            <div className="relative z-10 text-center space-y-2">
              <BookOpen className="h-8 w-8 mx-auto text-pink-600" />
              <p className="font-semibold text-sm">{tr("diseaseLibrary")}</p>
            </div>
          </Card>
        </div>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <Card className="p-4">
            <h2 className="font-semibold text-lg mb-3">{tr("recentScans")}</h2>
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate("/history")}
                >
                  <img
                    src={scan.thumbnail}
                    alt="scan"
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{scan.disease}</p>
                    <p className="text-xs text-gray-500">{scan.date}</p>
                  </div>
                  <Badge
                    variant={
                      scan.severity.toLowerCase() === "high"
                        ? "destructive"
                        : scan.severity.toLowerCase() === "moderate"
                        ? "warning"
                        : scan.severity.toLowerCase() === "low"
                        ? "success"
                        : "outline"
                    }
                  >
                    {translateSeverity(profile.language, scan.severity)}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around items-center py-3 max-w-md mx-auto">
          <Button variant="ghost" className="flex-col h-auto text-cyan-600">
            <Camera className="h-5 w-5" />
            <span className="text-xs mt-1">{tr("home")}</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-auto"
            onClick={() => navigate("/scan")}
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs mt-1">{tr("scan")}</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-auto"
            onClick={() => navigate("/history")}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs mt-1">{tr("history")}</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-col h-auto"
            onClick={() => navigate("/profile")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">{tr("profile")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
