import { Fish } from "lucide-react";

const AppHeader = () => {
  return (
    <header className="w-full px-4 py-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Fish className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Fish Disease Detector
        </h1>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        AI-powered disease identification for aquaculture
      </p>
    </header>
  );
};

export default AppHeader;
