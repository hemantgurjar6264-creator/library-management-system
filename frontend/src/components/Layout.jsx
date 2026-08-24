import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, ArrowLeftRight, LogOut, FileBarChart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/books", label: "Library Collection", icon: BookOpen },
  { to: "/members", label: "Members", icon: Users },
  { to: "/transactions", label: "Circulation", icon: ArrowLeftRight },
  { to: "/reports", label: "Reports", icon: FileBarChart },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-parchment-100">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-ink-100 flex flex-col shadow-card">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-ink-100">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-brass-500/70 shadow-sm">
            <img src="/ssism-mark.png" alt="SSISM" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-extrabold text-base leading-tight truncate text-ink-800">SSISM Library</p>
            <p className="text-[10px] tracking-widest text-ink-400 uppercase mt-1">
              Management System
            </p>
          </div>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-1.5 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl pl-4 pr-3 py-3 overflow-hidden transition-all
                 ${isActive
                    ? "bg-brass-500 text-white shadow-sm"
                    : "text-black hover:bg-brass-50 hover:text-brass-700"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? "text-white" : "text-black group-hover:text-brass-600"} />
                  <span className="font-semibold text-sm">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-ink-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-brass-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-ink-800">{user?.name}</p>
              <p className="text-[11px] text-ink-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center rounded-lg py-2.5 text-sm font-semibold text-white bg-brass-500 hover:bg-brass-600 transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}