import React, { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, BookMarked, Undo2, AlertTriangle, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import StatCard from "../components/StatCard";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/summary?month=${month}&year=${year}`);
      setSummary(data);
    } catch (err) {
      toast.error("Could not load the report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const downloadReport = async (type) => {
    setExporting(type);
    try {
      const { data } = await api.get(`/reports/export/${type}?month=${month}&year=${year}`, {
        responseType: "blob",
      });
      const blob = new Blob([data], {
        type: type === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `library-report-${MONTHS[month - 1]}-${year}.${type === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${type === "excel" ? "Excel" : "PDF"} report downloaded`);
    } catch (err) {
      toast.error("Could not generate the report");
    } finally {
      setExporting(null);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-brass-600 uppercase tracking-widest mb-1">Reports</p>
          <h1 className="font-display text-3xl font-semibold text-ink-800">Monthly Report</h1>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-2.5 rounded-lg border border-ink-100 bg-white text-sm text-ink-600 outline-none focus:border-brass-400"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2.5 rounded-lg border border-ink-100 bg-white text-sm text-ink-600 outline-none focus:border-brass-400"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !summary ? (
        <p className="text-sm text-ink-400">Preparing the report…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Books Issued" value={summary.booksIssuedCount} icon={BookMarked} accent="#B08D3E" />
            <StatCard label="Books Returned" value={summary.booksReturnedCount} icon={Undo2} accent="#3F6C51" />
            <StatCard label="Overdue Now" value={summary.overdueCount} icon={AlertTriangle} accent="#A13D3D" />
            <StatCard
              label="Fines Collected"
              value={`₹${summary.finesCollectedThisMonth}`}
              icon={Wallet}
              accent="#5D71A5"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-card border border-ink-100/60 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg text-ink-800">
                  Overdue Loans ({summary.label})
                </h2>
                <span className="text-xs text-rust font-mono">
                  Est. pending fines: ₹{summary.estimatedPendingFines}
                </span>
              </div>
              {summary.overduePreview.length === 0 ? (
                <p className="text-sm text-ink-400 py-6 text-center">No overdue loans right now. Well kept shelves.</p>
              ) : (
                <div className="divide-y divide-ink-50">
                  {summary.overduePreview.map((o, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-ink-800 truncate">{o.book}</p>
                        <p className="text-xs text-ink-400">
                          {o.member} · due {formatDate(o.dueDate)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-rust font-semibold">{o.daysLate}d late</p>
                        <p className="text-xs text-ink-400 font-mono">₹{o.estimatedFine}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {summary.overdueCount > summary.overduePreview.length && (
                <p className="text-xs text-ink-400 mt-3">
                  + {summary.overdueCount - summary.overduePreview.length} more in the full export
                </p>
              )}
            </div>

            <div className="bg-brass-500 rounded-xl shadow-card p-6 text-white">
              <h2 className="font-display font-semibold text-lg mb-4">Catalog Snapshot</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Titles</span>
                  <span className="font-mono font-medium">{summary.totals.totalBooks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Copies (available/total)</span>
                  <span className="font-mono font-medium">
                    {summary.totals.availableCopies}/{summary.totals.totalCopies}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Members (active/total)</span>
                  <span className="font-mono font-medium">
                    {summary.totals.activeMembers}/{summary.totals.totalMembers}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card border border-ink-100/60 p-6">
            <h2 className="font-display font-semibold text-lg text-ink-800 mb-1">Download Full Report</h2>
            <p className="text-sm text-ink-400 mb-4">
              Includes books issued, books returned, and the complete overdue list for {summary.label}.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => downloadReport("excel")}
                disabled={exporting !== null}
                className="flex items-center gap-2 bg-clover/10 text-clover hover:bg-clover/20 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                <FileSpreadsheet size={16} /> {exporting === "excel" ? "Preparing…" : "Download Excel"}
              </button>
              <button
                onClick={() => downloadReport("pdf")}
                disabled={exporting !== null}
                className="flex items-center gap-2 bg-rust/10 text-rust hover:bg-rust/20 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                <FileText size={16} /> {exporting === "pdf" ? "Preparing…" : "Download PDF"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
