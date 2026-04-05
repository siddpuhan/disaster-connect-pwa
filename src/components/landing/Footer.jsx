import React from 'react';

const Footer = () => {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-brand">
        <div className="lp-footer-title">Disaster Connect</div>
        <div className="lp-footer-tag">Resilience through connection</div>
      </div>
      
      <div className="lp-footer-links">
        <a href="#privacy">PRIVACY POLICY</a>
        <a href="#terms">TERMS OF SERVICE</a>
        <a href="#contact">CONTACT</a>
        <span className="lp-footer-status">[SYSTEM STATUS: ACTIVE]</span>
      </div>
      
      <div className="lp-footer-copy">
        © 2026 DISASTER CONNECT.<br/>ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
};

export default Footer;
