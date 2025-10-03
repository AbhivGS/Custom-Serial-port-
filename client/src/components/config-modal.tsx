import { useState } from "react";
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
import { Download, Upload, FileJson } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (config: any) => void;
  onLoad?: (config: any) => void;
}

export default function ConfigModal({
  open,
  onOpenChange,
  onSave,
  onLoad,
}: ConfigModalProps) {
  const [configName, setConfigName] = useState("dashboard-config");

  const mockCurrentConfig = {
    serialPort: "COM3",
    baudRate: 9600,
    csvColumns: ["Time", "Pressure", "Thrust", "Temperature"],
    widgets: [
      { type: "graph", column: "Pressure" },
      { type: "gauge", column: "Temperature" },
      { type: "numeric", column: "Thrust" },
    ],
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(mockCurrentConfig, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${configName}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log("Exported configuration:", configName);
    onSave?.(mockCurrentConfig);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          console.log("Imported configuration:", config);
          onLoad?.(config);
          onOpenChange(false);
        } catch (error) {
          console.error("Failed to parse configuration file:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="modal-config">
        <DialogHeader>
          <DialogTitle>Configuration Management</DialogTitle>
          <DialogDescription>
            Save your dashboard layout and settings to a JSON file, or load a previously saved configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Current Configuration</h4>
              <ScrollArea className="h-64 rounded-md border bg-muted/20 p-4">
                <pre className="text-xs font-mono" data-testid="text-config-preview">
                  {JSON.stringify(mockCurrentConfig, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Export Configuration</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="config-name">File Name</Label>
                  <Input
                    id="config-name"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    placeholder="dashboard-config"
                    data-testid="input-config-name"
                  />
                </div>
                <Button
                  onClick={handleExport}
                  className="w-full gap-2"
                  data-testid="button-export-config"
                >
                  <Download className="w-4 h-4" />
                  Export as JSON
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Import Configuration</h4>
              <div className="space-y-3">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover-elevate active-elevate-2 transition-colors"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  data-testid="dropzone-import"
                >
                  <FileJson className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
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
                  <Upload className="w-4 h-4" />
                  Choose File
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
