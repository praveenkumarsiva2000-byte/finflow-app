import { useState } from "react";
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SignupPage({ onNavigate }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); setError(""); };

  const pwStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = pwStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength] || "";
  const strengthColor = ["", "bg-rose", "bg-amber", "bg-yellow-400", "bg-neon"][strength] || "";
  const strengthText = ["", "text-rose", "text-amber", "text-yellow-400", "text-neon"][strength] || "";

  const submit = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.email) { setError("Email is required."); return; }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) { setError("Enter a valid email."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const res = await signup({ name: form.name.trim(), email: form.email, password: form.password });
    setLoading(false);
    if (!res.success) { setError(res.error); return; }
    onNavigate("login", { registered: true, email: form.email });
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-electric-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-500 to-neon flex items-center justify-center shadow-electric mb-4">
            <Zap size={26} className="text-navy font-black" />
          </div>
          <h1 className="font-display font-black text-3xl text-white">FinFlow</h1>
          <p className="text-white/40 font-body text-sm mt-1">Start your financial journey</p>
        </div>

        {/* Card */}
        <div className="glass-card p-7">
          <h2 className="font-display font-bold text-xl text-white mb-1">Create account</h2>
          <p className="text-sm text-white/40 font-body mb-6">Free forever, no credit card needed</p>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input name="name" type="text" value={form.name} onChange={handle}
                  placeholder="John Doe" className="input-field pl-10 text-sm" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input name="email" type="email" value={form.email} onChange={handle}
                  placeholder="you@example.com" className="input-field pl-10 text-sm" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input name="password" type={showPw ? "text" : "password"} value={form.password} onChange={handle}
                  placeholder="Min. 6 characters" className="input-field pl-10 pr-10 text-sm" />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1.5 animate-fade-in">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= n ? strengthColor : "bg-navy-border"}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-display font-semibold ${strengthText}`}>{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="text-xs font-display font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input name="confirm" type={showCf ? "text" : "password"} value={form.confirm} onChange={handle}
                  placeholder="Re-enter password" className="input-field pl-10 pr-10 text-sm" />
                <button type="button" onClick={() => setShowCf((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.confirm.length > 0 && form.password === form.confirm && (
                <div className="flex items-center gap-1.5 mt-1.5 animate-fade-in">
                  <CheckCircle2 size={12} className="text-neon" />
                  <span className="text-xs text-neon font-display font-semibold">Passwords match</span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose/10 border border-rose/20 animate-fade-in">
                <span className="text-rose text-xs font-body">{error}</span>
              </div>
            )}

            <button onClick={submit} disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-1">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={15} /></>}
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-navy-border text-center">
            <p className="text-sm text-white/40 font-body">
              Already have an account?{" "}
              <button onClick={() => onNavigate("login")} className="text-electric-400 hover:text-electric-300 font-display font-semibold transition-colors">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}