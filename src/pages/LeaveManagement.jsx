import React, { useState, useEffect } from "react";
import { getEmployees, updateLeave } from "../api/endpoints";
import { useToast } from "../context/ToastContext";
import Spinner from "../components/Spinner";

const TOTAL_ANNUAL = 21, TOTAL_MEDICAL = 15;

export default function LeaveManagement() {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [selId,     setSelId]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("annual");
  const [applyF,    setApply]     = useState({ from:"", to:"", reason:"" });
  const [unpaidF,   setUnpaid]    = useState({ from:"", to:"", reason:"" });
  const [submitting,setSubmitting]= useState(false);

  useEffect(() => {
    getEmployees()
      .then(r => { setEmployees(r.data); if (r.data.length) setSelId(r.data[0].id); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner text="Loading leave data…" />;

  const emp = employees.find(e => e.id === selId) || employees[0];
  if (!emp) return <p style={{ padding:"2rem", color:"var(--txt3)" }}>No employees found.</p>;

  const daysBetween = (a,b) => Math.ceil((new Date(b)-new Date(a))/86400000)+1;

  const applyLeave = async () => {
    const days = daysBetween(applyF.from, applyF.to);
    if (!applyF.from || !applyF.to || days < 1) { toast("Please select valid dates.", "warning"); return; }
    setSubmitting(true);
    try {
      const res = await updateLeave(emp.id, { action: tab==="annual"?"apply_annual":"apply_medical", days, reason:applyF.reason, date:applyF.from });
      setEmployees(p => p.map(e => e.id===emp.id ? res.data : e));
      setApply({ from:"", to:"", reason:"" });
      toast(`${days} day(s) of ${tab} leave applied for ${emp.name}.`, "success");
    } catch(err) { toast(err.response?.data?.error || "Failed.", "error"); }
    finally { setSubmitting(false); }
  };

  const recordUnpaid = async () => {
    const days = daysBetween(unpaidF.from, unpaidF.to);
    if (!unpaidF.from || !unpaidF.to || days < 1) { toast("Please select valid dates.", "warning"); return; }
    setSubmitting(true);
    try {
      const res = await updateLeave(emp.id, { action:"record_unpaid", days, reason:unpaidF.reason||"—", date:unpaidF.from });
      setEmployees(p => p.map(e => e.id===emp.id ? res.data : e));
      setUnpaid({ from:"", to:"", reason:"" });
      toast(`${days} unpaid leave day(s) recorded for ${emp.name}.`, "success");
    } catch(err) { toast(err.response?.data?.error || "Failed.", "error"); }
    finally { setSubmitting(false); }
  };

  const usedAnnual  = TOTAL_ANNUAL  - (emp.leave_annual||0);
  const usedMedical = TOTAL_MEDICAL - (emp.leave_medical||0);

  return (
    <>
      <div className="page-header">
        <h2>Leave Management</h2>
        <p>Annual, medical and unpaid leave tracking</p>
      </div>

      <div className="toolbar">
        <select className="search" value={selId||""} onChange={e => setSelId(+e.target.value)}>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.emp_id})</option>)}
        </select>
      </div>

      <div className="two-col">
        {/* Balances */}
        <div className="card">
          <div className="card-header"><span className="card-title">Leave Balances — {emp.name}</span></div>
          {[
            { label:"Annual Leave",  total:TOTAL_ANNUAL,  used:usedAnnual,  bal:emp.leave_annual||0,  color:"var(--org)" },
            { label:"Medical Leave", total:TOTAL_MEDICAL, used:usedMedical, bal:emp.leave_medical||0, color:"var(--ok)"  },
          ].map(l => (
            <div key={l.label} style={{ marginBottom:"1.25rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontWeight:600, fontSize:".84rem" }}>{l.label}</span>
                <span style={{ fontSize:".78rem", color:"var(--txt3)" }}>{l.bal}/{l.total} remaining</span>
              </div>
              <div className="leave-bar">
                <div className="leave-fill" style={{ width:`${Math.min((l.used/l.total)*100,100)}%`, background:l.color }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:".72rem", color:"var(--txt3)", marginTop:4 }}>
                <span>Used: {l.used}d</span><span>Balance: {l.bal}d</span>
              </div>
            </div>
          ))}
          <div style={{ background:(emp.unpaid_days||0)>0?"var(--warn-bg)":"var(--ok-bg)", border:`1px solid ${(emp.unpaid_days||0)>0?"var(--warn-bd)":"var(--ok-bd)"}`, borderRadius:"var(--r2)", padding:".85rem 1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:".69rem", color:(emp.unpaid_days||0)>0?"var(--warn)":"var(--ok)", fontWeight:700, textTransform:"uppercase", letterSpacing:".08em" }}>Unpaid Leave This Year</div>
              <div style={{ fontSize:"1.15rem", fontWeight:800, marginTop:3 }}>{emp.unpaid_days||0} day(s)</div>
            </div>
            <span className={`badge ${(emp.unpaid_days||0)>0?"b-amber":"b-green"}`}>
              {(emp.unpaid_days||0)>0?"Recorded":"None"}
            </span>
          </div>
        </div>

        {/* Apply */}
        <div className="card">
          <div className="card-header"><span className="card-title">Apply / Record Leave</span></div>
          <div className="tabs">
            {["annual","medical","unpaid"].map(t => (
              <div key={t} className={`tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </div>
            ))}
          </div>
          {tab !== "unpaid" ? (
            <>
              <div className="form-row"><label>From Date</label><input type="date" value={applyF.from} onChange={e => setApply({...applyF,from:e.target.value})} /></div>
              <div className="form-row"><label>To Date</label><input type="date" value={applyF.to} onChange={e => setApply({...applyF,to:e.target.value})} /></div>
              <div className="form-row"><label>Reason</label><textarea value={applyF.reason} onChange={e => setApply({...applyF,reason:e.target.value})} /></div>
              <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={applyLeave} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Leave Request"}
              </button>
            </>
          ) : (
            <>
              <div className="info-box">
                Unpaid leave is tracked here. Salary deduction is calculated automatically in <strong>Salary Details</strong>.
              </div>
              <div className="form-row"><label>From Date</label><input type="date" value={unpaidF.from} onChange={e => setUnpaid({...unpaidF,from:e.target.value})} /></div>
              <div className="form-row"><label>To Date</label><input type="date" value={unpaidF.to} onChange={e => setUnpaid({...unpaidF,to:e.target.value})} /></div>
              <div className="form-row"><label>Reason</label><input type="text" placeholder="e.g. Personal reasons" value={unpaidF.reason} onChange={e => setUnpaid({...unpaidF,reason:e.target.value})} /></div>
              <button className="btn btn-outline" style={{ width:"100%", justifyContent:"center" }} onClick={recordUnpaid} disabled={submitting}>
                {submitting ? "Recording…" : "Record Unpaid Leave"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Unpaid log */}
      {(emp.unpaid_log||[]).length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">Unpaid Leave History — {emp.name}</span></div>
          {emp.unpaid_log.map((l,i) => (
            <div key={i} className="log-row">
              <div><div style={{ fontWeight:600, fontSize:".82rem" }}>{l.reason}</div><div style={{ fontSize:".72rem", color:"var(--txt3)" }}>From: {l.date}</div></div>
              <span className="badge b-amber">{l.days} day(s)</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary table */}
      <div className="card">
        <div className="card-header"><span className="card-title">All Employees — Leave Summary</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Dept</th><th>Annual Balance</th><th>Medical Balance</th><th>Unpaid Days</th></tr></thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id} onClick={() => setSelId(e.id)} style={{ cursor:"pointer", background: e.id===selId?"var(--org-lt)":"" }}>
                  <td><div style={{ fontWeight:600 }}>{e.name}</div><div style={{ fontSize:".71rem", color:"var(--txt3)" }}>{e.emp_id}</div></td>
                  <td><span className="dept-pill">{e.dept}</span></td>
                  <td><span className={`badge ${(e.leave_annual||0)>5?"b-green":"b-amber"}`}>{e.leave_annual||0}d</span></td>
                  <td><span className={`badge ${(e.leave_medical||0)>3?"b-blue":"b-amber"}`}>{e.leave_medical||0}d</span></td>
                  <td>{(e.unpaid_days||0)>0?<span className="badge b-red">{e.unpaid_days}d</span>:<span className="badge b-green">None</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
