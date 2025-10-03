import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Settings } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface GaugeWidgetProps {
  title: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  color?: string;
  onRemove?: () => void;
  onSettings?: () => void;
}

export default function GaugeWidget({
  title,
  value,
  min = 0,
  max = 100,
  unit = "",
  color = "hsl(var(--chart-1))",
  onRemove,
  onSettings,
}: GaugeWidgetProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const getColorByPercentage = (pct: number) => {
    if (pct >= 80) return "hsl(var(--destructive))";
    if (pct >= 60) return "hsl(38 92% 55%)";
    return color;
  };

  const currentColor = getColorByPercentage(percentage);

  return (
    <Card className="overflow-visible" data-testid={`card-gauge-${title}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onSettings}
            data-testid={`button-settings-${title}`}
          >
            <Settings className="w-3.5 h-3.5" />
          </Button>
          {onRemove && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={onRemove}
              data-testid={`button-remove-${title}`}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="w-40 h-40">
          <CircularProgressbar
            value={percentage}
            styles={buildStyles({
              pathColor: currentColor,
              textColor: "hsl(var(--foreground))",
              trailColor: "hsl(var(--muted))",
            })}
          />
        </div>
        <div className="mt-6 text-center">
          <div className="text-3xl font-mono font-semibold" data-testid={`text-gauge-value-${title}`}>
            {value.toFixed(1)}
            {unit && <span className="text-xl text-muted-foreground ml-1">{unit}</span>}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Range: {min} - {max}{unit}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
