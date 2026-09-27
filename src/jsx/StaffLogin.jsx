import React, { useState } from "react";
import "../Login.css";

const StaffLogin = ({ setCurrentPage }) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStaffLogin = async (e) => {

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

      const response = await fetch(
        "http://localhost/barangay-api/staff_login.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },

          body: JSON.stringify({
            email: loginEmail,
            password: password
          })
        }
      );

      const responseText = await response.text();

      console.log("STAFF LOGIN RESPONSE:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {

        console.error(
          "STAFF LOGIN JSON ERROR:",
          error
        );

        throw new Error(
          "Staff login API returned invalid JSON."
        );
      }

      console.log("STAFF LOGIN DATA:", data);

      if (!response.ok || !data.success) {

        alert(
          data.message ||
          "Invalid staff email or password."
        );

        return;
      }

      if (!data.user) {

        alert(
          "Staff login error: Staff information was not returned."
        );

        return;
      }

      /*
       * ==========================================
       * CLEAR OLD LOGIN SESSION
       * ==========================================
       */

      localStorage.removeItem("residentId");
      localStorage.removeItem("residentName");

      localStorage.removeItem("staffId");
      localStorage.removeItem("staffName");
      localStorage.removeItem("staff_name");

      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");

      localStorage.removeItem("loggedIn");
      localStorage.removeItem("isLoggedIn");


      /*
       * ==========================================
       * STAFF ID
       * ==========================================
       */

      const staffId =
        data.user.id ||
        data.staff_id;

      if (!staffId) {

        alert(
          "Staff login error: Staff ID was not returned."
        );

        return;
      }


      /*
       * ==========================================
       * STAFF NAME
       * ==========================================
       */

      const staffName = [
        data.user.first_name,
        data.user.middle_name,
        data.user.last_name
      ]
        .filter(Boolean)
        .join(" ");


      /*
       * ==========================================
       * SAVE STAFF SESSION
       * ==========================================
       */

      localStorage.setItem(
        "staffId",
        String(staffId)
      );

      localStorage.setItem(
        "staffName",
        staffName || "Staff"
      );

      localStorage.setItem(
        "userEmail",
        data.user.email || loginEmail
      );

      localStorage.setItem(
        "userRole",
        "staff"
      );

      localStorage.setItem(
        "loggedIn",
        "true"
      );

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );


      /*
       * ==========================================
       * DEBUG
       * ==========================================
       */

      console.log("==============================");
      console.log("STAFF LOGIN SUCCESSFUL");
      console.log(
        "Staff ID:",
        localStorage.getItem("staffId")
      );

      console.log(
        "Staff Name:",
        localStorage.getItem("staffName")
      );

      console.log(
        "Staff Email:",
        localStorage.getItem("userEmail")
      );

      console.log(
        "Role:",
        localStorage.getItem("userRole")
      );

      console.log(
        "Logged In:",
        localStorage.getItem("loggedIn")
      );

      console.log("==============================");


      /*
       * ==========================================
       * CLEAR FORM
       * ==========================================
       */

      setEmail("");
      setPassword("");


      /*
       * ==========================================
       * IMPORTANT
       * ==========================================
       *
       * THIS MUST BE:
       *
       * "staff-dashboard"
       *
       * NOT:
       *
       * "dashboard"
       * "admin-dashboard"
       *
       */

      setCurrentPage("staff-dashboard");

    } catch (error) {

      console.error(
        "STAFF LOGIN ERROR:",
        error
      );

      alert(
        error.message ||
        "Unable to connect to the server. Make sure XAMPP Apache and MySQL are running."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo-wrapper">

          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="login-logo"
          />

        </div>

        <h1>
          Barangay Portal
        </h1>

        <p className="login-subtitle">
          Staff Login
        </p>

        <form onSubmit={handleStaffLogin}>

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter staff email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              disabled={loading}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter staff password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              disabled={loading}
              required
            />

          </div>


          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login as Staff"}

          </button>

        </form>


        <button
          type="button"
          className="register-button"
          onClick={() =>
            setCurrentPage("admin-login")
          }
          disabled={loading}
        >
          ← Back
        </button>


        <p className="login-footer">
          Barangay Staff Portal
        </p>

      </div>

    </div>
  );
};

export default StaffLogin;