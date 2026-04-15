import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const FEATURES = [ 
  "Leave-linked salary auto-calculation",
  "Automated overtime & UAE gratuity law",
  "Passport, Emirates ID & Visa expiry alerts",
  "Printable payslip with full breakdown",
];

export default function Login() {
  const { login } = useAuth();
  const [form,    setForm]   = useState({ username: "", password: "" });
  const [error,   setError]  = useState("");
  const [loading, setLoading]= useState(false);
  const [showPwd, setShowPwd]= useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password) { setError("Please enter username and password."); return; }
    setLoading(true);
    try { await login(form.username, form.password); }
    catch (err) { setError(err.response?.data?.error || err.message || "Login failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      {/* ── Left Panel ── */}
      <div className="login-left">
        <div className="ll-blob" />
        <div className="ll-content">
          <div className="ll-logo">P</div>
          <h1>Payroll<br /><span>Pro</span></h1>
          <p>Complete UAE payroll management — salaries, leave, gratuity and document compliance in one place.</p>
          <div className="ll-feats">
            {FEATURES.map(f => (
              <div className="ll-feat" key={f}>
                <div className="ll-feat-icon">✓</div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="login-right">
        <div className="login-box ani">
          <h2>Welcome back</h2>
          <p className="sub">Sign in to your PayrollPro account</p>

          <div className="demo-box">
            <strong>Demo credentials — click to fill:</strong>
            <div className="demo-chips">
              {[["admin","admin123","Admin"],["hr","hr123","HR"],["finance","finance123","Finance"]].map(([u,p,l]) => (
                <button key={u} type="button" className="demo-chip"
                  onClick={() => setForm({ username:u, password:p })}>{l}</button>
              ))}
            </div>
          </div>

          {error && (
            <div className="login-err">
              <span style={{ fontWeight:700 }}>⚠</span> {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="form-row" style={{ marginBottom:"1rem" }}>
              <label>Username</label>
              <input type="text" placeholder="Enter your username"
                autoComplete="username" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="form-row" style={{ marginBottom:"1.75rem" }}>
              <label>Password</label>
              <div className="pw-wrap">
                <input type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="pw-toggle" tabIndex={-1}
                  onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width:"100%", justifyContent:"center", padding:".75rem", fontSize:".92rem", letterSpacing:".02em" }}>
              {loading
                ? <><div className="spinner" style={{ width:16, height:16, borderWidth:2 }} />Signing in…</>
                : "Sign In →"
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
