import React, { useEffect, useState } from "react";
import "./App.css";

const Dashboard = ({ setCurrentPage }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
  const [totalRequests, setTotalRequests] = useState(0);
  const [pending, setPending] = useState(0);
  const [approved, setApproved] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Animated numbers
  useEffect(() => {
    let total = 0;
    let pendingValue = 0;
    let approvedValue = 0;

    const interval = setInterval(() => {
      if (total < 1) total++;
      if (approvedValue < 1) approvedValue++;

      setTotalRequests(total);
      setPending(pendingValue);
      setApproved(approvedValue);

      if (total >= 1 && approvedValue >= 1) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");

  setShowLogoutModal(false);

  setCurrentPage("login");
};

  return (
    <div className="dashboard-container">

      {/* Animated Background */}
      <div className="background-shape shape-one"></div>
      <div className="background-shape shape-two"></div>
      <div className="background-shape shape-three"></div>


      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="sidebar">

        {/* Logo */}
        <div className="logo-wrapper">
          <div className="logo-glow"></div>

          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="barangay-logo"
          />
        </div>

        <div className="sidebar-divider"></div>


        {/* Navigation */}
        <nav className="sidebar-menu">

          <a href="#" className="menu-item active">
            <span className="menu-icon">🏠</span>
            <span>Dashboard</span>
          </a>

          <a
          href="#"
          className="menu-item"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage("profile");
          }}
        >
          <span className="menu-icon">👥</span>
          <span>Profile</span>
        </a>

          <a
          href="#"
          className="menu-item"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage("documents");
          }}
        >
          <span className="menu-icon">📄</span>
          <span>Document Requests</span>
        </a>

        <a
          href="#"
          className="menu-item"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage("appointments");
          }}
        >
          <span className="menu-icon">🗓️</span>
          <span>Appointments</span>
        </a>
<a
  href="#"
  className="menu-item logout"
  onClick={(e) => {
    e.preventDefault();

    setShowLogoutModal(true);
  }}
>
  <span className="menu-icon">🚪</span>
  <span>Logout</span>
</a>
        </nav>


        {/* About */}
        <div className="about-us">
          <span>ℹ️</span>
          About Us
        </div>

      </aside>



      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="main-content">

        {/* ==========================================
            WELCOME
        ========================================== */}

        <div className="welcome-section">

          <div>
            <p className="welcome-small">
              BARANGAY RESIDENT PORTAL
            </p>

            <h1 className="welcome-title">
              Welcome, <span>test test</span>
              <span className="wave">👋</span>
            </h1>

            <p className="welcome-description">
              Here's what's happening in your barangay today.
            </p>
          </div>

          <div className="date-card">
            <span className="calendar-icon">📅</span>

            <div>
              <small>Today</small>
              <strong>{currentDate}</strong>
            </div>
          </div>

        </div>
        {/* ==========================================
            STATISTICS
        ========================================== */}
        <div className="statistics-container">

          {/* TOTAL */}
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
                  {pending}
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
                  {approved}
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

        </div>



        {/* ==========================================
            EVENTS SECTION
        ========================================== */}

        <section className="events-section">

          <div className="events-header">

            <div className="announcement-circle">
              📢
            </div>

            <div>
              <h2>
                Current Events & Announcements
              </h2>

              <p>
                Stay updated with the latest barangay activities
              </p>
            </div>

          </div>



          {/* EVENT GRID */}
          <div className="events-grid">


            {/* EVENT 1 */}
            <div className="event-card upcoming">

              <div className="event-card-top">

                <span className="event-badge blue">
                  Upcoming Event
                </span>

                <span className="event-arrow">
                  →
                </span>

              </div>

              <h3>
                🧹 Community Clean-Up Drive
              </h3>

              <p className="event-date">
                📅 <strong>July 30, 2026</strong>
              </p>

              <p>
                All residents are encouraged to participate in
                the monthly clean-up drive to help keep our
                barangay clean and environmentally friendly.
              </p>

              <div className="event-footer">
                <span>Community Activity</span>
                <span>→</span>
              </div>

            </div>



            {/* EVENT 2 */}
            <div className="event-card announcement">

              <div className="event-card-top">

                <span className="event-badge green">
                  Announcement
                </span>

                <span className="event-arrow">
                  →
                </span>

              </div>

              <h3>
                📄 Document Processing Schedule
              </h3>

              <p className="event-date">
                🕐 <strong>Monday - Friday</strong>
              </p>

              <p>
                Barangay document requests are processed from
                <strong> 8:00 AM to 5:00 PM.</strong> Residents
                are encouraged to book appointments online.
              </p>

              <div className="event-footer">
                <span>Important Notice</span>
                <span>→</span>
              </div>

            </div>



            {/* EVENT 3 */}
            <div className="event-card advisory">

              <div className="event-card-top">

                <span className="event-badge yellow">
                  Advisory
                </span>

                <span className="event-arrow">
                  →
                </span>

              </div>

              <h3>
                🩺 Free Medical Check-up
              </h3>

              <p className="event-date">
                📅 <strong>August 5, 2026</strong>
              </p>

              <p>
                Free medical consultation and blood pressure
                monitoring will be available for all residents
                at the Barangay Health Center.
              </p>

              <div className="event-footer">
                <span>Health Program</span>
                <span>→</span>
              </div>

            </div>



            {/* EVENT 4 */}
            <div className="event-card reminder">

              <div className="event-card-top">

                <span className="event-badge cyan">
                  Reminder
                </span>

                <span className="event-arrow">
                  →
                </span>

              </div>

              <h3>
                🗓️ Barangay Assembly
              </h3>

              <p className="event-date">
                📅 <strong>August 15, 2026</strong>
              </p>

              <p>
                All residents are invited to attend the Barangay
                Assembly to discuss upcoming community programs,
                projects, and concerns.
              </p>

              <div className="event-footer">
                <span>Barangay Meeting</span>
                <span>→</span>
              </div>

            </div>

          </div>

        </section>

      </main>
      {/* ================= LOGOUT VALIDATION MODAL ================= */}

{showLogoutModal && (
  <div className="logout-modal-overlay">

    <div className="logout-modal">

      <div className="logout-modal-icon">
        🚪
      </div>

      <h2>Logout Confirmation</h2>

      <p>
        Are you sure you want to logout?
      </p>

      <div className="logout-modal-actions">

        <button
          type="button"
          className="logout-cancel-button"
          onClick={() => setShowLogoutModal(false)}
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

export default Dashboard;