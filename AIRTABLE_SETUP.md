# 🗃️ Airtable Integration Setup Guide

This guide will help you connect your AirCasa application to Airtable to manage real property data.

## 📋 Prerequisites

1. **Airtable Account**: Sign up at [airtable.com](https://airtable.com)
2. **API Access**: Get your API key from Airtable account settings

## 🚀 Quick Setup

### Step 1: Create Your Airtable Base

1. **Log into Airtable** and create a new base
2. **Choose Template**: Start with a blank base or use a property management template
3. **Note your Base ID**: Found in the URL (e.g., `appXXXXXXXXXXXXXX`)

### Step 2: Set Up Tables

Create these tables with the following structure:

#### **Properties Table**
| Field Name | Field Type | Description |
|------------|------------|-------------|
| Name | Single line text | Property title |
| Description | Long text | Property description |
| Location | Single line text | Address/location |
| Price per Night | Currency | Nightly rate |
| Bedrooms | Number | Number of bedrooms |
| Bathrooms | Number | Number of bathrooms |
| Square Feet | Number | Property size |
| Status | Single select | active, inactive, pending, maintenance |
| Property Type | Single select | Villa, Apartment, Cabin, etc. |
| Total Bookings | Number | Number of bookings |
| Total Revenue | Currency | Total revenue earned |
| Average Rating | Number | Average guest rating |
| Review Count | Number | Number of reviews |
| Images | Attachment | Property photos |
| Amenities | Multiple select | WiFi, Pool, Kitchen, etc. |
| Owner Email | Email | Property owner contact |
| Created Date | Date | When added |
| Last Updated | Date | Last modification |

#### **Users Table**
| Field Name | Field Type | Description |
|------------|------------|-------------|
| Full Name | Single line text | User's full name |
| Email | Email | User's email address |
| Phone Number | Phone number | Contact number |
| User Type | Single select | Property Owner, Guest, Admin |
| Status | Single select | active, inactive, pending |
| Total Properties | Number | Properties owned |
| Total Revenue | Currency | Revenue earned |
| Total Bookings | Number | Bookings made |
| Total Spent | Currency | Amount spent |
| Join Date | Date | Registration date |
| Last Login | Date | Last login date |
| Profile Picture | Attachment | User avatar |
| Address | Long text | User address |
| Preferred Contact Method | Single select | email, phone |
| Verification Status | Single select | verified, pending, rejected |

#### **Bookings Table**
| Field Name | Field Type | Description |
|------------|------------|-------------|
| Booking ID | Single line text | Unique booking identifier |
| Property Name | Single line text | Name of booked property |
| Property ID | Single line text | Link to property |
| Guest Name | Single line text | Guest's name |
| Guest Email | Email | Guest's email |
| Check-in Date | Date | Arrival date |
| Check-out Date | Date | Departure date |
| Nights | Number | Length of stay |
| Total Amount | Currency | Total booking cost |
| Status | Single select | confirmed, pending, cancelled, completed |
| Booking Date | Date | When booking was made |
| Number of Guests | Number | Party size |
| Special Requests | Long text | Guest requests |
| Payment Status | Single select | paid, pending, refunded |
| Payment Method | Single select | Credit Card, PayPal, Bank Transfer |
| Cancellation Policy | Single select | Flexible, Moderate, Strict |

#### **Analytics Table**
| Field Name | Field Type | Description |
|------------|------------|-------------|
| Date | Date | Analytics date |
| Total Revenue | Currency | Daily/monthly revenue |
| Total Bookings | Number | Number of bookings |
| Occupancy Rate | Percent | Occupancy percentage |
| Average Daily Rate | Currency | Average rate |
| New Users | Number | New user signups |
| Property Views | Number | Property page views |
| Conversion Rate | Percent | Booking conversion rate |
| Top Property | Single line text | Best performing property |
| Top Location | Single line text | Most popular location |

### Step 3: Get Your API Credentials

1. **Go to Account Settings** in Airtable
2. **Generate API Key**: Create a personal access token
3. **Find Base ID**: In your base, go to Help > API documentation
4. **Copy Base ID**: From the API documentation URL

### Step 4: Configure Environment Variables

Update your `.env` file with your Airtable credentials:

```env
# Airtable Configuration
VITE_AIRTABLE_API_KEY=your_airtable_api_key_here
VITE_AIRTABLE_BASE_ID=your_airtable_base_id_here

# Airtable Table Names (match your table names exactly)
VITE_AIRTABLE_PROPERTIES_TABLE=Properties
VITE_AIRTABLE_USERS_TABLE=Users
VITE_AIRTABLE_BOOKINGS_TABLE=Bookings
VITE_AIRTABLE_ANALYTICS_TABLE=Analytics
```

### Step 5: Add Sample Data

You can add some sample data to test the integration:

1. **Import Sample Properties**: Use the demo data from the app as a reference
2. **Create Test Users**: Add a few user records
3. **Add Sample Bookings**: Create some booking records
4. **Add Analytics Data**: Add monthly analytics records

## 🔧 Testing the Integration

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check the console**: Look for Airtable connection messages
3. **View Properties**: Navigate to the Properties page to see your data
4. **Check Dashboard**: Verify stats are loading from your Airtable

## 🛡️ Security Best Practices

1. **Keep API Keys Secret**: Never commit API keys to version control
2. **Use Environment Variables**: Store credentials in `.env` files
3. **Limit API Key Permissions**: Only grant necessary permissions
4. **Regular Key Rotation**: Rotate API keys periodically

## 🚨 Troubleshooting

### Common Issues:

**"Airtable running in DEMO mode"**
- Check that your API key and Base ID are correctly set in `.env`
- Restart your development server after changing environment variables

**"Failed to fetch Properties"**
- Verify your table names match exactly (case-sensitive)
- Check that your API key has read permissions
- Ensure all required fields exist in your Airtable base

**"Missing required fields"**
- Make sure your Airtable table has all the fields listed above
- Check field names match exactly (including spaces and capitalization)

### Debug Steps:

1. **Check Console Logs**: Look for detailed error messages
2. **Verify API Key**: Test your API key with Airtable's API documentation
3. **Check Base ID**: Ensure you're using the correct base ID
4. **Field Names**: Verify all field names match exactly

## 📚 Advanced Configuration

### Custom Field Mapping

If you want to use different field names in Airtable, update the data transformers in:
`src/lib/dataTransformers.js`

### API Rate Limits

Airtable has rate limits (5 requests per second). The app includes automatic retry logic, but for high-volume applications, consider:
- Implementing caching
- Using batch operations
- Adding request queuing

### Real-time Updates

For real-time updates, consider:
- Implementing webhooks (Airtable Pro/Enterprise)
- Polling for changes
- Using WebSocket connections

## 🎯 Next Steps

Once your Airtable integration is working:

1. **Customize Data Models**: Modify fields to match your specific needs
2. **Add Business Logic**: Implement property rules and validations
3. **Integrate Booking System**: Connect with calendar and payment systems
4. **Add Reporting**: Create custom analytics and reports
5. **Set Up Automation**: Use Airtable automations for workflows

## 📞 Support

If you need help with the integration:

1. **Check the Console**: Most issues are logged with helpful error messages
2. **Review This Guide**: Ensure all steps are completed correctly
3. **Airtable Documentation**: Refer to [Airtable's API docs](https://airtable.com/api)

---

**🎉 Congratulations!** Once set up, your AirCasa app will be powered by real Airtable data, giving you a fully functional property management system!