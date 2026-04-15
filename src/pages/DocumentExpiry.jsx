import React, { useState, useEffect } from "react";
import { getDocuments } from "../api/endpoints";
import ExpiryBadge from "../components/ExpiryBadge";
import Spinner from "../components/Spinner";

export default function DocumentExpiry() {
  const [docs,    setDocs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocuments()
      .then(r => setDocs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading documents…" />;

  const expired  = docs.filter(d => d.status === "expired").length;
  const critical = docs.filter(d => d.status === "critical").length;
  const warning  = docs.filter(d => d.status === "warning").length;
  const valid    = docs.filter(d => d.status === "valid").length;

  const daysColor = d => {
    if (d < 0)  return "var(--err)";
    if (d < 30) return "var(--err)";
    if (d < 90) return "var(--warn)";
    return "var(--ok)";
  };

  return (
    <>
      <div className="page-header">
        <h2>Document Expiry Tracker</h2>
        <p>Passport, Emirates ID and Visa expiry monitoring — sorted by urgency</p>
      </div>

      <div className="stats-grid g4">
        <div className="stat-card"><div className="stat-icon ic-r">🚨</div><div className="stat-body"><div className="stat-label">Expired</div><div className="stat-value">{expired}</div><div className="stat-sub">Immediate action</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-a">⚠️</div><div className="stat-body"><div className="stat-label">Critical &lt;30d</div><div className="stat-value">{critical}</div><div className="stat-sub">Urgent renewal</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-b">🕐</div><div className="stat-body"><div className="stat-label">Warning &lt;90d</div><div className="stat-value">{warning}</div><div className="stat-sub">Plan renewal</div></div></div>
        <div className="stat-card"><div className="stat-icon ic-g">✓</div><div className="stat-body"><div className="stat-label">Valid</div><div className="stat-value">{valid}</div><div className="stat-sub">No action needed</div></div></div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Employee</th><th>Dept</th><th>Document</th><th>Expiry Date</th><th>Days Left</th><th>Status</th></tr>
          </thead>
          <tbody>
            {docs.map((d,i) => (
              <tr key={i}>
                <td>
                  <div style={{ fontWeight:600, fontSize:".82rem" }}>{d.emp_name}</div>
                  <div style={{ fontSize:".71rem", color:"var(--txt3)" }}>{d.emp_code}</div>
                </td>
                <td><span className="dept-pill">{d.dept}</span></td>
                <td style={{ fontWeight:600 }}>{d.doc}</td>
                <td style={{ color:"var(--txt3)" }}>{d.exp_date || "—"}</td>
                <td style={{ fontWeight:700, color:daysColor(d.days_left) }}>
                  {d.days_left < 0 ? `${Math.abs(d.days_left)}d overdue` : `${d.days_left}d`}
                </td>
                <td><ExpiryBadge dateStr={d.exp_date} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
