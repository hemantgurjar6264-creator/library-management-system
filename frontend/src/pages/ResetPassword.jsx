import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success("Password reset! Please log in with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#e2e8f0", backgroundImage: "url('/campus-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center bottom" }}>
      <div style={{ width: "420px", maxWidth: "92%", backgroundColor: "white", borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", padding: "40px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ width: "65px", height: "65px", borderRadius: "50%", border: "2px solid #ffedd5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#112240", margin: "0 0 6px 0", textAlign: "center" }}>
            Set a New Password
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, textAlign: "center" }}>
            Choose a new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#112240" }}>New Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", color: "#334155", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "#112240" }}>Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", color: "#334155", boxSizing: "border-box" }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", backgroundColor: "#ff6b00", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 20px rgba(255,107,0,0.3)" }}>
            {loading ? "Resetting…" : "Reset Password"}
          </button>

          <Link to="/login" style={{ textAlign: "center", fontSize: "13px", color: "#64748b", textDecoration: "none", fontWeight: "600" }}>
            ← Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}
