import React, { useState } from "react";
import "../AdminLogin.css";

const AdminLogin = ({ setCurrentPage }) => {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

const handleLogin = (e) => {
  e.preventDefault();

  setError("");

  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  if (role === "admin") {
    if (
      email === "admin@barangay.com" &&
      password === "admin123"
    ) {
      // Save admin session
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userEmail", email);

      // Make sure resident session data is not being reused
      localStorage.removeItem("residentId");
      localStorage.removeItem("isLoggedIn");

      // Go to admin dashboard
      setCurrentPage("admin-dashboard");
    } else {
      setError("Invalid administrator email or password.");
    }
  }

  // =====================================================
  // STAFF LOGIN
  // =====================================================

  if (role === "staff") {
    if (
      email === "staff@barangay.com" &&
      password === "staff123"
    ) {
      // Save staff session
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userRole", "staff");
      localStorage.setItem("userEmail", email);

      // Make sure resident session data is not being reused
      localStorage.removeItem("residentId");
      localStorage.removeItem("isLoggedIn");

      // Go to staff dashboard
      setCurrentPage("staff-dashboard");
    } else {
      setError("Invalid staff email or password.");
    }
  }
};
  return (
    <div className="admin-login-page">

      {/* Background decorations */}
      <div className="admin-bg-circle circle-one"></div>
      <div className="admin-bg-circle circle-two"></div>

      <div className="admin-login-card">

        {/* Logo */}
        <div className="admin-logo-wrapper">
          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="admin-logo"
          />
        </div>

        <div className="admin-title">
          <h1>Barangay Portal</h1>

          <p>
            Administration & Staff Portal
          </p>
        </div>


        {/* Security Badge */}
        <div className="security-badge">
          <span>🔐</span>
          <span>Authorized Personnel Only</span>
        </div>


        {/* Role Selector */}
        <div className="role-selector">

          <button
            type="button"
            className={role === "admin" ? "role active" : "role"}
            onClick={() => {
              setRole("admin");
              setError("");
            }}
          >
            <span>👨‍💼</span>
            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>
          </button>


          <button
            type="button"
            className={role === "staff" ? "role active" : "role"}
            onClick={() => {
              setRole("staff");
              setError("");
            }}
          >
            <span>👤</span>
            <div>
              <strong>Staff</strong>
              <small>Barangay Staff</small>
            </div>
          </button>

        </div>


        {/* Login Form */}
        <form onSubmit={handleLogin}>

          <div className="admin-form-group">

            <label>
              {role === "admin"
                ? "Administrator Email"
                : "Staff Email"}
            </label>

            <div className="input-wrapper">
              <span>✉️</span>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "admin"
                    ? "Enter administrator email"
                    : "Enter staff email"
                }
                required
              />
            </div>

          </div>


          <div className="admin-form-group">

            <label>Password</label>

            <div className="input-wrapper">
              <span>🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

          </div>


          {/* Error */}
          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}


          {/* Login */}
          <button
            type="submit"
            className="admin-login-button"
          >
            <span>🔐</span>

            Login as{" "}
            {role === "admin"
              ? "Administrator"
              : "Staff"}
          </button>

        </form>


        {/* Back */}
        <button
          className="back-to-resident"
          onClick={() => setCurrentPage("login")}
        >
          ← Back to Resident Login
        </button>


        <div className="admin-footer">
          <span>🛡️</span>
          Secure Barangay Management System
        </div>

      </div>

    </div>
  );
};

export default AdminLogin;