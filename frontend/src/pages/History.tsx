import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Copy, Filter, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  USER_PROFILE_UPDATED_EVENT,
  defaultProfile,
  getUserProfile,
  t,
  translateSeverity,
  type UserProfile,
} from "@/lib/appSettings";

interface ScanHistoryItem {
  id: string;
  disease: string;
  date: string;
  severity: string;
  thumbnail: string;
  result: any;
}

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const tr = (key: string) => t(profile.language, key);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem("scanHistory");
      if (saved) {
        setHistory(JSON.parse(saved));
      } else {
        setHistory([]);
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

  const filteredHistory =
    filterSeverity === "all"
      ? history
      : history.filter((item) => {
          const severity = item.severity.toLowerCase();
          if (filterSeverity === "moderate") {
            return severity === "moderate" || severity === "medium";
          }
          return severity === filterSeverity;
        });

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

  const getFilterActiveClass = (filterKey: string) => {
    switch (filterKey) {
      case "high":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "moderate":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "low":
        return "bg-green-600 hover:bg-green-700 text-white";
      default:
        return "bg-gradient-to-r from-cyan-500 to-blue-600";
    }
  };

  const handleItemClick = (item: ScanHistoryItem) => {
    navigate("/result", {
      state: { result: item.result, image: item.thumbnail },
    });
  };

  const formatHistoryText = (item: ScanHistoryItem) => {
    const confidence = item.result?.confidence ? ` (${item.result.confidence}% ${tr("confidence")})` : "";
    return `${tr("disease")}: ${item.disease}${confidence}\n${tr("severity")}: ${translateSeverity(profile.language, item.severity)}\n${tr("date")}: ${item.date}`;
  };

  const handleCopy = async (item: ScanHistoryItem) => {
    try {
      await navigator.clipboard.writeText(formatHistoryText(item));
    } catch {
      alert(tr("copyPredictionFailed"));
    }
  };

  const handleShare = async (item: ScanHistoryItem) => {
    const shareText = formatHistoryText(item);

    try {
      if (navigator.share) {
        await navigator.share({
          title: tr("aquaHealthPrediction"),
          text: shareText,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      alert(tr("shareUnavailableCopied"));
    } catch {
      alert(tr("sharePredictionFailed"));
    }
  };

  const handleDelete = (id: string) => {
    const updatedHistory = history.filter((entry) => entry.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("scanHistory", JSON.stringify(updatedHistory));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">{tr("scanHistory")}</h1>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          {[
            { key: "all", label: tr("all") },
            { key: "high", label: tr("high") },
            { key: "moderate", label: tr("moderate") },
            { key: "low", label: tr("low") },
          ].map((filter) => (
            <Button
              key={filter.key}
              onClick={() => setFilterSeverity(filter.key)}
              variant={filterSeverity === filter.key ? "default" : "outline"}
              size="sm"
              className={
                filterSeverity === filter.key
                  ? getFilterActiveClass(filter.key)
                  : ""
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <ContextMenu key={item.id}>
              <ContextMenuTrigger asChild>
                <Card
                  onClick={() => handleItemClick(item)}
                  className="p-4 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.thumbnail}
                      alt="scan"
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{item.disease}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {item.date}
                          </p>
                        </div>
                        <Badge variant={getSeverityColor(item.severity)}>
                          {translateSeverity(profile.language, item.severity)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-36">
                <ContextMenuItem onClick={() => void handleCopy(item)}>
                  <Copy className="h-4 w-4 mr-2" />
                  {tr("copy")}
                </ContextMenuItem>
                <ContextMenuItem onClick={() => void handleShare(item)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  {tr("share")}
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {tr("delete")}
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            <p>{tr("noScanHistory")}</p>
            <Button
              onClick={() => navigate("/scan")}
              className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              {tr("startScanning")}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;
