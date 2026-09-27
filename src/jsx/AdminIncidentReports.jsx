import React, { useEffect, useRef, useState } from "react";
import "../App.css";

const LIST_URL = "http://localhost/barangay-api/admin_incident_reports.php";
const POLL_URL = (afterId) =>
  `${LIST_URL}?after_id=${encodeURIComponent(afterId)}`;

const LAST_SEEN_KEY = "incidentReports_lastSeenId";
const POLL_INTERVAL_MS = 15000; // check for new reports every 15s

const SEVERITY_COLORS = {
  "Low / Minor": { bg: "#e6f4ea", text: "#1e7e34" },
  "Moderate": { bg: "#fff8e1", text: "#b98900" },
  "High / Major": { bg: "#ffe9e0", text: "#c04a1f" },
  "Critical / Fatal": { bg: "#fde2e2", text: "#c0271f" },
};

const AdminIncidentReports = ({ setCurrentPage }) => {

  // =========================================================
  // STATE
  // =========================================================

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);

  const [notifications, setNotifications] = useState([]); // new reports not yet seen
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const lastSeenIdRef = useRef(
    parseInt(localStorage.getItem(LAST_SEEN_KEY) || "0", 10)
  );

  // =========================================================
  // FETCH — initial full load
  // =========================================================

  const fetchReports = async () => {
    try {
      setLoading(true);

      const response = await fetch(LIST_URL);
      if (!response.ok) throw new Error("Server returned an error.");

      const data = await response.json();

      if (data.success) {
        setReports(data.requests || data.reports || []);

        // On first load, if nothing has been "seen" yet, treat the
        // current latest report as already seen (avoids a flood of
        // notifications for reports that already existed).
        if (lastSeenIdRef.current === 0 && data.latestId) {
          lastSeenIdRef.current = data.latestId;
          localStorage.setItem(LAST_SEEN_KEY, String(data.latestId));
        }
      } else {
        console.error(data.message || "Failed to load incident reports.");
        setReports([]);
      }
    } catch (error) {
      console.error("Error loading incident reports:", error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // POLL — check for reports newer than the last one we've seen
  // =========================================================

  const pollForNewReports = async () => {
    try {
      const response = await fetch(POLL_URL(lastSeenIdRef.current));
      if (!response.ok) return;

      const data = await response.json();
      if (!data.success) return;

      const newOnes = data.reports || [];
      if (newOnes.length === 0) return;

      // Add to the visible list
      setReports((prev) => [...newOnes.slice().reverse(), ...prev]);

      // Add to the unread notification tray
      setNotifications((prev) => [...newOnes.slice().reverse(), ...prev]);

      // Desktop notification, if the browser/user allows it
      if (typeof Notification !== "undefined") {
        newOnes.forEach((report) => {
          if (Notification.permission === "granted") {
            new Notification("New Incident Report", {
              body: `${report.incidentSeverity} — ${report.facility || "Unspecified location"}`,
              icon: "/logo.jpg",
            });
          }
        });
      }

      if (data.latestId) {
        lastSeenIdRef.current = data.latestId;
        localStorage.setItem(LAST_SEEN_KEY, String(data.latestId));
      }
    } catch (error) {
      console.error("Error polling for new incident reports:", error);
    }
  };

  // =========================================================
  // LOAD DATA + START POLLING
  // =========================================================

  useEffect(() => {
    fetchReports();

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    const interval = setInterval(pollForNewReports, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // NOTIFICATION HELPERS
  // =========================================================

  const unreadCount = notifications.length;

  const handleOpenNotifDropdown = () => {
    setShowNotifDropdown((prev) => !prev);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setShowNotifDropdown(false);
  };

  const handleNotificationClick = (report) => {
    setSelectedReport(report);
    setNotifications((prev) => prev.filter((r) => r.id !== report.id));
    setShowNotifDropdown(false);
  };

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
  // STATS
  // =========================================================

  const totalReports = reports.length;
  const criticalReports = reports.filter(
    (r) => r.incidentSeverity === "Critical / Fatal"
  ).length;
  const highReports = reports.filter(
    (r) => r.incidentSeverity === "High / Major"
  ).length;

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-dashboard-page">

      <div className="background-shape shape-one"></div>
      <div className="background-shape shape-two"></div>
      <div className="background-shape shape-three"></div>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        <div className="logo-wrapper">
          <div className="logo-glow"></div>
          <img src="/logo.jpg" alt="Barangay Logo" className="barangay-logo" />
        </div>

        <div className="sidebar-divider"></div>

        <div
          style={{
            textAlign: "center",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "20px",
            opacity: 0.8,
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
            className="menu-item"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("admin-dashboard");
            }}
          >
            <span className="menu-icon">🏠</span>
            <span>Dashboard</span>
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
            <span className="menu-icon">📄</span>
            <span>Document Requests</span>
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
            <span className="menu-icon">👥</span>
            <span>Residents</span>
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
            <span className="menu-icon">🗓️</span>
            <span>Appointments</span>
          </a>

          {/* REPORT */}

          <a
            href="#"
            className="menu-item active"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("admin-incidents");
            }}
          >
            <span className="menu-icon">🚨</span>
            <span>Incident Report</span>
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
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
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
            <span>ℹ️</span>
            About Us
          </a>

        </nav>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-content">

        {/* HEADER + NOTIFICATION BELL */}

        <div className="welcome-section">
          <div>
            <p className="welcome-small">BARANGAY ADMIN PORTAL</p>
            <h1 className="welcome-title">Incident Reports</h1>
            <p className="welcome-description">
              Review accident and incident reports submitted by residents.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

            {/* NOTIFICATION BELL */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={handleOpenNotifDropdown}
                style={{
                  position: "relative",
                  background: "#ffffff",
                  border: "1px solid #e2e2e2",
                  borderRadius: "50%",
                  width: "44px",
                  height: "44px",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
                aria-label="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      background: "#e0342c",
                      color: "#fff",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 6px",
                      minWidth: "18px",
                      textAlign: "center",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "52px",
                    width: "320px",
                    background: "#fff",
                    border: "1px solid #e2e2e2",
                    borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 50,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 14px",
                      borderBottom: "1px solid #f0f0f0",
                      fontWeight: 600,
                    }}
                  >
                    <span>New Incident Reports</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleClearNotifications}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#0b6ecf",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                    {unreadCount === 0 ? (
                      <div style={{ padding: "16px", color: "#888", fontSize: "13px" }}>
                        No new reports.
                      </div>
                    ) : (
                      notifications.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => handleNotificationClick(r)}
                          style={{
                            padding: "10px 14px",
                            borderBottom: "1px solid #f5f5f5",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>
                            {r.incidentSeverity} — {r.facility || "Unspecified location"}
                          </div>
                          <div style={{ fontSize: "12px", color: "#888" }}>
                            {r.incidentDateTime}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DATE */}
            <div className="date-card">
              <span className="calendar-icon">📅</span>
              <div>
                <small>Today</small>
                <strong>{currentDate}</strong>
              </div>
            </div>

          </div>
        </div>

        {/* STATS */}

        {loading ? (
          <div style={{ textAlign: "center", padding: "30px" }}>
            Loading incident reports...
          </div>
        ) : (
          <div className="statistics-container">
            <div className="stat-card total-card">
              <div className="stat-top">
                <div>
                  <p className="stat-label">TOTAL REPORTS</p>
                  <h2>{totalReports}</h2>
                </div>
                <div className="stat-icon">📋</div>
              </div>
              <div className="stat-bottom">
                <span className="stat-status">↑ Active</span>
                <span>All incident reports</span>
              </div>
            </div>

            <div className="stat-card pending-card">
              <div className="stat-top">
                <div>
                  <p className="stat-label">HIGH / MAJOR</p>
                  <h2>{highReports}</h2>
                </div>
                <div className="stat-icon">⚠️</div>
              </div>
              <div className="stat-bottom">
                <span className="stat-status">● Review</span>
                <span>Needs attention</span>
              </div>
            </div>

            <div className="stat-card rejected-card">
              <div className="stat-top">
                <div>
                  <p className="stat-label">CRITICAL / FATAL</p>
                  <h2>{criticalReports}</h2>
                </div>
                <div className="stat-icon">🚨</div>
              </div>
              <div className="stat-bottom">
                <span className="stat-status">✕ Urgent</span>
                <span>Immediate action</span>
              </div>
            </div>
          </div>
        )}

        {/* REPORTS TABLE */}

        <section className="events-section">
          <div className="events-header">
            <div className="announcement-circle">🚨</div>
            <div>
              <h2>All Incident Reports</h2>
              <p>Click a row to see the full details of a report.</p>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                  <th style={{ padding: "10px" }}>Date / Time</th>
                  <th style={{ padding: "10px" }}>Severity</th>
                  <th style={{ padding: "10px" }}>Facility</th>
                  <th style={{ padding: "10px" }}>Reporter</th>
                  <th style={{ padding: "10px" }}>Medical Attention</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                      No incident reports yet.
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => {
                    const colors = SEVERITY_COLORS[r.incidentSeverity] || {
                      bg: "#f0f0f0",
                      text: "#555",
                    };
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedReport(r)}
                        style={{ borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}
                      >
                        <td style={{ padding: "10px" }}>{r.incidentDateTime}</td>
                        <td style={{ padding: "10px" }}>
                          <span
                            style={{
                              background: colors.bg,
                              color: colors.text,
                              borderRadius: "999px",
                              padding: "4px 10px",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            {r.incidentSeverity}
                          </span>
                        </td>
                        <td style={{ padding: "10px" }}>{r.facility || "—"}</td>
                        <td style={{ padding: "10px" }}>{r.reporterName}</td>
                        <td style={{ padding: "10px" }}>{r.medicalAttention}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* =====================================================
          REPORT DETAIL MODAL
      ===================================================== */}

      {selectedReport && (
        <div className="logout-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div
            className="logout-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: "left", maxWidth: "520px", width: "90%" }}
          >
            <h2>Incident Report #{selectedReport.id}</h2>

            <p><strong>Date / Time:</strong> {selectedReport.incidentDateTime}</p>
            <p><strong>Severity:</strong> {selectedReport.incidentSeverity}</p>
            <p><strong>Type(s):</strong> {(selectedReport.incidentTypes || []).join(", ") || "—"}</p>
            <p><strong>Description:</strong> {selectedReport.description || "—"}</p>

            <p><strong>Facility:</strong> {selectedReport.facility || "—"}</p>
            <p><strong>Location:</strong> {selectedReport.location || "—"}</p>
            <p><strong>Address:</strong> {selectedReport.address || "—"}</p>
            <p><strong>City/State:</strong> {selectedReport.cityState || "—"}</p>

            <p><strong>Persons Involved:</strong> {selectedReport.personsInvolved || "—"}</p>
            <p><strong>Witnesses:</strong> {selectedReport.witnesses || "—"}</p>
            <p><strong>Medical Attention:</strong> {selectedReport.medicalAttention}</p>

            <p><strong>Reporter:</strong> {selectedReport.reporterName} ({selectedReport.reporterRole || "—"})</p>
            <p><strong>Email:</strong> {selectedReport.reporterEmail}</p>
            <p><strong>Phone:</strong> {selectedReport.reporterPhone || "—"}</p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-button"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}

      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-icon">🚪</div>
            <h2>Logout Confirmation</h2>
            <p>Are you sure you want to logout?</p>

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

export default AdminIncidentReports;