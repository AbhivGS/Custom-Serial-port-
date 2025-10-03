import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CsvConfigPanelProps {
  onColumnsChange?: (columns: string[]) => void;
}

export default function CsvConfigPanel({ onColumnsChange }: CsvConfigPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [columnCount, setColumnCount] = useState(4);
  const [columnNames, setColumnNames] = useState(["Time", "Pressure", "Thrust", "Temperature"]);

  const handleColumnCountChange = (count: number) => {
    setColumnCount(count);
    const newNames = [...columnNames];
    if (count > columnNames.length) {
      for (let i = columnNames.length; i < count; i++) {
        newNames.push(`Column ${i + 1}`);
      }
    } else {
      newNames.length = count;
    }
    setColumnNames(newNames);
    onColumnsChange?.(newNames);
  };

  const handleColumnNameChange = (index: number, name: string) => {
    const newNames = [...columnNames];
    newNames[index] = name;
    setColumnNames(newNames);
    onColumnsChange?.(newNames);
  };

  const removeColumn = (index: number) => {
    const newNames = columnNames.filter((_, i) => i !== index);
    setColumnNames(newNames);
    setColumnCount(newNames.length);
    onColumnsChange?.(newNames);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-4">
        <CollapsibleTrigger className="w-full" data-testid="button-toggle-csv-config">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              CSV Configuration
            </h3>
            <Badge variant="secondary" data-testid="badge-column-count">
              {columnCount} columns
            </Badge>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="column-count">Number of Columns</Label>
            <div className="flex gap-2">
              <Input
                id="column-count"
                type="number"
                min="1"
                max="10"
                value={columnCount}
                onChange={(e) => handleColumnCountChange(parseInt(e.target.value) || 1)}
                data-testid="input-column-count"
              />
              <Button
                size="icon"
                variant="secondary"
                onClick={() => handleColumnCountChange(columnCount + 1)}
                data-testid="button-add-column"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Column Names</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {columnNames.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => handleColumnNameChange(index, e.target.value)}
                    placeholder={`Column ${index + 1}`}
                    data-testid={`input-column-name-${index}`}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeColumn(index)}
                    disabled={columnNames.length === 1}
                    data-testid={`button-remove-column-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
