import React, { createContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { authChannel } from '../lib/broadcast';
import { DEFAULT_TENANT } from '../lib/config';
import { TenantInfo, GroupInfo } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  tenant: TenantInfo | null;
  userId: string | null;
  groups: GroupInfo[];
  permissions: string[];
  isEmbedded: boolean;
  authToken: string | null;
  onTokenExpired?: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  tenant: null,
  userId: null,
  groups: [],
  permissions: [],
  isEmbedded: false,
  authToken: null,
  onTokenExpired: undefined,
});


interface AuthProviderProps {
  children: React.ReactNode;
  token?: string;
  dbName?: string;
  onTokenExpired?: () => void;
}

// Note: onTokenExpired callback should be called when API returns 401/403
// See jsg_wrapper/docs/child-app-integration-standards.md Section 6 for implementation
export function AuthProvider({ children, token, dbName, onTokenExpired }: AuthProviderProps) {
  // CRITICAL: Detect embedded mode SYNCHRONOUSLY from props to avoid race conditions
  // This must be computed before any state initialization or effects run
  const isEmbedded = !!(token && dbName);

  // Initialize state based on embedded mode - this happens synchronously before effects
  const [user, setUser] = useState<User | null>(isEmbedded ? ({} as User) : null);
  const [loading, setLoading] = useState(!isEmbedded); // Already loaded if embedded
  const [tenant, setTenant] = useState<TenantInfo | null>(
    isEmbedded ? { id: 'embedded', name: dbName! } : null
  );
  const [userId, setUserId] = useState<string | null>(isEmbedded ? 'embedded-user' : null);
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  // Derive authToken directly from props to ensure reactivity when token changes
  const authToken = isEmbedded ? token ?? null : null;

  // Log embedded mode detection
  useEffect(() => {
    if (isEmbedded) {
      console.log('Running in embedded mode with provided token and dbName:', dbName);
    }
  }, [isEmbedded, dbName]);

  // Only run Firebase auth if NOT in embedded mode
  useEffect(() => {
    // Skip Firebase auth entirely if we're in embedded mode
    if (isEmbedded) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        const tenantClaim = idTokenResult.claims.tenant as TenantInfo;
        const user_id = idTokenResult.claims.user_id as string;
        const groupsClaim = idTokenResult.claims.groups as GroupInfo[] || [];
        const permissionsClaim = idTokenResult.claims.permissions as string[] || [];

        // Use tenant from claims, or fallback to default tenant for development/testing
        setTenant(tenantClaim || { id: DEFAULT_TENANT, name: DEFAULT_TENANT });
        setUserId(user_id || null);
        setGroups(groupsClaim);
        setPermissions(permissionsClaim);
      } else {
        setTenant(null);
        setUserId(null);
        setGroups([]);
        setPermissions([]);
      }
      setUser(user);
      setLoading(false);
    });

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data.type === 'AUTH_STATE_CHANGED') {
        setUser(event.data.user);
        setTenant(event.data.tenant || null);
        setUserId(event.data.userId || null);
        setGroups(event.data.groups || []);
        setPermissions(event.data.permissions || []);
      }
    };

    authChannel.addEventListener('message', handleAuthMessage);

    return () => {
      unsubscribe();
      authChannel.removeEventListener('message', handleAuthMessage);
    };
  }, [isEmbedded]);

  const value = {
    user,
    loading,
    tenant,
    userId,
    groups,
    permissions,
    isEmbedded,
    authToken,
    onTokenExpired,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}