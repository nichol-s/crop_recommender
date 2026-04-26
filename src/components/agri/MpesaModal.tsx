import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

type Status = { type: "success" | "error" | "info"; text: string } | null;

const MpesaModal = ({ open, amount, onClose, onSuccess }: Props) => {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [pollHandle, setPollHandle] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setPhone("");
      setBusy(false);
      setStatus(null);
      if (pollHandle) { clearInterval(pollHandle); setPollHandle(null); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const normalizePhone = (raw: string) => {
    let p = raw.replace(/\s+/g, "").replace(/^\+/, "");
    if (p.startsWith("0")) p = "254" + p.substring(1);
    return p;
  };

  const handlePay = async () => {
    const cleaned = normalizePhone(phone.trim());
    if (!/^254[0-9]{9}$/.test(cleaned)) {
      setStatus({ type: "error", text: "Use format 0712345678 or 254712345678" });
      return;
    }
    setBusy(true);
    setStatus({ type: "info", text: "Sending STK push to your phone..." });

    const { data, error } = await supabase.functions.invoke("mpesa-stk-push", {
      body: { phone: cleaned, amount },
    });

    if (error || !data?.success) {
      setBusy(false);
      setStatus({ type: "error", text: data?.error || error?.message || "Failed to initiate payment" });
      return;
    }

    setStatus({ type: "info", text: "Check your phone and enter your M-Pesa PIN..." });
    const checkoutId = data.checkoutRequestId;

    // Poll status
    let attempts = 0;
    const handle = window.setInterval(async () => {
      attempts++;
      const { data: s } = await supabase.functions.invoke("mpesa-status", {
        body: { checkoutRequestId: checkoutId },
      });
      if (s?.status === "completed") {
        clearInterval(handle);
        setPollHandle(null);
        setStatus({ type: "success", text: "✓ Payment confirmed! Unlocking analysis..." });
        sessionStorage.setItem("crop_analysis_paid", "true");
        setTimeout(() => { onSuccess(); onClose(); }, 1200);
      } else if (s?.status === "failed") {
        clearInterval(handle);
        setPollHandle(null);
        setBusy(false);
        setStatus({ type: "error", text: s.message || "Payment failed or cancelled" });
      } else if (attempts > 30) {
        clearInterval(handle);
        setPollHandle(null);
        setBusy(false);
        setStatus({ type: "error", text: "Timed out waiting for confirmation. If you paid, refresh and try again." });
      }
    }, 3000);
    setPollHandle(handle);
  };

  return (
    <div className="mpesa-overlay" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="mpesa-modal">
        {!busy && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm cursor-pointer z-10"
            style={{ background: "hsl(0 0% 0% / 0.6)" }}
            aria-label="Close"
          >
            <i className="fas fa-xmark" />
          </button>
        )}

        <div className="mpesa-header">
          <span className="icon-wrap"><i className="fas fa-mobile-screen-button text-2xl" /></span>
          <h3 className="text-2xl font-semibold">M-Pesa Payment</h3>
          <p className="text-sm opacity-90 mt-1.5">Secure STK Push · Instant confirmation</p>
        </div>

        <div className="p-7">
          <div className="rounded-2xl p-4 mb-5 text-center" style={{ background: "hsl(95 30% 92%)" }}>
            <div className="font-extrabold text-lg" style={{ color: "hsl(150 45% 17%)" }}>
              <i className="fas fa-leaf mr-1" /> Crop Analysis + AI Recommendation
            </div>
            <div className="text-2xl font-extrabold mt-1.5" style={{ color: "hsl(140 65% 33%)" }}>
              KSh {amount.toFixed(2)}
            </div>
            <div className="text-xs mt-1 opacity-70">One-time premium access (this session)</div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 font-semibold text-sm mb-2" style={{ color: "hsl(140 30% 25%)" }}>
              <i className="fas fa-phone" style={{ color: "hsl(140 100% 36%)" }} />
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              className="mpesa-input"
              placeholder="0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={busy}
            />
            <p className="text-xs mt-1.5 opacity-60">Enter the number registered on M-Pesa</p>
          </div>

          <button type="button" className="mpesa-btn" onClick={handlePay} disabled={busy}>
            <i className={`fas ${busy ? "fa-spinner fa-pulse" : "fa-mobile-screen"}`} />
            {busy ? "Processing..." : "Pay with M-Pesa"}
          </button>

          {status && (
            <div className={`mt-3 px-3 py-2 rounded-full text-xs text-center ${status.type === "success" ? "pay-success" : status.type === "error" ? "pay-error" : ""}`}
                 style={status.type === "info" ? { background: "hsl(95 30% 92%)", color: "hsl(150 45% 17%)" } : undefined}>
              <i className={`fas mr-1 ${status.type === "success" ? "fa-check-circle" : status.type === "error" ? "fa-circle-exclamation" : "fa-spinner fa-pulse"}`} />
              {status.text}
            </div>
          )}
        </div>

        <div className="px-7 py-4 text-center text-[0.7rem] border-t" style={{ borderColor: "hsl(95 30% 88%)", color: "hsl(95 10% 45%)" }}>
          <i className="fas fa-shield-halved mr-1" /> Secured by Safaricom Daraja API
        </div>
      </div>
    </div>
  );
};

export default MpesaModal;
