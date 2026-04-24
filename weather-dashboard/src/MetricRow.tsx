// src/components/MetricRow.tsx
import React from "react";

export default function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-row">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}
