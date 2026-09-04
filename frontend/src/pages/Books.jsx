import React, { useEffect, useState, useRef } from "react";
import { Plus, Search, Pencil, Trash2, BookOpen, MapPin, Layers, X as XIcon, Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Modal from "../components/Modal";

const SPINE_COLORS = ["#B08D3E", "#3F6C51", "#A13D3D", "#5D71A5", "#8E7031", "#233461"];

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  category: "General",
  publisher: "",
  publishedYear: "",
  totalCopies: 1,
  rackLocation: "",
};

const COPY_STATUS_STYLES = {
  available: "bg-clover/10 text-clover",
  issued: "bg-brass-100 text-brass-700",
  lost: "bg-rust/10 text-rust",
  damaged: "bg-rust/10 text-rust",
};

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Filters
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [authorFilter, setAuthorFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");

  // Copies modal
  const [copiesModalOpen, setCopiesModalOpen] = useState(false);
  const [copiesBook, setCopiesBook] = useState(null);
  const [copies, setCopies] = useState([]);
  const [copiesLoading, setCopiesLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Uploading and importing books...");
    try {
      const { data } = await api.post("/books/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(data.message || "Books imported successfully", { id: toastId });
      fetchBooks();
      fetchMeta();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to import books", { id: toastId });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchMeta = async () => {
    try {
      const [catRes, authRes] = await Promise.all([
        api.get("/books/meta/categories"),
        api.get("/books/meta/authors"),
      ]);
      setCategories(catRes.data);
      setAuthors(authRes.data);
    } catch (err) {
      // non-fatal
    }
  };

  const fetchBooks = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      const q = params.search ?? search;
      const cat = params.category ?? categoryFilter;
      const auth = params.author ?? authorFilter;
      const avail = params.availability ?? availabilityFilter;
      if (q) query.set("search", q);
      if (cat && cat !== "All") query.set("category", cat);
      if (auth && auth !== "All") query.set("author", auth);
      if (avail && avail !== "All") query.set("availability", avail);

      const { data } = await api.get(`/books${query.toString() ? `?${query.toString()}` : ""}`);
      setBooks(data);
    } catch (err) {
      toast.error("Could not load the catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchBooks({ search }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    fetchBooks({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, authorFilter, availabilityFilter]);

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setAuthorFilter("All");
    setAvailabilityFilter("All");
  };

  const activeFilterCount = [categoryFilter, authorFilter, availabilityFilter].filter((f) => f !== "All").length;

  const openAddModal = () => {
    setEditingBook(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher || "",
      publishedYear: book.publishedYear || "",
      totalCopies: book.totalCopies,
      rackLocation: book.rackLocation || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBook) {
        await api.put(`/books/${editingBook._id}`, {
          ...form,
          totalCopies: Number(form.totalCopies),
          publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
        });
        toast.success("Book updated");
      } else {
        const coverColor = SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)];
        await api.post("/books", {
          ...form,
          totalCopies: Number(form.totalCopies),
          publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
          coverColor,
        });
        toast.success("Book added to catalog");
      }
      setModalOpen(false);
      fetchMeta();
      fetchBooks({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (book) => {
    if (!window.confirm(`Archive "${book.title}"?`)) return;
    try {
      await api.delete(`/books/${book._id}`);
      toast.success("Book archived");
      fetchBooks({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not archive book");
    }
  };

  const openCopiesModal = async (book) => {
    setCopiesBook(book);
    setCopiesModalOpen(true);
    setCopiesLoading(true);
    try {
      const { data } = await api.get(`/books/${book._id}/copies`);
      setCopies(data);
    } catch (err) {
      toast.error("Could not load copy details");
    } finally {
      setCopiesLoading(false);
    }
  };

  const handleCopyStatusChange = async (copy, status) => {
    try {
      await api.put(`/books/${copiesBook._id}/copies/${copy._id}`, { status });
      toast.success(`Copy #${copy.copyNumber} marked ${status}`);
      const { data } = await api.get(`/books/${copiesBook._id}/copies`);
      setCopies(data);
      fetchBooks({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update copy");
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-brass-600 uppercase tracking-widest mb-1">Library Collection</p>
          <h1 className="font-display text-3xl font-semibold text-ink-800">Library Collection</h1>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            accept=".xlsx" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleBulkUpload} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-white hover:bg-parchment-100 text-ink-700 border border-ink-100 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0 shadow-sm"
          >
            <Upload size={16} /> Import Excel
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-brass-500 hover:bg-brass-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0"
          >
            <Plus size={16} /> Add Book
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative max-w-md flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or ISBN…"
            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm transition-shadow"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-ink-100 bg-white text-sm text-ink-600 outline-none focus:border-brass-400"
        >
          <option value="All">All Genres</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-ink-100 bg-white text-sm text-ink-600 outline-none focus:border-brass-400 max-w-[180px]"
        >
          <option value="All">All Authors</option>
          {authors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <div className="flex rounded-lg border border-ink-100 overflow-hidden">
          {[
            { key: "All", label: "All" },
            { key: "available", label: "Available" },
            { key: "unavailable", label: "All Issued" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setAvailabilityFilter(opt.key)}
              className={`px-3 py-2.5 text-xs font-semibold transition-colors ${
                availabilityFilter === opt.key
                  ? "bg-brass-500 text-white"
                  : "bg-white text-ink-500 hover:bg-ink-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-rust transition-colors"
          >
            <XIcon size={13} /> Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading catalog…</p>
      ) : books.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-ink-200">
          <BookOpen className="mx-auto text-ink-200 mb-3" size={36} />
          <p className="text-black text-sm">No books found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {books.map((book) => (
            <div
              key={book._id}
              className="card-catalog bg-white rounded-lg shadow-card border border-ink-100/60 p-5 pt-6 hover:shadow-cardHover transition-shadow flex flex-col"
              style={{ backgroundColor: `${book.coverColor}0D` }}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div
                  className="w-10 h-14 rounded-sm shrink-0 shadow-sm"
                  style={{ backgroundColor: book.coverColor }}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                    book.availableCopies > 0 ? "bg-clover/10 text-clover" : "bg-rust/10 text-rust"
                  }`}
                >
                  {book.availableCopies > 0 ? `${book.availableCopies} available` : "All issued"}
                </span>
              </div>

              <h3 className="font-display font-semibold text-ink-800 leading-snug mb-1 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-sm text-ink-500 mb-3">{book.author}</p>

              <div className="mt-auto space-y-1.5 text-xs text-ink-400 font-mono">
                <p>ISBN {book.isbn}</p>
                <div className="flex items-center justify-between font-sans">
                  <span className="px-2 py-0.5 rounded bg-ink-50 text-ink-500 font-medium">
                    {book.category}
                  </span>
                  {book.rackLocation && (
                    <span className="flex items-center gap-1 text-ink-400">
                      <MapPin size={11} /> {book.rackLocation}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => openCopiesModal(book)}
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 rounded-md py-2 mt-3 border border-ink-100 transition-colors"
              >
                <Layers size={13} /> {book.totalCopies} {book.totalCopies === 1 ? "copy" : "copies"} · view status
              </button>

              <div className="flex items-center gap-2 mt-2 pt-3 border-t border-ink-50">
                <button
                  onClick={() => openEditModal(book)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 rounded-md py-2 transition-colors"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => handleArchive(book)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-rust hover:bg-rust/5 rounded-md py-2 transition-colors"
                >
                  <Trash2 size={13} /> Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBook ? "Edit Book" : "Add New Book"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
                Title *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
                Author *
              </label>
              <input
                required
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
                ISBN *
              </label>
              <input
                required
                disabled={!!editingBook}
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm disabled:bg-ink-50 disabled:text-ink-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
                Genre / Category
              </label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
                Publisher
              </label>
              <input
                value={form.publisher}
                onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
                Published Year
              </label>
              <input
                type="number"
                value={form.publishedYear}
                onChange={(e) => setForm({ ...form, publishedYear: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
                Total Copies *
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.totalCopies}
                onChange={(e) => setForm({ ...form, totalCopies: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
              />
              {editingBook && (
                <p className="text-[11px] text-ink-400 mt-1">
                  Increasing adds new copies; decreasing removes available copies only.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
                Rack Location
              </label>
              <input
                placeholder="e.g. A-12"
                value={form.rackLocation}
                onChange={(e) => setForm({ ...form, rackLocation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brass-500 hover:bg-brass-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : editingBook ? "Save Changes" : "Add Book"}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={copiesModalOpen}
        onClose={() => setCopiesModalOpen(false)}
        title={copiesBook ? `Copies of "${copiesBook.title}"` : "Copies"}
        maxWidth="max-w-xl"
      >
        {copiesLoading ? (
          <p className="text-sm text-ink-400">Loading copy details…</p>
        ) : copies.length === 0 ? (
          <p className="text-sm text-ink-400">No copies recorded for this title.</p>
        ) : (
          <div className="space-y-2">
            {copies.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between gap-3 border border-ink-100 rounded-lg px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-800">Copy #{c.copyNumber}</p>
                  <p className="text-xs text-ink-400 font-mono">{c.barcode}</p>
                  {c.heldBy && (
                    <p className="text-xs text-ink-500 mt-1">
                      With {c.heldBy.member?.name} ({c.heldBy.member?.membershipId}) · due{" "}
                      {formatDate(c.heldBy.dueDate)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                      COPY_STATUS_STYLES[c.status] || "bg-ink-50 text-ink-500"
                    }`}
                  >
                    {c.status}
                  </span>
                  {c.status !== "issued" && (
                    <select
                      value=""
                      onChange={(e) => e.target.value && handleCopyStatusChange(c, e.target.value)}
                      className="text-xs border border-ink-100 rounded-md px-1.5 py-1 outline-none text-ink-500 bg-white"
                    >
                      <option value="">Change…</option>
                      {c.status !== "available" && <option value="available">Mark available</option>}
                      {c.status !== "lost" && <option value="lost">Mark lost</option>}
                      {c.status !== "damaged" && <option value="damaged">Mark damaged</option>}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
