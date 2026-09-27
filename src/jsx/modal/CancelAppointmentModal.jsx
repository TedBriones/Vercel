import React, { useState } from "react";
import "../../App.css";

const CANCEL_API =
  "http://localhost/barangay-api/cancel_document_request.php";

const CancelAppointmentModal = ({
  isOpen,
  onClose,
  request,
  onCancelled,
}) => {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !request) {
    return null;
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =========================================================
  // KEEP APPOINTMENT
  // =========================================================

  const handleKeepAppointment = () => {
    if (submitting) {
      return;
    }

    onClose();
  };

  // =========================================================
  // CANCEL APPOINTMENT
  // =========================================================

  const handleCancelAppointment = async () => {
    if (!request?.id) {
      return;
    }

    setSubmitting(true);

    try {
      console.log("=================================");
      console.log("CANCEL APPOINTMENT");
      console.log("Request ID:", request.id);
      console.log("API:", CANCEL_API);
      console.log("=================================");

      const response = await fetch(CANCEL_API, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          request_id: Number(request.id),
        }),
      });

      console.log(
        "Cancel appointment HTTP status:",
        response.status
      );

      const responseText = await response.text();

      console.log(
        "Cancel appointment raw response:",
        responseText
      );

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(
          "Invalid cancellation JSON:",
          jsonError
        );

        throw new Error(
          "Cancellation API returned invalid JSON."
        );
      }

      console.log(
        "Cancel appointment response:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to cancel the appointment."
        );
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      if (onCancelled) {
        await onCancelled();
      }

      onClose();

    } catch (error) {
      console.error(
        "Cancel appointment error:",
        error
      );

      /*
       * IMPORTANT:
       * We are NOT using alert().
       *
       * The parent DocumentRequest component will
       * display the error using its own popup/modal.
       */

      if (onCancelled) {
        await onCancelled({
          error: true,
          message:
            error.message ||
            "Unable to cancel the appointment.",
        });
      }

    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // MODAL
  // =========================================================

  return (
    <div
      className="cancel-appointment-modal-overlay"
      onClick={handleKeepAppointment}
    >
      <div
        className="cancel-appointment-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* =================================================
            MODAL HEADER
        ================================================= */}

        <div className="cancel-appointment-modal-header">

          <div className="cancel-appointment-title-wrapper">

            <div className="cancel-appointment-icon">
              !
            </div>

            <div>
              <p className="cancel-appointment-small-title">
                APPOINTMENT CANCELLATION
              </p>

              <h2>
                Cancel Appointment?
              </h2>
            </div>

          </div>

          <button
            type="button"
            className="cancel-appointment-close-button"
            onClick={handleKeepAppointment}
            disabled={submitting}
            aria-label="Close"
          >
            ×
          </button>

        </div>


        {/* =================================================
            MODAL BODY
        ================================================= */}

        <div className="cancel-appointment-modal-body">

          <div className="cancel-warning-box">

            <div className="cancel-warning-icon">
              ⚠️
            </div>

            <div>

              <strong>
                Are you sure you want to cancel this appointment?
              </strong>

              <p>
                This action will mark your document request
                as <strong>Cancelled</strong>.
              </p>

            </div>

          </div>


          {/* =================================================
              REQUEST DETAILS
          ================================================= */}

          <div className="cancel-request-details">

            <div className="cancel-detail-row">

              <span>
                Document
              </span>

              <strong>
                {request.document_type ||
                  request.documentType ||
                  "Document Request"}
              </strong>

            </div>


            <div className="cancel-detail-row">

              <span>
                Appointment Date
              </span>

              <strong>
                {formatDate(
                  request.appointment_date ||
                    request.appointmentDate
                )}
              </strong>

            </div>


            <div className="cancel-detail-row">

              <span>
                Appointment Time
              </span>

              <strong>
                {request.appointment_time ||
                  request.appointmentTime ||
                  "N/A"}
              </strong>

            </div>


            <div className="cancel-detail-row">

              <span>
                Current Status
              </span>

              <strong className="cancel-current-status">
                {request.status || "Pending"}
              </strong>

            </div>

          </div>


          {/* =================================================
              NOTICE
          ================================================= */}

          <div className="cancel-appointment-notice">

            <span>
              ℹ️
            </span>

            <p>
              The barangay administrator will be able to see
              that this appointment was cancelled.
            </p>

          </div>

        </div>


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="cancel-appointment-modal-actions">

          <button
            type="button"
            className="keep-appointment-button"
            onClick={handleKeepAppointment}
            disabled={submitting}
          >
            Keep Appointment
          </button>


          <button
            type="button"
            className="confirm-cancel-appointment-button"
            onClick={handleCancelAppointment}
            disabled={submitting}
          >

            {submitting ? (
              <>
                <span className="button-spinner"></span>
                Cancelling...
              </>
            ) : (
              <>
                🚫 Yes, Cancel
              </>
            )}

          </button>

        </div>

      </div>
    </div>
  );
};

export default CancelAppointmentModal;