// User-specific API functions for personalized data access
import { userAPI } from './userFunctions';
import { 
  transformUserProperty, 
  transformUserProfile, 
  transformUserDashboardStats 
} from '../lib/userDataTransformers';

// User-specific property access
export const userSpecificAPI = {
  // Get properties for a specific user (by email or user ID)
  async getUserProperties(userEmail, userId = null) {
    try {
      console.log(`🏠 Fetching properties for user: ${userEmail} (ID: ${userId})`);
      
      // First try to get properties by user ID if available
      if (userId) {
        try {
          console.log(`🔍 Trying to fetch properties by user ID: ${userId}`);
          const userPropertiesByID = await userAPI.properties.getByUserId(userId);
          if (userPropertiesByID && userPropertiesByID.length > 0) {
            console.log(`✅ Found ${userPropertiesByID.length} properties by user ID`);
            return userPropertiesByID;
          }
        } catch (idError) {
          console.warn('Failed to fetch by user ID, trying alternative method:', idError.message);
        }
      }
      
      // Fallback: Get all properties and filter by user (client-side filtering)
      console.log('🔄 Fetching all properties for client-side filtering...');
      const allProperties = await userAPI.properties.getAll();
      
      // Filter properties that belong to this user
      const userProperties = allProperties.filter(property => {
        console.log('🔍 Checking property:', {
          id: property.id,
          title: property.title,
          ownerEmail: property.ownerEmail,
          app_email: property.app_email,
          app_owner_user_id: property.app_owner_user_id,
          checkingAgainst: { userEmail, userId }
        });
        
        const matchesEmail = (
          property.ownerEmail === userEmail ||
          property.app_email === userEmail ||
          property.email === userEmail
        );
        
        const matchesUserId = userId && (
          property.ownerUserId === userId ||
          property.app_owner_user_id === userId ||
          property.user_id === userId
        );
        
        const isMatch = matchesEmail || matchesUserId;
        if (isMatch) {
          console.log('✅ Found matching property:', property.title, 'for user:', userEmail);
        }
        
        return isMatch;
      });
      
      console.log(`✅ Found ${userProperties.length} properties for user ${userEmail} via client-side filtering`);
      return userProperties;
      
    } catch (error) {
      console.error('Error fetching user properties:', error);
      // Return empty array instead of throwing to prevent page crashes
      return [];
    }
  },

  // Get dashboard stats for a specific user
  async getUserDashboardStats(userEmail, userId = null) {
    try {
      console.log(`📊 Generating dashboard stats for user: ${userEmail}`);
      
      // Get user's properties
      const userProperties = await this.getUserProperties(userEmail, userId);
      
      // Get user's conversations
      const userConversations = await userAPI.conversations.getByUserId(userId);
      
      // Generate user-specific stats
      const stats = {
        totalProperties: userProperties.length,
        totalConversations: userConversations.length,
        
        // Property completion stats
        completedIntakes: userProperties.filter(p => p.propertyIntakeCompleted).length,
        completedConsultations: userProperties.filter(p => p.consultationCompleted).length,
        completedPhotos: userProperties.filter(p => p.photosCompleted).length,
        
        // Financial stats
        totalEstimatedValue: userProperties
          .filter(p => p.estimatedValue)
          .reduce((sum, p) => sum + p.estimatedValue, 0),
        
        averageEstimatedValue: userProperties.length > 0 
          ? userProperties
              .filter(p => p.estimatedValue)
              .reduce((sum, p) => sum + p.estimatedValue, 0) / 
            Math.max(userProperties.filter(p => p.estimatedValue).length, 1)
          : 0,
        
        // Task tracking
        propertiesWithTasks: userProperties.filter(p => p.incompleteTasks).length,
        totalIncompleteTasks: userProperties
          .map(p => p.incompleteTasks || '')
          .filter(Boolean)
          .join('\n')
          .split('\n')
          .filter(Boolean).length,
        
        // Property status breakdown
        propertiesByStatus: this.groupPropertiesByStatus(userProperties),
        
        // Recent activity
        recentProperties: userProperties
          .sort((a, b) => new Date(b._createdTime) - new Date(a._createdTime))
          .slice(0, 5),
        
        recentConversations: userConversations.slice(0, 5)
      };
      
      console.log(`✅ Generated stats for user ${userEmail}:`, stats);
      return stats;
      
    } catch (error) {
      console.error('Error generating user dashboard stats:', error);
      return this.getDefaultUserStats();
    }
  },

  // Group properties by status for charts/analytics
  groupPropertiesByStatus(properties) {
    const statusGroups = {};
    
    properties.forEach(property => {
      const status = property.status || 'Unknown';
      statusGroups[status] = (statusGroups[status] || 0) + 1;
    });
    
    return statusGroups;
  },

  // Get default stats for new users or error cases
  getDefaultUserStats() {
    return {
      totalProperties: 0,
      totalConversations: 0,
      completedIntakes: 0,
      completedConsultations: 0,
      completedPhotos: 0,
      totalEstimatedValue: 0,
      averageEstimatedValue: 0,
      propertiesWithTasks: 0,
      totalIncompleteTasks: 0,
      propertiesByStatus: {},
      recentProperties: [],
      recentConversations: []
    };
  },

  // Check if user has admin access
  async checkAdminAccess(userEmail, userId = null) {
    try {
      console.log(`🔐 Checking admin access for user: ${userEmail}`);
      
      // Get user profile from Airtable
      let userProfile = null;
      
      // Try to find by email first
      const users = await userAPI.users.getAll();
      userProfile = users.find(u => u.email === userEmail);
      
      // If not found by email, try by user ID
      if (!userProfile && userId) {
        userProfile = await userAPI.users.getByOwnerUserId(userId);
      }
      
      if (!userProfile) {
        console.log(`⚠️ No profile found for user ${userEmail}`);
        return { hasAdminAccess: false, roles: ['User'] };
      }
      
      // Check roles
      const roles = Array.isArray(userProfile.role) ? userProfile.role : [userProfile.role].filter(Boolean);
      const hasAdminAccess = roles.includes('Admin');
      
      console.log(`✅ User ${userEmail} roles:`, roles, 'Admin access:', hasAdminAccess);
      
      return {
        hasAdminAccess,
        roles,
        userProfile,
        isAgent: roles.includes('Agent'),
        isVA: roles.includes('VA'),
        isAI: roles.includes('AI')
      };
      
    } catch (error) {
      console.error('Error checking admin access:', error);
      return { hasAdminAccess: false, roles: ['User'] };
    }
  },

  // Get user-specific quick actions based on their properties and role
  async getUserQuickActions(userEmail, userId = null) {
    try {
      const userProperties = await this.getUserProperties(userEmail, userId);
      const { hasAdminAccess, roles } = await this.checkAdminAccess(userEmail, userId);
      
      const actions = [];
      
      // Property-related actions
      if (userProperties.length > 0) {
        // Properties with incomplete intakes
        const incompleteIntakes = userProperties.filter(p => !p.propertyIntakeCompleted);
        if (incompleteIntakes.length > 0) {
          actions.push({
            type: 'complete_intake',
            title: 'Complete Property Intakes',
            description: `${incompleteIntakes.length} properties need intake completion`,
            count: incompleteIntakes.length,
            href: '/properties?filter=incomplete_intake',
            color: 'orange'
          });
        }
        
        // Properties with tasks
        const propertiesWithTasks = userProperties.filter(p => p.incompleteTasks);
        if (propertiesWithTasks.length > 0) {
          actions.push({
            type: 'complete_tasks',
            title: 'Complete Property Tasks',
            description: `${propertiesWithTasks.length} properties have pending tasks`,
            count: propertiesWithTasks.length,
            href: '/properties?filter=has_tasks',
            color: 'blue'
          });
        }
        
        // Schedule consultations
        const needsConsultation = userProperties.filter(p => !p.consultationCompleted);
        if (needsConsultation.length > 0) {
          actions.push({
            type: 'schedule_consultation',
            title: 'Schedule Consultations',
            description: `${needsConsultation.length} properties need consultation`,
            count: needsConsultation.length,
            href: '/properties?filter=needs_consultation',
            color: 'green'
          });
        }
      } else {
        // New user actions
        actions.push({
          type: 'add_property',
          title: 'Add Your First Property',
          description: 'Get started by adding your property details',
          href: '/properties/add',
          color: 'blue'
        });
      }
      
      // Role-specific actions
      if (hasAdminAccess) {
        actions.push({
          type: 'admin_access',
          title: 'Admin Dashboard',
          description: 'Access system administration tools',
          href: '/dashboard/admin',
          color: 'red',
          icon: 'Shield'
        });
      }
      
      if (roles.includes('Agent')) {
        actions.push({
          type: 'agent_tools',
          title: 'Agent Tools',
          description: 'Access real estate agent dashboard',
          href: '/dashboard/agent',
          color: 'green',
          icon: 'Briefcase'
        });
      }
      
      if (roles.includes('VA')) {
        actions.push({
          type: 'va_tools',
          title: 'VA Dashboard', 
          description: 'Monitor conversations and support',
          href: '/dashboard/va',
          color: 'purple',
          icon: 'Headphones'
        });
      }
      
      return actions;
      
    } catch (error) {
      console.error('Error getting user quick actions:', error);
      return [{
        type: 'add_property',
        title: 'Add Your First Property',
        description: 'Get started by adding your property details',
        href: '/properties/add',
        color: 'blue'
      }];
    }
  },

  // Create or update user profile in Airtable when they first log in
  async ensureUserProfile(authUser) {
    try {
      console.log(`👤 Ensuring user profile exists for: ${authUser.email}`);
      
      // Check if user already exists
      const users = await userAPI.users.getAll();
      let existingUser = users.find(u => u.email === authUser.email);
      
      if (existingUser) {
        console.log(`✅ User profile exists for ${authUser.email}`);
        return existingUser;
      }
      
      // Create new user profile
      console.log(`📝 Creating new user profile for ${authUser.email}`);
      
      const newUserData = {
        app_owner_user_id: authUser.id,
        email: authUser.email,
        first_name: authUser.user_metadata?.full_name?.split(' ')[0] || 'User',
        last_name: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        role: ['User'], // Default role
        referral_id: null
      };
      
      // Note: In a real scenario, you might want to use Supabase functions
      // to create Airtable records server-side for security
      console.log('ℹ️ New user would be created with data:', newUserData);
      console.log('📝 In production, use Supabase functions to create Airtable records');
      
      // For now, return a default user object
      return {
        id: `new_user_${authUser.id}`,
        email: authUser.email,
        fullName: authUser.user_metadata?.full_name || 'New User',
        role: ['User'],
        _isNewUser: true
      };
      
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return null;
    }
  }
};

export default userSpecificAPI;