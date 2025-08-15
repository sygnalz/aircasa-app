import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AppLayout } from './AppLayout';

// Navigation items based on roles
const getNavigationItems = (role, permissions) => {
  const baseItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'Home',
      description: 'Overview and key metrics'
    }
  ];

  const roleBasedItems = {
    User: [
      {
        name: 'My Properties',
        href: '/properties',
        icon: 'Building',
        description: 'Your property listings'
      },
      {
        name: 'Conversations',
        href: '/conversations',
        icon: 'MessageSquare',
        description: 'Chat with Casa AI'
      }
    ],
    Agent: [
      {
        name: 'My Properties',
        href: '/agent/properties',
        icon: 'Building',
        description: 'Assigned properties'
      },
      {
        name: 'Clients',
        href: '/agent/clients',
        icon: 'Users',
        description: 'Client management'
      },
      {
        name: 'Schedule',
        href: '/agent/schedule',
        icon: 'Calendar',
        description: 'Showings & appointments'
      },
      {
        name: 'Commissions',
        href: '/agent/commissions',
        icon: 'DollarSign',
        description: 'Earnings tracker'
      }
    ],
    VA: [
      {
        name: 'Conversations',
        href: '/va/conversations',
        icon: 'MessageSquare',
        description: 'Monitor active chats'
      },
      {
        name: 'Support Queue',
        href: '/va/support',
        icon: 'Headphones', 
        description: 'User support requests'
      },
      {
        name: 'Analytics',
        href: '/va/analytics',
        icon: 'TrendingUp',
        description: 'Conversation insights'
      }
    ],
    Admin: [
      {
        name: 'User Management',
        href: '/admin/users',
        icon: 'Users',
        description: 'Manage all users'
      },
      {
        name: 'All Properties',
        href: '/admin/properties',
        icon: 'Building',
        description: 'System-wide properties'
      },
      {
        name: 'Conversations',
        href: '/admin/conversations', 
        icon: 'MessageSquare',
        description: 'All chat logs'
      },
      {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: 'BarChart',
        description: 'System analytics'
      },
      {
        name: 'Agents',
        href: '/admin/agents',
        icon: 'UserCheck', 
        description: 'Manage agents'
      },
      {
        name: 'VAs',
        href: '/admin/vas',
        icon: 'Headphones',
        description: 'Manage VAs'
      },
      {
        name: 'Settings',
        href: '/admin/settings',
        icon: 'Settings',
        description: 'System configuration'
      }
    ],
    AI: [
      {
        name: 'Data Access',
        href: '/ai/data',
        icon: 'Database',
        description: 'User & property data'
      },
      {
        name: 'Active Sessions',
        href: '/ai/sessions',
        icon: 'Activity',
        description: 'Live conversations'
      },
      {
        name: 'Permissions',
        href: '/ai/permissions',
        icon: 'Shield',
        description: 'Access control'
      }
    ]
  };

  const items = [...baseItems];
  
  if (roleBasedItems[role]) {
    items.push(...roleBasedItems[role]);
  }

  // Add Airtable setup for admins
  if (role === 'Admin') {
    items.push({
      name: 'Airtable Setup',
      href: '/airtable-setup',
      icon: 'Database',
      description: 'Database configuration'
    });
  }

  return items;
};

// User menu items based on role
const getUserMenuItems = (role, signOut) => {
  const baseItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: 'User'
    },
    {
      name: 'Settings', 
      href: '/settings',
      icon: 'Settings'
    }
  ];

  const roleItems = {
    Admin: [
      {
        name: 'System Status',
        href: '/admin/system',
        icon: 'Activity'
      }
    ],
    Agent: [
      {
        name: 'My Performance',
        href: '/agent/performance',
        icon: 'TrendingUp'
      }
    ],
    VA: [
      {
        name: 'My Stats',
        href: '/va/stats', 
        icon: 'BarChart'
      }
    ]
  };

  const items = [...baseItems];
  
  if (roleItems[role]) {
    items.push(...roleItems[role]);
  }

  items.push({
    name: 'Sign Out',
    action: signOut,
    icon: 'LogOut'
  });

  return items;
};

export default function RoleBasedLayout({ children }) {
  const { 
    user, 
    userProfile, 
    primaryRole, 
    signOut, 
    hasPermission,
    isAuthenticated 
  } = useAuth();

  if (!isAuthenticated) {
    return children;
  }

  // Create enhanced user object for AppLayout
  const layoutUser = {
    ...user,
    user_metadata: {
      ...user?.user_metadata,
      full_name: user?.user_metadata?.full_name || userProfile?.fullName || 'User',
      role: primaryRole,
      avatar_url: user?.user_metadata?.avatar_url || userProfile?.avatar_url
    }
  };

  // Get role-specific navigation
  const navigationItems = getNavigationItems(primaryRole, {
    canViewAllProperties: hasPermission('canViewAllProperties'),
    canManageUsers: hasPermission('canManageUsers'),
    canViewAnalytics: hasPermission('canViewAnalytics')
  });

  const userMenuItems = getUserMenuItems(primaryRole, signOut);

  // Create layout props
  const layoutProps = {
    user: layoutUser,
    navigationItems,
    userMenuItems,
    roleInfo: {
      role: primaryRole,
      displayName: getRoleDisplayName(primaryRole),
      color: getRoleColor(primaryRole)
    }
  };

  return (
    <AppLayout {...layoutProps}>
      {children}
    </AppLayout>
  );
}

// Helper functions
function getRoleDisplayName(role) {
  const displayNames = {
    User: 'User',
    Agent: 'Real Estate Agent',
    VA: 'Virtual Assistant', 
    Admin: 'Administrator',
    AI: 'AI System'
  };
  
  return displayNames[role] || role;
}

function getRoleColor(role) {
  const colors = {
    User: 'blue',
    Agent: 'green',
    VA: 'purple',
    Admin: 'red',
    AI: 'indigo'
  };
  
  return colors[role] || 'gray';
}