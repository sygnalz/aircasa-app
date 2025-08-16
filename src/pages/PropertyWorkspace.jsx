import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";

// Import the two specialized components
import UserPropertyWorkspace from "./UserPropertyWorkspace";
import AdminPropertyWorkspace from "./AdminPropertyWorkspace";

export default function PropertyWorkspace() {
  console.log('🏠 PropertyWorkspace router component loading...');
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const fromAdmin = searchParams.get("from") === "admin";

  useEffect(() => {
    console.log('🏠 PropertyWorkspace useEffect triggered - fetching user...');
    const fetchUser = async () => {
      try {
        console.log('🏠 About to call User.me()...');
        const user = await User.me();
        console.log('🏠 User.me() returned:', user);
        if (!user) {
          console.log('🏠 No user found, redirecting to home...');
          navigate("/", { replace: true });
          return;
        }
        console.log('🏠 Setting current user:', user);
        setCurrentUser(user);
      } catch (error) {
        console.log('🏠 Error in fetchUser, redirecting to auth:', error);
        navigate("/auth", { replace: true });
      } finally {
        console.log('🏠 Setting isLoading to false');
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
  console.log('🏠 PropertyWorkspace routing decision:', { currentUser, fromAdmin });
  if (currentUser?.role === 'admin' && fromAdmin) {
    // Admin accessing via admin panel
    console.log('🏠 Routing to AdminPropertyWorkspace');
    return <AdminPropertyWorkspace />;
  } else if (currentUser?.role === 'admin' && !fromAdmin) {
    // Admin accessing via regular route (show user view)
    console.log('🏠 Routing to UserPropertyWorkspace (admin user view)');
    return <UserPropertyWorkspace />;
  } else {
    // Regular user
    console.log('🏠 Routing to UserPropertyWorkspace (regular user)');
    return <UserPropertyWorkspace />;
  }
}