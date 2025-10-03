import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Upload, FileJson, GripVertical, Trash2, Plus } from "lucide-react";
import { useDashboardConfig, DashboardConfigFile, WidgetConfig, WidgetType } from "@/hooks/use-dashboard-config";

interface ConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (config: WidgetConfig[]) => void;
  onLoad?: (config: WidgetConfig[]) => void;
}

interface SortableWidgetRowProps {
  widget: WidgetConfig;
  availableColumns: string[];
  color: string;
  onChange: (id: string, updates: Partial<WidgetConfig>) => void;
  onRemove: (id: string) => void;
}

const defaultTitleForType = (type: WidgetType, column: string) => {
  if (type === "graph") {
    return column + " Graph";
  }
  if (type === "gauge") {
    return column + " Gauge";
  }
  return column;
};

function SortableWidgetRow({ widget, availableColumns, color, onChange, onRemove }: SortableWidgetRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <TableRow ref={setNodeRef} style={style} data-state={isDragging ? "selected" : undefined}>
      <TableCell className="w-12">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-dashed border-border bg-muted/40 text-muted-foreground hover:bg-muted"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="min-w-[160px]">
        <Input
          value={widget.title}
          onChange={(event) => onChange(widget.id, { title: event.target.value })}
          placeholder="Widget title"
        />
      </TableCell>
      <TableCell className="min-w-[140px]">
        <Select
          value={widget.type}
          onValueChange={(value) => onChange(widget.id, { type: value as WidgetType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="graph">Graph</SelectItem>
            <SelectItem value="gauge">Gauge</SelectItem>
            <SelectItem value="numeric">Numeric</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="min-w-[180px]">
        <Select
          value={widget.dataColumn}
          onValueChange={(value) => onChange(widget.id, { dataColumn: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Data column" />
          </SelectTrigger>
          <SelectContent>
            {availableColumns.map((column) => (
              <SelectItem key={column} value={column}>
                {column}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="min-w-[160px]">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded" style={{ backgroundColor: color }} />
          <span className="text-xs text-muted-foreground">{color}</span>
        </div>
      </TableCell>
      <TableCell className="w-12 text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(widget.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function ConfigModal({ open, onOpenChange, onSave, onLoad }: ConfigModalProps) {
  const {
    widgets,
    columnMetadata,
    availableColumns,
    setWidgets,
    sanitizeWidgets,
    exportConfig,
    importConfig,
  } = useDashboardConfig();

  const [configName, setConfigName] = useState("dashboard-config");
  const [localWidgets, setLocalWidgets] = useState<WidgetConfig[]>(widgets);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    if (open) {
      setLocalWidgets(widgets);
      setError(null);
    }
  }, [open, widgets]);

  const currentConfigPreview = useMemo(() => {
    const payload: DashboardConfigFile = {
      ...exportConfig(),
      widgets: sanitizeWidgets(localWidgets),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  }, [exportConfig, localWidgets, sanitizeWidgets]);

  const handleWidgetChange = (id: string, updates: Partial<WidgetConfig>) => {
    setLocalWidgets((current) =>
      current.map((widget) => {
        if (widget.id !== id) {
          return widget;
        }
        if (Object.prototype.hasOwnProperty.call(updates, "title")) {
          return { ...widget, ...updates };
        }
        const next = { ...widget, ...updates } as WidgetConfig;
        const previousDefault = defaultTitleForType(widget.type, widget.dataColumn);
        const nextDefault = defaultTitleForType(next.type, next.dataColumn);
        if (widget.title === previousDefault) {
          next.title = nextDefault;
        }
        return next;
      })
    );
  };

  const handleRemoveWidget = (id: string) => {
    setLocalWidgets((current) => current.filter((widget) => widget.id !== id));
  };

  const handleAddWidget = (type: WidgetType) => {
    if (availableColumns.length === 0) {
      setError("Define at least one data column before adding widgets.");
      return;
    }
    const column = availableColumns[0];
    const newWidget: WidgetConfig = {
      id: ["temp", Date.now().toString(36), Math.random().toString(36).slice(2, 6)].join("-"),
      title: defaultTitleForType(type, column),
      type,
      dataColumn: column,
    };
    setLocalWidgets((current) => [...current, newWidget]);
  };

  const handleApplyLayout = () => {
    const sanitized = sanitizeWidgets(localWidgets);
    if (sanitized.length === 0) {
      setError("Add at least one widget to the layout.");
      return;
    }
    setWidgets(sanitized);
    onSave?.(sanitized);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalWidgets(widgets);
    setError(null);
  };

  const handleExport = () => {
    const payload: DashboardConfigFile = {
      version: 1,
      exportedAt: new Date().toISOString(),
      widgets: sanitizeWidgets(localWidgets),
      columns: columnMetadata,
    };
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${configName || "dashboard-config"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onSave?.(payload.widgets);
  };

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      input.value = "";
      try {
        const parsed = JSON.parse(String(e.target?.result)) as DashboardConfigFile;
        const importedWidgets = importConfig(parsed);
        if (importedWidgets.length === 0) {
          setError("The selected configuration file did not contain any valid widgets.");
          return;
        }
        setLocalWidgets(importedWidgets);
        setError(null);
        onLoad?.(importedWidgets);
        onOpenChange(false);
      } catch (importError) {
        console.error("Failed to import configuration", importError);
        setError("Could not parse the selected configuration file.");
      }
    };
    reader.readAsText(file);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    setLocalWidgets((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) {
        return items;
      }
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl" data-testid="modal-config">
        <DialogHeader>
          <DialogTitle>Dashboard Configuration</DialogTitle>
          <DialogDescription>
            Arrange widgets, map them to data columns, and export or import JSON layouts for future use.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Widget Layout
              </h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAddWidget("graph")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Graph
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddWidget("gauge")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Gauge
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddWidget("numeric")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Numeric
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Data Column</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="w-12 text-right">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={localWidgets.map((widget) => widget.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {localWidgets.map((widget) => (
                        <SortableWidgetRow
                          key={widget.id}
                          widget={widget}
                          availableColumns={availableColumns}
                          color={columnMetadata[widget.dataColumn]?.color ?? "hsl(var(--primary))"}
                          onChange={handleWidgetChange}
                          onRemove={handleRemoveWidget}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </TableBody>
              </Table>
              {localWidgets.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No widgets configured yet. Use the buttons above to add widgets to your dashboard.
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={handleApplyLayout} className="gap-2" data-testid="button-apply-layout">
                Save Layout
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="config-name">File Name</Label>
                <Input
                  id="config-name"
                  value={configName}
                  onChange={(event) => setConfigName(event.target.value)}
                  placeholder="dashboard-config"
                  data-testid="input-config-name"
                />
              </div>
              <Button
                onClick={handleExport}
                className="w-full gap-2"
                data-testid="button-export-config"
              >
                <Download className="h-4 w-4" />
                Export as JSON
              </Button>
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/40"
                onClick={() => document.getElementById("file-upload")?.click()}
                data-testid="dropzone-import"
              >
                <FileJson className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">JSON files only</p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
                data-testid="input-file-upload"
              />
              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={() => document.getElementById("file-upload")?.click()}
                data-testid="button-import-config"
              >
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
            </div>

            <div className="space-y-3">
              <Label>Preview</Label>
              <ScrollArea className="h-72 rounded-md border bg-muted/20 p-4">
                <pre className="text-xs font-mono leading-5" data-testid="text-config-preview">
{currentConfigPreview}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
