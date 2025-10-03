import { useState, useEffect } from "react";
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

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [csvColumns] = useState(["Time", "Pressure", "Thrust", "Temperature"]);
  
  const [pressureData, setPressureData] = useState<Array<{ name: string; value: number }>>([]);
  const [thrustData, setThrustData] = useState<Array<{ name: string; value: number }>>([]);
  const [temperatureValue, setTemperatureValue] = useState(72.5);
  const [pressureValue, setPressureValue] = useState(145.67);
  const [thrustValue, setThrustValue] = useState(892.34);
  const [sparklineData, setSparklineData] = useState<number[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString();
      
      const newPressure = Math.sin(Date.now() / 1000) * 20 + 150 + Math.random() * 10;
      const newThrust = Math.cos(Date.now() / 1000) * 50 + 900 + Math.random() * 20;
      const newTemp = 70 + Math.random() * 10;

      setPressureData((prev) => {
        const updated = [...prev, { name: time, value: newPressure }];
        return updated.slice(-20);
      });

      setThrustData((prev) => {
        const updated = [...prev, { name: time, value: newThrust }];
        return updated.slice(-20);
      });

      setTemperatureValue(newTemp);
      setPressureValue(newPressure);
      setThrustValue(newThrust);

      setSparklineData((prev) => {
        const updated = [...prev, newPressure];
        return updated.slice(-20);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleLogout = () => {
    console.log("Logging out...");
    setLocation("/");
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
          <Button size="sm" variant="outline" className="gap-2" data-testid="button-add-widget">
            <Plus className="w-4 h-4" />
            Add Widget
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="graphs" data-testid="tab-graphs">Graphs</TabsTrigger>
              <TabsTrigger value="gauges" data-testid="tab-gauges">Gauges</TabsTrigger>
              <TabsTrigger value="numeric" data-testid="tab-numeric">Numeric</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <NumericDisplay
                  title="Pressure"
                  value={pressureValue}
                  unit="PSI"
                  trend="up"
                  sparklineData={sparklineData}
                />
                <NumericDisplay
                  title="Thrust"
                  value={thrustValue}
                  unit="N"
                  trend="neutral"
                  sparklineData={sparklineData}
                />
                <NumericDisplay
                  title="Temperature"
                  value={temperatureValue}
                  unit="°C"
                  trend="down"
                  sparklineData={sparklineData}
                />
                <NumericDisplay
                  title="Time"
                  value={Date.now() % 1000}
                  unit="ms"
                  sparklineData={sparklineData}
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <GraphCard
                  title="Pressure"
                  data={pressureData}
                  dataKey="value"
                  color="hsl(var(--chart-1))"
                />
                <GraphCard
                  title="Thrust"
                  data={thrustData}
                  dataKey="value"
                  color="hsl(var(--chart-2))"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <GaugeWidget
                  title="Temperature"
                  value={temperatureValue}
                  min={0}
                  max={150}
                  unit="°C"
                />
                <GaugeWidget
                  title="Pressure"
                  value={pressureValue}
                  min={0}
                  max={200}
                  unit="PSI"
                />
                <GaugeWidget
                  title="Thrust"
                  value={thrustValue}
                  min={0}
                  max={1200}
                  unit="N"
                />
              </div>
            </TabsContent>

            <TabsContent value="graphs" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <GraphCard
                  title="Pressure"
                  data={pressureData}
                  dataKey="value"
                  color="hsl(var(--chart-1))"
                />
                <GraphCard
                  title="Thrust"
                  data={thrustData}
                  dataKey="value"
                  color="hsl(var(--chart-2))"
                />
              </div>
            </TabsContent>

            <TabsContent value="gauges" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <GaugeWidget
                  title="Temperature"
                  value={temperatureValue}
                  min={0}
                  max={150}
                  unit="°C"
                />
                <GaugeWidget
                  title="Pressure"
                  value={pressureValue}
                  min={0}
                  max={200}
                  unit="PSI"
                />
                <GaugeWidget
                  title="Thrust"
                  value={thrustValue}
                  min={0}
                  max={1200}
                  unit="N"
                />
              </div>
            </TabsContent>

            <TabsContent value="numeric" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <NumericDisplay
                  title="Pressure"
                  value={pressureValue}
                  unit="PSI"
                  trend="up"
                  sparklineData={sparklineData}
                />
                <NumericDisplay
                  title="Thrust"
                  value={thrustValue}
                  unit="N"
                  trend="neutral"
                  sparklineData={sparklineData}
                />
                <NumericDisplay
                  title="Temperature"
                  value={temperatureValue}
                  unit="°C"
                  trend="down"
                  sparklineData={sparklineData}
                />
                <NumericDisplay
                  title="Time"
                  value={Date.now() % 1000}
                  unit="ms"
                  sparklineData={sparklineData}
                />
              </div>
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
