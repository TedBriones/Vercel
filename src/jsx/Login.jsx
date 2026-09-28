import React, { useState } from "react";
import "../Login.css";

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Holds the logged-in user's data so we can display it after login
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Set this to your live Node.js backend URL (or local Node backend during development)
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // ==========================================
  // LOGIN
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const loginEmail = email.trim();

    if (!loginEmail || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      console.log("=================================");
      console.log("LOGIN STARTED");
      console.log("Email:", loginEmail);
      console.log("=================================");

      // ==========================================
      // SEND LOGIN REQUEST TO NODE.JS / MONGODB BACKEND
      // ==========================================
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: loginEmail,
          password: password
        })
      });

      console.log("LOGIN HTTP STATUS:", response.status);

      const data = await response.json();
      console.log("LOGIN API DATA:", data);

      // ==========================================
      // LOGIN FAILED
      // ==========================================
      if (!response.ok || !data.success) {
        console.error("LOGIN FAILED:", data.message);
        alert(data.message || "Invalid email or password.");
        return;
      }

      // ==========================================
      // CHECK USER OBJECT
      // ==========================================
      if (!data.user) {
        console.error("Login succeeded but user object is missing:", data);
        alert("Login error: User information was not returned.");
        return;
      }

      // ==========================================
      // GET USER ID (Supports both _id and id)
      // ==========================================
      const userId = data.user._id || data.user.id || data.user_id;

      if (!userId) {
        console.error("LOGIN ERROR: User ID missing.", data);
        alert("Login error: User ID was not returned by the server.");
        return;
      }

      // ==========================================
      // USER INFORMATION (Supports both snake_case and camelCase)
      // ==========================================
      const userEmail = data.user.email || loginEmail;

      const firstName = data.user.first_name || data.user.firstName || "";
      const middleName = data.user.middle_name || data.user.middleName || "";
      const lastName = data.user.last_name || data.user.lastName || "";

      const userName = [firstName, middleName, lastName].filter(Boolean).join(" ");
      const userRole = data.user.role || "resident";

      // ==========================================
      // CLEAR OLD SESSION FIRST
      // ==========================================
      localStorage.removeItem("residentId");
      localStorage.removeItem("userId");
      localStorage.removeItem("residentName");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("isLoggedIn");

      // ==========================================
      // SAVE NEW SESSION
      // ==========================================
      localStorage.setItem("userId", String(userId));
      localStorage.setItem("residentId", String(userId));
      localStorage.setItem("userName", userName || "User");
      localStorage.setItem("residentName", userName || "User");
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("isLoggedIn", "true");

      // ==========================================
      // VERIFY LOCAL STORAGE
      // ==========================================
      console.log("=================================");
      console.log("LOGIN SUCCESSFUL");
      console.log("User ID:", localStorage.getItem("userId"));
      console.log("User Name:", localStorage.getItem("userName"));
      console.log("User Email:", localStorage.getItem("userEmail"));
      console.log("User Role:", localStorage.getItem("userRole"));
      console.log("Logged In:", localStorage.getItem("loggedIn"));
      console.log("=================================");

      // ==========================================
      // SAVE LOGGED-IN USER DATA TO STATE
      // (so we can display it on screen)
      // ==========================================
      setLoggedInUser({
        id: userId,
        name: userName || "User",
        email: userEmail,
        role: userRole
      });

      // ==========================================
      // CLEAR FORM
      // ==========================================
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      alert(
        error.message ||
          "Unable to connect to the server. Please verify your backend server is running and accessible."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ADMIN LOGIN
  // ==========================================
  const handleAdminLogin = () => {
    setCurrentPage("admin-login");
  };

  // ==========================================
  // CONTINUE TO DASHBOARD
  // ==========================================
  const handleContinue = () => {
    console.log("Navigating to dashboard...");
    setCurrentPage("dashboard");
  };

  // ==========================================
  // UI
  // ==========================================

  // If login succeeded, show the logged-in user's data instead of the form
  if (loggedInUser) {
    return (
      <div className="login-page">
        <div className="login-card">
          {/* LOGO */}
          <div className="login-logo-wrapper">
            <img src="/logo.jpg" alt="Barangay Logo" className="login-logo" />
          </div>

          {/* TITLE */}
          <h1>Barangay Portal</h1>
          <p className="login-subtitle">Login Successful</p>

          {/* LOGGED-IN USER DATA */}
          <div className="user-info-card">
            <p>
              <strong>Name:</strong> {loggedInUser.name}
            </p>
            <p>
              <strong>Email:</strong> {loggedInUser.email}
            </p>
            <p>
              <strong>Role:</strong> {loggedInUser.role}
            </p>
            <p>
              <strong>User ID:</strong> {loggedInUser.id}
            </p>
          </div>

          {/* CONTINUE BUTTON */}
          <button
            type="button"
            className="login-button"
            onClick={handleContinue}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LOGO */}
        <div className="login-logo-wrapper">
          <img src="/logo.jpg" alt="Barangay Logo" className="login-logo" />
        </div>

        {/* TITLE */}
        <h1>Barangay Portal</h1>
        <p className="login-subtitle">Resident Login</p>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* LOGIN BUTTON */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* REGISTER */}
        <button
          type="button"
          className="register-button"
          onClick={() => setCurrentPage("register")}
          disabled={loading}
        >
          Register
        </button>

        {/* ADMIN / STAFF */}
        <button
          type="button"
          className="staff-login-link"
          onClick={handleAdminLogin}
          disabled={loading}
        >
          🔐 Admin & Staff Login
        </button>

        {/* FOOTER */}
        <p className="login-footer">Resident access portal</p>
      </div>
    </div>
  );
};

export default Login;
