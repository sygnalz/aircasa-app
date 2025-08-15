# 🔗 Connect Your Existing Airtable Base

This guide will help you connect your existing 5-table Airtable base to AirCasa.

## 📋 Information Needed

To connect your existing base, please provide:

### 1. **Airtable Credentials**
- **Base ID**: Found in your Airtable URL (e.g., `appXXXXXXXXXXXXXX`)
- **API Key**: From your Airtable Account Settings → Developer tab

### 2. **Table Structure**
For each of your 5 tables, provide:
- **Table Name** (exact name as shown in Airtable)
- **Primary purpose** (properties, users, bookings, etc.)
- **Key field names** (especially ID, name, email, status fields)

### 3. **Sample Data Format**
If possible, share:
- A few example records from each table
- Screenshots of your table structures
- Any custom field types or relationships

## 🔧 Quick Setup Process

### Step 1: Update Environment Variables
```bash
# Update your .env file with your credentials
VITE_AIRTABLE_API_KEY=your_actual_api_key
VITE_AIRTABLE_BASE_ID=your_actual_base_id

# Update table names to match your existing tables
VITE_AIRTABLE_PROPERTIES_TABLE=YourPropertiesTableName
VITE_AIRTABLE_USERS_TABLE=YourUsersTableName
VITE_AIRTABLE_BOOKINGS_TABLE=YourBookingsTableName
VITE_AIRTABLE_ANALYTICS_TABLE=YourAnalyticsTableName
VITE_AIRTABLE_TABLE_5=YourFifthTableName
```

### Step 2: Test Connection
```bash
# Restart the development server
npm run dev

# Check console for connection messages
# Look for "✅ Airtable client initialized successfully"
```

## 📊 Common Table Mapping Scenarios

### Scenario 1: Property Management Base
If your tables are:
- **Properties** → Maps to Properties functionality
- **Tenants/Guests** → Maps to Users functionality  
- **Leases/Bookings** → Maps to Bookings functionality
- **Maintenance** → Custom integration needed
- **Financials** → Maps to Analytics functionality

### Scenario 2: Business Management Base
If your tables are:
- **Contacts** → Maps to Users functionality
- **Companies** → Maps to Properties functionality
- **Deals** → Maps to Bookings functionality  
- **Activities** → Custom integration needed
- **Reports** → Maps to Analytics functionality

### Scenario 3: Custom Business Base
We'll analyze your specific structure and create custom mappings.

## 🔄 Field Mapping Template

For each table, we'll need to map fields like this:

```javascript
// Example mapping for Properties table
{
  // Your Field Name → App Field Name
  'Property Name' → 'title',
  'Address' → 'location', 
  'Monthly Rent' → 'price',
  'Bedrooms' → 'bedrooms',
  'Status' → 'status',
  // ... etc
}
```

## ⚡ Quick Start Options

### Option 1: Share Your Structure
Send me:
- Screenshots of each table
- List of field names per table
- Brief description of what each table contains

### Option 2: Provide Credentials
Share your:
- Base ID and API key (I'll analyze the structure)
- Table names and their purposes

### Option 3: Guided Setup Call
We can do a screen share to:
- Analyze your data structure together
- Configure the mapping in real-time
- Test the integration immediately

## 🛡️ Security Note

Your API credentials will be stored securely in environment variables and never committed to code. You can always regenerate your API key if needed.

## 📞 Next Steps

1. **Gather your information** using the checklist above
2. **Share the details** with me
3. **I'll configure the integration** for your specific structure
4. **Test the connection** together
5. **Celebrate** seeing your real data in AirCasa! 🎉

---

**Ready to connect? Share your Airtable details and let's get your real data flowing into AirCasa!**