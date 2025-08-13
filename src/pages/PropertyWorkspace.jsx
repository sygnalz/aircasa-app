import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";

// Import the two specialized components
import UserPropertyWorkspace from "./UserPropertyWorkspace";
import AdminPropertyWorkspace from "./AdminPropertyWorkspace";

export default function PropertyWorkspace() {
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const fromAdmin = searchParams.get("from") === "admin";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        if (!user) {
          navigate(createPageUrl("Auth"), { replace: true });
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        navigate(createPageUrl("Auth"), { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Route to appropriate component based on user role and access method
  if (currentUser?.role === 'admin' && fromAdmin) {
    // Admin accessing via admin panel
    return <AdminPropertyWorkspace />;
  } else if (currentUser?.role === 'admin' && !fromAdmin) {
    // Admin accessing via regular route (show user view)
    return <UserPropertyWorkspace />;
  } else {
    // Regular user
    return <UserPropertyWorkspace />;
  }
}