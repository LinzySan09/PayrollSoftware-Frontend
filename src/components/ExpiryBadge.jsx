import React from "react";
import { daysUntil } from "../utils/helpers";

export default function ExpiryBadge({ dateStr }) {
  if (!dateStr) return <span className="badge b-gray">—</span>;
  const d = daysUntil(dateStr);
  if (d < 0)  return <span className="badge b-red">Expired</span>;
  if (d < 30) return <span className="badge b-red">{d}d left</span>;
  if (d < 90) return <span className="badge b-amber">{d}d left</span>;
  return <span className="badge b-green">Valid</span>;
}
