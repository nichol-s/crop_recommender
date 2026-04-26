import { useState, FormEvent } from "react";

interface Props {
  ph: string;
  rainfall: string;
  temperature: string;
  setPh: (v: string) => void;
  setRainfall: (v: string) => void;
  setTemperature: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
}

const CropForm = ({ ph, rainfall, temperature, setPh, setRainfall, setTemperature, onSubmit }: Props) => {
  const [phHint, setPhHint] = useState<{ icon: string; text: string; ok?: boolean }>({
    icon: "fa-chart-line",
    text: "Ideal: 5.5–7.5",
  });

  const updatePh = (val: string) => {
    setPh(val);
    const num = parseFloat(val);
    if (isNaN(num)) {
      setPhHint({ icon: "fa-chart-line", text: "Ideal: 5.5–7.5" });
    } else if (num < 5.5) {
      setPhHint({ icon: "fa-exclamation-triangle", text: "Acidic soil — add agricultural lime (dolomite)" });
    } else if (num > 7.5) {
      setPhHint({ icon: "fa-exclamation-triangle", text: "Alkaline soil — elemental sulfur or organic compost" });
    } else {
      setPhHint({ icon: "fa-check-circle", text: "pH optimal for broad crop suitability", ok: true });
    }
  };

  return (
    <form onSubmit={onSubmit} className="glass-card p-7 md:p-8" id="cropForm">
      <div className="mb-7">
        <label className="flex items-center gap-3 font-semibold text-[0.95rem] mb-2" style={{ color: "hsl(85 45% 88%)" }}>
          <i className="fas fa-flask w-7 text-xl" style={{ color: "hsl(85 60% 70%)" }} />
          Soil pH Level
        </label>
        <input
          type="number"
          step="0.1"
          className="input-field"
          placeholder="e.g. 6.5"
          value={ph}
          onChange={(e) => updatePh(e.target.value)}
          required
        />
        <div className="text-[0.7rem] mt-2 ml-3 opacity-80 flex items-center gap-1.5" style={{ color: phHint.ok ? "hsl(85 70% 70%)" : undefined }}>
          <i className={`fas ${phHint.icon}`} />
          {phHint.text}
        </div>
      </div>

      <div className="mb-7">
        <label className="flex items-center gap-3 font-semibold text-[0.95rem] mb-2" style={{ color: "hsl(85 45% 88%)" }}>
          <i className="fas fa-cloud-rain w-7 text-xl" style={{ color: "hsl(85 60% 70%)" }} />
          Annual Rainfall (mm)
        </label>
        <input
          type="number"
          className="input-field"
          placeholder="e.g. 800"
          value={rainfall}
          onChange={(e) => setRainfall(e.target.value)}
          required
        />
        <div className="text-[0.7rem] mt-2 ml-3 opacity-80 flex items-center gap-1.5">
          <i className="fas fa-droplet" />
          300–1500 mm range
        </div>
      </div>

      <div className="mb-7">
        <label className="flex items-center gap-3 font-semibold text-[0.95rem] mb-2" style={{ color: "hsl(85 45% 88%)" }}>
          <i className="fas fa-temperature-half w-7 text-xl" style={{ color: "hsl(85 60% 70%)" }} />
          Average Temperature (°C)
        </label>
        <input
          type="number"
          step="0.1"
          className="input-field"
          placeholder="e.g. 24"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          required
        />
        <div className="text-[0.7rem] mt-2 ml-3 opacity-80 flex items-center gap-1.5">
          <i className="fas fa-sun" />
          15°C – 35°C suitable
        </div>
      </div>

      <button type="submit" className="btn-primary">
        <i className="fas fa-brain" />
        Generate Recommendation
      </button>
    </form>
  );
};

export default CropForm;
