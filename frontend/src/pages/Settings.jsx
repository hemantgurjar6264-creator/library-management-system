import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Settings() {
  const [settings, setSettings] = useState({ loanDuration: 14, finePerDay: 5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/settings");
      if (data) {
        setSettings({
          loanDuration: data.loanDuration || 14,
          finePerDay: data.finePerDay || 5,
        });
      }
    } catch (err) {
      toast.error("Could not load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/settings", settings);
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-semibold text-brass-600 uppercase tracking-widest mb-1">
          System Administration
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink-800 flex items-center gap-2">
          <SettingsIcon size={28} /> Settings
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-ink-100/60 overflow-hidden p-6 sm:p-8">
        {loading ? (
          <p className="text-sm text-ink-400 text-center py-8">Loading settings…</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <h2 className="font-display font-semibold text-lg text-ink-800 border-b border-ink-100 pb-3">
              Library Policies
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink-800 mb-1.5">
                  Default Loan Duration (Days)
                </label>
                <p className="text-xs text-ink-500 mb-3">
                  The standard number of days a member can keep a borrowed book before it is marked overdue.
                </p>
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.loanDuration}
                  onChange={(e) => setSettings({ ...settings, loanDuration: Number(e.target.value) })}
                  className="w-full sm:w-64 px-4 py-2.5 rounded-lg border border-ink-200 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm shadow-sm"
                />
              </div>

              <div className="pt-2 border-t border-ink-50"></div>

              <div>
                <label className="block text-sm font-semibold text-ink-800 mb-1.5">
                  Fine Per Day (₹)
                </label>
                <p className="text-xs text-ink-500 mb-3">
                  The amount charged per day for every day a book is kept past its due date.
                </p>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={settings.finePerDay}
                  onChange={(e) => setSettings({ ...settings, finePerDay: Number(e.target.value) })}
                  className="w-full sm:w-64 px-4 py-2.5 rounded-lg border border-ink-200 bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="pt-6 mt-8 border-t border-ink-100">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-brass-500 hover:bg-brass-600 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? "Saving…" : "Save Settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
