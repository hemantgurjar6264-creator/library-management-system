import React, { useEffect, useState } from "react";
import { AlertCircle, RotateCcw, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function OverdueBooks() {
  const [overdueTransactions, setOverdueTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchOverdue = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/transactions/overdue`);
      setOverdueTransactions(data);
    } catch (err) {
      toast.error("Could not load overdue books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const handleReturn = async (transaction) => {
    if (!window.confirm(`Mark "${transaction.book?.title}" as returned?`)) return;
    try {
      const { data } = await api.put(`/transactions/${transaction._id}/return`);
      toast.success(`Returned. Fine collected: ₹${data.fine}`);
      fetchOverdue();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not process return");
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const filteredTransactions = overdueTransactions.filter(
    (t) =>
      t.book?.title.toLowerCase().includes(search.toLowerCase()) ||
      t.member?.name.toLowerCase().includes(search.toLowerCase()) ||
      t.member?.membershipId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold text-brass-600 uppercase tracking-widest mb-1">
          Circulation
        </p>
        <h1 className="font-display text-3xl font-semibold text-rust flex items-center gap-2">
          <AlertCircle size={28} /> Overdue Books
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-rust/30 overflow-hidden mb-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="font-display font-semibold text-lg">Action Required</h2>
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by book, member, or ID…"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-ink-100 bg-ink-50 focus:bg-white focus:border-rust/40 focus:ring-2 focus:ring-rust/20 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-ink-400 py-8 text-center">Loading overdue records…</p>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-clover/10 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3F6C51" strokeWidth="2"><path d="M20 6L9 17l-5-5"></path></svg>
            </div>
            <p className="text-black text-sm font-medium">All clear! No overdue books.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-rust/5 text-left text-rust/80 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold rounded-tl-lg">Book</th>
                  <th className="px-5 py-3 font-semibold">Copy</th>
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-5 py-3 font-semibold">Due Date</th>
                  <th className="px-5 py-3 font-semibold">Pending Fine</th>
                  <th className="px-5 py-3 font-semibold text-right rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filteredTransactions.map((t) => (
                  <tr key={t._id} className="hover:bg-rust/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-8 rounded-sm shrink-0"
                          style={{ backgroundColor: t.book?.coverColor || "#B08D3E" }}
                        />
                        <span className="font-medium text-ink-800">{t.book?.title || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-400 font-mono text-xs">
                      {t.copy?.copyNumber ? `#${t.copy.copyNumber}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-ink-500">
                      {t.member?.name} <span className="text-xs text-ink-300">({t.member?.membershipId})</span>
                    </td>
                    <td className="px-5 py-3.5 text-rust font-mono font-medium text-xs">
                      {formatDate(t.dueDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-rust font-mono font-semibold bg-rust/10 px-2 py-1 rounded">
                        ₹{t.fine}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleReturn(t)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-rust hover:bg-rust/90 rounded-md px-4 py-2 transition-colors shadow-sm"
                      >
                        <RotateCcw size={13} /> Collect & Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
