import React, { useEffect, useState } from "react";
import "./App.css";

// ================================
// RESIDENT
// ================================
import Login from "./jsx/Login";
import Dashboard from "./jsx/Dashboard";
import Profile from "./jsx/Profile";
import DocumentRequest from "./jsx/DocumentRequest";
import Appointments from "./jsx/Appointments";
import Register from "./jsx/Register";
import AboutUs from "./jsx/AboutUs";
import Report from "./jsx/Report"

// ================================
// ADMIN
// ================================
import AdminLogin from "./jsx/CreateAdmin";
import AdminDashboard from "./jsx/AdminDashboard";
import AdminDocumentRequests from "./jsx/AdminDocumentRequests";
import AdminResidents from "./jsx/AdminResidents";
import AdminAppointments from "./jsx/AdminAppointments";
import AdminAboutUs from "./jsx/AdminAboutUs";
import AppointmentHistory from "./jsx/modal/AppointmentHistory";
import PredictiveAnalyticsModal from "./jsx/modal/PredictiveAnalyticsModal";
import AdminIncidentReports from "./jsx/AdminIncidentReports";

// ================================
// STAFF
// ================================
import StaffDashboard from "./jsx/StaffDashboard";
import StaffDocumentRequest from "./jsx/StaffDocumentRequest";
import StaffResidents from "./jsx/StaffResidents";
import StaffAppointments from "./jsx/StaffAppointments";
import PredictiveAnalytics from "./jsx/PredictiveAnalytics";


function App() {

  // =====================================================
  // DETERMINE INITIAL PAGE
  // =====================================================

  const [currentPage, setCurrentPage] = useState(() => {

    const savedPage = localStorage.getItem("currentPage");

    const loggedIn =
      localStorage.getItem("loggedIn") === "true";

    const isLoggedIn =
      localStorage.getItem("isLoggedIn") === "true";

    const userRole =
      localStorage.getItem("userRole");

    const residentId =
      localStorage.getItem("residentId");

    const authenticated =
      loggedIn || isLoggedIn;


    // ===================================================
    // STAFF
    // ===================================================

    if (
      authenticated &&
      userRole === "staff"
    ) {
      return "staff-dashboard";
    }


    // ===================================================
    // ADMIN
    // ===================================================

    if (
      authenticated &&
      userRole === "admin"
    ) {
      return "admin-dashboard";
    }


    // ===================================================
    // RESIDENT
    // ===================================================

    if (
      authenticated &&
      userRole === "resident" &&
      residentId
    ) {
      return "dashboard";
    }


    // ===================================================
    // SAVED PAGE
    // ===================================================

    if (savedPage) {
      return savedPage;
    }


    // ===================================================
    // DEFAULT
    // ===================================================

    return "login";
  });


  // =====================================================
  // SAVE CURRENT PAGE
  // =====================================================

  useEffect(() => {

    localStorage.setItem(
      "currentPage",
      currentPage
    );

  }, [currentPage]);


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>

      {/* =================================================
          RESIDENT
      ================================================= */}

      {currentPage === "login" && (
        <Login
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "dashboard" && (
        <Dashboard
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "profile" && (
        <Profile
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "documents" && (
        <DocumentRequest
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "appointments" && (
        <Appointments
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "register" && (
        <Register
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "about" && (
        <AboutUs
          setCurrentPage={setCurrentPage}
        />
      )}
      {currentPage === "report" && (
        <Report
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* =================================================
          ADMIN
      ================================================= */}

      {currentPage === "admin-login" && (
        <AdminLogin
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "admin-dashboard" && (
        <AdminDashboard
          setCurrentPage={setCurrentPage}
        />
      )}

        {currentPage === "AdminIncedentReports" && (
        <AdminIncidentReports
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "admin-documents" && (
        <AdminDocumentRequests
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "appointmentHistory" && (
        <AppointmentHistory
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "admin-residents" && (
        <AdminResidents
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "admin-appointments" && (
        <AdminAppointments
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "admin-about-us" && (
        <AdminAboutUs
          setCurrentPage={setCurrentPage}
        />
      )}
      {currentPage === "admin-incidents" && (
        <AdminIncidentReports 
          setCurrentPage={setCurrentPage} />
      )}


      {/* =================================================
          STAFF
      ================================================= */}

      {currentPage === "staff-dashboard" && (
        <StaffDashboard
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "staff-documents" && (
        <StaffDocumentRequest
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "staff-residents" && (
        <StaffResidents
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === "staff-appointments" && (
        <StaffAppointments
          setCurrentPage={setCurrentPage}
        />
      )}
      {currentPage === "staff-predictive-analytics" && (
        <PredictiveAnalytics
          setCurrentPage={setCurrentPage}
        />
      )}

      


    </>
  );
}

export default App;