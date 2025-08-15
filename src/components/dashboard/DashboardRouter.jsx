import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

// Import role-specific dashboards
import Dashboard from '../../pages/Dashboard-simple'; // User dashboard
import SuperAdminDashboard from '../admin/SuperAdminDashboard';
import AgentDashboard from '../admin/AgentDashboard';
import VADashboard from '../admin/VADashboard';

// AI Dashboard component (create if doesn't exist)
function AIDashboard({ user }) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Dashboard
            </h1>
            <p className="text-gray-600">
              AI system access and data processing interface
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-indigo-600">AI SYSTEM</span>
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">
          AI Access Layer Active
        </h3>
        <p className="text-indigo-700 mb-4">
          Connected to user data and conversation systems
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <h4 className="font-medium text-indigo-900">Data Access</h4>
            <p className="text-sm text-indigo-600 mt-1">Property & User Data</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <h4 className="font-medium text-indigo-900">Conversations</h4>
            <p className="text-sm text-indigo-600 mt-1">Active Chat Sessions</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <h4 className="font-medium text-indigo-900">Permissions</h4>
            <p className="text-sm text-indigo-600 mt-1">Access Control Layer</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardRouter() {
  const { 
    user, 
    userProfile, 
    primaryRole, 
    loading, 
    isAuthenticated,
    ROLES,
    getDashboardType 
  } = useAuth();

  // Show loading while determining role
  if (loading || !isAuthenticated) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  const dashboardType = getDashboardType();

  // Create user object for dashboard components
  const dashboardUser = {
    ...user,
    full_name: user?.user_metadata?.full_name || userProfile?.fullName || 'User',
    email: user?.email || userProfile?.email,
    role: primaryRole,
    ...userProfile
  };

  // Route to appropriate dashboard based on primary role
  switch (dashboardType) {
    case 'admin':
      return <SuperAdminDashboard user={dashboardUser} />;
      
    case 'agent':
      return <AgentDashboard user={dashboardUser} />;
      
    case 'va':
      return <VADashboard user={dashboardUser} />;
      
    case 'ai':
      return <AIDashboard user={dashboardUser} />;
      
    case 'user':
    default:
      return <Dashboard user={dashboardUser} />;
  }
}

// Export individual dashboard components for direct routing if needed
export {
  Dashboard as UserDashboard,
  SuperAdminDashboard,
  AgentDashboard,
  VADashboard,
  AIDashboard
};