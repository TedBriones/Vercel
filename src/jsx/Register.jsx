import React, { useEffect, useState } from "react";
import "../App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const SESSION_KEYS = [
  "residentId",
  "residentName",
  "residentProfile",
  "userEmail",
  "userRole",
  "loggedIn",
  "isLoggedIn",
];

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Register = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  // Registration must never inherit the previous resident's session
  useEffect(() => {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.firstName.trim(),
          middle_name: formData.middleName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      console.log("Registration HTTP status:", response.status);

      const data = await response.json();
      console.log("Registration response:", data);

      if (data.success) {
        SESSION_KEYS.forEach((key) => localStorage.removeItem(key));

        alert("Registration successful! You can now login.");

        setFormData(emptyForm);
        setCurrentPage("login");
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
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

  const field = (label, name, type, placeholder, required, extra = {}) => (
    <div className="login-form-group" style={groupStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        required={required}
        style={inputStyle}
        {...extra}
      />
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-container">
          <img src="/logo.jpg" alt="Barangay Logo" className="login-logo" />
        </div>

        <h1>Barangay Portal</h1>
        <p className="login-subtitle">Resident Registration</p>

        <form onSubmit={handleRegister}>
          {field("First Name", "firstName", "text", "Enter your first name", true)}
          {field("Middle Name", "middleName", "text", "Enter your middle name", false)}
          {field("Last Name", "lastName", "text", "Enter your last name", true)}
          {field("Email", "email", "email", "Enter your email", true)}
          {field("Password", "password", "password", "Enter your password", true, { minLength: 6 })}
          {field("Confirm Password", "confirmPassword", "password", "Confirm your password", true, { minLength: 6 })}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <button
          type="button"
          className="register-button"
          onClick={() => setCurrentPage("login")}
        >
          ← Back to Login
        </button>

        <p className="login-info">Create your resident account</p>
      </div>
    </div>
  );
};

export default Register;
