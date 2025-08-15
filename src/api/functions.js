// aircasa-app/src/api/functions.js
import { propertiesService, usersService, bookingsService, analyticsService } from '@/lib/airtableClient';
import { 
  transformProperties, 
  transformUsers, 
  transformBookings, 
  transformAnalyticsData,
  transformProperty,
  transformUser,
  transformPropertyForAirtable,
  transformUserForAirtable,
  validateProperty,
  validateUser
} from '@/lib/dataTransformers';

/* -------------------- Properties -------------------- */
export const properties = {
  // Get all properties
  async list(options = {}) {
    try {
      const airtableRecords = await propertiesService.getAll({
        maxRecords: options.limit || 100,
        sort: options.sort || [{ field: 'Name', direction: 'asc' }],
        filterByFormula: options.filter,
        ...options
      });
      
      const transformedProperties = transformProperties(airtableRecords);
      
      return {
        items: transformedProperties,
        total: transformedProperties.length,
        page: options.page || 1,
        limit: options.limit || 100
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Get a single property by ID
  async getById(propertyId) {
    try {
      const airtableRecord = await propertiesService.getById(propertyId);
      return transformProperty(airtableRecord);
    } catch (error) {
      console.error('Error fetching property by ID:', error);
      throw error;
    }
  },

  // Create a new property
  async create(propertyData) {
    try {
      validateProperty(propertyData);
      const airtableFields = transformPropertyForAirtable(propertyData);
      const airtableRecord = await propertiesService.create(airtableFields);
      return transformProperty(airtableRecord);
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  // Update a property
  async update(propertyId, propertyData) {
    try {
      validateProperty(propertyData);
      const airtableFields = transformPropertyForAirtable(propertyData);
      const airtableRecord = await propertiesService.update(propertyId, airtableFields);
      return transformProperty(airtableRecord);
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  // Delete a property
  async delete(propertyId) {
    try {
      const result = await propertiesService.delete(propertyId);
      return result;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  // Get properties by status
  async getByStatus(status) {
    try {
      const airtableRecords = await propertiesService.getAll({
        filterByFormula: `{Status} = '${status}'`
      });
      return transformProperties(airtableRecords);
    } catch (error) {
      console.error('Error fetching properties by status:', error);
      throw error;
    }
  },

  // Get properties by owner email
  async getByOwner(ownerEmail) {
    try {
      const airtableRecords = await propertiesService.getAll({
        filterByFormula: `{Owner Email} = '${ownerEmail}'`
      });
      return transformProperties(airtableRecords);
    } catch (error) {
      console.error('Error fetching properties by owner:', error);
      throw error;
    }
  }
};

/* -------------------- Users -------------------- */
export const users = {
  // Get all users
  async list(options = {}) {
    try {
      const airtableRecords = await usersService.getAll({
        maxRecords: options.limit || 100,
        sort: options.sort || [{ field: 'Full Name', direction: 'asc' }],
        filterByFormula: options.filter,
        ...options
      });
      
      const transformedUsers = transformUsers(airtableRecords);
      
      return {
        items: transformedUsers,
        total: transformedUsers.length,
        page: options.page || 1,
        limit: options.limit || 100
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get a single user by ID
  async getById(userId) {
    try {
      const airtableRecord = await usersService.getById(userId);
      return transformUser(airtableRecord);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  },

  // Get user by email
  async getByEmail(email) {
    try {
      const airtableRecords = await usersService.getAll({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1
      });
      
      if (airtableRecords.length === 0) {
        throw new Error('User not found');
      }
      
      return transformUser(airtableRecords[0]);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  },

  // Create a new user
  async create(userData) {
    try {
      validateUser(userData);
      const airtableFields = transformUserForAirtable(userData);
      const airtableRecord = await usersService.create(airtableFields);
      return transformUser(airtableRecord);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update a user
  async update(userId, userData) {
    try {
      validateUser(userData);
      const airtableFields = transformUserForAirtable(userData);
      const airtableRecord = await usersService.update(userId, airtableFields);
      return transformUser(airtableRecord);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete a user
  async delete(userId) {
    try {
      const result = await usersService.delete(userId);
      return result;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

/* -------------------- Bookings -------------------- */
export const bookings = {
  // Get all bookings
  async list(options = {}) {
    try {
      const airtableRecords = await bookingsService.getAll({
        maxRecords: options.limit || 100,
        sort: options.sort || [{ field: 'Booking Date', direction: 'desc' }],
        filterByFormula: options.filter,
        ...options
      });
      
      const transformedBookings = transformBookings(airtableRecords);
      
      return {
        items: transformedBookings,
        total: transformedBookings.length,
        page: options.page || 1,
        limit: options.limit || 100
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Get bookings by property ID
  async getByProperty(propertyId) {
    try {
      const airtableRecords = await bookingsService.getAll({
        filterByFormula: `{Property ID} = '${propertyId}'`
      });
      return transformBookings(airtableRecords);
    } catch (error) {
      console.error('Error fetching bookings by property:', error);
      throw error;
    }
  },

  // Get bookings by guest email
  async getByGuest(guestEmail) {
    try {
      const airtableRecords = await bookingsService.getAll({
        filterByFormula: `{Guest Email} = '${guestEmail}'`
      });
      return transformBookings(airtableRecords);
    } catch (error) {
      console.error('Error fetching bookings by guest:', error);
      throw error;
    }
  },

  // Get upcoming bookings
  async getUpcoming() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const airtableRecords = await bookingsService.getAll({
        filterByFormula: `IS_AFTER({Check-in Date}, '${today}')`
      });
      return transformBookings(airtableRecords);
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      throw error;
    }
  }
};

/* -------------------- Analytics -------------------- */
export const analytics = {
  // Get analytics data
  async getData(options = {}) {
    try {
      const airtableRecords = await analyticsService.getAll({
        maxRecords: options.limit || 12,
        sort: [{ field: 'Date', direction: 'desc' }],
        ...options
      });
      
      return transformAnalyticsData(airtableRecords);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Get dashboard stats
  async getDashboardStats() {
    try {
      // Get latest analytics record
      const latestAnalytics = await analyticsService.getAll({
        maxRecords: 1,
        sort: [{ field: 'Date', direction: 'desc' }]
      });

      if (latestAnalytics.length === 0) {
        return {
          totalRevenue: 0,
          totalBookings: 0,
          occupancyRate: 0,
          averageDailyRate: 0
        };
      }

      const latest = transformAnalyticsData(latestAnalytics)[0];
      
      return {
        totalRevenue: latest.totalRevenue,
        totalBookings: latest.totalBookings,
        occupancyRate: latest.occupancyRate,
        averageDailyRate: latest.averageDailyRate,
        newUsers: latest.newUsers,
        propertyViews: latest.propertyViews,
        conversionRate: latest.conversionRate,
        topProperty: latest.topProperty,
        topLocation: latest.topLocation
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};

/* -------------------- Legacy Functions (now implemented with Airtable) -------------------- */
export const getAdminDashboardStats = analytics.getDashboardStats;

export async function syncUserWithAirtable(userData) {
  try {
    const existingUser = await users.getByEmail(userData.email);
    return await users.update(existingUser.id, userData);
  } catch (error) {
    // User doesn't exist, create new one
    return await users.create(userData);
  }
}

/* -------------------- Placeholder functions (not yet implemented) -------------------- */
export const aiChat = { 
  async send() { 
    throw new Error("aiChat.send not implemented yet - requires AI service integration"); 
  } 
};

export const getVoices = async () => { 
  throw new Error("getVoices not implemented yet - requires speech service integration"); 
};

export const generateSpeech = async () => { 
  throw new Error("generateSpeech not implemented yet - requires speech service integration"); 
};

export const checkConversationHistory = async () => { 
  throw new Error("checkConversationHistory not implemented yet - requires conversation tracking"); 
};

export const getConversationUserSummaries = async () => { 
  throw new Error("getConversationUserSummaries not implemented yet"); 
};

export const getUserConversationDetails = async () => { 
  throw new Error("getUserConversationDetails not implemented yet"); 
};

export const getUserChatHistory = async () => { 
  throw new Error("getUserChatHistory not implemented yet"); 
};

export const exportConversationLog = async () => { 
  throw new Error("exportConversationLog not implemented yet"); 
};

export const getUserReferralId = async () => { 
  throw new Error("getUserReferralId not implemented yet"); 
};

export const syncWithAttom = async () => { 
  throw new Error("syncWithAttom not implemented yet - requires Attom Data integration"); 
};

export const getIntakeForPropertyAdmin = async () => { 
  throw new Error("getIntakeForPropertyAdmin not implemented yet"); 
};

export const sendAdminMessage = async () => { 
  throw new Error("sendAdminMessage not implemented yet"); 
};

export const getAnalyticsData = analytics.getData;