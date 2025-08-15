// Test script to validate field mappings
import { transformProperty } from '../lib/dataTransformers.js';

// Mock Airtable property record with various field formats
const mockAirtableRecord = {
  id: 'rec123test',
  
  // Test all the different field name variations
  app_name: 'Test Property from app_name',
  Name: 'Test Property from Name',
  property_name: 'Test Property from property_name',
  
  app_address: '123 Test Street, Test City, CA 90210',
  Location: 'Fallback Location',
  address: 'Fallback Address',
  
  app_email: 'charlesheflin@gmail.com',
  'Owner Email': 'fallback@email.com',
  
  app_bedrooms: 3,
  Bedrooms: 2,
  bedrooms: 1,
  
  app_bathrooms: 2.5,
  Bathrooms: 2,
  bathrooms: 1.5,
  
  app_price: 250,
  'Price per Night': 200,
  price: 150,
  
  app_property_type: 'Condo',
  'Property Type': 'House',
  propertyType: 'Apartment',
  
  app_status: 'active',
  Status: 'inactive',
  status: 'pending',
  
  _createdTime: '2024-01-15T10:30:00.000Z'
};

// Test the transformation
console.log('🧪 Testing Field Mappings...');
console.log('📋 Original Airtable Record:', mockAirtableRecord);

try {
  const transformed = transformProperty(mockAirtableRecord);
  
  console.log('✅ Transformed Property:', transformed);
  
  // Verify that primary fields take precedence
  console.log('\n🔍 Field Mapping Verification:');
  console.log(`Title: ${transformed.title} (should be from app_name)`);
  console.log(`Location: ${transformed.location} (should be from app_address)`);
  console.log(`Owner Email: ${transformed.app_email} (should be from app_email)`);
  console.log(`Bedrooms: ${transformed.bedrooms} (should be from app_bedrooms: 3)`);
  console.log(`Bathrooms: ${transformed.bathrooms} (should be from app_bathrooms: 2.5)`);
  console.log(`Price: ${transformed.price} (should be from app_price: 250)`);
  console.log(`Property Type: ${transformed.propertyType} (should be from app_property_type: Condo)`);
  console.log(`Status: ${transformed.status} (should be from app_status: active)`);
  
  // Test that all expected fields are present
  const expectedFields = [
    'id', 'title', 'description', 'location', 'city', 'state', 'country', 'zipCode',
    'propertyType', 'bedrooms', 'bathrooms', 'area', 'price', 'ownerEmail', 'app_email',
    'status', 'bookings', 'revenue', 'rating', 'reviews', '_createdTime'
  ];
  
  console.log('\n📊 Field Coverage:');
  expectedFields.forEach(field => {
    const hasField = transformed.hasOwnProperty(field);
    const value = transformed[field];
    console.log(`${hasField ? '✅' : '❌'} ${field}: ${value}`);
  });
  
  return transformed;
  
} catch (error) {
  console.error('❌ Field mapping test failed:', error);
  throw error;
}

export default mockAirtableRecord;