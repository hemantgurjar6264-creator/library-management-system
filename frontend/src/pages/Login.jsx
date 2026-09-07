import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Please enter both username and password");
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex bg-slate-200 bg-[url('/campus-hero.jpg')] bg-cover bg-bottom overflow-hidden relative font-sans">
      
      {/* Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-[4px] z-0"></div>

      {/* Bottom Dark Bar spanning entire width (Hidden on mobile) */}
      <div className="hidden lg:flex absolute bottom-0 left-0 w-full h-[90px] bg-[#1c2b45] justify-start gap-[60px] items-center px-[60px] z-[1]">
        <div className="flex items-center gap-[15px]">
          <div className="w-[45px] h-[45px] rounded-full border border-[#ff6b00]/50 flex justify-center items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
          </div>
          <div>
            <div className="text-white text-[15px] font-semibold tracking-wide">Secure Access</div>
            <div className="text-slate-400 text-[12px] mt-[3px]">Your data is safe with us</div>
          </div>
        </div>

        <div className="flex items-center gap-[15px]">
          <div className="w-[45px] h-[45px] rounded-full border border-[#ff6b00]/50 flex justify-center items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          </div>
          <div>
            <div className="text-white text-[15px] font-semibold tracking-wide">Library Excellence</div>
            <div className="text-slate-400 text-[12px] mt-[3px]">Books today, leaders tomorrow</div>
          </div>
        </div>

        <div className="flex items-center gap-[15px]">
          <div className="w-[45px] h-[45px] rounded-full border border-[#ff6b00]/50 flex justify-center items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2"><polygon points="12 2 2 7 22 7 12 2"></polygon><polyline points="2 17 2 22 22 22 22 17"></polyline><polyline points="6 12 6 17"></polyline><polyline points="10 12 10 17"></polyline><polyline points="14 12 14 17"></polyline><polyline points="18 12 18 17"></polyline></svg>
          </div>
          <div>
            <div className="text-white text-[15px] font-semibold tracking-wide">Smart Management</div>
            <div className="text-slate-400 text-[12px] mt-[3px]">Efficient. Reliable. Simple.</div>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="absolute inset-0 z-[2] flex flex-col md:flex-row">
        
        {/* Left Side (Hidden on smaller screens) */}
        <div className="hidden md:block flex-[1.3] relative">
          {/* College Logo Overlay */}
          <img
            src="/ssism-logo.png"
            alt="Sant Singaji Institute of Science & Management"
            fetchpriority="high"
            loading="eager"
            className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[400px] max-w-[80%] drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
          />
        </div>

        {/* Right Side (Form Area) */}
        <div className="w-full md:w-[520px] h-full p-4 md:py-5 md:pr-8 md:pl-0 flex items-center justify-center z-10 mx-auto md:mx-0">
          <div className="w-full max-w-md md:max-w-none h-auto md:h-full max-h-[90vh] md:max-h-none bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 md:p-10 flex flex-col overflow-y-auto">
            
            {/* Top Icon Badge */}
            <div className="flex flex-col items-center mb-5">
              <div style={{ width: "65px", height: "65px", borderRadius: "50%", border: "2px solid #ffedd5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#112240", margin: "0 0 6px 0" }}>Library Management System</h2>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Authorized Staff Login Only</p>
            </div>

            {/* Subtle Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "80%", margin: "0 auto 20px auto" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#f1f5f9" }}></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#f1f5f9" }}></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
              
              {/* Username Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#112240" }}>Name or Email</label>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: "14px", top: "12px" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input type="text" placeholder="Enter your name or email" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", color: "#334155", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#112240" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: "14px", top: "12px" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px 40px 12px 40px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", color: "#334155", boxSizing: "border-box" }} />
                  <div style={{ position: "absolute", right: "14px", top: "12px", cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Options */}
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", fontSize: "13px" }}>
                <Link to="/forgot-password" style={{ color: "#ff6b00", fontWeight: "600", cursor: "pointer", textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", backgroundColor: "#ff6b00", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "5px", boxShadow: "0 8px 20px rgba(255,107,0,0.3)" }}>
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Login
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: "#94a3b8", fontSize: "11px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
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
