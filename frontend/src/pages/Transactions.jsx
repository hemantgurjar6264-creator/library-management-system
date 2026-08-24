import React, { useEffect, useState } from "react";
import { Plus, ArrowLeftRight, RotateCcw, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Modal from "../components/Modal";

const STATUS_TABS = ["All", "issued", "overdue", "returned"];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [bookSearch, setBookSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loanDays, setLoanDays] = useState(14);
  const [saving, setSaving] = useState(false);

  const fetchTransactions = async (status = "All") => {
    setLoading(true);
    try {
      const { data } = await api.get(`/transactions${status !== "All" ? `?status=${status}` : ""}`);
      setTransactions(data);
    } catch (err) {
      toast.error("Could not load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(statusFilter);
  }, [statusFilter]);

  const openIssueModal = async () => {
    setSelectedBook(null);
    setSelectedMember(null);
    setBookSearch("");
    setMemberSearch("");
    setLoanDays(14);
    setIssueModalOpen(true);
    try {
      const [booksRes, membersRes] = await Promise.all([
        api.get("/books"),
        api.get("/members"),
      ]);
      setBooks(booksRes.data.filter((b) => b.availableCopies > 0));
      setMembers(membersRes.data.filter((m) => m.status === "active"));
    } catch (err) {
      toast.error("Could not load books/members");
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedBook || !selectedMember) {
      toast.error("Select a book and a member");
      return;
    }
    setSaving(true);
    try {
      await api.post("/transactions/issue", {
        bookId: selectedBook._id,
        memberId: selectedMember._id,
        loanDays: Number(loanDays),
      });
      toast.success(`"${selectedBook.title}" issued to ${selectedMember.name}`);
      setIssueModalOpen(false);
      fetchTransactions(statusFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not issue book");
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async (transaction) => {
    if (!window.confirm(`Mark "${transaction.book?.title}" as returned?`)) return;
    try {
      const { data } = await api.put(`/transactions/${transaction._id}/return`);
      if (data.fine > 0) {
        toast.success(`Returned. Fine collected: ₹${data.fine}`);
      } else {
        toast.success("Returned on time. No fine.");
      }
      fetchTransactions(statusFilter);
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
      fetchTransactions(statusFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not process return");
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase())
  );
  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.membershipId.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-brass-600 uppercase tracking-widest mb-1">
            Circulation Desk
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink-800">Issue & Returns</h1>
        </div>
        <button
          onClick={openIssueModal}
          className="flex items-center gap-2 bg-brass-500 hover:bg-brass-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0"
        >
          <Plus size={16} /> Issue Book
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
              statusFilter === s
                ? "bg-brass-500 text-white"
                : "bg-white text-black border border-ink-100 hover:bg-ink-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading circulation records…</p>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-ink-200">
          <ArrowLeftRight className="mx-auto text-ink-200 mb-3" size={36} />
          <p className="text-black text-sm">No records here yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card border border-ink-100/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50/60 text-left text-ink-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-semibold">Book</th>
                <th className="px-5 py-3 font-semibold">Copy</th>
                <th className="px-5 py-3 font-semibold">Member</th>
                <th className="px-5 py-3 font-semibold">Issued</th>
                <th className="px-5 py-3 font-semibold">Due</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {transactions.map((t) => (
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
                        t.status === "returned"
                          ? "bg-clover/10 text-clover"
                          : t.status === "overdue"
                          ? "bg-rust/10 text-rust"
                          : "bg-brass-100 text-brass-700"
                      }`}
                    >
                      {t.status}
                    </span>
                    {t.fine > 0 && <span className="ml-2 text-xs text-rust font-mono">₹{t.fine}</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {t.status !== "returned" ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleReturn(t)}
                          className="flex items-center gap-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 rounded-md px-3 py-1.5 transition-colors"
                        >
                          <RotateCcw size={13} /> Return
                        </button>
                        <select
                          value=""
                          onChange={(e) => e.target.value && handleReturnWithCondition(t, e.target.value)}
                          className="text-xs border border-ink-100 rounded-md px-1.5 py-1.5 outline-none text-ink-400 bg-white"
                          title="Return with a copy condition"
                        >
                          <option value="">Return as…</option>
                          <option value="lost">Lost</option>
                          <option value="damaged">Damaged</option>
                        </select>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-300">{formatDate(t.returnDate)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={issueModalOpen} onClose={() => setIssueModalOpen(false)} title="Issue a Book" maxWidth="max-w-2xl">
        <form onSubmit={handleIssue} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            {/* Book selection */}
            <div>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
                Select Book
              </label>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Search available books…"
                  className="w-full pl-8 pr-2 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
                />
              </div>
              <div className="border border-ink-100 rounded-lg max-h-48 overflow-y-auto divide-y divide-ink-50">
                {filteredBooks.length === 0 && (
                  <p className="text-xs text-ink-400 p-3">No available books found</p>
                )}
                {filteredBooks.map((b) => (
                  <button
                    type="button"
                    key={b._id}
                    onClick={() => setSelectedBook(b)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-parchment-100 transition-colors ${
                      selectedBook?._id === b._id ? "bg-brass-50 border-l-2 border-brass-500" : ""
                    }`}
                  >
                    <p className="font-medium text-ink-800 truncate">{b.title}</p>
                    <p className="text-xs text-ink-400">
                      {b.author} · {b.availableCopies} available
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Member selection */}
            <div>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
                Select Member
              </label>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search active members…"
                  className="w-full pl-8 pr-2 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
                />
              </div>
              <div className="border border-ink-100 rounded-lg max-h-48 overflow-y-auto divide-y divide-ink-50">
                {filteredMembers.length === 0 && (
                  <p className="text-xs text-ink-400 p-3">No active members found</p>
                )}
                {filteredMembers.map((m) => (
                  <button
                    type="button"
                    key={m._id}
                    onClick={() => setSelectedMember(m)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-parchment-100 transition-colors ${
                      selectedMember?._id === m._id ? "bg-brass-50 border-l-2 border-brass-500" : ""
                    }`}
                  >
                    <p className="font-medium text-ink-800 truncate">{m.name}</p>
                    <p className="text-xs text-ink-400">{m.membershipId}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
              Loan Period (days)
            </label>
            <input
              type="number"
              min="1"
              value={loanDays}
              onChange={(e) => setLoanDays(e.target.value)}
              className="w-32 px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !selectedBook || !selectedMember}
            className="w-full bg-brass-500 hover:bg-brass-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-40"
          >
            {saving ? "Issuing…" : "Confirm Issue"}
          </button>
        </form>
      </Modal>
    </div>
  );
}