import React from 'react';
import './LandingPage.css';
import { useOnlineStatus } from './hooks/useOnlineStatus';

const LandingPage = ({ onEnterChat, onEnterResources }) => {
  const isOnline = useOnlineStatus();

  return (
    <div className="landing-wrapper">
      {/* Background patterns */}
      <div className="bg-pattern"></div>
      
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-mesh-anim">
           <svg viewBox="0 0 100 100" className="signal-ripple">
             <circle cx="50" cy="50" r="10" className="ripple-1" />
             <circle cx="50" cy="50" r="25" className="ripple-2" />
             <circle cx="50" cy="50" r="40" className="ripple-3" />
             <circle cx="50" cy="50" r="3" className="center-dot" />
           </svg>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Stay Connected When Networks Go Down</h1>
          <p className="hero-subtitle">Peer-to-peer emergency communication that works without internet, cell towers, or infrastructure</p>
          
          <div className="hero-actions">
            <button className="btn-primary pulse" onClick={onEnterChat}>Request Help</button>
            <button className="btn-secondary" onClick={onEnterResources}>Offer Help</button>
          </div>
          
          <div className={`status-pill ${isOnline ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            {isOnline ? 'Online — Syncing enabled' : 'Offline — P2P mode active'}
          </div>
        </div>
      </header>

      {/* How it Works Section */}
      <section className="how-it-works">
        <div className="cards-container">
          {/* Card 1 */}
          <div className="feature-card">
            <div className="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
                <circle cx="12" cy="12" r="2" />
                <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
                <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
                <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="2" />
              </svg>
            </div>
            <h3>No Internet Needed</h3>
            <p>Direct device-to-device messaging using WebRTC. Works on local WiFi, hotspots, or mesh networks.</p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
            <h3>Everything Saved Locally</h3>
            <p>All messages and resources stored on your device using IndexedDB. Nothing is lost when networks fail.</p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </div>
            <h3>Auto-Sync When Back Online</h3>
            <p>The moment internet returns, your data silently syncs to the cloud. No manual action needed.</p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="use-cases">
        <div className="chips-container">
          <span className="chip">Floods</span>
          <span className="chip">Earthquakes</span>
          <span className="chip">Cyclones</span>
          <span className="chip">Power Outages</span>
          <span className="chip">Remote Areas</span>
          <span className="chip">Search & Rescue</span>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="feature-highlight">
        <div className="highlight-grid">
          <div className="highlight-illustration">
            <svg viewBox="0 0 200 120" className="phones-illustration">
              <rect x="20" y="20" width="50" height="80" rx="6" fill="#1E293B" stroke="#334155" strokeWidth="2" />
              <rect x="130" y="20" width="50" height="80" rx="6" fill="#1E293B" stroke="#334155" strokeWidth="2" />
              <line x1="75" y1="60" x2="125" y2="60" stroke="#F97316" strokeWidth="3" strokeDasharray="6,4" className="dash-anim" />
              <circle cx="45" cy="85" r="4" fill="#334155" />
              <circle cx="155" cy="85" r="4" fill="#334155" />
              <path d="M72 60 L62 55 L62 65 Z" fill="#F97316" />
              <path d="M128 60 L138 55 L138 65 Z" fill="#F97316" />
            </svg>
          </div>
          <div className="highlight-content">
            <h2>Peer-to-Peer Messaging</h2>
            <ul className="feature-list">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg> 
                Works without any internet connection
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg> 
                Direct device communication via WebRTC
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg> 
                Store & share resources (food, medicine, shelter)
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg> 
                Offline maps and location tagging
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg> 
                Auto-sync when connectivity returns
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Resource Sharing Preview Section */}
      <section className="resource-preview">
        <h2>Resource Exchange</h2>
        <div className="mockup-cards">
          <div className="mockup-card need">
            <div className="mockup-header">
              <span className="badge badge-need">NEED</span>
              <span className="mockup-title">Food & Water</span>
            </div>
            <p className="mockup-desc">Family of 4 stranded near Sector 7 bridge</p>
          </div>
          <div className="mockup-card offer">
            <div className="mockup-header">
              <span className="badge badge-offer">OFFER</span>
              <span className="mockup-title">Shelter</span>
            </div>
            <p className="mockup-desc">Can house 6 people. Ground floor, dry area.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p className="tagline">Built for the moments when everything else fails</p>
        <div className="footer-status">
          <span className="status-dot"></span>
          PWA Installed — Available Offline
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
