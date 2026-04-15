import React, { useState, useEffect } from "react";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../api/endpoints";
import {  initials, daysUntil, DEPTS } from "../utils/helpers";
import ExpiryBadge from "../components/ExpiryBadge";
import Spinner from "../components/Spinner";
import { useToast } from "../context/ToastContext";

const BLANK = { name:"", emp_id:"", dept:"", designation:"", joining:"", bank:"", passport_exp:"", emirates_exp:"", visa_exp:"", basic:"", allowances:"", status:"Active" };

/* ── Add / Edit Modal ─────────────────────────────────────────────── */
function EmpModal({ title, emp, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(emp ? { ...emp, basic: emp.basic||"", allowances: emp.allowances||"" } : BLANK);
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p => ({ ...p, [k]:v }));

  const save = async () => {
    if (!form.name || !form.emp_id || !form.dept) { toast("Name, ID and Department are required.", "warning"); return; }
    setSaving(true);
    try {
      const payload = { ...form, basic: parseFloat(form.basic)||0, allowances: parseFloat(form.allowances)||0 };
      let res;
      if (emp) res = await updateEmployee(emp.id, payload);
      else     res = await createEmployee(payload);
      toast(`${res.data.name} ${emp ? "updated" : "added"} successfully.`, "success");
      onSaved(res.data);
      onClose();
    } catch(err) {
      toast(err.response?.data?.error || "Failed to save.", "error");
    } finally { setSaving(false); }
  };

  const fields = [
    ["Full Name","name","text","Ahmed Al Mansouri"],
    ["Employee ID","emp_id","text","EMP006"],
    ["Designation","designation","text","Engineer"],
    ["Joining Date","joining","date",""],
    ["Basic Salary (AED)","basic","number","5000"],
    ["Allowances (AED)","allowances","number","1500"],
    ["Bank / WPS Details","bank","text","FAB — 1234567890"],
    ["Passport Expiry","passport_exp","date",""],
    ["Emirates ID Expiry","emirates_exp","date",""],
    ["Visa Expiry","visa_exp","date",""],
  ];

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid">
          {fields.map(([lbl,key,type,ph]) => (
            <div className="form-row" key={key}>
              <label>{lbl}</label>
              <input type={type} placeholder={ph} value={form[key]||""} onChange={e => set(key, e.target.value)} />
            </div>
          ))}
          <div className="form-row">
            <label>Department</label>
            <select value={form.dept} onChange={e => set("dept", e.target.value)}>
              <option value="">Select department</option>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}>
              <option>Active</option><option>Inactive</option>
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:".75rem", justifyContent:"flex-end", marginTop:"1.5rem" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <><div className="spinner" style={{width:14,height:14,borderWidth:2}}/> Saving…</> : emp ? "Update Employee" : "Save Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── View Profile Modal ───────────────────────────────────────────── */
function ViewModal({ emp, onClose, onEdit }) {
  if (!emp) return null;
  const yrs = emp.joining ? ((Date.now() - new Date(emp.joining)) / (1000*60*60*24*365.25)).toFixed(2) : "—";
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <h3>Employee Profile</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:"1.4rem", padding:"1.1rem", background:"var(--bg)", borderRadius:"var(--r3)", border:"1px solid var(--border)" }}>
          <div className="av av-lg">{initials(emp.name)}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:"1.1rem", letterSpacing:"-.02em" }}>{emp.name}</div>
            <div style={{ fontSize:".8rem", color:"var(--txt3)", marginTop:3 }}>{emp.designation} · {emp.dept}</div>
            <div style={{ fontSize:".75rem", color:"var(--txt3)", marginTop:2 }}>{emp.emp_id}</div>
          </div>
          <span className={`badge ${emp.status==="Active"?"b-green":"b-gray"}`}>{emp.status}</span>
        </div>
        <div className="kv-grid">
          {[
            ["Joining Date", emp.joining],
            ["Bank / WPS",   emp.bank],
            ["Basic Salary", `AED ${(emp.basic||0).toLocaleString()}`],
            ["Allowances",   `AED ${(emp.allowances||0).toLocaleString()}`],
            ["Years of Service", `${yrs} years`],
            ["Unpaid Days",  `${emp.unpaid_days||0} day(s)`],
          ].map(([k,v]) => (
            <div className="kv-item" key={k}><div className="kv-lbl">{k}</div><div className="kv-val">{v||"—"}</div></div>
          ))}
        </div>
        <label style={{ marginBottom:".65rem", display:"block" }}>Document Expiry</label>
        <div className="doc-grid">
          {[["Passport",emp.passport_exp],["Emirates ID",emp.emirates_exp],["Visa",emp.visa_exp]].map(([doc,exp]) => (
            <div className="doc-card" key={doc}>
              <div className="doc-lbl">{doc}</div>
              <div className="doc-date">{exp||"—"}</div>
              <ExpiryBadge dateStr={exp} />
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:".75rem", justifyContent:"flex-end", marginTop:"1.5rem" }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(emp); }}>Edit Employee</button>
        </div>
      </div>
    </div>
  );
}

/* ── Inline editable row ──────────────────────────────────────────── */
function EmpRow({ emp, onUpdated, onDeleted, onView }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState({ ...emp });
  const [saving,  setSaving]  = useState(false);
  const set = (k,v) => setDraft(d => ({ ...d, [k]:v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateEmployee(emp.id, { ...draft, basic:parseFloat(draft.basic)||0, allowances:parseFloat(draft.allowances)||0 });
      toast(`${res.data.name} updated.`, "success");
      onUpdated(res.data);
      setEditing(false);
    } catch(err) {
      toast(err.response?.data?.error || "Update failed.", "error");
    } finally { setSaving(false); }
  };
  const cancel = () => { setDraft({ ...emp }); setEditing(false); };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${emp.name}?`)) return;
    try {
      await deleteEmployee(emp.id);
      toast(`${emp.name} deleted.`, "info");
      onDeleted(emp.id);
    } catch { toast("Delete failed.", "error"); }
  };

  const yrs = emp.joining ? ((Date.now()-new Date(emp.joining))/(1000*60*60*24*365.25)).toFixed(1) : "—";

  return (
    <tr className={editing ? "row-editing" : ""}>
      <td>
        {editing
          ? <input value={draft.name} onChange={e => set("name",e.target.value)} style={{ minWidth:140 }} />
          : <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div className="av av-sm">{initials(emp.name)}</div>
              <div>
                <div style={{ fontWeight:600 }}>{emp.name}</div>
                <div style={{ fontSize:".7rem", color:"var(--txt3)" }}>{emp.emp_id}</div>
              </div>
            </div>
        }
      </td>
      <td>
        {editing
          ? <select value={draft.dept} onChange={e => set("dept",e.target.value)} style={{ minWidth:110 }}>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          : <span className="dept-pill">{emp.dept}</span>
        }
      </td>
      <td>
        {editing
          ? <input value={draft.designation} onChange={e => set("designation",e.target.value)} style={{ minWidth:130 }} />
          : <span style={{ color:"var(--txt2)", fontSize:".82rem" }}>{emp.designation}</span>
        }
      </td>
      <td>
        {editing
          ? <input type="number" value={draft.basic} onChange={e => set("basic",e.target.value)} style={{ minWidth:90 }} />
          : <span style={{ fontWeight:600 }}>AED {(emp.basic||0).toLocaleString()}</span>
        }
      </td>
      <td><span className="badge b-blue">{yrs} yrs</span></td>
      <td><ExpiryBadge dateStr={emp.visa_exp} /></td>
      <td>
        {editing
          ? <select value={draft.status} onChange={e => set("status",e.target.value)} style={{ minWidth:90 }}>
              <option>Active</option><option>Inactive</option>
            </select>
          : <span className={`badge ${emp.status==="Active"?"b-green":"b-gray"}`}>{emp.status}</span>
        }
      </td>
      <td>
        {editing
          ? <div style={{ display:"flex", gap:5 }}>
              <button className="btn btn-success btn-sm" onClick={save} disabled={saving}>
                {saving ? "…" : "✓ Save"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={cancel}>✕</button>
            </div>
          : <div style={{ display:"flex", gap:5 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => onView(emp)}>View</button>
              <button className="btn btn-sm" style={{ background:"var(--org-lt)", color:"var(--org-dk)", border:"1px solid var(--org-mid)" }} onClick={() => setEditing(true)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Del</button>
            </div>
        }
      </td>
    </tr>
  );
}

/* ── Main Page ────────────────────────────────────────────────────── */
export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [deptF,     setDeptF]     = useState("all");
  const [showAdd,   setShowAdd]   = useState(false);
  const [viewEmp,   setViewEmp]   = useState(null);
  const [editEmp,   setEditEmp]   = useState(null);

  useEffect(() => {
    getEmployees()
      .then(r => setEmployees(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter(e => {
    const ms = e.name.toLowerCase().includes(search.toLowerCase()) || e.emp_id.toLowerCase().includes(search.toLowerCase()) || (e.designation||"").toLowerCase().includes(search.toLowerCase());
    const md = deptF === "all" || e.dept === deptF;
    return ms && md;
  });

  const handleAdded   = emp => setEmployees(p => [...p, emp]);
  const handleUpdated = emp => setEmployees(p => p.map(e => e.id===emp.id ? emp : e));
  const handleDeleted = id  => setEmployees(p => p.filter(e => e.id !== id));

  if (loading) return <Spinner text="Loading employees…" />;

  return (
    <>
      <div className="page-header">
        <h2>Employee Management</h2>
        <p>Add, edit and manage all employee records with inline editing</p>
      </div>

      <div className="toolbar">
        <input className="search" placeholder="Search name, ID, designation…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select value={deptF} onChange={e => setDeptF(e.target.value)} style={{ maxWidth:165 }}>
          <option value="all">All Departments</option>
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Employee</button>
        <span style={{ marginLeft:"auto", fontSize:".78rem", color:"var(--txt3)" }}>
          {filtered.length} of {employees.length} employees
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Basic Salary</th>
              <th>Service</th>
              <th>Visa</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <EmpRow key={e.id} emp={e}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
                onView={setViewEmp}
              />
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign:"center", color:"var(--txt3)", padding:"3rem", fontSize:".88rem" }}>
                No employees found
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd  && <EmpModal title="Add New Employee" onClose={() => setShowAdd(false)} onSaved={handleAdded} />}
      {viewEmp  && <ViewModal emp={viewEmp} onClose={() => setViewEmp(null)} onEdit={e => { setViewEmp(null); setEditEmp(e); }} />}
      {editEmp  && <EmpModal title="Edit Employee" emp={editEmp} onClose={() => setEditEmp(null)} onSaved={e => { handleUpdated(e); setEditEmp(null); }} />}
    </>
  );
}
