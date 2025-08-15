import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function AuthDebug() {
  const { 
    user, 
    userProfile, 
    userRoles, 
    primaryRole, 
    isAuthenticated,
    canAccess,
    hasRole,
    ROLES
  } = useAuth();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Basic Auth Info</h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Role Information</h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
              <p><strong>Primary Role:</strong> {primaryRole || 'None'}</p>
              <p><strong>User Roles Array:</strong> {JSON.stringify(userRoles)}</p>
              <p><strong>User Roles Length:</strong> {userRoles?.length || 0}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Profile Information</h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p><strong>Has Profile:</strong> {userProfile ? 'Yes' : 'No'}</p>
              {userProfile && (
                <>
                  <p><strong>Profile Email:</strong> {userProfile.email || 'None'}</p>
                  <p><strong>Profile Role:</strong> {JSON.stringify(userProfile.role)}</p>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium">Role Tests</h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              {Object.values(ROLES).map(role => (
                <p key={role}>
                  <strong>hasRole('{role}'):</strong> {hasRole(role) ? 'Yes' : 'No'}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium">Access Tests</h3>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <p><strong>canAccess(['User']):</strong> {canAccess(['User']) ? 'Yes' : 'No'}</p>
              <p><strong>canAccess(['User', 'Agent', 'VA', 'Admin']):</strong> {canAccess(['User', 'Agent', 'VA', 'Admin']) ? 'Yes' : 'No'}</p>
              <p><strong>canAccess('User'):</strong> {canAccess('User') ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}