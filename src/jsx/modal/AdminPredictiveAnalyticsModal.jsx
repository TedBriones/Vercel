import React, { useEffect, useMemo, useState } from "react";

const APPOINTMENTS_API =
  "http://localhost/barangay-api/admin_appointments.php";

const AdminPredictiveAnalyticsModal = ({ isOpen, onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH APPOINTMENTS
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(APPOINTMENTS_API, {
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
          throw new Error("Appointment API returned invalid JSON.");
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load appointment data."
          );
        }

        const list = Array.isArray(data.appointments)
          ? data.appointments
          : [];

        setAppointments(list);
      } catch (err) {
        console.error("Predictive analytics error:", err);

        setAppointments([]);

        setError(
          err.message || "Unable to load predictive analytics data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [isOpen]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getAppointmentDate = (appointment) => {
    return (
      appointment.appointmentDate ||
      appointment.appointment_date ||
      appointment.date ||
      ""
    );
  };

  const getStatus = (appointment) => {
    return String(appointment.status || "Pending")
      .trim()
      .toLowerCase();
  };

  const getDocumentName = (appointment) => {
    return (
      appointment.document ||
      appointment.documentType ||
      appointment.document_type ||
      "Document Request"
    );
  };

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
  // BASIC STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const total = appointments.length;

    const approved = appointments.filter(
      (appointment) => getStatus(appointment) === "approved"
    ).length;

    const pending = appointments.filter(
      (appointment) => getStatus(appointment) === "pending"
    ).length;

    const rejected = appointments.filter((appointment) => {
      const status = getStatus(appointment);

      return (
        status === "rejected" ||
        status === "cancelled" ||
        status === "canceled"
      );
    }).length;

    return {
      total,
      approved,
      pending,
      rejected,
    };
  }, [appointments]);

  // =========================================================
  // MONTHLY ANALYSIS
  // =========================================================

  const monthlyData = useMemo(() => {
    const months = {};

    appointments.forEach((appointment) => {
      const rawDate = getAppointmentDate(appointment);

      if (!rawDate) {
        return;
      }

      const date = new Date(String(rawDate).substring(0, 10));

      if (isNaN(date.getTime())) {
        return;
      }

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const label = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!months[key]) {
        months[key] = {
          key,
          label,
          count: 0,
        };
      }

      months[key].count += 1;
    });

    return Object.values(months)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);
  }, [appointments]);

  // =========================================================
  // DOCUMENT DEMAND
  // =========================================================

  const documentData = useMemo(() => {
    const documents = {};

    appointments.forEach((appointment) => {
      const document = getDocumentName(appointment);

      if (!documents[document]) {
        documents[document] = 0;
      }

      documents[document] += 1;
    });

    return Object.entries(documents)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [appointments]);

  // =========================================================
  // WEEKDAY DEMAND
  // =========================================================

  const weekdayData = useMemo(() => {
    const weekdays = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    appointments.forEach((appointment) => {
      const rawDate = getAppointmentDate(appointment);

      if (!rawDate) {
        return;
      }

      const date = new Date(String(rawDate).substring(0, 10));

      if (isNaN(date.getTime())) {
        return;
      }

      const day = date.toLocaleDateString("en-US", {
        weekday: "long",
      });

      weekdays[day] += 1;
    });

    return Object.entries(weekdays).map(([day, count]) => ({
      day,
      count,
    }));
  }, [appointments]);

  // =========================================================
  // PREDICTED NEXT PERIOD
  // =========================================================

  const prediction = useMemo(() => {
    if (monthlyData.length === 0) {
      return {
        predicted: 0,
        trend: "No data",
        percentage: 0,
      };
    }

    if (monthlyData.length === 1) {
      return {
        predicted: monthlyData[0].count,
        trend: "Stable",
        percentage: 0,
      };
    }

    const current =
      monthlyData[monthlyData.length - 1].count;

    const previous =
      monthlyData[monthlyData.length - 2].count;

    const difference = current - previous;

    const percentage =
      previous > 0
        ? Math.round((difference / previous) * 100)
        : 0;

    const predicted = Math.max(
      0,
      Math.round(current + difference)
    );

    let trend = "Stable";

    if (difference > 0) {
      trend = "Increasing";
    } else if (difference < 0) {
      trend = "Decreasing";
    }

    return {
      predicted,
      trend,
      percentage,
    };
  }, [monthlyData]);

  // =========================================================
  // BUSIEST WEEKDAY
  // =========================================================

  const busiestDay = useMemo(() => {
    if (weekdayData.length === 0) {
      return {
        day: "N/A",
        count: 0,
      };
    }

    return weekdayData.reduce((highest, current) => {
      return current.count > highest.count
        ? current
        : highest;
    });
  }, [weekdayData]);

  // =========================================================
  // MAX VALUES FOR BARS
  // =========================================================

  const maxMonthlyCount = Math.max(
    ...monthlyData.map((item) => item.count),
    1
  );

  const maxDocumentCount = Math.max(
    ...documentData.map((item) => item.count),
    1
  );

  const maxWeekdayCount = Math.max(
    ...weekdayData.map((item) => item.count),
    1
  );

  // =========================================================
  // CLOSE ON BACKDROP
  // =========================================================

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // =========================================================
  // ESCAPE KEY
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // =========================================================
  // DO NOT RENDER WHEN CLOSED
  // =========================================================

  if (!isOpen) {
    return null;
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "25px",
      }}
    >
      <div
        style={{
          width: "min(1100px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#f8fafc",
          borderRadius: "24px",
          boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
        }}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          style={{
            background:
              "linear-gradient(135deg, #1d4ed8, #2563eb)",
            color: "#ffffff",
            padding: "28px 30px",
            borderRadius: "24px 24px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "700",
                opacity: 0.8,
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              BARANGAY ADMIN PORTAL
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "800",
              }}
            >
              Predictive Analytics
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                opacity: 0.9,
                fontSize: "14px",
              }}
            >
              Analyze appointment patterns and estimate
              future demand.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "#ffffff",
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "22px",
              fontWeight: "700",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div
          style={{
            padding: "30px",
          }}
        >
          {loading && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  fontSize: "40px",
                  marginBottom: "15px",
                }}
              >
                📊
              </div>

              <strong>
                Loading predictive analytics...
              </strong>
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                borderRadius: "14px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* =================================================
                  SUMMARY CARDS
              ================================================= */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4, minmax(0, 1fr))",
                  gap: "16px",
                  marginBottom: "25px",
                }}
              >
                {/* TOTAL */}

                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "30px",
                      marginBottom: "8px",
                    }}
                  >
                    📅
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Total Appointments
                  </div>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "28px",
                      marginTop: "5px",
                      color: "#1e293b",
                    }}
                  >
                    {statistics.total}
                  </strong>
                </div>

                {/* APPROVED */}

                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "30px",
                      marginBottom: "8px",
                    }}
                  >
                    ✅
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Approved
                  </div>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "28px",
                      marginTop: "5px",
                      color: "#15803d",
                    }}
                  >
                    {statistics.approved}
                  </strong>
                </div>

                {/* PENDING */}

                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "30px",
                      marginBottom: "8px",
                    }}
                  >
                    ⏳
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Pending
                  </div>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "28px",
                      marginTop: "5px",
                      color: "#d97706",
                    }}
                  >
                    {statistics.pending}
                  </strong>
                </div>

                {/* REJECTED */}

                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "30px",
                      marginBottom: "8px",
                    }}
                  >
                    ❌
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Rejected / Cancelled
                  </div>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "28px",
                      marginTop: "5px",
                      color: "#dc2626",
                    }}
                  >
                    {statistics.rejected}
                  </strong>
                </div>
              </div>

              {/* =================================================
                  PREDICTION
              ================================================= */}

              <div
                style={{
                  background:
                    "linear-gradient(135deg, #eff6ff, #dbeafe)",
                  border: "1px solid #bfdbfe",
                  borderRadius: "18px",
                  padding: "25px",
                  marginBottom: "25px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "800",
                        color: "#1d4ed8",
                        letterSpacing: "0.05em",
                      }}
                    >
                      FORECAST
                    </div>

                    <h3
                      style={{
                        margin:
                          "6px 0 5px",
                        fontSize: "22px",
                        color: "#1e3a8a",
                      }}
                    >
                      Predicted Next-Period Demand
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#475569",
                        fontSize: "14px",
                      }}
                    >
                      Based on recent appointment
                      volume trends.
                    </p>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "42px",
                        color: "#2563eb",
                        display: "block",
                      }}
                    >
                      {prediction.predicted}
                    </strong>

                    <span
                      style={{
                        fontSize: "13px",
                        color: "#475569",
                      }}
                    >
                      estimated appointments
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "18px",
                    borderTop:
                      "1px solid #bfdbfe",
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "22px",
                    }}
                  >
                    {prediction.trend ===
                    "Increasing"
                      ? "📈"
                      : prediction.trend ===
                        "Decreasing"
                      ? "📉"
                      : "➡️"}
                  </span>

                  <div>
                    <strong>
                      {prediction.trend}
                    </strong>

                    {prediction.percentage !== 0 && (
                      <span
                        style={{
                          marginLeft: "8px",
                          color:
                            prediction.percentage > 0
                              ? "#15803d"
                              : "#dc2626",
                          fontWeight: "700",
                        }}
                      >
                        {prediction.percentage > 0
                          ? "+"
                          : ""}
                        {prediction.percentage}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  MONTHLY TREND
              ================================================= */}

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  padding: "25px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "25px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 5px",
                    color: "#1e293b",
                  }}
                >
                  📈 Monthly Appointment Trend
                </h3>

                <p
                  style={{
                    margin: "0 0 25px",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Appointment volume over the most
                  recent months.
                </p>

                {monthlyData.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#64748b",
                    }}
                  >
                    No appointment data available.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "18px",
                      height: "230px",
                      padding:
                        "10px 5px 0",
                    }}
                  >
                    {monthlyData.map((item) => {
                      const height =
                        Math.max(
                          12,
                          (item.count /
                            maxMonthlyCount) *
                            170
                        );

                      return (
                        <div
                          key={item.key}
                          style={{
                            flex: 1,
                            height: "100%",
                            display: "flex",
                            flexDirection:
                              "column",
                            justifyContent:
                              "flex-end",
                            alignItems:
                              "center",
                            minWidth: 0,
                          }}
                        >
                          <strong
                            style={{
                              fontSize: "12px",
                              color: "#334155",
                              marginBottom:
                                "6px",
                            }}
                          >
                            {item.count}
                          </strong>

                          <div
                            style={{
                              width: "100%",
                              maxWidth: "65px",
                              height: `${height}px`,
                              background:
                                "linear-gradient(180deg, #3b82f6, #1d4ed8)",
                              borderRadius:
                                "10px 10px 4px 4px",
                              transition:
                                "height 0.3s ease",
                            }}
                          />

                          <span
                            style={{
                              marginTop:
                                "8px",
                              fontSize: "11px",
                              color:
                                "#64748b",
                              textAlign:
                                "center",
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* =================================================
                  TWO COLUMN ANALYTICS
              ================================================= */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "25px",
                  marginBottom: "25px",
                }}
              >
                {/* DOCUMENT DEMAND */}

                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    padding: "25px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 5px",
                    }}
                  >
                    📄 Document Demand
                  </h3>

                  <p
                    style={{
                      margin:
                        "0 0 20px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Most requested documents.
                  </p>

                  {documentData.length === 0 ? (
                    <div
                      style={{
                        color: "#64748b",
                        textAlign:
                          "center",
                        padding: "25px",
                      }}
                    >
                      No document data.
                    </div>
                  ) : (
                    documentData
                      .slice(0, 6)
                      .map((item) => (
                        <div
                          key={item.name}
                          style={{
                            marginBottom:
                              "17px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap: "10px",
                              marginBottom:
                                "6px",
                              fontSize:
                                "13px",
                            }}
                          >
                            <span
                              style={{
                                fontWeight:
                                  "600",
                                color:
                                  "#334155",
                              }}
                            >
                              {item.name}
                            </span>

                            <strong>
                              {item.count}
                            </strong>
                          </div>

                          <div
                            style={{
                              height:
                                "8px",
                              background:
                                "#e2e8f0",
                              borderRadius:
                                "999px",
                              overflow:
                                "hidden",
                            }}
                          >
                            <div
                              style={{
                                height:
                                  "100%",
                                width: `${
                                  (item.count /
                                    maxDocumentCount) *
                                  100
                                }%`,
                                background:
                                  "#2563eb",
                                borderRadius:
                                  "999px",
                              }}
                            />
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* WEEKDAY DEMAND */}

                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    padding: "25px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 5px",
                    }}
                  >
                    🗓️ Weekly Demand
                  </h3>

                  <p
                    style={{
                      margin:
                        "0 0 20px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Appointment distribution by
                    weekday.
                  </p>

                  {weekdayData.map((item) => (
                    <div
                      key={item.day}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "85px 1fr 35px",
                        alignItems:
                          "center",
                        gap: "10px",
                        marginBottom:
                          "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#475569",
                        }}
                      >
                        {item.day.substring(
                          0,
                          3
                        )}
                      </span>

                      <div
                        style={{
                          height:
                            "8px",
                          background:
                            "#e2e8f0",
                          borderRadius:
                            "999px",
                          overflow:
                            "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${
                              (item.count /
                                maxWeekdayCount) *
                              100
                            }%`,
                            height:
                              "100%",
                            background:
                              "#0ea5e9",
                            borderRadius:
                              "999px",
                          }}
                        />
                      </div>

                      <strong
                        style={{
                          fontSize:
                            "12px",
                          textAlign:
                            "right",
                        }}
                      >
                        {item.count}
                      </strong>
                    </div>
                  ))}

                  <div
                    style={{
                      marginTop:
                        "20px",
                      padding:
                        "14px",
                      background:
                        "#f0f9ff",
                      borderRadius:
                        "12px",
                      color:
                        "#0369a1",
                      fontSize:
                        "13px",
                    }}
                  >
                    <strong>
                      Busiest day:
                    </strong>{" "}
                    {busiestDay.day}{" "}
                    ({busiestDay.count} appointments)
                  </div>
                </div>
              </div>

              {/* =================================================
                  INSIGHTS
              ================================================= */}

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  padding: "25px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 15px",
                  }}
                >
                  💡 Administrative Insights
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(3, minmax(0, 1fr))",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      background:
                        "#f8fafc",
                      borderRadius:
                        "12px",
                      padding:
                        "15px",
                    }}
                  >
                    <strong
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "5px",
                      }}
                    >
                      Appointment Trend
                    </strong>

                    <span
                      style={{
                        color:
                          "#64748b",
                        fontSize:
                          "13px",
                      }}
                    >
                      Current trend is{" "}
                      <strong>
                        {prediction.trend.toLowerCase()}
                      </strong>
                      .
                    </span>
                  </div>

                  <div
                    style={{
                      background:
                        "#f8fafc",
                      borderRadius:
                        "12px",
                      padding:
                        "15px",
                    }}
                  >
                    <strong
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "5px",
                      }}
                    >
                      Expected Demand
                    </strong>

                    <span
                      style={{
                        color:
                          "#64748b",
                        fontSize:
                          "13px",
                      }}
                    >
                      Approximately{" "}
                      <strong>
                        {prediction.predicted}
                      </strong>{" "}
                      appointments may be expected
                      in the next period.
                    </span>
                  </div>

                  <div
                    style={{
                      background:
                        "#f8fafc",
                      borderRadius:
                        "12px",
                      padding:
                        "15px",
                    }}
                  >
                    <strong
                      style={{
                        display:
                          "block",
                        marginBottom:
                          "5px",
                      }}
                    >
                      Staffing Focus
                    </strong>

                    <span
                      style={{
                        color:
                          "#64748b",
                        fontSize:
                          "13px",
                      }}
                    >
                      Consider preparing additional
                      staff coverage around{" "}
                      <strong>
                        {busiestDay.day}
                      </strong>
                      .
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
          style={{
            padding: "20px 30px",
            borderTop: "1px solid #e2e8f0",
            background: "#ffffff",
            borderRadius: "0 0 24px 24px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              padding: "12px 25px",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPredictiveAnalyticsModal;