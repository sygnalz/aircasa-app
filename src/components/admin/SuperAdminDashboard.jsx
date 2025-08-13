
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Home, MessageSquare, BarChart, Settings, Users, Briefcase, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminDashboardStats } from "@/api/functions/getAdminDashboardStats.js";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: '...', totalProperties: '...', activeConversations: '...' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await getAdminDashboardStats();
        if (response && response.data) {
          setStats(response.data);
        } else {
          setStats({ totalUsers: 'N/A', totalProperties: 'N/A', activeConversations: 'N/A' });
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        setStats({ totalUsers: 'Error', totalProperties: 'Error', activeConversations: 'Error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const adminNavItems = [
    { name: "Manage Users", icon: Users, href: createPageUrl('AdminUsers'), description: "Edit roles and permissions" },
    { name: "View All Properties", icon: Home, href: createPageUrl('AdminProperties'), description: "Review and manage listings" },
    { name: "Conversation Logs", icon: MessageSquare, href: createPageUrl('AdminConversations'), description: "Monitor AI-user interactions" },
    { name: "Analytics", icon: BarChart, href: createPageUrl('AdminAnalytics'), description: "View app usage statistics" },
    { name: "Manage VAs", icon: Briefcase, href: createPageUrl('AdminManageVAs'), description: "Assign tasks to virtual assistants" },
    { name: "Manage Agents", icon: User, href: createPageUrl('AdminManageAgents'), description: "Oversee real estate agent activities" },
    { name: "App Settings", icon: Settings, href: createPageUrl('AdminSettings'), description: "Configure global application settings" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-900 text-gray-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Global overview and management tools</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Properties</CardTitle>
              <Home className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalProperties}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.activeConversations}</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Grid */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">Management Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminNavItems.map((item) => (
              <Card key={item.name} className="bg-slate-800 border-slate-700 hover:shadow-lg hover:border-blue-500 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <item.icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-white">{item.name}</CardTitle>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to={item.href}>
                    <Button variant="outline" className="w-full bg-slate-700 hover:bg-slate-600 text-white border-slate-600">
                      <Eye className="w-4 h-4 mr-2" />
                      Go to {item.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
