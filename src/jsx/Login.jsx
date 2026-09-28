import React, { useEffect, useState } from "react";
import "../App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Return the first non-empty value among several possible field names
const pick = (obj, ...keys) => {
  if (!obj) return "";
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  return "";
};

// Backend may wrap the resident in different keys
const extractResident = (data) => {
  if (!data) return null;
  const candidate = data.resident || data.user || data.profile || data.data || null;
  return candidate && typeof candidate === "object" ? candidate : null;
};

const Login = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Start every login with a clean session
  useEffect(() => {
    [
      "residentId",
      "residentName",
      "residentProfile",
      "userEmail",
      "userRole",
      "loggedIn",
      "isLoggedIn",
    ].forEach((key) => localStorage.removeItem(key));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const responseText = await response.text();
      console.log("Login HTTP status:", response.status);
      console.log("Login raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        throw new Error("Login API returned invalid JSON.");
      }

      if (!response.ok || data.success === false) {
        alert(data.message || "Invalid email or password.");
        return;
      }

      const resident = extractResident(data);

      // Find the resident id wherever the backend put it
      const residentId =
        data.resident_id ||
        data.residentId ||
        data.user_id ||
        data.userId ||
        data.id ||
        data._id ||
        pick(resident, "_id", "id", "resident_id", "user_id");

      if (!residentId) {
        console.error("Login succeeded but no id was returned:", data);
        alert(
          "Login worked, but the server did not return a resident ID. Check the browser console (Login raw response)."
        );
        return;
      }

      const form = {
        firstName: pick(resident, "first_name", "firstName") || pick(data, "first_name", "firstName"),
        middleName: pick(resident, "middle_name", "middleName") || pick(data, "middle_name", "middleName"),
        lastName: pick(resident, "last_name", "lastName") || pick(data, "last_name", "lastName"),
        sex: pick(resident, "sex", "gender"),
        birthdate: pick(resident, "birthdate", "birth_date", "birthDate"),
        civilStatus: pick(resident, "civil_status", "civilStatus"),
        address: pick(resident, "address"),
        occupation: pick(resident, "occupation"),
        contactNumber: pick(resident, "contact_number", "contactNumber"),
        email: pick(resident, "email") || pick(data, "email") || formData.email,
        seniorCitizen: pick(resident, "senior_citizen", "seniorCitizen") || "No",
        pwd: pick(resident, "pwd") || "No",
      };

      const fullName = [form.firstName, form.middleName, form.lastName]
        .filter(Boolean)
        .join(" ");

      localStorage.setItem("residentId", String(residentId));
      localStorage.setItem("userEmail", form.email);
      localStorage.setItem("residentName", fullName);
      localStorage.setItem("residentProfile", JSON.stringify(form));
      localStorage.setItem("userRole", pick(data, "role") || pick(resident, "role") || "resident");
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("isLoggedIn", "true");

      console.log("LOGGED IN RESIDENT ID:", residentId);

      setCurrentPage("dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert(
        "Unable to connect to the server. Please verify your backend server is running and accessible."
      );
    } finally {
      setLoading(false);
    }
  };

  const groupStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginBottom: "1rem",
    textAlign: "left",
  };

  const labelStyle = { display: "block", fontWeight: 600, marginBottom: "0.4rem" };

  const inputStyle = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "0.6rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "1rem",
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-container">
          <img src="/logo.jpg" alt="Barangay Logo" className="login-logo" />
        </div>

        <h1>Barangay Portal</h1>
        <p className="login-subtitle">Resident Login</p>

        <form onSubmit={handleLogin}>
          <div className="login-form-group" style={groupStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div className="login-form-group" style={groupStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          className="register-button"
          onClick={() => setCurrentPage("register")}
        >
          Create an Account
        </button>

        <p className="login-info">Barangay Resident Portal</p>
      </div>
    </div>
  );
};

export default Login;
