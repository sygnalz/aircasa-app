import Airtable from 'airtable';

// Airtable configuration
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

// Table names
export const TABLES = {
  PROPERTIES: import.meta.env.VITE_AIRTABLE_PROPERTIES_TABLE || 'Properties',
  USERS: import.meta.env.VITE_AIRTABLE_USERS_TABLE || 'Users',
  BOOKINGS: import.meta.env.VITE_AIRTABLE_BOOKINGS_TABLE || 'Bookings',
  ANALYTICS: import.meta.env.VITE_AIRTABLE_ANALYTICS_TABLE || 'Analytics',
};

// Demo mode detection
const isDemoMode = !AIRTABLE_API_KEY || AIRTABLE_API_KEY === 'your_airtable_api_key_here';

if (isDemoMode) {
  console.log('🗃️ Airtable running in DEMO mode - using sample data');
}

// Initialize Airtable base
let base = null;
if (!isDemoMode) {
  try {
    Airtable.configure({
      endpointUrl: 'https://api.airtable.com',
      apiKey: AIRTABLE_API_KEY
    });
    base = Airtable.base(AIRTABLE_BASE_ID);
    console.log('✅ Airtable client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Airtable client:', error);
  }
}

// Generic Airtable operations
export class AirtableService {
  constructor(tableName) {
    this.tableName = tableName;
    this.table = base ? base(tableName) : null;
  }

  // Get all records from a table
  async getAll(options = {}) {
    if (isDemoMode) {
      return await this.getDemoData();
    }

    try {
      const records = [];
      await this.table.select({
        maxRecords: options.maxRecords || 100,
        view: options.view || 'Grid view',
        filterByFormula: options.filterByFormula,
        sort: options.sort,
        ...options
      }).eachPage((pageRecords, fetchNextPage) => {
        records.push(...pageRecords.map(record => ({
          id: record.id,
          ...record.fields,
          _createdTime: record._createdTime
        })));
        fetchNextPage();
      });
      return records;
    } catch (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      throw new Error(`Failed to fetch ${this.tableName}: ${error.message}`);
    }
  }

  // Get a single record by ID
  async getById(recordId) {
    if (isDemoMode) {
      const demoData = await this.getDemoData();
      return demoData.find(item => item.id === recordId);
    }

    try {
      const record = await this.table.find(recordId);
      return {
        id: record.id,
        ...record.fields,
        _createdTime: record._createdTime
      };
    } catch (error) {
      console.error(`Error fetching ${this.tableName} by ID:`, error);
      throw new Error(`Failed to fetch ${this.tableName} by ID: ${error.message}`);
    }
  }

  // Create a new record
  async create(fields) {
    if (isDemoMode) {
      console.log('Demo mode: Would create record with fields:', fields);
      return {
        id: `demo_${Date.now()}`,
        ...fields,
        _createdTime: new Date().toISOString()
      };
    }

    try {
      const record = await this.table.create(fields);
      return {
        id: record.id,
        ...record.fields,
        _createdTime: record._createdTime
      };
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
    }
  }

  // Update a record
  async update(recordId, fields) {
    if (isDemoMode) {
      console.log('Demo mode: Would update record', recordId, 'with fields:', fields);
      return {
        id: recordId,
        ...fields,
        _createdTime: new Date().toISOString()
      };
    }

    try {
      const record = await this.table.update(recordId, fields);
      return {
        id: record.id,
        ...record.fields,
        _createdTime: record._createdTime
      };
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
    }
  }

  // Delete a record
  async delete(recordId) {
    if (isDemoMode) {
      console.log('Demo mode: Would delete record', recordId);
      return { deleted: true, id: recordId };
    }

    try {
      const record = await this.table.destroy(recordId);
      return { deleted: true, id: record.id };
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
    }
  }

  // Get demo data (fallback for when Airtable is not configured)
  async getDemoData() {
    switch (this.tableName) {
      case TABLES.PROPERTIES:
        const { default: properties } = await import('./demoData/properties.js');
        return properties;
      case TABLES.USERS:
        const { default: users } = await import('./demoData/users.js');
        return users;
      case TABLES.BOOKINGS:
        const { default: bookings } = await import('./demoData/bookings.js');
        return bookings;
      case TABLES.ANALYTICS:
        const { default: analytics } = await import('./demoData/analytics.js');
        return analytics;
      default:
        return [];
    }
  }
}

// Service instances for each table
export const propertiesService = new AirtableService(TABLES.PROPERTIES);
export const usersService = new AirtableService(TABLES.USERS);
export const bookingsService = new AirtableService(TABLES.BOOKINGS);
export const analyticsService = new AirtableService(TABLES.ANALYTICS);

export { isDemoMode };
export default base;
