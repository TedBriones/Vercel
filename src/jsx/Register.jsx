import React, { useEffect, useState } from "react";
import "../App.css";

const Register = ({ setCurrentPage }) => {

  // =====================================================
  // FORM STATE
  // =====================================================

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  // =====================================================
  // CLEAR OLD RESIDENT SESSION
  // =====================================================

  useEffect(() => {

    /*
     * IMPORTANT:
     * Registration must never inherit the previous
     * resident's session.
     */

    localStorage.removeItem("residentId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("isLoggedIn");

  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

  };

  // =====================================================
  // HANDLE REGISTER
  // =====================================================

  const handleRegister = async (e) => {

    e.preventDefault();

    // =================================================
    // VALIDATE PASSWORD
    // =================================================

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

      console.log("=================================");
      console.log("REGISTERING NEW RESIDENT");
      console.log("=================================");

      console.log(
        "Name:",
        formData.firstName,
        formData.middleName,
        formData.lastName
      );

      console.log(
        "Email:",
        formData.email
      );

      // =================================================
      // SEND REGISTRATION REQUEST
      // =================================================

      const response = await fetch(
        "http://localhost/barangay-api/register.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            firstName: formData.firstName,
            middleName: formData.middleName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password

          })
        }
      );

      console.log(
        "Registration HTTP status:",
        response.status
      );

      // =================================================
      // GET RESPONSE
      // =================================================

      const data = await response.json();

      console.log(
        "Registration response:",
        data
      );

      // =================================================
      // SUCCESS
      // =================================================

      if (data.success) {

        console.log(
          "NEW RESIDENT CREATED"
        );

        console.log(
          "NEW RESIDENT ID:",
          data.resident_id
        );

        /*
         * IMPORTANT:
         *
         * DO NOT save residentId here.
         *
         * Login is responsible for creating
         * the active resident session.
         */

        // Make absolutely sure no previous
        // resident session remains.

        localStorage.removeItem("residentId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("isLoggedIn");

        alert(
          "Registration successful! You can now login."
        );

        // =================================================
        // CLEAR FORM
        // =================================================

        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: ""
        });

        // =================================================
        // GO TO LOGIN
        // =================================================

        setCurrentPage("login");

      } else {

        alert(
          data.message ||
          "Registration failed."
        );

      }

    } catch (error) {

      console.error(
        "Registration error:",
        error
      );

      alert(
        "Unable to connect to the server. Please make sure XAMPP Apache and MySQL are running."
      );

    } finally {

      setLoading(false);

    }

  };

  // =====================================================
  // BACK TO LOGIN
  // =====================================================

  const handleBackToLogin = () => {

    setCurrentPage("login");

  };

  // =====================================================
  // INLINE STYLES
  // (forces the same stacked layout as the Login page,
  //  regardless of any shared/legacy CSS rules)
  // =====================================================

  const groupStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginBottom: "1rem",
    textAlign: "left"
  };

  const labelStyle = {
    display: "block",
    fontWeight: 600,
    marginBottom: "0.4rem"
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "0.6rem 0.75rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "1rem"
  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="login-page">

      <div className="login-card">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="login-logo-container">

          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="login-logo"
          />

        </div>


        {/* =================================================
            TITLE
        ================================================= */}

        <h1>
          Barangay Portal
        </h1>

        <p className="login-subtitle">
          Resident Registration
        </p>


        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleRegister}>

          {/* FIRST NAME */}

          <div className="login-form-group" style={groupStyle}>

            <label style={labelStyle}>
              First Name
            </label>

            <input
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={inputStyle}
            />

          </div>


          {/* MIDDLE NAME */}

          <div className="login-form-group" style={groupStyle}>

            <label style={labelStyle}>
              Middle Name
            </label>

            <input
              type="text"
              name="middleName"
              placeholder="Enter your middle name"
              value={formData.middleName}
              onChange={handleChange}
              style={inputStyle}
            />

          </div>


          {/* LAST NAME */}

          <div className="login-form-group" style={groupStyle}>

            <label style={labelStyle}>
              Last Name
            </label>

            <input
              type="text"
              name="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={inputStyle}
            />

          </div>


          {/* EMAIL */}

          <div className="login-form-group" style={groupStyle}>

            <label style={labelStyle}>
              Email
            </label>

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


          {/* PASSWORD */}

          <div className="login-form-group" style={groupStyle}>

            <label style={labelStyle}>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              style={inputStyle}
            />

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="login-form-group" style={groupStyle}>

            <label style={labelStyle}>
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              style={inputStyle}
            />

          </div>


          {/* REGISTER BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            {loading
              ? "Registering..."
              : "Register"}

          </button>

        </form>


        {/* =================================================
            BACK TO LOGIN
        ================================================= */}

        <button
          type="button"
          className="register-button"
          onClick={handleBackToLogin}
        >

          ← Back to Login

        </button>


        <p className="login-info">
          Create your resident account
        </p>

      </div>

    </div>

  );

};

export default Register;