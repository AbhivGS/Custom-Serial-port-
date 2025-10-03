import NumericDisplay from "../numeric-display";

export default function NumericDisplayExample() {
  const sparkline = Array.from({ length: 20 }, () => Math.random() * 100 + 50);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <NumericDisplay
        title="Pressure"
        value={145.67}
        unit="PSI"
        trend="up"
        sparklineData={sparkline}
      />
      <NumericDisplay
        title="Thrust"
        value={892.34}
        unit="N"
        trend="neutral"
        sparklineData={sparkline}
      />
    </div>
  );
}
