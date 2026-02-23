import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, MapPin, Globe, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  defaultProfile,
  getUserProfile,
  saveUserProfile,
  t,
  type UserProfile,
} from "@/lib/appSettings";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const tr = (key: string) => t(profile.language, key);

  useEffect(() => {
    setProfile(getUserProfile());
  }, []);

  const handleSave = () => {
    saveUserProfile(profile);
    alert(tr("profileSaved"));
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
        <h1 className="text-xl font-bold">{tr("profileTitle")}</h1>
      </div>

      <div className="px-4 mt-6 space-y-4 max-w-md mx-auto">
        {/* Profile Avatar */}
        <Card className="p-6 text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-3">
            <User className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-sm text-gray-500">{profile.farmLocation || tr("addLocation")}</p>
        </Card>

        {/* User Details */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">{tr("userInformation")}</h3>

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {tr("name")}
            </Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder={tr("yourName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {tr("farmLocation")}
            </Label>
            <Input
              id="location"
              value={profile.farmLocation}
              onChange={(e) =>
                setProfile({ ...profile, farmLocation: e.target.value })
              }
              placeholder={tr("cityState")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {tr("language")}
            </Label>
            <Select
              value={profile.language}
              onValueChange={(value) =>
                setProfile({ ...profile, language: value as UserProfile["language"] })
              }
            >
              <SelectTrigger id="language">
                <SelectValue placeholder={tr("selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">{tr("englishLabel")}</SelectItem>
                <SelectItem value="hindi">{tr("hindiLabel")}</SelectItem>
                <SelectItem value="telugu">{tr("teluguLabel")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            {tr("saveChanges")}
          </Button>
        </Card>

        {/* Settings */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">{tr("settings")}</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="notifications">{tr("notifications")}</Label>
            </div>
            <Switch
              id="notifications"
              checked={profile.notifications}
              onCheckedChange={(checked) =>
                setProfile({ ...profile, notifications: checked })
              }
            />
          </div>
        </Card>

        {/* Help */}
        <Card className="p-6">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => alert(tr("helpComingSoon"))}
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            {tr("helpSupport")}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
