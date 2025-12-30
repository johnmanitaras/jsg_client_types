import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ReadOnlyToastProvider } from './contexts/ReadOnlyToastContext';
import { PermissionsProvider, Permissions } from './contexts/PermissionsContext';
import { Login } from './components/Login';
import { ClientTypesPage } from './pages/ClientTypesPage';
import { useAuth } from './hooks/useAuth';
import { initializeStandaloneFallbacks, debugCSSVariables } from './utils/cssVariables';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

interface AppProps {
  // Standard prop names for embedded mode (per child-app-integration-standards.md)
  token?: string;
  dbName?: string;
  onTokenExpired?: () => void;
  initialRoute?: string;
  onNavigate?: (route: string) => void;
  onNavigateToApp?: (path: string) => void;
  // Permissions prop from wrapper
  permissions?: Permissions;
}

// Standalone mode content with router
function StandaloneContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <ClientTypesPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// Embedded mode content - no router needed, user already authenticated via wrapper
function EmbeddedContent() {
  return <ClientTypesPage />;
}

// Note: initialRoute, onNavigate, onNavigateToApp are available for routing integration
// See jsg_wrapper/docs/child-app-integration-standards.md Section 4 for implementation
function App({ token, dbName, onTokenExpired, initialRoute: _initialRoute, onNavigate: _onNavigate, onNavigateToApp: _onNavigateToApp, permissions }: AppProps = {}) {
  // Suppress unused variable warnings - these are available for routing implementation
  void _initialRoute; void _onNavigate; void _onNavigateToApp;

  // Detect embedded mode - when both token and dbName are provided by wrapper
  const isEmbedded = !!(token && dbName);

  // Initialize CSS variable fallbacks and debug info (only in standalone mode)
  useEffect(() => {
    if (!isEmbedded) {
      initializeStandaloneFallbacks();
      debugCSSVariables();
    }
  }, [isEmbedded]);

  return (
    <div className="jsg-template">
      <QueryClientProvider client={queryClient}>
        <ReadOnlyToastProvider>
          <PermissionsProvider permissions={permissions}>
            <AuthProvider token={token} dbName={dbName} onTokenExpired={onTokenExpired}>
              {isEmbedded ? <EmbeddedContent /> : <StandaloneContent />}
            </AuthProvider>
          </PermissionsProvider>
        </ReadOnlyToastProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;