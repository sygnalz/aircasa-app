// Data transformation utilities for mapping between Airtable and app formats

// Transform Airtable property record to app format
export function transformProperty(airtableRecord) {
  return {
    id: airtableRecord.id,
    title: airtableRecord.Name || airtableRecord.title,
    description: airtableRecord.Description || '',
    location: airtableRecord.Location || airtableRecord.location,
    price: airtableRecord['Price per Night'] || airtableRecord.price || 0,
    bedrooms: airtableRecord.Bedrooms || airtableRecord.bedrooms || 0,
    bathrooms: airtableRecord.Bathrooms || airtableRecord.bathrooms || 0,
    area: airtableRecord['Square Feet'] || airtableRecord.area || 0,
    status: (airtableRecord.Status || airtableRecord.status || 'active').toLowerCase(),
    propertyType: airtableRecord['Property Type'] || airtableRecord.propertyType || 'Unknown',
    bookings: airtableRecord['Total Bookings'] || airtableRecord.bookings || 0,
    revenue: airtableRecord['Total Revenue'] || airtableRecord.revenue || 0,
    rating: airtableRecord['Average Rating'] || airtableRecord.rating || 0,
    reviews: airtableRecord['Review Count'] || airtableRecord.reviews || 0,
    images: Array.isArray(airtableRecord.Images) 
      ? airtableRecord.Images 
      : airtableRecord.images || [],
    amenities: Array.isArray(airtableRecord.Amenities)
      ? airtableRecord.Amenities
      : airtableRecord.amenities || [],
    ownerEmail: airtableRecord['Owner Email'] || airtableRecord.ownerEmail,
    createdDate: airtableRecord['Created Date'] || airtableRecord.createdDate,
    lastUpdated: airtableRecord['Last Updated'] || airtableRecord.lastUpdated,
    _createdTime: airtableRecord._createdTime
  };
}

// Transform app property format to Airtable format
export function transformPropertyForAirtable(appProperty) {
  return {
    Name: appProperty.title,
    Description: appProperty.description,
    Location: appProperty.location,
    'Price per Night': appProperty.price,
    Bedrooms: appProperty.bedrooms,
    Bathrooms: appProperty.bathrooms,
    'Square Feet': appProperty.area,
    Status: appProperty.status,
    'Property Type': appProperty.propertyType,
    'Total Bookings': appProperty.bookings,
    'Total Revenue': appProperty.revenue,
    'Average Rating': appProperty.rating,
    'Review Count': appProperty.reviews,
    Images: appProperty.images,
    Amenities: appProperty.amenities,
    'Owner Email': appProperty.ownerEmail,
    'Last Updated': new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  };
}

// Transform Airtable user record to app format
export function transformUser(airtableRecord) {
  return {
    id: airtableRecord.id,
    fullName: airtableRecord['Full Name'] || airtableRecord.fullName,
    email: airtableRecord.Email || airtableRecord.email,
    phoneNumber: airtableRecord['Phone Number'] || airtableRecord.phoneNumber,
    userType: airtableRecord['User Type'] || airtableRecord.userType || 'Guest',
    status: (airtableRecord.Status || airtableRecord.status || 'active').toLowerCase(),
    totalProperties: airtableRecord['Total Properties'] || airtableRecord.totalProperties || 0,
    totalRevenue: airtableRecord['Total Revenue'] || airtableRecord.totalRevenue || 0,
    totalBookings: airtableRecord['Total Bookings'] || airtableRecord.totalBookings || 0,
    totalSpent: airtableRecord['Total Spent'] || airtableRecord.totalSpent || 0,
    joinDate: airtableRecord['Join Date'] || airtableRecord.joinDate,
    lastLogin: airtableRecord['Last Login'] || airtableRecord.lastLogin,
    profilePicture: airtableRecord['Profile Picture'] || airtableRecord.profilePicture,
    address: airtableRecord.Address || airtableRecord.address,
    preferredContactMethod: airtableRecord['Preferred Contact Method'] || airtableRecord.preferredContactMethod || 'email',
    verificationStatus: airtableRecord['Verification Status'] || airtableRecord.verificationStatus || 'pending',
    _createdTime: airtableRecord._createdTime
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
    'Preferred Contact Method': appUser.preferredContactMethod,
    'Verification Status': appUser.verificationStatus,
    'Last Login': new Date().toISOString().split('T')[0]
  };
}

// Transform Airtable booking record to app format
export function transformBooking(airtableRecord) {
  return {
    id: airtableRecord.id,
    bookingId: airtableRecord['Booking ID'] || airtableRecord.bookingId,
    propertyName: airtableRecord['Property Name'] || airtableRecord.propertyName,
    propertyId: airtableRecord['Property ID'] || airtableRecord.propertyId,
    guestName: airtableRecord['Guest Name'] || airtableRecord.guestName,
    guestEmail: airtableRecord['Guest Email'] || airtableRecord.guestEmail,
    checkInDate: airtableRecord['Check-in Date'] || airtableRecord.checkInDate,
    checkOutDate: airtableRecord['Check-out Date'] || airtableRecord.checkOutDate,
    nights: airtableRecord.Nights || airtableRecord.nights || 0,
    totalAmount: airtableRecord['Total Amount'] || airtableRecord.totalAmount || 0,
    status: (airtableRecord.Status || airtableRecord.status || 'pending').toLowerCase(),
    bookingDate: airtableRecord['Booking Date'] || airtableRecord.bookingDate,
    numberOfGuests: airtableRecord['Number of Guests'] || airtableRecord.numberOfGuests || 1,
    specialRequests: airtableRecord['Special Requests'] || airtableRecord.specialRequests,
    paymentStatus: airtableRecord['Payment Status'] || airtableRecord.paymentStatus || 'pending',
    paymentMethod: airtableRecord['Payment Method'] || airtableRecord.paymentMethod,
    cancellationPolicy: airtableRecord['Cancellation Policy'] || airtableRecord.cancellationPolicy,
    _createdTime: airtableRecord._createdTime
  };
}

// Transform Airtable analytics record to app format
export function transformAnalytics(airtableRecord) {
  return {
    id: airtableRecord.id,
    date: airtableRecord.Date || airtableRecord.date,
    totalRevenue: airtableRecord['Total Revenue'] || airtableRecord.totalRevenue || 0,
    totalBookings: airtableRecord['Total Bookings'] || airtableRecord.totalBookings || 0,
    occupancyRate: airtableRecord['Occupancy Rate'] || airtableRecord.occupancyRate || 0,
    averageDailyRate: airtableRecord['Average Daily Rate'] || airtableRecord.averageDailyRate || 0,
    newUsers: airtableRecord['New Users'] || airtableRecord.newUsers || 0,
    propertyViews: airtableRecord['Property Views'] || airtableRecord.propertyViews || 0,
    conversionRate: airtableRecord['Conversion Rate'] || airtableRecord.conversionRate || 0,
    topProperty: airtableRecord['Top Property'] || airtableRecord.topProperty,
    topLocation: airtableRecord['Top Location'] || airtableRecord.topLocation,
    _createdTime: airtableRecord._createdTime
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

// Utility function to safely get nested field values
export function getFieldValue(record, fieldPath, defaultValue = null) {
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

// Validate required fields for different record types
export function validateProperty(property) {
  const required = ['title', 'location', 'price'];
  const missing = required.filter(field => !property[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields for property: ${missing.join(', ')}`);
  }
  
  return true;
}

export function validateUser(user) {
  const required = ['fullName', 'email'];
  const missing = required.filter(field => !user[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields for user: ${missing.join(', ')}`);
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.email)) {
    throw new Error('Invalid email format');
  }
  
  return true;
}
