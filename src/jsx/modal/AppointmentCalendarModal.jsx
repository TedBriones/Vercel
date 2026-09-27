import React, { useEffect, useState } from "react";

const AppointmentCalendarModal = ({
  isOpen,
  onClose,
  requests = [],
}) => {
  // =========================================================
  // STATES
  // =========================================================

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Always make sure requests is an array
  const appointmentRequests = Array.isArray(requests)
    ? requests
    : [];

  // =========================================================
  // RESET WHEN MODAL OPENS
  // =========================================================

  useEffect(() => {
    if (isOpen) {
      setCurrentDate(new Date());
      setSelectedDate(null);
    }
  }, [isOpen]);

  // =========================================================
  // GET APPOINTMENT DATE
  // =========================================================

  const getAppointmentDate = (request) => {
    if (!request) {
      return null;
    }

    return (
      request.appointmentDate ||
      request.appointment_date ||
      request.date ||
      request.appointmentDateTime ||
      null
    );
  };

  // =========================================================
  // GET APPOINTMENT TIME
  // =========================================================

  const getAppointmentTime = (request) => {
    if (!request) {
      return "No time specified";
    }

    return (
      request.appointmentTime ||
      request.appointment_time ||
      request.time ||
      "No time specified"
    );
  };

  // =========================================================
  // GET DOCUMENT TYPE
  // =========================================================

  const getDocumentType = (request) => {
    if (!request) {
      return "Document Request";
    }

    return (
      request.documentType ||
      request.document_type ||
      request.document ||
      "Document Request"
    );
  };

  // =========================================================
  // CONVERT DATE TO YYYY-MM-DD
  // =========================================================

  const dateToKey = (date) => {
    if (!date) {
      return "";
    }

    // MySQL date:
    // 2026-08-15
    //
    // MySQL datetime:
    // 2026-08-15 10:30:00

    if (typeof date === "string") {
      const match = date.match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );

      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();

    const month = String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      parsedDate.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // FORMAT SELECTED DATE
  // =========================================================

  const formatSelectedDate = (dateKey) => {
    if (!dateKey) {
      return "";
    }

    const parts = dateKey.split("-");

    if (parts.length !== 3) {
      return dateKey;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    const date = new Date(
      year,
      month,
      day
    );

    return date.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  // =========================================================
  // GET APPOINTMENTS FOR SPECIFIC DATE
  // =========================================================

  const getAppointmentsForDate = (dateKey) => {
    if (!dateKey) {
      return [];
    }

    return appointmentRequests.filter(
      (request) => {
        const appointmentDate =
          getAppointmentDate(request);

        return (
          dateToKey(appointmentDate) ===
          dateKey
        );
      }
    );
  };

  // =========================================================
  // CURRENT MONTH
  // =========================================================

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  // =========================================================
  // MONTH NAME
  // =========================================================

  const monthName =
    currentDate.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );

  // =========================================================
  // PREVIOUS MONTH
  // =========================================================

  const previousMonth = () => {
    setCurrentDate(
      new Date(
        year,
        month - 1,
        1
      )
    );

    setSelectedDate(null);
  };

  // =========================================================
  // NEXT MONTH
  // =========================================================

  const nextMonth = () => {
    setCurrentDate(
      new Date(
        year,
        month + 1,
        1
      )
    );

    setSelectedDate(null);
  };

  // =========================================================
  // TODAY
  // =========================================================

  const goToToday = () => {
    const today = new Date();

    setCurrentDate(today);

    const todayKey = dateToKey(today);

    setSelectedDate(todayKey);
  };

  // =========================================================
  // TODAY KEY
  // =========================================================
const today = new Date();

const todayKey = dateToKey(today);

// =========================================================
// MINIMUM ALLOWED MONTH
// Resident can view up to 6 months in the past
// =========================================================

const minimumDate = new Date(
  today.getFullYear(),
  today.getMonth() - 6,
  1
);

const minimumYear =
  minimumDate.getFullYear();

const minimumMonth =
  minimumDate.getMonth();

  // =========================================================
  // LOAD LEVEL
  // =========================================================

  const getLoadLevel = (count) => {
    if (count === 0) {
      return {
        text: "No appointments",
        className: "calendar-load-none",
      };
    }

    if (count <= 2) {
      return {
        text: "Low",
        className: "calendar-load-low",
      };
    }

    if (count <= 4) {
      return {
        text: "Medium",
        className: "calendar-load-medium",
      };
    }

    return {
      text: "High",
      className: "calendar-load-high",
    };
  };

  // =========================================================
  // BACKDROP
  // =========================================================

  const handleBackdropClick = (event) => {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose();
    }
  };

  // =========================================================
  // DON'T RENDER
  // =========================================================

  if (!isOpen) {
    return null;
  }

  // =========================================================
  // BUILD CALENDAR
  // =========================================================

  const calendarDays = [];

  // Empty cells before first day
  for (
    let i = 0;
    i < firstDay;
    i++
  ) {
    calendarDays.push(
      <div
        key={`empty-${i}`}
        className="appointment-calendar-day empty"
      />
    );
  }

  // Actual days
  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    const dateKey =
      `${year}-${String(
        month + 1
      ).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

    // IMPORTANT:
    // Get appointments specifically
    // belonging to this date.
    const appointments =
      getAppointmentsForDate(
        dateKey
      );

    const appointmentCount =
      appointments.length;

    const isToday =
      dateKey === todayKey;

    const isSelected =
      dateKey === selectedDate;

    const load =
      getLoadLevel(
        appointmentCount
      );

    calendarDays.push(
      <button
        key={dateKey}
        type="button"
        className={`appointment-calendar-day ${
          isToday
            ? "calendar-day-today"
            : ""
        } ${
          isSelected
            ? "calendar-day-selected"
            : ""
        } ${
          appointmentCount > 0
            ? "calendar-day-has-appointments"
            : ""
        }`}
        onClick={() =>
          setSelectedDate(
            dateKey
          )
        }
      >
        <span className="calendar-day-number">
          {day}
        </span>

        {/* =========================================
            APPOINTMENT COUNT
        ========================================= */}

        {appointmentCount > 0 && (
          <span
            className={`calendar-appointment-dot ${
              load.className
            }`}
            title={`${appointmentCount} appointment${
              appointmentCount !== 1
                ? "s"
                : ""
            }`}
          >
            {appointmentCount}
          </span>
        )}

        {/* No appointment indicator */}

        {appointmentCount === 0 && (
          <span className="calendar-no-appointment-dot">
            -
          </span>
        )}
      </button>
    );
  }

  // =========================================================
  // SELECTED DATE APPOINTMENTS
  // =========================================================

  const selectedAppointments =
    getAppointmentsForDate(
      selectedDate
    );

  // =========================================================
  // MONTHLY APPOINTMENTS
  // =========================================================

  const monthPrefix =
    `${year}-${String(
      month + 1
    ).padStart(2, "0")}`;

  const monthlyAppointments =
    appointmentRequests.filter(
      (request) => {
        const appointmentDate =
          getAppointmentDate(
            request
          );

        const key =
          dateToKey(
            appointmentDate
          );

        return (
          key &&
          key.startsWith(
            monthPrefix
          )
        );
      }
    );

  const monthlyCount =
    monthlyAppointments.length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="appointment-calendar-overlay"
      onClick={
        handleBackdropClick
      }
    >
      <div className="appointment-calendar-modal">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="appointment-calendar-modal-header">

          <div>
            <span className="calendar-modal-label">
              APPOINTMENT SCHEDULE
            </span>

            <h2>
              📅 Appointment Calendar
            </h2>

            <p>
              Select a date to see the
              appointments scheduled for
              that day.
            </p>
          </div>

          <button
            type="button"
            className="calendar-modal-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        {/* =================================================
            MONTH CONTROLS
        ================================================= */}

        <div className="appointment-calendar-controls">

          <button
            type="button"
            onClick={
              previousMonth
            }
            className="calendar-nav-button"
          >
            ‹
          </button>

          <div className="calendar-month-title">

            <strong>
              {monthName}
            </strong>

            <button
              type="button"
              className="calendar-today-button"
              onClick={
                goToToday
              }
            >
              Today
            </button>

          </div>

          <button
            type="button"
            onClick={
              nextMonth
            }
            className="calendar-nav-button"
          >
            ›
          </button>

        </div>

        {/* =================================================
            MONTH SUMMARY
        ================================================= */}

        <div className="calendar-month-summary">

          <div>
            <span>
              Appointments this month
            </span>

            <strong>
              {monthlyCount}
            </strong>
          </div>

          <div className="calendar-legend">

            <span>
              <i className="legend-low"></i>
              Low
            </span>

            <span>
              <i className="legend-medium"></i>
              Medium
            </span>

            <span>
              <i className="legend-high"></i>
              High
            </span>

          </div>

        </div>

        {/* =================================================
            CALENDAR
        ================================================= */}

        <div className="appointment-calendar">

          <div className="calendar-weekdays">

            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>

          </div>

          <div className="calendar-days">

            {calendarDays}

          </div>

        </div>

        {/* =================================================
            SELECTED DATE
        ================================================= */}

        {selectedDate && (
          <div className="calendar-selected-section">

            <div className="calendar-selected-header">

              <div>

                <span>
                  SELECTED DATE
                </span>

                <h3>
                  {formatSelectedDate(
                    selectedDate
                  )}
                </h3>

              </div>

              {/* ==========================================
                  NUMBER OF APPOINTMENTS
              ========================================== */}

              <div className="calendar-selected-count">

                <span>
                  APPOINTMENTS
                </span>

                <strong>
                  {
                    selectedAppointments.length
                  }
                </strong>

              </div>

            </div>

            {/* ==========================================
                LOAD BADGE
            ========================================== */}

            <div
              className={`calendar-load-badge ${
                getLoadLevel(
                  selectedAppointments.length
                ).className
              }`}
            >
              {
                getLoadLevel(
                  selectedAppointments.length
                ).text
              }
            </div>

            {/* ==========================================
                NO APPOINTMENTS
            ========================================== */}

            {selectedAppointments.length ===
            0 ? (
              <div className="calendar-no-appointments">

                <span>
                  ✓
                </span>

                <div>

                  <strong>
                    No appointments scheduled
                  </strong>

                  <p>
                    This date currently has
                    no appointments.
                  </p>

                </div>

              </div>
            ) : (

              /* ==========================================
                  APPOINTMENT LIST
              ========================================== */

              <div className="calendar-selected-appointments">

                <p className="calendar-appointment-summary">

                  <strong>
                    {
                      selectedAppointments.length
                    }
                  </strong>

                  {" "}
                  appointment
                  {
                    selectedAppointments.length !==
                    1
                      ? "s"
                      : ""
                  }{" "}
                  scheduled for this date.

                </p>

                {selectedAppointments.map(
                  (
                    appointment,
                    index
                  ) => {

                    const documentType =
                      getDocumentType(
                        appointment
                      );

                    const time =
                      getAppointmentTime(
                        appointment
                      );

                    const purpose =
                      appointment.purpose ||
                      "No purpose provided.";

                    return (
                      <div
                        className="calendar-appointment-item"
                        key={
                          appointment.id ||
                          appointment.request_id ||
                          index
                        }
                      >

                        <div className="calendar-appointment-icon">
                          📄
                        </div>

                        <div className="calendar-appointment-info">

                          <strong>
                            {documentType}
                          </strong>

                          <span>
                            🕐 {time}
                          </span>

                          <small>
                            {purpose}
                          </small>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="appointment-calendar-modal-footer">

          <p>
            💡 Click any date to see how many
            appointments are scheduled.
          </p>

          <button
            type="button"
            className="calendar-close-button"
            onClick={onClose}
          >
            Close Calendar
          </button>

        </div>

      </div>
    </div>
  );
};

export default AppointmentCalendarModal;