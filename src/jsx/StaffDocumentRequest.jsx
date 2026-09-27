import React, { useState } from "react";
import "../App.css";

const API_BASE = "http://localhost/barangay-api";

const StaffDocumentRequests = ({ setCurrentPage }) => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    contactNumber: "",
    address: "",
    documentType: "",
    purpose: "",
    appointmentDate: "",
    appointmentTime: "",
    priority: "Regular",
  });

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setForm({
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      contactNumber: "",
      address: "",
      documentType: "",
      purpose: "",
      appointmentDate: "",
      appointmentTime: "",
      priority: "Regular",
    });
  };

  /* =========================================================
     SUBMIT WALK-IN REQUEST
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    /* =======================================================
       VALIDATION
    ======================================================= */

    if (!form.firstName.trim()) {
      setErrorMessage("Please enter the resident's first name.");
      setLoading(false);
      return;
    }

    if (!form.lastName.trim()) {
      setErrorMessage("Please enter the resident's last name.");
      setLoading(false);
      return;
    }

    if (!form.contactNumber.trim()) {
      setErrorMessage("Please enter the resident's contact number.");
      setLoading(false);
      return;
    }

    if (!form.address.trim()) {
      setErrorMessage("Please enter the resident's address.");
      setLoading(false);
      return;
    }

    if (!form.documentType) {
      setErrorMessage("Please select a document type.");
      setLoading(false);
      return;
    }

    if (!form.purpose.trim()) {
      setErrorMessage("Please enter the purpose of the document request.");
      setLoading(false);
      return;
    }

    if (form.purpose.trim().length < 5) {
      setErrorMessage(
        "The purpose must contain at least 5 characters."
      );
      setLoading(false);
      return;
    }

    if (!form.appointmentDate) {
      setErrorMessage("Please select an appointment date.");
      setLoading(false);
      return;
    }

    if (!form.appointmentTime) {
      setErrorMessage("Please select an appointment time.");
      setLoading(false);
      return;
    }

    /* =======================================================
       DATE VALIDATION
    ======================================================= */

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(
      `${form.appointmentDate}T00:00:00`
    );

    if (Number.isNaN(selectedDate.getTime())) {
      setErrorMessage("Invalid appointment date.");
      setLoading(false);
      return;
    }

    if (selectedDate < today) {
      setErrorMessage(
        "The appointment date cannot be in the past."
      );
      setLoading(false);
      return;
    }

    /* =======================================================
       REQUEST DATA
    ======================================================= */

    const requestData = {
      first_name: form.firstName.trim(),
      middle_name: form.middleName.trim(),
      last_name: form.lastName.trim(),
      suffix: form.suffix.trim(),

      contact_number: form.contactNumber.trim(),
      address: form.address.trim(),

      document_type: form.documentType,
      purpose: form.purpose.trim(),

      appointment_date: form.appointmentDate,
      appointment_time: form.appointmentTime,

      priority: form.priority,

      request_source: "walk-in",
    };

    console.log(
      "========================================"
    );

    console.log(
      "CREATING STAFF WALK-IN DOCUMENT REQUEST"
    );

    console.log(
      "========================================"
    );

    console.log(
      "API:",
      `${API_BASE}/staff_document_requests.php`
    );

    console.log(
      "Request data:",
      requestData
    );

    try {
      /* =====================================================
         SEND REQUEST
      ===================================================== */

      const response = await fetch(
        `${API_BASE}/staff_document_requests.php`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify(requestData),
        }
      );

      /* =====================================================
         READ RAW RESPONSE FIRST
      ===================================================== */

      const responseText = await response.text();

      console.log(
        "HTTP STATUS:",
        response.status
      );

      console.log(
        "RAW PHP RESPONSE:",
        responseText
      );

      /* =====================================================
         EMPTY RESPONSE
      ===================================================== */

      if (!responseText.trim()) {
        throw new Error(
          `The PHP API returned an empty response. HTTP status: ${response.status}`
        );
      }

      /* =====================================================
         PARSE JSON
      ===================================================== */

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error(
          "PHP returned invalid JSON:",
          jsonError
        );

        throw new Error(
          `PHP returned an invalid response. HTTP status: ${response.status}. Check the PHP error/log.`
        );
      }

      console.log(
        "PARSED PHP RESPONSE:",
        data
      );

      /* =====================================================
         SERVER ERROR
      ===================================================== */

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Server returned HTTP ${response.status}.`
        );
      }

      /* =====================================================
         APPLICATION ERROR
      ===================================================== */

      if (!data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Unable to create the document request."
        );
      }

      /* =====================================================
         SUCCESS
      ===================================================== */

      setSuccessMessage(
        data.message ||
          "Walk-in document request created successfully."
      );

      resetForm();

    } catch (error) {
      console.error(
        "========================================"
      );

      console.error(
        "WALK-IN DOCUMENT REQUEST ERROR"
      );

      console.error(
        "========================================"
      );

      console.error(
        error
      );

      /* =====================================================
         FETCH / CONNECTION ERROR
      ===================================================== */

      if (
        error instanceof TypeError &&
        error.message === "Failed to fetch"
      ) {
        setErrorMessage(
          "Unable to connect to the PHP API. Make sure XAMPP Apache is running and that staff_walkin_document_request.php exists inside C:\\xampp\\htdocs\\barangay-api."
        );
      } else {
        setErrorMessage(
          error.message ||
            "Unable to create the document request."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleNavigation = (page) => {
    if (setCurrentPage) {
      setCurrentPage(page);
    }
  };

  /* =========================================================
     TODAY
  ========================================================= */

  const minimumDate = new Date()
    .toISOString()
    .split("T")[0];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="staff-document-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="staff-document-sidebar">

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

        <nav className="staff-document-menu">

          <a
            href="#"
            className="staff-document-menu-item"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("staff-dashboard");
            }}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </a>

          <a
            href="#"
            className="staff-document-menu-item active"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("staff-documents");
            }}
          >
            <span>📄</span>
            <span>Document Requests</span>
          </a>

          <a
            href="#"
            className="staff-document-menu-item"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("staff-residents");
            }}
          >
            <span>👥</span>
            <span>Residents</span>
          </a>

          <a
            href="#"
            className="staff-document-menu-item"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("staff-appointments");
            }}
          >
            <span>🗓️</span>
            <span>Appointments</span>
          </a>

          <a
            href="#"
            className="staff-document-menu-item"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("staff-predictive-analytics");
            }}
          >
            <span>📊</span>
            <span>Predictive Analytics</span>
          </a>

          <a
            href="#"
            className="staff-document-menu-item logout"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation("login");
            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </a>

        </nav>

        <div className="staff-document-sidebar-footer">
          Barangay Management System
          <br />
          Staff Portal
        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="staff-document-main">

        <div className="staff-document-topbar">

          <button
            type="button"
            className="staff-document-back-button"
            onClick={() =>
              handleNavigation("staff-dashboard")
            }
          >
            ← Back to Dashboard
          </button>

        </div>

        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="staff-document-header">

          <div>

            <div className="staff-document-eyebrow">
              STAFF PORTAL
            </div>

            <h1>
              Walk-in Document Request
            </h1>

            <p>
              Create a document request and appointment
              for a resident who does not have an account.
            </p>

          </div>

          <div className="staff-document-date-card">

            <span>📅</span>

            <div>

              <small>
                TODAY
              </small>

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

        </section>

        {/* ===================================================
            INFO
        =================================================== */}

        <div className="staff-document-info-banner">

          <div className="staff-document-info-icon">
            ℹ️
          </div>

          <div>

            <strong>
              Walk-in Resident
            </strong>

            <p>
              Use this form when a resident visits the
              barangay office without having a resident
              account. The staff member can create the
              request and appointment on their behalf.
            </p>

          </div>

        </div>

        {/* ===================================================
            SUCCESS
        =================================================== */}

        {successMessage && (

          <div className="staff-document-success">

            <span>
              ✓
            </span>

            <div>

              <strong>
                Request Created
              </strong>

              <p>
                {successMessage}
              </p>

            </div>

          </div>

        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {errorMessage && (

          <div className="staff-document-error">

            <span>
              ✕
            </span>

            <div>

              <strong>
                Unable to Create Request
              </strong>

              <p>
                {errorMessage}
              </p>

            </div>

          </div>

        )}

        {/* ===================================================
            FORM
        =================================================== */}

        <form
          className="staff-document-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              RESIDENT INFORMATION
          ================================================= */}

          <section className="staff-document-card">

            <div className="staff-document-card-header">

              <div className="staff-document-card-icon">
                👤
              </div>

              <div>

                <h2>
                  Resident Information
                </h2>

                <p>
                  Enter the information of the walk-in resident.
                </p>

              </div>

            </div>

            <div className="staff-document-form-grid">

              <div className="staff-document-field">

                <label>
                  First Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  disabled={loading}
                />

              </div>

              <div className="staff-document-field">

                <label>
                  Middle Name
                </label>

                <input
                  type="text"
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  placeholder="Enter middle name"
                  disabled={loading}
                />

              </div>

              <div className="staff-document-field">

                <label>
                  Last Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  disabled={loading}
                />

              </div>

              <div className="staff-document-field">

                <label>
                  Suffix
                </label>

                <select
                  name="suffix"
                  value={form.suffix}
                  onChange={handleChange}
                  disabled={loading}
                >

                  <option value="">
                    None
                  </option>

                  <option value="Jr.">
                    Jr.
                  </option>

                  <option value="Sr.">
                    Sr.
                  </option>

                  <option value="II">
                    II
                  </option>

                  <option value="III">
                    III
                  </option>

                  <option value="IV">
                    IV
                  </option>

                </select>

              </div>

              <div className="staff-document-field">

                <label>
                  Contact Number <span>*</span>
                </label>

                <input
                  type="tel"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="09XXXXXXXXX"
                  disabled={loading}
                />

              </div>

              <div className="staff-document-field full">

                <label>
                  Address <span>*</span>
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows="3"
                  disabled={loading}
                />

              </div>

            </div>

          </section>

          {/* =================================================
              DOCUMENT
          ================================================= */}

          <section className="staff-document-card">

            <div className="staff-document-card-header">

              <div className="staff-document-card-icon blue">
                📄
              </div>

              <div>

                <h2>
                  Document Request
                </h2>

                <p>
                  Select the document the resident is requesting.
                </p>

              </div>

            </div>

            <div className="staff-document-form-grid">

              <div className="staff-document-field">

                <label>
                  Document Type <span>*</span>
                </label>

                <select
                  name="documentType"
                  value={form.documentType}
                  onChange={handleChange}
                  disabled={loading}
                >

                  <option value="">
                    Select document
                  </option>

                  <option value="Barangay Clearance">
                    Barangay Clearance
                  </option>

                  <option value="Barangay Certificate">
                    Barangay Certificate
                  </option>

                  <option value="Certificate of Residency">
                    Certificate of Residency
                  </option>

                  <option value="Certificate of Indigency">
                    Certificate of Indigency
                  </option>

                  <option value="Business Clearance">
                    Business Clearance
                  </option>

                </select>

              </div>

              <div className="staff-document-field">

                <label>
                  Priority
                </label>

                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  disabled={loading}
                >

                  <option value="Regular">
                    Regular
                  </option>

                  <option value="Senior Citizen">
                    Senior Citizen
                  </option>

                  <option value="PWD">
                    PWD
                  </option>

                  <option value="Pregnant">
                    Pregnant
                  </option>

                </select>

              </div>

              <div className="staff-document-field full">

                <label>
                  Purpose <span>*</span>
                </label>

                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="Enter the purpose of the document"
                  rows="3"
                  maxLength="500"
                  disabled={loading}
                />

              </div>

            </div>

          </section>

          {/* =================================================
              APPOINTMENT
          ================================================= */}

          <section className="staff-document-card">

            <div className="staff-document-card-header">

              <div className="staff-document-card-icon green">
                🗓️
              </div>

              <div>

                <h2>
                  Appointment
                </h2>

                <p>
                  Schedule an appointment for the walk-in resident.
                </p>

              </div>

            </div>

            <div className="staff-document-appointment-notice">

              <span>
                🕐
              </span>

              <div>

                <strong>
                  Appointment Schedule
                </strong>

                <p>
                  Choose the date and time when the resident
                  will process their request.
                </p>

              </div>

            </div>

            <div className="staff-document-form-grid">

              <div className="staff-document-field">

                <label>
                  Appointment Date <span>*</span>
                </label>

                <input
                  type="date"
                  name="appointmentDate"
                  value={form.appointmentDate}
                  onChange={handleChange}
                  min={minimumDate}
                  disabled={loading}
                />

              </div>

              <div className="staff-document-field">

                <label>
                  Appointment Time <span>*</span>
                </label>

                <select
                  name="appointmentTime"
                  value={form.appointmentTime}
                  onChange={handleChange}
                  disabled={loading}
                >

                  <option value="">
                    Select time
                  </option>

                  <option value="08:00">
                    8:00 AM
                  </option>

                  <option value="08:30">
                    8:30 AM
                  </option>

                  <option value="09:00">
                    9:00 AM
                  </option>

                  <option value="09:30">
                    9:30 AM
                  </option>

                  <option value="10:00">
                    10:00 AM
                  </option>

                  <option value="10:30">
                    10:30 AM
                  </option>

                  <option value="11:00">
                    11:00 AM
                  </option>

                  <option value="11:30">
                    11:30 AM
                  </option>

                  <option value="13:00">
                    1:00 PM
                  </option>

                  <option value="13:30">
                    1:30 PM
                  </option>

                  <option value="14:00">
                    2:00 PM
                  </option>

                  <option value="14:30">
                    2:30 PM
                  </option>

                  <option value="15:00">
                    3:00 PM
                  </option>

                  <option value="15:30">
                    3:30 PM
                  </option>

                  <option value="16:00">
                    4:00 PM
                  </option>

                  <option value="16:30">
                    4:30 PM
                  </option>

                </select>

              </div>

            </div>

          </section>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="staff-document-submit-section">

            <div className="staff-document-submit-note">

              <strong>
                Ready to create this request?
              </strong>

              <p>
                The request will be recorded as a walk-in
                request and can be processed by the barangay staff.
              </p>

            </div>

            <div className="staff-document-submit-buttons">

              <button
                type="button"
                className="staff-document-cancel-button"
                onClick={() =>
                  handleNavigation("staff-dashboard")
                }
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="staff-document-submit-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="staff-document-spinner"></span>
                    Creating Request...
                  </>
                ) : (
                  <>
                    ✓ Create Request
                  </>
                )}

              </button>

            </div>

          </div>

        </form>

      </main>

    </div>
  );
};

export default StaffDocumentRequests;