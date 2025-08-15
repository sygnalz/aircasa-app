// API functions specifically for user's Airtable base structure
import { AirtableService } from '../lib/airtableClient';
import {
  transformUserProperty,
  transformUserProfile,
  transformUserConversation,
  transformUserAIAccess,
  transformUserDashboardStats
} from '../lib/userDataTransformers';

// Table services for user's specific tables
const propertiesService = new AirtableService('Properties');
const usersService = new AirtableService('Users');
const conversationsService = new AirtableService('Conversations');
const aiAccessService = new AirtableService('AI Access Layer');

// Properties API
export const propertiesAPI = {
  // Get all properties with full data
  async getAll() {
    try {
      const records = await propertiesService.getAll();
      return records.map(record => transformUserProperty(record));
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Return demo data if Airtable fails
      const { default: demoProperties } = await import('../lib/demoData/properties.js');
      return demoProperties;
    }
  },

  // Get single property by ID
  async getById(propertyId) {
    try {
      const record = await propertiesService.getById(propertyId);
      return transformUserProperty(record);
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  },

  // Get properties by user ID
  async getByUserId(userId) {
    try {
      // Validate userId before making the query
      if (!userId || typeof userId !== 'string') {
        console.warn('Invalid userId provided to getByUserId:', userId);
        return [];
      }
      
      console.log(`🔍 Fetching properties for user ID: ${userId}`);
      const records = await propertiesService.getAll({
        filterByFormula: `{app_owner_user_id} = "${userId}"`
      });
      console.log(`✅ Found ${records.length} properties for user ID: ${userId}`);
      return records.map(record => transformUserProperty(record));
    } catch (error) {
      console.error('Error fetching user properties by ID:', error);
      // Log more details about the error
      if (error.message.includes('filterByFormula')) {
        console.error('Filter formula error - userId was:', userId);
      }
      return [];
    }
  },

  // Get properties with incomplete tasks
  async getWithIncompleteTasks() {
    try {
      const records = await propertiesService.getAll({
        filterByFormula: `AND({incomplete_tasks} != "", {incomplete_tasks} != BLANK())`
      });
      return records.map(record => transformUserProperty(record));
    } catch (error) {
      console.error('Error fetching properties with tasks:', error);
      return [];
    }
  },

  // Update property completion status
  async updateCompletionStatus(propertyId, updates) {
    try {
      const updateFields = {};
      
      if (updates.propertyIntakeCompleted !== undefined) {
        updateFields.property_intake_completed = updates.propertyIntakeCompleted;
      }
      if (updates.personalFinancialCompleted !== undefined) {
        updateFields.personal_financial_completed = updates.personalFinancialCompleted;
      }
      if (updates.photosCompleted !== undefined) {
        updateFields.photos_completed = updates.photosCompleted;
      }
      if (updates.consultationCompleted !== undefined) {
        updateFields.consultation_completed = updates.consultationCompleted;
      }
      
      const record = await propertiesService.update(propertyId, updateFields);
      return transformUserProperty(record);
    } catch (error) {
      console.error('Error updating property status:', error);
      throw error;
    }
  }
};

// Users API
export const usersAPI = {
  // Get all users
  async getAll() {
    try {
      const records = await usersService.getAll();
      return records.map(record => transformUserProfile(record));
    } catch (error) {
      console.error('Error fetching users:', error);
      const { default: demoUsers } = await import('../lib/demoData/users.js');
      return demoUsers;
    }
  },

  // Get user by ID
  async getById(userId) {
    try {
      const record = await usersService.getById(userId);
      return transformUserProfile(record);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Get user by app_owner_user_id
  async getByOwnerUserId(ownerUserId) {
    try {
      const records = await usersService.getAll({
        filterByFormula: `{app_owner_user_id} = "${ownerUserId}"`
      });
      return records.length > 0 ? transformUserProfile(records[0]) : null;
    } catch (error) {
      console.error('Error fetching user by owner ID:', error);
      return null;
    }
  },

  // Get users by role
  async getByRole(role) {
    try {
      const records = await usersService.getAll({
        filterByFormula: `FIND("${role}", {role})`
      });
      return records.map(record => transformUserProfile(record));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
  }
};

// Conversations API
export const conversationsAPI = {
  // Get all conversations
  async getAll() {
    try {
      const records = await conversationsService.getAll({
        sort: [{ field: 'timestamp', direction: 'desc' }]
      });
      return records.map(record => transformUserConversation(record));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  // Get conversations by user ID
  async getByUserId(userId) {
    try {
      const records = await conversationsService.getAll({
        filterByFormula: `{app_owner_user_id} = "${userId}"`,
        sort: [{ field: 'timestamp', direction: 'desc' }]
      });
      return records.map(record => transformUserConversation(record));
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      return [];
    }
  },

  // Get conversations by conversation ID
  async getByConversationId(conversationId) {
    try {
      const records = await conversationsService.getAll({
        filterByFormula: `{conversation_id} = "${conversationId}"`,
        sort: [{ field: 'timestamp', direction: 'asc' }]
      });
      return records.map(record => transformUserConversation(record));
    } catch (error) {
      console.error('Error fetching conversation thread:', error);
      return [];
    }
  },

  // Add new conversation message
  async addMessage(messageData) {
    try {
      const record = await conversationsService.create({
        app_owner_user_id: messageData.userId,
        conversation_id: messageData.conversationId,
        conversations: messageData.content,
        role: messageData.role,
        timestamp: new Date().toISOString(),
        display_name: messageData.displayName || new Date().toISOString()
      });
      return transformUserConversation(record);
    } catch (error) {
      console.error('Error adding conversation message:', error);
      throw error;
    }
  }
};

// AI Access Layer API
export const aiAccessAPI = {
  // Get all AI access records
  async getAll() {
    try {
      const records = await aiAccessService.getAll();
      return records.map(record => transformUserAIAccess(record));
    } catch (error) {
      console.error('Error fetching AI access data:', error);
      return [];
    }
  },

  // Get AI access for specific user
  async getByUserId(userId) {
    try {
      const records = await aiAccessService.getAll({
        filterByFormula: `FIND("${userId}", ARRAYJOIN({app_owner_user_id}))`
      });
      return records.length > 0 ? transformUserAIAccess(records[0]) : null;
    } catch (error) {
      console.error('Error fetching user AI access:', error);
      return null;
    }
  }
};

// Dashboard API - combines data from multiple tables
export const dashboardAPI = {
  // Get comprehensive dashboard stats
  async getStats() {
    try {
      const [properties, users, conversations] = await Promise.all([
        propertiesService.getAll(),
        usersService.getAll(), 
        conversationsService.getAll()
      ]);

      return transformUserDashboardStats(properties, users, conversations);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return demo stats if real data fails
      return {
        totalProperties: 0,
        totalUsers: 0,
        totalConversations: 0,
        propertiesWithEstimatedValue: 0,
        averageEstimatedValue: 0,
        completedIntakes: 0,
        completedConsultations: 0,
        completedPhotos: 0,
        recentConversations: [],
        totalIncompleteTasks: 0
      };
    }
  },

  // Get recent activity across all tables
  async getRecentActivity() {
    try {
      const [recentProperties, recentConversations] = await Promise.all([
        propertiesService.getAll({
          maxRecords: 5,
          sort: [{ field: 'app_owner_user_id', direction: 'desc' }]
        }),
        conversationsService.getAll({
          maxRecords: 10,
          sort: [{ field: 'timestamp', direction: 'desc' }]
        })
      ]);

      return {
        recentProperties: recentProperties.map(p => transformUserProperty(p)),
        recentConversations: recentConversations.map(c => transformUserConversation(c))
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return {
        recentProperties: [],
        recentConversations: []
      };
    }
  }
};

// Combined API object
export const userAPI = {
  properties: propertiesAPI,
  users: usersAPI,
  conversations: conversationsAPI,
  aiAccess: aiAccessAPI,
  dashboard: dashboardAPI
};

export default userAPI;