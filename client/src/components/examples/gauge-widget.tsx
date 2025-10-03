import GaugeWidget from "../gauge-widget";

export default function GaugeWidgetExample() {
  return (
    <div className="p-6">
      <GaugeWidget
        title="Temperature"
        value={72.5}
        min={0}
        max={150}
        unit="°C"
      />
    </div>
  );
}
