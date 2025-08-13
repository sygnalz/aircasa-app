import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, DollarSign, MapPin, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AgentDashboard({ user }) {
  const [stats, setStats] = useState({
    assignedProperties: 0,
    activeClients: 0,
    scheduledShowings: 0,
    monthlyCommission: 0
  });

  const agentActions = [
    {
      title: "My Properties",
      description: "Manage properties assigned to you",
      icon: Home,
      href: createPageUrl("AgentProperties"),
      color: "from-blue-500 to-blue-600",
      count: stats.assignedProperties
    },
    {
      title: "Client Management",
      description: "Track and communicate with your clients",
      icon: Users,
      href: createPageUrl("AgentClients"),
      color: "from-green-500 to-green-600",
      count: stats.activeClients
    },
    {
      title: "Showings & Schedule",
      description: "Manage property showings and appointments",
      icon: Calendar,
      href: createPageUrl("AgentSchedule"),
      color: "from-purple-500 to-purple-600",
      count: stats.scheduledShowings
    },
    {
      title: "Commission Tracker",
      description: "Track earnings and commission payments",
      icon: DollarSign,
      href: createPageUrl("AgentCommissions"),
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Market Analysis",
      description: "Access local market data and trends",
      icon: MapPin,
      href: createPageUrl("AgentMarketData"),
      color: "from-teal-500 to-teal-600"
    },
    {
      title: "Documents & Contracts",
      description: "Manage legal documents and contracts",
      icon: FileText,
      href: createPageUrl("AgentDocuments"),
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Agent Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.full_name}. Manage your properties and clients.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Home className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">AGENT PANEL</span>
          </div>
        </div>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.assignedProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Showings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduledShowings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyCommission}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} to={action.href}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    {action.count !== undefined && action.count > 0 && (
                      <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {action.count}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}