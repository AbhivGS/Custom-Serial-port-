import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, Settings, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface GraphCardProps {
  title: string;
  data: Array<{ name: string; value: number; [key: string]: any }>;
  dataKey: string;
  color?: string;
  onRemove?: () => void;
  onSettings?: () => void;
}

export default function GraphCard({
  title,
  data,
  dataKey,
  color = "hsl(var(--chart-1))",
  onRemove,
  onSettings,
}: GraphCardProps) {
  return (
    <Card className="overflow-visible" data-testid={`card-graph-${title}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onSettings}
            data-testid={`button-settings-${title}`}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            data-testid={`button-fullscreen-${title}`}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          {onRemove && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onRemove}
              data-testid={`button-remove-${title}`}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                name={title}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
