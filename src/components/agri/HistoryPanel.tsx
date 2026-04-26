export interface HistoryItem {
  crop: string;
  ph: number;
  rainfall: number;
  temperature: number;
  confidence: number;
  timestamp: string;
}

interface Props {
  history: HistoryItem[];
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
}

const HistoryPanel = ({ history, onClear, onSelect }: Props) => {
  if (!history.length) return null;

  return (
    <div className="glass-card p-6 md:p-7">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold" style={{ color: "hsl(85 45% 88%)" }}>
          <i className="fas fa-clock-rotate-left mr-2" /> Recent Scenarios
        </h3>
        <button className="clear-btn-soft" onClick={onClear}>
          <i className="fas fa-trash-can mr-1" /> Clear history
        </button>
      </div>
      <div className="history-modern max-h-[330px] overflow-y-auto pr-1 scroll-agri">
        {history.map((item, i) => (
          <div key={i} className="history-item-modern" onClick={() => onSelect(item)}>
            <div className="flex justify-between">
              <span>
                <i className="fas fa-seedling mr-1" /> <strong>{item.crop}</strong>
              </span>
              <span className="text-[0.7rem] opacity-80">{item.timestamp}</span>
            </div>
            <div className="text-[0.75rem] mt-1.5 opacity-90">
              pH {item.ph} · {item.rainfall}mm rain · {item.temperature}°C
            </div>
            <div className="flex items-center gap-3 flex-wrap mt-1.5">
              <span className="text-[0.7rem]">Match</span>
              <div className="meter-bar" style={{ height: 6 }}>
                <div className="meter-fill" style={{ width: `${item.confidence}%` }} />
              </div>
              <span className="text-[0.7rem]">{item.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
