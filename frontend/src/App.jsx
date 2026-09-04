import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Members from "./pages/Members";
import Reports from "./pages/Reports";
import ActivityLog from "./pages/ActivityLog";
import Settings from "./pages/Settings";
import IssueBook from "./pages/IssueBook";
import ReturnBook from "./pages/ReturnBook";
import OverdueBooks from "./pages/OverdueBooks";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-parchment-100">
        <div className="animate-pulse text-ink-700 font-display text-lg">Opening the stacks…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="books" element={<Books />} />
        <Route path="members" element={<Members />} />
        <Route path="issue-book" element={<IssueBook />} />
        <Route path="return-book" element={<ReturnBook />} />
        <Route path="overdue-books" element={<OverdueBooks />} />
        <Route path="reports" element={<Reports />} />
        <Route path="activity" element={<ActivityLog />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#14213D",
            color: "#EDE7D9",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  );
}
