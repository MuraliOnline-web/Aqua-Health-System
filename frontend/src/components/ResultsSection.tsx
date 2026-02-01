import {
  Bug,
  Percent,
  HelpCircle,
  AlertTriangle,
  Stethoscope,
} from "lucide-react";
import ResultCard from "./ResultCard";

export interface DetectionResult {
  diseaseName: string;
  confidence: number;
  cause: string;
  severity: "Low" | "Medium" | "High";
  treatment: string;
}

interface ResultsSectionProps {
  result: DetectionResult;
}

const getSeverityVariant = (severity: string) => {
  switch (severity) {
    case "Low":
      return "success";
    case "Medium":
      return "warning";
    case "High":
      return "destructive";
    default:
      return "default";
  }
};

const ResultsSection = ({ result }: ResultsSectionProps) => {
  return (
    <section className="px-4 space-y-3">
      <h2 className="text-lg font-semibold text-foreground mb-4 animate-fade-in">
        Detection Results
      </h2>

      <ResultCard
        icon={Bug}
        label="Disease Detected"
        value={result.diseaseName}
        variant="info"
        delay={0.1}
      />

      <ResultCard
        icon={Percent}
        label="Confidence Level"
        value={`${result.confidence}%`}
        variant={result.confidence >= 80 ? "success" : "warning"}
        delay={0.15}
      />

      <ResultCard
        icon={HelpCircle}
        label="Cause"
        value={result.cause}
        variant="default"
        delay={0.2}
      />

      <ResultCard
        icon={AlertTriangle}
        label="Severity Level"
        value={result.severity}
        variant={getSeverityVariant(result.severity)}
        delay={0.25}
      />

      <ResultCard
        icon={Stethoscope}
        label="Recommended Treatment"
        value={result.treatment}
        variant="success"
        delay={0.3}
      />
    </section>
  );
};

export default ResultsSection;
