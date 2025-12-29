/**
 * JetSetGo Client Types App - Export for embedded mode integration
 *
 * This module exports the main App component for use by the wrapper app.
 * When integrated into jsg_wrapper, import this module and pass the
 * required props (token, dbName, onTokenExpired, etc.).
 */

// Import CSS for library build (required for dist/style.css generation)
import './styles/variables-fallback.css';
import './styles/custom-variables.css';
import './index.css';

export { default as App } from './App';
export { default as ClientTypesApp } from './App';
export { ClientTypesPage } from './pages/ClientTypesPage';
