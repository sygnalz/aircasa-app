import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PropertiesPageMinimal() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('🔄 Properties page rendering...', { user: user?.email, isAuthenticated });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground">
            Manage your rental properties and track their performance
          </p>
          {user?.email && (
            <p className="text-sm text-muted-foreground">
              Showing properties for: {user.email}
            </p>
          )}
        </div>
      </div>

      {/* Test Card */}
      <Card>
        <CardHeader>
          <CardTitle>Properties Page Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Status:</strong> Page loaded successfully! ✅</p>
            <p><strong>User:</strong> {user?.email || 'Not found'}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Future: Properties will be loaded here */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-medium">Properties Loading...</h3>
              <p className="text-muted-foreground">
                This is a minimal test version to verify page rendering works.
              </p>
            </div>
            <Button onClick={() => console.log('Button clicked!')}>
              Test Button
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}