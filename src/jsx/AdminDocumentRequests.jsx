import React, { useEffect, useState } from "react";
import "../App.css";
import AdminDocumentRequestModal from "./modal/AdminDocumentRequestModal";

const API_URL =
  "http://localhost/barangay-api/admin_document_requests.php";

const AdminDocumentRequests = ({ setCurrentPage }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("PHP API returned an error.");
      }

      const data = await response.json();

      if (data.success) {
        setRequests(data.requests || []);
      } else {
        alert(data.message || "Failed to load document requests.");
      }
    } catch (error) {
      console.error("Fetch document requests error:", error);
      alert(
        "Cannot connect to the PHP API. Make sure XAMPP Apache is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openValidationModal = (request) => {
    setSelectedRequest(request);
    setShowValidationModal(true);
  };

  const closeValidationModal = () => {
    if (processingId !== null) return;

    setShowValidationModal(false);
    setSelectedRequest(null);
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    if (!requestId) {
      alert("Invalid document request ID.");
      return;
    }

    if (!["Approved", "Rejected"].includes(newStatus)) {
      alert("Invalid request status.");
      return;
    }

    setProcessingId(requestId);

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: requestId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("PHP API returned an error.");
      }

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Failed to update document request.");
        return;
      }

      setRequests((previousRequests) =>
        previousRequests.map((request) =>
          Number(request.id) === Number(requestId)
            ? { ...request, status: newStatus }
            : request
        )
      );

      setShowValidationModal(false);
      setSelectedRequest(null);

      alert(
        `Document request ${newStatus.toLowerCase()} successfully.`
      );

      await fetchRequests(true);
    } catch (error) {
      console.error("Update request error:", error);
      alert(
        "Cannot connect to the PHP API. Make sure XAMPP Apache is running."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("residentId");

    setShowLogoutModal(false);
    setCurrentPage("login");
  };

  const handleBack = () => {
    setCurrentPage("admin-dashboard");
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

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

  const getResidentName = (request) => {
    if (!request) return "Unknown Resident";

    const name = [
      request.first_name,
      request.middle_name,
      request.last_name,
    ]
      .filter((value) => value && value.trim())
      .join(" ");

    return name || request.residentName || "Unknown Resident";
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  const pendingRequests = requests.filter(
    (request) => request.status?.toLowerCase() === "pending"
  );

  const processedRequests = requests.filter(
    (request) => request.status?.toLowerCase() !== "pending"
  );

  const approvedCount = requests.filter(
    (request) => request.status?.toLowerCase() === "approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status?.toLowerCase() === "rejected"
  ).length;

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="admin-dashboard-page">
      <div className="background-shape shape-one"></div>
      <div className="background-shape shape-two"></div>
      <div className="background-shape shape-three"></div>

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

        <div className="admin-portal-label">
          ADMIN PORTAL
        </div>

        <nav className="sidebar-menu">
          <a
            href="#"
            className="menu-item"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("admin-dashboard");
            }}
          >
            <span className="menu-icon">🏠</span>
            <span>Dashboard</span>
          </a>

          <a
            href="#"
            className="menu-item active"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage("admin-documents");
            }}
          >
            <span className="menu-icon">📄</span>
            <span>Document Requests</span>
          </a>

          <a
            href="#"
            className="menu-item"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("admin-residents");

            }}
          >

            <span className="menu-icon">
              👥
            </span>

            <span>
              Residents
            </span>

          </a>


          <a
            href="#"
            className="menu-item"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("admin-appointments");

            }}
          >

            <span className="menu-icon">
              🗓️
            </span>

            <span>
              Appointments
            </span>

          </a>

                    <a
            href="#"
            className="menu-item"
            onClick={(e) => {

              e.preventDefault();

              setCurrentPage("admin-incidents");

            }}
          >

            <span className="menu-icon">
              🗓️
            </span>

            <span>
              Incident Report
            </span>

          </a>

          <a
            href="#"
            className="menu-item logout"
            onClick={(e) => {
              e.preventDefault();
              setShowLogoutModal(true);
            }}
          >
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </a>
        </nav>

        <div className="about-us">
          <span>ℹ️</span>
          About Us
        </div>
      </aside>

      <main className="main-content">
        <div className="welcome-section">
          <div>
            <p className="welcome-small">
              BARANGAY ADMIN PORTAL
            </p>

            <h1 className="welcome-title">
              Document Requests <span className="wave">📄</span>
            </h1>

            <p className="welcome-description">
              Review, validate, approve, or reject resident document requests.
            </p>
          </div>

          <div className="date-card">
            <span className="calendar-icon">📅</span>

            <div>
              <small>Today</small>
              <strong>{currentDate}</strong>
            </div>
          </div>
        </div>

<div className="statistics-container">

  {/* TOTAL REQUESTS ONLY */}

  <div className="stat-card total-card">

    <div className="stat-top">

      <div>

        <p className="stat-label">
          TOTAL REQUESTS
        </p>

        <h2>
          {requests.length}
        </h2>

      </div>

      <div className="stat-icon">
        📋
      </div>

    </div>

    <div className="stat-bottom">

      <span className="stat-status">
        ↑ Active
      </span>

      <span>
        All document requests
      </span>

    </div>

  </div>

</div>
        <section className="events-section">
          <div className="events-header">
            <div className="announcement-circle">📄</div>

            <div>
              <h2>Pending Document Requests</h2>
              <p>
                Validate resident requests before approving or rejecting them.
              </p>
            </div>
          </div>

          <div className="document-actions">
            <button
              type="button"
              className="back-dashboard-button"
              onClick={handleBack}
            >
              ← Dashboard
            </button>

            <button
              type="button"
              className="admin-refresh-button"
              onClick={() => fetchRequests(true)}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>

          {loading && (
            <div className="document-empty-state">
              <h3>Loading document requests...</h3>
              <p>Please wait while requests are retrieved.</p>
            </div>
          )}

          {!loading && pendingRequests.length === 0 && (
            <div className="document-empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Pending Requests</h3>
              <p>There are currently no pending document requests.</p>
            </div>
          )}

{!loading && pendingRequests.length > 0 && (
  <div className="document-table-container">

    <div className="document-table-toolbar">
      <div>
        <h3>Request List</h3>
        <p>
          {pendingRequests.length} pending request
          {pendingRequests.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="document-table-actions">
        <button
          type="button"
          className="admin-refresh-button"
          onClick={() => fetchRequests(true)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>
    </div>

    <div className="document-table-wrapper">
      <table className="document-request-table">

        <thead>
          <tr>
            <th>Request #</th>
            <th>Resident</th>
            <th>Document</th>
            <th>Appointment</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {pendingRequests.map((request) => (
            <tr key={request.id}>

              {/* REQUEST NUMBER */}
              <td className="request-number-cell">
                <span className="request-number">
                  #{request.id}
                </span>
              </td>

              {/* RESIDENT */}
              <td className="resident-cell">
                <div className="resident-info">

                  <div className="resident-avatar">
                    {getResidentName(request)
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="resident-details">
                    <strong>
                      {getResidentName(request)}
                    </strong>

                    <span>
                      {request.email || "No email"}
                    </span>
                  </div>

                </div>
              </td>

              {/* DOCUMENT */}
              <td className="document-cell">

                <div className="document-info">

                  <div className="document-icon">
                    📄
                  </div>

                  <div>
                    <strong>
                      {request.document_type ||
                        request.documentType ||
                        "N/A"}
                    </strong>

                    <span>
                      Document Request
                    </span>
                  </div>

                </div>

              </td>

              {/* APPOINTMENT */}
              <td className="appointment-cell">

                <div className="appointment-info">

                  <strong>
                    {formatDate(
                      request.appointment_date ||
                        request.appointmentDate
                    )}
                  </strong>

                  <span>
                    🕐{" "}
                    {request.appointment_time ||
                      request.appointmentTime ||
                      "N/A"}
                  </span>

                </div>

              </td>

              {/* PRIORITY */}
              <td className="priority-cell">

                <span
                  className={`priority-badge ${
                    request.priority?.toLowerCase() ===
                    "senior citizen"
                      ? "priority-senior"
                      : ""
                  }`}
                >
                  {request.priority || "Regular"}
                </span>

              </td>

              {/* STATUS */}
              <td className="status-cell">

                <span
                  className={`status-badge ${getStatusClass(
                    request.status
                  )}`}
                >
                  <span className="status-dot"></span>
                  {request.status || "Pending"}
                </span>

              </td>

              {/* ACTION */}
              <td className="action-cell">

                <button
                  type="button"
                  className="document-validate-button"
                  onClick={() =>
                    openValidationModal(request)
                  }
                >
                  <span>🔍</span>
                  Validate
                </button>

              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>

  </div>
)}</section>

        {processedRequests.length > 0 && (
          <section className="events-section processed-section">
            <div className="events-header">
              <div className="announcement-circle">✓</div>

              <div>
                <h2>Processed Requests</h2>
                <p>
                  Previously approved or rejected document requests.
                </p>
              </div>
            </div>

            <div className="document-table-wrapper">
              <table className="document-request-table">
                <thead>
                  <tr>
                    <th>Request #</th>
                    <th>Resident</th>
                    <th>Document</th>
                    <th>Appointment</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {processedRequests.map((request) => (
                    <tr key={request.id}>
                      <td>#{request.id}</td>

                      <td>
                        <strong>
                          {getResidentName(request)}
                        </strong>

                        <small>
                          {request.email || "No email"}
                        </small>
                      </td>

                      <td>
                        {request.document_type ||
                          request.documentType ||
                          "N/A"}
                      </td>

                      <td>
                        {formatDate(
                          request.appointment_date ||
                            request.appointmentDate
                        )}

                        <small>
                          {request.appointment_time ||
                            request.appointmentTime ||
                            "N/A"}
                        </small>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <AdminDocumentRequestModal
        request={selectedRequest}
        isOpen={showValidationModal}
        processingId={processingId}
        onClose={closeValidationModal}
        onUpdateStatus={updateRequestStatus}
        getResidentName={getResidentName}
        formatDate={formatDate}
        getStatusClass={getStatusClass}
      />

{showLogoutModal && (
  <div className="logout-modal-overlay">

    <div className="logout-modal">

      <div className="logout-modal-icon">
        🚪
      </div>

      <h2>Logout Confirmation</h2>

      <p>
        Are you sure you want to logout?
      </p>

      <div className="logout-modal-actions">

        <button
          type="button"
          className="logout-cancel-button"
          onClick={() => setShowLogoutModal(false)}
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

export default AdminDocumentRequests;