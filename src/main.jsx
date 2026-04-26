import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import './App.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {!PUBLISHABLE_KEY ? (
      <div style={{ padding: '2rem', color: '#ff8080', fontFamily: 'sans-serif', background: '#111', minHeight: '100vh' }}>
        <h2>Missing Clerk Configuration</h2>
        <p style={{ color: '#fff' }}>
          Please create a <code>.env</code> file in the <strong>root directory</strong> and add your Clerk Publishable Key as <code>VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code>
        </p>
      </div>
    ) : (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <HashRouter>
          <App />
        </HashRouter>
      </ClerkProvider>
    )}
  </React.StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
