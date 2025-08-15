import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, isDemoMode } from '../lib/supabase';
import { userAPI } from '../api/userFunctions';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role hierarchy and permissions
export const ROLES = {
  USER: 'User',
  ADMIN: 'Admin', 
  AI: 'AI',
  AGENT: 'Agent',
  VA: 'VA'
};

export const ROLE_PERMISSIONS = {
  [ROLES.USER]: {
    canViewDashboard: true,
    canViewProperties: true,
    canEditOwnProperties: true,
    canViewConversations: true,
    dashboardType: 'user'
  },
  [ROLES.AGENT]: {
    canViewDashboard: true,
    canViewProperties: true,
    canEditAssignedProperties: true,
    canViewClients: true,
    canManageShowings: true,
    canViewCommissions: true,
    dashboardType: 'agent'
  },
  [ROLES.VA]: {
    canViewDashboard: true,
    canViewConversations: true,
    canManageConversations: true,
    canViewSupportQueue: true,
    canViewAnalytics: true,
    dashboardType: 'va'
  },
  [ROLES.ADMIN]: {
    canViewDashboard: true,
    canViewAllProperties: true,
    canEditAllProperties: true,
    canManageUsers: true,
    canViewAllConversations: true,
    canManageAgents: true,
    canManageVAs: true,
    canViewAnalytics: true,
    canManageSettings: true,
    dashboardType: 'admin'
  },
  [ROLES.AI]: {
    canAccessAILayer: true,
    canViewUserData: true,
    canInitiateConversations: true,
    dashboardType: 'ai'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [primaryRole, setPrimaryRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Get current session
      const { data: sessionData, error: sessionError } = await auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      if (sessionData?.session?.user) {
        await handleUserSession(sessionData.session.user);
      }

      // Listen for auth changes
      const { data: subscription } = auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserSession(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          setUserRoles([]);
          setPrimaryRole(null);
          if (isDemoMode) {
            localStorage.removeItem('demo-user');
          }
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleUserSession = async (authUser) => {
    try {
      setUser(authUser);
      
      // Fetch user profile from Airtable Users table
      const profile = await fetchUserProfile(authUser);
      setUserProfile(profile);
      
      if (profile) {
        const roles = Array.isArray(profile.role) ? profile.role : [profile.role].filter(Boolean);
        setUserRoles(roles);
        
        // Determine primary role (highest priority)
        const primary = determinePrimaryRole(roles);
        setPrimaryRole(primary);
        
        console.log('✅ User authenticated:', {
          email: authUser.email,
          roles,
          primaryRole: primary
        });
      } else {
        // If no profile found, default to User role
        console.log('⚠️ No profile found, defaulting to User role');
        setUserRoles([ROLES.USER]);
        setPrimaryRole(ROLES.USER);
      }
    } catch (error) {
      console.error('Error handling user session:', error);
      // Fallback to basic user info
      setUserRoles([ROLES.USER]);
      setPrimaryRole(ROLES.USER);
    }
  };

  const fetchUserProfile = async (authUser) => {
    try {
      // Try to find user by email first
      const users = await userAPI.users.getAll();
      let profile = users.find(u => u.email === authUser.email);
      
      if (!profile) {
        // Try to find by user ID
        profile = await userAPI.users.getByOwnerUserId(authUser.id);
      }
      
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const determinePrimaryRole = (roles) => {
    // Role priority: Admin > Agent > VA > AI > User
    const rolePriority = [ROLES.ADMIN, ROLES.AGENT, ROLES.VA, ROLES.AI, ROLES.USER];
    
    for (const role of rolePriority) {
      if (roles.includes(role)) {
        return role;
      }
    }
    
    return ROLES.USER; // Default fallback
  };

  // Sign in methods
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        setError(error.message);
        return { success: false, error };
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      setError(error.message);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithOAuth = async (provider) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await auth.signInWithOAuth(provider);
      
      if (error) {
        setError(error.message);
        return { success: false, error };
      }
      
      return { success: true, data };
    } catch (error) {
      setError(error.message);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, metadata) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await auth.signUp(email, password, metadata);
      
      if (error) {
        setError(error.message);
        return { success: false, error };
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      setError(error.message);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signOut();
      
      if (error) {
        setError(error.message);
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Role and permission helpers
  const hasRole = (role) => {
    return userRoles.includes(role);
  };

  const hasPermission = (permission) => {
    if (!primaryRole) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[primaryRole];
    return rolePermissions && rolePermissions[permission];
  };

  const canAccess = (requiredRoles) => {
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    
    return requiredRoles.some(role => hasRole(role));
  };

  const getDashboardType = () => {
    if (!primaryRole) return 'user';
    return ROLE_PERMISSIONS[primaryRole]?.dashboardType || 'user';
  };

  // Mock sign-in for demo purposes
  const signInAsRole = async (role) => {
    if (!isDemoMode) return { success: false, error: 'Demo mode only' };
    
    const demoUsers = {
      [ROLES.USER]: { email: 'user@demo.com', name: 'Demo User' },
      [ROLES.ADMIN]: { email: 'admin@demo.com', name: 'Demo Admin' },
      [ROLES.AGENT]: { email: 'agent@demo.com', name: 'Demo Agent' },
      [ROLES.VA]: { email: 'va@demo.com', name: 'Demo VA' },
      [ROLES.AI]: { email: 'ai@demo.com', name: 'Demo AI' }
    };
    
    const demoUser = demoUsers[role];
    if (demoUser) {
      const authUser = {
        id: `demo-${role.toLowerCase()}`,
        email: demoUser.email,
        user_metadata: {
          full_name: demoUser.name
        }
      };
      
      setUser(authUser);
      setUserProfile({
        id: authUser.id,
        email: authUser.email,
        fullName: demoUser.name,
        role: [role]
      });
      setUserRoles([role]);
      setPrimaryRole(role);
      
      localStorage.setItem('demo-user', JSON.stringify(authUser));
      
      return { success: true, user: authUser };
    }
    
    return { success: false, error: 'Invalid role' };
  };

  const value = {
    // Auth state
    user,
    userProfile,
    userRoles,
    primaryRole,
    loading,
    error,
    isAuthenticated: !!user,
    isDemoMode,

    // Auth methods
    signIn,
    signInWithOAuth,
    signUp,
    signOut,
    signInAsRole, // Demo only

    // Role and permission helpers
    hasRole,
    hasPermission,
    canAccess,
    getDashboardType,

    // Constants
    ROLES,
    ROLE_PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}