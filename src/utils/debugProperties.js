// Debug utility to check Properties table for specific user
import { properties } from '../api/functions';

export async function debugUserProperties(userEmail) {
  try {
    console.log(`🔍 DEBUG: Checking Properties table for ${userEmail}`);
    
    // Get all properties
    const allData = await properties.list({ limit: 200 });
    console.log(`📊 DEBUG: Found ${allData.items.length} total properties`);
    
    // Log first few properties to see structure
    console.log('📋 DEBUG: Sample properties structure:');
    allData.items.slice(0, 3).forEach((prop, index) => {
      console.log(`Property ${index + 1}:`, {
        id: prop.id,
        title: prop.title,
        ownerEmail: prop.ownerEmail,
        app_email: prop.app_email,
        app_owner_user_id: prop.app_owner_user_id,
        allFields: Object.keys(prop)
      });
    });
    
    // Filter for specific user
    const userProperties = allData.items.filter(property => {
      return (
        property.ownerEmail === userEmail ||
        property.app_email === userEmail ||
        (property.app_email && property.app_email.toLowerCase() === userEmail.toLowerCase())
      );
    });
    
    console.log(`✅ DEBUG: Found ${userProperties.length} properties for ${userEmail}`);
    
    if (userProperties.length > 0) {
      console.log('🏠 DEBUG: User properties:', userProperties.map(p => ({
        id: p.id,
        title: p.title,
        app_email: p.app_email,
        ownerEmail: p.ownerEmail
      })));
    } else {
      // Check if any properties have similar email
      const similarEmails = allData.items
        .map(p => p.app_email || p.ownerEmail)
        .filter(Boolean)
        .filter(email => email.toLowerCase().includes('charles') || email.toLowerCase().includes('heflin'));
      
      console.log('🔍 DEBUG: Similar emails found:', similarEmails);
      
      // Check all unique app_email values
      const allEmails = [...new Set(allData.items
        .map(p => p.app_email)
        .filter(Boolean))];
      console.log('📧 DEBUG: All app_email values in Properties table:', allEmails);
    }
    
    return userProperties;
    
  } catch (error) {
    console.error('❌ DEBUG: Error checking properties:', error);
    return [];
  }
}

// Call this automatically when loaded
if (typeof window !== 'undefined') {
  window.debugUserProperties = debugUserProperties;
  console.log('🛠️ DEBUG: debugUserProperties function available on window object');
}