// Custom data transformers for user's specific Airtable structure
// Generated based on analysis of appPEvLMTmfiUZw14

// Properties table transformer (59 fields analyzed)
export function transformUserProperty(airtableRecord) {
  if (!airtableRecord) return null;
  
  return {
    // Core identifiers
    id: airtableRecord.id,
    propertyId: airtableRecord.property_id || airtableRecord.internal_property_id,
    attomId: airtableRecord.attom_id,
    
    // Display information  
    title: airtableRecord.attom_sell_property_subdvision_name || 
           airtableRecord.attom_sell_property_municipality_name ||
           `${airtableRecord.app_street || airtableRecord.attom_sell_property_address_street}`,
           
    // Location (prioritize ATTOM data, fallback to app data)
    location: {
      street: airtableRecord.attom_sell_property_address_street || airtableRecord.app_street,
      city: airtableRecord.attom_sell_property_address_city || airtableRecord.app_city,
      state: airtableRecord.attom_sell_property_address_state || airtableRecord.app_state,
      zipCode: airtableRecord.attom_sell_property_address_zip || airtableRecord.app_zip_code,
      country: airtableRecord.attom_sell_property_address_country || 'US',
      fullAddress: airtableRecord.app_address
    },
    
    // Property characteristics
    bedrooms: airtableRecord.app_bedrooms,
    bathrooms: airtableRecord.app_bathrooms,
    propertyType: airtableRecord.app_property_type || airtableRecord.attom_sell_property_use_type,
    yearBuilt: airtableRecord.attom_sell_property_year_built,
    squareFootage: airtableRecord.attom_sell_property_finished_sf,
    lotSize: airtableRecord.attom_sell_property_lot_size,
    
    // Financial information
    estimatedValue: airtableRecord.app_estimated_value,
    mortgageAmount: airtableRecord.attom_sell_property_mortgage_amount,
    secondMortgageAmount: airtableRecord.attom_sell_property_2nd_mortgage_amount,
    propertyTaxes: airtableRecord.attom_sell_property_taxes,
    
    // Property features
    architecturalStyle: airtableRecord.attom_sell_property_architectural_style,
    centralAir: airtableRecord.attom_sell_property_central_air,
    heatingType: airtableRecord.attom_sell_property_heating_type,
    heatingFuel: airtableRecord.attom_sell_property_heating_fuel_type,
    fireplaces: airtableRecord.attom_sell_property_fireplace_number,
    poolType: airtableRecord.attom_sell_property_pool_type,
    roofType: airtableRecord.attom_sell_property_roof_type,
    siding: airtableRecord.attom_sell_property_siding,
    flooringTypes: airtableRecord.attom_sell_property_flooring_types,
    
    // Owner information
    ownerUserId: airtableRecord.app_owner_user_id,
    ownerFirstName: airtableRecord.app_first_name,
    ownerLastName: airtableRecord.app_last_name,
    ownerEmail: airtableRecord.app_email,
    
    // Status tracking
    isBuyingHome: airtableRecord.app_is_buying_home || airtableRecord.is_buying_a_home,
    propertyIntakeCompleted: airtableRecord.property_intake_completed,
    personalFinancialCompleted: airtableRecord.personal_financial_completed,
    photosCompleted: airtableRecord.photos_completed,
    consultationCompleted: airtableRecord.consultation_completed,
    incompleteTasks: airtableRecord.incomplete_tasks,
    
    // Relationships
    conversations: airtableRecord.Conversations || [],
    userLinks: airtableRecord.app_user_link || [],
    
    // Additional ATTOM data
    legalDescription: airtableRecord.attom_property_legal_description1,
    taxId: airtableRecord.attom_property_tax_id,
    county: airtableRecord.attom_sell_property_county,
    schoolDistrict: {
      elementary: airtableRecord.attom_sell_property_school_district_elementary,
      middle: airtableRecord.attom_sell_property_school_district_middle,
      high: airtableRecord.attom_sell_property_school_district_high
    },
    zoning: airtableRecord.attom_sell_property_lot_zoning,
    sewerType: airtableRecord.attom_sell_property_sewer_type,
    designatedHistoric: airtableRecord.attom_sell_property_designated_historic,
    levels: airtableRecord.attom_sell_property_levels,
    
    // Media
    imageUrl: airtableRecord.app_image_url,
    
    // Metadata
    _createdTime: airtableRecord._createdTime,
    _originalFields: airtableRecord // Keep original for debugging
  };
}

// Users table transformer (12 fields analyzed)
export function transformUserProfile(airtableRecord) {
  if (!airtableRecord) return null;
  
  return {
    id: airtableRecord.id,
    userId: airtableRecord.app_owner_user_id,
    
    // Personal information
    firstName: airtableRecord.first_name,
    lastName: airtableRecord.last_name,
    fullName: `${airtableRecord.first_name} ${airtableRecord.last_name}`.trim(),
    email: airtableRecord.email,
    
    // System information
    role: Array.isArray(airtableRecord.role) ? airtableRecord.role : [airtableRecord.role],
    referralId: airtableRecord.referral_id,
    
    // Relationships
    properties: airtableRecord['Properties 2'] || [],
    conversations: airtableRecord.conversations || [],
    aiAccessLayer: airtableRecord.ai_access_layer || [],
    
    // Activity summaries
    propertiesSummary: airtableRecord.properties_summary,
    allIncompleteTasks: airtableRecord.all_incomplete_tasks,
    fullChatHistory: airtableRecord.full_chat_history,
    
    // Metadata
    _createdTime: airtableRecord._createdTime,
    _originalFields: airtableRecord
  };
}

// Conversations table transformer (8 fields analyzed)
export function transformUserConversation(airtableRecord) {
  if (!airtableRecord) return null;
  
  return {
    id: airtableRecord.id,
    conversationId: airtableRecord.conversation_id,
    userId: airtableRecord.app_owner_user_id,
    
    // Conversation details
    displayName: airtableRecord.display_name,
    content: airtableRecord.conversations,
    role: airtableRecord.role, // 'user' or 'assistant'
    timestamp: airtableRecord.timestamp,
    
    // Relationships
    user: airtableRecord.user || [],
    properties: airtableRecord.properties || [],
    
    // Metadata
    _createdTime: airtableRecord._createdTime,
    _originalFields: airtableRecord
  };
}

// AI Access Layer transformer (6 fields analyzed)
export function transformUserAIAccess(airtableRecord) {
  if (!airtableRecord) return null;
  
  return {
    id: airtableRecord.id,
    autonumber: airtableRecord.autonumber,
    
    // User relationships
    users: airtableRecord.app_owner_user_id || [],
    userProfiles: airtableRecord.user || [],
    
    // AI permissions & data
    allProperties: airtableRecord.all_properties || [],
    chatSummary: airtableRecord.chat_summary || [],
    openTasks: airtableRecord.open_tasks || [],
    
    // Metadata
    _createdTime: airtableRecord._createdTime,
    _originalFields: airtableRecord
  };
}

// Aggregate property data (combines property + user info)
export function transformUserPropertyWithOwner(propertyRecord, userRecord) {
  const property = transformUserProperty(propertyRecord);
  const user = transformUserProfile(userRecord);
  
  if (!property) return null;
  
  return {
    ...property,
    owner: user ? {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role
    } : null
  };
}

// Dashboard stats transformer
export function transformUserDashboardStats(properties = [], users = [], conversations = []) {
  const transformedProperties = properties.map(p => transformUserProperty(p)).filter(Boolean);
  const transformedUsers = users.map(u => transformUserProfile(u)).filter(Boolean);
  const transformedConversations = conversations.map(c => transformUserConversation(c)).filter(Boolean);
  
  return {
    totalProperties: transformedProperties.length,
    totalUsers: transformedUsers.length,
    totalConversations: transformedConversations.length,
    
    // Property stats
    propertiesWithEstimatedValue: transformedProperties.filter(p => p.estimatedValue).length,
    averageEstimatedValue: transformedProperties
      .filter(p => p.estimatedValue)
      .reduce((sum, p) => sum + p.estimatedValue, 0) / 
      Math.max(transformedProperties.filter(p => p.estimatedValue).length, 1),
    
    // Completion stats
    completedIntakes: transformedProperties.filter(p => p.propertyIntakeCompleted).length,
    completedConsultations: transformedProperties.filter(p => p.consultationCompleted).length,
    completedPhotos: transformedProperties.filter(p => p.photosCompleted).length,
    
    // User engagement
    recentConversations: transformedConversations
      .filter(c => c.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5),
    
    // Task tracking
    totalIncompleteTasks: transformedProperties
      .map(p => p.incompleteTasks)
      .filter(Boolean)
      .join('\n').split('\n').length
  };
}

// Export all transformers
export default {
  transformUserProperty,
  transformUserProfile,
  transformUserConversation,
  transformUserAIAccess,
  transformUserPropertyWithOwner,
  transformUserDashboardStats
};