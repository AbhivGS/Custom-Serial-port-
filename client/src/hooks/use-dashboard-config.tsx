import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type WidgetType = "graph" | "gauge" | "numeric";

export interface WidgetConfig {
  id: string;
  title: string;
  type: WidgetType;
  dataColumn: string;
}

export interface DataColumnMetadata {
  label: string;
  unit: string;
  min: number;
  max: number;
  color: string;
}

export interface DashboardConfigFile {
  version: number;
  exportedAt: string;
  widgets: WidgetConfig[];
  columns?: Record<string, Partial<DataColumnMetadata>>;
}

interface DashboardConfigContextValue {
  widgets: WidgetConfig[];
  columnMetadata: Record<string, DataColumnMetadata>;
  availableColumns: string[];
  setWidgets: (widgets: WidgetConfig[]) => void;
  addWidget: (widget?: Partial<WidgetConfig>) => WidgetConfig | undefined;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  removeWidget: (id: string) => void;
  exportConfig: () => DashboardConfigFile;
  importConfig: (config: DashboardConfigFile) => WidgetConfig[];
  sanitizeWidgets: (widgets: WidgetConfig[]) => WidgetConfig[];
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

const generateColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

const createMetadata = (
  name: string,
  index: number,
  metadata?: Partial<DataColumnMetadata>
): DataColumnMetadata => ({
  label: metadata?.label ?? name,
  unit: metadata?.unit ?? "",
  min: metadata?.min ?? 0,
  max: metadata?.max ?? 100,
  color: metadata?.color ?? generateColor(index),
});

const DEFAULT_COLUMN_METADATA: Record<string, DataColumnMetadata> = {
  Pressure: createMetadata("Pressure", 0, { unit: "PSI", min: 0, max: 200 }),
  Thrust: createMetadata("Thrust", 1, { unit: "N", min: 0, max: 1200 }),
  Temperature: createMetadata("Temperature", 2, { unit: "deg C", min: 0, max: 150 }),
};

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "widget-pressure-graph", title: "Pressure Graph", type: "graph", dataColumn: "Pressure" },
  { id: "widget-thrust-graph", title: "Thrust Graph", type: "graph", dataColumn: "Thrust" },
  { id: "widget-temperature-gauge", title: "Temperature Gauge", type: "gauge", dataColumn: "Temperature" },
  { id: "widget-pressure-gauge", title: "Pressure Gauge", type: "gauge", dataColumn: "Pressure" },
  { id: "widget-thrust-gauge", title: "Thrust Gauge", type: "gauge", dataColumn: "Thrust" },
  { id: "widget-pressure-numeric", title: "Pressure", type: "numeric", dataColumn: "Pressure" },
  { id: "widget-thrust-numeric", title: "Thrust", type: "numeric", dataColumn: "Thrust" },
  { id: "widget-temperature-numeric", title: "Temperature", type: "numeric", dataColumn: "Temperature" },
];

const DashboardConfigContext = createContext<DashboardConfigContextValue | null>(null);

const ensureId = (candidate: string | undefined, fallbackIndex: number) => {
  if (candidate && candidate.trim().length > 0) {
    return candidate.trim();
  }
  return ["widget", String(fallbackIndex), Math.random().toString(36).slice(2, 8)].join("-");
};

const defaultTitleForType = (type: WidgetType, column: string) => {
  if (type === "graph") {
    return column + " Graph";
  }
  if (type === "gauge") {
    return column + " Gauge";
  }
  return column;
};

const normalizeWidget = (
  widget: Partial<WidgetConfig>,
  index: number,
  columns: string[],
  metadata: Record<string, DataColumnMetadata>
): WidgetConfig | null => {
  const isValidType = widget.type === "graph" || widget.type === "gauge" || widget.type === "numeric";
  const type: WidgetType = isValidType ? (widget.type as WidgetType) : "graph";
  const column = typeof widget.dataColumn === "string" && widget.dataColumn.trim().length > 0
    ? widget.dataColumn.trim()
    : columns[0];
  if (!column || !metadata[column]) {
    return null;
  }
  const title = typeof widget.title === "string" && widget.title.trim().length > 0
    ? widget.title.trim()
    : defaultTitleForType(type, column);

  return {
    id: ensureId(widget.id, index),
    title,
    type,
    dataColumn: column,
  };
};

export function DashboardConfigProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [columnMetadata, setColumnMetadata] = useState<Record<string, DataColumnMetadata>>(DEFAULT_COLUMN_METADATA);

  const availableColumns = useMemo(() => Object.keys(columnMetadata), [columnMetadata]);

  const sanitizeWidgets = useCallback(
    (list: WidgetConfig[]) => {
      const seen = new Set<string>();
      const cleaned: WidgetConfig[] = [];
      list.forEach((widget, index) => {
        const normalized = normalizeWidget(widget, index, availableColumns, columnMetadata);
        if (!normalized) {
          return;
        }
        let newId = normalized.id;
        while (seen.has(newId)) {
          newId = ensureId(normalized.id, index + cleaned.length + 1);
        }
        seen.add(newId);
        cleaned.push({ ...normalized, id: newId });
      });
      return cleaned;
    },
    [availableColumns, columnMetadata]
  );

  const addWidget = useCallback(
    (widget?: Partial<WidgetConfig>) => {
      if (availableColumns.length === 0) {
        return undefined;
      }
      const base = normalizeWidget(
        widget ?? {},
        widgets.length,
        availableColumns,
        columnMetadata
      );
      if (!base) {
        return undefined;
      }
      const newWidget = { ...base, id: ensureId(base.id, widgets.length) };
      setWidgets((prev) => [...prev, newWidget]);
      return newWidget;
    },
    [availableColumns, columnMetadata, widgets.length]
  );

  const updateWidget = useCallback((id: string, updates: Partial<WidgetConfig>) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id
          ? {
              ...widget,
              ...updates,
            }
          : widget
      )
    );
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== id));
  }, []);

  const exportConfig = useCallback((): DashboardConfigFile => ({
    version: 1,
    exportedAt: new Date().toISOString(),
    widgets,
    columns: columnMetadata,
  }), [widgets, columnMetadata]);

  const importConfig = useCallback(
    (config: DashboardConfigFile) => {
      const incomingColumns = config.columns ?? {};
      const mergedColumns = { ...columnMetadata };
      const existingColumnKeys = Object.keys(columnMetadata);
      let additions = 0;
      Object.entries(incomingColumns).forEach(([name, meta]) => {
        if (!mergedColumns[name]) {
          mergedColumns[name] = createMetadata(name, existingColumnKeys.length + additions, meta);
          additions += 1;
        } else {
          mergedColumns[name] = {
            ...mergedColumns[name],
            ...meta,
            label: meta?.label ?? mergedColumns[name].label,
            unit: meta?.unit ?? mergedColumns[name].unit,
            min: meta?.min ?? mergedColumns[name].min,
            max: meta?.max ?? mergedColumns[name].max,
            color: meta?.color ?? mergedColumns[name].color,
          };
        }
      });
      const mergedColumnNames = Object.keys(mergedColumns);
      const widgetsToImport = Array.isArray(config.widgets) ? config.widgets : [];
      const cleaned = widgetsToImport
        .map((widget, index) => normalizeWidget(widget, index, mergedColumnNames, mergedColumns))
        .filter((widget): widget is WidgetConfig => Boolean(widget));
      if (cleaned.length > 0) {
        setColumnMetadata(mergedColumns);
        setWidgets(cleaned);
      }
      return cleaned;
    },
    [columnMetadata]
  );

  const contextValue = useMemo<DashboardConfigContextValue>(() => ({
    widgets,
    columnMetadata,
    availableColumns,
    setWidgets,
    addWidget,
    updateWidget,
    removeWidget,
    exportConfig,
    importConfig,
    sanitizeWidgets,
  }), [widgets, columnMetadata, availableColumns, addWidget, updateWidget, removeWidget, exportConfig, importConfig, sanitizeWidgets]);

  return (
    <DashboardConfigContext.Provider value={contextValue}>
      {children}
    </DashboardConfigContext.Provider>
  );
}

export function useDashboardConfig() {
  const context = useContext(DashboardConfigContext);
  if (!context) {
    throw new Error("useDashboardConfig must be used within a DashboardConfigProvider");
  }
  return context;
}
