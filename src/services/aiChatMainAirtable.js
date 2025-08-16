/**
 * aiChat Main AirCasa Airtable Service
 * Handles access to the main AirCasa Airtable base for property and user data context
 */

import { AI_CHAT_CONFIG } from '@/config/aiChatConfig';

class AiChatMainAirtableService {
  constructor() {
    this.baseId = AI_CHAT_CONFIG.MAIN_AIRCASA_BASE.BASE_ID;
    this.apiKey = AI_CHAT_CONFIG.MAIN_AIRCASA_BASE.API_KEY;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generic Airtable API request handler
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint}`;
    const config = {
      headers: this.headers,
      ...options
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`Main Airtable API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Main Airtable request failed:', error);
      throw error;
    }
  }

  /**
   * Get property data for context
   */
  async getProperty(propertyId) {
    try {
      console.log('🏠 Fetching property data for aiChat context:', propertyId);
      
      if (propertyId === 'dashboard') {
        return { id: 'dashboard', location: 'Dashboard', propertyType: 'Dashboard View' };
      }

      const response = await this.request(`${AI_CHAT_CONFIG.MAIN_AIRCASA_BASE.TABLES.PROPERTIES}/${propertyId}`);
      
      const property = {
        id: response.id,
        location: response.fields.property_address || response.fields.address || 'Unknown location',
        propertyType: response.fields.property_type || response.fields.propertyType || 'Unknown',
        marketValue: response.fields.market_value || response.fields.marketValue || null,
        bedrooms: response.fields.bedrooms || null,
        bathrooms: response.fields.bathrooms || null,
        squareFootage: response.fields.square_footage || response.fields.squareFootage || null,
        completedIntake: response.fields.completed_intake || false,
        photosCompleted: response.fields.photos_completed || false,
        consultationCompleted: response.fields.consultation_completed || false,
        isBuyingHome: response.fields.is_buying_home || false,
        homeCriteriaCompleted: response.fields.home_criteria_completed || false,
        personalFinancialCompleted: response.fields.personal_financial_completed || false,
        // Add other relevant fields
        ...response.fields
      };

      console.log('✅ Property data loaded for aiChat:', property);
      return property;
      
    } catch (error) {
      console.error('Failed to fetch property data:', error);
      return {
        id: propertyId,
        location: 'Property data unavailable',
        propertyType: 'Unknown',
        error: true
      };
    }
  }

  /**
   * Get user data for context
   */
  async getUser(userId) {
    try {
      console.log('👤 Fetching user data for aiChat context:', userId);
      
      // Try to find user by ID first
      const filterFormula = `{id} = '${userId}'`;
      const params = new URLSearchParams({
        filterByFormula: filterFormula,
        maxRecords: '1'
      });

      let response = await this.request(`${AI_CHAT_CONFIG.MAIN_AIRCASA_BASE.TABLES.USERS}?${params}`);
      
      if (response.records.length === 0) {
        // Try to find by email if ID doesn't work
        const emailFilterFormula = `{email} = '${userId}'`;
        const emailParams = new URLSearchParams({
          filterByFormula: emailFilterFormula,
          maxRecords: '1'
        });
        
        response = await this.request(`${AI_CHAT_CONFIG.MAIN_AIRCASA_BASE.TABLES.USERS}?${emailParams}`);
      }

      if (response.records.length > 0) {
        const userData = response.records[0].fields;
        const user = {
          id: response.records[0].id,
          email: userData.email || userId,
          name: userData.name || userData.full_name || 'User',
          role: userData.role || 'homeowner',
          preferences: userData.preferences || {},
          // Add other relevant fields
          ...userData
        };

        console.log('✅ User data loaded for aiChat:', user);
        return user;
      }
      
      // Return basic user info if not found in Airtable
      return {
        id: userId,
        email: userId,
        name: 'User',
        role: 'homeowner',
        fromFallback: true
      };
      
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return {
        id: userId,
        email: userId,
        name: 'User',
        role: 'homeowner',
        error: true
      };
    }
  }

  /**
   * Get user properties for context
   */
  async getUserProperties(userId) {
    try {
      console.log('🏠 Fetching user properties for aiChat context:', userId);
      
      // Try different field names that might contain user email/ID
      const filterFormulas = [
        `{created_by} = '${userId}'`,
        `{owner_email} = '${userId}'`,
        `{user_email} = '${userId}'`,
        `{owner} = '${userId}'`
      ];

      for (const filterFormula of filterFormulas) {
        try {
          const params = new URLSearchParams({
            filterByFormula: filterFormula,
            maxRecords: '10',
            sort: JSON.stringify([{ field: 'created_at', direction: 'desc' }])
          });

          const response = await this.request(`${AI_CHAT_CONFIG.MAIN_AIRCASA_BASE.TABLES.PROPERTIES}?${params}`);
          
          if (response.records.length > 0) {
            const properties = response.records.map(record => ({
              id: record.id,
              location: record.fields.property_address || record.fields.address || 'Unknown location',
              propertyType: record.fields.property_type || record.fields.propertyType || 'Unknown',
              marketValue: record.fields.market_value || record.fields.marketValue || null,
              // Add other relevant fields
              ...record.fields
            }));

            console.log('✅ User properties loaded for aiChat:', properties.length, 'properties');
            return properties;
          }
        } catch (error) {
          console.log('Filter attempt failed:', filterFormula, error.message);
        }
      }

      return [];
      
    } catch (error) {
      console.error('Failed to fetch user properties:', error);
      return [];
    }
  }
}

// Create singleton instance
const aiChatMainAirtable = new AiChatMainAirtableService();
export default aiChatMainAirtable;