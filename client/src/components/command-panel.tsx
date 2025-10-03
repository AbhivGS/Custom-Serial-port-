import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CommandPanelProps {
  onSendCommand?: (command: string) => void;
}

export default function CommandPanel({ onSendCommand }: CommandPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [textCommand, setTextCommand] = useState("");
  const [sliderValue, setSliderValue] = useState([50]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const predefinedCommands = [
    { label: "Start", command: "START" },
    { label: "Stop", command: "STOP" },
    { label: "Reset", command: "RESET" },
    { label: "Calibrate", command: "CAL" },
  ];

  const handleSendText = () => {
    if (textCommand.trim()) {
      const newHistory = [...commandHistory, `> ${textCommand}`];
      setCommandHistory(newHistory);
      console.log("Sent command:", textCommand);
      onSendCommand?.(textCommand);
      setTextCommand("");
    }
  };

  const handlePredefinedCommand = (command: string) => {
    const newHistory = [...commandHistory, `> ${command}`];
    setCommandHistory(newHistory);
    console.log("Sent command:", command);
    onSendCommand?.(command);
  };

  const handleSliderSend = () => {
    const command = `SET_VALUE:${sliderValue[0]}`;
    const newHistory = [...commandHistory, `> ${command}`];
    setCommandHistory(newHistory);
    console.log("Sent command:", command);
    onSendCommand?.(command);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-4">
        <CollapsibleTrigger className="w-full" data-testid="button-toggle-command-panel">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Serial Commands
            </h3>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-6">
          <div className="space-y-2">
            <Label>Text Command</Label>
            <div className="flex gap-2">
              <Input
                value={textCommand}
                onChange={(e) => setTextCommand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                placeholder="Enter command..."
                data-testid="input-text-command"
              />
              <Button onClick={handleSendText} size="icon" data-testid="button-send-text">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quick Commands</Label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedCommands.map((cmd) => (
                <Button
                  key={cmd.command}
                  variant="secondary"
                  onClick={() => handlePredefinedCommand(cmd.command)}
                  data-testid={`button-command-${cmd.command}`}
                >
                  {cmd.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Value Slider</Label>
              <span className="text-sm font-mono text-muted-foreground" data-testid="text-slider-value">
                {sliderValue[0]}
              </span>
            </div>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={100}
              step={1}
              data-testid="slider-value"
            />
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleSliderSend}
              data-testid="button-send-slider"
            >
              Send Value
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Command History</Label>
            <ScrollArea className="h-32 rounded-md border bg-muted/20 p-3">
              <div className="space-y-1 font-mono text-sm" data-testid="text-command-history">
                {commandHistory.length === 0 ? (
                  <div className="text-muted-foreground">No commands sent yet...</div>
                ) : (
                  commandHistory.slice(-10).reverse().map((cmd, idx) => (
                    <div key={idx} className="text-foreground/80">
                      {cmd}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
