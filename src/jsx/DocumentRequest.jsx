import React, {
  useEffect,
  useState,
} from "react";

import "../App.css";

import CreateDocumentRequestModal from "./modal/CreateDocumentRequestModal";

import CancelAppointmentModal from "./modal/CancelAppointmentModal";


// =========================================================
// API URLS
// =========================================================

const RESIDENT_REQUESTS_API =
  "http://localhost/barangay-api/resident_document_requests.php";

const PROFILE_API =
  "http://localhost/barangay-api/profile.php";


// =========================================================
// DOCUMENT REQUEST COMPONENT
// =========================================================

const DocumentRequest = ({
  setCurrentPage,
}) => {

  // =======================================================
  // REQUEST STATE
  // =======================================================

  const [requests, setRequests] =
    useState([]);

  const [loadingRequests, setLoadingRequests] =
    useState(true);

  const [loadingProfile, setLoadingProfile] =
    useState(true);


  // =======================================================
  // CREATE REQUEST MODAL
  // =======================================================

  const [showCreateModal, setShowCreateModal] =
    useState(false);


  // =======================================================
  // CANCEL REQUEST MODAL
  // =======================================================

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState(null);


  // =======================================================
  // POPUP VALIDATION
  // =======================================================

  const [popup, setPopup] =
    useState({
      show: false,
      type: "success",
      title: "",
      message: "",
    });


  // =======================================================
  // RESIDENT INFORMATION
  // =======================================================

  const [residentName, setResidentName] =
    useState("");

  const [residentEmail, setResidentEmail] =
    useState("");

  const [priority, setPriority] =
    useState("Regular");


  // =======================================================
  // CURRENT RESIDENT ID
  // =======================================================

  const residentId =
    localStorage.getItem("residentId");


  // =======================================================
  // SHOW POPUP
  // =======================================================

  const showPopup = (
    message,
    type = "success",
    title = ""
  ) => {

    const popupTitle =
      title ||
      (
        type === "success"
          ? "Success"
          : "Error"
      );

    setPopup({
      show: true,
      type,
      title: popupTitle,
      message,
    });

  };


  // =======================================================
  // CLOSE POPUP
  // =======================================================

  const closePopup = () => {

    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
    });

  };


  // =======================================================
  // FETCH RESIDENT PROFILE
  // =======================================================

  const fetchResidentProfile = async () => {

    if (!residentId) {

      setLoadingProfile(false);

      setCurrentPage("login");

      return;

    }


    try {

      setLoadingProfile(true);


      const response =
        await fetch(
          `${PROFILE_API}?resident_id=${encodeURIComponent(
            residentId
          )}`,
          {
            method: "GET",

            headers: {
              Accept: "application/json",
            },
          }
        );


      const responseText =
        await response.text();


      console.log(
        "Profile response:",
        responseText
      );


      let data;


      try {

        data =
          JSON.parse(
            responseText
          );

      } catch (error) {

        throw new Error(
          "Profile API returned invalid JSON."
        );

      }


      if (
        data.success &&
        data.resident
      ) {

        const resident =
          data.resident;


        const fullName = [

          resident.first_name,

          resident.middle_name,

          resident.last_name,

        ]
          .filter(Boolean)
          .join(" ");


        setResidentName(
          fullName ||
          "Resident"
        );


        setResidentEmail(
          resident.email ||
          ""
        );


        setPriority(
          resident.priority ||
          "Regular"
        );


        localStorage.setItem(
          "residentName",
          fullName ||
          "Resident"
        );


        localStorage.setItem(
          "userEmail",
          resident.email ||
          ""
        );

      }

    } catch (error) {

      console.error(
        "Profile error:",
        error
      );


      setResidentName(
        localStorage.getItem(
          "residentName"
        ) ||
        "Resident"
      );


      setResidentEmail(
        localStorage.getItem(
          "userEmail"
        ) ||
        ""
      );


      setPriority(
        "Regular"
      );

    } finally {

      setLoadingProfile(false);

    }

  };


  // =======================================================
  // FETCH MY REQUESTS
  // =======================================================

  const fetchMyRequests = async () => {

    if (!residentId) {

      setRequests([]);

      setLoadingRequests(false);

      return;

    }


    try {

      setLoadingRequests(true);


      const url =
        `${RESIDENT_REQUESTS_API}?resident_id=${encodeURIComponent(
          residentId
        )}`;


      console.log(
        "Fetching requests:",
        url
      );


      const response =
        await fetch(
          url,
          {
            method: "GET",

            headers: {
              Accept: "application/json",
            },
          }
        );


      const responseText =
        await response.text();


      console.log(
        "Requests response:",
        responseText
      );


      let data;


      try {

        data =
          JSON.parse(
            responseText
          );

      } catch (error) {

        throw new Error(
          "Resident requests API returned invalid JSON."
        );

      }


      if (
        response.ok &&
        data.success
      ) {

        const requestList =
          Array.isArray(
            data.requests
          )
            ? data.requests
            : [];


        setRequests(
          requestList
        );

      } else {

        setRequests([]);

        showPopup(
          data.message ||
          "Unable to load document requests.",

          "error",

          "Unable to Load Requests"
        );

      }

    } catch (error) {

      console.error(
        "Document request error:",
        error
      );


      setRequests([]);


      showPopup(
        error.message ||
        "Unable to fetch document requests.",

        "error",

        "Unable to Fetch Requests"
      );

    } finally {

      setLoadingRequests(false);

    }

  };


  // =======================================================
  // LOAD PAGE
  // =======================================================

  useEffect(() => {

    if (!residentId) {

      setCurrentPage(
        "login"
      );

      return;

    }


    fetchResidentProfile();

    fetchMyRequests();

  }, [residentId]);


  // =======================================================
  // NEW REQUEST CREATED
  // =======================================================

  const handleRequestCreated =
    async () => {

      setShowCreateModal(
        false
      );


      await fetchMyRequests();

    };


  // =======================================================
  // OPEN CANCEL MODAL
  // =======================================================

  const openCancelModal =
    (request) => {

      if (!request) {
        return;
      }


      const status =
        (
          request.status ||
          "Pending"
        ).toLowerCase();


      // -----------------------------------------------
      // DO NOT ALLOW CANCEL AGAIN
      // -----------------------------------------------

      if (
        status === "cancelled" ||
        status === "canceled"
      ) {

        return;

      }


      setSelectedRequest(
        request
      );


      setShowCancelModal(
        true
      );

    };


  // =======================================================
  // CLOSE CANCEL MODAL
  // =======================================================

  const closeCancelModal =
    () => {

      setShowCancelModal(
        false
      );


      setSelectedRequest(
        null
      );

    };


  // =======================================================
  // CANCELLED CALLBACK
  // =======================================================

  const handleAppointmentCancelled =
    async (result) => {

      // -----------------------------------------------
      // ERROR FROM CANCEL MODAL
      // -----------------------------------------------

      if (
        result &&
        result.error
      ) {

        showPopup(
          result.message ||
          "Unable to cancel the appointment.",

          "error",

          "Cancellation Failed"
        );

        return;

      }


      // -----------------------------------------------
      // CLOSE MODAL
      // -----------------------------------------------

      closeCancelModal();


      // -----------------------------------------------
      // REFRESH DATABASE REQUESTS
      // -----------------------------------------------

      await fetchMyRequests();


      // -----------------------------------------------
      // SUCCESS POPUP
      // -----------------------------------------------

      showPopup(
        "Your appointment has been cancelled successfully. It has been moved to your cancelled appointment history.",

        "success",

        "Appointment Cancelled"
      );

    };


  // =======================================================
  // BACK TO DASHBOARD
  // =======================================================

  const handleBack = () => {

    setCurrentPage(
      "dashboard"
    );

  };


  // =======================================================
  // FORMAT DATE
  // =======================================================

  const formatDate =
    (date) => {

      if (!date) {
        return "N/A";
      }


      const parsedDate =
        new Date(date);


      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {

        return date;

      }


      return parsedDate.toLocaleDateString(
        "en-US",
        {
          year: "numeric",

          month: "long",

          day: "numeric",
        }
      );

    };


  // =======================================================
  // STATUS CLASS
  // =======================================================

  const getStatusClass =
    (status) => {

      switch (
        status?.toLowerCase()
      ) {

        case "approved":
          return "status-approved";

        case "rejected":
          return "status-rejected";

        case "completed":
          return "status-completed";

        case "cancelled":
        case "canceled":
          return "status-cancelled";

        default:
          return "status-pending";

      }

    };


  // =======================================================
  // STATUS ICON
  // =======================================================

  const getStatusIcon =
    (status) => {

      switch (
        status?.toLowerCase()
      ) {

        case "approved":
          return "✓";

        case "rejected":
          return "✕";

        case "completed":
          return "✓";

        case "cancelled":
        case "canceled":
          return "⊘";

        default:
          return "⏳";

      }

    };


  // =======================================================
  // STATUS MESSAGE
  // =======================================================

  const getStatusMessage =
    (status) => {

      switch (
        status?.toLowerCase()
      ) {

        case "approved":

          return (
            "Your request has been approved by the barangay administrator."
          );


        case "rejected":

          return (
            "Your request has been rejected by the barangay administrator."
          );


        case "completed":

          return (
            "Your document request has been completed."
          );


        case "cancelled":
        case "canceled":

          return (
            "This appointment has been cancelled."
          );


        default:

          return (
            "Your request is currently waiting for validation."
          );

      }

    };


  // =======================================================
  // ACTIVE REQUESTS
  //
  // EVERYTHING EXCEPT CANCELLED
  // =======================================================

  const activeRequests =
    requests.filter(
      (request) => {

        const status =
          (
            request.status ||
            "Pending"
          ).toLowerCase();


        return (
          status !== "cancelled" &&
          status !== "canceled"
        );

      }
    );


  // =======================================================
  // CANCELLED REQUESTS
  //
  // ONLY CANCELLED
  // =======================================================

  const cancelledRequests =
    requests.filter(
      (request) => {

        const status =
          (
            request.status ||
            ""
          ).toLowerCase();


        return (
          status === "cancelled" ||
          status === "canceled"
        );

      }
    );


  // =======================================================
  // REQUEST CARD
  // =======================================================

  const renderRequestCard =
    (request) => {

      const status =
        (
          request.status ||
          "Pending"
        ).toLowerCase();


      const isCancelled =
        status === "cancelled" ||
        status === "canceled";


      return (

        <div
          className={`resident-document-card ${
            isCancelled
              ? "resident-document-card-cancelled"
              : ""
          }`}
          key={request.id}
        >

          {/* =================================================
              CARD TOP
          ================================================= */}

          <div className="resident-document-card-top">

            <div className="resident-document-title">

              <div className="resident-document-icon">
                📄
              </div>


              <div>

                <span>
                  Request #{request.id}
                </span>


                <h3>

                  {request.document_type ||
                    request.documentType ||
                    "Document Request"}

                </h3>

              </div>

            </div>


            {/* STATUS */}

            <span
              className={`resident-request-status ${getStatusClass(
                request.status
              )}`}
            >

              <span>
                {getStatusIcon(
                  request.status
                )}
              </span>


              {request.status ||
                "Pending"}

            </span>

          </div>


          {/* =================================================
              STATUS MESSAGE
          ================================================= */}

          <div
            className={`resident-status-message ${getStatusClass(
              request.status
            )}`}
          >

            <strong>
              {getStatusMessage(
                request.status
              )}
            </strong>

          </div>


          {/* =================================================
              DETAILS
          ================================================= */}

          <div className="resident-document-details">

            <div className="resident-detail">

              <span>
                📅 Appointment
              </span>


              <strong>

                {formatDate(
                  request.appointment_date ||
                  request.appointmentDate
                )}

              </strong>

            </div>


            <div className="resident-detail">

              <span>
                🕐 Time
              </span>


              <strong>

                {request.appointment_time ||
                  request.appointmentTime ||
                  "N/A"}

              </strong>

            </div>


            <div className="resident-detail">

              <span>
                ⭐ Priority
              </span>


              <strong>

                {request.priority ||
                  "Regular"}

              </strong>

            </div>

          </div>


          {/* =================================================
              PURPOSE
          ================================================= */}

          <div className="resident-request-purpose">

            <span>
              Purpose
            </span>


            <p>

              {request.purpose ||
                "No purpose provided."}

            </p>

          </div>


          {/* =================================================
              ACTIVE REQUEST ACTION
          ================================================= */}

          {!isCancelled && (

            <div className="resident-request-card-actions">

              <button
                type="button"
                className="cancel-appointment-button"
                onClick={() =>
                  openCancelModal(
                    request
                  )
                }
              >

                ⊘ Cancel Appointment

              </button>

            </div>

          )}


          {/* =================================================
              CANCELLED LABEL
          ================================================= */}

          {isCancelled && (

            <div className="resident-cancelled-label">

              <span>
                ⊘
              </span>

              Appointment Cancelled

            </div>

          )}

        </div>

      );

    };


  // =======================================================
  // PAGE
  // =======================================================

  return (

    <div className="document-request-page">


      {/* ===================================================
          POPUP VALIDATION
      =================================================== */}

      {popup.show && (

        <div
          className="document-request-popup-overlay"
          onClick={closePopup}
        >

          <div
            className={`document-request-popup ${
              popup.type === "success"
                ? "document-popup-success"
                : "document-popup-error"
            }`}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="document-popup-icon">

              {popup.type === "success"
                ? "✓"
                : "!"}

            </div>


            <div className="document-popup-content">

              <strong>
                {popup.title}
              </strong>


              <p>
                {popup.message}
              </p>

            </div>


            <button
              type="button"
              className="document-popup-close"
              onClick={closePopup}
            >

              ×

            </button>

          </div>

        </div>

      )}


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="document-page-header">

        <div className="document-page-header-left">

          <div className="document-page-icon">
            📄
          </div>


          <div>

            <p className="document-page-label">
              RESIDENT PORTAL
            </p>


            <h1>
              Document Requests
            </h1>


            <p className="document-page-description">
              Submit and monitor your barangay document requests.
            </p>

          </div>

        </div>


        <button
          type="button"
          className="create-document-button"
          onClick={() =>
            setShowCreateModal(true)
          }
          disabled={
            loadingProfile ||
            !residentId
          }
        >

          <span className="create-document-icon">
            ＋
          </span>

          Create New Request

        </button>

      </div>


      {/* ===================================================
          RESIDENT SUMMARY
      =================================================== */}

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
            {residentEmail ||
              "No email available"}
          </small>

        </div>


        <div className="resident-summary-priority">

          <span>
            Priority Level
          </span>


          <strong>
            {priority}
          </strong>

        </div>

      </div>


      {/* ===================================================
          ACTIVE / PENDING REQUESTS
      =================================================== */}

      <section className="my-document-requests-section">

        <div className="document-section-header">

          <div>

            <p className="section-label">
              ACTIVE REQUESTS
            </p>


            <h2>
              My Document Requests
            </h2>


            <p>
              Track your active document requests and appointments.
            </p>

          </div>


          <button
            type="button"
            className="document-refresh-button"
            onClick={
              fetchMyRequests
            }
            disabled={
              loadingRequests ||
              !residentId
            }
          >

            {loadingRequests
              ? "Refreshing..."
              : "🔄 Refresh"}

          </button>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loadingRequests && (

          <div className="document-request-empty">

            <div className="document-empty-icon">
              ⏳
            </div>


            <h3>
              Loading your requests...
            </h3>


            <p>
              Please wait while we retrieve your document requests.
            </p>

          </div>

        )}


        {/* =================================================
            NO ACTIVE REQUESTS
        ================================================= */}

        {!loadingRequests &&
          activeRequests.length === 0 && (

            <div className="document-request-empty">

              <div className="document-empty-icon">
                📭
              </div>


              <h3>
                No Active Document Requests
              </h3>


              <p>
                You currently have no pending or active appointments.
              </p>


              <button
                type="button"
                className="empty-create-button"
                onClick={() =>
                  setShowCreateModal(true)
                }
                disabled={
                  loadingProfile ||
                  !residentId
                }
              >

                ＋ Create New Request

              </button>

            </div>

          )}


        {/* =================================================
            ACTIVE REQUEST CARDS
        ================================================= */}

        {!loadingRequests &&
          activeRequests.length > 0 && (

            <div className="resident-request-grid">

              {activeRequests.map(
                renderRequestCard
              )}

            </div>

          )}

      </section>


      {/* ===================================================
          CANCELLED APPOINTMENT HISTORY
      =================================================== */}

      <section className="cancelled-document-history-section">

        <div className="document-section-header">

          <div>

            <p className="section-label cancelled-section-label">
              REQUEST HISTORY
            </p>


            <h2>
              Cancelled Appointments
            </h2>


            <p>
              View your previously cancelled document appointments.
            </p>

          </div>


          <div className="cancelled-history-count">

            {cancelledRequests.length}

            <span>
              Cancelled
            </span>

          </div>

        </div>


        {/* =================================================
            NO CANCELLED REQUESTS
        ================================================= */}

        {!loadingRequests &&
          cancelledRequests.length === 0 && (

            <div className="cancelled-history-empty">

              <div className="cancelled-history-empty-icon">
                📋
              </div>


              <h3>
                No Cancelled Appointments
              </h3>


              <p>
                Your cancelled appointments will appear here.
              </p>

            </div>

          )}


        {/* =================================================
            CANCELLED REQUEST CARDS
        ================================================= */}

        {!loadingRequests &&
          cancelledRequests.length > 0 && (

            <div className="resident-request-grid cancelled-request-grid">

              {cancelledRequests.map(
                renderRequestCard
              )}

            </div>

          )}

      </section>


      {/* ===================================================
          BACK TO DASHBOARD
      =================================================== */}

      <div className="document-page-footer">

        <button
          type="button"
          className="back-dashboard-button"
          onClick={handleBack}
        >

          ← Back to Dashboard

        </button>

      </div>


      {/* ===================================================
          CREATE REQUEST MODAL
      =================================================== */}

      <CreateDocumentRequestModal

        isOpen={
          showCreateModal
        }

        onClose={() =>
          setShowCreateModal(false)
        }

        residentId={
          residentId
        }

        onRequestCreated={
          handleRequestCreated
        }

      />


      {/* ===================================================
          CANCEL APPOINTMENT MODAL
      =================================================== */}

      <CancelAppointmentModal

        isOpen={
          showCancelModal
        }

        onClose={
          closeCancelModal
        }

        request={
          selectedRequest
        }

        onCancelled={
          handleAppointmentCancelled
        }

      />

    </div>

  );

};


export default DocumentRequest;