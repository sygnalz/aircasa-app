
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, MessageSquare, Search, User as UserIcon, Bot, Calendar, ChevronRight } from "lucide-react";
import { getConversationUserSummaries } from "@/api/functions";

export default function AdminConversations() {
  const [userSummaries, setUserSummaries] = useState([]);
  const [filteredSummaries, setFilteredSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    filterSummaries();
  }, [userSummaries, searchTerm]);

  const checkAdminAccess = async () => {
    try {
      const user = await User.me();
      if (!user || user.role !== 'admin') {
        navigate(createPageUrl("Dashboard"), { replace: true });
        return;
      }
      loadUserSummaries();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate(createPageUrl("Auth"), { replace: true });
    }
  };

  const loadUserSummaries = async () => {
    setIsLoading(true);
    try {
      const response = await getConversationUserSummaries();
      console.log("Response from getConversationUserSummaries:", response); // Debug log
      if (response.status === 200 && response.data.success) {
        console.log("User summaries data:", response.data.data); // Debug log
        setUserSummaries(response.data.data);
      } else {
        throw new Error(response.data.error || "Failed to load summaries.");
      }
    } catch (error) {
      console.error("Error loading conversation summaries:", error);
      alert("Failed to load conversation summaries. Please try again.");
      setUserSummaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSummaries = () => {
    let filtered = userSummaries;
    if (searchTerm) {
      filtered = filtered.filter(summary => 
        summary.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        summary.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredSummaries(filtered);
  };

  const handleViewDetails = (summary) => {
    const url = createPageUrl(`AdminUserConversations?userId=${summary.appOwnerUserId}&email=${encodeURIComponent(summary.email)}&name=${encodeURIComponent(summary.name)}`);
    navigate(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-white">Loading user summaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
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
                <h1 className="text-3xl font-bold text-white">Conversation Logs</h1>
                <p className="text-gray-400">Monitor AI-user interactions by user</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{filteredSummaries.length} Users</span>
            </div>
          </div>
        </div>

        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredSummaries.length > 0 ? (
            filteredSummaries.map((summary) => {
              console.log("Rendering summary:", summary); // Debug log
              return (
                <Card key={summary.airtableUserId} className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {summary.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {summary.email || 'No email available'}
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-8 text-sm text-gray-300">
                      <div className="text-center">
                        <p className="font-bold text-lg text-white">{summary.threadCount || 0}</p>
                        <p className="text-gray-400">Threads</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg text-white">{summary.messageCount || 0}</p>
                        <p className="text-gray-400">Messages</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Last Active</p>
                        <p className="text-gray-400">
                          {summary.lastMessageTimestamp ? formatDate(summary.lastMessageTimestamp) : 'No activity'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(summary)}>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Conversations Found</h3>
                <p className="text-gray-400">No users match your current search, or no conversations have occurred yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
