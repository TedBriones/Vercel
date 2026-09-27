import React, { useEffect, useRef, useState } from "react";
import "../App.css";

const StaffAppointments = ({ setCurrentPage }) => {

  const API_BASE = "http://localhost/barangay-api";

  /* =========================================================
     EMPTY FORM
  ========================================================= */

  const emptyForm = {
    documentType: "",
    appointmentDate: "",
    appointmentTime: "",
    purpose: "",
  };

  /* =========================================================
     STATE
  ========================================================= */

  const [form, setForm] = useState(emptyForm);

  const [residentSearch, setResidentSearch] = useState("");
  const [residentResults, setResidentResults] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);

  const [showResidentResults, setShowResidentResults] =
    useState(false);

  const [searchingResidents, setSearchingResidents] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const searchTimer = useRef(null);

  /* =========================================================
     CURRENT DATE
  ========================================================= */

  const currentDate = new Date().toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  /* =========================================================
     TODAY FOR MINIMUM DATE
  ========================================================= */

  const today = new Date()
    .toISOString()
    .split("T")[0];

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleNavigation = (page) => {

    if (setCurrentPage) {
      setCurrentPage(page);
    }

  };

  /* =========================================================
     HANDLE FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");

  };

  /* =========================================================
     SEARCH RESIDENTS
  ========================================================= */

const searchResidents = async (value) => {
  const searchValue = value.trim();

  setSuccessMessage("");
  setErrorMessage("");

  if (!searchValue) {
    setResidentResults([]);
    setShowResidentResults(false);
    setSearchingResidents(false);
    return;
  }

  setShowResidentResults(true);
  setSearchingResidents(true);

  try {
    const response = await fetch(
      `${API_BASE}/staff_appointments.php?search=${encodeURIComponent(
        searchValue
      )}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const responseText = await response.text();

    console.log(
      "Resident search HTTP status:",
      response.status
    );

    console.log(
      "Resident search PHP response:",
      responseText
    );

    if (!responseText.trim()) {
      throw new Error(
        "PHP returned an empty response."
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error(
        "Invalid PHP JSON:",
        responseText
      );

      throw new Error(
        "PHP returned an invalid response. Check staff_appointments.php."
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "Unable to search residents."
      );
    }

    const residents =
      Array.isArray(data.residents)
        ? data.residents
        : [];

    console.log(
      "Residents returned from database:",
      residents
    );

    setResidentResults(residents);

  } catch (error) {
    console.error(
      "Resident search error:",
      error
    );

    setResidentResults([]);

    setErrorMessage(
      error.message ||
        "Unable to search residents."
    );

  } finally {
    setSearchingResidents(false);
  }
};
  /* =========================================================
     TYPEAHEAD INPUT
  ========================================================= */

const handleResidentSearchChange = (e) => {
  const value = e.target.value;

  setResidentSearch(value);

  setSelectedResident(null);

  if (searchTimer.current) {
    clearTimeout(searchTimer.current);
  }

  if (!value.trim()) {
    setResidentResults([]);
    setShowResidentResults(false);
    setSearchingResidents(false);
    return;
  }

  setShowResidentResults(true);

  searchTimer.current = setTimeout(() => {
    searchResidents(value);
  }, 300);
};
  /* =========================================================
     SELECT RESIDENT
  ========================================================= */

  const selectResident = (resident) => {

    setSelectedResident(resident);

    setResidentSearch(
      resident.full_name
    );

    setResidentResults([]);

    setShowResidentResults(false);

    setErrorMessage("");
    setSuccessMessage("");

  };

  /* =========================================================
     CLEAR RESIDENT
  ========================================================= */

  const clearSelectedResident = () => {

    setSelectedResident(null);

    setResidentSearch("");

    setResidentResults([]);

    setShowResidentResults(false);

  };

  /* =========================================================
     CLOSE TYPEAHEAD WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        !event.target.closest(
          ".staff-appointment-typeahead"
        )
      ) {

        setShowResidentResults(false);

      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  /* =========================================================
     CLEAN SEARCH TIMER
  ========================================================= */

  useEffect(() => {

    return () => {

      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }

    };

  }, []);

  /* =========================================================
     SUBMIT APPOINTMENT
  ========================================================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    /* =======================================================
       RESIDENT VALIDATION
    ======================================================= */

    if (!selectedResident) {

      setErrorMessage(
        "Please search for and select a resident first."
      );

      setLoading(false);
      return;

    }

    /* =======================================================
       FORM VALIDATION
    ======================================================= */

    if (
      !form.documentType ||
      !form.appointmentDate ||
      !form.appointmentTime ||
      !form.purpose.trim()
    ) {

      setErrorMessage(
        "Please complete all required appointment information."
      );

      setLoading(false);
      return;

    }

    /* =======================================================
       DATE VALIDATION
    ======================================================= */

    if (form.appointmentDate < today) {

      setErrorMessage(
        "Appointment date cannot be in the past."
      );

      setLoading(false);
      return;

    }

    try {

      const response = await fetch(
        `${API_BASE}/staff_appointments.php`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({

            resident_id:
              selectedResident.id,

            document_type:
              form.documentType,

            appointment_date:
              form.appointmentDate,

            appointment_time:
              form.appointmentTime,

            purpose:
              form.purpose.trim(),

          }),
        }
      );

      let data;

      try {

        data = await response.json();

      } catch (jsonError) {

        throw new Error(
          "PHP returned an invalid response. Check staff_appointments.php for PHP errors."
        );

      }

      if (!response.ok || !data.success) {

        throw new Error(
          data.message ||
            "Unable to create appointment."
        );

      }

      /* =====================================================
         SUCCESS
      ===================================================== */

      setSuccessMessage(
        data.message ||
          "Appointment created successfully."
      );

      /* =====================================================
         CLEAR FORM
      ===================================================== */

      setForm({
        ...emptyForm,
      });

      setSelectedResident(null);

      setResidentSearch("");

      setResidentResults([]);

      setShowResidentResults(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {

      console.error(
        "Staff appointment error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to connect to the server."
      );

    } finally {

      setLoading(false);

    }

  };

  /* =========================================================
     CLEAR FORM
  ========================================================= */

  const handleClear = () => {

    setForm({
      ...emptyForm,
    });

    setSelectedResident(null);

    setResidentSearch("");

    setResidentResults([]);

    setShowResidentResults(false);

    setSuccessMessage("");
    setErrorMessage("");

  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="staff-appointment-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="staff-appointment-sidebar">

        {/* LOGO */}

        <div className="staff-appointment-logo-wrapper">

          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="staff-appointment-logo"
          />

        </div>

        <div className="staff-appointment-divider"></div>

        {/* PORTAL */}

        <div className="staff-appointment-portal-label">
          STAFF PORTAL
        </div>

        {/* MENU */}

        <nav className="staff-appointment-menu">

          {/* DASHBOARD */}

          <a
            href="#"
            className="staff-appointment-menu-item"
            onClick={(e) => {

              e.preventDefault();

              handleNavigation(
                "staff-dashboard"
              );

            }}
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </a>

          {/* DOCUMENT REQUESTS */}

          <a
            href="#"
            className="staff-appointment-menu-item"
            onClick={(e) => {

              e.preventDefault();

              handleNavigation(
                "staff-documents"
              );

            }}
          >
            <span>📄</span>
            <span>Document Requests</span>
          </a>

          {/* RESIDENTS */}

          <a
            href="#"
            className="staff-appointment-menu-item"
            onClick={(e) => {

              e.preventDefault();

              handleNavigation(
                "staff-residents"
              );

            }}
          >
            <span>👥</span>
            <span>Residents</span>
          </a>

          {/* APPOINTMENTS */}

          <a
            href="#"
            className="staff-appointment-menu-item active"
            onClick={(e) => {

              e.preventDefault();

              handleNavigation(
                "staff-appointments"
              );

            }}
          >
            <span>🗓️</span>
            <span>Appointments</span>
          </a>

          {/* PREDICTIVE ANALYTICS */}

          <a
            href="#"
            className="staff-appointment-menu-item"
            onClick={(e) => {

              e.preventDefault();

              handleNavigation(
                "staff-predictive-analytics"
              );

            }}
          >
            <span>📊</span>
            <span>Predictive Analytics</span>
          </a>

          {/* LOGOUT */}

          <a
            href="#"
            className="staff-appointment-menu-item logout"
            onClick={(e) => {

              e.preventDefault();

              localStorage.removeItem(
                "currentPage"
              );

              handleNavigation("login");

            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </a>

        </nav>

        {/* SIDEBAR FOOTER */}

        <div className="staff-appointment-sidebar-footer">

          Barangay Management System
          <br />
          Staff Portal

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="staff-appointment-main">

        {/* TOP BAR */}

        <div className="staff-appointment-topbar">

          <button
            type="button"
            className="staff-appointment-back-button"
            onClick={() =>
              handleNavigation(
                "staff-dashboard"
              )
            }
          >
            ← Back to Dashboard
          </button>

        </div>


        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="staff-appointment-header">

          <div>

            <div className="staff-appointment-eyebrow">
              STAFF PORTAL
            </div>

            <h1>
              Walk-in Appointment
            </h1>

            <p>
              Create an appointment for a resident
              visiting the barangay office.
            </p>

          </div>


          {/* DATE */}

          <div className="staff-appointment-date-card">

            <span>
              📅
            </span>

            <div>

              <small>
                TODAY
              </small>

              <strong>
                {currentDate}
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================================
            INFORMATION BANNER
        =================================================== */}

        <div className="staff-appointment-info-banner">

          <div className="staff-appointment-info-icon">
            ℹ️
          </div>

          <div>

            <strong>
              Walk-in Resident Appointment
            </strong>

            <p>
              Search for a resident registered in
              the barangay database, select the
              resident, and create an appointment
              on their behalf.
            </p>

          </div>

        </div>


        {/* ===================================================
            SUCCESS MESSAGE
        =================================================== */}

        {successMessage && (

          <div className="staff-appointment-success">

            <span>
              ✓
            </span>

            <div>

              <strong>
                Appointment Created
              </strong>

              <p>
                {successMessage}
              </p>

            </div>

          </div>

        )}


        {/* ===================================================
            ERROR MESSAGE
        =================================================== */}

        {errorMessage && (

          <div className="staff-appointment-error">

            <span>
              ✕
            </span>

            <div>

              <strong>
                Unable to Create Appointment
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
          className="staff-appointment-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              RESIDENT INFORMATION
          ================================================= */}

          <section className="staff-appointment-card">

            <div className="staff-appointment-card-header">

              <div className="staff-appointment-card-icon">
                👤
              </div>

              <div>

                <h2>
                  Resident
                </h2>

                <p>
                  Search for the walk-in resident
                  who needs the appointment.
                </p>

              </div>

            </div>


            {/* TYPEAHEAD */}

            <div className="staff-appointment-resident-search">

              <label>
                Search Resident
                <span>*</span>
              </label>

              <div className="staff-appointment-typeahead">

                <input
                  type="text"
                  value={residentSearch}
                  onChange={
                    handleResidentSearchChange
                  }
                  onFocus={() => {

                    if (
                      residentSearch.trim()
                    ) {

                      setShowResidentResults(
                        true
                      );

                    }

                  }}
                  placeholder="Type resident name or contact number..."
                  autoComplete="off"
                />


                {searchingResidents && (

                  <span className="staff-appointment-search-loading">
                    Searching...
                  </span>

                )}


                {showResidentResults &&
                  residentSearch.trim() && (

                    <div className="staff-appointment-typeahead-results">

                      {residentResults.length > 0 ? (

                        residentResults.map(
                          (resident) => (

                            <button
                              type="button"
                              key={resident.id}
                              className="staff-appointment-resident-result"
                              onClick={() =>
                                selectResident(
                                  resident
                                )
                              }
                            >

                              <div className="staff-appointment-result-name">

                                {resident.full_name}

                              </div>

                              <div className="staff-appointment-result-details">

                                {resident.contact_number && (

                                  <span>
                                    📞{" "}
                                    {
                                      resident.contact_number
                                    }
                                  </span>

                                )}

                                {resident.address && (

                                  <span>
                                    📍{" "}
                                    {
                                      resident.address
                                    }
                                  </span>

                                )}

                              </div>

                            </button>

                          )
                        )

                      ) : (

                        !searchingResidents && (

                          <div className="staff-appointment-no-results">

                            No resident found.

                          </div>

                        )

                      )}

                    </div>

                  )}

              </div>

            </div>


            {/* SELECTED RESIDENT */}

            {selectedResident && (

              <div className="staff-appointment-selected-resident">

                <div className="staff-appointment-selected-icon">
                  👤
                </div>


                <div className="staff-appointment-selected-info">

                  <strong>
                    {selectedResident.full_name}
                  </strong>

                  <span>
                    Resident ID:{" "}
                    {selectedResident.id}
                  </span>

                  {selectedResident.contact_number && (

                    <span>
                      📞{" "}
                      {
                        selectedResident.contact_number
                      }
                    </span>

                  )}

                  {selectedResident.address && (

                    <span>
                      📍{" "}
                      {selectedResident.address}
                    </span>

                  )}

                </div>


                <button
                  type="button"
                  className="staff-appointment-clear-resident"
                  onClick={
                    clearSelectedResident
                  }
                >
                  Change
                </button>

              </div>

            )}

          </section>


          {/* =================================================
              APPOINTMENT INFORMATION
          ================================================= */}

          <section className="staff-appointment-card">

            <div className="staff-appointment-card-header">

              <div className="staff-appointment-card-icon blue">
                🗓️
              </div>

              <div>

                <h2>
                  Appointment Information
                </h2>

                <p>
                  Enter the details of the resident's
                  appointment.
                </p>

              </div>

            </div>


            <div className="staff-appointment-form-grid">


              {/* DOCUMENT TYPE */}

              <div className="staff-appointment-field">

                <label>
                  Document Type
                  <span>*</span>
                </label>

                <select
                  name="documentType"
                  value={form.documentType}
                  onChange={handleChange}
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


              {/* APPOINTMENT DATE */}

              <div className="staff-appointment-field">

                <label>
                  Appointment Date
                  <span>*</span>
                </label>

                <input
                  type="date"
                  name="appointmentDate"
                  value={
                    form.appointmentDate
                  }
                  onChange={handleChange}
                  min={today}
                />

              </div>


              {/* APPOINTMENT TIME */}

              <div className="staff-appointment-field">

                <label>
                  Appointment Time
                  <span>*</span>
                </label>

                <select
                  name="appointmentTime"
                  value={
                    form.appointmentTime
                  }
                  onChange={handleChange}
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


              {/* PURPOSE */}

              <div className="staff-appointment-field full">

                <label>
                  Purpose
                  <span>*</span>
                </label>

                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  placeholder="Enter the purpose of the appointment..."
                  rows="4"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="staff-appointment-submit-section">

            <div className="staff-appointment-submit-note">

              <strong>
                Ready to create this appointment?
              </strong>

              <p>
                The appointment will be linked to
                the selected resident and recorded
                in the barangay appointment database.
              </p>

            </div>


            <div className="staff-appointment-submit-buttons">

              <button
                type="button"
                className="staff-appointment-clear-button"
                onClick={handleClear}
                disabled={loading}
              >
                Clear Form
              </button>


              <button
                type="button"
                className="staff-appointment-cancel-button"
                onClick={() =>
                  handleNavigation(
                    "staff-dashboard"
                  )
                }
                disabled={loading}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="staff-appointment-submit-button"
                disabled={
                  loading ||
                  !selectedResident
                }
              >

                {loading ? (

                  <>
                    <span className="staff-appointment-spinner"></span>
                    Creating Appointment...
                  </>

                ) : (

                  <>
                    ✓ Create Appointment
                  </>

                )}

              </button>

            </div>

          </div>

        </form>


        {/* FOOTER */}

        <div className="staff-appointment-footer">

          Barangay Management System
          {" • "}
          Staff Portal

        </div>

      </main>

    </div>

  );
};

export default StaffAppointments;