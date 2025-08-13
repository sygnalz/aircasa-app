

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from '@/utils';
import { User } from "@/api/entities";
import { LogOut, LayoutDashboard, Home, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import CasaVoiceAgentWidget from "../components/CasaVoiceAgentWidget";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
        
        // Check if user has explicit auth intent (URL parameters)
        const urlParams = new URLSearchParams(window.location.search);
        const hasAuthIntent = urlParams.has('register') || urlParams.has('login');
        
        // If user is not authenticated and on Auth page without intent, redirect to Index
        if (currentPageName === 'Auth' && !hasAuthIntent) {
          navigate(createPageUrl('Index'), { replace: true });
          return;
        }
        
        // If user is not authenticated and trying to access protected pages, redirect to Index
        const protectedPages = ['Dashboard', 'PropertyWorkspace', 'Onboarding', 'PublishListing', 'PhotoPackages'];
        if (protectedPages.includes(currentPageName)) {
          navigate(createPageUrl('Index'), { replace: true });
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [location.pathname, currentPageName, navigate]); // Add navigate to dependency array
  
  const handleLogout = async () => {
    await User.logout();
    navigate(createPageUrl('Index'), { replace: true }); // Use navigate for logout redirect
  };

  const handleSignIn = async () => {
    try {
      const redirectUrl = createPageUrl("Dashboard");
      await User.loginWithRedirect(window.location.origin + redirectUrl);
    } catch (error) {
      console.error("Login redirect failed:", error);
      // Fallback to basic login if redirect fails
      window.location.href = "/login";
    }
  };

  // Show loading while checking authentication for protected pages or Auth page without intent
  const urlParams = new URLSearchParams(window.location.search);
  const hasAuthIntent = urlParams.has('register') || urlParams.has('login');
  
  if (isLoading && (['Dashboard', 'PropertyWorkspace', 'Onboarding', 'PublishListing', 'PhotoPackages'].includes(currentPageName) || (currentPageName === 'Auth' && !hasAuthIntent))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { name: "Home", href: createPageUrl('Index'), icon: Home },
    { name: "Dashboard", href: createPageUrl('Dashboard'), icon: LayoutDashboard },
    { name: "Listings", href: "#", icon: Newspaper },
  ];

  // Check if user has any admin role - now using extended_role system
  const hasAdminAccess = user && (user.role === 'admin' || ['admin', 'va', 'agent'].includes(user.extended_role));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <style>{`
        .glass-header {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .luxury-gradient {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }
        .gold-shimmer {
          background: linear-gradient(90deg, #fde047, #facc15, #fde047);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 5s infinite linear;
          background-size: 200% 100%;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .premium-shadow {
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
      `}</style>
      
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 glass-header">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link to={createPageUrl('Index')} className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
              <path d="M12 2L2 7V21H22V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 21V15C12 13.3431 10.6569 12 9 12H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-bold text-xl text-gray-800">AirCasa</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                {link.name}
              </Link>
            ))}
            {hasAdminAccess && (
              <Link to={createPageUrl('AdminPanel')} className="text-gray-600 hover:text-blue-600 transition-colors">
                Admin Panel
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-700">Welcome, {user.full_name?.split(' ')[0]}</span>
                {user.role !== 'user' && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                    {user.role.toUpperCase()}
                  </span>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      {user && <CasaVoiceAgentWidget />}
      
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-2">AirCasa</h3>
              <p className="text-gray-600 text-sm">Simplifying real estate listings with AI.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('Index')} className="text-gray-600 hover:text-blue-600">Home</Link></li>
                <li><Link to={createPageUrl('Dashboard')} className="text-gray-600 hover:text-blue-600">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AirCasa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

