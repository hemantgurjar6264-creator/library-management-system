import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#e2e8f0", backgroundImage: "url('/campus-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center bottom" }}>
      <div style={{ width: "420px", maxWidth: "92%", backgroundColor: "white", borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", padding: "40px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ width: "65px", height: "65px", borderRadius: "50%", border: "2px solid #ffedd5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#112240", margin: "0 0 6px 0", textAlign: "center" }}>
            Forgot Password?
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0, textAlign: "center" }}>
            {sent ? "Check your inbox for the reset link" : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#334155", lineHeight: 1.6, marginBottom: "24px" }}>
              If an account exists for <strong>{email}</strong>, a password reset link has been sent. The link expires in 30 minutes.
            </p>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button type="button" style={{ width: "100%", padding: "14px", backgroundColor: "#ff6b00", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
                Back to Login
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#112240" }}>Email</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", color: "#334155", boxSizing: "border-box" }}
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", backgroundColor: "#ff6b00", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 20px rgba(255,107,0,0.3)" }}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>

            <Link to="/login" style={{ textAlign: "center", fontSize: "13px", color: "#64748b", textDecoration: "none", fontWeight: "600" }}>
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
