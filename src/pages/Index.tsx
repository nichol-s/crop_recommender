import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundSlideshow from "@/components/agri/BackgroundSlideshow";
import CropForm from "@/components/agri/CropForm";
import ResultsPanel from "@/components/agri/ResultsPanel";
import HistoryPanel, { HistoryItem } from "@/components/agri/HistoryPanel";
import WelcomeBar from "@/components/agri/WelcomeBar";
import MpesaModal from "@/components/agri/MpesaModal";
import { getSmartRecommendation, Recommendation } from "@/lib/cropEngine";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY_BASE = "agriHistory";
const ANALYSIS_PRICE = 9; // KSh

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const storageKey = user ? `${STORAGE_KEY_BASE}_${user.id}` : STORAGE_KEY_BASE;

  const [ph, setPh] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [temperature, setTemperature] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [pendingInputs, setPendingInputs] = useState<{ ph: number; rainfall: number; temperature: number } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [storageKey]);

  const validate = (data: { ph: number; rainfall: number; temperature: number }) => {
    if (isNaN(data.ph) || data.ph < 0 || data.ph > 14) return "pH must be between 0 and 14";
    if (isNaN(data.rainfall) || data.rainfall < 0 || data.rainfall > 3000) return "Rainfall range 0–3000 mm";
    if (isNaN(data.temperature) || data.temperature < -10 || data.temperature > 50)
      return "Temperature -10°C to 50°C";
    return null;
  };

  const runAnalysis = async (inputs: { ph: number; rainfall: number; temperature: number }) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const rec = await getSmartRecommendation(inputs);
      setResult(rec);
      const item: HistoryItem = {
        crop: rec.crop || "Not found",
        ph: inputs.ph,
        rainfall: inputs.rainfall,
        temperature: inputs.temperature,
        confidence: rec.confidence || 0,
        timestamp: new Date().toLocaleString(undefined, {
          hour: "2-digit", minute: "2-digit", day: "numeric", month: "short",
        }),
      };
      const next = [item, ...history].slice(0, 10);
      setHistory(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (err) {
      console.error(err);
      setError("Engine error. Refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const inputs = {
      ph: parseFloat(ph),
      rainfall: parseFloat(rainfall),
      temperature: parseFloat(temperature),
    };
    const v = validate(inputs);
    if (v) { setError(v); setResult(null); return; }

    const hasPaid = sessionStorage.getItem("crop_analysis_paid") === "true";
    if (!hasPaid) {
      setPendingInputs(inputs);
      setMpesaOpen(true);
      return;
    }
    await runAnalysis(inputs);
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your search history?")) {
      setHistory([]);
      localStorage.removeItem(storageKey);
    }
  };

  const replayItem = (item: HistoryItem) => {
    setPh(String(item.ph));
    setRainfall(String(item.rainfall));
    setTemperature(String(item.temperature));
    setTimeout(() => {
      const form = document.getElementById("cropForm") as HTMLFormElement | null;
      form?.requestSubmit();
    }, 50);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const displayName = user?.email?.split("@")[0] || "Farmer";

  return (
    <>
      <BackgroundSlideshow />
      <WelcomeBar name={displayName} onLogout={handleLogout} />

      <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-8 md:py-10 pb-12 relative">
        <header className="text-center mb-10 md:mb-12 py-5">
          <span className="badge-hero">
            <i className="fas fa-bolt mr-1" /> AI-Powered Agri Intelligence
          </span>
          <h1 className="hero-title">CropVision Pro</h1>
          <p className="hero-sub">
            Precision agriculture · Real-time suitability · Expert farming insights
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-7 md:gap-8">
          <CropForm
            ph={ph}
            rainfall={rainfall}
            temperature={temperature}
            setPh={setPh}
            setRainfall={setRainfall}
            setTemperature={setTemperature}
            onSubmit={handleSubmit}
          />

          <div className="flex flex-col gap-7">
            <ResultsPanel loading={loading} result={result} error={error} />
            <HistoryPanel history={history} onClear={clearHistory} onSelect={replayItem} />
          </div>
        </main>

        <footer className="mt-12 text-center text-xs opacity-60">
          <i className="fas fa-leaf mr-1" /> Powered by real-time agroecological models · Kenya / East Africa
        </footer>
      </div>

      <MpesaModal
        open={mpesaOpen}
        amount={ANALYSIS_PRICE}
        onClose={() => setMpesaOpen(false)}
        onSuccess={() => { if (pendingInputs) runAnalysis(pendingInputs); }}
      />
    </>
  );
};

export default Index;
