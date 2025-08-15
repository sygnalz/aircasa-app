import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Calendar, TrendingUp, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
// Utility function for creating page URLs
const createPageUrl = (pageName) => {
  return '/' + pageName.toLowerCase().replace(/ /g, '-');
};

export default function VADashboard({ user }) {
  const [stats, setStats] = useState({
    todayConversations: 0,
    activeChats: 0,
    avgResponseTime: "2.3m",
    satisfactionRate: "98%"
  });

  const vaActions = [
    {
      title: "Active Conversations",
      description: "Monitor and assist with ongoing user conversations",
      icon: MessageSquare,
      href: createPageUrl("VAConversations"),
      color: "from-blue-500 to-blue-600",
      count: stats.activeChats
    },
    {
      title: "User Support Queue",
      description: "Handle user support requests and escalations",
      icon: HeadphonesIcon,
      href: createPageUrl("VASupportQueue"),
      color: "from-green-500 to-green-600",
      count: 3
    },
    {
      title: "Conversation Analytics",
      description: "Review conversation patterns and user feedback",
      icon: TrendingUp,
      href: createPageUrl("VAAnalytics"),
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Schedule Management",
      description: "Manage appointments and follow-ups",
      icon: Calendar,
      href: createPageUrl("VASchedule"),
      color: "from-orange-500 to-orange-600",
      count: 8
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Virtual Assistant Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.full_name}. Support users and monitor conversations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <HeadphonesIcon className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-green-600">VA PANEL</span>
          </div>
        </div>
      </div>

      {/* VA Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Chats</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeChats}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <HeadphonesIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VA Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vaActions.map((action, index) => {
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
                    {action.count && (
                      <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
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