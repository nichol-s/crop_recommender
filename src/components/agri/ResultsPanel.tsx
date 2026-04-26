import { Recommendation } from "@/lib/cropEngine";

interface Props {
  loading: boolean;
  result: Recommendation | null;
  error: string | null;
}

const Placeholder = () => (
  <div className="result-card-modern flex flex-col items-center text-center">
    <i className="fas fa-cloud-sun text-[2.5rem] mb-2" style={{ color: "hsl(85 60% 70%)" }} />
    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <i className="fas fa-microchip mr-2" />
      Neural Crop Engine
    </h3>
    <p className="opacity-90 max-w-md">
      Enter soil &amp; climate metrics → get data-driven crop recommendation, confidence score &amp; advanced farming tactics.
    </p>
    <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs opacity-90">
      <span className="badge-hero" style={{ marginBottom: 0 }}>
        <i className="fas fa-leaf mr-1" /> 8+ Strategic Crops
      </span>
      <span className="badge-hero" style={{ marginBottom: 0 }}>
        <i className="fas fa-layer-group mr-1" /> Multi-factor scoring
      </span>
    </div>
  </div>
);

const Loading = () => (
  <div className="result-card-modern text-center py-8">
    <div className="pulse-loader">
      <i className="fas fa-seedling text-2xl text-white" />
    </div>
    <p className="opacity-90">Analyzing agro-climatic layers ...</p>
  </div>
);

const ResultsPanel = ({ loading, result, error }: Props) => {
  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="result-card-modern text-center" style={{ borderLeftColor: "hsl(22 65% 60%)" }}>
        <i className="fas fa-circle-exclamation text-3xl" style={{ color: "hsl(28 60% 65%)" }} />
        <h3 className="my-2 text-lg font-semibold">Input Error</h3>
        <p>{error}</p>
        <button className="clear-btn-soft mt-3" onClick={() => window.location.reload()}>
          Reset
        </button>
      </div>
    );
  }

  if (!result) return <Placeholder />;

  if (!result.crop) {
    return (
      <div className="result-card-modern" style={{ borderLeftColor: "hsl(24 55% 50%)" }}>
        <div className="flex items-center gap-3 mb-2">
          <i className="fas fa-seedling text-2xl" style={{ color: "hsl(85 60% 70%)" }} />
          <h3 className="text-xl font-bold">Alternative Recommendation</h3>
        </div>
        <p dangerouslySetInnerHTML={{ __html: result.explanation }} />
        <p className="mt-2">
          <strong>💡 Advisory:</strong> {result.advice}
        </p>
        <div className="mt-3 text-sm">
          <i className="fas fa-chart-simple mr-1" /> Confidence: {result.confidence}%
        </div>
      </div>
    );
  }

  return (
    <div className="result-card-modern">
      <div className="crop-title">
        <i className="fas fa-crown" style={{ color: "hsl(75 80% 78%)" }} />
        {result.crop}
      </div>
      <div className="insight-block">
        <i className="fas fa-clipboard-list mr-2" />
        <strong>Why this crop?</strong>
        <p className="mt-1" dangerouslySetInnerHTML={{ __html: result.explanation }} />
      </div>
      <div className="insight-block">
        <i className="fas fa-tractor mr-2" />
        <strong>Agronomic Strategy</strong>
        <p className="mt-1">{result.advice}</p>
        {result.tips && (
          <p className="mt-2 text-sm opacity-90">
            <i className="fas fa-lightbulb mr-1" /> Pro insight: {result.tips}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4 flex-wrap mt-4">
        <span className="text-sm">
          <i className="fas fa-chart-line mr-1" /> Match confidence
        </span>
        <div className="meter-bar">
          <div className="meter-fill" style={{ width: `${result.confidence}%` }} />
        </div>
        <strong>{result.confidence}%</strong>
      </div>
      <div className="text-[0.7rem] text-right mt-3 opacity-80">
        <i className="fas fa-globe mr-1" /> Agro-ecological zone optimized
      </div>
    </div>
  );
};

export default ResultsPanel;
