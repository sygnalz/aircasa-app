// Data transformation utilities for mapping between Airtable and app formats
import { 
  PROPERTIES_FIELD_MAPPING, 
  USERS_FIELD_MAPPING,
  getFieldValue,
  validateRecord
} from '../config/fieldMappings.js';

// NOTE: Removed imports for BOOKINGS_FIELD_MAPPING, ANALYTICS_FIELD_MAPPING, ROLES_FIELD_MAPPING
// as these tables don't exist in the user's Airtable base

// Transform Airtable property record to app format using comprehensive field mapping
export function transformProperty(airtableRecord) {
  console.log('🔄 Transforming Airtable property record:', {
    id: airtableRecord.id,
    availableFields: Object.keys(airtableRecord).slice(0, 10),
    totalFields: Object.keys(airtableRecord).length
  });
  
  try {
    const transformed = {
      // Core Property Information
      id: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'id') || airtableRecord.id,
      title: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'title'),
      description: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'description'),
      
      // Location Information
      location: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'location'),
      city: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'city'),
      state: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'state'),
      country: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'country'),
      zipCode: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'zipCode'),
      
      // Property Details
      propertyType: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'propertyType'),
      bedrooms: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'bedrooms'),
      bathrooms: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'bathrooms'),
      area: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'area'),
      lotSize: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'lotSize'),
      yearBuilt: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'yearBuilt'),
      parkingSpaces: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'parkingSpaces'),
      
      // Financial Information
      price: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'price'),
      purchasePrice: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'purchasePrice'),
      marketValue: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'marketValue'),
      
      // Performance Metrics
      bookings: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'bookings'),
      revenue: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'revenue'),
      occupancyRate: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'occupancyRate'),
      
      // Ratings and Reviews
      rating: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'rating'),
      reviews: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'reviews'),
      
      // Property Status
      status: (getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'status') || 'active').toLowerCase(),
      availability: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'availability'),
      
      // Owner Information
      ownerEmail: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'ownerEmail'),
      app_email: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'app_email'),
      app_owner_user_id: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'app_owner_user_id'),
      ownerName: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'ownerName'),
      ownerPhone: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'ownerPhone'),
      
      // Media and Features
      images: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'images'),
      amenities: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'amenities'),
      
      // Preferences
      petFriendly: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'petFriendly'),
      smokingAllowed: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'smokingAllowed'),
      
      // Dates
      createdDate: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'createdDate'),
      lastUpdated: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'lastUpdated'),
      purchaseDate: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'purchaseDate'),
      
      // System Fields
      _createdTime: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, '_createdTime') || airtableRecord._createdTime,
      _recordId: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, '_recordId') || airtableRecord.id
    };
    
    console.log('✅ Property transformed successfully:', {
      id: transformed.id,
      title: transformed.title,
      location: transformed.location,
      ownerEmail: transformed.ownerEmail || transformed.app_email
    });
    
    return transformed;
  } catch (error) {
    console.error('❌ Error transforming property:', error);
    // Return a basic transformation as fallback
    return {
      id: airtableRecord.id,
      title: airtableRecord.Name || airtableRecord.app_name || 'Untitled Property',
      location: airtableRecord.app_address || airtableRecord.Location || '',
      ownerEmail: airtableRecord.app_email || airtableRecord['Owner Email'] || '',
      app_email: airtableRecord.app_email,
      _createdTime: airtableRecord._createdTime
    };
  }
}

// Transform Airtable user record to app format using comprehensive field mapping
export function transformUser(airtableRecord) {
  console.log('🔄 Transforming Airtable user record:', {
    id: airtableRecord.id,
    availableFields: Object.keys(airtableRecord).slice(0, 10)
  });
  
  try {
    const transformed = {
      id: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'id') || airtableRecord.id,
      fullName: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'fullName'),
      email: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'email'),
      phoneNumber: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'phoneNumber'),
      userType: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'userType'),
      status: (getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'status') || 'active').toLowerCase(),
      
      // Property Management Stats
      totalProperties: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'totalProperties'),
      totalRevenue: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'totalRevenue'),
      totalBookings: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'totalBookings'),
      totalSpent: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'totalSpent'),
      
      // Personal Information
      address: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'address'),
      city: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'city'),
      state: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'state'),
      country: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'country'),
      zipCode: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'zipCode'),
      
      // Preferences and Settings
      preferredContactMethod: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'preferredContactMethod'),
      verificationStatus: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'verificationStatus'),
      profilePicture: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'profilePicture'),
      
      // Dates
      joinDate: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'joinDate'),
      lastLogin: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, 'lastLogin'),
      
      // System Fields
      _createdTime: getFieldValue(airtableRecord, USERS_FIELD_MAPPING, '_createdTime') || airtableRecord._createdTime
    };
    
    console.log('✅ User transformed successfully:', {
      id: transformed.id,
      fullName: transformed.fullName,
      email: transformed.email,
      userType: transformed.userType
    });
    
    return transformed;
  } catch (error) {
    console.error('❌ Error transforming user:', error);
    // Return a basic transformation as fallback
    return {
      id: airtableRecord.id,
      fullName: airtableRecord['Full Name'] || airtableRecord.fullName || '',
      email: airtableRecord.Email || airtableRecord.email || '',
      userType: airtableRecord['User Type'] || airtableRecord.userType || 'User',
      _createdTime: airtableRecord._createdTime
    };
  }
}

// NOTE: transformBooking function removed - Bookings table doesn't exist in the user's Airtable base

// NOTE: transformAnalytics function removed - Analytics table doesn't exist in the user's Airtable base

// NOTE: transformRole function removed - Roles table doesn't exist in the user's Airtable base

// Transform app property format to Airtable format
export function transformPropertyForAirtable(appProperty) {
  console.log('🔄 Transforming property data for Airtable:', JSON.stringify(appProperty, null, 2));
  
  const transformed = {
    // Use the primary field names from our mapping - matching enrichedPropertyData structure
    Name: appProperty.title || `${appProperty.address || 'Property'}`,
    Description: appProperty.description,
    app_address: appProperty.address, // Match enrichedPropertyData.address
    app_city: appProperty.city,
    app_state: appProperty.state,
    app_country: appProperty.country,
    app_zip: appProperty.zip_code, // Match enrichedPropertyData.zip_code
    app_property_type: appProperty.property_type, // Match enrichedPropertyData.property_type
    app_bedrooms: appProperty.bedrooms,
    app_bathrooms: appProperty.bathrooms,
    app_square_feet: appProperty.square_feet, // Match enrichedPropertyData.square_feet
    app_price: appProperty.estimated_value, // Match enrichedPropertyData.estimated_value
    app_status: appProperty.status || 'active',
    app_total_bookings: appProperty.bookings,
    app_total_revenue: appProperty.revenue,
    app_average_rating: appProperty.rating,
    app_review_count: appProperty.reviews,
    app_images: appProperty.image_url, // Match enrichedPropertyData.image_url
    app_amenities: appProperty.amenities,
    app_email: appProperty.email, // Match enrichedPropertyData.email
    app_owner_user_id: appProperty.app_owner_user_id,
    
    // Additional enriched fields from Zillow + ATTOM APIs
    app_year_built: appProperty.year_built,
    app_lot_size: appProperty.lot_size,
    app_zillow_zpid: appProperty.zillow_zpid,
    app_attom_id: appProperty.attom_id,
    app_mls_verified: appProperty.mls_verified,
    app_school_district: appProperty.school_district,
    app_tax_amount: appProperty.tax_amount,
    app_assessed_value: appProperty.assessed_value,
    app_parcel_number: appProperty.parcel_number,
    
    // User information
    app_first_name: appProperty.first_name,
    app_last_name: appProperty.last_name,
    app_phone: appProperty.phone,
    app_referred_by: appProperty.referred_by,
    app_is_buying_home: appProperty.is_buying_home
    // app_last_updated: new Date().toISOString().split('T')[0] // Field doesn't exist in Airtable schema
  };
  
  console.log('✅ Transformed property data:', JSON.stringify(transformed, null, 2));
  return transformed;
}

// Transform app user format to Airtable format
export function transformUserForAirtable(appUser) {
  return {
    'Full Name': appUser.fullName,
    Email: appUser.email,
    'Phone Number': appUser.phoneNumber,
    'User Type': appUser.userType,
    Status: appUser.status,
    'Total Properties': appUser.totalProperties,
    'Total Revenue': appUser.totalRevenue,
    'Total Bookings': appUser.totalBookings,
    'Total Spent': appUser.totalSpent,
    'Profile Picture': appUser.profilePicture,
    Address: appUser.address,
    City: appUser.city,
    State: appUser.state,
    Country: appUser.country,
    'Zip Code': appUser.zipCode,
    'Preferred Contact Method': appUser.preferredContactMethod,
    'Verification Status': appUser.verificationStatus,
    'Last Login': new Date().toISOString().split('T')[0]
  };
}

// NOTE: Removed transform functions for non-existent tables:
// - transformBookingForAirtable (Bookings table doesn't exist)
// - transformAnalyticsForAirtable (Analytics table doesn't exist)  
// - transformRoleForAirtable (Roles table doesn't exist)

// Transform multiple records
export function transformProperties(airtableRecords) {
  return airtableRecords.map(transformProperty);
}

export function transformUsers(airtableRecords) {
  return airtableRecords.map(transformUser);
}

// NOTE: Removed bulk transformation functions for non-existent tables:
// - transformBookings (Bookings table doesn't exist)
// - transformAnalyticsData (Analytics table doesn't exist)
// - transformRoles (Roles table doesn't exist)

// Note: getFieldValue is now imported from fieldMappings.js
// Keeping this as a legacy fallback for any old code
export function getNestedFieldValue(record, fieldPath, defaultValue = null) {
  const keys = fieldPath.split('.');
  let value = record;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value !== undefined ? value : defaultValue;
}

// Enhanced validation functions using field mappings
export function validateProperty(property) {
  try {
    validateRecord(property, PROPERTIES_FIELD_MAPPING, 'property');
    
    // Additional custom validations
    if (property.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(property.email)) {
        throw new Error('Invalid email format for property owner');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Property validation failed:', error);
    throw error;
  }
}

export function validateUser(user) {
  try {
    validateRecord(user, USERS_FIELD_MAPPING, 'user');
    
    // Additional custom validations
    if (user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        throw new Error('Invalid email format');
      }
    }
    
    return true;
  } catch (error) {
    console.error('User validation failed:', error);
    throw error;
  }
}

// NOTE: Validation functions removed for non-existent tables:
// - validateBooking (Bookings table doesn't exist)
// - validateAnalytics (Analytics table doesn't exist)
// - validateRole (Roles table doesn't exist)

// Enhanced transformation and validation utilities
export const TRANSFORM_CONFIG = {
  logTransformations: true,
  validateOnTransform: false, // Set to true to validate after each transformation
  fallbackToBasicTransform: true // Set to false to throw errors instead of falling back
};

// Generic transformation function - only includes tables that exist
export function transformRecord(airtableRecord, recordType) {
  const transformers = {
    property: transformProperty,
    user: transformUser
    // NOTE: Removed booking, analytics, role transformers - tables don't exist
  };
  
  const transformer = transformers[recordType.toLowerCase()];
  if (!transformer) {
    throw new Error(`No transformer found for record type: ${recordType}. Available types: ${Object.keys(transformers).join(', ')}`);
  }
  
  return transformer(airtableRecord);
}

// Generic validation function - only includes tables that exist
export function validateTransformedRecord(record, recordType) {
  const validators = {
    property: validateProperty,
    user: validateUser
    // NOTE: Removed booking, analytics, role validators - tables don't exist
  };
  
  const validator = validators[recordType.toLowerCase()];
  if (!validator) {
    throw new Error(`No validator found for record type: ${recordType}. Available types: ${Object.keys(validators).join(', ')}`);
  }
  
  return validator(record);
}

// Export field mappings for external use - only includes existing tables
export {
  PROPERTIES_FIELD_MAPPING,
  USERS_FIELD_MAPPING,
  getFieldValue,
  validateRecord
  // NOTE: Removed BOOKINGS_FIELD_MAPPING, ANALYTICS_FIELD_MAPPING, ROLES_FIELD_MAPPING exports
  // as these tables don't exist in the user's Airtable base
} from '../config/fieldMappings.js';