import React, { useState, Fragment } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Removed Sheet import - no longer needed without sidebar
import {
  Home,
  Building2,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  User,
  Bell,
  Search,
} from 'lucide-react';

// Dynamic navigation based on role (passed as props)
const getIconComponent = (iconName) => {
  const icons = {
    Home,
    Building: Building2,
    Building2,
    BarChart3,
    Settings,
    User,
    Bell,
    Search,
    Menu,
    LogOut
  };
  return icons[iconName] || Home;
};

export function AppLayout({ user, navigationItems, userMenuItems, roleInfo, children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const NavLink = ({ item }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    
    return (
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          'justify-start gap-2 h-9 px-3',
          isActive && 'bg-primary/10 text-primary'
        )}
        onClick={() => navigate(item.href)}
      >
        <Icon className="h-4 w-4" />
        {item.name}
      </Button>
    );
  };

  // Simplified header navigation (no sidebar)
  const HeaderNavigation = () => (
    <div className="flex items-center gap-4">
      {navigationItems && navigationItems.slice(1).map((item) => { // Skip Dashboard since logo goes there
        const ItemIcon = getIconComponent(item.icon);
        return (
          <NavLink key={item.name} item={{...item, icon: ItemIcon}} />
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header-Only Layout */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Logo - Clickable to Dashboard */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold text-primary">AirCasa</span>
          </button>
        </div>

        {/* Navigation Links */}
        <HeaderNavigation />

        {/* Search */}
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="relative flex flex-1 items-center max-w-md">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search properties..."
              className="block w-full rounded-md border-0 bg-muted/50 py-1.5 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all"
            />
          </div>
        </div>

        {/* User Info & Profile */}
        <div className="flex items-center gap-x-4">
          {/* User Details */}
          <div className="hidden md:flex flex-col items-end">
            <p className="text-sm font-medium">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
          
          {/* Role Badge */}
          {roleInfo && (
            <div className={`hidden sm:block px-2 py-1 rounded-full text-xs font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-800`}>
              {roleInfo.displayName}
            </div>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {roleInfo && (
                    <p className={`text-xs font-medium text-${roleInfo.color}-600`}>
                      {roleInfo.displayName}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userMenuItems && userMenuItems.map((item, index) => {
                const ItemIcon = getIconComponent(item.icon);
                return (
                  <Fragment key={item.name}>
                    <DropdownMenuItem 
                      onClick={item.action ? item.action : () => navigate(item.href)}
                    >
                      <ItemIcon className="mr-2 h-4 w-4" />
                      {item.name}
                    </DropdownMenuItem>
                    {item.name === 'Settings' && <DropdownMenuSeparator />}
                  </Fragment>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <main className="py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}

export default AppLayout;
