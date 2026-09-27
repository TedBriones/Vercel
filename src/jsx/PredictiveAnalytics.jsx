import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "../App.css";

import LogoutModal from "./modal/LogoutModal";


/* =========================================================
   API
========================================================= */

const API_URL =
  "http://localhost/barangay-api/staff_predictive_analytics.php";


/* =========================================================
   COLORS
========================================================= */

const DOCUMENT_COLORS = [
  "#118bd3",
  "#20a8ec",
  "#5eb8e8",
  "#82c8e8",
  "#b8dff2",
];


/* =========================================================
   MONTHLY FORECAST GRAPH
========================================================= */

function PredictionGraph({
  data,
  selectedMonth,
  onMonthClick,
}) {

  const width = 1000;
  const height = 360;

  const left = 65;
  const right = 25;
  const top = 30;
  const bottom = 55;

  const chartWidth =
    width - left - right;

  const chartHeight =
    height - top - bottom;


  const values =
    data.flatMap((item) => [

      item.actual,

      item.predicted,

    ].filter(
      (value) =>
        value !== null &&
        value !== undefined
    ));


  const highestValue =
    values.length > 0
      ? Math.max(...values)
      : 10;


  const maxValue =
    Math.max(
      10,
      Math.ceil(highestValue / 5) * 5
    );


  const minValue = 0;


  const getX = (index) =>
    left +
    (index * chartWidth) /
      Math.max(
        data.length - 1,
        1
      );


  const getY = (value) =>
    top +
    chartHeight -
    ((value - minValue) /
      (maxValue - minValue)) *
      chartHeight;


  const actualData =
    data.filter(
      (item) =>
        item.actual !== null &&
        item.actual !== undefined
    );


  const actualPoints =
    actualData.length > 0
      ? actualData
          .map((item) => {

            const index =
              data.findIndex(
                (month) =>
                  month.month ===
                  item.month
              );


            return `${getX(index)},${getY(
              item.actual
            )}`;

          })
          .join(" ")
      : "";


  const predictedPoints =
    data
      .map((item, index) => {

        if (
          item.predicted === null ||
          item.predicted === undefined
        ) {
          return null;
        }


        return `${getX(index)},${getY(
          item.predicted
        )}`;

      })
      .filter(Boolean)
      .join(" ");


  const gridCount = 5;


  const selectedIndex =
    data.findIndex(
      (item) =>
        item.month ===
        selectedMonth
    );


  return (

    <div className="prediction-svg-wrapper">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="prediction-svg"
        preserveAspectRatio="none"
      >

        {/* =================================================
            GRID
        ================================================= */}

        {Array.from(
          {
            length:
              gridCount + 1,
          },
          (_, index) => {

            const value =
              (maxValue /
                gridCount) *
              index;


            const y =
              getY(value);


            return (

              <g
                key={`grid-${index}`}
                className="prediction-grid-group"
              >

                <line
                  x1={left}
                  x2={
                    width -
                    right
                  }
                  y1={y}
                  y2={y}
                  className="prediction-grid-line"
                />


                <text
                  x={left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="prediction-axis-label"
                >
                  {Math.round(
                    value
                  )}
                </text>

              </g>

            );

          }
        )}


        {/* =================================================
            SELECTED MONTH GUIDE
        ================================================= */}

        {selectedIndex >= 0 && (

          <line
            x1={getX(
              selectedIndex
            )}
            x2={getX(
              selectedIndex
            )}
            y1={top}
            y2={
              height -
              bottom
            }
            className="prediction-selected-line"
          />

        )}


        {/* =================================================
            PREDICTED LINE
        ================================================= */}

        {predictedPoints && (

          <polyline
            points={predictedPoints}
            className="prediction-predicted-line animated-prediction-line"
          />

        )}


        {/* =================================================
            ACTUAL LINE
        ================================================= */}

        {actualPoints && (

          <polyline
            points={actualPoints}
            className="prediction-actual-line animated-actual-line"
          />

        )}


        {/* =================================================
            MONTHS
        ================================================= */}

        {data.map(
          (item, index) => {

            const x =
              getX(index);


            const isSelected =
              item.month ===
              selectedMonth;


            return (

              <g
                key={item.month}
                className={`prediction-month ${
                  isSelected
                    ? "prediction-month-selected"
                    : ""
                }`}
                onClick={() =>
                  onMonthClick(
                    item
                  )
                }
                style={{
                  cursor:
                    "pointer",
                }}
              >

                {/* CLICK AREA */}

                <rect
                  x={x - 30}
                  y={top}
                  width="60"
                  height={
                    chartHeight +
                    45
                  }
                  fill="transparent"
                  className="prediction-click-area"
                />


                {/* ACTUAL POINT */}

                {item.actual !==
                  null &&
                  item.actual !==
                    undefined && (

                    <circle
                      cx={x}
                      cy={getY(
                        item.actual
                      )}
                      r={
                        isSelected
                          ? 7
                          : 4
                      }
                      className={
                        isSelected
                          ? "prediction-actual-point selected animated-data-point"
                          : "prediction-actual-point animated-data-point"
                      }
                    />

                  )}


                {/* PREDICTED POINT */}

                {item.predicted !==
                  null &&
                  item.predicted !==
                    undefined && (

                    <circle
                      cx={x}
                      cy={getY(
                        item.predicted
                      )}
                      r={
                        isSelected
                          ? 6
                          : 3
                      }
                      className={
                        isSelected
                          ? "prediction-predicted-point selected animated-data-point"
                          : "prediction-predicted-point animated-data-point"
                      }
                    />

                  )}


                {/* MONTH LABEL */}

                <text
                  x={x}
                  y={
                    height - 18
                  }
                  textAnchor="middle"
                  className={
                    isSelected
                      ? "prediction-axis-label selected prediction-month-label"
                      : "prediction-axis-label prediction-month-label"
                  }
                >
                  {item.month}
                </text>

              </g>

            );

          }
        )}

      </svg>

    </div>

  );

}


/* =========================================================
   DOCUMENT DEMAND
========================================================= */

function DocumentDemand({
  data,
}) {

  if (
    !data ||
    data.length === 0
  ) {

    return (

      <div className="analytics-empty">
        No document request data available.
      </div>

    );

  }


  const max =
    Math.max(
      ...data.map(
        (item) =>
          Number(
            item.value
          ) || 0
      )
    ) || 1;


  return (

    <div className="document-demand-bars">

      {data.map(
        (item, index) => {

          const percentage =
            Number(
              item.value
            ) || 0;


          return (

            <div
              className="document-demand-row"
              key={`${item.name}-${index}`}
            >

              <div className="document-demand-label">

                <span>
                  {item.name}
                </span>

                <strong>
                  {percentage}%
                </strong>

              </div>


              <div className="document-demand-track">

                <div
                  className="document-demand-fill"
                  style={{
                    width: `${
                      (percentage /
                        max) *
                      100
                    }%`,
                    background:
                      DOCUMENT_COLORS[
                        index %
                          DOCUMENT_COLORS.length
                      ],
                  }}
                />

              </div>


              <small>

                {item.requests}{" "}
                request
                {Number(
                  item.requests
                ) === 1
                  ? ""
                  : "s"}

              </small>

            </div>

          );

        }
      )}

    </div>

  );

}


/* =========================================================
   SERVICE DEMAND
========================================================= */

function ServiceDemandChart({
  data,
}) {

  if (
    !data ||
    data.length === 0
  ) {

    return (

      <div className="analytics-empty">
        No service demand data available.
      </div>

    );

  }


  const max =
    Math.max(
      ...data.map(
        (item) =>
          Number(
            item.requests
          ) || 0
      )
    ) || 1;


  return (

    <div className="service-demand-chart">

      {data.map(
        (item, index) => {

          const requests =
            Number(
              item.requests
            ) || 0;


          return (

            <div
              className="service-demand-row"
              key={`${item.name}-${index}`}
            >

              <div className="service-demand-name">
                {item.name}
              </div>


              <div className="service-demand-track">

                <div
                  className="service-demand-fill"
                  style={{
                    width: `${
                      (requests /
                        max) *
                      100
                    }%`,
                  }}
                />

              </div>


              <strong>
                {requests}
              </strong>

            </div>

          );

        }
      )}

    </div>

  );

}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function PredictiveAnalytics({
  setCurrentPage,
}) {

  /* =======================================================
     ANALYTICS STATE
  ======================================================= */

  const [analytics, setAnalytics] =
    useState(null);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const [selectedMonth, setSelectedMonth] =
    useState(null);


  /* =======================================================
     LOGOUT STATE
  ======================================================= */

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);


  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigation = (
    page
  ) => {

    if (
      typeof setCurrentPage ===
      "function"
    ) {

      setCurrentPage(page);

    }

  };


  /* =======================================================
     LOGOUT
  ======================================================= */

  const openLogoutModal = () => {

    setShowLogoutModal(true);

  };


  const closeLogoutModal = () => {

    setShowLogoutModal(false);

  };


  const confirmLogout = () => {

    setShowLogoutModal(false);

    handleNavigation("login");

  };


  /* =======================================================
     LOAD DATABASE ANALYTICS
  ======================================================= */

  useEffect(() => {

    const loadAnalytics =
      async () => {

        try {

          setLoading(true);

          setError("");


          const response =
            await fetch(
              API_URL
            );


          if (!response.ok) {

            throw new Error(
              `Server returned ${response.status}`
            );

          }


          const result =
            await response.json();


          console.log(
            "Predictive Analytics API:",
            result
          );


          if (
            !result.success
          ) {

            throw new Error(
              result.message ||
              "Unable to load analytics."
            );

          }


          setAnalytics(
            result.analytics
          );


          if (
            result.analytics
              ?.monthly
              ?.length > 0
          ) {

            const months =
              result.analytics.monthly;


            let latest =
              null;


            months.forEach(
              (item) => {

                if (
                  item.actual !==
                    null &&
                  item.actual !==
                    undefined
                ) {

                  latest =
                    item;

                }

              }
            );


            setSelectedMonth(
              latest?.month ||
              months[0]?.month ||
              null
            );

          }

        } catch (
          err
        ) {

          console.error(
            "Predictive Analytics Error:",
            err
          );


          setError(
            err.message ||
            "Unable to load predictive analytics."
          );

        } finally {

          setLoading(false);

        }

      };


    loadAnalytics();

  }, []);


  /* =======================================================
     SELECTED MONTH
  ======================================================= */

  const selectedMonthData =
    useMemo(
      () => {

        if (
          !analytics?.monthly ||
          !selectedMonth
        ) {

          return null;

        }


        return analytics.monthly.find(
          (item) =>
            item.month ===
            selectedMonth
        );

      },
      [
        analytics,
        selectedMonth,
      ]
    );


  /* =======================================================
     LOADING SIDEBAR
  ======================================================= */

  const renderSidebar = (
    activePage = ""
  ) => (

    <aside className="staff-document-sidebar">

      {/* =================================================
          LOGO
      ================================================= */}

      <div className="staff-document-logo-wrapper">

        <img
          src="/logo.jpg"
          alt="Barangay Logo"
          className="staff-document-logo"
        />

      </div>


      <div className="staff-document-divider"></div>


      <div className="staff-document-portal-label">
        STAFF PORTAL
      </div>


      {/* =================================================
          MENU
      ================================================= */}

      <nav className="staff-document-menu">


        {/* DASHBOARD */}

        <a
          href="#"
          className={`staff-document-menu-item ${
            activePage ===
            "staff-dashboard"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            handleNavigation(
              "staff-dashboard"
            );

          }}
        >

          <span>
            🏠
          </span>

          <span>
            Dashboard
          </span>

        </a>


        {/* DOCUMENT REQUESTS */}

        <a
          href="#"
          className={`staff-document-menu-item ${
            activePage ===
            "staff-documents"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            handleNavigation(
              "staff-documents"
            );

          }}
        >

          <span>
            📄
          </span>

          <span>
            Document Requests
          </span>

        </a>


        {/* RESIDENTS */}

        <a
          href="#"
          className={`staff-document-menu-item ${
            activePage ===
            "staff-residents"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            handleNavigation(
              "staff-residents"
            );

          }}
        >

          <span>
            👥
          </span>

          <span>
            Residents
          </span>

        </a>


        {/* APPOINTMENTS */}

        <a
          href="#"
          className={`staff-document-menu-item ${
            activePage ===
            "staff-appointments"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            handleNavigation(
              "staff-appointments"
            );

          }}
        >

          <span>
            🗓️
          </span>

          <span>
            Appointments
          </span>

        </a>


        {/* PREDICTIVE ANALYTICS */}

        <a
          href="#"
          className={`staff-document-menu-item ${
            activePage ===
            "staff-predictive-analytics"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            handleNavigation(
              "staff-predictive-analytics"
            );

          }}
        >

          <span>
            📊
          </span>

          <span>
            Predictive Analytics
          </span>

        </a>


        {/* LOGOUT */}

        <a
          href="#"
          className="staff-document-menu-item logout"
          onClick={(e) => {

            e.preventDefault();

            openLogoutModal();

          }}
        >

          <span>
            🚪
          </span>

          <span>
            Logout
          </span>

        </a>

      </nav>


      {/* =================================================
          SIDEBAR FOOTER
      ================================================= */}

      <div className="staff-document-sidebar-footer">

        Barangay Management System

        <br />

        Staff Portal

      </div>

    </aside>

  );


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div className="predictive-page">

        {renderSidebar(
          "staff-predictive-analytics"
        )}


        <main className="predictive-main">

          <div className="analytics-loading">

            <div className="analytics-loading-spinner" />

            <h2>
              Loading Predictive Analytics
            </h2>

            <p>
              Retrieving request data from the database...
            </p>

          </div>


          {/* LOGOUT MODAL */}

          <LogoutModal
            isOpen={
              showLogoutModal
            }
            onClose={
              closeLogoutModal
            }
            onConfirm={
              confirmLogout
            }
          />

        </main>

      </div>

    );

  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error ||
    !analytics
  ) {

    return (

      <div className="predictive-page">

        {renderSidebar(
          "staff-predictive-analytics"
        )}


        <main className="predictive-main">

          <div className="analytics-error">

            <div className="analytics-error-icon">
              !
            </div>


            <h2>
              Unable to Load Analytics
            </h2>


            <p>
              {error ||
                "No analytics data was returned by the server."}
            </p>


            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Retry
            </button>

          </div>


          {/* LOGOUT MODAL */}

          <LogoutModal
            isOpen={
              showLogoutModal
            }
            onClose={
              closeLogoutModal
            }
            onConfirm={
              confirmLogout
            }
          />

        </main>

      </div>

    );

  }


  /* =======================================================
     DATA
  ======================================================= */

  const kpis =
    analytics.kpis ||
    {};


  const monthly =
    analytics.monthly ||
    [];


  const documentTypes =
    analytics.document_types ||
    [];


  const services =
    analytics.services ||
    [];


  const year =
    analytics.period?.year ||
    new Date().getFullYear();


  const latestActualMonth =
    analytics.period
      ?.latest_actual_month;


  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (

    <div className="predictive-page">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      {renderSidebar(
        "staff-predictive-analytics"
      )}


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="predictive-main">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="predictive-header">

          <div>

            <div className="predictive-eyebrow">
              STAFF PORTAL / ANALYTICS
            </div>


            <h1>
              Predictive Analytics
            </h1>


            <p>
              Analyze actual document requests and
              forecast future barangay service demand.
            </p>

          </div>


          <div className="predictive-date-card">

            <span>
              📅
            </span>


            <div>

              <small>
                ANALYTICS PERIOD
              </small>


              <strong>
                January – December{" "}
                {year}
              </strong>

            </div>

          </div>

        </header>


        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="analytics-kpi-grid">


          {/* PREDICTED */}

          <div className="analytics-kpi-card">

            <div className="analytics-kpi-icon blue">
              ◫
            </div>


            <div>

              <span className="analytics-kpi-label">
                PREDICTED REQUESTS
              </span>


              <strong>

                {Number(
                  kpis.predicted_requests ||
                  0
                ).toLocaleString()}

              </strong>


              <small className="analytics-positive">
                Database forecast
              </small>

            </div>

          </div>


          {/* GROWTH */}

          <div className="analytics-kpi-card">

            <div className="analytics-kpi-icon green">
              ↗
            </div>


            <div>

              <span className="analytics-kpi-label">
                GROWTH RATE
              </span>


              <strong>

                {Number(
                  kpis.growth_rate ||
                  0
                ).toFixed(1)}
                %

              </strong>


              <small className="analytics-positive">
                Based on latest request activity
              </small>

            </div>

          </div>


          {/* CONFIDENCE */}

          <div className="analytics-kpi-card">

            <div className="analytics-kpi-icon purple">
              ◈
            </div>


            <div>

              <span className="analytics-kpi-label">
                FORECAST CONFIDENCE
              </span>


              <strong>

                {Number(
                  kpis.model_confidence ||
                  0
                ).toFixed(0)}
                %

              </strong>


              <small className="analytics-neutral">
                Based on available historical data
              </small>

            </div>

          </div>


          {/* PEAK */}

          <div className="analytics-kpi-card">

            <div className="analytics-kpi-icon orange">
              ◷
            </div>


            <div>

              <span className="analytics-kpi-label">
                PEAK MONTH
              </span>


              <strong>
                {kpis.peak_month ||
                  "N/A"}
              </strong>


              <small className="analytics-warning">

                {Number(
                  kpis.peak_requests ||
                  0
                ).toLocaleString()}{" "}
                estimated requests

              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            FORECAST GRAPH
        ================================================= */}

        <section className="analytics-card analytics-main-chart">

          <div className="analytics-card-header">

            <div>

              <h2>
                Document Request Forecast
              </h2>


              <p>
                Click a month to view its actual and
                predicted request volume.
              </p>

            </div>


            <div className="analytics-legend-note">

              <span className="legend-dot actual" />

              Actual


              <span className="legend-dot predicted" />

              Predicted

            </div>

          </div>


          <div className="prediction-chart">

            <PredictionGraph
              data={
                monthly
              }
              selectedMonth={
                selectedMonth
              }
              onMonthClick={
                (item) =>
                  setSelectedMonth(
                    item.month
                  )
              }
            />

          </div>


          {/* SELECTED MONTH */}

          {selectedMonthData && (

            <div className="prediction-selected-info">


              <div className="prediction-selected-heading">

                <span>
                  SELECTED MONTH
                </span>


                <strong>

                  {selectedMonthData.month}{" "}
                  {year}

                </strong>

              </div>


              <div className="prediction-selected-stat">

                <span>
                  Actual Requests
                </span>


                <strong>

                  {selectedMonthData.actual ===
                  null
                    ? "—"
                    : Number(
                        selectedMonthData.actual
                      ).toLocaleString()}

                </strong>

              </div>


              <div className="prediction-selected-stat">

                <span>
                  Predicted Requests
                </span>


                <strong>

                  {Number(
                    selectedMonthData.predicted ||
                    0
                  ).toLocaleString()}

                </strong>

              </div>


              <div className="prediction-selected-stat">

                <span>
                  Status
                </span>


                <strong
                  className={
                    selectedMonthData.actual ===
                    null
                      ? "forecast-status"
                      : "actual-status"
                  }
                >

                  {selectedMonthData.actual ===
                  null
                    ? "Forecast"
                    : "Actual"}

                </strong>

              </div>

            </div>

          )}

        </section>


        {/* =================================================
            LOWER ANALYTICS
        ================================================= */}

        <section className="analytics-lower-grid">


          {/* DOCUMENT DEMAND */}

          <div className="analytics-card analytics-pie-card">

            <div className="analytics-card-header">

              <div>

                <h2>
                  Document Demand
                </h2>


                <p>
                  Actual request distribution by document type.
                </p>

              </div>

            </div>


            <div className="analytics-document-demand">

              <DocumentDemand
                data={
                  documentTypes
                }
              />

            </div>

          </div>


          {/* SERVICE DEMAND */}

          <div className="analytics-card analytics-bar-card">

            <div className="analytics-card-header">

              <div>

                <h2>
                  Service Demand
                </h2>


                <p>
                  Request volume by document service.
                </p>

              </div>

            </div>


            <div className="analytics-bar-chart">

              <ServiceDemandChart
                data={
                  services
                }
              />

            </div>

          </div>

        </section>


        {/* =================================================
            INSIGHTS
        ================================================= */}

        <section className="analytics-insights-grid">


          {/* DEMAND TREND */}

          <div className="analytics-insight-card">

            <div className="analytics-insight-icon blue">
              ↗
            </div>


            <div>

              <span className="analytics-insight-label">
                DEMAND TREND
              </span>


              <h3>

                {latestActualMonth
                  ? `Latest activity recorded in ${latestActualMonth}`
                  : "No recent request activity"}

              </h3>


              <p>

                {Number(
                  kpis.historical_requests ||
                  0
                ).toLocaleString()}{" "}
                actual document request
                {Number(
                  kpis.historical_requests ||
                  0
                ) === 1
                  ? ""
                  : "s"}{" "}
                recorded in the current analytics period.

              </p>

            </div>

          </div>


          {/* PEAK DEMAND */}

          <div className="analytics-insight-card">

            <div className="analytics-insight-icon orange">
              !
            </div>


            <div>

              <span className="analytics-insight-label">
                PEAK DEMAND
              </span>


              <h3>

                Prepare for{" "}
                {kpis.peak_month ||
                  "future demand"}

              </h3>


              <p>

                The current forecast estimates{" "}
                {Number(
                  kpis.peak_requests ||
                  0
                ).toLocaleString()}{" "}
                request
                {Number(
                  kpis.peak_requests ||
                  0
                ) === 1
                  ? ""
                  : "s"}{" "}
                during{" "}
                {kpis.peak_month ||
                  "the peak month"}.

              </p>

            </div>

          </div>


          {/* DATA SOURCE */}

          <div className="analytics-insight-card">

            <div className="analytics-insight-icon green">
              ✓
            </div>


            <div>

              <span className="analytics-insight-label">
                DATA SOURCE
              </span>


              <h3>
                Live database analytics
              </h3>


              <p>

                Analytics are generated from the{" "}

                <strong>
                  {analytics.source?.table ||
                    "document requests"}
                </strong>{" "}

                table using actual request records.

              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="predictive-footer">

          Barangay Management System

          {" • "}

          Predictive Analytics

          {" • "}

          {year}

        </footer>


      </main>


      {/* =================================================
          LOGOUT MODAL
      ================================================= */}

      <LogoutModal
        isOpen={
          showLogoutModal
        }
        onClose={
          closeLogoutModal
        }
        onConfirm={
          confirmLogout
        }
      />

    </div>

  );

}