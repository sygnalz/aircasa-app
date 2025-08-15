# 🔗 AirCasa Airtable Integration Guide

Complete guide for connecting your existing 5-table Airtable base to AirCasa.

## 🚀 Quick Start

1. **Access the Setup Wizard**: Visit `/airtable-setup` in your running AirCasa app
2. **Gather Your Credentials**: Get your Airtable API key and Base ID
3. **Follow the 5-Step Process**: The wizard will guide you through everything
4. **Test Your Connection**: Use the built-in tester to verify everything works

## 📋 Prerequisites

### What You Need
- An existing Airtable base with 5 tables
- Airtable API access (free with any Airtable account)
- Your Airtable credentials (API key and Base ID)

### Finding Your Credentials

#### Airtable API Key
1. Go to [airtable.com/account](https://airtable.com/account)
2. Navigate to the "Developer" tab
3. Click "Generate API key" (if you don't have one)
4. Copy the key (starts with `key...`)

#### Airtable Base ID  
1. Open your Airtable base in your browser
2. Look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. The Base ID is the part starting with `app` (e.g., `appABC123DEF456GHI`)

## 🛠️ Setup Process

### Step 1: Launch Setup Wizard
- Open your AirCasa app
- Click "🔧 Connect My Airtable Base" on the welcome screen
- Or navigate directly to `/airtable-setup`

### Step 2: Enter Credentials
- Input your Airtable API key
- Input your Base ID
- Click "Continue to Table Names"

### Step 3: Specify Your Tables
- Enter all 5 table names exactly as they appear in Airtable
- One table name per line
- Case-sensitive (must match exactly)

### Step 4: Automatic Analysis
- The system will analyze your base structure
- Identify what each table is used for (Properties, Users, Bookings, etc.)
- Generate field mappings automatically
- Show you a preview of found data

### Step 5: Generate Configuration
- Get a complete .env configuration file
- Download or copy the configuration
- Apply it to your project

## 🔧 Manual Configuration

If you prefer to configure manually, update your `.env` file:

```bash
# Replace with your actual credentials
VITE_AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
VITE_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# Update table names to match your tables
VITE_AIRTABLE_PROPERTIES_TABLE=YourPropertiesTableName
VITE_AIRTABLE_USERS_TABLE=YourUsersTableName  
VITE_AIRTABLE_BOOKINGS_TABLE=YourBookingsTableName
VITE_AIRTABLE_ANALYTICS_TABLE=YourAnalyticsTableName
VITE_AIRTABLE_CUSTOM_TABLE=YourFifthTableName
```

## 📊 Table Mapping Guide

The system will automatically try to identify your table purposes:

### Properties Table
**Looks for fields like**: Property Name, Address, Rent, Bedrooms, Bathrooms
**Maps to**: Property management functionality
**Used for**: Listing properties, managing details, tracking status

### Users Table  
**Looks for fields like**: Name, Email, Phone, Contact Info
**Maps to**: User management functionality
**Used for**: Tenant info, contact management, user profiles

### Bookings Table
**Looks for fields like**: Booking, Reservation, Check-in, Check-out, Guest
**Maps to**: Booking management functionality  
**Used for**: Reservations, stays, rental periods

### Analytics Table
**Looks for fields like**: Revenue, Income, Analytics, Reports, Stats
**Maps to**: Dashboard analytics functionality
**Used for**: Financial reporting, performance metrics

### Custom Tables
**Any table not automatically identified**
**Creates custom environment variables**
**Requires manual integration for full functionality**

## 🧪 Testing Your Connection

### Using the Built-in Tester
1. Go to `/airtable-setup` 
2. Click "🧪 Test Connection" tab
3. Click "Test Airtable Connection"
4. Review results for each table

### What the Tester Checks
- ✅ API credentials are valid
- ✅ Base ID is accessible  
- ✅ Each table can be reached
- ✅ Records can be retrieved
- ✅ Field structure is readable

### Interpreting Results
- **Green ✅**: Table connected successfully
- **Red ❌**: Connection failed (check table name)
- **Record Count**: How many records were found
- **Fields Detected**: Available data fields

## 🔄 After Setup

### 1. Restart Your Server
```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### 2. Verify Demo Mode is Off
- Check browser console for "✅ Airtable client initialized successfully"  
- Should NOT see "🗃️ Airtable running in DEMO mode"

### 3. Check Your Data
- Navigate to Dashboard - should show your real data
- Go to Properties - should list your actual properties
- All functionality now uses your Airtable data

## 🛠️ Common Issues & Solutions

### "Base ID should start with 'app'"
- **Problem**: Invalid Base ID format
- **Solution**: Copy the Base ID from your Airtable URL, ensure it starts with `app`

### "Table not found" errors
- **Problem**: Table name doesn't match exactly
- **Solution**: Check spelling and capitalization in your Airtable base

### "API key invalid" errors  
- **Problem**: Wrong or expired API key
- **Solution**: Generate a new API key in your Airtable account settings

### Still seeing demo data
- **Problem**: Environment variables not loaded
- **Solution**: Restart your development server after updating .env

### Some tables work, others don't
- **Problem**: Mixed table name issues
- **Solution**: Use the connection tester to identify which tables are failing

## 📈 Field Mapping Customization

If the automatic field mapping doesn't work perfectly, you can customize it:

### Common Field Mappings
```javascript
// Properties table
'Property Name' → 'title'
'Address' → 'location'  
'Monthly Rent' → 'price'
'Bedrooms' → 'bedrooms'
'Status' → 'status'

// Users table
'Full Name' → 'name'
'Email Address' → 'email'
'Phone Number' → 'phone'
'Tenant Status' → 'status'

// Bookings table
'Guest Name' → 'guestName'
'Check In' → 'checkIn'
'Check Out' → 'checkOut'
'Property' → 'propertyId'
'Status' → 'status'
```

### Custom Field Transformers
If you need custom data transformation, modify `/src/lib/dataTransformers.js`:

```javascript
export function transformProperty(airtableRecord) {
  return {
    id: airtableRecord.id,
    title: airtableRecord['Your Property Field'],
    location: airtableRecord['Your Address Field'],
    price: parseFloat(airtableRecord['Your Price Field'] || 0),
    // ... customize as needed
  };
}
```

## 🔐 Security Notes

- Your API key is stored in environment variables (not in code)
- Environment variables are not committed to Git
- You can regenerate your API key anytime in Airtable settings
- Never share your API key publicly

## 📞 Support

### If You Need Help
1. **Use the Setup Wizard**: Most issues are resolved automatically
2. **Check the Connection Tester**: Identifies specific problems
3. **Review Console Logs**: Check browser developer tools for errors
4. **Verify Table Names**: Must match exactly with Airtable

### Common Success Patterns
- ✅ Used exact table names from Airtable
- ✅ Generated API key with full base access
- ✅ Restarted server after env changes  
- ✅ Tested connection before proceeding

## 🎉 Next Steps

Once connected successfully:

1. **Explore Your Data**: Navigate through the app to see your real information
2. **Customize the Interface**: Modify components to better match your workflow  
3. **Add Custom Tables**: Integrate your 5th table with custom functionality
4. **Set Up Production**: Deploy with your real data for live use

---

**🚀 Ready to connect? Launch the setup wizard and get your real Airtable data flowing into AirCasa!**