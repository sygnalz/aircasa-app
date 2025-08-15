// src/api/propertyServices.js
// Property-related API services for frontend components

// Zillow API service (backend calls to avoid exposing API keys in frontend)
export const zillowService = {
  // Verify property address and get basic property data
  async verifyAddress(address) {
    const rapidAPIKey = import.meta.env.VITE_ZILLOW_RAPIDAPI_KEY;
    const host = import.meta.env.VITE_ZILLOW_ADDRESS_HOST;
    
    const headers = {
      'X-RapidAPI-Key': rapidAPIKey,
      'X-RapidAPI-Host': host,
      'Accept': 'application/json'
    };

    const url = `https://${host}/pro/byaddress?propertyaddress=${encodeURIComponent(address)}`;

    console.log('🏠 Verifying address with Zillow:', address);
    console.log('🔑 API Key:', rapidAPIKey ? `${rapidAPIKey.substring(0, 10)}...` : 'MISSING');
    console.log('🏢 Host:', host);
    console.log('🌐 Full URL:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Zillow API Error Response:', errorText);
        throw new Error(`Zillow API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Zillow address verification successful - Full API Response:', JSON.stringify(data, null, 2));
      
      // Validate that we have the expected response structure
      if (!data || !data.propertyDetails) {
        throw new Error("Could not find property details for this address. API response structure unexpected.");
      }

      const details = data.propertyDetails;
      let zpid = details.zpid;
      
      // Handle address properly - it might be an object or string
      let formattedAddress = address;
      if (details.address) {
        if (typeof details.address === 'string') {
          formattedAddress = details.address;
        } else if (typeof details.address === 'object') {
          // Construct address from object parts
          const addr = details.address;
          formattedAddress = [
            addr.streetAddress,
            addr.city,
            addr.state,
            addr.zipcode
          ].filter(Boolean).join(', ');
        }
      }
      
      return {
        success: true,
        data: data,
        zpid: zpid,
        propertyData: {
          address: formattedAddress,
          city: details.city || '',
          state: details.state || '', 
          zipcode: details.zipcode || '',
          price: details.price || details.zestimate || null,
          bedrooms: details.resoFacts?.bedrooms || details.bedrooms || null,
          bathrooms: details.resoFacts?.bathrooms || details.bathrooms || null,
          sqft: parseInt(details.resoFacts?.aboveGradeFinishedArea?.replace(/,/g, '') || details.livingArea || details.homeSize || 0) || null,
          yearBuilt: details.resoFacts?.atAGlanceFacts?.find(fact => fact.factLabel === 'Year Built')?.factValue || details.yearBuilt || null,
          propertyType: details.resoFacts?.homeType || details.homeType || 'Single Family',
          images: details.photos || details.images || [],
          description: details.description || ''
        }
      };
    } catch (error) {
      console.error('❌ Zillow address verification failed:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  // Get additional property details using zpid
  async getPropertyDetails(zpid) {
    const rapidAPIKey = import.meta.env.VITE_ZILLOW_RAPIDAPI_KEY;
    const host = import.meta.env.VITE_ZILLOW_ZESTIMATE_HOST;
    
    const headers = {
      'X-RapidAPI-Key': rapidAPIKey,
      'X-RapidAPI-Host': host,
      'Accept': 'application/json'
    };

    try {
      // Get Zestimate
      const zestimateUrl = `https://${host}/zestimate?zpid=${zpid}`;
      const zestimateResponse = await fetch(zestimateUrl, { method: 'GET', headers });
      
      // Get Images
      const imagesUrl = `https://${host}/images?zpid=${zpid}`;
      const imagesResponse = await fetch(imagesUrl, { method: 'GET', headers });

      const [zestimateData, imagesData] = await Promise.all([
        zestimateResponse.ok ? zestimateResponse.json() : null,
        imagesResponse.ok ? imagesResponse.json() : null
      ]);

      console.log('✅ Zillow property details fetched:', { zestimateData, imagesData });

      return {
        success: true,
        zestimate: zestimateData?.zestimate || null,
        images: imagesData?.images || [],
        priceHistory: zestimateData?.priceHistory || []
      };
    } catch (error) {
      console.error('❌ Failed to get Zillow property details:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Property validation and geocoding services
export const propertyValidationService = {
  // Validate address format
  validateAddress(address) {
    if (!address || typeof address !== 'string') {
      return { valid: false, error: 'Address is required' };
    }

    const addressTrimmed = address.trim();
    if (addressTrimmed.length < 5) {
      return { valid: false, error: 'Address too short' };
    }

    // Basic US address pattern check
    const addressPattern = /^[0-9]+\s+[a-zA-Z0-9\s,.'#-]+/;
    if (!addressPattern.test(addressTrimmed)) {
      return { valid: false, error: 'Invalid address format' };
    }

    return { valid: true, error: null };
  },

  // Parse address into components
  parseAddress(address) {
    try {
      const parts = address.split(',').map(part => part.trim());
      
      if (parts.length >= 3) {
        const street = parts[0];
        const city = parts[1];
        const stateZip = parts[2].split(' ');
        const state = stateZip[0];
        const zipcode = stateZip[1] || '';

        return {
          success: true,
          components: {
            street,
            city,
            state,
            zipcode,
            fullAddress: address
          }
        };
      }

      return {
        success: false,
        error: 'Unable to parse address components',
        components: {
          street: address,
          city: '',
          state: '',
          zipcode: '',
          fullAddress: address
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        components: {
          street: address,
          city: '',
          state: '',
          zipcode: '',
          fullAddress: address
        }
      };
    }
  }
};

// Property data enrichment service
export const propertyEnrichmentService = {
  // Combine data from multiple sources
  enrichPropertyData(userData, zillowData, attomData = null) {
    const enriched = {
      // Address information
      address: userData.address || zillowData?.address || '',
      street: userData.street || zillowData?.address || '',
      city: userData.city || zillowData?.city || '',
      state: userData.state || zillowData?.state || '',
      zipcode: userData.zipcode || zillowData?.zipcode || '',

      // Property characteristics
      bedrooms: userData.bedrooms || zillowData?.bedrooms || null,
      bathrooms: userData.bathrooms || zillowData?.bathrooms || null,
      sqft: userData.sqft || zillowData?.sqft || null,
      yearBuilt: userData.yearBuilt || zillowData?.yearBuilt || null,
      propertyType: userData.propertyType || zillowData?.propertyType || 'Single Family',
      lotSize: userData.lotSize || null,

      // Financial data
      estimatedValue: userData.estimatedValue || zillowData?.price || null,
      zestimate: zillowData?.zestimate || null,

      // Media and verification
      images: userData.images || zillowData?.images || [],
      description: userData.description || zillowData?.description || '',
      
      // API identifiers
      zpid: zillowData?.zpid || null,
      attomId: attomData?.attomId || null,
      
      // Verification status
      verified: !!(zillowData?.zpid),
      verificationSource: zillowData?.zpid ? 'Zillow' : 'User Input'
    };

    console.log('🔄 Property data enriched:', JSON.stringify(enriched, null, 2));
    return enriched;
  },

  // Extract key property features for display
  extractPropertyFeatures(propertyData) {
    const features = [];

    if (propertyData.bedrooms) {
      features.push(`${propertyData.bedrooms} bed${propertyData.bedrooms > 1 ? 's' : ''}`);
    }
    
    if (propertyData.bathrooms) {
      features.push(`${propertyData.bathrooms} bath${propertyData.bathrooms > 1 ? 's' : ''}`);
    }
    
    if (propertyData.sqft) {
      features.push(`${propertyData.sqft.toLocaleString()} sq ft`);
    }
    
    if (propertyData.yearBuilt) {
      features.push(`Built ${propertyData.yearBuilt}`);
    }

    return features;
  },

  // Format property data for display
  formatPropertyForDisplay(propertyData) {
    return {
      title: propertyData.address || 'Property Address',
      subtitle: [propertyData.city, propertyData.state].filter(Boolean).join(', '),
      features: this.extractPropertyFeatures(propertyData),
      price: propertyData.estimatedValue || propertyData.zestimate,
      image: propertyData.images?.[0] || null,
      verified: propertyData.verified,
      verificationSource: propertyData.verificationSource
    };
  }
};

// Export all services
export default {
  zillow: zillowService,
  validation: propertyValidationService,
  enrichment: propertyEnrichmentService
};