import React, { useState } from "react";
import "../../App.css";

const API_URL =
  "http://localhost/barangay-api/document_request.php";

const CreateDocumentRequestModal = ({
  isOpen,
  onClose,
  residentId,
  onRequestCreated,
}) => {
  const [formData, setFormData] = useState({
    documentType: "",
    appointmentDate: "",
    appointmentTime: "",
    purpose: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // =========================================================
  // VALIDATION MODAL
  // =========================================================

  const [validationModal, setValidationModal] = useState({
    show: false,
    type: "error",
    title: "",
    message: "",
  });

  // =========================================================
  // SHOW VALIDATION MODAL
  // =========================================================

  const showValidation = (
    message,
    type = "error",
    title = null
  ) => {
    setValidationModal({
      show: true,
      type,
      title:
        title ||
        (type === "success" ? "Success" : "Validation Error"),
      message,
    });
  };

  // =========================================================
  // CLOSE VALIDATION MODAL
  // =========================================================

  const closeValidation = () => {
    setValidationModal({
      show: false,
      type: "error",
      title: "",
      message: "",
    });
  };

  // =========================================================
  // DO NOT RENDER
  // =========================================================

  if (!isOpen) {
    return null;
  }

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const handleClose = () => {
    if (submitting) {
      return;
    }

    setFormData({
      documentType: "",
      appointmentDate: "",
      appointmentTime: "",
      purpose: "",
    });

    closeValidation();

    onClose();
  };

  // =========================================================
  // SUBMIT REQUEST
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // =======================================================
    // RESIDENT ID VALIDATION
    // =======================================================

    if (!residentId) {
      showValidation(
        "Resident ID was not found. Please log in again.",
        "error",
        "Resident ID Missing"
      );
      return;
    }

    // =======================================================
    // DOCUMENT TYPE
    // =======================================================

    if (!formData.documentType) {
      showValidation(
        "Please select the type of document you want to request.",
        "error",
        "Document Type Required"
      );
      return;
    }

    // =======================================================
    // APPOINTMENT DATE
    // =======================================================

    if (!formData.appointmentDate) {
      showValidation(
        "Please select an appointment date.",
        "error",
        "Appointment Date Required"
      );
      return;
    }

    // =======================================================
    // CHECK DATE
    // =======================================================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(
      `${formData.appointmentDate}T00:00:00`
    );

    if (selectedDate < today) {
      showValidation(
        "The appointment date cannot be in the past.",
        "error",
        "Invalid Appointment Date"
      );
      return;
    }

    // =======================================================
    // TIME
    // =======================================================

    if (!formData.appointmentTime) {
      showValidation(
        "Please select an appointment time.",
        "error",
        "Appointment Time Required"
      );
      return;
    }

    // =======================================================
    // PURPOSE
    // =======================================================

    if (!formData.purpose.trim()) {
      showValidation(
        "Please provide the purpose of your document request.",
        "error",
        "Purpose Required"
      );
      return;
    }

    if (formData.purpose.trim().length < 5) {
      showValidation(
        "The purpose must contain at least 5 characters.",
        "error",
        "Purpose Too Short"
      );
      return;
    }

    // =======================================================
    // SUBMIT
    // =======================================================

    setSubmitting(true);

    try {
      console.log("=================================");
      console.log("CREATING DOCUMENT REQUEST");
      console.log("=================================");
      console.log("Resident ID:", residentId);
      console.log("Document:", formData.documentType);
      console.log("Date:", formData.appointmentDate);
      console.log("Time:", formData.appointmentTime);
      console.log("Purpose:", formData.purpose);

      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          resident_id: Number(residentId),
          document_type: formData.documentType,
          appointment_date: formData.appointmentDate,
          appointment_time: formData.appointmentTime,
          purpose: formData.purpose.trim(),
        }),
      });

      const responseText = await response.text();

      console.log(
        "Create request HTTP status:",
        response.status
      );

      console.log(
        "Create request raw response:",
        responseText
      );

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(
          "Invalid JSON returned by PHP:",
          jsonError
        );

        throw new Error(
          "The PHP API returned an invalid response."
        );
      }

      console.log(
        "CREATE REQUEST RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "The PHP API returned an error."
        );
      }

      if (!data.success) {
        showValidation(
          data.message ||
            "Failed to create the document request.",
          "error",
          "Request Failed"
        );

        return;
      }

      // =====================================================
      // RESET FORM
      // =====================================================

      setFormData({
        documentType: "",
        appointmentDate: "",
        appointmentTime: "",
        purpose: "",
      });

      // =====================================================
      // SUCCESS MODAL
      // =====================================================

      showValidation(
        "Your document request has been submitted successfully. It is now Pending and will be reviewed by the barangay administrator.",
        "success",
        "Request Submitted"
      );

      // =====================================================
      // REFRESH PARENT
      // =====================================================

      if (onRequestCreated) {
        await onRequestCreated();
      }
    } catch (error) {
      console.error(
        "Create document request error:",
        error
      );

      showValidation(
        error.message ||
          "Cannot connect to the PHP API. Make sure XAMPP Apache is running.",
        "error",
        "Connection Error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // TODAY
  // =========================================================

  const minimumDate = new Date()
    .toISOString()
    .split("T")[0];

  // =========================================================
  // MODAL
  // =========================================================

  return (
    <>
      {/* =====================================================
          CREATE REQUEST MODAL
      ===================================================== */}

      <div
        className="create-request-modal-overlay"
        onClick={handleClose}
      >
        <div
          className="create-request-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}

          <div className="create-request-modal-header">
            <div className="create-request-modal-title">
              <div className="create-request-modal-icon">
                📄
              </div>

              <div>
                <p>
                  BARANGAY DOCUMENT SERVICES
                </p>

                <h2>
                  Create New Request
                </h2>
              </div>
            </div>

            <button
              type="button"
              className="create-request-close-button"
              onClick={handleClose}
              disabled={submitting}
            >
              ×
            </button>
          </div>

          {/* DESCRIPTION */}

          <div className="create-request-modal-description">
            <span>ℹ️</span>

            <p>
              Fill out the information below to
              submit a new barangay document
              request.
            </p>
          </div>

          {/* FORM */}

          <form
            className="create-request-form"
            onSubmit={handleSubmit}
          >
            {/* DOCUMENT TYPE */}

            <div className="create-form-group">
              <label>
                Document Type <span>*</span>
              </label>

              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                required
                disabled={submitting}
              >
                <option value="">
                  Select a document
                </option>

                <option value="Barangay Clearance">
                  Barangay Clearance
                </option>

                <option value="Certificate of Indigency">
                  Certificate of Indigency
                </option>

                <option value="Certificate of Residency">
                  Certificate of Residency
                </option>

                <option value="Certificate of Employment">
                  Certificate of Employment
                </option>

                <option value="Business Clearance">
                  Business Clearance
                </option>
              </select>
            </div>

            {/* DATE + TIME */}

            <div className="create-form-row">
              <div className="create-form-group">
                <label>
                  Appointment Date <span>*</span>
                </label>

                <input
                  type="date"
                  name="appointmentDate"
                  value={
                    formData.appointmentDate
                  }
                  onChange={handleChange}
                  min={minimumDate}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="create-form-group">
                <label>
                  Appointment Time <span>*</span>
                </label>

                <select
                  name="appointmentTime"
                  value={
                    formData.appointmentTime
                  }
                  onChange={handleChange}
                  required
                  disabled={submitting}
                >
                  <option value="">
                    Select time
                  </option>

                  <option value="8:00 AM">
                    8:00 AM
                  </option>

                  <option value="9:00 AM">
                    9:00 AM
                  </option>

                  <option value="10:00 AM">
                    10:00 AM
                  </option>

                  <option value="11:00 AM">
                    11:00 AM
                  </option>

                  <option value="1:00 PM">
                    1:00 PM
                  </option>

                  <option value="2:00 PM">
                    2:00 PM
                  </option>

                  <option value="3:00 PM">
                    3:00 PM
                  </option>

                  <option value="4:00 PM">
                    4:00 PM
                  </option>
                </select>
              </div>
            </div>

            {/* PURPOSE */}

            <div className="create-form-group">
              <label>
                Purpose <span>*</span>
              </label>

              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Please explain the purpose of your document request..."
                rows="5"
                maxLength="500"
                required
                disabled={submitting}
              />

              <div className="character-count">
                {formData.purpose.length}/500
              </div>
            </div>

            {/* NOTICE */}

            <div className="create-request-notice">
              <div className="notice-icon">
                ⏳
              </div>

              <div>
                <strong>
                  Request Validation
                </strong>

                <p>
                  After submitting, your request
                  will have a{" "}
                  <strong>Pending</strong>{" "}
                  status until it is reviewed by
                  the barangay administrator.
                </p>
              </div>
            </div>

            {/* BUTTONS */}

            <div className="create-request-modal-actions">
              <button
                type="button"
                className="create-request-cancel-button"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-request-submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="button-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    📄 Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* =====================================================
          VALIDATION / SUCCESS MODAL
      ===================================================== */}

      {validationModal.show && (
        <div
          className="document-validation-overlay"
          onClick={closeValidation}
        >
          <div
            className={`document-validation-modal ${
              validationModal.type === "success"
                ? "validation-success"
                : "validation-error"
            }`}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="document-validation-icon">
              {validationModal.type ===
              "success"
                ? "✓"
                : "!"}
            </div>

            <h3>
              {validationModal.title}
            </h3>

            <p>
              {validationModal.message}
            </p>

            <button
              type="button"
              className="document-validation-button"
              onClick={closeValidation}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateDocumentRequestModal;