
import React, { useEffect, useState } from "react";
import "../../App.css";

const API_URL =
  "http://localhost/barangay-api/resident_appointments.php";

const PROFILE_API =
  "http://localhost/barangay-api/profile.php";

const AppointmentHistory = ({ setCurrentPage }) => {

  // ==========================================
  // STATES
  // ==========================================

  const [requests, setRequests] = useState([]);
  const [residentName, setResidentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const residentId =
    localStorage.getItem("residentId");


  // ==========================================
  // DEBUG CURRENT ACCOUNT
  // ==========================================

  useEffect(() => {

    console.log(
      "================================="
    );

    console.log(
      "APPOINTMENT HISTORY PAGE"
    );

    console.log(
      "Resident ID:",
      residentId
    );

    console.log(
      "Resident Name:",
      localStorage.getItem("residentName")
    );

    console.log(
      "Email:",
      localStorage.getItem("userEmail")
    );

    console.log(
      "Role:",
      localStorage.getItem("userRole")
    );

    console.log(
      "Logged In:",
      localStorage.getItem("loggedIn")
    );

    console.log(
      "================================="
    );

  }, [residentId]);


  // ==========================================
  // FETCH PROFILE
  // ==========================================

  useEffect(() => {

    if (!residentId) {
      return;
    }


    const fetchProfile = async () => {

      try {

        const response = await fetch(
          `${PROFILE_API}?resident_id=${encodeURIComponent(
            residentId
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json"
            }
          }
        );


        if (!response.ok) {
          throw new Error(
            "Failed to load resident profile."
          );
        }


        const data =
          await response.json();


        console.log(
          "Appointment History Profile:",
          data
        );


        if (
          data.success &&
          data.resident
        ) {

          const resident =
            data.resident;


          /*
           * IMPORTANT:
           *
           * We only use the profile to display
           * the resident's name.
           *
           * We do NOT change residentId here.
           */

          const fullName = [

            resident.first_name,

            resident.middle_name,

            resident.last_name

          ]
            .filter(Boolean)
            .join(" ");


          setResidentName(
            fullName || "Resident"
          );


          console.log(
            "History Resident ID:",
            resident.id
          );

          console.log(
            "History Resident Name:",
            fullName
          );

        }

      } catch (error) {

        console.error(
          "Profile error:",
          error
        );

      }

    };


    fetchProfile();

  }, [residentId]);


  // ==========================================
  // FETCH APPOINTMENTS
  // ==========================================

  useEffect(() => {

    if (!residentId) {

      setError(
        "Resident ID not found. Please login again."
      );

      setRequests([]);

      setLoading(false);

      return;
    }


    const fetchRequests = async () => {

      try {

        setLoading(true);

        setError("");


        console.log(
          "================================="
        );

        console.log(
          "FETCHING APPOINTMENT HISTORY"
        );

        console.log(
          "Resident ID:",
          residentId
        );

        console.log(
          "API:",
          API_URL
        );

        console.log(
          "================================="
        );


        /*
         * IMPORTANT:
         *
         * This endpoint is resident_appointments.php,
         * NOT admin_document_requests.php.
         */

        const url =
          `${API_URL}?resident_id=${encodeURIComponent(
            residentId
          )}`;


        console.log(
          "Appointment History URL:",
          url
        );


        const response =
          await fetch(
            url,
            {
              method: "GET",
              headers: {
                Accept: "application/json"
              }
            }
          );


        console.log(
          "Appointment History HTTP status:",
          response.status
        );


        const responseText =
          await response.text();


        console.log(
          "Appointment History Raw Response:",
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
            "Invalid appointment history JSON:",
            parseError
          );

          throw new Error(
            "Appointment API returned invalid JSON."
          );

        }


        console.log(
          "Appointment History API:",
          data
        );


        /*
         * ==================================================
         * CRITICAL ACCOUNT CHECK
         * ==================================================
         *
         * The backend must return the same residentId
         * that the frontend requested.
         */

        if (
          Number(data.residentId) !==
          Number(residentId)
        ) {

          console.error(
            "================================="
          );

          console.error(
            "RESIDENT ID MISMATCH!"
          );

          console.error(
            "Frontend Resident ID:",
            residentId
          );

          console.error(
            "Backend Resident ID:",
            data.residentId
          );

          console.error(
            "================================="
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

          /*
           * The new backend returns:
           *
           * data.appointments
           */

          const appointmentList =
            Array.isArray(
              data.appointments
            )
              ? data.appointments
              : [];


          /*
           * SECOND SAFETY CHECK
           *
           * Never display a record belonging
           * to another resident.
           */

          const currentResidentRequests =
            appointmentList.filter(
              (request) => {

                return (
                  Number(
                    request.residentId
                  ) ===
                  Number(residentId)
                );

              }
            );


          console.log(
            "All appointments returned:",
            appointmentList
          );


          console.log(
            "Current resident appointments:",
            currentResidentRequests
          );


          setRequests(
            currentResidentRequests
          );


        } else {

          setRequests([]);


          setError(
            data.message ||
            "No appointment history found."
          );

        }


      } catch (error) {

        console.error(
          "Appointment history error:",
          error
        );


        setRequests([]);


        setError(
          error.message ||
          "Cannot connect to the appointment API. Make sure XAMPP Apache is running."
        );


      } finally {

        setLoading(false);

      }

    };


    fetchRequests();

  }, [residentId]);


  // ==========================================
  // CHECK PAST DATE
  // ==========================================

  const isPastAppointment = (
    dateValue
  ) => {

    if (!dateValue) {
      return false;
    }


    /*
     * Handle YYYY-MM-DD safely.
     */

    const dateString =
      String(dateValue).substring(
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
      dateString <
      todayString
    );

  };


  // ==========================================
  // GET HISTORY
  // ==========================================

  const historyRequests =
    requests.filter(
      (request) => {

        const appointmentDate =
          request.appointmentDate ||
          request.appointment_date ||
          request.date;


        return isPastAppointment(
          appointmentDate
        );

      }
    );


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate =
    (dateValue) => {

      if (!dateValue) {
        return "—";
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
          day: "2-digit"
        }
      );

    };


  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime =
    (timeValue) => {

      if (!timeValue) {
        return "—";
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


  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass =
    (status) => {

      const normalizedStatus =
        String(
          status || "Pending"
        ).toLowerCase();


      if (
        normalizedStatus ===
        "approved"
      ) {

        return "status-approved";

      }


      if (
        normalizedStatus ===
        "rejected"
      ) {

        return "status-rejected";

      }


      return "status-pending";

    };


  // ==========================================
  // PRIORITY CLASS
  // ==========================================

  const getPriorityClass =
    (priority) => {

      const normalizedPriority =
        String(
          priority || "Regular"
        ).toLowerCase();


      if (
        normalizedPriority ===
        "priority"
      ) {

        return "priority-badge-red";

      }


      if (
        normalizedPriority ===
        "senior"
        ||
        normalizedPriority ===
        "senior citizen"
      ) {

        return "priority-badge-yellow";

      }


      if (
        normalizedPriority ===
        "pwd"
      ) {

        return "priority-badge-purple";

      }


      return "priority-badge-blue";

    };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="appointments-page">

        <div className="appointments-header">

          <div className="appointments-title-row">

            <span className="appointments-icon">
              📜
            </span>


            <h1>
              Appointment History
            </h1>

          </div>


          <p>
            Loading your previous appointments...
          </p>

        </div>


        <div className="requests-card">

          <div className="appointments-loading">

            <div className="loading-spinner"></div>


            <p>
              Loading appointment history...
            </p>

          </div>

        </div>

      </div>

    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="appointments-page">


      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="background-shape shape-one"></div>

      <div className="background-shape shape-two"></div>

      <div className="background-shape shape-three"></div>


      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="appointments-header">

        <div className="appointment-header-content">

          <div>

            <div className="appointments-title-row">

              <span className="appointments-icon">
                📜
              </span>


              <h1>
                Appointment History
              </h1>

            </div>


            <p>
              View your previous appointment schedules.
            </p>

          </div>

        </div>

      </div>


      {/* ==========================================
          RESIDENT INFORMATION
      ========================================== */}

      <div className="appointment-resident-card">

        <div className="resident-card-icon">
          👤
        </div>


        <div className="resident-card-content">

          <h2>
            Resident Information
          </h2>


          <div className="appointment-divider"></div>


          <p>

            <strong>
              Name:
            </strong>{" "}

            {residentName ||
              "Resident"}

          </p>


          <p>

            <strong>
              Resident ID:
            </strong>{" "}

            {residentId ||
              "—"}

          </p>

        </div>

      </div>


      {/* ==========================================
          HISTORY CARD
      ========================================== */}

      <div className="requests-card">

        <div className="requests-card-header">

          <div>

            <h2>
              Previous Appointments
            </h2>


            <p>
              Appointments with dates that have already passed.
            </p>

          </div>


          <div className="request-count">

            {historyRequests.length}


            <span>
              Records
            </span>

          </div>

        </div>


        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (

          <div className="appointments-error">

            ⚠️ {error}

          </div>

        )}


        {/* ==========================================
            NO HISTORY
        ========================================== */}

        {!error &&
          historyRequests.length === 0 && (

            <div className="no-appointments">

              <div className="no-appointments-icon">
                📭
              </div>


              <h3>
                No Appointment History
              </h3>


              <p>
                You don't have any previous appointments yet.
              </p>

            </div>

          )}


        {/* ==========================================
            HISTORY TABLE
        ========================================== */}

        {historyRequests.length > 0 && (

          <div className="table-container">

            <table className="requests-table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>


                  <th>
                    Document
                  </th>


                  <th>
                    Purpose
                  </th>


                  <th>
                    Appointment Date
                  </th>


                  <th>
                    Time
                  </th>


                  <th>
                    Status
                  </th>


                  <th>
                    Priority
                  </th>

                </tr>

              </thead>


              <tbody>

                {historyRequests.map(
                  (request, index) => {


                    const documentType =
                      request.document ||
                      request.documentType ||
                      request.document_type ||
                      "Document Request";


                    const purpose =
                      request.purpose ||
                      "—";


                    const appointmentDate =
                      request.appointmentDate ||
                      request.appointment_date ||
                      request.date;


                    const appointmentTime =
                      request.appointmentTime ||
                      request.appointment_time ||
                      request.time;


                    const status =
                      request.status ||
                      "Pending";


                    const priority =
                      request.priority ||
                      "Regular";


                    return (

                      <tr
                        key={
                          request.id ||
                          request.request_id ||
                          index
                        }
                      >


                        <td>
                          {index + 1}
                        </td>


                        <td>

                          <div className="document-name">

                            <span className="document-table-icon">
                              📄
                            </span>


                            <span>
                              {documentType}
                            </span>

                          </div>

                        </td>


                        <td>
                          {purpose}
                        </td>


                        <td>
                          {formatDate(
                            appointmentDate
                          )}
                        </td>


                        <td>
                          {formatTime(
                            appointmentTime
                          )}
                        </td>


                        <td>

                          <span
                            className={`status-badge ${getStatusClass(
                              status
                            )}`}
                          >

                            {String(
                              status
                            ).toLowerCase() ===
                              "approved" &&
                              "✓ "}


                            {String(
                              status
                            ).toLowerCase() ===
                              "rejected" &&
                              "✕ "}


                            {String(
                              status
                            ).toLowerCase() ===
                              "pending" &&
                              "⏳ "}


                            {status}

                          </span>

                        </td>


                        <td>

                          <span
                            className={`priority-badge ${getPriorityClass(
                              priority
                            )}`}
                          >

                            {priority}

                          </span>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ==========================================
          BACK TO APPOINTMENTS
      ========================================== */}

      <div className="appointment-history-actions">

        <button
          type="button"
          className="back-dashboard-button"
          onClick={() =>
            setCurrentPage(
              "appointments"
            )
          }
        >

          ← Back to Appointments

        </button>

      </div>

    </div>

  );

};


export default AppointmentHistory;