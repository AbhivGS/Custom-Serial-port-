import GraphCard from "../graph-card";

export default function GraphCardExample() {
  const mockData = Array.from({ length: 20 }, (_, i) => ({
    name: `${i}s`,
    value: Math.sin(i / 3) * 50 + 100 + Math.random() * 10,
  }));

  return (
    <div className="p-6">
      <GraphCard
        title="Pressure"
        data={mockData}
        dataKey="value"
        color="hsl(var(--chart-1))"
      />
    </div>
  );
}
