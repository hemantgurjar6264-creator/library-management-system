import React, { useEffect, useState, useRef } from "react";
import { Plus, Search, Pencil, Trash2, Users, Mail, Phone, Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Modal from "../components/Modal";

const emptyForm = { name: "", email: "", phone: "", address: "" };

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Uploading and importing members...");
    try {
      const { data } = await api.post("/members/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(data.message || "Members imported successfully", { id: toastId });
      fetchMembers(search);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to import members", { id: toastId });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchMembers = async (q = "") => {
    setLoading(true);
    try {
      const { data } = await api.get(`/members${q ? `?search=${encodeURIComponent(q)}` : ""}`);
      setMembers(data);
    } catch (err) {
      toast.error("Could not load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchMembers(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const openAddModal = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMember) {
        await api.put(`/members/${editingMember._id}`, form);
        toast.success("Member updated");
      } else {
        await api.post("/members", form);
        toast.success("Member registered");
      }
      setModalOpen(false);
      fetchMembers(search);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (member) => {
    try {
      const newStatus = member.status === "active" ? "suspended" : "active";
      await api.put(`/members/${member._id}`, { status: newStatus });
      toast.success(`Member ${newStatus}`);
      fetchMembers(search);
    } catch (err) {
      toast.error("Could not update status");
    }
  };



  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-brass-600 uppercase tracking-widest mb-1">Members</p>
          <h1 className="font-display text-3xl font-semibold text-ink-800">Registered Members</h1>
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
            <Plus size={16} /> Add Member
          </button>
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or ID…"
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm transition-shadow"
        />
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading members…</p>
      ) : members.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-ink-200">
          <Users className="mx-auto text-ink-200 mb-3" size={36} />
          <p className="text-black text-sm">No members yet. Register your first member.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card border border-ink-100/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50/60 text-left text-ink-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-semibold">Member</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Membership ID</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {members.map((member) => (
                <tr key={member._id} className="hover:bg-parchment-100/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brass-100 text-brass-700 flex items-center justify-center font-semibold text-xs shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-ink-800">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-500">
                    <div className="flex items-center gap-1.5 text-xs mb-0.5">
                      <Mail size={12} /> {member.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Phone size={12} /> {member.phone}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-ink-500">{member.membershipId}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleStatus(member)}
                      className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full transition-colors ${
                        member.status === "active"
                          ? "bg-clover/10 text-clover hover:bg-clover/20"
                          : "bg-rust/10 text-rust hover:bg-rust/20"
                      }`}
                    >
                      {member.status}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-2 text-ink-500 hover:text-ink-800 hover:bg-ink-50 rounded-md transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? "Edit Member" : "Register New Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
              Full Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
              Phone *
            </label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-600 uppercase tracking-wide mb-1.5">
              Address
            </label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-ink-100 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brass-500 hover:bg-brass-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : editingMember ? "Save Changes" : "Register Member"}
          </button>
        </form>
      </Modal>
    </div>
  );
}