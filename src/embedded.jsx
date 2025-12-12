// This file handles the embedded mode functionality for the template app
// It ensures proper communication with the parent app and correct rendering

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Debug flag - set to true to enable console logging
const DEBUG = import.meta.env.DEV;

// Check if we're running in an iframe (embedded mode)
export function isRunningInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to same-origin policy,
    // we're definitely in an iframe
    return true;
  }
}

// Main entry point for the application
export function initializeApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    if (DEBUG) console.error('Root element not found');
    return;
  }

  // Check if we're in embedded mode
  const isEmbedded = isRunningInIframe();

  // Create the React root
  const root = createRoot(rootElement);

  if (isEmbedded) {
    // In embedded mode, we need to handle auth data from parent
    if (DEBUG) console.log('Initializing in embedded mode');
    root.render(<EmbeddedModeHandler />);
  } else {
    // In standalone mode, just render the app normally
    if (DEBUG) console.log('Initializing in standalone mode');
    root.render(<App />);
  }
}

// Component to handle embedded mode and auth data
// NOTE: iFrame integration is non-standard and discouraged.
// The postMessage protocol uses authToken/tenantName per child-app-integration-standards.md Section 11.
// We map these to the standard props (token/dbName) when passing to App.
function EmbeddedModeHandler() {
  const [authData, setAuthData] = useState({ token: null, dbName: null });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (DEBUG) console.log('EmbeddedModeHandler mounted, setting up message listener');

    // Function to handle messages from parent
    // iFrame protocol uses authToken/tenantName, we map to standard props
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'AUTH_DATA') {
        if (DEBUG) {
          console.log('Received AUTH_DATA message:', {
            authToken: event.data.authToken ? `${event.data.authToken.substring(0, 10)}...` : null,
            tenantName: event.data.tenantName
          });
        }

        // Map iFrame protocol (authToken/tenantName) to standard props (token/dbName)
        setAuthData({
          token: event.data.authToken,
          dbName: event.data.tenantName
        });

        setIsReady(true);
      }
    };

    // Add event listener for messages
    window.addEventListener('message', handleMessage);

    // Notify parent that we're ready to receive auth data
    if (DEBUG) console.log('Sending IFRAME_READY message to parent');
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Show loading state until we receive auth data
  if (!isReady) {
    return (
      <div style={{
        padding: '20px',
        fontFamily: 'var(--font-family, \'Inter\', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        color: 'var(--color-text-secondary, #6b7280)'
      }}>
        <p>Loading Client Types...</p>
      </div>
    );
  }

  // Render the app with auth data (using standard props)
  if (DEBUG) console.log('Rendering App with auth data in embedded mode');
  return <App token={authData.token} dbName={authData.dbName} />;
}
