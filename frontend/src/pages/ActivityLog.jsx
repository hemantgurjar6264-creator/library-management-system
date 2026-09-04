import React, { useEffect, useState } from "react";
import { Activity, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/activity");
      setLogs(data);
    } catch (err) {
      toast.error("Could not load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      (l.performedBy?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold text-brass-600 uppercase tracking-widest mb-1">
          System Administration
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink-800 flex items-center gap-2">
          <Activity size={28} /> Activity Log
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-ink-100/60 overflow-hidden mb-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="font-display font-semibold text-lg">Recent Activities</h2>
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions, details, users…"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-ink-100 bg-ink-50 focus:bg-white focus:border-brass-400 focus:ring-2 focus:ring-brass-100 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-ink-400 py-8 text-center">Loading activity logs…</p>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16">
            <Activity className="mx-auto text-ink-200 mb-3" size={36} />
            <p className="text-black text-sm">No activities match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-ink-50/60 text-left text-ink-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold rounded-tl-lg">Timestamp</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Details</th>
                  <th className="px-5 py-3 font-semibold rounded-tr-lg">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-parchment-100/40 transition-colors">
                    <td className="px-5 py-3.5 text-ink-500 font-mono text-xs whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-ink-800">{log.action}</span>
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">
                      {log.details}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brass-100 text-brass-700 flex items-center justify-center font-semibold text-[10px] shrink-0">
                          {(log.performedBy?.name || "S").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-ink-600 text-xs">{log.performedBy?.name || "System"}</span>
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
