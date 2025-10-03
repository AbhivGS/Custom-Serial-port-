import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Save, FolderOpen, Plus } from "lucide-react";
import SerialConfigPanel from "@/components/serial-config-panel";
import CsvConfigPanel from "@/components/csv-config-panel";
import CommandPanel from "@/components/command-panel";
import GraphCard from "@/components/graph-card";
import GaugeWidget from "@/components/gauge-widget";
import NumericDisplay from "@/components/numeric-display";
import ConfigModal from "@/components/config-modal";
import { useDashboardConfig, type DataColumnMetadata, type WidgetConfig } from "@/hooks/use-dashboard-config";

interface MetricPoint {
  name: string;
  value: number;
}

interface MetricState {
  latest: number;
  previous: number | null;
  series: MetricPoint[];
}

const SERIES_LENGTH = 40;

const simulateMetricValue = (
  column: string,
  metadata: DataColumnMetadata | undefined,
  previous?: number | null
): number => {
  const label = column.toLowerCase();
  const now = Date.now();
  if (label === "pressure") {
    return 150 + Math.sin(now / 1200) * 20 + Math.random() * 8;
  }
  if (label === "thrust") {
    return 900 + Math.cos(now / 850) * 45 + Math.random() * 25;
  }
  if (label === "temperature") {
    return 70 + Math.sin(now / 1400) * 5 + Math.random() * 4;
  }

  const min = metadata?.min ?? 0;
  const max = metadata?.max ?? 100;
  const range = max - min || 100;
  const base = typeof previous === "number" ? previous : min + range / 2;
  const variation = range * 0.05;
  const next = base + (Math.random() - 0.5) * variation;
  const clampMin = min - range * 0.1;
  const clampMax = max + range * 0.1;
  return Math.min(clampMax, Math.max(clampMin, next));
};

const getTrend = (metric: MetricState | undefined): "up" | "down" | "neutral" => {
  if (!metric || metric.previous === null) {
    return "neutral";
  }
  const delta = metric.latest - metric.previous;
  if (Math.abs(delta) < 0.05) {
    return "neutral";
  }
  return delta > 0 ? "up" : "down";
};

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { widgets, columnMetadata } = useDashboardConfig();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, MetricState>>({});

  const columnEntries = useMemo(() => Object.entries(columnMetadata), [columnMetadata]);

  useEffect(() => {
    setMetrics((current) => {
      const updated = { ...current };
      columnEntries.forEach(([column, metadata]) => {
        if (!updated[column]) {
          const baseline = metadata.min + (metadata.max - metadata.min) / 2;
          updated[column] = {
            latest: baseline,
            previous: null,
            series: [],
          };
        }
      });
      return updated;
    });
  }, [columnEntries]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const interval = setInterval(() => {
      setMetrics((current) => {
        const timestamp = new Date().toLocaleTimeString();
        const nextState: Record<string, MetricState> = { ...current };
        columnEntries.forEach(([column, metadata]) => {
          const existing = current[column] ?? {
            latest: metadata.min,
            previous: null,
            series: [],
          };
          const value = simulateMetricValue(column, metadata, existing.latest);
          const series = [...existing.series, { name: timestamp, value }];
          if (series.length > SERIES_LENGTH) {
            series.splice(0, series.length - SERIES_LENGTH);
          }
          nextState[column] = {
            latest: value,
            previous: existing.latest,
            series,
          };
        });
        return nextState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, columnEntries]);

  const handleLogout = () => {
    setLocation("/");
  };

  const graphWidgets = useMemo(() => widgets.filter((widget) => widget.type === "graph"), [widgets]);
  const gaugeWidgets = useMemo(() => widgets.filter((widget) => widget.type === "gauge"), [widgets]);
  const numericWidgets = useMemo(() => widgets.filter((widget) => widget.type === "numeric"), [widgets]);

  const renderGraphCards = (cards: WidgetConfig[]) => {
    if (cards.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
          No graph widgets yet. Use Save Config to open the layout builder and add graphs.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {cards.map((widget) => {
          const metric = metrics[widget.dataColumn];
          const metadata = columnMetadata[widget.dataColumn];
          return (
            <GraphCard
              key={widget.id}
              title={widget.title}
              data={metric?.series ?? []}
              dataKey="value"
              color={metadata?.color ?? "hsl(var(--primary))"}
            />
          );
        })}
      </div>
    );
  };

  const renderGaugeWidgets = (widgetsToRender: WidgetConfig[]) => {
    if (widgetsToRender.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
          No gauges configured. Use Save Config to add gauge widgets.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {widgetsToRender.map((widget) => {
          const metric = metrics[widget.dataColumn];
          const metadata = columnMetadata[widget.dataColumn];
          return (
            <GaugeWidget
              key={widget.id}
              title={widget.title}
              value={metric?.latest ?? 0}
              min={metadata?.min ?? 0}
              max={metadata?.max ?? 100}
              unit={metadata?.unit ?? ""}
              color={metadata?.color ?? "hsl(var(--chart-1))"}
            />
          );
        })}
      </div>
    );
  };

  const renderNumericWidgets = (widgetsToRender: WidgetConfig[]) => {
    if (widgetsToRender.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
          No numeric cards configured. Use Save Config to add numeric widgets.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {widgetsToRender.map((widget) => {
          const metric = metrics[widget.dataColumn];
          const metadata = columnMetadata[widget.dataColumn];
          return (
            <NumericDisplay
              key={widget.id}
              title={widget.title}
              value={metric?.latest ?? 0}
              unit={metadata?.unit ?? ""}
              trend={getTrend(metric)}
              sparklineData={metric?.series.map((point) => point.value) ?? []}
              color={metadata?.color ?? "hsl(var(--chart-1))"}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-card-border">
          <h1 className="text-xl font-semibold">Serial Monitor</h1>
          <p className="text-sm text-muted-foreground mt-1">Data Visualization Dashboard</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <SerialConfigPanel
            onConnect={() => setIsConnected(true)}
            onDisconnect={() => setIsConnected(false)}
          />
          <CsvConfigPanel />
          <CommandPanel />
        </div>

        <div className="p-4 border-t border-card-border space-y-2">
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={() => setConfigModalOpen(true)}
            data-testid="button-save-config"
          >
            <Save className="w-4 h-4" />
            Save Config
          </Button>
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={() => setConfigModalOpen(true)}
            data-testid="button-load-config"
          >
            <FolderOpen className="w-4 h-4" />
            Load Config
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium">Dashboard</h2>
            {isConnected && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span data-testid="text-status">Receiving Data</span>
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setConfigModalOpen(true)}
            data-testid="button-add-widget"
          >
            <Plus className="w-4 h-4" />
            Configure Layout
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="graphs">Graphs</TabsTrigger>
              <TabsTrigger value="gauges">Gauges</TabsTrigger>
              <TabsTrigger value="numeric">Numeric</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {renderGraphCards(graphWidgets)}
              {renderGaugeWidgets(gaugeWidgets)}
              {renderNumericWidgets(numericWidgets)}
            </TabsContent>

            <TabsContent value="graphs" className="space-y-6">
              {renderGraphCards(graphWidgets)}
            </TabsContent>

            <TabsContent value="gauges" className="space-y-6">
              {renderGaugeWidgets(gaugeWidgets)}
            </TabsContent>

            <TabsContent value="numeric" className="space-y-6">
              {renderNumericWidgets(numericWidgets)}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
      />
    </div>
  );
}


