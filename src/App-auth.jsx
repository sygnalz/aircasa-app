import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RoleBasedLayout from './components/layout/RoleBasedLayout';
import LoginPage from './components/auth/LoginPage';
import DashboardRouter from './components/dashboard/DashboardRouter';
import Properties from './pages/Properties';
import AirtableSetupPage from './pages/AirtableSetupPage';
import { 
  ProtectedRoute, 
  AdminRoute, 
  AgentRoute, 
  VARoute, 
  UserRoute 
} from './components/auth/ProtectedRoute';

// Import role-specific dashboards for direct access
import {
  UserDashboard,
  SuperAdminDashboard,
  AgentDashboard,
  VADashboard,
  AIDashboard
} from './components/dashboard/DashboardRouter';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes with role-based layout */}
            <Route path="/*" element={
              <ProtectedRoute fallbackPath="/login">
                <RoleBasedLayout>
                  <Routes>
                    {/* Dashboard routes */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardRouter />} />
                    
                    {/* Direct dashboard access routes */}
                    <Route path="/dashboard/user" element={
                      <UserRoute>
                        <UserDashboard />
                      </UserRoute>
                    } />
                    <Route path="/dashboard/agent" element={
                      <AgentRoute>
                        <AgentDashboard />
                      </AgentRoute>
                    } />
                    <Route path="/dashboard/va" element={
                      <VARoute>
                        <VADashboard />
                      </VARoute>
                    } />
                    <Route path="/dashboard/admin" element={
                      <AdminRoute>
                        <SuperAdminDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/dashboard/ai" element={
                      <ProtectedRoute requiredRoles={['AI', 'Admin']}>
                        <AIDashboard />
                      </ProtectedRoute>
                    } />

                    {/* User routes */}
                    <Route path="/properties" element={
                      <UserRoute>
                        <Properties />
                      </UserRoute>
                    } />

                    {/* Agent routes */}
                    <Route path="/agent/*" element={
                      <AgentRoute>
                        <Routes>
                          <Route path="properties" element={<div>Agent Properties (Coming Soon)</div>} />
                          <Route path="clients" element={<div>Agent Clients (Coming Soon)</div>} />
                          <Route path="schedule" element={<div>Agent Schedule (Coming Soon)</div>} />
                          <Route path="commissions" element={<div>Agent Commissions (Coming Soon)</div>} />
                          <Route path="performance" element={<div>Agent Performance (Coming Soon)</div>} />
                        </Routes>
                      </AgentRoute>
                    } />

                    {/* VA routes */}
                    <Route path="/va/*" element={
                      <VARoute>
                        <Routes>
                          <Route path="conversations" element={<div>VA Conversations (Coming Soon)</div>} />
                          <Route path="support" element={<div>VA Support Queue (Coming Soon)</div>} />
                          <Route path="analytics" element={<div>VA Analytics (Coming Soon)</div>} />
                          <Route path="stats" element={<div>VA Stats (Coming Soon)</div>} />
                        </Routes>
                      </VARoute>
                    } />

                    {/* Admin routes */}
                    <Route path="/admin/*" element={
                      <AdminRoute>
                        <Routes>
                          <Route path="users" element={<div>Admin User Management (Coming Soon)</div>} />
                          <Route path="properties" element={<div>Admin Properties (Coming Soon)</div>} />
                          <Route path="conversations" element={<div>Admin Conversations (Coming Soon)</div>} />
                          <Route path="analytics" element={<div>Admin Analytics (Coming Soon)</div>} />
                          <Route path="agents" element={<div>Admin Agent Management (Coming Soon)</div>} />
                          <Route path="vas" element={<div>Admin VA Management (Coming Soon)</div>} />
                          <Route path="settings" element={<div>Admin Settings (Coming Soon)</div>} />
                          <Route path="system" element={<div>System Status (Coming Soon)</div>} />
                        </Routes>
                      </AdminRoute>
                    } />

                    {/* AI routes */}
                    <Route path="/ai/*" element={
                      <ProtectedRoute requiredRoles={['AI', 'Admin']}>
                        <Routes>
                          <Route path="data" element={<div>AI Data Access (Coming Soon)</div>} />
                          <Route path="sessions" element={<div>AI Active Sessions (Coming Soon)</div>} />
                          <Route path="permissions" element={<div>AI Permissions (Coming Soon)</div>} />
                        </Routes>
                      </ProtectedRoute>
                    } />

                    {/* Airtable setup (Admin only) */}
                    <Route path="/airtable-setup" element={
                      <AdminRoute>
                        <AirtableSetupPage />
                      </AdminRoute>
                    } />

                    {/* Profile and settings */}
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <div>User Profile (Coming Soon)</div>
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <div>User Settings (Coming Soon)</div>
                      </ProtectedRoute>
                    } />

                    {/* Conversations */}
                    <Route path="/conversations" element={
                      <ProtectedRoute>
                        <div>Conversations (Coming Soon)</div>
                      </ProtectedRoute>
                    } />

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </RoleBasedLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;