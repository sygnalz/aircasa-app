// Test Airtable connection directly
import Airtable from 'airtable';

export async function testAirtableConnection() {
  const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
  
  console.log('🧪 Testing Airtable connection...');
  console.log('API Key (first 10 chars):', AIRTABLE_API_KEY?.substring(0, 10));
  console.log('Base ID:', AIRTABLE_BASE_ID);
  
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('❌ Missing Airtable credentials');
    return false;
  }
  
  try {
    Airtable.configure({
      endpointUrl: 'https://api.airtable.com',
      apiKey: AIRTABLE_API_KEY
    });
    
    const base = Airtable.base(AIRTABLE_BASE_ID);
    const table = base('Properties');
    
    console.log('🔍 Testing simple Properties query...');
    
    const records = [];
    await table.select({
      maxRecords: 5
    }).eachPage((pageRecords, fetchNextPage) => {
      console.log(`📋 Found ${pageRecords.length} records in this page`);
      pageRecords.forEach(record => {
        console.log('📝 Record ID:', record.id);
        console.log('📝 Record fields:', Object.keys(record.fields));
        console.log('📝 app_email field:', record.fields.app_email);
        records.push({
          id: record.id,
          fields: record.fields,
          app_email: record.fields.app_email
        });
      });
      fetchNextPage();
    });
    
    console.log(`✅ Successfully fetched ${records.length} properties from Airtable`);
    console.log('📊 Records with app_email:', records.filter(r => r.app_email));
    
    return records;
    
  } catch (error) {
    console.error('❌ Airtable connection test failed:', error);
    return false;
  }
}

// Make it available on window for testing
if (typeof window !== 'undefined') {
  window.testAirtableConnection = testAirtableConnection;
  console.log('🛠️ testAirtableConnection function available on window object');
}