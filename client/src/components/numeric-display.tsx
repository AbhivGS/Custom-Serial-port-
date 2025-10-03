import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface NumericDisplayProps {
  title: string;
  value: number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  sparklineData?: number[];
  color?: string;
  onRemove?: () => void;
}

export default function NumericDisplay({
  title,
  value,
  unit = "",
  trend = "neutral",
  sparklineData = [],
  color = "hsl(var(--chart-1))",
  onRemove,
}: NumericDisplayProps) {
  const formattedSparkline = sparklineData.map((val, idx) => ({ value: val, index: idx }));

  return (
    <Card className="overflow-visible" data-testid={`card-numeric-${title}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
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
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-mono font-semibold" data-testid={`text-value-${title}`}>
            {value.toFixed(2)}
          </div>
          {unit && (
            <span className="text-lg text-muted-foreground">{unit}</span>
          )}
          {trend !== "neutral" && (
            <div className={`flex items-center ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
        {sparklineData.length > 0 && (
          <div className="h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedSparkline}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
