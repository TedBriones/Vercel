import React, { useMemo } from "react";

const PredictiveAnalyticsModal = ({
  isOpen,
  onClose,
  requests = [],
}) => {
  // =========================================================
  // NORMALIZE STATUS
  // =========================================================

  const getStatus = (appointment) => {
    return String(appointment?.status || "Pending")
      .trim()
      .toLowerCase();
  };

  // =========================================================
  // NORMALIZE DOCUMENT
  // =========================================================

  const getDocument = (appointment) => {
    return (
      appointment?.document ||
      appointment?.documentType ||
      appointment?.document_type ||
      "Document Request"
    );
  };

  // =========================================================
  // NORMALIZE DATE
  // =========================================================

  const getAppointmentDate = (appointment) => {
    return (
      appointment?.appointmentDate ||
      appointment?.appointment_date ||
      appointment?.date ||
      ""
    );
  };

  // =========================================================
  // NORMALIZE TIME
  // =========================================================

  const getAppointmentTime = (appointment) => {
    return (
      appointment?.appointmentTime ||
      appointment?.appointment_time ||
      ""
    );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "N/A";
    }

    const date = new Date(
      `${String(dateValue).substring(0, 10)}T00:00:00`
    );

    if (isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
  // DATE HELPERS
  // =========================================================

  const getDateOnly = (value) => {
    if (!value) {
      return null;
    }

    const dateString = String(value).substring(0, 10);

    const date = new Date(`${dateString}T00:00:00`);

    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  // =========================================================
  // TODAY
  // =========================================================

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }, []);

  // =========================================================
  // ANALYTICS
  // =========================================================

  const analytics = useMemo(() => {
    const list = Array.isArray(requests) ? requests : [];

    // =======================================================
    // BASIC COUNTS
    // =======================================================

    const total = list.length;

    const approved = list.filter(
      (appointment) =>
        getStatus(appointment) === "approved"
    ).length;

    const rejected = list.filter(
      (appointment) =>
        getStatus(appointment) === "rejected"
    ).length;

    const pending = list.filter(
      (appointment) =>
        getStatus(appointment) === "pending"
    ).length;

    const cancelled = list.filter((appointment) => {
      const status = getStatus(appointment);

      return (
        status === "cancelled" ||
        status === "canceled"
      );
    }).length;

    const completed = list.filter(
      (appointment) =>
        getStatus(appointment) === "completed"
    ).length;

    // =======================================================
    // UPCOMING APPOINTMENTS
    // =======================================================

    const upcoming = list.filter((appointment) => {
      const date = getDateOnly(
        getAppointmentDate(appointment)
      );

      if (!date) {
        return false;
      }

      const status = getStatus(appointment);

      return (
        date >= today &&
        status !== "cancelled" &&
        status !== "canceled" &&
        status !== "rejected"
      );
    });

    // =======================================================
    // COMPLETION RATE
    // =======================================================

    const completedOrFinished =
      completed +
      cancelled +
      rejected;

    const completionRate =
      completedOrFinished > 0
        ? Math.round(
            (completed / completedOrFinished) * 100
          )
        : 0;

    // =======================================================
    // APPROVAL RATE
    // =======================================================

    const decided = approved + rejected;

    const approvalRate =
      decided > 0
        ? Math.round(
            (approved / decided) * 100
          )
        : 0;

    // =======================================================
    // CANCELLATION RATE
    // =======================================================

    const cancellationRate =
      total > 0
        ? Math.round(
            (cancelled / total) * 100
          )
        : 0;

    // =======================================================
    // DOCUMENT FREQUENCY
    // =======================================================

    const documentCounts = {};

    list.forEach((appointment) => {
      const document = getDocument(appointment);

      documentCounts[document] =
        (documentCounts[document] || 0) + 1;
    });

    let mostRequestedDocument = "No data";
    let highestDocumentCount = 0;

    Object.entries(documentCounts).forEach(
      ([document, count]) => {
        if (count > highestDocumentCount) {
          highestDocumentCount = count;
          mostRequestedDocument = document;
        }
      }
    );

    // =======================================================
    // TIME FREQUENCY
    // =======================================================

    const timeCounts = {};

    list.forEach((appointment) => {
      const time =
        getAppointmentTime(appointment);

      if (!time) {
        return;
      }

      const parts = String(time).split(":");

      if (parts.length < 2) {
        return;
      }

      let hour = parseInt(parts[0], 10);

      if (isNaN(hour)) {
        return;
      }

      const period = hour >= 12 ? "PM" : "AM";

      hour = hour % 12;

      if (hour === 0) {
        hour = 12;
      }

      const timeLabel = `${hour}:00 ${period}`;

      timeCounts[timeLabel] =
        (timeCounts[timeLabel] || 0) + 1;
    });

    let mostCommonTime = "No data";
    let highestTimeCount = 0;

    Object.entries(timeCounts).forEach(
      ([time, count]) => {
        if (count > highestTimeCount) {
          highestTimeCount = count;
          mostCommonTime = time;
        }
      }
    );

    // =======================================================
    // MONTHLY COUNTS
    // =======================================================

    const monthlyCounts = {};

    list.forEach((appointment) => {
      const date = getDateOnly(
        getAppointmentDate(appointment)
      );

      if (!date) {
        return;
      }

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      monthlyCounts[key] =
        (monthlyCounts[key] || 0) + 1;
    });

    const monthlyValues =
      Object.values(monthlyCounts);

    const averageAppointmentsPerMonth =
      monthlyValues.length > 0
        ? (
            monthlyValues.reduce(
              (sum, value) => sum + value,
              0
            ) / monthlyValues.length
          ).toFixed(1)
        : "0";

    // =======================================================
    // RECENT MONTH / TREND
    // =======================================================

    const sortedMonths =
      Object.entries(monthlyCounts).sort(
        ([a], [b]) => a.localeCompare(b)
      );

    const latestMonth =
      sortedMonths.length > 0
        ? sortedMonths[
            sortedMonths.length - 1
          ][1]
        : 0;

    const previousMonth =
      sortedMonths.length > 1
        ? sortedMonths[
            sortedMonths.length - 2
          ][1]
        : 0;

    let trend = "Stable";

    if (latestMonth > previousMonth) {
      trend = "Increasing";
    } else if (latestMonth < previousMonth) {
      trend = "Decreasing";
    }

    // =======================================================
    // NEXT APPOINTMENT
    // =======================================================

    const sortedUpcoming = [...upcoming].sort(
      (a, b) => {
        const dateA = getDateOnly(
          getAppointmentDate(a)
        );

        const dateB = getDateOnly(
          getAppointmentDate(b)
        );

        if (!dateA || !dateB) {
          return 0;
        }

        return dateA - dateB;
      }
    );

    const nextAppointment =
      sortedUpcoming.length > 0
        ? sortedUpcoming[0]
        : null;

    // =======================================================
    // PREDICTION
    // =======================================================

    let predictionTitle =
      "Insufficient Data";

    let predictionMessage =
      "More appointment history is needed before a reliable prediction can be made.";

    let predictionLevel = "neutral";

    let predictionIcon = "📊";

    if (total === 0) {
      predictionTitle =
        "No Appointment History";

      predictionMessage =
        "There is currently no appointment history available for predictive analysis.";

      predictionLevel = "neutral";

      predictionIcon = "📭";
    } else if (total < 3) {
      predictionTitle =
        "Limited Historical Data";

      predictionMessage =
        "Only a small number of appointments are available. Continue using the appointment system to improve prediction accuracy.";

      predictionLevel = "neutral";

      predictionIcon = "📊";
    } else if (cancellationRate >= 30) {
      predictionTitle =
        "Higher Cancellation Risk";

      predictionMessage =
        "Based on the historical appointment pattern, there may be an increased likelihood of appointment cancellations. Consider confirming the appointment before the scheduled date.";

      predictionLevel = "warning";

      predictionIcon = "⚠️";
    } else if (
      approvalRate >= 70 &&
      cancellationRate < 15
    ) {
      predictionTitle =
        "Favorable Appointment Pattern";

      predictionMessage =
        "Historical appointment behavior shows a favorable pattern with a high approval rate and relatively low cancellation activity.";

      predictionLevel = "positive";

      predictionIcon = "📈";
    } else if (trend === "Increasing") {
      predictionTitle =
        "Increasing Appointment Activity";

      predictionMessage =
        "Appointment activity has recently increased. Additional appointment requests may occur if this trend continues.";

      predictionLevel = "positive";

      predictionIcon = "📈";
    } else if (trend === "Decreasing") {
      predictionTitle =
        "Decreasing Appointment Activity";

      predictionMessage =
        "Recent appointment activity has decreased compared with the previous recorded period.";

      predictionLevel = "neutral";

      predictionIcon = "📉";
    } else {
      predictionTitle =
        "Stable Appointment Activity";

      predictionMessage =
        "The available appointment history does not show a strong increase or decrease in activity.";

      predictionLevel = "neutral";

      predictionIcon = "📊";
    }

    // =======================================================
    // NEXT MONTH ESTIMATE
    // =======================================================

    let estimatedNextMonth = 0;

    if (
      Number(averageAppointmentsPerMonth) > 0
    ) {
      estimatedNextMonth = Math.max(
        1,
        Math.round(
          Number(averageAppointmentsPerMonth)
        )
      );
    }

    return {
      total,
      approved,
      rejected,
      pending,
      cancelled,
      completed,
      upcoming,
      completionRate,
      approvalRate,
      cancellationRate,
      mostRequestedDocument,
      highestDocumentCount,
      mostCommonTime,
      averageAppointmentsPerMonth,
      trend,
      nextAppointment,
      predictionTitle,
      predictionMessage,
      predictionLevel,
      predictionIcon,
      estimatedNextMonth,
    };
  }, [requests, today]);

  // =========================================================
  // OVERLAY CLICK
  // =========================================================

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

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
      className="predictive-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="predictive-modal">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="predictive-modal-header">

          <div className="predictive-modal-title">

            <div className="predictive-modal-icon">
              📊
            </div>

            <div>
              <p>
                APPOINTMENT INTELLIGENCE
              </p>

              <h2>
                Predictive Analytics
              </h2>

              <span>
                Insights based on your
                appointment history
              </span>
            </div>

          </div>

          <button
            type="button"
            className="predictive-modal-close"
            onClick={onClose}
            aria-label="Close predictive analytics"
          >
            ×
          </button>

        </div>

        {/* ===================================================
            PREDICTION
        =================================================== */}

        <div
          className={`predictive-main-card ${analytics.predictionLevel}`}
        >

          <div className="predictive-main-icon">
            {analytics.predictionIcon}
          </div>

          <div>

            <span>
              CURRENT PREDICTION
            </span>

            <h3>
              {analytics.predictionTitle}
            </h3>

            <p>
              {analytics.predictionMessage}
            </p>

          </div>

        </div>

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <div className="predictive-stats-grid">

          <div className="predictive-stat-card">

            <span className="predictive-stat-icon">
              📋
            </span>

            <div>
              <small>
                TOTAL APPOINTMENTS
              </small>

              <strong>
                {analytics.total}
              </strong>
            </div>

          </div>

          <div className="predictive-stat-card">

            <span className="predictive-stat-icon">
              ✓
            </span>

            <div>
              <small>
                APPROVAL RATE
              </small>

              <strong>
                {analytics.approvalRate}%
              </strong>
            </div>

          </div>

          <div className="predictive-stat-card">

            <span className="predictive-stat-icon">
              ✕
            </span>

            <div>
              <small>
                CANCELLATION RATE
              </small>

              <strong>
                {analytics.cancellationRate}%
              </strong>
            </div>

          </div>

          <div className="predictive-stat-card">

            <span className="predictive-stat-icon">
              📅
            </span>

            <div>
              <small>
                UPCOMING
              </small>

              <strong>
                {analytics.upcoming.length}
              </strong>
            </div>

          </div>

        </div>

        {/* ===================================================
            APPOINTMENT PATTERNS
        =================================================== */}

        <div className="predictive-section">

          <div className="predictive-section-title">

            <span>
              🔎
            </span>

            <div>
              <h3>
                Appointment Patterns
              </h3>

              <p>
                Patterns detected from your
                recorded appointments.
              </p>
            </div>

          </div>

          <div className="predictive-details-grid">

            <div className="predictive-detail-card">

              <span>
                Most Requested Document
              </span>

              <strong>
                {analytics.mostRequestedDocument}
              </strong>

              <small>
                {analytics.highestDocumentCount}{" "}
                recorded request
                {analytics.highestDocumentCount !== 1
                  ? "s"
                  : ""}
              </small>

            </div>

            <div className="predictive-detail-card">

              <span>
                Most Common Appointment Time
              </span>

              <strong>
                {analytics.mostCommonTime}
              </strong>

              <small>
                Based on recorded
                appointment times
              </small>

            </div>

            <div className="predictive-detail-card">

              <span>
                Average Monthly Activity
              </span>

              <strong>
                {analytics.averageAppointmentsPerMonth}
              </strong>

              <small>
                appointments per recorded month
              </small>

            </div>

            <div className="predictive-detail-card">

              <span>
                Activity Trend
              </span>

              <strong>
                {analytics.trend}
              </strong>

              <small>
                Compared with the previous
                recorded period
              </small>

            </div>

          </div>

        </div>

        {/* ===================================================
            NEXT APPOINTMENT
        =================================================== */}

        <div className="predictive-section">

          <div className="predictive-section-title">

            <span>
              🗓️
            </span>

            <div>
              <h3>
                Next Appointment
              </h3>

              <p>
                Your nearest upcoming appointment.
              </p>
            </div>

          </div>

          {analytics.nextAppointment ? (

            <div className="predictive-next-appointment">

              <div className="predictive-next-icon">
                📅
              </div>

              <div>

                <span>
                  {getDocument(
                    analytics.nextAppointment
                  )}
                </span>

                <strong>
                  {formatDate(
                    getAppointmentDate(
                      analytics.nextAppointment
                    )
                  )}
                </strong>

                <small>
                  {formatTime(
                    getAppointmentTime(
                      analytics.nextAppointment
                    )
                  )}
                </small>

              </div>

            </div>

          ) : (

            <div className="predictive-no-data">
              📭 No upcoming appointment is
              currently scheduled.
            </div>

          )}

        </div>

        {/* ===================================================
            FORECAST
        =================================================== */}

        <div className="predictive-forecast">

          <div className="predictive-forecast-icon">
            🔮
          </div>

          <div>

            <span>
              ESTIMATED NEXT-PERIOD ACTIVITY
            </span>

            <h3>
              Approximately{" "}
              {analytics.estimatedNextMonth}{" "}
              appointment
              {analytics.estimatedNextMonth !== 1
                ? "s"
                : ""}
            </h3>

            <p>
              This estimate is based on the
              average number of appointments
              recorded across the available
              historical periods.
            </p>

          </div>

        </div>

        {/* ===================================================
            DISCLAIMER
        =================================================== */}

        <div className="predictive-disclaimer">

          <span>
            ℹ️
          </span>

          <p>
            Predictive analytics are estimates
            generated from available appointment
            history. They are intended to provide
            informational insights and should not
            be treated as guaranteed outcomes.
          </p>

        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="predictive-modal-footer">

          <button
            type="button"
            className="predictive-close-button"
            onClick={onClose}
          >
            Close Analytics
          </button>

        </div>

      </div>
    </div>
  );
};

export default PredictiveAnalyticsModal;