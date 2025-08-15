/**
 * Direct Airtable Connection Test
 * Tests the raw Airtable connection to debug parameter issues
 */

import Airtable from 'airtable';

// Get environment variables
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const PROPERTIES_TABLE = import.meta.env.VITE_AIRTABLE_PROPERTIES_TABLE || 'Properties';

console.log('🔧 Testing Direct Airtable Connection');
console.log('API Key:', AIRTABLE_API_KEY ? `${AIRTABLE_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('Base ID:', AIRTABLE_BASE_ID);
console.log('Properties Table:', PROPERTIES_TABLE);

// Test 1: Basic connection without any parameters
export async function testBasicConnection() {
  try {
    console.log('\n🧪 Test 1: Basic Connection (no parameters)');
    
    Airtable.configure({
      endpointUrl: 'https://api.airtable.com',
      apiKey: AIRTABLE_API_KEY
    });
    
    const base = Airtable.base(AIRTABLE_BASE_ID);
    const table = base(PROPERTIES_TABLE);
    
    const records = [];
    
    // Simplest possible query - no options at all
    await table.select().eachPage((pageRecords, fetchNextPage) => {
      console.log(`📄 Got ${pageRecords.length} records in this page`);
      pageRecords.forEach((record, index) => {
        console.log(`Record ${index + 1}:`, {
          id: record.id,
          fields: Object.keys(record.fields),
          fieldCount: Object.keys(record.fields).length
        });
        
        // Check specifically for email fields
        const fields = record.fields;
        const emailFields = Object.keys(fields).filter(key => 
          key.toLowerCase().includes('email') || key.toLowerCase().includes('app_')
        );
        
        if (emailFields.length > 0) {
          console.log(`  📧 Email-related fields:`, emailFields.map(field => ({
            field,
            value: fields[field]
          })));
        }
        
        // Log all field names and values for first record
        if (index === 0) {
          console.log(`  🔍 All fields in first record:`);
          Object.entries(fields).forEach(([key, value]) => {
            console.log(`    ${key}: ${value}`);
          });
        }
      });
      
      records.push(...pageRecords);
      fetchNextPage();
    });
    
    console.log(`✅ Test 1 SUCCESS: Retrieved ${records.length} total records`);
    return records;
    
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error);
    throw error;
  }
}

// Test 2: Connection with minimal parameters
export async function testWithMinimalParams() {
  try {
    console.log('\n🧪 Test 2: Connection with minimal parameters');
    
    const base = Airtable.base(AIRTABLE_BASE_ID);
    const table = base(PROPERTIES_TABLE);
    
    const records = [];
    
    // Only maxRecords, no other parameters
    await table.select({
      maxRecords: 10
    }).eachPage((pageRecords, fetchNextPage) => {
      console.log(`📄 Got ${pageRecords.length} records with maxRecords=10`);
      records.push(...pageRecords);
      fetchNextPage();
    });
    
    console.log(`✅ Test 2 SUCCESS: Retrieved ${records.length} records with maxRecords`);
    return records;
    
  } catch (error) {
    console.error('❌ Test 2 FAILED:', error);
    throw error;
  }
}

// Test 3: Find properties for charlesheflin@gmail.com
export async function testFindUserProperties() {
  try {
    console.log('\n🧪 Test 3: Find properties for charlesheflin@gmail.com');
    
    const base = Airtable.base(AIRTABLE_BASE_ID);
    const table = base(PROPERTIES_TABLE);
    
    // Get all records first, then filter client-side
    const allRecords = [];
    
    await table.select({
      maxRecords: 100
    }).eachPage((pageRecords, fetchNextPage) => {
      allRecords.push(...pageRecords);
      fetchNextPage();
    });
    
    console.log(`📊 Total records retrieved: ${allRecords.length}`);
    
    // Search for charlesheflin@gmail.com in any field
    const userProperties = allRecords.filter(record => {
      const fields = record.fields;
      const fieldValues = Object.values(fields).map(v => String(v).toLowerCase());
      return fieldValues.some(value => value.includes('charlesheflin@gmail.com'));
    });
    
    console.log(`🎯 Properties found for charlesheflin@gmail.com: ${userProperties.length}`);
    
    if (userProperties.length > 0) {
      userProperties.forEach((record, index) => {
        console.log(`Property ${index + 1}:`, {
          id: record.id,
          fields: record.fields
        });
      });
    } else {
      console.log('🔍 Searching all records for any email fields...');
      
      allRecords.forEach((record, index) => {
        const fields = record.fields;
        const emailFields = {};
        
        Object.entries(fields).forEach(([key, value]) => {
          if (key.toLowerCase().includes('email') || 
              key.toLowerCase().includes('app_') ||
              (typeof value === 'string' && value.includes('@'))) {
            emailFields[key] = value;
          }
        });
        
        if (Object.keys(emailFields).length > 0) {
          console.log(`Record ${index + 1} email fields:`, emailFields);
        }
      });
    }
    
    return userProperties;
    
  } catch (error) {
    console.error('❌ Test 3 FAILED:', error);
    throw error;
  }
}

// Test 4: Check table schema
export async function testTableSchema() {
  try {
    console.log('\n🧪 Test 4: Check table schema');
    
    const base = Airtable.base(AIRTABLE_BASE_ID);
    const table = base(PROPERTIES_TABLE);
    
    // Get just one record to examine the schema
    const records = [];
    
    await table.select({
      maxRecords: 1
    }).eachPage((pageRecords, fetchNextPage) => {
      records.push(...pageRecords);
      fetchNextPage();
    });
    
    if (records.length > 0) {
      const sampleRecord = records[0];
      const fieldNames = Object.keys(sampleRecord.fields);
      
      console.log(`📋 Table Schema (${fieldNames.length} fields):`);
      fieldNames.sort().forEach((fieldName, index) => {
        const value = sampleRecord.fields[fieldName];
        const type = typeof value;
        console.log(`  ${index + 1}. ${fieldName} (${type}): ${value}`);
      });
    }
    
    return records;
    
  } catch (error) {
    console.error('❌ Test 4 FAILED:', error);
    throw error;
  }
}

// Run all tests
export async function runAllTests() {
  console.log('🚀 Starting comprehensive Airtable tests...\n');
  
  try {
    await testBasicConnection();
    await testWithMinimalParams();
    await testFindUserProperties();
    await testTableSchema();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    throw error;
  }
}