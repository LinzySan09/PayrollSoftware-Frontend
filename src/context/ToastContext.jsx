import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const Ctx = createContext(null);
const PAL = {
  success: { bg:"#f0fdf4", bd:"#86efac", ic:"#16a34a", tx:"#15803d" },
  error:   { bg:"#fef2f2", bd:"#fca5a5", ic:"#dc2626", tx:"#b91c1c" },
  warning: { bg:"#fffbeb", bd:"#fde68a", ic:"#d97706", tx:"#b45309" },
  info:    { bg:"#eff6ff", bd:"#93c5fd", ic:"#2563eb", tx:"#1d4ed8" },
};

function ToastItem({ t, onDone }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const id = setTimeout(() => setVis(true), 16); return () => clearTimeout(id); }, []);
  const c = PAL[t.type] || PAL.success;
  return (
    <div onClick={() => onDone(t.id)} style={{
      display:"flex", alignItems:"flex-start", gap:10,
      background:c.bg, border:`1px solid ${c.bd}`,
      borderRadius:12, padding:"12px 16px",
      boxShadow:"0 8px 32px rgba(0,0,0,.12)",
      minWidth:280, maxWidth:400, cursor:"pointer",
      transform: vis ? "translateX(0)" : "translateX(120%)",
      opacity: vis ? 1 : 0,
      transition:"transform .35s cubic-bezier(.34,1.56,.64,1), opacity .25s ease",
      fontFamily:"'Sora',system-ui,sans-serif",
    }}>
      <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, background:c.ic, color:"#fff", marginTop:1, display:"flex", alignItems:"center", justifyContent:"center", fontSize:".68rem", fontWeight:700 }}>
        {t.type==="success"?"✓":t.type==="error"?"✕":t.type==="warning"?"!":"i"}
      </div>
      <span style={{ fontSize:".83rem", color:c.tx, fontWeight:500, lineHeight:1.45 }}>{t.message}</span>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, set] = useState([]);
  const toast = useCallback((message, type="success", ms=3500) => {
    const id = Date.now() + Math.random();
    set(p => [...p, { id, message, type }]);
    setTimeout(() => set(p => p.filter(x => x.id !== id)), ms);
  }, []);
  const rm = id => set(p => p.filter(x => x.id !== id));
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:9999, display:"flex", flexDirection:"column", gap:8 }}>
        {toasts.map(t => <ToastItem key={t.id} t={t} onDone={rm} />)}
      </div>
    </Ctx.Provider>
  );
}
export const useToast = () => useContext(Ctx);
