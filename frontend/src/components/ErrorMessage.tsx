import { WifiOff, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <section className="px-4 animate-fade-in">
      <Card className="p-6 border-destructive/20 bg-destructive/5 text-center">
        <div className="p-3 bg-destructive/10 rounded-full w-fit mx-auto mb-4">
          <WifiOff className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          Connection Error
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </Card>
    </section>
  );
};

export default ErrorMessage;
