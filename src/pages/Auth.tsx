import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BackgroundSlideshow from "@/components/agri/BackgroundSlideshow";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return showMsg(error.message, false);
    showMsg("Login successful! Redirecting...", true);
    setTimeout(() => navigate("/", { replace: true }), 600);
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return showMsg("Passwords do not match", false);
    if (password.length < 6) return showMsg("Password must be at least 6 characters", false);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setBusy(false);
    if (error) return showMsg(error.message, false);
    showMsg("Account created! You can sign in now.", true);
    setTab("login");
    setConfirm("");
  };

  return (
    <>
      <BackgroundSlideshow />
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="auth-container">
          {/* Brand panel */}
          <div className="brand-panel">
            <i className="fas fa-seedling text-[3.5rem] mb-4" style={{ color: "hsl(80 80% 75%)" }} />
            <h1 className="hero-title" style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>
              CropVision Pro
            </h1>
            <p
              className="font-medium mb-6 pl-4 text-[0.95rem]"
              style={{ color: "hsl(85 60% 80%)", borderLeft: "3px solid hsl(85 65% 70%)" }}
            >
              Precision agriculture · AI Crop Intelligence
            </p>
            <ul className="space-y-3 text-[0.9rem]" style={{ color: "hsl(88 40% 86%)" }}>
              <li className="flex items-center gap-3">
                <i className="fas fa-bolt w-6 text-[1.1rem]" style={{ color: "hsl(85 65% 70%)" }} /> Real-time suitability engine
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-layer-group w-6 text-[1.1rem]" style={{ color: "hsl(85 65% 70%)" }} /> Multi-factor agro-climatic scoring
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-leaf w-6 text-[1.1rem]" style={{ color: "hsl(85 65% 70%)" }} /> 8+ strategic crops & analytics
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-globe-africa w-6 text-[1.1rem]" style={{ color: "hsl(85 65% 70%)" }} /> Kenya / East Africa focus
              </li>
            </ul>
          </div>

          {/* Forms panel */}
          <div className="forms-panel">
            <div className="flex gap-3 mb-7 pb-2" style={{ borderBottom: "1px solid hsl(85 65% 70% / 0.3)" }}>
              <button type="button" className={`toggle-btn ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>
                <i className="fas fa-right-to-bracket mr-2" /> Sign In
              </button>
              <button type="button" className={`toggle-btn ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>
                <i className="fas fa-user-plus mr-2" /> Create Account
              </button>
            </div>

            {tab === "login" ? (
              <form onSubmit={handleLogin}>
                <div className="mb-5 relative">
                  <label className="block text-[0.75rem] font-medium uppercase tracking-wider mb-2" style={{ color: "hsl(85 45% 80%)" }}>
                    Email address
                  </label>
                  <i className="fas fa-envelope absolute left-4 top-[2.4rem] text-[1rem]" style={{ color: "hsl(85 65% 70%)" }} />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-5 relative">
                  <label className="block text-[0.75rem] font-medium uppercase tracking-wider mb-2" style={{ color: "hsl(85 45% 80%)" }}>
                    Password
                  </label>
                  <i className="fas fa-lock absolute left-4 top-[2.4rem] text-[1rem]" style={{ color: "hsl(85 65% 70%)" }} />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={busy} className="auth-btn-primary">
                  <i className={`fas ${busy ? "fa-spinner fa-pulse" : "fa-arrow-right-to-bracket"}`} />
                  {busy ? "Signing in..." : "Access Dashboard"}
                </button>
                <p className="mt-5 text-center text-[0.8rem]" style={{ color: "hsl(85 35% 76%)" }}>
                  No account?{" "}
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setTab("signup"); }}
                    style={{ color: "hsl(80 100% 87%)", borderBottom: "1px dashed hsl(85 65% 70%)" }}
                  >
                    Create new account
                  </a>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div className="mb-5 relative">
                  <label className="block text-[0.75rem] font-medium uppercase tracking-wider mb-2" style={{ color: "hsl(85 45% 80%)" }}>
                    Email address
                  </label>
                  <i className="fas fa-envelope absolute left-4 top-[2.4rem] text-[1rem]" style={{ color: "hsl(85 65% 70%)" }} />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-5 relative">
                  <label className="block text-[0.75rem] font-medium uppercase tracking-wider mb-2" style={{ color: "hsl(85 45% 80%)" }}>
                    Password
                  </label>
                  <i className="fas fa-lock absolute left-4 top-[2.4rem] text-[1rem]" style={{ color: "hsl(85 65% 70%)" }} />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-5 relative">
                  <label className="block text-[0.75rem] font-medium uppercase tracking-wider mb-2" style={{ color: "hsl(85 45% 80%)" }}>
                    Confirm Password
                  </label>
                  <i className="fas fa-shield-halved absolute left-4 top-[2.4rem] text-[1rem]" style={{ color: "hsl(85 65% 70%)" }} />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={busy} className="auth-btn-primary">
                  <i className={`fas ${busy ? "fa-spinner fa-pulse" : "fa-user-plus"}`} />
                  {busy ? "Creating..." : "Create AgriAccount"}
                </button>
                <p className="mt-5 text-center text-[0.8rem]" style={{ color: "hsl(85 35% 76%)" }}>
                  Already have an account?{" "}
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setTab("login"); }}
                    style={{ color: "hsl(80 100% 87%)", borderBottom: "1px dashed hsl(85 65% 70%)" }}
                  >
                    Sign In
                  </a>
                </p>
              </form>
            )}

            {msg && (
              <div
                className={`mt-4 p-3 rounded-full text-[0.8rem] text-center ${msg.ok ? "" : ""}`}
                style={{
                  background: "hsl(0 0% 0% / 0.6)",
                  color: msg.ok ? "hsl(80 80% 75%)" : "hsl(10 100% 83%)",
                  borderLeft: `3px solid ${msg.ok ? "hsl(85 65% 70%)" : "hsl(15 100% 71%)"}`,
                }}
              >
                {msg.text}
              </div>
            )}

            <p className="mt-6 text-center text-[0.7rem]" style={{ color: "hsl(95 25% 58%)" }}>
              <i className="fas fa-shield-halved mr-1" /> Secure & encrypted · Powered by neural crop engine
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
