// aircasa-app/src/api/functions.js
import { propertiesService, usersService } from '@/lib/airtableClient';

// NOTE: Removed imports for services that don't exist:
// - bookingsService (Bookings table doesn't exist)
// - analyticsService (Analytics table doesn't exist)
import { 
  transformProperties, 
  transformUsers, 
  transformProperty,
  transformUser,
  transformPropertyForAirtable,
  transformUserForAirtable,
  validateProperty,
  validateUser
} from '@/lib/dataTransformers';

// NOTE: Removed imports for functions that don't exist anymore:
// - transformBookings (Bookings table doesn't exist)
// - transformAnalyticsData (Analytics table doesn't exist)

/* -------------------- Properties -------------------- */
export const properties = {
  // Get all properties
  async list(options = {}) {
    try {
      const airtableRecords = await propertiesService.getAll({
        maxRecords: options.limit || 100,
        sort: options.sort,
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
  async update(propertyId, propertyData, options = {}) {
    try {
      validateProperty(propertyData);
      
      // Pass options to transformer to enable selective field updates
      const airtableFields = transformPropertyForAirtable(propertyData, options);
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
        sort: options.sort,
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
// NOTE: Bookings functions commented out - Bookings table doesn't exist in user's Airtable base
export const bookings = {
  // Placeholder functions that return mock data since Bookings table doesn't exist
  async list(options = {}) {
    console.warn('Bookings table does not exist - returning mock data');
    return {
      items: [],
      total: 0,
      page: options.page || 1,
      limit: options.limit || 100
    };
  },

  async getByProperty(propertyId) {
    console.warn('Bookings table does not exist - returning mock data');
    return [];
  },

  async getByGuest(guestEmail) {
    console.warn('Bookings table does not exist - returning mock data');
    return [];
  },

  async getUpcoming() {
    console.warn('Bookings table does not exist - returning mock data');
    return [];
  }
};

/* -------------------- Analytics -------------------- */
// NOTE: Analytics section commented out - Analytics table doesn't exist in user's Airtable base
export const analytics = {
  // Placeholder functions that return mock data since Analytics table doesn't exist
  async getData(options = {}) {
    console.warn('Analytics table does not exist - returning mock data');
    return [];
  },

  // Get dashboard stats - returns mock data since Analytics table doesn't exist
  async getDashboardStats() {
    console.warn('Analytics table does not exist - returning mock dashboard stats');
    return {
      totalRevenue: 0,
      totalBookings: 0,
      occupancyRate: 0,
      averageDailyRate: 0,
      newUsers: 0,
      propertyViews: 0,
      conversionRate: 0,
      topProperty: 'N/A',
      topLocation: 'N/A'
    };
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