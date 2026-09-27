import React, { useEffect, useState } from "react";
import "../App.css";

const API_URL =
  "http://localhost/barangay-api/admin_document_requests.php";

const AdminDashboard = ({ setCurrentPage }) => {

  // =========================================================
  // STATE
  // =========================================================

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);


  // =========================================================
  // FETCH DOCUMENT REQUESTS
  // =========================================================

  const fetchRequests = async () => {

    try {

      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Server returned an error.");
      }

      const data = await response.json();

      console.log("Dashboard request data:", data);

      if (data.success) {

        setRequests(data.requests || []);

      } else {

        console.error(
          data.message || "Failed to load requests."
        );

        setRequests([]);

      }

    } catch (error) {

      console.error(
        "Error loading document requests:",
        error
      );

      setRequests([]);

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {

    fetchRequests();

  }, []);


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    localStorage.removeItem("loggedIn");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("residentId");
    localStorage.removeItem("currentPage");

    setShowLogoutModal(false);

    setCurrentPage("login");

  };


  // =========================================================
  // CURRENT DATE
  // =========================================================

  const currentDate =
    new Date().toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    );


  // =========================================================
  // STATISTICS
  // =========================================================

  const totalRequests =
    requests.length;

  const pendingRequests =
    requests.filter(
      (request) =>
        request.status?.toLowerCase() === "pending"
    ).length;

  const approvedRequests =
    requests.filter(
      (request) =>
        request.status?.toLowerCase() === "approved"
    ).length;

  const rejectedRequests =
    requests.filter(
      (request) =>
        request.status?.toLowerCase() === "rejected"
    ).length;


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="admin-dashboard-page">

      {/* =====================================================
          ANIMATED BACKGROUND
      ===================================================== */}

      <div className="background-shape shape-one"></div>
      <div className="background-shape shape-two"></div>
      <div className="background-shape shape-three"></div>


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        {/* LOGO */}

        <div className="logo-wrapper">

          <div className="logo-glow"></div>

          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="barangay-logo"
          />

        </div>


        <div className="sidebar-divider"></div>


        {/* ADMIN LABEL */}

        <div
          style={{
            textAlign: "center",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "20px",
            opacity: 0.8
          }}
        >
          ADMIN PORTAL
        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="sidebar-menu">

          {/* DASHBOARD */}

          <a
            href="#"
            className="menu-item active"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("admin-dashboard");

            }}
          >

            <span className="menu-icon">
              🏠
            </span>

            <span>
              Dashboard
            </span>

          </a>


          {/* DOCUMENT REQUESTS */}

          <a
            href="#"
            className="menu-item"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("admin-documents");

            }}
          >

            <span className="menu-icon">
              📄
            </span>

            <span>
              Document Requests
            </span>

          </a>


          {/* RESIDENTS */}

          <a
            href="#"
            className="menu-item"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("admin-residents");

            }}
          >

            <span className="menu-icon">
              👥
            </span>

            <span>
              Residents
            </span>

          </a>


          {/* APPOINTMENTS */}

          <a
            href="#"
            className="menu-item"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("admin-appointments");

            }}
          >

            <span className="menu-icon">
              🗓️
            </span>

            <span>
              Appointments
            </span>

          </a>

                    {/* REPORT */}

          <a
            href="#"
            className="menu-item"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("admin-incidents");

            }}
          >

            <span className="menu-icon">
              🗓️
            </span>

            <span>
              Incident Report
            </span>

          </a>


          {/* LOGOUT */}

          <a
            href="#"
            className="menu-item logout"
            onClick={(e) => {

              e.preventDefault();

              setShowLogoutModal(true);

            }}
          >

            <span className="menu-icon">
              🚪
            </span>

            <span>
              Logout
            </span>

          </a>

<br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
          {/* ABOUT */}

          <a
            href="#"
            className="admin-about-us"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("adminabout");

            }}
          >

            <span>
              ℹ️
            </span>

            About Us

          </a>

        </nav>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-content">


        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="welcome-section">

          <div>

            <p className="welcome-small">
              BARANGAY ADMIN PORTAL
            </p>

            <h1 className="welcome-title">

              Admin Dashboard

              <span className="wave">
                👋
              </span>

            </h1>

            <p className="welcome-description">

              Manage resident requests and
              barangay services.

            </p>

          </div>


          {/* DATE */}

          <div className="date-card">

            <span className="calendar-icon">
              📅
            </span>

            <div>

              <small>
                Today
              </small>

              <strong>
                {currentDate}
              </strong>

            </div>

          </div>

        </div>


        {/* ===================================================
            STATISTICS
        =================================================== */}

        {loading ? (

          <div
            style={{
              textAlign: "center",
              padding: "30px"
            }}
          >

            Loading dashboard statistics...

          </div>

        ) : (

          <div className="statistics-container">


            {/* TOTAL REQUESTS */}

            <div className="stat-card total-card">

              <div className="stat-top">

                <div>

                  <p className="stat-label">
                    TOTAL REQUESTS
                  </p>

                  <h2>
                    {totalRequests}
                  </h2>

                </div>

                <div className="stat-icon">
                  📋
                </div>

              </div>


              <div className="stat-bottom">

                <span className="stat-status">
                  ↑ Active
                </span>

                <span>
                  All requests
                </span>

              </div>

            </div>


            {/* PENDING */}

            <div className="stat-card pending-card">

              <div className="stat-top">

                <div>

                  <p className="stat-label">
                    PENDING
                  </p>

                  <h2>
                    {pendingRequests}
                  </h2>

                </div>

                <div className="stat-icon">
                  ⏳
                </div>

              </div>


              <div className="stat-bottom">

                <span className="stat-status">
                  ● Waiting
                </span>

                <span>
                  For processing
                </span>

              </div>

            </div>


            {/* APPROVED */}

            <div className="stat-card approved-card">

              <div className="stat-top">

                <div>

                  <p className="stat-label">
                    APPROVED
                  </p>

                  <h2>
                    {approvedRequests}
                  </h2>

                </div>

                <div className="stat-icon">
                  ✓
                </div>

              </div>


              <div className="stat-bottom">

                <span className="stat-status">
                  ✓ Completed
                </span>

                <span>
                  Approved requests
                </span>

              </div>

            </div>


            {/* REJECTED */}

            <div className="stat-card rejected-card">

              <div className="stat-top">

                <div>

                  <p className="stat-label">
                    REJECTED
                  </p>

                  <h2>
                    {rejectedRequests}
                  </h2>

                </div>

                <div className="stat-icon">
                  ✕
                </div>

              </div>


              <div className="stat-bottom">

                <span className="stat-status">
                  ✕ Rejected
                </span>

                <span>
                  Rejected requests
                </span>

              </div>

            </div>


          </div>

        )}


        {/* ===================================================
            DASHBOARD INFORMATION
        =================================================== */}

        <section className="events-section">

          <div className="events-header">

            <div className="announcement-circle">
              📊
            </div>

            <div>

              <h2>
                Barangay Management Overview
              </h2>

              <p>
                Monitor resident services and manage
                barangay operations from the admin portal.
              </p>

            </div>

          </div>


          {/* =================================================
              QUICK ACCESS
          ================================================= */}

          <div className="events-grid">


            {/* DOCUMENT REQUESTS */}

            <div
              className="event-card"
              onClick={() =>
                setCurrentPage("admin-documents")
              }
              style={{
                cursor: "pointer"
              }}
            >

              <div className="event-card-top">

                <span className="event-badge blue">
                  Document Services
                </span>

                <span className="event-arrow">
                  →
                </span>

              </div>


              <h3>
                📄 Document Requests
              </h3>


              <p>
                Review, approve, or reject document
                requests submitted by residents.
              </p>


              <div className="event-footer">

                <span>
                  {pendingRequests} pending
                </span>

                <span>
                  Manage →
                </span>

              </div>

            </div>


            {/* RESIDENTS */}

            <div
              className="event-card"
              onClick={() =>
                setCurrentPage("admin-residents")
              }
              style={{
                cursor: "pointer"
              }}
            >

              <div className="event-card-top">

                <span className="event-badge green">
                  Residents
                </span>

                <span className="event-arrow">
                  →
                </span>

              </div>


              <h3>
                👥 Resident Management
              </h3>


              <p>
                View and manage registered barangay
                residents.
              </p>


              <div className="event-footer">

                <span>
                  Resident Records
                </span>

                <span>
                  Manage →
                </span>

              </div>

            </div>


            {/* APPOINTMENTS */}

            <div
              className="event-card"
              onClick={() =>
                setCurrentPage("admin-appointments")
              }
              style={{
                cursor: "pointer"
              }}
            >

              <div className="event-card-top">

                <span className="event-badge yellow">
                  Appointments
                </span>

                <span className="event-arrow">
                  →
                </span>

              </div>


              <h3>
                🗓️ Appointments
              </h3>


              <p>
                Monitor resident appointments and
                barangay service schedules.
              </p>


              <div className="event-footer">

                <span>
                  Appointment Schedule
                </span>

                <span>
                  Manage →
                </span>

              </div>

            </div>


          </div>

        </section>


      </main>


      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}

      {showLogoutModal && (

        <div className="logout-modal-overlay">

          <div className="logout-modal">

            <div className="logout-modal-icon">
              🚪
            </div>

            <h2>
              Logout Confirmation
            </h2>

            <p>
              Are you sure you want to logout?
            </p>

            <div className="logout-modal-actions">

              <button
                type="button"
                className="logout-cancel-button"
                onClick={() =>
                  setShowLogoutModal(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-button"
                onClick={handleLogout}
              >
                Yes, Logout
              </button>

            </div>

          </div>

        </div>

      )}


    </div>

  );

};


export default AdminDashboard;