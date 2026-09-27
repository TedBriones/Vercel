import React, { useState } from "react";
import "../App.css";

const Report = ({ setCurrentPage }) => {

  const emptyForm = {
    incidentDateTime: "",
    incidentSeverity: "",
    incidentTypes: [],
    description: "",

    facility: "",
    location: "",
    address: "",
    cityState: "",

    personsInvolved: "",
    witnesses: "",
    medicalAttention: "No",

    reporterName: "",
    reporterRole: "",
    reporterEmail: "",
    reporterPhone: "",
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const steps = [
    { id: 1, label: "General Information" },
    { id: 2, label: "Incident Location" },
    { id: 3, label: "Participants" },
    { id: 4, label: "Contact Info" },
  ];

  const incidentTypeOptions = [
    ["Vehicle", "Injury", "Sabotage", "Explosives Involved?"],
    ["Environmental", "Theft", "Security", "Radiation Involved?"],
    ["Fire", "Illness", "External Assessment", "Other"],
  ];

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

  const handleCheckboxChange = (value) => {
    setForm((prev) => {
      const exists = prev.incidentTypes.includes(value);

      return {
        ...prev,
        incidentTypes: exists
          ? prev.incidentTypes.filter((t) => t !== value)
          : [...prev.incidentTypes, value],
      };
    });
  };

  /* =========================================================
     STEP NAVIGATION
  ========================================================= */

  const validateStep = (step) => {
    if (step === 1) {
      if (!form.incidentDateTime || !form.incidentSeverity) {
        setErrorMessage("Please fill in the incident date, time, and severity.");
        return false;
      }
    }

    if (step === 4) {
      if (!form.reporterName.trim() || !form.reporterEmail.trim()) {
        setErrorMessage("Please provide your name and email address.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setErrorMessage("");
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setErrorMessage("");
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      /*
       * Replace with your actual endpoint, e.g.:
       * const response = await fetch("http://localhost/barangay-api/report.php", {
       *   method: "POST",
       *   headers: { "Content-Type": "application/json" },
       *   body: JSON.stringify(form)
       * });
       */

      await new Promise((resolve) => setTimeout(resolve, 600));

      setSuccessMessage(
        "Your incident report has been submitted and dispatched to the HSE team."
      );

      setForm(emptyForm);
      setCurrentStep(1);

      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
      console.error("Report submission error:", error);

      setErrorMessage(
        error.message || "Unable to submit the report. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm(emptyForm);
    setCurrentStep(1);
    setSuccessMessage("");
    setErrorMessage("");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="report-page">

      <main className="report-main">

        {/* TOP BAR */}

        <div className="report-topbar">
          <button
            type="button"
            className="report-back-button"
            onClick={() => handleNavigation("dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* HEADER */}

        <section className="report-header">

          <div>
            <div className="report-eyebrow">RESIDENT PORTAL</div>
            <h1>Incident Report</h1>
            <p>
              Complete this form to report any type of incident. If possible,
              submit within 24 hours of the event.
            </p>
          </div>

          <div className="report-date-card">
            <span>📅</span>
            <div>
              <small>TODAY</small>
              <strong>{currentDate}</strong>
            </div>
          </div>

        </section>

        {/* INFO BANNER */}

        <div className="report-info-banner">
          <div className="report-info-icon">ℹ️</div>
          <div>
            <strong>Before You Begin</strong>
            <p>
              This report will be sent directly to the barangay HSE team.
              Please provide accurate details across all four steps.
            </p>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}

        {successMessage && (
          <div className="report-success">
            <span>✓</span>
            <div>
              <strong>Report Submitted</strong>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}

        {errorMessage && (
          <div className="report-error">
            <span>✕</span>
            <div>
              <strong>Unable to Continue</strong>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* PROGRESS TRACKER */}

        <div className="report-progress">
          <div className="report-progress-track">
            <div
              className="report-progress-fill"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>

          <div className="report-progress-steps">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <button
                  type="button"
                  key={step.id}
                  className="report-progress-step"
                  onClick={() => setCurrentStep(step.id)}
                >
                  <span
                    className={`report-progress-circle ${
                      isActive ? "active" : ""
                    } ${isCompleted ? "completed" : ""}`}
                  >
                    {step.id}
                  </span>
                  <span
                    className={`report-progress-label ${
                      isActive || isCompleted ? "active" : ""
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FORM */}

        <form className="report-form" onSubmit={handleSubmit}>

          {/* STEP 1: GENERAL INFORMATION */}

          {currentStep === 1 && (
            <section className="report-card">

              <div className="report-card-header">
                <div className="report-card-icon">📝</div>
                <div>
                  <h2>General Information</h2>
                  <p>Tell us when it happened and how serious it was.</p>
                </div>
              </div>

              <div className="report-form-grid">

                <div className="report-field">
                  <label>
                    Incident Date & Time <span>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="incidentDateTime"
                    value={form.incidentDateTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="report-field">
                  <label>
                    Incident Severity <span>*</span>
                  </label>
                  <select
                    name="incidentSeverity"
                    value={form.incidentSeverity}
                    onChange={handleChange}
                  >
                    <option value="" disabled hidden>
                      Select severity level...
                    </option>
                    <option value="Low / Minor">Low / Minor</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High / Major">High / Major</option>
                    <option value="Critical / Fatal">Critical / Fatal</option>
                  </select>
                </div>

                <div className="report-field full">
                  <label>Incident Type</label>

                  <div className="report-checkbox-grid">
                    {incidentTypeOptions.map((column, colIdx) => (
                      <div className="report-checkbox-column" key={colIdx}>
                        {column.map((type) => {
                          const isChecked = form.incidentTypes.includes(type);
                          return (
                            <label key={type} className="report-checkbox-item">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(type)}
                              />
                              <span>{type}</span>
                            </label>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <p className="report-hint">
                    More than one type can be selected — e.g. a Vehicle Incident
                    may also involve an Injury.
                  </p>
                </div>

                <div className="report-field full">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe what happened..."
                  />
                </div>

              </div>
            </section>
          )}

          {/* STEP 2: LOCATION */}

          {currentStep === 2 && (
            <section className="report-card">

              <div className="report-card-header">
                <div className="report-card-icon blue">📍</div>
                <div>
                  <h2>Incident Location</h2>
                  <p>Where did the incident take place?</p>
                </div>
              </div>

              <div className="report-form-grid">

                <div className="report-field">
                  <label>Facility / Site Name</label>
                  <input
                    type="text"
                    name="facility"
                    value={form.facility}
                    onChange={handleChange}
                    placeholder="e.g. Main Plant / Warehouse B"
                  />
                </div>

                <div className="report-field">
                  <label>Specific Location / Department</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Loading Dock #3, 2nd Floor"
                  />
                </div>

                <div className="report-field">
                  <label>Address Line</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street Address"
                  />
                </div>

                <div className="report-field">
                  <label>City & State/Province</label>
                  <input
                    type="text"
                    name="cityState"
                    value={form.cityState}
                    onChange={handleChange}
                    placeholder="City, State"
                  />
                </div>

              </div>
            </section>
          )}

          {/* STEP 3: PARTICIPANTS */}

          {currentStep === 3 && (
            <section className="report-card">

              <div className="report-card-header">
                <div className="report-card-icon">👥</div>
                <div>
                  <h2>Participants & Witnesses</h2>
                  <p>Who was involved, and was medical attention needed?</p>
                </div>
              </div>

              <div className="report-form-grid">

                <div className="report-field">
                  <label>Persons Involved (Name & Role)</label>
                  <input
                    type="text"
                    name="personsInvolved"
                    value={form.personsInvolved}
                    onChange={handleChange}
                    placeholder="John Doe (Operator), Jane Smith (Driver)"
                  />
                </div>

                <div className="report-field">
                  <label>Witnesses (Name & Phone)</label>
                  <input
                    type="text"
                    name="witnesses"
                    value={form.witnesses}
                    onChange={handleChange}
                    placeholder="Mark Taylor (+63 900 000 0000)"
                  />
                </div>

                <div className="report-field full">
                  <label>Medical Attention Required?</label>
                  <select
                    name="medicalAttention"
                    value={form.medicalAttention}
                    onChange={handleChange}
                  >
                    <option value="No">No</option>
                    <option value="First Aid On-site">Yes - First Aid On-site</option>
                    <option value="Hospital / ER Visit">Yes - Hospital / ER Visit</option>
                  </select>
                </div>

              </div>
            </section>
          )}

          {/* STEP 4: CONTACT INFO */}

          {currentStep === 4 && (
            <section className="report-card">

              <div className="report-card-header">
                <div className="report-card-icon">☎️</div>
                <div>
                  <h2>Reporter Contact Information</h2>
                  <p>How can the HSE team reach you for follow-up?</p>
                </div>
              </div>

              <div className="report-form-grid">

                <div className="report-field">
                  <label>
                    Full Name <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="reporterName"
                    value={form.reporterName}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>

                <div className="report-field">
                  <label>Job Title / Role</label>
                  <input
                    type="text"
                    name="reporterRole"
                    value={form.reporterRole}
                    onChange={handleChange}
                    placeholder="Safety Officer, Resident, etc."
                  />
                </div>

                <div className="report-field">
                  <label>
                    Email Address <span>*</span>
                  </label>
                  <input
                    type="email"
                    name="reporterEmail"
                    value={form.reporterEmail}
                    onChange={handleChange}
                    placeholder="you@email.com"
                  />
                </div>

                <div className="report-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="reporterPhone"
                    value={form.reporterPhone}
                    onChange={handleChange}
                    placeholder="+63 900 000 0000"
                  />
                </div>

              </div>
            </section>
          )}

          {/* SUBMIT / STEP NAVIGATION */}

          <div className="report-submit-section">

            <div className="report-submit-note">
              <strong>
                {currentStep < 4 ? "Continue when you're ready" : "Ready to submit?"}
              </strong>
              <p>
                {currentStep < 4
                  ? "You can go back at any time to review or change your answers."
                  : "Your report will be recorded and sent to the HSE team."}
              </p>
            </div>

            <div className="report-submit-buttons">

              <button
                type="button"
                className="report-clear-button"
                onClick={handleClear}
                disabled={loading}
              >
                Clear Form
              </button>

              {currentStep > 1 && (
                <button
                  type="button"
                  className="report-cancel-button"
                  onClick={handlePrev}
                  disabled={loading}
                >
                  ← Previous
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  className="report-submit-button"
                  onClick={handleNext}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="report-submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="report-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    <>✓ Submit Report</>
                  )}
                </button>
              )}

            </div>

          </div>

        </form>

        {/* FOOTER */}

        <div className="report-footer">
          Barangay Management System{" • "}Resident Portal
        </div>

      </main>

    </div>
  );
};

export default Report;