import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { initials } from "../utils/helpers";

const NAV = [
  { id:"dashboard", icon:"⊞", label:"Dashboard",       grp:"MAIN"       },
  { id:"employees", icon:"👥", label:"Employees",       grp:"MAIN"       },
  { id:"salary",    icon:"💰", label:"Salary Details",  grp:"PAYROLL"    },
  { id:"leave",     icon:"📅", label:"Leave",           grp:"PAYROLL"    },
  { id:"gratuity",  icon:"🏅", label:"Gratuity",        grp:"PAYROLL"    },
  { id:"documents", icon:"📄", label:"Documents",       grp:"COMPLIANCE" },
];

export default function AppShell({ page, setPage, children }) {
  const { user, logout } = useAuth();
  const { isMobile }     = useBreakpoint();
  const [coll, setColl]  = useState(false);
  const [mob,  setMob]   = useState(false);

  const toggle = () => isMobile ? setMob(v => !v) : setColl(v => !v);
  const nav    = id => { setPage(id); if (isMobile) setMob(false); };
  const label  = NAV.find(n => n.id === page)?.label || "Dashboard";

  return (
    <div className="app">
      {isMobile && <div className={`sb-overlay ${mob ? "show" : ""}`} onClick={() => setMob(false)} />}

      <aside className={`sidebar ${!isMobile && coll ? "coll" : ""} ${isMobile && mob ? "mob-open" : ""}`}>
        <div className="sb-logo">
          <div className="sb-logo-icon">P</div>
          <div className="sb-logo-text">
            <h1>PayrollPro</h1>
            <span>UAE System</span>
          </div>
        </div>
        <nav className="sb-nav">
          {["MAIN","PAYROLL","COMPLIANCE"].map(grp => (
            <div key={grp}>
              <div className="sb-section">{grp}</div>
              {NAV.filter(n => n.grp === grp).map(item => (
                <div key={item.id}
                  className={`nav-item ${page === item.id ? "active" : ""}`}
                  onClick={() => nav(item.id)}
                  title={coll && !isMobile ? item.label : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="user-pill" onClick={logout} title="Click to log out">
            <div className="user-avatar">{initials(user?.name || "U")}</div>
            <div style={{ overflow:"hidden" }}>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      <header className={`topbar ${!isMobile && coll ? "coll" : ""}`}>
        <div className="tb-left">
          <button className="icon-btn" onClick={toggle} aria-label="Toggle sidebar">☰</button>
          <div>
            <div className="tb-title">{label}</div>
            <div className="tb-sub">PayrollPro / {label}</div>
          </div>
        </div>
        <div className="tb-right">
          <button className="icon-btn notif-wrap" title="Notifications">
            🔔 <span className="notif-dot" />
          </button>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>
      </header>

      <main className={`main-wrap ${!isMobile && coll ? "coll" : ""}`}>
        <div key={page} className="pg">{children}</div>
      </main>
    </div>
  );
}
