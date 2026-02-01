import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  variant?: "default" | "success" | "warning" | "destructive" | "info";
  delay?: number;
}

const variantStyles = {
  default: "bg-card border-border",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  destructive: "bg-destructive/5 border-destructive/20",
  info: "bg-info/5 border-info/20",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

const ResultCard = ({
  icon: Icon,
  label,
  value,
  variant = "default",
  delay = 0,
}: ResultCardProps) => {
  return (
    <Card
      className={cn(
        "p-4 border shadow-card animate-fade-in",
        variantStyles[variant]
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "p-2.5 rounded-xl shrink-0",
            iconVariantStyles[variant]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-base font-semibold text-foreground leading-snug">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ResultCard;
