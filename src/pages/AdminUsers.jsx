
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Users, Search, UserCheck, UserX, Crown, Headphones, Home } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const checkAdminAccess = async () => {
    try {
      const user = await User.me();
      if (!user || user.role !== 'admin') {
        navigate(createPageUrl("Dashboard"), { replace: true });
        return;
      }
      setCurrentUser(user);
      loadUsers();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/auth", { replace: true });
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await User.list();
      setUsers(allUsers || []);
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => getUserDisplayRole(user) === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser.id && newRole !== 'admin') {
      alert("You cannot remove admin privileges from your own account.");
      return;
    }

    try {
      // Handle Base44's built-in role field (only supports 'user' and 'admin')
      const base44Role = (newRole === 'admin') ? 'admin' : 'user';

      // Update both the built-in role and our extended_role field
      await User.update(userId, {
        role: base44Role,
        extended_role: newRole
      });

      setUsers(prev => prev.map(user =>
        user.id === userId ? {
          ...user,
          role: base44Role,
          extended_role: newRole,
          // For display purposes, use extended_role as the primary role
          display_role: newRole // This can be added to the user object directly, or derived via getUserDisplayRole
        } : user
      ));
      alert(`User role updated to ${newRole.toUpperCase()}`);
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role. Please try again.");
    }
  };

  const getUserDisplayRole = (user) => {
    // Use extended_role if available, otherwise fall back to built-in role
    return user.extended_role || user.role || 'user';
  };

  const getRoleIcon = (user) => {
    const displayRole = getUserDisplayRole(user);
    switch (displayRole) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'va': return <Headphones className="w-4 h-4" />;
      case 'agent': return <Home className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (user) => {
    const displayRole = getUserDisplayRole(user);
    switch (displayRole) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'va': return 'bg-green-100 text-green-800';
      case 'agent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-white">Loading users...</p>
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
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <p className="text-gray-400">Manage user accounts, roles, and permissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{filteredUsers.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="agent">Agents</SelectItem>
                  <SelectItem value="va">Virtual Assistants</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card key={user.id} className="bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {user.full_name || 'No Name'}
                        </h3>
                        <p className="text-gray-400">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Joined {new Date(user.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Badge className={`${getRoleBadgeColor(user)} flex items-center gap-1`}>
                        {getRoleIcon(user)}
                        {getUserDisplayRole(user).toUpperCase()}
                      </Badge>

                      <Select
                        value={getUserDisplayRole(user)}
                        onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                        disabled={user.id === currentUser?.id}
                      >
                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="va">VA</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      {user.id === currentUser?.id && (
                        <Badge className="bg-yellow-100 text-yellow-800">You</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Users Found</h3>
                <p className="text-gray-400">No users match your current filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
