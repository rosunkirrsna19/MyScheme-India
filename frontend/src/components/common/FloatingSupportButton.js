import React, { useState } from 'react';
import './FloatingSupportButton.css';

// --- Helper icons (using simple text) ---
const SupportIcon = () => <>?</>; // You can replace this with an image or icon library
const CloseIcon = () => <>×</>;
const PhoneIcon = () => <>📞</>;
const EmailIcon = () => <>✉️</>;
// --- End Helper icons ---

const FloatingSupportButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Your contact details
  const phoneNumber = '+919787330123';
  const emailAddress = 'rosunkirrsna19@gmail.com';

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fab-container">
      {isOpen && (
        <div className="fab-menu">
          <a
            href={`tel:${phoneNumber}`}
            className="fab-option phone"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="fab-tooltip">Call Us</span>
            <PhoneIcon />
          </a>
          <a
            href={`mailto:${emailAddress}`}
            className="fab-option email"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="fab-tooltip">Email Us</span>
            <EmailIcon />
          </a>
        </div>
      )}
      <button onClick={toggleMenu} className="fab-main-button">
        {isOpen ? <CloseIcon /> : <SupportIcon />}
      </button>
    </div>
  );
};

export default FloatingSupportButton;