import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, ArrowUpRight, ArrowDownLeft, AlertCircle, LogOut, FileBarChart, ChevronLeft, ChevronRight, Activity, Settings, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/books", label: "Books", icon: BookOpen },
  { to: "/members", label: "Members", icon: Users },
  { to: "/issue-book", label: "Issue Book", icon: ArrowUpRight },
  { to: "/return-book", label: "Return Book", icon: ArrowDownLeft },
  { to: "/overdue-books", label: "Overdue Books", icon: AlertCircle },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/activity", label: "Activity Log", icon: Activity },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-parchment-100 relative">
      
      {/* Mobile Top Navigation */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-ink-100 shadow-sm z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden ring-1 ring-brass-500/70">
            <img src="/ssism-mark.png" alt="SSISM" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-extrabold text-sm text-ink-800">SSISM Library</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-ink-600 hover:text-brass-600">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-ink-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 bg-white border-r border-ink-100 flex flex-col shadow-card transition-transform duration-300 transform 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        ${isCollapsed ? "md:w-20" : "w-64"} shrink-0`}>
        
        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-9 bg-white border border-ink-100 text-ink-600 rounded-full p-1 shadow-sm hover:text-brass-600 hover:border-brass-300 z-10 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`py-6 flex items-center border-b border-ink-100 relative ${isCollapsed ? "px-0 justify-center" : "px-6 gap-3"}`}>
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-brass-500/70 shadow-sm">
            <img src="/ssism-mark.png" alt="SSISM" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-300">
              <p className="font-display font-extrabold text-base leading-tight truncate text-ink-800">SSISM Library</p>
              <p className="text-[10px] tracking-widest text-ink-400 uppercase mt-1">
                Management System
              </p>
            </div>
          )}
          {/* Mobile close button inside sidebar */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-800 p-2"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-1.5 px-3 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={isCollapsed ? label : ""}
              className={({ isActive }) =>
                `group relative flex items-center rounded-xl overflow-hidden transition-all
                 ${isCollapsed ? "md:justify-center p-3" : "gap-3 pl-4 pr-3 py-3"}
                 ${isActive
                    ? "bg-brass-500 text-white shadow-sm"
                    : "text-ink-600 hover:bg-brass-50 hover:text-brass-700"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? "text-white" : "text-ink-500 group-hover:text-brass-600"} />
                  <span className={`font-semibold text-sm whitespace-nowrap ${isCollapsed ? "md:hidden" : "block"}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`py-5 border-t border-ink-100 ${isCollapsed ? "px-2 flex flex-col items-center" : "px-4"}`}>
          <div className={`flex items-center mb-3 ${isCollapsed ? "md:justify-center" : "gap-3"}`}>
            <div className="w-9 h-9 rounded-full bg-brass-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className={`min-w-0 ${isCollapsed ? "md:hidden" : "block"}`}>
              <p className="text-sm font-semibold truncate text-ink-800">{user?.name}</p>
              <p className="text-[11px] text-ink-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sign out" : ""}
            className={`w-full flex items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-white bg-brass-500 hover:bg-brass-600 transition-colors ${isCollapsed ? "md:px-0" : "gap-2"}`}
          >
            <LogOut size={15} /> 
            <span className={`${isCollapsed ? "md:hidden" : "block"}`}>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col h-[calc(100vh-65px)] md:h-screen overflow-y-auto">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}