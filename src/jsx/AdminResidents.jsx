import React, { useEffect, useMemo, useState } from "react";
import "../App.css";

const API_URL =
  "http://localhost/barangay-api/admin_residents.php";

const AdminResidents = ({ setCurrentPage }) => {
  // =========================================================
  // STATE
  // =========================================================

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);

  // =========================================================
  // FETCH ALL RESIDENTS
  // =========================================================

  const fetchResidents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Invalid residents API response:", responseText);
        throw new Error("Residents API returned invalid JSON.");
      }

      console.log("Residents API data:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load residents."
        );
      }

      setResidents(
        Array.isArray(data.residents)
          ? data.residents
          : []
      );
    } catch (fetchError) {
      console.error("Error loading residents:", fetchError);

      setResidents([]);
      setError(
        fetchError.message ||
          "Cannot connect to the residents API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // =========================================================
  // HELPER FUNCTIONS
  // =========================================================

  const getValue = (resident, keys, fallback = "N/A") => {
    for (const key of keys) {
      if (
        resident &&
        resident[key] !== undefined &&
        resident[key] !== null &&
        String(resident[key]).trim() !== ""
      ) {
        return resident[key];
      }
    }

    return fallback;
  };

  const getFullName = (resident) => {
    const firstName = getValue(
      resident,
      ["first_name", "firstName"],
      ""
    );

    const middleName = getValue(
      resident,
      ["middle_name", "middleName"],
      ""
    );

    const lastName = getValue(
      resident,
      ["last_name", "lastName"],
      ""
    );

    const suffix = getValue(
      resident,
      ["suffix"],
      ""
    );

    const name = [
      firstName,
      middleName,
      lastName,
      suffix,
    ]
      .filter(
        (value) =>
          value &&
          value !== "N/A"
      )
      .join(" ");

    return (
      name ||
      getValue(
        resident,
        ["name", "full_name", "fullName"],
        "Unnamed Resident"
      )
    );
  };

  const formatLabel = (key) => {
    return String(key)
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "N/A";
    }

    if (
      typeof value === "object"
    ) {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredResidents = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return residents;
    }

    return residents.filter((resident) => {
      const searchableText =
        Object.values(resident || {})
          .map((value) =>
            value === null ||
            value === undefined
              ? ""
              : String(value)
          )
          .join(" ")
          .toLowerCase();

      const fullName =
        getFullName(resident)
          .toLowerCase();

      return (
        searchableText.includes(search) ||
        fullName.includes(search)
      );
    });
  }, [residents, searchTerm]);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("staffLoggedIn");
    localStorage.removeItem("staffRole");

    localStorage.removeItem("loggedIn");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("residentId");

    setCurrentPage("login");
  };

  // =========================================================
  // COMMON FIELDS FOR TABLE
  // =========================================================

  const getResidentId = (resident) =>
    getValue(
      resident,
      ["id", "resident_id", "residentId"],
      "N/A"
    );

  const getEmail = (resident) =>
    getValue(
      resident,
      ["email", "user_email"],
      "N/A"
    );

  const getContact = (resident) =>
    getValue(
      resident,
      [
        "contact_number",
        "contact",
        "phone",
        "phone_number",
        "mobile_number",
      ],
      "N/A"
    );

  const getAddress = (resident) =>
    getValue(
      resident,
      [
        "address",
        "complete_address",
        "full_address",
        "house_address",
      ],
      "N/A"
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-dashboard-page">

      {/* BACKGROUND */}
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

          <a
            href="#"
            className="menu-item active"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("admin-residents");
            }}
          >
            <span className="menu-icon">👥</span>
            <span>Residents</span>
          </a>

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
              handleLogout();
            }}
          >
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </a>

        </nav>

        <div className="about-us">
          <span>ℹ️</span>
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
              Residents
              <span className="wave">👥</span>
            </h1>

            <p className="welcome-description">
              View and manage all registered barangay residents.
            </p>
          </div>

          <div className="date-card">
            <span className="calendar-icon">📅</span>

            <div>
              <small>Today</small>

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

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="statistics-container">

          <div className="stat-card total-card">

            <div className="stat-top">
              <div>
                <p className="stat-label">
                  TOTAL RESIDENTS
                </p>

                <h2>
                  {loading ? "..." : residents.length}
                </h2>
              </div>

              <div className="stat-icon">
                👥
              </div>
            </div>

            <div className="stat-bottom">
              <span className="stat-status">
                ● Registered
              </span>

              <span>
                Barangay residents
              </span>
            </div>

          </div>

        </div>

        {/* =================================================
            RESIDENT LIST
        ================================================= */}

        <section className="events-section">

          <div className="events-header">

            <div className="announcement-circle">
              👥
            </div>

            <div>
              <h2>
                Resident Records
              </h2>

              <p>
                All registered residents pulled directly
                from the database.
              </p>
            </div>

          </div>

          {/* SEARCH + REFRESH */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              marginBottom: "18px",
              flexWrap: "wrap",
            }}
          >

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search residents..."
              style={{
                flex: "1",
                minWidth: "250px",
                padding: "12px 15px",
                border: "1px solid #d7dce5",
                borderRadius: "10px",
                fontSize: "14px",
                outline: "none",
              }}
            />

            <button
              type="button"
              onClick={fetchResidents}
              disabled={loading}
              style={{
                padding: "12px 18px",
                border: "none",
                borderRadius: "10px",
                background: "#198754",
                color: "#fff",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
              }}
            >
              {loading
                ? "Loading..."
                : "🔄 Refresh"}
            </button>

          </div>

          {/* ERROR */}

          {!loading && error && (
            <div
              style={{
                padding: "18px",
                background: "#fff0f0",
                color: "#b42318",
                borderRadius: "10px",
                marginBottom: "18px",
                border: "1px solid #f5c2c7",
              }}
            >
              <strong>
                Unable to load residents
              </strong>

              <p
                style={{
                  marginBottom: 0,
                  marginTop: "6px",
                }}
              >
                {error}
              </p>
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "45px 20px",
                background: "#fff",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "34px",
                  marginBottom: "10px",
                }}
              >
                ⏳
              </div>

              <h3>
                Loading residents...
              </h3>

              <p>
                Retrieving resident records from the database.
              </p>
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredResidents.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "45px 20px",
                  background: "#fff",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    marginBottom: "10px",
                  }}
                >
                  📭
                </div>

                <h3>
                  {searchTerm
                    ? "No residents found"
                    : "No residents registered"}
                </h3>

                <p>
                  {searchTerm
                    ? "Try a different search term."
                    : "There are currently no resident records."}
                </p>
              </div>
            )}

          {/* TABLE */}

          {!loading &&
            !error &&
            filteredResidents.length > 0 && (

              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow:
                    "0 4px 18px rgba(0,0,0,0.08)",
                }}
              >

                <div
                  style={{
                    padding: "18px 20px",
                    borderBottom:
                      "1px solid #e8ebf0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >

                  <div>
                    <h3
                      style={{
                        margin: 0,
                      }}
                    >
                      Resident List
                    </h3>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color: "#667085",
                        fontSize: "14px",
                      }}
                    >
                      Showing{" "}
                      {filteredResidents.length}{" "}
                      of{" "}
                      {residents.length}{" "}
                      resident
                      {residents.length !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                </div>

                <div
                  style={{
                    overflowX: "auto",
                  }}
                >

                  <table
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                      minWidth:
                        "850px",
                    }}
                  >

                    <thead>
                      <tr
                        style={{
                          background:
                            "#f5f7fa",
                          textAlign:
                            "left",
                        }}
                      >

                        <th style={thStyle}>
                          #
                        </th>

                        <th style={thStyle}>
                          Resident
                        </th>

                        <th style={thStyle}>
                          Email
                        </th>

                        <th style={thStyle}>
                          Contact
                        </th>

                        <th style={thStyle}>
                          Address
                        </th>

                        <th style={thStyle}>
                          Action
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {filteredResidents.map(
                        (resident, index) => {

                          const id =
                            getResidentId(
                              resident
                            );

                          const name =
                            getFullName(
                              resident
                            );

                          return (
                            <tr
                              key={
                                `${id}-${index}`
                              }
                              style={{
                                borderTop:
                                  "1px solid #edf0f3",
                              }}
                            >

                              <td style={tdStyle}>
                                {id}
                              </td>

                              <td style={tdStyle}>

                                <div
                                  style={{
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    gap: "10px",
                                  }}
                                >

                                  <div
                                    style={{
                                      width:
                                        "38px",
                                      height:
                                        "38px",
                                      borderRadius:
                                        "50%",
                                      background:
                                        "#e8f1fb",
                                      color:
                                        "#1677c8",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      fontWeight:
                                        "700",
                                    }}
                                  >
                                    {name
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <div>

                                    <strong>
                                      {name}
                                    </strong>

                                    <div
                                      style={{
                                        fontSize:
                                          "12px",
                                        color:
                                          "#667085",
                                        marginTop:
                                          "3px",
                                      }}
                                    >
                                      Resident
                                    </div>

                                  </div>

                                </div>

                              </td>

                              <td style={tdStyle}>
                                {getEmail(
                                  resident
                                )}
                              </td>

                              <td style={tdStyle}>
                                {getContact(
                                  resident
                                )}
                              </td>

                              <td style={tdStyle}>
                                {getAddress(
                                  resident
                                )}
                              </td>

                              <td style={tdStyle}>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedResident(
                                      resident
                                    )
                                  }
                                  style={{
                                    padding:
                                      "8px 13px",
                                    border:
                                      "none",
                                    borderRadius:
                                      "8px",
                                    background:
                                      "#1677c8",
                                    color:
                                      "#fff",
                                    cursor:
                                      "pointer",
                                    fontWeight:
                                      "600",
                                  }}
                                >
                                  View Details
                                </button>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

        </section>

      </main>

      {/* =====================================================
          RESIDENT DETAILS MODAL
      ===================================================== */}

      {selectedResident && (

        <div
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedResident(null);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >

          <div
            style={{
              width: "min(900px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "16px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >

            <div
              style={{
                padding: "22px 25px",
                borderBottom:
                  "1px solid #e8ebf0",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >

              <div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#667085",
                    fontWeight: "700",
                    letterSpacing:
                      "0.08em",
                  }}
                >
                  RESIDENT PROFILE
                </span>

                <h2
                  style={{
                    margin:
                      "5px 0 0",
                  }}
                >
                  {getFullName(
                    selectedResident
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedResident(null)
                }
                style={{
                  width: "38px",
                  height: "38px",
                  border: "none",
                  borderRadius:
                    "50%",
                  background:
                    "#f2f4f7",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

            </div>

            <div
              style={{
                padding: "25px",
              }}
            >

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "14px",
                }}
              >

                {Object.entries(
                  selectedResident
                ).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      style={{
                        padding:
                          "14px",
                        border:
                          "1px solid #e8ebf0",
                        borderRadius:
                          "10px",
                        background:
                          "#fafbfc",
                      }}
                    >

                      <div
                        style={{
                          fontSize:
                            "11px",
                          fontWeight:
                            "700",
                          color:
                            "#667085",
                          textTransform:
                            "uppercase",
                          marginBottom:
                            "6px",
                        }}
                      >
                        {formatLabel(
                          key
                        )}
                      </div>

                      <div
                        style={{
                          fontSize:
                            "14px",
                          color:
                            "#101828",
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {formatValue(
                          value
                        )}
                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

            <div
              style={{
                padding:
                  "18px 25px",
                borderTop:
                  "1px solid #e8ebf0",
                display: "flex",
                justifyContent:
                  "flex-end",
              }}
            >

              <button
                type="button"
                onClick={() =>
                  setSelectedResident(null)
                }
                style={{
                  padding:
                    "10px 18px",
                  border: "none",
                  borderRadius:
                    "8px",
                  background:
                    "#198754",
                  color: "#fff",
                  cursor:
                    "pointer",
                  fontWeight:
                    "600",
                }}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

const thStyle = {
  padding: "14px 15px",
  fontSize: "12px",
  color: "#475467",
  fontWeight: "700",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "15px",
  fontSize: "14px",
  color: "#344054",
  verticalAlign: "middle",
};

export default AdminResidents;