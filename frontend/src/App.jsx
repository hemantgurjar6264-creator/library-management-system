import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Books = lazy(() => import("./pages/Books"));
const Members = lazy(() => import("./pages/Members"));
const Reports = lazy(() => import("./pages/Reports"));
const ActivityLog = lazy(() => import("./pages/ActivityLog"));
const Settings = lazy(() => import("./pages/Settings"));
const IssueBook = lazy(() => import("./pages/IssueBook"));
const ReturnBook = lazy(() => import("./pages/ReturnBook"));
const OverdueBooks = lazy(() => import("./pages/OverdueBooks"));

const FallbackLoader = () => (
  <div className="h-screen flex items-center justify-center bg-parchment-100">
    <div className="animate-pulse text-ink-700 font-display text-lg">Loading...</div>
  </div>
);

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
    <Suspense fallback={<FallbackLoader />}>
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
    </Suspense>
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
