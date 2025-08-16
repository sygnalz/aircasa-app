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
      app_image_url: getFieldValue(airtableRecord, PROPERTIES_FIELD_MAPPING, 'app_image_url'),
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

// Transform app property format to Airtable format - with selective field mapping
export function transformPropertyForAirtable(appProperty, options = {}) {
  console.log('🔄 Transforming property data for Airtable:', JSON.stringify(appProperty, null, 2));
  console.log('🔄 Transform options:', options);
  
  const transformed = {};
  
  // If we're doing a selective update (only specific fields changed)
  if (options.onlyChangedFields && options.changedFields) {
    console.log('🔄 Selective field update mode - only transforming:', options.changedFields);
    
    // Create a mapping of app fields to Airtable fields for milestone tasks
    const taskFieldMappings = {
      completedIntake: 'property_intake_completed',
      photosCompleted: 'photos_completed', 
      consultationCompleted: 'consultation_completed',
      isBuyingHome: 'is_buying_a_home',
      homeCriteriaCompleted: 'home_criteria_main_completed',
      personalFinancialCompleted: 'personal_financial_completed'
    };
    
    // Only transform the fields that were actually changed
    for (const changedField of options.changedFields) {
      if (taskFieldMappings[changedField] && appProperty.hasOwnProperty(changedField)) {
        transformed[taskFieldMappings[changedField]] = appProperty[changedField];
        console.log(`🔄 Mapped ${changedField} -> ${taskFieldMappings[changedField]} = ${appProperty[changedField]}`);
      } else if (appProperty.hasOwnProperty(changedField)) {
        // For non-task fields, use the field name as-is or apply standard mappings
        transformed[changedField] = appProperty[changedField];
        console.log(`🔄 Direct mapping ${changedField} = ${appProperty[changedField]}`);
      }
    }
    
    console.log('✅ Selective transformation result:', JSON.stringify(transformed, null, 2));
    return transformed;
  }
  
  // Full transformation mode (for property creation or complete updates)
  console.log('🔄 Full transformation mode');
  
  // Core property fields (confirmed to exist in Airtable schema)
  if (appProperty.address !== undefined) transformed.app_address = appProperty.address;
  if (appProperty.street !== undefined) transformed.app_street = appProperty.street;
  if (appProperty.city !== undefined) transformed.app_city = appProperty.city;
  if (appProperty.state !== undefined) transformed.app_state = appProperty.state;
  if (appProperty.zip_code !== undefined) transformed.app_zip_code = appProperty.zip_code;
  if (appProperty.property_type !== undefined) transformed.app_property_type = appProperty.property_type;
  if (appProperty.bedrooms !== undefined) transformed.app_bedrooms = appProperty.bedrooms;
  if (appProperty.bathrooms !== undefined) transformed.app_bathrooms = appProperty.bathrooms;
  if (appProperty.estimated_value !== undefined) transformed.app_estimated_value = appProperty.estimated_value;
  if (appProperty.image_url !== undefined) transformed.app_image_url = appProperty.image_url;
  
  // User information fields (confirmed to exist)
  if (appProperty.app_owner_user_id !== undefined) transformed.app_owner_user_id = appProperty.app_owner_user_id;
  if (appProperty.first_name !== undefined) transformed.app_first_name = appProperty.first_name || '';
  if (appProperty.last_name !== undefined) transformed.app_last_name = appProperty.last_name || '';
  if (appProperty.email !== undefined) transformed.app_email = appProperty.email;
  if (appProperty.phone !== undefined) transformed.app_phone = appProperty.phone || '';
  if (appProperty.is_buying_home !== undefined) transformed.app_is_buying_home = appProperty.is_buying_home || false;
  if (appProperty.referred_by !== undefined) transformed.app_referred_by = appProperty.referred_by || '';
  
  // Milestone Task Completion Fields (using exact Airtable field names) - only in full mode
  if (appProperty.completedIntake !== undefined) transformed.property_intake_completed = appProperty.completedIntake || false;
  if (appProperty.photosCompleted !== undefined) transformed.photos_completed = appProperty.photosCompleted || false;
  if (appProperty.consultationCompleted !== undefined) transformed.consultation_completed = appProperty.consultationCompleted || false;
  if (appProperty.isBuyingHome !== undefined) transformed.is_buying_a_home = appProperty.isBuyingHome || false;
  if (appProperty.homeCriteriaCompleted !== undefined) transformed.home_criteria_main_completed = appProperty.homeCriteriaCompleted || false;
  if (appProperty.personalFinancialCompleted !== undefined) transformed.personal_financial_completed = appProperty.personalFinancialCompleted || false;
    
  // ATTOM Data fields - Core ATTOM ID (always include if available)
  if (appProperty.attom_id !== undefined) transformed.attom_id = appProperty.attom_id;
    
  // ATTOM Address fields from expandedprofile endpoint (following PDF protocol)
  if (appProperty.attom_street_address !== undefined) transformed.attom_sell_property_address_street = appProperty.attom_street_address;
  if (appProperty.attom_city !== undefined) transformed.attom_sell_property_address_city = appProperty.attom_city;
  if (appProperty.attom_state !== undefined) transformed.attom_sell_property_address_state = appProperty.attom_state;
  if (appProperty.attom_zip !== undefined) transformed.attom_sell_property_address_zip = appProperty.attom_zip;
  if (appProperty.attom_country !== undefined) transformed.attom_sell_property_address_country = appProperty.attom_country;
  if (appProperty.attom_subdivision !== undefined) transformed.attom_sell_property_subdvision_name = appProperty.attom_subdivision;
  if (appProperty.attom_municipality !== undefined) transformed.attom_sell_property_municipality_name = appProperty.attom_municipality;
  if (appProperty.attom_county !== undefined) transformed.attom_sell_property_county = appProperty.attom_county;
    
  // ATTOM Property characteristics from expandedprofile
  if (appProperty.attom_use_type !== undefined) transformed.attom_sell_property_use_type = appProperty.attom_use_type;
  if (appProperty.attom_year_built !== undefined) transformed.attom_sell_property_year_built = Number(appProperty.attom_year_built);
  if (appProperty.attom_levels !== undefined) transformed.attom_sell_property_levels = Number(appProperty.attom_levels);
  if (appProperty.attom_finished_sf !== undefined) transformed.attom_sell_property_finished_sf = Number(appProperty.attom_finished_sf);
  if (appProperty.attom_siding !== undefined) transformed.attom_sell_property_siding = appProperty.attom_siding;
  if (appProperty.attom_roof_type !== undefined) transformed.attom_sell_property_roof_type = appProperty.attom_roof_type;
  if (appProperty.attom_central_air !== undefined) transformed.attom_sell_property_central_air = appProperty.attom_central_air;
  if (appProperty.attom_heating_type !== undefined) transformed.attom_sell_property_heating_type = appProperty.attom_heating_type;
  if (appProperty.attom_heating_fuel !== undefined) transformed.attom_sell_property_heating_fuel_type = appProperty.attom_heating_fuel;
  if (appProperty.attom_fireplace_number !== undefined) transformed.attom_sell_property_fireplace_number = Number(appProperty.attom_fireplace_number);
  if (appProperty.attom_lot_size !== undefined) transformed.attom_sell_property_lot_size = Number(appProperty.attom_lot_size);
  if (appProperty.attom_lot_zoning !== undefined) transformed.attom_sell_property_lot_zoning = appProperty.attom_lot_zoning;
  if (appProperty.attom_mortgage_amount !== undefined) transformed.attom_sell_property_mortgage_amount = Number(appProperty.attom_mortgage_amount);
  if (appProperty.attom_2nd_mortgage !== undefined) transformed.attom_sell_property_2nd_mortgage_amount = Number(appProperty.attom_2nd_mortgage);
    
  // ATTOM Fields from assessment/detail endpoint
  if (appProperty.attom_architectural_style !== undefined) transformed.attom_sell_property_architectural_style = appProperty.attom_architectural_style;
  if (appProperty.attom_water_source !== undefined) transformed.attom_sell_property_water_source = appProperty.attom_water_source;
  if (appProperty.attom_sewer_type !== undefined) transformed.attom_sell_property_sewer_type = appProperty.attom_sewer_type;
  if (appProperty.attom_pool_type !== undefined) transformed.attom_sell_property_pool_type = appProperty.attom_pool_type;
  if (appProperty.attom_garage !== undefined) transformed.attom_sell_property_garage = appProperty.attom_garage;
  if (appProperty.attom_flooring !== undefined) transformed.attom_sell_property_flooring_types = appProperty.attom_flooring;
  if (appProperty.attom_taxes !== undefined) transformed.attom_sell_property_taxes = Number(appProperty.attom_taxes);
  if (appProperty.attom_designated_historic !== undefined) transformed.attom_sell_property_designated_historic = appProperty.attom_designated_historic;
    
  // ATTOM Legal and tax fields
  if (appProperty.attom_legal_desc1 !== undefined) transformed.attom_property_legal_description1 = appProperty.attom_legal_desc1;
  if (appProperty.attom_legal_desc2 !== undefined) transformed.attom_property_legal_description2 = appProperty.attom_legal_desc2;
  if (appProperty.attom_legal_desc3 !== undefined) transformed.attom_property_legal_description3 = appProperty.attom_legal_desc3;
  if (appProperty.attom_tax_id !== undefined) transformed.attom_property_tax_id = appProperty.attom_tax_id;
    
  // ATTOM School data from detailwithschools endpoint  
  if (appProperty.attom_school_district !== undefined) transformed.attom_sell_property_school_district = appProperty.attom_school_district;
  if (appProperty.attom_elementary_school !== undefined) transformed.attom_sell_property_school_district_elementary = appProperty.attom_elementary_school;
  if (appProperty.attom_middle_school !== undefined) transformed.attom_sell_property_school_district_middle = appProperty.attom_middle_school;
  if (appProperty.attom_high_school !== undefined) transformed.attom_sell_property_school_district_high = appProperty.attom_high_school;
  
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