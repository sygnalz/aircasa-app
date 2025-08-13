import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Search, Home, Building, DollarSign, Users, Calendar, TrendingUp } from "lucide-react";

export default function AdminManageAgents() {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm]);

  const checkAdminAccess = async () => {
    try {
      const user = await User.me();
      if (!user || user.role !== 'admin') {
        navigate(createPageUrl("Dashboard"), { replace: true });
        return;
      }
      loadAgents();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/auth", { replace: true });
    }
  };

  const loadAgents = async () => {
    try {
      const allUsers = await User.list();
      // Filter users who have the 'agent' extended_role
      const agentUsers = (allUsers || []).filter(user => user.extended_role === 'agent');
      setAgents(agentUsers);
    } catch (error) {
      console.error("Error loading Agents:", error);
      alert("Failed to load Real Estate Agents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = agents;

    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAgents(filtered);
  };

  // Mock function to generate random performance data for demo
  const generateMockPerformance = (agentId) => {
    const seed = agentId.length; // Simple seed based on ID
    return {
      activeProperties: Math.floor(seed % 8) + 1,
      closedDeals: Math.floor(seed % 15) + 2,
      avgDaysOnMarket: Math.floor(seed % 30) + 25,
      totalCommission: (seed % 50000) + 25000
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-white">Loading Real Estate Agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("AdminPanel"))}
                className="flex items-center gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin Panel
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">Manage Real Estate Agents</h1>
                <p className="text-gray-400">Monitor agent performance and property assignments</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{filteredAgents.length}</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search agents by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agents List */}
        <div className="grid gap-4">
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => {
              const performance = generateMockPerformance(agent.id);
              
              return (
                <Card key={agent.id} className="bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {agent.full_name?.charAt(0)?.toUpperCase() || agent.email?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {agent.full_name || 'No Name'}
                          </h3>
                          <p className="text-gray-400">{agent.email}</p>
                          <p className="text-sm text-gray-500">
                            Joined {new Date(agent.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Performance Stats */}
                        <div className="hidden lg:flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-blue-400">
                              <Home className="w-4 h-4" />
                              <span className="font-semibold">{performance.activeProperties}</span>
                            </div>
                            <p className="text-gray-500 text-xs">Active Properties</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-green-400">
                              <TrendingUp className="w-4 h-4" />
                              <span className="font-semibold">{performance.closedDeals}</span>
                            </div>
                            <p className="text-gray-500 text-xs">Closed Deals</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-purple-400">
                              <Calendar className="w-4 h-4" />
                              <span className="font-semibold">{performance.avgDaysOnMarket}d</span>
                            </div>
                            <p className="text-gray-500 text-xs">Avg DOM</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-orange-400">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-semibold">${(performance.totalCommission / 1000).toFixed(0)}K</span>
                            </div>
                            <p className="text-gray-500 text-xs">YTD Commission</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            AGENT
                          </Badge>

                          {/* Mock Status Badge */}
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>

                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                            onClick={() => navigate(createPageUrl("AgentProperties") + `?agent_id=${agent.id}`)}
                          >
                            View Portfolio
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Performance Stats */}
                    <div className="lg:hidden mt-4 pt-4 border-t border-slate-700">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                            <Home className="w-4 h-4" />
                            <span className="font-semibold">{performance.activeProperties}</span>
                          </div>
                          <p className="text-gray-500 text-xs">Active Properties</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-semibold">{performance.closedDeals}</span>
                          </div>
                          <p className="text-gray-500 text-xs">Closed Deals</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold">{performance.avgDaysOnMarket}d</span>
                          </div>
                          <p className="text-gray-500 text-xs">Avg DOM</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">${(performance.totalCommission / 1000).toFixed(0)}K</span>
                          </div>
                          <p className="text-gray-500 text-xs">YTD Commission</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Real Estate Agents Found</h3>
                <p className="text-gray-400">
                  {searchTerm 
                    ? "No agents match your search criteria." 
                    : "No users have been assigned the Real Estate Agent role yet."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}