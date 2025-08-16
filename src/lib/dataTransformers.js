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
      
      // Milestone Task Completion Fields
      completedIntake: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'completedIntake'),
      photosCompleted: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'photosCompleted'),
      consultationCompleted: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'consultationCompleted'),
      isBuyingHome: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'isBuyingHome'),
      homeCriteriaCompleted: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'homeCriteriaCompleted'),
      personalFinancialCompleted: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'personalFinancialCompleted'),
      
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
    // Core property fields (confirmed to exist in Airtable schema)
    app_address: appProperty.address,
    app_street: appProperty.street,
    app_city: appProperty.city,
    app_state: appProperty.state,
    app_zip_code: appProperty.zip_code,
    app_property_type: appProperty.property_type,
    app_bedrooms: appProperty.bedrooms,
    app_bathrooms: appProperty.bathrooms,
    app_estimated_value: appProperty.estimated_value,
    app_image_url: appProperty.image_url,
    
    // User information fields (confirmed to exist)
    app_owner_user_id: appProperty.app_owner_user_id,
    app_first_name: appProperty.first_name || '',
    app_last_name: appProperty.last_name || '',
    app_email: appProperty.email,
    app_phone: appProperty.phone || '',
    app_is_buying_home: appProperty.is_buying_home || false,
    app_referred_by: appProperty.referred_by || '',
    
    // Milestone Task Completion Fields (using exact Airtable field names)
    property_intake_completed: appProperty.completedIntake || false,
    photos_completed: appProperty.photosCompleted || false,
    consultation_completed: appProperty.consultationCompleted || false,
    is_buying_home: appProperty.isBuyingHome || false,
    home_criteria_main_completed: appProperty.homeCriteriaCompleted || false,
    personal_financial_completed: appProperty.personalFinancialCompleted || false,
    
    // ATTOM Data fields - Core ATTOM ID (always include if available)
    ...(appProperty.attom_id && { attom_id: appProperty.attom_id }),
    
    // ATTOM Address fields from expandedprofile endpoint (following PDF protocol)
    ...(appProperty.attom_street_address && { attom_sell_property_address_street: appProperty.attom_street_address }),
    ...(appProperty.attom_city && { attom_sell_property_address_city: appProperty.attom_city }),
    ...(appProperty.attom_state && { attom_sell_property_address_state: appProperty.attom_state }),
    ...(appProperty.attom_zip && { attom_sell_property_address_zip: appProperty.attom_zip }),
    ...(appProperty.attom_country && { attom_sell_property_address_country: appProperty.attom_country }),
    ...(appProperty.attom_subdivision && { attom_sell_property_subdvision_name: appProperty.attom_subdivision }),
    ...(appProperty.attom_municipality && { attom_sell_property_municipality_name: appProperty.attom_municipality }),
    ...(appProperty.attom_county && { attom_sell_property_county: appProperty.attom_county }),
    
    // ATTOM Property characteristics from expandedprofile
    ...(appProperty.attom_use_type && { attom_sell_property_use_type: appProperty.attom_use_type }),
    ...(appProperty.attom_year_built && { attom_sell_property_year_built: Number(appProperty.attom_year_built) }),
    ...(appProperty.attom_levels && { attom_sell_property_levels: Number(appProperty.attom_levels) }),
    ...(appProperty.attom_finished_sf && { attom_sell_property_finished_sf: Number(appProperty.attom_finished_sf) }),
    ...(appProperty.attom_siding && { attom_sell_property_siding: appProperty.attom_siding }),
    ...(appProperty.attom_roof_type && { attom_sell_property_roof_type: appProperty.attom_roof_type }),
    ...(appProperty.attom_central_air && { attom_sell_property_central_air: appProperty.attom_central_air }),
    ...(appProperty.attom_heating_type && { attom_sell_property_heating_type: appProperty.attom_heating_type }),
    ...(appProperty.attom_heating_fuel && { attom_sell_property_heating_fuel_type: appProperty.attom_heating_fuel }),
    ...(appProperty.attom_fireplace_number && { attom_sell_property_fireplace_number: Number(appProperty.attom_fireplace_number) }),
    ...(appProperty.attom_lot_size && { attom_sell_property_lot_size: Number(appProperty.attom_lot_size) }),
    ...(appProperty.attom_lot_zoning && { attom_sell_property_lot_zoning: appProperty.attom_lot_zoning }),
    ...(appProperty.attom_mortgage_amount && { attom_sell_property_mortgage_amount: Number(appProperty.attom_mortgage_amount) }),
    ...(appProperty.attom_2nd_mortgage && { attom_sell_property_2nd_mortgage_amount: Number(appProperty.attom_2nd_mortgage) }),
    
    // ATTOM Fields from assessment/detail endpoint
    ...(appProperty.attom_architectural_style && { attom_sell_property_architectural_style: appProperty.attom_architectural_style }),
    ...(appProperty.attom_water_source && { attom_sell_property_water_source: appProperty.attom_water_source }),
    ...(appProperty.attom_sewer_type && { attom_sell_property_sewer_type: appProperty.attom_sewer_type }),
    ...(appProperty.attom_pool_type && { attom_sell_property_pool_type: appProperty.attom_pool_type }),
    ...(appProperty.attom_garage && { attom_sell_property_garage: appProperty.attom_garage }),
    ...(appProperty.attom_flooring && { attom_sell_property_flooring_types: appProperty.attom_flooring }),
    ...(appProperty.attom_taxes && { attom_sell_property_taxes: Number(appProperty.attom_taxes) }),
    ...(appProperty.attom_designated_historic && { attom_sell_property_designated_historic: appProperty.attom_designated_historic }),
    
    // ATTOM Legal and tax fields
    ...(appProperty.attom_legal_desc1 && { attom_property_legal_description1: appProperty.attom_legal_desc1 }),
    ...(appProperty.attom_legal_desc2 && { attom_property_legal_description2: appProperty.attom_legal_desc2 }),
    ...(appProperty.attom_legal_desc3 && { attom_property_legal_description3: appProperty.attom_legal_desc3 }),
    ...(appProperty.attom_tax_id && { attom_property_tax_id: appProperty.attom_tax_id }),
    
    // ATTOM School data from detailwithschools endpoint  
    ...(appProperty.attom_school_district && { attom_sell_property_school_district: appProperty.attom_school_district }),
    ...(appProperty.attom_elementary_school && { attom_sell_property_school_district_elementary: appProperty.attom_elementary_school }),
    ...(appProperty.attom_middle_school && { attom_sell_property_school_district_middle: appProperty.attom_middle_school }),
    ...(appProperty.attom_high_school && { attom_sell_property_school_district_high: appProperty.attom_high_school })
  };
  
  console.log('✅ Transformed property data (without Name field):', JSON.stringify(transformed, null, 2));
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