import React from 'react';
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthDebug from '../debug/AuthDebug';

export default function UnauthorizedAccess({ 
  requiredRoles = [], 
  requiredPermissions = [],
  showBackButton = true 
}) {
  const { userRoles, primaryRole, user } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-yellow-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Unauthorized Access</span>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
            
            {requiredRoles.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <strong>Required roles:</strong> {requiredRoles.join(', ')}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Your role:</strong> {primaryRole || 'None'}
                </p>
              </div>
            )}
            
            {requiredPermissions.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  <strong>Required permissions:</strong>
                </p>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  {requiredPermissions.map(permission => (
                    <li key={permission}>• {permission}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to Dashboard
            </Button>
            
            {showBackButton && (
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              If you believe this is an error, please contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information */}
      <AuthDebug />
    </div>
  );
}