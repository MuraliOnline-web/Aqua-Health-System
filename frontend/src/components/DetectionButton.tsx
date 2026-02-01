import { Scan, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetectionButtonProps {
  isLoading: boolean;
  onDetect: () => void;
}

const DetectionButton = ({ isLoading, onDetect }: DetectionButtonProps) => {
  return (
    <section className="px-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <Button
        size="lg"
        className="w-full"
        onClick={onDetect}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin-slow" />
            Analyzing...
          </>
        ) : (
          <>
            <Scan className="w-5 h-5" />
            Detect Disease
          </>
        )}
      </Button>
      
      {isLoading && (
        <p className="text-center text-sm text-muted-foreground mt-3 animate-pulse-soft">
          AI is analyzing the image...
        </p>
      )}
    </section>
  );
};

export default DetectionButton;
