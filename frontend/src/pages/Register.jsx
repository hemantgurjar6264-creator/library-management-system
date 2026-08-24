import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", width: "100%", height: "100vh", display: "flex", backgroundColor: "#e2e8f0", backgroundImage: "url('/campus-hero.jpg')", backgroundSize: "cover", backgroundPosition: "center bottom", overflow: "hidden" }}>
      
      {/* Bottom Dark Bar spanning entire width */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "90px", backgroundColor: "#1c2b45", display: "flex", justifyContent: "flex-start", gap: "60px", alignItems: "center", padding: "0 60px", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", border: "1px solid rgba(255,107,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
          </div>
          <div>
            <div style={{ color: "white", fontSize: "15px", fontWeight: "600", letterSpacing: "0.5px" }}>Secure Access</div>
            <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "3px" }}>Your data is safe with us</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", border: "1px solid rgba(255,107,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          </div>
          <div>
            <div style={{ color: "white", fontSize: "15px", fontWeight: "600", letterSpacing: "0.5px" }}>Library Excellence</div>
            <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "3px" }}>Books today, leaders tomorrow</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", border: "1px solid rgba(255,107,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2"><polygon points="12 2 2 7 22 7 12 2"></polygon><polyline points="2 17 2 22 22 22 22 17"></polyline><polyline points="6 12 6 17"></polyline><polyline points="10 12 10 17"></polyline><polyline points="14 12 14 17"></polyline><polyline points="18 12 18 17"></polyline></svg>
          </div>
          <div>
            <div style={{ color: "white", fontSize: "15px", fontWeight: "600", letterSpacing: "0.5px" }}>Smart Management</div>
            <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "3px" }}>Efficient. Reliable. Simple.</div>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2, display: "flex" }}>
        
        {/* Left Side */}
        <div style={{ flex: 1.3, position: "relative" }}>
          
          {/* College Logo Overlay */}
          <img
            src="/ssism-logo.png"
            alt="Sant Singaji Institute of Science & Management"
            style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "400px",
              maxWidth: "80%",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))"
            }}
          />

        </div>

        {/* Right Side (Form Area) */}
        <div style={{ width: "540px", height: "100%", padding: "20px 30px 20px 0", display: "flex", alignItems: "center", zIndex: 10 }}>
          <div style={{ width: "100%", height: "100%", backgroundColor: "white", borderRadius: "30px", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", padding: "25px 35px", display: "flex", flexDirection: "column", overflowY: "auto", boxSizing: "border-box" }}>
            
            {/* Top Icon Badge */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "15px" }}>
              <div style={{ width: "55px", height: "55px", borderRadius: "50%", border: "2px solid #ffedd5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#112240", margin: "0 0 4px 0" }}>Create Admin Account</h2>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Set up your library's workspace</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
              
              {/* Full Name Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#112240" }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: "12px", top: "11px" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", color: "#334155", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Email Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#112240" }}>Email</label>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: "12px", top: "11px" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <input type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", color: "#334155", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#112240" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: "12px", top: "11px" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input type={showPassword ? "text" : "password"} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={{ width: "100%", padding: "10px 36px 10px 36px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", color: "#334155", boxSizing: "border-box" }} />
                  <div style={{ position: "absolute", right: "12px", top: "11px", cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#112240" }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: "12px", top: "11px" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input type={showPassword ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} style={{ width: "100%", padding: "10px 36px 10px 36px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", color: "#334155", boxSizing: "border-box" }} />
                  <div style={{ position: "absolute", right: "12px", top: "11px", cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", backgroundColor: "#ff6b00", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "5px", boxShadow: "0 8px 20px rgba(255,107,0,0.3)" }}>
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* OR */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "15px 0" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#f1f5f9" }}></div>
              <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "600" }}>OR</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#f1f5f9" }}></div>
            </div>

            {/* Sign In Link */}
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button type="button" style={{ width: "100%", padding: "12px", backgroundColor: "white", color: "#ff6b00", border: "1px solid #ffedd5", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                 Sign in
              </button>
            </Link>

            {/* Footer */}
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#94a3b8", fontSize: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>© 2026 Sant Singaji Institute of Science &amp; Management</span>
              </div>
              <span>All rights reserved.</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}