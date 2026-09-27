
import React, { useState } from "react";
import "../Login.css";

const Login = ({ setCurrentPage }) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      // SEND LOGIN REQUEST
      // ==========================================

      const response = await fetch(
        "http://localhost/barangay-api/login.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: loginEmail,
            password: password
          })
        }
      );

      console.log(
        "LOGIN HTTP STATUS:",
        response.status
      );

      // ==========================================
      // GET RAW RESPONSE
      // ==========================================

      const responseText =
        await response.text();

      console.log(
        "RAW LOGIN RESPONSE:",
        responseText
      );

      // ==========================================
      // PARSE JSON
      // ==========================================

      let data;

      try {

        data = JSON.parse(responseText);

      } catch (error) {

        console.error(
          "LOGIN JSON ERROR:",
          error
        );

        throw new Error(
          "PHP login.php returned invalid JSON."
        );
      }

      console.log(
        "LOGIN API DATA:",
        data
      );

      // ==========================================
      // LOGIN FAILED
      // ==========================================

      if (!response.ok || !data.success) {

        console.error(
          "LOGIN FAILED:",
          data.message
        );

        alert(
          data.message ||
          "Invalid email or password."
        );

        return;
      }

      // ==========================================
      // CHECK USER OBJECT
      // ==========================================

      if (!data.user) {

        console.error(
          "Login succeeded but user object is missing:",
          data
        );

        alert(
          "Login error: User information was not returned."
        );

        return;
      }

      // ==========================================
      // GET RESIDENT ID
      //
      // We support BOTH:
      //
      // data.user.id
      //
      // and
      //
      // data.resident_id
      // ==========================================

      const residentId =
        data.user.id ||
        data.resident_id;

      if (!residentId) {

        console.error(
          "LOGIN ERROR: Resident ID missing.",
          data
        );

        alert(
          "Login error: Resident ID was not returned by the server."
        );

        return;
      }

      // ==========================================
      // RESIDENT INFORMATION
      // ==========================================

      const residentEmail =
        data.user.email ||
        loginEmail;

      const residentName = [
        data.user.first_name,
        data.user.middle_name,
        data.user.last_name
      ]
        .filter(Boolean)
        .join(" ");

      // ==========================================
      // IMPORTANT:
      // CLEAR OLD SESSION FIRST
      // ==========================================

      localStorage.removeItem("residentId");
      localStorage.removeItem("residentName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("isLoggedIn");

      // ==========================================
      // SAVE NEW RESIDENT SESSION
      // ==========================================

      localStorage.setItem(
        "residentId",
        String(residentId)
      );

      localStorage.setItem(
        "residentName",
        residentName || "Resident"
      );

      localStorage.setItem(
        "userEmail",
        residentEmail
      );

      localStorage.setItem(
        "userRole",
        "resident"
      );

      localStorage.setItem(
        "loggedIn",
        "true"
      );

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // ==========================================
      // VERIFY LOCAL STORAGE
      // ==========================================

      console.log("=================================");
      console.log("LOGIN SUCCESSFUL");
      console.log(
        "Resident ID:",
        localStorage.getItem("residentId")
      );

      console.log(
        "Resident Name:",
        localStorage.getItem("residentName")
      );

      console.log(
        "Resident Email:",
        localStorage.getItem("userEmail")
      );

      console.log(
        "User Role:",
        localStorage.getItem("userRole")
      );

      console.log(
        "Logged In:",
        localStorage.getItem("loggedIn")
      );

      console.log("=================================");

      // ==========================================
      // CLEAR FORM
      // ==========================================

      setEmail("");
      setPassword("");

      // ==========================================
      // GO TO DASHBOARD
      // ==========================================

      console.log(
        "Navigating to dashboard..."
      );

      setCurrentPage("dashboard");

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      alert(
        error.message ||
        "Unable to connect to the server. Please make sure XAMPP Apache and MySQL are running."
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
  // UI
  // ==========================================

  return (

    <div className="login-page">

      <div className="login-card">

        {/* LOGO */}

        <div className="login-logo-wrapper">

          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="login-logo"
          />

        </div>

        {/* TITLE */}

        <h1>
          Barangay Portal
        </h1>

        <p className="login-subtitle">
          Resident Login
        </p>

        {/* LOGIN FORM */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              disabled={loading}
            />

          </div>

          {/* PASSWORD */}

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              disabled={loading}
            />

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>

        {/* REGISTER */}

        <button
          type="button"
          className="register-button"
          onClick={() =>
            setCurrentPage("register")
          }
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

        <p className="login-footer">
          Resident access portal
        </p>

      </div>

    </div>
  );
};

export default Login;
