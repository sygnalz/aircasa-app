import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { properties } from '@/api/functions';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CalendarDays,
  TrendingUp,
  Users,
  Building2,
  Plus,
  ArrowRight,
  Target,
  Zap,
} from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: 'Add New Property',
      description: 'List a new property for rental',
      icon: Plus,
      color: 'bg-primary text-primary-foreground',
      href: '/properties/new',
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: TrendingUp,
      color: 'bg-green-500 text-white',
      href: '/analytics',
    },
    {
      title: 'Manage Bookings',
      description: 'Review upcoming reservations',
      icon: CalendarDays,
      color: 'bg-blue-500 text-white',
      href: '/bookings',
    },
    {
      title: 'Guest Messages',
      description: 'Respond to guest inquiries',
      icon: Users,
      color: 'bg-purple-500 text-white',
      href: '/messages',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Manage your properties and bookings efficiently
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                className="group flex items-center space-x-4 p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${action.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const GoalsOverview = () => {
  const goals = [
    {
      title: 'Monthly Revenue',
      current: 18500,
      target: 25000,
      unit: '$',
      color: 'bg-green-500',
    },
    {
      title: 'Occupancy Rate',
      current: 78,
      target: 85,
      unit: '%',
      color: 'bg-blue-500',
    },
    {
      title: 'Property Listings',
      current: 24,
      target: 30,
      unit: '',
      color: 'bg-purple-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals Overview
        </CardTitle>
        <CardDescription>
          Track your progress towards monthly goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const isCompleted = progress >= 100;
          
          return (
            <div key={goal.title} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{goal.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {goal.unit}{goal.current.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {goal.unit}{goal.target.toLocaleString()}
                    </span>
                  </div>
                </div>
                {isCompleted && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    ✓ Complete
                  </Badge>
                )}
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress.toFixed(1)}% complete
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [propertiesData, setPropertiesData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeDashboard = async () => {
      try {
        // Get session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!mounted) return;
        
        setSession(sessionData.session);
        
        // Load properties data (optional - won't fail if API isn't ready)
        try {
          const data = await properties.list();
          if (mounted && data?.items) {
            setPropertiesData(data.items);
          }
        } catch (apiError) {
          console.log('Properties API not ready:', apiError.message);
          // Don't set error state for API issues - dashboard should still work
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeDashboard();

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
  }, []);

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

  if (!session) {
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

  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'User';
  const userEmail = session?.user?.email;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your properties today.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            Online
          </Badge>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Chart - Takes up more space */}
        <div className="lg:col-span-4">
          <RevenueChart />
        </div>

        {/* Goals Overview */}
        <div className="lg:col-span-3">
          <GoalsOverview />
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Insights
          </CardTitle>
          <CardDescription>
            AI-powered recommendations to improve your property performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Pricing Optimization</p>
                <p className="text-xs text-blue-700">
                  Consider increasing rates for weekends by 15% based on demand patterns
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Building2 className="h-4 w-4 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-900">Property Updates</p>
                <p className="text-xs text-green-700">
                  Update property photos for Mountain Cabin to increase bookings by 23%
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-900">Guest Experience</p>
                <p className="text-xs text-purple-700">
                  Response time improved! Keep responding within 30 minutes for better ratings
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
