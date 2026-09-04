import React, { useEffect, useState } from "react";
import { BookOpen, Users, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from "../api/axios";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [recentBooks, setRecentBooks] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, booksRes, overdueRes] = await Promise.all([
          api.get("/transactions/stats/dashboard"),
          api.get("/books?limit=5"),
          api.get("/transactions/overdue?limit=5")
        ]);
        setStats(statsRes.data);
        setRecentBooks(booksRes.data.slice(0, 5));
        setOverdueBooks(overdueRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
            <StatCard label="Total Books" value={stats.totalBooks} icon={BookOpen} accent="#B08D3E" />
            <StatCard label="Book Copies" value={stats.totalCopies} icon={BookOpen} accent="#3F6C51" />
            <StatCard label="Available" value={stats.availableCopies} icon={BookOpen} accent="#5D71A5" />
            <StatCard label="Issued Books" value={stats.booksIssued} icon={ArrowLeftRight} accent="#A13D3D" />
            <StatCard label="Overdue Books" value={stats.overdueCount} icon={AlertTriangle} accent="#A13D3D" />
            <StatCard label="Total Members" value={stats.totalMembers} icon={Users} accent="#3F6C51" />
            <StatCard label="Total Fine (₹)" value={stats.finesCollected + stats.finesPending} icon={AlertTriangle} accent="#B08D3E" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-card border border-ink-100/60 p-6 hover:shadow-cardHover transition-all duration-300">
              <h2 className="font-display font-semibold text-lg text-black mb-4">Recent Transactions</h2>
              {stats.recentTransactions.length === 0 ? (
                <p className="text-sm text-black py-4 text-center">No recent activity.</p>
              ) : (
                <div className="divide-y divide-ink-50">
                  {stats.recentTransactions.map((t) => (
                    <div key={t._id} className="py-2 text-sm flex justify-between">
                      <div>
                        <p className="font-medium">{t.book?.title}</p>
                        <p className="text-xs text-ink-500">{t.member?.name}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase">{t.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-card border border-ink-100/60 p-6 hover:shadow-cardHover transition-all duration-300">
              <h2 className="font-display font-semibold text-lg text-black mb-4">Recently Added Books</h2>
              {recentBooks.length === 0 ? (
                <p className="text-sm text-black py-4 text-center">No books added yet.</p>
              ) : (
                <div className="divide-y divide-ink-50">
                  {recentBooks.map((b) => (
                    <div key={b._id} className="py-2 text-sm">
                      <p className="font-medium">{b.title}</p>
                      <p className="text-xs text-ink-500">{b.author}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-card border border-ink-100/60 p-6 hover:shadow-cardHover transition-all duration-300">
              <h2 className="font-display font-semibold text-lg text-black mb-4">Overdue Alert</h2>
              {overdueBooks.length === 0 ? (
                <p className="text-sm text-black py-4 text-center">No overdue books.</p>
              ) : (
                <div className="divide-y divide-ink-50">
                  {overdueBooks.map((t) => (
                    <div key={t._id} className="py-2 text-sm flex justify-between">
                      <div>
                        <p className="font-medium">{t.book?.title}</p>
                        <p className="text-xs text-rust font-semibold">₹{t.fine} Fine</p>
                      </div>
                      <span className="text-xs font-mono">{formatDate(t.dueDate)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}