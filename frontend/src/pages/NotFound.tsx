import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  USER_PROFILE_UPDATED_EVENT,
  defaultProfile,
  getUserProfile,
  t,
  type UserProfile,
} from "@/lib/appSettings";

const NotFound = () => {
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const tr = (key: string) => t(profile.language, key);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{tr("pageNotFound")}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {tr("returnHome")}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
