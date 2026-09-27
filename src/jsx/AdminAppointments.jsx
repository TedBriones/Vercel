import React, { useEffect, useMemo, useState } from "react";
import "../App.css";
import AdminPredictiveAnalyticsModal
  from "./modal/AdminPredictiveAnalyticsModal";
import LogoutModal from "./modal/LogoutModal";

const APPOINTMENTS_API =
  "http://localhost/barangay-api/admin_appointments.php";

const AdminAppointments = ({ setCurrentPage }) => {

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPredictiveAnalytics, setShowPredictiveAnalytics] =
  useState(false);

  const handleLogout = () => {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");

  setCurrentPage("admin-login");
};

  // =========================================================
  // FETCH ALL APPOINTMENTS
  // =========================================================

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching admin appointments...");

        const response = await fetch(APPOINTMENTS_API, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const responseText = await response.text();

        console.log("Admin appointment response:", responseText);

        let data;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          throw new Error(
            "Appointment API returned invalid JSON."
          );
        }

        console.log("Admin appointment data:", data);

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load appointments."
          );
        }

        const appointmentList = Array.isArray(data.appointments)
          ? data.appointments
          : [];

        setAppointments(appointmentList);
      } catch (err) {
        console.error(
          "Admin appointments loading error:",
          err
        );

        setAppointments([]);

        setError(
          err.message ||
            "Cannot connect to the appointment API."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // =========================================================
  // MONTH INFORMATION
  // =========================================================

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  // =========================================================
  // FORMAT DATE TO YYYY-MM-DD
  // =========================================================

  const getDateKey = (date) => {
    const y = date.getFullYear();

    const m = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const d = String(
      date.getDate()
    ).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  // =========================================================
  // GET APPOINTMENT DATE
  // =========================================================

  const getAppointmentDate = (appointment) => {
    return (
      appointment.appointmentDate ||
      appointment.appointment_date ||
      appointment.date ||
      ""
    );
  };

  // =========================================================
  // GET APPOINTMENTS GROUPED BY DATE
  // =========================================================

  const appointmentsByDate = useMemo(() => {
    const grouped = {};

    appointments.forEach((appointment) => {
      const rawDate =
        getAppointmentDate(appointment);

      if (!rawDate) {
        return;
      }

      const dateKey =
        String(rawDate).substring(0, 10);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(appointment);
    });

    return grouped;
  }, [appointments]);

  // =========================================================
  // SELECTED DATE APPOINTMENTS
  // =========================================================

  const selectedAppointments =
    selectedDate
      ? appointmentsByDate[selectedDate] || []
      : [];

  // =========================================================
  // CHANGE MONTH
  // =========================================================

  const previousMonth = () => {
    setCurrentMonth(
      new Date(
        year,
        month - 1,
        1
      )
    );

    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(
        year,
        month + 1,
        1
      )
    );

    setSelectedDate(null);
  };

  const goToToday = () => {
    const today = new Date();

    setCurrentMonth(today);
    setSelectedDate(getDateKey(today));
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (timeValue) => {
    if (!timeValue) {
      return "N/A";
    }

    const parts = String(timeValue).split(":");

    if (parts.length < 2) {
      return timeValue;
    }

    let hours = parseInt(parts[0], 10);

    const minutes = parts[1];

    if (isNaN(hours)) {
      return timeValue;
    }

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return `${hours}:${minutes} ${period}`;
  };

  // =========================================================
  // GET DOCUMENT NAME
  // =========================================================

  const getDocumentName = (appointment) => {
    return (
      appointment.document ||
      appointment.documentType ||
      appointment.document_type ||
      "Document Request"
    );
  };

  // =========================================================
  // GET RESIDENT NAME
  // =========================================================

  const getResidentName = (appointment) => {
    if (appointment.residentName) {
      return appointment.residentName;
    }

    if (appointment.resident_name) {
      return appointment.resident_name;
    }

    const fullName = [
      appointment.first_name,
      appointment.middle_name,
      appointment.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return fullName || "Resident";
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    const value = String(
      status || "Pending"
    )
      .trim()
      .toLowerCase();

    if (value === "approved") {
      return "status-approved";
    }

    if (
      value === "rejected" ||
      value === "cancelled" ||
      value === "canceled"
    ) {
      return "status-rejected";
    }

    return "status-pending";
  };

  // =========================================================
  // RENDER CALENDAR DAYS
  // =========================================================

  const calendarDays = [];

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // =========================================================
  // TODAY
  // =========================================================

  const todayKey = getDateKey(new Date());

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-dashboard-page">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="background-shape shape-one"></div>
      <div className="background-shape shape-two"></div>
      <div className="background-shape shape-three"></div>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="logo-wrapper">
          <div className="logo-glow"></div>

          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="barangay-logo"
          />
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
            className="menu-item active"
            onClick={(e) => {
              e.preventDefault();

              setCurrentPage(
                "admin-appointments"
              );
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

        </nav>

        <div className="about-us">
          <span>
            ℹ️
          </span>

          About Us
        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-content">

        {/* HEADER */}

        <div className="welcome-section">

          <div>

            <p className="welcome-small">
              BARANGAY ADMIN PORTAL
            </p>

            <h1 className="welcome-title">
              Appointments
              <span className="wave">
                🗓️
              </span>
            </h1>

            <p className="welcome-description">
              View and monitor resident
              appointment schedules.
            </p>

          </div>

          <div className="date-card">

            <span className="calendar-icon">
              📅
            </span>

            <div>

              <small>
                Today
              </small>

              <strong>
                {new Date().toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </strong>

            </div>

          </div>

        </div>

        {/* =====================================================
            CALENDAR SECTION
        ===================================================== */}

        <section className="events-section">

          <div className="events-header">

            <div className="announcement-circle">
              🗓️
            </div>

            <div>

              <h2>
                Appointment Calendar
              </h2>

              <p>
                Select a date to view the
                appointments scheduled for
                that day.
              </p>

            </div>

          </div>
          <br></br>
           <br></br>

<div className="predictive-analytics-container">
  <a
    href="#"
    className="predictive-analytics-button"
    onClick={(e) => {
      e.preventDefault();
      setShowPredictiveAnalytics(true);
    }}
  >
    <span className="menu-icon">📊</span>
    <span>Predictive Analytics</span>
  </a>
</div>


          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
              }}
            >
              Loading appointments...
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#b91c1c",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && (

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 2fr) minmax(320px, 1fr)",
                gap: "25px",
                marginTop: "25px",
              }}
            >

              {/* =================================================
                  CALENDAR
              ================================================= */}

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  padding: "25px",
                  boxShadow:
                    "0 8px 25px rgba(0,0,0,0.08)",
                }}
              >

                {/* CALENDAR HEADER */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >

                  <button
                    type="button"
                    onClick={previousMonth}
                    style={{
                      border: "none",
                      background: "#f1f5f9",
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    ←
                  </button>

                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >

                    <h2
                      style={{
                        margin: 0,
                      }}
                    >
                      {monthName}
                    </h2>

                    <button
                      type="button"
                      onClick={goToToday}
                      style={{
                        marginTop: "5px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#2563eb",
                        fontWeight: "600",
                      }}
                    >
                      Today
                    </button>

                  </div>

                  <button
                    type="button"
                    onClick={nextMonth}
                    style={{
                      border: "none",
                      background: "#f1f5f9",
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    →
                  </button>

                </div>

                {/* WEEKDAYS */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(7, 1fr)",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >

                  {[
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                  ].map((day) => (

                    <div
                      key={day}
                      style={{
                        textAlign: "center",
                        fontWeight: "700",
                        fontSize: "13px",
                        color: "#64748b",
                        padding: "8px 0",
                      }}
                    >
                      {day}
                    </div>

                  ))}

                </div>

                {/* DAYS */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(7, 1fr)",
                    gap: "8px",
                  }}
                >

                  {calendarDays.map(
                    (day, index) => {

                      if (day === null) {
                        return (
                          <div
                            key={`empty-${index}`}
                            style={{
                              minHeight: "80px",
                            }}
                          />
                        );
                      }

                      const date = new Date(
                        year,
                        month,
                        day
                      );

                      const dateKey =
                        getDateKey(date);

                      const dayAppointments =
                        appointmentsByDate[
                          dateKey
                        ] || [];

                      const appointmentCount =
                        dayAppointments.length;

                      const isSelected =
                        selectedDate ===
                        dateKey;

                      const isToday =
                        todayKey ===
                        dateKey;

                      return (

                        <button
                          type="button"
                          key={dateKey}
                          onClick={() =>
                            setSelectedDate(
                              dateKey
                            )
                          }
                          style={{
                            minHeight: "80px",
                            border: isSelected
                              ? "2px solid #2563eb"
                              : "1px solid #e2e8f0",
                            borderRadius: "12px",
                            background:
                              isSelected
                                ? "#eff6ff"
                                : "#ffffff",
                            cursor: "pointer",
                            padding: "8px",
                            textAlign: "left",
                            position: "relative",
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "flex-start",
                            }}
                          >

                            <span
                              style={{
                                fontWeight:
                                  isToday ||
                                  isSelected
                                    ? "800"
                                    : "600",
                                color:
                                  isToday
                                    ? "#2563eb"
                                    : "#334155",
                              }}
                            >
                              {day}
                            </span>

                            {appointmentCount >
                              0 && (

                              <span
                                style={{
                                  background:
                                    "#2563eb",
                                  color:
                                    "#ffffff",
                                  minWidth:
                                    "25px",
                                  height:
                                    "25px",
                                  borderRadius:
                                    "50%",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    "700",
                                }}
                              >
                                {
                                  appointmentCount
                                }
                              </span>

                            )}

                          </div>

                          {appointmentCount >
                            0 && (

                            <div
                              style={{
                                marginTop:
                                  "12px",
                                fontSize:
                                  "11px",
                                color:
                                  "#2563eb",
                                fontWeight:
                                  "600",
                              }}
                            >
                              {
                                appointmentCount
                              }{" "}
                              appointment
                              {appointmentCount !==
                              1
                                ? "s"
                                : ""}
                            </div>

                          )}

                        </button>

                      );
                    }
                  )}

                </div>

              </div>

              {/* =================================================
                  SELECTED DATE DETAILS
              ================================================= */}

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  padding: "25px",
                  boxShadow:
                    "0 8px 25px rgba(0,0,0,0.08)",
                  minHeight: "300px",
                }}
              >

                {!selectedDate ? (

                  <div
                    style={{
                      textAlign: "center",
                      padding: "50px 20px",
                    }}
                  >

                    <div
                      style={{
                        fontSize: "50px",
                        marginBottom: "15px",
                      }}
                    >
                      📅
                    </div>

                    <h3>
                      Select a Date
                    </h3>

                    <p
                      style={{
                        color: "#64748b",
                      }}
                    >
                      Click a date on the
                      calendar to see the
                      scheduled appointments.
                    </p>

                  </div>

                ) : (

                  <>

                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                        fontWeight: "700",
                        marginBottom: "5px",
                      }}
                    >
                      APPOINTMENT SCHEDULE
                    </p>

                    <h2
                      style={{
                        marginTop: 0,
                      }}
                    >
                      {new Date(
                        `${selectedDate}T00:00:00`
                      ).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </h2>

                    <div
                      style={{
                        background:
                          "#eff6ff",
                        borderRadius:
                          "12px",
                        padding:
                          "15px",
                        marginBottom:
                          "20px",
                      }}
                    >

                      <strong
                        style={{
                          fontSize: "25px",
                          color: "#2563eb",
                        }}
                      >
                        {
                          selectedAppointments.length
                        }
                      </strong>

                      <span
                        style={{
                          marginLeft: "10px",
                          color: "#475569",
                        }}
                      >
                        appointment
                        {selectedAppointments.length !==
                        1
                          ? "s"
                          : ""}{" "}
                        scheduled
                      </span>

                    </div>

                    {selectedAppointments.length ===
                    0 ? (

                      <div
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "30px 10px",
                          color:
                            "#64748b",
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              "40px",
                            marginBottom:
                              "10px",
                          }}
                        >
                          📭
                        </div>

                        No appointments
                        scheduled for this
                        date.

                      </div>

                    ) : (

                      <div
                        style={{
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          gap: "15px",
                        }}
                      >

                        {selectedAppointments.map(
                          (appointment) => (

                            <div
                              key={
                                appointment.id
                              }
                              style={{
                                border:
                                  "1px solid #e2e8f0",
                                borderRadius:
                                  "14px",
                                padding:
                                  "16px",
                              }}
                            >

                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  gap:
                                    "10px",
                                }}
                              >

                                <strong>
                                  Appointment #
                                  {
                                    appointment.id
                                  }
                                </strong>

                                <span
                                  className={`resident-request-status ${getStatusClass(
                                    appointment.status
                                  )}`}
                                >
                                  {
                                    appointment.status ||
                                    "Pending"
                                  }
                                </span>

                              </div>

                              <div
                                style={{
                                  marginTop:
                                    "12px",
                                }}
                              >

                                <p
                                  style={{
                                    margin:
                                      "5px 0",
                                  }}
                                >
                                  <strong>
                                    Resident:
                                  </strong>{" "}
                                  {
                                    getResidentName(
                                      appointment
                                    )
                                  }
                                </p>

                                <p
                                  style={{
                                    margin:
                                      "5px 0",
                                  }}
                                >
                                  <strong>
                                    Time:
                                  </strong>{" "}
                                  {
                                    formatTime(
                                      appointment.appointmentTime ||
                                      appointment.appointment_time
                                    )
                                  }
                                </p>

                                <p
                                  style={{
                                    margin:
                                      "5px 0",
                                  }}
                                >
                                  <strong>
                                    Purpose:
                                  </strong>{" "}
                                  {
                                    appointment.purpose ||
                                    "No purpose provided."
                                  }
                                </p>

                                <p
                                  style={{
                                    margin:
                                      "5px 0",
                                  }}
                                >
                                  <strong>
                                    Document:
                                  </strong>{" "}
                                  {
                                    getDocumentName(
                                      appointment
                                    )
                                  }
                                </p>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </>

                )}

              </div>

            </div>

          )}

        </section>
       
        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
          className="document-page-footer"
          style={{
            marginTop: "25px",
          }}
        >

          <button
            type="button"
            className="back-dashboard-button"
            onClick={() =>
              setCurrentPage(
                "admin-dashboard"
              )
            }
          >
            ← Back to Dashboard
          </button>

        </div>

      </main>
      <AdminPredictiveAnalyticsModal
  isOpen={showPredictiveAnalytics}
  onClose={() => setShowPredictiveAnalytics(false)}
  requests={appointments}
/>
<LogoutModal
  isOpen={showLogoutModal}
  onClose={() => setShowLogoutModal(false)}
  onConfirm={handleLogout}
/>

    </div>
  );
};

export default AdminAppointments;