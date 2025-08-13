
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Import role-specific dashboard components
import SuperAdminDashboard from "../components/admin/SuperAdminDashboard";
import VADashboard from "../components/admin/VADashboard";
import AgentDashboard from "../components/admin/AgentDashboard";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        if (!currentUser) {
          // Not logged in, redirect to auth
          navigate("/auth", { replace: true });
          return;
        }

        // Check if user has any admin role - now using extended_role system
        if (currentUser.role !== 'admin' && !['admin', 'va', 'agent'].includes(currentUser.extended_role)) {
          // User doesn't have admin access, redirect to regular dashboard
          navigate(createPageUrl("Dashboard"), { replace: true });
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Error checking user role:", error);
        navigate("/auth", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-900">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  const renderRoleSpecificDashboard = () => {
    // Check extended_role first, then fall back to built-in role
    const userRole = user?.extended_role || user?.role;
    
    switch (userRole) {
      case 'admin':
        return <SuperAdminDashboard user={user} />;
      case 'va':
        return <VADashboard user={user} />;
      case 'agent':
        return <AgentDashboard user={user} />;
      default:
        // This shouldn't happen due to our checks above, but just in case
        navigate(createPageUrl("Dashboard"), { replace: true });
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderRoleSpecificDashboard()}
    </div>
  );
}
