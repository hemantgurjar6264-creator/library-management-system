import React from "react";

export default function StatCard({ label, value, icon: Icon, accent = "#B08D3E", suffix = "" }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-ink-100/60 p-5 flex items-center gap-4 hover:shadow-cardHover transition-shadow">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}1A` }}
      >
        <Icon size={22} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-display font-semibold text-black leading-tight">
          {value}
          <span className="text-sm font-sans text-black ml-1">{suffix}</span>
        </p>
        <p className="text-xs text-black uppercase tracking-wide font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}