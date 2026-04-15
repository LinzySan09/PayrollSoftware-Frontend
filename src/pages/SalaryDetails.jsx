import React, { useState, useEffect } from "react";
import { getEmployees, getSalary, updateSalary } from "../api/endpoints";
import { fmtAED, initials, MONTHS } from "../utils/helpers";
import { useToast } from "../context/ToastContext";
import Spinner from "../components/Spinner";

const TOTAL_ANNUAL = 21,
  TOTAL_MEDICAL = 15;

/* ── Payslip Modal ────────────────────────────────────────────────── */
function PayslipModal({ emp, bd, month, year, onClose }) {
  const mon = MONTHS[month - 1];

  const Row = ({ lbl, val, color, bold }) => (
    <tr>
      <td
        style={{
          color: bold ? "var(--txt)" : "var(--txt2)",
          padding: "8px 10px 8px 0",
          borderBottom: "1px dashed var(--border)",
          fontSize: ".82rem",
          fontWeight: bold ? 700 : 400,
          width: "70%",
        }}
      >
        {lbl}
      </td>
      <td
        style={{
          textAlign: "right",
          fontWeight: bold ? 800 : 600,
          padding: "8px 0 8px 6px",
          borderBottom: "1px dashed var(--border)",
          fontSize: ".82rem",
          color: color || (bold ? "var(--txt)" : "var(--txt)"),
          whiteSpace: "nowrap",
          width: "40%",
        }}
      >
        {val}
      </td>
    </tr>
  );

  return (
    <div
      onClick={onClose}
      // style={{
      //   position: "fixed", inset: 0,
      //   // background: "rgba(0,0,0,0.5)",
      //   backdropFilter: "blur(2px)",
      //   zIndex: 300,
      //   display: "flex",
      //   alignItems: "flex-start",
      //   justifyContent: "center",
      //   padding: "1rem",
      //   overflowY: "auto",
      // }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // backdropFilter: "blur(2px)",
        // optional overlay
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r4)",
          width: "100%",
          maxWidth: 580,
          margin: "auto",
          boxShadow: "var(--sh3)",
          animation: "slideUp .22s var(--spring)",
          overflow: "hidden",
        }}
      >
        {/* ── Modal Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.1rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--txt)",
              letterSpacing: "-.02em",
            }}
          >
            Payslip — {mon} {year}
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => window.print()}
            >
              🖨 Print
            </button>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* ── Scrollable Content ── */}

        {/* <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 180px)", padding: "0" }}></div> */}
        <div style={{ overflowY: "auto", maxHeight: "100%", padding: "0" }}>
          <div style={{ padding: "1.25rem 1.5rem" }}>
            {/* ── Employee Info ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: ".9rem 1rem",
                background: "var(--bg)",
                borderRadius: "var(--r2)",
                border: "1px solid var(--border)",
                marginBottom: "1.25rem",
                flexWrap: "wrap",
              }}
            >
              <div className="av av-md">{initials(emp.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: ".95rem",
                    color: "var(--txt)",
                  }}
                >
                  {emp.name}
                </div>
                <div
                  style={{
                    fontSize: ".76rem",
                    color: "var(--txt3)",
                    marginTop: 2,
                  }}
                >
                  {emp.designation} · {emp.dept} · {emp.emp_id}
                </div>
                <div
                  style={{
                    fontSize: ".73rem",
                    color: "var(--txt3)",
                    marginTop: 1,
                  }}
                >
                  Joined: {emp.joining} &nbsp;|&nbsp; Bank: {emp.bank}
                </div>
              </div>
            </div>

            {/* ── Earnings ── */}
            <div style={{ marginBottom: "1.1rem" }}>
              <div
                style={{
                  fontSize: ".67rem",
                  fontWeight: 700,
                  color: "var(--ok)",
                  textTransform: "uppercase",
                  letterSpacing: ".12em",
                  borderBottom: "2px solid var(--ok-bd)",
                  paddingBottom: 5,
                  marginBottom: 2,
                }}
              >
                Earnings
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                }}
              >
                <tbody>
                  <Row lbl="Basic Salary" val={fmtAED(bd.basic)} />
                  <Row lbl="Allowances" val={fmtAED(bd.allowances)} />
                  {bd.ot > 0 && (
                    <Row
                      lbl={`Overtime (${emp.ot_hours}h × 1.5×)`}
                      val={`+${fmtAED(bd.ot)}`}
                      color="var(--info)"
                    />
                  )}
                  {bd.bonus > 0 && (
                    <Row
                      lbl="Bonus / Incentive"
                      val={`+${fmtAED(bd.bonus)}`}
                      color="var(--info)"
                    />
                  )}
                  {bd.leave_encashment > 0 && (
                    <Row
                      lbl={`Leave Encashment (${emp.leave_encash}d)`}
                      val={`+${fmtAED(bd.leave_encashment)}`}
                      color="var(--ok)"
                    />
                  )}
                </tbody>
              </table>
              {/* Gross total row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--ok-bg)",
                  border: "1px solid var(--ok-bd)",
                  borderRadius: "var(--r1)",
                  padding: "9px 10px",
                  marginTop: 4,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: ".83rem" }}>
                  Gross Salary
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: ".9rem",
                    color: "var(--ok)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmtAED(bd.gross)}
                </span>
              </div>
            </div>

            {/* ── Deductions ── */}
            <div style={{ marginBottom: "1.1rem" }}>
              <div
                style={{
                  fontSize: ".67rem",
                  fontWeight: 700,
                  color: "var(--err)",
                  textTransform: "uppercase",
                  letterSpacing: ".12em",
                  borderBottom: "2px solid var(--err-bd)",
                  paddingBottom: 5,
                  marginBottom: 2,
                }}
              >
                Deductions
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                }}
              >
                <tbody>
                  {bd.advance > 0 && (
                    <Row
                      lbl="Advance / Loan"
                      val={`−${fmtAED(bd.advance)}`}
                      color="var(--err)"
                    />
                  )}
                  {bd.other_deductions > 0 && (
                    <Row
                      lbl="Other Deductions"
                      val={`−${fmtAED(bd.other_deductions)}`}
                      color="var(--err)"
                    />
                  )}
                  {bd.unpaid_deduction > 0 && (
                    <Row
                      lbl={`Unpaid Leave (${emp.unpaid_days}d × AED ${bd.daily_rate}/day)`}
                      val={`−${fmtAED(bd.unpaid_deduction)}`}
                      color="var(--err)"
                    />
                  )}
                  {bd.total_deductions === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          fontSize: ".78rem",
                          color: "var(--txt3)",
                          fontStyle: "italic",
                          padding: "9px 0",
                        }}
                      >
                        No deductions this month
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* Total deductions row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--err-bg)",
                  border: "1px solid var(--err-bd)",
                  borderRadius: "var(--r1)",
                  padding: "9px 10px",
                  marginTop: 4,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: ".83rem" }}>
                  Total Deductions
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: ".9rem",
                    color: "var(--err)",
                    whiteSpace: "nowrap",
                  }}
                >
                  −{fmtAED(bd.total_deductions)}
                </span>
              </div>
            </div>

            {/* ── Leave Impact Note ── */}
            {(bd.unpaid_deduction > 0 || bd.leave_encashment > 0) && (
              <div
                style={{
                  background: "var(--org-lt)",
                  border: "1px solid var(--org-mid)",
                  borderRadius: "var(--r2)",
                  padding: ".78rem 1rem",
                  marginBottom: "1.1rem",
                  fontSize: ".78rem",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--org-dk)",
                    marginBottom: 5,
                  }}
                >
                  Leave impact on this payslip
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {bd.unpaid_deduction > 0 && (
                    <span style={{ color: "var(--err)", fontWeight: 600 }}>
                      ↓ Unpaid: {emp.unpaid_days}d = −
                      {fmtAED(bd.unpaid_deduction)}
                    </span>
                  )}
                  {bd.leave_encashment > 0 && (
                    <span style={{ color: "var(--ok)", fontWeight: 600 }}>
                      ↑ Encash: {emp.leave_encash}d = +
                      {fmtAED(bd.leave_encashment)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── Net Salary ── */}
            <div
              style={{
                background: "linear-gradient(135deg, var(--org), #f66f0d)",
                borderRadius: "var(--r2)",
                padding: "1rem 1.15rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 20px rgba(249,115,22,.28)",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: ".82rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,.85)",
                  }}
                >
                  Net Salary Payable
                </div>
                <div
                  style={{
                    fontSize: ".71rem",
                    color: "rgba(255,255,255,.65)",
                    marginTop: 2,
                  }}
                >
                  {mon} {year}
                </div>
              </div>
              <div
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-.02em",
                  whiteSpace: "nowrap",
                }}
              >
                {fmtAED(bd.net)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────── */
export default function SalaryDetails() {
  const toast = useToast();
  const today = new Date();
  const [employees, setEmployees] = useState([]);
  const [selId, setSelId] = useState(null);
  const [salData, setSalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [otH, setOtH] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [adv, setAdv] = useState(0);
  const [ded, setDed] = useState(0);
  const [encash, setEncash] = useState(0);
  const [unpaidD, setUnpaidD] = useState(0);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [showPS, setShowPS] = useState(false);

  useEffect(() => {
    getEmployees()
      .then((r) => {
        setEmployees(r.data);
        if (r.data.length) setSelId(r.data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selId) return;
    getSalary(selId)
      .then((r) => {
        setSalData(r.data);
        const e = r.data.employee;
        setOtH(e.ot_hours || 0);
        setBonus(e.bonus || 0);
        setAdv(e.advance || 0);
        setDed(e.deductions || 0);
        setEncash(e.leave_encash || 0);
        setUnpaidD(e.unpaid_days || 0);
      })
      .catch(console.error);
  }, [selId]);

  if (loading) return <Spinner text="Loading salary data…" />;
  if (!salData) return <Spinner text="Loading…" />;

  const emp = salData.employee;
  const daily = Math.round(emp.basic / 30);
  const hourly = +(emp.basic / 22 / 8).toFixed(2);

  const liveBd = {
    ot: Math.round(hourly * 1.5 * otH),
    bonus,
    leave_encashment: Math.round(daily * encash),
    unpaid_deduction: Math.round(daily * unpaidD),
    advance: adv,
    other_deductions: ded,
    daily_rate: daily,
    basic: emp.basic,
    allowances: emp.allowances,
  };
  liveBd.gross =
    emp.basic +
    emp.allowances +
    liveBd.ot +
    liveBd.bonus +
    liveBd.leave_encashment;
  liveBd.total_deductions = adv + ded + liveBd.unpaid_deduction;
  liveBd.net = liveBd.gross - liveBd.total_deductions;

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateSalary(selId, {
        ot_hours: otH,
        bonus,
        advance: adv,
        deductions: ded,
        leave_encash: encash,
        unpaid_days: unpaidD,
      });
      setSalData(res.data);
      toast(`Salary saved for ${emp.name}`, "success");
    } catch {
      toast("Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

  const annualLeft = Math.max((emp.leave_annual || 0) - encash, 0);
  const medLeft = emp.leave_medical || 0;

  const impacts = [
    unpaidD > 0 && {
      color: "var(--err)",
      label: `Unpaid leave: ${unpaidD}d × AED ${daily}/day = −${fmtAED(liveBd.unpaid_deduction)}`,
    },
    encash > 0 && {
      color: "var(--ok)",
      label: `Encashment: ${encash}d × AED ${daily}/day = +${fmtAED(liveBd.leave_encashment)}`,
    },
    otH > 0 && {
      color: "var(--info)",
      label: `Overtime: ${otH}h × 1.5× = +${fmtAED(liveBd.ot)}`,
    },
  ].filter(Boolean);

  return (
    <>
      <div className="page-header">
        <h2>Salary Details</h2>
        <p>Leave-integrated salary calculation with live payslip preview</p>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <select
          className="search"
          value={selId || ""}
          onChange={(e) => setSelId(+e.target.value)}
        >
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.emp_id})
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(+e.target.value)}
          style={{ maxWidth: 145 }}
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(+e.target.value)}
          style={{ maxWidth: 96 }}
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <button
          className="btn btn-primary btn-sm"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setShowPS(true)}
        >
          📄 View Payslip
        </button>
      </div>

      {/* Impact banner */}
      <div className="impact-banner">
        <span className="impact-tag">Leave impact</span>
        {impacts.length === 0 ? (
          <span style={{ fontSize: ".79rem" }}>
            No leave adjustments this period
          </span>
        ) : (
          impacts.map((imp, i) => (
            <div key={i} className="impact-item">
              <div className="impact-dot" style={{ background: imp.color }} />
              <span style={{ color: imp.color }}>{imp.label}</span>
            </div>
          ))
        )}
      </div>

      <div className="two-col">
        {/* ── LEFT: Inputs ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Earnings</span>
            </div>
            <div className="form-row">
              <label>Basic Salary (AED)</label>
              <input type="number" value={emp.basic} readOnly />
            </div>
            <div className="form-row">
              <label>Allowances (AED)</label>
              <input type="number" value={emp.allowances} readOnly />
            </div>
            <div className="form-row">
              <label>Overtime Hours</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={otH}
                onChange={(e) => setOtH(+e.target.value || 0)}
              />
              {otH > 0 && (
                <div className="field-hint hint-g">
                  {otH}h × AED {hourly}/hr × 1.5 = +{fmtAED(liveBd.ot)}
                </div>
              )}
            </div>
            <div className="form-row">
              <label>Bonus / Incentive (AED)</label>
              <input
                type="number"
                min={0}
                step={50}
                value={bonus}
                onChange={(e) => setBonus(+e.target.value || 0)}
              />
            </div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Leave Encashment (days)</label>
              <input
                type="number"
                min={0}
                max={emp.leave_annual || 0}
                step={1}
                value={encash}
                onChange={(e) =>
                  setEncash(
                    Math.min(+e.target.value || 0, emp.leave_annual || 0),
                  )
                }
              />
              {encash > 0 ? (
                <div className="field-hint hint-g">
                  +{fmtAED(liveBd.leave_encashment)} ({encash}d × AED {daily}
                  /day)
                </div>
              ) : (
                <div className="field-hint">
                  {emp.leave_annual || 0} annual days available to encash
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Deductions</span>
            </div>
            <div className="form-row">
              <label>Advance / Loan Recovery (AED)</label>
              <input
                type="number"
                min={0}
                step={50}
                value={adv}
                onChange={(e) => setAdv(+e.target.value || 0)}
              />
            </div>
            <div className="form-row">
              <label>Other Deductions (AED)</label>
              <input
                type="number"
                min={0}
                step={50}
                value={ded}
                onChange={(e) => setDed(+e.target.value || 0)}
              />
            </div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label>Unpaid Leave Days (this month)</label>
              <input
                type="number"
                min={0}
                step={1}
                value={unpaidD}
                onChange={(e) => setUnpaidD(+e.target.value || 0)}
              />
              {unpaidD > 0 ? (
                <div className="field-hint hint-r">
                  −{fmtAED(liveBd.unpaid_deduction)} ({unpaidD}d × AED {daily}
                  /day)
                </div>
              ) : (
                <div className="field-hint">
                  {emp.unpaid_days || 0} unpaid day(s) on record
                </div>
              )}
            </div>
          </div>

          {/* Leave Balance Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Leave Balances</span>
              <span className="badge b-org">{emp.name.split(" ")[0]}</span>
            </div>
            <div className="lm-grid">
              <div className={`lm-card ${annualLeft <= 3 ? "red" : "green"}`}>
                <div className="lm-lbl">Annual Left</div>
                <div className="lm-val">{annualLeft}</div>
                <div className="lm-sub">of {TOTAL_ANNUAL} days</div>
              </div>
              <div className={`lm-card ${medLeft <= 2 ? "red" : "green"}`}>
                <div className="lm-lbl">Medical Left</div>
                <div className="lm-val">{medLeft}</div>
                <div className="lm-sub">of {TOTAL_MEDICAL} days</div>
              </div>
              <div className={`lm-card ${unpaidD > 0 ? "red" : "green"}`}>
                <div className="lm-lbl">Unpaid Days</div>
                <div className="lm-val">{unpaidD}</div>
                <div className="lm-sub">this month</div>
              </div>
            </div>
            {[
              {
                label: "Annual leave used",
                used: TOTAL_ANNUAL - annualLeft,
                total: TOTAL_ANNUAL,
                color: "var(--org)",
              },
              {
                label: "Medical leave used",
                used: TOTAL_MEDICAL - medLeft,
                total: TOTAL_MEDICAL,
                color: "var(--ok)",
              },
            ].map((bar) => (
              <div key={bar.label} style={{ marginBottom: ".8rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: ".74rem",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{bar.label}</span>
                  <span style={{ color: "var(--txt3)" }}>
                    {bar.used}/{bar.total} days
                  </span>
                </div>
                <div className="leave-bar">
                  <div
                    className="leave-fill"
                    style={{
                      width: `${Math.min((bar.used / bar.total) * 100, 100)}%`,
                      background: bar.color,
                    }}
                  />
                </div>
              </div>
            ))}
            {(emp.unpaid_log || []).length > 0 && (
              <div
                style={{
                  marginTop: ".85rem",
                  paddingTop: ".85rem",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span className="sec-lbl">Unpaid Leave Log</span>
                {emp.unpaid_log.map((l, i) => (
                  <div key={i} className="log-row">
                    <div>
                      <div style={{ fontSize: ".8rem", fontWeight: 600 }}>
                        {l.reason}
                      </div>
                      <div style={{ fontSize: ".71rem", color: "var(--txt3)" }}>
                        {l.date}
                      </div>
                    </div>
                    <span className="badge b-red">{l.days}d</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Breakdown ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Full Salary Breakdown</span>
            </div>

            <span className="sec-lbl">Earnings</span>
            <div className="bdown-grid" style={{ marginBottom: ".85rem" }}>
              <div className="bdown-item">
                <div className="bdown-lbl">Basic</div>
                <div className="bdown-val">{fmtAED(emp.basic)}</div>
              </div>
              <div className="bdown-item">
                <div className="bdown-lbl">Allowances</div>
                <div className="bdown-val">{fmtAED(emp.allowances)}</div>
              </div>
              <div className="bdown-item">
                <div className="bdown-lbl">Overtime</div>
                <div className="bdown-val">{fmtAED(liveBd.ot)}</div>
              </div>
              <div className="bdown-item">
                <div className="bdown-lbl">Bonus</div>
                <div className="bdown-val">{fmtAED(liveBd.bonus)}</div>
              </div>
              {liveBd.leave_encashment > 0 && (
                <div className="bdown-item blue" style={{ gridColumn: "1/-1" }}>
                  <div className="bdown-lbl">Leave Encashment ({encash}d)</div>
                  <div className="bdown-val">
                    +{fmtAED(liveBd.leave_encashment)}
                  </div>
                </div>
              )}
              <div className="bdown-item green" style={{ gridColumn: "1/-1" }}>
                <div className="bdown-lbl">Gross Salary</div>
                <div className="bdown-val">{fmtAED(liveBd.gross)}</div>
              </div>
            </div>

            <span className="sec-lbl">Deductions</span>
            <div className="bdown-grid" style={{ marginBottom: ".85rem" }}>
              <div className="bdown-item">
                <div className="bdown-lbl">Advance / Loan</div>
                <div className="bdown-val">{fmtAED(adv)}</div>
              </div>
              <div className="bdown-item">
                <div className="bdown-lbl">Other</div>
                <div className="bdown-val">{fmtAED(ded)}</div>
              </div>
              {liveBd.unpaid_deduction > 0 && (
                <div className="bdown-item red" style={{ gridColumn: "1/-1" }}>
                  <div className="bdown-lbl">
                    Unpaid Leave ({unpaidD}d × AED {daily}/day)
                  </div>
                  <div className="bdown-val">
                    −{fmtAED(liveBd.unpaid_deduction)}
                  </div>
                </div>
              )}
              <div className="bdown-item red" style={{ gridColumn: "1/-1" }}>
                <div className="bdown-lbl">Total Deductions</div>
                <div className="bdown-val">
                  −{fmtAED(liveBd.total_deductions)}
                </div>
              </div>
            </div>

            <div className="net-box">
              <div>
                <div className="net-label">Net Salary Payable</div>
                <div
                  style={{
                    fontSize: ".72rem",
                    color: "rgba(255,255,255,.7)",
                    marginTop: 2,
                  }}
                >
                  {MONTHS[month - 1]} {year}
                </div>
              </div>
              <div className="net-val">{fmtAED(liveBd.net)}</div>
            </div>

            <button
              className="btn btn-outline"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: ".85rem",
              }}
              onClick={() => setShowPS(true)}
            >
              📄 Preview Full Payslip
            </button>
          </div>
        </div>
      </div>

      {showPS && (
        <PayslipModal
          emp={{
            ...emp,
            ot_hours: otH,
            bonus,
            advance: adv,
            deductions: ded,
            leave_encash: encash,
            unpaid_days: unpaidD,
          }}
          bd={liveBd}
          month={month}
          year={year}
          onClose={() => setShowPS(false)}
        />
      )}
    </>
  );
}
