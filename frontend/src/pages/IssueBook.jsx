import React, { useEffect, useState } from "react";
import { Plus, Search, ScanBarcode, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import ScannerModal from "../components/ScannerModal";

export default function IssueBook() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [bookSearch, setBookSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loanDays, setLoanDays] = useState(14);
  const [saving, setSaving] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [booksRes, membersRes, settingsRes] = await Promise.all([
        api.get("/books"),
        api.get("/members"),
        api.get("/settings"),
      ]);
      setBooks(booksRes.data.filter((b) => b.availableCopies > 0));
      setMembers(membersRes.data.filter((m) => m.status === "active"));
      setSettings(settingsRes.data);
      if (settingsRes.data?.loanDuration) {
        setLoanDays(settingsRes.data.loanDuration);
      }
    } catch (err) {
      toast.error("Could not load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleScan = (decodedText) => {
    if (scannerTarget === "book") setBookSearch(decodedText);
    else if (scannerTarget === "member") setMemberSearch(decodedText);
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
      setSelectedBook(null);
      setSelectedMember(null);
      setBookSearch("");
      setMemberSearch("");
      fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not issue book");
    } finally {
      setSaving(false);
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.isbn.toLowerCase().includes(bookSearch.toLowerCase())
  );
  
  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.membershipId.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold text-brass-600 uppercase tracking-widest mb-1">
          Circulation
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink-800">Issue Book</h1>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-ink-100/60 p-6 sm:p-8">
        {loading ? (
          <p className="text-sm text-ink-400">Loading library data…</p>
        ) : (
          <form onSubmit={handleIssue} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Book selection */}
              <div className="flex flex-col h-[400px]">
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                  <span>1. Select Book</span>
                  {selectedBook && (
                    <span className="text-clover font-medium lowercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-clover"></span> Selected
                    </span>
                  )}
                </label>
                <div className="relative mb-3 flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                    <input
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      placeholder="Search available books…"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-200 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm shadow-sm"
                    />
                  </div>
                  <button type="button" onClick={() => { setScannerTarget("book"); setScannerOpen(true); }} className="bg-ink-50 hover:bg-ink-100 text-ink-600 px-3 rounded-lg border border-ink-200 transition-colors shadow-sm" title="Scan Barcode">
                    <ScanBarcode size={18} />
                  </button>
                </div>
                <div className="flex-1 border border-ink-100 rounded-lg overflow-y-auto divide-y divide-ink-50 shadow-inner bg-ink-50/30">
                  {filteredBooks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-ink-400">No available books found</div>
                  )}
                  {filteredBooks.map((b) => (
                    <button
                      type="button"
                      key={b._id}
                      onClick={() => setSelectedBook(b)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        selectedBook?._id === b._id ? "bg-brass-50 border-l-4 border-brass-500" : "hover:bg-white"
                      }`}
                    >
                      <p className="font-semibold text-ink-800 truncate">{b.title}</p>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {b.author} · <span className="font-medium text-clover">{b.availableCopies} available</span>
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Member selection */}
              <div className="flex flex-col h-[400px]">
                <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                  <span>2. Select Member</span>
                  {selectedMember && (
                    <span className="text-clover font-medium lowercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-clover"></span> Selected
                    </span>
                  )}
                </label>
                <div className="relative mb-3 flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                    <input
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Search active members…"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-200 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm shadow-sm"
                    />
                  </div>
                  <button type="button" onClick={() => { setScannerTarget("member"); setScannerOpen(true); }} className="bg-ink-50 hover:bg-ink-100 text-ink-600 px-3 rounded-lg border border-ink-200 transition-colors shadow-sm" title="Scan Barcode">
                    <ScanBarcode size={18} />
                  </button>
                </div>
                <div className="flex-1 border border-ink-100 rounded-lg overflow-y-auto divide-y divide-ink-50 shadow-inner bg-ink-50/30">
                  {filteredMembers.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-ink-400">No active members found</div>
                  )}
                  {filteredMembers.map((m) => (
                    <button
                      type="button"
                      key={m._id}
                      onClick={() => setSelectedMember(m)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        selectedMember?._id === m._id ? "bg-brass-50 border-l-4 border-brass-500" : "hover:bg-white"
                      }`}
                    >
                      <p className="font-semibold text-ink-800 truncate">{m.name}</p>
                      <p className="text-xs text-ink-500 mt-0.5 font-mono">{m.membershipId}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-ink-100 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-2">
                    3. Loan Period (days)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={loanDays}
                      onChange={(e) => setLoanDays(e.target.value)}
                      className="w-24 px-3 py-2.5 rounded-lg border border-ink-200 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm font-medium shadow-sm"
                    />
                    <span className="text-sm text-ink-400">Default is {settings?.loanDuration || 14} days</span>
                  </div>
                </div>

                <div className="flex-1 max-w-xs">
                  <button
                    type="submit"
                    disabled={saving || !selectedBook || !selectedMember}
                    className="w-full flex items-center justify-center gap-2 bg-brass-500 hover:bg-brass-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                  >
                    <ArrowUpRight size={18} />
                    {saving ? "Processing…" : "Issue Book Now"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}
