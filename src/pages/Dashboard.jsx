import React, { useEffect, useState } from "react";
import { getDashboard, getEmployees } from "../api/endpoints";
import { fmtAED, initials, daysUntil } from "../utils/helpers";
import ExpiryBadge from "../components/ExpiryBadge";
import Spinner from "../components/Spinner";

function StatCard({ icon, cls, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ic-${cls}`}>{icon}</div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-sub">{sub}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary,   setSummary]   = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getEmployees()])
      .then(([s, e]) => { setSummary(s.data); setEmployees(Array.isArray(e.data) ? e.data : []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading dashboard…" />;

  const alertDocs = (Array.isArray(employees) ? employees : [])
    .flatMap(e => [
      { name:e.name, doc:"Visa",        exp:e.visa_exp,      dept:e.dept },
      { name:e.name, doc:"Emirates ID", exp:e.emirates_exp,  dept:e.dept },
      { name:e.name, doc:"Passport",    exp:e.passport_exp,  dept:e.dept },
    ])
    .filter(x => daysUntil(x.exp) < 90)
    .sort((a,b) => daysUntil(a.exp) - daysUntil(b.exp))
    .slice(0, 7);

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Live payroll &amp; workforce overview</p>
      </div>

      <div className="stats-grid g4">
        <StatCard icon="👥" cls="o" label="Total Employees"    value={summary?.total_employees || 0}          sub="Active staff"      />
        <StatCard icon="💵" cls="g" label="Monthly Payroll"    value={fmtAED(summary?.total_payroll || 0)}    sub="This month"        />
        <StatCard icon="🏅" cls="b" label="Gratuity Liability" value={fmtAED(summary?.total_gratuity || 0)}   sub="Accrued to date"   />
        <StatCard icon="⚠️" cls="a" label="Doc Expiry Alerts"  value={summary?.expiring_docs || 0}            sub="Within 60 days"    />
      </div>

      <div className="two-col-lg">
        {/* Employee table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Employee Summary</span>
            <span className="badge b-org">{Array.isArray(employees) ? employees.length : 0} total</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Employee</th><th>Dept</th><th>Net Salary</th><th>Status</th></tr>
              </thead>
              <tbody>
                {(Array.isArray(employees) ? employees : []).map(e => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div className="av av-sm">{initials(e.name)}</div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:".82rem" }}>{e.name}</div>
                          <div style={{ fontSize:".7rem", color:"var(--txt3)" }}>{e.emp_id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="dept-pill">{e.dept}</span></td>
                    <td style={{ fontWeight:700, color:"var(--ok)" }}>
                      {fmtAED((e.basic||0)+(e.allowances||0)+(e.bonus||0)-(e.advance||0)-(e.deductions||0))}
                    </td>
                    <td><span className={`badge ${e.status==="Active"?"b-green":"b-gray"}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Document Alerts</span>
              {(summary?.expiring_docs||0) > 0 && (
                <span className="badge b-red">{summary.expiring_docs} urgent</span>
              )}
            </div>
            {alertDocs.length === 0
              ? <p style={{ fontSize:".82rem", color:"var(--txt3)" }}>All documents valid ✓</p>
              : alertDocs.map((x,i) => (
                  <div key={i} className="expiry-row">
                    <div>
                      <div style={{ fontWeight:600, fontSize:".82rem" }}>{x.name}</div>
                      <div style={{ fontSize:".72rem", color:"var(--txt3)" }}>{x.doc} · {x.dept}</div>
                    </div>
                    <ExpiryBadge dateStr={x.exp} />
                  </div>
                ))
            }
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Unpaid Leave</span></div>
            {(Array.isArray(employees) ? employees : []).filter(e => (e.unpaid_days||0) > 0).length === 0
              ? <p style={{ fontSize:".82rem", color:"var(--txt3)" }}>No unpaid leave recorded</p>
              : (Array.isArray(employees) ? employees : []).filter(e => (e.unpaid_days||0) > 0).map(e => (
                  <div key={e.id} className="expiry-row">
                    <div>
                      <div style={{ fontWeight:600, fontSize:".82rem" }}>{e.name}</div>
                      <div style={{ fontSize:".72rem", color:"var(--txt3)" }}>{e.dept}</div>
                    </div>
                    <span className="badge b-amber">{e.unpaid_days}d</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </>
  );
}
