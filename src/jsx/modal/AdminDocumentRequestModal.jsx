import React from "react";

const AdminDocumentRequestModal = ({
  request,
  isOpen,
  processingId,
  onClose,
  onUpdateStatus,
  getResidentName,
  formatDate,
  getStatusClass,
}) => {
  if (!isOpen || !request) {
    return null;
  }

  const isProcessing = processingId === request.id;
  const isPending =
    request.status?.toLowerCase() === "pending";

  const documentType =
    request.document_type ||
    request.documentType ||
    "N/A";

  const appointmentDate =
    request.appointment_date ||
    request.appointmentDate;

  const appointmentTime =
    request.appointment_time ||
    request.appointmentTime ||
    "N/A";

  const email = request.email || "No email";
  const priority = request.priority || "Regular";

  return (
    <div
      className="validation-modal-overlay"
      onClick={onClose}
    >
      <div
        className="validation-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="validation-modal-icon">
          📄
        </div>

        <h2>Document Request Validation</h2>

        <p className="validation-modal-subtitle">
          Review the request details before approving or rejecting it.
        </p>

        <div className="validation-details">
          <div className="validation-detail-row">
            <span>Request #</span>
            <strong>#{request.id}</strong>
          </div>

          <div className="validation-detail-row">
            <span>Resident</span>
            <strong>{getResidentName(request)}</strong>
          </div>

          <div className="validation-detail-row">
            <span>Email</span>
            <strong>{email}</strong>
          </div>

          <div className="validation-detail-row">
            <span>Document</span>
            <strong>{documentType}</strong>
          </div>

          <div className="validation-detail-row">
            <span>Appointment</span>
            <strong>{formatDate(appointmentDate)}</strong>
          </div>

          <div className="validation-detail-row">
            <span>Time</span>
            <strong>{appointmentTime}</strong>
          </div>

          <div className="validation-detail-row">
            <span>Priority</span>
            <strong>{priority}</strong>
          </div>

          <div className="validation-detail-row">
            <span>Status</span>

            <span
              className={`status-badge ${getStatusClass(
                request.status
              )}`}
            >
              <span className="status-dot"></span>
              {request.status || "Pending"}
            </span>
          </div>
        </div>

        {isPending ? (
          <div className="validation-modal-actions">

            <button
              type="button"
              className="validation-close-button"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>

            <button
              type="button"
              className="validation-reject-button"
              disabled={isProcessing}
              onClick={() =>
                onUpdateStatus(request.id, "Rejected")
              }
            >
              {isProcessing
                ? "Processing..."
                : "✕ Reject"}
            </button>

            <button
              type="button"
              className="validation-approve-button"
              disabled={isProcessing}
              onClick={() =>
                onUpdateStatus(request.id, "Approved")
              }
            >
              {isProcessing
                ? "Processing..."
                : "✓ Approve"}
            </button>

          </div>
        ) : (
          <div className="validation-modal-actions">
            <button
              type="button"
              className="validation-close-button full-width"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentRequestModal;