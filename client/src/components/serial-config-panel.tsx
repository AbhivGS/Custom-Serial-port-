import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, PlugZap } from "lucide-react";

interface SerialConfigPanelProps {
  onConnect?: (port: string, baudRate: number) => void;
  onDisconnect?: () => void;
}

export default function SerialConfigPanel({ onConnect, onDisconnect }: SerialConfigPanelProps) {
  const [selectedPort, setSelectedPort] = useState("");
  const [baudRate, setBaudRate] = useState("9600");
  const [isConnected, setIsConnected] = useState(false);

  const comPorts = ["COM1", "COM3", "COM5", "/dev/ttyUSB0", "/dev/ttyACM0"];
  const commonBaudRates = ["9600", "19200", "38400", "57600", "115200"];

  const handleToggleConnection = () => {
    if (isConnected) {
      setIsConnected(false);
      console.log("Disconnected from", selectedPort);
      onDisconnect?.();
    } else {
      if (selectedPort && baudRate) {
        setIsConnected(true);
        console.log("Connected to", selectedPort, "at", baudRate, "baud");
        onConnect?.(selectedPort, parseInt(baudRate));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Serial Port
          </h3>
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className="gap-1.5"
            data-testid="badge-connection-status"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="port">COM Port</Label>
            <Select
              value={selectedPort}
              onValueChange={setSelectedPort}
              disabled={isConnected}
            >
              <SelectTrigger id="port" data-testid="select-port">
                <SelectValue placeholder="Select COM port..." />
              </SelectTrigger>
              <SelectContent>
                {comPorts.map((port) => (
                  <SelectItem key={port} value={port}>
                    {port}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baudrate">Baud Rate</Label>
            <div className="flex gap-2">
              <Select
                value={baudRate}
                onValueChange={setBaudRate}
                disabled={isConnected}
              >
                <SelectTrigger id="baudrate" data-testid="select-baudrate" className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {commonBaudRates.map((rate) => (
                    <SelectItem key={rate} value={rate}>
                      {rate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                disabled={isConnected}
                className="w-32"
                data-testid="input-baudrate-custom"
              />
            </div>
          </div>

          <Button
            onClick={handleToggleConnection}
            variant={isConnected ? "destructive" : "default"}
            className="w-full gap-2"
            disabled={!selectedPort || !baudRate}
            data-testid="button-toggle-connection"
          >
            {isConnected ? (
              <>
                <Plug className="w-4 h-4" />
                Disconnect
              </>
            ) : (
              <>
                <PlugZap className="w-4 h-4" />
                Connect
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
