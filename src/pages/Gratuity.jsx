import React, { useState, useEffect } from "react";
import { getGratuity } from "../api/endpoints";
import { fmtAED } from "../utils/helpers";
import Spinner from "../components/Spinner";

export default function Gratuity() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    getGratuity()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Calculating gratuity…" />;

  const totalLiability = data.reduce((s,e) => s + (e.gratuity?.amount||0), 0);
  const eligible       = data.filter(e => e.gratuity?.tier !== "ineligible").length;
  const above5         = data.filter(e => e.gratuity?.tier === "above5").length;
  const tierCount      = t => data.filter(e => e.gratuity?.tier === t).length;

  const list = filter === "all" ? data : data.filter(e => String(e.id) === filter);

  return (
    <>
      <div className="page-header">
        <h2>Gratuity Calculator</h2>
        <p>UAE Labour Law — End of Service benefit calculation</p>
      </div>

      <div className="stats-grid g3">
        <div className="stat-card"><div className="stat-icon ic-o">🏅</div><div className="stat-body"><div className="stat-label">Total Liability</div><div className="stat-value">{fmtAED(totalLiability)}</div><div className="stat-sub">Accrued to date</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-g">✓</div><div className="stat-body"><div className="stat-label">Eligible (1+ yr)</div><div className="stat-value">{eligible}</div><div className="stat-sub">Employees</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-b">★</div><div className="stat-body"><div className="stat-label">Above 5 Years</div><div className="stat-value">{above5}</div><div className="stat-sub">Enhanced rate</div></div></div>
      </div>

      <div className="info-box">
        <strong>UAE Labour Law — Gratuity Formula</strong><br />
        • Less than 1 year → No gratuity &nbsp;|&nbsp; 1–5 years → 21 days basic/year
        &nbsp;|&nbsp; Above 5 years → 21d/yr (first 5) + 30d/yr (beyond 5) &nbsp;|&nbsp; Cap: 24 months basic salary
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:".65rem", marginBottom:"1.35rem" }}>
        {[
          { key:"ineligible", label:"Less than 1 year",          color:"var(--err)"  },
          { key:"1to5",       label:"1–5 years (21 days/yr)",    color:"var(--warn)" },
          { key:"above5",     label:"Above 5 years (30 days/yr)",color:"var(--ok)"   },
        ].map(t => (
          <div key={t.key} className="tier-row">
            <div className="tier-dot" style={{ background:t.color }} />
            <span style={{ fontSize:".82rem", flex:1 }}>{t.label}</span>
            <span className="badge b-gray">{tierCount(t.key)}</span>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <select className="search" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Employees</option>
          {data.map(e => <option key={e.id} value={e.id}>{e.name} ({e.emp_id})</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Employee</th><th>Dept</th><th>Joining</th><th>Service</th><th>Basic</th><th>Tier</th><th>Gratuity</th></tr>
          </thead>
          <tbody>
            {list.map(e => {
              const g = e.gratuity || {};
              return (
                <tr key={e.id}>
                  <td><div style={{ fontWeight:600 }}>{e.name}</div><div style={{ fontSize:".71rem", color:"var(--txt3)" }}>{e.emp_id}</div></td>
                  <td><span className="dept-pill">{e.dept}</span></td>
                  <td style={{ color:"var(--txt3)" }}>{e.joining}</td>
                  <td><span className="badge b-blue">{(g.years||0).toFixed(2)} yrs</span></td>
                  <td style={{ fontWeight:600 }}>AED {(e.basic||0).toLocaleString()}</td>
                  <td>
                    {g.tier==="ineligible" && <span className="badge b-red">Ineligible</span>}
                    {g.tier==="1to5"       && <span className="badge b-amber">21d / yr</span>}
                    {g.tier==="above5"     && <span className="badge b-green">30d / yr</span>}
                  </td>
                  <td>
                    {g.tier==="ineligible"
                      ? <span style={{ color:"var(--txt3)" }}>—</span>
                      : <div>
                          <div style={{ fontWeight:800, color:"var(--org)", fontSize:".95rem" }}>{fmtAED(g.amount)}</div>
                          {g.capped && <div style={{ fontSize:".69rem", color:"var(--warn)", marginTop:2 }}>Capped (2yr limit)</div>}
                        </div>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
