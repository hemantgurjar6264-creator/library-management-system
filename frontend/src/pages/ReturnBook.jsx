import React, { useEffect, useState } from "react";
import { ArrowDownLeft, RotateCcw, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function ReturnBook() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fetch only open transactions
      const { data } = await api.get(`/transactions`);
      const openTransactions = data.filter(t => t.status === "issued" || t.status === "overdue");
      setTransactions(openTransactions);
    } catch (err) {
      toast.error("Could not load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleReturn = async (transaction) => {
    if (!window.confirm(`Mark "${transaction.book?.title}" as returned?`)) return;
    try {
      const { data } = await api.put(`/transactions/${transaction._id}/return`);
      if (data.fine > 0) {
        toast.success(`Returned. Fine collected: ₹${data.fine}`);
      } else {
        toast.success("Returned on time. No fine.");
      }
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not process return");
    }
  };

  const handleReturnWithCondition = async (transaction, copyCondition) => {
    const label = copyCondition === "lost" ? "lost" : "damaged";
    if (!window.confirm(`Mark "${transaction.book?.title}" as returned and its copy as ${label}?`)) return;
    try {
      const { data } = await api.put(`/transactions/${transaction._id}/return`, { copyCondition });
      toast.success(
        data.fine > 0 ? `Returned as ${label}. Fine collected: ₹${data.fine}` : `Returned as ${label}. No fine.`
      );
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not process return");
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const filteredTransactions = transactions.filter(
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
        <h1 className="font-display text-3xl font-semibold text-ink-800">Return Book</h1>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-ink-100/60 overflow-hidden mb-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="font-display font-semibold text-lg">Active Loans</h2>
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by book, member, or ID…"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-ink-100 bg-ink-50 focus:bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-ink-400 py-8 text-center">Loading active loans…</p>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <ArrowDownLeft className="mx-auto text-ink-200 mb-3" size={36} />
            <p className="text-black text-sm">No active loans match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-ink-50/60 text-left text-ink-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold rounded-tl-lg">Book</th>
                  <th className="px-5 py-3 font-semibold">Copy</th>
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-5 py-3 font-semibold">Issued</th>
                  <th className="px-5 py-3 font-semibold">Due</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filteredTransactions.map((t) => (
                  <tr key={t._id} className="hover:bg-parchment-100/40 transition-colors">
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
                    <td className="px-5 py-3.5 text-ink-500 font-mono text-xs">{formatDate(t.issueDate)}</td>
                    <td className="px-5 py-3.5 text-ink-500 font-mono text-xs">{formatDate(t.dueDate)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full ${
                          t.status === "overdue"
                            ? "bg-rust/10 text-rust"
                            : "bg-brass-100 text-brass-700"
                        }`}
                      >
                        {t.status}
                      </span>
                      {t.fine > 0 && <span className="ml-2 text-xs text-rust font-mono">₹{t.fine}</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReturn(t)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-clover hover:bg-clover/90 rounded-md px-3 py-2 transition-colors shadow-sm"
                        >
                          <RotateCcw size={13} /> Return
                        </button>
                        <select
                          value=""
                          onChange={(e) => e.target.value && handleReturnWithCondition(t, e.target.value)}
                          className="text-xs border border-ink-200 rounded-md px-2 py-2 outline-none text-ink-500 bg-white hover:bg-ink-50 transition-colors"
                          title="Return with a copy condition"
                        >
                          <option value="">Exceptions…</option>
                          <option value="lost">Mark Lost</option>
                          <option value="damaged">Mark Damaged</option>
                        </select>
                      </div>
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
