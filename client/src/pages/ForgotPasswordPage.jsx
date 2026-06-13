import { useState } from "react";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ForgotPasswordPage({ onNavigate }) {
  const { resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1=email, 2=new password
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const verifyEmail = async () => {
    if (!email) { setError("Email is required."); return; }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) { setError("Enter a valid email."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setError("");
    setStep(2);
  };

  const handleReset = async () => {
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const res = resetPassword({ email, newPassword: form.password });
    setLoading(false);
    if (!res.success) { setError(res.error); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-pop">
          <div className="glass-card p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-neon/15 border border-neon/30 flex items-center justify-center mb-5">
              <CheckCircle2 size={32} className="text-neon" />
            </div>
            <h2 className="font-display font-black text-2xl text-white mb-2">Password Reset!</h2>
            <p className="text-white/50 font-body text-sm mb-6">Your password has been updated successfully.</p>
            <button onClick={() => onNavigate("login")} className="btn-primary flex items-center gap-2 px-8">
              <ArrowRight size={15} /> Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-violet/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-500 to-neon flex items-center justify-center shadow-electric mb-4">
            <Zap size={26} className="text-navy font-black" />
          </div>
          <h1 className="font-display font-black text-3xl text-white">FinFlow</h1>
        </div>

        <div className="glass-card p-7">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-electric-500/15 border border-electric-500/25 flex items-center justify-center shrink-0">
              <KeyRound size={18} className="text-electric-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white">Reset Password</h2>
              <p className="text-sm text-white/40 font-body mt-0.5">
                {step === 1 ? "Enter your email to continue" : "Set your new password"}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all ${step >= s ? "bg-electric-500 text-white" : "bg-navy-border text-white/30"}`}>{s}</div>
                {s < 2 && <div className={`h-px w-8 transition-all ${step > s ? "bg-electric-500" : "bg-navy-border"}`} />}
              </div>
            ))}
            <p className="text-xs text-white/30 font-body ml-1">{step === 1 ? "Verify email" : "New password"}</p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com" className="input-field pl-10 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && verifyEmail()} />
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-xl bg-rose/10 border border-rose/20 animate-fade-in">
                  <span className="text-rose text-xs font-body">{error}</span>
                </div>
              )}
              <button onClick={verifyEmail} disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Continue</span><ArrowRight size={15} /></>}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-electric-500/10 border border-electric-500/20">
                <p className="text-xs font-body text-white/50">Resetting for <span className="text-electric-400 font-semibold">{email}</span></p>
              </div>
              <div>
                <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                  <input type={showPw ? "text" : "password"} value={form.password}
                    onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setError(""); }}
                    placeholder="Min. 6 characters" className="input-field pl-10 pr-10 text-sm" />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                  <input type="password" value={form.confirm}
                    onChange={(e) => { setForm((f) => ({ ...f, confirm: e.target.value })); setError(""); }}
                    placeholder="Re-enter password" className="input-field pl-10 text-sm" />
                </div>
                {form.confirm.length > 0 && form.password === form.confirm && (
                  <div className="flex items-center gap-1.5 mt-1.5 animate-fade-in">
                    <CheckCircle2 size={12} className="text-neon" />
                    <span className="text-xs text-neon font-display font-semibold">Passwords match</span>
                  </div>
                )}
              </div>
              {error && (
                <div className="p-3 rounded-xl bg-rose/10 border border-rose/20 animate-fade-in">
                  <span className="text-rose text-xs font-body">{error}</span>
                </div>
              )}
              <button onClick={handleReset} disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Reset Password</span><ArrowRight size={15} /></>}
              </button>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-navy-border text-center">
            <button onClick={() => onNavigate("login")}
              className="text-sm text-white/40 hover:text-white/70 font-body transition-colors flex items-center gap-1.5 mx-auto">
              <ArrowLeft size={13} /> Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
