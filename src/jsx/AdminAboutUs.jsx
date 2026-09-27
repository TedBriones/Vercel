import React from "react";
import "../App.css";

const AdminAboutUs = ({ setCurrentPage }) => {

  const officials = [
    {
      name: "Juan Dela Cruz",
      position: "Punong Barangay",
      icon: "👨‍💼",
    },
    {
      name: "Maria Santos",
      position: "Barangay Kagawad",
      icon: "👩‍💼",
    },
    {
      name: "Pedro Reyes",
      position: "Barangay Kagawad",
      icon: "👨‍💼",
    },
    {
      name: "Ana Garcia",
      position: "Barangay Kagawad",
      icon: "👩‍💼",
    },
    {
      name: "Jose Mendoza",
      position: "Barangay Kagawad",
      icon: "👨‍💼",
    },
    {
      name: "Rosa Fernandez",
      position: "Barangay Secretary",
      icon: "👩‍💼",
    },
    {
      name: "Carlos Bautista",
      position: "Barangay Treasurer",
      icon: "👨‍💼",
    },
  ];

  const services = [
    {
      icon: "📄",
      title: "Document Requests",
      description:
        "Submit requests for barangay documents conveniently through the online resident portal.",
    },
    {
      icon: "🗓️",
      title: "Online Appointments",
      description:
        "Schedule appointments based on available dates and times without having to wait in line.",
    },
    {
      icon: "📊",
      title: "Request Monitoring",
      description:
        "Monitor the status of your document requests and appointments in real time.",
    },
    {
      icon: "👤",
      title: "Resident Profile",
      description:
        "Manage and view your personal information securely through your resident account.",
    },
  ];

  const handleBack = () => {
    setCurrentPage("dashboard");
  };

  return (
    <div className="about-page">

      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="about-bg-circle about-circle-one"></div>
      <div className="about-bg-circle about-circle-two"></div>
      <div className="about-bg-circle about-circle-three"></div>


      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <div className="about-header">

        <div className="about-header-left">

          <div className="about-header-icon">
            🏛️
          </div>

          <div>
            <span className="about-small-label">
              BARANGAY RESIDENT PORTAL
            </span>

            <h1>
              About Us
            </h1>

            <p>
              Learn more about our barangay, leadership, and services.
            </p>
          </div>

        </div>


        <button
          type="button"
          className="about-back-button"
          onClick={handleBack}
        >
          ← Back to Dashboard
        </button>

      </div>


      {/* ==========================================
          WELCOME SECTION
      ========================================== */}

      <section className="about-welcome-card">

        <div className="about-logo-wrapper">

          <div className="about-logo-glow"></div>

          <img
            src="/logo.jpg"
            alt="Barangay Logo"
            className="about-barangay-logo"
          />

        </div>


        <div className="about-welcome-content">

          <span className="about-section-label">
            WELCOME TO OUR BARANGAY
          </span>

          <h2>
            Serving Our Community{" "}
            <span>
              With Integrity and Care
            </span>
          </h2>

          <p>
            The Barangay Resident Portal is designed to provide
            residents with convenient and accessible digital
            barangay services.
          </p>

          <p>
            Through this platform, residents can submit document
            requests, schedule appointments, monitor request
            statuses, and manage their personal information online.
          </p>

          <p>
            Our goal is to make barangay services more efficient,
            transparent, organized, and accessible while maintaining
            the security and privacy of resident information.
          </p>

        </div>

      </section>


      {/* ==========================================
          MISSION & VISION
      ========================================== */}

      <section className="about-mission-grid">

        <div className="about-info-card">

          <div className="about-info-icon mission-icon">
            🎯
          </div>

          <div>

            <span className="about-section-label">
              OUR MISSION
            </span>

            <h3>
              Efficient Public Service
            </h3>

            <p>
              To provide reliable, accessible, and efficient
              barangay services through modern technology while
              ensuring that every resident receives responsive
              and respectful service.
            </p>

          </div>

        </div>


        <div className="about-info-card">

          <div className="about-info-icon vision-icon">
            👁️
          </div>

          <div>

            <span className="about-section-label">
              OUR VISION
            </span>

            <h3>
              A Connected Community
            </h3>

            <p>
              To build a digitally connected barangay where
              residents can easily access public services and
              information through a secure, transparent, and
              user-friendly platform.
            </p>

          </div>

        </div>

      </section>


      {/* ==========================================
          SERVICES
      ========================================== */}

      <section className="about-services-section">

        <div className="about-section-heading">

          <span className="about-section-label">
            WHAT WE OFFER
          </span>

          <h2>
            Barangay Services
          </h2>

          <p>
            The portal provides residents with convenient access
            to essential barangay services.
          </p>

        </div>


        <div className="about-services-grid">

          {services.map((service, index) => (

            <div
              className="about-service-card"
              key={index}
            >

              <div className="about-service-icon">
                {service.icon}
              </div>

              <div>

                <h3>
                  {service.title}
                </h3>

                <p>
                  {service.description}
                </p>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* ==========================================
          BARANGAY OFFICIALS
      ========================================== */}

      <section className="about-officials-section">

        <div className="about-section-heading officials-heading">

          <span className="about-section-label">
            OUR LEADERSHIP
          </span>

          <h2>
            Barangay Officials
          </h2>

          <p>
            Meet the barangay officials who serve and support
            our community.
          </p>

        </div>


        <div className="officials-grid">

          {officials.map((official, index) => (

            <div
              className={`official-card ${
                index === 0 ? "official-card-captain" : ""
              }`}
              key={index}
            >

              <div className="official-avatar">
                {official.icon}
              </div>

              <div className="official-details">

                <h3>
                  {official.name}
                </h3>

                <span>
                  {official.position}
                </span>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* ==========================================
          COMMUNITY MESSAGE
      ========================================== */}

      <section className="about-community-card">

        <div className="about-community-icon">
          🤝
        </div>

        <div>

          <span className="about-section-label">
            OUR COMMITMENT
          </span>

          <h2>
            Building a Better Community Together
          </h2>

          <p>
            We are committed to providing residents with
            dependable public services and creating a community
            where technology helps make government services
            easier, faster, and more accessible.
          </p>

        </div>

      </section>


      {/* ==========================================
          FOOTER
      ========================================== */}

      <div className="about-footer">

        <img
          src="/logo.jpg"
          alt="Barangay Logo"
          className="about-footer-logo"
        />

        <div>

          <strong>
            Barangay Resident Portal
          </strong>

          <p>
            Serving the community with integrity, transparency,
            and care.
          </p>

        </div>

      </div>

    </div>
  );
};

export default AdminAboutUs;