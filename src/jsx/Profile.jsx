import React, {
  useEffect,
  useState
} from "react";

import "../App.css";

const API_URL =
  "http://localhost/barangay-api/profile.php";

const Profile = ({
  setCurrentPage
}) => {

  // ==========================================
  // PROFILE FORM DATA
  // ==========================================

  const [formData, setFormData] =
    useState({

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

    });


  // ==========================================
  // STATES
  // ==========================================

  const [loading, setLoading] =
    useState(true);

  const [showEditModal, setShowEditModal] =
    useState(false);


  // ==========================================
  // POPUP ALERT STATE
  // ==========================================

  const [popup, setPopup] =
    useState({

      show: false,
      type: "success",
      message: ""

    });


  // ==========================================
  // CURRENT RESIDENT ID
  // ==========================================

  const residentId =
    localStorage.getItem(
      "residentId"
    );


  // ==========================================
  // SHOW POPUP
  // ==========================================

  const showPopup = (
    message,
    type = "success"
  ) => {

    setPopup({

      show: true,
      type: type,
      message: message

    });


    // Automatically close
    // after 2 seconds

    setTimeout(() => {

      setPopup({

        show: false,
        type: "success",
        message: ""

      });

    }, 2000);

  };


  // ==========================================
  // CLOSE POPUP
  // ==========================================

  const closePopup = () => {

    setPopup({

      show: false,
      type: "success",
      message: ""

    });

  };


  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {

    const currentResidentId =
      localStorage.getItem(
        "residentId"
      );


    console.log(
      "CURRENT RESIDENT ID:",
      currentResidentId
    );


    // ========================================
    // NO RESIDENT ID
    // ========================================

    if (!currentResidentId) {

      console.error(
        "No resident ID found. Returning to login."
      );

      setLoading(false);

      setCurrentPage(
        "login"
      );

      return;
    }


    // ========================================
    // FETCH PROFILE
    // ========================================

    const fetchProfile = async () => {

      try {

        const response =
          await fetch(

            `${API_URL}?resident_id=${encodeURIComponent(
              currentResidentId
            )}`

          );


        console.log(
          "Profile HTTP Status:",
          response.status
        );


        // ====================================
        // GET RAW RESPONSE
        // ====================================

        const responseText =
          await response.text();


        console.log(
          "Profile raw response:",
          responseText
        );


        // ====================================
        // PARSE JSON
        // ====================================

        let data;

        try {

          data =
            JSON.parse(
              responseText
            );

        } catch (jsonError) {

          console.error(
            "Profile PHP returned invalid JSON:",
            jsonError
          );

          throw new Error(
            "Invalid response from profile.php"
          );

        }


        console.log(
          "PROFILE API DATA:",
          data
        );


        // ====================================
        // PROFILE FOUND
        // ====================================

        if (
          data.success &&
          data.resident
        ) {

          const resident =
            data.resident;


          console.log(
            "CURRENT RESIDENT FROM DATABASE:",
            resident
          );


          // ==================================
          // SET PROFILE FORM DATA
          // ==================================

          setFormData({

            firstName:
              resident.first_name ||
              "",

            middleName:
              resident.middle_name ||
              "",

            lastName:
              resident.last_name ||
              "",

            sex:
              resident.sex ||
              "",

            birthdate:
              resident.birthdate ||
              "",

            civilStatus:
              resident.civil_status ||
              "",

            address:
              resident.address ||
              "",

            occupation:
              resident.occupation ||
              "",

            contactNumber:
              resident.contact_number ||
              "",

            email:
              resident.email ||
              "",

            seniorCitizen:
              resident.senior_citizen ||
              "No",

            pwd:
              resident.pwd ||
              "No"

          });


          // ==================================
          // SYNCHRONIZE EMAIL
          // ==================================

          localStorage.setItem(

            "userEmail",

            resident.email ||
            ""

          );


          // ==================================
          // CREATE FULL NAME
          // ==================================

          const fullName = [

            resident.first_name,
            resident.middle_name,
            resident.last_name

          ]
            .filter(Boolean)
            .join(" ");


          // ==================================
          // SAVE RESIDENT NAME
          // ==================================

          localStorage.setItem(

            "residentName",

            fullName

          );


          // ==================================
          // DEBUG
          // ==================================

          console.log(
            "CURRENT RESIDENT:",
            resident.id,
            fullName
          );


        } else {

          // ==================================
          // PROFILE NOT FOUND
          // ==================================

          console.error(
            "Profile not found:",
            data.message
          );


          localStorage.removeItem(
            "residentId"
          );


          localStorage.removeItem(
            "residentName"
          );


          localStorage.removeItem(
            "userEmail"
          );


          localStorage.removeItem(
            "loggedIn"
          );


          localStorage.removeItem(
            "isLoggedIn"
          );


          setCurrentPage(
            "login"
          );

        }


      } catch (error) {

        console.error(
          "PROFILE ERROR:",
          error
        );


        showPopup(
          "Unable to load profile information.",
          "error"
        );


      } finally {

        // ==================================
        // STOP LOADING
        // ==================================

        setLoading(false);

      }

    };


    fetchProfile();

  }, [setCurrentPage]);


  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormData(
      (previousData) => ({

        ...previousData,

        [name]: value

      })
    );

  };


  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = () => {

    setShowEditModal(
      true
    );

  };


  // ==========================================
  // CLOSE EDIT MODAL
  // ==========================================

  const closeEditModal = () => {

    setShowEditModal(
      false
    );

  };


  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // ========================================
    // BASIC VALIDATION
    // ========================================

    if (!residentId) {

      showPopup(
        "Resident ID not found. Please login again.",
        "error"
      );

      return;

    }


    if (
      !formData.firstName.trim()
    ) {

      showPopup(
        "Please enter your first name.",
        "error"
      );

      return;

    }


    if (
      !formData.lastName.trim()
    ) {

      showPopup(
        "Please enter your last name.",
        "error"
      );

      return;

    }


    if (
      !formData.email.trim()
    ) {

      showPopup(
        "Please enter your email address.",
        "error"
      );

      return;

    }


    try {

      // ======================================
      // SEND UPDATE REQUEST
      // ======================================

      const response =
        await fetch(

          API_URL,

          {

            method: "PUT",

            headers: {

              "Content-Type":
                "application/json"

            },

            body: JSON.stringify({

              resident_id:
                Number(
                  residentId
                ),

              firstName:
                formData.firstName,

              middleName:
                formData.middleName,

              lastName:
                formData.lastName,

              sex:
                formData.sex,

              birthdate:
                formData.birthdate ||
                null,

              civilStatus:
                formData.civilStatus,

              address:
                formData.address,

              occupation:
                formData.occupation,

              contactNumber:
                formData.contactNumber,

              email:
                formData.email,

              seniorCitizen:
                formData.seniorCitizen,

              pwd:
                formData.pwd

            })

          }

        );


      // ======================================
      // CHECK HTTP STATUS
      // ======================================

      if (!response.ok) {

        throw new Error(
          "PHP API returned an error."
        );

      }


      // ======================================
      // GET RESPONSE
      // ======================================

      const data =
        await response.json();


      console.log(
        "UPDATE PROFILE API:",
        data
      );


      // ======================================
      // UPDATE SUCCESS
      // ======================================

      if (data.success) {

        // ================================
        // UPDATE EMAIL CACHE
        // ================================

        localStorage.setItem(

          "userEmail",

          formData.email

        );


        // ================================
        // UPDATE NAME CACHE
        // ================================

        const updatedName = [

          formData.firstName,
          formData.middleName,
          formData.lastName

        ]
          .filter(Boolean)
          .join(" ");


        localStorage.setItem(

          "residentName",

          updatedName

        );


        // ================================
        // SHOW SUCCESS
        // ================================

        showPopup(
          "Profile updated successfully!",
          "success"
        );


        // ================================
        // CLOSE MODAL
        // ================================

        setShowEditModal(
          false
        );


      } else {

        showPopup(

          data.message ||
          "Failed to update profile.",

          "error"

        );

      }


    } catch (error) {

      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );


      showPopup(

        "Cannot connect to the PHP API. Make sure XAMPP Apache is running.",

        "error"

      );

    }

  };


  // ==========================================
  // BACK TO DASHBOARD
  // ==========================================

  const handleBack = () => {

    setCurrentPage(
      "dashboard"
    );

  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatBirthdate = (
    date
  ) => {

    if (!date) {

      return "Not provided";

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

        day: "numeric"

      }
    );

  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="profile-loading">

        <div className="profile-loading-icon">
          👤
        </div>

        <h2>
          Loading Profile...
        </h2>

        <p>
          Please wait while your profile
          information is being loaded.
        </p>

      </div>

    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="profile-page">


      {/* ======================================
          POPUP ALERT
      ====================================== */}

      {popup.show && (

        <div
          className={`profile-popup-alert ${
            popup.type === "success"
              ? "profile-popup-success"
              : "profile-popup-error"
          }`}
        >

          <div className="profile-popup-icon">

            {popup.type === "success"
              ? "✓"
              : "!"}

          </div>


          <div className="profile-popup-content">

            <strong>

              {popup.type === "success"
                ? "Success"
                : "Error"}

            </strong>

            <p>
              {popup.message}
            </p>

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


      {/* ======================================
          BACKGROUND
      ====================================== */}

      <div className="profile-bg-circle circle-one"></div>

      <div className="profile-bg-circle circle-two"></div>


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="profile-header">

        <div>

          <p className="profile-header-small">
            BARANGAY RESIDENT PORTAL
          </p>


          <div className="profile-title-row">

            <div className="profile-title-icon">
              👤
            </div>


            <div>

              <h1>
                My Profile
              </h1>

              <p>
                View your personal information
                and account details.
              </p>

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


      {/* ======================================
          PROFILE INFORMATION
      ====================================== */}

      <div className="profile-view-card">


        {/* PROFILE HEADER */}

        <div className="profile-view-top">

          <div className="profile-large-avatar">

            {formData.firstName

              ? formData.firstName
                  .charAt(0)
                  .toUpperCase()

              : "R"}

          </div>


          <div className="profile-view-name">

            <h2>

              {[

                formData.firstName,
                formData.middleName,
                formData.lastName

              ]
                .filter(Boolean)
                .join(" ") ||
                "Resident"}

            </h2>

            <p>
              Resident Account
            </p>

          </div>

        </div>


        <div className="profile-view-divider"></div>


        {/* ======================================
            PERSONAL INFORMATION
        ====================================== */}

        <div className="profile-section">

          <div className="profile-section-title">

            <span>
              👤
            </span>

            <h3>
              Personal Information
            </h3>

          </div>


          <div className="profile-info-grid">


            <div className="profile-info-item">

              <span>
                First Name
              </span>

              <strong>

                {formData.firstName ||
                  "Not provided"}

              </strong>

            </div>


            <div className="profile-info-item">

              <span>
                Middle Name
              </span>

              <strong>

                {formData.middleName ||
                  "Not provided"}

              </strong>

            </div>


            <div className="profile-info-item">

              <span>
                Last Name
              </span>

              <strong>

                {formData.lastName ||
                  "Not provided"}

              </strong>

            </div>


            <div className="profile-info-item">

              <span>
                Sex
              </span>

              <strong>

                {formData.sex ||
                  "Not provided"}

              </strong>

            </div>


            <div className="profile-info-item">

              <span>
                Birthdate
              </span>

              <strong>

                {formatBirthdate(
                  formData.birthdate
                )}

              </strong>

            </div>


            <div className="profile-info-item">

              <span>
                Civil Status
              </span>

              <strong>

                {formData.civilStatus ||
                  "Not provided"}

              </strong>

            </div>

          </div>

        </div>


        {/* ======================================
            CONTACT INFORMATION
        ====================================== */}

        <div className="profile-section">

          <div className="profile-section-title">

            <span>
              📞
            </span>

            <h3>
              Contact Information
            </h3>

          </div>


          <div className="profile-info-grid">


            <div className="profile-info-item">

              <span>
                Email Address
              </span>

              <strong>

                {formData.email ||
                  "Not provided"}

              </strong>

            </div>


            <div className="profile-info-item">

              <span>
                Contact Number
              </span>

              <strong>

                {formData.contactNumber ||
                  "Not provided"}

              </strong>

            </div>


            <div className="profile-info-item profile-full-width">

              <span>
                Address
              </span>

              <strong>

                {formData.address ||
                  "Not provided"}

              </strong>

            </div>

          </div>

        </div>


        {/* ======================================
            OTHER INFORMATION
        ====================================== */}

        <div className="profile-section">

          <div className="profile-section-title">

            <span>
              📋
            </span>

            <h3>
              Other Information
            </h3>

          </div>


          <div className="profile-info-grid">


            <div className="profile-info-item">

              <span>
                Occupation
              </span>

              <strong>

                {formData.occupation ||
                  "Not provided"}

              </strong>

            </div>


            <div className="profile-info-item">

              <span>
                Senior Citizen
              </span>

              <strong
                className={
                  formData.seniorCitizen ===
                  "Yes"

                    ? "profile-status yes"

                    : "profile-status no"
                }
              >

                {formData.seniorCitizen}

              </strong>

            </div>


            <div className="profile-info-item">

              <span>
                PWD
              </span>

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


        {/* ======================================
            BOTTOM BUTTON
        ====================================== */}

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


      {/* ======================================
          EDIT PROFILE MODAL
      ====================================== */}

      {showEditModal && (

        <div
          className="profile-modal-overlay"
          onClick={closeEditModal}
        >

          <div
            className="profile-edit-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* ==================================
                MODAL HEADER
            ================================== */}

            <div className="profile-modal-header">

              <div>

                <div className="profile-modal-title">

                  <span>
                    ✏️
                  </span>


                  <div>

                    <h2>
                      Update Profile
                    </h2>

                    <p>
                      Update your personal
                      information below.
                    </p>

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


            {/* ==================================
                EDIT FORM
            ================================== */}

            <form
              onSubmit={handleSubmit}
            >


              {/* =================================
                  PERSONAL INFORMATION
              ================================= */}

              <div className="profile-modal-section">

                <h3>
                  Personal Information
                </h3>


                <div className="profile-modal-grid three-columns">


                  {/* FIRST NAME */}

                  <div className="profile-modal-form-group">

                    <label>
                      First Name
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      value={
                        formData.firstName
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* MIDDLE NAME */}

                  <div className="profile-modal-form-group">

                    <label>
                      Middle Name
                    </label>

                    <input
                      type="text"
                      name="middleName"
                      value={
                        formData.middleName
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* LAST NAME */}

                  <div className="profile-modal-form-group">

                    <label>
                      Last Name
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      value={
                        formData.lastName
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>


                {/* SECOND ROW */}

                <div className="profile-modal-grid three-columns">


                  {/* SEX */}

                  <div className="profile-modal-form-group">

                    <label>
                      Sex
                    </label>

                    <select
                      name="sex"
                      value={
                        formData.sex
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="">
                        Select Sex
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                    </select>

                  </div>


                  {/* BIRTHDATE */}

                  <div className="profile-modal-form-group">

                    <label>
                      Birthdate
                    </label>

                    <input
                      type="date"
                      name="birthdate"
                      value={
                        formData.birthdate
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* CIVIL STATUS */}

                  <div className="profile-modal-form-group">

                    <label>
                      Civil Status
                    </label>

                    <select
                      name="civilStatus"
                      value={
                        formData.civilStatus
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="">
                        Select Civil Status
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

                </div>

              </div>


              {/* =================================
                  CONTACT INFORMATION
              ================================= */}

              <div className="profile-modal-section">

                <h3>
                  Contact Information
                </h3>


                <div className="profile-modal-grid two-columns">


                  {/* CONTACT NUMBER */}

                  <div className="profile-modal-form-group">

                    <label>
                      Contact Number
                    </label>

                    <input
                      type="text"
                      name="contactNumber"
                      value={
                        formData.contactNumber
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* EMAIL */}

                  <div className="profile-modal-form-group">

                    <label>
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>


                {/* ADDRESS */}

                <div className="profile-modal-form-group">

                  <label>
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={
                      formData.address
                    }
                    onChange={
                      handleChange
                    }
                    rows="3"
                  />

                </div>

              </div>


              {/* =================================
                  OTHER INFORMATION
              ================================= */}

              <div className="profile-modal-section">

                <h3>
                  Other Information
                </h3>


                <div className="profile-modal-grid three-columns">


                  {/* OCCUPATION */}

                  <div className="profile-modal-form-group">

                    <label>
                      Occupation
                    </label>

                    <input
                      type="text"
                      name="occupation"
                      value={
                        formData.occupation
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>


                  {/* SENIOR CITIZEN */}

                  <div className="profile-modal-form-group">

                    <label>
                      Senior Citizen
                    </label>

                    <select
                      name="seniorCitizen"
                      value={
                        formData.seniorCitizen
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="No">
                        No
                      </option>

                      <option value="Yes">
                        Yes
                      </option>

                    </select>

                  </div>


                  {/* PWD */}

                  <div className="profile-modal-form-group">

                    <label>
                      PWD
                    </label>

                    <select
                      name="pwd"
                      value={
                        formData.pwd
                      }
                      onChange={
                        handleChange
                      }
                    >

                      <option value="No">
                        No
                      </option>

                      <option value="Yes">
                        Yes
                      </option>

                    </select>

                  </div>

                </div>

              </div>


              {/* =================================
                  MODAL BUTTONS
              ================================= */}

              <div className="profile-modal-actions">


                {/* CANCEL */}

                <button
                  type="button"
                  className="profile-modal-cancel"
                  onClick={
                    closeEditModal
                  }
                >

                  Cancel

                </button>


                {/* SAVE */}

                <button
                  type="submit"
                  className="profile-modal-save"
                >

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