// Data transformation utilities for mapping between Airtable and app formats
import { 
  PROPERTIES_FIELD_MAPPING, 
  USERS_FIELD_MAPPING, 
  BOOKINGS_FIELD_MAPPING, 
  ANALYTICS_FIELD_MAPPING, 
  ROLES_FIELD_MAPPING,
  getFieldValue,
  validateRecord
} from '../config/fieldMappings.js';

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

// Transform Airtable booking record to app format using comprehensive field mapping
export function transformBooking(airtableRecord) {
  console.log('🔄 Transforming Airtable booking record:', {
    id: airtableRecord.id,
    availableFields: Object.keys(airtableRecord).slice(0, 10)
  });
  
  try {
    const transformed = {
      id: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'id') || airtableRecord.id,
      bookingId: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'bookingId'),
      
      // Property Information
      propertyId: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'propertyId'),
      propertyName: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'propertyName'),
      
      // Guest Information
      guestName: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'guestName'),
      guestEmail: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'guestEmail'),
      guestPhone: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'guestPhone'),
      
      // Booking Details
      checkInDate: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'checkInDate'),
      checkOutDate: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'checkOutDate'),
      nights: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'nights'),
      numberOfGuests: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'numberOfGuests'),
      
      // Financial Information
      totalAmount: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'totalAmount'),
      baseRate: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'baseRate'),
      taxes: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'taxes'),
      fees: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'fees'),
      
      // Status Information
      status: (getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'status') || 'pending').toLowerCase(),
      paymentStatus: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'paymentStatus'),
      paymentMethod: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'paymentMethod'),
      
      // Additional Information
      specialRequests: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'specialRequests'),
      cancellationPolicy: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'cancellationPolicy'),
      
      // Dates
      bookingDate: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, 'bookingDate'),
      
      // System Fields
      _createdTime: getFieldValue(airtableRecord, BOOKINGS_FIELD_MAPPING, '_createdTime') || airtableRecord._createdTime
    };
    
    console.log('✅ Booking transformed successfully:', {
      id: transformed.id,
      bookingId: transformed.bookingId,
      propertyName: transformed.propertyName,
      guestEmail: transformed.guestEmail
    });
    
    return transformed;
  } catch (error) {
    console.error('❌ Error transforming booking:', error);
    // Return a basic transformation as fallback
    return {
      id: airtableRecord.id,
      bookingId: airtableRecord['Booking ID'] || airtableRecord.bookingId || '',
      guestName: airtableRecord['Guest Name'] || airtableRecord.guestName || '',
      guestEmail: airtableRecord['Guest Email'] || airtableRecord.guestEmail || '',
      status: 'pending',
      _createdTime: airtableRecord._createdTime
    };
  }
}

// Transform Airtable analytics record to app format using comprehensive field mapping
export function transformAnalytics(airtableRecord) {
  console.log('🔄 Transforming Airtable analytics record:', {
    id: airtableRecord.id,
    availableFields: Object.keys(airtableRecord).slice(0, 10)
  });
  
  try {
    const transformed = {
      id: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'id') || airtableRecord.id,
      date: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'date'),
      
      // Revenue Metrics
      totalRevenue: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'totalRevenue'),
      averageDailyRate: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'averageDailyRate'),
      revenuePerAvailableRoom: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'revenuePerAvailableRoom'),
      
      // Booking Metrics
      totalBookings: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'totalBookings'),
      occupancyRate: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'occupancyRate'),
      averageStayLength: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'averageStayLength'),
      
      // User Metrics
      newUsers: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'newUsers'),
      activeUsers: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'activeUsers'),
      
      // Performance Metrics
      propertyViews: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'propertyViews'),
      conversionRate: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'conversionRate'),
      clickThroughRate: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'clickThroughRate'),
      
      // Top Performers
      topProperty: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'topProperty'),
      topLocation: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'topLocation'),
      topRevenue: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, 'topRevenue'),
      
      // System Fields
      _createdTime: getFieldValue(airtableRecord, ANALYTICS_FIELD_MAPPING, '_createdTime') || airtableRecord._createdTime
    };
    
    console.log('✅ Analytics transformed successfully:', {
      id: transformed.id,
      date: transformed.date,
      totalRevenue: transformed.totalRevenue,
      totalBookings: transformed.totalBookings
    });
    
    return transformed;
  } catch (error) {
    console.error('❌ Error transforming analytics:', error);
    // Return a basic transformation as fallback
    return {
      id: airtableRecord.id,
      date: airtableRecord.Date || airtableRecord.date,
      totalRevenue: airtableRecord['Total Revenue'] || 0,
      totalBookings: airtableRecord['Total Bookings'] || 0,
      _createdTime: airtableRecord._createdTime
    };
  }
}

// Transform Airtable role record to app format using comprehensive field mapping
export function transformRole(airtableRecord) {
  console.log('🔄 Transforming Airtable role record:', {
    id: airtableRecord.id,
    availableFields: Object.keys(airtableRecord).slice(0, 10)
  });
  
  try {
    const transformed = {
      id: getFieldValue(airtableRecord, ROLES_FIELD_MAPPING, 'id') || airtableRecord.id,
      userId: getFieldValue(airtableRecord, ROLES_FIELD_MAPPING, 'userId'),
      email: getFieldValue(airtableRecord, ROLES_FIELD_MAPPING, 'email'),
      role: getFieldValue(airtableRecord, ROLES_FIELD_MAPPING, 'role'),
      permissions: getFieldValue(airtableRecord, ROLES_FIELD_MAPPING, 'permissions'),
      status: (getFieldValue(airtableRecord, ROLES_FIELD_MAPPING, 'status') || 'active').toLowerCase(),
      assignedDate: getFieldValue(airtableRecord, ROLES_FIELD_MAPPING, 'assignedDate'),
      assignedBy: getFieldValue(airtableRecord, ROLES_FIELD_MAPPING, 'assignedBy'),
      
      // System Fields
      _createdTime: getFieldValue(airtableRecord, ROLES_FIELD_MAPPING, '_createdTime') || airtableRecord._createdTime
    };
    
    console.log('✅ Role transformed successfully:', {
      id: transformed.id,
      email: transformed.email,
      role: transformed.role,
      status: transformed.status
    });
    
    return transformed;
  } catch (error) {
    console.error('❌ Error transforming role:', error);
    // Return a basic transformation as fallback
    return {
      id: airtableRecord.id,
      email: airtableRecord.Email || airtableRecord.email || '',
      role: airtableRecord.Role || airtableRecord.role || 'User',
      status: 'active',
      _createdTime: airtableRecord._createdTime
    };
  }
}

// Transform app property format to Airtable format
export function transformPropertyForAirtable(appProperty) {
  return {
    // Use the primary field names from our mapping
    Name: appProperty.title,
    Description: appProperty.description,
    app_address: appProperty.location, // Use app_address as primary field
    app_city: appProperty.city,
    app_state: appProperty.state,
    app_country: appProperty.country,
    app_zip: appProperty.zipCode,
    app_property_type: appProperty.propertyType,
    app_bedrooms: appProperty.bedrooms,
    app_bathrooms: appProperty.bathrooms,
    app_square_feet: appProperty.area,
    app_price: appProperty.price,
    app_status: appProperty.status,
    app_total_bookings: appProperty.bookings,
    app_total_revenue: appProperty.revenue,
    app_average_rating: appProperty.rating,
    app_review_count: appProperty.reviews,
    app_images: appProperty.images,
    app_amenities: appProperty.amenities,
    app_email: appProperty.ownerEmail,
    app_owner_user_id: appProperty.app_owner_user_id,
    app_last_updated: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  };
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

// Transform app booking format to Airtable format
export function transformBookingForAirtable(appBooking) {
  return {
    'Booking ID': appBooking.bookingId,
    'Property ID': appBooking.propertyId,
    'Property Name': appBooking.propertyName,
    'Guest Name': appBooking.guestName,
    'Guest Email': appBooking.guestEmail,
    'Guest Phone': appBooking.guestPhone,
    'Check-in Date': appBooking.checkInDate,
    'Check-out Date': appBooking.checkOutDate,
    Nights: appBooking.nights,
    'Number of Guests': appBooking.numberOfGuests,
    'Total Amount': appBooking.totalAmount,
    'Base Rate': appBooking.baseRate,
    Taxes: appBooking.taxes,
    Fees: appBooking.fees,
    Status: appBooking.status,
    'Payment Status': appBooking.paymentStatus,
    'Payment Method': appBooking.paymentMethod,
    'Special Requests': appBooking.specialRequests,
    'Cancellation Policy': appBooking.cancellationPolicy,
    'Booking Date': appBooking.bookingDate
  };
}

// Transform app analytics format to Airtable format
export function transformAnalyticsForAirtable(appAnalytics) {
  return {
    Date: appAnalytics.date,
    'Total Revenue': appAnalytics.totalRevenue,
    'Average Daily Rate': appAnalytics.averageDailyRate,
    'Revenue Per Available Room': appAnalytics.revenuePerAvailableRoom,
    'Total Bookings': appAnalytics.totalBookings,
    'Occupancy Rate': appAnalytics.occupancyRate,
    'Average Stay Length': appAnalytics.averageStayLength,
    'New Users': appAnalytics.newUsers,
    'Active Users': appAnalytics.activeUsers,
    'Property Views': appAnalytics.propertyViews,
    'Conversion Rate': appAnalytics.conversionRate,
    'Click Through Rate': appAnalytics.clickThroughRate,
    'Top Property': appAnalytics.topProperty,
    'Top Location': appAnalytics.topLocation,
    'Top Revenue': appAnalytics.topRevenue
  };
}

// Transform app role format to Airtable format
export function transformRoleForAirtable(appRole) {
  return {
    'User ID': appRole.userId,
    Email: appRole.email,
    Role: appRole.role,
    Permissions: appRole.permissions,
    Status: appRole.status,
    'Assigned Date': appRole.assignedDate,
    'Assigned By': appRole.assignedBy
  };
}

// Transform multiple records
export function transformProperties(airtableRecords) {
  return airtableRecords.map(transformProperty);
}

export function transformUsers(airtableRecords) {
  return airtableRecords.map(transformUser);
}

export function transformBookings(airtableRecords) {
  return airtableRecords.map(transformBooking);
}

export function transformAnalyticsData(airtableRecords) {
  return airtableRecords.map(transformAnalytics);
}

export function transformRoles(airtableRecords) {
  return airtableRecords.map(transformRole);
}

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

export function validateBooking(booking) {
  try {
    validateRecord(booking, BOOKINGS_FIELD_MAPPING, 'booking');
    
    // Additional custom validations
    if (booking.checkInDate && booking.checkOutDate) {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      if (checkOut <= checkIn) {
        throw new Error('Check-out date must be after check-in date');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Booking validation failed:', error);
    throw error;
  }
}

export function validateAnalytics(analytics) {
  try {
    validateRecord(analytics, ANALYTICS_FIELD_MAPPING, 'analytics');
    return true;
  } catch (error) {
    console.error('Analytics validation failed:', error);
    throw error;
  }
}

export function validateRole(role) {
  try {
    validateRecord(role, ROLES_FIELD_MAPPING, 'role');
    
    // Additional custom validations
    const validRoles = ['User', 'Admin', 'AI', 'Agent', 'VA'];
    if (role.role && !validRoles.includes(role.role)) {
      throw new Error(`Invalid role: ${role.role}. Must be one of: ${validRoles.join(', ')}`);
    }
    
    return true;
  } catch (error) {
    console.error('Role validation failed:', error);
    throw error;
  }
}

// Enhanced transformation and validation utilities
export const TRANSFORM_CONFIG = {
  logTransformations: true,
  validateOnTransform: false, // Set to true to validate after each transformation
  fallbackToBasicTransform: true // Set to false to throw errors instead of falling back
};

// Generic transformation function
export function transformRecord(airtableRecord, recordType) {
  const transformers = {
    property: transformProperty,
    user: transformUser,
    booking: transformBooking,
    analytics: transformAnalytics,
    role: transformRole
  };
  
  const transformer = transformers[recordType.toLowerCase()];
  if (!transformer) {
    throw new Error(`No transformer found for record type: ${recordType}`);
  }
  
  return transformer(airtableRecord);
}

// Generic validation function
export function validateTransformedRecord(record, recordType) {
  const validators = {
    property: validateProperty,
    user: validateUser,
    booking: validateBooking,
    analytics: validateAnalytics,
    role: validateRole
  };
  
  const validator = validators[recordType.toLowerCase()];
  if (!validator) {
    throw new Error(`No validator found for record type: ${recordType}`);
  }
  
  return validator(record);
}

// Export field mappings for external use
export {
  PROPERTIES_FIELD_MAPPING,
  USERS_FIELD_MAPPING,
  BOOKINGS_FIELD_MAPPING,
  ANALYTICS_FIELD_MAPPING,
  ROLES_FIELD_MAPPING,
  getFieldValue,
  validateRecord
} from '../config/fieldMappings.js';