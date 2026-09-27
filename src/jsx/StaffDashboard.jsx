import React, { useEffect, useState } from "react";
import "../App.css";

const StaffDashboard = ({ setCurrentPage }) => {
  const [staffName, setStaffName] = useState("Staff");

  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const API_BASE = "http://localhost/barangay-api";

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  useEffect(() => {
    loadStaffDashboard();
  }, []);

  const loadStaffDashboard = async () => {
    setLoading(true);

    /* =======================================================
       STAFF NAME
    ======================================================= */

    const storedStaffName =
      localStorage.getItem("staffName") ||
      localStorage.getItem("staff_name") ||
      localStorage.getItem("userName") ||
      localStorage.getItem("username");

    setStaffName(storedStaffName || "Staff");


    /* =======================================================
       DASHBOARD API
       
       The API is still called so the dashboard can continue
       loading normally, but the old statistics are no longer
       displayed.
    ======================================================= */

    try {
      const response = await fetch(
        `${API_BASE}/staff_dashboard_stats.php`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load dashboard information."
        );
      }

      await response.json();

    } catch (error) {
      console.warn(
        "Staff dashboard API:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navigate = (page) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
  };


  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {

    localStorage.removeItem("staffId");
    localStorage.removeItem("staffName");
    localStorage.removeItem("staff_name");
    localStorage.removeItem("userName");
    localStorage.removeItem("username");

    /*
      Important:
      Remove the saved page so the next login does not
      automatically return to Staff Dashboard.
    */

    localStorage.removeItem("currentPage");

    setShowLogoutModal(false);

    navigate("login");
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="staff-dashboard">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="staff-sidebar">


        {/* ===================================================
            LOGO
        =================================================== */}

        <div className="staff-logo-wrapper">

          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="staff-logo"
          />

        </div>


        {/* ===================================================
            DIVIDER
        =================================================== */}

        <div className="staff-sidebar-divider"></div>


        {/* ===================================================
            PORTAL LABEL
        =================================================== */}

        <div className="staff-portal-label">
          STAFF PORTAL
        </div>


        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="staff-menu">


          {/* =================================================
              DASHBOARD
          ================================================= */}

          <a
            href="#"
            className="staff-menu-item active"
            onClick={(e) => {

              e.preventDefault();

              navigate(
                "staff-dashboard"
              );

            }}
          >

            <span className="staff-menu-icon">
              🏠
            </span>

            <span>
              Dashboard
            </span>

          </a>


          {/* =================================================
              DOCUMENT REQUESTS
          ================================================= */}

          <a
            href="#"
            className="staff-menu-item"
            onClick={(e) => {

              e.preventDefault();

              navigate(
                "staff-documents"
              );

            }}
          >

            <span className="staff-menu-icon">
              📄
            </span>

            <span>
              Document Requests
            </span>

          </a>


          {/* =================================================
              RESIDENTS
          ================================================= */}

          <a
            href="#"
            className="staff-menu-item"
            onClick={(e) => {

              e.preventDefault();

              navigate(
                "staff-residents"
              );

            }}
          >

            <span className="staff-menu-icon">
              👥
            </span>

            <span>
              Residents
            </span>

          </a>


          {/* =================================================
              APPOINTMENTS
          ================================================= */}

          <a
            href="#"
            className="staff-menu-item"
            onClick={(e) => {

              e.preventDefault();

              navigate(
                "staff-appointments"
              );

            }}
          >

            <span className="staff-menu-icon">
              🗓️
            </span>

            <span>
              Appointments
            </span>

          </a>


          {/* =================================================
              PREDICTIVE ANALYTICS
          ================================================= */}

          <a
            href="#"
            className="staff-menu-item"
            onClick={(e) => {

              e.preventDefault();

              navigate(
                "staff-predictive-analytics"
              );

            }}
          >

            <span className="staff-menu-icon">
              📊
            </span>

            <span>
              Predictive Analytics
            </span>

          </a>


          {/* =================================================
              LOGOUT
          ================================================= */}

          <a
            href="#"
            className="staff-menu-item logout"
            onClick={(e) => {

              e.preventDefault();

              setShowLogoutModal(true);

            }}
          >

            <span className="staff-menu-icon">
              🚪
            </span>

            <span>
              Logout
            </span>

          </a>

        </nav>


        {/* ===================================================
            SIDEBAR FOOTER
        =================================================== */}

        <div className="staff-sidebar-footer">

          Barangay Management System

          <br />

          Staff Portal

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="staff-main">


        {/* ===================================================
            TOP BAR
        =================================================== */}

        <div className="staff-topbar">

          <button
            type="button"
            className="staff-refresh-button"
            onClick={loadStaffDashboard}
            disabled={loading}
          >

            {loading
              ? "⏳ Loading..."
              : "🔄 Refresh"}

          </button>

        </div>


        {/* ===================================================
            WELCOME SECTION
        =================================================== */}

        <section className="staff-welcome">


          {/* =================================================
              WELCOME TEXT
          ================================================= */}

          <div className="staff-welcome-text">

            <p className="staff-welcome-label">
              BARANGAY STAFF PORTAL
            </p>

            <h1>
              Welcome, {staffName}! 👋
            </h1>

            <p className="staff-welcome-description">

              Here's what's happening in your
              barangay today.

            </p>

          </div>


          {/* =================================================
              DATE
          ================================================= */}

          <div className="staff-date-card">

            <div className="staff-date-icon">
              📅
            </div>

            <div className="staff-date-content">

              <span>
                Today
              </span>

              <strong>
                {currentDate}
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section className="staff-section">


          <div className="staff-section-header">

            <div className="staff-section-icon">
              📢
            </div>

            <div>

              <h2>
                Staff Quick Actions
              </h2>

              <p>
                Quickly access your most commonly
                used staff functions
              </p>

            </div>

          </div>


          <div className="staff-actions">


            {/* =================================================
                DOCUMENT REQUESTS
            ================================================= */}

            <button
              type="button"
              className="staff-action-card"
              onClick={() =>
                navigate(
                  "staff-documents"
                )
              }
            >

              <div className="staff-action-icon blue">
                📄
              </div>

              <div className="staff-action-content">

                <strong>
                  Document Requests
                </strong>

                <span>
                  Review and process resident
                  document requests.
                </span>

              </div>

            </button>


            {/* =================================================
                APPOINTMENTS
            ================================================= */}

            <button
              type="button"
              className="staff-action-card"
              onClick={() =>
                navigate(
                  "staff-appointments"
                )
              }
            >

              <div className="staff-action-icon green">
                🗓️
              </div>

              <div className="staff-action-content">

                <strong>
                  Appointments
                </strong>

                <span>
                  View and manage resident
                  appointments.
                </span>

              </div>

            </button>


            {/* =================================================
                RESIDENTS
            ================================================= */}

            <button
              type="button"
              className="staff-action-card"
              onClick={() =>
                navigate(
                  "staff-residents"
                )
              }
            >

              <div className="staff-action-icon orange">
                👥
              </div>

              <div className="staff-action-content">

                <strong>
                  Residents
                </strong>

                <span>
                  Search and view resident
                  information.
                </span>

              </div>

            </button>


            {/* =================================================
                PREDICTIVE ANALYTICS
            ================================================= */}

            <button
              type="button"
              className="staff-action-card"
              onClick={() =>
                navigate(
                  "staff-predictive-analytics"
                )
              }
            >

              <div className="staff-action-icon purple">
                📊
              </div>

              <div className="staff-action-content">

                <strong>
                  Predictive Analytics
                </strong>

                <span>
                  View barangay trends and
                  predictions.
                </span>

              </div>

            </button>

          </div>

        </section>


        {/* ===================================================
            STAFF WORKSPACE
        =================================================== */}

        <section className="staff-section">


          <div className="staff-section-header">

            <div className="staff-section-icon">
              🏛️
            </div>

            <div>

              <h2>
                Staff Workspace
              </h2>

              <p>
                Manage barangay operations from
                your staff portal
              </p>

            </div>

          </div>


          <div className="staff-workspace">


            {/* =================================================
                BARANGAY SERVICES
            ================================================= */}

            <div className="staff-workspace-card">

              <div className="staff-workspace-icon">
                🏛️
              </div>

              <strong>
                Barangay Services
              </strong>

              <span>
                Process and monitor resident
                service requests.
              </span>

            </div>


            {/* =================================================
                REQUEST MANAGEMENT
            ================================================= */}

            <div className="staff-workspace-card">

              <div className="staff-workspace-icon">
                📋
              </div>

              <strong>
                Request Management
              </strong>

              <span>
                Review pending requests and
                update their status.
              </span>

            </div>


            {/* =================================================
                ANALYTICS
            ================================================= */}

            <div className="staff-workspace-card">

              <div className="staff-workspace-icon">
                📈
              </div>

              <strong>
                Analytics
              </strong>

              <span>
                Monitor trends and barangay
                activity through analytics.
              </span>

            </div>

          </div>

        </section>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="staff-footer">

          Barangay Management System
          {" • "}
          Staff Portal

        </div>

      </main>


      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}

      {showLogoutModal && (

        <div
          className="staff-logout-overlay"
          onClick={() =>
            setShowLogoutModal(false)
          }
        >

          <div
            className="staff-logout-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="staff-logout-icon">
              🚪
            </div>

            <h2>
              Logout
            </h2>

            <p>
              Are you sure you want to logout
              from the Staff Portal?
            </p>

            <div className="staff-logout-buttons">

              <button
                type="button"
                className="staff-cancel-button"
                onClick={() =>
                  setShowLogoutModal(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="staff-confirm-logout"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default StaffDashboard;