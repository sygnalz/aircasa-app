import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Eye, 
  EyeOff, 
  Github, 
  Mail, 
  Loader2,
  Shield,
  User,
  UserCheck,
  Headphones,
  Settings,
  Bot
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { 
    signIn, 
    signInWithOAuth, 
    signInAsRole, 
    loading, 
    error, 
    isAuthenticated,
    isDemoMode,
    ROLES 
  } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    const result = await signIn(email, password);
    
    if (!result.success) {
      setAuthError(result.error?.message || 'Sign in failed');
    }
    
    setIsSubmitting(false);
  };

  const handleOAuthSignIn = async (provider) => {
    setAuthError('');
    const result = await signInWithOAuth(provider);
    
    if (!result.success) {
      setAuthError(result.error?.message || `${provider} sign in failed`);
    }
  };

  const handleDemoSignIn = async (role) => {
    setAuthError('');
    const result = await signInAsRole(role);
    
    if (!result.success) {
      setAuthError(result.error?.message || 'Demo sign in failed');
    }
  };

  const demoRoles = [
    {
      role: ROLES.USER,
      icon: User,
      title: 'User Dashboard',
      description: 'Standard user experience with property management',
      color: 'from-blue-500 to-blue-600'
    },
    {
      role: ROLES.AGENT,
      icon: UserCheck,
      title: 'Agent Dashboard', 
      description: 'Real estate agent tools and client management',
      color: 'from-green-500 to-green-600'
    },
    {
      role: ROLES.VA,
      icon: Headphones,
      title: 'VA Dashboard',
      description: 'Virtual assistant conversation management',
      color: 'from-purple-500 to-purple-600'
    },
    {
      role: ROLES.ADMIN,
      icon: Settings,
      title: 'Admin Dashboard',
      description: 'Full system administration and management',
      color: 'from-red-500 to-red-600'
    },
    {
      role: ROLES.AI,
      icon: Bot,
      title: 'AI Dashboard',
      description: 'AI system access and data layer',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600 text-white mx-auto mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AirCasa</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <Alert className="border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Demo Mode:</strong> Choose a role below to explore different dashboards
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {(error || authError) && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error || authError}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">
              {isDemoMode ? 'Choose Your Role' : 'Sign In'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Demo Role Selection */}
            {isDemoMode ? (
              <div className="space-y-3">
                {demoRoles.map(({ role, icon: Icon, title, description, color }) => (
                  <Button
                    key={role}
                    onClick={() => handleDemoSignIn(role)}
                    disabled={loading}
                    className="w-full h-auto p-4 flex items-start space-x-3 bg-white hover:bg-gray-50 border border-gray-200 text-left"
                    variant="outline"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${color} flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{title}</div>
                      <div className="text-sm text-gray-600 mt-1">{description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <>
                {/* Email/Password Sign In */}
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        disabled={isSubmitting}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <Separator />

                {/* OAuth Sign In */}
                <div className="space-y-2">
                  <Button
                    onClick={() => handleOAuthSignIn('google')}
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Continue with Google
                  </Button>
                  
                  <Button
                    onClick={() => handleOAuthSignIn('github')}
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Continue with GitHub
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            {isDemoMode 
              ? 'Demo mode - explore different role experiences'
              : 'New to AirCasa? Contact your administrator for access.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}