import React, { useState } from "react";
import "../Login.css";

const AdminLogin = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminLogin = (e) => {
    e.preventDefault();

    // ADMIN ACCOUNT
    const adminEmail = "admin@barangay.com";
    const adminPassword = "admin123";

    if (email === adminEmail && password === adminPassword) {
      // Save login information
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userEmail", email);

      // Open Admin Dashboard
      setCurrentPage("admin-dashboard");
    } else {
      alert("Invalid administrator email or password.");
    }
  };

  return (
    <div className="admin-login-page">

      {/* =================================
          ANIMATED TECH BACKGROUND
          ================================= */}

      <div className="background-effects">

        <span className="tech-orb orb-1"></span>
        <span className="tech-orb orb-2"></span>
        <span className="tech-orb orb-3"></span>

      </div>


      {/* =================================
          LOGIN CARD
          ================================= */}

      <div className="login-card">

        <div className="login-logo-wrapper">
          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="login-logo"
          />
        </div>

        <h1>Barangay Portal</h1>

        <p className="login-subtitle">
          Administrator Login
        </p>


        {/* LOGIN FORM */}

        <form onSubmit={handleAdminLogin}>

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter administrator email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>


          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter administrator password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

          </div>


          <button
            type="submit"
            className="login-button"
          >
            Login as Administrator
          </button>

        </form>


        {/* BACK BUTTON */}

        <button
          className="register-button"
          onClick={() => setCurrentPage("login")}
        >
          ← Back to Resident Login
        </button>


        <p className="login-footer">
          Barangay Administration Portal
        </p>

      </div>

    </div>
  );
};

export default AdminLogin;