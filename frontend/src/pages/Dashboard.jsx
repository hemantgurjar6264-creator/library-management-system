import React, { useEffect, useState } from "react";
import { BookOpen, Users, ArrowLeftRight, AlertTriangle } from "lucide-react";
import api from "../api/axios";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/transactions/stats/dashboard");
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold text-brass-600 uppercase tracking-widest mb-1">Overview</p>
        <h1 className="font-display text-3xl font-semibold text-black">Dashboard</h1>
      </div>

      {loading ? (
        <div className="text-black text-sm">Loading shelves…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Titles" value={stats.totalBooks} icon={BookOpen} accent="#B08D3E" />
            <StatCard label="Registered Members" value={stats.totalMembers} icon={Users} accent="#3F6C51" />
            <StatCard label="Books on Loan" value={stats.booksIssued} icon={ArrowLeftRight} accent="#5D71A5" />
            <StatCard label="Overdue" value={stats.overdueCount} icon={AlertTriangle} accent="#A13D3D" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-card border border-ink-100/60 p-6">
              <h2 className="font-display font-semibold text-lg text-black mb-4">Recent Circulation</h2>
              {stats.recentTransactions.length === 0 ? (
                <p className="text-sm text-black py-8 text-center">
                  No activity yet. Issue your first book from the Circulation desk.
                </p>
              ) : (
                <div className="divide-y divide-ink-50">
                  {stats.recentTransactions.map((t) => (
                    <div key={t._id} className="flex items-center gap-4 py-3">
                      <div
                        className="w-8 h-10 rounded-sm shrink-0"
                        style={{ backgroundColor: t.book?.coverColor || "#B08D3E" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-black truncate">{t.book?.title}</p>
                        <p className="text-xs text-black">
                          {t.member?.name} · {t.member?.membershipId}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                          t.status === "returned"
                            ? "bg-clover/10 text-clover"
                            : t.status === "overdue"
                            ? "bg-rust/10 text-rust"
                            : "bg-brass-100 text-brass-700"
                        }`}
                      >
                        {t.status}
                      </span>
                      <span className="text-xs text-black font-mono w-14 text-right shrink-0">
                        {formatDate(t.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-brass-500 rounded-xl shadow-card p-6 text-white">
              <h2 className="font-display font-semibold text-lg mb-4">Collection Health</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/70">Copies available</span>
                    <span className="font-mono font-medium">
                      {stats.availableCopies}/{stats.totalCopies}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{
                        width: `${
                          stats.totalCopies ? (stats.availableCopies / stats.totalCopies) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/20">
                  <span className="text-white/70">Fines collected</span>
                  <span className="font-mono font-medium">₹{stats.finesCollected}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Fines pending</span>
                  <span className="font-mono font-medium">₹{stats.finesPending}</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed pt-2 border-t border-white/20">
                  {stats.overdueCount > 0
                    ? `${stats.overdueCount} loan${
                        stats.overdueCount > 1 ? "s are" : " is"
                      } past due. Visit Circulation to follow up.`
                    : "All loans are within their due dates. Well kept shelves."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}