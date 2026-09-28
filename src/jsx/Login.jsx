import React, { useState } from "react";
import "../Login.css";

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only non-sensitive info for display after login
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Set REACT_APP_API_URL in your Vercel environment variables.
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // ==========================================
  // LOGIN
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    const loginEmail = email.trim();

    if (!loginEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Lets the browser accept/send the httpOnly session cookie
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      if (!data.user) {
        setError("Login error: user information was not returned.");
        return;
      }

      const user = data.user;
      const userId = user._id || user.id || data.user_id;

      if (!userId) {
        setError("Login error: user ID was not returned by the server.");
        return;
      }

      const firstName = user.first_name || user.firstName || "";
      const middleName = user.middle_name || user.middleName || "";
      const lastName = user.last_name || user.lastName || "";
      const userName =
        [firstName, middleName, lastName].filter(Boolean).join(" ") || "User";

      // Clear anything left over from the old insecure flow
      [
        "residentId",
        "userId",
        "residentName",
        "userName",
        "userEmail",
        "userRole",
        "loggedIn",
        "isLoggedIn"
      ].forEach((key) => localStorage.removeItem(key));

      // Display-only data. NOT used for authorization: the server
      // decides access from the session cookie on every request.
      // (Role is intentionally not stored here.)
      localStorage.setItem("userId", String(userId));
      localStorage.setItem("residentId", String(userId));
      localStorage.setItem("userName", userName);
      localStorage.setItem("residentName", userName);

      setLoggedInUser({
        id: userId,
        name: userName,
        email: user.email || loginEmail,
        role: user.role || "resident"
      });

      setEmail("");
      setPassword("");
    } catch (err) {
      setError(
        "Unable to connect to the server. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => setCurrentPage("admin-login");
  const handleContinue = () => setCurrentPage("dashboard");

  // ==========================================
  // UI
  // ==========================================
  if (loggedInUser) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo-wrapper">
            <img src="/logo.jpg" alt="Barangay Logo" className="login-logo" />
          </div>

          <h1>Barangay Portal</h1>
          <p className="login-subtitle">Login Successful</p>

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
          </div>

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
        <div className="login-logo-wrapper">
          <img src="/logo.jpg" alt="Barangay Logo" className="login-logo" />
        </div>

        <h1>Barangay Portal</h1>
        <p className="login-subtitle">Resident Login</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p role="alert" style={{ color: "#e5484d", margin: "8px 0" }}>
              {error}
            </p>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          className="register-button"
          onClick={() => setCurrentPage("register")}
          disabled={loading}
        >
          Register
        </button>

        <button
          type="button"
          className="staff-login-link"
          onClick={handleAdminLogin}
          disabled={loading}
        >
          🔐 Admin & Staff Login
        </button>

        <p className="login-footer">Resident access portal</p>
      </div>
    </div>
  );
};

export default Login;
