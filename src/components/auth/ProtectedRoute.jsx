import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import UnauthorizedAccess from './UnauthorizedAccess';

function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallbackPath = '/login',
  showUnauthorized = true 
}) {
  const { 
    user, 
    loading, 
    isAuthenticated, 
    canAccess, 
    hasPermission 
  } = useAuth();
  
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
    if (showUnauthorized) {
      return <UnauthorizedAccess requiredRoles={requiredRoles} />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      if (showUnauthorized) {
        return <UnauthorizedAccess requiredPermissions={requiredPermissions} />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

// Role-specific route components
export function AdminRoute({ children, ...props }) {
  return (
    <ProtectedRoute requiredRoles={['Admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function AgentRoute({ children, ...props }) {
  return (
    <ProtectedRoute requiredRoles={['Agent', 'Admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function VARoute({ children, ...props }) {
  return (
    <ProtectedRoute requiredRoles={['VA', 'Admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function AIRoute({ children, ...props }) {
  return (
    <ProtectedRoute requiredRoles={['AI', 'Admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function UserRoute({ children, ...props }) {
  return (
    <ProtectedRoute requiredRoles={['User', 'Agent', 'VA', 'Admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export { ProtectedRoute };
export default ProtectedRoute;