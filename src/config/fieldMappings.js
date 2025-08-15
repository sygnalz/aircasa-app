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

// Bookings Table Field Mappings
export const BOOKINGS_FIELD_MAPPING = {
  id: {
    airtableFields: ['id', 'Booking ID', 'booking_id'],
    type: 'string',
    required: true
  },
  bookingId: {
    airtableFields: ['Booking ID', 'Confirmation Number', 'bookingId'],
    type: 'string',
    required: true
  },
  
  // Property Information
  propertyId: {
    airtableFields: ['Property ID', 'Property', 'propertyId'],
    type: 'string',
    required: true
  },
  propertyName: {
    airtableFields: ['Property Name', 'Property Title', 'propertyName'],
    type: 'string',
    default: ''
  },
  
  // Guest Information
  guestName: {
    airtableFields: ['Guest Name', 'Customer Name', 'guestName'],
    type: 'string',
    required: true
  },
  guestEmail: {
    airtableFields: ['Guest Email', 'Customer Email', 'guestEmail'],
    type: 'string',
    required: true
  },
  guestPhone: {
    airtableFields: ['Guest Phone', 'Customer Phone', 'guestPhone'],
    type: 'string',
    default: ''
  },
  
  // Booking Details
  checkInDate: {
    airtableFields: ['Check-in Date', 'Start Date', 'Arrival Date', 'checkInDate'],
    type: 'date',
    required: true
  },
  checkOutDate: {
    airtableFields: ['Check-out Date', 'End Date', 'Departure Date', 'checkOutDate'],
    type: 'date',
    required: true
  },
  nights: {
    airtableFields: ['Nights', 'Duration', 'Stay Length', 'nights'],
    type: 'number',
    default: 1
  },
  numberOfGuests: {
    airtableFields: ['Number of Guests', 'Guest Count', 'Guests', 'numberOfGuests'],
    type: 'number',
    default: 1
  },
  
  // Financial Information
  totalAmount: {
    airtableFields: ['Total Amount', 'Total Cost', 'Amount', 'totalAmount'],
    type: 'number',
    required: true
  },
  baseRate: {
    airtableFields: ['Base Rate', 'Nightly Rate', 'baseRate'],
    type: 'number',
    default: 0
  },
  taxes: {
    airtableFields: ['Taxes', 'Tax Amount', 'taxes'],
    type: 'number',
    default: 0
  },
  fees: {
    airtableFields: ['Fees', 'Additional Fees', 'fees'],
    type: 'number',
    default: 0
  },
  
  // Status Information
  status: {
    airtableFields: ['Status', 'Booking Status', 'status'],
    type: 'string',
    default: 'pending'
  },
  paymentStatus: {
    airtableFields: ['Payment Status', 'Payment', 'paymentStatus'],
    type: 'string',
    default: 'pending'
  },
  paymentMethod: {
    airtableFields: ['Payment Method', 'Payment Type', 'paymentMethod'],
    type: 'string',
    default: ''
  },
  
  // Additional Information
  specialRequests: {
    airtableFields: ['Special Requests', 'Requests', 'Notes', 'specialRequests'],
    type: 'string',
    default: ''
  },
  cancellationPolicy: {
    airtableFields: ['Cancellation Policy', 'Cancellation', 'cancellationPolicy'],
    type: 'string',
    default: 'moderate'
  },
  
  // Dates
  bookingDate: {
    airtableFields: ['Booking Date', 'Created Date', 'Reservation Date', 'bookingDate'],
    type: 'date'
  },
  
  // System Fields
  _createdTime: {
    airtableFields: ['_createdTime'],
    type: 'date'
  }
};

// Analytics Table Field Mappings
export const ANALYTICS_FIELD_MAPPING = {
  id: {
    airtableFields: ['id', 'Record ID'],
    type: 'string',
    required: true
  },
  date: {
    airtableFields: ['Date', 'Report Date', 'Period', 'date'],
    type: 'date',
    required: true
  },
  
  // Revenue Metrics
  totalRevenue: {
    airtableFields: ['Total Revenue', 'Revenue', 'Income', 'totalRevenue'],
    type: 'number',
    default: 0
  },
  averageDailyRate: {
    airtableFields: ['Average Daily Rate', 'ADR', 'Daily Rate', 'averageDailyRate'],
    type: 'number',
    default: 0
  },
  revenuePerAvailableRoom: {
    airtableFields: ['RevPAR', 'Revenue Per Available Room', 'revenuePerAvailableRoom'],
    type: 'number',
    default: 0
  },
  
  // Booking Metrics
  totalBookings: {
    airtableFields: ['Total Bookings', 'Bookings', 'Reservations', 'totalBookings'],
    type: 'number',
    default: 0
  },
  occupancyRate: {
    airtableFields: ['Occupancy Rate', 'Occupancy', 'occupancyRate'],
    type: 'number',
    default: 0
  },
  averageStayLength: {
    airtableFields: ['Average Stay Length', 'Stay Length', 'averageStayLength'],
    type: 'number',
    default: 0
  },
  
  // User Metrics
  newUsers: {
    airtableFields: ['New Users', 'New Registrations', 'newUsers'],
    type: 'number',
    default: 0
  },
  activeUsers: {
    airtableFields: ['Active Users', 'Monthly Active Users', 'activeUsers'],
    type: 'number',
    default: 0
  },
  
  // Performance Metrics
  propertyViews: {
    airtableFields: ['Property Views', 'Page Views', 'Views', 'propertyViews'],
    type: 'number',
    default: 0
  },
  conversionRate: {
    airtableFields: ['Conversion Rate', 'Booking Conversion', 'conversionRate'],
    type: 'number',
    default: 0
  },
  clickThroughRate: {
    airtableFields: ['Click Through Rate', 'CTR', 'clickThroughRate'],
    type: 'number',
    default: 0
  },
  
  // Top Performers
  topProperty: {
    airtableFields: ['Top Property', 'Best Property', 'topProperty'],
    type: 'string',
    default: ''
  },
  topLocation: {
    airtableFields: ['Top Location', 'Best Location', 'topLocation'],
    type: 'string',
    default: ''
  },
  topRevenue: {
    airtableFields: ['Top Revenue', 'Highest Revenue', 'topRevenue'],
    type: 'number',
    default: 0
  },
  
  // System Fields
  _createdTime: {
    airtableFields: ['_createdTime'],
    type: 'date'
  }
};

// Roles Table Field Mappings
export const ROLES_FIELD_MAPPING = {
  id: {
    airtableFields: ['id', 'Role ID'],
    type: 'string',
    required: true
  },
  userId: {
    airtableFields: ['User ID', 'user_id', 'userId'],
    type: 'string',
    required: true
  },
  email: {
    airtableFields: ['Email', 'User Email', 'email'],
    type: 'string',
    required: true
  },
  role: {
    airtableFields: ['Role', 'User Role', 'Type', 'role'],
    type: 'string',
    required: true,
    default: 'User'
  },
  permissions: {
    airtableFields: ['Permissions', 'Access Level', 'permissions'],
    type: 'array',
    default: []
  },
  status: {
    airtableFields: ['Status', 'Active', 'status'],
    type: 'string',
    default: 'active'
  },
  assignedDate: {
    airtableFields: ['Assigned Date', 'Created Date', 'assignedDate'],
    type: 'date'
  },
  assignedBy: {
    airtableFields: ['Assigned By', 'Creator', 'assignedBy'],
    type: 'string',
    default: ''
  },
  
  // System Fields
  _createdTime: {
    airtableFields: ['_createdTime'],
    type: 'date'
  }
};

// Table name mappings
export const TABLE_MAPPINGS = {
  properties: PROPERTIES_FIELD_MAPPING,
  users: USERS_FIELD_MAPPING,
  bookings: BOOKINGS_FIELD_MAPPING,
  analytics: ANALYTICS_FIELD_MAPPING,
  roles: ROLES_FIELD_MAPPING
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

// Export all mappings for easy access
export default {
  PROPERTIES_FIELD_MAPPING,
  USERS_FIELD_MAPPING,
  BOOKINGS_FIELD_MAPPING,
  ANALYTICS_FIELD_MAPPING,
  ROLES_FIELD_MAPPING,
  TABLE_MAPPINGS,
  getFieldValue,
  validateRecord
};