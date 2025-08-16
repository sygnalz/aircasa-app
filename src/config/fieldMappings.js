/**
 * Comprehensive Field Mapping Configuration for Airtable Integration
 * 
 * This file contains the field mappings between Airtable fields and application fields
 * for all 5 tables: Properties, Users, Bookings, Analytics, and Roles
 * 
 * Each mapping includes:
 * - Primary field name (from Airtable)
 * - Alternative field names (fallbacks)
 * - Data type and transformation information
 * - Default values
 */

// Properties Table Field Mappings
export const PROPERTIES_FIELD_MAPPING = {
  // Core Property Information
  id: {
    airtableFields: ['id', 'Property ID', 'property_id'],
    type: 'string',
    required: true
  },
  title: {
    airtableFields: ['Name', 'Property Name', 'app_name', 'property_name', 'title'],
    type: 'string',
    required: true,
    default: 'Untitled Property'
  },
  description: {
    airtableFields: ['Description', 'Property Description', 'app_description', 'description', 'Details'],
    type: 'string',
    default: ''
  },
  
  // Location Information
  location: {
    airtableFields: ['app_address', 'Address', 'Location', 'Full Address', 'location', 'address'],
    type: 'string',
    required: true,
    default: ''
  },
  city: {
    airtableFields: ['app_city', 'City', 'city'],
    type: 'string',
    default: ''
  },
  state: {
    airtableFields: ['app_state', 'State', 'state', 'Province'],
    type: 'string',
    default: ''
  },
  country: {
    airtableFields: ['app_country', 'Country', 'country'],
    type: 'string',
    default: 'USA'
  },
  zipCode: {
    airtableFields: ['app_zip', 'Zip Code', 'ZIP', 'Postal Code', 'zipCode'],
    type: 'string',
    default: ''
  },
  
  // Property Details
  propertyType: {
    airtableFields: ['app_property_type', 'Property Type', 'Type', 'propertyType'],
    type: 'string',
    default: 'Residential'
  },
  bedrooms: {
    airtableFields: ['app_bedrooms', 'Bedrooms', 'Beds', 'bedrooms'],
    type: 'number',
    default: 0
  },
  bathrooms: {
    airtableFields: ['app_bathrooms', 'Bathrooms', 'Baths', 'bathrooms'],
    type: 'number',
    default: 0
  },
  area: {
    airtableFields: ['app_square_feet', 'Square Feet', 'Area', 'Size', 'area'],
    type: 'number',
    default: 0
  },
  lotSize: {
    airtableFields: ['app_lot_size', 'Lot Size', 'lotSize'],
    type: 'number',
    default: 0
  },
  
  // Financial Information
  price: {
    airtableFields: ['app_price', 'Price per Night', 'Price', 'Rate', 'price'],
    type: 'number',
    default: 0
  },
  purchasePrice: {
    airtableFields: ['app_purchase_price', 'Purchase Price', 'Cost', 'purchasePrice'],
    type: 'number',
    default: 0
  },
  marketValue: {
    airtableFields: ['app_market_value', 'Market Value', 'Current Value', 'marketValue'],
    type: 'number',
    default: 0
  },
  
  // Performance Metrics
  bookings: {
    airtableFields: ['app_total_bookings', 'Total Bookings', 'Bookings', 'bookings'],
    type: 'number',
    default: 0
  },
  revenue: {
    airtableFields: ['app_total_revenue', 'Total Revenue', 'Revenue', 'revenue'],
    type: 'number',
    default: 0
  },
  occupancyRate: {
    airtableFields: ['app_occupancy_rate', 'Occupancy Rate', 'occupancyRate'],
    type: 'number',
    default: 0
  },
  
  // Ratings and Reviews
  rating: {
    airtableFields: ['app_average_rating', 'Average Rating', 'Rating', 'rating'],
    type: 'number',
    default: 0
  },
  reviews: {
    airtableFields: ['app_review_count', 'Review Count', 'Reviews', 'reviews'],
    type: 'number',
    default: 0
  },
  
  // Property Status
  status: {
    airtableFields: ['app_status', 'Status', 'Availability', 'status'],
    type: 'string',
    default: 'active'
  },
  availability: {
    airtableFields: ['app_availability', 'Available', 'availability'],
    type: 'boolean',
    default: true
  },
  
  // Owner Information
  ownerEmail: {
    airtableFields: ['app_email', 'Owner Email', 'Email', 'ownerEmail'],
    type: 'string',
    required: true
  },
  app_email: {
    airtableFields: ['app_email'],
    type: 'string',
    required: true
  },
  app_owner_user_id: {
    airtableFields: ['app_owner_user_id', 'Owner ID'],
    type: 'string'
  },
  ownerName: {
    airtableFields: ['app_owner_name', 'Owner Name', 'ownerName'],
    type: 'string',
    default: ''
  },
  ownerPhone: {
    airtableFields: ['app_owner_phone', 'Owner Phone', 'ownerPhone'],
    type: 'string',
    default: ''
  },
  
  // Media and Features
  images: {
    airtableFields: ['app_images', 'Images', 'Photos', 'images'],
    type: 'array',
    default: []
  },
  amenities: {
    airtableFields: ['app_amenities', 'Amenities', 'Features', 'amenities'],
    type: 'array',
    default: []
  },
  
  // Dates
  createdDate: {
    airtableFields: ['app_created_date', 'Created Date', 'Date Added', 'createdDate'],
    type: 'date'
  },
  lastUpdated: {
    airtableFields: ['app_last_updated', 'Last Updated', 'Modified Date', 'lastUpdated'],
    type: 'date'
  },
  purchaseDate: {
    airtableFields: ['app_purchase_date', 'Purchase Date', 'Acquired Date', 'purchaseDate'],
    type: 'date'
  },
  
  // Additional Fields
  yearBuilt: {
    airtableFields: ['app_year_built', 'Year Built', 'Built Year', 'yearBuilt'],
    type: 'number',
    default: null
  },
  parkingSpaces: {
    airtableFields: ['app_parking', 'Parking Spaces', 'Parking', 'parkingSpaces'],
    type: 'number',
    default: 0
  },
  petFriendly: {
    airtableFields: ['app_pet_friendly', 'Pet Friendly', 'Pets Allowed', 'petFriendly'],
    type: 'boolean',
    default: false
  },
  smokingAllowed: {
    airtableFields: ['app_smoking_allowed', 'Smoking Allowed', 'smokingAllowed'],
    type: 'boolean',
    default: false
  },
  
  // Milestone Task Completion Fields (as per PDF documentation)
  completedIntake: {
    airtableFields: ['completed_intake', 'property_intake_completed', 'intake_completed'],
    type: 'boolean',
    default: false
  },
  photosCompleted: {
    airtableFields: ['photos_completed', 'media_completed', 'upload_photos_completed'],
    type: 'boolean',
    default: false
  },
  consultationCompleted: {
    airtableFields: ['consultation_completed', 'agent_consultation_completed'],
    type: 'boolean',
    default: false
  },
  isBuyingHome: {
    airtableFields: ['is_buying_home', 'is_buying_a_home', 'buying_home'],
    type: 'boolean',
    default: false
  },
  homeCriteriaCompleted: {
    airtableFields: ['home_criteria_main_completed', 'home_criteria_completed'],
    type: 'boolean',
    default: false
  },
  personalFinancialCompleted: {
    airtableFields: ['personal_financial_completed', 'financial_completed'],
    type: 'boolean',
    default: false
  },
  
  // System Fields
  _createdTime: {
    airtableFields: ['_createdTime'],
    type: 'date'
  },
  _recordId: {
    airtableFields: ['_recordId', 'id'],
    type: 'string'
  }
};

// Users Table Field Mappings
export const USERS_FIELD_MAPPING = {
  id: {
    airtableFields: ['id', 'User ID', 'user_id'],
    type: 'string',
    required: true
  },
  fullName: {
    airtableFields: ['Full Name', 'Name', 'fullName', 'username'],
    type: 'string',
    required: true
  },
  email: {
    airtableFields: ['Email', 'email', 'Email Address'],
    type: 'string',
    required: true
  },
  phoneNumber: {
    airtableFields: ['Phone Number', 'Phone', 'phoneNumber', 'phone'],
    type: 'string',
    default: ''
  },
  userType: {
    airtableFields: ['User Type', 'Role', 'Type', 'userType'],
    type: 'string',
    default: 'User'
  },
  status: {
    airtableFields: ['Status', 'Account Status', 'status'],
    type: 'string',
    default: 'active'
  },
  
  // Property Management Stats
  totalProperties: {
    airtableFields: ['Total Properties', 'Properties Count', 'totalProperties'],
    type: 'number',
    default: 0
  },
  totalRevenue: {
    airtableFields: ['Total Revenue', 'Revenue', 'totalRevenue'],
    type: 'number',
    default: 0
  },
  totalBookings: {
    airtableFields: ['Total Bookings', 'Bookings', 'totalBookings'],
    type: 'number',
    default: 0
  },
  totalSpent: {
    airtableFields: ['Total Spent', 'Amount Spent', 'totalSpent'],
    type: 'number',
    default: 0
  },
  
  // Personal Information
  address: {
    airtableFields: ['Address', 'Home Address', 'address'],
    type: 'string',
    default: ''
  },
  city: {
    airtableFields: ['City', 'city'],
    type: 'string',
    default: ''
  },
  state: {
    airtableFields: ['State', 'state'],
    type: 'string',
    default: ''
  },
  country: {
    airtableFields: ['Country', 'country'],
    type: 'string',
    default: 'USA'
  },
  zipCode: {
    airtableFields: ['Zip Code', 'ZIP', 'zipCode'],
    type: 'string',
    default: ''
  },
  
  // Preferences and Settings
  preferredContactMethod: {
    airtableFields: ['Preferred Contact Method', 'Contact Method', 'preferredContactMethod'],
    type: 'string',
    default: 'email'
  },
  verificationStatus: {
    airtableFields: ['Verification Status', 'Verified', 'verificationStatus'],
    type: 'string',
    default: 'pending'
  },
  profilePicture: {
    airtableFields: ['Profile Picture', 'Avatar', 'profilePicture'],
    type: 'string',
    default: ''
  },
  
  // Dates
  joinDate: {
    airtableFields: ['Join Date', 'Created Date', 'Registration Date', 'joinDate'],
    type: 'date'
  },
  lastLogin: {
    airtableFields: ['Last Login', 'Last Access', 'lastLogin'],
    type: 'date'
  },
  
  // System Fields
  _createdTime: {
    airtableFields: ['_createdTime'],
    type: 'date'
  }
};

// NOTE: Bookings table mapping removed - table does not exist in the user's Airtable base

// NOTE: Analytics table mapping removed - table does not exist in the user's Airtable base

// NOTE: Roles table mapping removed - table does not exist in the user's Airtable base

// Table name mappings - only includes tables that exist in the user's Airtable base
export const TABLE_MAPPINGS = {
  properties: PROPERTIES_FIELD_MAPPING,
  users: USERS_FIELD_MAPPING
  // NOTE: Bookings, Analytics, and Roles tables removed - they don't exist in the user's Airtable base
  // TODO: Add Property Intake Form, Conversations, and AI Access Layer tables when needed
};

// Utility function to get field value with fallbacks
export function getFieldValue(record, fieldMapping, fieldName) {
  const mapping = fieldMapping[fieldName];
  if (!mapping) {
    console.warn(`No mapping found for field: ${fieldName}`);
    return mapping?.default || null;
  }
  
  // Try each possible field name in order
  for (const airtableField of mapping.airtableFields) {
    if (record && record[airtableField] !== undefined && record[airtableField] !== null) {
      let value = record[airtableField];
      
      // Apply type transformations
      switch (mapping.type) {
        case 'number':
          value = Number(value) || mapping.default || 0;
          break;
        case 'boolean':
          value = Boolean(value);
          break;
        case 'string':
          value = String(value || mapping.default || '');
          break;
        case 'array':
          value = Array.isArray(value) ? value : (mapping.default || []);
          break;
        case 'date':
          value = value ? new Date(value) : null;
          break;
        default:
          // No transformation needed
          break;
      }
      
      return value;
    }
  }
  
  // Return default value if no field found
  return mapping.default !== undefined ? mapping.default : null;
}

// Validation function for required fields
export function validateRecord(record, fieldMapping, recordType = 'record') {
  const errors = [];
  
  Object.entries(fieldMapping).forEach(([fieldName, mapping]) => {
    if (mapping.required) {
      const value = getFieldValue(record, fieldMapping, fieldName);
      if (value === null || value === undefined || value === '') {
        errors.push(`Missing required field: ${fieldName}`);
      }
    }
  });
  
  if (errors.length > 0) {
    throw new Error(`Validation failed for ${recordType}: ${errors.join(', ')}`);
  }
  
  return true;
}

// Export all mappings for easy access - only includes existing tables
export default {
  PROPERTIES_FIELD_MAPPING,
  USERS_FIELD_MAPPING,
  TABLE_MAPPINGS,
  getFieldValue,
  validateRecord
  // NOTE: Removed BOOKINGS_FIELD_MAPPING, ANALYTICS_FIELD_MAPPING, ROLES_FIELD_MAPPING
  // as these tables don't exist in the user's Airtable base
};