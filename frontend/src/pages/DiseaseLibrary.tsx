import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { diseaseLibraryData } from "@/data/diseaseLibrary";
import {
  USER_PROFILE_UPDATED_EVENT,
  defaultProfile,
  getUserProfile,
  t,
  translateType,
  type UserProfile,
} from "@/lib/appSettings";

const DiseaseLibrary = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
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

  const filters = [
    { key: "all", label: tr("all") },
    { key: "fish", label: tr("fish") },
    { key: "shrimp", label: tr("shrimp") },
  ];

  const filteredDiseases = diseaseLibraryData.filter((disease) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const searchableText = [
      disease.name,
      disease.symptoms,
      disease.description,
      disease.causes,
      disease.treatment,
      disease.prevention,
      disease.type,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);
    const matchesFilter =
      selectedFilter === "all" || disease.type.toLowerCase() === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-xl font-bold">{tr("diseaseLibrary")}</h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tr("searchDiseasesSymptoms")}
            className="pl-10 bg-white text-gray-900 placeholder:text-gray-500 caret-gray-900"
          />
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              variant={selectedFilter === filter.key ? "default" : "outline"}
              size="sm"
              className={
                selectedFilter === filter.key
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                  : ""
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Disease Cards */}
        <div className="space-y-3">
          {filteredDiseases.map((disease) => (
            <Card
              key={disease.id}
              onClick={() => navigate(`/disease-library/${disease.id}`)}
              className="p-4 hover:shadow-lg transition-all cursor-pointer animated-border"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="mb-1">
                    <h3 className="font-semibold">{disease.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {disease.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-medium">{tr("symptomsLabel")}:</span> {disease.symptoms}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    <span className="font-medium">{tr("cause")}:</span> {disease.causes}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">{tr("type")}:</span> {translateType(profile.language, disease.type)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredDiseases.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            <p>{tr("noDiseasesFound")}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DiseaseLibrary;
