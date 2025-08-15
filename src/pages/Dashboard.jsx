import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { properties } from '@/api/functions';
import { PropertyTile } from '@/components/dashboard/PropertyTile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, MessageSquare, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, userRoles } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [propertiesData, setPropertiesData] = useState([]);
  const [userProperties, setUserProperties] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      try {
        // Get session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!mounted) return;
        
        setSession(sessionData.session);
        
        // Load properties data
        try {
          console.log('🏠 Loading properties for dashboard...');
          const data = await properties.list();
          console.log('🏠 Properties loaded:', data);
          
          if (mounted && data?.items) {
            setPropertiesData(data.items);
            
            // Filter properties for current user
            if (user?.email) {
              console.log('🔍 Filtering properties for user:', user.email);
              const filtered = data.items.filter(property => {
                const matches = (
                  property.ownerEmail === user.email ||
                  property.app_email === user.email ||
                  property.app_owner_user_id === user.id
                );
                console.log(`Property ${property.id}:`, {
                  ownerEmail: property.ownerEmail,
                  app_email: property.app_email,
                  userEmail: user.email,
                  matches
                });
                return matches;
              });
              console.log('✅ Filtered properties:', filtered);
              setUserProperties(filtered);
            }
          }
        } catch (apiError) {
          console.error('Properties API error:', apiError);
          setError(`Failed to load properties: ${apiError.message}`);
        }
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (user) {
      initializeDashboard();
    } else {
      setLoading(false);
    }

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (mounted) {
        setSession(sess);
      }
    });

    return () => {
      mounted = false;
      if (sub?.subscription?.unsubscribe) {
        sub.subscription.unsubscribe();
      }
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-medium">Error loading dashboard</div>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-lg font-medium">Not signed in</div>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
            <p className="text-gray-600">
              Hello {userName}! Manage your property listings and track your selling progress.
            </p>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Get Referral Link
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Conversations
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Your Properties</h2>
          <Link to="/onboarding">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Property
            </Button>
          </Link>
        </div>

        {/* Properties Grid */}
        {userProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProperties.map((property) => (
              <PropertyTile key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="h-12 w-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">No properties yet</h3>
                  <p className="text-gray-600">
                    Get started by adding your first property to the platform.
                  </p>
                </div>
                <Link to="/onboarding">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Property
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Debug Information (for development) - Commented out but available for debugging */}
      {/* 
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>User Email: {user?.email}</div>
            <div>User Roles: {userRoles?.join(', ') || 'None'}</div>
            <div>Total Properties: {propertiesData.length}</div>
            <div>User Properties: {userProperties.length}</div>
            <div>Property IDs: {userProperties.map(p => p.id).join(', ')}</div>
          </CardContent>
        </Card>
      )}
      */}
    </div>
  );
}