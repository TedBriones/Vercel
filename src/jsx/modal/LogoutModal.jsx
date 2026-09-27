import React from "react";
import "../../App.css";

const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
}) => {

  // Do not render anything when closed
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="logout-modal-overlay"
      onClick={onClose}
    >

      <div
        className="logout-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ICON */}
        <div className="logout-modal-icon">
          🚪
        </div>

        {/* TITLE */}
        <h2>
          Logout Confirmation
        </h2>

        {/* MESSAGE */}
        <p>
          Are you sure you want to logout?
        </p>

        {/* BUTTONS */}
        <div className="logout-modal-actions">

          <button
            type="button"
            className="logout-cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="logout-confirm-button"
            onClick={onConfirm}
          >
            Yes, Logout
          </button>

        </div>

      </div>

    </div>
  );
};

export default LogoutModal;