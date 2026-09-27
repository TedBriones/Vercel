import React, {
  useEffect,
  useState
} from "react";

import "../App.css";

import AppointmentCalendarModal
  from "./modal/AppointmentCalendarModal";

import PredictiveAnalyticsModal
  from "./modal/PredictiveAnalyticsModal";

const APPOINTMENTS_API =
  "http://localhost/barangay-api/resident_appointments.php";

const PROFILE_API =
  "http://localhost/barangay-api/profile.php";

const Appointments = ({
  setCurrentPage
}) => {

  // =========================================================
  // STATE
  // =========================================================

  const [
    requests,
    setRequests
  ] = useState([]);

  const [
    residentName,
    setResidentName
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    showCalendar,
    setShowCalendar
  ] = useState(false);

  const [
    showPredictiveAnalytics,
    setShowPredictiveAnalytics
  ] = useState(false);


  // =========================================================
  // CURRENT LOGGED-IN RESIDENT
  // =========================================================

  const residentId =
    localStorage.getItem("residentId");


  // =========================================================
  // DEBUG CURRENT SESSION
  // =========================================================

  useEffect(() => {

    console.log(
      "================================="
    );

    console.log(
      "APPOINTMENT PAGE"
    );

    console.log(
      "Resident ID:",
      residentId
    );

    console.log(
      "Resident Name:",
      localStorage.getItem(
        "residentName"
      )
    );

    console.log(
      "Email:",
      localStorage.getItem(
        "userEmail"
      )
    );

    console.log(
      "Role:",
      localStorage.getItem(
        "userRole"
      )
    );

    console.log(
      "Logged In:",
      localStorage.getItem(
        "loggedIn"
      )
    );

    console.log(
      "================================="
    );

  }, [residentId]);


  // =========================================================
  // FETCH RESIDENT PROFILE
  // =========================================================

  useEffect(() => {

    if (!residentId) {

      setError(
        "Resident ID not found. Please login again."
      );

      setLoading(false);

      return;
    }


    const fetchProfile =
      async () => {

        try {

          const response =
            await fetch(
              `${PROFILE_API}?resident_id=${encodeURIComponent(
                residentId
              )}`,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json"
                }
              }
            );


          const responseText =
            await response.text();


          console.log(
            "Appointment Profile Response:",
            responseText
          );


          const data =
            JSON.parse(
              responseText
            );


          if (
            data.success &&
            data.resident
          ) {

            const resident =
              data.resident;


            const fullName = [

              resident.first_name,

              resident.middle_name,

              resident.last_name

            ]
              .filter(Boolean)
              .join(" ");


            setResidentName(
              fullName ||
              "Resident"
            );


            console.log(
              "PROFILE RESIDENT ID:",
              resident.id
            );


            console.log(
              "PROFILE RESIDENT NAME:",
              fullName
            );

          } else {

            console.error(
              "Profile API:",
              data.message
            );

          }

        } catch (error) {

          console.error(
            "Profile loading error:",
            error
          );

        }

      };


    fetchProfile();

  }, [residentId]);


  // =========================================================
  // FETCH CURRENT RESIDENT'S APPOINTMENTS
  // =========================================================

  useEffect(() => {

    if (!residentId) {

      setRequests([]);

      setLoading(false);

      return;
    }


    const fetchAppointments =
      async () => {

        try {

          setLoading(true);

          setError("");


          console.log(
            "================================="
          );

          console.log(
            "FETCHING RESIDENT APPOINTMENTS"
          );

          console.log(
            "Resident ID:",
            residentId
          );

          console.log(
            "API:",
            APPOINTMENTS_API
          );

          console.log(
            "================================="
          );


          const url =
            `${APPOINTMENTS_API}?resident_id=${encodeURIComponent(
              residentId
            )}`;


          console.log(
            "Appointment URL:",
            url
          );


          const response =
            await fetch(
              url,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json"
                }
              }
            );


          console.log(
            "Appointment HTTP status:",
            response.status
          );


          const responseText =
            await response.text();


          console.log(
            "Appointment raw response:",
            responseText
          );


          let data;


          try {

            data =
              JSON.parse(
                responseText
              );

          } catch (parseError) {

            console.error(
              "Invalid appointment JSON:",
              parseError
            );

            throw new Error(
              "Appointment API returned invalid JSON."
            );

          }


          console.log(
            "Appointment API DATA:",
            data
          );


          // =====================================================
          // VERIFY RESIDENT ID
          // =====================================================

          if (
            Number(data.residentId) !==
            Number(residentId)
          ) {

            console.error(
              "RESIDENT ID MISMATCH!"
            );

            console.error(
              "Frontend resident ID:",
              residentId
            );

            console.error(
              "Backend resident ID:",
              data.residentId
            );


            setRequests([]);

            setError(
              "Resident account mismatch detected. Please log in again."
            );

            return;
          }


          if (
            response.ok &&
            data.success
          ) {

            const appointmentList =
              Array.isArray(
                data.appointments
              )
                ? data.appointments
                : [];


            // =====================================================
            // SECOND SAFETY CHECK
            // =====================================================

            const currentResidentAppointments =
              appointmentList.filter(
                (appointment) =>
                  Number(
                    appointment.residentId
                  ) ===
                  Number(residentId)
              );


            console.log(
              "All current resident appointments:",
              currentResidentAppointments
            );


            // =====================================================
            // REMOVE CANCELLED APPOINTMENTS
            // =====================================================

            const activeAppointments =
              currentResidentAppointments.filter(
                (appointment) => {

                  const status =
                    String(
                      appointment.status ||
                      "Pending"
                    )
                      .trim()
                      .toLowerCase();


                  const isCancelled =
                    status === "cancelled" ||
                    status === "canceled";


                  return !isCancelled;

                }
              );


            console.log(
              "Active appointments:",
              activeAppointments
            );


            console.log(
              "Cancelled appointments hidden:",
              currentResidentAppointments.filter(
                (appointment) => {

                  const status =
                    String(
                      appointment.status ||
                      ""
                    )
                      .trim()
                      .toLowerCase();


                  return (
                    status === "cancelled" ||
                    status === "canceled"
                  );

                }
              )
            );


            setRequests(
              activeAppointments
            );

          } else {

            setRequests([]);

            setError(
              data.message ||
              "No appointments found."
            );

          }

        } catch (error) {

          console.error(
            "Appointments loading error:",
            error
          );


          setRequests([]);


          setError(
            error.message ||
            "Cannot connect to the appointment API."
          );

        } finally {

          setLoading(false);

        }

      };


    fetchAppointments();

  }, [residentId]);


  // =========================================================
  // BACK TO DASHBOARD
  // =========================================================

  const handleBack = () => {

    setCurrentPage(
      "dashboard"
    );

  };


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate =
    (dateValue) => {

      if (!dateValue) {

        return "N/A";

      }


      const date =
        new Date(
          dateValue
        );


      if (
        isNaN(
          date.getTime()
        )
      ) {

        return dateValue;

      }


      return date.toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      );

    };


  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime =
    (timeValue) => {

      if (!timeValue) {

        return "N/A";

      }


      const parts =
        String(
          timeValue
        ).split(":");


      if (
        parts.length >= 2
      ) {

        let hours =
          parseInt(
            parts[0],
            10
          );


        const minutes =
          parts[1];


        if (
          isNaN(hours)
        ) {

          return timeValue;

        }


        const period =
          hours >= 12
            ? "PM"
            : "AM";


        hours =
          hours % 12;


        if (
          hours === 0
        ) {

          hours = 12;

        }


        return `${hours}:${minutes} ${period}`;

      }


      return timeValue;

    };


  // =========================================================
  // CHECK PAST APPOINTMENT
  // =========================================================

  const isPastAppointment =
    (dateValue) => {

      if (!dateValue) {

        return false;

      }


      const appointmentDate =
        String(
          dateValue
        ).substring(
          0,
          10
        );


      const today =
        new Date();


      const year =
        today.getFullYear();


      const month =
        String(
          today.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const day =
        String(
          today.getDate()
        ).padStart(
          2,
          "0"
        );


      const todayString =
        `${year}-${month}-${day}`;


      return (
        appointmentDate <
        todayString
      );

    };


  // =========================================================
  // CHECK CANCELLED APPOINTMENT
  // =========================================================

  const isCancelledAppointment =
    (appointment) => {

      if (!appointment) {

        return false;

      }


      const status =
        String(
          appointment.status ||
          ""
        )
          .trim()
          .toLowerCase();


      return (
        status === "cancelled" ||
        status === "canceled"
      );

    };


  // =========================================================
  // UPCOMING ACTIVE APPOINTMENTS
  // =========================================================

  const upcomingRequests =
    requests.filter(
      (request) => {

        // Do not show cancelled appointments
        if (
          isCancelledAppointment(
            request
          )
        ) {

          return false;

        }


        // Do not show past appointments
        if (
          isPastAppointment(
            request.appointmentDate
          )
        ) {

          return false;

        }


        return true;

      }
    );


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="document-request-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="document-page-header">

        <div className="document-page-header-left">

          <div className="document-page-icon">
            📅
          </div>


          <div>

            <p className="document-page-label">
              RESIDENT PORTAL
            </p>


            <h1>
              Appointments
            </h1>


            <p className="document-page-description">
              Manage and monitor your document appointments.
            </p>

          </div>

        </div>


        {/* HEADER BUTTONS */}

        <div className="appointments-header-actions">

          {/* PREDICTIVE ANALYTICS BUTTON 

          <button
            type="button"
            className="predictive-analytics-button"
            onClick={() =>
              setShowPredictiveAnalytics(true)
            }
            disabled={!residentId}
          >

            <span>
              📊
            </span>

            Predictive Analytics

          </button>*/}


          {/* CALENDAR BUTTON */}

          <button
            type="button"
            className="create-document-button"
            onClick={() =>
              setShowCalendar(true)
            }
            disabled={!residentId}
          >

            <span className="create-document-icon">
              ＋
            </span>

            View Appointment Calendar

          </button>

        </div>

      </div>


      {/* =====================================================
          RESIDENT INFORMATION
      ===================================================== */}

      <div className="resident-summary-card">

        <div className="resident-summary-avatar">

          {residentName
            ? residentName
                .charAt(0)
                .toUpperCase()
            : "R"}

        </div>


        <div className="resident-summary-info">

          <span>
            Logged in as
          </span>


          <strong>
            {residentName ||
              "Resident"}
          </strong>


          <small>
            Resident ID:{" "}
            {residentId ||
              "N/A"}
          </small>

        </div>


        <div className="resident-summary-priority">

          <span>
            Upcoming Appointments
          </span>


          <strong>
            {upcomingRequests.length}
          </strong>

        </div>

      </div>


      {/* =====================================================
          APPOINTMENT SECTION
      ===================================================== */}

      <section className="my-document-requests-section">

        <div className="document-section-header">

          <div>

            <p className="section-label">
              APPOINTMENT SCHEDULE
            </p>


            <h2>
              My Appointments
            </h2>


            <p>
              Track your upcoming document appointment schedules.
            </p>

          </div>


          <button
            type="button"
            className="document-refresh-button"
            onClick={() => {
              window.location.reload();
            }}
            disabled={
              loading ||
              !residentId
            }
          >

            {loading
              ? "Refreshing..."
              : "🔄 Refresh"}

          </button>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="document-request-empty">

            <div className="document-empty-icon">
              ⏳
            </div>


            <h3>
              Loading your appointments...
            </h3>


            <p>
              Please wait while we retrieve your appointment schedules.
            </p>

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {!loading &&
          error && (

            <div className="document-request-empty">

              <div className="document-empty-icon">
                ⚠️
              </div>


              <h3>
                Unable to Load Appointments
              </h3>


              <p>
                {error}
              </p>

            </div>

          )}


        {/* =================================================
            NO UPCOMING APPOINTMENTS
        ================================================= */}

        {!loading &&
          !error &&
          upcomingRequests.length === 0 && (

            <div className="document-request-empty">

              <div className="document-empty-icon">
                📭
              </div>


              <h3>
                No Upcoming Appointments
              </h3>


              <p>
                You don't have any upcoming appointments.
              </p>


              <button
                type="button"
                className="empty-create-button"
                onClick={() =>
                  setShowCalendar(true)
                }
              >

                📅 View Appointment Calendar

              </button>

            </div>

          )}


        {/* =================================================
            ACTIVE APPOINTMENT CARDS
        ================================================= */}

        {!loading &&
          !error &&
          upcomingRequests.length > 0 && (

            <div className="resident-request-grid">

              {upcomingRequests.map(
                (appointment) => {

                  const appointmentStatus =
                    String(
                      appointment.status ||
                      "Pending"
                    )
                      .trim()
                      .toLowerCase();


                  const statusClass =
                    appointmentStatus === "approved"
                      ? "status-approved"
                      : appointmentStatus === "rejected"
                        ? "status-rejected"
                        : "status-pending";


                  const statusIcon =
                    appointmentStatus === "approved"
                      ? "✓"
                      : appointmentStatus === "rejected"
                        ? "✕"
                        : "⏳";


                  return (

                    <div
                      className="resident-document-card"
                      key={
                        appointment.id
                      }
                    >

                      {/* CARD TOP */}

                      <div className="resident-document-card-top">

                        <div className="resident-document-title">

                          <div className="resident-document-icon">
                            📅
                          </div>


                          <div>

                            <span>
                              Appointment #
                              {appointment.id}
                            </span>


                            <h3>

                              {appointment.document ||
                                appointment.documentType ||
                                appointment.document_type ||
                                "Document Request"}

                            </h3>

                          </div>

                        </div>


                        {/* STATUS */}

                        <span
                          className={`resident-request-status ${statusClass}`}
                        >

                          <span>
                            {statusIcon}
                          </span>


                          {appointment.status ||
                            "Pending"}

                        </span>

                      </div>


                      {/* APPOINTMENT DETAILS */}

                      <div className="resident-document-details">

                        <div className="resident-detail">

                          <span>
                            📅 Appointment
                          </span>


                          <strong>

                            {formatDate(
                              appointment.appointmentDate
                            )}

                          </strong>

                        </div>


                        <div className="resident-detail">

                          <span>
                            🕐 Time
                          </span>


                          <strong>

                            {formatTime(
                              appointment.appointmentTime
                            )}

                          </strong>

                        </div>


                        <div className="resident-detail">

                          <span>
                            ⭐ Priority
                          </span>


                          <strong>

                            {appointment.priority ||
                              "Regular"}

                          </strong>

                        </div>

                      </div>


                      {/* PURPOSE */}

                      <div className="resident-request-purpose">

                        <span>
                          Purpose
                        </span>


                        <p>

                          {appointment.purpose ||
                            "No purpose provided."}

                        </p>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="document-page-footer">

        <button
          type="button"
          className="appointment-history-button"
          onClick={() =>
            setCurrentPage(
              "appointmentHistory"
            )
          }
        >

          📜 Appointment History

        </button>


        <button
          type="button"
          className="back-dashboard-button"
          onClick={handleBack}
        >

          ← Back to Dashboard

        </button>

      </div>


      {/* =====================================================
          APPOINTMENT CALENDAR MODAL
      ===================================================== */}

      <AppointmentCalendarModal
        isOpen={
          showCalendar
        }

        onClose={() =>
          setShowCalendar(false)
        }

        requests={
          requests || []
        }
      />


      {/* =====================================================
          PREDICTIVE ANALYTICS MODAL
      ===================================================== 

      <PredictiveAnalyticsModal
        isOpen={
          showPredictiveAnalytics
        }

        onClose={() =>
          setShowPredictiveAnalytics(false)
        }

        requests={
          requests || []
        }

        residentName={
          residentName
        }

        residentId={
          residentId
        }
      />*/}

    </div>

  );

};

export default Appointments;