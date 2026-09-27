
import React, { useEffect, useState } from "react";
import "../App.css";

const Dashboard = ({ setCurrentPage }) => {

  const [pending, setPending] = useState(0);
  const [approved, setApproved] = useState(0);
  const [rejected, setRejected] = useState(0);

  const [residentName, setResidentName] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });


  /*
  |--------------------------------------------------------------------------
  | DASHBOARD STATISTICS API
  |--------------------------------------------------------------------------
  */

  const DASHBOARD_STATS_API =
    "http://localhost/barangay-api/dashboard_stats.php";


  /*
  |--------------------------------------------------------------------------
  | FETCH CURRENT RESIDENT PROFILE + STATISTICS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    const residentId =
      localStorage.getItem("residentId");


    if (!residentId) {

      console.error(
        "No resident ID found."
      );

      setCurrentPage("login");

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | FETCH PROFILE
    |--------------------------------------------------------------------------
    */

    const fetchProfile = async () => {

      try {

        console.log(
          "================================="
        );

        console.log(
          "LOADING DASHBOARD"
        );

        console.log(
          "Current Resident ID:",
          residentId
        );

        console.log(
          "================================="
        );


        const response = await fetch(
          `http://localhost/barangay-api/profile.php?resident_id=${encodeURIComponent(
            residentId
          )}`,
          {
            method: "GET",

            headers: {
              Accept: "application/json"
            }
          }
        );


        const responseText =
          await response.text();


        console.log(
          "Dashboard profile response:",
          responseText
        );


        let data;


        try {

          data = JSON.parse(
            responseText
          );

        } catch (error) {

          console.error(
            "Invalid profile JSON:",
            error
          );

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

            resident.last_name

          ]
            .filter(Boolean)
            .join(" ");


          setResidentName(
            fullName || "Resident"
          );


          console.log(
            "CURRENT DASHBOARD RESIDENT:",
            resident.id
          );

          console.log(
            "CURRENT DASHBOARD NAME:",
            fullName
          );


        } else {

          console.error(
            "Resident profile not found:",
            data.message
          );


          localStorage.removeItem(
            "residentId"
          );


          setCurrentPage("login");
        }


      } catch (error) {

        console.error(
          "Dashboard profile error:",
          error
        );

      }

    };


    /*
    |--------------------------------------------------------------------------
    | FETCH DOCUMENT REQUEST STATISTICS
    |--------------------------------------------------------------------------
    */

    const fetchDashboardStats = async () => {

      try {

        console.log(
          "================================="
        );

        console.log(
          "FETCHING DASHBOARD STATISTICS"
        );

        console.log(
          "Resident ID:",
          residentId
        );

        console.log(
          "================================="
        );


        const url =
          `${DASHBOARD_STATS_API}?resident_id=${encodeURIComponent(
            residentId
          )}`;


        console.log(
          "Dashboard statistics URL:",
          url
        );


        const response = await fetch(
          url,
          {
            method: "GET",

            headers: {
              Accept: "application/json"
            }
          }
        );


        console.log(
          "Dashboard stats HTTP status:",
          response.status
        );


        const responseText =
          await response.text();


        console.log(
          "Dashboard stats raw response:",
          responseText
        );


        let data;


        try {

          data = JSON.parse(
            responseText
          );

        } catch (error) {

          console.error(
            "Invalid dashboard statistics JSON:",
            error
          );

          throw new Error(
            "Dashboard statistics API returned invalid JSON."
          );
        }


        console.log(
          "DASHBOARD STATISTICS:",
          data
        );


        /*
        |--------------------------------------------------------------------------
        | VERIFY RESIDENT ID
        |--------------------------------------------------------------------------
        |
        | This prevents accidentally displaying statistics
        | belonging to another resident.
        |
        */

        if (
          Number(data.resident_id) !==
          Number(residentId)
        ) {

          console.error(
            "RESIDENT ID MISMATCH!"
          );

          console.error(
            "Frontend resident ID:",
            residentId
          );

          console.error(
            "Backend resident ID:",
            data.resident_id
          );


          setPending(0);
          setApproved(0);
          setRejected(0);

          return;
        }


        if (
          response.ok &&
          data.success
        ) {

          setPending(
            Number(data.pending || 0)
          );


          setApproved(
            Number(data.approved || 0)
          );


          setRejected(
            Number(data.rejected || 0)
          );


          console.log(
            "Pending:",
            data.pending
          );


          console.log(
            "Approved:",
            data.approved
          );


          console.log(
            "Rejected:",
            data.rejected
          );


        } else {

          console.error(
            "Dashboard statistics API:",
            data.message
          );


          setPending(0);
          setApproved(0);
          setRejected(0);
        }


      } catch (error) {

        console.error(
          "Dashboard statistics error:",
          error
        );


        setPending(0);
        setApproved(0);
        setRejected(0);

      }

    };


    /*
    |--------------------------------------------------------------------------
    | LOAD DASHBOARD
    |--------------------------------------------------------------------------
    */

    fetchProfile();

    fetchDashboardStats();


  }, [setCurrentPage]);


  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {

    localStorage.removeItem(
      "residentId"
    );

    localStorage.removeItem(
      "userEmail"
    );

    localStorage.removeItem(
      "userRole"
    );

    localStorage.removeItem(
      "loggedIn"
    );

    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "residentName"
    );


    setCurrentPage("login");

  };


  return (

    <div>

      {/* ==================================================
          ANIMATED BACKGROUND
      ================================================== */}

      <div className="background-shape shape-one"></div>
      <div className="background-shape shape-two"></div>
      <div className="background-shape shape-three"></div>


      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="sidebar">

        <div className="logo-wrapper">

          <div className="logo-glow"></div>

          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="barangay-logo"
          />

        </div>


        <div className="sidebar-divider"></div>


        <nav className="sidebar-menu">


          {/* DASHBOARD */}

          <a
            href="#"
            className="menu-item active"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("dashboard");

            }}
          >

            <span className="menu-icon">
              🏠
            </span>

            <span>
              Dashboard
            </span>

          </a>


          {/* PROFILE */}

          <a
            href="#"
            className="menu-item"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("profile");

            }}
          >

            <span className="menu-icon">
              👥
            </span>

            <span>
              Profile
            </span>

          </a>


          {/* DOCUMENT REQUESTS */}

          <a
            href="#"
            className="menu-item"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("documents");

            }}
          >

            <span className="menu-icon">
              📄
            </span>

            <span>
              Document Requests
            </span>

          </a>

                    <a
            href="#"
            className="menu-item"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("report");

            }}
          >

            <span className="menu-icon">
              📄
            </span>

            <span>
              Accident Report
            </span>

          </a>


          {/* APPOINTMENTS */}

          <a
            href="#"
            className="menu-item"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("appointments");

            }}
          >

            <span className="menu-icon">
              🗓️
            </span>

            <span>
              Appointments
            </span>

          </a>


          {/* LOGOUT */}

          <a
            href="#"
            className="menu-item logout"
            onClick={(e) => {

              e.preventDefault();

              setShowLogoutModal(true);

            }}
          >

            <span className="menu-icon">
              🚪
            </span>

            <span>
              Logout
            </span>

          </a>

        </nav>


        <a
          href="#"
          className="about-us"
          onClick={(e) => {

            e.preventDefault();

            setCurrentPage("about");

          }}
        >

          <span>
            ℹ️
          </span>

          About Us

        </a>

      </aside>


      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="main-content">


        {/* ==================================================
            WELCOME
        ================================================== */}

        <div className="welcome-section">

          <div>

            <p className="welcome-small">
              BARANGAY RESIDENT PORTAL
            </p>


            <h1 className="welcome-title">

              Welcome,{" "}

              <span>
                {residentName || "Resident"}
              </span>


              <span className="wave">
                👋
              </span>

            </h1>


            <p className="welcome-description">
              Here's what's happening in your barangay today.
            </p>

          </div>


          <div className="date-card">

            <span className="calendar-icon">
              📅
            </span>


            <div>

              <small>
                Today
              </small>


              <strong>
                {currentDate}
              </strong>

            </div>

          </div>

        </div>


        {/* ==================================================
            DOCUMENT REQUEST STATUS
        ================================================== */}

        <div className="statistics-container">


          {/* PENDING */}

          <div className="stat-card pending-card">

            <div className="stat-top">

              <div>

                <p className="stat-label">
                  PENDING
                </p>


                <h2>
                  {pending}
                </h2>

              </div>


              <div className="stat-icon">
                ⏳
              </div>

            </div>


            <div className="stat-bottom">

              <span className="stat-status">
                ● Waiting
              </span>


              <span>
                For processing
              </span>

            </div>

          </div>


          {/* APPROVED */}

          <div className="stat-card approved-card">

            <div className="stat-top">

              <div>

                <p className="stat-label">
                  APPROVED
                </p>


                <h2>
                  {approved}
                </h2>

              </div>


              <div className="stat-icon">
                ✓
              </div>

            </div>


            <div className="stat-bottom">

              <span className="stat-status">
                ✓ Completed
              </span>


              <span>
                Approved requests
              </span>

            </div>

          </div>


          {/* REJECTED */}

          <div className="stat-card rejected-card">

            <div className="stat-top">

              <div>

                <p className="stat-label">
                  REJECTED
                </p>


                <h2>
                  {rejected}
                </h2>

              </div>


              <div className="stat-icon">
                ✕
              </div>

            </div>


            <div className="stat-bottom">

              <span className="stat-status">
                ✕ Rejected
              </span>


              <span>
                Rejected requests
              </span>

            </div>

          </div>

        </div>


        {/* ==================================================
            CURRENT EVENTS & ANNOUNCEMENTS
        ================================================== */}

        <section className="events-section">

          <div className="events-header">

            <div className="announcement-circle">
              📢
            </div>


            <div>

              <h2>
                Current Events & Announcements
              </h2>


              <p>
                Stay updated with the latest barangay activities
              </p>

            </div>

          </div>


          <div className="events-grid">


            {/* EVENT 1 */}

            <div className="event-card upcoming">

              <div className="event-card-top">

                <span className="event-badge blue">
                  Upcoming Event
                </span>


                <span className="event-arrow">
                  →
                </span>

              </div>


              <h3>
                🧹 Community Clean-Up Drive
              </h3>


              <p className="event-date">
                📅 <strong>July 30, 2026</strong>
              </p>


              <p>
                All residents are encouraged to participate
                in the monthly clean-up drive to help keep
                our barangay clean and environmentally friendly.
              </p>


              <div className="event-footer">

                <span>
                  Community Activity
                </span>


                <span>
                  →
                </span>

              </div>

            </div>


            {/* EVENT 2 */}

            <div className="event-card announcement">

              <div className="event-card-top">

                <span className="event-badge green">
                  Announcement
                </span>


                <span className="event-arrow">
                  →
                </span>

              </div>


              <h3>
                📄 Document Processing Schedule
              </h3>


              <p className="event-date">
                🕐 <strong>Monday - Friday</strong>
              </p>


              <p>
                Barangay document requests are processed
                from <strong>8:00 AM to 5:00 PM.</strong>
                Residents are encouraged to book
                appointments online.
              </p>


              <div className="event-footer">

                <span>
                  Important Notice
                </span>


                <span>
                  →
                </span>

              </div>

            </div>


            {/* EVENT 3 */}

            <div className="event-card advisory">

              <div className="event-card-top">

                <span className="event-badge yellow">
                  Advisory
                </span>


                <span className="event-arrow">
                  →
                </span>

              </div>


              <h3>
                🩺 Free Medical Check-up
              </h3>


              <p className="event-date">
                📅 <strong>August 5, 2026</strong>
              </p>


              <p>
                Free medical consultation and blood pressure
                monitoring will be available for all residents
                at the Barangay Health Center.
              </p>


              <div className="event-footer">

                <span>
                  Health Program
                </span>


                <span>
                  →
                </span>

              </div>

            </div>


            {/* EVENT 4 */}

            <div className="event-card reminder">

              <div className="event-card-top">

                <span className="event-badge cyan">
                  Reminder
                </span>


                <span className="event-arrow">
                  →
                </span>

              </div>


              <h3>
                🗓️ Barangay Assembly
              </h3>


              <p className="event-date">
                📅 <strong>August 15, 2026</strong>
              </p>


              <p>
                All residents are invited to attend the
                Barangay Assembly to discuss upcoming
                community programs, projects, and concerns.
              </p>


              <div className="event-footer">

                <span>
                  Barangay Meeting
                </span>


                <span>
                  →
                </span>

              </div>

            </div>

          </div>

        </section>

      </main>


      {/* ==================================================
          LOGOUT MODAL
      ================================================== */}

      {showLogoutModal && (

        <div
          className="logout-modal-overlay"
          onClick={() =>
            setShowLogoutModal(false)
          }
        >

          <div
            className="logout-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="logout-modal-icon">
              🚪
            </div>


            <h2>
              Logout Confirmation
            </h2>


            <p>
              Are you sure you want to logout?
            </p>


            <div className="logout-modal-actions">

              <button
                type="button"
                className="logout-cancel-button"
                onClick={() =>
                  setShowLogoutModal(false)
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="logout-confirm-button"
                onClick={handleLogout}
              >
                Yes, Logout
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
};

export default Dashboard;