import React, { useState } from "react";
import "../App.css";

const API_BASE = "http://localhost/barangay-api";

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",

  sex: "",
  birthDate: "",
  birthPlace: "",
  civilStatus: "",

  contactNumber: "",
  email: "",

  houseNumber: "",
  street: "",
  barangay: "",
  municipality: "",
  province: "",

  occupation: "",
  nationality: "Filipino",

  emergencyName: "",
  emergencyContact: "",
  emergencyRelationship: "",

  seniorCitizen: false,
  pwd: false,
};

const StaffResidents = ({ setCurrentPage }) => {
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
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
     SAVE RESIDENT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    /* =======================================================
       VALIDATION
    ======================================================= */

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.sex ||
      !form.birthDate ||
      !form.contactNumber.trim() ||
      !form.houseNumber.trim() ||
      !form.street.trim() ||
      !form.barangay.trim() ||
      !form.municipality.trim() ||
      !form.province.trim()
    ) {
      setErrorMessage(
        "Please complete all required resident information."
      );

      setLoading(false);
      return;
    }

    /* =======================================================
       CONTACT NUMBER
    ======================================================= */

    const contactNumber = form.contactNumber.trim();

    if (!/^09\d{9}$/.test(contactNumber)) {
      setErrorMessage(
        "Please enter a valid Philippine mobile number (09XXXXXXXXX)."
      );

      setLoading(false);
      return;
    }

    /* =======================================================
       FULL ADDRESS
    ======================================================= */

    const fullAddress = [
      form.houseNumber.trim(),
      form.street.trim(),
      form.barangay.trim(),
      form.municipality.trim(),
      form.province.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    /* =======================================================
       DATA SENT TO PHP
    ======================================================= */

    const residentData = {
      first_name: form.firstName.trim(),
      middle_name: form.middleName.trim(),
      last_name: form.lastName.trim(),
      suffix: form.suffix.trim(),

      sex: form.sex,
      birthdate: form.birthDate,
      birth_place: form.birthPlace.trim(),
      civil_status: form.civilStatus,

      contact_number: contactNumber,
      email: form.email.trim(),

      address: fullAddress,

      house_number: form.houseNumber.trim(),
      street: form.street.trim(),
      barangay: form.barangay.trim(),
      municipality: form.municipality.trim(),
      province: form.province.trim(),

      occupation: form.occupation.trim(),
      nationality: form.nationality.trim(),

      emergency_name: form.emergencyName.trim(),
      emergency_contact: form.emergencyContact.trim(),
      emergency_relationship:
        form.emergencyRelationship.trim(),

      senior_citizen: form.seniorCitizen ? 1 : 0,
      pwd: form.pwd ? 1 : 0,

      account_type: "walk-in",
    };

    console.log(
      "Sending resident data:",
      residentData
    );

    /* =======================================================
       SEND TO PHP
    ======================================================= */

    try {
      const response = await fetch(
        `${API_BASE}/staff_residents.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(residentData),
        }
      );

      const responseText = await response.text();

      console.log(
        "PHP response:",
        responseText
      );

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(
          "PHP returned an invalid response. Check staff_residents.php for PHP errors."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to save the resident."
        );
      }

      /* =====================================================
         SUCCESS
      ===================================================== */

      setSuccessMessage(
        data.message ||
          "Walk-in resident has been saved successfully."
      );

      /* =====================================================
         CLEAR FORM
      ===================================================== */

      setForm({
        ...emptyForm,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {
      console.error(
        "Staff resident save error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to connect to the PHP server."
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

    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <div className="staff-resident-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="staff-resident-sidebar">

        <div className="staff-resident-logo-wrapper">
          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="staff-resident-logo"
          />
        </div>

        <div className="staff-resident-divider"></div>

        <div className="staff-resident-portal-label">
          STAFF PORTAL
        </div>

        <nav className="staff-resident-menu">

          <a
            href="#"
            className="staff-resident-menu-item"
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
            className="staff-resident-menu-item"
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
            className="staff-resident-menu-item active"
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
            className="staff-resident-menu-item"
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
            className="staff-resident-menu-item"
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

          <a
            href="#"
            className="staff-resident-menu-item logout"
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

        <div className="staff-resident-sidebar-footer">
          Barangay Management System
          <br />
          Staff Portal
        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="staff-resident-main">

        <div className="staff-resident-topbar">

          <button
            type="button"
            className="staff-resident-back-button"
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

        <section className="staff-resident-header">

          <div>

            <div className="staff-resident-eyebrow">
              STAFF PORTAL
            </div>

            <h1>
              Walk-in Resident Information
            </h1>

            <p>
              Record the information of a resident
              visiting the barangay office without
              a resident account.
            </p>

          </div>

          <div className="staff-resident-date-card">

            <span>📅</span>

            <div>

              <small>TODAY</small>

              <strong>
                {currentDate}
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================================
            INFO
        =================================================== */}

        <div className="staff-resident-info-banner">

          <div className="staff-resident-info-icon">
            ℹ️
          </div>

          <div>

            <strong>
              Walk-in Resident
            </strong>

            <p>
              Use this page to record the information
              of a resident who does not have an online
              account. The information will be saved
              directly to the barangay residents database.
            </p>

          </div>

        </div>


        {/* ===================================================
            SUCCESS
        =================================================== */}

        {successMessage && (
          <div className="staff-resident-success">

            <span>✓</span>

            <div>

              <strong>
                Resident Saved
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
          <div className="staff-resident-error">

            <span>✕</span>

            <div>

              <strong>
                Unable to Save
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
          className="staff-resident-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <section className="staff-resident-card">

            <div className="staff-resident-card-header">

              <div className="staff-resident-card-icon">
                👤
              </div>

              <div>

                <h2>
                  Personal Information
                </h2>

                <p>
                  Basic information about the
                  walk-in resident.
                </p>

              </div>

            </div>

            <div className="staff-resident-form-grid">

              <div className="staff-resident-field">

                <label>
                  First Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Middle Name
                </label>

                <input
                  type="text"
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  placeholder="Enter middle name"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Last Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Suffix
                </label>

                <select
                  name="suffix"
                  value={form.suffix}
                  onChange={handleChange}
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


              <div className="staff-resident-field">

                <label>
                  Sex <span>*</span>
                </label>

                <select
                  name="sex"
                  value={form.sex}
                  onChange={handleChange}
                >

                  <option value="">
                    Select sex
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                </select>

              </div>


              <div className="staff-resident-field">

                <label>
                  Date of Birth <span>*</span>
                </label>

                <input
                  type="date"
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Place of Birth
                </label>

                <input
                  type="text"
                  name="birthPlace"
                  value={form.birthPlace}
                  onChange={handleChange}
                  placeholder="Enter place of birth"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Civil Status
                </label>

                <select
                  name="civilStatus"
                  value={form.civilStatus}
                  onChange={handleChange}
                >

                  <option value="">
                    Select civil status
                  </option>

                  <option value="Single">
                    Single
                  </option>

                  <option value="Married">
                    Married
                  </option>

                  <option value="Widowed">
                    Widowed
                  </option>

                  <option value="Separated">
                    Separated
                  </option>

                </select>

              </div>


              <div className="staff-resident-field">

                <label>
                  Nationality
                </label>

                <input
                  type="text"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  placeholder="Enter nationality"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Occupation
                </label>

                <input
                  type="text"
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  placeholder="Enter occupation"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              CONTACT
          ================================================= */}

          <section className="staff-resident-card">

            <div className="staff-resident-card-header">

              <div className="staff-resident-card-icon blue">
                📞
              </div>

              <div>

                <h2>
                  Contact Information
                </h2>

                <p>
                  Contact details where the resident
                  can be reached.
                </p>

              </div>

            </div>

            <div className="staff-resident-form-grid">

              <div className="staff-resident-field">

                <label>
                  Contact Number <span>*</span>
                </label>

                <input
                  type="tel"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="09XXXXXXXXX"
                  maxLength="11"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              ADDRESS
          ================================================= */}

          <section className="staff-resident-card">

            <div className="staff-resident-card-header">

              <div className="staff-resident-card-icon orange">
                🏠
              </div>

              <div>

                <h2>
                  Address
                </h2>

                <p>
                  Current residential address of the
                  walk-in resident.
                </p>

              </div>

            </div>

            <div className="staff-resident-form-grid">

              <div className="staff-resident-field">

                <label>
                  House / Building No. <span>*</span>
                </label>

                <input
                  type="text"
                  name="houseNumber"
                  value={form.houseNumber}
                  onChange={handleChange}
                  placeholder="House number"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Street <span>*</span>
                </label>

                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="Street name"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Barangay <span>*</span>
                </label>

                <input
                  type="text"
                  name="barangay"
                  value={form.barangay}
                  onChange={handleChange}
                  placeholder="Barangay"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Municipality / City <span>*</span>
                </label>

                <input
                  type="text"
                  name="municipality"
                  value={form.municipality}
                  onChange={handleChange}
                  placeholder="Municipality or city"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Province <span>*</span>
                </label>

                <input
                  type="text"
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  placeholder="Province"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              CLASSIFICATION
          ================================================= */}

          <section className="staff-resident-card">

            <div className="staff-resident-card-header">

              <div className="staff-resident-card-icon purple">
                🏷️
              </div>

              <div>

                <h2>
                  Resident Classification
                </h2>

                <p>
                  Select applicable classifications.
                </p>

              </div>

            </div>

            <div className="staff-resident-checkbox-grid">

              <label className="staff-resident-checkbox">

                <input
                  type="checkbox"
                  name="seniorCitizen"
                  checked={form.seniorCitizen}
                  onChange={handleChange}
                />

                <span>
                  Senior Citizen
                </span>

              </label>


              <label className="staff-resident-checkbox">

                <input
                  type="checkbox"
                  name="pwd"
                  checked={form.pwd}
                  onChange={handleChange}
                />

                <span>
                  Person with Disability (PWD)
                </span>

              </label>

            </div>

          </section>


          {/* =================================================
              EMERGENCY
          ================================================= */}

          <section className="staff-resident-card">

            <div className="staff-resident-card-header">

              <div className="staff-resident-card-icon red">
                🚨
              </div>

              <div>

                <h2>
                  Emergency Contact
                </h2>

                <p>
                  Optional emergency contact information.
                </p>

              </div>

            </div>

            <div className="staff-resident-form-grid">

              <div className="staff-resident-field">

                <label>
                  Contact Person
                </label>

                <input
                  type="text"
                  name="emergencyName"
                  value={form.emergencyName}
                  onChange={handleChange}
                  placeholder="Full name"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Contact Number
                </label>

                <input
                  type="tel"
                  name="emergencyContact"
                  value={form.emergencyContact}
                  onChange={handleChange}
                  placeholder="09XXXXXXXXX"
                />

              </div>


              <div className="staff-resident-field">

                <label>
                  Relationship
                </label>

                <input
                  type="text"
                  name="emergencyRelationship"
                  value={form.emergencyRelationship}
                  onChange={handleChange}
                  placeholder="e.g. Mother, Father, Spouse"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="staff-resident-submit-section">

            <div className="staff-resident-submit-note">

              <strong>
                Ready to record this resident?
              </strong>

              <p>
                Make sure the information provided
                by the walk-in resident is correct
                before saving.
              </p>

            </div>


            <div className="staff-resident-submit-buttons">

              <button
                type="button"
                className="staff-resident-clear-button"
                onClick={handleClear}
                disabled={loading}
              >
                Clear Form
              </button>


              <button
                type="button"
                className="staff-resident-cancel-button"
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
                className="staff-resident-submit-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="staff-resident-spinner"></span>
                    Saving Resident...
                  </>
                ) : (
                  <>
                    ✓ Save Resident
                  </>
                )}

              </button>

            </div>

          </div>

        </form>


        {/* FOOTER */}

        <div className="staff-resident-footer">

          Barangay Management System
          {" • "}
          Staff Portal

        </div>

      </main>

    </div>
  );
};

export default StaffResidents;