
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Home, MessageSquare, TrendingUp, FileText, Activity, BarChart3, PieChart, Calendar, RefreshCw } from "lucide-react";
import { getAnalyticsData } from "@/api/functions";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const user = await User.me();
        if (!user || user.role !== 'admin') {
          navigate(createPageUrl("Dashboard"), { replace: true });
          return;
        }
        await loadAnalyticsData();
      } catch (error) {
        navigate("/auth", { replace: true });
      }
    };
    checkAdminAccess();
  }, [navigate]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Loading analytics data..."); // Debug log
      const response = await getAnalyticsData();
      console.log("Analytics response:", response); // Debug log
      
      if (response && response.status === 200 && response.data.success) {
        console.log("Analytics data received:", response.data.data); // Debug log
        setAnalyticsData(response.data.data);
        setLastUpdated(new Date());
      } else {
        const errorMsg = response?.data?.error || "Failed to load analytics data";
        console.error("Analytics error:", errorMsg); // Debug log
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("Error in loadAnalyticsData:", err); // Debug log
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTrendData = (trendObject) => {
    if (!trendObject || typeof trendObject !== 'object') return [];
    return Object.entries(trendObject)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Last 14 days
  };

  const formatPieData = (dataObject, limit = 5) => {
    if (!dataObject || typeof dataObject !== 'object') return [];
    const entries = Object.entries(dataObject);
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, limit);
    const others = sorted.slice(limit);
    
    const result = top.map(([name, value]) => ({ name, value }));
    
    if (others.length > 0) {
      const othersTotal = others.reduce((sum, [, value]) => sum + value, 0);
      result.push({ name: 'Others', value: othersTotal });
    }
    
    return result;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-white">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="outline" onClick={() => navigate(createPageUrl("AdminPanel"))} className="flex items-center gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Panel
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics</h1>
              <p className="text-gray-400">Application usage statistics</p>
            </div>
          </div>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <div className="text-red-400 mb-4">⚠️</div>
              <h3 className="text-2xl font-semibold text-white mb-2">Error Loading Analytics</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <Button onClick={loadAnalyticsData} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If isLoading is false but analyticsData is still null (e.g., initial render after isLoading becomes false but before data is set)
  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-white">Processing Analytics Data...</p>
        </div>
      </div>
    );
  }

  const data = analyticsData;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate(createPageUrl("AdminPanel"))} className="flex items-center gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Panel
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-gray-400">Comprehensive application metrics and insights</p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <Button onClick={loadAnalyticsData} variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{data.userEngagement?.totalUsers?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-green-400">+{data.userEngagement?.newUsersThisMonth || 0} this month</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Properties</p>
                  <p className="text-2xl font-bold text-white">{data.propertyListings?.totalProperties?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-green-400">+{data.propertyListings?.newPropertiesThisMonth || 0} this month</p>
                </div>
                <Home className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Conversation Threads</p>
                  <p className="text-2xl font-bold text-white">{data.conversations?.uniqueConversationThreads?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-blue-400">{data.conversations?.avgMessagesPerConversation || 0} avg msgs/thread</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Weekly Active Users</p>
                  <p className="text-2xl font-bold text-white">{data.userEngagement?.weeklyActiveUsers?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-yellow-400">Engaged this week</p>
                </div>
                <Activity className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User & Engagement Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                User Registration Trend (Last 14 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatTrendData(data.userEngagement?.userRegistrationTrend)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users by Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={formatPieData(data.userEngagement?.usersByRole)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {formatPieData(data.userEngagement?.usersByRole).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Property Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Property Creation Trend (Last 14 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={formatTrendData(data.propertyListings?.propertyCreationTrend)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Home className="w-5 h-5" />
                Properties by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(data.propertyListings?.propertiesByType || {}).map(([name, value]) => ({ name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Bar dataKey="value" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Intake Form Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Intake Completion Rate</p>
                  <p className="text-3xl font-bold text-white">{data.propertyIntake?.intakeCompletionRate || 0}%</p>
                  <p className="text-sm text-gray-400">{(data.propertyIntake?.completedIntakeForms || 0)} of {(data.propertyIntake?.totalIntakeForms || 0)} completed</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Intake Adoption Rate</p>
                  <p className="text-3xl font-bold text-white">{data.propertyIntake?.intakeAdoptionRate || 0}%</p>
                  <p className="text-sm text-gray-400">{(data.propertyIntake?.propertiesWithIntake || 0)} of {(data.propertyListings?.totalProperties || 0)} properties</p>
                </div>
                <PieChart className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Messages</p>
                  <p className="text-3xl font-bold text-white">{data.conversations?.totalConversations?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-gray-400">+{data.conversations?.conversationsThisWeek || 0} this week</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversation Volume (Last 14 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatTrendData(data.conversations?.conversationTrend)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Messages by Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={formatPieData(data.conversations?.messagesByRole)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {formatPieData(data.conversations?.messagesByRole).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Geographic Distribution */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Properties by State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={Object.entries(data.propertyListings?.propertiesByState || {})
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Bar dataKey="value" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Health Summary */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Health & Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-2">
                  {data.systemHealth?.totalRecords?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-400">Total Records</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400 mb-2">
                  +{((data.systemHealth?.databaseGrowthThisMonth?.users || 0) + 
                     (data.systemHealth?.databaseGrowthThisMonth?.properties || 0) + 
                     (data.systemHealth?.databaseGrowthThisMonth?.conversations || 0)).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">New Records This Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400 mb-2">
                  {data.userEngagement?.weeklyActiveUsers && data.userEngagement?.totalUsers ? 
                    Math.round((data.userEngagement.weeklyActiveUsers / data.userEngagement.totalUsers) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-400">User Engagement Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
