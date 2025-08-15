import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { properties, analytics } from '@/api/functions';
import {
  CalendarDays,
  TrendingUp,
  Users,
  Building2,
  Plus,
  ArrowRight,
  Target,
  Zap,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';

const StatCard = ({ title, value, description, trend, trendValue, icon: Icon }) => {
  const isPositiveTrend = trend === 'up';
  const TrendIcon = isPositiveTrend ? ArrowUpRight : ArrowUpRight;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <div className="flex items-center pt-1">
            <TrendIcon className="h-4 w-4 mr-1 text-green-600" />
            <span className="text-xs text-green-600">{trendValue}</span>
            <span className="text-xs text-muted-foreground ml-1">{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QuickActions = () => {
  const actions = [
    {
      title: 'Add New Property',
      description: 'List a new property for rental',
      icon: Plus,
      color: 'bg-primary text-primary-foreground',
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: TrendingUp,
      color: 'bg-green-500 text-white',
    },
    {
      title: 'Manage Bookings',
      description: 'Review upcoming reservations',
      icon: CalendarDays,
      color: 'bg-blue-500 text-white',
    },
    {
      title: 'Guest Messages',
      description: 'Respond to guest inquiries',
      icon: Users,
      color: 'bg-purple-500 text-white',
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
    },
    {
      title: 'Occupancy Rate',
      current: 78,
      target: 85,
      unit: '%',
    },
    {
      title: 'Property Listings',
      current: 24,
      target: 30,
      unit: '',
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
  const [propertiesData, setPropertiesData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  // Default stats (fallback)
  const defaultStats = {
    totalProperties: { value: '0', trend: 'up', trendValue: '0%', description: 'loading...' },
    totalRevenue: { value: '$0', trend: 'up', trendValue: '0%', description: 'loading...' },
    activeListings: { value: '0', trend: 'up', trendValue: '0%', description: 'loading...' },
    totalViews: { value: '0', trend: 'up', trendValue: '0%', description: 'loading...' },
  };

  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        console.log('📊 Loading dashboard data from Airtable...');
        
        // Load properties and analytics in parallel
        const [propertiesResponse, analyticsResponse] = await Promise.allSettled([
          properties.list(),
          analytics.getDashboardStats()
        ]);

        // Handle properties data
        if (propertiesResponse.status === 'fulfilled' && propertiesResponse.value?.items) {
          const props = propertiesResponse.value.items;
          setPropertiesData(props);
          console.log(`✅ Loaded ${props.length} properties`);
          
          // Calculate stats from properties data
          const activeProps = props.filter(p => p.status === 'active');
          const totalRevenue = props.reduce((sum, p) => sum + (p.revenue || 0), 0);
          const totalBookings = props.reduce((sum, p) => sum + (p.bookings || 0), 0);
          
          setStats({
            totalProperties: { 
              value: props.length.toString(),
              trend: 'up', 
              trendValue: '+12%', 
              description: 'total properties' 
            },
            totalRevenue: { 
              value: `$${totalRevenue.toLocaleString()}`,
              trend: 'up', 
              trendValue: '+20.1%', 
              description: 'total revenue' 
            },
            activeListings: { 
              value: activeProps.length.toString(),
              trend: 'up', 
              trendValue: '+4%', 
              description: 'active listings' 
            },
            totalViews: { 
              value: totalBookings.toString(),
              trend: 'up', 
              trendValue: '+180%', 
              description: 'total bookings' 
            },
          });
        }

        // Handle analytics data
        if (analyticsResponse.status === 'fulfilled') {
          setAnalyticsData(analyticsResponse.value);
          console.log('✅ Loaded analytics data');
        }

      } catch (err) {
        console.error('❌ Error loading dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (error) {
    console.warn('Dashboard error, showing default stats:', error);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, Demo User!
            {loading && <span className="text-lg font-normal text-muted-foreground ml-2">(Loading...)</span>}
          </h1>
          <p className="text-muted-foreground">
            {loading 
              ? 'Loading your property data from Airtable...' 
              : `Here's what's happening with your ${propertiesData.length} properties today.`
            }
          </p>
          {error && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ Note: Using demo data due to connection issue
            </p>
          )}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Properties"
          value={stats.totalProperties.value}
          description={stats.totalProperties.description}
          trend={stats.totalProperties.trend}
          trendValue={stats.totalProperties.trendValue}
          icon={Building2}
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue.value}
          description={stats.totalRevenue.description}
          trend={stats.totalRevenue.trend}
          trendValue={stats.totalRevenue.trendValue}
          icon={DollarSign}
        />
        <StatCard
          title="Active Listings"
          value={stats.activeListings.value}
          description={stats.activeListings.description}
          trend={stats.activeListings.trend}
          trendValue={stats.activeListings.trendValue}
          icon={CalendarDays}
        />
        <StatCard
          title="Total Views"
          value={stats.totalViews.value}
          description={stats.totalViews.description}
          trend={stats.totalViews.trend}
          trendValue={stats.totalViews.trendValue}
          icon={Users}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Chart Placeholder */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                Revenue and performance trends over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80 flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Interactive Charts</h3>
                  <p className="text-blue-700 text-sm">
                    Revenue, bookings, and property analytics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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

        {/* Recent Activity Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New booking received', time: '15 minutes ago', type: 'booking' },
                { action: 'Message from guest', time: '45 minutes ago', type: 'message' },
                { action: 'Payment received', time: '2 hours ago', type: 'payment' },
                { action: 'Property updated', time: '4 hours ago', type: 'update' }
              ].map((activity, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Pricing Optimization</p>
                <p className="text-xs text-blue-700">
                  Consider increasing weekend rates by 15%
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
                  Update photos to increase bookings by 23%
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
                  Fast responses improve ratings significantly
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}