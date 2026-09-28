import React, { useEffect, useState } from "react";
import "../App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const PROFILE_API = `${API_URL}/api/profile`;

// ==========================================
// HELPERS
// ==========================================

// Return the first non-empty value among several possible field names
// (works whether the backend sends first_name, firstName, etc.)
const pick = (obj, ...keys) => {
  if (!obj) return "";
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  return "";
};

// <input type="date"> needs YYYY-MM-DD
const toDateInput = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) {
    return String(value).slice(0, 10);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

// Backend may wrap the resident in different keys
const extractResident = (data) => {
  if (!data) return null;
  const candidate =
    data.resident ||
    data.user ||
    data.profile ||
    data.data ||
    (data.first_name || data.firstName || data.email ? data : null);
  return candidate && typeof candidate === "object" ? candidate : null;
};

// Convert a raw backend resident into the form shape
const mapResidentToForm = (resident) => ({
  firstName: pick(resident, "first_name", "firstName"),
  middleName: pick(resident, "middle_name", "middleName"),
  lastName: pick(resident, "last_name", "lastName"),
  sex: pick(resident, "sex", "gender"),
  birthdate: toDateInput(pick(resident, "birthdate", "birth_date", "birthDate")),
  civilStatus: pick(resident, "civil_status", "civilStatus"),
  address: pick(resident, "address"),
  occupation: pick(resident, "occupation"),
  contactNumber: pick(resident, "contact_number", "contactNumber", "phone"),
  email: pick(resident, "email"),
  seniorCitizen: pick(resident, "senior_citizen", "seniorCitizen") || "No",
  pwd: pick(resident, "pwd") || "No"
});

const buildFullName = (form) =>
  [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ");

// Save what we know so the profile still shows something if the server is slow
const cacheProfile = (form) => {
  try {
    localStorage.setItem("residentProfile", JSON.stringify(form));
    localStorage.setItem("userEmail", form.email || "");
    localStorage.setItem("residentName", buildFullName(form));
  } catch (e) {
    console.error("Unable to cache profile:", e);
  }
};

// Build a basic profile from whatever login/registration stored locally
const readCachedProfile = () => {
  try {
    const saved = localStorage.getItem("residentProfile");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Cached profile unreadable:", e);
  }

  const name = (localStorage.getItem("residentName") || "").trim();
  const email = localStorage.getItem("userEmail") || "";

  if (!name && !email) return null;

  const parts = name.split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || "",
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    lastName: parts.length > 1 ? parts[parts.length - 1] : "",
    sex: "",
    birthdate: "",
    civilStatus: "",
    address: "",
    occupation: "",
    contactNumber: "",
    email,
    seniorCitizen: "No",
    pwd: "No"
  };
};

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  sex: "",
  birthdate: "",
  civilStatus: "",
  address: "",
  occupation: "",
  contactNumber: "",
  email: "",
  seniorCitizen: "No",
  pwd: "No"
};

const Profile = ({ setCurrentPage }) => {
  // ==========================================
  // STATES
  // ==========================================

  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    message: ""
  });

  // ==========================================
  // POPUP
  // ==========================================

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, type, message });

    setTimeout(() => {
      setPopup({ show: false, type: "success", message: "" });
    }, 2000);
  };

  const closePopup = () => {
    setPopup({ show: false, type: "success", message: "" });
  };

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    const currentResidentId = localStorage.getItem("residentId");
    const currentEmail = localStorage.getItem("userEmail");

    console.log("CURRENT RESIDENT ID:", currentResidentId);
    console.log("CURRENT EMAIL:", currentEmail);

    // Nobody is logged in
    if (!currentResidentId && !currentEmail) {
      console.error("No resident ID or email found. Returning to login.");
      setLoading(false);
      setCurrentPage("login");
      return;
    }

    // Show cached info immediately so the page is never blank
    const cached = readCachedProfile();
    if (cached) {
      setFormData((previous) => ({ ...previous, ...cached }));
    }

    const fetchProfile = async () => {
      try {
        // Send the resident id, and the email as a backup lookup
        const params = new URLSearchParams();
        if (currentResidentId) params.set("resident_id", currentResidentId);
        if (currentEmail) params.set("email", currentEmail);

        const response = await fetch(`${PROFILE_API}?${params.toString()}`);

        console.log("Profile HTTP Status:", response.status);

        const responseText = await response.text();
        console.log("Profile raw response:", responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("Profile API returned invalid JSON:", jsonError);
          throw new Error("Invalid response from profile API.");
        }

        console.log("PROFILE API DATA:", data);

        const resident = extractResident(data);

        if (response.ok && data.success !== false && resident) {
          const mapped = mapResidentToForm(resident);

          console.log("CURRENT RESIDENT FROM DATABASE:", resident);

          setFormData(mapped);

          // Keep the login session in sync with the database
          const foundId = resident._id || resident.id;
          if (foundId && !currentResidentId) {
            localStorage.setItem("residentId", String(foundId));
          }

          cacheProfile(mapped);
        } else {
          console.error("Profile not found:", data.message);

          if (cached) {
            showPopup(
              data.message || "Showing saved profile information.",
              "error"
            );
          } else {
            localStorage.removeItem("residentId");
            localStorage.removeItem("residentName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("residentProfile");
            localStorage.removeItem("loggedIn");
            localStorage.removeItem("isLoggedIn");
            setCurrentPage("login");
          }
        }
      } catch (error) {
        console.error("PROFILE ERROR:", error);

        showPopup(
          cached
            ? "Server unreachable. Showing saved profile information."
            : "Unable to load profile information.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setCurrentPage]);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const residentId = localStorage.getItem("residentId");

    if (!residentId) {
      showPopup("Resident ID not found. Please login again.", "error");
      return;
    }

    if (!formData.firstName.trim()) {
      showPopup("Please enter your first name.", "error");
      return;
    }

    if (!formData.lastName.trim()) {
      showPopup("Please enter your last name.", "error");
      return;
    }

    if (!formData.email.trim()) {
      showPopup("Please enter your email address.", "error");
      return;
    }

    try {
      const response = await fetch(PROFILE_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resident_id: residentId,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          sex: formData.sex,
          birthdate: formData.birthdate || null,
          civilStatus: formData.civilStatus,
          address: formData.address,
          occupation: formData.occupation,
          contactNumber: formData.contactNumber,
          email: formData.email,
          seniorCitizen: formData.seniorCitizen,
          pwd: formData.pwd
        })
      });

      console.log("UPDATE PROFILE HTTP status:", response.status);

      const responseText = await response.text();
      console.log("UPDATE PROFILE raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        showPopup(
          `Server replied with status ${response.status} but not valid JSON. The PUT /api/profile route may be missing.`,
          "error"
        );
        return;
      }

      console.log("UPDATE PROFILE API:", data);

      if (!response.ok || !data.success) {
        showPopup(
          data.message || `Failed to update profile (status ${response.status}).`,
          "error"
        );
        return;
      }

      cacheProfile(formData);

      showPopup("Profile updated successfully!", "success");
      setShowEditModal(false);
    } catch (error) {
      console.error("PROFILE UPDATE ERROR:", error, "URL:", PROFILE_API);
      showPopup(
        "Request blocked or server unreachable (check CORS allows PUT, and the API URL).",
        "error"
      );
    }
  };

  const handleBack = () => setCurrentPage("dashboard");

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatBirthdate = (date) => {
    if (!date) return "Not provided";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-icon">👤</div>
        <h2>Loading Profile...</h2>
        <p>Please wait while your profile information is being loaded.</p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="profile-page">
      {/* POPUP ALERT */}
      {popup.show && (
        <div
          className={`profile-popup-alert ${
            popup.type === "success"
              ? "profile-popup-success"
              : "profile-popup-error"
          }`}
        >
          <div className="profile-popup-icon">
            {popup.type === "success" ? "✓" : "!"}
          </div>

          <div className="profile-popup-content">
            <strong>{popup.type === "success" ? "Success" : "Error"}</strong>
            <p>{popup.message}</p>
          </div>

          <button
            type="button"
            className="profile-popup-close"
            onClick={closePopup}
          >
            ×
          </button>
        </div>
      )}

      {/* BACKGROUND */}
      <div className="profile-bg-circle circle-one"></div>
      <div className="profile-bg-circle circle-two"></div>

      {/* HEADER */}
      <div className="profile-header">
        <div>
          <p className="profile-header-small">BARANGAY RESIDENT PORTAL</p>

          <div className="profile-title-row">
            <div className="profile-title-icon">👤</div>

            <div>
              <h1>My Profile</h1>
              <p>View your personal information and account details.</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="profile-edit-button"
          onClick={openEditModal}
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* PROFILE INFORMATION */}
      <div className="profile-view-card">
        <div className="profile-view-top">
          <div className="profile-large-avatar">
            {formData.firstName
              ? formData.firstName.charAt(0).toUpperCase()
              : "R"}
          </div>

          <div className="profile-view-name">
            <h2>{buildFullName(formData) || "Resident"}</h2>
            <p>Resident Account</p>
          </div>
        </div>

        <div className="profile-view-divider"></div>

        {/* PERSONAL INFORMATION */}
        <div className="profile-section">
          <div className="profile-section-title">
            <span>👤</span>
            <h3>Personal Information</h3>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span>First Name</span>
              <strong>{formData.firstName || "Not provided"}</strong>
            </div>

            <div className="profile-info-item">
              <span>Middle Name</span>
              <strong>{formData.middleName || "Not provided"}</strong>
            </div>

            <div className="profile-info-item">
              <span>Last Name</span>
              <strong>{formData.lastName || "Not provided"}</strong>
            </div>

            <div className="profile-info-item">
              <span>Sex</span>
              <strong>{formData.sex || "Not provided"}</strong>
            </div>

            <div className="profile-info-item">
              <span>Birthdate</span>
              <strong>{formatBirthdate(formData.birthdate)}</strong>
            </div>

            <div className="profile-info-item">
              <span>Civil Status</span>
              <strong>{formData.civilStatus || "Not provided"}</strong>
            </div>
          </div>
        </div>

        {/* CONTACT INFORMATION */}
        <div className="profile-section">
          <div className="profile-section-title">
            <span>📞</span>
            <h3>Contact Information</h3>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span>Email Address</span>
              <strong>{formData.email || "Not provided"}</strong>
            </div>

            <div className="profile-info-item">
              <span>Contact Number</span>
              <strong>{formData.contactNumber || "Not provided"}</strong>
            </div>

            <div className="profile-info-item profile-full-width">
              <span>Address</span>
              <strong>{formData.address || "Not provided"}</strong>
            </div>
          </div>
        </div>

        {/* OTHER INFORMATION */}
        <div className="profile-section">
          <div className="profile-section-title">
            <span>📋</span>
            <h3>Other Information</h3>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span>Occupation</span>
              <strong>{formData.occupation || "Not provided"}</strong>
            </div>

            <div className="profile-info-item">
              <span>Senior Citizen</span>
              <strong
                className={
                  formData.seniorCitizen === "Yes"
                    ? "profile-status yes"
                    : "profile-status no"
                }
              >
                {formData.seniorCitizen}
              </strong>
            </div>

            <div className="profile-info-item">
              <span>PWD</span>
              <strong
                className={
                  formData.pwd === "Yes"
                    ? "profile-status yes"
                    : "profile-status no"
                }
              >
                {formData.pwd}
              </strong>
            </div>
          </div>
        </div>

        <div className="profile-bottom-actions">
          <button
            type="button"
            className="back-dashboard-button"
            onClick={handleBack}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="profile-modal-overlay" onClick={closeEditModal}>
          <div
            className="profile-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-modal-header">
              <div>
                <div className="profile-modal-title">
                  <span>✏️</span>

                  <div>
                    <h2>Update Profile</h2>
                    <p>Update your personal information below.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="profile-modal-close"
                onClick={closeEditModal}
              >
                ×
              </button>
            </div>

            <div className="profile-modal-divider"></div>

            <form onSubmit={handleSubmit}>
              {/* PERSONAL INFORMATION */}
              <div className="profile-modal-section">
                <h3>Personal Information</h3>

                <div className="profile-modal-grid three-columns">
                  <div className="profile-modal-form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="profile-modal-form-group">
                    <label>Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="profile-modal-form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="profile-modal-grid three-columns">
                  <div className="profile-modal-form-group">
                    <label>Sex</label>
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="profile-modal-form-group">
                    <label>Birthdate</label>
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="profile-modal-form-group">
                    <label>Civil Status</label>
                    <select
                      name="civilStatus"
                      value={formData.civilStatus}
                      onChange={handleChange}
                    >
                      <option value="">Select Civil Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CONTACT INFORMATION */}
              <div className="profile-modal-section">
                <h3>Contact Information</h3>

                <div className="profile-modal-grid two-columns">
                  <div className="profile-modal-form-group">
                    <label>Contact Number</label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="profile-modal-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="profile-modal-form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </div>

              {/* OTHER INFORMATION */}
              <div className="profile-modal-section">
                <h3>Other Information</h3>

                <div className="profile-modal-grid three-columns">
                  <div className="profile-modal-form-group">
                    <label>Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="profile-modal-form-group">
                    <label>Senior Citizen</label>
                    <select
                      name="seniorCitizen"
                      value={formData.seniorCitizen}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div className="profile-modal-form-group">
                    <label>PWD</label>
                    <select
                      name="pwd"
                      value={formData.pwd}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* MODAL BUTTONS */}
              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="profile-modal-cancel"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>

                <button type="submit" className="profile-modal-save">
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
