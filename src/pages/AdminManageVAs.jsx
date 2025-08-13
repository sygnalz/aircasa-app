import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Search, HeadphonesIcon, MessageSquare, Clock, CheckCircle, XCircle, UserCheck } from "lucide-react";

export default function AdminManageVAs() {
  const [vas, setVAs] = useState([]);
  const [filteredVAs, setFilteredVAs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    filterVAs();
  }, [vas, searchTerm]);

  const checkAdminAccess = async () => {
    try {
      const user = await User.me();
      if (!user || user.role !== 'admin') {
        navigate(createPageUrl("Dashboard"), { replace: true });
        return;
      }
      loadVAs();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate(createPageUrl("Auth"), { replace: true });
    }
  };

  const loadVAs = async () => {
    try {
      const allUsers = await User.list();
      // Filter users who have the 'va' extended_role
      const vaUsers = (allUsers || []).filter(user => user.extended_role === 'va');
      setVAs(vaUsers);
    } catch (error) {
      console.error("Error loading VAs:", error);
      alert("Failed to load Virtual Assistants. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterVAs = () => {
    let filtered = vas;

    if (searchTerm) {
      filtered = filtered.filter(va =>
        va.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        va.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVAs(filtered);
  };

  const handleStatusToggle = async (vaId, currentStatus) => {
    // For now, we'll simulate status toggle - in a real implementation,
    // this would update a status field in the user record
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      // Update local state for immediate feedback
      setVAs(prev => prev.map(va =>
        va.id === vaId ? { ...va, status: newStatus } : va
      ));
      alert(`VA status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating VA status:", error);
      alert("Failed to update VA status. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-white">Loading Virtual Assistants...</p>
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
                <h1 className="text-3xl font-bold text-white">Manage Virtual Assistants</h1>
                <p className="text-gray-400">Oversee VA performance and assign tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HeadphonesIcon className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-400">{filteredVAs.length}</span>
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
                    placeholder="Search VAs by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VAs List */}
        <div className="grid gap-4">
          {filteredVAs.length > 0 ? (
            filteredVAs.map((va) => (
              <Card key={va.id} className="bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {va.full_name?.charAt(0)?.toUpperCase() || va.email?.charAt(0)?.toUpperCase() || 'V'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {va.full_name || 'No Name'}
                        </h3>
                        <p className="text-gray-400">{va.email}</p>
                        <p className="text-sm text-gray-500">
                          Joined {new Date(va.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Mock Performance Stats */}
                      <div className="hidden md:flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-blue-400">
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-semibold">12</span>
                          </div>
                          <p className="text-gray-500 text-xs">Active Chats</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-green-400">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">2.3m</span>
                          </div>
                          <p className="text-gray-500 text-xs">Avg Response</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-purple-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-semibold">98%</span>
                          </div>
                          <p className="text-gray-500 text-xs">Satisfaction</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                          <HeadphonesIcon className="w-3 h-3" />
                          VA
                        </Badge>

                        {/* Mock Status Badge */}
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>

                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                          onClick={() => navigate(createPageUrl("VAConversations") + `?va_id=${va.id}`)}
                        >
                          View Tasks
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <HeadphonesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Virtual Assistants Found</h3>
                <p className="text-gray-400">
                  {searchTerm 
                    ? "No VAs match your search criteria." 
                    : "No users have been assigned the Virtual Assistant role yet."
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