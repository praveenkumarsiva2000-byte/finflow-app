import { useState, useEffect, useRef } from "react";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const RESEND_COOLDOWN = 30;

export default function LoginPage({ onNavigate, prefill }) {
  const { login, verifyLoginOtp } = useAuth();
  const [form, setForm] = useState({ email: prefill?.email || "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const justRegistered = prefill?.registered || false;

  const [mfaStep, setMfaStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  const handle = (e) => { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); setError(""); };

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.email) { setError("Email is required."); return; }
    if (!form.password) { setError("Password is required."); return; }
    setLoading(true);
    const res = await login(form);
    setLoading(false);
    if (!res.success) { setError(res.error); return; }
    if (res.mfaRequired) {
      setError("");
      setOtp("");
      setCooldown(RESEND_COOLDOWN);
      setMfaStep(true);
    }
  };

  const verifyCode = async () => {
    if (otp.length !== 6) { setError("Enter the 6-digit code."); return; }
    setLoading(true);
    const res = await verifyLoginOtp({ email: form.email, otp });
    setLoading(false);
    if (!res.success) { setError(res.error); return; }
    setError("");
  };

  if (mfaStep) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-neon/6 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-500 to-neon flex items-center justify-center shadow-electric mb-4">
              <Zap size={26} className="text-navy font-black" />
            </div>
            <h1 className="font-display font-black text-3xl text-white">Cashlyne</h1>
          </div>

          <div className="glass-card p-7">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-electric-500/15 border border-electric-500/25 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} className="text-electric-400" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-white">Verify it's you</h2>
                <p className="text-sm text-white/40 font-body mt-0.5">Two-factor authentication is on for this account</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-electric-500/10 border border-electric-500/20">
                <p className="text-xs font-body text-white/50">Code sent to <span className="text-electric-400 font-semibold">{form.email}</span></p>
              </div>
              <div>
                <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">6-Digit Code</label>
                <input
                  type="text" inputMode="numeric" maxLength={6} value={otp} autoFocus
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  placeholder="000000" className="input-field text-center text-2xl tracking-[0.5em] font-display font-bold"
                  onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                />
              </div>
              {error && (
                <div className="p-3 rounded-xl bg-rose/10 border border-rose/20 animate-fade-in">
                  <span className="text-rose text-xs font-body">{error}</span>
                </div>
              )}
              <button onClick={verifyCode} disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Verify & Sign In</span><ArrowRight size={15} /></>}
              </button>
              <button
                onClick={submit}
                disabled={cooldown > 0 || loading}
                className="w-full text-xs text-white/40 hover:text-white/70 font-body transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
              <button
                onClick={() => { setMfaStep(false); setOtp(""); setError(""); }}
                className="w-full text-xs text-white/30 hover:text-white/60 font-body transition-colors"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-neon/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-500 to-neon flex items-center justify-center shadow-electric mb-4">
            <Zap size={26} className="text-navy font-black" />
          </div>
          <h1 className="font-display font-black text-3xl text-white">Cashlyne</h1>
          <p className="text-white/40 font-body text-sm mt-1">Personal Finance Manager</p>
        </div>

        {/* Card */}
        <div className="glass-card p-7">
          <h2 className="font-display font-bold text-xl text-white mb-1">Welcome back</h2>
          <p className="text-sm text-white/40 font-body mb-4">Sign in to your account</p>

          {justRegistered && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-neon/10 border border-neon/25 mb-4 animate-fade-in">
              <span className="text-lg">🎉</span>
              <div>
                <p className="text-xs font-display font-bold text-neon">Account created!</p>
                <p className="text-xs text-white/50 font-body">Sign in with your new credentials</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  name="email" type="email" value={form.email} onChange={handle}
                  placeholder="you@example.com"
                  className="input-field pl-10 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider">Password</label>
                <button
                  type="button" onClick={() => onNavigate("forgot")}
                  className="text-xs text-electric-400 hover:text-electric-300 font-display font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  name="password" type={showPw ? "text" : "password"} value={form.password} onChange={handle}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
                <button
                  type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose/10 border border-rose/20 animate-fade-in">
                <span className="text-rose text-xs font-body">{error}</span>
              </div>
            )}

            <button
              onClick={submit} disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-1"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-navy-border text-center">
            <p className="text-sm text-white/40 font-body">
              Don't have an account?{" "}
              <button onClick={() => onNavigate("signup")} className="text-electric-400 hover:text-electric-300 font-display font-semibold transition-colors">
                Create one
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/20 font-body mt-6">
          Your data stays local private & secure
        </p>
      </div>
    </div>
  );
}
